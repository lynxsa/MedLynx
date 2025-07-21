import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    FlatList,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { StandardHeader } from '../../components/StandardHeader';
import { useTheme } from '../../contexts/ThemeContext';

interface Offer {
  id: string;
  title: string;
  description: string;
  originalPrice: number;
  salePrice: number;
  discount: number;
  image: string;
  validUntil: string;
  pharmacy: string;
  pharmacyColor: string;
  category: string;
  featured: boolean;
  stock: number;
}

const SPECIAL_OFFERS: Offer[] = [
  {
    id: '1',
    title: 'Panado Extra 24s Twin Pack',
    description: 'Buy one get one free on all Panado products',
    originalPrice: 89.98,
    salePrice: 44.99,
    discount: 50,
    image: '💊',
    validUntil: '2024-07-31',
    pharmacy: 'Clicks',
    pharmacyColor: '#E60012',
    category: 'Pain Relief',
    featured: true,
    stock: 45,
  },
  {
    id: '2',
    title: 'Vitamin D3 1000IU 3-Month Supply',
    description: '30% off all vitamin supplements this month',
    originalPrice: 299.99,
    salePrice: 209.99,
    discount: 30,
    image: '🟡',
    validUntil: '2024-07-25',
    pharmacy: 'Dis-Chem',
    pharmacyColor: '#00A651',
    category: 'Vitamins',
    featured: true,
    stock: 78,
  },
  {
    id: '3',
    title: 'Nivea Skincare Bundle',
    description: 'Complete skincare routine at unbeatable price',
    originalPrice: 249.99,
    salePrice: 149.99,
    discount: 40,
    image: '🧴',
    validUntil: '2024-08-05',
    pharmacy: 'Clicks',
    pharmacyColor: '#E60012',
    category: 'Skincare',
    featured: true,
    stock: 23,
  },
  {
    id: '4',
    title: 'Omega-3 Fish Oil Capsules',
    description: 'Heart health support with premium quality',
    originalPrice: 189.99,
    salePrice: 132.99,
    discount: 30,
    image: '🐟',
    validUntil: '2024-07-28',
    pharmacy: 'Medirite',
    pharmacyColor: '#0066CC',
    category: 'Supplements',
    featured: false,
    stock: 92,
  },
  {
    id: '5',
    title: 'Baby Care Essentials Kit',
    description: 'Everything you need for your little one',
    originalPrice: 399.99,
    salePrice: 279.99,
    discount: 30,
    image: '👶',
    validUntil: '2024-08-10',
    pharmacy: 'Clicks',
    pharmacyColor: '#E60012',
    category: 'Baby Care',
    featured: false,
    stock: 34,
  },
  {
    id: '6',
    title: 'Oral-B Electric Toothbrush Pro',
    description: 'Advanced cleaning technology for healthier teeth',
    originalPrice: 799.99,
    salePrice: 499.99,
    discount: 38,
    image: '🪥',
    validUntil: '2024-07-30',
    pharmacy: 'Dis-Chem',
    pharmacyColor: '#00A651',
    category: 'Oral Care',
    featured: true,
    stock: 15,
  },
  {
    id: '7',
    title: 'First Aid Emergency Kit',
    description: 'Comprehensive first aid supplies for home',
    originalPrice: 159.99,
    salePrice: 95.99,
    discount: 40,
    image: '🩹',
    validUntil: '2024-08-15',
    pharmacy: 'Medirite',
    pharmacyColor: '#0066CC',
    category: 'First Aid',
    featured: false,
    stock: 67,
  },
  {
    id: '8',
    title: 'Allergy Relief Combo Pack',
    description: 'Antihistamines for seasonal allergy relief',
    originalPrice: 129.99,
    salePrice: 84.99,
    discount: 35,
    image: '🌸',
    validUntil: '2024-07-26',
    pharmacy: 'Mopani',
    pharmacyColor: '#FF6B35',
    category: 'Allergy',
    featured: false,
    stock: 56,
  },
];

const categories = ['All', 'Pain Relief', 'Vitamins', 'Skincare', 'Supplements', 'Baby Care', 'Oral Care', 'First Aid', 'Allergy'];

export default function SpecialOffersScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);

  const filteredOffers = SPECIAL_OFFERS.filter(offer => {
    const matchesSearch = offer.title.toLowerCase().includes(searchText.toLowerCase()) ||
                         offer.description.toLowerCase().includes(searchText.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || offer.category === selectedCategory;
    const matchesFeatured = !showFeaturedOnly || offer.featured;
    return matchesSearch && matchesCategory && matchesFeatured;
  });

  const getDaysLeft = (validUntil: string) => {
    const today = new Date();
    const expiryDate = new Date(validUntil);
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const renderOffer = ({ item: offer, index }: { item: Offer; index: number }) => {
    const daysLeft = getDaysLeft(offer.validUntil);
    
    return (
      <Animated.View
        entering={FadeInDown.delay(50 * index)}
        style={[styles.offerCard, { backgroundColor: theme.colors.surface }]}
      >
        <TouchableOpacity
          style={styles.offerCardContent}
          onPress={() => {
            // Navigate to product details or pharmacy store
            // router.push(`/pharmacy-store?id=${offer.pharmacy.toLowerCase()}` as any);
          }}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[`${offer.pharmacyColor}10`, `${offer.pharmacyColor}05`]}
            style={styles.offerGradient}
          >
            <View style={styles.offerHeader}>
              <View style={styles.offerImageContainer}>
                <Text style={styles.offerEmoji}>{offer.image}</Text>
                <View style={[styles.discountBadge, { backgroundColor: '#FF6B35' }]}>
                  <Text style={styles.discountText}>-{offer.discount}%</Text>
                </View>
                {offer.featured && (
                  <View style={[styles.featuredBadge, { backgroundColor: '#FFD700' }]}>
                    <Ionicons name="star" size={12} color="#FFFFFF" />
                  </View>
                )}
              </View>

              <View style={styles.offerInfo}>
                <Text style={[styles.offerTitle, { color: theme.colors.textPrimary }]} numberOfLines={2}>
                  {offer.title}
                </Text>
                <Text style={[styles.offerDescription, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                  {offer.description}
                </Text>

                <View style={styles.priceContainer}>
                  <Text style={[styles.salePrice, { color: offer.pharmacyColor }]}>
                    R{offer.salePrice.toFixed(2)}
                  </Text>
                  <Text style={[styles.originalPrice, { color: theme.colors.textSecondary }]}>
                    R{offer.originalPrice.toFixed(2)}
                  </Text>
                  <Text style={[styles.savings, { color: '#10B981' }]}>
                    Save R{(offer.originalPrice - offer.salePrice).toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.offerFooter}>
              <View style={styles.pharmacyInfo}>
                <Ionicons name="storefront" size={14} color={offer.pharmacyColor} />
                <Text style={[styles.pharmacyName, { color: offer.pharmacyColor }]}>
                  {offer.pharmacy}
                </Text>
              </View>

              <View style={styles.validityInfo}>
                <Ionicons 
                  name="time" 
                  size={14} 
                  color={daysLeft <= 3 ? '#EF4444' : theme.colors.textSecondary} 
                />
                <Text style={[
                  styles.validityText, 
                  { color: daysLeft <= 3 ? '#EF4444' : theme.colors.textSecondary }
                ]}>
                  {daysLeft <= 0 ? 'Expired' : `${daysLeft} day${daysLeft > 1 ? 's' : ''} left`}
                </Text>
              </View>

              <View style={styles.stockInfo}>
                <Ionicons 
                  name="cube" 
                  size={14} 
                  color={offer.stock < 20 ? '#FF6B35' : theme.colors.textSecondary} 
                />
                <Text style={[
                  styles.stockText,
                  { color: offer.stock < 20 ? '#FF6B35' : theme.colors.textSecondary }
                ]}>
                  {offer.stock} left
                </Text>
              </View>
            </View>

            <TouchableOpacity style={[styles.claimButton, { backgroundColor: offer.pharmacyColor }]}>
              <Text style={styles.claimButtonText}>Claim Offer</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} />
      
      <StandardHeader
        title="Special Offers"
        subtitle="Limited time deals & discounts"
        showBackButton
        onBackPress={() => router.back()}
        rightComponent={
          <TouchableOpacity onPress={() => setShowFeaturedOnly(!showFeaturedOnly)}>
            <Ionicons 
              name={showFeaturedOnly ? "star" : "star-outline"} 
              size={24} 
              color={showFeaturedOnly ? "#FFD700" : theme.colors.textPrimary} 
            />
          </TouchableOpacity>
        }
      />

      {/* Search and Filters */}
      <View style={styles.searchSection}>
        <View style={[styles.searchBar, { backgroundColor: theme.colors.surface }]}>
          <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.textPrimary }]}
            placeholder="Search offers..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        {/* Category Filter */}
        <FlatList
          data={categories}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item: category }) => (
            <TouchableOpacity
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
          )}
          contentContainerStyle={styles.categoryContainer}
        />

        <View style={styles.resultInfo}>
          <Text style={[styles.resultCount, { color: theme.colors.textPrimary }]}>
            {filteredOffers.length} offer{filteredOffers.length > 1 ? 's' : ''} found
          </Text>
          {showFeaturedOnly && (
            <Text style={[styles.filterNote, { color: theme.colors.textSecondary }]}>
              Showing featured offers only
            </Text>
          )}
        </View>
      </View>

      {/* Offers List */}
      <FlatList
        data={filteredOffers}
        keyExtractor={(item) => item.id}
        renderItem={renderOffer}
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
  categoryContainer: {
    paddingRight: 20,
    marginBottom: 12,
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
  resultInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultCount: {
    fontSize: 16,
    fontWeight: '600',
  },
  filterNote: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  offerCard: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  offerCardContent: {
    flex: 1,
  },
  offerGradient: {
    padding: 20,
  },
  offerHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  offerImageContainer: {
    alignItems: 'center',
    marginRight: 16,
    position: 'relative',
  },
  offerEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  discountBadge: {
    position: 'absolute',
    top: -5,
    right: -10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  featuredBadge: {
    position: 'absolute',
    bottom: 0,
    left: -5,
    padding: 4,
    borderRadius: 8,
  },
  offerInfo: {
    flex: 1,
  },
  offerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  offerDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  salePrice: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  originalPrice: {
    fontSize: 16,
    textDecorationLine: 'line-through',
  },
  savings: {
    fontSize: 14,
    fontWeight: '600',
  },
  offerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  pharmacyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pharmacyName: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  validityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  validityText: {
    fontSize: 12,
    marginLeft: 4,
  },
  stockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockText: {
    fontSize: 12,
    marginLeft: 4,
  },
  claimButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  claimButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
});
