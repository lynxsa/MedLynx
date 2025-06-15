import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { ColorPalette } from '../constants/DynamicTheme';
import { Ionicons } from '@expo/vector-icons';

const Disclaimer = () => {
  const { theme } = useTheme();
  const colors = theme.colors as ColorPalette;

  const styles = StyleSheet.create({
    container: {
      paddingHorizontal: 20,
      paddingVertical: 15,
      backgroundColor: colors.backgroundSecondary,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      alignItems: 'center',
      flexDirection: 'row',
    },
    icon: {
      marginRight: 10,
    },
    text: {
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: 'center',
      flex: 1,
    },
  });

  return (
    <View style={styles.container}>
      <Ionicons name="information-circle-outline" size={20} color={colors.textSecondary} style={styles.icon} />
      <Text style={styles.text}>
        MedLynx is for informational purposes only and does not constitute medical advice. Always consult with a healthcare professional for any health concerns or before making any decisions related to your health or treatment.
      </Text>
    </View>
  );
};

export default Disclaimer;
