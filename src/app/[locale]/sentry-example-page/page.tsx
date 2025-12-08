'use client';

export default function SentryTestPage() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Sentry Error Test</h1>
      <button
        onClick={() => {
          // @ts-expect-error - Intentionally calling undefined function to test Sentry
          myUndefinedFunction();
        }}
        style={{
          padding: '1rem 2rem',
          fontSize: '1.2rem',
          backgroundColor: '#e74c3c',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
        }}
      >
        Trigger Test Error
      </button>
    </div>
  );
}
