import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native'; // Added ScrollView
import { useTheme } from '../../contexts/ThemeContext';
import Disclaimer from '../../components/Disclaimer'; // Import Disclaimer component
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // Import for safe area

export default function EnhancedHomeScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets(); // Get safe area insets

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom }]} // Add bottom padding for safe area
      >
        <Text style={[styles.text, { color: theme.colors.textPrimary }]}>
          Welcome to MedLynx!
        </Text>
        <Text style={[styles.subText, { color: theme.colors.textSecondary }]}>
          This is your enhanced home screen. More features coming soon!
        </Text>
        {/* Add more content here as needed */}
      </ScrollView>
      <Disclaimer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: 'center', // Removed to allow ScrollView to manage content
    // alignItems: 'center', // Removed for ScrollView
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1, // Ensures content can grow and be scrollable
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    fontSize: 24, // Increased font size
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
});
