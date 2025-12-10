import * as Sentry from '@sentry/nextjs';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
  }
}

export const onRequestError = Sentry.captureRequestError;
