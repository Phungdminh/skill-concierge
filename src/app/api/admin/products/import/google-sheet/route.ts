import { NextResponse } from 'next/server';
import { z } from 'zod';
import { importProductRows, previewProductRows } from '@/lib/admin-product-import';
import { requireAdmin } from '@/lib/auth';
import { fetchGoogleSheetRows, GoogleSheetsError } from '@/lib/google-sheets';

const googleSheetImportSchema = z.object({
  sheet: z.string().trim().min(1),
  range: z.string().trim().max(120).optional(),
  mode: z.enum(['prompt', 'all']).optional(),
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

  const parsed = googleSheetImportSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 'validation_error', message: parsed.error.issues[0]?.message ?? 'Dữ liệu Google Sheet không hợp lệ.' } },
      { status: 422 },
    );
  }

  try {
    const rows = await fetchGoogleSheetRows(parsed.data.sheet, parsed.data.range);
    if (rows.length === 0) {
      return NextResponse.json(
        { error: { code: 'empty_sheet', message: 'Sheet chưa có dòng dữ liệu nào để import.' } },
        { status: 422 },
      );
    }

    const options = {
      ...(parsed.data.mode === 'all' ? {} : { defaultKind: 'prompt' as const }),
      conflictMode: parsed.data.conflictMode ?? 'skip',
    };
    const response = parsed.data.action === 'preview'
      ? await previewProductRows(rows, options)
      : await importProductRows(user.id, rows, options);

    return NextResponse.json(response);
  } catch (err) {
    if (err instanceof GoogleSheetsError) {
      return NextResponse.json(
        { error: { code: err.code, message: err.message } },
        { status: err.status },
      );
    }
    throw err;
  }
}
