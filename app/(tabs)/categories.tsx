import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    FlatList,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { StandardHeader } from '../../components/StandardHeader';
import { useTheme } from '../../contexts/ThemeContext';

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  productCount: number;
  description: string;
  popular: boolean;
}

const CATEGORIES: Category[] = [
  {
    id: 'pain-relief',
    name: 'Pain Relief',
    icon: 'medical',
    color: '#E74C3C',
    productCount: 156,
    description: 'Headaches, muscle pain, and inflammation relief',
    popular: true,
  },
  {
    id: 'vitamins',
    name: 'Vitamins & Supplements',
    icon: 'fitness',
    color: '#27AE60',
    productCount: 284,
    description: 'Essential nutrients and dietary supplements',
    popular: true,
  },
  {
    id: 'skincare',
    name: 'Skincare & Beauty',
    icon: 'sparkles',
    color: '#F39C12',
    productCount: 198,
    description: 'Face care, moisturizers, and beauty products',
    popular: true,
  },
  {
    id: 'prescription',
    name: 'Prescription Medicines',
    icon: 'document-text',
    color: '#8E44AD',
    productCount: 342,
    description: 'Chronic conditions and prescribed medications',
    popular: true,
  },
  {
    id: 'baby-care',
    name: 'Baby & Child Care',
    icon: 'heart',
    color: '#E91E63',
    productCount: 127,
    description: 'Baby formula, diapers, and pediatric care',
    popular: false,
  },
  {
    id: 'oral-care',
    name: 'Oral Care',
    icon: 'happy',
    color: '#00BCD4',
    productCount: 89,
    description: 'Toothpaste, mouthwash, and dental hygiene',
    popular: false,
  },
  {
    id: 'first-aid',
    name: 'First Aid',
    icon: 'bandage',
    color: '#FF5722',
    productCount: 76,
    description: 'Bandages, antiseptics, and emergency care',
    popular: false,
  },
  {
    id: 'allergy',
    name: 'Allergy & Sinus',
    icon: 'leaf',
    color: '#4CAF50',
    productCount: 93,
    description: 'Antihistamines and sinus relief products',
    popular: false,
  },
  {
    id: 'digestive',
    name: 'Digestive Health',
    icon: 'restaurant',
    color: '#FF9800',
    productCount: 112,
    description: 'Stomach care, probiotics, and digestive aids',
    popular: false,
  },
  {
    id: 'eye-care',
    name: 'Eye Care',
    icon: 'eye',
    color: '#9C27B0',
    productCount: 54,
    description: 'Eye drops, contact solutions, and vision care',
    popular: false,
  },
  {
    id: 'sexual-wellness',
    name: 'Sexual Wellness',
    icon: 'heart-circle',
    color: '#E91E63',
    productCount: 67,
    description: 'Contraceptives, lubricants, and intimate care',
    popular: false,
  },
  {
    id: 'medical-devices',
    name: 'Medical Devices',
    icon: 'thermometer',
    color: '#607D8B',
    productCount: 45,
    description: 'Blood pressure monitors, thermometers, glucose meters',
    popular: false,
  },
];

export default function CategoriesScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [searchText, setSearchText] = useState('');
  const [showOnlyPopular, setShowOnlyPopular] = useState(false);

  const filteredCategories = CATEGORIES.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchText.toLowerCase()) ||
                         category.description.toLowerCase().includes(searchText.toLowerCase());
    const matchesFilter = !showOnlyPopular || category.popular;
    return matchesSearch && matchesFilter;
  });

  const renderCategory = ({ item: category, index }: { item: Category; index: number }) => (
    <Animated.View entering={FadeInDown.delay(50 * index)} style={styles.categoryCard}>
      <TouchableOpacity
        style={[styles.categoryCardContent, { backgroundColor: theme.colors.surface }]}
        onPress={() => {
          // Navigate to category products page
          // router.push(`/category-products?id=${category.id}` as any);
        }}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[`${category.color}15`, `${category.color}05`]}
          style={styles.categoryGradient}
        >
          <View style={styles.categoryHeader}>
            <View style={[styles.categoryIconContainer, { backgroundColor: `${category.color}20` }]}>
              <Ionicons name={category.icon as any} size={32} color={category.color} />
            </View>
            <View style={styles.categoryInfo}>
              <Text style={[styles.categoryName, { color: theme.colors.textPrimary }]}>
                {category.name}
              </Text>
              <Text style={[styles.categoryDescription, { color: theme.colors.textSecondary }]}>
                {category.description}
              </Text>
            </View>
            {category.popular && (
              <View style={[styles.popularBadge, { backgroundColor: '#FF6B35' }]}>
                <Text style={styles.popularText}>Popular</Text>
              </View>
            )}
          </View>

          <View style={styles.categoryFooter}>
            <View style={styles.productCount}>
              <Ionicons name="cube" size={16} color={theme.colors.textSecondary} />
              <Text style={[styles.productCountText, { color: theme.colors.textSecondary }]}>
                {category.productCount} products
              </Text>
            </View>
            <TouchableOpacity style={[styles.shopButton, { backgroundColor: category.color }]}>
              <Text style={styles.shopButtonText}>Shop Now</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} />
      
      <StandardHeader
        title="Categories"
        subtitle="Browse by product category"
        showBackButton
        onBackPress={() => router.back()}
        rightComponent={
          <TouchableOpacity onPress={() => setShowOnlyPopular(!showOnlyPopular)}>
            <Ionicons 
              name={showOnlyPopular ? "star" : "star-outline"} 
              size={24} 
              color={showOnlyPopular ? "#FFD700" : theme.colors.textPrimary} 
            />
          </TouchableOpacity>
        }
      />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: theme.colors.surface }]}>
          <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.textPrimary }]}
            placeholder="Search categories..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        {/* Filter Toggle */}
        <View style={styles.filterContainer}>
          <Text style={[styles.filterLabel, { color: theme.colors.textSecondary }]}>
            {showOnlyPopular ? 'Showing popular categories' : 'Showing all categories'}
          </Text>
          <Text style={[styles.resultCount, { color: theme.colors.textPrimary }]}>
            {filteredCategories.length} categories
          </Text>
        </View>
      </View>

      {/* Categories List */}
      <FlatList
        data={filteredCategories}
        keyExtractor={(item) => item.id}
        renderItem={renderCategory}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterLabel: {
    fontSize: 14,
  },
  resultCount: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  categoryCard: {
    marginBottom: 16,
  },
  categoryCardContent: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  categoryGradient: {
    padding: 20,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  categoryIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  popularBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  categoryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productCountText: {
    fontSize: 14,
    marginLeft: 6,
    fontWeight: '500',
  },
  shopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  shopButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 6,
  },
});
