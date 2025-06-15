import { Link, Stack } from 'expo-router';
import { StyleSheet, View, Text, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

export default function NotFoundScreen() {
  const { theme, isDark } = useTheme();
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <Stack.Screen options={{ title: 'Oops!', headerShown: false }} />
      <LinearGradient colors={[theme.colors.primary, theme.colors.primaryDark]} style={styles.gradient}>
        <View style={styles.content}>
          <Ionicons name="alert-circle-outline" size={80} color={theme.colors.white} />
          <Text style={[styles.title, { color: theme.colors.white }]}>Oops! Page Not Found</Text>
          <Text style={[styles.subtitle, { color: theme.colors.white }]}>The screen you&apos;re looking for doesn&apos;t exist.</Text>
          <Link href="/(tabs)/enhanced-home" style={styles.link}>
            <View style={[styles.linkButton, { backgroundColor: theme.colors.white }]}>
              <Ionicons name="home-outline" size={20} color={theme.colors.primary} />
              <Text style={[styles.linkText, { color: theme.colors.primary }]}>Go to Home</Text>
            </View>
          </Link>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    fontWeight: '500',
    opacity: 0.8,
  },
  link: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  linkText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
