// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

// CRITICAL FIX: Defer Sentry initialization to avoid blocking initial render
// Sentry.init() was causing 1.6s delay before FCP
// Now loads after page interactive (non-blocking)
if (typeof window !== 'undefined') {
  // Use requestIdleCallback if available, otherwise fallback to load event
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => {
      Sentry.init({
        dsn: "https://7c6f39f3f10468ecd2aa7f55ed565a60@o4510320861839361.ingest.de.sentry.io/4510348150177872",
        tracesSampleRate: 1,
        sendDefaultPii: true,
      });
    });
  } else {
    window.addEventListener('load', () => {
      Sentry.init({
        dsn: "https://7c6f39f3f10468ecd2aa7f55ed565a60@o4510320861839361.ingest.de.sentry.io/4510348150177872",
        tracesSampleRate: 1,
        sendDefaultPii: true,
      });
    });
  }
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;