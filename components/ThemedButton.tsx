import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export interface ThemedButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'glass';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export default function ThemedButton({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  fullWidth = false,
}: ThemedButtonProps) {
  const { theme } = useTheme();

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      ...getSizeStyle(),
    };

    if (fullWidth) {
      baseStyle.width = '100%';
    }

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: disabled ? theme.colors.textTertiary : theme.colors.primary,
          shadowColor: theme.colors.shadow.medium,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        };
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: disabled ? theme.colors.textTertiary : theme.colors.secondary,
          shadowColor: theme.colors.shadow.medium,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: 4,
        };
      case 'outline':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderColor: disabled ? theme.colors.textTertiary : theme.colors.primary,
        };
      case 'ghost':
        return {
          ...baseStyle,
          backgroundColor: disabled 
            ? theme.colors.textTertiary + '20' 
            : theme.colors.primary + '20',
        };
      case 'glass':
        return {
          ...baseStyle,
          backgroundColor: theme.colors.glass.background,
          borderWidth: 1,
          borderColor: theme.colors.glass.border,
          shadowColor: theme.colors.shadow.light,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        };
      default:
        return baseStyle;
    }
  };

  const getSizeStyle = (): ViewStyle => {
    switch (size) {
      case 'small':
        return { paddingHorizontal: 16, paddingVertical: 8, minHeight: 36 };
      case 'large':
        return { paddingHorizontal: 24, paddingVertical: 16, minHeight: 56 };
      default:
        return { paddingHorizontal: 20, paddingVertical: 12, minHeight: 44 };
    }
  };

  const getTextStyle = (): TextStyle => {
    const baseTextStyle: TextStyle = {
      fontWeight: '600',
      textAlign: 'center',
      ...getTextSizeStyle(),
    };

    switch (variant) {
      case 'outline':
        return {
          ...baseTextStyle,
          color: disabled ? theme.colors.textTertiary : theme.colors.primary,
        };
      case 'ghost':
        return {
          ...baseTextStyle,
          color: disabled ? theme.colors.textTertiary : theme.colors.primary,
        };
      case 'glass':
        return {
          ...baseTextStyle,
          color: disabled ? theme.colors.textTertiary : theme.colors.textPrimary,
        };
      default:
        return {
          ...baseTextStyle,
          color: disabled ? theme.colors.textTertiary : theme.colors.white,
        };
    }
  };

  const getTextSizeStyle = (): TextStyle => {
    switch (size) {
      case 'small':
        return { fontSize: 14, lineHeight: 20 };
      case 'large':
        return { fontSize: 18, lineHeight: 24 };
      default:
        return { fontSize: 16, lineHeight: 22 };
    }
  };

  const getIconSize = (): number => {
    switch (size) {
      case 'small':
        return 16;
      case 'large':
        return 24;
      default:
        return 20;
    }
  };

  const getIconColor = (): string => {
    if (disabled) return theme.colors.textTertiary;
    
    switch (variant) {
      case 'outline':
      case 'ghost':
        return theme.colors.primary;
      case 'glass':
        return theme.colors.textPrimary;
      default:
        return theme.colors.white;
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator 
          size="small" 
          color={variant === 'outline' || variant === 'ghost' || variant === 'glass' ? theme.colors.primary : theme.colors.white} 
        />
      );
    }

    const iconElement = icon ? (
      <Ionicons 
        name={icon} 
        size={getIconSize()} 
        color={getIconColor()}
        style={{ marginHorizontal: 4 }}
      />
    ) : null;

    const textElement = (
      <Text style={[getTextStyle(), textStyle]}>
        {title}
      </Text>
    );

    if (!icon) return textElement;

    return iconPosition === 'left' ? (
      <>
        {iconElement}
        {textElement}
      </>
    ) : (
      <>
        {textElement}
        {iconElement}
      </>
    );
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {renderContent()}
    </TouchableOpacity>
  );
}
