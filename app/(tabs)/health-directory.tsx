import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StandardHeader } from '../../components/StandardHeader';
import { useTheme } from '../../contexts/ThemeContext';

interface DirectoryOption {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  gradient: string[];
  route: string;
  stats: string;
  image: any;
}

const directoryOptions: DirectoryOption[] = [
  {
    id: 'facilities',
    title: 'Healthcare Facilities',
    subtitle: 'Hospitals • Clinics • Medical Centers • Pharmacies',
    description: 'Discover nearby hospitals, clinics, pharmacies, and specialized medical facilities in your area with real-time availability.',
    icon: 'business-outline',
    gradient: ['#667eea', '#764ba2'],
    route: '/health-directory-clean',
    stats: '500+ Facilities',
    image: require('../../assets/images/MedLynx-10.jpeg')
  },
  {
    id: 'doctors',
    title: 'Medical Professionals',
    subtitle: 'Doctors • Specialists • Healthcare Providers',
    description: 'Connect with qualified doctors and medical specialists. View profiles, availability, and book appointments instantly.',
    icon: 'people-outline',
    gradient: ['#f093fb', '#f5576c'],
    route: '/doctor-list',
    stats: '1200+ Professionals',
    image: require('../../assets/images/MedLynx-11.jpeg')
  }
];

export default function HealthDirectorySelectionScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleOptionPress = (option: DirectoryOption) => {
    setSelectedOption(option.id);
    
    if (option.id === 'facilities') {
      // Navigate to Healthcare Facilities page
      router.push('/health-directory-clean' as any);
    } else if (option.id === 'doctors') {
      // Navigate to Doctors list page
      router.push('/doctor-list' as any);
    }
  };

  const renderDirectoryOption = (option: DirectoryOption, index: number) => (
    <TouchableOpacity
      key={option.id}
      style={[
        styles.optionCard,
        { 
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          transform: [{ scale: selectedOption === option.id ? 0.98 : 1 }]
        }
      ]}
      onPress={() => handleOptionPress(option)}
      activeOpacity={0.9}
    >
      <Image 
        source={option.image} 
        style={styles.optionCardImage}
        resizeMode="cover"
      />
      <LinearGradient
        colors={[option.gradient[0] + 'DD', option.gradient[1] + 'DD']}
        style={styles.optionGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.optionContent}>
          <View style={styles.optionHeader}>
            <View style={styles.optionTextContent}>
              <Text style={styles.optionTitle}>{option.title}</Text>
              <Text style={styles.optionStats}>{option.stats}</Text>
            </View>
            <View style={styles.optionIcon}>
              <Ionicons name={option.icon as any} size={24} color="white" />
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar 
        barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} 
        backgroundColor={theme.colors.background}
      />
      
      <StandardHeader 
        title="Health Directory"
        description="Choose doctors or facilities"
        showLogo={true}
      />
      
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Enhanced Header Section */}
        <View style={styles.headerSection}>
          <View style={[styles.welcomeCard, { backgroundColor: theme.colors.surface }]}>
            <Image 
              source={require('../../assets/images/MedLynx-09.jpeg')} 
              style={styles.welcomeCardImage}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['rgba(124, 58, 237, 0.8)', 'rgba(124, 58, 237, 0.6)']}
              style={styles.welcomeCardOverlay}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.welcomeIconContainer}>
                <Ionicons name="heart-outline" size={32} color="#FFFFFF" />
              </View>
              <Text style={[styles.welcomeText, { color: '#FFFFFF' }]}>
                Find the right healthcare for you
              </Text>
              <Text style={[styles.subtitleText, { color: 'rgba(255, 255, 255, 0.9)' }]}>
                Access comprehensive healthcare services across South Africa
              </Text>
            </LinearGradient>
          </View>
        </View>

        {/* Enhanced Directory Options */}
        <View style={styles.optionsContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            Choose your healthcare need
          </Text>
          {directoryOptions.map((option, index) => renderDirectoryOption(option, index))}
        </View>

        {/* Enhanced Quick Stats */}
        <View style={styles.statsContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            Our Network
          </Text>
          <View style={[styles.statsGrid, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.statItem}>
              <View style={[styles.statIconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
                <Ionicons name="business-outline" size={24} color={theme.colors.primary} />
              </View>
              <Text style={[styles.statNumber, { color: theme.colors.textPrimary }]}>500+</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Healthcare Facilities</Text>
            </View>
            
            <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />
            
            <View style={styles.statItem}>
              <View style={[styles.statIconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
                <Ionicons name="people-outline" size={24} color={theme.colors.primary} />
              </View>
              <Text style={[styles.statNumber, { color: theme.colors.textPrimary }]}>1,200+</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Medical Professionals</Text>
            </View>
          </View>
          
          {/* Additional stats row */}
          <View style={[styles.statsGrid, { backgroundColor: theme.colors.surface, marginTop: 12 }]}>
            <View style={styles.statItem}>
              <View style={[styles.statIconContainer, { backgroundColor: '#27AE60' + '20' }]}>
                <Ionicons name="time-outline" size={24} color="#27AE60" />
              </View>
              <Text style={[styles.statNumber, { color: theme.colors.textPrimary }]}>24/7</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Emergency Services</Text>
            </View>
            
            <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />
            
            <View style={styles.statItem}>
              <View style={[styles.statIconContainer, { backgroundColor: '#E74C3C' + '20' }]}>
                <Ionicons name="location-outline" size={24} color="#E74C3C" />
              </View>
              <Text style={[styles.statNumber, { color: theme.colors.textPrimary }]}>All</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Major Cities</Text>
            </View>
          </View>
        </View>

        {/* Enhanced Features Section */}
        <View style={styles.featuresSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            What you can do
          </Text>
          
          <View style={styles.featuresList}>
            <View style={[styles.featureCard, { backgroundColor: theme.colors.surface }]}>
              <View style={[styles.featureIcon, { backgroundColor: theme.colors.primary + '20' }]}>
                <Ionicons name="search-outline" size={20} color={theme.colors.primary} />
              </View>
              <View style={styles.featureContent}>
                <Text style={[styles.featureTitle, { color: theme.colors.textPrimary }]}>
                  Smart Search
                </Text>
                <Text style={[styles.featureDescription, { color: theme.colors.textSecondary }]}>
                  Find facilities by location, specialty, or services offered
                </Text>
              </View>
            </View>
            
            <View style={[styles.featureCard, { backgroundColor: theme.colors.surface }]}>
              <View style={[styles.featureIcon, { backgroundColor: theme.colors.primary + '20' }]}>
                <Ionicons name="calendar-outline" size={20} color={theme.colors.primary} />
              </View>
              <View style={styles.featureContent}>
                <Text style={[styles.featureTitle, { color: theme.colors.textPrimary }]}>
                  Easy Booking
                </Text>
                <Text style={[styles.featureDescription, { color: theme.colors.textSecondary }]}>
                  Book appointments directly with healthcare providers
                </Text>
              </View>
            </View>
            
            <View style={[styles.featureCard, { backgroundColor: theme.colors.surface }]}>
              <View style={[styles.featureIcon, { backgroundColor: theme.colors.primary + '20' }]}>
                <Ionicons name="star-outline" size={20} color={theme.colors.primary} />
              </View>
              <View style={styles.featureContent}>
                <Text style={[styles.featureTitle, { color: theme.colors.textPrimary }]}>
                  Reviews & Ratings
                </Text>
                <Text style={[styles.featureDescription, { color: theme.colors.textSecondary }]}>
                  Read verified reviews from other patients
                </Text>
              </View>
            </View>
            
            <View style={[styles.featureCard, { backgroundColor: theme.colors.surface }]}>
              <View style={[styles.featureIcon, { backgroundColor: theme.colors.primary + '20' }]}>
                <Ionicons name="navigate-outline" size={20} color={theme.colors.primary} />
              </View>
              <View style={styles.featureContent}>
                <Text style={[styles.featureTitle, { color: theme.colors.textPrimary }]}>
                  Navigation
                </Text>
                <Text style={[styles.featureDescription, { color: theme.colors.textSecondary }]}>
                  Get directions and contact information instantly
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Call to Action */}
        <View style={[styles.ctaSection, { backgroundColor: theme.colors.primary + '10' }]}>
          <Ionicons name="shield-checkmark-outline" size={48} color={theme.colors.primary} />
          <Text style={[styles.ctaTitle, { color: theme.colors.textPrimary }]}>
            Trusted Healthcare Network
          </Text>
          <Text style={[styles.ctaDescription, { color: theme.colors.textSecondary }]}>
            All facilities and professionals in our directory are verified and regulated by the Health Professions Council of South Africa (HPCSA).
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  headerSection: {
    marginBottom: 32,
    alignItems: 'center',
  },
  welcomeCard: {
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    width: '100%',
    height: 200,
    overflow: 'hidden',
    position: 'relative',
  },
  welcomeCardImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  welcomeCardOverlay: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 200,
  },
  welcomeIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitleText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  optionsContainer: {
    marginBottom: 32,
  },
  optionCard: {
    marginBottom: 20,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
    position: 'relative',
    height: 200,
  },
  optionCardImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  optionGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '33%',
    padding: 16,
    justifyContent: 'flex-end',
  },
  optionContent: {
    flex: 1,
    justifyContent: 'center',
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTextContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
  },
  optionStats: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  optionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    fontWeight: '600',
  },
  arrowIcon: {
    padding: 8,
  },
  statsContainer: {
    marginBottom: 32,
  },
  statsGrid: {
    flexDirection: 'row',
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  statDivider: {
    width: 1,
    marginHorizontal: 20,
  },
  featuresSection: {
    marginBottom: 32,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  featuresList: {
    gap: 12,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  featureText: {
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  ctaSection: {
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 12,
  },
  ctaDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
