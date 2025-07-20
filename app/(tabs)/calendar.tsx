import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Modal,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle
} from 'react-native';
import { StandardHeader } from '../../components/StandardHeader';
import { Theme } from '../../constants/DynamicTheme';
import { useTheme } from '../../contexts/ThemeContext';
import { useThemedStyles } from '../../hooks/useThemedStyles';

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

interface Reminder {
  id: string;
  title: string;
  description: string;
  date: Date;
  time: string;
  category: 'medication' | 'appointment' | 'personal' | 'health' | 'exercise' | 'diet';
  isActive: boolean;
  isRecurring: boolean;
  recurringType?: 'daily' | 'weekly' | 'monthly';
  priority: 'low' | 'medium' | 'high';
  reminderSet: boolean;
  notificationId?: string;
}

interface CalendarDay {
  date: Date;
  isToday: boolean;
  isCurrentMonth: boolean;
  appointments: Appointment[];
  medications: Medication[];
  reminders: Reminder[];
}

interface QuickAction {
  id: string;
  title: string;
  icon: string;
  color: string;
  action: () => void;
}

interface CalendarStyles {
  // Main container
  container: ViewStyle;
  scrollContainer: ViewStyle;
  
  // Header actions
  todayButton: ViewStyle;
  
  // Form styles
  formRow: ViewStyle;
  dateTimeButton: ViewStyle;
  dateTimeText: TextStyle;
  appointmentTypeButtons: ViewStyle;
  typeButton: ViewStyle;
  activeTypeButton: ViewStyle;
  typeButtonText: TextStyle;
  activeTypeButtonText: TextStyle;
  
  // Calendar section
  calendarSection: ViewStyle;
  calendarCard: ViewStyle;
  calendarHeader: ViewStyle;
  monthNavigation: ViewStyle;
  monthButton: ViewStyle;
  monthText: TextStyle;
  yearText: TextStyle;
  
  // Week days
  weekdaysHeader: ViewStyle;
  weekdayText: TextStyle;
  
  // Calendar grid
  calendarGrid: ViewStyle;
  dayCell: ViewStyle;
  todayCell: ViewStyle;
  selectedCell: ViewStyle;
  otherMonthCell: ViewStyle;
  dayText: TextStyle;
  todayText: TextStyle;
  selectedDayText: TextStyle;
  otherMonthText: TextStyle;
  
  // Event indicators
  eventIndicators: ViewStyle;
  eventDot: ViewStyle;
  
  // Selected day section
  selectedDaySection: ViewStyle;
  selectedDayHeader: ViewStyle;
  selectedDayTitle: TextStyle;
  selectedDayDate: TextStyle;
  
  // Filter tabs
  filterTabs: ViewStyle;
  filterTab: ViewStyle;
  activeFilterTab: ViewStyle;
  filterTabIcon: TextStyle;
  filterTabText: TextStyle;
  activeFilterTabText: TextStyle;
  
  // Events
  eventsContainer: ViewStyle;
  eventCard: ViewStyle;
  eventHeader: ViewStyle;
  priorityIndicator: ViewStyle;
  eventTime: TextStyle;
  eventTitle: TextStyle;
  eventSubtitle: TextStyle;
  eventDescription: TextStyle;
  eventActions: ViewStyle;
  eventActionButton: ViewStyle;
  
  // Empty state
  emptyState: ViewStyle;
  emptyStateIcon: ViewStyle;
  emptyStateTitle: TextStyle;
  emptyStateText: TextStyle;
  emptyStateButton: ViewStyle;
  emptyStateButtonText: TextStyle;
  
  // FAB
  fab: ViewStyle;
  
  // Modal styles
  modalContainer: ViewStyle;
  modalHeader: ViewStyle;
  modalTitle: TextStyle;
  modalBackdrop: ViewStyle;
  doctorsList: ViewStyle;
  
  // Doctor card styles
  doctorCard: ViewStyle;
  doctorInfo: ViewStyle;
  doctorHeader: ViewStyle;
  doctorName: TextStyle;
  doctorRating: ViewStyle;
  ratingText: TextStyle;
  doctorSpecialty: TextStyle;
  doctorClinic: TextStyle;
  doctorDetails: ViewStyle;
  doctorDetailItem: ViewStyle;
  doctorDistance: TextStyle;
  doctorPhone: TextStyle;
  availabilityContainer: ViewStyle;
  availabilityLabel: TextStyle;
  timeSlots: ViewStyle;
  timeSlot: ViewStyle;
  timeSlotText: TextStyle;
  moreTimesText: TextStyle;
  bookButton: ViewStyle;
  bookButtonText: TextStyle;
  
  // Appointment modal styles
  appointmentModal: ViewStyle;
  appointmentModalHeader: ViewStyle;
  appointmentModalTitle: TextStyle;
  appointmentForm: ViewStyle;
  selectedDoctorInfo: ViewStyle;
  selectedDoctorName: TextStyle;
  selectedDoctorClinic: TextStyle;
  formGroup: ViewStyle;
  formLabel: TextStyle;
  formInput: TextStyle;
  notesInput: TextStyle;
  bookAppointmentButton: ViewStyle;
  bookAppointmentButtonText: TextStyle;

  // Priority button styles
  priorityButtons: ViewStyle;
  priorityButton: ViewStyle;
  activePriorityButton: ViewStyle;
  priorityButtonText: TextStyle;
  activePriorityButtonText: TextStyle;

  // Quick actions grid styles (3 per row)
  quickActionsCarousel: ViewStyle;
  quickActionsGrid: ViewStyle;
  quickActionGridCard: ViewStyle;
  quickActionGridIcon: ViewStyle;
  quickActionGridLabel: TextStyle;

  // Appointment history modal styles
  appointmentHistoryList: ViewStyle;
  emptyHistoryState: ViewStyle;
  emptyHistoryTitle: TextStyle;
  emptyHistoryText: TextStyle;
  historyCard: ViewStyle;
  historyCardHeader: ViewStyle;
  historyCardIcon: ViewStyle;
  historyCardContent: ViewStyle;
  historyDoctorName: TextStyle;
  historyClinicName: TextStyle;
  historyCardDate: ViewStyle;
  historyDateText: TextStyle;
  historyTimeText: TextStyle;
  historyReasonContainer: ViewStyle;
  historyReasonText: TextStyle;
  historyNotesContainer: ViewStyle;
  historyNotesText: TextStyle;
  historyStatusContainer: ViewStyle;
  historyStatusBadge: ViewStyle;
  historyStatusText: TextStyle;
}

// Constants for form options
const APPOINTMENT_TYPES = ['appointment', 'checkup', 'followup', 'emergency'];
const MEDICATION_FREQUENCIES = ['daily', 'twice_daily', 'three_times_daily', 'weekly'];

export default function ModernCalendarScreen() {
  const { theme, isDark } = useTheme();
  const styles = useThemedStyles(createStyles);
  
  // Priority options for reminders
  const priorityOptions = ['low', 'medium', 'high'] as const;
  
  // State management
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeFilter, setActiveFilter] = useState<'all' | 'appointments' | 'medications' | 'reminders'>('all');
  const [refreshing, setRefreshing] = useState(false);
  
  // Data states
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);

  // Helper functions
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${period}`;
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'high': return '#FF4444';
      case 'medium': return '#FFA500';
      case 'low': return '#4CAF50';
      default: return theme.colors.textSecondary;
    }
  };

  const getCategoryIcon = (category: string): string => {
    switch (category) {
      case 'medication': return 'medical-outline';
      case 'appointment': return 'calendar-outline';
      case 'health': return 'heart-outline';
      case 'exercise': return 'fitness-outline';
      case 'diet': return 'nutrition-outline';
      default: return 'alarm-outline';
    }
  };

  // Generate calendar days
  const generateCalendarDays = useCallback(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days: CalendarDay[] = [];
    const today = new Date();
    
    // Add previous month's trailing days
    const prevMonth = new Date(year, month - 1, 0);
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonth.getDate() - i);
      days.push({
        date,
        isToday: false,
        isCurrentMonth: false,
        appointments: [],
        medications: [],
        reminders: []
      });
    }
    
    // Add current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isToday = date.toDateString() === today.toDateString();
      
      days.push({
        date,
        isToday,
        isCurrentMonth: true,
        appointments: appointments.filter(apt => 
          apt.date.toDateString() === date.toDateString()
        ),
        medications: medications.filter(med => 
          med.time.some(time => {
            const medDate = new Date();
            return medDate.toDateString() === date.toDateString();
          })
        ),
        reminders: reminders.filter(rem => 
          rem.date.toDateString() === date.toDateString()
        )
      });
    }
    
    // Add next month's leading days
    const remainingCells = 42 - days.length; // 6 weeks × 7 days
    for (let day = 1; day <= remainingCells; day++) {
      const date = new Date(year, month + 1, day);
      days.push({
        date,
        isToday: false,
        isCurrentMonth: false,
        appointments: [],
        medications: [],
        reminders: []
      });
    }
    
    setCalendarDays(days);
  }, [currentDate, appointments, medications, reminders]);

  // Navigation functions
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(currentDate.getMonth() - 1);
    } else {
      newDate.setMonth(currentDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  // Doctor data for appointment booking
  const availableDoctors = [
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      specialty: 'General Practice',
      clinic: 'Mediclinic Sandton',
      address: '33 Rivonia Road, Sandton',
      phone: '+27 11 709 2000',
      rating: 4.5,
      distance: '1.2 km',
      availability: ['09:00', '10:30', '14:00', '15:30'],
      isAvailable: true
    },
    {
      id: '2',
      name: 'Dr. Michael Smith',
      specialty: 'Cardiology',
      clinic: 'Sunninghill Heart Hospital',
      address: '12 Eton Road, Sandton',
      phone: '+27 11 806 1500',
      rating: 4.7,
      distance: '3.2 km',
      availability: ['08:00', '11:00', '13:00', '16:00'],
      isAvailable: true
    },
    {
      id: '3',
      name: 'Dr. Jennifer Adams',
      specialty: 'Pediatrics',
      clinic: 'Morningside Clinic',
      address: '20 Lyme Park, Morningside',
      phone: '+27 11 282 2000',
      rating: 4.2,
      distance: '2.1 km',
      availability: ['09:30', '11:30', '14:30', '16:30'],
      isAvailable: true
    },
    {
      id: '4',
      name: 'Dr. Robert Wilson',
      specialty: 'Internal Medicine',
      clinic: 'Helen Joseph Hospital',
      address: 'Perth Road, Auckland Park',
      phone: '+27 11 276 8000',
      rating: 3.9,
      distance: '12.3 km',
      availability: ['08:30', '10:00', '13:30', '15:00'],
      isAvailable: true
    },
    {
      id: '5',
      name: 'Dr. Lisa Brown',
      specialty: 'Dermatology',
      clinic: 'Sandton Medical Centre',
      address: '222 Rivonia Road, Sandton',
      phone: '+27 11 783 0000',
      rating: 4.4,
      distance: '2.8 km',
      availability: ['10:00', '12:00', '15:00', '17:00'],
      isAvailable: true
    }
  ];

  const [showDoctorSelectionModal, setShowDoctorSelectionModal] = useState(false);
  const [showAddAppointmentModal, setShowAddAppointmentModal] = useState(false);
  const [showCustomReminderModal, setShowCustomReminderModal] = useState(false);
  const [showMedicationModal, setShowMedicationModal] = useState(false);
  const [showAppointmentHistoryModal, setShowAppointmentHistoryModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [customReminder, setCustomReminder] = useState({
    title: '',
    doctorName: '',
    clinicName: '',
    date: new Date(),
    time: '',
    notes: '',
    category: 'appointment' as 'appointment' | 'health' | 'personal',
    priority: 'medium' as 'low' | 'medium' | 'high'
  });
  const [medicationForm, setMedicationForm] = useState({
    name: '',
    dosage: '',
    frequency: 'daily' as 'daily' | 'twice_daily' | 'three_times_daily' | 'weekly',
    time: '',
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    instructions: '',
    prescribedBy: '',
    pharmacy: '',
    reminderEnabled: true,
    notes: ''
  });
  const [newAppointment, setNewAppointment] = useState({
    doctorName: '',
    clinicName: '',
    date: new Date(),
    time: '',
    reasonForVisit: '',
    notes: '',
    type: 'appointment' as 'appointment' | 'checkup' | 'followup' | 'emergency',
    status: 'scheduled' as 'scheduled' | 'completed' | 'cancelled' | 'rescheduled',
    reminderSet: true,
  });

  // Filter options for schedule
  const filterOptions = [
    { key: 'all', label: 'All', icon: 'apps-outline' },
    { key: 'appointments', label: 'Appointments', icon: 'calendar-outline' },
    { key: 'medications', label: 'Meds', icon: 'medical-outline' },
    { key: 'reminders', label: 'Reminders', icon: 'alarm-outline' }
  ];

  // Quick actions - Updated order and functionality
  const quickActions: QuickAction[] = [
    {
      id: 'add-medication',
      title: 'Add Medication',
      icon: 'medical-outline',
      color: '#FF6B6B',
      action: () => {
        setShowMedicationModal(true);
      }
    },
    {
      id: 'add-appointment',
      title: 'Add Appointment',
      icon: 'calendar-outline',
      color: '#FF9500',
      action: () => {
        setShowCustomReminderModal(true);
      }
    },
    {
      id: 'book-appointment',
      title: 'Book Dr Appointment',
      icon: 'medical-outline',
      color: theme.colors.primary,
      action: () => {
        setShowDoctorSelectionModal(true);
      }
    },
    {
      id: 'scan-medication',
      title: 'Scan Medication',
      icon: 'camera-outline',
      color: '#45B7D1',
      action: () => {
        router.push('/medication-scanner');
      }
    },
    {
      id: 'refill-meds',
      title: 'Refill Meds',
      icon: 'refresh-outline',
      color: '#10B981',
      action: () => {
        router.push('/carehub');
      }
    },
    {
      id: 'appointment-history',
      title: 'Appointment History',
      icon: 'time-outline',
      color: '#8B5CF6',
      action: () => {
        // Show modal with appointment history
        setShowAppointmentHistoryModal(true);
      }
    }
  ];

  // Filter events based on selected filter
  const getFilteredEvents = () => {
    const selectedDay = calendarDays.find(day => 
      day.date.toDateString() === selectedDate.toDateString()
    );
    
    if (!selectedDay) return [];
    
    let events: any[] = [];
    
    if (activeFilter === 'all' || activeFilter === 'appointments') {
      events = [...events, ...selectedDay.appointments.map(apt => ({
        ...apt,
        type: 'appointment',
        displayTime: apt.time,
        displayTitle: apt.doctorName,
        displaySubtitle: apt.clinicName,
        displayDescription: apt.reasonForVisit
      }))];
    }
    
    if (activeFilter === 'all' || activeFilter === 'medications') {
      selectedDay.medications.forEach(med => {
        med.time.forEach(time => {
          events.push({
            ...med,
            type: 'medication',
            displayTime: time,
            displayTitle: med.name,
            displaySubtitle: med.dosage,
            displayDescription: `Take ${med.frequency}`
          });
        });
      });
    }
    
    if (activeFilter === 'all' || activeFilter === 'reminders') {
      events = [...events, ...selectedDay.reminders.map(rem => ({
        ...rem,
        type: 'reminder',
        displayTime: rem.time,
        displayTitle: rem.title,
        displaySubtitle: rem.category,
        displayDescription: rem.description
      }))];
    }
    
    return events.sort((a, b) => {
      const timeA = a.displayTime.split(':').map(Number);
      const timeB = b.displayTime.split(':').map(Number);
      return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1]);
    });
  };

  // Mock reminder data for demonstration - moved inside useMemo to avoid re-creation
  const mockReminders = useMemo(() => [
    {
      id: '1',
      title: 'Take Morning Medication',
      description: 'Lisinopril 10mg + Vitamin D',
      date: new Date(),
      time: '08:00',
      category: 'medication' as const,
      isActive: true,
      isRecurring: true,
      recurringType: 'daily' as const,
      priority: 'high' as const,
      reminderSet: true,
      notificationId: 'med_morning_1'
    },
    {
      id: '2',
      title: 'Doctor Appointment Reminder',
      description: 'Annual checkup with Dr. Johnson',
      date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      time: '10:30',
      category: 'appointment' as const,
      isActive: true,
      isRecurring: false,
      priority: 'medium' as const,
      reminderSet: true,
      notificationId: 'apt_checkup_1'
    },
    {
      id: '3',
      title: 'Exercise Session',
      description: '30 minutes cardio workout',
      date: new Date(),
      time: '18:00',
      category: 'exercise' as const,
      isActive: true,
      isRecurring: true,
      recurringType: 'daily' as const,
      priority: 'medium' as const,
      reminderSet: true,
      notificationId: 'exercise_1'
    },
    {
      id: '4',
      title: 'Blood Pressure Check',
      description: 'Weekly BP monitoring',
      date: new Date(),
      time: '12:00',
      category: 'health' as const,
      isActive: true,
      isRecurring: true,
      recurringType: 'weekly' as const,
      priority: 'medium' as const,
      reminderSet: true,
      notificationId: 'bp_check_1'
    },
    {
      id: '5',
      title: 'Take Evening Medication',
      description: 'Metformin 500mg',
      date: new Date(),
      time: '20:00',
      category: 'medication' as const,
      isActive: true,
      isRecurring: true,
      recurringType: 'daily' as const,
      priority: 'high' as const,
      reminderSet: true,
      notificationId: 'med_evening_1'
    }
  ], []);

  // Load data
  const loadData = useCallback(async () => {
    try {
      const [appointmentsData, medicationsData, remindersData] = await Promise.all([
        AsyncStorage.getItem('appointments'),
        AsyncStorage.getItem('medications'),
        AsyncStorage.getItem('reminders')
      ]);

      if (appointmentsData) {
        const parsedAppointments = JSON.parse(appointmentsData).map((apt: any) => ({
          ...apt,
          date: new Date(apt.date)
        }));
        setAppointments(parsedAppointments);
      }

      if (medicationsData) {
        setMedications(JSON.parse(medicationsData));
      }

      if (remindersData) {
        const parsedReminders = JSON.parse(remindersData).map((rem: any) => ({
          ...rem,
          date: new Date(rem.date)
        }));
        setReminders([...parsedReminders, ...mockReminders]);
      } else {
        // If no stored reminders, use mock data
        setReminders(mockReminders);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      // Use mock data as fallback
      setReminders(mockReminders);
    }
  }, [mockReminders]);

  // Effects
  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    generateCalendarDays();
  }, [generateCalendarDays]);

  // Refresh control
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData().finally(() => setRefreshing(false));
  }, [loadData]);

  // Render methods
  const renderCalendarDay = (day: CalendarDay, index: number) => {
    const isSelected = day.date.toDateString() === selectedDate.toDateString();
    const hasEvents = day.appointments.length > 0 || day.medications.length > 0 || day.reminders.length > 0;
    
    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.dayCell,
          day.isToday && styles.todayCell,
          isSelected && styles.selectedCell,
          !day.isCurrentMonth && styles.otherMonthCell
        ]}
        onPress={() => setSelectedDate(day.date)}
      >
        <Text style={[
          styles.dayText,
          day.isToday && styles.todayText,
          isSelected && styles.selectedDayText,
          !day.isCurrentMonth && styles.otherMonthText
        ]}>
          {day.date.getDate()}
        </Text>
        {hasEvents && day.isCurrentMonth && (
          <View style={styles.eventIndicators}>
            {day.appointments.length > 0 && <View style={[styles.eventDot, { backgroundColor: theme.colors.primary }]} />}
            {day.medications.length > 0 && <View style={[styles.eventDot, { backgroundColor: '#FF6B6B' }]} />}
            {day.reminders.length > 0 && <View style={[styles.eventDot, { backgroundColor: '#4ECDC4' }]} />}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderEvent = (event: any, index: number) => {
    const priorityColor = event.priority ? getPriorityColor(event.priority) : theme.colors.textSecondary;
    const categoryIcon = getCategoryIcon(event.category || event.type);
    
    return (
      <View key={`${event.type}-${event.id}-${index}`} style={styles.eventCard}>
        <View style={styles.eventHeader}>
          <View style={[styles.priorityIndicator, { backgroundColor: priorityColor }]} />
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <Ionicons name={categoryIcon as any} size={16} color={theme.colors.textSecondary} />
              <Text style={styles.eventTime}>{formatTime(event.displayTime)}</Text>
            </View>
            <Text style={styles.eventTitle}>{event.displayTitle}</Text>
            <Text style={styles.eventSubtitle}>{event.displaySubtitle}</Text>
            {event.displayDescription && (
              <Text style={styles.eventDescription}>{event.displayDescription}</Text>
            )}
          </View>
          <View style={styles.eventActions}>
            <TouchableOpacity style={styles.eventActionButton}>
              <Ionicons name="create-outline" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.eventActionButton}>
              <Ionicons name="trash-outline" size={20} color="#FF4444" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyStateIcon}>
        <Ionicons name="calendar-outline" size={64} color={theme.colors.textSecondary} />
      </View>
      <Text style={styles.emptyStateTitle}>No events scheduled</Text>
      <Text style={styles.emptyStateText}>
        Add appointments, medications, or reminders to get started
      </Text>
      <TouchableOpacity 
        style={styles.emptyStateButton}
        onPress={() => setShowDoctorSelectionModal(true)}
      >
        <Text style={styles.emptyStateButtonText}>Book Appointment</Text>
      </TouchableOpacity>
    </View>
  );

  const renderDoctorCard = (doctor: any) => (
    <TouchableOpacity
      key={doctor.id}
      style={styles.doctorCard}
      onPress={() => {
        setNewAppointment({
          ...newAppointment,
          doctorName: doctor.name,
          clinicName: doctor.clinic
        });
        setShowDoctorSelectionModal(false);
        setShowAddAppointmentModal(true);
      }}
    >
      <View style={styles.doctorInfo}>
        <View style={styles.doctorHeader}>
          <Text style={styles.doctorName}>{doctor.name}</Text>
          <View style={styles.doctorRating}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.ratingText}>{doctor.rating}</Text>
          </View>
        </View>
        <Text style={styles.doctorSpecialty}>{doctor.specialty}</Text>
        <Text style={styles.doctorClinic}>{doctor.clinic}</Text>
        <View style={styles.doctorDetails}>
          <View style={styles.doctorDetailItem}>
            <Ionicons name="location-outline" size={14} color={theme.colors.textSecondary} />
            <Text style={styles.doctorDistance}>{doctor.distance}</Text>
          </View>
          <View style={styles.doctorDetailItem}>
            <Ionicons name="call-outline" size={14} color={theme.colors.textSecondary} />
            <Text style={styles.doctorPhone}>{doctor.phone}</Text>
          </View>
        </View>
        <View style={styles.availabilityContainer}>
          <Text style={styles.availabilityLabel}>Available times:</Text>
          <View style={styles.timeSlots}>
            {doctor.availability.slice(0, 3).map((time: string, index: number) => (
              <View key={index} style={styles.timeSlot}>
                <Text style={styles.timeSlotText}>{time}</Text>
              </View>
            ))}
            {doctor.availability.length > 3 && (
              <Text style={styles.moreTimesText}>+{doctor.availability.length - 3} more</Text>
            )}
          </View>
        </View>
      </View>
      <View style={styles.bookButton}>
        <Text style={styles.bookButtonText}>Book</Text>
      </View>
    </TouchableOpacity>
  );

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const filteredEvents = getFilteredEvents();

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      <StandardHeader
        title="Health Calendar"
        subtitle="Manage your health journey"
        showLogo={true}
        rightComponent={
          <TouchableOpacity onPress={goToToday} style={styles.todayButton}>
            <Ionicons name="today-outline" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        }
      />

      <ScrollView 
        style={styles.scrollContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Quick Actions Grid - 3 per row - Moved inside ScrollView to be non-sticky */}
        <View style={styles.quickActionsCarousel}>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={action.id}
                style={[
                  styles.quickActionGridCard,
                  { backgroundColor: action.color + '15' }
                ]}
                onPress={action.action}
              >
                <View style={[styles.quickActionGridIcon, { backgroundColor: action.color }]}>
                  <Ionicons name={action.icon as any} size={18} color="white" />
                </View>
                <Text style={[styles.quickActionGridLabel, { color: action.color }]}>
                  {action.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Calendar Section */}
        <View style={styles.calendarSection}>
          <View style={styles.calendarCard}>
            {/* Month Navigation */}
            <View style={styles.calendarHeader}>
              <View style={styles.monthNavigation}>
                <TouchableOpacity style={styles.monthButton} onPress={() => navigateMonth('prev')}>
                  <Ionicons name="chevron-back" size={24} color={theme.colors.primary} />
                </TouchableOpacity>
                <View style={{ alignItems: 'center' }}>
                  <Text style={styles.monthText}>
                    {monthNames[currentDate.getMonth()]}
                  </Text>
                  <Text style={styles.yearText}>{currentDate.getFullYear()}</Text>
                </View>
                <TouchableOpacity style={styles.monthButton} onPress={() => navigateMonth('next')}>
                  <Ionicons name="chevron-forward" size={24} color={theme.colors.primary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Weekdays Header */}
            <View style={styles.weekdaysHeader}>
              {weekdays.map(day => (
                <Text key={day} style={styles.weekdayText}>{day}</Text>
              ))}
            </View>

            {/* Calendar Grid */}
            <View style={styles.calendarGrid}>
              {calendarDays.map((day, index) => renderCalendarDay(day, index))}
            </View>
          </View>
        </View>

        {/* Selected Day Section */}
        <View style={styles.selectedDaySection}>
          <View style={styles.selectedDayHeader}>
            <View>
              <Text style={styles.selectedDayTitle}>
                {selectedDate.toDateString() === new Date().toDateString() ? 'Today' : 'Selected Day'}
              </Text>
              <Text style={styles.selectedDayDate}>{formatDate(selectedDate)}</Text>
            </View>
          </View>

          {/* Filter Tabs - Improved Design */}
          <View style={styles.filterTabs}>
            {filterOptions.map((filter) => (
              <TouchableOpacity
                key={filter.key}
                style={[
                  styles.filterTab,
                  activeFilter === filter.key && styles.activeFilterTab
                ]}
                onPress={() => setActiveFilter(filter.key as any)}
              >
                <Ionicons 
                  name={filter.icon as any} 
                  size={14} 
                  color={activeFilter === filter.key ? 'white' : theme.colors.textSecondary}
                  style={styles.filterTabIcon}
                />
                <Text style={[
                  styles.filterTabText,
                  activeFilter === filter.key && styles.activeFilterTabText
                ]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Events List */}
          <View style={styles.eventsContainer}>
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event, index) => renderEvent(event, index))
            ) : (
              renderEmptyState()
            )}
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => setShowDoctorSelectionModal(true)}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>

      {/* Doctor Selection Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={showDoctorSelectionModal}
        onRequestClose={() => setShowDoctorSelectionModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowDoctorSelectionModal(false)}>
              <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select a Doctor</Text>
            <View style={{ width: 24 }} />
          </View>
          <ScrollView style={styles.doctorsList}>
            {availableDoctors.map(renderDoctorCard)}
          </ScrollView>
        </View>
      </Modal>

      {/* Add Appointment Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showAddAppointmentModal}
        onRequestClose={() => setShowAddAppointmentModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.appointmentModal}>
            <View style={styles.appointmentModalHeader}>
              <Text style={styles.appointmentModalTitle}>Book Appointment</Text>
              <TouchableOpacity onPress={() => setShowAddAppointmentModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.appointmentForm}>
              <View style={styles.selectedDoctorInfo}>
                <Text style={styles.selectedDoctorName}>{newAppointment.doctorName}</Text>
                <Text style={styles.selectedDoctorClinic}>{newAppointment.clinicName}</Text>
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Reason for Visit</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Enter reason for visit"
                  value={newAppointment.reasonForVisit}
                  onChangeText={(text) => setNewAppointment({...newAppointment, reasonForVisit: text})}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Notes</Text>
                <TextInput
                  style={[styles.formInput, styles.notesInput]}
                  placeholder="Additional notes"
                  multiline
                  numberOfLines={3}
                  value={newAppointment.notes}
                  onChangeText={(text) => setNewAppointment({...newAppointment, notes: text})}
                />
              </View>

              <TouchableOpacity style={styles.bookAppointmentButton}>
                <Text style={styles.bookAppointmentButtonText}>Book Appointment</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Enhanced Custom Appointment Form Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showCustomReminderModal}
        onRequestClose={() => setShowCustomReminderModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.appointmentModal}>
            <View style={styles.appointmentModalHeader}>
              <Text style={styles.appointmentModalTitle}>Add Appointment</Text>
              <TouchableOpacity onPress={() => setShowCustomReminderModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.appointmentForm}>              
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Appointment Title *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g., Annual Checkup, Eye Exam"
                  value={customReminder.title}
                  onChangeText={(text) => setCustomReminder({...customReminder, title: text})}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Doctor/Provider Name</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Dr. Smith, Dentist, etc."
                  value={customReminder.doctorName}
                  onChangeText={(text) => setCustomReminder({...customReminder, doctorName: text})}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Clinic/Hospital Name</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Medical center, clinic, or hospital"
                  value={customReminder.clinicName}
                  onChangeText={(text) => setCustomReminder({...customReminder, clinicName: text})}
                />
              </View>

              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.formLabel}>Date *</Text>
                  <TouchableOpacity 
                    style={styles.dateTimeButton}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Ionicons name="calendar-outline" size={16} color={theme.colors.textSecondary} />
                    <Text style={[styles.dateTimeText, { color: theme.colors.textPrimary }]}>
                      {customReminder.date.toLocaleDateString()}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.formLabel}>Time *</Text>
                  <TouchableOpacity 
                    style={styles.dateTimeButton}
                    onPress={() => setShowTimePicker(true)}
                  >
                    <Ionicons name="time-outline" size={16} color={theme.colors.textSecondary} />
                    <Text style={[styles.dateTimeText, { color: theme.colors.textPrimary }]}>
                      {customReminder.time || '09:00'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Appointment Type</Text>
                <View style={styles.appointmentTypeButtons}>
                  {APPOINTMENT_TYPES.map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.typeButton,
                        customReminder.category === type && styles.activeTypeButton
                      ]}
                      onPress={() => setCustomReminder({...customReminder, category: type as 'medication' | 'appointment' | 'checkup' | 'followup' | 'emergency'})}
                    >
                      <Text style={[
                        styles.typeButtonText,
                        customReminder.category === type && styles.activeTypeButtonText
                      ]}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Priority Level</Text>
                <View style={styles.priorityButtons}>
                  {priorityOptions.map((priority) => (
                    <TouchableOpacity
                      key={priority}
                      style={[
                        styles.priorityButton,
                        customReminder.priority === priority && styles.activePriorityButton,
                        { 
                          backgroundColor: customReminder.priority === priority ? 
                            (priority === 'high' ? '#EF4444' : priority === 'medium' ? '#F59E0B' : '#10B981') 
                            : theme.colors.surface 
                        }
                      ]}
                      onPress={() => setCustomReminder({...customReminder, priority: priority})}
                    >
                      <Text style={[
                        styles.priorityButtonText,
                        customReminder.priority === priority && styles.activePriorityButtonText
                      ]}>
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Additional Notes</Text>
                <TextInput
                  style={[styles.formInput, styles.notesInput]}
                  placeholder="Reason for visit, symptoms, or special instructions"
                  multiline
                  numberOfLines={3}
                  value={customReminder.notes}
                  onChangeText={(text) => setCustomReminder({...customReminder, notes: text})}
                />
              </View>

              <TouchableOpacity 
                style={styles.bookAppointmentButton}
                onPress={() => {
                  // Add the custom reminder to the reminders list
                  const newReminder: Reminder = {
                    id: Date.now().toString(),
                    title: customReminder.title || 'Appointment Reminder',
                    description: `${customReminder.doctorName ? `Dr. ${customReminder.doctorName}` : 'Healthcare appointment'}${customReminder.clinicName ? ` at ${customReminder.clinicName}` : ''}${customReminder.notes ? ` - ${customReminder.notes}` : ''}`,
                    date: customReminder.date,
                    time: customReminder.time || '09:00',
                    category: 'appointment',
                    isActive: true,
                    isRecurring: false,
                    priority: customReminder.priority,
                    reminderSet: true,
                    notificationId: `custom_reminder_${Date.now()}`
                  };
                  
                  setReminders(prev => [...prev, newReminder]);
                  
                  // Reset the form
                  setCustomReminder({
                    title: '',
                    doctorName: '',
                    clinicName: '',
                    date: new Date(),
                    time: '',
                    notes: '',
                    category: 'appointment',
                    priority: 'medium'
                  });
                  
                  setShowCustomReminderModal(false);
                }}
              >
                <Text style={styles.bookAppointmentButtonText}>Add Appointment</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>

        {/* Date Picker */}
        {showDatePicker && (
          <DateTimePicker
            value={customReminder.date}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                setCustomReminder({...customReminder, date: selectedDate});
              }
            }}
          />
        )}

        {/* Time Picker */}
        {showTimePicker && (
          <DateTimePicker
            value={new Date(`1970-01-01T${customReminder.time || '09:00'}:00`)}
            mode="time"
            display="default"
            onChange={(event, selectedTime) => {
              setShowTimePicker(false);
              if (selectedTime) {
                const timeString = selectedTime.toLocaleTimeString('en-US', { 
                  hour12: false, 
                  hour: '2-digit', 
                  minute: '2-digit' 
                });
                setCustomReminder({...customReminder, time: timeString});
              }
            }}
          />
        )}
      </Modal>

      {/* Comprehensive Medication Form Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showMedicationModal}
        onRequestClose={() => setShowMedicationModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.appointmentModal}>
            <View style={styles.appointmentModalHeader}>
              <Text style={styles.appointmentModalTitle}>Add Medication</Text>
              <TouchableOpacity onPress={() => setShowMedicationModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.appointmentForm}>
              
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Medication Name *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g., Lisinopril, Metformin, Aspirin"
                  value={medicationForm.name}
                  onChangeText={(text) => setMedicationForm({...medicationForm, name: text})}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Dosage & Strength *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g., 10mg, 500mg twice daily, 1 tablet"
                  value={medicationForm.dosage}
                  onChangeText={(text) => setMedicationForm({...medicationForm, dosage: text})}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Taking Frequency</Text>
                <View style={styles.appointmentTypeButtons}>
                  {MEDICATION_FREQUENCIES.map((frequency) => (
                    <TouchableOpacity
                      key={frequency}
                      style={[
                        styles.typeButton,
                        medicationForm.frequency === frequency && styles.activeTypeButton
                      ]}
                      onPress={() => setMedicationForm({...medicationForm, frequency: frequency as any})}
                    >
                      <Text style={[
                        styles.typeButtonText,
                        medicationForm.frequency === frequency && styles.activeTypeButtonText
                      ]}>
                        {frequency.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Preferred Time</Text>
                <TouchableOpacity 
                  style={styles.dateTimeButton}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Ionicons name="time-outline" size={16} color={theme.colors.textSecondary} />
                  <Text style={[styles.dateTimeText, { color: theme.colors.textPrimary }]}>
                    {medicationForm.time || '08:00'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.formLabel}>Start Date</Text>
                  <TouchableOpacity 
                    style={styles.dateTimeButton}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Ionicons name="calendar-outline" size={16} color={theme.colors.textSecondary} />
                    <Text style={[styles.dateTimeText, { color: theme.colors.textPrimary }]}>
                      {medicationForm.startDate.toLocaleDateString()}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.formLabel}>End Date (Optional)</Text>
                  <TouchableOpacity 
                    style={styles.dateTimeButton}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Ionicons name="calendar-outline" size={16} color={theme.colors.textSecondary} />
                    <Text style={[styles.dateTimeText, { color: theme.colors.textPrimary }]}>
                      {medicationForm.endDate.toLocaleDateString()}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Prescribed By (Doctor)</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Dr. Smith, Cardiologist, etc."
                  value={medicationForm.prescribedBy}
                  onChangeText={(text) => setMedicationForm({...medicationForm, prescribedBy: text})}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Pharmacy</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Clicks, Dis-Chem, local pharmacy"
                  value={medicationForm.pharmacy}
                  onChangeText={(text) => setMedicationForm({...medicationForm, pharmacy: text})}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Instructions & Notes</Text>
                <TextInput
                  style={[styles.formInput, styles.notesInput]}
                  placeholder="Take with food, before meals, side effects to watch for, etc."
                  multiline
                  numberOfLines={3}
                  value={medicationForm.instructions}
                  onChangeText={(text) => setMedicationForm({...medicationForm, instructions: text})}
                />
              </View>

              <View style={[styles.formGroup, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
                <Text style={styles.formLabel}>Enable Reminder Notifications</Text>
                <TouchableOpacity 
                  style={[
                    styles.typeButton, 
                    medicationForm.reminderEnabled && styles.activeTypeButton
                  ]}
                  onPress={() => setMedicationForm({...medicationForm, reminderEnabled: !medicationForm.reminderEnabled})}
                >
                  <Text style={[
                    styles.typeButtonText, 
                    medicationForm.reminderEnabled && styles.activeTypeButtonText
                  ]}>
                    {medicationForm.reminderEnabled ? 'ON' : 'OFF'}
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={styles.bookAppointmentButton}
                onPress={() => {
                  // Add the medication to the medications list
                  const newMedication: Medication = {
                    id: Date.now().toString(),
                    name: medicationForm.name || 'Untitled Medication',
                    dosage: medicationForm.dosage || '1 tablet',
                    frequency: medicationForm.frequency,
                    timesToTake: [medicationForm.time || '08:00'],
                    startDate: medicationForm.startDate,
                    endDate: medicationForm.endDate,
                    prescribedBy: medicationForm.prescribedBy,
                    instructions: medicationForm.instructions,
                    reminderEnabled: medicationForm.reminderEnabled,
                    isActive: true
                  };
                  
                  setMedications(prev => [...prev, newMedication]);
                  
                  // Reset the form
                  setMedicationForm({
                    name: '',
                    dosage: '',
                    frequency: 'daily',
                    time: '',
                    startDate: new Date(),
                    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                    instructions: '',
                    prescribedBy: '',
                    pharmacy: '',
                    reminderEnabled: true,
                    notes: ''
                  });
                  
                  setShowMedicationModal(false);
                }}
              >
                <Text style={styles.bookAppointmentButtonText}>Add Medication</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Appointment History Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={showAppointmentHistoryModal}
        onRequestClose={() => setShowAppointmentHistoryModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAppointmentHistoryModal(false)}>
              <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Appointment History</Text>
            <View style={{ width: 24 }} />
          </View>
          
          <ScrollView style={styles.appointmentHistoryList}>
            {appointments.length === 0 ? (
              <View style={styles.emptyHistoryState}>
                <Ionicons name="calendar-outline" size={64} color={theme.colors.textSecondary} />
                <Text style={styles.emptyHistoryTitle}>No Appointment History</Text>
                <Text style={styles.emptyHistoryText}>
                  Your previous appointments will appear here once you start booking appointments.
                </Text>
              </View>
            ) : (
              appointments
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // Sort by date, newest first
                .map((appointment) => (
                  <View key={appointment.id} style={styles.historyCard}>
                    <View style={styles.historyCardHeader}>
                      <View style={styles.historyCardIcon}>
                        <Ionicons 
                          name="medical" 
                          size={20} 
                          color={theme.colors.primary} 
                        />
                      </View>
                      <View style={styles.historyCardContent}>
                        <Text style={styles.historyDoctorName}>{appointment.doctorName}</Text>
                        <Text style={styles.historyClinicName}>{appointment.clinicName}</Text>
                      </View>
                      <View style={styles.historyCardDate}>
                        <Text style={styles.historyDateText}>
                          {appointment.date.toLocaleDateString()}
                        </Text>
                        <Text style={styles.historyTimeText}>{appointment.time}</Text>
                      </View>
                    </View>
                    
                    {appointment.reasonForVisit && (
                      <View style={styles.historyReasonContainer}>
                        <Ionicons name="document-text-outline" size={16} color={theme.colors.textSecondary} />
                        <Text style={styles.historyReasonText}>{appointment.reasonForVisit}</Text>
                      </View>
                    )}
                    
                    {appointment.notes && (
                      <View style={styles.historyNotesContainer}>
                        <Text style={styles.historyNotesText}>{appointment.notes}</Text>
                      </View>
                    )}
                    
                    <View style={styles.historyStatusContainer}>
                      <View style={[
                        styles.historyStatusBadge,
                        { 
                          backgroundColor: appointment.status === 'completed' ? '#10B981' : 
                                         appointment.status === 'cancelled' ? '#EF4444' : 
                                         appointment.status === 'rescheduled' ? '#F59E0B' : '#3B82F6'
                        }
                      ]}>
                        <Text style={styles.historyStatusText}>
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))
            )}
          </ScrollView>
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
  scrollContainer: {
    flex: 1,
  },
  
  todayButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: theme.colors.surface,
  },
  
  // Calendar section
  calendarSection: {
    padding: 16,
  },
  calendarCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  calendarHeader: {
    marginBottom: 16,
  },
  monthNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  monthButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: theme.colors.background,
  },
  monthText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  yearText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  
  // Weekdays
  weekdaysHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekdayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    paddingVertical: 8,
  },
  
  // Calendar grid
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  todayCell: {
    backgroundColor: theme.colors.primary + '20',
    borderRadius: 8,
  },
  selectedCell: {
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
  },
  otherMonthCell: {
    opacity: 0.3,
  },
  dayText: {
    fontSize: 16,
    color: theme.colors.textPrimary,
  },
  todayText: {
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  selectedDayText: {
    color: 'white',
    fontWeight: 'bold',
  },
  otherMonthText: {
    color: theme.colors.textSecondary,
  },
  
  // Event indicators
  eventIndicators: {
    position: 'absolute',
    bottom: 4,
    flexDirection: 'row',
    gap: 2,
  },
  eventDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  
  // Selected day section
  selectedDaySection: {
    padding: 16,
  },
  selectedDayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  selectedDayTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  selectedDayDate: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  
  // Filter tabs
  filterTabs: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background,
    borderRadius: 16,
    padding: 3,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    minHeight: 36,
    maxWidth: 120,
  },
  activeFilterTab: {
    backgroundColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  filterTabIcon: {
    marginRight: 4,
  },
  filterTabText: {
    fontSize: 9,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    textAlign: 'center',
    flexShrink: 1,
  },
  activeFilterTabText: {
    color: 'white',
    fontSize: 9,
    fontWeight: '700',
  },
  
  // Events
  eventsContainer: {
    gap: 12,
  },
  eventCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  priorityIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 12,
  },
  eventTime: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginLeft: 4,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  eventSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  eventDescription: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  eventActions: {
    flexDirection: 'row',
    gap: 8,
  },
  eventActionButton: {
    padding: 8,
  },
  
  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateIcon: {
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyStateButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  emptyStateButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  
  // FAB
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border || '#F0F0F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  doctorsList: {
    flex: 1,
    padding: 16,
  },
  
  // Doctor card styles
  doctorCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  doctorRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  doctorSpecialty: {
    fontSize: 14,
    color: theme.colors.primary,
    marginBottom: 2,
  },
  doctorClinic: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  doctorDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  doctorDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  doctorDistance: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  doctorPhone: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  availabilityContainer: {
    marginTop: 8,
  },
  availabilityLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  timeSlots: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  timeSlot: {
    backgroundColor: theme.colors.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  timeSlotText: {
    fontSize: 11,
    color: theme.colors.primary,
  },
  moreTimesText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
  bookButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'center',
  },
  bookButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  
  // Appointment modal styles
  appointmentModal: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 20,
    margin: 20,
    maxHeight: '80%',
  },
  appointmentModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  appointmentModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  appointmentForm: {
    flex: 1,
  },
  selectedDoctorInfo: {
    backgroundColor: theme.colors.primary + '10',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  selectedDoctorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  selectedDoctorClinic: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: theme.colors.border || '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.colors.textPrimary,
    backgroundColor: theme.colors.background,
  },
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  bookAppointmentButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  bookAppointmentButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Priority button styles
  priorityButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border || '#E0E0E0',
    alignItems: 'center',
  },
  activePriorityButton: {
    borderColor: 'transparent',
  },
  priorityButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  activePriorityButtonText: {
    color: 'white',
  },

  // Date/Time picker button styles
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border || '#E0E0E0',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  dateTimeText: {
    fontSize: 14,
    fontWeight: '500',
  },

  // Appointment type button styles
  appointmentTypeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border || '#E0E0E0',
    backgroundColor: theme.colors.surface,
  },
  activeTypeButton: {
    backgroundColor: '#3726a6',
    borderColor: '#3726a6',
  },
  typeButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
  activeTypeButtonText: {
    color: 'white',
  },

  // Quick actions grid styles (3 per row)
  quickActionsCarousel: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  quickActionGridCard: {
    backgroundColor: theme.colors.surface,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '31%', // Roughly 3 per row with gaps
    minHeight: 90,
    borderWidth: 1,
    borderColor: theme.colors.border || '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  quickActionGridIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  quickActionGridLabel: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 12,
  },

  // Appointment history modal styles
  appointmentHistoryList: {
    flex: 1,
    padding: 20,
  },
  emptyHistoryState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyHistoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyHistoryText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 40,
  },
  historyCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  historyCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  historyCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  historyCardContent: {
    flex: 1,
  },
  historyDoctorName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  historyClinicName: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  historyCardDate: {
    alignItems: 'flex-end',
  },
  historyDateText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textPrimary,
  },
  historyTimeText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  historyReasonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingLeft: 4,
  },
  historyReasonText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginLeft: 8,
    flex: 1,
  },
  historyNotesContainer: {
    marginBottom: 12,
    paddingLeft: 4,
  },
  historyNotesText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  historyStatusContainer: {
    alignItems: 'flex-start',
  },
  historyStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  historyStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
});
