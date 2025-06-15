import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MedicationStorage } from '../../utils/MedicationStorage';
import { EnhancedNotificationService, MedicationReminder } from '../../utils/EnhancedNotificationService';
import { MEDICATION_COLORS } from '../../types';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../../contexts/ThemeContext';
import { useThemedStyles } from '../../hooks/useThemedStyles';

const frequencies = ['Daily', 'Twice Daily', 'Three Times Daily', 'Four Times Daily', 'Weekly'];

export default function AddMedicationScreen() {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useThemedStyles(createStyles);
  
  const [medicationName, setMedicationName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('Daily');
  const [selectedTimes, setSelectedTimes] = useState<string[]>(['08:00']);
  const [pillsRemaining, setPillsRemaining] = useState('');
  const [refillDate, setRefillDate] = useState(new Date());
  const [selectedColor, setSelectedColor] = useState(MEDICATION_COLORS[0]);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentTimeIndex, setCurrentTimeIndex] = useState(0);

  const handleFrequencyChange = (freq: string) => {
    setFrequency(freq);
    // Adjust times based on frequency
    switch (freq) {
      case 'Daily':
        setSelectedTimes(['08:00']);
        break;
      case 'Twice Daily':
        setSelectedTimes(['08:00', '20:00']);
        break;
      case 'Three Times Daily':
        setSelectedTimes(['08:00', '14:00', '20:00']);
        break;
      case 'Four Times Daily':
        setSelectedTimes(['08:00', '12:00', '16:00', '20:00']);
        break;
      case 'Weekly':
        setSelectedTimes(['08:00']);
        break;
      default:
        setSelectedTimes(['08:00']);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      const timeString = selectedTime.toTimeString().slice(0, 5);
      const newTimes = [...selectedTimes];
      newTimes[currentTimeIndex] = timeString;
      setSelectedTimes(newTimes);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setRefillDate(selectedDate);
    }
  };

  const openTimePicker = (index: number) => {
    setCurrentTimeIndex(index);
    setShowTimePicker(true);
  };

  const validateForm = () => {
    if (!medicationName.trim()) {
      Alert.alert('Error', 'Please enter medication name');
      return false;
    }
    if (!dosage.trim()) {
      Alert.alert('Error', 'Please enter dosage');
      return false;
    }
    if (!pillsRemaining.trim() || isNaN(Number(pillsRemaining))) {
      Alert.alert('Error', 'Please enter valid number of pills remaining');
      return false;
    }
    return true;
  };

  const saveMedication = async () => {
    if (!validateForm()) return;

    const medicationData = {
      name: medicationName.trim(),
      dosage: dosage.trim(),
      frequency,
      time: selectedTimes,
      refillDate: refillDate.toISOString().split('T')[0],
      pillsRemaining: Number(pillsRemaining),
      color: selectedColor,
      taken: false
    };

    try {
      const medication = await MedicationStorage.saveMedication(medicationData);
      if (medication) {
        // Create enhanced medication reminder
        const reminder: MedicationReminder = {
          id: medication.id || `med_${Date.now()}`,
          medicationName: medication.name,
          dosage: medication.dosage,
          frequency: medication.frequency,
          times: medication.time,
          startDate: new Date(),
          endDate: refillDate,
          instructions: `Take with ${frequency.toLowerCase()}`,
          isActive: true,
        };

        // Schedule enhanced notifications
        await EnhancedNotificationService.scheduleMedicationReminder(reminder);
        
        Alert.alert(
          '🎉 Success!', 
          `${medicationName} added successfully!\n\n💊 Smart reminders scheduled\n⏰ Times: ${selectedTimes.join(', ')}\n🔔 Notifications will include quick actions`, 
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else {
        Alert.alert('Error', 'Failed to save medication');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save medication');
      console.error('Error saving medication:', error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar 
        barStyle={isDark ? "light-content" : "dark-content"} 
        backgroundColor={theme.colors.primary} 
      />
      <LinearGradient 
        colors={theme.gradients.primary as any} 
        style={[styles.gradientContainer, { paddingTop: insets.top }]}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.textOnPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Medication</Text>
          <TouchableOpacity onPress={saveMedication}>
            <Text style={styles.saveButton}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Medication Name */}
          <View style={styles.section}>
            <Text style={styles.label}>Medication Name</Text>
            <TextInput
              style={styles.input}
              value={medicationName}
              onChangeText={setMedicationName}
              placeholder="Enter medication name"
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>

          {/* Dosage */}
          <View style={styles.section}>
            <Text style={styles.label}>Dosage</Text>
            <TextInput
              style={styles.input}
              value={dosage}
              onChangeText={setDosage}
              placeholder="e.g., 500mg, 1 tablet"
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>

          {/* Frequency */}
          <View style={styles.section}>
            <Text style={styles.label}>Frequency</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.frequencyContainer}>
              {frequencies.map((freq) => (
                <TouchableOpacity
                  key={freq}
                  style={[
                    styles.frequencyButton,
                    frequency === freq && styles.selectedFrequency
                  ]}
                  onPress={() => handleFrequencyChange(freq)}
                >
                  <Text style={[
                    styles.frequencyText,
                    frequency === freq && styles.selectedFrequencyText
                  ]}>
                    {freq}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Times */}
          <View style={styles.section}>
            <Text style={styles.label}>Times</Text>
            <View style={styles.timesContainer}>
              {selectedTimes.map((time, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.timeButton}
                  onPress={() => openTimePicker(index)}
                >
                  <Ionicons name="time-outline" size={20} color={theme.colors.primary} />
                  <Text style={styles.timeText}>{time}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Pills Remaining */}
          <View style={styles.section}>
            <Text style={styles.label}>Pills Remaining</Text>
            <TextInput
              style={styles.input}
              value={pillsRemaining}
              onChangeText={setPillsRemaining}
              placeholder="Enter number of pills"
              placeholderTextColor={theme.colors.textSecondary}
              keyboardType="numeric"
            />
          </View>

          {/* Refill Date */}
          <View style={styles.section}>
            <Text style={styles.label}>Refill Date</Text>
            <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
              <Ionicons name="calendar-outline" size={20} color={theme.colors.primary} />
              <Text style={styles.dateText}>{refillDate.toLocaleDateString()}</Text>
            </TouchableOpacity>
          </View>

          {/* Color Selection */}
          <View style={styles.section}>
            <Text style={styles.label}>Color</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.colorsContainer}>
              {MEDICATION_COLORS.map((color: string) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorButton,
                    { backgroundColor: color },
                    selectedColor === color && styles.selectedColor
                  ]}
                  onPress={() => setSelectedColor(color)}
                >
                  {selectedColor === color && (
                    <Ionicons name="checkmark" size={20} color="white" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </ScrollView>

        {/* Time Picker */}
        {showTimePicker && (
          <DateTimePicker
            value={new Date(`2000-01-01T${selectedTimes[currentTimeIndex]}:00`)}
            mode="time"
            is24Hour={true}
            display="default"
            onChange={handleTimeChange}
          />
        )}

        {/* Date Picker */}
        {showDatePicker && (
          <DateTimePicker
            value={refillDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}
      </LinearGradient>
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },
  gradientContainer: {
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
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textOnPrimary,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 20,
  },
  section: {
    marginBottom: 28,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 12,
  },
  input: {
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    color: theme.colors.text,
    backgroundColor: theme.colors.card,
    fontWeight: '500',
  },
  frequencyContainer: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  frequencyButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: theme.colors.card,
    marginRight: 12,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  selectedFrequency: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  frequencyText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  selectedFrequencyText: {
    color: theme.colors.textOnPrimary,
  },
  timesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  timeText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '700',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 12,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  dateText: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  colorsContainer: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  colorButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  selectedColor: {
    borderWidth: 4,
    borderColor: theme.colors.textOnPrimary,
    elevation: 6,
    shadowOpacity: 0.4,
    transform: [{ scale: 1.1 }],
  },
});
