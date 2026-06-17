import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { emptyToNull } from '@/lib/string-normalization';
import { checkSameOrigin } from '@/lib/csrf';
import { getClientIp, checkRateLimit } from '@/lib/rate-limit';

const idSchema = z.string().uuid();

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().max(120).nullable().optional().or(z.literal('')),
  body: z.string().trim().max(2000).nullable().optional().or(z.literal('')),
});

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, { params }: RouteContext) {
  const originIssue = await checkSameOrigin();
  if (originIssue) {
    return NextResponse.json(
      { error: { code: 'forbidden_origin', message: 'Yêu cầu không hợp lệ.' } },
      { status: 403 },
    );
  }

  const { id } = await params;
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) {
    return NextResponse.json(
      { error: { code: 'invalid_id', message: 'ID sản phẩm không hợp lệ.' } },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: { code: 'unauthorized', message: 'Bạn cần đăng nhập để đánh giá prompt.' } },
      { status: 401 },
    );
  }

  const ip = await getClientIp();
  const limit = await checkRateLimit(`reviews:${user.id}:${ip}`, { windowMs: 60 * 60 * 1000, max: 30 });
  if (!limit.ok) {
    return NextResponse.json(
      { error: { code: 'rate_limited', message: 'Bạn gửi đánh giá quá nhanh. Thử lại sau.' } },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSec) } },
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

  const parsed = reviewSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: 'validation_error',
          message: parsed.error.issues[0]?.message ?? 'Dữ liệu đánh giá không hợp lệ.',
        },
      },
      { status: 422 },
    );
  }

  // User-scoped client — RLS authoritative. RLS policy already restricts to
  // status='published' rows for selects, so any non-published product returns
  // no row regardless of kind.
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('id, kind, status')
    .eq('id', parsedId.data)
    .maybeSingle();

  if (productError) {
    return NextResponse.json(
      { error: { code: productError.code ?? 'db_error', message: 'Không kiểm tra được prompt.' } },
      { status: 500 },
    );
  }
  if (!product) {
    return NextResponse.json(
      { error: { code: 'not_found', message: 'Không tìm thấy prompt.' } },
      { status: 404 },
    );
  }
  if (product.kind !== 'prompt' || product.status !== 'published') {
    return NextResponse.json(
      { error: { code: 'validation_error', message: 'Chỉ có thể đánh giá prompt đang hiển thị.' } },
      { status: 422 },
    );
  }

  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from('product_reviews')
    .upsert(
      {
        product_id: parsedId.data,
        user_id: user.id,
        rating: parsed.data.rating,
        title: emptyToNull(parsed.data.title),
        body: emptyToNull(parsed.data.body),
        status: 'published',
        updated_at: nowIso,
      },
      { onConflict: 'product_id,user_id' },
    )
    .select()
    .single();

  if (error) {
    console.error('Failed to save product review', { code: error.code, message: error.message });
    return NextResponse.json(
      { error: { code: error.code ?? 'db_error', message: 'Không lưu được đánh giá. Thử lại sau.' } },
      { status: 500 },
    );
  }

  return NextResponse.json(data);
}
