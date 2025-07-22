import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useThemeColor } from '@/hooks/useThemeColor';
import { AIInsights, FoodDetails, ImageAnalysisResult } from '@/services/GeminiVisionService';
import GoogleVisionService, { FoodAnalysis, GoogleVisionResult } from '@/services/GoogleVisionService';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// Conversion function to map GoogleVisionResult to ImageAnalysisResult
const convertGoogleVisionToImageAnalysis = (googleResult: GoogleVisionResult): ImageAnalysisResult => {
  if (!googleResult.success || !googleResult.data) {
    return {
      success: false,
      error: googleResult.error || 'Analysis failed',
      confidence: 0,
      processingTime: googleResult.processingTime || 0,
    };
  }

  const foodAnalysis = googleResult.data.analysis as FoodAnalysis;
  
  // Convert to expected format
  const foodDetails: FoodDetails = {
    name: foodAnalysis.name,
    category: foodAnalysis.category,
    nutrition: foodAnalysis.nutrition,
    healthScore: foodAnalysis.healthScore,
    dietaryTags: foodAnalysis.dietaryTags || [],
    ingredients: foodAnalysis.ingredients || [],
    allergens: foodAnalysis.allergens || [],
  };

  const aiInsights: AIInsights = {
    drLynxAdvice: foodAnalysis.recommendations?.join(' ') || 'Enjoy this nutritious food choice!',
    urgencyLevel: 'low',
    riskFactors: [],
    recommendations: foodAnalysis.recommendations || [],
  };

  return {
    success: true,
    data: {
      type: 'food',
      identified: foodAnalysis.name,
      confidence: googleResult.confidence || 0.8,
      details: foodDetails,
      aiInsights: aiInsights,
      recommendations: foodAnalysis.recommendations || [],
      warnings: [],
      timestamp: new Date(),
    },
    confidence: googleResult.confidence,
    processingTime: googleResult.processingTime,
  };
};

interface NutritionItemProps {
  label: string;
  value: number;
  unit: string;
  color: string;
}

const NutritionItem: React.FC<NutritionItemProps> = ({ label, value, unit, color }) => (
  <View style={styles.nutritionItem}>
    <Text style={[styles.nutritionLabel, { color }]}>{label}</Text>
    <Text style={[styles.nutritionValue, { color }]}>
      {value.toFixed(1)}{unit}
    </Text>
  </View>
);

interface HealthScoreProps {
  score: number;
  colorScheme: 'light' | 'dark' | null;
}

const HealthScore: React.FC<HealthScoreProps> = ({ score, colorScheme }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#4CAF50';
    if (score >= 60) return '#FF9800';
    return '#F44336';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  return (
    <View style={styles.healthScoreContainer}>
      <View style={[styles.scoreCircle, { borderColor: getScoreColor(score) }]}>
        <Text style={[styles.scoreNumber, { color: getScoreColor(score) }]}>
          {score}
        </Text>
        <Text style={[styles.scoreLabel, { color: getScoreColor(score) }]}>
          {getScoreLabel(score)}
        </Text>
      </View>
    </View>
  );
};

export default function EnhancedFoodScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ImageAnalysisResult | null>(null);
  const [showCamera, setShowCamera] = useState(true);
  const [processingTime, setProcessingTime] = useState<number>(0);
  
  const cameraRef = useRef<CameraView>(null);
  const colorScheme = useColorScheme();
  
  const textColor = useThemeColor('textPrimary');
  const primaryColor = useThemeColor('primary');

  useEffect(() => {
    StatusBar.setBarStyle(colorScheme === 'dark' ? 'light-content' : 'dark-content');
  }, [colorScheme]);

  if (!permission) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" color={primaryColor} />
        <Text style={[styles.loadingText, { color: textColor }]}>Requesting camera permissions...</Text>
      </ThemedView>
    );
  }

  if (!permission.granted) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Ionicons name="camera-outline" size={64} color={primaryColor} />
          <Text style={[styles.permissionTitle, { color: textColor }]}>Camera Access Required</Text>
          <Text style={[styles.permissionMessage, { color: textColor }]}>
            MedLynx needs camera access to scan and analyze your food for nutritional insights.
          </Text>
          <TouchableOpacity 
            style={[styles.permissionButton, { backgroundColor: primaryColor }]} 
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>Grant Camera Access</Text>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  const takePicture = async () => {
    if (!cameraRef.current) return;

    try {
      setIsAnalyzing(true);
      console.log('📸 Taking picture for food analysis...');
      
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
        skipProcessing: false,
      });

      if (photo) {
        console.log('🔍 Analyzing food image...');
        const googleResult = await GoogleVisionService.analyzeFoodImage(photo.uri);
        const result = convertGoogleVisionToImageAnalysis(googleResult);
        
        setAnalysisResult(result);
        setProcessingTime(result.processingTime || 0);
        setShowCamera(false);
        
        if (result.success) {
          console.log('✅ Food analysis completed successfully');
        } else {
          Alert.alert('Analysis Error', result.error || 'Failed to analyze food image');
        }
      }
    } catch (error) {
      console.error('❌ Camera error:', error);
      Alert.alert('Camera Error', 'Failed to take picture. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const pickImageFromGallery = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please grant photo library access to analyze images.');
      return;
    }

    try {
      setIsAnalyzing(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        console.log('🔍 Analyzing selected image...');
        const googleResult = await GoogleVisionService.analyzeFoodImage(result.assets[0].uri);
        const analysisResult = convertGoogleVisionToImageAnalysis(googleResult);
        
        setAnalysisResult(analysisResult);
        setProcessingTime(analysisResult.processingTime || 0);
        setShowCamera(false);
        
        if (analysisResult.success) {
          console.log('✅ Food analysis completed successfully');
        } else {
          Alert.alert('Analysis Error', analysisResult.error || 'Failed to analyze food image');
        }
      }
    } catch (error) {
      console.error('❌ Gallery error:', error);
      Alert.alert('Gallery Error', 'Failed to process image. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetScan = () => {
    setAnalysisResult(null);
    setShowCamera(true);
    setProcessingTime(0);
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  if (showCamera) {
    return (
      <View style={styles.container}>
        <CameraView 
          ref={cameraRef}
          style={styles.camera} 
          facing={facing}
          enableTorch={false}
        >
          {/* Header */}
          <BlurView intensity={60} tint={colorScheme === 'dark' ? 'dark' : 'light'} style={styles.header}>
            <Text style={[styles.headerTitle, { color: 'white' }]}>🍽️ Food Scanner</Text>
            <Text style={[styles.headerSubtitle, { color: 'rgba(255,255,255,0.8)' }]}>
              Point camera at food for nutritional analysis
            </Text>
          </BlurView>

          {/* Camera Controls */}
          <View style={styles.controlsContainer}>
            <TouchableOpacity style={styles.controlButton} onPress={pickImageFromGallery}>
              <Ionicons name="images-outline" size={24} color="white" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.captureButton, isAnalyzing && styles.captureButtonDisabled]} 
              onPress={takePicture}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <ActivityIndicator size="large" color="white" />
              ) : (
                <View style={styles.captureButtonInner} />
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.controlButton} onPress={toggleCameraFacing}>
              <Ionicons name="camera-reverse-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Scanning Overlay */}
          {isAnalyzing && (
            <BlurView intensity={40} tint="dark" style={styles.scanningOverlay}>
              <ActivityIndicator size="large" color={primaryColor} />
              <Text style={styles.scanningText}>🤖 Dr. LYNX is analyzing your food...</Text>
              <Text style={styles.scanningSubtext}>This may take a few moments</Text>
            </BlurView>
          )}
        </CameraView>
      </View>
    );
  }

  // Results Screen
  if (analysisResult) {
    const foodData = analysisResult.data?.details as FoodDetails;
    const insights = analysisResult.data?.aiInsights as AIInsights;
    
    return (
      <ThemedView style={styles.container}>
        <ScrollView style={styles.resultsContainer} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.resultsHeader}>
            <TouchableOpacity onPress={resetScan} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={textColor} />
            </TouchableOpacity>
            <Text style={[styles.resultsTitle, { color: textColor }]}>Food Analysis</Text>
            <View style={styles.processingTime}>
              <Text style={styles.processingTimeText}>
                ⚡ {(processingTime / 1000).toFixed(1)}s
              </Text>
            </View>
          </View>

          {analysisResult.success && foodData && insights ? (
            <>
              {/* Food Identification */}
              <View style={[styles.card, { backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#f8f9fa' }]}>
                <View style={styles.identificationHeader}>
                  <Text style={[styles.foodName, { color: textColor }]}>{analysisResult.data?.identified}</Text>
                  <View style={styles.confidenceBadge}>
                    <Text style={[styles.confidenceText, { color: primaryColor }]}>
                      {Math.round((analysisResult.confidence || 0) * 100)}% confident
                    </Text>
                  </View>
                </View>
                <Text style={[styles.foodCategory, { color: textColor }]}>{foodData.category}</Text>
                
                {/* Health Score */}
                <HealthScore score={foodData.healthScore} colorScheme={colorScheme || 'light'} />
              </View>

              {/* Nutrition Facts */}
              <View style={[styles.card, { backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#f8f9fa' }]}>
                <Text style={[styles.sectionTitle, { color: textColor }]}>📊 Nutrition Facts</Text>
                {foodData.servingSize && (
                  <Text style={[styles.servingSize, { color: textColor }]}>Per {foodData.servingSize}</Text>
                )}
                
                <View style={styles.nutritionGrid}>
                  <NutritionItem label="Calories" value={foodData.nutrition.calories} unit="" color={textColor} />
                  <NutritionItem label="Protein" value={foodData.nutrition.protein} unit="g" color={textColor} />
                  <NutritionItem label="Carbs" value={foodData.nutrition.carbs} unit="g" color={textColor} />
                  <NutritionItem label="Fat" value={foodData.nutrition.fat} unit="g" color={textColor} />
                  <NutritionItem label="Fiber" value={foodData.nutrition.fiber} unit="g" color={textColor} />
                  <NutritionItem label="Sugar" value={foodData.nutrition.sugar} unit="g" color={textColor} />
                </View>

                {foodData.glycemicIndex && (
                  <View style={styles.glycemicIndex}>
                    <Text style={[styles.glycemicLabel, { color: textColor }]}>Glycemic Index: </Text>
                    <Text style={[styles.glycemicValue, { color: primaryColor }]}>
                      {foodData.glycemicIndex}
                    </Text>
                  </View>
                )}
              </View>

              {/* Dietary Information */}
              {(foodData.dietaryTags.length > 0 || foodData.allergens?.length) && (
                <View style={[styles.card, { backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#f8f9fa' }]}>
                  <Text style={[styles.sectionTitle, { color: textColor }]}>🏷️ Dietary Information</Text>
                  
                  {foodData.dietaryTags.length > 0 && (
                    <View style={styles.tagsContainer}>
                      {foodData.dietaryTags.map((tag, index) => (
                        <View key={index} style={[styles.dietaryTag, { backgroundColor: primaryColor + '20' }]}>
                          <Text style={[styles.tagText, { color: primaryColor }]}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                  
                  {foodData.allergens && foodData.allergens.length > 0 && (
                    <View style={styles.allergensContainer}>
                      <Text style={styles.allergensTitle}>⚠️ Contains Allergens:</Text>
                      {foodData.allergens.map((allergen, index) => (
                        <Text key={index} style={[styles.allergenText, { color: '#F44336' }]}>
                          • {allergen}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
              )}

              {/* Dr. LYNX Insights */}
              <View style={[styles.card, { backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#f8f9fa' }]}>
                <Text style={[styles.sectionTitle, { color: textColor }]}>🤖 Dr. LYNX Health Insights</Text>
                
                <View style={styles.insightItem}>
                  <Text style={[styles.insightLabel, { color: textColor }]}>Summary:</Text>
                  <Text style={[styles.insightText, { color: textColor }]}>{insights.summary}</Text>
                </View>

                <View style={styles.insightItem}>
                  <Text style={[styles.insightLabel, { color: textColor }]}>Health Impact:</Text>
                  <Text style={[styles.insightText, { color: textColor }]}>{insights.healthImpact}</Text>
                </View>

                <View style={styles.insightItem}>
                  <Text style={[styles.insightLabel, { color: textColor }]}>Dr. LYNX Advice:</Text>
                  <Text style={[styles.drLynxAdvice, { color: primaryColor }]}>
                    {insights.drLynxAdvice}
                  </Text>
                </View>

                {insights.tips && insights.tips.length > 0 && (
                  <View style={styles.insightItem}>
                    <Text style={[styles.insightLabel, { color: textColor }]}>💡 Tips:</Text>
                    {insights.tips.map((tip, index) => (
                      <Text key={index} style={[styles.tipText, { color: textColor }]}>• {tip}</Text>
                    ))}
                  </View>
                )}

                {insights.alternatives && insights.alternatives.length > 0 && (
                  <View style={styles.insightItem}>
                    <Text style={[styles.insightLabel, { color: textColor }]}>🔄 Healthier Alternatives:</Text>
                    {insights.alternatives.map((alternative, index) => (
                      <Text key={index} style={[styles.alternativeText, { color: textColor }]}>• {alternative}</Text>
                    ))}
                  </View>
                )}
              </View>

            </>
          ) : (
            <View style={[styles.card, styles.errorCard]}>
              <Ionicons name="alert-circle-outline" size={48} color="#F44336" />
              <Text style={styles.errorTitle}>Analysis Failed</Text>
              <Text style={styles.errorMessage}>
                {analysisResult.error || 'Unable to analyze the food image. Please try again with a clearer photo.'}
              </Text>
            </View>
          )}

          {/* Action Button */}
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: primaryColor }]} 
            onPress={resetScan}
          >
            <Ionicons name="camera-outline" size={20} color="white" />
            <Text style={styles.actionButtonText}>Scan Another Food</Text>
          </TouchableOpacity>
        </ScrollView>
      </ThemedView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  permissionMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  permissionButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  camera: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderWidth: 4,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonDisabled: {
    opacity: 0.6,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  scanningOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scanningText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    textAlign: 'center',
  },
  scanningSubtext: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  resultsContainer: {
    flex: 1,
    padding: 20,
  },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 40,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
  },
  processingTime: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
  },
  processingTimeText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  identificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  foodName: {
    fontSize: 22,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 12,
  },
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(0,122,255,0.1)',
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '600',
  },
  foodCategory: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 20,
  },
  healthScoreContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  servingSize: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 16,
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  nutritionItem: {
    width: '48%',
    marginBottom: 16,
  },
  nutritionLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  nutritionValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  glycemicIndex: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  glycemicLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  glycemicValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  dietaryTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    margin: 4,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  allergensContainer: {
    marginTop: 16,
  },
  allergensTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#F44336',
  },
  allergenText: {
    fontSize: 14,
    marginBottom: 4,
  },
  insightItem: {
    marginBottom: 16,
  },
  insightLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  insightText: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
  drLynxAdvice: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    fontStyle: 'italic',
  },
  tipText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
    opacity: 0.8,
  },
  alternativeText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
    opacity: 0.8,
  },
  errorCard: {
    alignItems: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F44336',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 22,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 25,
    marginTop: 20,
    marginBottom: 40,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
