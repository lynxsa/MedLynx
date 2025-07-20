import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
    Dimensions,
    Image,
    ImageSourcePropType,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { StandardHeader } from '../../components/StandardHeader';

const { width } = Dimensions.get('window');

// Types
interface Pharmacy {
  id: string;
  name: string;
  logo: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: string;
  color: string;
}

interface Medication {
  id: string;
  name: string;
  genericName: string;
  price: number;
  originalPrice?: number;
  dosage: string;
  quantity: string;
  prescription: boolean;
  image: string;
  pharmacy: string;
  inStock: boolean;
  discount?: number;
}

// South African Pharmacy Data
const southAfricanPharmacies: Pharmacy[] = [
  {
    id: 'clicks',
    name: 'Clicks',
    logo: '🏥',
    rating: 4.5,
    deliveryTime: '30-45 min',
    deliveryFee: 'R35',
    color: '#FF6B6B',
  },
  {
    id: 'dischem',
    name: 'Dis-Chem',
    logo: '💊',
    rating: 4.6,
    deliveryTime: '25-40 min',
    deliveryFee: 'R25',
    color: '#4ECDC4',
  },
  {
    id: 'medirite',
    name: 'Medirite',
    logo: '🩺',
    rating: 4.3,
    deliveryTime: '35-50 min',
    deliveryFee: 'R30',
    color: '#45B7D1',
  },
  {
    id: 'mopani',
    name: 'Mopani Pharmacy',
    logo: '🌿',
    rating: 4.4,
    deliveryTime: '40-60 min',
    deliveryFee: 'R40',
    color: '#96CEB4',
  },
];

const featuredMedications: Medication[] = [
  {
    id: '1',
    name: 'Panado',
    genericName: 'Paracetamol',
    price: 25.99,
    originalPrice: 32.99,
    dosage: '500mg',
    quantity: '20 tablets',
    prescription: false,
    image: '💊',
    pharmacy: 'Clicks',
    inStock: true,
    discount: 20,
  },
  {
    id: '2',
    name: 'Betadine',
    genericName: 'Povidone Iodine',
    price: 89.99,
    originalPrice: 105.99,
    dosage: '10%',
    quantity: '125ml',
    prescription: false,
    image: '🧴',
    pharmacy: 'Dis-Chem',
    inStock: true,
    discount: 15,
  },
  {
    id: '3',
    name: 'Voltaren Gel',
    genericName: 'Diclofenac',
    price: 156.99,
    originalPrice: 189.99,
    dosage: '1%',
    quantity: '100g',
    prescription: false,
    image: '🧴',
    pharmacy: 'Medirite',
    inStock: true,
    discount: 17,
  },
  {
    id: '4',
    name: 'Allergex',
    genericName: 'Chlorpheniramine',
    price: 45.99,
    dosage: '4mg',
    quantity: '30 tablets',
    prescription: false,
    image: '💊',
    pharmacy: 'Mopani Pharmacy',
    inStock: true,
  },
];

// Updated promotional offers interface to match home screen style
interface PromotionalOffer {
  id: string;
  title: string;
  subtitle: string;
  discount: string;
  originalPrice?: string;
  discountedPrice: string;
  pharmacy: string;
  image: ImageSourcePropType;
  backgroundColor: string;
}

const promotionalOffers: PromotionalOffer[] = [
  {
    id: '1',
    title: 'Flu Vaccination Special',
    subtitle: 'Get protected this flu season',
    discount: '30% OFF',
    originalPrice: 'R299',
    discountedPrice: 'R199',
    pharmacy: 'Clicks Pharmacy',
    image: require('../../assets/images/MedLynx-10.jpeg'),
    backgroundColor: '#7C3AED',
  },
  {
    id: '2',
    title: 'Free Health Screening',
    subtitle: 'Blood pressure & glucose check',
    discount: 'FREE',
    discountedPrice: 'R0',
    pharmacy: 'Dis-Chem',
    image: require('../../assets/images/MedLynx-15.jpeg'),
    backgroundColor: '#8B5CF6',
  },
  {
    id: '3',
    title: 'Vitamin Bundle Pack',
    subtitle: 'Complete daily nutrition',
    discount: '25% OFF',
    originalPrice: 'R450',
    discountedPrice: 'R339',
    pharmacy: 'Medirite',
    image: require('../../assets/images/MedLynx-16.jpeg'),
    backgroundColor: '#A855F7',
  },
];

export default function CareHub() {
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPharmacy, setSelectedPharmacy] = useState('all');
  const [cart, setCart] = useState<string[]>([]);  const categories = [
    { id: 'all', name: 'All', icon: '🏪' },
    { id: 'pain', name: 'Pain Relief', icon: '💊' },
    { id: 'vitamins', name: 'Vitamins', icon: '🌟' },
    { id: 'skincare', name: 'Skincare', icon: '✨' },
    { id: 'prescription', name: 'Prescription', icon: '📋' },
  ];

  const addToCart = (medicationId: string) => {
    setCart(prev => [...prev, medicationId]);
  };

  const removeFromCart = (medicationId: string) => {
    setCart(prev => prev.filter(id => id !== medicationId));
  };

  const isInCart = (medicationId: string) => cart.includes(medicationId);

  return (
    <View style={styles.container}>
      <StandardHeader
        title="CareHub"
        subtitle="Your trusted pharmacy marketplace"
        showLogo={true}
        rightComponent={
          <TouchableOpacity style={styles.cartButton}>
            <Ionicons name="cart-outline" size={24} color="#3726a6" />
            {cart.length > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cart.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={20} color="#a096e7" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search medications, brands, or symptoms"
              placeholderTextColor="#a096e7"
              value={searchText}
              onChangeText={setSearchText}
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => setSearchText('')}>
                <Ionicons name="close-circle" size={20} color="#a096e7" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Promotional Banners - Updated to match home screen style */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Special Offers</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.promoScroll}
            contentContainerStyle={styles.promoScrollContent}
          >
            {promotionalOffers.map((offer) => (
              <TouchableOpacity key={offer.id} style={styles.promoCard}>
                <View style={styles.promoCardContainer}>
                  <Image 
                    source={offer.image} 
                    style={styles.promoCardImage}
                    resizeMode="cover"
                  />
                  <LinearGradient
                    colors={[offer.backgroundColor + 'DD', 'transparent']}
                    style={styles.promoCardGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <View style={styles.promoCardContent}>
                      <View style={styles.promoBadge}>
                        <Text style={styles.promoBadgeText}>{offer.discount}</Text>
                      </View>
                      <View style={styles.promoCardText}>
                        <Text style={styles.promoTitle}>{offer.title}</Text>
                        <Text style={styles.promoSubtitle}>{offer.subtitle}</Text>
                        <Text style={styles.promoPharmacy}>{offer.pharmacy}</Text>
                        <View style={styles.promoPriceContainer}>
                          {offer.originalPrice && (
                            <Text style={styles.promoOriginalPrice}>{offer.originalPrice}</Text>
                          )}
                          <Text style={styles.promoDiscountedPrice}>{offer.discountedPrice}</Text>
                        </View>
                      </View>
                    </View>
                  </LinearGradient>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryCard,
                  selectedCategory === category.id && styles.categoryCardActive
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text style={[
                  styles.categoryName,
                  selectedCategory === category.id && styles.categoryNameActive
                ]}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Partner Pharmacies */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Partner Pharmacies</Text>
          <View style={styles.pharmaciesGrid}>
            {southAfricanPharmacies.map((pharmacy) => (
              <TouchableOpacity key={pharmacy.id} style={styles.pharmacyCard}>
                <View style={[styles.pharmacyLogo, { backgroundColor: `${pharmacy.color}20` }]}>
                  <Text style={styles.pharmacyLogoText}>{pharmacy.logo}</Text>
                </View>
                <View style={styles.pharmacyInfo}>
                  <Text style={styles.pharmacyName}>{pharmacy.name}</Text>
                  <View style={styles.pharmacyDetails}>
                    <View style={styles.ratingContainer}>
                      <Ionicons name="star" size={14} color="#FFD700" />
                      <Text style={styles.pharmacyRating}>{pharmacy.rating}</Text>
                    </View>
                    <Text style={styles.deliveryTime}>• {pharmacy.deliveryTime}</Text>
                  </View>
                  <Text style={styles.deliveryFee}>Delivery: {pharmacy.deliveryFee}</Text>
                </View>
                <TouchableOpacity style={[styles.shopButton, { backgroundColor: pharmacy.color }]}>
                  <Text style={styles.shopButtonText}>Shop</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Featured Products */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Featured Products</Text>
          <View style={styles.medicationsGrid}>
            {featuredMedications.map((medication) => (
              <TouchableOpacity key={medication.id} style={styles.medicationCard}>
                <View style={styles.medicationImageContainer}>
                  <Text style={styles.medicationImage}>{medication.image}</Text>
                  {medication.discount && (
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountText}>{medication.discount}% OFF</Text>
                    </View>
                  )}
                </View>
                
                <View style={styles.medicationInfo}>
                  <Text style={styles.medicationName}>{medication.name}</Text>
                  <Text style={styles.medicationGeneric}>{medication.genericName}</Text>
                  <Text style={styles.medicationDosage}>{medication.dosage} • {medication.quantity}</Text>
                  
                  <View style={styles.priceContainer}>
                    <Text style={styles.currentPrice}>R{medication.price.toFixed(2)}</Text>
                    {medication.originalPrice && (
                      <Text style={styles.originalPrice}>R{medication.originalPrice.toFixed(2)}</Text>
                    )}
                  </View>
                  
                  <Text style={styles.pharmacyBadge}>{medication.pharmacy}</Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.addToCartButton,
                    isInCart(medication.id) && styles.addToCartButtonActive
                  ]}
                  onPress={() => 
                    isInCart(medication.id) 
                      ? removeFromCart(medication.id) 
                      : addToCart(medication.id)
                  }
                >
                  <Ionicons 
                    name={isInCart(medication.id) ? "checkmark" : "add"} 
                    size={18} 
                    color={isInCart(medication.id) ? "#FFFFFF" : "#3726a6"} 
                  />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity style={styles.quickActionCard}>
              <Ionicons name="scan-outline" size={24} color="#3726a6" />
              <Text style={styles.quickActionText}>Scan Prescription</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionCard}>
              <Ionicons name="repeat-outline" size={24} color="#3726a6" />
              <Text style={styles.quickActionText}>Refill Order</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionCard}>
              <Ionicons name="heart-outline" size={24} color="#3726a6" />
              <Text style={styles.quickActionText}>Wishlist</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionCard}>
              <Ionicons name="help-circle-outline" size={24} color="#3726a6" />
              <Text style={styles.quickActionText}>Help</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  cartButton: {
    position: 'relative',
    padding: 8,
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FF4757',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#333333',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  promoScroll: {
    paddingLeft: 20,
  },
  promoScrollContent: {
    paddingRight: 20,
  },
  promoCard: {
    width: 280,
    height: 160,
    marginRight: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  promoCardContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    overflow: 'hidden',
  },
  promoCardImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    borderRadius: 16,
  },
  promoCardGradient: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  promoCardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  promoBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 8,
  },
  promoBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  promoCardText: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  promoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  promoSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 2,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  promoPharmacy: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  promoPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  promoOriginalPrice: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    textDecorationLine: 'line-through',
    marginRight: 8,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  promoDiscountedPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  categoryScroll: {
    paddingLeft: 20,
  },
  categoryCard: {
    marginRight: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    minWidth: 80,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  categoryCardActive: {
    backgroundColor: '#3726a6',
    borderColor: '#3726a6',
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
    textAlign: 'center',
  },
  categoryNameActive: {
    color: '#FFFFFF',
  },
  pharmaciesGrid: {
    paddingHorizontal: 20,
  },
  pharmacyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  pharmacyLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  pharmacyLogoText: {
    fontSize: 24,
  },
  pharmacyInfo: {
    flex: 1,
  },
  pharmacyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  pharmacyDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pharmacyRating: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 4,
  },
  deliveryTime: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 4,
  },
  deliveryFee: {
    fontSize: 12,
    color: '#a096e7',
    fontWeight: '600',
  },
  shopButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  shopButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  medicationsGrid: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  medicationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    width: (width - 52) / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  medicationImageContainer: {
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  medicationImage: {
    fontSize: 48,
  },
  discountBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FF4757',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 2,
  },
  medicationGeneric: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  medicationDosage: {
    fontSize: 11,
    color: '#a096e7',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  currentPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3726a6',
  },
  originalPrice: {
    fontSize: 12,
    color: '#999999',
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },
  pharmacyBadge: {
    fontSize: 10,
    color: '#a096e7',
    fontWeight: '600',
    marginBottom: 8,
  },
  addToCartButton: {
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  addToCartButtonActive: {
    backgroundColor: '#3726a6',
    borderColor: '#3726a6',
  },
  quickActionsGrid: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: (width - 56) / 2,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  quickActionText: {
    fontSize: 12,
    color: '#3726a6',
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
});

