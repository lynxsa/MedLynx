import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
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
import Animated, { FadeInDown } from 'react-native-reanimated';
import { StandardHeader } from '../../components/StandardHeader';
import { useTheme } from '../../contexts/ThemeContext';

interface Pharmacy {
  id: string;
  name: string;
  logo: ImageSourcePropType;
  rating: number;
  deliveryTime: string;
  deliveryFee: string;
  color: string;
  description: string;
  established: string;
  branches: number;
  distance: string;
  specialties: string[];
  isOpen: boolean;
  address: string;
}

// Extended pharmacy data with location-based sorting
const ALL_PHARMACIES: Pharmacy[] = [
  {
    id: 'clicks',
    name: 'Clicks',
    logo: require('../../assets/images/pharmacies/Clicks_(South_Africa)_Logo.svg.png'),
    rating: 4.5,
    deliveryTime: '30-45 min',
    deliveryFee: 'R35',
    color: '#E60012',
    description: 'South Africa\'s leading pharmacy and health retailer',
    established: '1968',
    branches: 850,
    distance: '0.8km',
    specialties: ['Prescription Medicines', 'Health & Beauty', 'Baby Care'],
    isOpen: true,
    address: 'Shop 12, Sandton City Mall',
  },
  {
    id: 'dischem',
    name: 'Dis-Chem',
    logo: require('../../assets/images/pharmacies/Dischem_Logo.png'),
    rating: 4.6,
    deliveryTime: '25-40 min',
    deliveryFee: 'R25',
    color: '#00A651',
    description: 'Your first choice for health, beauty and wellness',
    established: '1978',
    branches: 180,
    distance: '1.2km',
    specialties: ['Prescription Medicines', 'Vitamins & Supplements', 'Sports Nutrition'],
    isOpen: true,
    address: 'Rosebank Mall, Upper Level',
  },
  {
    id: 'medirite',
    name: 'Medirite',
    logo: require('../../assets/images/pharmacies/Medirite.png'),
    rating: 4.3,
    deliveryTime: '35-50 min',
    deliveryFee: 'R30',
    color: '#0066CC',
    description: 'Quality healthcare and wellness products',
    established: '1995',
    branches: 65,
    distance: '2.1km',
    specialties: ['Chronic Medication', 'Medical Devices', 'Home Care'],
    isOpen: false,
    address: '45 Rivonia Road, Sandhurst',
  },
  {
    id: 'mopani',
    name: 'Mopani Pharmacy',
    logo: require('../../assets/images/pharmacies/Mopani_Online_Logo_165x_2x.png'),
    rating: 4.4,
    deliveryTime: '40-60 min',
    deliveryFee: 'R40',
    color: '#FF6B35',
    description: 'Dedicated to providing quality pharmaceutical care',
    established: '2005',
    branches: 25,
    distance: '2.8km',
    specialties: ['Online Prescriptions', 'Home Delivery', 'Consultation'],
    isOpen: true,
    address: 'Melrose Arch Shopping Centre',
  },
  {
    id: 'morningside',
    name: 'Morningside Dispensary',
    logo: require('../../assets/images/pharmacies/Morningside-Dispensary-Logo (1).png'),
    rating: 4.7,
    deliveryTime: '20-35 min',
    deliveryFee: 'R20',
    color: '#2E8B57',
    description: 'Community-focused pharmacy with personalized care',
    established: '1985',
    branches: 8,
    distance: '3.2km',
    specialties: ['Compounding', 'Vaccinations', 'Health Screening'],
    isOpen: true,
    address: 'Morningside Shopping Centre',
  },
];

export default function AllPharmaciesScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'delivery'>('distance');
  const [filterOpen, setFilterOpen] = useState(false);

  const filteredPharmacies = ALL_PHARMACIES.filter(pharmacy =>
    pharmacy.name.toLowerCase().includes(searchText.toLowerCase()) ||
    pharmacy.description.toLowerCase().includes(searchText.toLowerCase()) ||
    pharmacy.specialties.some(specialty => 
      specialty.toLowerCase().includes(searchText.toLowerCase())
    )
  ).sort((a, b) => {
    switch (sortBy) {
      case 'distance':
        return parseFloat(a.distance) - parseFloat(b.distance);
      case 'rating':
        return b.rating - a.rating;
      case 'delivery':
        return parseInt(a.deliveryTime) - parseInt(b.deliveryTime);
      default:
        return 0;
    }
  });

  const renderPharmacyCard = ({ item: pharmacy, index }: { item: Pharmacy; index: number }) => (
    <Animated.View
      entering={FadeInDown.delay(100 * index)}
      style={styles.pharmacyCard}
    >
      <TouchableOpacity
        style={[styles.pharmacyCardContent, { backgroundColor: theme.colors.surface }]}
        onPress={() => router.push(`/pharmacy-store?id=${pharmacy.id}` as any)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[`${pharmacy.color}15`, `${pharmacy.color}05`]}
          style={styles.pharmacyCardGradient}
        >
          <View style={styles.pharmacyHeader}>
            <View style={[styles.pharmacyLogoContainer, { backgroundColor: `${pharmacy.color}20` }]}>
              <Image source={pharmacy.logo} style={styles.pharmacyLogo} resizeMode="contain" />
            </View>
            <View style={styles.pharmacyMainInfo}>
              <Text style={[styles.pharmacyName, { color: theme.colors.textPrimary }]}>
                {pharmacy.name}
              </Text>
              <Text style={[styles.pharmacyDistance, { color: theme.colors.textSecondary }]}>
                {pharmacy.distance} away
              </Text>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color="#FFD700" />
                <Text style={[styles.ratingText, { color: theme.colors.textPrimary }]}>
                  {pharmacy.rating}
                </Text>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: pharmacy.isOpen ? '#10B981' : '#EF4444' }
                ]}>
                  <Text style={styles.statusText}>
                    {pharmacy.isOpen ? 'Open' : 'Closed'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <Text style={[styles.pharmacyDescription, { color: theme.colors.textSecondary }]}>
            {pharmacy.description}
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.specialtiesContainer}>
            {pharmacy.specialties.map((specialty, idx) => (
              <View key={idx} style={[styles.specialtyTag, { backgroundColor: `${pharmacy.color}15` }]}>
                <Text style={[styles.specialtyText, { color: pharmacy.color }]}>
                  {specialty}
                </Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.pharmacyFooter}>
            <View style={styles.deliveryInfo}>
              <Ionicons name="time" size={16} color={theme.colors.textSecondary} />
              <Text style={[styles.deliveryText, { color: theme.colors.textSecondary }]}>
                {pharmacy.deliveryTime}
              </Text>
              <Ionicons name="bicycle" size={16} color={theme.colors.textSecondary} style={{ marginLeft: 12 }} />
              <Text style={[styles.deliveryText, { color: theme.colors.textSecondary }]}>
                {pharmacy.deliveryFee}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.viewStoreButton, { backgroundColor: pharmacy.color }]}
              onPress={() => router.push(`/pharmacy-store?id=${pharmacy.id}` as any)}
            >
              <Text style={styles.viewStoreText}>View Store</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} />
      
      <StandardHeader
        title="All Pharmacies"
        showBackButton
        onBackPress={() => router.back()}
        rightComponent={
          <TouchableOpacity onPress={() => setFilterOpen(!filterOpen)}>
            <Ionicons name="options" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
        }
      />

      {/* Search and Filters */}
      <View style={styles.searchSection}>
        <View style={[styles.searchBar, { backgroundColor: theme.colors.surface }]}>
          <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.textPrimary }]}
            placeholder="Search pharmacies..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        {/* Sort Options */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sortContainer}>
          <TouchableOpacity
            style={[
              styles.sortButton,
              {
                backgroundColor: sortBy === 'distance' ? theme.colors.primary : theme.colors.surface,
                borderColor: theme.colors.border,
              }
            ]}
            onPress={() => setSortBy('distance')}
          >
            <Ionicons
              name="location"
              size={16}
              color={sortBy === 'distance' ? theme.colors.white : theme.colors.textPrimary}
            />
            <Text
              style={[
                styles.sortButtonText,
                {
                  color: sortBy === 'distance' ? theme.colors.white : theme.colors.textPrimary,
                }
              ]}
            >
              Nearest
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.sortButton,
              {
                backgroundColor: sortBy === 'rating' ? theme.colors.primary : theme.colors.surface,
                borderColor: theme.colors.border,
              }
            ]}
            onPress={() => setSortBy('rating')}
          >
            <Ionicons
              name="star"
              size={16}
              color={sortBy === 'rating' ? theme.colors.white : theme.colors.textPrimary}
            />
            <Text
              style={[
                styles.sortButtonText,
                {
                  color: sortBy === 'rating' ? theme.colors.white : theme.colors.textPrimary,
                }
              ]}
            >
              Top Rated
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.sortButton,
              {
                backgroundColor: sortBy === 'delivery' ? theme.colors.primary : theme.colors.surface,
                borderColor: theme.colors.border,
              }
            ]}
            onPress={() => setSortBy('delivery')}
          >
            <Ionicons
              name="time"
              size={16}
              color={sortBy === 'delivery' ? theme.colors.white : theme.colors.textPrimary}
            />
            <Text
              style={[
                styles.sortButtonText,
                {
                  color: sortBy === 'delivery' ? theme.colors.white : theme.colors.textPrimary,
                }
              ]}
            >
              Fastest
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Pharmacy List */}
      <FlatList
        data={filteredPharmacies}
        keyExtractor={(item) => item.id}
        renderItem={renderPharmacyCard}
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
  sortContainer: {
    flexDirection: 'row',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
  },
  sortButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  pharmacyCard: {
    marginBottom: 16,
  },
  pharmacyCardContent: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  pharmacyCardGradient: {
    padding: 20,
  },
  pharmacyHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  pharmacyLogoContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  pharmacyLogo: {
    width: 40,
    height: 40,
  },
  pharmacyMainInfo: {
    flex: 1,
  },
  pharmacyName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  pharmacyDistance: {
    fontSize: 14,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  pharmacyDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  specialtiesContainer: {
    marginBottom: 16,
  },
  specialtyTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  specialtyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  pharmacyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  deliveryText: {
    fontSize: 12,
    marginLeft: 4,
  },
  viewStoreButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  viewStoreText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
