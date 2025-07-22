import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
    Image,
    ImageSourcePropType,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface ProductCardProps {
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
  featured?: boolean;
  description?: string;
  bestSeller?: boolean;
  prescription?: boolean;
  discount?: number;
  genericName?: string;
  dosage?: string;
  quantity?: string;
  isInCart?: boolean;
  realImageUrl?: string;
  realProduct?: any;
  onPress?: () => void;
  onAddToCart?: () => void;
  onRemoveFromCart?: () => void;
  style?: ViewStyle;
  compact?: boolean; // For CareHub compact view
}

const ProductCard: React.FC<ProductCardProps> = ({
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
  featured,
  description,
  bestSeller,
  prescription,
  discount,
  genericName,
  dosage,
  quantity,
  isInCart = false,
  realImageUrl,
  realProduct,
  onPress,
  onAddToCart,
  onRemoveFromCart,
  style,
  compact = false,
}) => {
  const { theme } = useTheme();

  const calculatedDiscount = originalPrice && price < originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : discount || 0;

  const renderImage = () => {
    if (realImageUrl) {
      return (
        <Image
          source={{ uri: realImageUrl }}
          style={styles.productImage}
        />
      );
    }

    if (typeof image === 'string') {
      // Handle emoji or URL strings
      if (image.startsWith('http')) {
        return <Image source={{ uri: image }} style={styles.productImage} />;
      } else {
        return <Text style={styles.productEmoji}>{image}</Text>;
      }
    } else {
      // Handle local image sources
      return <Image source={image} style={styles.productImage} />;
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface }, style]}>
      <TouchableOpacity
        style={styles.cardContent}
        onPress={onPress}
        activeOpacity={0.8}
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
              
              {description && !compact && (
                <Text 
                  style={[styles.productDescription, { color: theme.colors.textSecondary }]} 
                  numberOfLines={2}
                >
                  {description}
                </Text>
              )}

              {dosage && quantity && (
                <Text style={[styles.dosageInfo, { color: theme.colors.textSecondary }]}>
                  {dosage} • {quantity}
                </Text>
              )}

              {rating && reviews && !compact && (
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={14} color="#FFD700" />
                  <Text style={[styles.ratingText, { color: theme.colors.textPrimary }]}>
                    {rating}
                  </Text>
                  <Text style={[styles.reviewText, { color: theme.colors.textSecondary }]}>
                    ({reviews})
                  </Text>
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

            {/* Add to Cart Button */}
            {inStock ? (
              <TouchableOpacity
                style={[
                  styles.addToCartButton,
                  {
                    backgroundColor: isInCart ? '#10B981' : pharmacyColor
                  }
                ]}
                onPress={isInCart ? onRemoveFromCart : onAddToCart}
              >
                <Ionicons
                  name={isInCart ? "checkmark" : "cart"}
                  size={16}
                  color="#FFFFFF"
                />
                <Text style={styles.addToCartText}>
                  {isInCart ? 'Added' : 'Add to Cart'}
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={[styles.outOfStockButton, { backgroundColor: theme.colors.textSecondary }]}>
                <Ionicons name="close-circle" size={16} color="#FFFFFF" />
                <Text style={styles.outOfStockText}>Out of Stock</Text>
              </View>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    fontWeight: '600',
    marginBottom: 4,
    lineHeight: 18,
  },
  genericName: {
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 6,
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
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  addToCartText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  outOfStockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  outOfStockText: {
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
});

export default ProductCard;
