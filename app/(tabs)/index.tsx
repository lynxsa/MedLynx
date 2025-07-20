import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router as routerStatic, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Image, StatusBar, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useThemedStyles } from '../../hooks/useThemedStyles';

export default function SplashScreen() {
    const [isLoading, setIsLoading] = useState(true);
    const fadeAnim = useRef(new Animated.Value(0)).current; // Initial value for opacity: 0
    const scaleAnim = useRef(new Animated.Value(0.5)).current; // Initial value for scale: 0.5
    const router = useRouter();
    const { theme } = useTheme();
    const styles = useThemedStyles(createStyles);
    
    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 10,
                friction: 2,
                useNativeDriver: true,
                
            }),
        ]).start();

        const checkFirstTimeUser = async () => {
            try {
                const hasCompletedOnboarding = await AsyncStorage.getItem('onboarding_completed');
                
                const timer = setTimeout(() => {
                    setIsLoading(false);
                    
                    if (!hasCompletedOnboarding) {
                        // First-time user - show modern onboarding
                        try {
                            router.replace('/clean-onboarding');
                        } catch (error) {
                            console.log('useRouter failed, trying static router:', error);
                            routerStatic.replace('/clean-onboarding');
                        }
                    } else {
                        // Returning user - go to modern auth
                        try {
                            router.replace('/modern-auth');
                        } catch (error) {
                            console.log('useRouter failed, trying static router:', error);
                            routerStatic.replace('/modern-auth');
                        }
                    }
                }, 3000);
                
                return () => clearTimeout(timer);
            } catch (error) {
                console.log('Error checking onboarding status:', error);
                // Default to auth screen if there's an error
                const timer = setTimeout(() => {
                    setIsLoading(false);
                    try {
                        router.replace('/modern-auth');
                    } catch (routerError) {
                        console.log('Router error:', routerError);
                        routerStatic.replace('/modern-auth');
                    }
                }, 3000);
                
                return () => clearTimeout(timer);
            }
        };

        checkFirstTimeUser();
    }, [fadeAnim, router, scaleAnim]);
    
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
            <Animated.View
                style={[
                    styles.iconContainer,
                    {
                        opacity: fadeAnim,
                        transform: [{ scale: scaleAnim }],
                    },
                ]}
            >
                <Image
                    source={require('../../assets/images/logo-w.png')}
                    style={{ width: 80, height: 80 }}
                    resizeMode="contain"
                />
            </Animated.View>
            
            <Text style={styles.appName}>MedLynx</Text>
            
            {isLoading && (
                <View style={styles.loadingContainer}>
                    <Ionicons name="medical" size={24} color={theme.colors.primary} />
                    <Text style={styles.loadingText}>Loading your medications...</Text>
                </View>
            )}
        </View>
    );
}

const createStyles = (theme: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainer: {
      alignItems: 'center',
    },
    appName: {
        color: theme.colors.white,
        fontSize: 32,
        fontWeight: 'bold',
        marginTop: 20,
        letterSpacing: 1,
    },
    loadingContainer: {
        alignItems: 'center',
        marginTop: 40,
        padding: 20,
        borderRadius: 16,
        backgroundColor: theme.colors.glass.background,
        borderWidth: 1,
        borderColor: theme.colors.glass.border,
    },
    loadingText: {
        color: theme.colors.white,
        fontSize: 16,
        marginTop: 10,
        opacity: 0.9,
        fontWeight: '500',
    },
});