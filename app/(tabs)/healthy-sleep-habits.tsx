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

export default function HealthySleepHabitsScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const colors = theme.colors;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={['#6366f1', '#8B5CF6']}
        style={[styles.header, { paddingTop: insets.top }]}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.category}>Sleep Health</Text>
            <Text style={styles.readTime}>5 min read</Text>
          </View>
        </View>
        
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Healthy Sleep Habits</Text>
          <Text style={styles.subtitle}>Improve your sleep quality with these evidence-based tips</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.imageContainer}>
          <Image
            source={require('../../assets/images/MedLynx-13.jpeg')}
            style={styles.heroImage}
            resizeMode="cover"
          />
        </View>

        {/* Article Content */}
        <View style={styles.articleContainer}>
          {/* Introduction */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Why Quality Sleep Matters</Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
              Quality sleep is essential for physical health, mental well-being, and cognitive function. Adults need 7-9 hours of sleep per night for optimal health. Poor sleep can increase the risk of chronic diseases, weaken immunity, and affect mental health.
            </Text>
          </View>

          {/* Sleep Stages */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Understanding Sleep Stages</Text>
            
            <View style={styles.stagesList}>
              <View style={[styles.stageCard, { backgroundColor: colors.surface }]}>
                <View style={[styles.stageIcon, { backgroundColor: '#6366f1' }]}>
                  <Ionicons name="moon" size={20} color="white" />
                </View>
                <View style={styles.stageContent}>
                  <Text style={[styles.stageTitle, { color: colors.text }]}>Light Sleep (Stages 1-2)</Text>
                  <Text style={[styles.stageDescription, { color: colors.textSecondary }]}>
                    Transition from wake to sleep. Muscles relax, heart rate and breathing slow down.
                  </Text>
                  <Text style={[styles.stageDuration, { color: '#6366f1' }]}>45-55% of total sleep</Text>
                </View>
              </View>

              <View style={[styles.stageCard, { backgroundColor: colors.surface }]}>
                <View style={[styles.stageIcon, { backgroundColor: '#8B5CF6' }]}>
                  <Ionicons name="bed" size={20} color="white" />
                </View>
                <View style={styles.stageContent}>
                  <Text style={[styles.stageTitle, { color: colors.text }]}>Deep Sleep (Stage 3)</Text>
                  <Text style={[styles.stageDescription, { color: colors.textSecondary }]}>
                    Physical restoration occurs. Growth hormone released, immune system strengthened.
                  </Text>
                  <Text style={[styles.stageDuration, { color: '#8B5CF6' }]}>15-20% of total sleep</Text>
                </View>
              </View>

              <View style={[styles.stageCard, { backgroundColor: colors.surface }]}>
                <View style={[styles.stageIcon, { backgroundColor: '#A855F7' }]}>
                  <Ionicons name="eye" size={20} color="white" />
                </View>
                <View style={styles.stageContent}>
                  <Text style={[styles.stageTitle, { color: colors.text }]}>REM Sleep</Text>
                  <Text style={[styles.stageDescription, { color: colors.textSecondary }]}>
                    Dreams occur. Brain consolidates memories and processes emotions.
                  </Text>
                  <Text style={[styles.stageDuration, { color: '#A855F7' }]}>20-25% of total sleep</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Sleep Hygiene Tips */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Essential Sleep Hygiene Practices</Text>
            
            <View style={styles.tipsList}>
              <View style={styles.tipCategory}>
                <Text style={[styles.tipCategoryTitle, { color: colors.text }]}>🕘 Timing & Schedule</Text>
                
                <View style={styles.tipItem}>
                  <View style={[styles.tipIcon, { backgroundColor: '#10B981' }]}>
                    <Ionicons name="time" size={18} color="white" />
                  </View>
                  <View style={styles.tipContent}>
                    <Text style={[styles.tipTitle, { color: colors.text }]}>Consistent Sleep Schedule</Text>
                    <Text style={[styles.tipDescription, { color: colors.textSecondary }]}>
                      Go to bed and wake up at the same time every day, even on weekends.
                    </Text>
                  </View>
                </View>

                <View style={styles.tipItem}>
                  <View style={[styles.tipIcon, { backgroundColor: '#10B981' }]}>
                    <Ionicons name="sunny" size={18} color="white" />
                  </View>
                  <View style={styles.tipContent}>
                    <Text style={[styles.tipTitle, { color: colors.text }]}>Morning Light Exposure</Text>
                    <Text style={[styles.tipDescription, { color: colors.textSecondary }]}>
                      Get 15-30 minutes of bright light exposure within an hour of waking up.
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.tipCategory}>
                <Text style={[styles.tipCategoryTitle, { color: colors.text }]}>🛏️ Sleep Environment</Text>
                
                <View style={styles.tipItem}>
                  <View style={[styles.tipIcon, { backgroundColor: '#3B82F6' }]}>
                    <Ionicons name="thermometer" size={18} color="white" />
                  </View>
                  <View style={styles.tipContent}>
                    <Text style={[styles.tipTitle, { color: colors.text }]}>Optimal Temperature</Text>
                    <Text style={[styles.tipDescription, { color: colors.textSecondary }]}>
                      Keep bedroom temperature between 16-19°C (60-67°F) for better sleep.
                    </Text>
                  </View>
                </View>

                <View style={styles.tipItem}>
                  <View style={[styles.tipIcon, { backgroundColor: '#3B82F6' }]}>
                    <Ionicons name="moon" size={18} color="white" />
                  </View>
                  <View style={styles.tipContent}>
                    <Text style={[styles.tipTitle, { color: colors.text }]}>Dark & Quiet</Text>
                    <Text style={[styles.tipDescription, { color: colors.textSecondary }]}>
                      Use blackout curtains, eye masks, and consider white noise for better sleep quality.
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.tipCategory}>
                <Text style={[styles.tipCategoryTitle, { color: colors.text }]}>🍽️ Diet & Habits</Text>
                
                <View style={styles.tipItem}>
                  <View style={[styles.tipIcon, { backgroundColor: '#F59E0B' }]}>
                    <Ionicons name="cafe" size={18} color="white" />
                  </View>
                  <View style={styles.tipContent}>
                    <Text style={[styles.tipTitle, { color: colors.text }]}>Limit Caffeine</Text>
                    <Text style={[styles.tipDescription, { color: colors.textSecondary }]}>
                      Avoid caffeine 6 hours before bedtime. Switch to herbal tea in the evening.
                    </Text>
                  </View>
                </View>

                <View style={styles.tipItem}>
                  <View style={[styles.tipIcon, { backgroundColor: '#F59E0B' }]}>
                    <Ionicons name="restaurant" size={18} color="white" />
                  </View>
                  <View style={styles.tipContent}>
                    <Text style={[styles.tipTitle, { color: colors.text }]}>Light Evening Meals</Text>
                    <Text style={[styles.tipDescription, { color: colors.textSecondary }]}>
                      Finish eating 2-3 hours before bedtime. Avoid heavy, spicy, or large meals.
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Pre-Sleep Routine */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Creating a Relaxing Pre-Sleep Routine</Text>
            
            <View style={styles.routineTimeline}>
              <View style={styles.timelineItem}>
                <View style={[styles.timelineDot, { backgroundColor: '#6366f1' }]} />
                <View style={styles.timelineContent}>
                  <Text style={[styles.timelineTime, { color: '#6366f1' }]}>2 hours before bed</Text>
                  <Text style={[styles.timelineTitle, { color: colors.text }]}>Wind Down</Text>
                  <Text style={[styles.timelineDesc, { color: colors.textSecondary }]}>
                    Dim lights, stop work activities, finish eating
                  </Text>
                </View>
              </View>

              <View style={styles.timelineItem}>
                <View style={[styles.timelineDot, { backgroundColor: '#8B5CF6' }]} />
                <View style={styles.timelineContent}>
                  <Text style={[styles.timelineTime, { color: '#8B5CF6' }]}>1 hour before bed</Text>
                  <Text style={[styles.timelineTitle, { color: colors.text }]}>Screen-Free Time</Text>
                  <Text style={[styles.timelineDesc, { color: colors.textSecondary }]}>
                    Put away phones, tablets, TV. Try reading or gentle stretching
                  </Text>
                </View>
              </View>

              <View style={styles.timelineItem}>
                <View style={[styles.timelineDot, { backgroundColor: '#A855F7' }]} />
                <View style={styles.timelineContent}>
                  <Text style={[styles.timelineTime, { color: '#A855F7' }]}>30 min before bed</Text>
                  <Text style={[styles.timelineTitle, { color: colors.text }]}>Relaxation</Text>
                  <Text style={[styles.timelineDesc, { color: colors.textSecondary }]}>
                    Warm bath, meditation, deep breathing, or calming music
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Common Sleep Disruptors */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Avoid These Sleep Disruptors</Text>
            
            <View style={styles.disruptorsList}>
              <View style={[styles.disruptorCard, { backgroundColor: '#FEF2F2', borderColor: '#EF4444' }]}>
                <View style={styles.disruptorHeader}>
                  <Ionicons name="phone-portrait" size={20} color="#EF4444" />
                  <Text style={[styles.disruptorTitle, { color: '#EF4444' }]}>Blue Light from Screens</Text>
                </View>
                <Text style={[styles.disruptorText, { color: '#7F1D1D' }]}>
                  Suppresses melatonin production. Use blue light filters or avoid screens 1 hour before bed.
                </Text>
              </View>

              <View style={[styles.disruptorCard, { backgroundColor: '#FEF2F2', borderColor: '#EF4444' }]}>
                <View style={styles.disruptorHeader}>
                  <Ionicons name="wine" size={20} color="#EF4444" />
                  <Text style={[styles.disruptorTitle, { color: '#EF4444' }]}>Alcohol Before Bed</Text>
                </View>
                <Text style={[styles.disruptorText, { color: '#7F1D1D' }]}>
                  While it may help you fall asleep, alcohol disrupts sleep cycles and reduces REM sleep quality.
                </Text>
              </View>

              <View style={[styles.disruptorCard, { backgroundColor: '#FEF2F2', borderColor: '#EF4444' }]}>
                <View style={styles.disruptorHeader}>
                  <Ionicons name="fitness" size={20} color="#EF4444" />
                  <Text style={[styles.disruptorTitle, { color: '#EF4444' }]}>Late Evening Exercise</Text>
                </View>
                <Text style={[styles.disruptorText, { color: '#7F1D1D' }]}>
                  Vigorous exercise within 3 hours of bedtime can be too stimulating. Try gentle yoga instead.
                </Text>
              </View>
            </View>
          </View>

          {/* When to Seek Help */}
          <View style={styles.section}>
            <View style={[styles.helpCard, { backgroundColor: colors.surface }]}>
              <View style={styles.helpHeader}>
                <Ionicons name="medical" size={24} color="#6366f1" />
                <Text style={[styles.helpTitle, { color: colors.text }]}>When to Consult a Healthcare Provider</Text>
              </View>
              <Text style={[styles.helpIntro, { color: colors.textSecondary }]}>
                Consider speaking with a sleep specialist if you experience:
              </Text>
              <View style={styles.helpList}>
                <View style={styles.helpItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#6366f1" />
                  <Text style={[styles.helpText, { color: colors.textSecondary }]}>
                    Difficulty falling asleep or staying asleep for more than 2 weeks
                  </Text>
                </View>
                <View style={styles.helpItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#6366f1" />
                  <Text style={[styles.helpText, { color: colors.textSecondary }]}>
                    Loud snoring with pauses in breathing (sleep apnea signs)
                  </Text>
                </View>
                <View style={styles.helpItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#6366f1" />
                  <Text style={[styles.helpText, { color: colors.textSecondary }]}>
                    Excessive daytime sleepiness despite adequate sleep time
                  </Text>
                </View>
                <View style={styles.helpItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#6366f1" />
                  <Text style={[styles.helpText, { color: colors.textSecondary }]}>
                    Restless leg syndrome or frequent leg movements during sleep
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
  stagesList: {
    marginTop: 16,
  },
  stageCard: {
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
  stageIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stageContent: {
    flex: 1,
  },
  stageTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  stageDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 6,
  },
  stageDuration: {
    fontSize: 12,
    fontWeight: '600',
  },
  tipsList: {
    marginTop: 16,
  },
  tipCategory: {
    marginBottom: 20,
  },
  tipCategoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  tipIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  tipDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  routineTimeline: {
    marginTop: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 6,
    marginRight: 12,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTime: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  timelineDesc: {
    fontSize: 14,
    lineHeight: 20,
  },
  disruptorsList: {
    marginTop: 16,
  },
  disruptorCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  disruptorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  disruptorTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  disruptorText: {
    fontSize: 14,
    lineHeight: 20,
  },
  helpCard: {
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  helpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  helpIntro: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  helpList: {
    marginTop: 8,
  },
  helpItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  helpText: {
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 8,
    flex: 1,
  },
  bottomPadding: {
    height: 50,
  },
});
