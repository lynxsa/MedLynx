import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../contexts/ThemeContext'; // Changed
import { Theme } from '../../constants/DynamicTheme'; // Changed

const { width } = Dimensions.get('window');

interface OnboardingStep {
  id: number;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap; // Changed for type safety
  content: React.ReactElement;
}

const healthConditions = [
  'Diabetes', 'Hypertension', 'Asthma', 'Allergies', 'Chronic Pain',
  'Arthritis', 'Heart Disease', 'High Cholesterol', 'Anxiety', 'Depression',
  'Thyroid Disorder', 'Kidney Disease', 'Other'
];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme(); // Added
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userName, setUserName] = useState('');
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [otherCondition, setOtherCondition] = useState('');

  const toggleCondition = (condition: string) => {
    setSelectedConditions(prev => 
      prev.includes(condition) 
        ? prev.filter(c => c !== condition)
        : [...prev, condition]
    );
  };

  const nextStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      const nextStepIndex = currentStep + 1;
      setCurrentStep(nextStepIndex);
      scrollViewRef.current?.scrollTo({ x: nextStepIndex * width, animated: true });
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      const prevStepIndex = currentStep - 1;
      setCurrentStep(prevStepIndex);
      scrollViewRef.current?.scrollTo({ x: prevStepIndex * width, animated: true });
    }
  };

  const completeOnboarding = async () => {
    try {
      const userData = {
        email: userEmail,
        name: userName,
        healthConditions: selectedConditions,
        otherCondition: otherCondition,
        onboardingCompleted: true,
        createdAt: new Date().toISOString(),
      };
      
      await AsyncStorage.setItem('userProfile', JSON.stringify(userData));
      await AsyncStorage.setItem('onboardingCompleted', 'true');
      
      Alert.alert('Welcome to Health Hub SA!', 'Your health journey starts now.', [
        { text: 'Continue', onPress: () => router.replace('/enhanced-home' as any) }
      ]);
    } catch (error) {
      console.error('Error saving user data:', error);
      Alert.alert('Error', 'Failed to save your information. Please try again.');
    }
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: // Credentials
        return userName.trim() && userEmail.trim() && validateEmail(userEmail) && userPassword.length >= 6;
      case 2: // Health Profile
        return true; // Optional step
      default:
        return true;
    }
  };

  const onboardingSteps: OnboardingStep[] = [
    {
      id: 0,
      title: 'Welcome to Health Hub SA',
      subtitle: 'Your comprehensive health companion for South Africa',
      icon: 'medical-outline',
      content: (
        <View style={styles(theme).stepContent}>
          <View style={styles(theme).iconContainer}>
            <Ionicons name="medical-outline" size={80} color={theme.colors.white} />
          </View>
          <Text style={styles(theme).stepTitle}>Welcome to Health Hub SA</Text>
          <Text style={styles(theme).stepSubtitle}>
            Your all-in-one health companion designed specifically for South Africans. 
            Track medications, find healthcare facilities, get AI-powered health insights, and more.
          </Text>
          <View style={styles(theme).featureList}>
            <View style={styles(theme).featureItem}>
              <Ionicons name="notifications-outline" size={24} color={theme.colors.accent} />
              <Text style={styles(theme).featureText}>Smart medication reminders</Text>
            </View>
            <View style={styles(theme).featureItem}>
              <Ionicons name="location-outline" size={24} color={theme.colors.accent} />
              <Text style={styles(theme).featureText}>Find nearby health facilities</Text>
            </View>
            <View style={styles(theme).featureItem}>
              <Ionicons name="chatbubble-outline" size={24} color={theme.colors.accent} />
              <Text style={styles(theme).featureText}>AI health assistant - Dr. LYNX</Text>
            </View>
          </View>
        </View>
      )
    },
    {
      id: 1,
      title: 'Create Your Account',
      subtitle: 'Secure registration for personalized care',
      icon: 'person-add-outline',
      content: (
        <View style={styles(theme).stepContent}>
          <View style={styles(theme).iconContainer}>
            <Ionicons name="person-add-outline" size={80} color={theme.colors.white} />
          </View>
          <Text style={styles(theme).stepTitle}>Create Your Account</Text>
          <Text style={styles(theme).stepSubtitle}>
            Create a secure account to personalize your health journey and sync your data.
          </Text>
          
          <View style={styles(theme).formContainer}>
            <View style={styles(theme).inputGroup}>
              <Text style={styles(theme).inputLabel}>Full Name</Text>
              <TextInput
                style={styles(theme).textInput}
                value={userName}
                onChangeText={setUserName}
                placeholder="Enter your full name"
                placeholderTextColor={theme.colors.placeholder} // Changed
              />
            </View>
            
            <View style={styles(theme).inputGroup}>
              <Text style={styles(theme).inputLabel}>Email Address</Text>
              <TextInput
                style={styles(theme).textInput}
                value={userEmail}
                onChangeText={setUserEmail}
                placeholder="Enter your email"
                placeholderTextColor={theme.colors.placeholder} // Changed
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            
            <View style={styles(theme).inputGroup}>
              <Text style={styles(theme).inputLabel}>Password</Text>
              <TextInput
                style={styles(theme).textInput}
                value={userPassword}
                onChangeText={setUserPassword}
                placeholder="Create a secure password"
                placeholderTextColor={theme.colors.placeholder} // Changed
                secureTextEntry
              />
              <Text style={styles(theme).helperText}>Minimum 6 characters</Text>
            </View>
          </View>
        </View>
      )
    },
    {
      id: 2,
      title: 'Health Profile (Optional)',
      subtitle: 'Help us personalize your experience',
      icon: 'heart-outline',
      content: (
        <View style={styles(theme).stepContent}>
          <View style={styles(theme).iconContainer}>
            <Ionicons name="heart-outline" size={80} color={theme.colors.white} />
          </View>
          <Text style={styles(theme).stepTitle}>Optional Health Profile</Text>
          <Text style={styles(theme).stepSubtitle}>
            Share any health conditions you&apos;re managing. This helps Dr. LYNX provide better, 
            personalized health guidance. You can skip this step if you prefer.
          </Text>
          
          <View style={styles(theme).conditionsContainer}>
            <Text style={styles(theme).conditionsTitle}>Select any conditions you&apos;re managing:</Text>
            <View style={styles(theme).conditionsGrid}>
              {healthConditions.map((condition) => (
                <TouchableOpacity
                  key={condition}
                  style={[
                    styles(theme).conditionChip,
                    selectedConditions.includes(condition) && styles(theme).conditionChipSelected
                  ]}
                  onPress={() => toggleCondition(condition)}
                >
                  <Text style={[
                    styles(theme).conditionText,
                    selectedConditions.includes(condition) && styles(theme).conditionTextSelected
                  ]}>
                    {condition}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {selectedConditions.includes('Other') && (
              <TextInput
                style={styles(theme).otherInput}
                value={otherCondition}
                onChangeText={setOtherCondition}
                placeholder="Please specify..."
                placeholderTextColor={theme.colors.placeholder} // Changed
              />
            )}
          </View>
        </View>
      )
    },
    {
      id: 3,
      title: 'Meet Dr. LYNX',
      subtitle: 'Your AI-powered health companion',
      icon: 'chatbubbles-outline',
      content: (
        <View style={styles(theme).stepContent}>
          <View style={[styles(theme).iconContainer, { backgroundColor: theme.colors.primary }]}> {/* Changed */}
            <Ionicons name="chatbubbles-outline" size={80} color={theme.colors.white} />
          </View>
          <Text style={styles(theme).stepTitle}>Meet Dr. LYNX</Text>
          <Text style={styles(theme).stepSubtitle}>
            Your AI-powered health companion, specially designed for South African healthcare needs.
          </Text>
          
          <View style={styles(theme).drLynxContainer}>
            <View style={styles(theme).drLynxCard}>
              <View style={styles(theme).drLynxAvatar}>
                <Ionicons name="medical" size={40} color={theme.colors.primary} /> {/* Changed */}
              </View>
              <View style={styles(theme).drLynxInfo}>
                <Text style={styles(theme).drLynxName}>Dr. LYNX</Text>
                <Text style={styles(theme).drLynxRole}>AI Health Assistant</Text>
              </View>
            </View>
            
            <View style={styles(theme).drLynxFeatures}>
              <View style={styles(theme).drLynxFeature}>
                <Ionicons name="search-outline" size={24} color={theme.colors.primary} /> {/* Changed */}
                <Text style={styles(theme).drLynxFeatureText}>Symptom analysis & health insights</Text>
              </View>
              <View style={styles(theme).drLynxFeature}>
                <Ionicons name="nutrition-outline" size={24} color={theme.colors.primary} /> {/* Changed */}
                <Text style={styles(theme).drLynxFeatureText}>Personalized diet recommendations</Text>
              </View>
              <View style={styles(theme).drLynxFeature}>
                <Ionicons name="fitness-outline" size={24} color={theme.colors.primary} /> {/* Changed */}
                <Text style={styles(theme).drLynxFeatureText}>Wellness tips & lifestyle advice</Text>
              </View>
              <View style={styles(theme).drLynxFeature}>
                <Ionicons name="language-outline" size={24} color={theme.colors.primary} /> {/* Changed */}
                <Text style={styles(theme).drLynxFeatureText}>Multilingual support (11 SA languages)</Text>
              </View>
            </View>
          </View>
        </View>
      )
    }
  ];

  return (
    <View style={styles(theme).container}>
      <StatusBar barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.primary} />
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryDark]} // Changed
        style={styles(theme).headerGradient}
      >
        <View style={[styles(theme).headerContent, { paddingTop: insets.top }]}>
          <Text style={styles(theme).headerTitle}>{onboardingSteps[currentStep].title}</Text>
          <Text style={styles(theme).headerSubtitle}>{onboardingSteps[currentStep].subtitle}</Text>
        </View>
      </LinearGradient>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={(event) => {
          const pageIndex = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentStep(pageIndex);
        }}
        style={{ flex: 1 }}
        contentContainerStyle={{ width: width * onboardingSteps.length }}
      >
        {onboardingSteps.map((step) => (
          <View key={step.id} style={styles(theme).stepContainer}>
            {step.content}
          </View>
        ))}
      </ScrollView>

      <View style={[styles(theme).footer, { paddingBottom: insets.bottom + theme.spacing.md }]}>
        <View style={styles(theme).pagination}>
          {onboardingSteps.map((_, index) => (
            <View
              key={index}
              style={[
                styles(theme).dot,
                currentStep === index ? styles(theme).dotActive : {},
              ]}
            />
          ))}
        </View>
        <View style={styles(theme).buttonContainer}>
          {currentStep > 0 && (
            <TouchableOpacity onPress={prevStep} style={styles(theme).navButton}>
              <Ionicons name="arrow-back-outline" size={24} color={theme.colors.primary} />
              <Text style={styles(theme).navButtonText}>Back</Text>
            </TouchableOpacity>
          )}
          {currentStep < onboardingSteps.length - 1 ? (
            <TouchableOpacity 
              onPress={nextStep} 
              style={[styles(theme).navButton, styles(theme).navButtonPrimary, !canProceed() && styles(theme).navButtonDisabled]}
              disabled={!canProceed()}
            >
              <Text style={[styles(theme).navButtonText, styles(theme).navButtonTextPrimary]}>Next</Text>
              <Ionicons name="arrow-forward-outline" size={24} color={theme.colors.white} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              onPress={completeOnboarding} 
              style={[styles(theme).navButton, styles(theme).navButtonPrimary]}
            >
              <Text style={[styles(theme).navButtonText, styles(theme).navButtonTextPrimary]}>Get Started</Text>
              <Ionicons name="checkmark-done-outline" size={24} color={theme.colors.white} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = (theme: Theme) => StyleSheet.create({ // Changed: styles is now a function
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerGradient: {
    paddingBottom: theme.spacing.xl,
    borderBottomLeftRadius: theme.spacing.xl,
    borderBottomRightRadius: theme.spacing.xl,
  },
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl, // Adjusted for safe area later
  },
  headerTitle: {
    fontSize: theme.typography.fontSizes['3xl'],
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.white,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  headerSubtitle: {
    fontSize: theme.typography.fontSizes.lg,
    color: theme.colors.white,
    textAlign: 'center',
    opacity: 0.9,
  },
  stepContainer: {
    width: width,
    padding: theme.spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepContent: {
    alignItems: 'center',
    maxWidth: width * 0.9,
  },
  iconContainer: {
    backgroundColor: theme.colors.primaryLight,
    padding: theme.spacing.lg,
    borderRadius: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepTitle: {
    fontSize: theme.typography.fontSizes['2xl'],
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  stepSubtitle: {
    fontSize: theme.typography.fontSizes.base,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    lineHeight: theme.typography.lineHeights.relaxed,
  },
  featureList: {
    marginTop: theme.spacing.md,
    alignSelf: 'stretch',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.spacing.sm,
  },
  featureText: {
    fontSize: theme.typography.fontSizes.base,
    color: theme.colors.textPrimary,
    marginLeft: theme.spacing.md,
  },
  formContainer: {
    width: '100%',
    marginTop: theme.spacing.lg,
  },
  inputGroup: {
    marginBottom: theme.spacing.lg,
  },
  inputLabel: {
    fontSize: theme.typography.fontSizes.base,
    fontWeight: theme.typography.fontWeights.medium,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  textInput: {
    backgroundColor: theme.colors.inputBackground,
    color: theme.colors.inputText,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.spacing.sm,
    fontSize: theme.typography.fontSizes.base,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  helperText: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textTertiary,
    marginTop: theme.spacing.xs,
  },
  conditionsContainer: {
    width: '100%',
    marginTop: theme.spacing.lg,
  },
  conditionsTitle: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.medium,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  conditionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  conditionChip: {
    backgroundColor: theme.colors.surfaceSecondary,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.spacing.xl,
    margin: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  conditionChipSelected: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primary,
  },
  conditionText: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textPrimary,
  },
  conditionTextSelected: {
    color: theme.colors.primaryDark,
    fontWeight: theme.typography.fontWeights.medium,
  },
  otherInput: {
    backgroundColor: theme.colors.inputBackground,
    color: theme.colors.inputText,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.spacing.sm,
    fontSize: theme.typography.fontSizes.base,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginTop: theme.spacing.sm,
  },
  drLynxContainer: {
    width: '100%',
    marginTop: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.spacing.md,
  },
  drLynxCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  drLynxAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  drLynxInfo: {
    flex: 1,
  },
  drLynxName: {
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.textPrimary,
  },
  drLynxRole: {
    fontSize: theme.typography.fontSizes.base,
    color: theme.colors.textSecondary,
  },
  drLynxFeatures: {
    marginTop: theme.spacing.md,
  },
  drLynxFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  drLynxFeatureText: {
    fontSize: theme.typography.fontSizes.base,
    color: theme.colors.textPrimary,
    marginLeft: theme.spacing.md,
    flexShrink: 1,
  },
  footer: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.textDisabled,
    marginHorizontal: theme.spacing.xs,
  },
  dotActive: {
    backgroundColor: theme.colors.primary,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.spacing.sm,
  },
  navButtonPrimary: {
    backgroundColor: theme.colors.primary,
  },
  navButtonDisabled: {
    backgroundColor: theme.colors.buttonSecondaryBackground, // Or a more distinct disabled color
    opacity: 0.6,
  },
  navButtonText: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.medium,
    color: theme.colors.primary,
    marginHorizontal: theme.spacing.xs,
  },
  navButtonTextPrimary: {
    color: theme.colors.white,
  },
});
