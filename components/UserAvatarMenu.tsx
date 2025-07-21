import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Dimensions,
    Modal,
    StyleSheet,
    Switch,
    Text,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle
} from 'react-native';
import { CURRENT_USER } from '../constants/User';
import { useTheme } from '../contexts/ThemeContext';

const { width: screenWidth } = Dimensions.get('window');

interface UserAvatarMenuProps {
  size?: number;
}

export const UserAvatarMenu: React.FC<UserAvatarMenuProps> = ({
  size = 36
}) => {
  const { theme, isDark, toggleTheme } = useTheme();
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const menuItems = [
    {
      id: 'profile',
      title: 'Profile',
      icon: 'person-outline',
      subtitle: 'View and edit profile',
      onPress: () => {
        setIsMenuVisible(false);
        router.push('/(tabs)/profile' as any);
      }
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: 'settings-outline',
      subtitle: 'App preferences',
      onPress: () => {
        setIsMenuVisible(false);
        router.push('/settings' as any);
      }
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: 'notifications-outline',
      subtitle: 'Manage alerts',
      onPress: () => {
        setIsMenuVisible(false);
        router.push('/notification-test' as any);
      }
    },
    {
      id: 'language',
      title: 'Language',
      icon: 'language-outline',
      subtitle: 'Change language',
      onPress: () => {
        setIsMenuVisible(false);
        Alert.alert('Language Settings', 'Go to Profile → Language to change app language');
      }
    }
  ];

  const handleAvatarPress = () => {
    setIsMenuVisible(true);
  };

  const closeMenu = () => {
    setIsMenuVisible(false);
  };

  const renderMenuItem = (item: typeof menuItems[0]) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.menuItem, { backgroundColor: theme.colors.surface }]}
      onPress={item.onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.menuItemIcon, { backgroundColor: theme.colors.primary + '15' }]}>
        <Ionicons name={item.icon as any} size={20} color={theme.colors.primary} />
      </View>
      <View style={styles.menuItemContent}>
        <Text style={[styles.menuItemTitle, { color: theme.colors.textPrimary }]}>{item.title}</Text>
        <Text style={[styles.menuItemSubtitle, { color: theme.colors.textSecondary }]}>{item.subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={theme.colors.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <>
      <TouchableOpacity
        style={styles.avatarContainer}
        onPress={handleAvatarPress}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.secondary]}
          style={[styles.avatarGradient, { width: size, height: size, borderRadius: size / 2 }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="person" size={size * 0.6} color="#FFFFFF" />
        </LinearGradient>
        {/* Clickable indicator */}
        <View style={[styles.clickIndicator, { backgroundColor: theme.colors.surface, shadowColor: theme.colors.primary }]}>
          <Ionicons name="chevron-down" size={10} color={theme.colors.primary} />
        </View>
      </TouchableOpacity>

      <Modal
        visible={isMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={closeMenu}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={closeMenu}
        >
          <View style={[styles.menuContainer, { backgroundColor: theme.colors.surface }]}>
            {/* Header */}
            <View style={[styles.menuHeader, { borderBottomColor: theme.colors.border + '30' }]}>
              <View style={styles.userInfo}>
                <LinearGradient
                  colors={[theme.colors.primary, theme.colors.secondary]}
                  style={styles.menuAvatar}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="person" size={24} color="#FFFFFF" />
                </LinearGradient>
                <View style={styles.userDetails}>
                  <Text style={[styles.userName, { color: theme.colors.textPrimary }]}>{CURRENT_USER.name}</Text>
                  <Text style={[styles.userEmail, { color: theme.colors.textSecondary }]}>{CURRENT_USER.email}</Text>
                </View>
              </View>
            </View>

            {/* Dark Mode Toggle */}
            <View style={[styles.themeToggle, { borderBottomColor: theme.colors.border + '30' }]}>
              <View style={styles.themeToggleLeft}>
                <Ionicons 
                  name={isDark ? "moon" : "sunny"} 
                  size={20} 
                  color={theme.colors.primary} 
                />
                <Text style={[styles.themeToggleText, { color: theme.colors.textPrimary }]}>Dark Mode</Text>
              </View>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary + '40' }}
                thumbColor={isDark ? theme.colors.primary : theme.colors.textSecondary}
              />
            </View>

            {/* Menu Items */}
            <View style={styles.menuItems}>
              {menuItems.map(renderMenuItem)}
            </View>

            {/* Close Button */}
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: theme.colors.primary + '15' }]}
              onPress={closeMenu}
            >
              <Text style={[styles.closeButtonText, { color: theme.colors.primary }]}>Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  avatarContainer: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  } as ViewStyle,
  avatarGradient: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  } as ViewStyle,
  clickIndicator: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  } as ViewStyle,
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 100,
    paddingRight: 20,
  } as ViewStyle,
  menuContainer: {
    width: Math.min(screenWidth - 40, 320),
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  } as ViewStyle,
  menuHeader: {
    padding: 20,
    borderBottomWidth: 1,
  } as ViewStyle,
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,
  menuAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  } as ViewStyle,
  userDetails: {
    flex: 1,
  } as ViewStyle,
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  } as TextStyle,
  userEmail: {
    fontSize: 12,
  } as TextStyle,
  themeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  } as ViewStyle,
  themeToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,
  themeToggleText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  } as TextStyle,
  menuItems: {
    paddingVertical: 8,
  } as ViewStyle,
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  } as ViewStyle,
  menuItemIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  } as ViewStyle,
  menuItemContent: {
    flex: 1,
  } as ViewStyle,
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  } as TextStyle,
  menuItemSubtitle: {
    fontSize: 12,
  } as TextStyle,
  closeButton: {
    margin: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  } as ViewStyle,
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  } as TextStyle,
});
