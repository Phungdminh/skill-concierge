import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import {
  ADMIN_MFA_CODE_TTL_SECONDS,
  clearAdminVerificationCookies,
  createChallengeId,
  createVerificationCode,
  hashVerificationCode,
  setChallengeCookie,
} from '@/lib/admin-verification';
import { sendAdminLoginCodeEmail } from '@/lib/email/resend';
import { getClientIp, checkRateLimit } from '@/lib/rate-limit';
import { checkSameOrigin } from '@/lib/csrf';

const bodySchema = z.object({
  returnTo: z.string().optional(),
});

function safeAdminPath(value: unknown) {
  if (typeof value !== 'string') return '/admin';
  if (!value.startsWith('/admin') || value.startsWith('//')) return '/admin';
  if (value.startsWith('/admin/login') || value.startsWith('/admin/verify')) return '/admin';
  return value;
}

export async function POST(request: Request) {
  const originIssue = await checkSameOrigin();
  if (originIssue) {
    return NextResponse.json(
      { error: { code: 'forbidden_origin', message: 'Yêu cầu không hợp lệ.' } },
      { status: 403 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 'validation_error', message: 'Dữ liệu không hợp lệ.' } },
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

  if (!isAdmin(user) || !user.email) {
    return NextResponse.json(
      { error: { code: 'forbidden', message: 'Tài khoản này không có quyền admin.' } },
      { status: 403 },
    );
  }

  const ip = await getClientIp();
  const [ipLimit, userLimit] = await Promise.all([
    checkRateLimit(`admin-challenge:ip:${ip}`, { windowMs: 60 * 60 * 1000, max: 10 }),
    checkRateLimit(`admin-challenge:user:${user.id}`, { windowMs: 60 * 60 * 1000, max: 6 }),
  ]);
  if (!ipLimit.ok || !userLimit.ok) {
    const retry = Math.max(ipLimit.retryAfterSec, userLimit.retryAfterSec);
    return NextResponse.json(
      {
        error: {
          code: 'rate_limited',
          message: 'Bạn yêu cầu mã quá nhiều lần. Thử lại sau vài phút.',
        },
      },
      { status: 429, headers: { 'Retry-After': String(retry) } },
    );
  }

  const expiresAt = Date.now() + ADMIN_MFA_CODE_TTL_SECONDS * 1000;
  const code = createVerificationCode();
  const challengeId = createChallengeId();

  await clearAdminVerificationCookies();

  try {
    await sendAdminLoginCodeEmail({ to: user.email, code });
  } catch (err) {
    console.error('Failed to send admin login code email', {
      message: err instanceof Error ? err.message : 'unknown_error',
    });
    return NextResponse.json(
      { error: { code: 'email_error', message: 'Không gửi được email xác nhận. Vui lòng thử lại.' } },
      { status: 500 },
    );
  }

  await setChallengeCookie({
    id: challengeId,
    userId: user.id,
    email: user.email.toLowerCase().trim(),
    codeHash: hashVerificationCode(challengeId, code),
    expiresAt,
    attemptCount: 0,
  });
  const returnTo = safeAdminPath(parsed.data.returnTo);
  return NextResponse.json({
    ok: true,
    next: `/admin/verify?returnTo=${encodeURIComponent(returnTo)}`,
  });
}
