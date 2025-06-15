import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Linking,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import ThemedGlassCard from '../../components/ThemedGlassCard';

interface HealthFacility {
  id: string;
  name: string;
  type: 'PublicHospital' | 'PrivateHospital' | 'PublicClinic' | 'Pharmacy' | 'Emergency';
  address: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
  };
  coordinates: {
    latitude: number;
    longitude: number;
  };
  phone: string;
  services: string[];
  operatingHours: {
    day: string;
    openTime: string;
    closeTime: string;
  }[];
  distance?: number;
  isOpen?: boolean;
}

// Enhanced South African health facilities data (Sandton area)
const sandtonHealthFacilities: HealthFacility[] = [
  {
    id: 'sandton-city-clinic',
    name: 'Sandton City Clinic',
    type: 'PrivateHospital',
    address: {
      street: '83 Rivonia Rd, Sandhurst',
      city: 'Sandton',
      province: 'Gauteng',
      postalCode: '2196'
    },
    coordinates: { latitude: -26.1078, longitude: 28.0567 },
    phone: '+27 11 709 2000',
    services: ['Emergency Care', 'General Medicine', 'Specialist Consultations', 'Diagnostics'],
    operatingHours: [
      { day: 'Monday', openTime: '07:00', closeTime: '17:00' },
      { day: 'Tuesday', openTime: '07:00', closeTime: '17:00' },
      { day: 'Wednesday', openTime: '07:00', closeTime: '17:00' },
      { day: 'Thursday', openTime: '07:00', closeTime: '17:00' },
      { day: 'Friday', openTime: '07:00', closeTime: '17:00' },
      { day: 'Saturday', openTime: '08:00', closeTime: '12:00' },
      { day: 'Sunday', openTime: 'Closed', closeTime: 'Closed' }
    ],
    distance: 1.2,
    isOpen: true
  },
  {
    id: 'morningside-clinic',
    name: 'Morningside Clinic',
    type: 'PrivateHospital',
    address: {
      street: '20 Lyme Park, Morningside',
      city: 'Sandton',
      province: 'Gauteng',
      postalCode: '2057'
    },
    coordinates: { latitude: -26.1189, longitude: 28.0653 },
    phone: '+27 11 282 2000',
    services: ['Emergency', 'Surgery', 'Maternity', 'ICU', 'Radiology'],
    operatingHours: [
      { day: 'Monday', openTime: '24 Hours', closeTime: '24 Hours' },
      { day: 'Tuesday', openTime: '24 Hours', closeTime: '24 Hours' },
      { day: 'Wednesday', openTime: '24 Hours', closeTime: '24 Hours' },
      { day: 'Thursday', openTime: '24 Hours', closeTime: '24 Hours' },
      { day: 'Friday', openTime: '24 Hours', closeTime: '24 Hours' },
      { day: 'Saturday', openTime: '24 Hours', closeTime: '24 Hours' },
      { day: 'Sunday', openTime: '24 Hours', closeTime: '24 Hours' }
    ],
    distance: 2.5,
    isOpen: true
  },
  {
    id: 'milpark-hospital',
    name: 'Milpark Hospital',
    type: 'PrivateHospital',
    address: {
      street: '9 Guild Rd, Parktown West',
      city: 'Johannesburg',
      province: 'Gauteng',
      postalCode: '2193'
    },
    coordinates: { latitude: -26.1751, longitude: 28.0135 },
    phone: '+27 11 480 7111',
    services: ['Emergency', 'Cardiology', 'Oncology', 'Orthopedics', 'Neurology'],
    operatingHours: [
      { day: 'Monday', openTime: '24 Hours', closeTime: '24 Hours' },
      { day: 'Tuesday', openTime: '24 Hours', closeTime: '24 Hours' },
      { day: 'Wednesday', openTime: '24 Hours', closeTime: '24 Hours' },
      { day: 'Thursday', openTime: '24 Hours', closeTime: '24 Hours' },
      { day: 'Friday', openTime: '24 Hours', closeTime: '24 Hours' },
      { day: 'Saturday', openTime: '24 Hours', closeTime: '24 Hours' },
      { day: 'Sunday', openTime: '24 Hours', closeTime: '24 Hours' }
    ],
    distance: 8.3,
    isOpen: true
  },
  {
    id: 'clicks-pharmacy-sandton',
    name: 'Clicks Pharmacy Sandton',
    type: 'Pharmacy',
    address: {
      street: 'Sandton City Shopping Centre',
      city: 'Sandton',
      province: 'Gauteng',
      postalCode: '2146'
    },
    coordinates: { latitude: -26.1076, longitude: 28.0567 },
    phone: '+27 11 883 6560',
    services: ['Prescription Medicine', 'Over-the-counter drugs', 'Health Products', 'Vaccinations'],
    operatingHours: [
      { day: 'Monday', openTime: '09:00', closeTime: '21:00' },
      { day: 'Tuesday', openTime: '09:00', closeTime: '21:00' },
      { day: 'Wednesday', openTime: '09:00', closeTime: '21:00' },
      { day: 'Thursday', openTime: '09:00', closeTime: '21:00' },
      { day: 'Friday', openTime: '09:00', closeTime: '21:00' },
      { day: 'Saturday', openTime: '09:00', closeTime: '19:00' },
      { day: 'Sunday', openTime: '09:00', closeTime: '17:00' }
    ],
    distance: 0.8,
    isOpen: true
  },
  {
    id: 'alexandra-clinic',
    name: 'Alexandra Clinic',
    type: 'PublicClinic',
    address: {
      street: '1st Ave, Alexandra',
      city: 'Johannesburg',
      province: 'Gauteng',
      postalCode: '2090'
    },
    coordinates: { latitude: -26.1027, longitude: 28.0989 },
    phone: '+27 11 882 1600',
    services: ['Primary Healthcare', 'Maternal Health', 'HIV/AIDS Treatment', 'TB Treatment'],
    operatingHours: [
      { day: 'Monday', openTime: '07:30', closeTime: '16:00' },
      { day: 'Tuesday', openTime: '07:30', closeTime: '16:00' },
      { day: 'Wednesday', openTime: '07:30', closeTime: '16:00' },
      { day: 'Thursday', openTime: '07:30', closeTime: '16:00' },
      { day: 'Friday', openTime: '07:30', closeTime: '16:00' },
      { day: 'Saturday', openTime: '08:00', closeTime: '13:00' },
      { day: 'Sunday', openTime: 'Closed', closeTime: 'Closed' }
    ],
    distance: 5.2,
    isOpen: true
  },
  {
    id: 'netcare-911',
    name: 'Netcare 911 Emergency',
    type: 'Emergency',
    address: {
      street: 'Rivonia Rd',
      city: 'Sandton',
      province: 'Gauteng',
      postalCode: '2196'
    },
    coordinates: { latitude: -26.1078, longitude: 28.0567 },
    phone: '10177',
    services: ['Emergency Medical Services', 'Ambulance', 'Critical Care Transport'],
    operatingHours: [
      { day: 'Monday', openTime: '24 Hours', closeTime: '24 Hours' },
      { day: 'Tuesday', openTime: '24 Hours', closeTime: '24 Hours' },
      { day: 'Wednesday', openTime: '24 Hours', closeTime: '24 Hours' },
      { day: 'Thursday', openTime: '24 Hours', closeTime: '24 Hours' },
      { day: 'Friday', openTime: '24 Hours', closeTime: '24 Hours' },
      { day: 'Saturday', openTime: '24 Hours', closeTime: '24 Hours' },
      { day: 'Sunday', openTime: '24 Hours', closeTime: '24 Hours' }
    ],
    distance: 0.5,
    isOpen: true
  }
];

export default function HealthDirectoryScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const styles = useThemedStyles(createStyles);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const facilities = sandtonHealthFacilities;
  const [filteredFacilities, setFilteredFacilities] = useState<HealthFacility[]>(sandtonHealthFacilities);

  const facilityTypes = ['All', 'PublicHospital', 'PrivateHospital', 'PublicClinic', 'Pharmacy', 'Emergency'];

  const typeLabels = {
    All: 'All',
    PublicHospital: 'Public Hospitals',
    PrivateHospital: 'Private Hospitals',
    PublicClinic: 'Clinics',
    Pharmacy: 'Pharmacies',
    Emergency: 'Emergency'
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'PublicHospital':
        return theme.colors.info;
      case 'PrivateHospital':
        return theme.colors.primary;
      case 'PublicClinic':
        return theme.colors.success;
      case 'Pharmacy':
        return theme.colors.warning;
      case 'Emergency':
        return theme.colors.error;
      default:
        return theme.colors.textSecondary;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'PublicHospital':
        return 'business-outline';
      case 'PrivateHospital':
        return 'medical-outline';
      case 'PublicClinic':
        return 'heart-outline';
      case 'Pharmacy':
        return 'flask-outline';
      case 'Emergency':
        return 'warning-outline';
      default:
        return 'help-outline';
    }
  };

  const filterFacilities = useCallback(() => {
    let filtered = facilities;

    // Filter by type
    if (selectedType !== 'All') {
      filtered = filtered.filter(facility => facility.type === selectedType);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(facility => 
        facility.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        facility.address.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        facility.services.some(service => 
          service.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Sort by distance
    filtered.sort((a, b) => (a.distance || 0) - (b.distance || 0));

    setFilteredFacilities(filtered);
  }, [searchQuery, selectedType, facilities]);

  useEffect(() => {
    filterFacilities();
  }, [filterFacilities]);

  const makePhoneCall = (phoneNumber: string) => {
    const url = `tel:${phoneNumber}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        }
      })
      .catch((err) => console.error('Error opening phone app:', err));
  };

  const openDirections = (facility: HealthFacility) => {
    const { latitude, longitude } = facility.coordinates;
    const url = Platform.select({
      ios: `maps:${latitude},${longitude}`,
      android: `geo:${latitude},${longitude}`,
    });
    
    if (url) {
      Linking.canOpenURL(url)
        .then((supported) => {
          if (supported) {
            return Linking.openURL(url);
          }
        })
        .catch((err) => console.error('Error opening maps:', err));
    }
  };

  const renderFacility = (facility: HealthFacility) => (
    <ThemedGlassCard key={facility.id} style={styles.facilityCard}>
      <View style={styles.facilityHeader}>
        <View style={styles.facilityInfo}>
          <View style={styles.nameContainer}>
            <View style={[styles.typeIconContainer, { backgroundColor: getTypeColor(facility.type) + '20' }]}>
              <Ionicons name={getTypeIcon(facility.type) as any} size={20} color={getTypeColor(facility.type)} />
            </View>
            <Text style={styles.facilityName}>{facility.name}</Text>
          </View>
          <View style={[
            styles.statusBadge,
            { backgroundColor: facility.isOpen ? theme.colors.success : theme.colors.error }
          ]}>
            <Text style={styles.statusText}>{facility.isOpen ? 'Open' : 'Closed'}</Text>
          </View>
        </View>
      </View>

      <View style={styles.facilityDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.detailText}>
            {facility.address.street}, {facility.address.city}
          </Text>
          {facility.distance && (
            <Text style={styles.distanceText}>{facility.distance} km</Text>
          )}
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="list-outline" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.detailText}>
            {facility.services.slice(0, 3).join(', ')}
            {facility.services.length > 3 && ` +${facility.services.length - 3} more`}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.detailText}>
            {facility.operatingHours[0]?.openTime} - {facility.operatingHours[0]?.closeTime}
          </Text>
        </View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.callButton]}
          onPress={() => makePhoneCall(facility.phone)}
        >
          <Ionicons name="call" size={16} color={theme.colors.white} />
          <Text style={styles.callButtonText}>Call</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.directionsButton]}
          onPress={() => openDirections(facility)}
        >
          <Ionicons name="navigate" size={16} color={theme.colors.primary} />
          <Text style={[styles.actionButtonText, { color: theme.colors.primary }]}>Directions</Text>
        </TouchableOpacity>
      </View>
    </ThemedGlassCard>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      <LinearGradient
        colors={theme.gradients.primary as [string, string]}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.white} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Ionicons name="business" size={24} color={theme.colors.white} />
            <Text style={styles.headerTitle}>Health Directory</Text>
          </View>
          <View style={styles.headerRight} />
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search facilities..."
              placeholderTextColor={theme.colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* Filter Tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filterTabs}
          contentContainerStyle={styles.filterTabsContent}
        >
          {facilityTypes.map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.filterTab,
                selectedType === type && styles.activeFilterTab
              ]}
              onPress={() => setSelectedType(type)}
            >
              <Ionicons name="funnel-outline" size={16} color={theme.colors.primary} />
              <Text style={[
                styles.filterTabText,
                selectedType === type && styles.activeFilterTabText
              ]}>
                {typeLabels[type as keyof typeof typeLabels]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Results */}
        <ScrollView 
          style={styles.resultsContainer}
          contentContainerStyle={styles.resultsContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.resultsTitle}>
            {filteredFacilities.length} facilities found
          </Text>
          
          {filteredFacilities.map(renderFacility)}
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.white,
    marginLeft: 8,
  },
  headerRight: {
    width: 40,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: theme.colors.textPrimary,
  },
  filterTabs: {
    marginTop: 10,
  },
  filterTabsContent: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginRight: 10,
  },
  activeFilterTab: {
    backgroundColor: theme.colors.white,
  },
  filterTabText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.white,
  },
  activeFilterTabText: {
    color: theme.colors.primary,
  },
  resultsContainer: {
    flex: 1,
  },
  resultsContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.white,
    marginBottom: 15,
  },
  facilityCard: {
    marginBottom: 16,
    padding: 16,
  },
  facilityHeader: {
    marginBottom: 12,
  },
  facilityInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  typeIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  facilityName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.white,
  },
  facilityDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  distanceText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  callButton: {
    backgroundColor: theme.colors.primary,
  },
  directionsButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  callButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.white,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
