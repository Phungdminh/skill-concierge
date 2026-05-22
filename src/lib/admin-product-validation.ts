import { z } from 'zod';
import { emptyToNull } from '@/lib/string-normalization';

export const productVersionSchema = z.object({
  name: z.string().trim().min(1).max(80),
  slug: z.string().trim().min(1).max(80).optional().or(z.literal('')),
  description: z.string().trim().max(500).nullable().optional().or(z.literal('')),
  executable_label: z.string().trim().max(160).nullable().optional().or(z.literal('')),
  platform: z.string().trim().max(120).nullable().optional().or(z.literal('')),
  is_default: z.boolean().optional(),
  status: z.enum(['available', 'beta', 'deprecated', 'hidden']).optional(),
});

export const promptMetaSchema = z.object({
  preview_content: z.string().max(5000).nullable().optional(),
  full_content: z.string().max(50000).nullable().optional(),
  explanation: z.string().max(20000).nullable().optional(),
  related_slugs: z.array(z.string().trim().min(1).max(80)).max(12).optional(),
});

export type ProductVersionInput = z.infer<typeof productVersionSchema>;
export type PromptMetaInput = z.infer<typeof promptMetaSchema>;

export function normalizePromptMeta(meta: PromptMetaInput | undefined, currentSlug?: string) {
  const related_slugs = Array.from(new Set((meta?.related_slugs ?? []).map((slug) => slug.trim()).filter(Boolean)))
    .filter((slug) => slug !== currentSlug);

  return {
    preview_content: emptyToNull(meta?.preview_content),
    full_content: emptyToNull(meta?.full_content),
    explanation: emptyToNull(meta?.explanation),
    related_slugs,
  };
}

export function hasPromptMeta(meta: PromptMetaInput | undefined) {
  if (!meta) return false;
  return Boolean(
    emptyToNull(meta.preview_content) ||
    emptyToNull(meta.full_content) ||
    emptyToNull(meta.explanation) ||
    (meta.related_slugs ?? []).some((slug) => slug.trim()),
  );
}

export function normalizeVersions(versions: ProductVersionInput[]) {
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

export function productVersionValidationMessage(error: unknown) {
  return error instanceof Error && error.message === 'multiple_default_versions'
    ? 'Chỉ được chọn một phiên bản mặc định.'
    : 'Slug phiên bản không được trùng nhau.';
}
