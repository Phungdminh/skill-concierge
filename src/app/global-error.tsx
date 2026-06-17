'use client';

import { useEffect } from 'react';

// Last-resort boundary: replaces the ROOT layout when the layout itself throws,
// so it must render its own <html>/<body>. Uses inline styles because the app's
// CSS may not have loaded at this point.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error boundary caught', {
      message: error.message,
      digest: error.digest,
    });
  }, [error]);

  return (
    <html lang="vi">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          background: '#070708',
          color: '#fafafa',
          fontFamily: 'system-ui, sans-serif',
          padding: '24px',
        }}
      >
        <div style={{ maxWidth: '28rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 600, margin: 0 }}>
            Có lỗi xảy ra
          </h1>
          <p style={{ marginTop: '1rem', color: 'rgba(250,250,250,0.6)' }}>
            Trang gặp sự cố ngoài dự kiến. Bạn thử tải lại trang nhé.
          </p>
          <button
            onClick={reset}
            style={{
              marginTop: '1.5rem',
              padding: '0.75rem 1.25rem',
              borderRadius: '1rem',
              border: 'none',
              background: '#fafafa',
              color: '#070708',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Thử lại
          </button>
        </div>
      </body>
    </html>
  );
}
