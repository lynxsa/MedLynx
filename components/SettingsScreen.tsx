import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useThemedStyles } from '../contexts/ThemeContext';
import { GlassCard } from './ThemedGlassCard';
import { Theme } from '../constants/DynamicTheme';

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
  },
  header: {
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: theme.typography.fontSizes['3xl'],
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  headerSubtitle: {
    fontSize: theme.typography.fontSizes.base,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: theme.typography.fontSizes.base,
    fontWeight: theme.typography.fontWeights.medium,
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    marginHorizontal: theme.spacing.xs,
    borderRadius: 12,
    marginBottom: theme.spacing.xs,
  },
  themeOptionActive: {
    backgroundColor: theme.colors.primary + '20',
  },
  themeOptionText: {
    fontSize: theme.typography.fontSizes.base,
    color: theme.colors.textPrimary,
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  themeOptionActiveText: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeights.medium,
  },
  previewCard: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.lg,
  },
  previewTitle: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  previewText: {
    fontSize: theme.typography.fontSizes.base,
    color: theme.colors.textSecondary,
    lineHeight: 24,
  },
});

export const SettingsScreen: React.FC = () => {
  const { theme, themeMode, isSystemTheme, toggleTheme, setThemeMode, setSystemTheme } = useTheme();
  const styles = useThemedStyles(createStyles);

  const handleThemeSelection = (mode: 'light' | 'dark' | 'system') => {
    if (mode === 'system') {
      setSystemTheme(true);
    } else {
      setThemeMode(mode);
    }
  };

  const ThemeOption: React.FC<{
    mode: 'light' | 'dark' | 'system';
    title: string;
    description: string;
    icon: keyof typeof Ionicons.glyphMap;
  }> = ({ mode, title, description, icon }) => {
    const isActive = mode === 'system' ? isSystemTheme : (!isSystemTheme && themeMode === mode);
    
    return (
      <TouchableOpacity
        style={[styles.themeOption, isActive && styles.themeOptionActive]}
        onPress={() => handleThemeSelection(mode)}
      >
        <Ionicons 
          name={icon} 
          size={24} 
          color={isActive ? theme.colors.primary : theme.colors.textSecondary} 
        />
        <View style={{ flex: 1, marginLeft: theme.spacing.sm }}>
          <Text style={[styles.themeOptionText, isActive && styles.themeOptionActiveText]}>
            {title}
          </Text>
          <Text style={[styles.settingDescription, { marginTop: 2 }]}>
            {description}
          </Text>
        </View>
        {isActive && (
          <Ionicons 
            name="checkmark-circle" 
            size={20} 
            color={theme.colors.primary} 
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
          <Text style={styles.headerSubtitle}>
            Customize your MedLynx experience
          </Text>
        </View>

        {/* Theme Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          
          <GlassCard>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: theme.colors.primary + '20' }]}>
                  <Ionicons name="color-palette" size={24} color={theme.colors.primary} />
                </View>
                <View style={styles.settingContent}>
                  <Text style={styles.settingTitle}>Theme</Text>
                  <Text style={styles.settingDescription}>
                    Choose your preferred theme
                  </Text>
                </View>
              </View>
            </View>
            
            <ThemeOption
              mode="light"
              title="Light"
              description="Clean and bright appearance"
              icon="sunny"
            />
            
            <ThemeOption
              mode="dark"
              title="Dark"
              description="Easy on the eyes in low light"
              icon="moon"
            />
            
            <ThemeOption
              mode="system"
              title="System"
              description="Match your device's appearance"
              icon="phone-portrait"
            />
          </GlassCard>
        </View>

        {/* Quick Theme Toggle */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <GlassCard>
            <TouchableOpacity style={styles.settingItem} onPress={toggleTheme}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: theme.colors.secondary + '20' }]}>
                  <Ionicons 
                    name={theme.mode === 'dark' ? 'moon' : 'sunny'} 
                    size={24} 
                    color={theme.colors.secondary} 
                  />
                </View>
                <View style={styles.settingContent}>
                  <Text style={styles.settingTitle}>Toggle Theme</Text>
                  <Text style={styles.settingDescription}>
                    Switch between light and dark mode
                  </Text>
                </View>
              </View>
              <Ionicons name="swap-horizontal" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </GlassCard>
        </View>

        {/* Theme Preview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preview</Text>
          
          <GlassCard style={styles.previewCard}>
            <Text style={styles.previewTitle}>
              Current Theme: {theme.mode === 'dark' ? 'Dark' : 'Light'} Mode
            </Text>
            <Text style={styles.previewText}>
              This is how your app will look with the current theme settings. 
              The colors, text, and interface elements are all optimized for 
              {theme.mode === 'dark' ? ' low-light environments' : ' bright environments'} 
              and provide excellent readability and visual comfort.
            </Text>
          </GlassCard>
        </View>

        {/* Other Settings Sections (Placeholder) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Health & Privacy</Text>
          
          <GlassCard>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: theme.colors.healthGreen + '20' }]}>
                  <Ionicons name="shield-checkmark" size={24} color={theme.colors.healthGreen} />
                </View>
                <View style={styles.settingContent}>
                  <Text style={styles.settingTitle}>Data Privacy</Text>
                  <Text style={styles.settingDescription}>
                    Manage your health data privacy settings
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
            </View>
          </GlassCard>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <GlassCard>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: theme.colors.info + '20' }]}>
                  <Ionicons name="notifications" size={24} color={theme.colors.info} />
                </View>
                <View style={styles.settingContent}>
                  <Text style={styles.settingTitle}>Medication Reminders</Text>
                  <Text style={styles.settingDescription}>
                    Get notified when it&apos;s time to take your medicine
                  </Text>
                </View>
              </View>
              <Switch
                value={true}
                onValueChange={() => {}}
                trackColor={{ false: theme.colors.textTertiary, true: theme.colors.primary }}
                thumbColor={theme.colors.white}
              />
            </View>
          </GlassCard>
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: theme.spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsScreen;
