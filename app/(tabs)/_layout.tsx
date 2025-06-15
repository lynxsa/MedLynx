import React from 'react';
import { Tabs } from 'expo-router'; // Removed Stack
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { ColorPalette } from '../../constants/DynamicTheme';
import '../../i18n/i18n'; // Initialize i18n

// Define a type for TabBarIcon props
type TabBarIconProps = {
  focused: boolean;
  color: string;
  size: number;
};

// Helper function to generate TabBar icons
const TabBarIconComponent = ({ name, focused, color, size }: TabBarIconProps & { name: keyof typeof Ionicons.glyphMap }) => {
  return <Ionicons name={name} size={size} color={color} />;
};
TabBarIconComponent.displayName = 'TabBarIconComponent'; // Add display name

export default function TabLayout() {
  const { theme } = useTheme(); // Removed isDark
  const colors = theme.colors as ColorPalette;

  const getTabBarIcon = (routeName: string) => {
    // This function now returns another function that will render TabBarIconComponent
    const IconProvider = ({ focused, color, size }: TabBarIconProps) => {
      let iconName: keyof typeof Ionicons.glyphMap;
      switch (routeName) {
        case 'index':
          iconName = focused ? 'home' : 'home-outline';
          break;
        case 'calendar':
          iconName = focused ? 'calendar' : 'calendar-outline';
          break;
        case 'dr-lynx':
          iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          break;
        case 'profile':
          iconName = focused ? 'person-circle' : 'person-circle-outline';
          break;
        default:
          iconName = 'ellipse-outline';
          break;
      }
      return <TabBarIconComponent name={iconName} focused={focused} color={color} size={size} />;
    };
    IconProvider.displayName = `TabBarIcon_${routeName}`;
    return IconProvider;
  };

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarStyle: {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: getTabBarIcon('index'),
          }}
        />
        <Tabs.Screen
          name="calendar"
          options={{
            title: 'Calendar',
            tabBarIcon: getTabBarIcon('calendar'),
          }}
        />
        <Tabs.Screen
          name="dr-lynx"
          options={{
            title: 'Dr. LYNX',
            tabBarIcon: getTabBarIcon('dr-lynx'),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: getTabBarIcon('profile'),
          }}
        />

        {/* Screens not part of the TabBar but part of the (tabs) group */}
        <Tabs.Screen name="auth" options={{ href: null }} />
        <Tabs.Screen name="home" options={{ href: null }} />
        <Tabs.Screen name="enhanced-home" options={{ href: null }} />
        <Tabs.Screen name="debug" options={{ href: null }} />
        <Tabs.Screen name="food-scan" options={{ href: null }} />
        <Tabs.Screen name="add-medication" options={{ href: null }} />
        <Tabs.Screen name="medication-detail" options={{ href: null }} />
        <Tabs.Screen name="onboarding" options={{ href: null }} />
        <Tabs.Screen name="onboarding-debug" options={{ href: null }} />
        <Tabs.Screen name="notification-test" options={{ href: null }} />
        <Tabs.Screen name="vibrant-onboarding" options={{ href: null }} />
        <Tabs.Screen name="health-directory" options={{ href: null }} />
        <Tabs.Screen name="health-metrics" options={{ href: null }} />
        <Tabs.Screen name="prescription-refills" options={{ href: null }} />
        <Tabs.Screen name="ehr-lite" options={{ href: null }} />
        <Tabs.Screen name="settings" options={{ href: null }} />
        <Tabs.Screen name="+not-found" options={{ href: null }} />
      </Tabs>
    </>
  );
}



