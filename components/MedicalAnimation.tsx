import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '../hooks/useThemeColor';
import { ColorPalette } from '../constants/DynamicTheme'; // Import ColorPalette

// Helper type to extract keys of ColorPalette that map to string values
type StringColorName = {
  [K in keyof ColorPalette]: ColorPalette[K] extends string ? K : never;
}[keyof ColorPalette];

interface MedicalAnimationProps {
  type: 'heart' | 'pill' | 'stethoscope' | 'medical' | 'fitness' | 'pulse';
  size?: number;
  colorName?: StringColorName; // Use the refined type for input
}

export default function MedicalAnimation({
  type,
  size = 48,
  colorName = 'primary', // 'primary' should be a StringColorName
}: MedicalAnimationProps) {
  // colorName is StringColorName.
  // useThemeColor(colorName) returns `string | object | ...` due to its signature.
  // However, because colorName is StringColorName, we expect a string.
  const themedColor = useThemeColor(colorName) as string; // Assert to string

  const getIconName = () => {
    switch (type) {
      case 'heart':
        return 'heart';
      case 'pill':
        return 'medical';
      case 'stethoscope':
        return 'medical-outline';
      case 'medical':
        return 'medical-outline';
      case 'fitness':
        return 'fitness';
      case 'pulse':
        return 'pulse';
      default:
        return 'medical';
    }
  };

  // TODO: Replace with FastImage when GIF assets are available
  // Example implementation for when you have GIF assets:
  /*
  const getGifSource = () => {
    switch (type) {
      case 'heart':
        return require('../assets/gifs/heart-beating.gif');
      case 'pill':
        return require('../assets/gifs/pill-dissolve.gif');
      case 'stethoscope':
        return require('../assets/gifs/stethoscope-pulse.gif');
      default:
        return require('../assets/gifs/medical-default.gif');
    }
  };

  return (
    <View style={styles.container}>
      <FastImage
        style={[styles.animation, { width: size, height: size }]}
        source={getGifSource()}
        resizeMode={FastImage.resizeMode.contain}
      />
    </View>
  );
  */

  return (
    <View style={[styles.container, { width: size + 20, height: size + 20 }]}>
      <View style={[styles.iconBackground, { backgroundColor: `${themedColor}20` }]}>
        <Ionicons
          name={getIconName() as any}
          size={size}
          color={themedColor}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBackground: {
    borderRadius: 50,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  animation: {
    // For FastImage when GIFs are added
  },
});
