import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme, useThemedStyles } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { Theme, Spacing } from '../constants/DynamicTheme'; // Import Spacing

interface GlassCardProps {
  children?: React.ReactNode;
  title?: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
  variant?: 'default' | 'large' | 'compact' | 'gradient' | 'flat'; // Added 'flat'
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  gradient?: string[];
  useBlur?: boolean; // New prop to control blur effect
}

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  blurOverlay: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.textPrimary,
  },
  subtitle: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.normal,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  
  // Stats Card Styles
  statsCard: {
    margin: theme.spacing.xs,
  },
  statsContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  statsText: {
    flex: 1,
  },
  statsValue: {
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.textPrimary,
  },
  statsUnit: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.normal,
    color: theme.colors.textSecondary,
  },
  statsTitle: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.medium,
    color: theme.colors.textSecondary,
  },
  // Added flat card style
  flatCard: {
    backgroundColor: theme.colors.surface, // Use surface color from theme
    borderRadius: 16, // Consistent with glass.card
    borderWidth: 1,
    borderColor: theme.colors.border, // Use general border color
    padding: theme.spacing.md, // Default padding
    // Optional: add subtle shadow if needed for flat cards, or keep it truly flat
    // shadowColor: theme.colors.shadow.light,
    // shadowOffset: { width: 0, height: 1 },
    // shadowOpacity: 0.05,
    // shadowRadius: 2,
    // elevation: 1,
  },
  
  // Welcome Card Styles
  welcomeCard: {
    marginBottom: theme.spacing.lg,
  },
  welcomeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  welcomeText: {
    flex: 1,
  },
  welcomeGreeting: {
    fontSize: theme.typography.fontSizes.base,
    fontWeight: theme.typography.fontWeights.normal,
    color: theme.colors.white,
    opacity: 0.9,
  },
  welcomeName: {
    fontSize: theme.typography.fontSizes['2xl'],
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.white,
    marginTop: 2,
  },
  welcomeSubtext: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.normal,
    color: theme.colors.white,
    opacity: 0.8,
    marginTop: 4,
  },
  welcomeIcon: {
    marginLeft: theme.spacing.md,
  },
});

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  title,
  subtitle,
  icon,
  onPress,
  style,
  titleStyle,
  subtitleStyle,
  variant = 'default',
  intensity = 70, // Default intensity slightly reduced for more subtlety
  tint = 'default',
  gradient,
  useBlur = true, // Default to true to maintain existing behavior
}) => {
  const { theme } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { colors } = theme; // Removed unused spacing and glass

  // Auto-adjust tint based on theme mode if not specified
  const blurTint = tint === 'default' ? (theme.mode === 'dark' ? 'dark' : 'light') : tint;

  const getCardStyle = () => {
    switch (variant) {
      case 'large':
        return theme.glass.cardLarge;
      case 'compact':
        return { ...theme.glass.card, padding: Spacing.sm }; // Use imported Spacing
      case 'gradient':
        return { ...theme.glass.card, backgroundColor: 'transparent' };
      case 'flat': // Handle flat variant
        return styles.flatCard;
      default:
        return theme.glass.card;
    }
  };

  const renderContent = () => (
    <View style={[styles.container, getCardStyle(), style]}>
      {(title || icon) && (
        <View style={styles.header}>
          {icon && (
            <View style={styles.iconContainer}>
              <Ionicons 
                name={icon} 
                size={24} 
                color={colors.primary} 
              />
            </View>
          )}
          <View style={styles.titleContainer}>
            {title && (
              <Text style={[styles.title, titleStyle]}>
                {title}
              </Text>
            )}
            {subtitle && (
              <Text style={[styles.subtitle, subtitleStyle]}>
                {subtitle}
              </Text>
            )}
          </View>
        </View>
      )}
      
      {children && (
        <View style={styles.content}>
          {children}
        </View>
      )}
    </View>
  );

  // If useBlur is false, render without BlurView
  if (!useBlur || variant === 'flat') {
    const cardStyle = getCardStyle();
    if (variant === 'gradient' && gradient) {
      return (
        <TouchableOpacity
          onPress={onPress}
          disabled={!onPress}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={gradient as [string, string, ...string[]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[cardStyle, { backgroundColor: 'transparent' }, style]} // Apply combined styles
          >
            {/* No BlurView here */}
            <View style={styles.container}>
              {(title || icon) && (
                <View style={styles.header}>
                  {icon && (
                    <View style={styles.iconContainer}>
                      <Ionicons
                        name={icon}
                        size={24}
                        color={colors.primary}
                      />
                    </View>
                  )}
                  <View style={styles.titleContainer}>
                    {title && (
                      <Text style={[styles.title, titleStyle]}>
                        {title}
                      </Text>
                    )}
                    {subtitle && (
                      <Text style={[styles.subtitle, subtitleStyle]}>
                        {subtitle}
                      </Text>
                    )}
                  </View>
                </View>
              )}
              {children && (
                <View style={styles.content}>
                  {children}
                </View>
              )}
            </View>
          </LinearGradient>
        </TouchableOpacity>
      );
    }

    // Standard non-blur view for 'flat' or when useBlur is false
    const OuterComponent = onPress ? TouchableOpacity : View;
    return (
      <OuterComponent
        {...(onPress && { onPress, activeOpacity: 0.8 })}
        style={[cardStyle, style]} // Apply combined styles
      >
        {/* No BlurView here */}
        <View style={styles.container}>
            {(title || icon) && (
              <View style={styles.header}>
                {icon && (
                  <View style={styles.iconContainer}>
                    <Ionicons
                      name={icon}
                      size={24}
                      color={colors.primary}
                    />
                  </View>
                )}
                <View style={styles.titleContainer}>
                  {title && (
                    <Text style={[styles.title, titleStyle]}>
                      {title}
                    </Text>
                  )}
                  {subtitle && (
                    <Text style={[styles.subtitle, subtitleStyle]}>
                      {subtitle}
                    </Text>
                  )}
                </View>
              </View>
            )}
            {children && (
              <View style={styles.content}>
                {children}
              </View>
            )}
          </View>
      </OuterComponent>
    );
  }


  // Original BlurView rendering path
  if (variant === 'gradient' && gradient) {
    return (
      <TouchableOpacity 
        onPress={onPress} 
        disabled={!onPress}
        activeOpacity={0.8}
        style={style}
      >
        <LinearGradient
          colors={gradient as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[getCardStyle(), { backgroundColor: 'transparent' }]}
        >
          <BlurView intensity={intensity} tint={blurTint} style={styles.blurOverlay}>
            {renderContent()}
          </BlurView>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (onPress) {
    return (
      <TouchableOpacity 
        onPress={onPress} 
        activeOpacity={0.8}
        style={style}
      >
        <BlurView intensity={intensity} tint={blurTint} style={getCardStyle()}>
          {renderContent()}
        </BlurView>
      </TouchableOpacity>
    );
  }

  return (
    <BlurView intensity={intensity} tint={blurTint} style={[getCardStyle(), style]}>
      {renderContent()}
    </BlurView>
  );
};

// Quick Glass Card variants for common use cases
export const HealthStatsCard: React.FC<{
  title: string;
  value: string | number;
  unit?: string;
  icon: keyof typeof Ionicons.glyphMap;
  color?: string;
  onPress?: () => void;
}> = ({ title, value, unit, icon, color, onPress }) => {
  const { theme } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { colors } = theme;
  
  return (
    <GlassCard
      variant="compact"
      onPress={onPress}
      style={styles.statsCard}
    >
      <View style={styles.statsContent}>
        <View style={[styles.statsIcon, { backgroundColor: (color || colors.primary) + '20' }]}>
          <Ionicons name={icon} size={20} color={color || colors.primary} />
        </View>
        <View style={styles.statsText}>
          <Text style={styles.statsValue}>
            {value}{unit && <Text style={styles.statsUnit}>{unit}</Text>}
          </Text>
          <Text style={styles.statsTitle}>{title}</Text>
        </View>
      </View>
    </GlassCard>
  );
};

export const WelcomeCard: React.FC<{
  userName: string;
  lastActive?: string;
  onViewProfile?: () => void;
}> = ({ userName, lastActive, onViewProfile }) => {
  const { theme } = useTheme();
  const styles = useThemedStyles(createStyles);
  
  return (
    <GlassCard
      variant="gradient"
      gradient={[...theme.gradients.primary]} // Spread to create a mutable array
      intensity={60}
      style={styles.welcomeCard}
      onPress={onViewProfile}
    >
      <View style={styles.welcomeContent}>
        <View style={styles.welcomeText}>
          <Text style={styles.welcomeGreeting}>Welcome back,</Text>
          <Text style={styles.welcomeName}>{userName}!</Text>
          {lastActive && (
            <Text style={styles.welcomeSubtext}>Last active: {lastActive}</Text>
          )}
        </View>
        <View style={styles.welcomeIcon}>
          <Ionicons name="medical" size={32} color={theme.colors.white} />
        </View>
      </View>
    </GlassCard>
  );
};

export default GlassCard;
