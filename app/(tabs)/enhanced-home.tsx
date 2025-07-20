import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';

export default function EnhancedHomeScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView 
        style={[styles.scrollView, { paddingTop: insets.top + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
            Enhanced Home
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Your health dashboard
          </Text>
        </View>
        
        <View style={styles.placeholder}>
          <Text style={[styles.placeholderText, { color: theme.colors.textSecondary }]}>
            Enhanced Home Dashboard Coming Soon
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 12,
    marginTop: 40,
  },
  placeholderText: {
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '500',
  },
});