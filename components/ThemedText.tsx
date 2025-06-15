import { StyleSheet, Text, type TextProps } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link' | 'caption' | 'headline';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const { theme } = useTheme();
  const defaultColor = useThemeColor('textPrimary');
  const color = lightColor || darkColor ? (lightColor || darkColor) : defaultColor;

  const getTypeStyle = () => {
    switch (type) {
      case 'title':
        return styles.title;
      case 'defaultSemiBold':
        return styles.defaultSemiBold;
      case 'subtitle':
        return styles.subtitle;
      case 'link':
        return [styles.link, { color: theme.colors.primary }];
      case 'caption':
        return styles.caption;
      case 'headline':
        return styles.headline;
      default:
        return styles.default;
    }
  };

  return (
    <Text
      style={[
        { color },
        getTypeStyle(),
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    opacity: 0.7,
  },
  headline: {
    fontSize: 28,
    fontWeight: 'bold',
    lineHeight: 36,
  },
});
