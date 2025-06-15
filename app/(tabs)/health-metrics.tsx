import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Alert,
  // Dimensions, // Removed unused import
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
// import { useTranslation } from 'react-i18next'; // Commented out as unused
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../contexts/ThemeContext';
import { useThemedStyles } from '../../hooks/useThemedStyles';

// Removed unused width constant

interface BMIReading {
  id: string;
  bmi: number;
  category: string;
  height: number;
  weight: number;
  date: Date;
}

interface HealthMetric {
  id: string;
  type: 'bloodPressure' | 'bloodSugar' | 'heartRate';
  value: string;
  date: Date;
  notes?: string;
}

export default function HealthMetricsScreen() {
  const { theme, isDark } = useTheme();
  const styles = useThemedStyles(createStyles);
  const insets = useSafeAreaInsets();
  // const { t } = useTranslation(['common', 'health']); // Commented out as unused
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [heightUnit, setHeightUnit] = useState<'cm' | 'ft'>('cm');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');
  const [currentBMI, setCurrentBMI] = useState<number | null>(null);
  const [bmiCategory, setBMICategory] = useState<string>('');
  const [bmiHistory, setBMIHistory] = useState<BMIReading[]>([]);
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]); // Restored as it's used in loadHealthMetrics
  // const [showAddMetric, setShowAddMetric] = useState(false); // Commented out as unused

  useEffect(() => {
    loadBMIHistory();
    loadHealthMetrics();
  }, []);

  const loadBMIHistory = async () => {
    try {
      const stored = await AsyncStorage.getItem('bmiHistory');
      if (stored) {
        const history = JSON.parse(stored);
        setBMIHistory(history.map((reading: any) => ({
          ...reading,
          date: new Date(reading.date)
        })));
      }
    } catch (error) {
      console.error('Error loading BMI history:', error);
    }
  };

  const loadHealthMetrics = async () => {
    try {
      const stored = await AsyncStorage.getItem('healthMetrics');
      if (stored) {
        const metrics = JSON.parse(stored);
        setHealthMetrics(metrics.map((metric: any) => ({
          ...metric,
          date: new Date(metric.date)
        })));
      }
    } catch (error) {
      console.error('Error loading health metrics:', error);
    }
  };

  const saveBMIReading = async (reading: BMIReading) => {
    try {
      const updatedHistory = [reading, ...bmiHistory].slice(0, 10); // Keep last 10 readings
      setBMIHistory(updatedHistory);
      await AsyncStorage.setItem('bmiHistory', JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Error saving BMI reading:', error);
    }
  };

  const calculateBMI = () => {
    const heightValue = parseFloat(height);
    const weightValue = parseFloat(weight);

    if (!heightValue || !weightValue || heightValue <= 0 || weightValue <= 0) {
      Alert.alert('Error', 'Please enter valid height and weight values');
      return;
    }

    // Convert to metric if needed
    let heightInMeters = heightValue;
    let weightInKg = weightValue;

    if (heightUnit === 'ft') {
      heightInMeters = heightValue * 0.3048; // feet to meters
    } else {
      heightInMeters = heightValue / 100; // cm to meters
    }

    if (weightUnit === 'lbs') {
      weightInKg = weightValue * 0.453592; // lbs to kg
    }

    const bmi = weightInKg / (heightInMeters * heightInMeters);
    const category = getBMICategory(bmi);

    setCurrentBMI(parseFloat(bmi.toFixed(1)));
    setBMICategory(category);

    // Save reading
    const reading: BMIReading = {
      id: Date.now().toString(),
      bmi: parseFloat(bmi.toFixed(1)),
      category,
      height: heightUnit === 'cm' ? heightValue : heightValue * 30.48,
      weight: weightUnit === 'kg' ? weightValue : weightValue * 0.453592,
      date: new Date(),
    };

    saveBMIReading(reading);
  };

  const getBMICategory = (bmi: number): string => {
    if (bmi < 18.5) return 'Underweight';
    if (bmi >= 18.5 && bmi < 25) return 'Normal Weight';
    if (bmi >= 25 && bmi < 30) return 'Overweight';
    return 'Obese';
  };

  const getBMICategoryColor = (category: string) => {
    switch (category) {
      case 'Underweight':
        return theme.colors.info;
      case 'Normal Weight':
        return theme.colors.success;
      case 'Overweight':
        return theme.colors.warning;
      case 'Obese':
        return theme.colors.error;
      default:
        return theme.colors.textSecondary;
    }
  };

  const getBMIAdvice = (category: string) => {
    switch (category) {
      case 'Underweight':
        return 'Consider consulting a healthcare provider about healthy weight gain strategies. Focus on nutrient-rich foods and strength training.';
      case 'Normal Weight':
        return 'Great job! Maintain your healthy weight through balanced nutrition and regular physical activity.';
      case 'Overweight':
        return 'Consider gradual weight loss through a combination of healthy eating and increased physical activity. Consult a healthcare provider for guidance.';
      case 'Obese':
        return 'It\'s recommended to consult with a healthcare provider for a comprehensive weight management plan that includes diet, exercise, and possibly medical support.';
      default:
        return '';
    }
  };

  const renderBMIResult = () => {
    if (!currentBMI) return null;

    return (
      <View style={styles.resultContainer}>
        <View style={styles.bmiResult}>
          <Text style={styles.bmiTitle}>Your BMI</Text>
          <Text style={styles.bmiValue}>{currentBMI}</Text>
          <View style={[styles.categoryBadge, { backgroundColor: getBMICategoryColor(bmiCategory) }]}>
            <Text style={styles.categoryText}>{bmiCategory}</Text>
          </View>
        </View>

        <View style={styles.bmiAdvice}>
          <Text style={styles.adviceTitle}>Recommendation</Text>
          <Text style={styles.adviceText}>{getBMIAdvice(bmiCategory)}</Text>
        </View>

        <View style={styles.bmiScale}>
          <Text style={styles.scaleTitle}>BMI Scale</Text>
          <View style={styles.scaleItems}>
            <View style={styles.scaleItem}>
              <View style={[styles.scaleColor, { backgroundColor: theme.colors.info }]} />
              <Text style={styles.scaleText}>Under 18.5 - Underweight</Text>
            </View>
            <View style={styles.scaleItem}>
              <View style={[styles.scaleColor, { backgroundColor: theme.colors.success }]} />
              <Text style={styles.scaleText}>18.5-24.9 - Normal</Text>
            </View>
            <View style={styles.scaleItem}>
              <View style={[styles.scaleColor, { backgroundColor: theme.colors.warning }]} />
              <Text style={styles.scaleText}>25.0-29.9 - Overweight</Text>
            </View>
            <View style={styles.scaleItem}>
              <View style={[styles.scaleColor, { backgroundColor: theme.colors.error }]} />
              <Text style={styles.scaleText}>30.0+ - Obese</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderBMIHistory = () => {
    if (bmiHistory.length === 0) return null;

    return (
      <View style={styles.historyContainer}>
        <Text style={styles.historyTitle}>BMI History</Text>
        {bmiHistory.slice(0, 5).map((reading) => (
          <View key={reading.id} style={styles.historyItem}>
            <View style={styles.historyInfo}>
              <Text style={styles.historyBMI}>{reading.bmi}</Text>
              <Text style={styles.historyCategory}>{reading.category}</Text>
              <Text style={styles.historyDate}>
                {reading.date.toLocaleDateString()}
              </Text>
            </View>
            <View style={[
              styles.historyIndicator,
              { backgroundColor: getBMICategoryColor(reading.category) }
            ]} />
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar 
        barStyle={isDark ? "light-content" : "dark-content"} 
        backgroundColor={theme.colors.primary} 
      />
      <LinearGradient 
        colors={theme.gradients.primary as any} 
        style={[styles.header, { paddingTop: insets.top }]}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.textOnPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Health Metrics</Text>
          <View style={styles.headerSpacer} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* BMI Calculator */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="fitness-outline" size={24} color={theme.colors.primary} />
            <Text style={styles.sectionTitle}>BMI Calculator</Text>
          </View>

          {/* Height Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Height</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.textInput, { flex: 1 }]}
                value={height}
                onChangeText={setHeight}
                placeholder={heightUnit === 'cm' ? '170' : '5.6'}
                keyboardType="numeric"
                placeholderTextColor={theme.colors.textSecondary}
              />
              <View style={styles.unitSelector}>
                <TouchableOpacity
                  style={[
                    styles.unitButton,
                    heightUnit === 'cm' && styles.activeUnitButton
                  ]}
                  onPress={() => setHeightUnit('cm')}
                >
                  <Text style={[
                    styles.unitText,
                    heightUnit === 'cm' && styles.activeUnitText
                  ]}>cm</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.unitButton,
                    heightUnit === 'ft' && styles.activeUnitButton
                  ]}
                  onPress={() => setHeightUnit('ft')}
                >
                  <Text style={[
                    styles.unitText,
                    heightUnit === 'ft' && styles.activeUnitText
                  ]}>ft</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Weight Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Weight</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.textInput, { flex: 1 }]}
                value={weight}
                onChangeText={setWeight}
                placeholder={weightUnit === 'kg' ? '70' : '154'}
                keyboardType="numeric"
                placeholderTextColor={theme.colors.textSecondary}
              />
              <View style={styles.unitSelector}>
                <TouchableOpacity
                  style={[
                    styles.unitButton,
                    weightUnit === 'kg' && styles.activeUnitButton
                  ]}
                  onPress={() => setWeightUnit('kg')}
                >
                  <Text style={[
                    styles.unitText,
                    weightUnit === 'kg' && styles.activeUnitText
                  ]}>kg</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.unitButton,
                    weightUnit === 'lbs' && styles.activeUnitButton
                  ]}
                  onPress={() => setWeightUnit('lbs')}
                >
                  <Text style={[
                    styles.unitText,
                    weightUnit === 'lbs' && styles.activeUnitText
                  ]}>lbs</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Calculate Button */}
          <TouchableOpacity style={styles.calculateButton} onPress={calculateBMI}>
            <Text style={styles.calculateButtonText}>Calculate BMI</Text>
          </TouchableOpacity>

          {/* BMI Result */}
          {renderBMIResult()}
        </View>

        {/* BMI History */}
        {renderBMIHistory()}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textOnPrimary,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 32,
  },
  content: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  section: {
    backgroundColor: theme.colors.card,
    margin: 20,
    borderRadius: 12,
    padding: 20,
    ...theme.shadows.medium,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  textInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
  },
  unitSelector: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    overflow: 'hidden',
  },
  unitButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: theme.colors.surface,
  },
  activeUnitButton: {
    backgroundColor: theme.colors.primary,
  },
  unitText: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '500',
  },
  activeUnitText: {
    color: theme.colors.textOnPrimary,
  },
  calculateButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  calculateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textOnPrimary,
  },
  resultContainer: {
    marginTop: 20,
    padding: 20,
    backgroundColor: theme.colors.primarySurface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  bmiResult: {
    alignItems: 'center',
    marginBottom: 20,
  },
  bmiTitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  bmiValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 12,
  },
  categoryBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textOnPrimary,
  },
  bmiAdvice: {
    marginBottom: 20,
  },
  adviceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  adviceText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  bmiScale: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: 16,
  },
  scaleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 12,
  },
  scaleItems: {
    gap: 8,
  },
  scaleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  scaleColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  scaleText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  historyContainer: {
    backgroundColor: theme.colors.card,
    margin: 20,
    marginTop: 0,
    borderRadius: 12,
    padding: 20,
    ...theme.shadows.medium,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 16,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  historyInfo: {
    flex: 1,
  },
  historyBMI: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  historyCategory: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  historyDate: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  historyIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  bottomPadding: {
    height: 80,
  },
});
