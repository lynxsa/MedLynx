import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, {
    FadeInDown,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ThemedGlassCard from '../../components/ThemedGlassCard';
import { useTheme } from '../../contexts/ThemeContext';
import ComprehensiveFoodService, { FoodAnalysisResult, FoodData } from '../../services/ComprehensiveFoodService';

const { width } = Dimensions.get('window');

// Detail Row Component
const DetailRow: React.FC<{ label: string; value: string; theme: any }> = ({ label, value, theme }) => (
  <View style={styles.detailRow}>
    <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>{label}</Text>
    <Text style={[styles.detailValue, { color: theme.colors.text }]}>{value}</Text>
  </View>
);

// Modern Food Scanner Screen
const ModernFoodScanScreen: React.FC = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  
  // Enhanced state management
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [foodData, setFoodData] = useState<FoodData | null>(null);
  const [scanMode, setScanMode] = useState<'camera' | 'results'>('camera');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [flashMode, setFlashMode] = useState<'off' | 'on' | 'auto'>('off');
  const [processingTime, setProcessingTime] = useState<number>(0);
  const [confidence, setConfidence] = useState<number>(0);
  const [sources, setSources] = useState<string[]>([]);
  
  // Animation values
  const scanAnimation = useSharedValue(0);
  const pulseAnimation = useSharedValue(1);
  
  // Expandable sections
  const [expandedSections, setExpandedSections] = useState({
    nutrition: true,
    health: true,
    ingredients: false,
    freshness: true,
    advice: true,
  });

  useEffect(() => {
    // Start animations
    scanAnimation.value = withRepeat(
      withTiming(1, { duration: 2000 }),
      -1,
      true
    );
    pulseAnimation.value = withRepeat(
      withTiming(1.1, { duration: 1000 }),
      -1,
      true
    );
  }, [scanAnimation, pulseAnimation]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Enhanced photo capture
  const takePhoto = async () => {
    if (!cameraRef.current) return;
    
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setIsAnalyzing(true);
      const startTime = Date.now();
      
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
        exif: false,
      });
      
      if (photo) {
        setCapturedImage(photo.uri);
        console.log('🍎 Analyzing food with comprehensive AI service...');
        
        const result: FoodAnalysisResult = await ComprehensiveFoodService.analyzeFoodImage(photo.uri);
        
        setProcessingTime(Date.now() - startTime);
        setConfidence(result.confidence);
        setSources(result.sources);
        
        if (result.success && result.data) {
          console.log(`✅ Food identified: ${result.data.name} (Health Score: ${result.data.healthScore})`);
          setFoodData(result.data);
          setScanMode('results');
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        } else {
          Alert.alert(
            '🔍 Analysis Complete',
            'Food detected but needs clearer image. Try better lighting or closer shot.',
            [
              { text: 'Try Again', style: 'default' },
              { text: 'Upload from Gallery', onPress: pickImageFromGallery }
            ]
          );
        }
      }
    } catch (error) {
      console.error('📱 Camera error:', error);
      Alert.alert('Camera Error', 'Unable to capture image. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Gallery picker
  const pickImageFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setIsAnalyzing(true);
        const startTime = Date.now();
        const imageUri = result.assets[0].uri;
        setCapturedImage(imageUri);

        const analysisResult = await ComprehensiveFoodService.analyzeFoodImage(imageUri);
        
        setProcessingTime(Date.now() - startTime);
        setConfidence(analysisResult.confidence);
        setSources(analysisResult.sources);

        if (analysisResult.success && analysisResult.data) {
          setFoodData(analysisResult.data);
          setScanMode('results');
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        } else {
          Alert.alert('Analysis Complete', 'No clear food detected in the selected image.');
        }
        setIsAnalyzing(false);
      }
    } catch (error) {
      setIsAnalyzing(false);
      console.error('Gallery picker error:', error);
      Alert.alert('Error', 'Unable to select image from gallery.');
    }
  };

  const resetScan = () => {
    setScanMode('camera');
    setFoodData(null);
    setCapturedImage(null);
    setConfidence(0);
    setSources([]);
    setProcessingTime(0);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Helper functions
  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return '#4CAF50';
    if (score >= 60) return '#FF9800';
    return '#F44336';
  };

  const getFreshnessColor = (level: string) => {
    switch (level) {
      case 'fresh': return '#4CAF50';
      case 'good': return '#8BC34A';
      case 'moderate': return '#FF9800';
      case 'poor': return '#F44336';
      default: return theme.colors.textSecondary;
    }
  };

  // Animated styles
  const animatedScanLineStyle = useAnimatedStyle(() => {
    const translateY = interpolate(scanAnimation.value, [0, 1], [-80, 80]);
    return {
      transform: [{ translateY }],
    };
  });

  const animatedPulseStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulseAnimation.value }],
    };
  });

  // Permission states
  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        style={[styles.container, { paddingTop: insets.top }]}
      >
        <View style={styles.permissionContainer}>
          <ThemedGlassCard style={styles.permissionCard}>
            <Ionicons name="camera" size={64} color={theme.colors.primary} />
            <Text style={[styles.permissionTitle, { color: theme.colors.text }]}>
              Camera Access Required
            </Text>
            <Text style={[styles.permissionText, { color: theme.colors.textSecondary }]}>
              We need camera access to scan food and provide detailed nutritional analysis with AI.
            </Text>
            <TouchableOpacity
              style={[styles.permissionButton, { backgroundColor: theme.colors.primary }]}
              onPress={requestPermission}
            >
              <Text style={styles.permissionButtonText}>Grant Camera Access</Text>
            </TouchableOpacity>
          </ThemedGlassCard>
        </View>
      </LinearGradient>
    );
  }

  // Results Screen
  if (scanMode === 'results' && foodData) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <LinearGradient
          colors={[theme.colors.primary + '20', 'transparent']}
          style={StyleSheet.absoluteFillObject}
        />
        
        {/* Modern Header */}
        <View style={[styles.modernHeader, { paddingTop: insets.top + 10 }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <BlurView intensity={20} style={styles.headerButton}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </BlurView>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>🍎 Food Analysis</Text>
          <TouchableOpacity style={styles.backButton} onPress={resetScan}>
            <BlurView intensity={20} style={styles.headerButton}>
              <Ionicons name="refresh" size={24} color="white" />
            </BlurView>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.resultsContainer} showsVerticalScrollIndicator={false}>
          {/* Food Summary Card */}
          <Animated.View entering={FadeInDown.delay(100)}>
            <ThemedGlassCard style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <View style={styles.foodIcon}>
                  <LinearGradient
                    colors={[theme.colors.primary, theme.colors.secondary]}
                    style={styles.iconGradient}
                  >
                    <Ionicons name="nutrition" size={24} color="white" />
                  </LinearGradient>
                </View>
                <View style={styles.foodInfo}>
                  <Text style={[styles.foodName, { color: theme.colors.text }]}>
                    {foodData.name}
                  </Text>
                  <Text style={[styles.foodCategory, { color: theme.colors.textSecondary }]}>
                    {foodData.category}
                  </Text>
                </View>
                <View style={[styles.healthScoreTag, { 
                  backgroundColor: getHealthScoreColor(foodData.healthScore) + '20' 
                }]}>
                  <Text style={[styles.healthScoreText, { 
                    color: getHealthScoreColor(foodData.healthScore) 
                  }]}>
                    {foodData.healthScore}/100
                  </Text>
                </View>
              </View>

              {/* Processing Info */}
              <View style={styles.processingInfo}>
                <View style={styles.processingItem}>
                  <Ionicons name="time" size={16} color={theme.colors.textSecondary} />
                  <Text style={[styles.processingText, { color: theme.colors.textSecondary }]}>
                    Processed in {(processingTime / 1000).toFixed(1)}s
                  </Text>
                </View>
                <View style={styles.processingItem}>
                  <Ionicons name="cloud" size={16} color={theme.colors.textSecondary} />
                  <Text style={[styles.processingText, { color: theme.colors.textSecondary }]}>
                    {sources.length} AI sources
                  </Text>
                </View>
              </View>

              {/* Dietary Tags */}
              <View style={styles.tagsContainer}>
                {foodData.dietaryTags.slice(0, 4).map((tag, index) => (
                  <View key={index} style={[styles.dietaryTag, { 
                    backgroundColor: theme.colors.primary + '15' 
                  }]}>
                    <Text style={[styles.dietaryTagText, { color: theme.colors.primary }]}>
                      {tag}
                    </Text>
                  </View>
                ))}
              </View>
            </ThemedGlassCard>
          </Animated.View>

          {/* Captured Image */}
          {capturedImage && (
            <Animated.View entering={FadeInDown.delay(200)}>
              <ThemedGlassCard style={styles.imageCard}>
                <Image source={{ uri: capturedImage }} style={styles.capturedImage} />
              </ThemedGlassCard>
            </Animated.View>
          )}

          {/* Nutrition Facts */}
          <Animated.View entering={FadeInDown.delay(300)}>
            <ThemedGlassCard style={styles.detailsCard}>
              <TouchableOpacity 
                style={styles.sectionHeader} 
                onPress={() => toggleSection('nutrition')}
              >
                <View style={styles.sectionTitleContainer}>
                  <Ionicons name="bar-chart" size={20} color={theme.colors.primary} />
                  <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                    Nutrition Facts
                  </Text>
                </View>
                <Ionicons 
                  name={expandedSections.nutrition ? 'chevron-up' : 'chevron-down'} 
                  size={20} 
                  color={theme.colors.textSecondary} 
                />
              </TouchableOpacity>
              
              {expandedSections.nutrition && (
                <View style={styles.sectionContent}>
                  <Text style={[styles.servingSize, { color: theme.colors.textSecondary }]}>
                    Per {foodData.nutrition.servingSize}
                  </Text>
                  <View style={styles.nutritionGrid}>
                    <DetailRow label="Calories" value={`${foodData.nutrition.calories}`} theme={theme} />
                    <DetailRow label="Protein" value={`${foodData.nutrition.protein}g`} theme={theme} />
                    <DetailRow label="Carbs" value={`${foodData.nutrition.carbs}g`} theme={theme} />
                    <DetailRow label="Fat" value={`${foodData.nutrition.fat}g`} theme={theme} />
                    <DetailRow label="Fiber" value={`${foodData.nutrition.fiber}g`} theme={theme} />
                    <DetailRow label="Sugar" value={`${foodData.nutrition.sugar}g`} theme={theme} />
                  </View>
                </View>
              )}
            </ThemedGlassCard>
          </Animated.View>

          {/* Health Benefits */}
          <Animated.View entering={FadeInDown.delay(400)}>
            <ThemedGlassCard style={styles.detailsCard}>
              <TouchableOpacity 
                style={styles.sectionHeader} 
                onPress={() => toggleSection('health')}
              >
                <View style={styles.sectionTitleContainer}>
                  <Ionicons name="heart" size={20} color="#4CAF50" />
                  <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                    Health Benefits
                  </Text>
                </View>
                <Ionicons 
                  name={expandedSections.health ? 'chevron-up' : 'chevron-down'} 
                  size={20} 
                  color={theme.colors.textSecondary} 
                />
              </TouchableOpacity>
              
              {expandedSections.health && (
                <View style={styles.sectionContent}>
                  {foodData.healthBenefits.map((benefit, index) => (
                    <View key={index} style={styles.benefitItem}>
                      <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                      <Text style={[styles.benefitText, { color: theme.colors.text }]}>
                        {benefit}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </ThemedGlassCard>
          </Animated.View>

          {/* Freshness Analysis */}
          {foodData.freshness && (
            <Animated.View entering={FadeInDown.delay(500)}>
              <ThemedGlassCard style={styles.detailsCard}>
                <TouchableOpacity 
                  style={styles.sectionHeader} 
                  onPress={() => toggleSection('freshness')}
                >
                  <View style={styles.sectionTitleContainer}>
                    <Ionicons name="leaf" size={20} color={getFreshnessColor(foodData.freshness.level)} />
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                      Freshness Analysis
                    </Text>
                  </View>
                  <Ionicons 
                    name={expandedSections.freshness ? 'chevron-up' : 'chevron-down'} 
                    size={20} 
                    color={theme.colors.textSecondary} 
                  />
                </TouchableOpacity>
                
                {expandedSections.freshness && (
                  <View style={styles.sectionContent}>
                    <View style={[styles.freshnessTag, { 
                      backgroundColor: getFreshnessColor(foodData.freshness.level) + '20' 
                    }]}>
                      <Text style={[styles.freshnessText, { 
                        color: getFreshnessColor(foodData.freshness.level) 
                      }]}>
                        {foodData.freshness.level.charAt(0).toUpperCase() + foodData.freshness.level.slice(1)}
                      </Text>
                    </View>
                    {foodData.freshness.indicators.map((indicator, index) => (
                      <Text key={index} style={[styles.indicatorText, { color: theme.colors.textSecondary }]}>
                        • {indicator}
                      </Text>
                    ))}
                    <Text style={[styles.shelfLifeText, { color: theme.colors.text }]}>
                      Shelf life: {foodData.freshness.shelfLife}
                    </Text>
                  </View>
                )}
              </ThemedGlassCard>
            </Animated.View>
          )}

          {/* AI Advice */}
          <Animated.View entering={FadeInDown.delay(600)}>
            <ThemedGlassCard style={styles.adviceCard}>
              <TouchableOpacity 
                style={styles.sectionHeader} 
                onPress={() => toggleSection('advice')}
              >
                <View style={styles.sectionTitleContainer}>
                  <LinearGradient
                    colors={[theme.colors.primary, theme.colors.secondary]}
                    style={styles.aiIcon}
                  >
                    <Ionicons name="sparkles" size={16} color="white" />
                  </LinearGradient>
                  <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                    AI Health Insights
                  </Text>
                </View>
                <Ionicons 
                  name={expandedSections.advice ? 'chevron-up' : 'chevron-down'} 
                  size={20} 
                  color={theme.colors.textSecondary} 
                />
              </TouchableOpacity>
              
              {expandedSections.advice && (
                <View style={styles.sectionContent}>
                  <Text style={[styles.adviceText, { color: theme.colors.text }]}>
                    {foodData.aiInsights}
                  </Text>
                  {foodData.recommendations.map((rec, index) => (
                    <View key={index} style={styles.recommendationItem}>
                      <Ionicons name="bulb" size={16} color={theme.colors.primary} />
                      <Text style={[styles.recommendationText, { color: theme.colors.textSecondary }]}>
                        {rec}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </ThemedGlassCard>
          </Animated.View>

          {/* Action Buttons */}
          <Animated.View entering={FadeInDown.delay(700)} style={styles.actionContainer}>
            <TouchableOpacity style={styles.scanAgainButton} onPress={resetScan}>
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.secondary]}
                style={styles.scanAgainGradient}
              >
                <Ionicons name="camera" size={20} color="white" />
                <Text style={styles.scanAgainText}>Scan Another Food</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </View>
    );
  }

  // Camera Screen
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        style={StyleSheet.absoluteFillObject}
      />
      
      {/* Modern Header */}
      <View style={[styles.modernHeader, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <BlurView intensity={20} style={styles.headerButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </BlurView>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🍎 FoodScan AI</Text>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => setFlashMode(flashMode === 'off' ? 'on' : 'off')}
        >
          <BlurView intensity={20} style={styles.headerButton}>
            <Ionicons 
              name={flashMode === 'on' ? 'flash' : 'flash-off'} 
              size={24} 
              color="white" 
            />
          </BlurView>
        </TouchableOpacity>
      </View>

      {/* Camera View */}
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
        flash={flashMode}
      >
        {/* Scan Frame */}
        <View style={styles.scanFrame}>
          <View style={styles.scanCorners}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
          <Animated.View style={[styles.scanLine, animatedScanLineStyle]} />
        </View>

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <BlurView intensity={80} style={styles.instructionsCard}>
            <Ionicons name="nutrition" size={24} color={theme.colors.primary} />
            <Text style={styles.instructionsTitle}>Smart Food Scanner</Text>
            <Text style={styles.instructionsText}>
              Position food clearly within the frame. AI will analyze nutrition, freshness, and health benefits.
            </Text>
          </BlurView>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity style={styles.controlButton} onPress={pickImageFromGallery}>
            <BlurView intensity={40} style={styles.controlButtonInner}>
              <Ionicons name="images" size={24} color="white" />
            </BlurView>
          </TouchableOpacity>

          <Animated.View style={[styles.captureButtonContainer, animatedPulseStyle]}>
            <TouchableOpacity 
              style={[styles.captureButton, isAnalyzing && styles.capturingButton]} 
              onPress={takePhoto}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <View style={styles.analyzingContainer}>
                  <ActivityIndicator size="large" color="white" />
                  <Text style={styles.analyzingText}>Analyzing...</Text>
                </View>
              ) : (
                <LinearGradient
                  colors={[theme.colors.primary, theme.colors.secondary]}
                  style={styles.captureGradient}
                >
                  <Ionicons name="camera" size={32} color="white" />
                </LinearGradient>
              )}
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity style={styles.controlButton}>
            <BlurView intensity={40} style={styles.controlButtonInner}>
              <Ionicons name="information-circle" size={24} color="white" />
            </BlurView>
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionCard: {
    padding: 30,
    alignItems: 'center',
    borderRadius: 20,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  permissionButton: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modernHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
    zIndex: 10,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    borderRadius: 22,
    overflow: 'hidden',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },
  camera: {
    flex: 1,
  },
  scanFrame: {
    position: 'absolute',
    top: '30%',
    left: '10%',
    right: '10%',
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanCorners: {
    ...StyleSheet.absoluteFillObject,
  },
  corner: {
    position: 'absolute',
    width: 25,
    height: 25,
    borderColor: '#00E5FF',
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderBottomWidth: 0,
    borderRightWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  scanLine: {
    width: '100%',
    height: 2,
    backgroundColor: '#00E5FF',
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  instructionsContainer: {
    position: 'absolute',
    top: '60%',
    left: 20,
    right: 20,
  },
  instructionsCard: {
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    marginTop: 10,
    marginBottom: 5,
  },
  instructionsText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 20,
  },
  controls: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  controlButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  controlButtonInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonContainer: {
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  captureGradient: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  capturingButton: {
    opacity: 0.7,
  },
  analyzingContainer: {
    alignItems: 'center',
  },
  analyzingText: {
    color: 'white',
    fontSize: 12,
    marginTop: 5,
    fontWeight: '500',
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  summaryCard: {
    padding: 20,
    marginBottom: 15,
    borderRadius: 15,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  foodIcon: {
    marginRight: 15,
  },
  iconGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  foodCategory: {
    fontSize: 14,
    opacity: 0.8,
  },
  healthScoreTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  healthScoreText: {
    fontSize: 14,
    fontWeight: '600',
  },
  processingInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  processingItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  processingText: {
    fontSize: 12,
    marginLeft: 5,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dietaryTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  dietaryTagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  imageCard: {
    padding: 10,
    marginBottom: 15,
    borderRadius: 15,
  },
  capturedImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
  detailsCard: {
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
  },
  adviceCard: {
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  aiIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  sectionContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  servingSize: {
    fontSize: 14,
    marginBottom: 10,
    fontStyle: 'italic',
  },
  nutritionGrid: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  detailLabel: {
    fontSize: 14,
    opacity: 0.8,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  benefitText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  freshnessTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 10,
  },
  freshnessText: {
    fontSize: 14,
    fontWeight: '600',
  },
  indicatorText: {
    fontSize: 14,
    marginBottom: 4,
    lineHeight: 20,
  },
  shelfLifeText: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
  },
  adviceText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 15,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  actionContainer: {
    paddingVertical: 20,
  },
  scanAgainButton: {
    borderRadius: 25,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  scanAgainGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 30,
  },
  scanAgainText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
});

export default ModernFoodScanScreen;
