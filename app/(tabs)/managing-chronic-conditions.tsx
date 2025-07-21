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

export default function ManagingChronicConditionsScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const colors = theme.colors;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={['#9333EA', '#A855F7']}
        style={[styles.header, { paddingTop: insets.top }]}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.category}>Chronic Care</Text>
            <Text style={styles.readTime}>6 min read</Text>
          </View>
        </View>
        
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Managing Chronic Conditions</Text>
          <Text style={styles.subtitle}>Strategies for living well with chronic health conditions</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.imageContainer}>
          <Image
            source={require('../../assets/images/MedLynx-14.jpeg')}
            style={styles.heroImage}
            resizeMode="cover"
          />
        </View>

        {/* Article Content */}
        <View style={styles.articleContainer}>
          {/* Introduction */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Understanding Chronic Conditions</Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
              Chronic conditions are health issues that persist for a year or more and require ongoing medical attention. They affect millions of people worldwide and include conditions like diabetes, hypertension, heart disease, and arthritis. While they cannot always be cured, they can often be managed effectively with the right approach.
            </Text>
          </View>

          {/* Common Chronic Conditions */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Common Chronic Conditions in South Africa</Text>
            
            <View style={styles.conditionsList}>
              <View style={[styles.conditionCard, { backgroundColor: colors.surface }]}>
                <View style={[styles.conditionIcon, { backgroundColor: '#DC2626' }]}>
                  <Ionicons name="heart" size={20} color="white" />
                </View>
                <View style={styles.conditionContent}>
                  <Text style={[styles.conditionTitle, { color: colors.text }]}>Hypertension</Text>
                  <Text style={[styles.conditionDescription, { color: colors.textSecondary }]}>
                    High blood pressure affects 1 in 4 South African adults. Often called the &ldquo;silent killer.&rdquo;
                  </Text>
                  <Text style={[styles.conditionStats, { color: '#DC2626' }]}>~28% prevalence</Text>
                </View>
              </View>

              <View style={[styles.conditionCard, { backgroundColor: colors.surface }]}>
                <View style={[styles.conditionIcon, { backgroundColor: '#2563EB' }]}>
                  <Ionicons name="water" size={20} color="white" />
                </View>
                <View style={styles.conditionContent}>
                  <Text style={[styles.conditionTitle, { color: colors.text }]}>Diabetes</Text>
                  <Text style={[styles.conditionDescription, { color: colors.textSecondary }]}>
                    Type 2 diabetes is increasing rapidly, affecting blood sugar control.
                  </Text>
                  <Text style={[styles.conditionStats, { color: '#2563EB' }]}>~12% prevalence</Text>
                </View>
              </View>

              <View style={[styles.conditionCard, { backgroundColor: colors.surface }]}>
                <View style={[styles.conditionIcon, { backgroundColor: '#059669' }]}>
                  <Ionicons name="fitness" size={20} color="white" />
                </View>
                <View style={styles.conditionContent}>
                  <Text style={[styles.conditionTitle, { color: colors.text }]}>Arthritis</Text>
                  <Text style={[styles.conditionDescription, { color: colors.textSecondary }]}>
                    Joint inflammation causing pain and stiffness, common in older adults.
                  </Text>
                  <Text style={[styles.conditionStats, { color: '#059669' }]}>~15% prevalence</Text>
                </View>
              </View>

              <View style={[styles.conditionCard, { backgroundColor: colors.surface }]}>
                <View style={[styles.conditionIcon, { backgroundColor: '#7C3AED' }]}>
                  <Ionicons name="medical" size={20} color="white" />
                </View>
                <View style={styles.conditionContent}>
                  <Text style={[styles.conditionTitle, { color: colors.text }]}>HIV/AIDS</Text>
                  <Text style={[styles.conditionDescription, { color: colors.textSecondary }]}>
                    With proper treatment, people with HIV can live normal, healthy lives.
                  </Text>
                  <Text style={[styles.conditionStats, { color: '#7C3AED' }]}>Highly manageable</Text>
                </View>
              </View>
            </View>
          </View>

          {/* The 4 Pillars of Chronic Disease Management */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>The 4 Pillars of Effective Management</Text>
            
            <View style={styles.pillarsList}>
              <View style={styles.pillarItem}>
                <View style={[styles.pillarIcon, { backgroundColor: '#9333EA' }]}>
                  <Ionicons name="medical" size={24} color="white" />
                </View>
                <View style={styles.pillarContent}>
                  <Text style={[styles.pillarTitle, { color: colors.text }]}>1. Medical Care</Text>
                  <Text style={[styles.pillarDescription, { color: colors.textSecondary }]}>
                    Regular check-ups, medication adherence, and working closely with your healthcare team.
                  </Text>
                  <View style={styles.pillarTips}>
                    <Text style={[styles.pillarTip, { color: colors.textSecondary }]}>
                      • Follow prescribed treatment plans
                    </Text>
                    <Text style={[styles.pillarTip, { color: colors.textSecondary }]}>
                      • Monitor symptoms and vital signs
                    </Text>
                    <Text style={[styles.pillarTip, { color: colors.textSecondary }]}>
                      • Communicate openly with doctors
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.pillarItem}>
                <View style={[styles.pillarIcon, { backgroundColor: '#059669' }]}>
                  <Ionicons name="restaurant" size={24} color="white" />
                </View>
                <View style={styles.pillarContent}>
                  <Text style={[styles.pillarTitle, { color: colors.text }]}>2. Healthy Lifestyle</Text>
                  <Text style={[styles.pillarDescription, { color: colors.textSecondary }]}>
                    Nutrition, exercise, sleep, and stress management play crucial roles in symptom control.
                  </Text>
                  <View style={styles.pillarTips}>
                    <Text style={[styles.pillarTip, { color: colors.textSecondary }]}>
                      • Eat balanced, condition-appropriate meals
                    </Text>
                    <Text style={[styles.pillarTip, { color: colors.textSecondary }]}>
                      • Stay physically active within your limits
                    </Text>
                    <Text style={[styles.pillarTip, { color: colors.textSecondary }]}>
                      • Prioritize quality sleep and stress reduction
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.pillarItem}>
                <View style={[styles.pillarIcon, { backgroundColor: '#DC2626' }]}>
                  <Ionicons name="heart" size={24} color="white" />
                </View>
                <View style={styles.pillarContent}>
                  <Text style={[styles.pillarTitle, { color: colors.text }]}>3. Self-Monitoring</Text>
                  <Text style={[styles.pillarDescription, { color: colors.textSecondary }]}>
                    Track symptoms, vital signs, and how treatments affect your daily life.
                  </Text>
                  <View style={styles.pillarTips}>
                    <Text style={[styles.pillarTip, { color: colors.textSecondary }]}>
                      • Keep a health diary or use apps
                    </Text>
                    <Text style={[styles.pillarTip, { color: colors.textSecondary }]}>
                      • Monitor blood pressure, blood sugar, etc.
                    </Text>
                    <Text style={[styles.pillarTip, { color: colors.textSecondary }]}>
                      • Note medication effects and side effects
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.pillarItem}>
                <View style={[styles.pillarIcon, { backgroundColor: '#F59E0B' }]}>
                  <Ionicons name="people" size={24} color="white" />
                </View>
                <View style={styles.pillarContent}>
                  <Text style={[styles.pillarTitle, { color: colors.text }]}>4. Support System</Text>
                  <Text style={[styles.pillarDescription, { color: colors.textSecondary }]}>
                    Family, friends, support groups, and healthcare professionals provide essential support.
                  </Text>
                  <View style={styles.pillarTips}>
                    <Text style={[styles.pillarTip, { color: colors.textSecondary }]}>
                      • Join condition-specific support groups
                    </Text>
                    <Text style={[styles.pillarTip, { color: colors.textSecondary }]}>
                      • Communicate needs to family and friends
                    </Text>
                    <Text style={[styles.pillarTip, { color: colors.textSecondary }]}>
                      • Consider counseling for emotional support
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Daily Management Strategies */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Daily Management Strategies</Text>
            
            <View style={styles.strategiesGrid}>
              <View style={[styles.strategyCard, { backgroundColor: colors.surface }]}>
                <Ionicons name="calendar" size={24} color="#9333EA" />
                <Text style={[styles.strategyTitle, { color: colors.text }]}>Create Routines</Text>
                <Text style={[styles.strategyText, { color: colors.textSecondary }]}>
                  Establish daily routines for medication, meals, exercise, and sleep
                </Text>
              </View>

              <View style={[styles.strategyCard, { backgroundColor: colors.surface }]}>
                <Ionicons name="book" size={24} color="#059669" />
                <Text style={[styles.strategyTitle, { color: colors.text }]}>Stay Informed</Text>
                <Text style={[styles.strategyText, { color: colors.textSecondary }]}>
                  Learn about your condition from reliable medical sources
                </Text>
              </View>

              <View style={[styles.strategyCard, { backgroundColor: colors.surface }]}>
                <Ionicons name="checkmark-circle" size={24} color="#DC2626" />
                <Text style={[styles.strategyTitle, { color: colors.text }]}>Set Realistic Goals</Text>
                <Text style={[styles.strategyText, { color: colors.textSecondary }]}>
                  Focus on achievable improvements in health and quality of life
                </Text>
              </View>

              <View style={[styles.strategyCard, { backgroundColor: colors.surface }]}>
                <Ionicons name="happy" size={24} color="#F59E0B" />
                <Text style={[styles.strategyTitle, { color: colors.text }]}>Stay Positive</Text>
                <Text style={[styles.strategyText, { color: colors.textSecondary }]}>
                  Maintain mental health through hobbies, social connections, and mindfulness
                </Text>
              </View>
            </View>
          </View>

          {/* Emergency Preparation */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Emergency Preparedness</Text>
            
            <View style={[styles.emergencyCard, { backgroundColor: '#FEF2F2', borderColor: '#EF4444' }]}>
              <View style={styles.emergencyHeader}>
                <Ionicons name="warning" size={24} color="#EF4444" />
                <Text style={[styles.emergencyTitle, { color: '#EF4444' }]}>Be Prepared for Emergencies</Text>
              </View>
              
              <View style={styles.emergencySection}>
                <Text style={[styles.emergencySubtitle, { color: '#7F1D1D' }]}>Keep Ready:</Text>
                <View style={styles.emergencyList}>
                  <Text style={[styles.emergencyItem, { color: '#7F1D1D' }]}>
                    • Updated medication list with dosages and schedules
                  </Text>
                  <Text style={[styles.emergencyItem, { color: '#7F1D1D' }]}>
                    • Emergency contact information (family, doctors, pharmacy)
                  </Text>
                  <Text style={[styles.emergencyItem, { color: '#7F1D1D' }]}>
                    • Medical alert bracelet or card for critical conditions
                  </Text>
                  <Text style={[styles.emergencyItem, { color: '#7F1D1D' }]}>
                    • Extra supply of essential medications (at least 7 days)
                  </Text>
                </View>
              </View>

              <View style={styles.emergencySection}>
                <Text style={[styles.emergencySubtitle, { color: '#7F1D1D' }]}>Warning Signs to Watch:</Text>
                <View style={styles.emergencyList}>
                  <Text style={[styles.emergencyItem, { color: '#7F1D1D' }]}>
                    • Sudden worsening of symptoms
                  </Text>
                  <Text style={[styles.emergencyItem, { color: '#7F1D1D' }]}>
                    • New or unusual symptoms
                  </Text>
                  <Text style={[styles.emergencyItem, { color: '#7F1D1D' }]}>
                    • Severe medication side effects
                  </Text>
                  <Text style={[styles.emergencyItem, { color: '#7F1D1D' }]}>
                    • Unable to take medications due to illness
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* South African Resources */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>South African Support Resources</Text>
            
            <View style={styles.resourcesList}>
              <View style={[styles.resourceCard, { backgroundColor: colors.surface }]}>
                <View style={[styles.resourceIcon, { backgroundColor: '#10B981' }]}>
                  <Ionicons name="medical" size={20} color="white" />
                </View>
                <View style={styles.resourceContent}>
                  <Text style={[styles.resourceTitle, { color: colors.text }]}>National Department of Health</Text>
                  <Text style={[styles.resourceDescription, { color: colors.textSecondary }]}>
                    Government health services and chronic disease programs
                  </Text>
                  <Text style={[styles.resourceContact, { color: '#10B981' }]}>
                    📞 0800 029 999 (National Health Insurance Hotline)
                  </Text>
                </View>
              </View>

              <View style={[styles.resourceCard, { backgroundColor: colors.surface }]}>
                <View style={[styles.resourceIcon, { backgroundColor: '#2563EB' }]}>
                  <Ionicons name="heart" size={20} color="white" />
                </View>
                <View style={styles.resourceContent}>
                  <Text style={[styles.resourceTitle, { color: colors.text }]}>Heart and Stroke Foundation SA</Text>
                  <Text style={[styles.resourceDescription, { color: colors.textSecondary }]}>
                    Support for cardiovascular and stroke-related conditions
                  </Text>
                  <Text style={[styles.resourceContact, { color: '#2563EB' }]}>
                    📞 021 422 3810 | www.heartfoundation.co.za
                  </Text>
                </View>
              </View>

              <View style={[styles.resourceCard, { backgroundColor: colors.surface }]}>
                <View style={[styles.resourceIcon, { backgroundColor: '#7C3AED' }]}>
                  <Ionicons name="water" size={20} color="white" />
                </View>
                <View style={styles.resourceContent}>
                  <Text style={[styles.resourceTitle, { color: colors.text }]}>Diabetes South Africa</Text>
                  <Text style={[styles.resourceDescription, { color: colors.textSecondary }]}>
                    Resources and support for diabetes management
                  </Text>
                  <Text style={[styles.resourceContact, { color: '#7C3AED' }]}>
                    📞 011 792 9888 | www.diabetessa.org.za
                  </Text>
                </View>
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
  conditionsList: {
    marginTop: 16,
  },
  conditionCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  conditionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  conditionContent: {
    flex: 1,
  },
  conditionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  conditionDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 6,
  },
  conditionStats: {
    fontSize: 12,
    fontWeight: '600',
  },
  pillarsList: {
    marginTop: 16,
  },
  pillarItem: {
    flexDirection: 'row',
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  pillarIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  pillarContent: {
    flex: 1,
  },
  pillarTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  pillarDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  pillarTips: {
    marginTop: 8,
  },
  pillarTip: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
  },
  strategiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  strategyCard: {
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
  strategyTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  strategyText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  emergencyCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  emergencyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  emergencySection: {
    marginBottom: 16,
  },
  emergencySubtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  emergencyList: {
    marginTop: 8,
  },
  emergencyItem: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 6,
  },
  resourcesList: {
    marginTop: 16,
  },
  resourceCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  resourceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  resourceContent: {
    flex: 1,
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  resourceDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 6,
  },
  resourceContact: {
    fontSize: 12,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 50,
  },
});
