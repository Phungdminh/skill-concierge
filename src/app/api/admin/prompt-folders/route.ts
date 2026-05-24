import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { checkSameOrigin } from '@/lib/csrf';
import {
  createPromptFolder,
  listPromptFolders,
  PromptFolderError,
} from '@/lib/admin-prompt-folders';
import { promptFolderInputSchema } from '@/lib/prompt-folder-types';

export async function GET() {
  const user = await requireAdmin();
  if (!user) {
    return NextResponse.json(
      { error: { code: 'forbidden', message: 'Chỉ admin mới được phép.' } },
      { status: 403 },
    );
  }

  try {
    const folders = await listPromptFolders();
    return NextResponse.json({ folders });
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

export async function POST(req: Request) {
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

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json(
      { error: { code: 'invalid_json', message: 'Body không hợp lệ.' } },
      { status: 400 },
    );
  }

  const parsed = promptFolderInputSchema.safeParse(payload);
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
    const folder = await createPromptFolder(parsed.data);
    return NextResponse.json(folder, { status: 201 });
  } catch (err) {
    if (err instanceof PromptFolderError) {
      return NextResponse.json({ error: { code: err.code, message: err.message } }, { status: err.status });
    }
    return NextResponse.json(
      { error: { code: 'unknown_error', message: 'Không tạo được folder.' } },
      { status: 500 },
    );
  }
}
