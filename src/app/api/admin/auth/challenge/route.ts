import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import {
  ADMIN_MFA_CODE_TTL_SECONDS,
  clearAdminVerificationCookies,
  createVerificationCode,
  hashVerificationCode,
  setChallengeCookie,
} from '@/lib/admin-verification';
import { sendAdminLoginCodeEmail } from '@/lib/email/resend';

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

  const supabase = createAdminClient();
  const expiresAt = new Date(Date.now() + ADMIN_MFA_CODE_TTL_SECONDS * 1000).toISOString();
  const code = createVerificationCode();

  await clearAdminVerificationCookies();

  const { error: consumeError } = await supabase
    .from('admin_login_challenges')
    .update({ consumed_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .is('consumed_at', null);

  if (consumeError) {
    console.error('Failed to clear old admin login challenges', {
      code: consumeError.code,
      message: consumeError.message,
    });
    return NextResponse.json(
      { error: { code: 'challenge_error', message: 'Không tạo được mã xác nhận.' } },
      { status: 500 },
    );
  }

  const { data, error } = await supabase
    .from('admin_login_challenges')
    .insert({
      user_id: user.id,
      email: user.email,
      code_hash: 'pending',
      expires_at: expiresAt,
    })
    .select('id')
    .single();

  if (error || !data) {
    console.error('Failed to create admin login challenge', {
      code: error?.code,
      message: error?.message,
    });
    return NextResponse.json(
      { error: { code: 'challenge_error', message: 'Không tạo được mã xác nhận.' } },
      { status: 500 },
    );
  }

  const codeHash = hashVerificationCode(data.id, code);
  const { error: updateError } = await supabase
    .from('admin_login_challenges')
    .update({ code_hash: codeHash })
    .eq('id', data.id);

  if (updateError) {
    console.error('Failed to store admin login challenge hash', {
      code: updateError.code,
      message: updateError.message,
    });
    return NextResponse.json(
      { error: { code: 'challenge_error', message: 'Không tạo được mã xác nhận.' } },
      { status: 500 },
    );
  }

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

  await setChallengeCookie(data.id);
  const returnTo = safeAdminPath(parsed.data.returnTo);
  return NextResponse.json({
    ok: true,
    next: `/admin/verify?returnTo=${encodeURIComponent(returnTo)}`,
  });
}
