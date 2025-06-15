import { View, type ViewProps } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'surface' | 'card' | 'elevated';
};

export function ThemedView({ 
  style, 
  lightColor, 
  darkColor, 
  type = 'default',
  ...otherProps 
}: ThemedViewProps) {
  const { theme } = useTheme();
  const fallbackBackgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');
  
  const getBackgroundColor = () => {
    if (lightColor || darkColor) {
      return fallbackBackgroundColor;
    }
    
    switch (type) {
      case 'surface':
        return theme.colors.surface;
      case 'card':
        return theme.colors.card.background;
      case 'elevated':
        return theme.colors.surfaceElevated;
      default:
        return theme.colors.background;
    }
  };

  return <View style={[{ backgroundColor: getBackgroundColor() }, style]} {...otherProps} />;
}
