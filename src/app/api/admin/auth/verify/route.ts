import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import {
  ADMIN_MFA_MAX_ATTEMPTS,
  clearChallengeCookie,
  compareCodeHash,
  getChallengeIdFromCookie,
  setVerifiedCookie,
} from '@/lib/admin-verification';

const bodySchema = z.object({
  code: z.string().trim().regex(/^\d{6}$/, 'Mã xác nhận phải gồm 6 chữ số.'),
});

export async function POST(request: Request) {
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

  const challengeId = await getChallengeIdFromCookie();
  if (!challengeId) {
    return NextResponse.json(
      { error: { code: 'missing_challenge', message: 'Phiên xác nhận đã hết hạn. Vui lòng đăng nhập lại.' } },
      { status: 410 },
    );
  }

  const supabase = createAdminClient();
  const { data: challenge, error } = await supabase
    .from('admin_login_challenges')
    .select('id,user_id,code_hash,expires_at,consumed_at,attempt_count')
    .eq('id', challengeId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    console.error('Failed to load admin login challenge', {
      code: error.code,
      message: error.message,
    });
    return NextResponse.json(
      { error: { code: 'challenge_error', message: 'Không kiểm tra được mã xác nhận.' } },
      { status: 500 },
    );
  }

  if (!challenge || challenge.consumed_at) {
    await clearChallengeCookie();
    return NextResponse.json(
      { error: { code: 'invalid_challenge', message: 'Phiên xác nhận không hợp lệ. Vui lòng đăng nhập lại.' } },
      { status: 410 },
    );
  }

  if (new Date(challenge.expires_at).getTime() <= Date.now()) {
    await clearChallengeCookie();
    return NextResponse.json(
      { error: { code: 'expired_challenge', message: 'Mã xác nhận đã hết hạn. Vui lòng đăng nhập lại.' } },
      { status: 410 },
    );
  }

  if (challenge.attempt_count >= ADMIN_MFA_MAX_ATTEMPTS) {
    await clearChallengeCookie();
    return NextResponse.json(
      { error: { code: 'too_many_attempts', message: 'Bạn đã nhập sai quá nhiều lần. Vui lòng đăng nhập lại.' } },
      { status: 429 },
    );
  }

  const isValidCode = compareCodeHash(challenge.code_hash, challenge.id, parsed.data.code);
  if (!isValidCode) {
    await supabase
      .from('admin_login_challenges')
      .update({ attempt_count: challenge.attempt_count + 1 })
      .eq('id', challenge.id);

    return NextResponse.json(
      { error: { code: 'invalid_code', message: 'Mã xác nhận không đúng.' } },
      { status: 401 },
    );
  }

  const { error: consumeError } = await supabase
    .from('admin_login_challenges')
    .update({ consumed_at: new Date().toISOString() })
    .eq('id', challenge.id);

  if (consumeError) {
    console.error('Failed to consume admin login challenge', {
      code: consumeError.code,
      message: consumeError.message,
    });
    return NextResponse.json(
      { error: { code: 'challenge_error', message: 'Không hoàn tất xác nhận.' } },
      { status: 500 },
    );
  }

  await clearChallengeCookie();
  await setVerifiedCookie(user);
  return NextResponse.json({ ok: true });
}
