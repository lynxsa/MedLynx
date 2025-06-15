import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import translation files
import enCommon from '../locales/en/common.json';
import enHealth from '../locales/en/health.json';
import enAppointments from '../locales/en/appointments.json';

import afCommon from '../locales/af/common.json';
import afHealth from '../locales/af/health.json';
import afAppointments from '../locales/af/appointments.json';

import zuCommon from '../locales/zu/common.json';
import zuHealth from '../locales/zu/health.json';
import zuAppointments from '../locales/zu/appointments.json';

import xhCommon from '../locales/xh/common.json';
import xhHealth from '../locales/xh/health.json';
import xhAppointments from '../locales/xh/appointments.json';

import nsoCommon from '../locales/nso/common.json';
import nsoHealth from '../locales/nso/health.json';
import nsoAppointments from '../locales/nso/appointments.json';

import stCommon from '../locales/st/common.json';
import stHealth from '../locales/st/health.json';
import stAppointments from '../locales/st/appointments.json';

// Language resources
const resources = {
  en: {
    common: enCommon,
    health: enHealth,
    appointments: enAppointments,
  },
  af: {
    common: afCommon,
    health: afHealth,
    appointments: afAppointments,
  },
  zu: {
    common: zuCommon,
    health: zuHealth,
    appointments: zuAppointments,
  },
  xh: {
    common: xhCommon,
    health: xhHealth,
    appointments: xhAppointments,
  },
  nso: {
    common: nsoCommon,
    health: nsoHealth,
    appointments: nsoAppointments,
  },
  st: {
    common: stCommon,
    health: stHealth,
    appointments: stAppointments,
  },
};

// Language detector for React Native
const languageDetector = {
  type: 'languageDetector' as const,
  async: true,
  detect: async (callback: (lng: string) => void) => {
    try {
      // Check for saved language preference
      const savedLanguage = await AsyncStorage.getItem('user-language');
      if (savedLanguage) {
        callback(savedLanguage);
        return;
      }
      
      // Fall back to device language or default to English
      // In React Native, you might want to use react-native-localize
      // For now, we'll default to English
      callback('en');
    } catch (error) {
      console.log('Error reading language', error);
      callback('en');
    }
  },
  init: () => {},
  cacheUserLanguage: async (lng: string) => {
    try {
      await AsyncStorage.setItem('user-language', lng);
    } catch (error) {
      console.log('Error saving language', error);
    }
  },
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: __DEV__,
    
    // Default namespace
    defaultNS: 'common',
    
    // Namespace separator
    ns: ['common', 'health', 'appointments'],
    
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    
    react: {
      useSuspense: false,
    },
  });

export default i18n;

// Utility function to get available languages
export const getAvailableLanguages = () => [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'af', name: 'Afrikaans', nativeName: 'Afrikaans' },
  { code: 'zu', name: 'Zulu', nativeName: 'isiZulu' },
  { code: 'xh', name: 'Xhosa', nativeName: 'isiXhosa' },
  { code: 'nso', name: 'Northern Sotho/Pedi', nativeName: 'Sesotho sa Leboa/Sepedi' },
  { code: 'st', name: 'Southern Sotho', nativeName: 'Sesotho' },
];

// Utility function to change language
export const changeLanguage = async (languageCode: string) => {
  try {
    await i18n.changeLanguage(languageCode);
    await AsyncStorage.setItem('user-language', languageCode);
  } catch (error) {
    console.log('Error changing language', error);
  }
};
