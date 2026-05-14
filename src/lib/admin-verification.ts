import 'server-only';

import { createHmac, randomBytes, randomInt, timingSafeEqual } from 'crypto';
import type { User } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export const ADMIN_MFA_CHALLENGE_COOKIE = 'admin_mfa_challenge';
export const ADMIN_MFA_VERIFIED_COOKIE = 'admin_mfa_verified';
export const ADMIN_MFA_CODE_TTL_SECONDS = 10 * 60;
export const ADMIN_MFA_VERIFIED_TTL_SECONDS = 8 * 60 * 60;
export const ADMIN_MFA_MAX_ATTEMPTS = 5;

const COOKIE_PATH = '/';

type AdminMfaChallenge = {
  id: string;
  userId: string;
  email: string;
  codeHash: string;
  expiresAt: number;
  attemptCount: number;
};

function getSecret() {
  const secret = process.env.ADMIN_MFA_COOKIE_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('Missing ADMIN_MFA_COOKIE_SECRET');
  }
  return secret;
}

function normalizedEmail(user: User) {
  return user.email?.toLowerCase().trim() ?? '';
}

function hmac(value: string) {
  return createHmac('sha256', getSecret()).update(value).digest('hex');
}

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: COOKIE_PATH,
    maxAge,
  };
}

export function createVerificationCode() {
  return randomInt(0, 1_000_000).toString().padStart(6, '0');
}

export function createChallengeId() {
  return randomBytes(16).toString('hex');
}

export function hashVerificationCode(challengeId: string, code: string) {
  return hmac(`${challengeId}:${code}`);
}

export function compareCodeHash(expectedHash: string, challengeId: string, code: string) {
  const actualHash = hashVerificationCode(challengeId, code);
  const expected = Buffer.from(expectedHash, 'hex');
  const actual = Buffer.from(actualHash, 'hex');
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

function signChallengePayload(payload: string) {
  return hmac(`challenge:${payload}`);
}

function encodeChallenge(challenge: AdminMfaChallenge) {
  const payload = Buffer.from(JSON.stringify(challenge), 'utf8').toString('base64url');
  return `${payload}.${signChallengePayload(payload)}`;
}

function decodeChallenge(value: string): AdminMfaChallenge | null {
  const [payload, signature] = value.split('.');
  if (!payload || !signature) return null;

  const expectedSignature = signChallengePayload(payload);
  const expected = Buffer.from(expectedSignature, 'hex');
  const actual = Buffer.from(signature, 'hex');
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;

  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as Partial<AdminMfaChallenge>;
    if (
      typeof parsed.id !== 'string' ||
      typeof parsed.userId !== 'string' ||
      typeof parsed.email !== 'string' ||
      typeof parsed.codeHash !== 'string' ||
      typeof parsed.expiresAt !== 'number' ||
      typeof parsed.attemptCount !== 'number'
    ) {
      return null;
    }

    return {
      id: parsed.id,
      userId: parsed.userId,
      email: parsed.email,
      codeHash: parsed.codeHash,
      expiresAt: parsed.expiresAt,
      attemptCount: parsed.attemptCount,
    };
  } catch {
    return null;
  }
}

export async function setChallengeCookie(challenge: AdminMfaChallenge) {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_MFA_CHALLENGE_COOKIE, encodeChallenge(challenge), cookieOptions(ADMIN_MFA_CODE_TTL_SECONDS));
}

export async function clearChallengeCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_MFA_CHALLENGE_COOKIE);
}

export async function getChallengeFromCookie() {
  const cookieStore = await cookies();
  const value = cookieStore.get(ADMIN_MFA_CHALLENGE_COOKIE)?.value;
  return value ? decodeChallenge(value) : null;
}

export async function incrementChallengeAttemptCookie(challenge: AdminMfaChallenge) {
  await setChallengeCookie({ ...challenge, attemptCount: challenge.attemptCount + 1 });
}

export async function setVerifiedCookie(user: User) {
  const email = normalizedEmail(user);
  const expiresAt = Date.now() + ADMIN_MFA_VERIFIED_TTL_SECONDS * 1000;
  const payload = `${user.id}:${email}:${expiresAt}`;
  const signature = hmac(payload);
  const cookieStore = await cookies();
  cookieStore.set(
    ADMIN_MFA_VERIFIED_COOKIE,
    `${payload}:${signature}`,
    cookieOptions(ADMIN_MFA_VERIFIED_TTL_SECONDS),
  );
}

export async function clearVerifiedCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_MFA_VERIFIED_COOKIE);
}

export async function clearAdminVerificationCookies() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_MFA_CHALLENGE_COOKIE);
  cookieStore.delete(ADMIN_MFA_VERIFIED_COOKIE);
}

export async function isAdminEmailVerified(user: User | null | undefined) {
  if (!user?.id || !user.email) return false;
  const cookieStore = await cookies();
  const value = cookieStore.get(ADMIN_MFA_VERIFIED_COOKIE)?.value;
  if (!value) return false;

  const parts = value.split(':');
  if (parts.length !== 4) return false;

  const [userId, email, expiresAtRaw, signature] = parts;
  const expiresAt = Number(expiresAtRaw);
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) return false;
  if (userId !== user.id) return false;
  if (email !== normalizedEmail(user)) return false;

  const payload = `${userId}:${email}:${expiresAtRaw}`;
  const expectedSignature = hmac(payload);
  const expected = Buffer.from(expectedSignature, 'hex');
  const actual = Buffer.from(signature, 'hex');
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
