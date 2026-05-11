import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';

const patchSchema = z.object({
  title: z.string().trim().min(2).max(160).optional(),
  slug: z.string().trim().min(1).max(80).optional(),
  tagline: z.string().max(300).nullable().optional(),
  description: z.string().max(20000).nullable().optional(),
  youtube_url: z.string().url().nullable().optional().or(z.literal('')),
  thumbnail_url: z.string().url().nullable().optional().or(z.literal('')),
  gallery: z.array(z.string().url()).max(20).optional(),
  pricing_mode: z.enum(['fixed', 'from', 'quote']).optional(),
  price_vnd: z.number().int().min(0).nullable().optional(),
  category: z.string().max(40).nullable().optional(),
  tags: z.array(z.string().max(40)).max(20).optional(),
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
});

function emptyToNull<T extends string | null | undefined>(v: T): string | null {
  if (v == null) return null;
  const t = v.trim();
  return t.length === 0 ? null : t;
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

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  const d = parsed.data;
  if (d.title !== undefined) update.title = d.title.trim();
  if (d.slug !== undefined) update.slug = d.slug.trim();
  if (d.tagline !== undefined) update.tagline = emptyToNull(d.tagline);
  if (d.description !== undefined) update.description = emptyToNull(d.description);
  if (d.youtube_url !== undefined) update.youtube_url = emptyToNull(d.youtube_url);
  if (d.thumbnail_url !== undefined) update.thumbnail_url = emptyToNull(d.thumbnail_url);
  if (d.gallery !== undefined) update.gallery = d.gallery;
  if (d.pricing_mode !== undefined) update.pricing_mode = d.pricing_mode;
  if (d.price_vnd !== undefined) update.price_vnd = d.price_vnd;
  if (d.category !== undefined) update.category = emptyToNull(d.category);
  if (d.tags !== undefined) update.tags = d.tags;
  if (d.deliverables !== undefined) update.deliverables = d.deliverables;
  if (d.support_options !== undefined) update.support_options = d.support_options;
  if (d.duration_label !== undefined) update.duration_label = emptyToNull(d.duration_label);
  if (d.prerequisites !== undefined) update.prerequisites = d.prerequisites;
  if (d.status !== undefined) update.status = d.status;
  if (d.featured !== undefined) update.featured = d.featured;
  if (d.sort_order !== undefined) update.sort_order = d.sort_order;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .update(update)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    const status = error.code === '23505' ? 409 : error.code === 'PGRST116' ? 404 : 500;
    return NextResponse.json(
      { error: { code: error.code ?? 'db_error', message: error.message } },
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
  const supabase = await createClient();
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) {
    return NextResponse.json(
      { error: { code: error.code ?? 'db_error', message: error.message } },
      { status: 500 },
    );
  }
  return NextResponse.json({ ok: true });
}
