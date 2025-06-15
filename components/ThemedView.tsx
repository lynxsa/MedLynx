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
  const defaultBackgroundColor = useThemeColor('background');
  
  const getBackgroundColor = () => {
    if (lightColor || darkColor) {
      return lightColor || darkColor;
    }
    
    switch (type) {
      case 'surface':
        return theme.colors.surface;
      case 'card':
        return theme.colors.card.background;
      case 'elevated':
        return theme.colors.surfaceElevated;
      default:
        return defaultBackgroundColor;
    }
  };

  return <View style={[{ backgroundColor: getBackgroundColor() }, style]} {...otherProps} />;
}
