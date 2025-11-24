"use client";

export default function SentryTestPage() {
  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>Sentry Error Test</h1>
      <button
        onClick={() => {
          // @ts-ignore
          // eslint-disable-next-line no-undef
          myUndefinedFunction();
        }}
        style={{
          padding: "1rem 2rem",
          fontSize: "1.2rem",
          backgroundColor: "#e74c3c",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        Trigger Test Error
      </button>
    </div>
  );
}

