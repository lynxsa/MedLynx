import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
import Animated, {
    FadeInDown,
    FadeInRight,
    SlideInUp,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ColorPalette } from '../../constants/DynamicTheme';
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
    route: '/health-directory',
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
    route: '/health-directory',
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
    subtitle: 'Find Healthcare Near You',
    description: 'Locate hospitals, clinics & specialists',
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

export default function ModernHomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const colors = theme.colors as ColorPalette;
  const [greeting, setGreeting] = useState('');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  const styles = createStyles(colors);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
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
              <Text style={styles.greeting}>{greeting}</Text>
              <Text style={styles.userName}>John Doe</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color="#7C3AED" />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>2</Text>
            </View>
          </TouchableOpacity>
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
        <Animated.View entering={FadeInDown.delay(300)} style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
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
                <Text style={styles.categoryName}>{category.name}</Text>
              </Animated.View>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Deals & Offers Carousel */}
        <Animated.View entering={FadeInDown.delay(350)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today&apos;s Deals</Text>
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
          <Text style={styles.sectionTitle}>Today&apos;s Health</Text>
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
                    <Text style={styles.healthCardValue} numberOfLines={1}>{card.value}</Text>
                    <Text style={styles.healthCardTitle} numberOfLines={1}>{card.title}</Text>
                    <Text style={styles.healthCardSubtitle} numberOfLines={2}>{card.subtitle}</Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* Featured Services */}
        <Animated.View entering={FadeInDown.delay(500)} style={styles.section}>
          <Text style={styles.sectionTitle}>Featured Services</Text>
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
            <Text style={styles.sectionTitle}>Health Tips & Insights</Text>
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

        {/* More Services - Expanded */}
        <Animated.View entering={FadeInDown.delay(600)} style={styles.section}>
          <Text style={styles.sectionTitle}>More Services</Text>
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
              onPress={() => router.push('/health-directory')}
            >
              <Ionicons name="location" size={24} color="#7C3AED" />
              <Text style={styles.quickActionText}>Find Healthcare</Text>
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
    color: colors.textSecondary,
    marginBottom: 2,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
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
    color: colors.textPrimary,
    marginBottom: 16,
    paddingHorizontal: 20,
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
    color: colors.textPrimary,
    textAlign: 'center',
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
    color: colors.textPrimary,
    marginBottom: 2,
    textAlign: 'center',
  },
  healthCardTitle: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 2,
    lineHeight: 12,
  },
  healthCardSubtitle: {
    fontSize: 8,
    color: colors.textSecondary,
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
});
