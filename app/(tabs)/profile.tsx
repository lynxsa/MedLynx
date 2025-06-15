import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../contexts/ThemeContext';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import LanguageSelector from '../../components/LanguageSelector';

export default function ProfileScreen() {
  const { theme, isDark } = useTheme();
  const styles = useThemedStyles(createStyles);
  const insets = useSafeAreaInsets();
  const [languageSelectorVisible, setLanguageSelectorVisible] = useState(false);

  const profileOptions = [
    {
      id: 'medications',
      title: 'My Medications',
      icon: 'medical-outline',
      subtitle: 'View and manage your medications',
      onPress: () => router.push('/home' as any)
    },
    {
      id: 'dr-lynx',
      title: 'Dr. LYNX AI Assistant',
      icon: 'chatbubble-ellipses-outline',
      subtitle: 'Chat with your AI health assistant',
      onPress: () => router.push('/dr-lynx' as any)
    },
    {
      id: 'health-directory',
      title: 'Health Directory',
      icon: 'business-outline',
      subtitle: 'Find nearby health facilities',
      onPress: () => router.push('/health-directory' as any)
    },
    {
      id: 'prescriptions',
      title: 'Prescription Refills',
      icon: 'document-text-outline',
      subtitle: 'Upload and manage prescriptions',
      onPress: () => router.push('/prescription-refills' as any)
    },
    {
      id: 'ehr-lite',
      title: 'EHR Lite',
      icon: 'folder-outline',
      subtitle: 'Electronic health records',
      onPress: () => router.push('/ehr-lite' as any)
    },
    {
      id: 'health-metrics',
      title: 'Health Metrics',
      icon: 'analytics-outline',
      subtitle: 'BMI calculator and health tracking',
      onPress: () => router.push('/health-metrics' as any)
    },
    {
      id: 'language',
      title: 'Language / Ulimi',
      icon: 'language-outline',
      subtitle: 'Change app language',
      onPress: () => setLanguageSelectorVisible(true)
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: 'notifications-outline',
      subtitle: 'Manage medication reminders',
      onPress: () => router.push('/notification-test' as any)
    },
    {
      id: 'onboarding-debug',
      title: 'Developer Tools',
      icon: 'code-outline',
      subtitle: 'Test onboarding and notifications',
      onPress: () => router.push('/onboarding-debug' as any)
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: 'settings-outline',
      subtitle: 'App preferences and settings',
      onPress: () => Alert.alert('Feature Coming Soon', 'Settings will be available soon')
    },
    {
      id: 'backup',
      title: 'Backup & Sync',
      icon: 'cloud-upload-outline',
      subtitle: 'Backup your medication data',
      onPress: () => Alert.alert('Feature Coming Soon', 'Backup & sync will be available soon')
    },
    {
      id: 'support',
      title: 'Help & Support',
      icon: 'help-circle-outline',
      subtitle: 'Get help and contact support',
      onPress: () => Alert.alert('Help & Support', 'For support, please contact: support@medlynx.co.za')
    }
  ];

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your medications and data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('medications');
              Alert.alert('Success', 'All data has been cleared', [
                { text: 'OK', onPress: () => router.push('/home' as any) }
              ]);
            } catch (err) {
              console.error('Error clearing data:', err);
              Alert.alert('Error', 'Failed to clear data');
            }
          }
        }
      ]
    );
  };

  const renderProfileOption = (option: typeof profileOptions[0]) => (
    <TouchableOpacity
      key={option.id}
      style={styles.optionCard}
      onPress={option.onPress}
      activeOpacity={0.7}
    >
      <View style={styles.optionIcon}>
        <Ionicons name={option.icon as any} size={24} color={theme.colors.primary} />
      </View>
      <View style={styles.optionContent}>
        <Text style={styles.optionTitle}>{option.title}</Text>
        <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar 
        barStyle={isDark ? "light-content" : "dark-content"} 
        backgroundColor={theme.colors.primary} 
      />
      <LinearGradient 
        colors={theme.gradients.primary as any} 
        style={[styles.container, { paddingTop: insets.top }]}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.textOnPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Profile Info */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={40} color={theme.colors.textOnPrimary} />
          </View>
          <Text style={styles.userName}>MedLYNX User</Text>
          <Text style={styles.userEmail}>Stay healthy, stay on track</Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionTitle}>Account</Text>
            {profileOptions.map(renderProfileOption)}

            {/* Danger Zone */}
            <View style={styles.dangerZone}>
              <Text style={styles.dangerTitle}>Danger Zone</Text>
              <TouchableOpacity
                style={styles.dangerButton}
                onPress={handleClearData}
                activeOpacity={0.7}
              >
                <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
                <Text style={styles.dangerButtonText}>Clear All Data</Text>
              </TouchableOpacity>
            </View>

            {/* App Info */}
            <View style={styles.appInfo}>
              <Text style={styles.appInfoText}>MedLynx v1.0.0</Text>
              <Text style={styles.appInfoText}>Your South African Health Companion 💊</Text>
            </View>
          </ScrollView>
        </View>
      </LinearGradient>

      {/* Language Selector Modal */}
      <LanguageSelector
        visible={languageSelectorVisible}
        onClose={() => setLanguageSelectorVisible(false)}
      />
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.textOnPrimary,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  avatarContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: theme.effects.glassmorphism.overlayLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 3,
    borderColor: theme.effects.glassmorphism.borderLight,
    ...theme.effects.glassmorphism,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.textOnPrimary,
    marginBottom: 8,
  },
  userEmail: {
    fontSize: 16,
    color: theme.colors.textOnPrimarySecondary,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 20,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.medium,
  },
  optionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    ...theme.shadows.small,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  dangerZone: {
    marginTop: 40,
    marginBottom: 30,
  },
  dangerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.error,
    marginBottom: 16,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.errorSurface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: theme.colors.errorBorder,
    gap: 16,
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.error,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  appInfoText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 6,
    fontWeight: '500',
  },
});
