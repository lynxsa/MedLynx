import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Tabs } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ColorPalette } from '../../constants/DynamicTheme';
import { useTheme } from '../../contexts/ThemeContext';
import '../../i18n/i18n';

type TabBarIconProps = {
  focused: boolean;
  color: string;
  size: number;
};

const TabBarIconComponent = ({ name, focused, color, size }: TabBarIconProps & { name: keyof typeof Ionicons.glyphMap }) => {
  return <Ionicons name={name} size={20} color={color} />; // Fixed smaller size
};
TabBarIconComponent.displayName = 'TabBarIconComponent';

export default function TabLayout() {
  const { theme } = useTheme();
  const colors = theme.colors as ColorPalette;
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkAuthStatus();
    
    // Listen for navigation events to recheck auth status
    const interval = setInterval(checkAuthStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  const checkAuthStatus = async () => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      setIsLoggedIn(!!userToken);
    } catch (error) {
      console.log('Error checking auth status:', error);
    }
  };

  const getTabBarIcon = (routeName: string) => {
    const IconProvider = ({ focused, color, size }: TabBarIconProps) => {
      let iconName: keyof typeof Ionicons.glyphMap;
      switch (routeName) {
        case 'modern-home':
          iconName = focused ? 'home' : 'home-outline';
          break;
        case 'calendar':
          iconName = focused ? 'calendar' : 'calendar-outline';
          break;
        case 'add-medication':
          iconName = focused ? 'add-circle' : 'add-circle-outline';
          break;
        case 'carehub':
          iconName = focused ? 'storefront' : 'storefront-outline';
          break;
        case 'medication-scanner':
          iconName = focused ? 'scan' : 'scan-outline';
          break;
        case 'dr-lynx':
          iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          break;
        case 'health-directory':
          iconName = focused ? 'medical' : 'medical-outline';
          break;
        case 'modern-profile':
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
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#7C3AED',
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: '#A855F7',
          borderTopWidth: 0.5,
          paddingTop: 6,
          paddingBottom: 6,
          height: 65,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 8,
          display: isLoggedIn ? 'flex' : 'none', // Hide navbar until logged in
        },
        tabBarLabelStyle: {
          fontSize: 9,
          fontWeight: '500',
          marginTop: 2,
        },
        tabBarItemStyle: {
          paddingVertical: 2,
        },
      }}
    >
      <Tabs.Screen
        name="modern-home"
        options={{
          title: 'Home',
          tabBarIcon: getTabBarIcon('modern-home'),
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
        name="carehub"
        options={{
          title: 'CareHub',
          tabBarIcon: getTabBarIcon('carehub'),
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
        name="medication-scanner"
        options={{
          title: 'MedScan',
          tabBarIcon: getTabBarIcon('medication-scanner'),
        }}
      />
      <Tabs.Screen
        name="health-directory"
        options={{
          title: 'Healthcare',
          tabBarIcon: getTabBarIcon('health-directory'),
        }}
      />
      <Tabs.Screen
        name="modern-profile"
        options={{
          title: 'Profile',
          tabBarIcon: getTabBarIcon('profile'),
        }}
      />

            {/* Hidden screens - not part of tab bar */}
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="auth" options={{ href: null }} />
      <Tabs.Screen name="modern-auth" options={{ href: null }} />
      <Tabs.Screen name="clean-onboarding" options={{ href: null }} />
      <Tabs.Screen name="modern-onboarding" options={{ href: null }} />
      <Tabs.Screen name="enhanced-home" options={{ href: null }} />
      <Tabs.Screen name="enhanced-home-clean" options={{ href: null }} />
      <Tabs.Screen name="add-medication" options={{ href: null }} />
      <Tabs.Screen name="food-scan" options={{ href: null }} />
      <Tabs.Screen name="medication-detail" options={{ href: null }} />
      <Tabs.Screen name="onboarding" options={{ href: null }} />
      <Tabs.Screen name="notification-test" options={{ href: null }} />
      <Tabs.Screen name="vibrant-onboarding" options={{ href: null }} />
      <Tabs.Screen name="health-metrics" options={{ href: null }} />
      <Tabs.Screen name="prescription-refills" options={{ href: null }} />
      <Tabs.Screen name="ehr-lite" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
      <Tabs.Screen name="profile" options={{ href: null }} />
      <Tabs.Screen name="understanding-blood-pressure" options={{ href: null }} />
      <Tabs.Screen name="medication-safety-tips" options={{ href: null }} />
      <Tabs.Screen name="healthy-sleep-habits" options={{ href: null }} />
      <Tabs.Screen name="managing-chronic-conditions" options={{ href: null }} />
      <Tabs.Screen name="+not-found" options={{ href: null }} />
    </Tabs>
  );
}