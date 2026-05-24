import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { createClient } from '@/lib/supabase/server';
import { checkSameOrigin } from '@/lib/csrf';

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);
const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

function detectImageMime(bytes: Uint8Array) {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg';
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) return 'image/png';
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) return 'image/webp';
  return null;
}

export async function POST(req: Request) {
  const originIssue = await checkSameOrigin();
  if (originIssue) {
    return NextResponse.json(
      { error: { code: 'forbidden_origin', message: 'Yêu cầu không hợp lệ.' } },
      { status: 403 },
    );
  }

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
  if (file.size === 0) {
    return NextResponse.json(
      { error: { code: 'empty_file', message: 'Tệp ảnh đang trống.' } },
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

  const arrayBuffer = await file.arrayBuffer();
  const detectedMime = detectImageMime(new Uint8Array(arrayBuffer));
  if (detectedMime !== file.type) {
    console.warn('Rejected avatar with invalid signature', {
      userId: user.id,
      declaredMime: file.type,
      detectedMime,
      size: file.size,
    });
    return NextResponse.json(
      { error: { code: 'invalid_image_signature', message: 'Tệp không đúng định dạng ảnh JPG, PNG hoặc WebP.' } },
      { status: 415 },
    );
  }

  const ext = EXT_BY_MIME[file.type];
  const path = `${user.id}/${randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, arrayBuffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    console.error('Failed to upload avatar', uploadError);
    return NextResponse.json(
      { error: { code: 'upload_failed', message: 'Không tải ảnh lên được. Thử lại sau.' } },
      { status: 500 },
    );
  }

  const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(path);
  return NextResponse.json({ url: publicUrlData.publicUrl, path });
}
