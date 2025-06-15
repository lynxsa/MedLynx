import notifee, { 
  TriggerType, 
  RepeatFrequency, 
  AndroidImportance,
  AndroidVisibility,
  AndroidStyle,
  AndroidBadgeIconType,
  TimestampTrigger,
  EventType
} from '@notifee/react-native';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface MedicationReminder {
  id: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  times: string[];
  startDate: Date;
  endDate?: Date;
  instructions?: string;
  isActive: boolean;
}

export class EnhancedNotificationService {
  private static channelId = 'medication-reminders';
  
  static async initialize(): Promise<void> {
    try {
      // Request permissions
      await notifee.requestPermission();
      
      // Create notification channel for Android
      if (Platform.OS === 'android') {
        await notifee.createChannel({
          id: this.channelId,
          name: 'Medication Reminders',
          importance: AndroidImportance.HIGH,
          visibility: AndroidVisibility.PUBLIC,
          vibration: true, // Enable vibration
          vibrationPattern: [300, 500, 300, 500], // Custom vibration pattern
          lights: true,
          lightColor: '#3726a6', // LYNXPurple
          badge: true,
          sound: 'default', // Default notification sound
          description: 'Important medication reminder notifications',
        });
      }
      
      console.log('✅ Enhanced Notification Service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize notification service:', error);
    }
  }

  static async scheduleMedicationReminder(
    reminder: MedicationReminder
  ): Promise<string[]> {
    try {
      const notificationIds: string[] = [];
      
      for (const time of reminder.times) {
        const [hours, minutes] = time.split(':').map(Number);
        
        // Create trigger for daily repeat
        const trigger: TimestampTrigger = {
          type: TriggerType.TIMESTAMP,
          timestamp: this.getNextScheduleTime(hours, minutes).getTime(),
          repeatFrequency: RepeatFrequency.DAILY,
        };

        const notificationId = await notifee.createTriggerNotification(
          {
            id: `${reminder.id}-${time}`,
            title: `💊 Time for ${reminder.medicationName}`,
            body: `Take ${reminder.dosage} ${reminder.instructions ? `- ${reminder.instructions}` : ''}`,
            data: {
              medicationId: reminder.id,
              medicationName: reminder.medicationName,
              dosage: reminder.dosage,
              time: time,
            },
            android: {
              channelId: this.channelId,
              importance: AndroidImportance.HIGH,
              pressAction: {
                id: 'default',
                launchActivity: 'default',
              },
              actions: [
                {
                  title: '✅ Taken',
                  pressAction: {
                    id: 'taken',
                    launchActivity: 'default',
                  },
                },
                {
                  title: '⏰ Snooze 10min',
                  pressAction: {
                    id: 'snooze',
                    launchActivity: 'default',
                  },
                },
                {
                  title: '❌ Skip',
                  pressAction: {
                    id: 'skip',
                    launchActivity: 'default',
                  },
                },
              ],
              style: {
                type: AndroidStyle.BIGTEXT,
                text: `Don't forget to take your ${reminder.medicationName} (${reminder.dosage}). ${reminder.instructions || 'Take as prescribed.'}`,
              },
              color: '#3726a6', // LYNXPurple
              badgeIconType: AndroidBadgeIconType.SMALL,
              showTimestamp: true,
              largeIcon: require('../assets/images/icon.png'),
              // Add sound and vibration for Android notifications
              sound: 'default',
              vibrationPattern: [300, 500, 300, 500], 
            },
            ios: {
              categoryId: 'medication-reminder',
              critical: true,
              sound: 'default', // Enable default sound for iOS
            },
          },
          trigger
        );

        notificationIds.push(notificationId);
      }

      // Save reminder to storage
      await this.saveMedicationReminder(reminder);
      
      console.log(`✅ Scheduled ${notificationIds.length} notifications for ${reminder.medicationName}`);
      return notificationIds;
      
    } catch (error) {
      console.error('❌ Failed to schedule medication reminder:', error);
      throw error;
    }
  }

  static async cancelMedicationReminder(reminderId: string): Promise<void> {
    try {
      // Get all scheduled notifications
      const notifications = await notifee.getTriggerNotifications();
      
      // Cancel notifications for this reminder
      const toCancel = notifications.filter(n => 
        n.notification.id?.startsWith(reminderId)
      );
      
      for (const notification of toCancel) {
        if (notification.notification.id) {
          await notifee.cancelNotification(notification.notification.id);
        }
      }
      
      // Remove from storage
      await this.removeMedicationReminder(reminderId);
      
      console.log(`✅ Cancelled reminder: ${reminderId}`);
    } catch (error) {
      console.error('❌ Failed to cancel medication reminder:', error);
      throw error;
    }
  }

  static async snoozeNotification(notificationId: string, minutes: number = 10): Promise<void> {
    try {
      // Cancel the current notification
      await notifee.cancelNotification(notificationId);
      
      // Schedule a new one for later
      const snoozeTime = new Date();
      snoozeTime.setMinutes(snoozeTime.getMinutes() + minutes);
      
      const trigger: TimestampTrigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: snoozeTime.getTime(),
      };

      await notifee.createTriggerNotification(
        {
          id: `${notificationId}-snoozed`,
          title: '💊 Medication Reminder (Snoozed)',
          body: `Time to take your medication - snoozed for ${minutes} minutes`,
          android: {
            channelId: this.channelId,
            importance: AndroidImportance.HIGH,
            color: '#3726a6', // LYNXPurple
            // Add sound and vibration for snoozed Android notifications
            sound: 'default',
            vibrationPattern: [300, 500, 300, 500],
          },
          ios: { // Add sound for snoozed iOS notifications
            sound: 'default',
          }
        },
        trigger
      );
      
      console.log(`✅ Snoozed notification for ${minutes} minutes`);
    } catch (error) {
      console.error('❌ Failed to snooze notification:', error);
    }
  }

  static async markMedicationTaken(
    medicationId: string, 
    time: string, 
    takenAt: Date = new Date()
  ): Promise<void> {
    try {
      const key = `medication_log_${medicationId}`;
      const existingLog = await AsyncStorage.getItem(key);
      const log = existingLog ? JSON.parse(existingLog) : [];
      
      log.push({
        scheduledTime: time,
        takenAt: takenAt.toISOString(),
        status: 'taken',
      });
      
      await AsyncStorage.setItem(key, JSON.stringify(log));
      console.log(`✅ Marked medication as taken: ${medicationId} at ${time}`);
    } catch (error) {
      console.error('❌ Failed to log medication:', error);
    }
  }

  static async getAllActiveReminders(): Promise<MedicationReminder[]> {
    try {
      const reminders = await AsyncStorage.getItem('medication_reminders');
      return reminders ? JSON.parse(reminders) : [];
    } catch (error) {
      console.error('❌ Failed to get reminders:', error);
      return [];
    }
  }

  static async getMedicationLog(medicationId: string): Promise<any[]> {
    try {
      const key = `medication_log_${medicationId}`;
      const log = await AsyncStorage.getItem(key);
      return log ? JSON.parse(log) : [];
    } catch (error) {
      console.error('❌ Failed to get medication log:', error);
      return [];
    }
  }

  private static async saveMedicationReminder(reminder: MedicationReminder): Promise<void> {
    try {
      const existingReminders = await this.getAllActiveReminders();
      const updatedReminders = existingReminders.filter(r => r.id !== reminder.id);
      updatedReminders.push(reminder);
      
      await AsyncStorage.setItem('medication_reminders', JSON.stringify(updatedReminders));
    } catch (error) {
      console.error('❌ Failed to save reminder:', error);
    }
  }

  private static async removeMedicationReminder(reminderId: string): Promise<void> {
    try {
      const existingReminders = await this.getAllActiveReminders();
      const updatedReminders = existingReminders.filter(r => r.id !== reminderId);
      
      await AsyncStorage.setItem('medication_reminders', JSON.stringify(updatedReminders));
    } catch (error) {
      console.error('❌ Failed to remove reminder:', error);
    }
  }

  private static getNextScheduleTime(hours: number, minutes: number): Date {
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hours, minutes, 0, 0);
    
    // If the time has passed today, schedule for tomorrow
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }
    
    return scheduledTime;
  }

  static async setupNotificationActionHandlers(): Promise<void> {
    // Handle notification actions (taken, snooze, skip)
    notifee.onForegroundEvent(async ({ type, detail }) => {
      if (type === EventType.ACTION_PRESS) {
        const { pressAction, notification } = detail;
        
        if (pressAction?.id === 'taken' && notification?.data) {
          await this.markMedicationTaken(
            notification.data.medicationId as string,
            notification.data.time as string
          );
          
          // Show success notification
          await notifee.displayNotification({
            title: '✅ Great job!',
            body: `${notification.data.medicationName} marked as taken`,
            android: {
              channelId: this.channelId,
              smallIcon: 'ic_stat_medication_check',
              color: '#10B981', // Green
            },
          });
        }
        
        if (pressAction?.id === 'snooze' && notification?.id) {
          await this.snoozeNotification(notification.id, 10);
        }
        
        if (pressAction?.id === 'skip' && notification?.data) {
          console.log(`⏭️ Skipped medication: ${notification.data.medicationName}`);
        }
      }
    });

    // Handle background events
    notifee.onBackgroundEvent(async ({ type, detail }) => {
      if (type === EventType.ACTION_PRESS) {
        const { pressAction, notification } = detail;
        
        if (pressAction?.id === 'taken' && notification?.data) {
          await this.markMedicationTaken(
            notification.data.medicationId as string,
            notification.data.time as string
          );
        }
      }
    });
  }
}
