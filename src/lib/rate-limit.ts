import 'server-only';

import { createHash } from 'node:crypto';
import { headers } from 'next/headers';

type Bucket = {
  count: number;
  resetAt: number;
};

const store = new Map<string, Bucket>();

export type RateLimitConfig = {
  windowMs: number;
  max: number;
};

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  retryAfterSec: number;
  resetAt: number;
};

export function rateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  const bucket = store.get(key);

  if (!bucket || bucket.resetAt <= now) {
    const fresh: Bucket = { count: 1, resetAt: now + config.windowMs };
    store.set(key, fresh);
    cleanupIfNeeded(now);
    return {
      ok: true,
      remaining: Math.max(config.max - 1, 0),
      retryAfterSec: Math.ceil(config.windowMs / 1000),
      resetAt: fresh.resetAt,
    };
  }

  if (bucket.count >= config.max) {
    return {
      ok: false,
      remaining: 0,
      retryAfterSec: Math.ceil((bucket.resetAt - now) / 1000),
      resetAt: bucket.resetAt,
    };
  }

  bucket.count += 1;
  return {
    ok: true,
    remaining: Math.max(config.max - bucket.count, 0),
    retryAfterSec: Math.ceil((bucket.resetAt - now) / 1000),
    resetAt: bucket.resetAt,
  };
}

let lastCleanup = 0;
function cleanupIfNeeded(now: number) {
  if (now - lastCleanup < 60_000) return;
  lastCleanup = now;
  for (const [key, bucket] of store.entries()) {
    if (bucket.resetAt <= now) store.delete(key);
  }
}

export async function getClientIp(): Promise<string> {
  const h = await headers();
  const xff = h.get('x-forwarded-for');
  if (xff) {
    const first = xff.split(',')[0]?.trim();
    if (first) return first;
  }
  return h.get('x-real-ip')?.trim() || 'unknown';
}

export async function getClientUserAgent(): Promise<string> {
  const h = await headers();
  return h.get('user-agent') ?? 'unknown';
}

export async function visitorHash(salt: string): Promise<string> {
  const ip = await getClientIp();
  const ua = await getClientUserAgent();
  const day = new Date().toISOString().slice(0, 10);
  return createHash('sha256').update(`${salt}|${ip}|${ua}|${day}`).digest('hex').slice(0, 32);
}
