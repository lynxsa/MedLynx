import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface MedicationData {
  name: string;
  genericName: string;
  dosage: string;
  manufacturer: string;
  indication: string;
  sideEffects: string[];
  dosageInstructions: string;
  warnings: string[];
  interactions: string[];
  drLynxAdvice: string;
  price?: number;
  pharmacy?: string;
}

const mockMedications: MedicationData[] = [
  {
    name: 'Panado',
    genericName: 'Paracetamol',
    dosage: '500mg',
    manufacturer: 'Adcock Ingram',
    indication: 'Pain relief and fever reduction',
    sideEffects: ['Nausea', 'Stomach upset', 'Allergic reactions (rare)'],
    dosageInstructions: 'Take 1-2 tablets every 4-6 hours as needed. Maximum 8 tablets in 24 hours.',
    warnings: ['Do not exceed recommended dose', 'Consult doctor if symptoms persist'],
    interactions: ['Warfarin', 'Alcohol'],
    drLynxAdvice: 'This is a safe and effective pain reliever when used as directed. Make sure to take with food if you have a sensitive stomach.',
    price: 25.99,
    pharmacy: 'Clicks',
  },
  {
    name: 'Betadine',
    genericName: 'Povidone Iodine',
    dosage: '10%',
    manufacturer: 'Mundipharma',
    indication: 'Antiseptic for wound care',
    sideEffects: ['Skin irritation', 'Allergic reactions'],
    dosageInstructions: 'Apply to affected area 2-3 times daily as directed.',
    warnings: ['For external use only', 'Avoid contact with eyes'],
    interactions: ['None known'],
    drLynxAdvice: 'Excellent antiseptic for minor cuts and wounds. Clean the area before application.',
    price: 89.99,
    pharmacy: 'Dis-Chem',
  },
];

const MedicationScannerScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(false);
  const [medicationData, setMedicationData] = useState<MedicationData | null>(null);
  const [scanMode, setScanMode] = useState<'camera' | 'results'>('camera');
  const [showInstructions, setShowInstructions] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    indication: true,
    dosage: true,
    sideEffects: true,
    warnings: true,
    advice: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (isScanning) return;
    
    setIsScanning(true);
    
    // Mock OCR/medication recognition
    setTimeout(() => {
      const randomMedication = mockMedications[Math.floor(Math.random() * mockMedications.length)];
      setMedicationData(randomMedication);
      setScanMode('results');
      setIsScanning(false);
    }, 2000);
  };

  const resetScan = () => {
    setMedicationData(null);
    setIsScanning(false);
    setScanMode('camera');
    setShowInstructions(true); // Reset to show instructions when going back to scan mode
    setExpandedSections({
      indication: true,
      dosage: true,
      sideEffects: true,
      warnings: true,
      advice: true,
    });
  };

  const addToMedications = () => {
    // Navigate to add medication with pre-filled data
    router.push('/add-medication');
  };

  const findInCareHub = () => {
    // Navigate to CareHub with search pre-filled
    router.push('/carehub');
  };

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionCard}>
          <Animated.View entering={FadeInUp} style={styles.permissionIcon}>
            <Ionicons name="camera-outline" size={64} color="#3726a6" />
          </Animated.View>
          <Animated.View entering={FadeInUp.delay(200)}>
            <Text style={styles.permissionTitle}>
              Camera Access Required
            </Text>
          </Animated.View>
          <Animated.View entering={FadeInUp.delay(300)}>
            <Text style={styles.permissionText}>
              We need camera access to scan medication labels and barcodes for you
            </Text>
          </Animated.View>
          <Animated.View entering={FadeInUp.delay(400)}>
            <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
              <LinearGradient
                colors={['#3726a6', '#a096e7']}
                style={styles.permissionButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.permissionButtonText}>Grant Camera Access</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    );
  }

  if (scanMode === 'results' && medicationData) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header with Close Button */}
        <View style={styles.header}>
          <TouchableOpacity onPress={resetScan} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#3726a6" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Medication Details</Text>
          <TouchableOpacity onPress={resetScan} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#3726a6" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.resultsContainer} showsVerticalScrollIndicator={false}>
          {/* Enhanced Medication Card */}
          <Animated.View entering={FadeInDown} style={styles.medicationCard}>
            <LinearGradient
              colors={['#3726a6', '#6366f1', '#a096e7']}
              style={styles.medicationHeader}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.medicationHeaderContent}>
                <View style={styles.medicationIcon}>
                  <LinearGradient
                    colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
                    style={styles.medicationIconGradient}
                  >
                    <Ionicons name="medical" size={32} color="#FFFFFF" />
                  </LinearGradient>
                </View>
                <View style={styles.medicationMainInfo}>
                  <Text style={styles.medicationName}>{medicationData.name}</Text>
                  <Text style={styles.medicationGeneric}>{medicationData.genericName}</Text>
                  <View style={styles.dosageBadge}>
                    <Text style={styles.medicationDosage}>{medicationData.dosage}</Text>
                  </View>
                </View>
                {medicationData.price && (
                  <View style={styles.priceContainer}>
                    <Text style={styles.priceLabel}>From</Text>
                    <Text style={styles.priceValue}>R{medicationData.price.toFixed(2)}</Text>
                    <Text style={styles.pricePharmacy}>{medicationData.pharmacy}</Text>
                  </View>
                )}
              </View>
            </LinearGradient>

            <View style={styles.medicationBody}>
              <View style={styles.manufacturerContainer}>
                <Ionicons name="business" size={16} color="#6B7280" />
                <Text style={styles.manufacturerText}>
                  Manufactured by {medicationData.manufacturer}
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Enhanced Information Sections */}
          <Animated.View entering={FadeInDown.delay(100)} style={styles.infoSection}>
            <TouchableOpacity 
              style={styles.sectionHeader} 
              onPress={() => toggleSection('indication')}
              activeOpacity={0.8}
            >
              <View style={styles.sectionHeaderLeft}>
                <View style={styles.sectionIconContainer}>
                  <Ionicons name="information-circle" size={18} color="#3726a6" />
                </View>
                <Text style={styles.sectionTitle}>Indication</Text>
              </View>
              <View style={styles.sectionHeaderRight}>
                <TouchableOpacity 
                  onPress={(e) => {
                    e.stopPropagation();
                    toggleSection('indication');
                  }}
                  style={styles.sectionToggle}
                >
                  <Ionicons 
                    name={expandedSections.indication ? "chevron-up" : "chevron-down"} 
                    size={16} 
                    color="#6B7280" 
                  />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={(e) => {
                    e.stopPropagation();
                    setExpandedSections(prev => ({ ...prev, indication: false }));
                  }}
                  style={styles.sectionClose}
                >
                  <Ionicons name="close" size={16} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
            {expandedSections.indication && (
              <Animated.View entering={FadeInDown.duration(300)} style={styles.sectionContentContainer}>
                <Text style={styles.sectionContent}>{medicationData.indication}</Text>
              </Animated.View>
            )}
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200)} style={styles.infoSection}>
            <TouchableOpacity 
              style={styles.sectionHeader} 
              onPress={() => toggleSection('dosage')}
              activeOpacity={0.8}
            >
              <View style={styles.sectionHeaderLeft}>
                <View style={styles.sectionIconContainer}>
                  <Ionicons name="document-text" size={18} color="#3726a6" />
                </View>
                <Text style={styles.sectionTitle}>Dosage Instructions</Text>
              </View>
              <View style={styles.sectionHeaderRight}>
                <TouchableOpacity 
                  onPress={(e) => {
                    e.stopPropagation();
                    toggleSection('dosage');
                  }}
                  style={styles.sectionToggle}
                >
                  <Ionicons 
                    name={expandedSections.dosage ? "chevron-up" : "chevron-down"} 
                    size={16} 
                    color="#6B7280" 
                  />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={(e) => {
                    e.stopPropagation();
                    setExpandedSections(prev => ({ ...prev, dosage: false }));
                  }}
                  style={styles.sectionClose}
                >
                  <Ionicons name="close" size={16} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
            {expandedSections.dosage && (
              <Animated.View entering={FadeInDown.duration(300)} style={styles.sectionContentContainer}>
                <Text style={styles.sectionContent}>{medicationData.dosageInstructions}</Text>
              </Animated.View>
            )}
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300)} style={styles.infoSection}>
            <TouchableOpacity 
              style={styles.sectionHeader} 
              onPress={() => toggleSection('sideEffects')}
              activeOpacity={0.8}
            >
              <View style={styles.sectionHeaderLeft}>
                <View style={[styles.sectionIconContainer, { backgroundColor: '#FEF2F2' }]}>
                  <Ionicons name="warning" size={18} color="#FF6B6B" />
                </View>
                <Text style={styles.sectionTitle}>Side Effects</Text>
                <View style={styles.warningBadge}>
                  <Text style={styles.warningBadgeText}>Important</Text>
                </View>
              </View>
              <View style={styles.sectionHeaderRight}>
                <TouchableOpacity 
                  onPress={(e) => {
                    e.stopPropagation();
                    toggleSection('sideEffects');
                  }}
                  style={styles.sectionToggle}
                >
                  <Ionicons 
                    name={expandedSections.sideEffects ? "chevron-up" : "chevron-down"} 
                    size={16} 
                    color="#6B7280" 
                  />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={(e) => {
                    e.stopPropagation();
                    setExpandedSections(prev => ({ ...prev, sideEffects: false }));
                  }}
                  style={styles.sectionClose}
                >
                  <Ionicons name="close" size={16} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
            {expandedSections.sideEffects && (
              <Animated.View entering={FadeInDown.duration(300)} style={styles.sectionContentContainer}>
                <View style={styles.listContainer}>
                  {medicationData.sideEffects.map((effect, index) => (
                    <View key={index} style={styles.enhancedListItem}>
                      <View style={[styles.listBullet, { backgroundColor: '#FF6B6B' }]} />
                      <Text style={styles.listText}>{effect}</Text>
                    </View>
                  ))}
                </View>
              </Animated.View>
            )}
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400)} style={styles.infoSection}>
            <TouchableOpacity 
              style={styles.sectionHeader} 
              onPress={() => toggleSection('warnings')}
              activeOpacity={0.8}
            >
              <View style={styles.sectionHeaderLeft}>
                <View style={[styles.sectionIconContainer, { backgroundColor: '#FFFBEB' }]}>
                  <Ionicons name="alert-circle" size={18} color="#FF9500" />
                </View>
                <Text style={styles.sectionTitle}>Warnings</Text>
                <View style={[styles.warningBadge, { backgroundColor: '#FF9500' }]}>
                  <Text style={styles.warningBadgeText}>Critical</Text>
                </View>
              </View>
              <View style={styles.sectionHeaderRight}>
                <TouchableOpacity 
                  onPress={(e) => {
                    e.stopPropagation();
                    toggleSection('warnings');
                  }}
                  style={styles.sectionToggle}
                >
                  <Ionicons 
                    name={expandedSections.warnings ? "chevron-up" : "chevron-down"} 
                    size={16} 
                    color="#6B7280" 
                  />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={(e) => {
                    e.stopPropagation();
                    setExpandedSections(prev => ({ ...prev, warnings: false }));
                  }}
                  style={styles.sectionClose}
                >
                  <Ionicons name="close" size={16} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
            {expandedSections.warnings && (
              <Animated.View entering={FadeInDown.duration(300)} style={styles.sectionContentContainer}>
                <View style={styles.listContainer}>
                  {medicationData.warnings.map((warning, index) => (
                    <View key={index} style={styles.enhancedListItem}>
                      <View style={[styles.listBullet, { backgroundColor: '#FF9500' }]} />
                      <Text style={styles.listText}>{warning}</Text>
                    </View>
                  ))}
                </View>
              </Animated.View>
            )}
          </Animated.View>

          {/* Enhanced Dr. LYNX Advice */}
          {expandedSections.advice && (
            <Animated.View entering={FadeInDown.delay(500)} style={styles.adviceCard}>
              <LinearGradient
                colors={['#DF73FF', '#8B5CF6', '#E0B0FF']}
                style={styles.adviceGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.adviceHeader}>
                  <View style={styles.adviceHeaderLeft}>
                    <View style={styles.adviceIconContainer}>
                      <Ionicons name="chatbubbles" size={22} color="#FFFFFF" />
                    </View>
                    <Text style={styles.adviceTitle}>Dr. LYNX AI Advice</Text>
                    <View style={styles.aiBadge}>
                      <Text style={styles.aiBadgeText}>AI</Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    onPress={() => setExpandedSections(prev => ({ ...prev, advice: false }))}
                    style={styles.adviceClose}
                  >
                    <Ionicons name="close" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.adviceText}>{medicationData.drLynxAdvice}</Text>
                <View style={styles.adviceFooter}>
                  <Ionicons name="sparkles" size={14} color="#FFFFFF" />
                  <Text style={styles.adviceFooterText}>Powered by Advanced AI</Text>
                </View>
              </LinearGradient>
            </Animated.View>
          )}

          {/* Quick Actions */}
          <Animated.View entering={FadeInDown.delay(550)} style={styles.quickActionsContainer}>
            <TouchableOpacity 
              style={styles.showAllButton}
              onPress={() => setExpandedSections({
                indication: true,
                dosage: true,
                sideEffects: true,
                warnings: true,
                advice: true,
              })}
            >
              <Ionicons name="eye" size={16} color="#3726a6" />
              <Text style={styles.showAllButtonText}>Show All</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.hideAllButton}
              onPress={() => setExpandedSections({
                indication: false,
                dosage: false,
                sideEffects: false,
                warnings: false,
                advice: false,
              })}
            >
              <Ionicons name="eye-off" size={16} color="#6B7280" />
              <Text style={styles.hideAllButtonText}>Hide All</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Action Buttons */}
          <Animated.View entering={FadeInDown.delay(600)} style={styles.actionsContainer}>
            <TouchableOpacity style={styles.actionButton} onPress={addToMedications}>
              <LinearGradient
                colors={['#3726a6', '#a096e7']}
                style={styles.actionButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="add-circle" size={20} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Add to My Medications</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButtonSecondary} onPress={findInCareHub}>
              <View style={styles.actionButtonSecondaryContent}>
                <Ionicons name="storefront" size={20} color="#3726a6" />
                <Text style={styles.actionButtonSecondaryText}>Find in CareHub</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={require('../../assets/images/MedLynx-11.jpeg')}
          style={styles.headerBackgroundImage}
        />
        <LinearGradient
          colors={['rgba(124, 58, 237, 0.8)', 'rgba(139, 92, 246, 0.8)']}
          style={styles.headerOverlay}
        >
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitleLight}>MedScan</Text>
          <TouchableOpacity 
            style={styles.helpButton}
            onPress={() => setShowInstructions(!showInstructions)}
          >
            <Ionicons name={showInstructions ? "eye-off-outline" : "help-circle-outline"} size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </LinearGradient>
      </View>

      {/* Camera View */}
      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          onBarcodeScanned={handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['qr', 'pdf417', 'ean13', 'ean8', 'code128'],
          }}
        >
          <View style={styles.overlay}>
            <View style={styles.scanFrame}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
              
              {isScanning && (
                <View style={styles.scanningIndicator}>
                  <ActivityIndicator size="large" color="#FFFFFF" />
                  <Text style={styles.scanningText}>Analyzing medication...</Text>
                </View>
              )}
            </View>
          </View>
        </CameraView>
      </View>

      {/* Comprehensive Instructions Card - Only at bottom */}
      {showInstructions && (
        <Animated.View 
          entering={FadeInUp}
          style={styles.comprehensiveInstructionsCard}
        >
          <View style={styles.instructionsHeader}>
            <View style={styles.instructionsHeaderLeft}>
              <View style={styles.scanIconContainer}>
                <Ionicons name="scan" size={20} color="#3726a6" />
              </View>
              <Text style={styles.instructionsCardTitle}>MedScan - Smart Medication Recognition</Text>
            </View>
            <TouchableOpacity 
              onPress={() => setShowInstructions(false)}
              style={styles.closeInstructionsButton}
            >
              <Ionicons name="close" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.instructionsDescription}>
            Point your camera at medication labels, barcodes, or pill bottles to get instant AI-powered insights.
          </Text>
          
          <View style={styles.quickStepsContainer}>
            <View style={styles.quickStep}>
              <View style={styles.quickStepIcon}>
                <Text style={styles.quickStepNumber}>1</Text>
              </View>
              <Text style={styles.quickStepText}>Aim camera at medication</Text>
            </View>
            <View style={styles.quickStep}>
              <View style={styles.quickStepIcon}>
                <Text style={styles.quickStepNumber}>2</Text>
              </View>
              <Text style={styles.quickStepText}>Hold steady for analysis</Text>
            </View>
            <View style={styles.quickStep}>
              <View style={styles.quickStepIcon}>
                <Text style={styles.quickStepNumber}>3</Text>
              </View>
              <Text style={styles.quickStepText}>Get instant information</Text>
            </View>
          </View>
          
          <View style={styles.featuresGrid}>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              <Text style={styles.featureText}>Barcode scanning</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              <Text style={styles.featureText}>Drug interactions</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              <Text style={styles.featureText}>AI medical advice</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              <Text style={styles.featureText}>Side effects info</Text>
            </View>
          </View>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    position: 'relative',
    overflow: 'hidden',
  },
  headerBackgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  headerTitleLight: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  helpButton: {
    padding: 8,
  },
  permissionCard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 40,
  },
  permissionIcon: {
    marginBottom: 24,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 16,
  },
  permissionText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  permissionButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  permissionButtonGradient: {
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cameraContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  scanFrame: {
    width: 250,
    height: 250,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: '#FFFFFF',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  scanningIndicator: {
    alignItems: 'center',
  },
  scanningText: {
    color: '#FFFFFF',
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
  },
  instructionsContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: 200,
  },
  instructionsTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  instructionStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepNumber: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#3726a6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  stepText: {
    flex: 1,
    fontSize: 12,
    color: '#666666',
    lineHeight: 16,
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 20,
  },
  medicationCard: {
    borderRadius: 16,
    marginBottom: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  medicationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  medicationIcon: {
    marginRight: 16,
  },
  medicationMainInfo: {
    flex: 1,
  },
  medicationName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  medicationGeneric: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 2,
  },
  medicationDosage: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
  },
  priceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  pricePharmacy: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
  },
  medicationBody: {
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  manufacturerText: {
    fontSize: 12,
    color: '#666666',
    fontStyle: 'italic',
  },
  infoSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginLeft: 8,
  },
  sectionContent: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  listContainer: {
    marginTop: 4,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  listBullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#3726a6',
    marginTop: 8,
    marginRight: 12,
  },
  listText: {
    flex: 1,
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  adviceCard: {
    borderRadius: 16,
    marginBottom: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  adviceGradient: {
    padding: 20,
  },
  adviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  adviceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  adviceText: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
    opacity: 0.95,
  },
  actionsContainer: {
    marginBottom: 24,
  },
  actionButton: {
    borderRadius: 25,
    overflow: 'hidden',
    marginBottom: 12,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  actionButtonSecondary: {
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#3726a6',
    overflow: 'hidden',
  },
  actionButtonSecondaryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  actionButtonSecondaryText: {
    color: '#3726a6',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  featureDescription: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  descriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3726a6',
    marginLeft: 8,
  },
  descriptionText: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 12,
  },
  capabilitiesContainer: {
    flexDirection: 'column',
    gap: 6,
  },
  capability: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  capabilityText: {
    fontSize: 12,
    color: '#10B981',
    marginLeft: 6,
    fontWeight: '500',
  },
  // Enhanced card styles
  closeButton: {
    padding: 8,
  },
  medicationHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  medicationIconGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dosageBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  manufacturerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  // Enhanced section styles
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionToggle: {
    padding: 8,
    marginRight: 4,
  },
  sectionClose: {
    padding: 8,
  },
  sectionContentContainer: {
    paddingTop: 8,
  },
  warningBadge: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  warningBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  enhancedListItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingVertical: 4,
  },
  // Enhanced advice styles
  adviceHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  adviceIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  aiBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  aiBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  adviceClose: {
    padding: 4,
  },
  adviceFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    opacity: 0.8,
  },
  adviceFooterText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginLeft: 4,
    fontStyle: 'italic',
  },
  // Quick actions styles
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 16,
    gap: 12,
  },
  showAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#3726a6',
  },
  showAllButtonText: {
    color: '#3726a6',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  hideAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  hideAllButtonText: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },

  // Comprehensive instructions card styles
  comprehensiveInstructionsCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
    maxHeight: '50%',
  },
  instructionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  instructionsHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  scanIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  instructionsCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  closeInstructionsButton: {
    padding: 4,
  },
  instructionsDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  quickStepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  quickStep: {
    alignItems: 'center',
    flex: 1,
  },
  quickStepIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3726a6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  quickStepNumber: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  quickStepText: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 14,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 4,
  },
  featureText: {
    fontSize: 12,
    color: '#374151',
    marginLeft: 6,
    fontWeight: '500',
  },
});

export default MedicationScannerScreen;
