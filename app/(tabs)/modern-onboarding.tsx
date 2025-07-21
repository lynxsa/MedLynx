import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Dimensions,
    Platform,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import PagerView from 'react-native-pager-view';
import Animated, {
    FadeIn,
    interpolate,
    SlideInRight,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface OnboardingSlide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  image?: string;
  backgroundColor: string;
}

const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: 1,
    title: 'Welcome to MedLYNX',
    subtitle: 'Your Personal Healthcare Companion',
    description: 'Take control of your health with smart medication management, appointment tracking, and AI-powered health insights.',
    icon: 'medical',
    backgroundColor: '#3726a6',
  },
  {
    id: 2,
    title: 'Smart Medication Management',
    subtitle: 'Never Miss a Dose Again',
    description: 'Set intelligent reminders, track your medications, and get insights about drug interactions and side effects.',
    icon: 'alarm',
    backgroundColor: '#a096e7',
  },
  {
    id: 3,
    title: 'AI Health Assistant',
    subtitle: 'Meet Dr. LYNX',
    description: 'Get instant medical advice, symptom checking, and health recommendations from our AI-powered healthcare assistant.',
    icon: 'chatbubbles',
    backgroundColor: '#DF73FF',
  },
  {
    id: 4,
    title: 'Health Insights & Analytics',
    subtitle: 'Track Your Wellness Journey',
    description: 'Monitor your health metrics, BMI, medication adherence, and get personalized health recommendations.',
    icon: 'analytics',
    backgroundColor: '#E0B0FF',
  },
  {
    id: 5,
    title: 'Secure & Private',
    subtitle: 'Your Data is Protected',
    description: 'Bank-level encryption, biometric authentication, and complete control over your health information.',
    icon: 'shield-checkmark',
    backgroundColor: '#F3E5F5',
  },
];

export default function ModernOnboardingScreen() {
  const router = useRouter();
  
  const [currentPage, setCurrentPage] = useState(0);
  const pagerRef = useRef<PagerView>(null);
  const progressAnimation = useSharedValue(0);
  
  useEffect(() => {
    progressAnimation.value = withTiming(currentPage / (ONBOARDING_SLIDES.length - 1), {
      duration: 300,
    });
  }, [currentPage, progressAnimation]);

  const handleNext = () => {
    if (currentPage < ONBOARDING_SLIDES.length - 1) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      pagerRef.current?.setPage(nextPage);
    } else {
      handleGetStarted();
    }
  };

  const handlePrevious = () => {
    if (currentPage > 0) {
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
      pagerRef.current?.setPage(prevPage);
    }
  };

  const handleGetStarted = () => {
    router.push('/auth');
  };

  const handleSkip = () => {
    router.push('/auth');
  };

  const progressStyle = useAnimatedStyle(() => {
    return {
      width: withSpring(interpolate(progressAnimation.value, [0, 1], [20, width - 80]), {
        damping: 20,
        stiffness: 100,
      }),
    };
  });

  const renderSlide = (slide: OnboardingSlide, index: number) => (
    <View key={slide.id} style={[styles.slide, { backgroundColor: slide.backgroundColor }]}>
      <Animated.View 
        entering={FadeIn.delay(200)}
        style={styles.slideContent}
      >
        {/* Hero Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name={slide.icon} size={80} color="white" />
        </View>

        {/* Title Section */}
        <Animated.View 
          entering={SlideInRight.delay(300)}
          style={styles.textContainer}
        >
          <Text style={styles.title}>{slide.title}</Text>
          <Text style={styles.subtitle}>{slide.subtitle}</Text>
          <Text style={styles.description}>{slide.description}</Text>
        </Animated.View>

        {/* Visual Elements */}
        <View style={styles.visualContainer}>
          <View style={styles.decorativeCircle1} />
          <View style={styles.decorativeCircle2} />
          <View style={styles.decorativeCircle3} />
        </View>
      </Animated.View>
    </View>
  );

  const renderPaginationDots = () => (
    <View style={styles.pagination}>
      {ONBOARDING_SLIDES.map((_, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => {
            setCurrentPage(index);
            pagerRef.current?.setPage(index);
          }}
          style={[
            styles.paginationDot,
            {
              backgroundColor: currentPage === index ? '#FFFFFF' : 'rgba(255,255,255,0.4)',
              width: currentPage === index ? 24 : 8,
            },
          ]}
        />
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="transparent" 
        translucent 
      />
      
      {/* Skip Button */}
      <TouchableOpacity 
        style={styles.skipButton} 
        onPress={handleSkip}
      >
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Page Content */}
      <PagerView
        ref={pagerRef}
        style={styles.pagerView}
        initialPage={0}
        onPageSelected={(e) => setCurrentPage(e.nativeEvent.position)}
      >
        {ONBOARDING_SLIDES.map((slide, index) => renderSlide(slide, index))}
      </PagerView>

      {/* Bottom Controls */}
      <View style={styles.bottomContainer}>
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBackground}>
            <Animated.View style={[styles.progressForeground, progressStyle]} />
          </View>
        </View>

        {/* Pagination Dots */}
        {renderPaginationDots()}

        {/* Navigation Buttons */}
        <View style={styles.navigationContainer}>
          {currentPage > 0 && (
            <TouchableOpacity style={styles.navButton} onPress={handlePrevious}>
              <Ionicons name="chevron-back" size={24} color="white" />
              <Text style={styles.navButtonText}>Back</Text>
            </TouchableOpacity>
          )}
          
          <View style={{ flex: 1 }} />
          
          <TouchableOpacity 
            style={[styles.navButton, styles.nextButton]} 
            onPress={handleNext}
          >
            <Text style={styles.navButtonText}>
              {currentPage === ONBOARDING_SLIDES.length - 1 ? 'Get Started' : 'Next'}
            </Text>
            <Ionicons 
              name={currentPage === ONBOARDING_SLIDES.length - 1 ? "checkmark" : "chevron-forward"} 
              size={24} 
              color="white" 
            />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3726a6',
  },
  skipButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    right: 20,
    zIndex: 100,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  skipText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  pagerView: {
    flex: 1,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    position: 'relative',
  },
  slideContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  iconContainer: {
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 28,
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
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  visualContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: -1,
  },
  decorativeCircle1: {
    position: 'absolute',
    top: '20%',
    right: '10%',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: '30%',
    left: '15%',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  decorativeCircle3: {
    position: 'absolute',
    top: '50%',
    left: '5%',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  bottomContainer: {
    paddingHorizontal: 30,
    paddingBottom: 30,
    paddingTop: 20,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBackground: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
  },
  progressForeground: {
    height: 4,
    backgroundColor: 'white',
    borderRadius: 2,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  nextButton: {
    backgroundColor: 'white',
  },
  navButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 8,
  },
});
