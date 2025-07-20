import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import * as React from 'react';
import {
    ActivityIndicator,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';

const { width } = Dimensions.get('window');

// Mock medication data structure
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
}

export default function MedicationScannerScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = React.useState(false);
  const [medicationData, setMedicationData] = React.useState<MedicationData | null>(null);

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (isScanning) return;
    
    setIsScanning(true);
    
    // Mock OCR/medication recognition
    setTimeout(() => {
      const mockMedication: MedicationData = {
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
      };
      
      setMedicationData(mockMedication);
      setIsScanning(false);
    }, 2000);
  };

  const resetScan = () => {
    setMedicationData(null);
    setIsScanning(false);
  };

  if (!permission) {
    return React.createElement(View, { style: styles.container });
  }

  if (!permission.granted) {
    return React.createElement(
      View,
      { style: [styles.container, { backgroundColor: theme.colors.background }] },
      React.createElement(
        View,
        { style: styles.permissionCard },
        React.createElement(
          Text,
          { style: [styles.permissionTitle, { color: theme.colors.textPrimary }] },
          'Camera Permission Required'
        ),
        React.createElement(
          Text,
          { style: [styles.permissionText, { color: theme.colors.textSecondary }] },
          'We need access to your camera to scan medication labels'
        ),
        React.createElement(
          TouchableOpacity,
          {
            style: [styles.permissionButton, { backgroundColor: theme.colors.primary }],
            onPress: requestPermission,
          },
          React.createElement(
            Text,
            { style: [styles.permissionButtonText, { color: theme.colors.white }] },
            'Grant Permission'
          )
        )
      )
    );
  }

  if (medicationData) {
    return React.createElement(
      View,
      { style: [styles.container, { backgroundColor: theme.colors.background }] },
      React.createElement(
        View,
        { style: [styles.header, { paddingTop: insets.top }] },
        React.createElement(
          TouchableOpacity,
          {
            style: styles.backButton,
            onPress: () => router.back(),
          },
          React.createElement(Ionicons, { name: 'arrow-back', size: 24, color: theme.colors.textPrimary })
        ),
        React.createElement(
          Text,
          { style: [styles.headerTitle, { color: theme.colors.textPrimary }] },
          'Medication Details'
        ),
        React.createElement(
          TouchableOpacity,
          {
            style: [styles.resetButton, { backgroundColor: theme.colors.primary }],
            onPress: resetScan,
          },
          React.createElement(
            Text,
            { style: { color: theme.colors.white, fontSize: 14 } },
            'Scan Again'
          )
        )
      ),
      React.createElement(
        ScrollView,
        { style: styles.resultsContainer },
        React.createElement(
          View,
          { style: [styles.medicationCard, { backgroundColor: theme.colors.surface }] },
          React.createElement(
            Text,
            { style: [styles.medicationName, { color: theme.colors.textPrimary }] },
            medicationData.name
          ),
          React.createElement(
            Text,
            { style: [styles.genericName, { color: theme.colors.textSecondary }] },
            `Generic: ${medicationData.genericName}`
          ),
          React.createElement(
            Text,
            { style: [styles.dosage, { color: theme.colors.primary }] },
            medicationData.dosage
          )
        ),
        React.createElement(
          View,
          { style: [styles.drLynxCard, { backgroundColor: theme.colors.primaryLight }] },
          React.createElement(
            View,
            { style: styles.drLynxHeader },
            React.createElement(Ionicons, { name: 'medical', size: 24, color: theme.colors.primary }),
            React.createElement(
              Text,
              { style: [styles.drLynxTitle, { color: theme.colors.primary }] },
              'Dr. LYNX Advice'
            )
          ),
          React.createElement(
            Text,
            { style: [styles.drLynxText, { color: theme.colors.textPrimary }] },
            medicationData.drLynxAdvice
          )
        ),
        React.createElement(
          View,
          { style: [styles.infoCard, { backgroundColor: theme.colors.surface }] },
          React.createElement(
            Text,
            { style: [styles.sectionTitle, { color: theme.colors.textPrimary }] },
            'Dosage Instructions'
          ),
          React.createElement(
            Text,
            { style: [styles.infoText, { color: theme.colors.textSecondary }] },
            medicationData.dosageInstructions
          )
        )
      )
    );
  }

  return React.createElement(
    View,
    { style: [styles.container, { backgroundColor: theme.colors.background }] },
    React.createElement(
      View,
      { style: [styles.header, { paddingTop: insets.top }] },
      React.createElement(
        TouchableOpacity,
        {
          style: styles.backButton,
          onPress: () => router.back(),
        },
        React.createElement(Ionicons, { name: 'arrow-back', size: 24, color: theme.colors.textPrimary })
      ),
      React.createElement(
        Text,
        { style: [styles.headerTitle, { color: theme.colors.textPrimary }] },
        'Scan Medication'
      )
    ),
    React.createElement(
      CameraView,
      {
        style: styles.camera,
        facing: 'back',
        onBarcodeScanned: handleBarCodeScanned,
        barcodeScannerSettings: {
          barcodeTypes: ['qr', 'pdf417'],
        },
      },
      React.createElement(
        View,
        { style: styles.cameraOverlay },
        React.createElement(
          View,
          { style: [styles.scanFrame, { borderColor: theme.colors.primary }] }
        ),
        React.createElement(
          Text,
          { style: [styles.scanInstructions, { color: theme.colors.white }] },
          'Point camera at medication label or barcode'
        ),
        isScanning && React.createElement(
          View,
          { style: styles.processingContainer },
          React.createElement(ActivityIndicator, { size: 'large', color: theme.colors.primary }),
          React.createElement(
            Text,
            { style: [styles.processingText, { color: theme.colors.white }] },
            'Analyzing medication...'
          )
        )
      )
    )
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  resetButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  scanFrame: {
    width: width - 80,
    height: 200,
    borderWidth: 2,
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  scanInstructions: {
    marginTop: 20,
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  processingContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  processingText: {
    marginTop: 12,
    fontSize: 16,
  },
  permissionCard: {
    margin: 20,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  permissionText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  permissionButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  resultsContainer: {
    flex: 1,
    padding: 20,
  },
  medicationCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  medicationName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  genericName: {
    fontSize: 16,
    marginBottom: 8,
  },
  dosage: {
    fontSize: 18,
    fontWeight: '600',
  },
  drLynxCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  drLynxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  drLynxTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  drLynxText: {
    fontSize: 16,
    lineHeight: 24,
  },
  infoCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 16,
    lineHeight: 24,
  },
});
