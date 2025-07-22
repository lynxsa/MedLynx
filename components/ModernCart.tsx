import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Animated,
    FlatList,
    Image,
    Modal,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import CartService, { CartItem, CartSummary, DeliveryOption } from '../services/CartService';

interface ModernCartProps {
  onCheckout?: (cartData: any) => void;
  onContinueShopping?: () => void;
}

const ModernCart: React.FC<ModernCartProps> = ({
  onCheckout,
  onContinueShopping,
}) => {
  const { theme } = useTheme();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartSummary, setCartSummary] = useState<CartSummary | null>(null);
  const [selectedDeliveryOption, setSelectedDeliveryOption] = useState<DeliveryOption | null>(null);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [itemAnimations, setItemAnimations] = useState<{ [key: string]: Animated.Value }>({});

  const cartService = CartService.getInstance();

  useEffect(() => {
    // Load initial cart data
    const loadData = () => {
      const items = cartService.getItems();
      setCartItems(items);
      const summary = cartService.getCartSummary();
      setCartSummary(summary);
      setSelectedDeliveryOption(cartService.getSelectedDeliveryOption());
    };

    loadData();

    // Subscribe to cart changes
    const unsubscribe = cartService.addListener((items) => {
      setCartItems(items);
      const summary = cartService.getCartSummary();
      setCartSummary(summary);
    });

    return () => unsubscribe();
  }, [cartService]);

  const loadCartData = () => {
    const items = cartService.getItems();
    setCartItems(items);
    updateCartSummary();
    setSelectedDeliveryOption(cartService.getSelectedDeliveryOption());
  };

  const updateCartSummary = () => {
    const summary = cartService.getCartSummary();
    setCartSummary(summary);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    loadCartData();
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleQuantityChange = async (productId: string, newQuantity: number) => {
    // Animate item during update
    const animation = itemAnimations[productId] || new Animated.Value(1);
    setItemAnimations(prev => ({ ...prev, [productId]: animation }));

    Animated.sequence([
      Animated.timing(animation, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(animation, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    const success = await cartService.updateItemQuantity(productId, newQuantity);
    if (!success) {
      Alert.alert('Error', 'Unable to update quantity. Please check stock availability.');
    }
  };

  const handleRemoveItem = async (productId: string) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await cartService.removeItem(productId);
          },
        },
      ]
    );
  };

  const handleDeliveryOptionChange = (optionId: string) => {
    cartService.setDeliveryOption(optionId);
    setSelectedDeliveryOption(cartService.getSelectedDeliveryOption());
    setShowDeliveryModal(false);
  };

  const handleCheckout = () => {
    const validation = cartService.validateCart();
    
    if (!validation.valid) {
      Alert.alert(
        'Cart Issues',
        validation.issues.join('\n\n'),
        [{ text: 'OK' }]
      );
      return;
    }

    const checkoutData = {
      items: cartItems,
      summary: cartSummary,
      deliveryOption: selectedDeliveryOption,
      itemsByPharmacy: cartService.getItemsByPharmacy(),
    };

    if (onCheckout) {
      onCheckout(checkoutData);
    } else {
      Alert.alert('Checkout', 'Proceeding to checkout...', [{ text: 'OK' }]);
    }
  };

  const renderCartItem = ({ item }: { item: CartItem }) => {
    const animation = itemAnimations[item.id] || new Animated.Value(1);

    return (
      <Animated.View style={{ transform: [{ scale: animation }] }}>
        <View style={[styles.cartItem, { backgroundColor: theme.colors.surface }]}>
          <LinearGradient
            colors={[`${item.pharmacyColor}08`, `${item.pharmacyColor}03`]}
            style={styles.itemGradient}
          >
            {/* Item Image */}
            <View style={styles.itemImageContainer}>
              {item.realImageUrl ? (
                <Image
                  source={{ uri: item.realImageUrl }}
                  style={styles.itemImage}
                  resizeMode="contain"
                />
              ) : (
                <View style={styles.placeholderImage}>
                  <Text style={styles.placeholderText}>
                    {typeof item.image === 'string' && !item.image.startsWith('http') 
                      ? item.image 
                      : '💊'
                    }
                  </Text>
                </View>
              )}
              
              {/* Prescription badge */}
              {item.prescription && (
                <View style={styles.prescriptionBadge}>
                  <Ionicons name="medical" size={12} color="#FFFFFF" />
                </View>
              )}
            </View>

            {/* Item Details */}
            <View style={styles.itemDetails}>
              <Text 
                style={[styles.itemName, { color: theme.colors.textPrimary }]} 
                numberOfLines={2}
              >
                {item.name}
              </Text>
              
              {item.genericName && (
                <Text style={[styles.itemGeneric, { color: theme.colors.textSecondary }]}>
                  {item.genericName}
                </Text>
              )}

              <View style={styles.itemMeta}>
                <View style={styles.pharmacyTag}>
                  <Ionicons name="storefront" size={12} color={item.pharmacyColor} />
                  <Text style={[styles.pharmacyText, { color: item.pharmacyColor }]}>
                    {item.pharmacy}
                  </Text>
                </View>

                {(item.dosage || item.packSize) && (
                  <Text style={[styles.dosageText, { color: theme.colors.textSecondary }]}>
                    {[item.dosage, item.packSize].filter(Boolean).join(' • ')}
                  </Text>
                )}
              </View>

              {/* Price and Stock */}
              <View style={styles.priceContainer}>
                <View style={styles.priceInfo}>
                  <Text style={[styles.itemPrice, { color: item.pharmacyColor }]}>
                    R{item.price.toFixed(2)}
                  </Text>
                  {item.originalPrice && (
                    <Text style={[styles.originalPrice, { color: theme.colors.textSecondary }]}>
                      R{item.originalPrice.toFixed(2)}
                    </Text>
                  )}
                </View>
                
                <View style={[styles.stockStatus, { 
                  backgroundColor: item.inStock ? '#E8F5E8' : '#FFE8E8' 
                }]}>
                  <Ionicons 
                    name={item.inStock ? "checkmark-circle" : "close-circle"} 
                    size={12} 
                    color={item.inStock ? '#4CAF50' : '#F44336'} 
                  />
                  <Text style={[styles.stockText, { 
                    color: item.inStock ? '#4CAF50' : '#F44336' 
                  }]}>
                    {item.inStock 
                      ? (item.stockCount ? `${item.stockCount} left` : 'In Stock')
                      : 'Out of Stock'
                    }
                  </Text>
                </View>
              </View>
            </View>

            {/* Quantity Controls */}
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={[styles.quantityButton, { borderColor: theme.colors.border }]}
                onPress={() => handleQuantityChange(item.id, item.quantity - 1)}
                disabled={item.quantity <= 1}
              >
                <Ionicons 
                  name="remove" 
                  size={16} 
                  color={item.quantity <= 1 ? theme.colors.textSecondary : theme.colors.textPrimary} 
                />
              </TouchableOpacity>
              
              <View style={[styles.quantityDisplay, { backgroundColor: theme.colors.background }]}>
                <Text style={[styles.quantityText, { color: theme.colors.textPrimary }]}>
                  {item.quantity}
                </Text>
              </View>
              
              <TouchableOpacity
                style={[styles.quantityButton, { borderColor: theme.colors.border }]}
                onPress={() => handleQuantityChange(item.id, item.quantity + 1)}
                disabled={item.quantity >= (item.maxQuantity || 99)}
              >
                <Ionicons 
                  name="add" 
                  size={16} 
                  color={item.quantity >= (item.maxQuantity || 99) 
                    ? theme.colors.textSecondary 
                    : theme.colors.textPrimary
                  } 
                />
              </TouchableOpacity>

              {/* Remove Button */}
              <TouchableOpacity
                style={[styles.removeButton, { backgroundColor: '#FF6B6B' }]}
                onPress={() => handleRemoveItem(item.id)}
              >
                <Ionicons name="trash" size={14} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </Animated.View>
    );
  };

  const DeliveryOptionsModal = () => (
    <Modal
      visible={showDeliveryModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowDeliveryModal(false)}
    >
      <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowDeliveryModal(false)}
          >
            <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>
            Delivery Options
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.deliveryOptions}>
          {cartService.getDeliveryOptions().map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.deliveryOption,
                {
                  backgroundColor: selectedDeliveryOption?.id === option.id 
                    ? theme.colors.primary + '15' 
                    : theme.colors.surface,
                  borderColor: selectedDeliveryOption?.id === option.id 
                    ? theme.colors.primary 
                    : theme.colors.border,
                }
              ]}
              onPress={() => handleDeliveryOptionChange(option.id)}
            >
              <View style={styles.deliveryIconContainer}>
                <Ionicons name={option.icon as any} size={24} color={theme.colors.primary} />
              </View>
              
              <View style={styles.deliveryDetails}>
                <Text style={[styles.deliveryName, { color: theme.colors.textPrimary }]}>
                  {option.name}
                </Text>
                <Text style={[styles.deliveryDescription, { color: theme.colors.textSecondary }]}>
                  {option.description}
                </Text>
                <Text style={[styles.deliveryTime, { color: theme.colors.textSecondary }]}>
                  {option.estimatedTime}
                </Text>
              </View>

              <View style={styles.deliveryPriceSection}>
                <Text style={[styles.deliveryPriceText, { color: theme.colors.textPrimary }]}>
                  {option.price === 0 ? 'FREE' : `R${option.price.toFixed(2)}`}
                </Text>
                {selectedDeliveryOption?.id === option.id && (
                  <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );

  if (cartItems.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ScrollView
          contentContainerStyle={styles.emptyCartContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          <View style={styles.emptyCartContent}>
            <View style={[styles.emptyCartIcon, { backgroundColor: theme.colors.surface }]}>
              <Ionicons name="cart-outline" size={80} color={theme.colors.textSecondary} />
            </View>
            
            <Text style={[styles.emptyCartTitle, { color: theme.colors.textPrimary }]}>
              Your Cart is Empty
            </Text>
            
            <Text style={[styles.emptyCartDescription, { color: theme.colors.textSecondary }]}>
              Add some medications and health products to get started with your order.
            </Text>

            <TouchableOpacity
              style={[styles.continueShoppingButton, { backgroundColor: theme.colors.primary }]}
              onPress={onContinueShopping}
            >
              <Ionicons name="storefront" size={20} color="#FFFFFF" />
              <Text style={styles.continueShoppingText}>Continue Shopping</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>
          Shopping Cart
        </Text>
        <View style={styles.headerActions}>
          <View style={[styles.itemCountBadge, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.itemCountText}>
              {cartSummary?.totalItems || 0}
            </Text>
          </View>
        </View>
      </View>

      {/* Cart Items */}
      <FlatList
        data={cartItems}
        renderItem={renderCartItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.cartList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Cart Summary */}
      {cartSummary && (
        <View style={[styles.cartSummary, { 
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border 
        }]}>
          {/* Delivery Option */}
          <TouchableOpacity
            style={[styles.deliverySelector, { borderColor: theme.colors.border }]}
            onPress={() => setShowDeliveryModal(true)}
          >
            <View style={styles.deliverySelectorContent}>
              <Ionicons 
                name={selectedDeliveryOption?.icon as any} 
                size={20} 
                color={theme.colors.primary} 
              />
              <View style={styles.deliverySelectorText}>
                <Text style={[styles.deliverySelectorTitle, { color: theme.colors.textPrimary }]}>
                  {selectedDeliveryOption?.name}
                </Text>
                <Text style={[styles.deliverySelectorSubtitle, { color: theme.colors.textSecondary }]}>
                  {selectedDeliveryOption?.estimatedTime}
                </Text>
              </View>
            </View>
            <View style={styles.deliverySelectorPrice}>
              <Text style={[styles.deliveryPrice, { color: theme.colors.textPrimary }]}>
                {selectedDeliveryOption?.price === 0 ? 'FREE' : `R${selectedDeliveryOption?.price.toFixed(2)}`}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.textSecondary} />
            </View>
          </TouchableOpacity>

          {/* Summary Details */}
          <View style={styles.summaryDetails}>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
                Subtotal ({cartSummary.totalItems} items)
              </Text>
              <Text style={[styles.summaryValue, { color: theme.colors.textPrimary }]}>
                R{cartSummary.subtotal.toFixed(2)}
              </Text>
            </View>

            {cartSummary.savings > 0 && (
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: theme.colors.success }]}>
                  You Save
                </Text>
                <Text style={[styles.summaryValue, { color: theme.colors.success }]}>
                  -R{cartSummary.savings.toFixed(2)}
                </Text>
              </View>
            )}

            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
                VAT (15%)
              </Text>
              <Text style={[styles.summaryValue, { color: theme.colors.textPrimary }]}>
                R{cartSummary.tax.toFixed(2)}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
                Delivery
              </Text>
              <Text style={[styles.summaryValue, { color: theme.colors.textPrimary }]}>
                {cartSummary.deliveryFee === 0 ? 'FREE' : `R${cartSummary.deliveryFee.toFixed(2)}`}
              </Text>
            </View>

            <View style={[styles.summaryDivider, { backgroundColor: theme.colors.border }]} />

            <View style={styles.summaryRow}>
              <Text style={[styles.summaryTotalLabel, { color: theme.colors.textPrimary }]}>
                Total
              </Text>
              <Text style={[styles.summaryTotalValue, { color: theme.colors.primary }]}>
                R{cartSummary.total.toFixed(2)}
              </Text>
            </View>
          </View>

          {/* Checkout Button */}
          <TouchableOpacity
            style={[styles.checkoutButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleCheckout}
          >
            <Ionicons name="card" size={20} color="#FFFFFF" />
            <Text style={styles.checkoutButtonText}>
              Proceed to Checkout
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <DeliveryOptionsModal />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemCountBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  itemCountText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  cartList: {
    padding: 16,
  },
  cartItem: {
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemGradient: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemImageContainer: {
    marginRight: 16,
    position: 'relative',
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  placeholderImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 24,
  },
  prescriptionBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#8E44AD',
    borderRadius: 8,
    padding: 4,
  },
  itemDetails: {
    flex: 1,
    marginRight: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
    lineHeight: 20,
  },
  itemGeneric: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  itemMeta: {
    marginBottom: 8,
  },
  pharmacyTag: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  pharmacyText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  dosageText: {
    fontSize: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  originalPrice: {
    fontSize: 12,
    textDecorationLine: 'line-through',
  },
  stockStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  stockText: {
    fontSize: 10,
    fontWeight: '600',
  },
  quantityControls: {
    alignItems: 'center',
    gap: 8,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityDisplay: {
    minWidth: 40,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '600',
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  emptyCartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyCartContent: {
    alignItems: 'center',
    maxWidth: 300,
  },
  emptyCartIcon: {
    width: 150,
    height: 150,
    borderRadius: 75,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyCartTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyCartDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  continueShoppingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  continueShoppingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cartSummary: {
    padding: 16,
    borderTopWidth: 1,
  },
  deliverySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 16,
  },
  deliverySelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  deliverySelectorText: {
    marginLeft: 12,
  },
  deliverySelectorTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  deliverySelectorSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  deliverySelectorPrice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deliveryPrice: {
    fontSize: 14,
    fontWeight: '600',
  },
  summaryDetails: {
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  summaryDivider: {
    height: 1,
    marginVertical: 12,
  },
  summaryTotalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  summaryTotalValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  checkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  checkoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 50,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  deliveryOptions: {
    padding: 16,
  },
  deliveryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 12,
  },
  deliveryIconContainer: {
    marginRight: 16,
  },
  deliveryDetails: {
    flex: 1,
  },
  deliveryName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  deliveryDescription: {
    fontSize: 14,
    marginBottom: 2,
  },
  deliveryTime: {
    fontSize: 12,
  },
  deliveryPriceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deliveryPriceText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
});

export default ModernCart;
