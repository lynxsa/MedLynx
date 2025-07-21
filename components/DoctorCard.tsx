import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
    Dimensions,
    Image,
    ImageSourcePropType,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useThemedStyles } from '../hooks/useThemedStyles';

const { width } = Dimensions.get('window');

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  rating: number;
  experience: string;
  avatar: ImageSourcePropType;
  availability: string;
  location: string;
  consultationFee: string;
  address: string;
  phone: string;
  email: string;
  qualifications: string[];
  languages: string[];
  availableTimes: string[];
  conditions: string[];
  ethnicity?: string;
}

interface DoctorCardProps {
  doctor: Doctor;
  onPress: (doctor: Doctor) => void;
  variant?: 'home' | 'list';
}

export default function DoctorCard({ doctor, onPress, variant = 'home' }: DoctorCardProps) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const styles = useThemedStyles(createStyles);

  const cardStyle = variant === 'home' ? styles.homeCard : styles.listCard;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={cardStyle}
      onPress={() => onPress(doctor)}
    >
      {/* Background Gradient */}
      <LinearGradient
        colors={[colors.surface, colors.backgroundSecondary]}
        style={styles.cardGradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      {/* Status Badge */}
      <View style={styles.statusBadge}>
        <View style={[
          styles.statusDot, 
          { backgroundColor: doctor.availability.includes('Today') ? '#10B981' : '#F59E0B' }
        ]} />
        <Text style={[
          styles.statusText, 
          { color: doctor.availability.includes('Today') ? '#10B981' : '#F59E0B' }
        ]}>
          {doctor.availability.includes('Today') ? 'Available' : 'Busy'}
        </Text>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.doctorAvatarContainer}>
          <View style={styles.avatarWrapper}>
            <Image 
              source={doctor.avatar} 
              style={styles.doctorAvatar}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.1)']}
              style={styles.avatarOverlay}
            />
          </View>
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={12} color="#FFFFFF" />
            <Text style={styles.ratingText}>{doctor.rating}</Text>
          </View>
        </View>
        
        <View style={styles.doctorInfo}>
          <Text style={[styles.doctorName, { color: colors.textPrimary }]}>{doctor.name}</Text>
          <View style={styles.specializationContainer}>
            <Text style={[styles.doctorSpecialization, { color: colors.primary }]}>
              {doctor.specialization}
            </Text>
          </View>
          
          <View style={styles.detailsContainer}>
            <View style={styles.doctorDetailsRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="location" size={14} color={colors.primary} />
              </View>
              <Text style={[styles.doctorLocation, { color: colors.textPrimary }]}>
                {doctor.location}
              </Text>
            </View>
            
            <View style={styles.doctorDetailsRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="time" size={14} color={colors.primary} />
              </View>
              <Text style={[styles.doctorExperience, { color: colors.textPrimary }]}>
                {doctor.experience} exp
              </Text>
            </View>
          </View>
          
          <LinearGradient
            colors={[colors.primary, colors.secondary || colors.primary]}
            style={styles.consultationFeeContainer}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.consultationFeeLabel}>Consultation Fee</Text>
            <Text style={styles.consultationFee}>{doctor.consultationFee}</Text>
          </LinearGradient>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  homeCard: {
    width: width * 0.6,
    marginRight: 16,
    backgroundColor: colors.surface,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 15,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    position: 'relative',
  },
  listCard: {
    width: '100%',
    marginBottom: 16,
    backgroundColor: colors.surface,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    position: 'relative',
  },
  cardGradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.8,
  },
  statusBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardContent: {
    position: 'relative',
    zIndex: 5,
  },
  doctorAvatarContainer: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20,
    zIndex: 5,
  },
  avatarWrapper: {
    position: 'relative',
    borderRadius: 40,
    overflow: 'hidden',
  },
  doctorAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  avatarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 40,
  },
  ratingBadge: {
    position: 'absolute',
    bottom: -8,
    right: width * 0.6 / 2 - 65,
    backgroundColor: colors.primary,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  doctorInfo: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 24,
    zIndex: 5,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  specializationContainer: {
    backgroundColor: `${colors.primary}20`,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 16,
  },
  doctorSpecialization: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  detailsContainer: {
    width: '100%',
    marginBottom: 16,
  },
  doctorDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  doctorLocation: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  doctorExperience: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  consultationFeeContainer: {
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 14,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    width: '100%',
  },
  consultationFeeLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 4,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  consultationFee: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});
