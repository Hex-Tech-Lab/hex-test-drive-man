'use client';

import { useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from './config';
import { useLanguageStore } from '@/stores/language-store';

interface I18nProviderProps {
  children: React.ReactNode;
}

/**
 * I18n Provider that syncs with useLanguageStore
 * Automatically changes i18n language when store changes
 */
export default function I18nProvider({ children }: I18nProviderProps) {
  const language = useLanguageStore((state) => state.language);

  // Sync i18n language with store
  useEffect(() => {
    if (i18n.language !== language) {
      i18n.changeLanguage(language);
    }
  }, [language]);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
