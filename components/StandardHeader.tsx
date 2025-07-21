import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';

interface StandardHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  showBackButton?: boolean;
  rightComponent?: React.ReactNode;
  showLogo?: boolean;
  onBackPress?: () => void;
}

export const StandardHeader: React.FC<StandardHeaderProps> = ({
  title,
  subtitle,
  description,
  showBackButton = false,
  rightComponent,
  showLogo = false,
  onBackPress
}) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { theme } = useTheme();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  const dynamicStyles = {
    container: {
      backgroundColor: theme.colors.surface,
    },
    headerTitle: {
      color: theme.mode === 'dark' ? '#FFFFFF' : '#4C1D95',
    },
    headerSubtitle: {
      color: theme.mode === 'dark' ? '#CCCCCC' : theme.colors.textSecondary,
    },
    headerDescription: {
      color: theme.mode === 'dark' ? '#AAAAAA' : theme.colors.textSecondary,
    },
    backButtonIcon: {
      color: theme.mode === 'dark' ? '#FFFFFF' : theme.colors.primary,
    },
  };

  return (
    <View style={[
      styles.container, 
      dynamicStyles.container,
      { 
        paddingTop: insets.top + 12,
      }
    ]}>
      <View style={styles.header}>
        {showBackButton && (
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBackPress}
          >
            <Ionicons name="arrow-back" size={24} color={dynamicStyles.backButtonIcon.color} />
          </TouchableOpacity>
        )}

        <View style={styles.headerContent}>
          <View style={styles.headerTitleRow}>
            {showLogo && (
              <Image
                source={require('../assets/images/logo.png')}
                style={styles.headerLogo}
                resizeMode="contain"
              />
            )}
            <View style={styles.textContainer}>
              <Text style={[styles.headerTitle, dynamicStyles.headerTitle]}>
                {title}
              </Text>
              {description && (
                <Text 
                  style={[styles.headerDescription, dynamicStyles.headerDescription]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {description}
                </Text>
              )}
            </View>
          </View>
        </View>

        {rightComponent && (
          <View style={styles.headerActions}>
            {rightComponent}
          </View>
        )}
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerContent: {
    flex: 1,
    alignItems: 'flex-start',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  textContainer: {
    flex: 1,
  },
  headerLogo: {
    width: 32,
    height: 32,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 12,
    marginBottom: 2,
  },
  headerDescription: {
    fontSize: 9,
    marginTop: 2,
    opacity: 0.7,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    right: 20,
    top: 12,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
});


  