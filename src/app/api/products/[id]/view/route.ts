import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { getClientIp, rateLimit, visitorHash } from '@/lib/rate-limit';

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

  // App-layer throttle so a flood can't hammer the DB RPC, even though the
  // dedup table already prevents view_count inflation. 60/min/IP is well
  // above normal browsing.
  const ip = await getClientIp();
  const limit = rateLimit(`view:${ip}`, { windowMs: 60 * 1000, max: 60 });
  if (!limit.ok) {
    return NextResponse.json(
      { error: { code: 'rate_limited', message: 'Quá nhiều yêu cầu. Thử lại sau.' } },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSec) } },
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
