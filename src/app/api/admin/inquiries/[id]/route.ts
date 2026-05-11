import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

const idSchema = z.string().uuid();

const patchSchema = z.object({
  status: z.enum(['new', 'contacted', 'closed']),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await requireAdmin();
  if (!user) {
    return NextResponse.json(
      { error: { code: 'forbidden', message: 'Chỉ admin mới được phép.' } },
      { status: 403 },
    );
  }
  const { id } = await params;
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) {
    return NextResponse.json(
      { error: { code: 'invalid_id', message: 'ID yêu cầu không hợp lệ.' } },
      { status: 400 },
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

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('inquiries')
    .update({ status: parsed.data.status })
    .eq('id', parsedId.data)
    .select()
    .single();
  if (error) {
    console.error('Failed to update inquiry', { code: error.code, message: error.message });
    const status = error.code === 'PGRST116' ? 404 : 500;
    const message =
      error.code === 'PGRST116'
        ? 'Không tìm thấy yêu cầu.'
        : 'Không cập nhật được yêu cầu. Thử lại sau.';
    return NextResponse.json(
      { error: { code: error.code ?? 'db_error', message } },
      { status },
    );
  }
  return NextResponse.json(data);
}
