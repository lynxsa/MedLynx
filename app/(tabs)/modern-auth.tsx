import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, {
    FadeIn,
    FadeInDown,
    SlideInRight,
    ZoomIn,
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withSpring,
} from 'react-native-reanimated';
import { ColorPalette } from '../../constants/DynamicTheme';
import { useTheme } from '../../contexts/ThemeContext';

export default function ModernAuthScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const colors = theme.colors as ColorPalette;
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [hasBiometric, setHasBiometric] = useState(false);
  
  const shakeAnimation = useSharedValue(0);

  useEffect(() => {
    checkBiometricSupport();
  }, []);

  const checkBiometricSupport = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      setHasBiometric(hasHardware && isEnrolled);
    } catch (error) {
      console.log('Error checking biometric support:', error);
    }
  };

  const handleBiometricAuth = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate with biometrics to access MedLYNX',
        fallbackLabel: 'Use PIN',
      });

      if (result.success) {
        await AsyncStorage.setItem('userToken', 'authenticated');
        router.replace('/modern-home');
      } else {
        Alert.alert('Authentication Failed', 'Please try again');
      }
    } catch (error) {
      console.log('Biometric auth error:', error);
      Alert.alert('Error', 'Biometric authentication failed');
    }
  };

  const validateForm = () => {
    if (!email.trim() || !password.trim()) {
      triggerShake();
      Alert.alert('Error', 'Please fill in all fields');
      return false;
    }

    if (!isLogin) {
      if (!name.trim()) {
        triggerShake();
        Alert.alert('Error', 'Please enter your name');
        return false;
      }
      if (password !== confirmPassword) {
        triggerShake();
        Alert.alert('Error', 'Passwords do not match');
        return false;
      }
      if (password.length < 6) {
        triggerShake();
        Alert.alert('Error', 'Password must be at least 6 characters');
        return false;
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      triggerShake();
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }

    return true;
  };

  const triggerShake = () => {
    shakeAnimation.value = withSequence(
      withSpring(-10, { duration: 50 }),
      withSpring(10, { duration: 50 }),
      withSpring(-10, { duration: 50 }),
      withSpring(0, { duration: 50 })
    );
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(async () => {
      setIsLoading(false);
      await AsyncStorage.setItem('userToken', 'authenticated');
      Alert.alert(
        'Success',
        isLogin ? 'Login successful!' : 'Account created successfully!',
        [{ text: 'OK', onPress: () => router.replace('/modern-home') }]
      );
    }, 1500);
  };

  const animatedFormStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: shakeAnimation.value }],
    };
  });

  const renderInputField = (
    placeholder: string,
    value: string,
    onChangeText: (text: string) => void,
    icon: keyof typeof Ionicons.glyphMap,
    secureTextEntry = false,
    keyboardType: any = 'default'
  ) => (
    <View style={[styles.inputContainer, { backgroundColor: colors.surface }]}>
      <Ionicons name={icon} size={20} color={colors.textSecondary} style={styles.inputIcon} />
      <TextInput
        style={[styles.input, { color: colors.textPrimary }]}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry && !showPassword}
        keyboardType={keyboardType}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {secureTextEntry && (
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={() => setShowPassword(!showPassword)}
        >
          <Ionicons
            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" />
      
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <Animated.View entering={FadeIn.delay(100)} style={styles.header}>
          <Animated.View 
            entering={ZoomIn.delay(200)}
            style={[styles.logoContainer, { backgroundColor: colors.primary }]}
          >
            <Image
              source={require('../../assets/images/logo-w.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </Animated.View>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Welcome to MedLYNX
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {isLogin ? 'Sign in to continue' : 'Create your account'}
          </Text>
        </Animated.View>

        {/* Form */}
        <Animated.View 
          entering={FadeInDown.delay(300)}
          style={[styles.formContainer, animatedFormStyle]}
        >
          {!isLogin && (
            <Animated.View entering={SlideInRight.delay(100)}>
              {renderInputField('Full Name', name, setName, 'person-outline')}
            </Animated.View>
          )}
          
          <Animated.View entering={SlideInRight.delay(isLogin ? 100 : 200)}>
            {renderInputField('Email Address', email, setEmail, 'mail-outline', false, 'email-address')}
          </Animated.View>
          
          <Animated.View entering={SlideInRight.delay(isLogin ? 200 : 300)}>
            {renderInputField('Password', password, setPassword, 'lock-closed-outline', true)}
          </Animated.View>
          
          {!isLogin && (
            <Animated.View entering={SlideInRight.delay(400)}>
              {renderInputField('Confirm Password', confirmPassword, setConfirmPassword, 'lock-closed-outline', true)}
            </Animated.View>
          )}

          {/* Forgot Password */}
          {isLogin && (
            <Animated.View 
              entering={FadeIn.delay(400)}
              style={styles.forgotPasswordContainer}
            >
              <TouchableOpacity>
                <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>
                  Forgot Password?
                </Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* Submit Button */}
          <Animated.View entering={FadeInDown.delay(500)}>
            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: colors.primary }]}
              onPress={handleSubmit}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <Animated.View style={styles.loadingContainer}>
                  <Text style={styles.submitButtonText}>
                    {isLogin ? 'Signing In...' : 'Creating Account...'}
                  </Text>
                </Animated.View>
              ) : (
                <Text style={styles.submitButtonText}>
                  {isLogin ? 'Sign In' : 'Create Account'}
                </Text>
              )}
            </TouchableOpacity>
          </Animated.View>

          {/* Biometric Authentication */}
          {isLogin && hasBiometric && (
            <Animated.View 
              entering={ZoomIn.delay(600)}
              style={styles.biometricContainer}
            >
              <View style={styles.dividerContainer}>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <Text style={[styles.dividerText, { color: colors.textSecondary }]}>or</Text>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
              </View>
              
              <TouchableOpacity
                style={[styles.biometricButton, { backgroundColor: colors.surface }]}
                onPress={handleBiometricAuth}
                activeOpacity={0.7}
              >
                <Ionicons name="finger-print" size={24} color={colors.primary} />
                <Text style={[styles.biometricButtonText, { color: colors.textPrimary }]}>
                  Use Biometrics
                </Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* Toggle Sign In/Sign Up */}
          <Animated.View 
            entering={FadeIn.delay(700)}
            style={styles.toggleContainer}
          >
            <Text style={[styles.toggleText, { color: colors.textSecondary }]}>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
            </Text>
            <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
              <Text style={[styles.toggleButton, { color: colors.primary }]}>
                {isLogin ? 'Sign Up' : 'Sign In'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>

        {/* Skip Button */}
        <Animated.View 
          entering={FadeIn.delay(800)}
          style={styles.skipContainer}
        >
          <TouchableOpacity 
            style={styles.skipButton}
            onPress={() => router.replace('/modern-home')}
          >
            <Text style={[styles.skipButtonText, { color: colors.textSecondary }]}>
              Skip for now
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  logoImage: {
    width: 50,
    height: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  formContainer: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    fontWeight: '500',
  },
  eyeButton: {
    padding: 4,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '600',
  },
  submitButton: {
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 24,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  biometricContainer: {
    marginBottom: 24,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 14,
    fontWeight: '500',
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  biometricButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '500',
  },
  toggleButton: {
    fontSize: 16,
    fontWeight: '700',
  },
  skipContainer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  skipButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
