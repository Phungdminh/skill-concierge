import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import {
  ADMIN_MFA_MAX_ATTEMPTS,
  clearChallengeCookie,
  compareCodeHash,
  getChallengeFromCookie,
  incrementChallengeAttemptCookie,
  setVerifiedCookie,
} from '@/lib/admin-verification';
import { getClientIp, checkRateLimit } from '@/lib/rate-limit';
import { checkSameOrigin } from '@/lib/csrf';

const bodySchema = z.object({
  code: z.string().trim().regex(/^\d{6}$/, 'Mã xác nhận phải gồm 6 chữ số.'),
});

export async function POST(request: Request) {
  const originIssue = await checkSameOrigin();
  if (originIssue) {
    return NextResponse.json(
      { error: { code: 'forbidden_origin', message: 'Yêu cầu không hợp lệ.' } },
      { status: 403 },
    );
  }

  const ip = await getClientIp();
  const ipLimit = await checkRateLimit(`admin-verify:ip:${ip}`, { windowMs: 15 * 60 * 1000, max: 20 });
  if (!ipLimit.ok) {
    return NextResponse.json(
      { error: { code: 'rate_limited', message: 'Bạn nhập sai quá nhiều lần. Thử lại sau.' } },
      { status: 429, headers: { 'Retry-After': String(ipLimit.retryAfterSec) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { code: 'invalid_json', message: 'JSON không hợp lệ.' } },
      { status: 400 },
    );
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 'validation_error', message: parsed.error.issues[0]?.message ?? 'Dữ liệu không hợp lệ.' } },
      { status: 422 },
    );
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: { code: 'unauthenticated', message: 'Bạn cần đăng nhập admin trước.' } },
      { status: 401 },
    );
  }

  if (!isAdmin(user)) {
    return NextResponse.json(
      { error: { code: 'forbidden', message: 'Tài khoản này không có quyền admin.' } },
      { status: 403 },
    );
  }

  const challenge = await getChallengeFromCookie();
  if (!challenge) {
    return NextResponse.json(
      { error: { code: 'missing_challenge', message: 'Phiên xác nhận đã hết hạn. Vui lòng đăng nhập lại.' } },
      { status: 410 },
    );
  }

  if (challenge.userId !== user.id || challenge.email !== user.email?.toLowerCase().trim()) {
    await clearChallengeCookie();
    return NextResponse.json(
      { error: { code: 'invalid_challenge', message: 'Phiên xác nhận không hợp lệ. Vui lòng đăng nhập lại.' } },
      { status: 410 },
    );
  }

  if (challenge.expiresAt <= Date.now()) {
    await clearChallengeCookie();
    return NextResponse.json(
      { error: { code: 'expired_challenge', message: 'Mã xác nhận đã hết hạn. Vui lòng đăng nhập lại.' } },
      { status: 410 },
    );
  }

  if (challenge.attemptCount >= ADMIN_MFA_MAX_ATTEMPTS) {
    await clearChallengeCookie();
    return NextResponse.json(
      { error: { code: 'too_many_attempts', message: 'Bạn đã nhập sai quá nhiều lần. Vui lòng đăng nhập lại.' } },
      { status: 429 },
    );
  }

  const isValidCode = compareCodeHash(challenge.codeHash, challenge.id, parsed.data.code);
  if (!isValidCode) {
    await incrementChallengeAttemptCookie(challenge);

    return NextResponse.json(
      { error: { code: 'invalid_code', message: 'Mã xác nhận không đúng.' } },
      { status: 401 },
    );
  }

  await clearChallengeCookie();
  await setVerifiedCookie(user);
  return NextResponse.json({ ok: true });
}
