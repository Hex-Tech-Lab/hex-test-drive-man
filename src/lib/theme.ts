import { createTheme, ThemeOptions } from '@mui/material/styles';
import { getTransitionDuration } from './accessibility';

const baseThemeOptions: ThemeOptions = {
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
      contrastText: '#fff',
    },
    secondary: {
      main: '#dc004e',
      light: '#f50057',
      dark: '#c51162',
      contrastText: '#fff',
    },
  },
  shape: {
    borderRadius: 8,
  },
  // Performance optimizations for animations
  // Honor prefers-reduced-motion for accessibility (Sourcery suggestion PR #37)
  transitions: {
    duration: {
      shortest: getTransitionDuration(150),
      shorter: getTransitionDuration(200),
      short: getTransitionDuration(250),
      standard: getTransitionDuration(300),
      complex: getTransitionDuration(375),
      enteringScreen: getTransitionDuration(225),
      leavingScreen: getTransitionDuration(195),
    },
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
    },
  },
  // Reduce component overhead
  components: {
    MuiButtonBase: {
      defaultProps: {
        disableRipple: false, // Keep ripple for UX, but optimize
      },
    },
    MuiCard: {
      defaultProps: {
        elevation: 1, // Reduce shadow complexity
      },
    },
  },
};

export const lightTheme = createTheme(baseThemeOptions);

/**
 * Create theme with locale-specific settings
 * @param locale - Language code (en or ar)
 * @returns Theme configured for the locale
 */
export function getTheme(locale: string) {
  return createTheme({
    ...baseThemeOptions,
    direction: locale === 'ar' ? 'rtl' : 'ltr',
    typography: {
      fontFamily: locale === 'ar' 
        ? 'var(--font-cairo), Cairo, Roboto, Arial, sans-serif' 
        : 'Roboto, Arial, sans-serif',
    },
  });
}

export function createRTLTheme(baseTheme: ReturnType<typeof createTheme>) {
  return createTheme({
    ...baseTheme,
    direction: 'rtl',
  });
}
