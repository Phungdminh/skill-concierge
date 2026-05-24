import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { visitorHash } from '@/lib/rate-limit';

const idSchema = z.string().uuid();

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(_req: Request, { params }: RouteContext) {
  const { id } = await params;
  const parsed = idSchema.safeParse(id);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 'invalid_id', message: 'Product id không hợp lệ.' } },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const hash = await visitorHash(`view:${parsed.data}`);
  const { error } = await supabase.rpc('increment_product_view', {
    p_id: parsed.data,
    p_visitor_hash: hash,
  });
  if (error) {
    console.error('increment_product_view failed', { code: error.code, message: error.message });
    return NextResponse.json(
      { error: { code: 'db_error', message: 'Không cập nhật được lượt xem.' } },
      { status: 500 },
    );
  }
  return NextResponse.json({ ok: true });
}
