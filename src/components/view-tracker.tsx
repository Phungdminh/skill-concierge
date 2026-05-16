'use client';

import { useEffect, useRef } from 'react';

export function ViewTracker({ productId }: { productId: string }) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    const controller = new AbortController();
    fetch(`/api/products/${productId}/view`, {
      method: 'POST',
      signal: controller.signal,
      keepalive: true,
    }).catch(() => {
      // ignore — view tracking is best-effort
    });
    return () => controller.abort();
  }, [productId]);

  return null;
}
