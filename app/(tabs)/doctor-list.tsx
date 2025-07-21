import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StandardHeader } from '../../components/StandardHeader';
import { useTheme } from '../../contexts/ThemeContext';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  clinic: string;
  address: string;
  phone: string;
  rating: number;
  distance: string;
  availability: string[];
  isAvailable: boolean;
}

const availableDoctors: Doctor[] = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    specialty: 'General Practice',
    clinic: 'Sandton Medical Centre',
    address: '123 Rivonia Road, Sandton, Johannesburg',
    phone: '+27 11 884 0000',
    rating: 4.8,
    distance: '1.2 km',
    availability: ['09:00', '11:00', '14:00', '16:00'],
    isAvailable: true
  },
  {
    id: '2',
    name: 'Dr. Michael Chen',
    specialty: 'Cardiology',
    clinic: 'Life Fourways Hospital',
    address: 'Cedar Road, Fourways, Sandton',
    phone: '+27 11 875 1000',
    rating: 4.9,
    distance: '2.5 km',
    availability: ['10:00', '13:00', '15:30'],
    isAvailable: true
  },
  {
    id: '3',
    name: 'Dr. Priya Patel',
    specialty: 'Pediatrics',
    clinic: 'Netcare Sunninghill Hospital',
    address: 'Hobart Road, Sunninghill, Sandton',
    phone: '+27 11 806 1500',
    rating: 4.7,
    distance: '1.8 km',
    availability: ['08:30', '11:30', '14:30', '16:30'],
    isAvailable: true
  },
  {
    id: '4',
    name: 'Dr. Robert Wilson',
    specialty: 'Internal Medicine',
    clinic: 'Helen Joseph Hospital',
    address: 'Perth Road, Westdene, Johannesburg',
    phone: '+27 11 489 8911',
    rating: 4.6,
    distance: '3.2 km',
    availability: ['09:30', '13:30', '15:00'],
    isAvailable: true
  },
  {
    id: '5',
    name: 'Dr. Lisa Thompson',
    specialty: 'Dermatology',
    clinic: 'Morningside Medi-Clinic',
    address: 'Rivonia Road, Morningside, Sandton',
    phone: '+27 11 282 5000',
    rating: 4.4,
    distance: '2.8 km',
    availability: ['10:00', '12:00', '15:00', '17:00'],
    isAvailable: true
  }
];

export default function DoctorListScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');

  // Filter doctors based on search and filters
  const filteredDoctors = availableDoctors.filter(doctor => {
    const matchesSearch = searchQuery === '' || 
      doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.clinic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSpecialty = selectedSpecialty === 'all' || doctor.specialty === selectedSpecialty;
    
    const matchesLocation = selectedLocation === 'all' || 
      doctor.address.toLowerCase().includes(selectedLocation.toLowerCase());
    
    return matchesSearch && matchesSpecialty && matchesLocation;
  });

  // Get unique specialties for filter dropdown
  const uniqueSpecialties = [...new Set(availableDoctors.map(doctor => doctor.specialty))];
  
  // Get unique locations for filter dropdown
  const uniqueLocations = [...new Set(availableDoctors.map(doctor => 
    doctor.address.split(',')[1]?.trim() || doctor.address
  ))];

  const handleBookAppointment = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setShowBookingModal(true);
  };

  const confirmBooking = () => {
    if (selectedDoctor && selectedTimeSlot) {
      Alert.alert(
        'Appointment Confirmed',
        `Your appointment with ${selectedDoctor.name} has been scheduled for ${selectedTimeSlot}.`,
        [
          {
            text: 'OK',
            onPress: () => {
              setShowBookingModal(false);
              setSelectedDoctor(null);
              setSelectedTimeSlot('');
              // Navigate back to calendar or home
              router.push('/calendar' as any);
            }
          }
        ]
      );
    }
  };

  const renderDoctorCard = (doctor: Doctor) => (
    <View key={doctor.id} style={[styles.doctorCard, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.doctorHeader}>
        <View style={styles.doctorInfo}>
          <Text style={[styles.doctorName, { color: theme.colors.textPrimary }]}>
            {doctor.name}
          </Text>
          <View style={styles.doctorRating}>
            <Ionicons name="star" size={16} color="#FFB800" />
            <Text style={[styles.ratingText, { color: theme.colors.textSecondary }]}>
              {doctor.rating}
            </Text>
          </View>
        </View>
      </View>
      
      <Text style={[styles.doctorSpecialty, { color: theme.colors.primary }]}>
        {doctor.specialty}
      </Text>
      <Text style={[styles.doctorClinic, { color: theme.colors.textSecondary }]}>
        {doctor.clinic}
      </Text>
      
      <View style={styles.doctorDetails}>
        <View style={styles.doctorDetailItem}>
          <Ionicons name="location-outline" size={16} color={theme.colors.textSecondary} />
          <Text style={[styles.doctorDistance, { color: theme.colors.textSecondary }]}>
            {doctor.distance}
          </Text>
        </View>
        <View style={styles.doctorDetailItem}>
          <Ionicons name="call-outline" size={16} color={theme.colors.textSecondary} />
          <Text style={[styles.doctorPhone, { color: theme.colors.textSecondary }]}>
            {doctor.phone}
          </Text>
        </View>
      </View>
      
      {doctor.availability.length > 0 && (
        <View style={styles.availabilityContainer}>
          <Text style={[styles.availabilityLabel, { color: theme.colors.textPrimary }]}>
            Available Today:
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timeSlots}>
            {doctor.availability.slice(0, 3).map((time, index) => (
              <View key={index} style={[styles.timeSlot, { backgroundColor: theme.colors.primary + '20' }]}>
                <Text style={[styles.timeSlotText, { color: theme.colors.primary }]}>
                  {time}
                </Text>
              </View>
            ))}
            {doctor.availability.length > 3 && (
              <Text style={[styles.moreTimesText, { color: theme.colors.textSecondary }]}>
                +{doctor.availability.length - 3} more
              </Text>
            )}
          </ScrollView>
        </View>
      )}
      
      <TouchableOpacity
        style={[styles.bookButton, { backgroundColor: theme.colors.primary }]}
        onPress={() => handleBookAppointment(doctor)}
      >
        <Text style={styles.bookButtonText}>Book Appointment</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar 
        barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} 
        backgroundColor={theme.colors.background}
      />
      <StandardHeader 
        title="Medical Professionals"
        description="Find & book doctors near you"
        showBackButton={true}
        rightComponent={
          <TouchableOpacity onPress={() => setShowFilters(!showFilters)}>
            <Ionicons name="options-outline" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
        }
      />
      
      {/* Search Bar */}
      <View style={[styles.searchContainer, { 
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border 
      }]}>
        <Ionicons name="search-outline" size={20} color={theme.colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: theme.colors.textPrimary }]}
          placeholder="Search doctors, specialties, or clinics"
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={theme.colors.textSecondary}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Section */}
      {showFilters && (
        <View style={[styles.filtersContainer, { borderBottomColor: theme.colors.border }]}>
          <View style={styles.filterGroup}>
            <Text style={[styles.filterLabel, { color: theme.colors.textPrimary }]}>Specialty</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScrollView}>
              <TouchableOpacity
                style={[
                  styles.filterChip, 
                  { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                  selectedSpecialty === 'all' && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
                ]}
                onPress={() => setSelectedSpecialty('all')}
              >
                <Text style={[
                  styles.filterChipText,
                  { color: theme.colors.textPrimary },
                  selectedSpecialty === 'all' && { color: 'white', fontWeight: '600' }
                ]}>All</Text>
              </TouchableOpacity>
              {uniqueSpecialties.map(specialty => (
                <TouchableOpacity
                  key={specialty}
                  style={[
                    styles.filterChip,
                    { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                    selectedSpecialty === specialty && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
                  ]}
                  onPress={() => setSelectedSpecialty(specialty)}
                >
                  <Text style={[
                    styles.filterChipText,
                    { color: theme.colors.textPrimary },
                    selectedSpecialty === specialty && { color: 'white', fontWeight: '600' }
                  ]}>{specialty}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
          <View style={styles.filterGroup}>
            <Text style={[styles.filterLabel, { color: theme.colors.textPrimary }]}>Location</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScrollView}>
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                  selectedLocation === 'all' && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
                ]}
                onPress={() => setSelectedLocation('all')}
              >
                <Text style={[
                  styles.filterChipText,
                  { color: theme.colors.textPrimary },
                  selectedLocation === 'all' && { color: 'white', fontWeight: '600' }
                ]}>All Areas</Text>
              </TouchableOpacity>
              {uniqueLocations.map(location => (
                <TouchableOpacity
                  key={location}
                  style={[
                    styles.filterChip,
                    { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                    selectedLocation === location && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
                  ]}
                  onPress={() => setSelectedLocation(location)}
                >
                  <Text style={[
                    styles.filterChipText,
                    { color: theme.colors.textPrimary },
                    selectedLocation === location && { color: 'white', fontWeight: '600' }
                  ]}>{location}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}

      <ScrollView 
        style={styles.doctorsList}
        contentContainerStyle={[styles.doctorsListContent, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {filteredDoctors.length > 0 ? (
          filteredDoctors.map(renderDoctorCard)
        ) : (
          <View style={styles.emptySearchState}>
            <Ionicons name="search-outline" size={48} color={theme.colors.textSecondary} />
            <Text style={[styles.emptySearchTitle, { color: theme.colors.textPrimary }]}>No doctors found</Text>
            <Text style={[styles.emptySearchSubtitle, { color: theme.colors.textSecondary }]}>
              Try adjusting your search or filters to find more doctors.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Booking Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showBookingModal}
        onRequestClose={() => setShowBookingModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.bookingModal, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.bookingModalHeader}>
              <Text style={[styles.bookingModalTitle, { color: theme.colors.textPrimary }]}>Book Appointment</Text>
              <TouchableOpacity onPress={() => setShowBookingModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            </View>
            
            {selectedDoctor && (
              <ScrollView style={styles.bookingContent}>
                <View style={styles.selectedDoctorInfo}>
                  <Text style={[styles.selectedDoctorName, { color: theme.colors.textPrimary }]}>
                    {selectedDoctor.name}
                  </Text>
                  <Text style={[styles.selectedDoctorClinic, { color: theme.colors.textSecondary }]}>
                    {selectedDoctor.clinic}
                  </Text>
                </View>
                
                <View style={styles.timeSlotSelection}>
                  <Text style={[styles.timeSlotLabel, { color: theme.colors.textPrimary }]}>
                    Select Time Slot
                  </Text>
                  <View style={styles.timeSlotGrid}>
                    {selectedDoctor.availability.map((time, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.timeSlotOption,
                          { backgroundColor: theme.colors.background, borderColor: theme.colors.border },
                          selectedTimeSlot === time && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
                        ]}
                        onPress={() => setSelectedTimeSlot(time)}
                      >
                        <Text style={[
                          styles.timeSlotOptionText,
                          { color: theme.colors.textPrimary },
                          selectedTimeSlot === time && { color: 'white', fontWeight: '600' }
                        ]}>
                          {time}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                
                <TouchableOpacity
                  style={[
                    styles.confirmBookingButton,
                    { backgroundColor: selectedTimeSlot ? theme.colors.primary : theme.colors.textSecondary }
                  ]}
                  onPress={confirmBooking}
                  disabled={!selectedTimeSlot}
                >
                  <Text style={styles.confirmBookingButtonText}>Confirm Booking</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
    marginRight: 8,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  filterGroup: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  filterScrollView: {
    flexGrow: 0,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  filterChipText: {
    fontSize: 14,
  },
  doctorsList: {
    flex: 1,
  },
  doctorsListContent: {
    paddingHorizontal: 16,
  },
  doctorCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  doctorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  doctorRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    marginLeft: 4,
  },
  doctorSpecialty: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  doctorClinic: {
    fontSize: 14,
    marginBottom: 12,
  },
  doctorDetails: {
    marginBottom: 16,
  },
  doctorDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  doctorDistance: {
    fontSize: 14,
    marginLeft: 8,
  },
  doctorPhone: {
    fontSize: 14,
    marginLeft: 8,
  },
  availabilityContainer: {
    marginBottom: 16,
  },
  availabilityLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  timeSlots: {
    flexDirection: 'row',
  },
  timeSlot: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  timeSlotText: {
    fontSize: 12,
    fontWeight: '600',
  },
  moreTimesText: {
    fontSize: 12,
    alignSelf: 'center',
    fontStyle: 'italic',
  },
  bookButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  bookButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptySearchState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptySearchTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySearchSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bookingModal: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  bookingModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  bookingModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  bookingContent: {
    padding: 20,
  },
  selectedDoctorInfo: {
    marginBottom: 24,
  },
  selectedDoctorName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  selectedDoctorClinic: {
    fontSize: 14,
  },
  timeSlotSelection: {
    marginBottom: 24,
  },
  timeSlotLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  timeSlotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  timeSlotOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 80,
    alignItems: 'center',
  },
  timeSlotOptionText: {
    fontSize: 14,
  },
  confirmBookingButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  confirmBookingButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
