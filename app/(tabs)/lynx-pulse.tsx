import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    Image,
    ImageSourcePropType,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '../../contexts/ThemeContext';

const { width } = Dimensions.get('window');

interface HealthArticle {
  id: string;
  title: string;
  description: string;
  image: ImageSourcePropType;
  category: string;
  readTime: string;
  route: string;
  publishedDate: string;
  author: string;
  featured?: boolean;
}

interface Category {
  id: string;
  name: string;
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const CATEGORIES: Category[] = [
  { id: 'all', name: 'All Articles', color: '#7C3AED', icon: 'grid-outline' },
  { id: 'cardiovascular', name: 'Heart Health', color: '#DC2626', icon: 'heart-outline' },
  { id: 'medication', name: 'Medication Safety', color: '#059669', icon: 'medical-outline' },
  { id: 'sleep', name: 'Sleep Health', color: '#0891B2', icon: 'moon-outline' },
  { id: 'chronic', name: 'Chronic Care', color: '#C2410C', icon: 'shield-checkmark-outline' },
  { id: 'nutrition', name: 'Nutrition', color: '#16A34A', icon: 'nutrition-outline' },
  { id: 'exercise', name: 'Exercise & Fitness', color: '#9333EA', icon: 'fitness-outline' },
  { id: 'mental', name: 'Mental Health', color: '#2563EB', icon: 'happy-outline' },
];

const ALL_CATEGORY = 'all';

const HEALTH_ARTICLES: HealthArticle[] = [
  // Existing articles
  {
    id: '1',
    title: 'Understanding Blood Pressure',
    description: 'Learn how to monitor and maintain healthy blood pressure levels with practical tips and insights.',
    image: require('../../assets/images/MedLynx-11.jpeg'),
    category: 'cardiovascular',
    readTime: '3 min read',
    route: '/understanding-blood-pressure',
    publishedDate: '2024-01-15',
    author: 'Dr. LYNX Medical Team',
    featured: true,
  },
  {
    id: '2',
    title: 'Medication Safety Tips',
    description: 'Essential guidelines for safe medication usage, storage, and understanding potential interactions.',
    image: require('../../assets/images/MedLynx-12.jpeg'),
    category: 'medication',
    readTime: '4 min read',
    route: '/medication-safety-tips',
    publishedDate: '2024-01-12',
    author: 'Dr. LYNX Medical Team',
    featured: true,
  },
  {
    id: '3',
    title: 'Healthy Sleep Habits',
    description: 'Improve your sleep quality with these evidence-based tips and create a better bedtime routine.',
    image: require('../../assets/images/MedLynx-13.jpeg'),
    category: 'sleep',
    readTime: '5 min read',
    route: '/healthy-sleep-habits',
    publishedDate: '2024-01-10',
    author: 'Dr. LYNX Medical Team',
  },
  {
    id: '4',
    title: 'Managing Chronic Conditions',
    description: 'Comprehensive strategies for living well with chronic health conditions and improving quality of life.',
    image: require('../../assets/images/MedLynx-14.jpeg'),
    category: 'chronic',
    readTime: '6 min read',
    route: '/managing-chronic-conditions',
    publishedDate: '2024-01-08',
    author: 'Dr. LYNX Medical Team',
  },
  // Additional articles
  {
    id: '5',
    title: 'Heart-Healthy Diet Essentials',
    description: 'Discover the best foods for cardiovascular health and learn how nutrition impacts heart function.',
    image: require('../../assets/images/MedLynx-11.jpeg'),
    category: 'cardiovascular',
    readTime: '4 min read',
    route: '/lynx-pulse', // Placeholder for future article
    publishedDate: '2024-01-05',
    author: 'Nutritionist Sarah Johnson',
  },
  {
    id: '6',
    title: 'Exercise Benefits for Mental Health',
    description: 'How regular physical activity can improve mood, reduce stress, and boost overall mental wellbeing.',
    image: require('../../assets/images/MedLynx-13.jpeg'),
    category: 'exercise',
    readTime: '3 min read',
    route: '/lynx-pulse', // Placeholder for future article
    publishedDate: '2024-01-03',
    author: 'Dr. Michael Roberts',
  },
  {
    id: '7',
    title: 'Nutrition Facts: Reading Food Labels',
    description: 'A comprehensive guide to understanding food labels and making healthier choices at the grocery store.',
    image: require('../../assets/images/MedLynx-12.jpeg'),
    category: 'nutrition',
    readTime: '5 min read',
    route: '/lynx-pulse', // Placeholder for future article
    publishedDate: '2024-01-01',
    author: 'Dietitian Lisa Chen',
  },
  {
    id: '8',
    title: 'Stress Management Techniques',
    description: 'Practical strategies for managing daily stress and maintaining good mental health in busy times.',
    image: require('../../assets/images/MedLynx-14.jpeg'),
    category: 'mental',
    readTime: '4 min read',
    route: '/lynx-pulse', // Placeholder for future article
    publishedDate: '2023-12-28',
    author: 'Psychologist Dr. Anna Kim',
  },
  {
    id: '9',
    title: 'Home Workout Essentials',
    description: 'Create an effective home fitness routine with simple equipment and bodyweight exercises.',
    image: require('../../assets/images/MedLynx-11.jpeg'),
    category: 'exercise',
    readTime: '6 min read',
    route: '/lynx-pulse', // Placeholder for future article
    publishedDate: '2023-12-25',
    author: 'Fitness Coach Tom Wilson',
  },
  {
    id: '10',
    title: 'Diabetes Prevention Guidelines',
    description: 'Evidence-based strategies for preventing type 2 diabetes through lifestyle modifications.',
    image: require('../../assets/images/MedLynx-13.jpeg'),
    category: 'chronic',
    readTime: '5 min read',
    route: '/lynx-pulse', // Placeholder for future article
    publishedDate: '2023-12-22',
    author: 'Dr. LYNX Medical Team',
  },
];

export default function LynxPulseScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORY);

  const filteredArticles = selectedCategory === ALL_CATEGORY 
    ? HEALTH_ARTICLES 
    : HEALTH_ARTICLES.filter(article => article.category === selectedCategory);

  const featuredArticles = HEALTH_ARTICLES.filter(article => article.featured);

  const getCategoryInfo = (categoryId: string) => {
    return CATEGORIES.find(cat => cat.id === categoryId) || CATEGORIES[0];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const ArticleCard = ({ article, featured = false }: { article: HealthArticle; featured?: boolean }) => {
    const categoryInfo = getCategoryInfo(article.category);
    
    return (
      <Animated.View
        entering={FadeInDown}
        style={[
          featured ? styles.featuredArticleCard : styles.articleCard,
          { backgroundColor: theme.colors.surface }
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push(article.route as any)}
          style={styles.articleButton}
        >
          <View style={featured ? styles.featuredImageContainer : styles.imageContainer}>
            <Image 
              source={article.image} 
              style={featured ? styles.featuredArticleImage : styles.articleImage}
              resizeMode="cover"
            />
            <LinearGradient
              colors={featured ? ['transparent', 'rgba(0,0,0,0.8)'] : ['transparent', 'rgba(0,0,0,0.3)']}
              style={featured ? styles.featuredGradientOverlay : styles.gradientOverlay}
            />
            {featured && (
              <View style={styles.featuredBadge}>
                <Ionicons name="star" size={12} color="#FFD700" />
                <Text style={styles.featuredText}>Featured</Text>
              </View>
            )}
            <View style={[styles.categoryBadge, { backgroundColor: categoryInfo.color }]}>
              <Text style={styles.categoryBadgeText}>{categoryInfo.name}</Text>
            </View>
          </View>
          
          <View style={styles.articleContent}>
            <Text 
              style={[
                featured ? styles.featuredArticleTitle : styles.articleTitle,
                { color: theme.colors.textPrimary }
              ]}
              numberOfLines={featured ? 2 : 2}
            >
              {article.title}
            </Text>
            <Text 
              style={[
                featured ? styles.featuredArticleDescription : styles.articleDescription,
                { color: theme.colors.textSecondary }
              ]}
              numberOfLines={featured ? 3 : 2}
            >
              {article.description}
            </Text>
            
            <View style={styles.articleMeta}>
              <View style={styles.authorInfo}>
                <Ionicons name="person-circle-outline" size={16} color={theme.colors.textSecondary} />
                <Text style={[styles.authorName, { color: theme.colors.textSecondary }]}>
                  {article.author}
                </Text>
              </View>
              <View style={styles.articleStats}>
                <View style={styles.metaItem}>
                  <Ionicons name="time-outline" size={12} color={theme.colors.textSecondary} />
                  <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
                    {article.readTime}
                  </Text>
                </View>
                <Text style={[styles.publishDate, { color: theme.colors.textSecondary }]}>
                  {formatDate(article.publishedDate)}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={['#7C3AED', '#8B5CF6', '#A855F7']}
        style={[styles.header, { paddingTop: insets.top }]}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>LynxPulse</Text>
            <Text style={styles.headerSubtitle}>Health News & Tips</Text>
          </View>
          
          <TouchableOpacity style={styles.searchButton}>
            <Ionicons name="search" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Category Filter */}
        <View style={styles.categorySection}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScrollContent}
          >
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryFilter,
                  { 
                    backgroundColor: selectedCategory === category.id ? category.color : theme.colors.surface,
                    borderColor: category.color
                  }
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Ionicons 
                  name={category.icon} 
                  size={16} 
                  color={selectedCategory === category.id ? 'white' : category.color} 
                />
                <Text 
                  style={[
                    styles.categoryFilterText,
                    { color: selectedCategory === category.id ? 'white' : category.color }
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Featured Articles */}
        {(() => {
          if (selectedCategory === ALL_CATEGORY && featuredArticles.length > 0) {
            return (
              <View style={styles.featuredSection}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
                    Featured Articles
                  </Text>
                </View>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.featuredScrollContent}
                >
                  {featuredArticles.map((article) => (
                    <ArticleCard key={article.id} article={article} featured={true} />
                  ))}
                </ScrollView>
              </View>
            );
          }
          return null;
        })()}

        {/* All Articles */}
        <View style={styles.articlesSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
              {selectedCategory === ALL_CATEGORY ? 'All Articles' : getCategoryInfo(selectedCategory).name}
            </Text>
            <Text style={[styles.articleCount, { color: theme.colors.textSecondary }]}>
              {filteredArticles.length} articles
            </Text>
          </View>
          
          <View style={styles.articlesGrid}>
            {filteredArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  backButton: {
    padding: 8,
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  searchButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  categorySection: {
    paddingVertical: 20,
  },
  categoryScrollContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  categoryFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 8,
  },
  categoryFilterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  featuredSection: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  articleCount: {
    fontSize: 14,
  },
  featuredScrollContent: {
    paddingHorizontal: 20,
    gap: 15,
  },
  featuredArticleCard: {
    width: width * 0.8,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  articleButton: {
    flex: 1,
  },
  featuredImageContainer: {
    height: 200,
    position: 'relative',
  },
  featuredArticleImage: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  featuredGradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '100%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  featuredBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  featuredText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#333',
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'white',
  },
  articleContent: {
    padding: 16,
  },
  featuredArticleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    lineHeight: 24,
  },
  featuredArticleDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  articleMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  authorName: {
    fontSize: 12,
    fontWeight: '500',
  },
  articleStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
  },
  publishDate: {
    fontSize: 12,
  },
  articlesSection: {
    paddingHorizontal: 20,
  },
  articlesGrid: {
    gap: 16,
  },
  articleCard: {
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    height: 120,
    position: 'relative',
  },
  articleImage: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  articleTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
    lineHeight: 22,
  },
  articleDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
  },
});
