import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { checkSameOrigin } from '@/lib/csrf';
import {
  deletePromptFolder,
  getPromptFolderById,
  PromptFolderError,
  updatePromptFolder,
} from '@/lib/admin-prompt-folders';
import { promptFolderPatchSchema } from '@/lib/prompt-folder-types';

const idSchema = z.string().uuid();

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, { params }: RouteContext) {
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
      { error: { code: 'invalid_id', message: 'ID không hợp lệ.' } },
      { status: 400 },
    );
  }

  try {
    const folder = await getPromptFolderById(parsedId.data);
    if (!folder) {
      return NextResponse.json(
        { error: { code: 'not_found', message: 'Không tìm thấy folder.' } },
        { status: 404 },
      );
    }
    return NextResponse.json(folder);
  } catch (err) {
    if (err instanceof PromptFolderError) {
      return NextResponse.json({ error: { code: err.code, message: err.message } }, { status: err.status });
    }
    return NextResponse.json(
      { error: { code: 'unknown_error', message: 'Không tải được folder.' } },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request, { params }: RouteContext) {
  const originIssue = await checkSameOrigin();
  if (originIssue) {
    return NextResponse.json(
      { error: { code: 'forbidden_origin', message: 'Yêu cầu không hợp lệ.' } },
      { status: 403 },
    );
  }

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
      { error: { code: 'invalid_id', message: 'ID không hợp lệ.' } },
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

  const parsed = promptFolderPatchSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: 'validation_error',
          message: parsed.error.issues[0]?.message ?? 'Dữ liệu folder không hợp lệ.',
        },
      },
      { status: 422 },
    );
  }

  try {
    const folder = await updatePromptFolder(parsedId.data, parsed.data);
    return NextResponse.json(folder);
  } catch (err) {
    if (err instanceof PromptFolderError) {
      return NextResponse.json({ error: { code: err.code, message: err.message } }, { status: err.status });
    }
    return NextResponse.json(
      { error: { code: 'unknown_error', message: 'Không cập nhật được folder.' } },
      { status: 500 },
    );
  }
}

export async function DELETE(_req: Request, { params }: RouteContext) {
  const originIssue = await checkSameOrigin();
  if (originIssue) {
    return NextResponse.json(
      { error: { code: 'forbidden_origin', message: 'Yêu cầu không hợp lệ.' } },
      { status: 403 },
    );
  }

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
      { error: { code: 'invalid_id', message: 'ID không hợp lệ.' } },
      { status: 400 },
    );
  }

  try {
    await deletePromptFolder(parsedId.data);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof PromptFolderError) {
      return NextResponse.json({ error: { code: err.code, message: err.message } }, { status: err.status });
    }
    return NextResponse.json(
      { error: { code: 'unknown_error', message: 'Không xóa được folder.' } },
      { status: 500 },
    );
  }
}
