import { createTheme, ThemeOptions } from '@mui/material/styles';

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
  transitions: {
    duration: {
      shortest: 150,
      shorter: 200,
      short: 250,
      standard: 300,
      complex: 375,
      enteringScreen: 225,
      leavingScreen: 195,
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
        ? 'Cairo, Roboto, Arial, sans-serif' 
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
