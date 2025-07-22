import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    FlatList,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import ModernProductCard from '../../components/ModernProductCard';
import { StandardHeader } from '../../components/StandardHeader';
import { useTheme } from '../../contexts/ThemeContext';

interface FeaturedProduct {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  pharmacy: string;
  pharmacyColor: string;
  inStock: boolean;
  featured: boolean;
  description: string;
  bestSeller: boolean;
  prescription?: boolean;
}

const FEATURED_PRODUCTS: FeaturedProduct[] = [
  {
    id: '1',
    name: 'Panado Extra 24 Tablets',
    price: 45.99,
    originalPrice: 52.99,
    image: '💊',
    category: 'Pain Relief',
    rating: 4.5,
    reviews: 234,
    pharmacy: 'Clicks',
    pharmacyColor: '#E60012',
    inStock: true,
    featured: true,
    description: 'Fast-acting pain relief with caffeine boost',
    bestSeller: true,
  },
  {
    id: '2',
    name: 'Vitamin D3 1000IU 60 Capsules',
    price: 189.99,
    image: '🟡',
    category: 'Vitamins',
    rating: 4.7,
    reviews: 156,
    pharmacy: 'Dis-Chem',
    pharmacyColor: '#00A651',
    inStock: true,
    featured: true,
    description: 'Essential vitamin D3 for bone health and immunity',
    bestSeller: true,
  },
  {
    id: '3',
    name: 'Bepanthen Ointment 30g',
    price: 89.99,
    originalPrice: 99.99,
    image: '🧴',
    category: 'Skincare',
    rating: 4.8,
    reviews: 189,
    pharmacy: 'Clicks',
    pharmacyColor: '#E60012',
    inStock: true,
    featured: true,
    description: 'Healing ointment for cuts, scrapes and minor wounds',
    bestSeller: false,
  },
  {
    id: '4',
    name: 'Allergex 25mg 30 Tablets',
    price: 67.50,
    image: '💊',
    category: 'Allergy',
    rating: 4.2,
    reviews: 98,
    pharmacy: 'Medirite',
    pharmacyColor: '#0066CC',
    inStock: false,
    featured: true,
    description: 'Antihistamine for allergic conditions',
    bestSeller: false,
    prescription: true,
  },
  {
    id: '5',
    name: 'Omega-3 Fish Oil 1000mg',
    price: 299.99,
    originalPrice: 349.99,
    image: '🐟',
    category: 'Supplements',
    rating: 4.6,
    reviews: 145,
    pharmacy: 'Dis-Chem',
    pharmacyColor: '#00A651',
    inStock: true,
    featured: true,
    description: 'Premium fish oil for heart and brain health',
    bestSeller: true,
  },
  {
    id: '6',
    name: 'Oral-B Electric Toothbrush',
    price: 599.99,
    originalPrice: 699.99,
    image: '🪥',
    category: 'Oral Care',
    rating: 4.4,
    reviews: 87,
    pharmacy: 'Clicks',
    pharmacyColor: '#E60012',
    inStock: true,
    featured: true,
    description: 'Advanced cleaning with pressure sensor technology',
    bestSeller: false,
  },
  {
    id: '7',
    name: 'Bioplus Probiotic Capsules',
    price: 199.99,
    image: '🦠',
    category: 'Digestive',
    rating: 4.3,
    reviews: 67,
    pharmacy: 'Mopani',
    pharmacyColor: '#FF6B35',
    inStock: true,
    featured: false,
    description: 'Support digestive health with beneficial bacteria',
    bestSeller: false,
  },
  {
    id: '8',
    name: 'Nivea Men Face Wash',
    price: 54.99,
    originalPrice: 64.99,
    image: '🧴',
    category: 'Skincare',
    rating: 4.1,
    reviews: 112,
    pharmacy: 'Dis-Chem',
    pharmacyColor: '#00A651',
    inStock: true,
    featured: false,
    description: 'Deep cleansing face wash for men\'s skin',
    bestSeller: false,
  },
];

const categories = ['All', 'Pain Relief', 'Vitamins', 'Skincare', 'Allergy', 'Supplements', 'Oral Care', 'Digestive'];
const sortOptions = [
  { key: 'featured', label: 'Featured First', icon: 'star' },
  { key: 'price-low', label: 'Price: Low to High', icon: 'arrow-up' },
  { key: 'price-high', label: 'Price: High to Low', icon: 'arrow-down' },
  { key: 'rating', label: 'Highest Rated', icon: 'thumbs-up' },
  { key: 'bestseller', label: 'Best Sellers', icon: 'trending-up' },
];

export default function FeaturedProductsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('featured');
  const [showInStockOnly, setShowInStockOnly] = useState(false);
  const [cartItems, setCartItems] = useState<string[]>([]);

  const filteredAndSortedProducts = FEATURED_PRODUCTS
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchText.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchText.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      const matchesStock = !showInStockOnly || product.inStock;
      return matchesSearch && matchesCategory && matchesStock;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'featured':
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return b.rating - a.rating;
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'bestseller':
          if (a.bestSeller && !b.bestSeller) return -1;
          if (!a.bestSeller && b.bestSeller) return 1;
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

  const addToCart = (productId: string) => {
    setCartItems(prev => [...prev, productId]);
  };

  const addToCartWithQuantity = (productId: string, quantity: number) => {
    setCartItems(prev => [...prev.filter(id => id !== productId), productId]);
    console.log(`Added ${quantity}x ${productId} to cart`);
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prev => prev.filter(id => id !== productId));
  };

  const renderProduct = ({ item: product, index }: { item: FeaturedProduct; index: number }) => {
    const isInCart = cartItems.includes(product.id);
    
    return (
      <Animated.View
        entering={FadeInDown.delay(50 * index)}
        style={styles.productCardContainer}
      >
        <ModernProductCard
          id={product.id}
          name={product.name}
          price={product.price}
          originalPrice={product.originalPrice}
          image={product.image}
          pharmacy={product.pharmacy}
          pharmacyColor={product.pharmacyColor}
          inStock={product.inStock}
          featured={product.featured}
          description={product.description}
          bestSeller={product.bestSeller}
          prescription={product.prescription}
          rating={product.rating}
          reviews={product.reviews}
          onAddToCart={(productId, quantity) => addToCartWithQuantity(productId, quantity)}
          onViewDetails={() => router.push(`/pharmacy-store?id=${product.pharmacy.toLowerCase()}` as any)}
          style={{ flex: 1 }}
        />
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} />
      
      <StandardHeader
        title="Featured Products"
        subtitle="Handpicked products for your health"
        showBackButton
        onBackPress={() => router.back()}
        rightComponent={
          <TouchableOpacity>
            <View style={styles.cartIconContainer}>
              <Ionicons name="cart" size={24} color={theme.colors.textPrimary} />
              {cartItems.length > 0 && (
                <View style={[styles.cartBadge, { backgroundColor: theme.colors.primary }]}>
                  <Text style={styles.cartBadgeText}>{cartItems.length}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        }
      />

      {/* Search and Filters */}
      <View style={styles.searchSection}>
        <View style={[styles.searchBar, { backgroundColor: theme.colors.surface }]}>
          <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.textPrimary }]}
            placeholder="Search products..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        {/* Category Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                {
                  backgroundColor: selectedCategory === category ? theme.colors.primary : theme.colors.surface,
                  borderColor: theme.colors.border,
                }
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.categoryText,
                  {
                    color: selectedCategory === category ? theme.colors.white : theme.colors.textPrimary,
                  }
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Sort and Filter Options */}
        <View style={styles.filterRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sortScroll}>
            {sortOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.sortButton,
                  {
                    backgroundColor: sortBy === option.key ? theme.colors.primary : theme.colors.surface,
                    borderColor: theme.colors.border,
                  }
                ]}
                onPress={() => setSortBy(option.key)}
              >
                <Ionicons
                  name={option.icon as any}
                  size={14}
                  color={sortBy === option.key ? theme.colors.white : theme.colors.textPrimary}
                />
                <Text
                  style={[
                    styles.sortButtonText,
                    {
                      color: sortBy === option.key ? theme.colors.white : theme.colors.textPrimary,
                    }
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={[
              styles.stockFilterButton,
              {
                backgroundColor: showInStockOnly ? theme.colors.primary : theme.colors.surface,
                borderColor: theme.colors.border,
              }
            ]}
            onPress={() => setShowInStockOnly(!showInStockOnly)}
          >
            <Ionicons
              name="cube"
              size={16}
              color={showInStockOnly ? theme.colors.white : theme.colors.textPrimary}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.resultInfo}>
          <Text style={[styles.resultCount, { color: theme.colors.textPrimary }]}>
            {filteredAndSortedProducts.length} product{filteredAndSortedProducts.length > 1 ? 's' : ''} found
          </Text>
        </View>
      </View>

      {/* Products Grid */}
      <FlatList
        data={filteredAndSortedProducts}
        keyExtractor={(item) => item.id}
        renderItem={renderProduct}
        numColumns={2}
        columnWrapperStyle={styles.productRow}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  categoryScroll: {
    marginBottom: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sortScroll: {
    flex: 1,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
  },
  sortButtonText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  stockFilterButton: {
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    marginLeft: 8,
  },
  resultInfo: {
    alignItems: 'center',
  },
  resultCount: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  productRow: {
    justifyContent: 'space-between',
  },
  productCardContainer: {
    width: '48%',
    marginBottom: 16,
  },
  productCard: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productCardContent: {
    flex: 1,
  },
  productGradient: {
    padding: 12,
  },
  productHeader: {
    marginBottom: 12,
  },
  productImageContainer: {
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
    height: 60,
    justifyContent: 'center',
  },
  productEmoji: {
    fontSize: 36,
  },
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
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
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
  productDescription: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
  productFooter: {
    marginBottom: 12,
  },
  pharmacyTag: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  pharmacyText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  },
  addToCartText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  outOfStockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  outOfStockText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  cartIconContainer: {
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
