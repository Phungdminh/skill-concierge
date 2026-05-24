import { z } from 'zod';
import { slugify } from './product-types';

export type PromptFolder = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  cover_image_url: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type PromptFolderWithCount = PromptFolder & { prompt_count: number };

export type PromptFolderInput = z.infer<typeof promptFolderInputSchema>;

export const promptFolderInputSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2, 'Slug phải có ít nhất 2 ký tự.')
    .max(80, 'Slug tối đa 80 ký tự.')
    .regex(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/, 'Slug chỉ dùng chữ thường, số và dấu gạch ngang.'),
  name: z.string().trim().min(1, 'Tên folder không được để trống.').max(120),
  description: z.string().trim().max(500).nullable().optional(),
  icon: z.string().trim().max(60).nullable().optional(),
  cover_image_url: z.string().trim().max(2000).url().nullable().optional().or(z.literal('')),
  sort_order: z.number().int().min(0).max(99_999).optional(),
});

export const promptFolderPatchSchema = promptFolderInputSchema.partial();
export type PromptFolderPatch = z.infer<typeof promptFolderPatchSchema>;

export function slugifyFolderName(value: string): string {
  return slugify(value);
}
