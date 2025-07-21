import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    FlatList,
    Linking,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StandardHeader } from '../../components/StandardHeader';
import { useTheme } from '../../contexts/ThemeContext';

interface HealthFacility {
  id: string;
  name: string;
  type: 'Hospital' | 'Clinic' | 'Pharmacy' | 'Laboratory' | 'Specialist';
  address: string;
  phone: string;
  email?: string;
  website?: string;
  rating: number;
  distance: string;
  isOpen: boolean;
  operatingHours: string;
  services: string[];
  emergencyServices: boolean;
}

const southAfricanFacilities: HealthFacility[] = [
  // ========== GAUTENG - JOHANNESBURG & PRETORIA ==========
  
  // HOSPITALS
  {
    id: '1',
    name: 'Charlotte Maxeke Johannesburg Academic Hospital',
    type: 'Hospital',
    address: '17 Jubilee Road, Parktown, Johannesburg',
    phone: '+27 11 488 4911',
    email: 'info@cmjah.org.za',
    website: 'https://www.wits.ac.za/cmjah/',
    rating: 4.2,
    distance: '2.3 km',
    isOpen: true,
    operatingHours: '24/7',
    services: ['Emergency', 'Surgery', 'Maternity', 'Pediatrics', 'Cardiology'],
    emergencyServices: true
  },
  {
    id: '2',
    name: 'Sandton Mediclinic',
    type: 'Hospital',
    address: 'Peter Place, Sandton, Johannesburg',
    phone: '+27 11 709 2000',
    email: 'sandton@mediclinic.co.za',
    website: 'https://www.mediclinic.co.za',
    rating: 4.7,
    distance: '1.8 km',
    isOpen: true,
    operatingHours: '24/7',
    services: ['Emergency', 'Surgery', 'Radiology', 'Oncology', 'Orthopedics'],
    emergencyServices: true
  },
  {
    id: '3',
    name: 'Life Fourways Hospital',
    type: 'Hospital',
    address: 'Cedar Avenue, Fourways, Sandton',
    phone: '+27 11 875 1000',
    email: 'fourways@lifehealthcare.co.za',
    website: 'https://www.lifehealthcare.co.za',
    rating: 4.5,
    distance: '4.1 km',
    isOpen: true,
    operatingHours: '24/7',
    services: ['Emergency', 'Maternity', 'ICU', 'Surgery', 'Pediatrics'],
    emergencyServices: true
  },
  {
    id: '4',
    name: 'Sunninghill Hospital',
    type: 'Hospital',
    address: 'Hobart Road, Sunninghill, Sandton',
    phone: '+27 11 806 1500',
    email: 'info@sunninghill.co.za',
    rating: 4.6,
    distance: '2.9 km',
    isOpen: true,
    operatingHours: '24/7',
    services: ['Emergency', 'Cardiology', 'Neurology', 'Orthopedics', 'Oncology'],
    emergencyServices: true
  },
  {
    id: '5',
    name: 'Ahmed Kathrada Private Hospital',
    type: 'Hospital',
    address: '1 Azia Road, Lenasia South, Johannesburg',
    phone: '+27 11 854 5000',
    rating: 4.3,
    distance: '18.7 km',
    isOpen: true,
    operatingHours: '24/7',
    services: ['Emergency', 'Surgery', 'Maternity', 'ICU', 'Dialysis'],
    emergencyServices: true
  },
  {
    id: '6',
    name: 'Chris Hani Baragwanath Academic Hospital',
    type: 'Hospital',
    address: 'Chris Hani Baragwanath Road, Diepkloof, Soweto',
    phone: '+27 11 933 0111',
    rating: 3.9,
    distance: '25.4 km',
    isOpen: true,
    operatingHours: '24/7',
    services: ['Emergency', 'Trauma', 'Surgery', 'Pediatrics', 'Obstetrics'],
    emergencyServices: true
  },
  {
    id: '7',
    name: 'Helen Joseph Hospital',
    type: 'Hospital',
    address: 'Perth Road, Auckland Park, Johannesburg',
    phone: '+27 11 276 8000',
    rating: 3.8,
    distance: '8.2 km',
    isOpen: true,
    operatingHours: '24/7',
    services: ['Emergency', 'Internal Medicine', 'Surgery', 'Psychiatry'],
    emergencyServices: true
  },
  {
    id: '8',
    name: 'Steve Biko Academic Hospital',
    type: 'Hospital',
    address: 'Malherbe Street, Pretoria',
    phone: '+27 12 354 1000',
    rating: 4.0,
    distance: '52.1 km',
    isOpen: true,
    operatingHours: '24/7',
    services: ['Emergency', 'Cardiology', 'Neurology', 'Transplant Unit'],
    emergencyServices: true
  },
  {
    id: '9',
    name: 'Netcare Milpark Hospital',
    type: 'Hospital',
    address: '9 Guild Road, Parktown West, Johannesburg',
    phone: '+27 11 480 7111',
    rating: 4.6,
    distance: '4.8 km',
    isOpen: true,
    operatingHours: '24/7',
    services: ['Emergency', 'Cardiology', 'Oncology', 'Surgery', 'ICU'],
    emergencyServices: true
  },
  {
    id: '10',
    name: 'Mediclinic Morningside',
    type: 'Hospital',
    address: '20 Lyme Park, Morningside, Sandton',
    phone: '+27 11 282 2000',
    rating: 4.5,
    distance: '3.7 km',
    isOpen: true,
    operatingHours: '24/7',
    services: ['Emergency', 'Maternity', 'Surgery', 'Radiology'],
    emergencyServices: true
  },

  // CLINICS
  {
    id: '11',
    name: 'Sandton Day Hospital',
    type: 'Clinic',
    address: '196 Witkoppen Road, Fourways',
    phone: '+27 11 875 3000',
    rating: 4.4,
    distance: '5.2 km',
    isOpen: true,
    operatingHours: '07:00 - 19:00',
    services: ['General Practice', 'Minor Surgery', 'X-Rays', 'Pathology'],
    emergencyServices: false
  },
  {
    id: '12',
    name: 'Rosebank Medical Centre',
    type: 'Clinic',
    address: 'The Zone Shopping Centre, Rosebank',
    phone: '+27 11 447 9200',
    rating: 4.2,
    distance: '6.8 km',
    isOpen: true,
    operatingHours: '08:00 - 17:00',
    services: ['General Practice', 'Pediatrics', 'Dermatology', 'Wellness'],
    emergencyServices: false
  },
  {
    id: '13',
    name: 'Morningside Clinic',
    type: 'Clinic',
    address: 'Rivonia Boulevard, Morningside',
    phone: '+27 11 884 0160',
    rating: 4.3,
    distance: '2.9 km',
    isOpen: true,
    operatingHours: '08:00 - 17:00',
    services: ['General Practice', 'Occupational Health', 'Travel Medicine'],
    emergencyServices: false
  },
  {
    id: '14',
    name: 'Centurion Medical Centre',
    type: 'Clinic',
    address: 'Heuwel Road, Centurion',
    phone: '+27 12 663 3400',
    rating: 4.1,
    distance: '48.5 km',
    isOpen: true,
    operatingHours: '07:30 - 17:30',
    services: ['General Practice', 'Family Medicine', 'Chronic Care'],
    emergencyServices: false
  },
  {
    id: '15',
    name: 'Randburg Medical Centre',
    type: 'Clinic',
    address: 'Eton Avenue, Randburg',
    phone: '+27 11 789 1200',
    rating: 4.0,
    distance: '12.3 km',
    isOpen: true,
    operatingHours: '08:00 - 17:00',
    services: ['General Practice', 'Minor Surgery', 'Wellness Screening'],
    emergencyServices: false
  },

  // PHARMACIES
  {
    id: '16',
    name: 'Clicks Pharmacy - Sandton City',
    type: 'Pharmacy',
    address: 'Sandton City Shopping Centre, Sandton',
    phone: '+27 11 784 7500',
    rating: 4.4,
    distance: '1.2 km',
    isOpen: true,
    operatingHours: '08:00 - 21:00',
    services: ['Prescription', 'OTC Medicines', 'Health Screening', 'Vaccinations'],
    emergencyServices: false
  },
  {
    id: '17',
    name: 'Dis-Chem Pharmacy - Rosebank',
    type: 'Pharmacy',
    address: 'The Zone Shopping Centre, Rosebank',
    phone: '+27 11 447 3000',
    rating: 4.3,
    distance: '3.2 km',
    isOpen: true,
    operatingHours: '08:00 - 20:00',
    services: ['Prescription', 'Health Products', 'Beauty', 'Wellness Clinic'],
    emergencyServices: false
  },
  {
    id: '18',
    name: 'Clicks Pharmacy - Fourways Mall',
    type: 'Pharmacy',
    address: 'Fourways Mall, Witkoppen Road',
    phone: '+27 11 465 0890',
    rating: 4.2,
    distance: '8.9 km',
    isOpen: true,
    operatingHours: '09:00 - 21:00',
    services: ['Prescription', 'Chronic Medicines', 'Baby Care', 'Vitamins'],
    emergencyServices: false
  },
  {
    id: '19',
    name: 'Dis-Chem Pharmacy - Menlyn',
    type: 'Pharmacy',
    address: 'Menlyn Park Shopping Centre, Pretoria',
    phone: '+27 12 348 4500',
    rating: 4.5,
    distance: '50.2 km',
    isOpen: true,
    operatingHours: '08:00 - 21:00',
    services: ['Prescription', 'Chronic Care', 'Health Screening', 'Beauty'],
    emergencyServices: false
  },
  {
    id: '20',
    name: 'Alpha Pharm - Hyde Park',
    type: 'Pharmacy',
    address: 'Hyde Park Corner, Jan Smuts Avenue',
    phone: '+27 11 325 4400',
    rating: 4.1,
    distance: '7.5 km',
    isOpen: true,
    operatingHours: '08:00 - 19:00',
    services: ['Prescription', 'Compounding', 'Medical Equipment'],
    emergencyServices: false
  },
  {
    id: '21',
    name: 'Medirite Pharmacy - Randburg',
    type: 'Pharmacy',
    address: 'Brightwater Commons, Randburg',
    phone: '+27 11 886 6400',
    rating: 4.0,
    distance: '11.8 km',
    isOpen: true,
    operatingHours: '08:00 - 18:00',
    services: ['Prescription', 'Over-the-Counter', 'Health Products'],
    emergencyServices: false
  },

  // LABORATORIES
  {
    id: '22',
    name: 'PathCare Laboratory - Sandton',
    type: 'Laboratory',
    address: '5th Street, Sandton',
    phone: '+27 11 883 3260',
    rating: 4.1,
    distance: '1.5 km',
    isOpen: true,
    operatingHours: '07:00 - 17:00',
    services: ['Blood Tests', 'Pathology', 'Radiology', 'Health Screening'],
    emergencyServices: false
  },
  {
    id: '23',
    name: 'Lancet Laboratories - Rosebank',
    type: 'Laboratory',
    address: 'The Zone Shopping Centre, Rosebank',
    phone: '+27 11 883 3000',
    rating: 4.2,
    distance: '6.2 km',
    isOpen: true,
    operatingHours: '07:00 - 16:00',
    services: ['Blood Tests', 'Biochemistry', 'Microbiology', 'Histology'],
    emergencyServices: false
  },
  {
    id: '24',
    name: 'Ampath Laboratory - Pretoria',
    type: 'Laboratory',
    address: 'Lynnwood Ridge, Pretoria',
    phone: '+27 12 348 6000',
    rating: 4.3,
    distance: '48.9 km',
    isOpen: true,
    operatingHours: '06:30 - 17:00',
    services: ['Pathology', 'Chemical Pathology', 'Cytology', 'Genetics'],
    emergencyServices: false
  },
  {
    id: '25',
    name: 'PathCare Laboratory - Fourways',
    type: 'Laboratory',
    address: 'Fourways Life Hospital, Cedar Avenue',
    phone: '+27 11 875 3500',
    rating: 4.0,
    distance: '4.8 km',
    isOpen: true,
    operatingHours: '07:00 - 16:30',
    services: ['Blood Tests', 'Urine Tests', 'ECG', 'X-Rays'],
    emergencyServices: false
  },

  // SPECIALISTS
  {
    id: '26',
    name: 'Heart Hospital - Sunninghill',
    type: 'Specialist',
    address: '12 Eton Road, Sunninghill',
    phone: '+27 11 806 1500',
    rating: 4.7,
    distance: '3.2 km',
    isOpen: true,
    operatingHours: '08:00 - 17:00',
    services: ['Cardiology', 'Heart Surgery', 'Cardiac Catheterization', 'Pacemaker'],
    emergencyServices: false
  },
  {
    id: '27',
    name: 'Johannesburg Eye Hospital',
    type: 'Specialist',
    address: 'End Street, Doornfontein',
    phone: '+27 11 644 7000',
    rating: 4.4,
    distance: '9.8 km',
    isOpen: true,
    operatingHours: '08:00 - 16:00',
    services: ['Ophthalmology', 'Eye Surgery', 'Retinal Treatment', 'Glaucoma'],
    emergencyServices: false
  },
  {
    id: '28',
    name: 'Orthopaedic Clinic - Morningside',
    type: 'Specialist',
    address: 'Rivonia Boulevard, Morningside',
    phone: '+27 11 884 0200',
    rating: 4.5,
    distance: '2.8 km',
    isOpen: true,
    operatingHours: '08:00 - 17:00',
    services: ['Orthopedics', 'Sports Medicine', 'Joint Replacement', 'Physiotherapy'],
    emergencyServices: false
  },

  // ========== WESTERN CAPE - CAPE TOWN ==========

  // HOSPITALS
  {
    id: '29',
    name: 'Groote Schuur Hospital',
    type: 'Hospital',
    address: 'Main Road, Observatory, Cape Town',
    phone: '+27 21 404 9111',
    rating: 4.4,
    distance: '1200 km',
    isOpen: true,
    operatingHours: '24/7',
    services: ['Emergency', 'Trauma', 'Heart Transplant', 'Neurosurgery'],
    emergencyServices: true
  },
  {
    id: '30',
    name: 'Tygerberg Hospital',
    type: 'Hospital',
    address: 'Francie van Zijl Drive, Parow',
    phone: '+27 21 938 4911',
    rating: 4.2,
    distance: '1215 km',
    isOpen: true,
    operatingHours: '24/7',
    services: ['Emergency', 'Surgery', 'Pediatrics', 'Oncology'],
    emergencyServices: true
  },
  {
    id: '31',
    name: 'Mediclinic Cape Town',
    type: 'Hospital',
    address: 'Hof Street, Oranjezicht, Cape Town',
    phone: '+27 21 464 5500',
    rating: 4.6,
    distance: '1205 km',
    isOpen: true,
    operatingHours: '24/7',
    services: ['Emergency', 'Cardiology', 'Surgery', 'Maternity'],
    emergencyServices: true
  },
  {
    id: '32',
    name: 'Vincent Pallotti Hospital',
    type: 'Hospital',
    address: 'Alexandra Road, Pinelands, Cape Town',
    phone: '+27 21 506 5111',
    rating: 4.3,
    distance: '1210 km',
    isOpen: true,
    operatingHours: '24/7',
    services: ['Emergency', 'Surgery', 'Maternity', 'Radiology'],
    emergencyServices: true
  },

  // CLINICS
  {
    id: '33',
    name: 'Claremont Medical Centre',
    type: 'Clinic',
    address: 'Main Road, Claremont, Cape Town',
    phone: '+27 21 671 4400',
    rating: 4.3,
    distance: '1208 km',
    isOpen: true,
    operatingHours: '08:00 - 17:00',
    services: ['General Practice', 'Family Medicine', 'Travel Clinic'],
    emergencyServices: false
  },
  {
    id: '34',
    name: 'Bellville Medical Centre',
    type: 'Clinic',
    address: 'Voortrekker Road, Bellville',
    phone: '+27 21 949 8200',
    rating: 4.1,
    distance: '1220 km',
    isOpen: true,
    operatingHours: '07:30 - 17:30',
    services: ['General Practice', 'Occupational Health', 'Minor Surgery'],
    emergencyServices: false
  },

  // PHARMACIES
  {
    id: '35',
    name: 'Clicks Pharmacy - V&A Waterfront',
    type: 'Pharmacy',
    address: 'V&A Waterfront, Cape Town',
    phone: '+27 21 419 0601',
    rating: 4.5,
    distance: '1202 km',
    isOpen: true,
    operatingHours: '09:00 - 21:00',
    services: ['Prescription', 'Chronic Medicines', 'Health Screening'],
    emergencyServices: false
  },
  {
    id: '36',
    name: 'Dis-Chem Pharmacy - Canal Walk',
    type: 'Pharmacy',
    address: 'Canal Walk Shopping Centre, Century City',
    phone: '+27 21 555 3400',
    rating: 4.4,
    distance: '1218 km',
    isOpen: true,
    operatingHours: '08:00 - 21:00',
    services: ['Prescription', 'Health Products', 'Beauty', 'Wellness'],
    emergencyServices: false
  },

  // LABORATORIES
  {
    id: '37',
    name: 'PathCare Laboratory - Cape Town',
    type: 'Laboratory',
    address: 'Wale Street, Cape Town',
    phone: '+27 21 423 0000',
    rating: 4.2,
    distance: '1203 km',
    isOpen: true,
    operatingHours: '07:00 - 17:00',
    services: ['Blood Tests', 'Pathology', 'Microbiology', 'Chemistry'],
    emergencyServices: false
  },

  // ========== KWAZULU-NATAL - DURBAN ==========

  // HOSPITALS
  {
    id: '38',
    name: 'Inkosi Albert Luthuli Central Hospital',
    type: 'Hospital',
    address: '800 Bellair Road, Cato Manor, Durban',
    phone: '+27 31 240 2111',
    rating: 4.1,
    distance: '550 km',
    isOpen: true,
    operatingHours: '24/7',
    services: ['Emergency', 'Cardiology', 'Transplant', 'Neurosurgery'],
    emergencyServices: true
  },
  {
    id: '39',
    name: 'Addington Hospital',
    type: 'Hospital',
    address: 'Erskine Terrace, South Beach, Durban',
    phone: '+27 31 327 2000',
    rating: 3.8,
    distance: '555 km',
    isOpen: true,
    operatingHours: '24/7',
    services: ['Emergency', 'Trauma', 'Surgery', 'Internal Medicine'],
    emergencyServices: true
  },
  {
    id: '40',
    name: 'Mediclinic Durban',
    type: 'Hospital',
    address: 'Argyle Road, Durban',
    phone: '+27 31 268 3000',
    rating: 4.5,
    distance: '548 km',
    isOpen: true,
    operatingHours: '24/7',
    services: ['Emergency', 'Surgery', 'Maternity', 'Cardiology'],
    emergencyServices: true
  },

  // CLINICS
  {
    id: '41',
    name: 'Umhlanga Medical Centre',
    type: 'Clinic',
    address: 'Chartwell Drive, Umhlanga',
    phone: '+27 31 561 2300',
    rating: 4.4,
    distance: '560 km',
    isOpen: true,
    operatingHours: '07:30 - 17:30',
    services: ['General Practice', 'Specialist Consultations', 'Radiology'],
    emergencyServices: false
  },
  {
    id: '42',
    name: 'Westville Medical Centre',
    type: 'Clinic',
    address: 'Jan Hofmeyr Road, Westville',
    phone: '+27 31 266 6000',
    rating: 4.2,
    distance: '545 km',
    isOpen: true,
    operatingHours: '08:00 - 17:00',
    services: ['General Practice', 'Family Medicine', 'Wellness'],
    emergencyServices: false
  },

  // PHARMACIES
  {
    id: '43',
    name: 'Clicks Pharmacy - Gateway Theatre',
    type: 'Pharmacy',
    address: 'Gateway Theatre of Shopping, Umhlanga',
    phone: '+27 31 566 2300',
    rating: 4.3,
    distance: '562 km',
    isOpen: true,
    operatingHours: '09:00 - 21:00',
    services: ['Prescription', 'Chronic Care', 'Health Screening'],
    emergencyServices: false
  },
  {
    id: '44',
    name: 'Dis-Chem Pharmacy - Pavilion',
    type: 'Pharmacy',
    address: 'Pavilion Shopping Centre, Westville',
    phone: '+27 31 265 0800',
    rating: 4.4,
    distance: '545 km',
    isOpen: true,
    operatingHours: '08:00 - 20:00',
    services: ['Prescription', 'Health Products', 'Baby Care'],
    emergencyServices: false
  },

  // LABORATORIES
  {
    id: '45',
    name: 'Lancet Laboratories - Durban',
    type: 'Laboratory',
    address: 'Musgrave Road, Durban',
    phone: '+27 31 308 8000',
    rating: 4.1,
    distance: '552 km',
    isOpen: true,
    operatingHours: '07:00 - 16:00',
    services: ['Blood Tests', 'Pathology', 'Radiology', 'Genetics'],
    emergencyServices: false
  },

  // ========== EASTERN CAPE - PORT ELIZABETH & EAST LONDON ==========

  // HOSPITALS
  {
    id: '46',
    name: 'Livingstone Hospital',
    type: 'Hospital',
    address: 'Stanford Road, Port Elizabeth',
    phone: '+27 41 405 2911',
    rating: 3.9,
    distance: '750 km',
    isOpen: true,
    operatingHours: '24/7',
    services: ['Emergency', 'Surgery', 'Internal Medicine', 'Pediatrics'],
    emergencyServices: true
  },
  {
    id: '47',
    name: 'Frere Hospital',
    type: 'Hospital',
    address: 'Amalinda, East London',
    phone: '+27 43 709 2000',
    rating: 3.7,
    distance: '650 km',
    isOpen: true,
    operatingHours: '24/7',
    services: ['Emergency', 'Trauma', 'Surgery', 'Maternity'],
    emergencyServices: true
  },
  {
    id: '48',
    name: 'Mediclinic Port Elizabeth',
    type: 'Hospital',
    address: 'Heugh Road, Walmer, Port Elizabeth',
    phone: '+27 41 392 0111',
    rating: 4.3,
    distance: '755 km',
    isOpen: true,
    operatingHours: '24/7',
    services: ['Emergency', 'Surgery', 'Cardiology', 'Oncology'],
    emergencyServices: true
  },

  // PHARMACIES
  {
    id: '49',
    name: 'Clicks Pharmacy - Baywest Mall',
    type: 'Pharmacy',
    address: 'Baywest Mall, Port Elizabeth',
    phone: '+27 41 001 2300',
    rating: 4.2,
    distance: '758 km',
    isOpen: true,
    operatingHours: '09:00 - 21:00',
    services: ['Prescription', 'Health Products', 'Chronic Care'],
    emergencyServices: false
  },
  {
    id: '50',
    name: 'Dis-Chem Pharmacy - Vincent Park',
    type: 'Pharmacy',
    address: 'Vincent Park Shopping Centre, East London',
    phone: '+27 43 726 8000',
    rating: 4.1,
    distance: '653 km',
    isOpen: true,
    operatingHours: '08:00 - 20:00',
    services: ['Prescription', 'Health Screening', 'Beauty'],
    emergencyServices: false
  }
];

const facilityCategories = [
  { id: 'all', name: 'All', icon: 'grid-outline' },
  { id: 'Hospital', name: 'Hospitals', icon: 'medical-outline' },
  { id: 'Clinic', name: 'Clinics', icon: 'business-outline' },
  { id: 'Pharmacy', name: 'Pharmacies', icon: 'medical-outline' },
  { id: 'Laboratory', name: 'Labs', icon: 'flask-outline' },
  { id: 'Specialist', name: 'Specialists', icon: 'person-outline' }
];

export default function HealthFacilitiesScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showEmergencyOnly, setShowEmergencyOnly] = useState(false);

  const filteredFacilities = southAfricanFacilities.filter(facility => {
    const matchesSearch = facility.name.toLowerCase().includes(searchText.toLowerCase()) ||
                         facility.address.toLowerCase().includes(searchText.toLowerCase()) ||
                         facility.services.some(service => 
                           service.toLowerCase().includes(searchText.toLowerCase())
                         );
    const matchesCategory = selectedCategory === 'all' || facility.type === selectedCategory;
    const matchesEmergency = !showEmergencyOnly || facility.emergencyServices;
    
    return matchesSearch && matchesCategory && matchesEmergency;
  });

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleEmail = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  const handleWebsite = (website: string) => {
    Linking.openURL(website);
  };

  const handleDirections = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    Linking.openURL(`https://maps.google.com/maps?q=${encodedAddress}`);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Hospital': return '#E74C3C';
      case 'Clinic': return '#3498DB';
      case 'Pharmacy': return '#27AE60';
      case 'Laboratory': return '#9B59B6';
      case 'Specialist': return '#F39C12';
      default: return theme.colors.primary;
    }
  };

  const renderFacility = ({ item: facility }: { item: HealthFacility }) => (
    <View style={[styles.facilityCard, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.facilityHeader}>
        <View style={styles.facilityMainInfo}>
          <View style={[styles.typeBadge, { backgroundColor: getTypeColor(facility.type) }]}>
            <Text style={styles.typeBadgeText}>{facility.type}</Text>
          </View>
          <Text style={[styles.facilityName, { color: theme.colors.textPrimary }]} numberOfLines={2}>
            {facility.name}
          </Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={[styles.rating, { color: theme.colors.textPrimary }]}>{facility.rating}</Text>
            <Text style={[styles.distance, { color: theme.colors.textSecondary }]}>• {facility.distance}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: facility.isOpen ? '#27AE60' : '#E74C3C' }]}>
          <Text style={styles.statusText}>{facility.isOpen ? 'Open' : 'Closed'}</Text>
        </View>
      </View>

      <View style={styles.facilityDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={16} color={theme.colors.textSecondary} />
          <Text style={[styles.address, { color: theme.colors.textSecondary }]} numberOfLines={2}>
            {facility.address}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={16} color={theme.colors.textSecondary} />
          <Text style={[styles.operatingHours, { color: theme.colors.textSecondary }]}>
            {facility.operatingHours}
          </Text>
        </View>

        {facility.emergencyServices && (
          <View style={styles.emergencyBadge}>
            <Ionicons name="medical-outline" size={14} color="#E74C3C" />
            <Text style={styles.emergencyText}>Emergency Services Available</Text>
          </View>
        )}

        <View style={styles.servicesContainer}>
          <Text style={[styles.servicesLabel, { color: theme.colors.textPrimary }]}>Services:</Text>
          <View style={styles.servicesTags}>
            {facility.services.slice(0, 3).map((service, index) => (
              <View key={index} style={[styles.serviceTag, { backgroundColor: theme.colors.primary + '20' }]}>
                <Text style={[styles.serviceTagText, { color: theme.colors.primary }]}>{service}</Text>
              </View>
            ))}
            {facility.services.length > 3 && (
              <Text style={[styles.moreServices, { color: theme.colors.textSecondary }]}>
                +{facility.services.length - 3} more
              </Text>
            )}
          </View>
        </View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => handleCall(facility.phone)}
        >
          <Ionicons name="call-outline" size={16} color="white" />
          <Text style={styles.actionButtonText}>Call</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.secondaryButton, { borderColor: theme.colors.primary }]}
          onPress={() => handleDirections(facility.address)}
        >
          <Ionicons name="navigate-outline" size={16} color={theme.colors.primary} />
          <Text style={[styles.actionButtonText, { color: theme.colors.primary }]}>Directions</Text>
        </TouchableOpacity>
        
        {facility.email && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.secondaryButton, { borderColor: theme.colors.primary }]}
            onPress={() => handleEmail(facility.email!)}
          >
            <Ionicons name="mail-outline" size={16} color={theme.colors.primary} />
          </TouchableOpacity>
        )}
        
        {facility.website && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.secondaryButton, { borderColor: theme.colors.primary }]}
            onPress={() => handleWebsite(facility.website!)}
          >
            <Ionicons name="globe-outline" size={16} color={theme.colors.primary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar 
        barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} 
        backgroundColor={theme.colors.background}
      />
      <StandardHeader 
        title="Healthcare Facilities"
        description="Find nearby doctors & specialists"
        showLogo={true}
      />

      {/* Back Button */}
      <View style={styles.headerActions}>
        <TouchableOpacity 
          style={[styles.backButton, { backgroundColor: theme.colors.surface }]} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color={theme.colors.textPrimary} />
          <Text style={[styles.backButtonText, { color: theme.colors.textPrimary }]}>Back to Directory</Text>
        </TouchableOpacity>
      </View>

      {/* Search and Filter Section */}
      <View style={styles.searchSection}>
        <View style={[styles.searchBar, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Ionicons name="search-outline" size={20} color={theme.colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.textPrimary }]}
            placeholder="Search facilities, services, or location"
            placeholderTextColor={theme.colors.textSecondary}
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Ionicons name="close-circle" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Emergency Toggle */}
        <TouchableOpacity
          style={[
            styles.emergencyToggle,
            { 
              backgroundColor: showEmergencyOnly ? '#E74C3C' : theme.colors.surface,
              borderColor: theme.colors.border 
            }
          ]}
          onPress={() => setShowEmergencyOnly(!showEmergencyOnly)}
        >
          <Ionicons 
            name="medical-outline" 
            size={16} 
            color={showEmergencyOnly ? 'white' : theme.colors.textPrimary} 
          />
          <Text style={[
            styles.emergencyToggleText,
            { color: showEmergencyOnly ? 'white' : theme.colors.textPrimary }
          ]}>
            Emergency
          </Text>
        </TouchableOpacity>
      </View>

      {/* Categories */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesScroll}
        contentContainerStyle={styles.categoriesContent}
      >
        {facilityCategories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              {
                backgroundColor: selectedCategory === category.id 
                  ? theme.colors.primary 
                  : theme.colors.surface,
                borderColor: theme.colors.border
              }
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Ionicons 
              name={category.icon as any} 
              size={18} 
              color={selectedCategory === category.id ? 'white' : theme.colors.textPrimary} 
            />
            <Text style={{
              fontSize: 14,
              fontWeight: '600',
              color: selectedCategory === category.id 
                ? 'white' 
                : theme.colors.textPrimary,
              marginLeft: 4
            }}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Results Counter */}
      <View style={styles.resultsSection}>
        <Text style={[styles.resultsText, { color: theme.colors.textPrimary }]}>
          {filteredFacilities.length} {filteredFacilities.length === 1 ? 'facility' : 'facilities'} found
        </Text>
        {selectedCategory !== 'all' && (
          <Text style={[styles.categoryResultsText, { color: theme.colors.textSecondary }]}>
            in {facilityCategories.find(cat => cat.id === selectedCategory)?.name}
          </Text>
        )}
      </View>

      {/* Facilities List */}
      <FlatList
        data={filteredFacilities}
        keyExtractor={(item) => item.id}
        renderItem={renderFacility}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.facilitiesContainer,
          { paddingBottom: insets.bottom + 20 }
        ]}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={64} color={theme.colors.textSecondary} />
            <Text style={[styles.emptyStateText, { color: theme.colors.textSecondary }]}>
              No facilities found matching your criteria
            </Text>
            <Text style={[styles.emptyStateSubtext, { color: theme.colors.textTertiary }]}>
              Try adjusting your search or filters
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchSection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginHorizontal: 12,
  },
  emergencyToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  emergencyToggleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoriesScroll: {
    maxHeight: 60,
  },
  categoriesContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  resultsSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  resultsText: {
    fontSize: 16,
    fontWeight: '600',
  },
  categoryResultsText: {
    fontSize: 14,
    marginTop: 2,
  },
  facilitiesContainer: {
    padding: 16,
  },
  facilityCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  facilityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  facilityMainInfo: {
    flex: 1,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  typeBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  facilityName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  distance: {
    fontSize: 14,
    marginLeft: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  facilityDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8,
  },
  address: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  operatingHours: {
    fontSize: 14,
  },
  emergencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E74C3C20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
    gap: 4,
    alignSelf: 'flex-start',
  },
  emergencyText: {
    color: '#E74C3C',
    fontSize: 12,
    fontWeight: '600',
  },
  servicesContainer: {
    marginTop: 8,
  },
  servicesLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  servicesTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
  },
  serviceTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  serviceTagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  moreServices: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  headerActions: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
