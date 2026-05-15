import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { categoriesFor, type ProductKind } from '@/lib/product-types';
import { createAdminClient } from '@/lib/supabase/admin';

const idSchema = z.string().uuid();

const productVersionSchema = z.object({
  name: z.string().trim().min(1).max(80),
  slug: z.string().trim().min(1).max(80).optional().or(z.literal('')),
  description: z.string().trim().max(500).nullable().optional().or(z.literal('')),
  executable_label: z.string().trim().max(160).nullable().optional().or(z.literal('')),
  platform: z.string().trim().max(120).nullable().optional().or(z.literal('')),
  price_vnd: z.number().int().min(0).nullable().optional(),
  pricing_mode: z.enum(['fixed', 'from', 'quote']).optional(),
  is_default: z.boolean().optional(),
  status: z.enum(['available', 'beta', 'deprecated', 'hidden']).optional(),
});

const patchSchema = z.object({
  title: z.string().trim().min(2).max(160).optional(),
  slug: z.string().trim().min(1).max(80).optional(),
  tagline: z.string().max(300).nullable().optional(),
  description: z.string().max(20000).nullable().optional(),
  notice: z.string().max(2000).nullable().optional(),
  youtube_url: z.string().url().nullable().optional().or(z.literal('')),
  thumbnail_url: z.string().url().nullable().optional().or(z.literal('')),
  gallery: z.array(z.string().url()).max(20).optional(),
  pricing_mode: z.enum(['fixed', 'from', 'quote']).optional(),
  price_vnd: z.number().int().min(0).nullable().optional(),
  is_free: z.boolean().optional(),
  categories: z.array(z.string().trim().min(1).max(40)).max(6).optional(),
  tags: z.array(z.string().max(40)).max(20).optional(),
  versions: z.array(productVersionSchema).max(10).optional(),
  deliverables: z.array(z.string().max(200)).max(20).optional(),
  support_options: z
    .array(z.enum(['drive_folder', 'zalo_group', 'one_on_one_call', 'remote_setup']))
    .max(4)
    .optional(),
  duration_label: z.string().max(80).nullable().optional(),
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

function normalizeVersions(versions: z.infer<typeof productVersionSchema>[]) {
  const slugs = new Set<string>();
  let defaultCount = 0;
  const normalized = versions.map((version) => {
    const slug = version.slug?.trim() || undefined;
    if (slug) {
      if (slugs.has(slug)) throw new Error('duplicate_version_slug');
      slugs.add(slug);
    }
    if (version.is_default) defaultCount += 1;
    return {
      name: version.name.trim(),
      ...(slug ? { slug } : {}),
      ...(emptyToNull(version.description) ? { description: emptyToNull(version.description) } : {}),
      ...(emptyToNull(version.executable_label) ? { executable_label: emptyToNull(version.executable_label) } : {}),
      ...(emptyToNull(version.platform) ? { platform: emptyToNull(version.platform) } : {}),
      price_vnd: version.pricing_mode === 'quote' ? null : (version.price_vnd ?? null),
      ...(version.pricing_mode ? { pricing_mode: version.pricing_mode } : {}),
      is_default: version.is_default ?? false,
      status: version.status ?? 'available',
    };
  });
  if (defaultCount > 1) throw new Error('multiple_default_versions');
  return normalized;
}

function versionValidationResponse(message: string) {
  return NextResponse.json(
    { error: { code: 'validation_error', message } },
    { status: 422 },
  );
}

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
      { error: { code: 'invalid_id', message: 'ID sản phẩm không hợp lệ.' } },
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

  let selectedCategories: string[] | undefined;
  let versions: ReturnType<typeof normalizeVersions> | undefined;
  if (parsed.data.versions !== undefined) {
    try {
      versions = normalizeVersions(parsed.data.versions);
    } catch (err) {
      const message = err instanceof Error && err.message === 'multiple_default_versions'
        ? 'Chỉ được chọn một phiên bản mặc định.'
        : 'Slug phiên bản không được trùng nhau.';
      return versionValidationResponse(message);
    }
  }

  let existingKind: ProductKind | undefined;
  if (parsed.data.categories !== undefined || versions !== undefined) {
    const { data: existing, error: existingError } = await supabase
      .from('products')
      .select('kind')
      .eq('id', parsedId.data)
      .single();

    if (existingError) {
      console.error('Failed to load product kind before validation', {
        code: existingError.code,
        message: existingError.message,
      });
      const status = existingError.code === 'PGRST116' ? 404 : 500;
      return NextResponse.json(
        {
          error: {
            code: existingError.code ?? 'db_error',
            message: status === 404 ? 'Không tìm thấy sản phẩm.' : 'Không kiểm tra được sản phẩm.',
          },
        },
        { status },
      );
    }

    existingKind = existing.kind as ProductKind;
  }

  if (parsed.data.categories !== undefined) {
    selectedCategories = Array.from(new Set(parsed.data.categories));
    const allowedCategories = new Set<string>(categoriesFor(existingKind as ProductKind).map((category) => category.value));
    if (selectedCategories.some((category) => !allowedCategories.has(category))) {
      return NextResponse.json(
        { error: { code: 'validation_error', message: 'Danh mục không hợp lệ cho loại sản phẩm này.' } },
        { status: 422 },
      );
    }
  }

  if (versions !== undefined && existingKind !== 'tool' && versions.length > 0) {
    return versionValidationResponse('Chỉ sản phẩm loại tool mới có phiên bản executable.');
  }

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  const d = parsed.data;
  if (d.title !== undefined) update.title = d.title.trim();
  if (d.slug !== undefined) update.slug = d.slug.trim();
  if (d.tagline !== undefined) update.tagline = emptyToNull(d.tagline);
  if (d.description !== undefined) update.description = emptyToNull(d.description);
  if (d.notice !== undefined) update.notice = emptyToNull(d.notice);
  if (d.youtube_url !== undefined) update.youtube_url = emptyToNull(d.youtube_url);
  if (d.thumbnail_url !== undefined) update.thumbnail_url = emptyToNull(d.thumbnail_url);
  if (d.gallery !== undefined) update.gallery = d.gallery;
  if (d.pricing_mode !== undefined) update.pricing_mode = d.pricing_mode;
  if (d.price_vnd !== undefined) update.price_vnd = d.price_vnd;
  if (selectedCategories !== undefined) update.categories = selectedCategories;
  if (d.tags !== undefined) update.tags = d.tags;
  if (versions !== undefined) update.versions = versions;
  if (d.deliverables !== undefined) update.deliverables = d.deliverables;
  if (d.support_options !== undefined) update.support_options = d.support_options;
  if (d.duration_label !== undefined) update.duration_label = emptyToNull(d.duration_label);
  if (d.prerequisites !== undefined) update.prerequisites = d.prerequisites;
  if (d.status !== undefined) update.status = d.status;
  if (d.featured !== undefined) update.featured = d.featured;
  if (d.is_free !== undefined) update.is_free = d.is_free;
  if (d.sort_order !== undefined) update.sort_order = d.sort_order;
  if (d.sales_count !== undefined) update.sales_count = d.sales_count;

  const { data, error } = await supabase
    .from('products')
    .update(update)
    .eq('id', parsedId.data)
    .select()
    .single();

  if (error) {
    console.error('Failed to update product', { code: error.code, message: error.message });
    const status = error.code === '23505' ? 409 : error.code === 'PGRST116' ? 404 : 500;
    const message =
      error.code === '23505'
        ? 'Slug này đã tồn tại. Hãy chọn slug khác.'
        : error.code === 'PGRST116'
          ? 'Không tìm thấy sản phẩm.'
          : 'Không lưu được sản phẩm. Thử lại sau.';
    return NextResponse.json(
      { error: { code: error.code ?? 'db_error', message } },
      { status },
    );
  }
  return NextResponse.json(data);
}

export async function DELETE(
  _req: Request,
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
      { error: { code: 'invalid_id', message: 'ID sản phẩm không hợp lệ.' } },
      { status: 400 },
    );
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', parsedId.data)
    .select('id')
    .single();
  if (error) {
    console.error('Failed to delete product', { code: error.code, message: error.message });
    const status = error.code === 'PGRST116' ? 404 : 500;
    const message =
      error.code === 'PGRST116'
        ? 'Không tìm thấy sản phẩm.'
        : 'Không xoá được sản phẩm. Thử lại sau.';
    return NextResponse.json(
      { error: { code: error.code ?? 'db_error', message } },
      { status },
    );
  }
  return NextResponse.json({ ok: true });
}
