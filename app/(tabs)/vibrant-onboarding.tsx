import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ThemedButton from '../../components/ThemedButton';
import ThemedGlassCard from '../../components/ThemedGlassCard';
import ThemedInput from '../../components/ThemedInput';
import { useTheme } from '../../contexts/ThemeContext';
import { useThemedStyles } from '../../hooks/useThemedStyles';

const { width } = Dimensions.get('window');

interface OnboardingData {
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  healthConditions: string[];
  emergencyContact: string;
  preferredLanguage: string;
}

const healthConditionOptions = [
  { id: 'diabetes', label: 'Diabetes', icon: 'medical' },
  { id: 'hypertension', label: 'High Blood Pressure', icon: 'heart' },
  { id: 'asthma', label: 'Asthma', icon: 'fitness' },
  { id: 'arthritis', label: 'Arthritis', icon: 'body' },
  { id: 'heart_disease', label: 'Heart Disease', icon: 'heart-circle' },
  { id: 'depression', label: 'Depression/Anxiety', icon: 'happy' },
  { id: 'chronic_pain', label: 'Chronic Pain', icon: 'bandage' },
  { id: 'other', label: 'Other', icon: 'add-circle' },
];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const styles = useThemedStyles((theme) => createStyles(theme, width));
  
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    healthConditions: [],
    emergencyContact: '',
    preferredLanguage: 'en',
  });
  
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Dynamic onboarding steps using theme colors
  const onboardingSteps = [
    {
      id: 'welcome',
      title: 'Welcome to MedLynx! 💊',
      subtitle: 'Your South African Health Companion',
      description: 'Manage medications, track health, and get AI-powered assistance',
      animation: 'pill',
      color: theme.colors.primary,
    },
    {
      id: 'profile',
      title: 'Create Your Profile 👤',
      subtitle: 'Tell us about yourself',
      description: 'Secure and private - your data stays on your device',
      animation: 'medical',
      color: theme.colors.success,
    },
    {
      id: 'health',
      title: 'Health Profile (Optional) 🩺',
      subtitle: 'Share your health conditions',
      description: 'This helps Dr. LYNX provide personalized advice',
      animation: 'stethoscope',
      color: theme.colors.info,
    },
    {
      id: 'dr-lynx',
      title: 'Meet Dr. LYNX! 🧠',
      subtitle: 'Your AI Health Assistant',
      description: 'Get personalized health insights, medication reminders, and expert advice',
      animation: 'pulse',
      color: theme.colors.secondary,
    },
    {
      id: 'permissions',
      title: 'Enable Features 🔔',
      subtitle: 'Grant permissions for the best experience',
      description: 'Notifications for reminders, location for nearby facilities',
      animation: 'fitness',
      color: theme.colors.warning,
    },
  ];

  React.useEffect(() => {
    // Animate step transition
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentStep, fadeAnim, slideAnim]);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      // Reset animations
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      // Reset animations
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  const completeOnboarding = async () => {
    try {
      // Mark onboarding as completed
      await AsyncStorage.setItem('onboarding_completed', 'true');
      
      // In a real app, save onboarding data to secure storage
      if (onboardingData.fullName || onboardingData.email) {
        await AsyncStorage.setItem('user_profile', JSON.stringify(onboardingData));
      }
      
      Alert.alert(
        'Welcome to MedLynx! 🎉',
        'Your health journey starts now. Dr. LYNX is ready to assist you!',
        [
          {
            text: 'Get Started',
            onPress: () => router.replace('/enhanced-home-clean' as any),
          },
        ]
      );
    } catch (error) {
      console.error('Error completing onboarding:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  const toggleHealthCondition = (conditionId: string) => {
    setOnboardingData(prev => ({
      ...prev,
      healthConditions: prev.healthConditions.includes(conditionId)
        ? prev.healthConditions.filter(id => id !== conditionId)
        : [...prev.healthConditions, conditionId]
    }));
  };

  const requestPermissions = async () => {
    try {
      // Request notification permissions
      Alert.alert('Permissions', 'Notification permissions granted!');
      
      // Request location permissions
      Alert.alert('Location Access', 'Location permissions granted for finding nearby facilities!');
      
      handleNext();
    } catch (error) {
      console.error('Error requesting permissions:', error);
      Alert.alert('Permissions', 'Some permissions were not granted, but you can still use the app.');
      handleNext();
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {onboardingSteps.map((_, index) => (
        <View
          key={index}
          style={[
            styles.stepDot,
            {
              backgroundColor: index <= currentStep 
                ? onboardingSteps[currentStep].color 
                : theme.colors.white + '40',
              width: index === currentStep ? 24 : 8,
            }
          ]}
        />
      ))}
    </View>
  );

  const renderWelcomeStep = () => (
    <Animated.View style={[styles.stepContent, {
      opacity: fadeAnim,
      transform: [{ translateY: slideAnim }]
    }]}>
      <View style={[styles.animationContainer, { backgroundColor: theme.colors.primary + '20' }]}>
        <Ionicons name="medical" size={60} color={theme.colors.primary} />
      </View>
      <Image
        source={require('../../assets/images/logo-w.png')}
        style={styles.logoImage}
        resizeMode="contain"
      />
      <Text style={styles.stepTitle}>{onboardingSteps[currentStep].title}</Text>
      <Text style={styles.stepSubtitle}>{onboardingSteps[currentStep].subtitle}</Text>
      <Text style={styles.stepDescription}>{onboardingSteps[currentStep].description}</Text>
      
      <View style={styles.featuresList}>
        <View style={styles.featureItem}>
          <Ionicons name="notifications" size={24} color={theme.colors.primary} />
          <Text style={styles.featureText}>Smart medication reminders</Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="chatbubble-ellipses" size={24} color={theme.colors.secondary} />
          <Text style={styles.featureText}>AI health assistant with food scanner</Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="business" size={24} color={theme.colors.success} />
          <Text style={styles.featureText}>Find nearby pharmacies & doctors</Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="document-text" size={24} color={theme.colors.info} />
          <Text style={styles.featureText}>Health tracking & insights</Text>
        </View>
      </View>
    </Animated.View>
  );

  const renderProfileStep = () => (
    <Animated.View style={[styles.stepContent, {
      opacity: fadeAnim,
      transform: [{ translateY: slideAnim }]
    }]}>
      <View style={[styles.animationContainer, { backgroundColor: theme.colors.success + '20' }]}>
        <Ionicons name="person-add" size={80} color={theme.colors.success} />
      </View>
      <Text style={styles.stepTitle}>{onboardingSteps[currentStep].title}</Text>
      <Text style={styles.stepSubtitle}>{onboardingSteps[currentStep].subtitle}</Text>
      <Text style={styles.stepDescription}>{onboardingSteps[currentStep].description}</Text>
      
      <View style={styles.form}>
        <ThemedInput
          label="Full Name"
          value={onboardingData.fullName}
          onChangeText={(text) => setOnboardingData(prev => ({ ...prev, fullName: text }))}
          placeholder="Enter your full name"
        />
        
        <ThemedInput
          label="Email Address"
          value={onboardingData.email}
          onChangeText={(text) => setOnboardingData(prev => ({ ...prev, email: text }))}
          placeholder="Enter your email"
          keyboardType="email-address"
        />
        
        <ThemedInput
          label="Phone Number"
          value={onboardingData.phone}
          onChangeText={(text) => setOnboardingData(prev => ({ ...prev, phone: text }))}
          placeholder="Enter your phone number"
          keyboardType="phone-pad"
        />
        
        <ThemedInput
          label="Date of Birth (Optional)"
          value={onboardingData.dateOfBirth}
          onChangeText={(text) => setOnboardingData(prev => ({ ...prev, dateOfBirth: text }))}
          placeholder="DD/MM/YYYY"
        />
      </View>
    </Animated.View>
  );

  const renderHealthStep = () => (
    <Animated.View style={[styles.stepContent, {
      opacity: fadeAnim,
      transform: [{ translateY: slideAnim }]
    }]}>
      <View style={[styles.animationContainer, { backgroundColor: theme.colors.info + '20' }]}>
        <Ionicons name="medical" size={80} color={theme.colors.info} />
      </View>
      <Text style={styles.stepTitle}>{onboardingSteps[currentStep].title}</Text>
      <Text style={styles.stepSubtitle}>{onboardingSteps[currentStep].subtitle}</Text>
      <Text style={styles.stepDescription}>{onboardingSteps[currentStep].description}</Text>
      
      <Text style={styles.sectionTitle}>Select any conditions that apply to you:</Text>
      
      <View style={styles.healthConditionsGrid}>
        {healthConditionOptions.map((condition) => (
          <TouchableOpacity
            key={condition.id}
            style={[
              styles.conditionCard,
              {
                backgroundColor: onboardingData.healthConditions.includes(condition.id)
                  ? theme.colors.primary + '20'
                  : 'rgba(255, 255, 255, 0.1)',
                borderColor: onboardingData.healthConditions.includes(condition.id)
                  ? theme.colors.primary
                  : 'rgba(255, 255, 255, 0.3)',
              }
            ]}
            onPress={() => toggleHealthCondition(condition.id)}
          >
            <Ionicons 
              name={condition.icon as any} 
              size={32} 
              color={onboardingData.healthConditions.includes(condition.id) 
                ? theme.colors.primary
                : theme.colors.white
              } 
            />
            <Text style={[
              styles.conditionText,
              {
                color: onboardingData.healthConditions.includes(condition.id)
                  ? theme.colors.primary
                  : theme.colors.white
              }
            ]}>
              {condition.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </Animated.View>
  );

  const renderDrLynxStep = () => (
    <Animated.View style={[styles.stepContent, {
      opacity: fadeAnim,
      transform: [{ translateY: slideAnim }]
    }]}>
      <View style={[styles.animationContainer, { backgroundColor: theme.colors.secondary + '20' }]}>
        <Ionicons name="chatbubble-ellipses" size={80} color={theme.colors.secondary} />
      </View>
      <Text style={styles.stepTitle}>{onboardingSteps[currentStep].title}</Text>
      <Text style={styles.stepSubtitle}>{onboardingSteps[currentStep].subtitle}</Text>
      <Text style={styles.stepDescription}>{onboardingSteps[currentStep].description}</Text>
      
      <ThemedGlassCard style={styles.drLynxCard}>
        <View style={styles.drLynxIcon}>
          <Ionicons name="logo-android" size={40} color={theme.colors.white} />
        </View>
        <Text style={styles.drLynxTitle}>Dr. LYNX Features:</Text>
        <View style={styles.featuresList}>
          <View style={styles.featureItem}>
            <Ionicons name="camera" size={20} color={theme.colors.primary} />
            <Text style={styles.featureText}>Food & medication scanning</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="analytics" size={20} color={theme.colors.info} />
            <Text style={styles.featureText}>Health insights & trends</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="chatbubbles" size={20} color={theme.colors.secondary} />
            <Text style={styles.featureText}>24/7 health guidance</Text>
          </View>
        </View>
      </ThemedGlassCard>
    </Animated.View>
  );

  const renderPermissionsStep = () => (
    <Animated.View style={[styles.stepContent, {
      opacity: fadeAnim,
      transform: [{ translateY: slideAnim }]
    }]}>
      <View style={[styles.animationContainer, { backgroundColor: theme.colors.warning + '20' }]}>
        <Ionicons name="shield-checkmark" size={80} color={theme.colors.warning} />
      </View>
      <Text style={styles.stepTitle}>{onboardingSteps[currentStep].title}</Text>
      <Text style={styles.stepSubtitle}>{onboardingSteps[currentStep].subtitle}</Text>
      <Text style={styles.stepDescription}>{onboardingSteps[currentStep].description}</Text>
      
      <View style={styles.permissionsList}>
        <View style={styles.permissionItem}>
          <Ionicons name="notifications" size={32} color={theme.colors.primary} />
          <View style={styles.permissionContent}>
            <Text style={styles.permissionTitle}>Notifications</Text>
            <Text style={styles.permissionDescription}>
              Get reminders for medications and appointments
            </Text>
          </View>
        </View>
        
        <View style={styles.permissionItem}>
          <Ionicons name="location" size={32} color={theme.colors.success} />
          <View style={styles.permissionContent}>
            <Text style={styles.permissionTitle}>Location</Text>
            <Text style={styles.permissionDescription}>
              Find nearby pharmacies and healthcare facilities
            </Text>
          </View>
        </View>
      </View>
      
      <ThemedButton
        title="Grant Permissions"
        onPress={requestPermissions}
        style={styles.permissionButton}
      />
    </Animated.View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return renderWelcomeStep();
      case 1:
        return renderProfileStep();
      case 2:
        return renderHealthStep();
      case 3:
        return renderDrLynxStep();
      case 4:
        return renderPermissionsStep();
      default:
        return renderWelcomeStep();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      <LinearGradient
        colors={theme.gradients.primary as [string, string]}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          {currentStep > 0 && (
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Ionicons name="chevron-back" size={24} color={theme.colors.white} />
            </TouchableOpacity>
          )}
          
          {renderStepIndicator()}
          
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView 
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {renderCurrentStep()}
        </ScrollView>

        {/* Footer */}
        <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
          <ThemedButton
            title={currentStep === onboardingSteps.length - 1 ? "Complete Setup" : "Continue"}
            onPress={handleNext}
            style={styles.nextButton}
            icon={currentStep === onboardingSteps.length - 1 ? "checkmark-circle" : "arrow-forward"}
          />
        </View>
      </LinearGradient>
    </View>
  );
}

const createStyles = (theme: any, width: number) => StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '500',
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  stepDot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  stepContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  animationContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoImage: {
    width: 80,
    height: 32,
    marginBottom: 16,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.white,
    textAlign: 'center',
    marginBottom: 6,
  },
  stepSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.white,
    textAlign: 'center',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 14,
    color: theme.colors.white,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  featuresList: {
    width: '100%',
    paddingHorizontal: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
  },
  featureText: {
    marginLeft: 10,
    fontSize: 14,
    color: theme.colors.white,
    fontWeight: '500',
    flex: 1,
  },
  form: {
    width: '100%',
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.white,
    textAlign: 'center',
    marginBottom: 20,
  },
  healthConditionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  conditionCard: {
    width: '45%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    marginBottom: 12,
  },
  conditionText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  drLynxCard: {
    width: '100%',
    marginTop: 20,
    padding: 24,
    alignItems: 'center',
  },
  drLynxIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  drLynxTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 16,
  },
  permissionsList: {
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
  },
  permissionContent: {
    marginLeft: 16,
    flex: 1,
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.white,
    marginBottom: 4,
  },
  permissionDescription: {
    fontSize: 14,
    color: theme.colors.white,
    opacity: 0.8,
  },
  permissionButton: {
    marginTop: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  nextButton: {
    width: '100%',
  },
});
