// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

// CRITICAL FIX: Defer Sentry initialization to avoid blocking initial render
// Sentry.init() was causing 1.6s delay before FCP
// Now loads after page interactive (non-blocking)

// Sentry configuration (DRY - defined once, used in both init paths)
const SENTRY_CONFIG = {
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance Monitoring
  tracesSampleRate: 0.1, // Sample 10% of transactions (reduced from 100%)

  // Privacy & GDPR Compliance
  sendDefaultPii: false, // Do NOT send user PII (email, IP, etc.)

  // Additional recommended settings
  environment: process.env.NODE_ENV,
  enabled: process.env.NODE_ENV === 'production',
};

if (typeof window !== 'undefined') {
  // Use requestIdleCallback if available, otherwise fallback to load event
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(
      () => {
        Sentry.init(SENTRY_CONFIG);
      },
      { timeout: 5000 } // Max 5s delay before forcing init
    );
  } else {
    window.addEventListener('load', () => {
      Sentry.init(SENTRY_CONFIG);
    });
  }
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;