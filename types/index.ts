export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  time: string[];
  refillDate: string;
  pillsRemaining: number;
  color: string;
  taken: boolean;
  createdAt: string;
}

export interface DailyProgress {
  taken: number;
  total: number;
  percentage: number;
}

export interface NotificationSettings {
  enabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  reminderMinutes: number; // minutes before scheduled time
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: NotificationSettings;
  biometricEnabled: boolean;
  firstLaunch: boolean;
}

export type FrequencyType = 'Daily' | 'Twice Daily' | 'Three Times Daily' | 'Four Times Daily' | 'Weekly' | 'As Needed';

export const MEDICATION_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
  '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
  '#A55EEA', '#26C6DA', '#42A5F5', '#AB47BC', '#EC407A'
];

export const FREQUENCY_OPTIONS: FrequencyType[] = [
  'Daily',
  'Twice Daily', 
  'Three Times Daily',
  'Four Times Daily',
  'Weekly',
  'As Needed'
];

export const DEFAULT_TIMES = {
  'Daily': ['08:00'],
  'Twice Daily': ['08:00', '20:00'],
  'Three Times Daily': ['08:00', '14:00', '20:00'],
  'Four Times Daily': ['08:00', '12:00', '16:00', '20:00'],
  'Weekly': ['08:00'],
  'As Needed': []
};
