import { NextResponse } from 'next/server';
import { z } from 'zod';
import { importProductRows, previewProductRows } from '@/lib/admin-product-import';
import { requireAdmin } from '@/lib/auth';

const importSchema = z.object({
  rows: z.array(z.record(z.string(), z.unknown())).min(1).max(100),
  action: z.enum(['preview', 'import']).optional(),
  conflictMode: z.enum(['skip', 'update']).optional(),
});


export async function POST(req: Request) {
  const user = await requireAdmin();
  if (!user) {
    return NextResponse.json(
      { error: { code: 'forbidden', message: 'Chỉ admin mới được phép.' } },
      { status: 403 },
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

  const parsed = importSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 'validation_error', message: parsed.error.issues[0]?.message ?? 'Dữ liệu import không hợp lệ.' } },
      { status: 422 },
    );
  }

  const options = { conflictMode: parsed.data.conflictMode ?? 'skip' } as const;
  const response = parsed.data.action === 'preview'
    ? await previewProductRows(parsed.data.rows, options)
    : await importProductRows(user.id, parsed.data.rows, options);

  return NextResponse.json(response);
}
