import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { categoriesFor, slugify } from '@/lib/product-types';
import { createAdminClient } from '@/lib/supabase/admin';

const productVersionSchema = z.object({
  name: z.string().trim().min(1).max(80),
  slug: z.string().trim().min(1).max(80).optional().or(z.literal('')),
  description: z.string().trim().max(500).nullable().optional().or(z.literal('')),
  executable_label: z.string().trim().max(160).nullable().optional().or(z.literal('')),
  platform: z.string().trim().max(120).nullable().optional().or(z.literal('')),
  is_default: z.boolean().optional(),
  status: z.enum(['available', 'beta', 'deprecated', 'hidden']).optional(),
});

const promptMetaSchema = z.object({
  preview_content: z.string().max(5000).nullable().optional(),
  full_content: z.string().max(50000).nullable().optional(),
  explanation: z.string().max(20000).nullable().optional(),
  related_slugs: z.array(z.string().trim().min(1).max(80)).max(12).optional(),
});

const productInputSchema = z.object({
  kind: z.enum(['tool', 'prompt', 'webwork']),
  title: z.string().trim().min(2).max(160),
  slug: z.string().trim().min(1).max(80).optional(),
  tagline: z.string().trim().max(300).nullable().optional(),
  description: z.string().max(20000).nullable().optional(),
  notice: z.string().max(2000).nullable().optional(),
  youtube_url: z.string().trim().url().nullable().optional().or(z.literal('')),
  thumbnail_url: z.string().trim().url().nullable().optional().or(z.literal('')),
  gallery: z.array(z.string().url()).max(20).optional(),
  pricing_mode: z.enum(['fixed', 'from', 'quote']).optional(),
  price_vnd: z.number().int().min(0).nullable().optional(),
  is_free: z.boolean().optional(),
  categories: z.array(z.string().trim().min(1).max(40)).max(6).optional(),
  tags: z.array(z.string().max(40)).max(20).optional(),
  versions: z.array(productVersionSchema).max(10).optional(),
  deliverables: z.array(z.string().max(200)).max(20).optional(),
  support_options: z
    .array(z.enum(['drive_folder', 'zalo_group', 'one_on_one_call']))
    .max(3)
    .optional(),
  duration_label: z.string().trim().max(80).nullable().optional(),
  prerequisites: z.array(z.string().max(200)).max(20).optional(),
  prompt_meta: promptMetaSchema.optional(),
  status: z.enum(['draft', 'published', 'sold_out', 'archived']).optional(),
  featured: z.boolean().optional(),
  sort_order: z.number().int().optional(),
});

function emptyToNull<T extends string | null | undefined>(v: T): string | null {
  if (v == null) return null;
  const t = v.trim();
  return t.length === 0 ? null : t;
}

function normalizePromptMeta(meta: z.infer<typeof promptMetaSchema> | undefined) {
  return {
    preview_content: emptyToNull(meta?.preview_content),
    full_content: emptyToNull(meta?.full_content),
    explanation: emptyToNull(meta?.explanation),
    related_slugs: Array.from(new Set((meta?.related_slugs ?? []).map((slug) => slug.trim()).filter(Boolean))),
  };
}

function hasPromptMeta(meta: z.infer<typeof promptMetaSchema> | undefined) {
  if (!meta) return false;
  return Boolean(
    emptyToNull(meta.preview_content) ||
    emptyToNull(meta.full_content) ||
    emptyToNull(meta.explanation) ||
    (meta.related_slugs ?? []).some((slug) => slug.trim()),
  );
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

  let versions: ReturnType<typeof normalizeVersions> = [];
  try {
    versions = normalizeVersions(parsed.data.versions ?? []);
  } catch (err) {
    const message = err instanceof Error && err.message === 'multiple_default_versions'
      ? 'Chỉ được chọn một phiên bản mặc định.'
      : 'Slug phiên bản không được trùng nhau.';
    return versionValidationResponse(message);
  }
  if (parsed.data.kind !== 'tool' && versions.length > 0) {
    return versionValidationResponse('Chỉ sản phẩm loại tool mới có phiên bản executable.');
  }
  if (parsed.data.kind !== 'prompt' && hasPromptMeta(parsed.data.prompt_meta)) {
    return versionValidationResponse('Chỉ sản phẩm loại prompt mới có nội dung prompt riêng.');
  }
  const promptMeta = parsed.data.kind === 'prompt' ? normalizePromptMeta(parsed.data.prompt_meta) : {};

  const supabase = createAdminClient();
  const slug = (parsed.data.slug?.trim() || slugify(parsed.data.title)).slice(0, 80);

  const insert = {
    owner_id: user.id,
    kind: parsed.data.kind,
    title: parsed.data.title.trim(),
    slug,
    tagline: emptyToNull(parsed.data.tagline),
    description: emptyToNull(parsed.data.description),
    notice: emptyToNull(parsed.data.notice),
    youtube_url: emptyToNull(parsed.data.youtube_url),
    thumbnail_url: emptyToNull(parsed.data.thumbnail_url),
    gallery: parsed.data.gallery ?? [],
    pricing_mode: parsed.data.pricing_mode ?? 'fixed',
    price_vnd: parsed.data.price_vnd ?? null,
    categories: selectedCategories,
    tags: parsed.data.tags ?? [],
    versions,
    deliverables: parsed.data.deliverables ?? [],
    support_options: parsed.data.support_options ?? [],
    duration_label: emptyToNull(parsed.data.duration_label),
    prerequisites: parsed.data.prerequisites ?? [],
    prompt_meta: promptMeta,
    status: parsed.data.status ?? 'draft',
    featured: parsed.data.featured ?? false,
    is_free: parsed.data.is_free ?? false,
    sort_order: parsed.data.sort_order ?? 0,
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
