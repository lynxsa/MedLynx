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

export default function MedicationSafetyTipsScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const colors = theme.colors;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={['#3726a6', '#6366f1']}
        style={[styles.header, { paddingTop: insets.top }]}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.category}>Medication Safety</Text>
            <Text style={styles.readTime}>4 min read</Text>
          </View>
        </View>
        
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Medication Safety Tips</Text>
          <Text style={styles.subtitle}>Essential guidelines for safe medication usage and storage</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.imageContainer}>
          <Image
            source={require('../../assets/images/MedLynx-12.jpeg')}
            style={styles.heroImage}
            resizeMode="cover"
          />
        </View>

        {/* Article Content */}
        <View style={styles.articleContainer}>
          {/* Introduction */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Why Medication Safety Matters</Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
              Taking medications correctly is crucial for your health and safety. Proper medication management can mean the difference between effective treatment and serious complications. Here&apos;s everything you need to know about using medications safely.
            </Text>
          </View>

          {/* The 5 Rights of Medication */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>The 5 Rights of Medication Safety</Text>
            
            <View style={styles.rightsList}>
              <View style={styles.rightItem}>
                <View style={[styles.rightIcon, { backgroundColor: '#3726a6' }]}>
                  <Text style={styles.rightNumber}>1</Text>
                </View>
                <View style={styles.rightContent}>
                  <Text style={[styles.rightTitle, { color: colors.text }]}>Right Patient</Text>
                  <Text style={[styles.rightDescription, { color: colors.textSecondary }]}>
                    Ensure the medication is prescribed for you. Never share prescription medications with others.
                  </Text>
                </View>
              </View>

              <View style={styles.rightItem}>
                <View style={[styles.rightIcon, { backgroundColor: '#3726a6' }]}>
                  <Text style={styles.rightNumber}>2</Text>
                </View>
                <View style={styles.rightContent}>
                  <Text style={[styles.rightTitle, { color: colors.text }]}>Right Medication</Text>
                  <Text style={[styles.rightDescription, { color: colors.textSecondary }]}>
                    Double-check the medication name and strength before taking it. Ask questions if unsure.
                  </Text>
                </View>
              </View>

              <View style={styles.rightItem}>
                <View style={[styles.rightIcon, { backgroundColor: '#3726a6' }]}>
                  <Text style={styles.rightNumber}>3</Text>
                </View>
                <View style={styles.rightContent}>
                  <Text style={[styles.rightTitle, { color: colors.text }]}>Right Dose</Text>
                  <Text style={[styles.rightDescription, { color: colors.textSecondary }]}>
                    Take exactly as prescribed. Never adjust doses without consulting your healthcare provider.
                  </Text>
                </View>
              </View>

              <View style={styles.rightItem}>
                <View style={[styles.rightIcon, { backgroundColor: '#3726a6' }]}>
                  <Text style={styles.rightNumber}>4</Text>
                </View>
                <View style={styles.rightContent}>
                  <Text style={[styles.rightTitle, { color: colors.text }]}>Right Time</Text>
                  <Text style={[styles.rightDescription, { color: colors.textSecondary }]}>
                    Follow the prescribed schedule. Use alarms or medication reminders if needed.
                  </Text>
                </View>
              </View>

              <View style={styles.rightItem}>
                <View style={[styles.rightIcon, { backgroundColor: '#3726a6' }]}>
                  <Text style={styles.rightNumber}>5</Text>
                </View>
                <View style={styles.rightContent}>
                  <Text style={[styles.rightTitle, { color: colors.text }]}>Right Route</Text>
                  <Text style={[styles.rightDescription, { color: colors.textSecondary }]}>
                    Take medications as directed (orally, topically, etc.). Never change the method of administration.
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Storage Guidelines */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Proper Storage Guidelines</Text>
            
            <View style={styles.storageGrid}>
              <View style={[styles.storageCard, { backgroundColor: colors.surface }]}>
                <Ionicons name="thermometer" size={24} color="#F59E0B" />
                <Text style={[styles.storageTitle, { color: colors.text }]}>Temperature</Text>
                <Text style={[styles.storageText, { color: colors.textSecondary }]}>
                  Store at room temperature unless refrigeration is specified
                </Text>
              </View>

              <View style={[styles.storageCard, { backgroundColor: colors.surface }]}>
                <Ionicons name="sunny" size={24} color="#EF4444" />
                <Text style={[styles.storageTitle, { color: colors.text }]}>Light Protection</Text>
                <Text style={[styles.storageText, { color: colors.textSecondary }]}>
                  Keep in original containers, away from direct sunlight
                </Text>
              </View>

              <View style={[styles.storageCard, { backgroundColor: colors.surface }]}>
                <Ionicons name="water" size={24} color="#3B82F6" />
                <Text style={[styles.storageTitle, { color: colors.text }]}>Moisture Control</Text>
                <Text style={[styles.storageText, { color: colors.textSecondary }]}>
                  Avoid bathrooms and kitchens where humidity is high
                </Text>
              </View>

              <View style={[styles.storageCard, { backgroundColor: colors.surface }]}>
                <Ionicons name="lock-closed" size={24} color="#8B5CF6" />
                <Text style={[styles.storageTitle, { color: colors.text }]}>Child Safety</Text>
                <Text style={[styles.storageText, { color: colors.textSecondary }]}>
                  Use child-resistant caps and store out of children&apos;s reach
                </Text>
              </View>
            </View>
          </View>

          {/* Common Mistakes to Avoid */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Common Mistakes to Avoid</Text>
            
            <View style={styles.mistakesList}>
              <View style={[styles.mistakeCard, { backgroundColor: '#FEF2F2', borderColor: '#EF4444' }]}>
                <View style={styles.mistakeHeader}>
                  <Ionicons name="close-circle" size={20} color="#EF4444" />
                  <Text style={[styles.mistakeTitle, { color: '#EF4444' }]}>Skipping Doses</Text>
                </View>
                <Text style={[styles.mistakeText, { color: '#7F1D1D' }]}>
                  Missing doses can reduce effectiveness and may cause treatment failure or resistance.
                </Text>
              </View>

              <View style={[styles.mistakeCard, { backgroundColor: '#FEF2F2', borderColor: '#EF4444' }]}>
                <View style={styles.mistakeHeader}>
                  <Ionicons name="close-circle" size={20} color="#EF4444" />
                  <Text style={[styles.mistakeTitle, { color: '#EF4444' }]}>Stopping Early</Text>
                </View>
                <Text style={[styles.mistakeText, { color: '#7F1D1D' }]}>
                  Complete the full course even if you feel better. Stopping early can lead to relapses.
                </Text>
              </View>

              <View style={[styles.mistakeCard, { backgroundColor: '#FEF2F2', borderColor: '#EF4444' }]}>
                <View style={styles.mistakeHeader}>
                  <Ionicons name="close-circle" size={20} color="#EF4444" />
                  <Text style={[styles.mistakeTitle, { color: '#EF4444' }]}>Mixing with Alcohol</Text>
                </View>
                <Text style={[styles.mistakeText, { color: '#7F1D1D' }]}>
                  Alcohol can interact with many medications, reducing effectiveness or causing dangerous side effects.
                </Text>
              </View>
            </View>
          </View>

          {/* Interaction Awareness */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Drug Interactions to Watch For</Text>
            
            <View style={[styles.interactionCard, { backgroundColor: colors.surface }]}>
              <View style={styles.interactionHeader}>
                <Ionicons name="warning" size={24} color="#F59E0B" />
                <Text style={[styles.interactionTitle, { color: colors.text }]}>Always Inform Your Healthcare Provider About:</Text>
              </View>
              
              <View style={styles.interactionList}>
                <View style={styles.interactionItem}>
                  <Ionicons name="medical" size={16} color="#3726a6" />
                  <Text style={[styles.interactionText, { color: colors.textSecondary }]}>
                    All prescription medications you&apos;re taking
                  </Text>
                </View>
                
                <View style={styles.interactionItem}>
                  <Ionicons name="nutrition" size={16} color="#3726a6" />
                  <Text style={[styles.interactionText, { color: colors.textSecondary }]}>
                    Over-the-counter medications and supplements
                  </Text>
                </View>
                
                <View style={styles.interactionItem}>
                  <Ionicons name="leaf" size={16} color="#3726a6" />
                  <Text style={[styles.interactionText, { color: colors.textSecondary }]}>
                    Herbal remedies and traditional medicines
                  </Text>
                </View>
                
                <View style={styles.interactionItem}>
                  <Ionicons name="restaurant" size={16} color="#3726a6" />
                  <Text style={[styles.interactionText, { color: colors.textSecondary }]}>
                    Food allergies and dietary restrictions
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Emergency Information */}
          <View style={styles.section}>
            <View style={[styles.emergencyCard, { backgroundColor: '#EF4444' }]}>
              <View style={styles.emergencyHeader}>
                <Ionicons name="alert-circle" size={24} color="white" />
                <Text style={styles.emergencyTitle}>Medication Emergency Signs</Text>
              </View>
              <Text style={styles.emergencySubtitle}>Seek immediate medical attention if you experience:</Text>
              <View style={styles.emergencyList}>
                <Text style={styles.emergencyItem}>• Severe allergic reactions (rash, swelling, difficulty breathing)</Text>
                <Text style={styles.emergencyItem}>• Sudden onset of unusual symptoms after taking medication</Text>
                <Text style={styles.emergencyItem}>• Signs of overdose (confusion, drowsiness, nausea, vomiting)</Text>
                <Text style={styles.emergencyItem}>• Any symptoms that concern you or worsen rapidly</Text>
              </View>
              <View style={styles.emergencyContact}>
                <Text style={styles.emergencyContactText}>
                  🚨 Emergency: Call 10177 (South Africa) or your local emergency services
                </Text>
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
  rightsList: {
    marginTop: 16,
  },
  rightItem: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  rightIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rightNumber: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  rightContent: {
    flex: 1,
  },
  rightTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  rightDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  storageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  storageCard: {
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
  storageTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  storageText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  mistakesList: {
    marginTop: 16,
  },
  mistakeCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  mistakeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  mistakeTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  mistakeText: {
    fontSize: 14,
    lineHeight: 20,
  },
  interactionCard: {
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  interactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  interactionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  interactionList: {
    marginTop: 8,
  },
  interactionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  interactionText: {
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 8,
    flex: 1,
  },
  emergencyCard: {
    padding: 20,
    borderRadius: 12,
  },
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  emergencyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 8,
  },
  emergencySubtitle: {
    color: 'white',
    fontSize: 14,
    marginBottom: 12,
    opacity: 0.9,
  },
  emergencyList: {
    marginBottom: 16,
  },
  emergencyItem: {
    color: 'white',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 6,
  },
  emergencyContact: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  emergencyContactText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  bottomPadding: {
    height: 50,
  },
});
