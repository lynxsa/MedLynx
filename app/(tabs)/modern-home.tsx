import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
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
import Animated, {
  FadeInDown,
  FadeInRight,
  SlideInUp,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DoctorCard from '../../components/DoctorCard';
import { UserAvatarMenu } from '../../components/UserAvatarMenu';
import { ColorPalette } from '../../constants/DynamicTheme';
import { CURRENT_USER, getGreeting } from '../../constants/User';
import { useTheme } from '../../contexts/ThemeContext';

const { width } = Dimensions.get('window');

interface Category {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  route: string;
}

interface FeaturedItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: ImageSourcePropType;
  route: string;
  backgroundColor: string;
}

interface HealthCard {
  id: string;
  title: string;
  value: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  route: string;
}

interface DealOffer {
  id: string;
  title: string;
  subtitle: string;
  discount: string;
  originalPrice?: string;
  discountedPrice: string;
  pharmacy: string;
  image: ImageSourcePropType;
  backgroundColor: string;
  route: string;
}

// Main categories with Uber Eats style
const MAIN_CATEGORIES: Category[] = [
  {
    id: 'carehub',
    name: 'Pharmacy',
    icon: 'storefront',
    color: '#7C3AED',
    route: '/carehub',
  },
  {
    id: 'scanner',
    name: 'Scan Rx',
    icon: 'scan',
    color: '#8B5CF6',
    route: '/medication-scanner',
  },
  {
    id: 'add-med',
    name: 'Add Medication',
    icon: 'add-circle',
    color: '#A855F7',
    route: '/add-medication',
  },
  {
    id: 'doctor',
    name: 'Dr. LYNX',
    icon: 'chatbubbles',
    color: '#9333EA',
    route: '/dr-lynx',
  },
  {
    id: 'calendar',
    name: 'Appointments',
    icon: 'calendar',
    color: '#C084FC',
    route: '/calendar',
  },
  {
    id: 'health',
    name: 'Health Metrics',
    icon: 'stats-chart',
    color: '#DDD6FE',
    route: '/health-metrics',
  },
];

// Deals and Offers from pharmacies and doctors
const DEALS_OFFERS: DealOffer[] = [
  {
    id: '1',
    title: 'Flu Vaccination Special',
    subtitle: 'Get protected this flu season',
    discount: '30% OFF',
    originalPrice: 'R299',
    discountedPrice: 'R199',
    pharmacy: 'Clicks Pharmacy',
    image: require('../../assets/images/MedLynx-01.jpeg'),
    backgroundColor: '#7C3AED',
    route: '/carehub',
  },
  {
    id: '2',
    title: 'Blood Pressure Check',
    subtitle: 'Free consultation included',
    discount: 'FREE',
    discountedPrice: 'R0',
    pharmacy: 'Dis-Chem',
    image: require('../../assets/images/MedLynx-02.jpeg'),
    backgroundColor: '#8B5CF6',
    route: '/carehub',
  },
  {
    id: '3',
    title: 'Vitamin Bundle Pack',
    subtitle: 'Complete daily nutrition',
    discount: '25% OFF',
    originalPrice: 'R450',
    discountedPrice: 'R339',
    pharmacy: 'Medirite',
    image: require('../../assets/images/MedLynx-03.jpeg'),
    backgroundColor: '#A855F7',
    route: '/carehub',
  },
  {
    id: '4',
    title: 'GP Consultation',
    subtitle: 'Same-day appointments',
    discount: '20% OFF',
    originalPrice: 'R500',
    discountedPrice: 'R400',
    pharmacy: 'Dr. Smith Clinic',
    image: require('../../assets/images/MedLynx-04.jpeg'),
    backgroundColor: '#9333EA',
    route: '/carehub',
  },
  {
    id: '5',
    title: 'Diabetes Care Kit',
    subtitle: 'Monitor & supplies bundle',
    discount: '35% OFF',
    originalPrice: 'R800',
    discountedPrice: 'R520',
    pharmacy: 'Alpha Pharm',
    image: require('../../assets/images/MedLynx-05.jpeg'),
    backgroundColor: '#C084FC',
    route: '/carehub',
  },
];

// Featured items with gradient overlay images
const FEATURED_ITEMS: FeaturedItem[] = [
  {
    id: '1',
    title: 'CareHub Marketplace',
    subtitle: 'Trusted SA Pharmacies',
    description: 'Shop from Clicks, Dis-Chem, Medirite & more',
    image: require('../../assets/images/MedLynx-05.jpeg'),
    route: '/carehub',
    backgroundColor: '#7C3AED',
  },
  {
    id: '2',
    title: 'Smart Medication Scanner',
    subtitle: 'AI-Powered Recognition',
    description: 'Scan prescriptions instantly with OCR technology',
    image: require('../../assets/images/MedLynx-07.jpeg'),
    route: '/medication-scanner',
    backgroundColor: '#8B5CF6',
  },
  {
    id: '3',
    title: 'Dr. LYNX AI Assistant',
    subtitle: '24/7 Health Support',
    description: 'Get personalized medical advice & insights',
    image: require('../../assets/images/MedLynx-08.jpeg'),
    route: '/dr-lynx',
    backgroundColor: '#A855F7',
  },
  {
    id: '4',
    title: 'Health Directory',
    subtitle: 'Medical Professionals',
    description: 'Find doctors, specialists & healthcare facilities',
    image: require('../../assets/images/MedLynx-09.jpeg'),
    route: '/health-directory',
    backgroundColor: '#9333EA',
  },
];

// Health Tips Section
interface HealthTip {
  id: string;
  title: string;
  description: string;
  image: ImageSourcePropType;
  category: string;
  readTime: string;
  route: string;
}

const HEALTH_TIPS: HealthTip[] = [
  {
    id: '1',
    title: 'Understanding Blood Pressure',
    description: 'Learn how to monitor and maintain healthy blood pressure levels',
    image: require('../../assets/images/MedLynx-11.jpeg'),
    category: 'Cardiovascular Health',
    readTime: '3 min read',
    route: '/understanding-blood-pressure',
  },
  {
    id: '2',
    title: 'Medication Safety Tips',
    description: 'Essential guidelines for safe medication usage and storage',
    image: require('../../assets/images/MedLynx-12.jpeg'),
    category: 'Medication Safety',
    readTime: '4 min read',
    route: '/medication-safety-tips',
  },
  {
    id: '3',
    title: 'Healthy Sleep Habits',
    description: 'Improve your sleep quality with these evidence-based tips',
    image: require('../../assets/images/MedLynx-13.jpeg'),
    category: 'Sleep Health',
    readTime: '5 min read',
    route: '/healthy-sleep-habits',
  },
  {
    id: '4',
    title: 'Managing Chronic Conditions',
    description: 'Strategies for living well with chronic health conditions',
    image: require('../../assets/images/MedLynx-14.jpeg'),
    category: 'Chronic Care',
    readTime: '6 min read',
    route: '/managing-chronic-conditions',
  },
];

// Health overview cards with improved metrics
const HEALTH_CARDS: HealthCard[] = [
  {
    id: '1',
    title: 'Medication Adherence',
    value: '95%',
    subtitle: 'Excellent - 7 day streak',
    icon: 'checkmark-circle',
    color: '#7C3AED',
    route: '/add-medication',
  },
  {
    id: '2',
    title: 'Heart Rate',
    value: '72 BPM',
    subtitle: 'Normal resting rate',
    icon: 'heart',
    color: '#8B5CF6',
    route: '/health-metrics',
  },
  {
    id: '3',
    title: 'Steps Today',
    value: '8,247',
    subtitle: 'Goal: 10,000 steps',
    icon: 'walk',
    color: '#A855F7',
    route: '/health-metrics',
  },
  {
    id: '4',
    title: 'Sleep Quality',
    value: '7.5 hrs',
    subtitle: 'Good quality sleep',
    icon: 'bed',
    color: '#9333EA',
    route: '/health-metrics',
  },
  {
    id: '5',
    title: 'Water Intake',
    value: '6/8 glasses',
    subtitle: '75% of daily goal',
    icon: 'water',
    color: '#C084FC',
    route: '/health-metrics',
  },
  {
    id: '6',
    title: 'Next Appointment',
    value: 'Tomorrow',
    subtitle: 'Dr. Smith - 2:00 PM',
    icon: 'calendar',
    color: '#DDD6FE',
    route: '/calendar',
  },
];

// Medical Professionals interface
interface Doctor {
  id: string;
  name: string;
  specialization: string;
  rating: number;
  experience: string;
  avatar: ImageSourcePropType;
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

// Medical Professionals data - Diverse doctors with complete booking information
const MEDICAL_PROFESSIONALS: Doctor[] = [
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

export default function ModernHomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const colors = theme.colors as ColorPalette;
  const [greeting, setGreeting] = useState('');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    setGreeting(getGreeting());
  }, []);

  const styles = createStyles(colors);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar 
        barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} 
        backgroundColor={colors.background}
      />
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.greetingContainer}>
            <Image 
              source={require('../../assets/images/logo.png')} 
              style={styles.headerLogo}
              resizeMode="contain"
            />
            <View style={styles.greetingText}>
              <Text style={[styles.greeting, { color: colors.textSecondary }]}>{greeting}</Text>
              <Text style={[styles.userName, { color: colors.textPrimary }]}>{CURRENT_USER.name}</Text>
            </View>
          </View>
          <View style={styles.headerRightSection}>
            <TouchableOpacity style={styles.notificationButton}>
              <Ionicons name="notifications-outline" size={24} color="#7C3AED" />
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>3</Text>
              </View>
            </TouchableOpacity>
            <UserAvatarMenu size={40} />
          </View>
        </View>

        {/* Search Bar */}
        <Animated.View entering={SlideInUp.delay(200)} style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={20} color="#A855F7" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search medications, doctors, or services"
              placeholderTextColor="#A855F7"
              value={searchText}
              onChangeText={setSearchText}
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => setSearchText('')}>
                <Ionicons name="close-circle" size={20} color="#a096e7" />
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </View>

      {/* Main Categories - Uber Eats Style */}
        {/* Quick Access Categories */}
        <Animated.View entering={FadeInDown.delay(300)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Quick Access</Text>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.categoriesScroll}
            contentContainerStyle={styles.categoriesScrollContent}
          >
            {MAIN_CATEGORIES.map((category, index) => (
              <Animated.View
                key={category.id}
                entering={FadeInRight.delay(100 * index)}
                style={styles.categoryCard}
              >
                <TouchableOpacity
                  style={[styles.categoryButton, { backgroundColor: category.color }]}
                  onPress={() => router.push(category.route as any)}
                  activeOpacity={0.8}
                >
                  <Ionicons name={category.icon} size={24} color="white" />
                </TouchableOpacity>
                <Text style={[styles.categoryName, { color: colors.textPrimary }]}>{category.name}</Text>
              </Animated.View>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Deals & Offers Carousel */}
        <Animated.View entering={FadeInDown.delay(350)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Today&apos;s Deals</Text>
            <TouchableOpacity onPress={() => router.push('/carehub')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.dealsScroll}
            contentContainerStyle={styles.dealsScrollContent}
            snapToInterval={width * 0.85}
            decelerationRate="fast"
          >
            {DEALS_OFFERS.map((deal, index) => (
              <Animated.View
                key={deal.id}
                entering={FadeInRight.delay(100 * index)}
                style={styles.dealCard}
              >
                <TouchableOpacity
                  onPress={() => router.push(deal.route as any)}
                  activeOpacity={0.8}
                  style={styles.dealCardButton}
                >
                  <View style={styles.dealCardContainer}>
                    <Image 
                      source={deal.image} 
                      style={styles.dealCardImage}
                      resizeMode="cover"
                    />
                    <LinearGradient
                      colors={[deal.backgroundColor + 'DD', 'transparent']}
                      style={styles.dealCardGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <View style={styles.dealCardContent}>
                        <View style={styles.dealBadge}>
                          <Text style={styles.dealBadgeText}>{deal.discount}</Text>
                        </View>
                        <View style={styles.dealCardText}>
                          <Text style={styles.dealCardTitle}>{deal.title}</Text>
                          <Text style={styles.dealCardSubtitle}>{deal.subtitle}</Text>
                          <View style={styles.dealPriceContainer}>
                            {deal.originalPrice && (
                              <Text style={styles.dealOriginalPrice}>{deal.originalPrice}</Text>
                            )}
                            <Text style={styles.dealDiscountedPrice}>{deal.discountedPrice}</Text>
                          </View>
                          <Text style={styles.dealPharmacy}>{deal.pharmacy}</Text>
                        </View>
                      </View>
                    </LinearGradient>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Health Overview Cards */}
        <Animated.View entering={FadeInDown.delay(400)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Today&apos;s Health</Text>
            <TouchableOpacity onPress={() => router.push('/health-metrics')}>
              <Text style={styles.seeAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.healthCardsContainer}>
            {HEALTH_CARDS.map((card, index) => (
              <Animated.View
                key={card.id}
                entering={FadeInDown.delay(100 * index)}
                style={styles.healthCard}
              >
                <TouchableOpacity
                  style={styles.healthCardButton}
                  onPress={() => router.push(card.route as any)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.healthCardIcon, { backgroundColor: card.color }]}>
                    <Ionicons name={card.icon} size={18} color="#FFFFFF" />
                  </View>
                  <View style={styles.healthCardContent}>
                    <Text style={[styles.healthCardValue, { color: colors.textPrimary }]} numberOfLines={1}>{card.value}</Text>
                    <Text style={[styles.healthCardTitle, { color: colors.textSecondary }]} numberOfLines={1}>{card.title}</Text>
                    <Text style={[styles.healthCardSubtitle, { color: colors.textSecondary }]} numberOfLines={2}>{card.subtitle}</Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* Featured Services */}
        <Animated.View entering={FadeInDown.delay(500)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Featured Services</Text>
          </View>
          <View style={styles.featuredContainer}>
            {FEATURED_ITEMS.map((item, index) => (
              <Animated.View
                key={item.id}
                entering={FadeInDown.delay(100 * index)}
                style={styles.featuredCard}
              >
                <TouchableOpacity
                  onPress={() => router.push(item.route as any)}
                  activeOpacity={0.8}
                  style={styles.featuredCardButton}
                >
                  <View style={styles.featuredCardContainer}>
                    <Image 
                      source={item.image} 
                      style={styles.featuredCardImage}
                      resizeMode="cover"
                    />
                    <LinearGradient
                      colors={[item.backgroundColor, 'transparent']}
                      style={styles.featuredCardGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <View style={styles.featuredCardContent}>
                        <View style={styles.featuredCardText}>
                          <Text style={styles.featuredCardTitle}>{item.title}</Text>
                          <Text style={styles.featuredCardSubtitle}>{item.subtitle}</Text>
                          <Text style={styles.featuredCardDescription}>{item.description}</Text>
                        </View>
                      </View>
                    </LinearGradient>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* Health Tips */}
        <Animated.View entering={FadeInDown.delay(550)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Health Tips & Insights</Text>
            <TouchableOpacity onPress={() => router.push('/lynx-pulse')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tipsScrollContent}
            style={styles.tipsScrollView}
          >
            {HEALTH_TIPS.map((tip, index) => (
              <Animated.View
                key={tip.id}
                entering={FadeInDown.delay(100 * index)}
                style={styles.tipCard}
              >
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.tipCardButton}
                  onPress={() => router.push(tip.route as any)}
                >
                  <Image 
                    source={tip.image} 
                    style={styles.tipCardImage}
                    resizeMode="cover"
                  />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.7)']}
                    style={styles.tipCardGradient}
                  >
                    <View style={styles.tipCardContent}>
                      <Text style={styles.tipCategory}>{tip.category}</Text>
                      <Text style={styles.tipTitle}>{tip.title}</Text>
                      <Text style={styles.tipDescription}>{tip.description}</Text>
                      <Text style={styles.tipReadTime}>{tip.readTime}</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Medical Professionals */}
        <Animated.View entering={FadeInDown.delay(575)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Medical Professionals</Text>
            <TouchableOpacity onPress={() => router.push('/doctors-list' as any)}>
              <Text style={styles.seeAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.doctorsScrollContent}
            style={styles.doctorsScrollView}
          >
            {MEDICAL_PROFESSIONALS.slice(0, 6).map((doctor, index) => (
              <Animated.View
                key={doctor.id}
                entering={FadeInRight.delay(100 * index)}
              >
                <DoctorCard
                  doctor={doctor}
                  onPress={(selectedDoctor) => router.push('/doctor-booking' as any)}
                  variant="home"
                />
              </Animated.View>
            ))}
          </ScrollView>
        </Animated.View>

        {/* More Services - Expanded */}
        <Animated.View entering={FadeInDown.delay(600)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>More Services</Text>
          </View>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity 
              style={styles.quickActionItem}
              onPress={() => router.push('/calendar')}
            >
              <Ionicons name="medical" size={24} color="#7C3AED" />
              <Text style={styles.quickActionText}>Add Dr Appointment</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickActionItem}
              onPress={() => router.push('/carehub')}
            >
              <Ionicons name="storefront" size={24} color="#7C3AED" />
              <Text style={styles.quickActionText}>CareHub Store</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickActionItem}
              onPress={() => router.push('/food-scan')}
            >
              <Ionicons name="nutrition" size={24} color="#7C3AED" />
              <Text style={styles.quickActionText}>Food Scanner</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickActionItem}
              onPress={() => router.push('/prescription-refills')}
            >
              <Ionicons name="repeat" size={24} color="#7C3AED" />
              <Text style={styles.quickActionText}>Refills</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickActionItem}
              onPress={() => router.push('/ehr-lite')}
            >
              <Ionicons name="document-text" size={24} color="#7C3AED" />
              <Text style={styles.quickActionText}>Health Records</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickActionItem}
              onPress={() => router.push('/settings')}
            >
              <Ionicons name="settings" size={24} color="#7C3AED" />
              <Text style={styles.quickActionText}>Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickActionItem}
              onPress={() => router.push('/notification-test')}
            >
              <Ionicons name="notifications" size={24} color="#7C3AED" />
              <Text style={styles.quickActionText}>Reminders</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickActionItem}
              onPress={() => router.push('/medication-detail')}
            >
              <Ionicons name="information-circle" size={24} color="#7C3AED" />
              <Text style={styles.quickActionText}>Med Info</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickActionItem}
              onPress={() => router.push('/health-metrics')}
            >
              <Ionicons name="pulse" size={24} color="#7C3AED" />
              <Text style={styles.quickActionText}>Vitals Tracker</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.backgroundSecondary,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greetingContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLogo: {
    width: 32,
    height: 32,
    marginRight: 12,
  },
  greetingText: {
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    marginBottom: 2,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerRightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#FF4757',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  searchContainer: {
    marginTop: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.backgroundSecondary,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: colors.textPrimary,
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  // Categories
  categoriesScroll: {
    paddingLeft: 20,
  },
  categoriesScrollContent: {
    paddingRight: 20,
  },
  categoryCard: {
    alignItems: 'center',
    marginRight: 16,
  },
  categoryButton: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryIcon: {
    fontSize: 28,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
  },
  // Health Cards - Updated for grid layout
  healthCardsContainer: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  healthCard: {
    width: (width - 60) / 3, // 3 cards per row with proper spacing
    marginBottom: 12,
  },
  healthCardButton: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.backgroundSecondary,
    height: 120, // Fixed height for all cards
    justifyContent: 'center',
  },
  healthCardIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  healthCardContent: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingTop: 4,
  },
  healthCardValue: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
    textAlign: 'center',
  },
  healthCardTitle: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 2,
    lineHeight: 12,
  },
  healthCardSubtitle: {
    fontSize: 8,
    textAlign: 'center',
    lineHeight: 10,
    opacity: 0.8,
  },
  // Featured Items - Updated with image support
  featuredContainer: {
    paddingHorizontal: 20,
  },
  featuredCard: {
    marginBottom: 16,
  },
  featuredCardButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  featuredCardContainer: {
    position: 'relative',
    height: 140,
  },
  featuredCardImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  featuredCardGradient: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: '40%',
    bottom: 0,
    padding: 20,
    justifyContent: 'center',
  },
  featuredCardContent: {
    flex: 1,
  },
  featuredCardText: {
    flex: 1,
  },
  featuredCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 6,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  featuredCardSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.95)',
    marginBottom: 4,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  featuredCardDescription: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 14,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  // Deals & Offers Carousel
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionLogo: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  seeAllText: {
    fontSize: 14,
    color: '#3726a6',
    fontWeight: '600',
  },
  dealsScroll: {
    paddingLeft: 20,
  },
  dealsScrollContent: {
    paddingRight: 20,
  },
  dealCard: {
    width: width * 0.8,
    marginRight: 16,
  },
  dealCardButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  dealCardContainer: {
    position: 'relative',
    height: 160,
  },
  dealCardImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  dealCardGradient: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: '30%',
    bottom: 0,
    padding: 20,
    justifyContent: 'space-between',
  },
  dealCardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  dealBadge: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dealBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FF4757',
  },
  dealCardText: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  dealCardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  dealCardSubtitle: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  dealPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  dealOriginalPrice: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    textDecorationLine: 'line-through',
    marginRight: 8,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  dealDiscountedPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  dealPharmacy: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  // Quick Actions
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  quickActionItem: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: (width - 56) / 2,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.backgroundSecondary,
  },
  quickActionText: {
    fontSize: 10,
    color: colors.textPrimary,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  
  // Health Tips Styles
  tipsScrollView: {
    flexGrow: 0,
  },
  tipsScrollContent: {
    paddingHorizontal: 16,
    paddingRight: 32,
  },
  tipCard: {
    width: width * 0.75,
    height: 200,
    marginRight: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  tipCardButton: {
    flex: 1,
  },
  tipCardImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  tipCardGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 16,
  },
  tipCardContent: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  tipCategory: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
    lineHeight: 18,
  },
  tipDescription: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 16,
    marginBottom: 8,
  },
  tipReadTime: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
  // Medical Professionals styles
  doctorsScrollView: {
    paddingLeft: 20,
  },
  doctorsScrollContent: {
    paddingRight: 20,
  },
  doctorCard: {
    width: width * 0.6,
    marginRight: 16,
    backgroundColor: colors.surface,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 15,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  doctorCardButton: {
    position: 'relative',
    overflow: 'hidden',
  },
  cardGradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.8,
  },
  statusBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  doctorAvatarContainer: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20,
    zIndex: 5,
  },
  avatarWrapper: {
    position: 'relative',
    borderRadius: 40,
    overflow: 'hidden',
  },
  doctorAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  avatarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 40,
  },
  ratingBadge: {
    position: 'absolute',
    bottom: -8,
    right: width * 0.6 / 2 - 65,
    backgroundColor: colors.primary,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  doctorInfo: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 24,
    zIndex: 5,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  specializationContainer: {
    backgroundColor: `${colors.primary}20`,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 16,
  },
  doctorSpecialization: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '700',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  detailsContainer: {
    width: '100%',
    marginBottom: 16,
  },
  doctorDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  doctorLocation: {
    fontSize: 12,
    color: colors.textPrimary,
    fontWeight: '600',
    flex: 1,
  },
  doctorExperience: {
    fontSize: 12,
    color: colors.textPrimary,
    fontWeight: '600',
    flex: 1,
  },
  consultationFeeContainer: {
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 14,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    width: '100%',
  },
  consultationFeeLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 4,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  consultationFee: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});
