import 'server-only';

import { createHash } from 'node:crypto';
import { headers } from 'next/headers';
import { Ratelimit, type Duration } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

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

// --- Durable, cross-instance rate limiting (Upstash Redis) -----------------
// The in-memory `rateLimit` above is per-instance and resets on cold start, so
// on serverless it under-counts. When Upstash env vars are present we use a
// shared Redis counter that is accurate across every instance; otherwise we
// fall back to the in-memory limiter (handy for local dev with no Redis).

const upstashRedis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? Redis.fromEnv()
    : null;

// One Ratelimit instance per (max, window) config, reused across requests.
const limiters = new Map<string, Ratelimit>();

function getLimiter(windowMs: number, max: number): Ratelimit | null {
  if (!upstashRedis) return null;
  const cacheKey = `${max}:${windowMs}`;
  let limiter = limiters.get(cacheKey);
  if (!limiter) {
    limiter = new Ratelimit({
      redis: upstashRedis,
      limiter: Ratelimit.slidingWindow(max, `${windowMs} ms` as Duration),
      prefix: 'rl',
      analytics: false,
    });
    limiters.set(cacheKey, limiter);
  }
  return limiter;
}

/**
 * Cross-instance rate limit. Uses shared Upstash Redis when configured, and
 * transparently falls back to the in-memory limiter when Redis is absent or
 * errors — so a Redis outage degrades accuracy but never takes down the route.
 */
export async function checkRateLimit(
  key: string,
  config: RateLimitConfig,
): Promise<RateLimitResult> {
  const limiter = getLimiter(config.windowMs, config.max);
  if (!limiter) return rateLimit(key, config);

  try {
    const r = await limiter.limit(key);
    return {
      ok: r.success,
      remaining: r.remaining,
      retryAfterSec: Math.max(0, Math.ceil((r.reset - Date.now()) / 1000)),
      resetAt: r.reset,
    };
  } catch (err) {
    console.error('checkRateLimit: Upstash error, falling back to in-memory', {
      message: err instanceof Error ? err.message : 'unknown',
    });
    return rateLimit(key, config);
  }
}

export async function getClientIp(): Promise<string> {
  const h = await headers();

  // `x-real-ip` is set by the hosting edge (Vercel/Cloudflare/Nginx) to the
  // actual connecting client and overwrites any client-supplied value, so it
  // cannot be spoofed the way the leftmost X-Forwarded-For entry can.
  const realIp = h.get('x-real-ip')?.trim();
  if (realIp) return realIp;

  // Fallback: take the RIGHTMOST entry of X-Forwarded-For. A malicious client
  // can prepend fake IPs (`X-Forwarded-For: <fake>`), but the trusted edge
  // appends the real connecting IP last — so the last hop is the trustworthy
  // one. Never trust xff[0]; that is exactly the attacker-controlled value.
  const xff = h.get('x-forwarded-for');
  if (xff) {
    const parts = xff.split(',').map((part) => part.trim()).filter(Boolean);
    const last = parts[parts.length - 1];
    if (last) return last;
  }

  return 'unknown';
}

async function getClientUserAgent(): Promise<string> {
  const h = await headers();
  return h.get('user-agent') ?? 'unknown';
}

export async function visitorHash(salt: string): Promise<string> {
  const ip = await getClientIp();
  const ua = await getClientUserAgent();
  const day = new Date().toISOString().slice(0, 10);
  return createHash('sha256').update(`${salt}|${ip}|${ua}|${day}`).digest('hex').slice(0, 32);
}
