import * as Sentry from '@sentry/nextjs';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config');
  } else {
    await import('../sentry.server.config');
  }
  await import('../instrumentation-client');
}

export const onRequestError = Sentry.captureRequestError;
