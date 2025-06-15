import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image,
  Dimensions,
  ViewStyle,
  TextStyle,
  ImageStyle,
  ColorValue,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { Theme } from '../../constants/DynamicTheme';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import ThemedGlassCard from '../../components/ThemedGlassCard';
import * as ImagePicker from 'expo-image-picker';
import { foodAnalysisService, NutritionData } from '../../utils/FoodAnalysisService';

const { width } = Dimensions.get('window');


// Define a type for the styles object returned by createStyles
interface FoodScanStyles {
  container: ViewStyle;
  header: ViewStyle;
  backButton: ViewStyle;
  headerTitle: TextStyle;
  resetButton: ViewStyle;
  galleryButton: ViewStyle;
  camera: ViewStyle;
  cameraOverlay: ViewStyle;
  scanFrame: ViewStyle;
  scanInstructions: TextStyle;
  controls: ViewStyle;
  captureButton: ViewStyle;
  capturingButton: ViewStyle;
  processingText: TextStyle;
  permissionCard: ViewStyle;
  permissionIcon: TextStyle;
  permissionTitle: TextStyle;
  permissionText: TextStyle;
  permissionButton: ViewStyle;
  permissionButtonText: TextStyle;
  resultsContainer: ViewStyle;
  identificationCard: ViewStyle;
  identificationHeader: ViewStyle;
  foodName: TextStyle;
  confidenceTag: ViewStyle;
  confidenceText: TextStyle;
  tagsContainer: ViewStyle;
  dietaryTag: ViewStyle;
  dietaryTagText: TextStyle;
  imageCard: ViewStyle;
  capturedImage: ImageStyle;
  nutritionCard: ViewStyle;
  nutritionHeader: ViewStyle;
  nutritionTitle: TextStyle;
  healthScore: ViewStyle;
  healthScoreText: TextStyle;
  nutritionGrid: ViewStyle;
  nutritionItem: ViewStyle;
  nutritionValue: TextStyle;
  nutritionUnit: TextStyle;
  nutritionLabel: TextStyle;
  recommendationsCard: ViewStyle;
  sectionHeader: ViewStyle;
  sectionTitle: TextStyle;
  recommendationItem: ViewStyle;
  recommendationText: TextStyle;
  warningsCard: ViewStyle;
  warningItem: ViewStyle;
  warningText: TextStyle;
  ingredientsCard: ViewStyle;
  ingredientsText: TextStyle;
  allergensCard: ViewStyle;
  allergensContainer: ViewStyle;
  allergenTag: ViewStyle;
  allergenText: TextStyle;
  actionsContainer: ViewStyle;
  scanAgainButton: ViewStyle;
  scanAgainText: TextStyle;
}

export default function FoodScanScreen() {
  const { theme } = useTheme();
  const styles = useThemedStyles(createStyles);
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [nutritionData, setNutritionData] = useState<NutritionData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  const analyzeFood = async (imageUri: string) => {
    setIsAnalyzing(true);
    try {
      const result = await foodAnalysisService.analyzeFood(imageUri);
      if (result.success && result.data) {
        setNutritionData(result.data);
      } else {
        Alert.alert('Analysis Failed', result.error || 'Could not analyze the food image. Please try again.');
      }
    } catch (error) {
      Alert.alert('Analysis Failed', 'Could not analyze the food image. Please try again.');
      console.error('Food analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const takePicture = async () => {
    if (!cameraRef.current) return;

    setIsScanning(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });
      
      if (photo) {
        setCapturedImage(photo.uri);
        await analyzeFood(photo.uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to capture image');
      console.error('Camera error:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const selectFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      setCapturedImage(result.assets[0].uri);
      await analyzeFood(result.assets[0].uri);
    }
  };

  const resetScan = () => {
    setCapturedImage(null);
    setNutritionData(null);
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <ThemedGlassCard style={styles.permissionCard}>
          <Ionicons 
            name="camera-outline" 
            size={64} 
            color={theme.colors.primary} 
            style={styles.permissionIcon}
          />
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionText}>
            MedLynx needs camera access to scan and analyze your food for nutritional insights.
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Enable Camera</Text>
          </TouchableOpacity>
        </ThemedGlassCard>
      </View>
    );
  }

  if (capturedImage && nutritionData) {
    return (
      <LinearGradient
        colors={theme.gradients.primary as [ColorValue, ColorValue, ...ColorValue[]]} // Corrected type for colors
        style={[styles.container, { paddingTop: insets.top }]}
      >
        <ScrollView style={styles.resultsContainer} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={theme.colors.textOnPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Food Analysis</Text>
            <TouchableOpacity onPress={resetScan} style={styles.resetButton}>
              <Ionicons name="refresh" size={24} color={theme.colors.textOnPrimary} />
            </TouchableOpacity>
          </View>

          {/* Food Identification */}
          <ThemedGlassCard style={styles.identificationCard}>
            <View style={styles.identificationHeader}>
              <Text style={styles.foodName}>{nutritionData.foodName}</Text>
              <View style={styles.confidenceTag}>
                <Text style={styles.confidenceText}>
                  {Math.round(nutritionData.confidence * 100)}% confident
                </Text>
              </View>
            </View>
            
            {/* Dietary Tags */}
            {nutritionData.dietaryTags && nutritionData.dietaryTags.length > 0 && (
              <View style={styles.tagsContainer}>
                {nutritionData.dietaryTags.map((tag, index) => (
                  <View key={index} style={styles.dietaryTag}>
                    <Text style={styles.dietaryTagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            )}
          </ThemedGlassCard>

          {/* Captured Image */}
          <ThemedGlassCard style={styles.imageCard}>
            <Image source={{ uri: capturedImage }} style={styles.capturedImage} />
          </ThemedGlassCard>

          {/* Nutrition Overview */}
          <ThemedGlassCard style={styles.nutritionCard}>
            <View style={styles.nutritionHeader}>
              <Text style={styles.nutritionTitle}>Nutritional Analysis</Text>
              <View style={[styles.healthScore, { backgroundColor: getHealthScoreColor(nutritionData.healthScore, theme) }]}>
                <Text style={styles.healthScoreText}>{nutritionData.healthScore}/10</Text>
              </View>
            </View>

            <View style={styles.nutritionGrid}>
              <NutritionItem styles={styles} label="Calories" value={nutritionData.calories} unit="kcal" />
              <NutritionItem styles={styles} label="Protein" value={nutritionData.protein} unit="g" />
              <NutritionItem styles={styles} label="Carbs" value={nutritionData.carbs} unit="g" />
              <NutritionItem styles={styles} label="Fat" value={nutritionData.fat} unit="g" />
              <NutritionItem styles={styles} label="Fiber" value={nutritionData.fiber} unit="g" />
              <NutritionItem styles={styles} label="Sugar" value={nutritionData.sugar} unit="g" />
            </View>
          </ThemedGlassCard>

          {/* Recommendations */}
          {nutritionData.recommendations.length > 0 && (
            <ThemedGlassCard style={styles.recommendationsCard}>
              <View style={styles.sectionHeader}>
                <Ionicons name="checkmark-circle" size={24} color={theme.colors.success} />
                <Text style={styles.sectionTitle}>Health Insights</Text>
              </View>
              {nutritionData.recommendations.map((rec, index) => (
                <View key={index} style={styles.recommendationItem}>
                  <Ionicons name="leaf" size={16} color={theme.colors.success} />
                  <Text style={styles.recommendationText}>{rec}</Text>
                </View>
              ))}
            </ThemedGlassCard>
          )}

          {/* Warnings */}
          {nutritionData.warnings.length > 0 && (
            <ThemedGlassCard style={styles.warningsCard}>
              <View style={styles.sectionHeader}>
                <Ionicons name="warning" size={24} color={theme.colors.warning} />
                <Text style={styles.sectionTitle}>Health Considerations</Text>
              </View>
              {nutritionData.warnings.map((warning, index) => (
                <View key={index} style={styles.warningItem}>
                  <Ionicons name="alert-circle" size={16} color={theme.colors.warning} />
                  <Text style={styles.warningText}>{warning}</Text>
                </View>
              ))}
            </ThemedGlassCard>
          )}

          {/* Ingredients */}
          {nutritionData.ingredients && nutritionData.ingredients.length > 0 && (
            <ThemedGlassCard style={styles.ingredientsCard}>
              <View style={styles.sectionHeader}>
                <Ionicons name="list" size={24} color={theme.colors.info} />
                <Text style={styles.sectionTitle}>Ingredients</Text>
              </View>
              <Text style={styles.ingredientsText}>
                {nutritionData.ingredients.join(', ')}
              </Text>
            </ThemedGlassCard>
          )}

          {/* Allergens */}
          {nutritionData.allergens && nutritionData.allergens.length > 0 && (
            <ThemedGlassCard style={styles.allergensCard}>
              <View style={styles.sectionHeader}>
                <Ionicons name="warning-outline" size={24} color={theme.colors.error} />
                <Text style={styles.sectionTitle}>Allergen Information</Text>
              </View>
              <View style={styles.allergensContainer}>
                {nutritionData.allergens.map((allergen, index) => (
                  <View key={index} style={styles.allergenTag}>
                    <Text style={styles.allergenText}>{allergen}</Text>
                  </View>
                ))}
              </View>
            </ThemedGlassCard>
          )}

          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.scanAgainButton} onPress={resetScan}>
              <Ionicons name="camera" size={20} color={theme.colors.white} />
              <Text style={styles.scanAgainText}>Scan Another</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <LinearGradient
        colors={theme.gradients.primary as [ColorValue, ColorValue, ...ColorValue[]]} // Corrected type for colors
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Food Scanner</Text>
        <TouchableOpacity onPress={selectFromGallery} style={styles.galleryButton}>
          <Ionicons name="images" size={24} color={theme.colors.white} />
        </TouchableOpacity>
      </LinearGradient>

      {/* Camera View */}
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
      >
        <View style={styles.cameraOverlay}>
          <View style={styles.scanFrame} />
          <Text style={styles.scanInstructions}>
            Position food item within the frame and tap capture
          </Text>
        </View>
      </CameraView>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.captureButton, isScanning && styles.capturingButton]}
          onPress={takePicture}
          disabled={isScanning || isAnalyzing}
        >
          {isScanning || isAnalyzing ? (
            <ActivityIndicator size="large" color={theme.colors.white} />
          ) : (
            <Ionicons name="camera" size={32} color={theme.colors.white} />
          )}
        </TouchableOpacity>
        {(isScanning || isAnalyzing) && (
          <Text style={styles.processingText}>
            {isScanning ? 'Capturing...' : 'Analyzing food...'}
          </Text>
        )}
      </View>
    </View>
  );
}

const NutritionItem: React.FC<{
  label: string;
  value: number;
  unit: string;
  styles: FoodScanStyles; // Pass styles as a prop
}> = ({ label, value, unit, styles }) => (
  <View style={styles.nutritionItem}>
    <Text style={styles.nutritionValue}>{value}</Text>
    <Text style={styles.nutritionUnit}>{unit}</Text>
    <Text style={styles.nutritionLabel}>{label}</Text>
  </View>
);

const getHealthScoreColor = (score: number, currentTheme: Theme): string => {
  if (score >= 8) return currentTheme.colors.success;
  if (score >= 6) return currentTheme.colors.warning;
  return currentTheme.colors.error;
};

const createStyles = (theme: Theme): FoodScanStyles => StyleSheet.create<FoodScanStyles>({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    // backgroundColor is set by LinearGradient or parent View
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.textOnPrimary, 
  },
  resetButton: {
    padding: 8,
  },
  galleryButton: {
    padding: 8,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: width * 0.8,
    height: width * 0.8,
    borderWidth: 2,
    borderColor: theme.colors.primary, 
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  scanInstructions: {
    color: theme.colors.white, 
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 40,
    fontWeight: '500',
  },
  controls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: theme.colors.white,
    shadowColor: theme.colors.shadow.light, // Corrected shadow color
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  capturingButton: {
    opacity: 0.7,
  },
  processingText: {
    color: theme.colors.white, 
    fontSize: 16,
    marginTop: 16,
    fontWeight: '500',
  },
  permissionCard: {
    margin: 20,
    padding: 30,
    alignItems: 'center',
  },
  permissionIcon: {
    marginBottom: 20,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.textPrimary, // Corrected text color
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  permissionButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  permissionButtonText: {
    color: theme.colors.white, 
    fontSize: 16,
    fontWeight: '600',
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 20, 
  },
  identificationCard: {
    marginBottom: 20,
    padding: 15,
  },
  identificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  foodName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.textPrimary, // Corrected
    flexShrink: 1, 
  },
  confidenceTag: {
    backgroundColor: theme.colors.primary + '33', 
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  confidenceText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  dietaryTag: {
    backgroundColor: theme.colors.secondary + '33', 
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  dietaryTagText: {
    color: theme.colors.secondary,
    fontSize: 12,
  },
  imageCard: {
    marginBottom: 20,
    padding: 0,
    overflow: 'hidden',
    borderRadius: 16, 
  },
  capturedImage: {
    width: '100%',
    height: 200,
    borderRadius: 16,
  },
  nutritionCard: {
    marginBottom: 20,
    padding: 20,
  },
  nutritionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  nutritionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.textPrimary, // Corrected
  },
  healthScore: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  healthScoreText: {
    color: theme.colors.white, 
    fontSize: 14,
    fontWeight: 'bold',
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  nutritionItem: {
    width: '30%', 
    alignItems: 'center',
    marginBottom: 16,
    padding: 5, 
  },
  nutritionValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  nutritionUnit: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  nutritionLabel: {
    fontSize: 14,
    color: theme.colors.textPrimary, // Corrected
    textAlign: 'center',
  },
  recommendationsCard: {
    marginBottom: 20,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.textPrimary, // Corrected
    marginLeft: 10,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  recommendationText: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    marginLeft: 8,
    flexShrink: 1,
  },
  warningsCard: {
    marginBottom: 20,
    padding: 20,
  },
  warningItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  warningText: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    marginLeft: 8,
    flexShrink: 1,
  },
  ingredientsCard: {
    marginBottom: 20,
    padding: 20,
  },
  ingredientsText: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
  allergensCard: {
    marginBottom: 20,
    padding: 20,
  },
  allergensContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  allergenTag: {
    backgroundColor: theme.colors.error + '26', 
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  allergenText: {
    color: theme.colors.error,
    fontSize: 13,
    fontWeight: '500',
  },
  actionsContainer: {
    marginTop: 10, 
    alignItems: 'center',
    paddingBottom: 20, 
  },
  scanAgainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 30,
    shadowColor: theme.colors.shadow.light, // Corrected shadow color
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  scanAgainText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});
