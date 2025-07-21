import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';

export default function UnderstandingBloodPressureScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const colors = theme.colors;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={['#DC2626', '#EF4444']}
        style={[styles.header, { paddingTop: insets.top }]}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.category}>Cardiovascular Health</Text>
            <Text style={styles.readTime}>3 min read</Text>
          </View>
        </View>
        
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Understanding Blood Pressure</Text>
          <Text style={styles.subtitle}>Learn how to monitor and maintain healthy blood pressure levels</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.imageContainer}>
          <Image
            source={require('../../assets/images/MedLynx-11.jpeg')}
            style={styles.heroImage}
            resizeMode="cover"
          />
        </View>

        {/* Article Content */}
        <View style={styles.articleContainer}>
          {/* Introduction */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>What is Blood Pressure?</Text>
            <Text style={[styles.paragraph, { color: colors.textPrimarySecondary }]}>
              Blood pressure is the force exerted by your blood against the walls of your arteries as your heart pumps blood throughout your body. It&apos;s measured using two numbers: systolic pressure (when your heart beats) and diastolic pressure (when your heart rests between beats).
            </Text>
          </View>

          {/* Normal Ranges */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Understanding the Numbers</Text>
            
            <View style={[styles.infoCard, { backgroundColor: colors.surface }]}>
              <View style={styles.rangeItem}>
                <View style={[styles.rangeIndicator, { backgroundColor: '#10B981' }]} />
                <View style={styles.rangeInfo}>
                  <Text style={[styles.rangeTitle, { color: colors.textPrimary }]}>Normal</Text>
                  <Text style={[styles.rangeValue, { color: colors.textPrimarySecondary }]}>Less than 120/80 mmHg</Text>
                </View>
              </View>
              
              <View style={styles.rangeItem}>
                <View style={[styles.rangeIndicator, { backgroundColor: '#F59E0B' }]} />
                <View style={styles.rangeInfo}>
                  <Text style={[styles.rangeTitle, { color: colors.textPrimary }]}>Elevated</Text>
                  <Text style={[styles.rangeValue, { color: colors.textPrimarySecondary }]}>120-129 systolic, less than 80 diastolic</Text>
                </View>
              </View>
              
              <View style={styles.rangeItem}>
                <View style={[styles.rangeIndicator, { backgroundColor: '#EF4444' }]} />
                <View style={styles.rangeInfo}>
                  <Text style={[styles.rangeTitle, { color: colors.textPrimary }]}>High Blood Pressure Stage 1</Text>
                  <Text style={[styles.rangeValue, { color: colors.textPrimarySecondary }]}>130-139/80-89 mmHg</Text>
                </View>
              </View>
              
              <View style={styles.rangeItem}>
                <View style={[styles.rangeIndicator, { backgroundColor: '#DC2626' }]} />
                <View style={styles.rangeInfo}>
                  <Text style={[styles.rangeTitle, { color: colors.textPrimary }]}>High Blood Pressure Stage 2</Text>
                  <Text style={[styles.rangeValue, { color: colors.textPrimarySecondary }]}>140/90 mmHg or higher</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Monitoring Tips */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>How to Monitor Your Blood Pressure</Text>
            
            <View style={styles.tipsList}>
              <View style={styles.tipItem}>
                <View style={[styles.tipIcon, { backgroundColor: '#EF4444' }]}>
                  <Ionicons name="time" size={20} color="white" />
                </View>
                <View style={styles.tipContent}>
                  <Text style={[styles.tipTitle, { color: colors.textPrimary }]}>Best Times to Measure</Text>
                  <Text style={[styles.tipDescription, { color: colors.textPrimarySecondary }]}>
                    Take readings at the same times each day, ideally in the morning before medication and in the evening.
                  </Text>
                </View>
              </View>

              <View style={styles.tipItem}>
                <View style={[styles.tipIcon, { backgroundColor: '#EF4444' }]}>
                  <Ionicons name="body" size={20} color="white" />
                </View>
                <View style={styles.tipContent}>
                  <Text style={[styles.tipTitle, { color: colors.textPrimary }]}>Proper Positioning</Text>
                  <Text style={[styles.tipDescription, { color: colors.textPrimarySecondary }]}>
                    Sit with your back straight, feet flat on the floor, and arm supported at heart level.
                  </Text>
                </View>
              </View>

              <View style={styles.tipItem}>
                <View style={[styles.tipIcon, { backgroundColor: '#EF4444' }]}>
                  <Ionicons name="cafe" size={20} color="white" />
                </View>
                <View style={styles.tipContent}>
                  <Text style={[styles.tipTitle, { color: colors.textPrimary }]}>Before You Measure</Text>
                  <Text style={[styles.tipDescription, { color: colors.textPrimarySecondary }]}>
                    Avoid caffeine, exercise, and smoking for at least 30 minutes before taking a reading.
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Lifestyle Tips */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Maintaining Healthy Blood Pressure</Text>
            <Text style={[styles.paragraph, { color: colors.textPrimarySecondary }]}>
              Here are evidence-based strategies to help maintain healthy blood pressure levels:
            </Text>
            
            <View style={styles.lifestyleGrid}>
              <View style={[styles.lifestyleCard, { backgroundColor: colors.surface }]}>
                <Ionicons name="restaurant" size={24} color="#10B981" />
                <Text style={[styles.lifestyleTitle, { color: colors.textPrimary }]}>Healthy Diet</Text>
                <Text style={[styles.lifestyleText, { color: colors.textPrimarySecondary }]}>
                  Reduce sodium, increase fruits and vegetables, choose whole grains
                </Text>
              </View>

              <View style={[styles.lifestyleCard, { backgroundColor: colors.surface }]}>
                <Ionicons name="fitness" size={24} color="#3B82F6" />
                <Text style={[styles.lifestyleTitle, { color: colors.textPrimary }]}>Regular Exercise</Text>
                <Text style={[styles.lifestyleText, { color: colors.textPrimarySecondary }]}>
                  Aim for 150 minutes of moderate aerobic activity per week
                </Text>
              </View>

              <View style={[styles.lifestyleCard, { backgroundColor: colors.surface }]}>
                <Ionicons name="scale" size={24} color="#8B5CF6" />
                <Text style={[styles.lifestyleTitle, { color: colors.textPrimary }]}>Healthy Weight</Text>
                <Text style={[styles.lifestyleText, { color: colors.textPrimarySecondary }]}>
                  Maintain a healthy BMI through balanced nutrition and activity
                </Text>
              </View>

              <View style={[styles.lifestyleCard, { backgroundColor: colors.surface }]}>
                <Ionicons name="ban" size={24} color="#EF4444" />
                <Text style={[styles.lifestyleTitle, { color: colors.textPrimary }]}>Limit Alcohol</Text>
                <Text style={[styles.lifestyleText, { color: colors.textPrimarySecondary }]}>
                  No more than 1-2 drinks per day for men, 1 drink for women
                </Text>
              </View>
            </View>
          </View>

          {/* When to See a Doctor */}
          <View style={styles.section}>
            <View style={[styles.warningCard, { backgroundColor: '#FEF2F2', borderColor: '#EF4444' }]}>
              <View style={styles.warningHeader}>
                <Ionicons name="warning" size={24} color="#EF4444" />
                <Text style={[styles.warningTitle, { color: '#EF4444' }]}>When to See a Doctor</Text>
              </View>
              <Text style={[styles.warningText, { color: '#7F1D1D' }]}>
                Consult your healthcare provider if your blood pressure readings consistently show:
              </Text>
              <View style={styles.warningList}>
                <Text style={[styles.warningItem, { color: '#7F1D1D' }]}>• Systolic pressure of 130 mmHg or higher</Text>
                <Text style={[styles.warningItem, { color: '#7F1D1D' }]}>• Diastolic pressure of 80 mmHg or higher</Text>
                <Text style={[styles.warningItem, { color: '#7F1D1D' }]}>• Sudden increases in blood pressure</Text>
                <Text style={[styles.warningItem, { color: '#7F1D1D' }]}>• Symptoms like headaches, dizziness, or chest pain</Text>
              </View>
            </View>
          </View>

          <View style={styles.bottomPadding} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerInfo: {
    alignItems: 'flex-end',
  },
  category: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.8,
  },
  readTime: {
    color: 'white',
    fontSize: 12,
    opacity: 0.8,
    marginTop: 2,
  },
  titleContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  title: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: 'white',
    fontSize: 16,
    opacity: 0.9,
    lineHeight: 22,
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    height: 200,
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  articleContainer: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  rangeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rangeIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  rangeInfo: {
    flex: 1,
  },
  rangeTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  rangeValue: {
    fontSize: 14,
  },
  tipsList: {
    marginTop: 16,
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  tipIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  tipDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  lifestyleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  lifestyleCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  lifestyleTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  lifestyleText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  warningCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  warningText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  warningList: {
    marginTop: 8,
  },
  warningItem: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  bottomPadding: {
    height: 50,
  },
});
