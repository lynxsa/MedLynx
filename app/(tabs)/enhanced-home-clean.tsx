import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BentoCardData, BentoGrid } from '../../components/BentoGrid';
import Disclaimer from '../../components/Disclaimer';
import { useTheme } from '../../contexts/ThemeContext';

// Enhanced dashboard with health status and personalized insights
interface HealthStatus {
  medicationAdherence: number;
  upcomingReminders: number;
  healthScore: number;
  lastSync: string;
}

export default function EnhancedHomeScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  // State for intelligent dashboard features
  const [healthStatus, setHealthStatus] = React.useState<HealthStatus>({
    medicationAdherence: 85,
    upcomingReminders: 3,
    healthScore: 78,
    lastSync: new Date().toLocaleTimeString(),
  });
  
  const [userName, setUserName] = React.useState('');
  const [currentTime, setCurrentTime] = React.useState(new Date());

  // Load user data and health status
  React.useEffect(() => {
    loadUserData();
    loadHealthStatus();
    
    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);

  const loadUserData = async () => {
    try {
      const userProfile = await AsyncStorage.getItem('userProfile');
      if (userProfile) {
        const profile = JSON.parse(userProfile);
        setUserName(profile.name || profile.fullName || 'User');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadHealthStatus = async () => {
    try {
      const medications = await AsyncStorage.getItem('medications');
      // Load BMI history for health status calculation
      await AsyncStorage.getItem('bmiHistory');
      
      if (medications) {
        const meds = JSON.parse(medications);
        // Calculate medication adherence and upcoming reminders
        const adherence = Math.floor(Math.random() * 20) + 80; // Mock calculation
        const reminders = meds.length > 0 ? Math.min(meds.length, 5) : 0;
        
        setHealthStatus(prev => ({
          ...prev,
          medicationAdherence: adherence,
          upcomingReminders: reminders,
        }));
      }
    } catch (error) {
      console.error('Error loading health status:', error);
    }
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getHealthStatusColor = (score: number) => {
    if (score >= 80) return theme.colors.success;
    if (score >= 60) return theme.colors.warning;
    return theme.colors.error;
  };

  // Enhanced dashboard cards with dynamic badges and personalized content
  const dashboardCards: BentoCardData[] = [
    {
      id: '1',
      title: 'Medications',
      subtitle: `${healthStatus.medicationAdherence}% adherence this week`,
      size: 'large',
      route: '/add-medication',
      color: theme.colors.primary,
      badge: healthStatus.upcomingReminders > 0 ? healthStatus.upcomingReminders.toString() : undefined,
    },
    {
      id: '2',
      title: 'Dr. LYNX',
      subtitle: 'AI Health Assistant - Ask anything!',
      size: 'medium',
      route: '/dr-lynx',
      color: '#10B981',
    },
    {
      id: '3',
      title: 'Calendar',
      subtitle: 'Appointments & Reminders',
      size: 'medium',
      route: '/calendar',
      color: '#F59E0B',
    },
    {
      id: '4',
      title: 'Health Metrics',
      subtitle: `Health Score: ${healthStatus.healthScore}%`,
      size: 'small',
      route: '/health-metrics',
      color: getHealthStatusColor(healthStatus.healthScore),
    },
    {
      id: '5',
      title: 'CareHub',
      subtitle: 'Medical marketplace',
      size: 'small',
      route: '/health-directory',
      color: '#8B5CF6',
    },
    {
      id: '6',
      title: 'Food Scanner',
      subtitle: 'Nutrition insights & tracking',
      size: 'large',
      route: '/food-scan',
      color: '#06B6D4',
    },
  ];

  const handleCardPress = (route: string) => {
    try {
      router.push(route as any);
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Navigation Error', 'Unable to navigate to this screen at the moment.');
    }
  };

  return React.createElement(
    View,
    { style: [styles.container, { backgroundColor: theme.colors.background }] },
    
    // Health Status Header
    React.createElement(
      View,
      { style: [styles.healthStatusHeader, { backgroundColor: theme.colors.primary, paddingTop: insets.top + 10 }] },
      React.createElement(
        View,
        { style: styles.greetingContainer },
        React.createElement(
          Text,
          { style: [styles.greetingText, { color: theme.colors.white }] },
          `${getGreeting()}${userName ? `, ${userName}` : ''}!`
        ),
        React.createElement(
          Text,
          { style: [styles.healthScoreText, { color: theme.colors.white }] },
          `Health Score: ${healthStatus.healthScore}% • ${healthStatus.medicationAdherence}% Med Adherence`
        )
      ),
      React.createElement(
        View,
        { style: styles.statusIndicators },
        React.createElement(
          View,
          { style: [styles.statusBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }] },
          React.createElement(Ionicons, { name: 'notifications', size: 16, color: theme.colors.white }),
          React.createElement(
            Text,
            { style: [styles.statusBadgeText, { color: theme.colors.white }] },
            healthStatus.upcomingReminders.toString()
          )
        )
      )
    ),
    
    React.createElement(
      ScrollView,
      {
        style: styles.scrollContainer,
        contentContainerStyle: [styles.contentContainer, { paddingBottom: insets.bottom }],
        showsVerticalScrollIndicator: false,
      },
      
      // Main Welcome Section
      React.createElement(
        View,
        { style: styles.headerContainer },
        React.createElement(
          Text,
          { style: [styles.welcomeText, { color: theme.colors.textPrimary }] },
          'Your Health Dashboard'
        ),
        React.createElement(
          Text,
          { style: [styles.subText, { color: theme.colors.textSecondary }] },
          'Stay on track with your health goals'
        )
      ),

      // Quick Health Insights
      React.createElement(
        View,
        { style: [styles.insightsContainer, { backgroundColor: theme.colors.surface }] },
        React.createElement(
          View,
          { style: styles.insightItem },
          React.createElement(Ionicons, { name: 'medical', size: 20, color: theme.colors.primary }),
          React.createElement(
            Text,
            { style: [styles.insightText, { color: theme.colors.textPrimary }] },
            'Next medication in 2 hours'
          )
        ),
        React.createElement(
          View,
          { style: styles.insightItem },
          React.createElement(Ionicons, { name: 'calendar', size: 20, color: theme.colors.success }),
          React.createElement(
            Text,
            { style: [styles.insightText, { color: theme.colors.textPrimary }] },
            'Dr. appointment tomorrow at 2:00 PM'
          )
        )
      ),

      // Dashboard Grid
      React.createElement(BentoGrid, {
        cards: dashboardCards,
        onCardPress: handleCardPress,
      })
    ),
    React.createElement(Disclaimer)
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  healthStatusHeader: {
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  greetingContainer: {
    flex: 1,
  },
  greetingText: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  healthScoreText: {
    fontSize: 14,
    opacity: 0.9,
  },
  statusIndicators: {
    position: 'absolute',
    right: 20,
    top: 50,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  headerContainer: {
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subText: {
    fontSize: 16,
    opacity: 0.7,
  },
  insightsContainer: {
    backgroundColor: 'rgba(138, 43, 226, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(138, 43, 226, 0.2)',
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  insightText: {
    fontSize: 14,
    flex: 1,
  },
});
