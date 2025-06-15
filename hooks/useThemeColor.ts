/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { useContext } from 'react';
import { ThemeContext, type ThemeContextType as ImportedThemeContextType } from '../contexts/ThemeContext';
import { ColorPalette, ThemeMode, Theme, getTheme } from '../constants/DynamicTheme'; // Added getTheme

// Re-exporting the context type for external use if needed
export type ThemeContextType = ImportedThemeContextType;

// Custom hook to access theme context
export const useTheme = (): ImportedThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Overload signatures for useThemeColor
export function useThemeColor(colorName?: undefined, specificMode?: ThemeMode): ColorPalette;
export function useThemeColor<K extends keyof ColorPalette>(colorName: K, specificMode?: ThemeMode): ColorPalette[K];

// Implementation of useThemeColor
export function useThemeColor<K extends keyof ColorPalette>(
  colorName?: K,
  specificMode?: ThemeMode
): ColorPalette | ColorPalette[K] {
  const { theme, themeMode: currentContextThemeMode } = useTheme();

  let colorsToUse: ColorPalette;

  if (specificMode && specificMode !== currentContextThemeMode) {
    // If a specific mode is requested that differs from the current context,
    // fetch the theme object for that specific mode.
    colorsToUse = getTheme(specificMode).colors;
  } else {
    // Otherwise, use the colors from the current theme context.
    colorsToUse = theme.colors;
  }

  if (colorName) {
    return colorsToUse[colorName];
  }
  return colorsToUse;
}


// Hook to get the current theme object (includes colors, typography, spacing, etc.)
export const useCurrentTheme = (): Theme => {
  const { theme } = useTheme();
  return theme;
};

// Hook to get the current theme mode ('light' | 'dark')
export const useThemeMode = (): ThemeMode => {
  const { themeMode } = useTheme();
  return themeMode;
};

// Hook to check if the current theme is dark
export const useIsDarkTheme = (): boolean => {
  const { isDark } = useTheme();
  return isDark;
};

// Hook to check if the current theme is light
export const useIsLightTheme = (): boolean => {
  const { isLight } = useTheme();
  return isLight;
};

// Example of a more specific hook if you frequently access a particular style set
export const useCardStyles = () => {
  const { theme } = useTheme();
  return theme.components.card; 
};
