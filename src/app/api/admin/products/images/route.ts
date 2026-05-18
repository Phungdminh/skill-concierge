import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { requireAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);
const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export async function POST(req: Request) {
  const user = await requireAdmin();
  if (!user) {
    return NextResponse.json(
      { error: { code: 'forbidden', message: 'Chỉ admin mới được phép.' } },
      { status: 403 },
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json(
      { error: { code: 'invalid_body', message: 'Body không hợp lệ.' } },
      { status: 400 },
    );
  }

  const file = form.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: { code: 'missing_file', message: 'Thiếu tệp ảnh.' } },
      { status: 400 },
    );
  }
  if (!ALLOWED_MIME.has(file.type)) {
    return NextResponse.json(
      { error: { code: 'invalid_type', message: 'Chỉ hỗ trợ ảnh JPG, PNG hoặc WebP.' } },
      { status: 415 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: { code: 'too_large', message: 'Ảnh phải nhỏ hơn 5MB.' } },
      { status: 413 },
    );
  }

  const ext = EXT_BY_MIME[file.type];
  const path = `${user.id}/products/${randomUUID()}.${ext}`;
  const arrayBuffer = await file.arrayBuffer();
  const supabase = createAdminClient();

  const { error: uploadError } = await supabase.storage
    .from('product-images')
    .upload(path, arrayBuffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    console.error('Failed to upload product image', uploadError);
    return NextResponse.json(
      { error: { code: 'upload_failed', message: 'Không tải ảnh lên được. Thử lại sau.' } },
      { status: 500 },
    );
  }

  const { data: publicUrlData } = supabase.storage.from('product-images').getPublicUrl(path);
  return NextResponse.json({ url: publicUrlData.publicUrl, path });
}
