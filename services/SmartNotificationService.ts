// Smart Notification Service for MedLynx
// Provides intelligent, contextual notifications for health management

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

export interface SmartNotification {
  id: string;
  type: 'medication' | 'appointment' | 'health-check' | 'wellness-tip' | 'emergency-alert' | 'achievement';
  title: string;
  body: string;
  priority: 'low' | 'normal' | 'high' | 'critical';
  scheduledTime?: Date;
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    daysOfWeek?: number[]; // 0-6, Sunday-Saturday
    time: string; // HH:MM format
  };
  context?: {
    medicationName?: string;
    doctorName?: string;
    healthMetric?: string;
    targetValue?: number;
  };
  aiGenerated: boolean;
  category: string;
  actionRequired: boolean;
  deepLink?: string;
}

export interface NotificationPreferences {
  medicationReminders: boolean;
  appointmentAlerts: boolean;
  healthTips: boolean;
  emergencyAlerts: boolean;
  achievementCelebrations: boolean;
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM
    end: string; // HH:MM
  };
  frequency: 'minimal' | 'balanced' | 'comprehensive';
}

class SmartNotificationService {
  private static instance: SmartNotificationService;
  private preferences: NotificationPreferences;
  private activeNotifications: SmartNotification[] = [];

  private constructor() {
    this.preferences = {
      medicationReminders: true,
      appointmentAlerts: true,
      healthTips: true,
      emergencyAlerts: true,
      achievementCelebrations: true,
      quietHours: {
        enabled: true,
        start: '22:00',
        end: '07:00'
      },
      frequency: 'balanced'
    };
    this.initializeNotifications();
  }

  static getInstance(): SmartNotificationService {
    if (!SmartNotificationService.instance) {
      SmartNotificationService.instance = new SmartNotificationService();
    }
    return SmartNotificationService.instance;
  }

  private async initializeNotifications(): Promise<void> {
    try {
      // Configure notification handler
      Notifications.setNotificationHandler({
        handleNotification: async (notification) => {
          const priority = notification.request.content.data?.priority || 'normal';
          return {
            shouldShowAlert: true,
            shouldShowBanner: true,
            shouldShowList: true,
            shouldPlaySound: priority === 'high' || priority === 'critical',
            shouldSetBadge: true,
          };
        },
      });

      // Request permissions
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Notification permissions not granted');
        return;
      }

      // Load saved preferences
      await this.loadPreferences();
      
      // Initialize smart notifications
      await this.setupIntelligentReminders();
      
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
    }
  }

  private async loadPreferences(): Promise<void> {
    try {
      const savedPreferences = await AsyncStorage.getItem('notificationPreferences');
      if (savedPreferences) {
        this.preferences = { ...this.preferences, ...JSON.parse(savedPreferences) };
      }
    } catch (error) {
      console.error('Failed to load notification preferences:', error);
    }
  }

  async updatePreferences(newPreferences: Partial<NotificationPreferences>): Promise<void> {
    this.preferences = { ...this.preferences, ...newPreferences };
    try {
      await AsyncStorage.setItem('notificationPreferences', JSON.stringify(this.preferences));
      await this.setupIntelligentReminders(); // Refresh notifications with new preferences
    } catch (error) {
      console.error('Failed to save notification preferences:', error);
    }
  }

  private async setupIntelligentReminders(): Promise<void> {
    // Cancel all existing notifications
    await Notifications.cancelAllScheduledNotificationsAsync();
    this.activeNotifications = [];

    // Set up medication reminders
    if (this.preferences.medicationReminders) {
      await this.scheduleMedicationReminders();
    }

    // Set up health check reminders
    await this.scheduleHealthCheckReminders();

    // Set up wellness tips
    if (this.preferences.healthTips) {
      await this.scheduleWellnessTips();
    }

    // Set up achievement tracking
    if (this.preferences.achievementCelebrations) {
      await this.scheduleAchievementChecks();
    }
  }

  private async scheduleMedicationReminders(): Promise<void> {
    try {
      const medications = await AsyncStorage.getItem('medications');
      if (!medications) return;

      const medicationList = JSON.parse(medications);
      
      for (const medication of medicationList) {
        if (medication.reminderTimes && medication.reminderTimes.length > 0) {
          for (const timeStr of medication.reminderTimes) {
            const notification: SmartNotification = {
              id: `med_${medication.id}_${timeStr}`,
              type: 'medication',
              title: '💊 Medication Reminder',
              body: `Time to take your ${medication.name}${medication.dosage ? ` (${medication.dosage})` : ''}`,
              priority: 'high',
              recurring: {
                frequency: 'daily',
                time: timeStr
              },
              context: {
                medicationName: medication.name
              },
              aiGenerated: true,
              category: 'health_management',
              actionRequired: true,
              deepLink: '/add-medication'
            };

            await this.scheduleSmartNotification(notification);
          }
        }
      }
    } catch (error) {
      console.error('Failed to schedule medication reminders:', error);
    }
  }

  private async scheduleHealthCheckReminders(): Promise<void> {
    const healthCheckReminders = [
      {
        id: 'blood_pressure_weekly',
        title: '🩺 Weekly Health Check',
        body: 'Time for your weekly blood pressure check. Stay on top of your health!',
        recurring: {
          frequency: 'weekly' as const,
          daysOfWeek: [1], // Monday
          time: '09:00'
        }
      },
      {
        id: 'weight_tracking',
        title: '⚖️ Weight Tracking Reminder',
        body: 'Track your weight progress this week. Small steps lead to big changes!',
        recurring: {
          frequency: 'weekly' as const,
          daysOfWeek: [6], // Saturday
          time: '08:00'
        }
      }
    ];

    for (const reminder of healthCheckReminders) {
      const notification: SmartNotification = {
        ...reminder,
        type: 'health-check',
        priority: 'normal',
        aiGenerated: true,
        category: 'health_monitoring',
        actionRequired: false,
        deepLink: '/health-metrics'
      };

      await this.scheduleSmartNotification(notification);
    }
  }

  private async scheduleWellnessTips(): Promise<void> {
    const wellnessTips = [
      {
        title: '🌟 Daily Wellness Tip',
        tips: [
          'Stay hydrated! Aim for 8 glasses of water today.',
          'Take a 10-minute walk to boost your energy and mood.',
          'Practice deep breathing for 5 minutes to reduce stress.',
          'Eat colorful fruits and vegetables for essential nutrients.',
          'Get 7-9 hours of quality sleep for optimal health.',
          'Stretch for 5 minutes to improve flexibility and reduce tension.',
          'Take breaks from screens to rest your eyes and mind.'
        ]
      }
    ];

    // Schedule a daily wellness tip at 10 AM
    const randomTip = wellnessTips[0].tips[Math.floor(Math.random() * wellnessTips[0].tips.length)];
    
    const notification: SmartNotification = {
      id: 'daily_wellness_tip',
      type: 'wellness-tip',
      title: wellnessTips[0].title,
      body: randomTip,
      priority: 'low',
      recurring: {
        frequency: 'daily',
        time: '10:00'
      },
      aiGenerated: true,
      category: 'wellness',
      actionRequired: false
    };

    await this.scheduleSmartNotification(notification);
  }

  private async scheduleAchievementChecks(): Promise<void> {
    // Check for achievements weekly
    const notification: SmartNotification = {
      id: 'achievement_check',
      type: 'achievement',
      title: '🏆 Achievement Check',
      body: 'Check your health achievements this week. You\'re doing great!',
      priority: 'low',
      recurring: {
        frequency: 'weekly',
        daysOfWeek: [0], // Sunday
        time: '19:00'
      },
      aiGenerated: true,
      category: 'motivation',
      actionRequired: false,
      deepLink: '/enhanced-home-clean'
    };

    await this.scheduleSmartNotification(notification);
  }

  private async scheduleSmartNotification(notification: SmartNotification): Promise<void> {
    try {
      // Check if we're in quiet hours
      if (this.isInQuietHours(notification.recurring?.time || '09:00')) {
        return; // Skip scheduling during quiet hours
      }

      // Frequency-based filtering
      if (this.preferences.frequency === 'minimal' && notification.priority === 'low') {
        return; // Skip low priority notifications in minimal mode
      }

      if (notification.recurring) {
        const trigger = this.createRecurringTrigger(notification.recurring);
        
        await Notifications.scheduleNotificationAsync({
          identifier: notification.id,
          content: {
            title: notification.title,
            body: notification.body,
            data: {
              priority: notification.priority,
              category: notification.category,
              deepLink: notification.deepLink,
              aiGenerated: notification.aiGenerated
            },
            sound: notification.priority === 'high' || notification.priority === 'critical' ? 'default' : false,
          },
          trigger
        });

        this.activeNotifications.push(notification);
      }
    } catch (error) {
      console.error(`Failed to schedule notification ${notification.id}:`, error);
    }
  }

  private createRecurringTrigger(recurring: SmartNotification['recurring']): any {
    if (!recurring) return null;

    const [hours, minutes] = recurring.time.split(':').map(Number);

    switch (recurring.frequency) {
      case 'daily':
        return {
          hour: hours,
          minute: minutes,
          repeats: true
        };
      
      case 'weekly':
        return {
          weekday: recurring.daysOfWeek?.[0] || 1,
          hour: hours,
          minute: minutes,
          repeats: true
        };
      
      case 'monthly':
        return {
          day: 1, // First day of month
          hour: hours,
          minute: minutes,
          repeats: true
        };
      
      default:
        return null;
    }
  }

  private isInQuietHours(time: string): boolean {
    if (!this.preferences.quietHours.enabled) return false;

    const [hour, minute] = time.split(':').map(Number);
    const timeInMinutes = hour * 60 + minute;
    
    const [startHour, startMinute] = this.preferences.quietHours.start.split(':').map(Number);
    const startInMinutes = startHour * 60 + startMinute;
    
    const [endHour, endMinute] = this.preferences.quietHours.end.split(':').map(Number);
    const endInMinutes = endHour * 60 + endMinute;

    // Handle overnight quiet hours (e.g., 22:00 to 07:00)
    if (startInMinutes > endInMinutes) {
      return timeInMinutes >= startInMinutes || timeInMinutes <= endInMinutes;
    } else {
      return timeInMinutes >= startInMinutes && timeInMinutes <= endInMinutes;
    }
  }

  // Send immediate contextual notification
  async sendContextualNotification(
    title: string, 
    body: string, 
    priority: SmartNotification['priority'] = 'normal',
    deepLink?: string
  ): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: {
            priority,
            aiGenerated: true,
            deepLink,
            contextual: true
          },
          sound: priority === 'high' || priority === 'critical' ? 'default' : false,
        },
        trigger: null, // Send immediately
      });
    } catch (error) {
      console.error('Failed to send contextual notification:', error);
    }
  }

  // Emergency notification (bypasses all preferences)
  async sendEmergencyNotification(title: string, body: string, deepLink?: string): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `🚨 ${title}`,
          body,
          data: {
            priority: 'critical',
            emergency: true,
            deepLink
          },
          sound: 'default',
        },
        trigger: null,
      });
    } catch (error) {
      console.error('Failed to send emergency notification:', error);
    }
  }

  // Get notification analytics
  async getNotificationAnalytics(): Promise<{
    totalSent: number;
    averageEngagement: number;
    mostEffectiveTime: string;
    categoryBreakdown: Record<string, number>;
  }> {
    // Mock analytics - in real implementation, track user interactions
    return {
      totalSent: this.activeNotifications.length * 7, // Weekly estimate
      averageEngagement: 0.73, // 73% engagement rate
      mostEffectiveTime: '09:00',
      categoryBreakdown: {
        medication: 12,
        health_monitoring: 5,
        wellness: 7,
        achievements: 2
      }
    };
  }

  // Test notification
  async sendTestNotification(): Promise<void> {
    await this.sendContextualNotification(
      '🧪 Test Notification',
      'MedLynx smart notifications are working perfectly!',
      'normal'
    );
  }

  getActiveNotifications(): SmartNotification[] {
    return this.activeNotifications;
  }

  getPreferences(): NotificationPreferences {
    return this.preferences;
  }
}

export const smartNotificationService = SmartNotificationService.getInstance();
