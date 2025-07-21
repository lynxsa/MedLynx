import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import DoctorCard from '../../components/DoctorCard';
import { useTheme } from '../../contexts/ThemeContext';
import { useThemedStyles } from '../../hooks/useThemedStyles';

// Import the same doctor data structure from home
interface Doctor {
  id: string;
  name: string;
  specialization: string;
  rating: number;
  experience: string;
  avatar: any;
  availability: string;
  location: string;
  consultationFee: string;
  address: string;
  phone: string;
  email: string;
  qualifications: string[];
  languages: string[];
  availableTimes: string[];
  conditions: string[];
  ethnicity?: string;
}

// Complete doctors list - same as home page
const ALL_DOCTORS: Doctor[] = [
  {
    id: '1',
    name: 'Dr. Thandiwe Mthembu',
    specialization: 'General Practitioner',
    rating: 4.9,
    experience: '12 years',
    avatar: require('../../assets/images/MedLynx-01.jpeg'),
    availability: 'Available Today',
    location: 'Nearby - 0.8km',
    consultationFee: 'R600',
    address: '123 Nelson Mandela Drive, Sandton, Johannesburg, 2196',
    phone: '+27 11 555 0001',
    email: 'dr.mthembu@medlynx.co.za',
    qualifications: ['MBChB (Wits)', 'Family Medicine Diploma'],
    languages: ['English', 'Zulu', 'Afrikaans'],
    availableTimes: ['09:00', '11:00', '14:00', '16:00'],
    conditions: ['General Health', 'Chronic Disease Management', 'Preventive Care', 'Health Screening'],
    ethnicity: 'Black African'
  },
  {
    id: '2',
    name: 'Dr. Sipho Ndaba',
    specialization: 'Cardiologist',
    rating: 4.8,
    experience: '15 years',
    avatar: require('../../assets/images/MedLynx-02.jpeg'),
    availability: 'Available Today',
    location: 'Nearby - 1.2km',
    consultationFee: 'R850',
    address: '456 Jan Smuts Avenue, Rosebank, Johannesburg, 2196',
    phone: '+27 11 555 0002',
    email: 'dr.ndaba@medlynx.co.za',
    qualifications: ['MBChB (UCT)', 'MMed Cardiology', 'FCP(SA)'],
    languages: ['English', 'Zulu', 'Sotho'],
    availableTimes: ['08:00', '10:30', '13:00', '15:30'],
    conditions: ['Heart Disease', 'Hypertension', 'Chest Pain', 'Cardiac Risk Assessment'],
    ethnicity: 'Black African'
  },
  {
    id: '3',
    name: 'Dr. Nomsa Zulu',
    specialization: 'Pediatrician',
    rating: 4.9,
    experience: '10 years',
    avatar: require('../../assets/images/MedLynx-03.jpeg'),
    availability: 'Next Available: Tomorrow',
    location: 'Nearby - 2.1km',
    consultationFee: 'R750',
    address: '789 Oxford Road, Parktown, Johannesburg, 2193',
    phone: '+27 11 555 0003',
    email: 'dr.zulu@medlynx.co.za',
    qualifications: ['MBChB (UKZN)', 'MMed Paediatrics', 'DCH'],
    languages: ['English', 'Zulu', 'Xhosa'],
    availableTimes: ['09:30', '11:30', '14:30', '16:30'],
    conditions: ['Child Health', 'Vaccinations', 'Growth & Development', 'Pediatric Emergencies'],
    ethnicity: 'Black African'
  },
  {
    id: '4',
    name: 'Dr. Priya Sharma',
    specialization: 'Dermatologist',
    rating: 4.8,
    experience: '13 years',
    avatar: require('../../assets/images/MedLynx-04.jpeg'),
    availability: 'Available Today',
    location: 'Nearby - 1.8km',
    consultationFee: 'R950',
    address: '321 Rivonia Road, Sandton, Johannesburg, 2196',
    phone: '+27 11 555 0004',
    email: 'dr.sharma@medlynx.co.za',
    qualifications: ['MBBS (Delhi)', 'MD Dermatology', 'HPCSA Registered'],
    languages: ['English', 'Hindi', 'Afrikaans'],
    availableTimes: ['08:30', '10:00', '13:30', '15:00'],
    conditions: ['Skin Conditions', 'Acne Treatment', 'Skin Cancer Screening', 'Cosmetic Dermatology'],
    ethnicity: 'Indian'
  },
  {
    id: '5',
    name: 'Dr. Sarah Johnson',
    specialization: 'Gynecologist',
    rating: 4.9,
    experience: '16 years',
    avatar: require('../../assets/images/MedLynx-05.jpeg'),
    availability: 'Available Tomorrow',
    location: 'Nearby - 2.5km',
    consultationFee: 'R800',
    address: '654 William Nicol Drive, Fourways, Johannesburg, 2055',
    phone: '+27 11 555 0005',
    email: 'dr.johnson@medlynx.co.za',
    qualifications: ['MBChB (Wits)', 'MMed O&G', 'FCOG(SA)'],
    languages: ['English', 'Afrikaans'],
    availableTimes: ['09:00', '11:00', '14:00', '16:00'],
    conditions: ['Women\'s Health', 'Pregnancy Care', 'Fertility Issues', 'Gynecological Surgery'],
    ethnicity: 'White'
  },
  {
    id: '6',
    name: 'Dr. Rajesh Patel',
    specialization: 'Psychiatrist',
    rating: 4.7,
    experience: '18 years',
    avatar: require('../../assets/images/MedLynx-06.jpeg'),
    availability: 'Available This Week',
    location: 'Nearby - 3.1km',
    consultationFee: 'R900',
    address: '987 Main Road, Melville, Johannesburg, 2109',
    phone: '+27 11 555 0006',
    email: 'dr.patel@medlynx.co.za',
    qualifications: ['MBBS (Mumbai)', 'MD Psychiatry', 'MRCPsych'],
    languages: ['English', 'Hindi', 'Gujarati'],
    availableTimes: ['08:00', '10:00', '13:00', '15:00', '17:00'],
    conditions: ['Mental Health', 'Depression', 'Anxiety', 'Therapy & Counseling'],
    ethnicity: 'Indian'
  },
  {
    id: '7',
    name: 'Dr. Michael van der Merwe',
    specialization: 'Orthopedic Surgeon',
    rating: 4.8,
    experience: '20 years',
    avatar: require('../../assets/images/MedLynx-01.jpeg'),
    availability: 'Available Today',
    location: 'Nearby - 4.2km',
    consultationFee: 'R1200',
    address: '147 Barry Hertzog Avenue, Emmarentia, Johannesburg, 2195',
    phone: '+27 11 555 0007',
    email: 'dr.vandermerwe@medlynx.co.za',
    qualifications: ['MBChB (Stellenbosch)', 'MMed Orthopaedics', 'FCS Orth(SA)'],
    languages: ['English', 'Afrikaans'],
    availableTimes: ['07:30', '09:30', '12:00', '14:30'],
    conditions: ['Bone & Joint Problems', 'Sports Injuries', 'Fractures', 'Joint Replacement'],
    ethnicity: 'White'
  },
  {
    id: '8',
    name: 'Dr. Kavitha Reddy',
    specialization: 'Neurologist',
    rating: 4.9,
    experience: '14 years',
    avatar: require('../../assets/images/MedLynx-02.jpeg'),
    availability: 'Available Tomorrow',
    location: 'Nearby - 2.9km',
    consultationFee: 'R1100',
    address: '258 Witkoppen Road, Paulshof, Johannesburg, 2056',
    phone: '+27 11 555 0008',
    email: 'dr.reddy@medlynx.co.za',
    qualifications: ['MBBS (Hyderabad)', 'DM Neurology', 'MRCP'],
    languages: ['English', 'Telugu', 'Hindi'],
    availableTimes: ['08:30', '10:30', '13:30', '15:30'],
    conditions: ['Neurological Disorders', 'Headaches', 'Epilepsy', 'Stroke Care'],
    ethnicity: 'Indian'
  }
];

const SPECIALIZATIONS = [
  'All',
  'General Practitioner',
  'Cardiologist',
  'Pediatrician',
  'Dermatologist',
  'Gynecologist',
  'Psychiatrist',
  'Orthopedic Surgeon',
  'Neurologist'
];

export default function DoctorsListScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const colors = theme.colors;
  const styles = useThemedStyles(createStyles);
  
  const [searchText, setSearchText] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('All');
  const [filteredDoctors, setFilteredDoctors] = useState(ALL_DOCTORS);

  const filterDoctors = useCallback(() => {
    let filtered = ALL_DOCTORS;

    // Filter by specialization
    if (selectedSpecialization !== 'All') {
      filtered = filtered.filter(doctor => 
        doctor.specialization === selectedSpecialization
      );
    }

    // Filter by search text
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(doctor =>
        doctor.name.toLowerCase().includes(searchLower) ||
        doctor.specialization.toLowerCase().includes(searchLower) ||
        doctor.location.toLowerCase().includes(searchLower)
      );
    }

    setFilteredDoctors(filtered);
  }, [searchText, selectedSpecialization]);

  useEffect(() => {
    filterDoctors();
  }, [filterDoctors]);

  const handleDoctorPress = (doctor: Doctor) => {
    // Navigate to booking screen for appointment
    router.push('/doctor-booking' as any);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar 
        barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} 
        backgroundColor={colors.background}
      />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          Medical Professionals
        </Text>
        <View style={styles.headerRight} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Search doctors..."
            placeholderTextColor={colors.textSecondary}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </View>

      {/* Specialization Filter */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {SPECIALIZATIONS.map((specialization) => (
          <TouchableOpacity
            key={specialization}
            style={[
              styles.filterButton,
              {
                backgroundColor: selectedSpecialization === specialization 
                  ? colors.primary 
                  : colors.surface,
                borderColor: colors.border
              }
            ]}
            onPress={() => setSelectedSpecialization(specialization)}
          >
            <Text style={[
              styles.filterButtonText,
              {
                color: selectedSpecialization === specialization 
                  ? '#FFFFFF' 
                  : colors.textPrimary
              }
            ]}>
              {specialization}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Results Header */}
      <View style={styles.resultsHeader}>
        <Text style={[styles.resultsCount, { color: colors.textPrimary }]}>
          {filteredDoctors.length} {filteredDoctors.length === 1 ? 'Doctor' : 'Doctors'} Found
        </Text>
      </View>

      {/* Doctors List */}
      <ScrollView 
        style={styles.doctorsList}
        contentContainerStyle={styles.doctorsListContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredDoctors.map((doctor) => (
          <DoctorCard
            key={doctor.id}
            doctor={doctor}
            onPress={handleDoctorPress}
            variant="list"
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerRight: {
    width: 40,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  filterContainer: {
    paddingLeft: 20,
    marginBottom: 16,
  },
  filterContent: {
    paddingRight: 20,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  resultsHeader: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  resultsCount: {
    fontSize: 16,
    fontWeight: '600',
  },
  doctorsList: {
    flex: 1,
  },
  doctorsListContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
});
