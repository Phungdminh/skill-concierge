import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

const idSchema = z.string().uuid();

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().max(120).nullable().optional().or(z.literal('')),
  body: z.string().trim().max(2000).nullable().optional().or(z.literal('')),
});

interface RouteContext {
  params: Promise<{ id: string }>;
}

function emptyToNull(v: string | null | undefined): string | null {
  if (v == null) return null;
  const t = v.trim();
  return t.length === 0 ? null : t;
}

export async function POST(req: Request, { params }: RouteContext) {
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

  const admin = createAdminClient();
  const { data: product, error: productError } = await admin
    .from('products')
    .select('id, kind, status')
    .eq('id', parsedId.data)
    .single();

  if (productError) {
    const status = productError.code === 'PGRST116' ? 404 : 500;
    return NextResponse.json(
      {
        error: {
          code: productError.code ?? 'db_error',
          message: status === 404 ? 'Không tìm thấy prompt.' : 'Không kiểm tra được prompt.',
        },
      },
      { status },
    );
  }

  if (product.kind !== 'prompt' || product.status !== 'published') {
    return NextResponse.json(
      { error: { code: 'validation_error', message: 'Chỉ có thể đánh giá prompt đang hiển thị.' } },
      { status: 422 },
    );
  }

  const nowIso = new Date().toISOString();
  const { data, error } = await admin
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
