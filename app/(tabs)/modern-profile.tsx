import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, {
    FadeIn,
    FadeInDown,
    SlideInRight,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ColorPalette } from '../../constants/DynamicTheme';
import { useTheme } from '../../contexts/ThemeContext';

interface ProfileOption {
  id: string;
  title: string;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  type: 'navigate' | 'toggle' | 'action';
  value?: boolean;
  route?: string;
  action?: () => void;
}

export default function ModernProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme, toggleTheme } = useTheme();
  const colors = theme.colors as ColorPalette;
  
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricsEnabled, setBiometricsEnabled] = useState(true);

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('userToken');
            router.replace('/modern-auth');
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Account Deleted', 'Your account has been successfully deleted.');
          },
        },
      ]
    );
  };

  const profileOptions: ProfileOption[] = [
    {
      id: 'personal-info',
      title: 'Personal Information',
      subtitle: 'Update your profile details',
      icon: 'person-outline',
      type: 'navigate',
      route: '/settings',
    },
    {
      id: 'medical-history',
      title: 'Medical History',
      subtitle: 'View and manage your health records',
      icon: 'medical-outline',
      type: 'navigate',
      route: '/ehr-lite',
    },
    {
      id: 'medications',
      title: 'My Medications',
      subtitle: 'Manage your medication list',
      icon: 'flask-outline',
      type: 'navigate',
      route: '/add-medication',
    },
    {
      id: 'health-metrics',
      title: 'Health Metrics',
      subtitle: 'Track your health progress',
      icon: 'analytics-outline',
      type: 'navigate',
      route: '/health-metrics',
    },
  ];

  const settingsOptions: ProfileOption[] = [
    {
      id: 'notifications',
      title: 'Push Notifications',
      subtitle: 'Medication reminders and updates',
      icon: 'notifications-outline',
      type: 'toggle',
      value: notificationsEnabled,
      action: () => setNotificationsEnabled(!notificationsEnabled),
    },
    {
      id: 'biometrics',
      title: 'Biometric Authentication',
      subtitle: 'Use Face ID or fingerprint',
      icon: 'finger-print-outline',
      type: 'toggle',
      value: biometricsEnabled,
      action: () => setBiometricsEnabled(!biometricsEnabled),
    },
    {
      id: 'dark-mode',
      title: 'Dark Mode',
      subtitle: 'Switch to dark theme',
      icon: 'moon-outline',
      type: 'toggle',
      value: darkModeEnabled,
      action: () => {
        setDarkModeEnabled(!darkModeEnabled);
        toggleTheme();
      },
    },
  ];

  const accountOptions: ProfileOption[] = [
    {
      id: 'privacy',
      title: 'Privacy Policy',
      icon: 'shield-outline',
      type: 'action',
      action: () => Alert.alert('Privacy Policy', 'Privacy policy content goes here.'),
    },
    {
      id: 'terms',
      title: 'Terms of Service',
      icon: 'document-text-outline',
      type: 'action',
      action: () => Alert.alert('Terms of Service', 'Terms of service content goes here.'),
    },
    {
      id: 'support',
      title: 'Help & Support',
      icon: 'help-circle-outline',
      type: 'action',
      action: () => Alert.alert('Support', 'Contact support at support@medlynx.com'),
    },
    {
      id: 'logout',
      title: 'Logout',
      icon: 'log-out-outline',
      type: 'action',
      action: handleLogout,
    },
    {
      id: 'delete',
      title: 'Delete Account',
      icon: 'trash-outline',
      type: 'action',
      action: handleDeleteAccount,
    },
  ];

  const renderOptionItem = (option: ProfileOption, index: number, isLast = false) => (
    <Animated.View
      entering={FadeInDown.delay(100 * index)}
      key={option.id}
      style={[
        styles.optionItem,
        { backgroundColor: colors.surface },
        isLast && styles.lastOptionItem,
      ]}
    >
      <TouchableOpacity
        style={styles.optionButton}
        onPress={() => {
          if (option.type === 'navigate' && option.route) {
            router.push(option.route as any);
          } else if (option.action) {
            option.action();
          }
        }}
        activeOpacity={option.type === 'toggle' ? 1 : 0.7}
      >
        <View style={[styles.optionIcon, { backgroundColor: colors.primary }]}>
          <Ionicons name={option.icon} size={20} color="white" />
        </View>
        
        <View style={styles.optionContent}>
          <Text style={[styles.optionTitle, { color: colors.textPrimary }]}>
            {option.title}
          </Text>
          {option.subtitle && (
            <Text style={[styles.optionSubtitle, { color: colors.textSecondary }]}>
              {option.subtitle}
            </Text>
          )}
        </View>

        {option.type === 'toggle' && option.action ? (
          <Switch
            value={option.value}
            onValueChange={option.action}
            thumbColor={option.value ? colors.primary : colors.textSecondary}
            trackColor={{ false: colors.border, true: `${colors.primary}40` }}
          />
        ) : (
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        )}
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View entering={FadeIn.delay(100)} style={styles.header}>
          <View style={styles.profileImageContainer}>
            <View style={styles.profileImage}>
              <Image 
                source={require('../../assets/images/MedLynx-10.jpeg')} 
                style={styles.profileImagePhoto}
                resizeMode="cover"
              />
            </View>
            <TouchableOpacity 
              style={[styles.editImageButton, { backgroundColor: colors.surface }]}
              onPress={() => Alert.alert('Change Photo', 'Photo selection functionality goes here.')}
            >
              <Ionicons name="camera" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
          
          <Text style={[styles.userName, { color: colors.textPrimary }]}>
            Alex Johnson
          </Text>
          <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
            alex.johnson@example.com
          </Text>
          
          <TouchableOpacity 
            style={[styles.editProfileButton, { backgroundColor: colors.surface }]}
            onPress={() => router.push('/settings')}
          >
            <Text style={[styles.editProfileButtonText, { color: colors.primary }]}>
              Edit Profile
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Health Summary */}
        <Animated.View 
          entering={SlideInRight.delay(200)}
          style={[styles.healthSummaryCard, { backgroundColor: colors.primary }]}
        >
          <View style={styles.healthSummaryContent}>
            <View style={styles.healthSummaryText}>
              <Text style={styles.healthSummaryTitle}>Health Score</Text>
              <Text style={styles.healthSummaryScore}>85/100</Text>
              <Text style={styles.healthSummarySubtitle}>Great progress this month!</Text>
            </View>
            <Ionicons name="trending-up" size={32} color="white" />
          </View>
        </Animated.View>

        {/* Profile Options */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Profile
          </Text>
          <View style={[styles.optionsContainer, { backgroundColor: colors.surface }]}>
            {profileOptions.map((option, index) => 
              renderOptionItem(option, index, index === profileOptions.length - 1)
            )}
          </View>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Settings
          </Text>
          <View style={[styles.optionsContainer, { backgroundColor: colors.surface }]}>
            {settingsOptions.map((option, index) => 
              renderOptionItem(option, index + profileOptions.length, index === settingsOptions.length - 1)
            )}
          </View>
        </View>

        {/* Account */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Account
          </Text>
          <View style={[styles.optionsContainer, { backgroundColor: colors.surface }]}>
            {accountOptions.map((option, index) => 
              renderOptionItem(option, index + profileOptions.length + settingsOptions.length, index === accountOptions.length - 1)
            )}
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  profileImagePhoto: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 20,
  },
  editProfileButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  editProfileButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  healthSummaryCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 24,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  healthSummaryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  healthSummaryText: {
    flex: 1,
  },
  healthSummaryTitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  healthSummaryScore: {
    color: 'white',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
  },
  healthSummarySubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  optionsContainer: {
    marginHorizontal: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  optionItem: {
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  lastOptionItem: {
    borderBottomWidth: 0,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  optionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  bottomSpacing: {
    height: 100,
  },
});
