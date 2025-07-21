import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useThemedStyles } from '../../hooks/useThemedStyles';

// Sample doctor data for the booking form
const SAMPLE_DOCTOR = {
  id: '1',
  name: 'Dr. Thandiwe Mthembu',
  specialization: 'General Practitioner',
  avatar: require('../../assets/images/MedLynx-01.jpeg'),
  address: '123 Nelson Mandela Drive, Sandton, Johannesburg, 2196',
  phone: '+27 11 555 0001',
  email: 'dr.mthembu@medlynx.co.za',
  consultationFee: 'R600',
  availableTimes: ['09:00', '11:00', '14:00', '16:00'],
  conditions: ['General Health', 'Chronic Disease Management', 'Preventive Care', 'Health Screening']
};

const APPOINTMENT_TYPES = [
  'General Consultation',
  'Follow-up Appointment',
  'Health Check-up',
  'Chronic Disease Management',
  'Preventive Care',
  'Emergency Consultation'
];

const PAYMENT_METHODS = [
  { id: 'medical_aid', name: 'Medical Aid', icon: 'card' },
  { id: 'cash', name: 'Cash Payment', icon: 'cash' },
  { id: 'card', name: 'Credit/Debit Card', icon: 'card-outline' },
  { id: 'bank_transfer', name: 'Bank Transfer', icon: 'send' }
];

export default function DoctorBookingScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const colors = theme.colors;
  const styles = useThemedStyles(createStyles);
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');
  const [appointmentType, setAppointmentType] = useState('');
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [selectedPayment, setSelectedPayment] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleBooking = () => {
    if (!selectedTime || !selectedCondition || !appointmentType || !patientName || !patientPhone || !selectedPayment) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }

    Alert.alert(
      'Booking Confirmed!',
      `Your appointment with ${SAMPLE_DOCTOR.name} has been scheduled for ${selectedDate.toDateString()} at ${selectedTime}.\\n\\nA confirmation will be sent to your phone and email.`,
      [
        {
          text: 'OK',
          onPress: () => router.back()
        }
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar 
        barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} 
        backgroundColor={colors.background}
      />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          Book Appointment
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Doctor Info Card */}
        <View style={[styles.doctorCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.doctorName, { color: colors.textPrimary }]}>{SAMPLE_DOCTOR.name}</Text>
          <Text style={[styles.doctorSpecialization, { color: colors.primary }]}>{SAMPLE_DOCTOR.specialization}</Text>
          <View style={styles.doctorDetails}>
            <View style={styles.detailRow}>
              <Ionicons name="location" size={16} color={colors.primary} />
              <Text style={[styles.detailText, { color: colors.textSecondary }]}>{SAMPLE_DOCTOR.address}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="call" size={16} color={colors.primary} />
              <Text style={[styles.detailText, { color: colors.textSecondary }]}>{SAMPLE_DOCTOR.phone}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="cash" size={16} color={colors.primary} />
              <Text style={[styles.detailText, { color: colors.textSecondary }]}>Consultation Fee: {SAMPLE_DOCTOR.consultationFee}</Text>
            </View>
          </View>
        </View>

        {/* Date Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Select Date</Text>
          <TouchableOpacity 
            style={[styles.dateButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar" size={20} color={colors.primary} />
            <Text style={[styles.dateButtonText, { color: colors.textPrimary }]}>
              {selectedDate.toDateString()}
            </Text>
            <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}

        {/* Time Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Available Times</Text>
          <View style={styles.timeGrid}>
            {SAMPLE_DOCTOR.availableTimes.map((time) => (
              <TouchableOpacity
                key={time}
                style={[
                  styles.timeButton,
                  {
                    backgroundColor: selectedTime === time ? colors.primary : colors.surface,
                    borderColor: selectedTime === time ? colors.primary : colors.border
                  }
                ]}
                onPress={() => setSelectedTime(time)}
              >
                <Text style={[
                  styles.timeButtonText,
                  {
                    color: selectedTime === time ? '#FFFFFF' : colors.textPrimary
                  }
                ]}>
                  {time}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Appointment Type */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Appointment Type</Text>
          <View style={styles.optionsContainer}>
            {APPOINTMENT_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.optionButton,
                  {
                    backgroundColor: appointmentType === type ? colors.primary : colors.surface,
                    borderColor: appointmentType === type ? colors.primary : colors.border
                  }
                ]}
                onPress={() => setAppointmentType(type)}
              >
                <Text style={[
                  styles.optionButtonText,
                  {
                    color: appointmentType === type ? '#FFFFFF' : colors.textPrimary
                  }
                ]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Condition/Reason */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Reason for Visit</Text>
          <View style={styles.optionsContainer}>
            {SAMPLE_DOCTOR.conditions.map((condition) => (
              <TouchableOpacity
                key={condition}
                style={[
                  styles.optionButton,
                  {
                    backgroundColor: selectedCondition === condition ? colors.primary : colors.surface,
                    borderColor: selectedCondition === condition ? colors.primary : colors.border
                  }
                ]}
                onPress={() => setSelectedCondition(condition)}
              >
                <Text style={[
                  styles.optionButtonText,
                  {
                    color: selectedCondition === condition ? '#FFFFFF' : colors.textPrimary
                  }
                ]}>
                  {condition}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Patient Information */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Patient Information</Text>
          
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
            placeholder="Full Name *"
            placeholderTextColor={colors.textSecondary}
            value={patientName}
            onChangeText={setPatientName}
          />
          
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
            placeholder="Phone Number *"
            placeholderTextColor={colors.textSecondary}
            value={patientPhone}
            onChangeText={setPatientPhone}
            keyboardType="phone-pad"
          />
          
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
            placeholder="Email Address"
            placeholderTextColor={colors.textSecondary}
            value={patientEmail}
            onChangeText={setPatientEmail}
            keyboardType="email-address"
          />
          
          <TextInput
            style={[styles.textArea, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
            placeholder="Describe your symptoms or concerns..."
            placeholderTextColor={colors.textSecondary}
            value={symptoms}
            onChangeText={setSymptoms}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Payment Method</Text>
          <View style={styles.paymentContainer}>
            {PAYMENT_METHODS.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.paymentButton,
                  {
                    backgroundColor: selectedPayment === method.id ? colors.primary : colors.surface,
                    borderColor: selectedPayment === method.id ? colors.primary : colors.border
                  }
                ]}
                onPress={() => setSelectedPayment(method.id)}
              >
                <Ionicons 
                  name={method.icon as any} 
                  size={24} 
                  color={selectedPayment === method.id ? '#FFFFFF' : colors.textPrimary} 
                />
                <Text style={[
                  styles.paymentButtonText,
                  {
                    color: selectedPayment === method.id ? '#FFFFFF' : colors.textPrimary
                  }
                ]}>
                  {method.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Book Appointment Button */}
        <LinearGradient
          colors={[colors.primary, colors.secondary || colors.primary]}
          style={styles.bookButton}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <TouchableOpacity
            style={styles.bookButtonContent}
            onPress={handleBooking}
          >
            <Text style={styles.bookButtonText}>Book Appointment</Text>
            <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </LinearGradient>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  doctorCard: {
    padding: 20,
    borderRadius: 16,
    marginVertical: 16,
    borderWidth: 1,
  },
  doctorName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  doctorSpecialization: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  doctorDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    flex: 1,
  },
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  dateButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  timeButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 80,
    alignItems: 'center',
  },
  timeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  optionButtonText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 12,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 12,
    minHeight: 100,
  },
  paymentContainer: {
    gap: 12,
  },
  paymentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  paymentButtonText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  bookButton: {
    borderRadius: 16,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  bookButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    gap: 12,
  },
  bookButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
