import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface MedicationReminder {
  id: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  times: string[]; // Changed from time to times array
  time: string; // Keep for backward compatibility
  daysOfWeek: number[]; // 0-6, Sunday-Saturday
  startDate: Date;
  endDate?: Date;
  instructions?: string;
  isActive: boolean;
  notificationId?: string;
}

export class EnhancedNotificationService {
  private static initialized = false;

  static async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Request permissions
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Notification permissions not granted');
        return;
      }

      this.initialized = true;
      console.log('Enhanced notification service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize notification service:', error);
    }
  }

  static async scheduleMedicationReminder(reminder: MedicationReminder): Promise<void> {
    try {
      await this.initialize();

      if (!reminder.isActive) return;

      // Cancel existing notification if any
      if (reminder.notificationId) {
        await Notifications.cancelScheduledNotificationAsync(reminder.notificationId);
      }

      const [hours, minutes] = reminder.time.split(':').map(Number);
      
      // Schedule for each day of the week
      for (const dayOfWeek of reminder.daysOfWeek) {
        const notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: '💊 Medication Reminder',
            body: `Time to take your ${reminder.medicationName}${reminder.dosage ? ` (${reminder.dosage})` : ''}`,
            data: {
              medicationId: reminder.id,
              type: 'medication_reminder',
            },
            sound: true,
          },
          trigger: {
            weekday: dayOfWeek === 0 ? 7 : dayOfWeek, // Expo uses 1-7, Sunday = 7
            hour: hours,
            minute: minutes,
            repeats: true,
          } as Notifications.CalendarTriggerInput,
        });

        // Store the notification ID for later cancellation
        reminder.notificationId = notificationId;
      }

      console.log(`Scheduled medication reminder for ${reminder.medicationName}`);
    } catch (error) {
      console.error('Failed to schedule medication reminder:', error);
    }
  }

  static async cancelMedicationReminder(reminderId: string): Promise<void> {
    try {
      // Get all scheduled notifications
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      
      // Find and cancel notifications for this medication
      const toCancel = scheduledNotifications.filter(notification => 
        notification.content.data?.medicationId === reminderId
      );

      for (const notification of toCancel) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }

      console.log(`Cancelled medication reminder: ${reminderId}`);
    } catch (error) {
      console.error('Failed to cancel medication reminder:', error);
    }
  }

  static async scheduleAppointmentReminder(
    appointmentId: string,
    title: string,
    datetime: Date,
    reminderMinutes: number = 30
  ): Promise<string | undefined> {
    try {
      await this.initialize();

      const reminderTime = new Date(datetime.getTime() - reminderMinutes * 60 * 1000);
      
      if (reminderTime <= new Date()) {
        console.warn('Appointment reminder time is in the past');
        return;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '📅 Appointment Reminder',
          body: `You have "${title}" in ${reminderMinutes} minutes`,
          data: {
            appointmentId,
            type: 'appointment_reminder',
          },
          sound: true,
        },
        trigger: {
          date: reminderTime,
        } as Notifications.DateTriggerInput,
      });

      console.log(`Scheduled appointment reminder for ${title}`);
      return notificationId;
    } catch (error) {
      console.error('Failed to schedule appointment reminder:', error);
    }
  }

  static async sendImmediateNotification(
    title: string,
    body: string,
    data?: Record<string, any>
  ): Promise<void> {
    try {
      await this.initialize();

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
        },
        trigger: null, // Send immediately
      });
    } catch (error) {
      console.error('Failed to send immediate notification:', error);
    }
  }

  static async getAllScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Failed to get scheduled notifications:', error);
      return [];
    }
  }

  static async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('Cancelled all scheduled notifications');
    } catch (error) {
      console.error('Failed to cancel all notifications:', error);
    }
  }

  static setupNotificationActionHandlers(): void {
    // Set up notification response handler
    Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      
      if (data?.type === 'medication_reminder') {
        console.log('Medication reminder tapped:', data.medicationId);
        // Handle medication reminder tap - could navigate to medication screen
      } else if (data?.type === 'appointment_reminder') {
        console.log('Appointment reminder tapped:', data.appointmentId);
        // Handle appointment reminder tap - could navigate to calendar
      }
    });

    // Set up notification received handler (when app is in foreground)
    Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received while app is active:', notification);
    });
  }

  static async getNotificationHistory(): Promise<any[]> {
    try {
      // Expo doesn't have a direct way to get notification history
      // Return scheduled notifications instead
      const scheduled = await this.getAllScheduledNotifications();
      return scheduled.map(notification => ({
        id: notification.identifier,
        title: notification.content.title,
        body: notification.content.body,
        trigger: notification.trigger,
        data: notification.content.data,
      }));
    } catch (error) {
      console.error('Failed to get notification history:', error);
      return [];
    }
  }

  static async testNotification(): Promise<void> {
    await this.sendImmediateNotification(
      '🧪 Test Notification',
      'MedLynx notifications are working perfectly!',
      { type: 'test' }
    );
  }

  // Legacy methods for backward compatibility
  static async getAllActiveReminders(): Promise<MedicationReminder[]> {
    try {
      const reminders = await AsyncStorage.getItem('medication_reminders');
      return reminders ? JSON.parse(reminders) : [];
    } catch (error) {
      console.error('Failed to get reminders:', error);
      return [];
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
      console.log(`Marked medication as taken: ${medicationId} at ${time}`);
    } catch (error) {
      console.error('Failed to log medication:', error);
    }
  }

  static async getMedicationLog(medicationId: string): Promise<any[]> {
    try {
      const key = `medication_log_${medicationId}`;
      const log = await AsyncStorage.getItem(key);
      return log ? JSON.parse(log) : [];
    } catch (error) {
      console.error('Failed to get medication log:', error);
      return [];
    }
  }
}

// Initialize the service when imported
EnhancedNotificationService.initialize();
