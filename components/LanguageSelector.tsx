import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { getAvailableLanguages, changeLanguage } from '../i18n/i18n';

interface LanguageSelectorProps {
  visible: boolean;
  onClose: () => void;
}

export default function LanguageSelector({ visible, onClose }: LanguageSelectorProps) {
  const insets = useSafeAreaInsets();
  const { t, i18n } = useTranslation('common');
  const { theme, themeMode } = useTheme();
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);
  const languages = getAvailableLanguages();

  const handleLanguageChange = async (languageCode: string) => {
    setSelectedLanguage(languageCode);
    await changeLanguage(languageCode);
    onClose();
  };

  const getLanguageFlag = (code: string) => {
    const flags: { [key: string]: string } = {
      en: '🇬🇧',
      af: '🇿🇦',
      zu: '🇿🇦',
      xh: '🇿🇦',
      nso: '🇿🇦',
      st: '🇿🇦',
    };
    return flags[code] || '🌍';
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.primary} />
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primaryDark]}
          style={[styles.header, { paddingTop: insets.top }]}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.colors.white} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: theme.colors.white }]}>{t('language.select')}</Text>
            <View style={styles.headerSpacer} />
          </View>
        </LinearGradient>

        <ScrollView style={[styles.content, { backgroundColor: theme.colors.background }]} showsVerticalScrollIndicator={false}>
          <View style={styles.languageList}>
            {languages.map((language) => (
              <TouchableOpacity
                key={language.code}
                style={[
                  styles.languageItem,
                  { backgroundColor: theme.colors.surface, borderColor: 'transparent' },
                  selectedLanguage === language.code && { borderColor: theme.colors.primary, backgroundColor: theme.colors.primaryLight }
                ]}
                onPress={() => handleLanguageChange(language.code)}
              >
                <View style={styles.languageInfo}>
                  <Text style={styles.flag}>{getLanguageFlag(language.code)}</Text>
                  <View style={styles.languageText}>
                    <Text style={[
                      styles.languageName,
                      { color: theme.colors.textPrimary }, // Corrected to textPrimary
                      selectedLanguage === language.code && { color: theme.colors.primary }
                    ]}>
                      {language.name}
                    </Text>
                    <Text style={[
                      styles.nativeName,
                      { color: theme.colors.textSecondary },
                      selectedLanguage === language.code && { color: theme.colors.primaryDark }
                    ]}>
                      {language.nativeName}
                    </Text>
                  </View>
                </View>
                {selectedLanguage === language.code && (
                  <Ionicons name="checkmark" size={24} color={theme.colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
              {t('language.current')}: {languages.find(l => l.code === selectedLanguage)?.nativeName}
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  languageList: {
    padding: 20,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 2,
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  flag: {
    fontSize: 24,
    marginRight: 16,
  },
  languageText: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  nativeName: {
    fontSize: 14,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
