'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log critical error
    console.error('Critical application error:', error);
  }, [error]);

  return (
    <html>
      <body>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '2rem',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          textAlign: 'center',
        }}>
          <h1 style={{ fontSize: '6rem', margin: 0, opacity: 0.2 }}>500</h1>
          <h2 style={{ fontSize: '2rem', margin: '1rem 0' }}>Critical Error</h2>
          <p style={{ color: '#666', maxWidth: '500px', marginBottom: '2rem' }}>
            A critical error occurred. Please try refreshing the page or contact support if the problem persists.
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => reset()}
              style={{
                padding: '0.75rem 2rem',
                fontSize: '1rem',
                background: '#000',
                color: '#fff',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
              }}
            >
              Try Again
            </button>
            <a
              href="/"
              style={{
                padding: '0.75rem 2rem',
                fontSize: '1rem',
                background: '#f5f5f5',
                color: '#000',
                textDecoration: 'none',
                borderRadius: '0.5rem',
              }}
            >
              Go Home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
