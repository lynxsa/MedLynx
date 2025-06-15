import { useState, useEffect } from 'react';
import { View, Image, Text, StyleSheet, TouchableOpacity, Dimensions, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BiometricAuth } from '../../utils/BiometricAuth';
import { useTheme } from '../../contexts/ThemeContext';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import * as LocalAuthentication from 'expo-local-authentication';
import { Theme } from '../../constants/DynamicTheme'; // Import Theme type

const { width } = Dimensions.get('window');

export default function AuthScreen() {
    const insets = useSafeAreaInsets();
    const [hasBiometric, setHasBiometric] = useState(false);
    const [hasHardware, setHasHardware] = useState(false);
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { theme } = useTheme();
    const styles = useThemedStyles((theme: Theme) => createStyles(theme, width, insets)); // Pass insets here

    useEffect(() => {
        checkBiometricSupport();
    }, []);

    const authenticate = async () => {
        try {
            setIsAuthenticating(true);
            setError(null);

            // Check hardware availability before attempting authentication
            if (!hasHardware) {
                setError("Biometric hardware not available on this device");
                return;
            }

            const success = await BiometricAuth.authenticate(
                hasBiometric 
                    ? "Authenticate with biometrics to access MedLynx"
                    : "Enter your PIN to access MedLynx"
            );

            if (success) {
                router.replace('/enhanced-home' as any);
            } else {
                setError("Authentication failed. Please try again.");
            }
        } catch (error) {
            if (error instanceof Error) {
                setError("Authentication error: " + error.message);
            } else {
                setError("Authentication error: " + String(error));
            }
        } finally {
            setIsAuthenticating(false);
        }
    };

    const skipAuth = () => {
        router.replace('/enhanced-home' as any);
    };

    const checkBiometricSupport = async () => {
        try {
            const isBiometricAvailable = await BiometricAuth.isBiometricAvailable();
            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            
            setHasHardware(hasHardware);
            setHasBiometric(isBiometricAvailable);
        } catch (error) {
            console.error("Error checking biometric support:", error);
            setHasHardware(false);
            setHasBiometric(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar 
                barStyle="light-content" 
                backgroundColor={theme.colors.primary} 
            />
            <LinearGradient
                colors={theme.gradients.primary as [string, string]}
                style={styles.gradient}
            >
                <View style={[styles.content, { paddingTop: insets.top + 60 }]}>
                    {/* Logo Section */}
                    <View style={styles.logoSection}>
                        <View style={styles.logoContainer}>
                            <Image
                                source={require('../../assets/images/logo-w.png')}
                                style={styles.logo}
                                resizeMode="contain"
                            />
                        </View>
                        <Text style={styles.title}>Welcome Back</Text>
                        <Text style={styles.subtitle}>
                            Your personalized health companion
                        </Text>
                    </View>

                    {/* Authentication Section */}
                    <View style={styles.authSection}>
                        <View style={styles.authCard}>                            <View style={styles.authIcon}>
                                <Ionicons 
                                    name={hasBiometric ? "finger-print" : "lock-closed"} 
                                    size={48} 
                                    color={theme.colors.primary}
                                />
                            </View>
                            
                            <Text style={styles.authTitle}>
                                {hasBiometric ? "Biometric Authentication" : "Device Security"}
                            </Text>
                            
                            <Text style={styles.authDescription}>
                                {hasBiometric 
                                    ? "Use your fingerprint or face to securely access MedLynx"
                                    : "Use your device PIN to access MedLynx"
                                }
                            </Text>

                            {error && (
                                <View style={styles.errorContainer}>
                                    <Ionicons name="warning" size={16} color={theme.colors.error} />
                                    <Text style={styles.errorText}>{error}</Text>
                                </View>
                            )}

                            <TouchableOpacity
                                style={[styles.authButton, isAuthenticating && styles.authButtonDisabled]}
                                onPress={authenticate}
                                disabled={isAuthenticating}
                            >
                                {isAuthenticating ? (
                                    <Text style={styles.authButtonText}>Authenticating...</Text>
                                ) : (
                                    <>
                                        <Ionicons 
                                            name={hasBiometric ? "finger-print" : "lock-open"} 
                                            size={20} 
                                            color={theme.colors.white} 
                                        />
                                        <Text style={styles.authButtonText}>
                                            {hasBiometric ? "Authenticate" : "Enter PIN"}
                                        </Text>
                                    </>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.skipButton} onPress={skipAuth}>
                                <Text style={styles.skipButtonText}>Skip for now</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Security Features */}
                    <View style={styles.featuresSection}>
                        <View style={styles.feature}>
                            <Ionicons name="shield-checkmark" size={24} color={theme.colors.white} />
                            <Text style={styles.featureText}>End-to-end encryption</Text>
                        </View>
                        <View style={styles.feature}>
                            <Ionicons name="lock-closed" size={24} color={theme.colors.white} />
                            <Text style={styles.featureText}>Secure data storage</Text>
                        </View>
                        <View style={styles.feature}>
                            <Ionicons name="eye-off" size={24} color={theme.colors.white} />
                            <Text style={styles.featureText}>Privacy protected</Text>
                        </View>
                    </View>
                </View>
            </LinearGradient>
        </View>
    );
}

const createStyles = (theme: Theme, width: number, insets: any) => StyleSheet.create({ // Add insets to parameters
    container: {
        flex: 1,
    },
    gradient: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        justifyContent: 'space-between',
    },
    logoSection: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
    },
    logoContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
        shadowColor: theme.colors.shadow.medium,
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 10,
    },
    logo: {
        width: 80,
        height: 32,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: theme.colors.white,
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: theme.colors.white,
        textAlign: 'center',
        opacity: 0.9,
    },
    authSection: {
        flex: 1.5, // Give a bit more space for the card
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 20, // Add some padding at the bottom of the card section
    },
    authCard: {
        // backgroundColor: theme.colors.white, // Removed white background
        backgroundColor: theme.colors.glass.background, // Use glass background
        borderColor: theme.colors.glass.border, // Use glass border
        borderWidth: 1, // Add border width for glass effect
        borderRadius: 24,
        padding: 32,
        width: width * 0.9,
        alignItems: 'center',
        // Removed shadow properties to rely on glassmorphism
        // shadowColor: theme.colors.shadow.medium,
        // shadowOffset: {
        //     width: 0,
        //     height: 8,
        // },
        // shadowOpacity: 0.3,
        // shadowRadius: 16,
        // elevation: 10,
    },
    authIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: theme.colors.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    authTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
        marginBottom: 8,
        textAlign: 'center',
    },
    authDescription: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.error + '15',
        padding: 12,
        borderRadius: 12,
        marginBottom: 20,
        width: '100%',
    },
    errorText: {
        marginLeft: 8,
        fontSize: 14,
        color: theme.colors.error,
        flex: 1,
    },
    authButton: {
        backgroundColor: theme.colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 16,
        width: '100%',
        marginBottom: 16,
        shadowColor: theme.colors.primary, // Changed from theme.colors.shadow.colored
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    authButtonDisabled: {
        opacity: 0.6,
    },
    authButtonText: {
        color: theme.colors.white,
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    skipButton: {
        paddingVertical: 12,
        paddingHorizontal: 20,
    },
    skipButtonText: {
        color: theme.colors.textSecondary,
        fontSize: 14,
        fontWeight: '500',
    },
    featuresSection: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingBottom: insets.bottom + 20, // This should now work
        paddingHorizontal: 20,
    },
    feature: {
        alignItems: 'center',
        opacity: 0.8,
    },
    featureText: {
        color: theme.colors.white,
        fontSize: 12,
        marginTop: 8,
        textAlign: 'center',
    },
});
