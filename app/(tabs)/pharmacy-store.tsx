import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    FlatList,
    Image,
    ImageSourcePropType,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { StandardHeader } from '../../components/StandardHeader';
import { useTheme } from '../../contexts/ThemeContext';

interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  inStock: boolean;
  rating: number;
  reviews: number;
  description: string;
  prescription?: boolean;
  strength?: string;
  packSize?: string;
}

interface PharmacyInfo {
  id: string;
  name: string;
  logo: ImageSourcePropType;
  rating: number;
  deliveryTime: string;
  deliveryFee: string;
  primaryColor: string;
  secondaryColor: string;
  description: string;
  address: string;
  phone: string;
  hours: string;
  services: string[];
  isOpen: boolean;
}

// Pharmacy data with accurate brand colors
const PHARMACY_DATA: Record<string, PharmacyInfo> = {
  clicks: {
    id: 'clicks',
    name: 'Clicks',
    logo: require('../../assets/images/pharmacies/Clicks_(South_Africa)_Logo.svg.png'),
    rating: 4.5,
    deliveryTime: '30-45 min',
    deliveryFee: 'R35',
    primaryColor: '#0066CC', // Clicks blue
    secondaryColor: '#004499',
    description: 'South Africa\'s leading pharmacy and health retailer',
    address: 'Shop 12, Sandton City Mall, Johannesburg',
    phone: '011 783 8000',
    hours: '08:00 - 20:00',
    services: ['Prescription Medicines', 'Health Consultations', 'Vaccinations', 'Baby Clinic'],
    isOpen: true,
  },
  dischem: {
    id: 'dischem',
    name: 'Dis-Chem',
    logo: require('../../assets/images/pharmacies/Dischem_Logo.png'),
    rating: 4.6,
    deliveryTime: '25-40 min',
    deliveryFee: 'R25',
    primaryColor: '#00A651', // Dis-Chem green
    secondaryColor: '#008541',
    description: 'Your first choice for health, beauty and wellness',
    address: 'Rosebank Mall, Upper Level, Johannesburg',
    phone: '011 447 3000',
    hours: '08:00 - 21:00',
    services: ['Prescription Medicines', 'Health Screening', 'Clinic Services', 'Online Orders'],
    isOpen: true,
  },
  medirite: {
    id: 'medirite',
    name: 'Medirite',
    logo: require('../../assets/images/pharmacies/Medirite.png'),
    rating: 4.3,
    deliveryTime: '35-50 min',
    deliveryFee: 'R30',
    primaryColor: '#E60012', // Medirite red
    secondaryColor: '#CC0010',
    description: 'Quality healthcare and wellness products',
    address: '45 Rivonia Road, Sandhurst, Johannesburg',
    phone: '011 884 5000',
    hours: '08:00 - 19:00',
    services: ['Chronic Medication', 'Medical Devices', 'Home Care', 'Delivery'],
    isOpen: false,
  },
  mopani: {
    id: 'mopani',
    name: 'Mopani Pharmacy',
    logo: require('../../assets/images/pharmacies/Mopani_Online_Logo_165x_2x.png'),
    rating: 4.4,
    deliveryTime: '40-60 min',
    deliveryFee: 'R40',
    primaryColor: '#FF6B35', // Mopani orange
    secondaryColor: '#E55A2B',
    description: 'Dedicated to providing quality pharmaceutical care',
    address: 'Melrose Arch Shopping Centre',
    phone: '011 684 2000',
    hours: '08:00 - 19:30',
    services: ['Online Prescriptions', 'Home Delivery', 'Consultation', 'Medical Advice'],
    isOpen: true,
  },
  morningside: {
    id: 'morningside',
    name: 'Morningside Dispensary',
    logo: require('../../assets/images/pharmacies/Morningside-Dispensary-Logo (1).png'),
    rating: 4.7,
    deliveryTime: '20-35 min',
    deliveryFee: 'R20',
    primaryColor: '#2E8B57', // Morningside green
    secondaryColor: '#1F5F3F',
    description: 'Community-focused pharmacy with personalized care',
    address: 'Morningside Shopping Centre',
    phone: '011 884 7000',
    hours: '08:00 - 18:00',
    services: ['Compounding', 'Vaccinations', 'Health Screening', 'Prescription Medicines'],
    isOpen: true,
  },
};

// Real medication products with actual images (placeholder URLs for real implementation)
const SAMPLE_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Panado Extra',
    brand: 'Panado',
    strength: '500mg',
    packSize: '24 Tablets',
    price: 45.99,
    originalPrice: 52.99,
    image: 'https://cdn.clicks.co.za/product/medium/panado-extra-tablets-24s.jpg',
    category: 'Pain Relief',
    inStock: true,
    rating: 4.3,
    reviews: 127,
    description: 'Fast-acting pain relief with caffeine for headaches and body pain',
  },
  {
    id: '2',
    name: 'Vitamin D3',
    brand: 'Solal',
    strength: '1000IU',
    packSize: '60 Capsules',
    price: 189.99,
    image: 'https://cdn.clicks.co.za/product/medium/solal-vitamin-d3-1000iu-60s.jpg',
    category: 'Vitamins',
    inStock: true,
    rating: 4.7,
    reviews: 156,
    description: 'Essential vitamin D3 for bone health and immunity support',
  },
  {
    id: '3',
    name: 'Bepanthen Ointment',
    brand: 'Bepanthen',
    packSize: '30g',
    price: 89.99,
    originalPrice: 99.99,
    image: 'https://cdn.clicks.co.za/product/medium/bepanthen-ointment-30g.jpg',
    category: 'Skincare',
    inStock: true,
    rating: 4.8,
    reviews: 189,
    description: 'Healing ointment for cuts, scrapes and minor wounds',
  },
  {
    id: '4',
    name: 'Allergex',
    brand: 'Allergex',
    strength: '25mg',
    packSize: '30 Tablets',
    price: 67.50,
    image: 'https://cdn.clicks.co.za/product/medium/allergex-25mg-tablets-30s.jpg',
    category: 'Allergy',
    inStock: false,
    rating: 4.2,
    reviews: 98,
    description: 'Antihistamine for allergic conditions and hay fever',
    prescription: true,
  },
  {
    id: '5',
    name: 'Omega-3 Fish Oil',
    brand: 'Biogen',
    strength: '1000mg',
    packSize: '90 Capsules',
    price: 299.99,
    originalPrice: 349.99,
    image: 'https://cdn.clicks.co.za/product/medium/biogen-omega-3-fish-oil-1000mg-90s.jpg',
    category: 'Supplements',
    inStock: true,
    rating: 4.6,
    reviews: 145,
    description: 'Premium fish oil for heart and brain health support',
  },
  {
    id: '6',
    name: 'Oral-B Electric Toothbrush',
    brand: 'Oral-B',
    price: 599.99,
    originalPrice: 699.99,
    image: 'https://cdn.clicks.co.za/product/medium/oral-b-pro-1000-electric-toothbrush.jpg',
    category: 'Oral Care',
    inStock: true,
    rating: 4.4,
    reviews: 87,
    description: 'Advanced cleaning with pressure sensor technology',
  },
  {
    id: '7',
    name: 'Probiotics',
    brand: 'Bioplus',
    packSize: '30 Capsules',
    price: 199.99,
    image: 'https://cdn.clicks.co.za/product/medium/bioplus-probiotic-capsules-30s.jpg',
    category: 'Digestive',
    inStock: true,
    rating: 4.3,
    reviews: 67,
    description: 'Support digestive health with beneficial bacteria',
  },
  {
    id: '8',
    name: 'Nivea Men Face Wash',
    brand: 'Nivea',
    packSize: '150ml',
    price: 54.99,
    originalPrice: 64.99,
    image: 'https://cdn.clicks.co.za/product/medium/nivea-men-deep-cleansing-face-wash-150ml.jpg',
    category: 'Skincare',
    inStock: true,
    rating: 4.1,
    reviews: 112,
    description: 'Deep cleansing face wash for men\'s skin care',
  },
  {
    id: '9',
    name: 'Strepsils Throat Lozenges',
    brand: 'Strepsils',
    packSize: '24 Lozenges',
    price: 32.99,
    image: 'https://cdn.clicks.co.za/product/medium/strepsils-original-lozenges-24s.jpg',
    category: 'Cold & Flu',
    inStock: true,
    rating: 4.5,
    reviews: 203,
    description: 'Fast relief for sore throats and mouth infections',
  },
  {
    id: '10',
    name: 'Voltaren Gel',
    brand: 'Voltaren',
    packSize: '50g',
    price: 129.99,
    originalPrice: 149.99,
    image: 'https://cdn.clicks.co.za/product/medium/voltaren-emulgel-50g.jpg',
    category: 'Pain Relief',
    inStock: true,
    rating: 4.6,
    reviews: 156,
    description: 'Topical anti-inflammatory gel for muscle and joint pain',
  },
];

const categories = ['All', 'Pain Relief', 'Vitamins', 'Prescription', 'Skincare', 'Oral Care', 'Allergy'];

export default function PharmacyStoreScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const params = useLocalSearchParams();
  const pharmacyId = params.id as string || 'clicks';
  
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchText, setSearchText] = useState('');
  const [cartItems, setCartItems] = useState<string[]>([]);

  const pharmacy = PHARMACY_DATA[pharmacyId];
  
  const filteredProducts = SAMPLE_PRODUCTS.filter(product => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchText.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchText.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (productId: string) => {
    setCartItems(prev => [...prev, productId]);
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prev => prev.filter(id => id !== productId));
  };

  // Helper function to get category icon
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'pain relief': return '💊';
      case 'vitamins': return '🌟';
      case 'skincare': return '🧴';
      case 'allergy': return '💊';
      case 'supplements': return '💪';
      case 'oral care': return '🦷';
      case 'digestive': return '🌿';
      case 'cold & flu': return '🤧';
      default: return '💊';
    }
  };

  const renderProduct = ({ item: product, index }: { item: Product; index: number }) => {
    const isInCart = cartItems.includes(product.id);
    
    return (
      <Animated.View
        entering={FadeInDown.delay(50 * index)}
        style={[styles.productCard, { backgroundColor: theme.colors.surface }]}
      >
        <View style={styles.productImageContainer}>
          <View style={[styles.productImageWrapper, { backgroundColor: `${pharmacy.primaryColor}10` }]}>
            <Text style={styles.productEmoji}>{getCategoryIcon(product.category)}</Text>
          </View>
          {product.originalPrice && (
            <View style={[styles.discountBadge, { backgroundColor: pharmacy.primaryColor }]}>
              <Text style={styles.discountText}>
                -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
              </Text>
            </View>
          )}
          {product.prescription && (
            <View style={[styles.prescriptionBadge, { backgroundColor: '#FF6B35' }]}>
              <Ionicons name="medical" size={12} color="#FFFFFF" />
            </View>
          )}
        </View>

        <View style={styles.productInfo}>
          <Text style={[styles.productName, { color: theme.colors.textPrimary }]} numberOfLines={2}>
            {product.name}
          </Text>
          {product.brand && (
            <Text style={[styles.productBrand, { color: theme.colors.textSecondary }]}>
              {product.brand}
            </Text>
          )}
          {(product.strength || product.packSize) && (
            <Text style={[styles.productDetails, { color: theme.colors.textSecondary }]}>
              {[product.strength, product.packSize].filter(Boolean).join(' • ')}
            </Text>
          )}
          
          <Text style={[styles.productDescription, { color: theme.colors.textSecondary }]} numberOfLines={2}>
            {product.description}
          </Text>

          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={[styles.ratingText, { color: theme.colors.textPrimary }]}>
              {product.rating}
            </Text>
            <Text style={[styles.reviewText, { color: theme.colors.textSecondary }]}>
              ({product.reviews})
            </Text>
          </View>

          <View style={styles.priceRow}>
            <View style={styles.priceContainer}>
              <Text style={[styles.price, { color: pharmacy.primaryColor }]}>
                R{product.price.toFixed(2)}
              </Text>
              {product.originalPrice && (
                <Text style={[styles.originalPrice, { color: theme.colors.textSecondary }]}>
                  R{product.originalPrice.toFixed(2)}
                </Text>
              )}
            </View>

            <TouchableOpacity
              style={[
                styles.addButton,
                {
                  backgroundColor: product.inStock 
                    ? (isInCart ? '#10B981' : pharmacy.primaryColor)
                    : theme.colors.textSecondary
                }
              ]}
              onPress={() => product.inStock && (isInCart ? removeFromCart(product.id) : addToCart(product.id))}
              disabled={!product.inStock}
            >
              <Ionicons
                name={isInCart ? "checkmark" : "add"}
                size={18}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>

          {!product.inStock && (
            <Text style={[styles.outOfStockText, { color: '#EF4444' }]}>
              Out of Stock
            </Text>
          )}
        </View>
      </Animated.View>
    );
  };

  if (!pharmacy) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StandardHeader title="Pharmacy Not Found" showBackButton />
        <View style={styles.centeredContent}>
          <Text style={[styles.errorText, { color: theme.colors.textPrimary }]}>
            Pharmacy not found
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} />
      
      <StandardHeader
        title={pharmacy.name}
        showBackButton
        onBackPress={() => router.back()}
        rightComponent={
          <TouchableOpacity>
            <View style={styles.cartIconContainer}>
              <Ionicons name="cart" size={24} color={theme.colors.textPrimary} />
              {cartItems.length > 0 && (
                <View style={[styles.cartBadge, { backgroundColor: pharmacy.primaryColor }]}>
                  <Text style={styles.cartBadgeText}>{cartItems.length}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Pharmacy Info Header */}
        <Animated.View entering={FadeInUp} style={[styles.pharmacyHeader, { backgroundColor: theme.colors.surface }]}>
          <LinearGradient
            colors={[`${pharmacy.primaryColor}15`, `${pharmacy.primaryColor}05`]}
            style={styles.pharmacyHeaderGradient}
          >
            <View style={styles.pharmacyHeaderContent}>
              <View style={[styles.pharmacyLogoLarge, { backgroundColor: `${pharmacy.primaryColor}20` }]}>
                <Image source={pharmacy.logo} style={styles.pharmacyLogoImage} resizeMode="contain" />
              </View>
              
              <View style={styles.pharmacyHeaderInfo}>
                <Text style={[styles.pharmacyTitle, { color: theme.colors.textPrimary }]}>
                  {pharmacy.name}
                </Text>
                <Text style={[styles.pharmacySubtitle, { color: theme.colors.textSecondary }]}>
                  {pharmacy.description}
                </Text>
                
                <View style={styles.pharmacyStats}>
                  <View style={styles.statItem}>
                    <Ionicons name="star" size={16} color="#FFD700" />
                    <Text style={[styles.statText, { color: theme.colors.textPrimary }]}>
                      {pharmacy.rating}
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Ionicons name="time" size={16} color={theme.colors.textSecondary} />
                    <Text style={[styles.statText, { color: theme.colors.textSecondary }]}>
                      {pharmacy.deliveryTime}
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Ionicons name="bicycle" size={16} color={theme.colors.textSecondary} />
                    <Text style={[styles.statText, { color: theme.colors.textSecondary }]}>
                      {pharmacy.deliveryFee}
                    </Text>
                  </View>
                </View>

                <View style={[
                  styles.statusContainer,
                  { backgroundColor: pharmacy.isOpen ? '#10B981' : '#EF4444' }
                ]}>
                  <Ionicons
                    name={pharmacy.isOpen ? "checkmark-circle" : "close-circle"}
                    size={16}
                    color="#FFFFFF"
                  />
                  <Text style={styles.statusText}>
                    {pharmacy.isOpen ? `Open until ${pharmacy.hours.split(' - ')[1]}` : 'Closed'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Services */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.servicesContainer}>
              {pharmacy.services.map((service, index) => (
                <View key={index} style={[styles.serviceTag, { backgroundColor: `${pharmacy.primaryColor}15` }]}>
                  <Text style={[styles.serviceText, { color: pharmacy.primaryColor }]}>
                    {service}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </LinearGradient>
        </Animated.View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
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
        </View>

        {/* Category Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                {
                  backgroundColor: selectedCategory === category ? pharmacy.primaryColor : theme.colors.surface,
                  borderColor: theme.colors.border,
                }
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.categoryText,
                  {
                    color: selectedCategory === category ? '#FFFFFF' : theme.colors.textPrimary,
                  }
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Products Grid */}
        <View style={styles.productsContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            Products ({filteredProducts.length})
          </Text>
          
          <FlatList
            data={filteredProducts}
            keyExtractor={(item) => item.id}
            renderItem={renderProduct}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={styles.productRow}
            contentContainerStyle={styles.productsGrid}
          />
        </View>
      </ScrollView>

      {/* Cart Summary */}
      {cartItems.length > 0 && (
        <Animated.View
          entering={FadeInUp}
          style={[styles.cartSummary, { backgroundColor: pharmacy.primaryColor }]}
        >
          <View style={styles.cartSummaryContent}>
            <View>
              <Text style={styles.cartSummaryTitle}>
                {cartItems.length} item{cartItems.length > 1 ? 's' : ''} in cart
              </Text>
              <Text style={styles.cartSummarySubtitle}>
                Ready for checkout
              </Text>
            </View>
            <TouchableOpacity style={styles.checkoutButton}>
              <Text style={styles.checkoutButtonText}>View Cart</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
  },
  pharmacyHeader: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  pharmacyHeaderGradient: {
    padding: 20,
  },
  pharmacyHeaderContent: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  pharmacyLogoLarge: {
    width: 80,
    height: 80,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  pharmacyLogoImage: {
    width: 50,
    height: 50,
  },
  pharmacyHeaderInfo: {
    flex: 1,
  },
  pharmacyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  pharmacySubtitle: {
    fontSize: 14,
    marginBottom: 12,
  },
  pharmacyStats: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    fontSize: 14,
    marginLeft: 4,
    fontWeight: '600',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  servicesContainer: {
    marginTop: 8,
  },
  serviceTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  serviceText: {
    fontSize: 12,
    fontWeight: '600',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  categoryContainer: {
    paddingHorizontal: 20,
    marginTop: 16,
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
  productsContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  productsGrid: {
    paddingBottom: 20,
  },
  productRow: {
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  productImageContainer: {
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  productEmoji: {
    fontSize: 32,
    textAlign: 'center',
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginBottom: 8,
  },
  productImageWrapper: {
    width: 80,
    height: 80,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  imageFallback: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 8,
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
  prescriptionBadge: {
    position: 'absolute',
    top: -5,
    left: -5,
    padding: 4,
    borderRadius: 8,
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
  productBrand: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  productDetails: {
    fontSize: 11,
    marginBottom: 4,
    fontStyle: 'italic',
  },
  productDescription: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
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
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceContainer: {
    flex: 1,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  originalPrice: {
    fontSize: 12,
    textDecorationLine: 'line-through',
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outOfStockText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
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
  cartSummary: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32,
  },
  cartSummaryContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cartSummaryTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cartSummarySubtitle: {
    color: '#FFFFFF',
    fontSize: 12,
    opacity: 0.8,
  },
  checkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  checkoutButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
});
