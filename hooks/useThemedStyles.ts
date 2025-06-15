/**
 * Enhanced theme hook that provides easy access to all theme properties
 */

import { useTheme } from '../contexts/ThemeContext';
import { StyleSheet } from 'react-native';
import { Theme } from '../constants/DynamicTheme'; // Import Theme type

// Hook for themed styles - similar to enhanced-home pattern
export function useThemedStyles<T extends StyleSheet.NamedStyles<T>>(
  createStyles: (theme: Theme) => T // Use imported Theme type
) {
  const { theme } = useTheme();
  return createStyles(theme);
}

// Hook for theme colors shortcut
export function useThemeColors() {
  const { theme } = useTheme();
  return theme.colors;
}

// Hook for theme gradients shortcut
export function useThemeGradients() {
  const { theme } = useTheme();
  return theme.gradients;
}

// Hook for theme glass styles
export function useThemeGlass() {
  const { theme } = useTheme();
  return theme.glass;
}

// Hook for theme spacing
export function useThemeSpacing() {
  const { theme } = useTheme();
  return theme.spacing;
}

// Hook for theme typography
export function useThemeTypography() {
  const { theme } = useTheme();
  return theme.typography;
}
