import 'server-only';

import { createAdminClient } from '@/lib/supabase/admin';
import { emptyToNull } from '@/lib/string-normalization';
import {
  type PromptFolder,
  type PromptFolderInput,
  type PromptFolderPatch,
  type PromptFolderWithCount,
} from '@/lib/prompt-folder-types';

export class PromptFolderError extends Error {
  constructor(public code: string, message: string, public status = 400) {
    super(message);
  }
}

function normalizeInput(input: PromptFolderInput) {
  return {
    slug: input.slug.trim().toLowerCase(),
    name: input.name.trim(),
    description: emptyToNull(input.description ?? null),
    icon: emptyToNull(input.icon ?? null),
    cover_image_url: emptyToNull(input.cover_image_url ?? null),
    sort_order: input.sort_order ?? 0,
  };
}

export async function listPromptFolders(): Promise<PromptFolderWithCount[]> {
  const admin = createAdminClient();
  const { data: folders, error: foldersError } = await admin
    .from('prompt_folders')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });

  if (foldersError) {
    throw new PromptFolderError('db_error', 'Không tải được danh sách folder.', 500);
  }

  // Count prompts per folder. We do a single grouped select via a view-like
  // approach: fetch folder_id from products where kind='prompt' AND status='published'
  // and aggregate client-side. For small folder counts this is fine.
  const { data: counts, error: countError } = await admin
    .from('products')
    .select('folder_id')
    .eq('kind', 'prompt');

  if (countError) {
    throw new PromptFolderError('db_error', 'Không đếm được prompts theo folder.', 500);
  }

  const tally = new Map<string, number>();
  for (const row of counts ?? []) {
    if (row.folder_id) tally.set(row.folder_id, (tally.get(row.folder_id) ?? 0) + 1);
  }

  return (folders ?? []).map((folder) => ({
    ...(folder as PromptFolder),
    prompt_count: tally.get(folder.id) ?? 0,
  }));
}

export async function getPromptFolderById(id: string): Promise<PromptFolder | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('prompt_folders')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw new PromptFolderError('db_error', 'Không tải được folder.', 500);
  return (data as PromptFolder | null) ?? null;
}

export async function createPromptFolder(input: PromptFolderInput): Promise<PromptFolder> {
  const normalized = normalizeInput(input);
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('prompt_folders')
    .insert(normalized)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new PromptFolderError('duplicate_slug', 'Slug này đã tồn tại. Hãy chọn slug khác.', 409);
    }
    console.error('Failed to create prompt folder', { code: error.code, message: error.message });
    throw new PromptFolderError(error.code ?? 'db_error', 'Không tạo được folder.', 500);
  }

  return data as PromptFolder;
}

export async function updatePromptFolder(
  id: string,
  patch: PromptFolderPatch,
): Promise<PromptFolder> {
  const admin = createAdminClient();
  const update: Record<string, unknown> = {};
  if (patch.slug !== undefined) update.slug = patch.slug.trim().toLowerCase();
  if (patch.name !== undefined) update.name = patch.name.trim();
  if (patch.description !== undefined) update.description = emptyToNull(patch.description);
  if (patch.icon !== undefined) update.icon = emptyToNull(patch.icon);
  if (patch.cover_image_url !== undefined) update.cover_image_url = emptyToNull(patch.cover_image_url);
  if (patch.sort_order !== undefined) update.sort_order = patch.sort_order;

  if (Object.keys(update).length === 0) {
    const current = await getPromptFolderById(id);
    if (!current) throw new PromptFolderError('not_found', 'Không tìm thấy folder.', 404);
    return current;
  }

  const { data, error } = await admin
    .from('prompt_folders')
    .update(update)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new PromptFolderError('duplicate_slug', 'Slug này đã tồn tại. Hãy chọn slug khác.', 409);
    }
    if (error.code === 'PGRST116') {
      throw new PromptFolderError('not_found', 'Không tìm thấy folder.', 404);
    }
    console.error('Failed to update prompt folder', { code: error.code, message: error.message });
    throw new PromptFolderError(error.code ?? 'db_error', 'Không cập nhật được folder.', 500);
  }

  return data as PromptFolder;
}

export async function deletePromptFolder(id: string): Promise<void> {
  const admin = createAdminClient();
  // ON DELETE SET NULL on products.folder_id handles the orphaning automatically.
  const { error } = await admin.from('prompt_folders').delete().eq('id', id);
  if (error) {
    console.error('Failed to delete prompt folder', { code: error.code, message: error.message });
    throw new PromptFolderError(error.code ?? 'db_error', 'Không xóa được folder.', 500);
  }
}
