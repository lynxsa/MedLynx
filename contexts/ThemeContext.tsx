import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance, ColorSchemeName } from 'react-native';
import { Theme, ThemeMode, getTheme } from '../constants/DynamicTheme';

// Theme Context Interface
export interface ThemeContextType { // Added export
  theme: Theme;
  themeMode: ThemeMode;
  isSystemTheme: boolean;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
  setSystemTheme: (useSystem: boolean) => void;
  isDark: boolean;
  isLight: boolean;
}

// Theme Context
export const ThemeContext = createContext<ThemeContextType | undefined>(undefined); // Added export

// Storage keys
const STORAGE_KEYS = {
  THEME_MODE: '@medlynx_theme_mode',
  USE_SYSTEM_THEME: '@medlynx_use_system_theme',
};

// Theme Provider Props
interface ThemeProviderProps {
  children: ReactNode;
  initialTheme?: ThemeMode;
}

// Theme Provider Component
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  initialTheme = 'light' 
}) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(initialTheme);
  const [isSystemTheme, setIsSystemTheme] = useState(false);
  const [theme, setTheme] = useState<Theme>(getTheme(initialTheme));

  // Get theme mode from system color scheme
  const getSystemThemeMode = (colorScheme: ColorSchemeName): ThemeMode => {
    return colorScheme === 'dark' ? 'dark' : 'light';
  };

  // Update theme and state
  const updateTheme = (mode: ThemeMode) => {
    setThemeModeState(mode);
    setTheme(getTheme(mode));
  };

  // Initialize theme from storage
  const initializeTheme = useCallback(async () => {
    try {
      const [storedThemeMode, storedUseSystem] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.THEME_MODE),
        AsyncStorage.getItem(STORAGE_KEYS.USE_SYSTEM_THEME),
      ]);

      const useSystem = storedUseSystem === 'true';
      setIsSystemTheme(useSystem);

      if (useSystem) {
        // Use system theme
        const systemColorScheme = Appearance.getColorScheme();
        const systemMode = getSystemThemeMode(systemColorScheme);
        updateTheme(systemMode);
      } else {
        // Use stored theme or default
        const mode = (storedThemeMode as ThemeMode) || 'light';
        updateTheme(mode);
      }
    } catch (error) {
      console.error('Error initializing theme:', error);
      // Fallback to light theme
      updateTheme('light');
    }
  }, []);

  // Initialize theme from storage and system preferences
  useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);

  // Listen to system theme changes
  useEffect(() => {
    if (isSystemTheme) {
      const subscription = Appearance.addChangeListener(({ colorScheme }) => {
        const systemMode = getSystemThemeMode(colorScheme);
        updateTheme(systemMode);
      });

      return () => subscription?.remove();
    }
  }, [isSystemTheme]);

  // Toggle between light and dark theme
  const toggleTheme = async () => {
    const newMode = themeMode === 'light' ? 'dark' : 'light';
    
    try {
      // Disable system theme when manually toggling
      setIsSystemTheme(false);
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.THEME_MODE, newMode],
        [STORAGE_KEYS.USE_SYSTEM_THEME, 'false'],
      ]);
      
      updateTheme(newMode);
    } catch (error) {
      console.error('Error toggling theme:', error);
    }
  };

  // Set specific theme mode
  const setThemeMode = async (mode: ThemeMode) => {
    try {
      // Disable system theme when manually setting
      setIsSystemTheme(false);
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.THEME_MODE, mode],
        [STORAGE_KEYS.USE_SYSTEM_THEME, 'false'],
      ]);
      
      updateTheme(mode);
    } catch (error) {
      console.error('Error setting theme mode:', error);
    }
  };

  // Enable/disable system theme
  const setSystemTheme = async (useSystem: boolean) => {
    try {
      setIsSystemTheme(useSystem);
      await AsyncStorage.setItem(STORAGE_KEYS.USE_SYSTEM_THEME, String(useSystem));

      if (useSystem) {
        // Switch to system theme
        const systemColorScheme = Appearance.getColorScheme();
        const systemMode = getSystemThemeMode(systemColorScheme);
        updateTheme(systemMode);
      } else {
        // Keep current theme but store it
        await AsyncStorage.setItem(STORAGE_KEYS.THEME_MODE, themeMode);
      }
    } catch (error) {
      console.error('Error setting system theme:', error);
    }
  };

  // Context value
  const contextValue: ThemeContextType = {
    theme,
    themeMode,
    isSystemTheme,
    toggleTheme,
    setThemeMode,
    setSystemTheme,
    isDark: themeMode === 'dark',
    isLight: themeMode === 'light',
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Custom hook for theme-aware styles
export const useThemedStyles = <T extends Record<string, any>>(
  createStyles: (theme: Theme) => T
): T => {
  const { theme } = useTheme();
  return createStyles(theme);
};

// Higher-order component for theme-aware components
export const withTheme = <P extends object>(
  Component: React.ComponentType<P & { theme: Theme }>
) => {
  const WrappedComponent = (props: P) => {
    const { theme: currentTheme } = useTheme(); // Renamed to avoid conflict with props
    return <Component {...props} theme={currentTheme} />;
  };
  
  WrappedComponent.displayName = `withTheme(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

// Theme utilities
export const ThemeUtils = {
  // Get contrast color (white or black) based on background
  getContrastColor: (backgroundColor: string, theme: Theme): string => {
    // Simple contrast logic - can be enhanced
    return theme.mode === 'dark' ? theme.colors.white : theme.colors.black;
  },
  
  // Get appropriate text color for surface
  getTextColorForSurface: (surfaceColor: string, theme: Theme): string => {
    return theme.colors.textOnSurface;
  },
  
  // Apply opacity to color
  applyOpacity: (color: string, opacity: number): string => {
    if (color.includes('rgba')) {
      return color.replace(/[\d\.]+\)$/g, `${opacity})`);
    }
    // Convert hex to rgba
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  },
};

export default ThemeProvider;
