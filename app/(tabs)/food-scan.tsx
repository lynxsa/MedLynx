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
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
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
import FoodScanStorage from '../../utils/FoodScanStorage';

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
  const [sources, setSources] = useState<string[]>([]);
  
  // Save functionality state
  const [isSaving, setIsSaving] = useState(false);
  const [saveNotes, setSaveNotes] = useState('');
  const [saveTags, setSaveTags] = useState<string[]>([]);
  
  // Animation values
  const scanAnimation = useSharedValue(0);
  const pulseAnimation = useSharedValue(1);
  
  // Expandable sections  
  const [expandedSections, setExpandedSections] = useState({
    identified: true,
    detailed: false,
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

  // Enhanced photo capture with individual food detection
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
        console.log('🍎 Analyzing food with enhanced individual item detection...');
        
        const result: FoodAnalysisResult = await ComprehensiveFoodService.analyzeFoodImage(photo.uri);
        
        setProcessingTime(Date.now() - startTime);
        setSources(result.sources);
        
        if (result.success && result.data) {
          const itemCount = result.data.identifiedItems?.length || 0;
          console.log(`✅ Food analysis complete: ${result.data.name} with ${itemCount} individual items detected`);
          console.log(`🏥 Health Score: ${result.data.healthScore}/100`);
          
          // Log individual items
          result.data.identifiedItems?.forEach((item, index) => {
            console.log(`${index + 1}. ${item.name} - ${item.calories} cal, Health: ${item.healthRating}/10`);
          });
          
          setFoodData({ ...result.data, imageUri: photo.uri });
          setScanMode('results');
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        } else {
          Alert.alert(
            '🔍 Analysis Complete',
            'Food detected but needs clearer image. Try better lighting or get closer to the food items.',
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
    setSources([]);
    setProcessingTime(0);
    setSaveNotes('');
    setSaveTags([]);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Save scan functionality
  const saveScan = async () => {
    if (!foodData) {
      Alert.alert('Error', 'No scan data to save');
      return;
    }

    try {
      setIsSaving(true);
      
      const scanId = await FoodScanStorage.saveScan(
        foodData,
        capturedImage || undefined,
        {
          notes: saveNotes.trim() || undefined,
          tags: saveTags.filter(tag => tag.trim()),
          saveImage: !!capturedImage
        }
      );
      
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      
      Alert.alert(
        '✅ Scan Saved!',
        `Your food analysis has been saved with ID: ${scanId.slice(-8)}`,
        [
          { text: 'OK', style: 'default' }
        ]
      );
      
    } catch (error) {
      console.error('Error saving scan:', error);
      Alert.alert('Error', 'Failed to save scan. Please try again.');
    } finally {
      setIsSaving(false);
    }
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

              {/* Save Scan Button */}
              <TouchableOpacity 
                style={[styles.saveButton, { 
                  backgroundColor: theme.colors.primary,
                  opacity: isSaving ? 0.7 : 1
                }]}
                onPress={saveScan}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Ionicons name="bookmark" size={20} color="#FFFFFF" />
                )}
                <Text style={styles.saveButtonText}>
                  {isSaving ? 'Saving...' : 'Save Scan'}
                </Text>
              </TouchableOpacity>
            </ThemedGlassCard>
          </Animated.View>

          {/* Identified Food Items */}
          {foodData.identifiedItems && foodData.identifiedItems.length > 0 && (
            <Animated.View entering={FadeInDown.delay(200)}>
              <ThemedGlassCard style={styles.detailsCard}>
                <TouchableOpacity 
                  style={styles.sectionHeader} 
                  onPress={() => toggleSection('identified')}
                >
                  <View style={styles.sectionTitleContainer}>
                    <Ionicons name="eye" size={20} color={theme.colors.primary} />
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                      Identified Items ({foodData.identifiedItems.length})
                    </Text>
                  </View>
                  <Ionicons 
                    name={expandedSections.identified ? 'chevron-up' : 'chevron-down'} 
                    size={20} 
                    color={theme.colors.textSecondary} 
                  />
                </TouchableOpacity>
                
                {expandedSections.identified && (
                  <View style={styles.sectionContent}>
                    {foodData.identifiedItems.map((item, index) => (
                      <View key={index} style={styles.identifiedItem}>
                        <View style={styles.identifiedHeader}>
                          <Text style={[styles.identifiedName, { color: theme.colors.text }]}>
                            {item.name}
                          </Text>
                          <View style={[styles.confidenceTag, { 
                            backgroundColor: item.confidence >= 0.8 ? '#4CAF50' : 
                                           item.confidence >= 0.6 ? '#FF9800' : '#FF5722'
                          }]}>
                            <Text style={styles.confidenceText}>
                              {Math.round(item.confidence * 100)}%
                            </Text>
                          </View>
                        </View>
                        
                        <Text style={[styles.identifiedCategory, { 
                          color: theme.colors.textSecondary 
                        }]}>
                          {item.category}
                        </Text>
                        
                        <Text style={[styles.itemDescription, { 
                          color: theme.colors.textSecondary 
                        }]}>
                          {item.description}
                        </Text>
                        
                        {/* Enhanced item details */}
                        <View style={styles.itemDetailsRow}>
                          {item.calories && (
                            <View style={styles.itemDetail}>
                              <Ionicons name="flame" size={16} color="#FF6B35" />
                              <Text style={[styles.itemDetailText, { color: theme.colors.text }]}>
                                {item.calories} cal
                              </Text>
                            </View>
                          )}
                          {item.healthRating && (
                            <View style={styles.itemDetail}>
                              <Ionicons name="heart" size={16} color="#E91E63" />
                              <Text style={[styles.itemDetailText, { color: theme.colors.text }]}>
                                {item.healthRating}/10
                              </Text>
                            </View>
                          )}
                          {item.estimatedPortion && (
                            <View style={styles.itemDetail}>
                              <Ionicons name="resize" size={16} color="#9C27B0" />
                              <Text style={[styles.itemDetailText, { color: theme.colors.text }]}>
                                {item.estimatedPortion}
                              </Text>
                            </View>
                          )}
                        </View>

                        {item.nutritionalHighlights && (
                          <View style={styles.highlightsContainer}>
                            {item.nutritionalHighlights.map((highlight: string, idx: number) => (
                              <View key={idx} style={[styles.highlightTag, { 
                                backgroundColor: theme.colors.primary + '15' 
                              }]}>
                                <Text style={[styles.highlightText, { 
                                  color: theme.colors.primary 
                                }]}>
                                  {highlight}
                                </Text>
                              </View>
                            ))}
                          </View>
                        )}
                      </View>
                    ))}
                  </View>
                )}
              </ThemedGlassCard>
            </Animated.View>
          )}

          {/* Detailed Analysis */}
          {foodData.detailedAnalysis && (
            <Animated.View entering={FadeInDown.delay(250)}>
              <ThemedGlassCard style={styles.detailsCard}>
                <TouchableOpacity 
                  style={styles.sectionHeader} 
                  onPress={() => toggleSection('detailed')}
                >
                  <View style={styles.sectionTitleContainer}>
                    <Ionicons name="analytics" size={20} color="#9C27B0" />
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                      Detailed Analysis
                    </Text>
                  </View>
                  <Ionicons 
                    name={expandedSections.detailed ? 'chevron-up' : 'chevron-down'} 
                    size={20} 
                    color={theme.colors.textSecondary} 
                  />
                </TouchableOpacity>
                
                {expandedSections.detailed && (
                  <View style={styles.sectionContent}>
                    {foodData.detailedAnalysis.visualAppearance && (
                      <View style={styles.analysisSection}>
                        <Text style={[styles.analysisTitle, { color: theme.colors.text }]}>
                          Visual Appearance
                        </Text>
                        <Text style={[styles.analysisText, { color: theme.colors.textSecondary }]}>
                          {foodData.detailedAnalysis.visualAppearance}
                        </Text>
                      </View>
                    )}
                    
                    {foodData.detailedAnalysis.estimatedFreshness && (
                      <View style={styles.analysisSection}>
                        <Text style={[styles.analysisTitle, { color: theme.colors.text }]}>
                          Estimated Freshness
                        </Text>
                        <Text style={[styles.analysisText, { color: theme.colors.textSecondary }]}>
                          {foodData.detailedAnalysis.estimatedFreshness}
                        </Text>
                      </View>
                    )}
                    
                    {foodData.detailedAnalysis.storageRecommendations && (
                      <View style={styles.analysisSection}>
                        <Text style={[styles.analysisTitle, { color: theme.colors.text }]}>
                          Storage Recommendations
                        </Text>
                        <Text style={[styles.analysisText, { color: theme.colors.textSecondary }]}>
                          {foodData.detailedAnalysis.storageRecommendations}
                        </Text>
                      </View>
                    )}
                    
                    {foodData.detailedAnalysis.cookingMethods && foodData.detailedAnalysis.cookingMethods.length > 0 && (
                      <View style={styles.analysisSection}>
                        <Text style={[styles.analysisTitle, { color: theme.colors.text }]}>
                          Cooking Methods
                        </Text>
                        <Text style={[styles.analysisText, { color: theme.colors.textSecondary }]}>
                          {foodData.detailedAnalysis.cookingMethods.join(', ')}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </ThemedGlassCard>
            </Animated.View>
          )}

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
            {/* Save Scan Button */}
            <TouchableOpacity 
              style={[styles.saveButton, { backgroundColor: '#4CAF50' }]}
              onPress={saveScan}
              disabled={isSaving}
            >
              <View style={styles.saveButtonContent}>
                {isSaving ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Ionicons name="bookmark" size={20} color="white" />
                )}
                <Text style={styles.saveButtonText}>
                  {isSaving ? 'Saving...' : 'Save Food Analysis'}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Scan Again Button */}
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
  saveButton: {
    borderRadius: 25,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  saveButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 30,
    gap: 10,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  identifiedItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  identifiedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  identifiedName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  confidenceTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginLeft: 10,
  },
  confidenceText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  identifiedCategory: {
    fontSize: 13,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  itemDescription: {
    fontSize: 13,
    marginBottom: 10,
    opacity: 0.7,
    lineHeight: 18,
  },
  itemDetailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
    gap: 8,
  },
  itemDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  itemDetailText: {
    fontSize: 12,
    fontWeight: '500',
  },
  highlightsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  highlightTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  highlightText: {
    fontSize: 11,
    fontWeight: '500',
  },
  analysisSection: {
    marginBottom: 16,
  },
  analysisTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  analysisText: {
    fontSize: 13,
    lineHeight: 18,
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
    gap: 15,
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
