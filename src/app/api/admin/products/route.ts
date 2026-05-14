import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { categoriesFor, slugify } from '@/lib/product-types';
import { createAdminClient } from '@/lib/supabase/admin';

const productInputSchema = z.object({
  kind: z.enum(['tool', 'setup', 'prompt', 'webwork']),
  title: z.string().trim().min(2).max(160),
  slug: z.string().trim().min(1).max(80).optional(),
  tagline: z.string().trim().max(300).nullable().optional(),
  description: z.string().max(20000).nullable().optional(),
  youtube_url: z.string().trim().url().nullable().optional().or(z.literal('')),
  thumbnail_url: z.string().trim().url().nullable().optional().or(z.literal('')),
  gallery: z.array(z.string().url()).max(20).optional(),
  pricing_mode: z.enum(['fixed', 'from', 'quote']).optional(),
  price_vnd: z.number().int().min(0).nullable().optional(),
  is_free: z.boolean().optional(),
  categories: z.array(z.string().trim().min(1).max(40)).max(6).optional(),
  tags: z.array(z.string().max(40)).max(20).optional(),
  deliverables: z.array(z.string().max(200)).max(20).optional(),
  support_options: z
    .array(z.enum(['drive_folder', 'zalo_group', 'one_on_one_call', 'remote_setup']))
    .max(4)
    .optional(),
  duration_label: z.string().trim().max(80).nullable().optional(),
  prerequisites: z.array(z.string().max(200)).max(20).optional(),
  status: z.enum(['draft', 'published', 'sold_out', 'archived']).optional(),
  featured: z.boolean().optional(),
  sort_order: z.number().int().optional(),
  sales_count: z.number().int().min(0).optional(),
});

function emptyToNull<T extends string | null | undefined>(v: T): string | null {
  if (v == null) return null;
  const t = v.trim();
  return t.length === 0 ? null : t;
}

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

  const selectedCategories = Array.from(new Set(parsed.data.categories ?? []));
  const allowedCategories = new Set<string>(categoriesFor(parsed.data.kind).map((category) => category.value));
  if (selectedCategories.some((category) => !allowedCategories.has(category))) {
    return NextResponse.json(
      { error: { code: 'validation_error', message: 'Danh mục không hợp lệ cho loại sản phẩm này.' } },
      { status: 422 },
    );
  }

  const supabase = createAdminClient();
  const slug = (parsed.data.slug?.trim() || slugify(parsed.data.title)).slice(0, 80);

  const insert = {
    owner_id: user.id,
    kind: parsed.data.kind,
    title: parsed.data.title.trim(),
    slug,
    tagline: emptyToNull(parsed.data.tagline),
    description: emptyToNull(parsed.data.description),
    youtube_url: emptyToNull(parsed.data.youtube_url),
    thumbnail_url: emptyToNull(parsed.data.thumbnail_url),
    gallery: parsed.data.gallery ?? [],
    pricing_mode: parsed.data.pricing_mode ?? 'fixed',
    price_vnd: parsed.data.price_vnd ?? null,
    categories: selectedCategories,
    tags: parsed.data.tags ?? [],
    deliverables: parsed.data.deliverables ?? [],
    support_options: parsed.data.support_options ?? [],
    duration_label: emptyToNull(parsed.data.duration_label),
    prerequisites: parsed.data.prerequisites ?? [],
    status: parsed.data.status ?? 'draft',
    featured: parsed.data.featured ?? false,
    is_free: parsed.data.is_free ?? false,
    sort_order: parsed.data.sort_order ?? 0,
    sales_count: parsed.data.sales_count ?? 0,
  };

  const { data, error } = await supabase
    .from('products')
    .insert(insert)
    .select()
    .single();
  if (error) {
    console.error('Failed to create product', { code: error.code, message: error.message });
    const status = error.code === '23505' ? 409 : 500;
    const message =
      error.code === '23505'
        ? 'Slug này đã tồn tại. Hãy chọn slug khác.'
        : 'Không tạo được sản phẩm. Thử lại sau.';
    return NextResponse.json(
      { error: { code: error.code ?? 'db_error', message } },
      { status },
    );
  }
  return NextResponse.json(data, { status: 201 });
}
