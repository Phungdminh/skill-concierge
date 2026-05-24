import {
  createAdminProduct,
  ProductCreateError,
  productCreateErrorResponse,
  productInputSchema,
  type ProductInput,
} from '@/lib/admin-products-create';
import {
  hasPromptMeta,
  normalizePromptMeta,
  normalizeVersions as normalizeProductVersions,
  productVersionValidationMessage,
} from '@/lib/admin-product-validation';
import { normalizeGoogleDriveImageUrl } from '@/lib/google-drive-images';
import { categoriesFor, slugify, type ProductKind, type PricingMode, type ProductStatus, type ProductVersionStatus, type SupportOption } from '@/lib/product-types';
import { createAdminClient } from '@/lib/supabase/admin';
import { emptyToNull } from '@/lib/string-normalization';
import type { PromptFolder } from '@/lib/prompt-folder-types';

const SUPPORT_ALIASES: Record<string, SupportOption> = {
  drive: 'drive_folder',
  folder: 'drive_folder',
  drive_folder: 'drive_folder',
  'folder drive': 'drive_folder',
  zalo: 'zalo_group',
  zalo_group: 'zalo_group',
  'zalo group': 'zalo_group',
  github: 'github_repo',
  repo: 'github_repo',
  github_repo: 'github_repo',
  'github repo': 'github_repo',
};

type ImportProductOptions = {
  defaultKind?: ProductKind;
  conflictMode?: ImportConflictMode;
};

export type ImportConflictMode = 'skip' | 'update';
export type ImportAction = 'preview' | 'import';
export type ProductImportStatus = 'ready' | 'invalid' | 'exists_skip' | 'exists_update' | 'created' | 'updated' | 'skipped' | 'failed';

type ExistingProduct = { id: string; kind: ProductKind; slug: string; title: string };

export type ProductImportResult = {
  rowNumber: number;
  ok: boolean;
  status: ProductImportStatus;
  message?: string;
  product?: ExistingProduct;
  preview?: { kind: ProductKind; slug: string; title: string };
  error?: { code: string; message: string };
};

export type ProductImportSummary = {
  total: number;
  ready: number;
  invalid: number;
  conflicts: number;
  created: number;
  updated: number;
  skipped: number;
  failed: number;
};

export type ProductImportResponse = {
  summary: ProductImportSummary;
  results: ProductImportResult[];
};

type PreparedRow = {
  rowNumber: number;
  input?: ProductInput;
  checked?: ProductInput;
  slug?: string;
  existing?: ExistingProduct;
  error?: { code: string; message: string };
};

function cell(row: Record<string, unknown>, ...keys: string[]) {
  const normalized = new Map(
    Object.entries(row).map(([key, value]) => [key.trim().toLowerCase().replace(/[\s-]+/g, '_'), value]),
  );
  for (const key of keys) {
    const value = normalized.get(key);
    if (value != null) return String(value).trim();
  }
  return '';
}

function splitList(value: string) {
  return value
    .split('|')
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitImageList(value: string) {
  return splitList(value).map(normalizeGoogleDriveImageUrl);
}

function parseBoolean(value: string) {
  const normalized = value.trim().toLowerCase();
  return ['1', 'true', 'yes', 'y', 'co', 'có', 'x'].includes(normalized);
}

function parseNumber(value: string) {
  const digits = value.replace(/[^0-9-]/g, '');
  if (!digits) return undefined;
  const parsed = Number.parseInt(digits, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function normalizeKind(value: string, defaultKind?: ProductKind): ProductKind | undefined {
  const normalized = value.trim().toLowerCase();
  if (!normalized && defaultKind) return defaultKind;
  if (normalized === 'tool') return 'tool';
  if (normalized === 'prompt') return 'prompt';
  if (['web', 'webwork', 'portfolio', 'web/portfolio'].includes(normalized)) return 'webwork';
  return undefined;
}

function normalizeStatus(value: string): ProductStatus | undefined {
  const normalized = value.trim().toLowerCase();
  if (['draft', 'published', 'sold_out', 'archived'].includes(normalized)) return normalized as ProductStatus;
  if (normalized === 'ban_nhap' || normalized === 'nhap') return 'draft';
  if (normalized === 'dang_ban' || normalized === 'public') return 'published';
  return undefined;
}

function normalizePricingMode(value: string): PricingMode | undefined {
  const normalized = value.trim().toLowerCase();
  if (['fixed', 'from', 'quote'].includes(normalized)) return normalized as PricingMode;
  if (normalized === 'gia_co_dinh') return 'fixed';
  if (normalized === 'gia_tu') return 'from';
  if (normalized === 'lien_he') return 'quote';
  return undefined;
}

function normalizeSupportOptions(value: string) {
  return splitList(value)
    .map((item) => SUPPORT_ALIASES[item.toLowerCase().replace(/[\s-]+/g, '_')] ?? SUPPORT_ALIASES[item.toLowerCase()])
    .filter(Boolean);
}

function normalizeVersionStatus(value: string | undefined): ProductVersionStatus | undefined {
  return value && ['available', 'beta', 'deprecated', 'hidden'].includes(value)
    ? (value as ProductVersionStatus)
    : undefined;
}

function normalizeImportVersions(value: string) {
  return splitList(value).map((entry, index) => {
    const [name, slug, platform, rawStatus] = entry.split('::').map((part) => part?.trim());
    const status = normalizeVersionStatus(rawStatus);
    return {
      name,
      ...(slug ? { slug } : {}),
      ...(platform ? { platform } : {}),
      is_default: index === 0,
      ...(status ? { status } : {}),
    };
  });
}

function resolvedSlug(input: ProductInput) {
  return (input.slug?.trim() || slugify(input.title)).slice(0, 80);
}

type NormalizeImportRowContext = ImportProductOptions & {
  folderBySlug?: Map<string, PromptFolder>;
};

export function normalizeImportRow(row: Record<string, unknown>, options: NormalizeImportRowContext = {}): ProductInput {
  const kind = normalizeKind(cell(row, 'kind', 'loai', 'type'), options.defaultKind);
  if (!kind) throw new ProductCreateError('validation_error', 'Cột kind phải là tool, prompt hoặc webwork.', 422);

  const title = cell(row, 'title', 'ten', 'tieu_de', 'name');
  const status = normalizeStatus(cell(row, 'status', 'trang_thai'));
  const pricingMode = normalizePricingMode(cell(row, 'pricing_mode', 'kieu_gia'));
  const priceVnd = parseNumber(cell(row, 'price_vnd', 'price', 'gia'));
  const sortOrder = parseNumber(cell(row, 'sort_order', 'thu_tu'));
  const thumbnailUrl = normalizeGoogleDriveImageUrl(cell(row, 'thumbnail_url', 'thumbnail', 'cover', 'image', 'anh'));
  const gallery = splitImageList(cell(row, 'gallery', 'images', 'anh_phu', 'thu_vien_anh'));
  const promptImage = kind === 'prompt' && thumbnailUrl ? [thumbnailUrl] : gallery;

  // Resolve folder for prompt kind only. Accept aliases. If folder slug doesn't
  // exist in the registry, we throw — admin must create the folder first.
  let folderId: string | null = null;
  if (kind === 'prompt') {
    const rawFolder = cell(row, 'folder', 'thu_muc', 'chu_de').toLowerCase();
    let folderSlug = rawFolder;
    // Backward compat: if no `folder` column, derive from categories[0].
    if (!folderSlug) {
      const cats = splitList(cell(row, 'categories', 'category', 'danh_muc'));
      folderSlug = (cats[0] ?? '').toLowerCase();
    }
    if (folderSlug && options.folderBySlug) {
      const folder = options.folderBySlug.get(folderSlug);
      if (!folder) {
        throw new ProductCreateError(
          'validation_error',
          `Folder '${folderSlug}' chưa tồn tại. Hãy tạo folder ở /admin/prompt-folders trước, rồi import lại.`,
          422,
        );
      }
      folderId = folder.id;
    }
  }

  return {
    kind,
    title,
    slug: emptyToNull(cell(row, 'slug')) ?? undefined,
    tagline: emptyToNull(cell(row, 'tagline', 'mo_ta_ngan')),
    description: emptyToNull(cell(row, 'description', 'mo_ta')),
    notice: kind === 'tool' ? emptyToNull(cell(row, 'notice', 'luu_y')) : null,
    youtube_url: kind === 'prompt' ? null : emptyToNull(cell(row, 'youtube_url', 'youtube', 'video')),
    thumbnail_url: emptyToNull(thumbnailUrl),
    repo_url: kind === 'webwork' ? emptyToNull(cell(row, 'repo_url', 'demo_url', 'source_url', 'link')) : null,
    gallery: kind === 'prompt' ? promptImage : kind === 'webwork' ? [] : gallery,
    pricing_mode: kind === 'webwork' ? 'quote' : kind === 'prompt' ? 'fixed' : pricingMode,
    price_vnd: kind === 'prompt' || kind === 'webwork' ? null : priceVnd,
    is_free: kind === 'prompt' ? true : parseBoolean(cell(row, 'is_free', 'free', 'mien_phi')),
    categories: kind === 'webwork' || kind === 'prompt' ? [] : splitList(cell(row, 'categories', 'category', 'danh_muc')),
    folder_id: folderId,
    tags: kind === 'webwork' ? [] : splitList(cell(row, 'tags', 'the')),
    versions: kind === 'tool' ? normalizeImportVersions(cell(row, 'versions', 'phien_ban')) : [],
    deliverables: kind === 'tool' ? splitList(cell(row, 'deliverables', 'ban_giao', 'khach_nhan_duoc')) : [],
    support_options: kind === 'tool' ? normalizeSupportOptions(cell(row, 'support_options', 'ho_tro')) : [],
    duration_label: kind === 'tool' ? emptyToNull(cell(row, 'duration_label', 'thoi_luong')) : null,
    prerequisites: kind === 'tool' ? splitList(cell(row, 'prerequisites', 'yeu_cau')) : [],
    prompt_meta: kind === 'prompt'
      ? {
          preview_content: emptyToNull(cell(row, 'prompt_preview', 'preview_content', 'ban_xem_truoc')),
          full_content: emptyToNull(cell(row, 'prompt_full', 'full_content', 'prompt_day_du')),
          explanation: emptyToNull(cell(row, 'prompt_explanation', 'explanation', 'cach_dung')),
        }
      : undefined,
    status: status ?? (kind === 'prompt' ? 'published' : 'draft'),
    featured: kind === 'tool' ? parseBoolean(cell(row, 'featured', 'noi_bat')) : false,
    sort_order: kind === 'tool' ? sortOrder : 0,
  };
}

function emptySummary(): ProductImportSummary {
  return { total: 0, ready: 0, invalid: 0, conflicts: 0, created: 0, updated: 0, skipped: 0, failed: 0 };
}

export function summarizeImportResults(results: ProductImportResult[]): ProductImportResponse {
  const summary = emptySummary();
  summary.total = results.length;
  for (const result of results) {
    if (result.status === 'ready') summary.ready += 1;
    if (result.status === 'invalid') summary.invalid += 1;
    if (result.status === 'exists_skip' || result.status === 'exists_update') summary.conflicts += 1;
    if (result.status === 'created') summary.created += 1;
    if (result.status === 'updated') summary.updated += 1;
    if (result.status === 'skipped') summary.skipped += 1;
    if (result.status === 'failed') summary.failed += 1;
  }
  return { summary, results };
}

async function existingProductsBySlug(slugs: string[]) {
  const uniqueSlugs = Array.from(new Set(slugs.filter(Boolean)));
  if (uniqueSlugs.length === 0) return new Map<string, ExistingProduct>();

  const { data, error } = await createAdminClient()
    .from('products')
    .select('id, kind, slug, title')
    .in('slug', uniqueSlugs);

  if (error) {
    console.error('Failed to load existing products for import', { code: error.code, message: error.message });
    throw new ProductCreateError('db_error', 'Không kiểm tra được slug đã tồn tại.', 500);
  }

  return new Map((data ?? []).map((product) => [product.slug, product as ExistingProduct]));
}

async function loadFolderRegistry(): Promise<Map<string, PromptFolder>> {
  const { data, error } = await createAdminClient()
    .from('prompt_folders')
    .select('id, slug, name, description, icon, cover_image_url, sort_order, created_at, updated_at');
  if (error) {
    console.error('Failed to load prompt folders for import', { code: error.code, message: error.message });
    throw new ProductCreateError('db_error', 'Không tải được danh sách folder prompt.', 500);
  }
  return new Map((data ?? []).map((row) => [row.slug, row as PromptFolder]));
}

async function prepareRows(rows: Record<string, unknown>[], options: ImportProductOptions) {
  // Load folder registry once so every row can resolve folder slug → id.
  const folderBySlug = await loadFolderRegistry();
  const enrichedOptions: NormalizeImportRowContext = { ...options, folderBySlug };

  const prepared: PreparedRow[] = rows.map((row, index) => {
    const rowNumber = index + 2;
    try {
      const input = normalizeImportRow(row, enrichedOptions);
      const checked = productInputSchema.safeParse(input);
      if (!checked.success) {
        return {
          rowNumber,
          input,
          error: {
            code: 'validation_error',
            message: checked.error.issues[0]?.message ?? 'Dòng này không hợp lệ.',
          },
        };
      }
      return { rowNumber, input, checked: checked.data, slug: resolvedSlug(checked.data) };
    } catch (err) {
      if (err instanceof ProductCreateError) {
        return { rowNumber, error: productCreateErrorResponse(err).error };
      }
      return { rowNumber, error: { code: 'unknown_error', message: 'Không đọc được dòng này.' } };
    }
  });

  const existing = await existingProductsBySlug(prepared.flatMap((row) => row.slug ? [row.slug] : []));
  return prepared.map((row) => ({ ...row, existing: row.slug ? existing.get(row.slug) : undefined }));
}

export async function previewProductRows(
  rows: Record<string, unknown>[],
  options: ImportProductOptions = {},
): Promise<ProductImportResponse> {
  const conflictMode = options.conflictMode ?? 'skip';
  const prepared = await prepareRows(rows, options);
  const results = prepared.map<ProductImportResult>((row) => {
    if (row.error || !row.checked || !row.slug) {
      return { rowNumber: row.rowNumber, ok: false, status: 'invalid', error: row.error ?? { code: 'validation_error', message: 'Dòng này không hợp lệ.' } };
    }
    const preview = { kind: row.checked.kind, slug: row.slug, title: row.checked.title };
    if (row.existing) {
      return {
        rowNumber: row.rowNumber,
        ok: true,
        status: conflictMode === 'update' ? 'exists_update' : 'exists_skip',
        message: conflictMode === 'update' ? 'Slug đã tồn tại — sẽ cập nhật khi import.' : 'Slug đã tồn tại — sẽ bỏ qua khi import.',
        product: row.existing,
        preview,
      };
    }
    return { rowNumber: row.rowNumber, ok: true, status: 'ready', message: 'Sẵn sàng tạo mới.', preview };
  });
  return summarizeImportResults(results);
}

function assertUpdateAllowed(existing: ExistingProduct, input: ProductInput) {
  if (existing.kind !== input.kind) {
    throw new ProductCreateError('validation_error', 'Không thể update slug đang thuộc loại sản phẩm khác.', 422);
  }
  const selectedCategories = Array.from(new Set(input.categories ?? []));
  const allowedCategories = new Set<string>(categoriesFor(input.kind).map((category) => category.value));
  if (selectedCategories.some((category) => !allowedCategories.has(category))) {
    throw new ProductCreateError('validation_error', 'Danh mục không hợp lệ cho loại sản phẩm này.', 422);
  }
  const versions = normalizeProductVersions(input.versions ?? []);
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
}

async function updateProductFromImport(existing: ExistingProduct, input: ProductInput) {
  try {
    assertUpdateAllowed(existing, input);
  } catch (err) {
    if (err instanceof ProductCreateError) throw err;
    throw new ProductCreateError('validation_error', productVersionValidationMessage(err), 422);
  }

  const versions = normalizeProductVersions(input.versions ?? []);
  const update = {
    kind: input.kind,
    title: input.title.trim(),
    slug: resolvedSlug(input),
    tagline: emptyToNull(input.tagline),
    description: emptyToNull(input.description),
    notice: emptyToNull(input.notice),
    youtube_url: emptyToNull(input.youtube_url),
    thumbnail_url: emptyToNull(input.thumbnail_url),
    repo_url: input.kind === 'webwork' ? emptyToNull(input.repo_url) : null,
    gallery: input.kind === 'webwork' ? [] : (input.gallery ?? []),
    pricing_mode: input.pricing_mode ?? 'fixed',
    price_vnd: input.price_vnd ?? null,
    categories: Array.from(new Set(input.categories ?? [])),
    folder_id: input.kind === 'prompt' ? (input.folder_id ?? null) : null,
    tags: input.tags ?? [],
    versions,
    deliverables: input.deliverables ?? [],
    support_options: input.support_options ?? [],
    duration_label: emptyToNull(input.duration_label),
    prerequisites: input.prerequisites ?? [],
    prompt_meta: input.kind === 'prompt' ? normalizePromptMeta(input.prompt_meta, resolvedSlug(input)) : {},
    status: input.status ?? 'draft',
    featured: input.featured ?? false,
    is_free: input.is_free ?? false,
    sort_order: input.sort_order ?? 0,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await createAdminClient()
    .from('products')
    .update(update)
    .eq('id', existing.id)
    .select()
    .single();

  if (error) {
    console.error('Failed to update product from import', { code: error.code, message: error.message });
    throw new ProductCreateError(
      error.code ?? 'db_error',
      error.code === '23505' ? 'Slug này đã tồn tại. Hãy chọn slug khác.' : 'Không update được sản phẩm. Thử lại sau.',
      error.code === '23505' ? 409 : 500,
    );
  }
  return data as ExistingProduct;
}

export async function importProductRows(
  ownerId: string,
  rows: Record<string, unknown>[],
  options: ImportProductOptions = {},
): Promise<ProductImportResponse> {
  const conflictMode = options.conflictMode ?? 'skip';
  const prepared = await prepareRows(rows, options);
  const results: ProductImportResult[] = [];

  for (const row of prepared) {
    if (row.error || !row.checked || !row.slug) {
      results.push({ rowNumber: row.rowNumber, ok: false, status: 'invalid', error: row.error ?? { code: 'validation_error', message: 'Dòng này không hợp lệ.' } });
      continue;
    }
    const preview = { kind: row.checked.kind, slug: row.slug, title: row.checked.title };
    try {
      if (row.existing && conflictMode === 'skip') {
        results.push({ rowNumber: row.rowNumber, ok: true, status: 'skipped', message: 'Đã bỏ qua vì slug đã tồn tại.', product: row.existing, preview });
        continue;
      }
      if (row.existing && conflictMode === 'update') {
        const product = await updateProductFromImport(row.existing, row.checked);
        results.push({ rowNumber: row.rowNumber, ok: true, status: 'updated', message: 'Đã cập nhật sản phẩm có slug trùng.', product, preview });
        continue;
      }
      const product = await createAdminProduct(ownerId, row.checked);
      results.push({ rowNumber: row.rowNumber, ok: true, status: 'created', message: 'Đã tạo sản phẩm mới.', product, preview });
    } catch (err) {
      if (err instanceof ProductCreateError) {
        results.push({ rowNumber: row.rowNumber, ok: false, status: 'failed', preview, error: productCreateErrorResponse(err).error });
      } else {
        results.push({ rowNumber: row.rowNumber, ok: false, status: 'failed', preview, error: { code: 'unknown_error', message: 'Không import được dòng này.' } });
      }
    }
  }

  return summarizeImportResults(results);
}
