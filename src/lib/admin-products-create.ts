import { z } from 'zod';
import {
  hasPromptMeta,
  normalizePromptMeta,
  normalizeVersions,
  productVersionSchema,
  productVersionValidationMessage,
  promptMetaSchema,
} from '@/lib/admin-product-validation';
import { categoriesFor, slugify } from '@/lib/product-types';
import { createAdminClient } from '@/lib/supabase/admin';
import { emptyToNull } from '@/lib/string-normalization';
import { httpUrl } from '@/lib/url-safety';

export const productInputSchema = z.object({
  kind: z.enum(['tool', 'prompt', 'webwork']),
  title: z.string().trim().min(2).max(160),
  slug: z.string().trim().min(1).max(80).optional(),
  tagline: z.string().trim().max(300).nullable().optional(),
  description: z.string().max(20000).nullable().optional(),
  notice: z.string().max(2000).nullable().optional(),
  youtube_url: httpUrl().nullable().optional().or(z.literal('')),
  thumbnail_url: httpUrl().nullable().optional().or(z.literal('')),
  repo_url: httpUrl({ max: 300 }).nullable().optional().or(z.literal('')),
  gallery: z.array(httpUrl()).max(20).optional(),
  pricing_mode: z.enum(['fixed', 'from', 'quote']).optional(),
  price_vnd: z.number().int().min(0).nullable().optional(),
  is_free: z.boolean().optional(),
  categories: z.array(z.string().trim().min(1).max(40)).max(6).optional(),
  tags: z.array(z.string().max(40)).max(20).optional(),
  versions: z.array(productVersionSchema).max(10).optional(),
  deliverables: z.array(z.string().max(200)).max(20).optional(),
  support_options: z
    .array(z.enum(['drive_folder', 'zalo_group', 'github_repo']))
    .max(3)
    .optional(),
  duration_label: z.string().trim().max(80).nullable().optional(),
  prerequisites: z.array(z.string().max(200)).max(20).optional(),
  prompt_meta: promptMetaSchema.optional(),
  status: z.enum(['draft', 'published', 'sold_out', 'archived']).optional(),
  featured: z.boolean().optional(),
  sort_order: z.number().int().optional(),
});

export type ProductInput = z.infer<typeof productInputSchema>;

export class ProductCreateError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

export function productCreateErrorResponse(error: ProductCreateError) {
  return { error: { code: error.code, message: error.message } };
}

export async function createAdminProduct(ownerId: string, input: ProductInput) {
  const selectedCategories = Array.from(new Set(input.categories ?? []));
  const allowedCategories = new Set<string>(categoriesFor(input.kind).map((category) => category.value));
  if (selectedCategories.some((category) => !allowedCategories.has(category))) {
    throw new ProductCreateError('validation_error', 'Danh mục không hợp lệ cho loại sản phẩm này.', 422);
  }

  let versions: ReturnType<typeof normalizeVersions> = [];
  try {
    versions = normalizeVersions(input.versions ?? []);
  } catch (err) {
    throw new ProductCreateError('validation_error', productVersionValidationMessage(err), 422);
  }

  if (input.kind !== 'tool' && versions.length > 0) {
    throw new ProductCreateError('validation_error', 'Chỉ sản phẩm loại tool mới có phiên bản executable.', 422);
  }
  if (input.kind !== 'prompt' && hasPromptMeta(input.prompt_meta)) {
    throw new ProductCreateError('validation_error', 'Chỉ sản phẩm loại prompt mới có nội dung prompt riêng.', 422);
  }
  if (input.kind !== 'webwork' && emptyToNull(input.repo_url)) {
    throw new ProductCreateError('validation_error', 'Repo URL chỉ áp dụng cho web/portfolio.', 422);
  }
  if (input.kind === 'webwork' && (input.gallery?.length ?? 0) > 0) {
    throw new ProductCreateError('validation_error', 'Sản phẩm web/portfolio không có gallery — chỉ dùng YouTube hoặc repo URL.', 422);
  }

  const promptMeta = input.kind === 'prompt' ? normalizePromptMeta(input.prompt_meta) : {};
  const slug = (input.slug?.trim() || slugify(input.title)).slice(0, 80);
  const insert = {
    owner_id: ownerId,
    kind: input.kind,
    title: input.title.trim(),
    slug,
    tagline: emptyToNull(input.tagline),
    description: emptyToNull(input.description),
    notice: emptyToNull(input.notice),
    youtube_url: emptyToNull(input.youtube_url),
    thumbnail_url: emptyToNull(input.thumbnail_url),
    repo_url: input.kind === 'webwork' ? emptyToNull(input.repo_url) : null,
    gallery: input.kind === 'webwork' ? [] : (input.gallery ?? []),
    pricing_mode: input.pricing_mode ?? 'fixed',
    price_vnd: input.price_vnd ?? null,
    categories: selectedCategories,
    tags: input.tags ?? [],
    versions,
    deliverables: input.deliverables ?? [],
    support_options: input.support_options ?? [],
    duration_label: emptyToNull(input.duration_label),
    prerequisites: input.prerequisites ?? [],
    prompt_meta: promptMeta,
    status: input.status ?? 'draft',
    featured: input.featured ?? false,
    is_free: input.is_free ?? false,
    sort_order: input.sort_order ?? 0,
  };

  const { data, error } = await createAdminClient()
    .from('products')
    .insert(insert)
    .select()
    .single();

  if (error) {
    console.error('Failed to create product', { code: error.code, message: error.message });
    throw new ProductCreateError(
      error.code ?? 'db_error',
      error.code === '23505' ? 'Slug này đã tồn tại. Hãy chọn slug khác.' : 'Không tạo được sản phẩm. Thử lại sau.',
      error.code === '23505' ? 409 : 500,
    );
  }

  return data;
}
