'use client';

import { ThemeProvider, CssBaseline } from '@mui/material';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';
import { getTheme } from '@/lib/theme';
import { useLanguageStore } from '@/stores/language-store';
import { I18nProvider } from '@/i18n';
import { useEffect, useState } from 'react';

const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [prefixer, rtlPlugin],
});

const cacheLtr = createCache({
  key: 'muiltr',
  stylisPlugins: [prefixer],
});

/**
 *
 */
export default function AppProviders({ children }: { children: React.ReactNode }) {
  const language = useLanguageStore((state) => state.language);
  const hasHydrated = useLanguageStore((state) => state._hasHydrated);
  const [mounted, setMounted] = useState(false);

  // Wait for client-side mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Apply RTL direction only after Zustand persist has hydrated
  useEffect(() => {
    if (mounted && hasHydrated) {
      document.dir = language === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = language;
    }
  }, [language, mounted, hasHydrated]);

  // Don't render until both mounted and hydrated
  if (!mounted || !hasHydrated) {
    return null;
  }

  const theme = getTheme(language);
  const cache = language === 'ar' ? cacheRtl : cacheLtr;

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <I18nProvider>{children}</I18nProvider>
      </ThemeProvider>
    </CacheProvider>
  );
}
