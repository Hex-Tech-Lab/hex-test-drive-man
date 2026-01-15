import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import locale JSON files directly for client-side bundling
import enCommon from '@/i18n/locales/en/common.json';
import arCommon from '@/i18n/locales/ar/common.json';

/**
 * i18next configuration for the HEX Test Drive Platform
 * Integrates with useLanguageStore for language switching
 * Supports English and Arabic with RTL
 */
i18n.use(initReactI18next).init({
  resources: {
    en: {
      common: enCommon,
    },
    ar: {
      common: arCommon,
    },
  },
  lng: 'ar', // Default language (matches useLanguageStore default)
  fallbackLng: 'en',
  defaultNS: 'common',
  ns: ['common'],
  interpolation: {
    escapeValue: false, // React already escapes
  },
  react: {
    useSuspense: false, // Disable suspense for client-side hydration
  },
});

export default i18n;
