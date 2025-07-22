import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useThemeColor } from '@/hooks/useThemeColor';
import GeminiVisionService, { AIInsights, ImageAnalysisResult, MedicationDetails } from '@/services/GeminiVisionService';
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

interface MedicationInfoProps {
  label: string;
  value: string;
  color: string;
  warning?: boolean;
}

const MedicationInfo: React.FC<MedicationInfoProps> = ({ label, value, color, warning = false }) => (
  <View style={styles.medicationInfoItem}>
    <Text style={[styles.infoLabel, { color: warning ? '#F44336' : color }]}>{label}</Text>
    <Text style={[styles.infoValue, { color: warning ? '#F44336' : color }]}>{value}</Text>
  </View>
);

interface UrgencyIndicatorProps {
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  colorScheme: 'light' | 'dark' | null;
}

const UrgencyIndicator: React.FC<UrgencyIndicatorProps> = ({ urgencyLevel, colorScheme }) => {
  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'low': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'high': return '#F44336';
      case 'critical': return '#E91E63';
      default: return '#9E9E9E';
    }
  };

  const getUrgencyIcon = (level: string) => {
    switch (level) {
      case 'low': return 'checkmark-circle-outline';
      case 'medium': return 'warning-outline';
      case 'high': return 'alert-outline';
      case 'critical': return 'medical-outline';
      default: return 'help-circle-outline';
    }
  };

  const getUrgencyLabel = (level: string) => {
    switch (level) {
      case 'low': return 'Low Priority';
      case 'medium': return 'Medium Priority';
      case 'high': return 'High Priority - Consult Doctor';
      case 'critical': return 'URGENT - Contact Healthcare Provider';
      default: return 'Unknown';
    }
  };

  return (
    <View style={[styles.urgencyContainer, { backgroundColor: getUrgencyColor(urgencyLevel) + '20' }]}>
      <Ionicons name={getUrgencyIcon(urgencyLevel) as any} size={24} color={getUrgencyColor(urgencyLevel)} />
      <Text style={[styles.urgencyText, { color: getUrgencyColor(urgencyLevel) }]}>
        {getUrgencyLabel(urgencyLevel)}
      </Text>
    </View>
  );
};

export default function EnhancedMedicationScannerScreen() {
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
          <Ionicons name="medical-outline" size={64} color={primaryColor} />
          <Text style={[styles.permissionTitle, { color: textColor }]}>Camera Access Required</Text>
          <Text style={[styles.permissionMessage, { color: textColor }]}>
            MedLynx needs camera access to scan and identify your medications for safety information.
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
      console.log('💊 Taking picture for medication analysis...');
      
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
        skipProcessing: false,
      });

      if (photo) {
        console.log('🔍 Analyzing medication image...');
        const result = await GeminiVisionService.analyzeMedicationImage(photo.uri);
        
        setAnalysisResult(result);
        setProcessingTime(result.processingTime || 0);
        setShowCamera(false);
        
        if (result.success) {
          console.log('✅ Medication analysis completed successfully');
        } else {
          Alert.alert('Analysis Error', result.error || 'Failed to analyze medication image');
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
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        console.log('🔍 Analyzing selected medication image...');
        const analysisResult = await GeminiVisionService.analyzeMedicationImage(result.assets[0].uri);
        
        setAnalysisResult(analysisResult);
        setProcessingTime(analysisResult.processingTime || 0);
        setShowCamera(false);
        
        if (analysisResult.success) {
          console.log('✅ Medication analysis completed successfully');
        } else {
          Alert.alert('Analysis Error', analysisResult.error || 'Failed to analyze medication image');
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
            <Text style={[styles.headerTitle, { color: 'white' }]}>💊 Medication Scanner</Text>
            <Text style={[styles.headerSubtitle, { color: 'rgba(255,255,255,0.8)' }]}>
              Point camera at medication for safety information
            </Text>
          </BlurView>

          {/* Safety Notice */}
          <BlurView intensity={40} tint="dark" style={styles.safetyNotice}>
            <Ionicons name="warning-outline" size={20} color="#FFD700" />
            <Text style={styles.safetyText}>
              Always consult healthcare providers for medication decisions
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
              <Text style={styles.scanningText}>🤖 Dr. LYNX is identifying your medication...</Text>
              <Text style={styles.scanningSubtext}>Analyzing for safety information</Text>
            </BlurView>
          )}
        </CameraView>
      </View>
    );
  }

  // Results Screen
  if (analysisResult) {
    const medData = analysisResult.data?.details as MedicationDetails;
    const insights = analysisResult.data?.aiInsights as AIInsights;
    
    return (
      <ThemedView style={styles.container}>
        <ScrollView style={styles.resultsContainer} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.resultsHeader}>
            <TouchableOpacity onPress={resetScan} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={textColor} />
            </TouchableOpacity>
            <Text style={[styles.resultsTitle, { color: textColor }]}>Medication Analysis</Text>
            <View style={styles.processingTime}>
              <Text style={styles.processingTimeText}>
                ⚡ {(processingTime / 1000).toFixed(1)}s
              </Text>
            </View>
          </View>

          {analysisResult.success && medData && insights ? (
            <>
              {/* Medication Identification */}
              <View style={[styles.card, { backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#f8f9fa' }]}>
                <View style={styles.identificationHeader}>
                  <Text style={[styles.medicationName, { color: textColor }]}>{analysisResult.data?.identified}</Text>
                  <View style={styles.confidenceBadge}>
                    <Text style={[styles.confidenceText, { color: primaryColor }]}>
                      {Math.round((analysisResult.confidence || 0) * 100)}% confident
                    </Text>
                  </View>
                </View>
                <Text style={[styles.genericName, { color: textColor }]}>Generic: {medData.genericName}</Text>
                
                {/* Urgency Indicator */}
                <UrgencyIndicator urgencyLevel={insights.urgencyLevel} colorScheme={colorScheme as 'light' | 'dark' | null} />
              </View>

              {/* Basic Information */}
              <View style={[styles.card, { backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#f8f9fa' }]}>
                <Text style={[styles.sectionTitle, { color: textColor }]}>📋 Medication Information</Text>
                
                <View style={styles.infoGrid}>
                  <MedicationInfo label="Strength" value={medData.strength} color={textColor as string} />
                  <MedicationInfo label="Form" value={medData.form} color={textColor as string} />
                  <MedicationInfo label="Manufacturer" value={medData.manufacturer} color={textColor as string} />
                  <MedicationInfo 
                    label="Prescription Required" 
                    value={medData.prescriptionRequired ? 'Yes' : 'No'} 
                    color={textColor as string}
                    warning={medData.prescriptionRequired}
                  />
                </View>

                {medData.schedule && (
                  <View style={styles.scheduleContainer}>
                    <Text style={[styles.scheduleLabel, { color: '#F44336' }]}>⚠️ Controlled Substance</Text>
                    <Text style={[styles.scheduleValue, { color: '#F44336' }]}>Schedule {medData.schedule}</Text>
                  </View>
                )}
              </View>

              {/* Active Ingredients */}
              {medData.activeIngredients.length > 0 && (
                <View style={[styles.card, { backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#f8f9fa' }]}>
                  <Text style={[styles.sectionTitle, { color: textColor }]}>🧪 Active Ingredients</Text>
                  {medData.activeIngredients.map((ingredient, index) => (
                    <Text key={index} style={[styles.ingredientText, { color: textColor }]}>
                      • {ingredient}
                    </Text>
                  ))}
                </View>
              )}

              {/* Usage & Indication */}
              <View style={[styles.card, { backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#f8f9fa' }]}>
                <Text style={[styles.sectionTitle, { color: textColor }]}>🎯 Medical Use</Text>
                
                <View style={styles.usageItem}>
                  <Text style={[styles.usageLabel, { color: textColor }]}>Indication:</Text>
                  <Text style={[styles.usageText, { color: textColor }]}>{medData.indication}</Text>
                </View>

                <View style={styles.usageItem}>
                  <Text style={[styles.usageLabel, { color: textColor }]}>Dosage Instructions:</Text>
                  <Text style={[styles.usageText, { color: textColor }]}>{medData.dosageInstructions}</Text>
                </View>

                <View style={styles.usageItem}>
                  <Text style={[styles.usageLabel, { color: textColor }]}>Storage:</Text>
                  <Text style={[styles.usageText, { color: textColor }]}>{medData.storageInstructions}</Text>
                </View>
              </View>

              {/* Safety Information */}
              {(medData.sideEffects.length > 0 || medData.contraindications.length > 0 || medData.interactions.length > 0) && (
                <View style={[styles.card, styles.safetyCard]}>
                  <Text style={[styles.sectionTitle, { color: '#F44336' }]}>⚠️ Safety Information</Text>
                  
                  {medData.sideEffects.length > 0 && (
                    <View style={styles.safetySection}>
                      <Text style={styles.safetySubtitle}>Common Side Effects:</Text>
                      {medData.sideEffects.map((effect, index) => (
                        <Text key={index} style={styles.safetyMedText}>• {effect}</Text>
                      ))}
                    </View>
                  )}

                  {medData.contraindications.length > 0 && (
                    <View style={styles.safetySection}>
                      <Text style={styles.safetySubtitle}>Do NOT Use If:</Text>
                      {medData.contraindications.map((contraindication, index) => (
                        <Text key={index} style={styles.safetyMedText}>• {contraindication}</Text>
                      ))}
                    </View>
                  )}

                  {medData.interactions.length > 0 && (
                    <View style={styles.safetySection}>
                      <Text style={styles.safetySubtitle}>Drug Interactions:</Text>
                      {medData.interactions.map((interaction, index) => (
                        <Text key={index} style={styles.safetyMedText}>• {interaction}</Text>
                      ))}
                    </View>
                  )}
                </View>
              )}

              {/* Dr. LYNX Insights */}
              <View style={[styles.card, { backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#f8f9fa' }]}>
                <Text style={[styles.sectionTitle, { color: textColor }]}>🤖 Dr. LYNX Professional Insights</Text>
                
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
                    <Text style={[styles.insightLabel, { color: textColor }]}>💡 Safety Tips:</Text>
                    {insights.tips.map((tip, index) => (
                      <Text key={index} style={[styles.tipText, { color: textColor }]}>• {tip}</Text>
                    ))}
                  </View>
                )}

                {insights.followUpQuestions && insights.followUpQuestions.length > 0 && (
                  <View style={styles.insightItem}>
                    <Text style={[styles.insightLabel, { color: textColor }]}>❓ Questions for Your Doctor:</Text>
                    {insights.followUpQuestions.map((question, index) => (
                      <Text key={index} style={[styles.questionText, { color: primaryColor }]}>• {question}</Text>
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
                {analysisResult.error || 'Unable to identify the medication. Please try again with a clearer photo of the medication label or packaging.'}
              </Text>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: primaryColor }]} 
              onPress={resetScan}
            >
              <Ionicons name="camera-outline" size={20} color="white" />
              <Text style={styles.actionButtonText}>Scan Another Medication</Text>
            </TouchableOpacity>
            
            {analysisResult.success && (
              <TouchableOpacity 
                style={[styles.secondaryActionButton, { borderColor: primaryColor }]} 
                onPress={() => Alert.alert('Contact Healthcare Provider', 'This feature will help you contact your healthcare provider for medication guidance.')}
              >
                <Ionicons name="call-outline" size={20} color={primaryColor} />
                <Text style={[styles.secondaryActionButtonText, { color: primaryColor }]}>
                  Contact Healthcare Provider
                </Text>
              </TouchableOpacity>
            )}
          </View>
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
  safetyNotice: {
    position: 'absolute',
    top: 160,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    zIndex: 1,
  },
  safetyText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
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
  safetyCard: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(244, 67, 54, 0.3)',
  },
  identificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  medicationName: {
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
  genericName: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 20,
  },
  urgencyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  urgencyText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  medicationInfoItem: {
    width: '48%',
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  scheduleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(244, 67, 54, 0.3)',
  },
  scheduleLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  scheduleValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  ingredientText: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  usageItem: {
    marginBottom: 16,
  },
  usageLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  usageText: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
  safetySection: {
    marginBottom: 20,
  },
  safetySubtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F44336',
    marginBottom: 8,
  },
  safetyMedText: {
    fontSize: 14,
    color: '#F44336',
    marginBottom: 4,
    lineHeight: 18,
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
  questionText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
    fontWeight: '500',
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
  actionButtonsContainer: {
    marginTop: 20,
    marginBottom: 40,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 25,
    marginBottom: 16,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 25,
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  secondaryActionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
