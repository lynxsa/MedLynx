import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Linking,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';

// Google Maps API configuration
// To enable real-time distance calculations:
// 1. Get a Google Maps API key from https://console.cloud.google.com/
// 2. Enable Distance Matrix API for your project
// 3. Replace 'YOUR_GOOGLE_MAPS_API_KEY' with your actual API key
const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY'; // Replace with your actual API key

interface HealthFacility {
  id: string;
  name: string;
  type: 'Hospital' | 'Clinic' | 'Pharmacy' | 'Emergency' | 'Specialist' | 'Laboratory';
  rating: number;
  distance: string;
  actualDistance?: number; // Distance in kilometers from Google Maps API
  duration?: string; // Travel time from Google Maps API
  address: string;
  phone: string;
  city: string;
  province: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  services: string[];
  isOpen: boolean;
  openingHours: string;
  acceptsMedicalAid: boolean;
  emergencyServices: boolean;
}

// Comprehensive South African Health Directory
const SOUTH_AFRICAN_HEALTH_FACILITIES: HealthFacility[] = [
  // GAUTENG - JOHANNESBURG & PRETORIA AREA
  {
    id: 'netcare-milpark',
    name: 'Netcare Milpark Hospital',
    type: 'Hospital',
    rating: 4.6,
    distance: '2.1 km',
    address: '9 Guild Road, Parktown West',
    phone: '+27 11 480 7111',
    city: 'Johannesburg',
    province: 'Gauteng',
    coordinates: { latitude: -26.1751, longitude: 28.0135 },
    services: ['Emergency Care', 'Cardiology', 'Oncology', 'Surgery', 'ICU'],
    isOpen: true,
    openingHours: '24/7',
    acceptsMedicalAid: true,
    emergencyServices: true,
  },
  {
    id: 'sandton-mediclinic',
    name: 'Mediclinic Sandton',
    type: 'Hospital',
    rating: 4.5,
    distance: '1.2 km',
    address: '33 Rivonia Road, Sandton',
    phone: '+27 11 709 2000',
    city: 'Sandton',
    province: 'Gauteng',
    coordinates: { latitude: -26.1078, longitude: 28.0567 },
    services: ['Emergency', 'Surgery', 'Maternity', 'Radiology', 'Pharmacy'],
    isOpen: true,
    openingHours: '24/7',
    acceptsMedicalAid: true,
    emergencyServices: true,
  },
  {
    id: 'charlotte-maxeke-hospital',
    name: 'Charlotte Maxeke Johannesburg Academic Hospital',
    type: 'Hospital',
    rating: 4.1,
    distance: '8.5 km',
    address: 'York Road, Parktown',
    phone: '+27 11 488 4911',
    city: 'Johannesburg',
    province: 'Gauteng',
    coordinates: { latitude: -26.1843, longitude: 28.0399 },
    services: ['Emergency', 'Trauma', 'Surgery', 'Medicine', 'Academic Training'],
    isOpen: true,
    openingHours: '24/7',
    acceptsMedicalAid: false,
    emergencyServices: true,
  },
  {
    id: 'helen-joseph-hospital',
    name: 'Helen Joseph Hospital',
    type: 'Hospital',
    rating: 3.9,
    distance: '12.3 km',
    address: 'Perth Road, Auckland Park',
    phone: '+27 11 276 8000',
    city: 'Johannesburg',
    province: 'Gauteng',
    coordinates: { latitude: -26.1890, longitude: 27.9875 },
    services: ['Emergency', 'Internal Medicine', 'Surgery', 'Pediatrics'],
    isOpen: true,
    openingHours: '24/7',
    acceptsMedicalAid: false,
    emergencyServices: true,
  },
  {
    id: 'steve-biko-hospital',
    name: 'Steve Biko Academic Hospital',
    type: 'Hospital',
    rating: 4.0,
    distance: '45.2 km',
    address: 'Malherbe Street, Pretoria',
    phone: '+27 12 354 1000',
    city: 'Pretoria',
    province: 'Gauteng',
    coordinates: { latitude: -25.7479, longitude: 28.2293 },
    services: ['Emergency', 'Cardiology', 'Neurology', 'Transplant Unit'],
    isOpen: true,
    openingHours: '24/7',
    acceptsMedicalAid: false,
    emergencyServices: true,
  },

  // WESTERN CAPE - CAPE TOWN
  {
    id: 'groote-schuur-hospital',
    name: 'Groote Schuur Hospital',
    type: 'Hospital',
    rating: 4.4,
    distance: '1200 km',
    address: 'Main Road, Observatory',
    phone: '+27 21 404 9111',
    city: 'Cape Town',
    province: 'Western Cape',
    coordinates: { latitude: -33.9397, longitude: 18.4649 },
    services: ['Emergency', 'Heart Surgery', 'Transplant', 'Neurosurgery'],
    isOpen: true,
    openingHours: '24/7',
    acceptsMedicalAid: false,
    emergencyServices: true,
  },
  {
    id: 'red-cross-hospital',
    name: 'Red Cross War Memorial Children\'s Hospital',
    type: 'Hospital',
    rating: 4.3,
    distance: '1205 km',
    address: 'Klipfontein Road, Rondebosch',
    phone: '+27 21 658 5111',
    city: 'Cape Town',
    province: 'Western Cape',
    coordinates: { latitude: -33.9716, longitude: 18.4606 },
    services: ['Pediatric Emergency', 'Child Surgery', 'NICU', 'Pediatric Oncology'],
    isOpen: true,
    openingHours: '24/7',
    acceptsMedicalAid: false,
    emergencyServices: true,
  },
  {
    id: 'vincent-pallotti-hospital',
    name: 'Vincent Pallotti Hospital',
    type: 'Hospital',
    rating: 4.2,
    distance: '1210 km',
    address: 'Alexandra Road, Pinelands',
    phone: '+27 21 506 5111',
    city: 'Cape Town',
    province: 'Western Cape',
    coordinates: { latitude: -33.9304, longitude: 18.5056 },
    services: ['Emergency', 'Surgery', 'Maternity', 'Radiology'],
    isOpen: true,
    openingHours: '24/7',
    acceptsMedicalAid: true,
    emergencyServices: true,
  },

  // KWAZULU-NATAL - DURBAN
  {
    id: 'inkosi-albert-luthuli-hospital',
    name: 'Inkosi Albert Luthuli Central Hospital',
    type: 'Hospital',
    rating: 4.1,
    distance: '550 km',
    address: '800 Bellair Road, Cato Manor',
    phone: '+27 31 240 2111',
    city: 'Durban',
    province: 'KwaZulu-Natal',
    coordinates: { latitude: -29.8587, longitude: 30.9870 },
    services: ['Emergency', 'Cardiology', 'Transplant', 'Neurosurgery'],
    isOpen: true,
    openingHours: '24/7',
    acceptsMedicalAid: false,
    emergencyServices: true,
  },
  {
    id: 'addington-hospital',
    name: 'Addington Hospital',
    type: 'Hospital',
    rating: 3.8,
    distance: '555 km',
    address: 'Erskine Terrace, South Beach',
    phone: '+27 31 327 2000',
    city: 'Durban',
    province: 'KwaZulu-Natal',
    coordinates: { latitude: -29.8699, longitude: 31.0175 },
    services: ['Emergency', 'Trauma', 'General Medicine', 'Surgery'],
    isOpen: true,
    openingHours: '24/7',
    acceptsMedicalAid: false,
    emergencyServices: true,
  },

  // EASTERN CAPE - PORT ELIZABETH
  {
    id: 'livingstone-hospital',
    name: 'Livingstone Hospital',
    type: 'Hospital',
    rating: 3.7,
    distance: '750 km',
    address: 'Stanford Road, Korsten',
    phone: '+27 41 405 2911',
    city: 'Port Elizabeth',
    province: 'Eastern Cape',
    coordinates: { latitude: -33.9480, longitude: 25.5920 },
    services: ['Emergency', 'General Medicine', 'Surgery', 'Pediatrics'],
    isOpen: true,
    openingHours: '24/7',
    acceptsMedicalAid: false,
    emergencyServices: true,
  },

  // PHARMACIES
  {
    id: 'clicks-sandton',
    name: 'Clicks Pharmacy Sandton City',
    type: 'Pharmacy',
    rating: 4.0,
    distance: '0.8 km',
    address: 'Sandton City Shopping Centre',
    phone: '+27 11 883 6560',
    city: 'Sandton',
    province: 'Gauteng',
    coordinates: { latitude: -26.1076, longitude: 28.0567 },
    services: ['Prescription Medication', 'Health Screening', 'Vaccines', 'Health Products'],
    isOpen: true,
    openingHours: '09:00 - 19:00',
    acceptsMedicalAid: true,
    emergencyServices: false,
  },
  {
    id: 'dischem-rosebank',
    name: 'Dis-Chem Pharmacy Rosebank',
    type: 'Pharmacy',
    rating: 4.2,
    distance: '5.2 km',
    address: 'The Zone, Rosebank',
    phone: '+27 11 447 2888',
    city: 'Johannesburg',
    province: 'Gauteng',
    coordinates: { latitude: -26.1465, longitude: 28.0436 },
    services: ['Medication', 'Vitamins', 'Health Products', 'Flu Shots', 'Blood Pressure'],
    isOpen: true,
    openingHours: '08:00 - 20:00',
    acceptsMedicalAid: true,
    emergencyServices: false,
  },

  // EMERGENCY SERVICES
  {
    id: 'er24-sandton',
    name: 'ER24 Emergency Medical Services',
    type: 'Emergency',
    rating: 4.3,
    distance: '1.5 km',
    address: '15 Alice Lane, Sandton',
    phone: '+27 84 124',
    city: 'Sandton',
    province: 'Gauteng',
    coordinates: { latitude: -26.1045, longitude: 28.0578 },
    services: ['Emergency Response', 'Ambulance', 'Critical Care Transport', '24/7 Response'],
    isOpen: true,
    openingHours: '24/7',
    acceptsMedicalAid: true,
    emergencyServices: true,
  },
  {
    id: 'netcare-911',
    name: 'Netcare 911',
    type: 'Emergency',
    rating: 4.4,
    distance: 'Various',
    address: 'Multiple Locations',
    phone: '+27 82 911',
    city: 'Nationwide',
    province: 'All Provinces',
    coordinates: { latitude: -26.2041, longitude: 28.0473 },
    services: ['Emergency Medical Response', 'Air Rescue', 'Ambulance', 'Critical Care'],
    isOpen: true,
    openingHours: '24/7',
    acceptsMedicalAid: true,
    emergencyServices: true,
  },

  // CLINICS
  {
    id: 'morningside-clinic',
    name: 'Morningside Clinic',
    type: 'Clinic',
    rating: 4.2,
    distance: '2.1 km',
    address: '20 Lyme Park, Morningside',
    phone: '+27 11 282 2000',
    city: 'Sandton',
    province: 'Gauteng',
    coordinates: { latitude: -26.1189, longitude: 28.0653 },
    services: ['General Practice', 'Pediatrics', 'Dermatology', 'Minor Surgery'],
    isOpen: true,
    openingHours: '08:00 - 17:00',
    acceptsMedicalAid: true,
    emergencyServices: false,
  },

  // SPECIALISTS
  {
    id: 'heart-hospital',
    name: 'Sunninghill Heart Hospital',
    type: 'Specialist',
    rating: 4.7,
    distance: '3.2 km',
    address: '12 Eton Road, Sandton',
    phone: '+27 11 806 1500',
    city: 'Sandton',
    province: 'Gauteng',
    coordinates: { latitude: -26.0225, longitude: 28.0792 },
    services: ['Cardiology', 'Heart Surgery', 'Cardiac Catheterization', 'Pacemaker'],
    isOpen: false,
    openingHours: '07:00 - 17:00',
    acceptsMedicalAid: true,
    emergencyServices: true,
  },

  // LABORATORIES
  {
    id: 'pathcare-sandton',
    name: 'PathCare Laboratory',
    type: 'Laboratory',
    rating: 4.1,
    distance: '1.8 km',
    address: '89 Rivonia Road, Sandton',
    phone: '+27 11 301 0200',
    city: 'Sandton',
    province: 'Gauteng',
    coordinates: { latitude: -26.1095, longitude: 28.0534 },
    services: ['Blood Tests', 'Pathology', 'Radiology', 'Health Screening'],
    isOpen: true,
    openingHours: '07:00 - 16:00',
    acceptsMedicalAid: true,
    emergencyServices: false,
  },
];

// Compact and modern facility types with better icons
const FACILITY_TYPES = [
  { id: 'all', name: 'All', icon: 'apps', color: '#6366F1', gradient: ['#6366F1', '#8B5CF6'] },
  { id: 'Hospital', name: 'Hospitals', icon: 'business', color: '#EF4444', gradient: ['#EF4444', '#F87171'] },
  { id: 'Clinic', name: 'Clinics', icon: 'medical', color: '#10B981', gradient: ['#10B981', '#34D399'] },
  { id: 'Pharmacy', name: 'Pharmacies', icon: 'storefront', color: '#3B82F6', gradient: ['#3B82F6', '#60A5FA'] },
  { id: 'Emergency', name: 'Emergency', icon: 'flash', color: '#F59E0B', gradient: ['#F59E0B', '#FBBF24'] },
  { id: 'Specialist', name: 'Specialists', icon: 'person', color: '#8B5CF6', gradient: ['#8B5CF6', '#A78BFA'] },
  { id: 'Laboratory', name: 'Labs', icon: 'flask', color: '#F97316', gradient: ['#F97316', '#FB923C'] },
];

// Compact province list
const PROVINCES = [
  'All',
  'Gauteng',
  'Western Cape',
  'KwaZulu-Natal',
  'Eastern Cape',
  'Free State',
  'Limpopo',
  'Mpumalanga',
  'Northern Cape',
  'North West'
];

export default function ModernHealthDirectoryScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const colors = theme.colors;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedProvince, setSelectedProvince] = useState('All');
  const [filteredFacilities, setFilteredFacilities] = useState(SOUTH_AFRICAN_HEALTH_FACILITIES);
  const [isLoading, setIsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  // Google Maps Distance Matrix API integration
  const calculateDistanceAndDuration = async (facilities: HealthFacility[], userLat: number, userLng: number) => {
    if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY') {
      console.warn('Google Maps API key not configured');
      return facilities;
    }

    try {
      setIsLoading(true);
      
      // Batch facilities into groups of 10 (Google Maps API limit)
      const batchSize = 10;
      const batches = [];
      for (let i = 0; i < facilities.length; i += batchSize) {
        batches.push(facilities.slice(i, i + batchSize));
      }
      
      const updatedFacilities = [...facilities];
      
      for (const batch of batches) {
        const destinations = batch.map(f => `${f.coordinates.latitude},${f.coordinates.longitude}`).join('|');
        
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/distancematrix/json?` +
          `origins=${userLat},${userLng}&` +
          `destinations=${destinations}&` +
          `mode=driving&` +
          `units=metric&` +
          `key=${GOOGLE_MAPS_API_KEY}`
        );
        
        const data = await response.json();
        
        if (data.status === 'OK') {
          data.rows[0].elements.forEach((element: any, index: number) => {
            if (element.status === 'OK') {
              const facilityIndex = facilities.indexOf(batch[index]);
              updatedFacilities[facilityIndex] = {
                ...updatedFacilities[facilityIndex],
                actualDistance: element.distance.value / 1000, // Convert to km
                distance: element.distance.text,
                duration: element.duration.text
              };
            }
          });
        }
      }
      
      // Sort by actual distance
      updatedFacilities.sort((a, b) => (a.actualDistance || 999) - (b.actualDistance || 999));
      
      return updatedFacilities;
    } catch (error) {
      console.error('Error calculating distances:', error);
      return facilities;
    } finally {
      setIsLoading(false);
    }
  };

  const filterFacilities = useCallback(async () => {
    let filtered = SOUTH_AFRICAN_HEALTH_FACILITIES;
    
    if (selectedType !== 'all') {
      filtered = filtered.filter(facility => facility.type === selectedType);
    }
    
    if (selectedProvince !== 'All') {
      filtered = filtered.filter(facility => facility.province === selectedProvince);
    }
    
    if (searchQuery.trim()) {
      filtered = filtered.filter(facility =>
        facility.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        facility.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        facility.services.some(service => 
          service.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
    
    // If user location is available, calculate real distances
    if (userLocation) {
      filtered = await calculateDistanceAndDuration(filtered, userLocation.latitude, userLocation.longitude);
    }
    
    setFilteredFacilities(filtered);
  }, [selectedType, selectedProvince, searchQuery, userLocation]);

  // Get user location
  useEffect(() => {
    const getUserLocation = async () => {
      try {
        // Request location permission and get current position
        // For now, we'll use Johannesburg CBD as default
        setUserLocation({ latitude: -26.2041, longitude: 28.0473 });
      } catch (error) {
        console.error('Error getting user location:', error);
      }
    };
    
    getUserLocation();
  }, []);

  useEffect(() => {
    filterFacilities();
  }, [filterFacilities]);

  const getTypeIcon = (type: string): keyof typeof Ionicons.glyphMap => {
    const typeData = FACILITY_TYPES.find(t => t.id === type);
    return (typeData ? typeData.icon : 'location') as keyof typeof Ionicons.glyphMap;
  };

  const getTypeGradient = (type: string) => {
    const typeData = FACILITY_TYPES.find(t => t.id === type);
    return typeData ? typeData.gradient : ['#6366F1', '#8B5CF6'];
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleDirections = (facility: HealthFacility) => {
    Alert.alert(
      'Get Directions',
      'Choose your preferred maps application:',
      [
        {
          text: 'Google Maps',
          onPress: () => {
            const url = Platform.select({
              ios: `comgooglemaps://?daddr=${facility.coordinates.latitude},${facility.coordinates.longitude}&directionsmode=driving`,
              android: `google.navigation:q=${facility.coordinates.latitude},${facility.coordinates.longitude}&mode=d`,
            });
            
            const fallbackUrl = `https://maps.google.com/maps?daddr=${facility.coordinates.latitude},${facility.coordinates.longitude}`;
            
            if (url) {
              Linking.canOpenURL(url)
                .then(supported => {
                  if (supported) {
                    Linking.openURL(url);
                  } else {
                    Linking.openURL(fallbackUrl);
                  }
                })
                .catch(() => Linking.openURL(fallbackUrl));
            } else {
              Linking.openURL(fallbackUrl);
            }
          }
        },
        {
          text: 'Apple Maps',
          onPress: () => {
            const url = `http://maps.apple.com/?daddr=${facility.coordinates.latitude},${facility.coordinates.longitude}&dirflg=d`;
            Linking.openURL(url);
          }
        },
        {
          text: 'Waze',
          onPress: () => {
            const url = `https://waze.com/ul?ll=${facility.coordinates.latitude},${facility.coordinates.longitude}&navigate=yes`;
            Linking.openURL(url);
          }
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleShare = async (facility: HealthFacility) => {
    try {
      const message = `${facility.name}\n${facility.address}\nPhone: ${facility.phone}\nRating: ${facility.rating}⭐\n\nFound on MedLYNX Health Directory`;
      
      if (Platform.OS === 'ios') {
        // iOS sharing implementation
        const url = `sms:&body=${encodeURIComponent(message)}`;
        Linking.openURL(url);
      } else {
        // Android sharing implementation  
        const url = `sms:?body=${encodeURIComponent(message)}`;
        Linking.openURL(url);
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const FacilityCard = ({ facility }: { facility: HealthFacility }) => (
    <TouchableOpacity 
      style={[styles.facilityCard, { backgroundColor: colors.surface }]}
      activeOpacity={0.7}
    >
      {/* Compact Header */}
      <View style={styles.compactHeader}>
        <LinearGradient
          colors={getTypeGradient(facility.type) as any}
          style={styles.modernTypeIcon}
        >
          <Ionicons name={getTypeIcon(facility.type)} size={16} color="white" />
        </LinearGradient>
        
        <View style={styles.headerInfo}>
          <Text style={[styles.modernFacilityName, { color: colors.textPrimary }]} numberOfLines={1}>
            {facility.name}
          </Text>
          <View style={styles.compactRating}>
            <Ionicons name="star" size={12} color="#FFB800" />
            <Text style={[styles.rating, { color: colors.textSecondary }]}>{facility.rating}</Text>
            {facility.duration ? (
              <Text style={[styles.duration, { color: colors.primary }]}>• {facility.duration}</Text>
            ) : (
              <Text style={[styles.staticDistance, { color: colors.textSecondary }]}>• {facility.distance}</Text>
            )}
          </View>
        </View>
        
        <View style={styles.statusContainer}>
          <View style={[styles.compactStatusBadge, { 
            backgroundColor: facility.isOpen ? '#10B981' : '#EF4444' 
          }]}>
            <View style={[styles.statusDot, { 
              backgroundColor: facility.isOpen ? '#FFFFFF' : '#FFFFFF' 
            }]} />
          </View>
        </View>
      </View>

      {/* Compact Location & Contact */}
      <View style={styles.locationRow}>
        <View style={styles.locationInfo}>
          <Ionicons name="location-outline" size={12} color={colors.textSecondary} />
          <Text style={[styles.compactAddress, { color: colors.textSecondary }]} numberOfLines={1}>
            {facility.city}, {facility.province}
          </Text>
        </View>
        <Text style={[styles.compactHours, { color: colors.textSecondary }]}>
          {facility.openingHours}
        </Text>
      </View>
      
      {/* Compact Indicators */}
      <View style={styles.compactIndicators}>
        {facility.acceptsMedicalAid && (
          <View style={styles.miniIndicator}>
            <Ionicons name="card" size={10} color="#10B981" />
            <Text style={[styles.miniIndicatorText, { color: '#10B981' }]}>Medical Aid</Text>
          </View>
        )}
        {facility.emergencyServices && (
          <View style={styles.miniIndicator}>
            <Ionicons name="medical" size={10} color="#EF4444" />
            <Text style={[styles.miniIndicatorText, { color: '#EF4444' }]}>Emergency</Text>
          </View>
        )}
      </View>
      
      {/* Compact Services */}
      <View style={styles.compactServices}>
        {facility.services.slice(0, 2).map((service, index) => (
          <View key={index} style={[styles.compactServiceTag, { backgroundColor: colors.backgroundSecondary }]}>
            <Text style={[styles.compactServiceText, { color: colors.textSecondary }]}>{service}</Text>
          </View>
        ))}
        {facility.services.length > 2 && (
          <Text style={[styles.moreServicesCompact, { color: colors.textSecondary }]}>
            +{facility.services.length - 2}
          </Text>
        )}
      </View>
      
      {/* Modern Action Buttons */}
      <View style={styles.modernActionButtons}>
        <TouchableOpacity 
          style={[styles.primaryActionButton, { backgroundColor: colors.primary }]}
          onPress={() => handleCall(facility.phone)}
        >
          <Ionicons name="call" size={14} color="white" />
          <Text style={styles.primaryActionText}>Call</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.secondaryActionButton, { borderColor: colors.primary }]}
          onPress={() => handleDirections(facility)}
        >
          <Ionicons name="navigate" size={14} color={colors.primary} />
          <Text style={[styles.secondaryActionText, { color: colors.primary }]}>Directions</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.iconActionButton, { backgroundColor: colors.backgroundSecondary }]}
          onPress={() => handleShare(facility)}
        >
          <Ionicons name="share-outline" size={14} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Modern Compact Header */}
      <LinearGradient
        colors={['#6366F1', '#8B5CF6', '#A78BFA']}
        style={[styles.modernHeader, { paddingTop: insets.top }]}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.modernBackButton}>
            <Ionicons name="arrow-back" size={22} color="white" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.modernHeaderTitle}>Healthcare Finder</Text>
            <Text style={styles.headerSubtitle}>Find nearby medical facilities</Text>
          </View>
          <TouchableOpacity style={styles.headerAction}>
            <Ionicons name="filter" size={22} color="white" />
          </TouchableOpacity>
        </View>
        
        {/* Compact Search Bar */}
        <View style={styles.compactSearchContainer}>
          <View style={styles.compactSearchBar}>
            <Ionicons name="search" size={16} color="#8B5CF6" />
            <TextInput
              style={styles.compactSearchInput}
              placeholder="Search healthcare facilities..."
              placeholderTextColor="#A78BFA"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={16} color="#8B5CF6" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </LinearGradient>

      {/* Ultra Compact Filter Pills */}
      <View style={styles.ultraCompactFilters}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterPillsContainer}
        >
          {FACILITY_TYPES.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.ultraCompactFilterPill,
                selectedType === type.id && [styles.activeFilterPill, { backgroundColor: type.color }],
                { borderColor: type.color }
              ]}
              onPress={() => setSelectedType(type.id)}
            >
              <Ionicons 
                name={type.icon as keyof typeof Ionicons.glyphMap} 
                size={14} 
                color={selectedType === type.id ? 'white' : type.color} 
              />
              <Text style={[
                styles.ultraCompactFilterText,
                { color: selectedType === type.id ? 'white' : type.color }
              ]}>
                {type.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Compact Province Pills */}
      <View style={styles.compactProvinceFilters}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.provincePillsContainer}
        >
          {PROVINCES.map((province) => (
            <TouchableOpacity
              key={province}
              style={[
                styles.compactProvincePill,
                selectedProvince === province && styles.activeProvincePill
              ]}
              onPress={() => setSelectedProvince(province)}
            >
              <Text style={[
                styles.compactProvinceText,
                selectedProvince === province && styles.activeProvinceText
              ]}>
                {province}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Modern Results Header */}
      <View style={styles.modernResultsHeader}>
        <View style={styles.resultsInfo}>
          <Text style={[styles.resultsCount, { color: colors.textPrimary }]}>
            {filteredFacilities.length} facilities
          </Text>
          <Text style={[styles.resultsSubtext, { color: colors.textSecondary }]}>
            {isLoading ? 'Calculating distances...' : 'Sorted by distance'}
          </Text>
        </View>
        {isLoading && <ActivityIndicator size="small" color={colors.primary} />}
      </View>

      {/* Facilities List */}
      <ScrollView 
        style={styles.modernListContainer} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContentContainer}
      >
        {filteredFacilities.map((facility) => (
          <FacilityCard key={facility.id} facility={facility} />
        ))}
        
        {filteredFacilities.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="location-outline" size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyStateTitle, { color: colors.textPrimary }]}>No facilities found</Text>
            <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
              Try adjusting your search criteria or filters
            </Text>
          </View>
        )}
        
        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Modern Compact Header
  modernHeader: {
    paddingBottom: 15,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 15,
  },
  modernBackButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  modernHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  headerAction: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Compact Search
  compactSearchContainer: {
    paddingHorizontal: 20,
  },
  compactSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  compactSearchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
  },

  // Ultra Compact Filter Pills
  ultraCompactFilters: {
    paddingVertical: 12,
    backgroundColor: 'transparent',
  },
  filterPillsContainer: {
    paddingHorizontal: 20,
    gap: 8,
  },
  ultraCompactFilterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
  },
  activeFilterPill: {
    borderWidth: 0,
  },
  ultraCompactFilterText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // Compact Province Filter
  compactProvinceFilters: {
    paddingBottom: 8,
  },
  provincePillsContainer: {
    paddingHorizontal: 20,
    gap: 6,
  },
  compactProvincePill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
  },
  activeProvincePill: {
    backgroundColor: '#6366F1',
  },
  compactProvinceText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeProvinceText: {
    color: 'white',
  },

  // Modern Results Header
  modernResultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  resultsInfo: {
    flex: 1,
  },
  resultsCount: {
    fontSize: 16,
    fontWeight: '700',
  },
  resultsSubtext: {
    fontSize: 12,
    marginTop: 2,
  },

  // Modern List Container
  modernListContainer: {
    flex: 1,
  },
  listContentContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },

  // Modern Compact Facility Card
  facilityCard: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },

  // Compact Header
  compactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  modernTypeIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  headerInfo: {
    flex: 1,
  },
  modernFacilityName: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  compactRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 12,
    fontWeight: '600',
  },
  duration: {
    fontSize: 12,
    fontWeight: '600',
  },
  staticDistance: {
    fontSize: 12,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  compactStatusBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  // Location Row
  locationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  compactAddress: {
    fontSize: 12,
    fontWeight: '500',
  },
  compactHours: {
    fontSize: 11,
  },

  // Compact Indicators
  compactIndicators: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  miniIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  miniIndicatorText: {
    fontSize: 10,
    fontWeight: '600',
  },

  // Compact Services
  compactServices: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 6,
  },
  compactServiceTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  compactServiceText: {
    fontSize: 10,
    fontWeight: '500',
  },
  moreServicesCompact: {
    fontSize: 10,
    fontStyle: 'italic',
  },

  // Modern Action Buttons
  modernActionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  primaryActionButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  primaryActionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  secondaryActionButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  secondaryActionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  iconActionButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Legacy styles (kept for compatibility)
  header: { paddingBottom: 16 },
  headerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 10 },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: 'white', flex: 1, textAlign: 'center' },
  searchButton: { padding: 8 },
  searchContainer: { paddingHorizontal: 20, marginTop: 8 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  searchInput: { flex: 1, fontSize: 14, color: '#1F2937' },
  filterContainer: { paddingVertical: 8, backgroundColor: 'transparent' },
  filterContent: { paddingHorizontal: 20, gap: 8 },
  filterTab: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 4, marginRight: 8, borderWidth: 1, borderColor: '#E0E0E0' },
  filterTabText: { fontSize: 12, fontWeight: '500' },
  provinceContainer: { paddingBottom: 8, backgroundColor: 'transparent' },
  provinceContent: { paddingHorizontal: 20, gap: 6 },
  provinceTab: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1 },
  provinceTabText: { fontSize: 11, fontWeight: '500' },
  listContainer: { flex: 1, paddingHorizontal: 20 },
  resultsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, paddingTop: 10 },
  sortContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sortText: { fontSize: 14 },
  facilityHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 },
  facilityTypeIcon: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  facilityInfo: { flex: 1 },
  facilityName: { fontSize: 15, fontWeight: '600', marginBottom: 3 },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 },
  distance: { fontSize: 13 },
  statusBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, marginLeft: 6 },
  statusText: { color: 'white', fontSize: 11, fontWeight: '500' },
  locationText: { fontSize: 12, fontWeight: '500' },
  address: { fontSize: 13, marginBottom: 3 },
  hours: { fontSize: 13, marginBottom: 6 },
  indicatorsContainer: { flexDirection: 'row', gap: 6, marginBottom: 6 },
  indicator: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, gap: 3 },
  indicatorText: { color: 'white', fontSize: 10, fontWeight: '600' },
  servicesContainer: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', marginBottom: 8, gap: 4 },
  serviceTag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  serviceText: { fontSize: 11, fontWeight: '500' },
  moreServices: { fontSize: 11, fontStyle: 'italic' },
  actionButtons: { flexDirection: 'row', gap: 8 },
  actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, borderRadius: 8, gap: 4 },
  actionButtonText: { fontSize: 13, fontWeight: '500' },
});
