import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Platform,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, {
    FadeIn,
    SlideInDown,
    SlideInRight,
    ZoomIn,
} from 'react-native-reanimated';

interface OnboardingSlide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: 1,
    title: 'Welcome to MedLYNX',
    subtitle: 'Your Personal Healthcare Companion',
    description: 'Take control of your health with smart medication management, appointment tracking, and AI-powered health insights.',
    icon: 'medical-outline',
    color: '#3726a6',
  },
  {
    id: 2,
    title: 'Smart Medication Management',
    subtitle: 'Never Miss a Dose Again',
    description: 'Set intelligent reminders, track your medications, and get insights about drug interactions and side effects.',
    icon: 'alarm-outline',
    color: '#a096e7',
  },
  {
    id: 3,
    title: 'AI Health Assistant',
    subtitle: 'Meet Dr. LYNX',
    description: 'Get instant medical advice, symptom checking, and health recommendations from our AI-powered healthcare assistant.',
    icon: 'chatbubbles-outline',
    color: '#DF73FF',
  },
  {
    id: 4,
    title: 'Ready to Start?',
    subtitle: 'Your Health Journey Begins Now',
    description: 'Join thousands of users who have improved their health management with MedLYNX.',
    icon: 'rocket-outline',
    color: '#E0B0FF',
  },
];

export default function ModernOnboardingScreen() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const handleSkip = async () => {
    await AsyncStorage.setItem('onboarding_completed', 'true');
    router.push('/modern-auth');
  };

  const handleNext = () => {
    if (currentSlide < ONBOARDING_SLIDES.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      handleGetStarted();
    }
  };

  const handleGetStarted = async () => {
    await AsyncStorage.setItem('onboarding_completed', 'true');
    router.push('/modern-auth');
  };

  const currentData = ONBOARDING_SLIDES[currentSlide];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentData.color }]}>
      <StatusBar barStyle="light-content" backgroundColor={currentData.color} />
      
      {/* Skip Button */}
      <Animated.View 
        entering={FadeIn.delay(300)}
        style={styles.skipContainer}
      >
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Icon */}
        <Animated.View 
          entering={ZoomIn.delay(500)}
          key={`icon-${currentSlide}`}
          style={styles.iconContainer}
        >
          <View style={styles.iconWrapper}>
            <Ionicons 
              name={currentData.icon} 
              size={80} 
              color="white" 
            />
          </View>
        </Animated.View>

        {/* Text Content */}
        <Animated.View 
          entering={SlideInRight.delay(600)}
          key={`text-${currentSlide}`}
          style={styles.textContainer}
        >
          <Text style={styles.title}>{currentData.title}</Text>
          <Text style={styles.subtitle}>{currentData.subtitle}</Text>
          <Text style={styles.description}>{currentData.description}</Text>
        </Animated.View>

        {/* Decorative Elements */}
        <View style={styles.decorativeElements}>
          <View style={[styles.decorativeCircle, { top: '15%', right: '10%' }]} />
          <View style={[styles.decorativeCircle, { bottom: '25%', left: '8%', width: 60, height: 60 }]} />
          <View style={[styles.decorativeCircle, { top: '45%', left: '5%', width: 40, height: 40, opacity: 0.3 }]} />
        </View>
      </View>

      {/* Bottom Navigation */}
      <Animated.View 
        entering={SlideInDown.delay(700)}
        style={styles.bottomContainer}
      >
        {/* Progress Dots */}
        <View style={styles.dotsContainer}>
          {ONBOARDING_SLIDES.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dot,
                index === currentSlide ? styles.activeDot : styles.inactiveDot,
              ]}
              onPress={() => setCurrentSlide(index)}
            />
          ))}
        </View>

        {/* Navigation Buttons */}
        <View style={styles.navigationContainer}>
          {currentSlide > 0 && (
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => setCurrentSlide(currentSlide - 1)}
            >
              <Ionicons name="chevron-back" size={20} color="rgba(255,255,255,0.8)" />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}
          
          <View style={{ flex: 1 }} />
          
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>
              {currentSlide === ONBOARDING_SLIDES.length - 1 ? 'Get Started' : 'Continue'}
            </Text>
            <Ionicons 
              name={currentSlide === ONBOARDING_SLIDES.length - 1 ? "arrow-forward" : "chevron-forward"} 
              size={20} 
              color="#3726a6" 
            />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipContainer: {
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
  },
  skipButton: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  skipText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    position: 'relative',
  },
  iconContainer: {
    marginBottom: 50,
  },
  iconWrapper: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: 'white',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  decorativeElements: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: -1,
  },
  decorativeCircle: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.08)',
    opacity: 0.6,
  },
  bottomContainer: {
    paddingHorizontal: 30,
    paddingBottom: 30,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    width: 24,
    backgroundColor: 'white',
  },
  inactiveDot: {
    width: 8,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backButtonText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    marginLeft: 4,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonText: {
    color: '#3726a6',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
});
