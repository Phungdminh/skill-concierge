import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const inquirySchema = z.object({
  name: z.string().trim().min(2, 'Tên ngắn quá').max(120),
  email: z.string().trim().email('Email không hợp lệ').max(255),
  phone: z.string().trim().max(40).nullable().optional(),
  message: z.string().trim().max(4000).nullable().optional(),
  product_id: z.string().uuid().nullable().optional(),
  product_kind: z.enum(['tool', 'setup', 'prompt', 'webwork']).nullable().optional(),
  website: z.string().optional(), // honeypot
});

export async function POST(req: Request) {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json(
      { error: { code: 'invalid_json', message: 'Body không hợp lệ.' } },
      { status: 400 },
    );
  }

  const parsed = inquirySchema.safeParse(payload);
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

  // Honeypot — pretend success but skip insert
  if (parsed.data.website && parsed.data.website.trim().length > 0) {
    return NextResponse.json({ ok: true });
  }

  const supabase = await createClient();
  const { error } = await supabase.from('inquiries').insert({
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone ?? null,
    message: parsed.data.message ?? null,
    product_id: parsed.data.product_id ?? null,
    product_kind: parsed.data.product_kind ?? null,
  });
  if (error) {
    console.error('Failed to create inquiry', { code: error.code, message: error.message });
    return NextResponse.json(
      {
        error: {
          code: 'db_error',
          message: 'Không gửi được yêu cầu. Bạn thử lại sau nhé.',
        },
      },
      { status: 500 },
    );
  }
  return NextResponse.json({ ok: true }, { status: 201 });
}
