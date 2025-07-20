import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface StandardHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  rightComponent?: React.ReactNode;
  showLogo?: boolean;
  onBackPress?: () => void;
}

export const StandardHeader: React.FC<StandardHeaderProps> = ({
  title,
  subtitle,
  showBackButton = false,
  rightComponent,
  showLogo = false,
  onBackPress
}) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <View style={[
      styles.container, 
      { 
        paddingTop: insets.top + 12,
        backgroundColor: '#FFFFFF',
        borderBottomColor: '#F0F0F0',
      }
    ]}>
      <View style={styles.header}>
        {showBackButton && (
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBackPress}
          >
            <Ionicons name="arrow-back" size={24} color="#3726a6" />
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
              {subtitle && (
                <Text style={styles.headerSubtitle}>
                  {subtitle}
                </Text>
              )}
              <Text style={styles.headerTitle}>
                {title}
              </Text>
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
    borderBottomWidth: 1,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3726a6',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#a096e7',
    marginBottom: 2,
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
