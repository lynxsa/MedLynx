import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { EnhancedNotificationService, MedicationReminder } from '../../utils/EnhancedNotificationService';
import notifee from '@notifee/react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Theme } from '../../constants/DynamicTheme'; // Import Theme type

export default function NotificationTestScreen() {
  const { theme, themeMode } = useTheme(); // Use themeMode for StatusBar
  const styles = useStyles(theme);
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(false);

  const testNotificationIn10Seconds = async () => {
    setIsLoading(true);
    try {
      const testReminder: MedicationReminder = {
        id: `test_${Date.now()}`,
        medicationName: 'Test Medication',
        dosage: '10mg',
        frequency: 'Daily',
        times: ['18:30'], // Will be overridden
        startDate: new Date(),
        instructions: 'Test notification for demo purposes',
        isActive: true,
      };

      const testTime = new Date();
      testTime.setSeconds(testTime.getSeconds() + 10);
      const timeString = testTime.toTimeString().slice(0, 5);
      
      testReminder.times = [timeString];

      await EnhancedNotificationService.scheduleMedicationReminder(testReminder);
      
      Alert.alert(
        '🎉 Test Notification Scheduled!',
        `A test medication reminder will appear in 10 seconds.\n\nTime: ${timeString}\nYou'll see quick action buttons to test the interaction.`,
        [{ text: 'Got it!' }]
      );
    } catch (error) {
      console.error('Error scheduling test notification:', error);
      Alert.alert('Error', 'Failed to schedule test notification');
    } finally {
      setIsLoading(false);
    }
  };

  const testImmediateNotification = async () => {
    setIsLoading(true);
    try {
      await EnhancedNotificationService.initialize();
      
      await notifee.displayNotification({
        title: '💊 MedLynx Reminder',
        body: 'Time to take your Vitamin D (1000mg) - Test notification',
        data: {
          medicationId: 'test_123',
          medicationName: 'Vitamin D',
          dosage: '1000mg',
          time: new Date().toTimeString().slice(0, 5),
        },
        android: {
          channelId: 'medication-reminders',
          importance: 4, // HIGH
          pressAction: {
            id: 'default',
            launchActivity: 'default',
          },
          actions: [
            {
              title: '✅ Taken',
              pressAction: { id: 'taken', launchActivity: 'default' },
            },
            {
              title: '⏰ Snooze 10min',
              pressAction: { id: 'snooze', launchActivity: 'default' },
            },
            {
              title: '❌ Skip',
              pressAction: { id: 'skip', launchActivity: 'default' },
            },
          ],
          color: theme.colors.primary, // Use theme color
          largeIcon: require('../../assets/images/icon.png'),
        },
      });
      
      Alert.alert(
        '🔔 Immediate Notification Sent!',
        'Check your notification panel to see the MedLynx reminder with quick action buttons.',
        [{ text: 'Check Notifications' }]
      );
    } catch (error) {
      console.error('Error showing immediate notification:', error);
      Alert.alert('Error', 'Failed to show immediate notification');
    } finally {
      setIsLoading(false);
    }
  };

  const showRemindersInfo = () => {
    Alert.alert(
      '📱 Enhanced Notifications Features',
      `✅ Rich Notifications with Quick Actions\n• "Taken" - Mark medication as completed\n• "Snooze" - Delay reminder by 10 minutes\n• "Skip" - Dismiss for this dose\n\n🎨 Professional Design\n• Theme-aware colors\n• Large icon and styled text\n• High priority for important health reminders\n\n🔄 Smart Scheduling\n• Daily repeating reminders\n• Automatic next-day scheduling\n• Persistent across device reboots\n\n📊 Tracking & Analytics\n• Medication adherence logging\n• Skip/taken statistics\n• Historical data for health insights`,
      [{ text: 'Awesome!' }]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.primary} />
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryDark]}
        style={[styles.gradientContainer, { paddingTop: insets.top }]}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notification Testing</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="notifications" size={32} color={theme.colors.primary} />
              <Text style={styles.cardTitle}>Enhanced Medication Reminders</Text>
            </View>
            <Text style={styles.cardDescription}>
              Test the new notification system with rich interactions, quick actions, and a professional design.
            </Text>
          </View>

          <View style={styles.testSection}>
            <Text style={styles.sectionTitle}>🧪 Test Notifications</Text>
            
            <TouchableOpacity
              style={styles.testButton}
              onPress={testImmediateNotification}
              disabled={isLoading}
            >
              <Ionicons name="flash" size={24} color={theme.colors.white} />
              <Text style={styles.testButtonText}>Show Immediate Test</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.testButtonSecondary}
              onPress={testNotificationIn10Seconds}
              disabled={isLoading}
            >
              <Ionicons name="timer" size={24} color={theme.colors.white} />
              <Text style={styles.testButtonText}>Schedule 10-Second Test</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.testButtonInfo}
              onPress={showRemindersInfo}
            >
              <Ionicons name="information-circle" size={24} color={theme.colors.white} />
              <Text style={styles.testButtonText}>Feature Overview</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.instructionCard}>
            <Text style={styles.instructionTitle}>📋 How to Test</Text>
            <Text style={styles.instructionText}>
              1. Tap &quot;Show Immediate Test&quot; to see a notification right now{'\n'}
              2. Tap &quot;Schedule 10-Second Test&quot; for a delayed notification{'\n'}
              3. Check your notification panel and test the quick actions{'\n'}
              4. Try &quot;Taken&quot;, &quot;Snooze&quot;, and &quot;Skip&quot; buttons
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

// Renamed from useThemedStyles to avoid conflict if it exists elsewhere
// and to follow a common pattern for local style hooks.
const useStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background, // Use theme color
  },
  gradientContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.bold as 'bold',
    color: theme.colors.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: theme.colors.shadow.medium, // Use theme shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.bold as 'bold',
    color: theme.colors.textPrimary,
    marginLeft: 12,
    flex: 1,
  },
  cardDescription: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.lineHeights.normal,
  },
  testSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.bold as 'bold',
    color: theme.colors.white, // Text on gradient, so white is fine
    marginBottom: 16,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: theme.colors.primary, // Base button style
  },
  testButtonSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: theme.colors.secondary, // Secondary button color
  },
  testButtonInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: theme.colors.info, // Info button color
  },
  testButtonText: {
    color: theme.colors.white, // Text on colored buttons
    fontSize: theme.typography.fontSizes.base,
    fontWeight: theme.typography.fontWeights.semibold as '600',
    marginLeft: 8,
  },
  instructionCard: {
    backgroundColor: theme.colors.glass.background, // Use glass background color
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.colors.glass.border,
  },
  instructionTitle: {
    fontSize: theme.typography.fontSizes.base,
    fontWeight: theme.typography.fontWeights.bold as 'bold',
    color: theme.colors.white, // Text on glass backdrop (dark theme might need adjustment)
    marginBottom: 8,
  },
  instructionText: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.white, // Text on glass backdrop
    lineHeight: theme.typography.lineHeights.relaxed,
    opacity: 0.9,
  },
});
