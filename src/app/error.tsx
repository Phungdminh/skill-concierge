'use client';

import { useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

// Segment-level error boundary. Catches render/runtime errors thrown by any
// route under the root layout and shows a branded fallback instead of a blank
// screen. `reset()` re-renders the segment so the user can retry in place.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Route error boundary caught', {
      message: error.message,
      digest: error.digest,
    });
  }, [error]);

  return (
    <main className="grid min-h-[80svh] place-items-center px-6 pt-32">
      <div className="text-center">
        <h1 className="mt-6 text-balance text-3xl font-semibold tracking-tight md:text-4xl">
          Có lỗi xảy ra
        </h1>
        <p className="mx-auto mt-4 max-w-md text-foreground/60">
          Trang gặp sự cố ngoài dự kiến. Bạn thử tải lại nhé — nếu vẫn lỗi, hãy
          liên hệ với mình.
        </p>
        {error.digest && (
          <p className="mt-2 font-mono text-xs text-foreground/40">
            Mã lỗi: {error.digest}
          </p>
        )}
        <button
          onClick={reset}
          className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-foreground px-5 py-3 text-sm font-medium text-background transition hover:bg-foreground/90"
        >
          <RefreshCw className="h-4 w-4" /> Thử lại
        </button>
      </div>
    </main>
  );
}
