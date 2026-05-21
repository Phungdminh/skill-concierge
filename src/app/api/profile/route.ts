import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { httpUrl } from '@/lib/url-safety';

const patchSchema = z.object({
  full_name: z.string().trim().min(1).max(120).nullable().optional(),
  avatar_url: httpUrl({ max: 2000 }).nullable().optional().or(z.literal('')),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).nullable().optional(),
  job_title: z.string().trim().max(120).nullable().optional(),
});

function emptyToNull(v: string | null | undefined): string | null {
  if (v == null) return null;
  const t = v.trim();
  return t.length === 0 ? null : t;
}

export async function PATCH(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: { code: 'unauthorized', message: 'Bạn cần đăng nhập.' } },
      { status: 401 },
    );
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json(
      { error: { code: 'invalid_json', message: 'Body không hợp lệ.' } },
      { status: 400 },
    );
  }

  const parsed = patchSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: 'validation_error',
          message: parsed.error.issues[0]?.message ?? 'Dữ liệu không hợp lệ.',
        },
      },
      { status: 422 },
    );
  }

  const admin = createAdminClient();
  const nowIso = new Date().toISOString();

  const upsert: Record<string, unknown> = {
    id: user.id,
    email: user.email ?? '',
    provider: (user.app_metadata as { provider?: string })?.provider ?? 'google',
    updated_at: nowIso,
  };
  const d = parsed.data;
  if (d.full_name !== undefined) upsert.full_name = emptyToNull(d.full_name);
  if (d.avatar_url !== undefined) upsert.avatar_url = emptyToNull(d.avatar_url);
  if (d.gender !== undefined) upsert.gender = d.gender;
  if (d.job_title !== undefined) upsert.job_title = emptyToNull(d.job_title);

  const { data, error } = await admin
    .from('profiles')
    .upsert(upsert, { onConflict: 'id' })
    .select()
    .single();

  if (error) {
    console.error('Failed to update profile', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    return NextResponse.json(
      { error: { code: error.code ?? 'db_error', message: 'Không lưu được hồ sơ. Thử lại sau.' } },
      { status: 500 },
    );
  }

  return NextResponse.json(data);
}
