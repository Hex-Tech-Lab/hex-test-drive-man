'use client';

import * as Sentry from '@sentry/nextjs';

export default function SentryTestPage() {
  const triggerError = () => {
    try {
      throw new Error('Sentry test error');
    } catch (error) {
      Sentry.captureException(error);
      alert('Test error sent to Sentry! Check your dashboard.');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Sentry Test Page</h1>
      <button
        onClick={triggerError}
        style={{
          padding: '1rem 2rem',
          fontSize: '1.2rem',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Trigger Test Error
      </button>
      <p style={{ marginTop: '1rem' }}>
        Click the button to send a test error to Sentry.
      </p>
    </div>
  );
}
