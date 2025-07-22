import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
    Alert,
    Animated,
    Image,
    ImageSourcePropType,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface ModernProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string | ImageSourcePropType;
  category?: string;
  rating?: number;
  reviews?: number;
  pharmacy: string;
  pharmacyColor: string;
  inStock: boolean;
  stockCount?: number;
  featured?: boolean;
  description?: string;
  detailedDescription?: string;
  bestSeller?: boolean;
  prescription?: boolean;
  discount?: number;
  genericName?: string;
  dosage?: string;
  quantity?: string;
  manufacturer?: string;
  sideEffects?: string[];
  ingredients?: string[];
  directions?: string;
  warnings?: string[];
  realImageUrl?: string;
  realProduct?: any;
  onAddToCart: (productId: string, quantity: number) => void;
  onViewDetails?: (product: any) => void;
  style?: ViewStyle;
  compact?: boolean;
}

const ModernProductCard: React.FC<ModernProductCardProps> = ({
  id,
  name,
  price,
  originalPrice,
  image,
  category,
  rating = 4.5,
  reviews = 0,
  pharmacy,
  pharmacyColor,
  inStock,
  stockCount = 10,
  featured,
  description,
  detailedDescription,
  bestSeller,
  prescription,
  discount,
  genericName,
  dosage,
  quantity,
  manufacturer,
  sideEffects = [],
  ingredients = [],
  directions,
  warnings = [],
  realImageUrl,
  realProduct,
  onAddToCart,
  onViewDetails,
  style,
  compact = false,
}) => {
  const { theme } = useTheme();
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [addToCartAnimation] = useState(new Animated.Value(1));

  const calculatedDiscount = originalPrice && price < originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : discount || 0;

  const renderImage = () => {
    if (realImageUrl) {
      return (
        <Image
          source={{ uri: realImageUrl }}
          style={styles.productImage}
          resizeMode="contain"
        />
      );
    }

    if (typeof image === 'string') {
      if (image.startsWith('http')) {
        return <Image source={{ uri: image }} style={styles.productImage} resizeMode="contain" />;
      } else {
        return <Text style={styles.productEmoji}>{image}</Text>;
      }
    } else {
      return <Image source={image} style={styles.productImage} resizeMode="contain" />;
    }
  };

  const handleAddToCart = () => {
    if (!inStock) {
      Alert.alert('Out of Stock', 'This product is currently out of stock.');
      return;
    }

    // Animate button
    Animated.sequence([
      Animated.timing(addToCartAnimation, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(addToCartAnimation, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onAddToCart(id, selectedQuantity);
    
    Alert.alert(
      '✅ Added to Cart!',
      `${selectedQuantity} x ${name} added to your cart`,
      [{ text: 'OK', style: 'default' }]
    );
  };

  const handleViewDetails = () => {
    const productDetails = {
      id,
      name,
      price,
      originalPrice,
      image,
      category,
      rating,
      reviews,
      pharmacy,
      pharmacyColor,
      inStock,
      stockCount,
      description,
      detailedDescription,
      genericName,
      dosage,
      quantity,
      manufacturer,
      sideEffects,
      ingredients,
      directions,
      warnings,
      realImageUrl,
    };

    if (onViewDetails) {
      onViewDetails(productDetails);
    } else {
      setShowDetailsModal(true);
    }
  };

  const QuantitySelector = () => (
    <View style={styles.quantitySelector}>
      <TouchableOpacity
        style={[styles.quantityButton, { borderColor: theme.colors.border }]}
        onPress={() => setSelectedQuantity(Math.max(1, selectedQuantity - 1))}
        disabled={selectedQuantity <= 1}
      >
        <Ionicons 
          name="remove" 
          size={16} 
          color={selectedQuantity <= 1 ? theme.colors.textSecondary : theme.colors.textPrimary} 
        />
      </TouchableOpacity>
      
      <View style={[styles.quantityDisplay, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.quantityText, { color: theme.colors.textPrimary }]}>
          {selectedQuantity}
        </Text>
      </View>
      
      <TouchableOpacity
        style={[styles.quantityButton, { borderColor: theme.colors.border }]}
        onPress={() => setSelectedQuantity(Math.min(stockCount, selectedQuantity + 1))}
        disabled={selectedQuantity >= stockCount}
      >
        <Ionicons 
          name="add" 
          size={16} 
          color={selectedQuantity >= stockCount ? theme.colors.textSecondary : theme.colors.textPrimary} 
        />
      </TouchableOpacity>
    </View>
  );

  const ProductDetailsModal = () => (
    <Modal
      visible={showDetailsModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowDetailsModal(false)}
    >
      <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
        {/* Modal Header */}
        <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowDetailsModal(false)}
          >
            <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>
            Product Details
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          {/* Product Image */}
          <View style={styles.modalImageContainer}>
            {renderImage()}
          </View>

          {/* Product Info */}
          <View style={styles.modalProductInfo}>
            <Text style={[styles.modalProductName, { color: theme.colors.textPrimary }]}>
              {name}
            </Text>
            
            {genericName && (
              <Text style={[styles.modalGenericName, { color: theme.colors.textSecondary }]}>
                {genericName}
              </Text>
            )}

            <View style={styles.modalPriceContainer}>
              <Text style={[styles.modalPrice, { color: pharmacyColor }]}>
                R{price.toFixed(2)}
              </Text>
              {originalPrice && (
                <Text style={[styles.modalOriginalPrice, { color: theme.colors.textSecondary }]}>
                  R{originalPrice.toFixed(2)}
                </Text>
              )}
            </View>

            {/* Rating */}
            <View style={styles.modalRatingContainer}>
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons
                    key={star}
                    name={star <= rating ? "star" : "star-outline"}
                    size={16}
                    color="#FFD700"
                  />
                ))}
              </View>
              <Text style={[styles.modalRatingText, { color: theme.colors.textSecondary }]}>
                {rating} ({reviews} reviews)
              </Text>
            </View>

            {/* Stock Status */}
            <View style={[styles.stockIndicator, { 
              backgroundColor: inStock ? '#E8F5E8' : '#FFE8E8' 
            }]}>
              <Ionicons 
                name={inStock ? "checkmark-circle" : "close-circle"} 
                size={16} 
                color={inStock ? '#4CAF50' : '#F44336'} 
              />
              <Text style={[styles.stockText, { 
                color: inStock ? '#4CAF50' : '#F44336' 
              }]}>
                {inStock ? `In Stock (${stockCount} available)` : 'Out of Stock'}
              </Text>
            </View>
          </View>

          {/* Description */}
          {(description || detailedDescription) && (
            <View style={styles.modalSection}>
              <Text style={[styles.modalSectionTitle, { color: theme.colors.textPrimary }]}>
                Description
              </Text>
              <Text style={[styles.modalSectionText, { color: theme.colors.textSecondary }]}>
                {detailedDescription || description}
              </Text>
            </View>
          )}

          {/* Dosage & Quantity */}
          {(dosage || quantity) && (
            <View style={styles.modalSection}>
              <Text style={[styles.modalSectionTitle, { color: theme.colors.textPrimary }]}>
                Dosage Information
              </Text>
              {dosage && (
                <Text style={[styles.modalSectionText, { color: theme.colors.textSecondary }]}>
                  Strength: {dosage}
                </Text>
              )}
              {quantity && (
                <Text style={[styles.modalSectionText, { color: theme.colors.textSecondary }]}>
                  Pack Size: {quantity}
                </Text>
              )}
            </View>
          )}

          {/* Manufacturer */}
          {manufacturer && (
            <View style={styles.modalSection}>
              <Text style={[styles.modalSectionTitle, { color: theme.colors.textPrimary }]}>
                Manufacturer
              </Text>
              <Text style={[styles.modalSectionText, { color: theme.colors.textSecondary }]}>
                {manufacturer}
              </Text>
            </View>
          )}

          {/* Directions */}
          {directions && (
            <View style={styles.modalSection}>
              <Text style={[styles.modalSectionTitle, { color: theme.colors.textPrimary }]}>
                Directions for Use
              </Text>
              <Text style={[styles.modalSectionText, { color: theme.colors.textSecondary }]}>
                {directions}
              </Text>
            </View>
          )}

          {/* Ingredients */}
          {ingredients.length > 0 && (
            <View style={styles.modalSection}>
              <Text style={[styles.modalSectionTitle, { color: theme.colors.textPrimary }]}>
                Active Ingredients
              </Text>
              {ingredients.map((ingredient, index) => (
                <Text key={index} style={[styles.modalSectionText, { color: theme.colors.textSecondary }]}>
                  • {ingredient}
                </Text>
              ))}
            </View>
          )}

          {/* Side Effects */}
          {sideEffects.length > 0 && (
            <View style={styles.modalSection}>
              <Text style={[styles.modalSectionTitle, { color: theme.colors.textPrimary }]}>
                Possible Side Effects
              </Text>
              {sideEffects.map((effect, index) => (
                <Text key={index} style={[styles.modalSectionText, { color: theme.colors.textSecondary }]}>
                  • {effect}
                </Text>
              ))}
            </View>
          )}

          {/* Warnings */}
          {warnings.length > 0 && (
            <View style={styles.modalSection}>
              <View style={styles.warningHeader}>
                <Ionicons name="warning" size={20} color="#FF9800" />
                <Text style={[styles.modalSectionTitle, { color: '#FF9800', marginLeft: 8 }]}>
                  Important Warnings
                </Text>
              </View>
              {warnings.map((warning, index) => (
                <Text key={index} style={[styles.modalSectionText, { color: theme.colors.textSecondary }]}>
                  • {warning}
                </Text>
              ))}
            </View>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Modal Footer */}
        <View style={[styles.modalFooter, { 
          backgroundColor: theme.colors.background,
          borderTopColor: theme.colors.border 
        }]}>
          <View style={styles.modalQuantityContainer}>
            <Text style={[styles.quantityLabel, { color: theme.colors.textPrimary }]}>
              Quantity:
            </Text>
            <QuantitySelector />
          </View>
          
          <TouchableOpacity
            style={[styles.modalAddToCartButton, { backgroundColor: pharmacyColor }]}
            onPress={() => {
              handleAddToCart();
              setShowDetailsModal(false);
            }}
            disabled={!inStock}
          >
            <Ionicons name="cart" size={20} color="#FFFFFF" />
            <Text style={styles.modalAddToCartText}>
              Add to Cart • R{(price * selectedQuantity).toFixed(2)}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <>
      <View style={[styles.card, { backgroundColor: theme.colors.surface }, style]}>
        <TouchableOpacity
          style={styles.cardContent}
          onPress={handleViewDetails}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={[`${pharmacyColor}08`, `${pharmacyColor}03`]}
            style={[styles.gradient, compact && styles.compactGradient]}
          >
            {/* Header with Image and Badges */}
            <View style={[styles.header, compact && styles.compactHeader]}>
              <View style={styles.imageContainer}>
                {renderImage()}
                
                {/* Badges */}
                {calculatedDiscount > 0 && (
                  <View style={[styles.discountBadge, { backgroundColor: '#FF6B35' }]}>
                    <Text style={styles.discountText}>-{calculatedDiscount}%</Text>
                  </View>
                )}
                
                {featured && (
                  <View style={[styles.featuredBadge, { backgroundColor: '#FFD700' }]}>
                    <Ionicons name="star" size={12} color="#FFFFFF" />
                  </View>
                )}
                
                {bestSeller && (
                  <View style={[styles.bestSellerBadge, { backgroundColor: '#10B981' }]}>
                    <Text style={styles.badgeText}>Best</Text>
                  </View>
                )}
                
                {prescription && (
                  <View style={[styles.prescriptionBadge, { backgroundColor: '#8E44AD' }]}>
                    <Ionicons name="medical" size={12} color="#FFFFFF" />
                  </View>
                )}

                {realProduct && (
                  <View style={[styles.liveBadge, { backgroundColor: theme.colors.success }]}>
                    <Text style={styles.liveText}>LIVE</Text>
                  </View>
                )}
              </View>

              {/* Product Info */}
              <View style={styles.productInfo}>
                <Text 
                  style={[styles.productName, { color: theme.colors.textPrimary }]} 
                  numberOfLines={compact ? 1 : 2}
                >
                  {name}
                </Text>
                
                {genericName && (
                  <Text 
                    style={[styles.genericName, { color: theme.colors.textSecondary }]} 
                    numberOfLines={1}
                  >
                    {genericName}
                  </Text>
                )}

                {dosage && quantity && (
                  <Text style={[styles.dosageInfo, { color: theme.colors.textSecondary }]}>
                    {dosage} • {quantity}
                  </Text>
                )}

                {!compact && rating && (
                  <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={14} color="#FFD700" />
                    <Text style={[styles.ratingText, { color: theme.colors.textPrimary }]}>
                      {rating}
                    </Text>
                    {reviews > 0 && (
                      <Text style={[styles.reviewText, { color: theme.colors.textSecondary }]}>
                        ({reviews})
                      </Text>
                    )}
                  </View>
                )}
              </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <View style={styles.pharmacyTag}>
                <Ionicons name="storefront" size={12} color={pharmacyColor} />
                <Text style={[styles.pharmacyText, { color: pharmacyColor }]}>
                  {pharmacy}
                </Text>
              </View>

              <View style={styles.priceContainer}>
                <Text style={[styles.price, { color: pharmacyColor }]}>
                  R{price.toFixed(2)}
                </Text>
                {originalPrice && (
                  <Text style={[styles.originalPrice, { color: theme.colors.textSecondary }]}>
                    R{originalPrice.toFixed(2)}
                  </Text>
                )}
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {/* Quantity Selector */}
          <View style={styles.cardQuantityContainer}>
            <QuantitySelector />
          </View>

          {/* Add to Cart Button */}
          <Animated.View style={{ transform: [{ scale: addToCartAnimation }] }}>
            <TouchableOpacity
              style={[
                styles.addToCartButton,
                {
                  backgroundColor: inStock ? pharmacyColor : theme.colors.textSecondary,
                }
              ]}
              onPress={handleAddToCart}
              disabled={!inStock}
            >
              <Ionicons
                name={inStock ? "cart" : "close-circle"}
                size={16}
                color="#FFFFFF"
              />
              <Text style={styles.addToCartText}>
                {inStock ? 'Add to Cart' : 'Out of Stock'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>

      <ProductDetailsModal />
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    margin: 8,
  },
  cardContent: {
    flex: 1,
  },
  gradient: {
    padding: 12,
  },
  compactGradient: {
    padding: 8,
  },
  header: {
    marginBottom: 12,
  },
  compactHeader: {
    marginBottom: 8,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
    height: 80,
    justifyContent: 'center',
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  productEmoji: {
    fontSize: 40,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
    lineHeight: 18,
  },
  genericName: {
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  dosageInfo: {
    fontSize: 12,
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  reviewText: {
    fontSize: 11,
    marginLeft: 4,
  },
  footer: {
    gap: 8,
  },
  pharmacyTag: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pharmacyText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  originalPrice: {
    fontSize: 12,
    textDecorationLine: 'line-through',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 12,
    gap: 12,
    alignItems: 'center',
  },
  cardQuantityContainer: {
    flex: 1,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  addToCartText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  // Badges
  discountBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  featuredBadge: {
    position: 'absolute',
    top: -5,
    left: -5,
    padding: 4,
    borderRadius: 8,
  },
  bestSellerBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  prescriptionBadge: {
    position: 'absolute',
    bottom: -5,
    left: -5,
    padding: 4,
    borderRadius: 8,
  },
  liveBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  liveText: {
    color: '#FFFFFF',
    fontSize: 9,
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
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalImageContainer: {
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 20,
  },
  modalProductInfo: {
    marginBottom: 24,
  },
  modalProductName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalGenericName: {
    fontSize: 16,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  modalPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  modalPrice: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  modalOriginalPrice: {
    fontSize: 16,
    textDecorationLine: 'line-through',
  },
  modalRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  modalRatingText: {
    fontSize: 14,
  },
  stockIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  stockText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalSection: {
    marginBottom: 24,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  modalSectionText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    gap: 16,
  },
  modalQuantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalAddToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  modalAddToCartText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ModernProductCard;
