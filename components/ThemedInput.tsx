import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  Text, 
  TouchableOpacity, 
  ViewStyle, 
  TextStyle, 
  TextInputProps 
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export interface ThemedInputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  variant?: 'default' | 'outline' | 'glass';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  inputStyle?: TextStyle;
  fullWidth?: boolean;
}

export default function ThemedInput({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  onRightIconPress,
  variant = 'default',
  size = 'medium',
  style,
  inputStyle,
  fullWidth = true,
  secureTextEntry,
  ...props
}: ThemedInputProps) {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isSecure, setIsSecure] = useState(secureTextEntry);

  const getContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      ...getSizeStyle(),
      borderWidth: 1,
    };

    if (fullWidth) {
      baseStyle.width = '100%';
    }

    const focusedStyle = isFocused ? {
      borderColor: theme.colors.primary,
      shadowColor: theme.colors.shadow.colored,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    } : {};

    const errorStyle = error ? {
      borderColor: theme.colors.error,
    } : {};

    switch (variant) {
      case 'outline':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderColor: error 
            ? theme.colors.error 
            : isFocused 
              ? theme.colors.primary 
              : theme.colors.textTertiary + '50',
          ...focusedStyle,
          ...errorStyle,
        };
      case 'glass':
        return {
          ...baseStyle,
          backgroundColor: theme.colors.glass.background,
          borderColor: error 
            ? theme.colors.error 
            : isFocused 
              ? theme.colors.primary 
              : theme.colors.glass.border,
          ...focusedStyle,
          ...errorStyle,
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: theme.colors.backgroundSecondary,
          borderColor: error 
            ? theme.colors.error 
            : isFocused 
              ? theme.colors.primary 
              : 'transparent',
          ...focusedStyle,
          ...errorStyle,
        };
    }
  };

  const getSizeStyle = (): ViewStyle => {
    switch (size) {
      case 'small':
        return { paddingHorizontal: 12, paddingVertical: 8, minHeight: 36 };
      case 'large':
        return { paddingHorizontal: 20, paddingVertical: 16, minHeight: 56 };
      default:
        return { paddingHorizontal: 16, paddingVertical: 12, minHeight: 44 };
    }
  };

  const getInputStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      flex: 1,
      color: theme.colors.textPrimary,
      ...getTextSizeStyle(),
    };

    return baseStyle;
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

  const getLabelStyle = (): TextStyle => {
    return {
      fontSize: 14,
      fontWeight: '500',
      color: error ? theme.colors.error : theme.colors.textSecondary,
      marginBottom: 8,
    };
  };

  const getHelperTextStyle = (): TextStyle => {
    return {
      fontSize: 12,
      color: error ? theme.colors.error : theme.colors.textTertiary,
      marginTop: 4,
    };
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
    if (error) return theme.colors.error;
    if (isFocused) return theme.colors.primary;
    return theme.colors.textTertiary;
  };

  const handleSecureToggle = () => {
    setIsSecure(!isSecure);
  };

  const renderRightIcon = () => {
    if (secureTextEntry) {
      return (
        <TouchableOpacity onPress={handleSecureToggle} style={{ marginLeft: 8 }}>
          <Ionicons 
            name={isSecure ? 'eye-off' : 'eye'} 
            size={getIconSize()} 
            color={getIconColor()} 
          />
        </TouchableOpacity>
      );
    }

    if (rightIcon) {
      return (
        <TouchableOpacity 
          onPress={onRightIconPress} 
          style={{ marginLeft: 8 }}
          disabled={!onRightIconPress}
        >
          <Ionicons 
            name={rightIcon} 
            size={getIconSize()} 
            color={getIconColor()} 
          />
        </TouchableOpacity>
      );
    }

    return null;
  };

  return (
    <View style={[{ width: fullWidth ? '100%' : undefined }, style]}>
      {label && <Text style={getLabelStyle()}>{label}</Text>}
      
      <View style={getContainerStyle()}>
        {leftIcon && (
          <Ionicons 
            name={leftIcon} 
            size={getIconSize()} 
            color={getIconColor()}
            style={{ marginRight: 8 }}
          />
        )}
        
        <TextInput
          style={[getInputStyle(), inputStyle]}
          placeholderTextColor={theme.colors.textTertiary}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={isSecure}
          {...props}
        />
        
        {renderRightIcon()}
      </View>
      
      {(error || helperText) && (
        <Text style={getHelperTextStyle()}>
          {error || helperText}
        </Text>
      )}
    </View>
  );
}
