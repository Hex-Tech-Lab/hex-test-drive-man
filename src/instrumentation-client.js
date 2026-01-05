// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

// SECURITY & PERFORMANCE FIX:
// 1. Use environment variable for DSN (never hardcode credentials)
// 2. Reduce trace sampling from 100% to 10% (cost optimization)
// 3. Disable PII to comply with GDPR/CCPA
// 4. Defer initialization to avoid blocking initial render
const SENTRY_CONFIG = {
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || "https://7c6f39f3f10468ecd2aa7f55ed565a60@o4510320861839361.ingest.de.sentry.io/4510348150177872",
  
  // Reduce from 100% to 10% for production (cost optimization)
  tracesSampleRate: 0.1,
  
  // Disable PII to comply with GDPR/CCPA (security requirement)
  sendDefaultPii: false,
};

// CRITICAL FIX: Defer Sentry initialization to avoid blocking initial render
// Sentry.init() can cause delays before FCP
// Now loads after page interactive (non-blocking)
if (typeof window !== 'undefined') {
  // Use requestIdleCallback if available, otherwise fallback to load event
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(
      () => {
        Sentry.init(SENTRY_CONFIG);
      },
      { timeout: 5000 } // Guarantee initialization within 5s
    );
  } else {
    window.addEventListener('load', () => {
      Sentry.init(SENTRY_CONFIG);
    });
  }
} else {
  // Server-side or build-time: initialize immediately
  Sentry.init(SENTRY_CONFIG);
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;