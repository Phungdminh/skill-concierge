import 'server-only';

import { headers } from 'next/headers';

/**
 * Defense-in-depth same-origin check for state-changing routes. Cookies use
 * SameSite=Lax which already blocks cross-site POSTs in modern browsers; this
 * is an additional explicit check using Origin/Referer.
 *
 * Returns null if the request is same-origin (or origin verification was
 * skipped intentionally for a trusted internal path). Returns an error code
 * otherwise so the caller can reject the request.
 */
export async function checkSameOrigin(): Promise<null | 'missing_origin' | 'cross_origin'> {
  const h = await headers();
  const host = h.get('host');
  const proto = h.get('x-forwarded-proto') ?? (process.env.NODE_ENV === 'production' ? 'https' : 'http');
  if (!host) return 'missing_origin';

  const origin = h.get('origin');
  const referer = h.get('referer');

  const expectedOrigin = `${proto}://${host}`.toLowerCase();
  const candidate = (origin ?? referer ?? '').toLowerCase();
  if (!candidate) return 'missing_origin';

  try {
    const url = new URL(candidate);
    const candidateOrigin = `${url.protocol}//${url.host}`;
    if (candidateOrigin === expectedOrigin) return null;
  } catch {
    return 'cross_origin';
  }

  return 'cross_origin';
}
