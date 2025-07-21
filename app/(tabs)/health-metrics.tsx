/* eslint-disable @typescript-eslint/no-unused-vars */
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
    Dimensions,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StandardHeader } from '../../components/StandardHeader';
import { useTheme } from '../../contexts/ThemeContext';

const { width } = Dimensions.get('window');

interface HealthMetric {
  id: string;
  type: 'bloodPressure' | 'bloodSugar' | 'heartRate' | 'weight' | 'steps' | 'sleep' | 'water' | 'bmi' | 'temperature' | 'oxygen';
  value: string;
  unit: string;
  status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  trend: 'up' | 'down' | 'stable';
  target?: string;
}

interface HealthGoal {
  id: string;
  metric: string;
  current: number;
  target: number;
  unit: string;
  progress: number;
  icon: string;
  color: string;
}

interface HealthInsight {
  id: string;
  type: 'achievement' | 'warning' | 'tip' | 'reminder';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
}

export default function HealthMetricsScreen() {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [selectedTab, setSelectedTab] = useState<'overview' | 'vitals' | 'goals' | 'history'>('overview');
  const [healthScore] = useState(78);
  
  // Sample comprehensive health data - matches home page data
  const [metrics] = useState<HealthMetric[]>([
    {
      id: '1',
      type: 'heartRate',
      value: '72',
      unit: 'BPM',
      status: 'good',
      trend: 'stable',
      target: '60-100 BPM',
    },
    {
      id: '2',
      type: 'bloodPressure',
      value: '118/76',
      unit: 'mmHg',
      status: 'excellent',
      trend: 'down',
      target: '<120/80 mmHg',
    },
    {
      id: '3',
      type: 'steps',
      value: '8,247',
      unit: 'steps',
      status: 'good',
      trend: 'up',
      target: '10,000 steps',
    },
    {
      id: '4',
      type: 'sleep',
      value: '7.5',
      unit: 'hours',
      status: 'good',
      trend: 'stable',
      target: '7-9 hours',
    },
    {
      id: '5',
      type: 'water',
      value: '6',
      unit: 'glasses',
      status: 'fair',
      trend: 'up',
      target: '8 glasses',
    },
    {
      id: '6',
      type: 'weight',
      value: '68.5',
      unit: 'kg',
      status: 'good',
      trend: 'stable',
      target: '65-70 kg',
    },
    {
      id: '7',
      type: 'bmi',
      value: '22.4',
      unit: '',
      status: 'excellent',
      trend: 'stable',
      target: '18.5-24.9',
    },
    {
      id: '8',
      type: 'bloodSugar',
      value: '95',
      unit: 'mg/dL',
      status: 'excellent',
      trend: 'stable',
      target: '70-100 mg/dL',
    },
    {
      id: '9',
      type: 'temperature',
      value: '36.7',
      unit: '°C',
      status: 'good',
      trend: 'stable',
      target: '36.1-37.2°C',
    },
    {
      id: '10',
      type: 'oxygen',
      value: '98',
      unit: '%',
      status: 'excellent',
      trend: 'stable',
      target: '>95%',
    },
  ]);

  const [goals] = useState<HealthGoal[]>([
    {
      id: '1',
      metric: 'Daily Steps',
      current: 8247,
      target: 10000,
      unit: 'steps',
      progress: 82,
      icon: 'walk',
      color: '#7C3AED',
    },
    {
      id: '2',
      metric: 'Water Intake',
      current: 6,
      target: 8,
      unit: 'glasses',
      progress: 75,
      icon: 'water',
      color: '#06B6D4',
    },
    {
      id: '3',
      metric: 'Sleep Duration',
      current: 7.5,
      target: 8,
      unit: 'hours',
      progress: 94,
      icon: 'bed',
      color: '#8B5CF6',
    },
    {
      id: '4',
      metric: 'Weight Goal',
      current: 68.5,
      target: 67,
      unit: 'kg',
      progress: 78,
      icon: 'fitness',
      color: '#F59E0B',
    },
  ]);

  const [insights] = useState<HealthInsight[]>([
    {
      id: '1',
      type: 'achievement',
      title: 'Great Blood Pressure!',
      description: 'Your blood pressure has been consistently in the optimal range for the past week.',
      priority: 'high',
      actionable: false,
    },
    {
      id: '2',
      type: 'tip',
      title: 'Stay Hydrated',
      description: 'You\'re 2 glasses short of your daily water goal. Try setting reminders throughout the day.',
      priority: 'medium',
      actionable: true,
    },
    {
      id: '3',
      type: 'reminder',
      title: 'Step Goal Progress',
      description: 'You\'re 82% to your step goal today. A 20-minute walk would help you reach it!',
      priority: 'medium',
      actionable: true,
    },
    {
      id: '4',
      type: 'warning',
      title: 'Medication Reminder',
      description: 'Don\'t forget to take your evening medication at 8 PM.',
      priority: 'high',
      actionable: true,
    },
  ]);

  const getMetricIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      heartRate: 'heart',
      bloodPressure: 'medical',
      bloodSugar: 'water',
      weight: 'scale',
      steps: 'walk',
      sleep: 'bed',
      water: 'water',
      bmi: 'fitness',
      temperature: 'thermometer',
      oxygen: 'medical',
    };
    return icons[type] || 'analytics';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return '#10B981';
      case 'good': return '#3B82F6';
      case 'fair': return '#F59E0B';
      case 'poor': return '#EF4444';
      case 'critical': return '#DC2626';
      default: return theme.colors.textSecondary;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return 'trending-up';
      case 'down': return 'trending-down';
      default: return 'remove';
    }
  };

  const getTrendColor = (trend: string) => {
    if (trend === 'stable') return '#6B7280';
    if (trend === 'up') return '#10B981';
    if (trend === 'down') return '#EF4444';
    return '#6B7280';
  };

  const renderHealthScore = () => (
    <Animated.View entering={FadeInDown.delay(100)} style={styles.healthScoreCard}>
      <LinearGradient
        colors={['#7C3AED', '#A855F7']}
        style={styles.scoreGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.scoreContent}>
          <Text style={styles.scoreLabel}>Your Health Score</Text>
          <Text style={styles.scoreValue}>{healthScore}</Text>
          <Text style={styles.scoreSubtitle}>Good - Keep it up!</Text>
        </View>
        <View style={styles.scoreIcon}>
          <Ionicons name="shield-checkmark" size={40} color="rgba(255,255,255,0.8)" />
        </View>
      </LinearGradient>
    </Animated.View>
  );

  const renderQuickStats = () => (
    <Animated.View entering={FadeInDown.delay(200)} style={styles.quickStatsContainer}>
      <Text style={styles.sectionTitle}>Quick Overview</Text>
      <View style={styles.statsGrid}>
        {metrics.slice(0, 6).map((metric, index) => (
          <Animated.View
            key={metric.id}
            entering={FadeInRight.delay(100 * index)}
            style={styles.statCard}
          >
            <View style={styles.statHeader}>
              <View style={[styles.statIcon, { backgroundColor: getStatusColor(metric.status) + '20' }]}>
                <Ionicons 
                  name={getMetricIcon(metric.type) as any} 
                  size={18} 
                  color={getStatusColor(metric.status)} 
                />
              </View>
              <Ionicons 
                name={getTrendIcon(metric.trend) as any} 
                size={14} 
                color={getTrendColor(metric.trend)} 
              />
            </View>
            <Text style={styles.statValue}>{metric.value}</Text>
            <Text style={styles.statUnit}>{metric.unit}</Text>
            <Text style={styles.statType} numberOfLines={1}>
              {metric.type.charAt(0).toUpperCase() + metric.type.slice(1).replace(/([A-Z])/g, ' $1')}
            </Text>
          </Animated.View>
        ))}
      </View>
    </Animated.View>
  );

  const renderDetailedMetrics = () => (
    <Animated.View entering={FadeInDown.delay(300)} style={styles.detailedMetricsContainer}>
      <Text style={styles.sectionTitle}>All Health Metrics</Text>
      {metrics.map((metric, index) => (
        <Animated.View
          key={metric.id}
          entering={FadeInDown.delay(50 * index)}
          style={styles.metricCard}
        >
          <View style={styles.metricHeader}>
            <View style={styles.metricInfo}>
              <View style={[styles.metricIcon, { backgroundColor: getStatusColor(metric.status) + '20' }]}>
                <Ionicons 
                  name={getMetricIcon(metric.type) as any} 
                  size={20} 
                  color={getStatusColor(metric.status)} 
                />
              </View>
              <View style={styles.metricText}>
                <Text style={styles.metricName}>
                  {metric.type.charAt(0).toUpperCase() + metric.type.slice(1).replace(/([A-Z])/g, ' $1')}
                </Text>
                <Text style={styles.metricTarget}>Target: {metric.target}</Text>
              </View>
            </View>
            <View style={styles.metricValue}>
              <Text style={styles.metricValueText}>{metric.value}</Text>
              <Text style={styles.metricUnitText}>{metric.unit}</Text>
            </View>
          </View>
          <View style={styles.metricFooter}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(metric.status) }]}>
              <Text style={styles.statusText}>{metric.status}</Text>
            </View>
            <View style={styles.trendContainer}>
              <Ionicons 
                name={getTrendIcon(metric.trend) as any} 
                size={14} 
                color={getTrendColor(metric.trend)} 
              />
              <Text style={[styles.trendText, { color: getTrendColor(metric.trend) }]}>
                {metric.trend}
              </Text>
            </View>
          </View>
        </Animated.View>
      ))}
    </Animated.View>
  );

  const renderGoals = () => (
    <Animated.View entering={FadeInDown.delay(300)} style={styles.goalsContainer}>
      <Text style={styles.sectionTitle}>Health Goals</Text>
      {goals.map((goal, index) => (
        <Animated.View
          key={goal.id}
          entering={FadeInDown.delay(50 * index)}
          style={styles.goalCard}
        >
          <View style={styles.goalHeader}>
            <View style={[styles.goalIcon, { backgroundColor: goal.color + '20' }]}>
              <Ionicons name={goal.icon as any} size={20} color={goal.color} />
            </View>
            <View style={styles.goalInfo}>
              <Text style={styles.goalName}>{goal.metric}</Text>
              <Text style={styles.goalProgress}>
                {goal.current} / {goal.target} {goal.unit}
              </Text>
            </View>
            <Text style={styles.goalPercentage}>{goal.progress}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${goal.progress}%`, backgroundColor: goal.color }
              ]} 
            />
          </View>
        </Animated.View>
      ))}
    </Animated.View>
  );

  const renderInsights = () => (
    <Animated.View entering={FadeInDown.delay(400)} style={styles.insightsContainer}>
      <Text style={styles.sectionTitle}>Health Insights</Text>
      {insights.map((insight, index) => (
        <Animated.View
          key={insight.id}
          entering={FadeInDown.delay(50 * index)}
          style={styles.insightCard}
        >
          <View style={styles.insightHeader}>
            <View style={[
              styles.insightIcon,
              { backgroundColor: 
                insight.type === 'achievement' ? '#10B981' + '20' :
                insight.type === 'warning' ? '#EF4444' + '20' :
                insight.type === 'tip' ? '#3B82F6' + '20' :
                '#F59E0B' + '20'
              }
            ]}>
              <Ionicons 
                name={
                  insight.type === 'achievement' ? 'trophy' :
                  insight.type === 'warning' ? 'warning' :
                  insight.type === 'tip' ? 'bulb' :
                  'time'
                } 
                size={18} 
                color={
                  insight.type === 'achievement' ? '#10B981' :
                  insight.type === 'warning' ? '#EF4444' :
                  insight.type === 'tip' ? '#3B82F6' :
                  '#F59E0B'
                } 
              />
            </View>
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>{insight.title}</Text>
              <Text style={styles.insightDescription}>{insight.description}</Text>
            </View>
          </View>
          {insight.actionable && (
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>Take Action</Text>
              <Ionicons name="arrow-forward" size={14} color="#7C3AED" />
            </TouchableOpacity>
          )}
        </Animated.View>
      ))}
    </Animated.View>
  );

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'overview':
        return (
          <>
            {renderHealthScore()}
            {renderQuickStats()}
            {renderInsights()}
          </>
        );
      case 'vitals':
        return renderDetailedMetrics();
      case 'goals':
        return renderGoals();
      case 'history':
        return (
          <Animated.View entering={FadeInDown.delay(300)} style={styles.historyContainer}>
            <Text style={styles.sectionTitle}>Health History</Text>
            <View style={styles.comingSoonContainer}>
              <Ionicons name="time-outline" size={48} color={theme.colors.textSecondary} />
              <Text style={styles.comingSoonText}>Detailed health history and trends coming soon!</Text>
              <Text style={styles.comingSoonSubtext}>
                Track your progress over time with detailed charts and insights.
              </Text>
            </View>
          </Animated.View>
        );
      default:
        return null;
    }
  };

  const tabOptions = [
    { key: 'overview', label: 'Overview', icon: 'home' },
    { key: 'vitals', label: 'Vitals', icon: 'heart' },
    { key: 'goals', label: 'Goals', icon: 'flag' },
    { key: 'history', label: 'History', icon: 'time' },
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      flex: 1,
    },
    helpButton: {
      padding: 8,
    },
    tabContainer: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surface,
      paddingHorizontal: 16,
      paddingTop: 8,
      paddingBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    tabButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 8,
      borderRadius: 8,
    },
    activeTabButton: {
      backgroundColor: '#7C3AED' + '10',
    },
    tabText: {
      fontSize: 12,
      fontWeight: '500',
      color: theme.colors.textSecondary,
      marginLeft: 4,
    },
    activeTabText: {
      color: '#7C3AED',
      fontWeight: '600',
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.textPrimary,
      marginBottom: 16,
      paddingHorizontal: 20,
    },
    
    // Health Score Card
    healthScoreCard: {
      margin: 20,
      borderRadius: 16,
      overflow: 'hidden',
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    scoreGradient: {
      padding: 24,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    scoreContent: {
      flex: 1,
    },
    scoreLabel: {
      fontSize: 14,
      color: 'rgba(255,255,255,0.8)',
      marginBottom: 4,
    },
    scoreValue: {
      fontSize: 36,
      fontWeight: 'bold',
      color: '#FFFFFF',
      marginBottom: 4,
    },
    scoreSubtitle: {
      fontSize: 14,
      color: 'rgba(255,255,255,0.9)',
    },
    scoreIcon: {
      marginLeft: 16,
    },

    // Quick Stats
    quickStatsContainer: {
      marginBottom: 24,
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: 20,
      justifyContent: 'space-between',
    },
    statCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      width: (width - 60) / 2,
      marginBottom: 12,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
    },
    statHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    statIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
    },
    statValue: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.textPrimary,
      marginBottom: 2,
    },
    statUnit: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginBottom: 4,
    },
    statType: {
      fontSize: 10,
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },

    // Detailed Metrics
    detailedMetricsContainer: {
      marginBottom: 24,
    },
    metricCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      marginHorizontal: 20,
      marginBottom: 12,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
    },
    metricHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    metricInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    metricIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    metricText: {
      flex: 1,
    },
    metricName: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      marginBottom: 2,
    },
    metricTarget: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    metricValue: {
      alignItems: 'flex-end',
    },
    metricValueText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.textPrimary,
    },
    metricUnitText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    metricFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    statusText: {
      fontSize: 10,
      fontWeight: '600',
      color: '#FFFFFF',
      textTransform: 'uppercase',
    },
    trendContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    trendText: {
      fontSize: 12,
      fontWeight: '500',
      marginLeft: 4,
      textTransform: 'capitalize',
    },

    // Goals
    goalsContainer: {
      marginBottom: 24,
    },
    goalCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      marginHorizontal: 20,
      marginBottom: 12,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
    },
    goalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    goalIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    goalInfo: {
      flex: 1,
    },
    goalName: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      marginBottom: 2,
    },
    goalProgress: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    goalPercentage: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.textPrimary,
    },
    progressBar: {
      height: 6,
      backgroundColor: theme.colors.border,
      borderRadius: 3,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      borderRadius: 3,
    },

    // Insights
    insightsContainer: {
      marginBottom: 24,
    },
    insightCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      marginHorizontal: 20,
      marginBottom: 12,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
    },
    insightHeader: {
      flexDirection: 'row',
      marginBottom: 12,
    },
    insightIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
      marginTop: 2,
    },
    insightContent: {
      flex: 1,
    },
    insightTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      marginBottom: 4,
    },
    insightDescription: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      lineHeight: 18,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 8,
      paddingHorizontal: 12,
      backgroundColor: '#7C3AED' + '10',
      borderRadius: 8,
      alignSelf: 'flex-start',
    },
    actionButtonText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#7C3AED',
      marginRight: 4,
    },

    // History
    historyContainer: {
      marginBottom: 24,
      paddingHorizontal: 20,
    },
    comingSoonContainer: {
      alignItems: 'center',
      paddingVertical: 40,
    },
    comingSoonText: {
      fontSize: 16,
      color: theme.colors.textPrimary,
      textAlign: 'center',
      marginTop: 16,
      fontWeight: '600',
    },
    comingSoonSubtext: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginTop: 8,
      lineHeight: 20,
    },
  });

  return (
    <View style={styles.container}>
      <StatusBar 
        barStyle={isDark ? "light-content" : "dark-content"} 
        backgroundColor={theme.colors.background} 
      />
      <StandardHeader
        title="Health Metrics"
        showBackButton={true}
        rightComponent={
          <TouchableOpacity style={styles.helpButton}>
            <Ionicons name="add-circle-outline" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        }
      />

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {tabOptions.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tabButton,
              selectedTab === tab.key && styles.activeTabButton
            ]}
            onPress={() => setSelectedTab(tab.key as any)}
          >
            <Ionicons 
              name={tab.icon as any} 
              size={18} 
              color={selectedTab === tab.key ? '#7C3AED' : theme.colors.textSecondary} 
            />
            <Text style={[
              styles.tabText,
              selectedTab === tab.key && styles.activeTabText
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {renderTabContent()}
      </ScrollView>
    </View>
  );
}
