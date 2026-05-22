import { NextResponse } from 'next/server';
import {
  createAdminProduct,
  ProductCreateError,
  productCreateErrorResponse,
  productInputSchema,
} from '@/lib/admin-products-create';
import { requireAdmin } from '@/lib/auth';

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

  const parsed = productInputSchema.safeParse(payload);
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

  try {
    const product = await createAdminProduct(user.id, parsed.data);
    return NextResponse.json(product, { status: 201 });
  } catch (err) {
    if (err instanceof ProductCreateError) {
      return NextResponse.json(productCreateErrorResponse(err), { status: err.status });
    }
    throw err;
  }
}
