import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useState } from 'react';
import {
    Animated,
    Dimensions,
    FlatList,
    Image,
    ImageStyle,
    Modal,
    StyleSheet,
    Text,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

const { width, height } = Dimensions.get('window');

interface AdvancedCartProps {
  visible: boolean;
  onClose: () => void;
  onCheckout?: (summary: any) => void;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: any;
}

interface CartSummary {
  subtotal: number;
  discount: number;
  couponDiscount: number;
  deliveryFee: number;
  total: number;
  itemCount: number;
  savings: number;
}

export default function AdvancedCart({ visible, onClose, onCheckout }: AdvancedCartProps) {
  const { theme } = useTheme();
  const [cartItems] = useState<CartItem[]>([]);
  const [cartSummary] = useState<CartSummary>({
    subtotal: 0,
    discount: 0,
    couponDiscount: 0,
    deliveryFee: 0,
    total: 0,
    itemCount: 0,
    savings: 0
  });
  
  const [loading] = useState(false);

  const handleCheckout = useCallback(() => {
    if (onCheckout) {
      onCheckout(cartSummary);
    }
    onClose();
  }, [cartSummary, onCheckout, onClose]);

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <View style={[styles.cartItem, { backgroundColor: theme.colors.surface }]}>
      <Image source={item.image} style={styles.itemImage as ImageStyle} />
      <View style={styles.itemDetails}>
        <Text style={[styles.itemName, { color: theme.colors.text }]}>{item.name}</Text>
        <Text style={[styles.itemPrice, { color: theme.colors.primary }]}>
          R{item.price.toFixed(2)}
        </Text>
      </View>
      <View style={styles.quantityContainer}>
        <Text style={[styles.quantityText, { color: theme.colors.text }]}>{item.quantity}</Text>
      </View>
    </View>
  );

  // Create styles with error handling
  const createStyles = () => {
    try {
      return StyleSheet.create({
        overlay: {
          ...StyleSheet.absoluteFillObject,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1000,
        } as ViewStyle,
        container: {
          position: 'absolute',
          right: 0,
          top: 0,
          width: width * 0.9,
          height: height,
          backgroundColor: theme.colors.background,
          zIndex: 1001,
        } as ViewStyle,
        header: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 20,
          paddingTop: 60,
          backgroundColor: theme.colors.primary,
        } as ViewStyle,
        headerTitle: {
          fontSize: 20,
          fontWeight: 'bold',
          color: '#fff',
        } as TextStyle,
        closeButton: {
          padding: 5,
        } as ViewStyle,
        content: {
          flex: 1,
        } as ViewStyle,
        cartItem: {
          flexDirection: 'row',
          padding: 15,
          marginHorizontal: 15,
          marginVertical: 5,
          borderRadius: 12,
          elevation: 2,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
        } as ViewStyle,
        itemImage: {
          width: 60,
          height: 60,
          borderRadius: 8,
          marginRight: 12,
        } as ImageStyle,
        itemDetails: {
          flex: 1,
        } as ViewStyle,
        itemName: {
          fontSize: 16,
          fontWeight: '600',
          marginBottom: 4,
        } as TextStyle,
        itemPrice: {
          fontSize: 16,
          fontWeight: 'bold',
        } as TextStyle,
        quantityContainer: {
          alignItems: 'center',
          justifyContent: 'center',
        } as ViewStyle,
        quantityText: {
          fontSize: 16,
          fontWeight: '600',
        } as TextStyle,
        summary: {
          backgroundColor: theme.colors.surface,
          padding: 20,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border || '#e0e0e0',
        } as ViewStyle,
        summaryRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 8,
        } as ViewStyle,
        summaryLabel: {
          fontSize: 16,
          color: theme.colors.text,
        } as TextStyle,
        summaryValue: {
          fontSize: 16,
          fontWeight: '600',
          color: theme.colors.text,
        } as TextStyle,
        totalLabel: {
          fontSize: 18,
          fontWeight: 'bold',
          color: theme.colors.text,
        } as TextStyle,
        totalValue: {
          fontSize: 18,
          fontWeight: 'bold',
          color: theme.colors.primary,
        } as TextStyle,
        checkoutButton: {
          marginTop: 20,
          borderRadius: 12,
          overflow: 'hidden',
        } as ViewStyle,
        checkoutButtonContent: {
          paddingVertical: 16,
          alignItems: 'center',
          justifyContent: 'center',
        } as ViewStyle,
        checkoutButtonText: {
          color: '#fff',
          fontSize: 18,
          fontWeight: 'bold',
        } as TextStyle,
        emptyContainer: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: 40,
        } as ViewStyle,
        emptyText: {
          fontSize: 18,
          fontWeight: '600',
          color: theme.colors.textSecondary || theme.colors.text,
          marginBottom: 10,
          textAlign: 'center',
        } as TextStyle,
      });
    } catch (error) {
      console.warn('Error creating cart styles:', error);
      // Return basic fallback styles
      return StyleSheet.create({
        overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' } as ViewStyle,
        container: { flex: 1, backgroundColor: '#fff' } as ViewStyle,
        header: { padding: 20, backgroundColor: '#3726a6' } as ViewStyle,
        headerTitle: { fontSize: 20, color: '#fff' } as TextStyle,
        closeButton: { padding: 5 } as ViewStyle,
        content: { flex: 1 } as ViewStyle,
        cartItem: { padding: 15, flexDirection: 'row' } as ViewStyle,
        itemImage: { width: 60, height: 60 } as ImageStyle,
        itemDetails: { flex: 1 } as ViewStyle,
        itemName: { fontSize: 16 } as TextStyle,
        itemPrice: { fontSize: 16, fontWeight: 'bold' } as TextStyle,
        quantityContainer: { alignItems: 'center' } as ViewStyle,
        quantityText: { fontSize: 16 } as TextStyle,
        summary: { padding: 20, backgroundColor: '#f5f5f5' } as ViewStyle,
        summaryRow: { flexDirection: 'row', justifyContent: 'space-between' } as ViewStyle,
        summaryLabel: { fontSize: 16 } as TextStyle,
        summaryValue: { fontSize: 16, fontWeight: 'bold' } as TextStyle,
        totalLabel: { fontSize: 18, fontWeight: 'bold' } as TextStyle,
        totalValue: { fontSize: 18, fontWeight: 'bold', color: '#3726a6' } as TextStyle,
        checkoutButton: { marginTop: 20 } as ViewStyle,
        checkoutButtonContent: { padding: 16, alignItems: 'center' } as ViewStyle,
        checkoutButtonText: { color: '#fff', fontSize: 18 } as TextStyle,
        emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' } as ViewStyle,
        emptyText: { fontSize: 18, textAlign: 'center' } as TextStyle,
      });
    }
  };

  const styles = createStyles();

  if (!visible) return null;

  try {
    return (
      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.overlay}>
          <Animated.View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.headerTitle}>Shopping Cart</Text>
              </View>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.content}>
              {cartItems.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons 
                    name="cart-outline" 
                    size={64} 
                    color={theme.colors.textSecondary || '#999'} 
                  />
                  <Text style={styles.emptyText}>Your cart is empty</Text>
                </View>
              ) : (
                <>
                  <FlatList
                    data={cartItems}
                    keyExtractor={(item) => item.id}
                    renderItem={renderCartItem}
                    showsVerticalScrollIndicator={false}
                  />

                  {/* Summary */}
                  <View style={styles.summary}>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Subtotal</Text>
                      <Text style={styles.summaryValue}>
                        R{cartSummary.subtotal.toFixed(2)}
                      </Text>
                    </View>
                    
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Delivery</Text>
                      <Text style={styles.summaryValue}>
                        {cartSummary.deliveryFee === 0 ? 'Free' : `R${cartSummary.deliveryFee.toFixed(2)}`}
                      </Text>
                    </View>

                    <View style={styles.summaryRow}>
                      <Text style={styles.totalLabel}>Total</Text>
                      <Text style={styles.totalValue}>
                        R{cartSummary.total.toFixed(2)}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={styles.checkoutButton}
                      onPress={handleCheckout}
                      disabled={loading}
                    >
                      <LinearGradient
                        colors={[theme.colors.primary, theme.colors.secondary || theme.colors.primary]}
                        style={styles.checkoutButtonContent}
                      >
                        <Text style={styles.checkoutButtonText}>
                          {loading ? 'Processing...' : `Checkout • R${cartSummary.total.toFixed(2)}`}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </Animated.View>
        </View>
      </Modal>
    );
  } catch (error) {
    console.error('Error rendering AdvancedCart:', error);
    return (
      <Modal visible={visible} transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#fff', padding: 20, borderRadius: 12, margin: 20 }}>
            <Text style={{ fontSize: 18, marginBottom: 10, textAlign: 'center' }}>Cart Error</Text>
            <Text style={{ textAlign: 'center', marginBottom: 20 }}>Something went wrong with the cart.</Text>
            <TouchableOpacity 
              onPress={onClose}
              style={{ backgroundColor: '#3726a6', padding: 12, borderRadius: 8, alignItems: 'center' }}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }
}
