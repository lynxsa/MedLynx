import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Modal,
  TextInput,
  Alert,
  Platform,
  ViewStyle, TextStyle // Import style types, removed ImageStyle
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { Theme } from '../../constants/DynamicTheme'; // Import Theme

const { width } = Dimensions.get('window');

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  time: string[];
  refillDate: string;
  pillsRemaining: number;
  color: string;
  taken: boolean;
}

interface Appointment {
  id: string;
  doctorName: string;
  clinicName: string;
  date: Date;
  time: string;
  reasonForVisit: string;
  notes: string;
  reminderSet: boolean;
  type: 'appointment' | 'checkup' | 'followup' | 'emergency';
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
}

interface CalendarDay {
  date: Date;
  isToday: boolean;
  isCurrentMonth: boolean;
  appointments: Appointment[];
  medications: Medication[];
}

// Define an interface for the styles
interface CalendarStyles {
  container: ViewStyle;
  header: ViewStyle;
  backButton: ViewStyle;
  headerTitle: TextStyle;
  addButton: ViewStyle;
  calendarControls: ViewStyle;
  navButton: ViewStyle;
  monthYearText: TextStyle;
  daysHeader: ViewStyle;
  dayHeaderText: TextStyle;
  calendarGrid: ViewStyle;
  dayCell: ViewStyle;
  todayCell: ViewStyle;
  otherMonthCell: ViewStyle;
  selectedDayCell: ViewStyle;
  dayText: TextStyle;
  todayText: TextStyle;
  otherMonthText: TextStyle;
  selectedDayText: TextStyle;
  appointmentIndicator: ViewStyle;
  medicationIndicator: ViewStyle;
  selectedDateInfoContainer: ViewStyle;
  selectedDateHeaderText: TextStyle;
  detailsScrollContainer: ViewStyle;
  emptyState: ViewStyle;
  emptyText: TextStyle;
  addAppointmentButton: ViewStyle;
  addAppointmentButtonText: TextStyle;
  section: ViewStyle;
  sectionHeader: ViewStyle;
  sectionTitle: TextStyle;
  appointmentCard: ViewStyle;
  appointmentHeader: ViewStyle;
  appointmentTitleRow: ViewStyle;
  appointmentDoctorName: TextStyle;
  deleteButton: ViewStyle;
  appointmentClinic: TextStyle;
  appointmentTimeText: TextStyle;
  appointmentReasonText: TextStyle;
  appointmentNotes: TextStyle;
  appointmentStatusRow: ViewStyle;
  statusBadge: ViewStyle;
  statusText: TextStyle;
  reminderIndicatorContainer: ViewStyle;
  reminderText: TextStyle;
  medicationCard: ViewStyle;
  medicationInfo: ViewStyle;
  medicationName: TextStyle;
  medicationDosage: TextStyle;
  medicationTimes: ViewStyle;
  timeChip: ViewStyle;
  timeChipText: TextStyle;
  modalContainer: ViewStyle;
  modalContent: ViewStyle;
  modalTitle: TextStyle;
  input: TextStyle; // Corrected to TextStyle
  notesInput: TextStyle; // Corrected to TextStyle
  datePickerButton: ViewStyle;
  datePickerText: TextStyle;
  modalButtons: ViewStyle;
  modalButton: ViewStyle;
  cancelButton: ViewStyle;
  saveButton: ViewStyle;
  modalButtonText: TextStyle;
}

export default function AppointmentCalendarScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation(['common', 'appointments', 'health']);
  const { theme, isDark } = useTheme();
  const styles = useThemedStyles(createStyles);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [medications, setMedications] = useState<Medication[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddAppointmentModal, setShowAddAppointmentModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [newAppointment, setNewAppointment] = useState<Partial<Appointment>>({
    doctorName: '',
    clinicName: '',
    date: new Date(),
    time: '',
    reasonForVisit: '',
    notes: '',
    type: 'appointment',
    status: 'scheduled',
    reminderSet: true,
  });

  const loadData = async () => {
    try {
      const [storedMedications, storedAppointments] = await Promise.all([
        AsyncStorage.getItem('medications'),
        AsyncStorage.getItem('appointments')
      ]);
      
      if (storedMedications) {
        setMedications(JSON.parse(storedMedications));
      }
      
      if (storedAppointments) {
        const parsed = JSON.parse(storedAppointments);
        const appointmentsWithDates = parsed.map((apt: any) => ({
          ...apt,
          date: new Date(apt.date)
        }));
        setAppointments(appointmentsWithDates);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const saveAppointments = async (appointmentsList: Appointment[]) => {
    try {
      await AsyncStorage.setItem('appointments', JSON.stringify(appointmentsList));
    } catch (error) {
      console.error('Error saving appointments:', error);
    }
  };

  const generateCalendar = useCallback(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days: CalendarDay[] = [];
    const today = new Date();
    
    const daysInMonth = lastDay.getDate();
    const totalDays = Math.ceil((daysInMonth + firstDay.getDay()) / 7) * 7;
    
    for (let i = 0; i < totalDays; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const isToday = date.toDateString() === today.toDateString();
      const isCurrentMonth = date.getMonth() === month;
      
      // Filter appointments for this date
      const dayAppointments = appointments.filter(apt => 
        apt.date.toDateString() === date.toDateString()
      );
      
      days.push({
        date,
        isToday,
        isCurrentMonth,
        appointments: dayAppointments,
        medications: [] // Keep medications for compatibility, or filter if needed
      });
    }
    
    setCalendarDays(days);
  }, [currentDate, appointments]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    generateCalendar();
  }, [currentDate, appointments, generateCalendar]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  const selectDate = (date: Date) => {
    setSelectedDate(date);
  };

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString(t('common:locale', 'en-US'), { month: 'long', year: 'numeric' });
  };

  const addAppointment = async () => {
    if (!newAppointment.doctorName || !newAppointment.time) {
      Alert.alert(t('common:error'), t('appointments:fillRequiredFields'));
      return;
    }

    const appointment: Appointment = {
      id: Date.now().toString(),
      doctorName: newAppointment.doctorName!,
      clinicName: newAppointment.clinicName || '',
      date: newAppointment.date || new Date(),
      time: newAppointment.time!,
      reasonForVisit: newAppointment.reasonForVisit || '',
      notes: newAppointment.notes || '',
      type: newAppointment.type || 'appointment',
      status: 'scheduled',
      reminderSet: newAppointment.reminderSet || false,
    };

    const updatedAppointments = [...appointments, appointment];
    setAppointments(updatedAppointments);
    await saveAppointments(updatedAppointments);

    // Schedule notification if reminder is set
    if (appointment.reminderSet) {
      // TODO: Implement notification scheduling with @notifee/react-native
      console.log('Scheduling reminder for appointment:', appointment.id);
    }

    setShowAddAppointmentModal(false);
    setNewAppointment({
      doctorName: '',
      clinicName: '',
      date: new Date(),
      time: '',
      reasonForVisit: '',
      notes: '',
      type: 'appointment',
      status: 'scheduled',
      reminderSet: true,
    });
  };

  const deleteAppointment = async (appointmentId: string) => {
    Alert.alert(
      t('appointments:deleteAppointmentTitle'),
      t('appointments:deleteAppointmentConfirm'),
      [
        { text: t('common:cancel'), style: 'cancel' },
        {
          text: t('common:delete'),
          style: 'destructive',
          onPress: async () => {
            const updatedAppointments = appointments.filter(apt => apt.id !== appointmentId);
            setAppointments(updatedAppointments);
            await saveAppointments(updatedAppointments);
          },
        },
      ]
    );
  };

  const getAppointmentTypeIcon = (type: string): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'checkup': return 'heart-outline';
      case 'followup': return 'return-up-forward-outline';
      case 'emergency': return 'alert-circle-outline';
      default: return 'calendar-outline';
    }
  };

  const getAppointmentTypeColor = (type: string) => {
    switch (type) {
      case 'checkup': return theme.colors.success; // Formerly HealthHubTheme.medical.health
      case 'followup': return theme.colors.info; // Formerly HealthHubTheme.medical.appointment, using info as an alternative
      case 'emergency': return theme.colors.error; // Formerly HealthHubTheme.medical.heart
      default: return theme.colors.primary;
    }
  };

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || newAppointment.date || new Date();
    setShowDatePicker(Platform.OS === 'ios');
    setNewAppointment({ ...newAppointment, date: currentDate });
  };

  const onTimeChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
    const currentTime = selectedTime || newAppointment.date || new Date();
    setShowTimePicker(Platform.OS === 'ios');
    // Format time as HH:MM
    const hours = currentTime.getHours().toString().padStart(2, '0');
    const minutes = currentTime.getMinutes().toString().padStart(2, '0');
    setNewAppointment({ ...newAppointment, time: `${hours}:${minutes}`, date: currentTime });
  };

  const renderSelectedDateContent = () => {
    const selectedAppointments = appointments.filter(apt => 
      apt.date.toDateString() === selectedDate.toDateString()
    );
    
    // For simplicity, showing all medications. Refine if needed to show only for selectedDate.
    const selectedMedications = medications; 

    if (selectedAppointments.length === 0 && selectedMedications.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="calendar-outline" size={48} color={theme.colors.textDisabled} />
          <Text style={styles.emptyText}>{t('appointments:noAppointmentsOrMedications', 'No appointments or medications for this date')}</Text>
          <TouchableOpacity 
            style={styles.addAppointmentButton}
            onPress={() => setShowAddAppointmentModal(true)}
          >
            <Ionicons name="add" size={20} color={theme.colors.white} />
            <Text style={styles.addAppointmentButtonText}>{t('appointments:addAppointmentTitle')}</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        {selectedAppointments.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="calendar" size={20} color={theme.colors.primary} />
              <Text style={styles.sectionTitle}>{t('appointments:title')}</Text>
            </View>
            {selectedAppointments.map((appointment) => (
              <View key={appointment.id} style={[
                styles.appointmentCard,
                { borderLeftColor: getAppointmentTypeColor(appointment.type) }
              ]}>
                <View style={styles.appointmentHeader}>
                  <View style={styles.appointmentTitleRow}>
                    <Ionicons 
                      name={getAppointmentTypeIcon(appointment.type)} 
                      size={20} 
                      color={getAppointmentTypeColor(appointment.type)} 
                    />
                    <Text style={styles.appointmentDoctorName}>{appointment.doctorName}</Text>
                  </View>
                  <TouchableOpacity 
                    onPress={() => deleteAppointment(appointment.id)}
                    style={styles.deleteButton}
                  >
                    <Ionicons name="trash-outline" size={16} color={theme.colors.error} />
                  </TouchableOpacity>
                </View>
                
                {appointment.clinicName && <Text style={styles.appointmentClinic}>{appointment.clinicName}</Text>}
                <Text style={styles.appointmentTimeText}>
                  <Ionicons name="time-outline" size={14} color={theme.colors.textSecondary} />
                  {' '}{appointment.time}
                </Text>
                
                {appointment.reasonForVisit && (
                  <Text style={styles.appointmentReasonText}>
                    <Ionicons name="document-text-outline" size={14} color={theme.colors.textSecondary} />
                    {' '}{appointment.reasonForVisit}
                  </Text>
                )}
                
                {appointment.notes && (
                  <Text style={styles.appointmentNotes}>{appointment.notes}</Text>
                )}
                
                <View style={styles.appointmentStatusRow}>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: appointment.status === 'scheduled' ? theme.colors.success : theme.colors.cardDisabled }
                  ]}>
                    <Text style={[
                      styles.statusText,
                      { color: appointment.status === 'scheduled' ? theme.colors.white : theme.colors.textSecondary }
                    ]}>
                      {t(`appointments:status${appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}`, appointment.status)}
                    </Text>
                  </View>
                  {appointment.reminderSet && (
                    <View style={styles.reminderIndicatorContainer}>
                      <Ionicons name="notifications" size={12} color={theme.colors.accent} />
                      <Text style={styles.reminderText}>{t('appointments:reminderSet')}</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {selectedMedications.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="medical" size={20} color={theme.colors.accent} />
              <Text style={styles.sectionTitle}>{t('health:medications')}</Text>
            </View>
            {selectedMedications.map((medication) => (
              <View key={medication.id} style={[styles.medicationCard, { borderLeftColor: medication.color || theme.colors.accent }]}>
                <View style={styles.medicationInfo}>
                  <Text style={styles.medicationName}>{medication.name}</Text>
                  <Text style={styles.medicationDosage}>{medication.dosage}</Text>
                </View>
                <View style={styles.medicationTimes}>
                  {medication.time.map((time, index) => (
                    <View key={index} style={styles.timeChip}>
                      <Text style={styles.timeChipText}>{time}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    );
  };

  const weekDays = (t('common:weekDaysShort', { returnObjects: true }) || ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']) as string[];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.primaryDark} />
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryDark]}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('appointments:calendarTitle')}</Text>
        <TouchableOpacity onPress={() => setShowAddAppointmentModal(true)} style={styles.addButton}>
          <Ionicons name="add-circle-outline" size={30} color={theme.colors.white} />
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.calendarControls}>
        <TouchableOpacity onPress={() => navigateMonth('prev')} style={styles.navButton}>
          <Ionicons name="chevron-back" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.monthYearText}>{getMonthName(currentDate)}</Text>
        <TouchableOpacity onPress={() => navigateMonth('next')} style={styles.navButton}>
          <Ionicons name="chevron-forward" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.daysHeader}>
        {weekDays.map(day => (
          <Text key={day} style={styles.dayHeaderText}>{day}</Text>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.calendarGrid}>
        {calendarDays.map((day, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dayCell,
              day.isToday && styles.todayCell,
              !day.isCurrentMonth && styles.otherMonthCell,
              selectedDate.toDateString() === day.date.toDateString() && styles.selectedDayCell,
            ]}
            onPress={() => selectDate(day.date)}
          >
            <Text
              style={[
                styles.dayText,
                day.isToday && styles.todayText,
                !day.isCurrentMonth && styles.otherMonthText,
                selectedDate.toDateString() === day.date.toDateString() && styles.selectedDayText,
              ]}
            >
              {day.date.getDate()}
            </Text>
            {day.appointments.length > 0 && (
              <View style={[styles.appointmentIndicator, {backgroundColor: theme.colors.primary}]} />
            )}
             {/* Optional: Add medication indicator similar to renderCalendarDay_Old if needed */}
             {/* {medications.filter(m => new Date(m.refillDate).toDateString() === day.date.toDateString()).length > 0 && day.isCurrentMonth && ( */}
             {/*   <View style={[styles.medicationIndicator, {backgroundColor: theme.colors.accent}]} /> */}
             {/* )} */}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {selectedDate && (
        <View style={styles.selectedDateInfoContainer}>
          <Text style={styles.selectedDateHeaderText}>
            {selectedDate.toLocaleDateString(t('common:locale', 'en-US'), { weekday: 'long', month: 'long', day: 'numeric' })}
          </Text>
          <View style={styles.detailsScrollContainer}>
            {renderSelectedDateContent()}
          </View>
        </View>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={showAddAppointmentModal}
        onRequestClose={() => setShowAddAppointmentModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('appointments:addAppointmentTitle')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('appointments:doctorNamePlaceholder')}
              placeholderTextColor={theme.colors.placeholder}
              value={newAppointment.doctorName}
              onChangeText={text => setNewAppointment({ ...newAppointment, doctorName: text })}
            />
            <TextInput
              style={styles.input}
              placeholder={t('appointments:clinicNamePlaceholder')}
              placeholderTextColor={theme.colors.placeholder}
              value={newAppointment.clinicName}
              onChangeText={text => setNewAppointment({ ...newAppointment, clinicName: text })}
            />
            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePickerButton}>
              <Text style={styles.datePickerText}>
                {t('appointments:dateLabel')}: {newAppointment.date?.toLocaleDateString(t('common:locale', 'en-US')) || t('appointments:selectDatePrompt')}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={newAppointment.date || new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onDateChange}
                textColor={Platform.OS === 'ios' ? theme.colors.textPrimary : undefined}
              />
            )}
            <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.datePickerButton}>
              <Text style={styles.datePickerText}>
                {t('appointments:timeLabel')}: {newAppointment.time || t('appointments:selectTimePrompt')}
              </Text>
            </TouchableOpacity>
            {showTimePicker && (
              <DateTimePicker
                value={newAppointment.date || new Date()} 
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onTimeChange}
                is24Hour={true}
                textColor={Platform.OS === 'ios' ? theme.colors.textPrimary : undefined}
              />
            )}
            <TextInput
              style={styles.input}
              placeholder={t('appointments:reasonPlaceholder')}
              placeholderTextColor={theme.colors.placeholder}
              value={newAppointment.reasonForVisit}
              onChangeText={text => setNewAppointment({ ...newAppointment, reasonForVisit: text })}
            />
            <TextInput
              style={[styles.input, styles.notesInput]}
              placeholder={t('appointments:notesPlaceholder')}
              placeholderTextColor={theme.colors.placeholder}
              value={newAppointment.notes}
              onChangeText={text => setNewAppointment({ ...newAppointment, notes: text })}
              multiline
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setShowAddAppointmentModal(false)} style={[styles.modalButton, styles.cancelButton]}>
                <Text style={[styles.modalButtonText, { color: theme.colors.textPrimary }]}>{t('common:cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={addAppointment} style={[styles.modalButton, styles.saveButton]}>
                <Text style={styles.modalButtonText}>{t('common:save')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const createStyles = (theme: Theme): CalendarStyles => StyleSheet.create<CalendarStyles>({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    // borderBottomWidth: 1, // Removed to rely on LinearGradient visual separation
    // borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.white,
  },
  addButton: {
    padding: 8,
  },
  calendarControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: theme.colors.card.background, // Use theme.colors.card.background
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  navButton: {
    padding: 8,
  },
  monthYearText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  daysHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: theme.colors.cardSecondary,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  dayHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    width: width / 7,
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 4, // Reduced padding for tighter grid
  },
  dayCell: {
    width: (width - 8) / 7 - 8, // Adjusted for new padding and margin
    height: (width - 8) / 7 - 4, // Made slightly less tall
    justifyContent: 'center',
    alignItems: 'center',
    margin: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card.background, // Use theme.colors.card.background
  },
  todayCell: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primary,
  },
  otherMonthCell: {
    backgroundColor: theme.colors.cardDisabled,
    opacity: 0.6,
  },
  selectedDayCell: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primaryDark,
  },
  dayText: {
    fontSize: 16,
    color: theme.colors.textPrimary,
  },
  todayText: {
    fontWeight: 'bold',
    color: theme.colors.primaryDark,
  },
  otherMonthText: {
    color: theme.colors.textDisabled,
  },
  selectedDayText: {
    color: theme.colors.white,
    fontWeight: 'bold',
  },
  appointmentIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    // backgroundColor is set inline based on theme
    position: 'absolute',
    bottom: 6,
    // right: 6; // Centered indicator
    alignSelf: 'center',
  },
  medicationIndicator: { // Added for consistency if used in main grid
    width: 6,
    height: 6,
    borderRadius: 3,
    // backgroundColor is set inline based on theme
    position: 'absolute',
    bottom: 6,
    left: 6, // Or adjust as needed
  },
  selectedDateInfoContainer: {
    padding: 16,
    backgroundColor: theme.colors.card.background, // Use theme.colors.card.background
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    maxHeight: Dimensions.get('window').height * 0.4, // Increased max height
  },
  selectedDateHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  detailsScrollContainer: {
    // This View wraps the ScrollView returned by renderSelectedDateContent
    // Add flex: 1 if you want it to take available space within selectedDateInfoContainer
  },
  // Styles for renderSelectedDateContent
  emptyState: {
    flex: 1, // Allow it to take space if detailsScrollContainer has flex
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 150, // Ensure it has some height
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  addAppointmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  addAppointmentButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    marginLeft: 8,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 20,
    backgroundColor: theme.colors.cardSecondary, // Added background to section
    borderRadius: 8,
    padding: 12, 
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginLeft: 8,
  },
  appointmentCard: {
    backgroundColor: theme.colors.card.background, // Use theme.colors.card.background
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderLeftWidth: 5,
    // borderLeftColor is set dynamically
    shadowColor: theme.colors.shadow.light, // Use theme.colors.shadow.light or appropriate shadow
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  appointmentTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1, // Allow text to wrap
  },
  appointmentDoctorName: { // Renamed from appointmentDoctor for clarity
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginLeft: 8,
    flexShrink: 1, // Allow text to shrink and wrap
  },
  deleteButton: {
    padding: 8, // Make it easier to tap
  },
  appointmentClinic: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  appointmentTimeText: { // Renamed from appointmentTime
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  appointmentReasonText: { // Renamed from appointmentReason
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  appointmentNotes: {
    fontSize: 14,
    color: theme.colors.textTertiary,
    fontStyle: 'italic',
    marginTop: 4,
    marginBottom: 8,
  },
  appointmentStatusRow: { // Renamed from appointmentStatus
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    // backgroundColor is set inline
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    // color is set inline
  },
  reminderIndicatorContainer: { // Renamed from reminderIndicator
    flexDirection: 'row',
    alignItems: 'center',
  },
  reminderText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginLeft: 4,
  },
  // Medication specific styles for renderSelectedDateContent
  medicationCard: {
    backgroundColor: theme.colors.card.background, // Use theme.colors.card.background
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    // borderLeftColor is set dynamically
    shadowColor: theme.colors.shadow.light, // Use theme.colors.shadow.light
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  medicationInfo: {
    marginBottom: 8,
  },
  medicationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  medicationDosage: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  medicationTimes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  timeChip: {
    backgroundColor: theme.colors.primaryLight,
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginRight: 6,
    marginBottom: 6,
  },
  timeChipText: {
    fontSize: 12,
    color: theme.colors.primaryDark,
    fontWeight: '500',
  },
  // Styles for the modal
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Semi-transparent background
  },
  modalContent: {
    width: '90%',
    backgroundColor: theme.colors.card.background, // Changed from background to card
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    shadowColor: theme.colors.shadow.medium, // Use theme.colors.shadow.medium or appropriate shadow
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: theme.colors.inputBackground,
    color: theme.colors.inputText,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  notesInput: {
    minHeight: 100,
    textAlignVertical: 'top', // For multiline input
  },
  datePickerButton: {
    backgroundColor: theme.colors.cardSecondary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  datePickerText: {
    fontSize: 16,
    color: theme.colors.textPrimary,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around', // Or 'flex-end' with spacing
    marginTop: 20,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: theme.colors.buttonSecondaryBackground, // Use a secondary button color
    marginRight: 10, // Add space if using space-between for modalButtons isn't enough
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
  },
  modalButtonText: {
    color: theme.colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
});
