'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Save, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { slugifyFolderName, type PromptFolder } from '@/lib/prompt-folder-types';

const inputCls =
  'w-full rounded-xl bg-white/[0.02] px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground ring-1 ring-white/8 transition focus:outline-none focus:ring-white/25';

interface PromptFolderFormProps {
  initial?: PromptFolder | null;
  mode: 'create' | 'edit';
}

export function PromptFolderForm({ initial, mode }: PromptFolderFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? '');
  const [slug, setSlug] = useState(initial?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));
  const [description, setDescription] = useState(initial?.description ?? '');
  const [icon, setIcon] = useState(initial?.icon ?? '');
  const [coverImageUrl, setCoverImageUrl] = useState(initial?.cover_image_url ?? '');
  const [sortOrder, setSortOrder] = useState<string>(String(initial?.sort_order ?? 0));
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onNameChange(value: string) {
    setName(value);
    if (!slugTouched) setSlug(slugifyFolderName(value));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setError(null);
    try {
      const url = mode === 'create' ? '/api/admin/prompt-folders' : `/api/admin/prompt-folders/${initial?.id}`;
      const method = mode === 'create' ? 'POST' : 'PATCH';
      const body = {
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
        description: description.trim() || null,
        icon: icon.trim() || null,
        cover_image_url: coverImageUrl.trim() || null,
        sort_order: Number.parseInt(sortOrder, 10) || 0,
      };
      const res = await fetch(url, {
        method,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error?.message ?? 'Không lưu được folder.');
      router.push('/admin/prompt-folders');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra.');
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!initial?.id || deleting) return;
    const confirmed = window.confirm(
      `Xóa folder "${initial.name}"? Prompts trong folder sẽ chuyển sang "Chưa phân loại", không bị xóa.`,
    );
    if (!confirmed) return;
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/prompt-folders/${initial.id}`, { method: 'DELETE' });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error?.message ?? 'Không xóa được folder.');
      router.push('/admin/prompt-folders');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra.');
      setDeleting(false);
    }
  }

  return (
    <section className="pt-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Link
            href="/admin/prompt-folders"
            className="inline-flex items-center gap-1.5 text-sm text-foreground/60 transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Tất cả folder
          </Link>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            {mode === 'create' ? 'Tạo folder mới' : `Sửa folder: ${initial?.name}`}
          </h1>
        </div>
      </div>

      <form onSubmit={submit} className="mt-8 grid max-w-2xl gap-5">
        <div>
          <label htmlFor="folder-name" className="text-[11px] uppercase tracking-widest text-muted-foreground">
            Tên folder *
          </label>
          <input
            id="folder-name"
            type="text"
            required
            maxLength={120}
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="VD: Content creator"
            className={cn(inputCls, 'mt-2')}
          />
        </div>

        <div>
          <label htmlFor="folder-slug" className="text-[11px] uppercase tracking-widest text-muted-foreground">
            Slug (URL) *
          </label>
          <input
            id="folder-slug"
            type="text"
            required
            maxLength={80}
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value.toLowerCase());
              setSlugTouched(true);
            }}
            placeholder="content-creator"
            className={cn(inputCls, 'mt-2')}
          />
          <p className="mt-1 text-xs text-foreground/50">
            Dùng cho URL <code>/prompts/folder/{slug || 'slug-cua-ban'}</code>. Chỉ chữ thường, số, gạch ngang.
          </p>
        </div>

        <div>
          <label htmlFor="folder-desc" className="text-[11px] uppercase tracking-widest text-muted-foreground">
            Mô tả (tuỳ chọn)
          </label>
          <textarea
            id="folder-desc"
            rows={3}
            maxLength={500}
            value={description ?? ''}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Mô tả ngắn về folder này — hiển thị trên trang public."
            className={cn(inputCls, 'mt-2')}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="folder-icon" className="text-[11px] uppercase tracking-widest text-muted-foreground">
              Icon (tuỳ chọn)
            </label>
            <input
              id="folder-icon"
              type="text"
              maxLength={60}
              value={icon ?? ''}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="Sparkles, Code, Users…"
              className={cn(inputCls, 'mt-2')}
            />
            <p className="mt-1 text-xs text-foreground/50">
              Tên lucide-react icon. Để trống dùng default.
            </p>
          </div>
          <div>
            <label htmlFor="folder-sort" className="text-[11px] uppercase tracking-widest text-muted-foreground">
              Thứ tự
            </label>
            <input
              id="folder-sort"
              type="number"
              min={0}
              max={99999}
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className={cn(inputCls, 'mt-2')}
            />
            <p className="mt-1 text-xs text-foreground/50">Số nhỏ hiện trước.</p>
          </div>
        </div>

        <div>
          <label htmlFor="folder-cover" className="text-[11px] uppercase tracking-widest text-muted-foreground">
            Ảnh cover (tuỳ chọn)
          </label>
          <input
            id="folder-cover"
            type="url"
            maxLength={2000}
            value={coverImageUrl ?? ''}
            onChange={(e) => setCoverImageUrl(e.target.value)}
            placeholder="https://…"
            className={cn(inputCls, 'mt-2')}
          />
        </div>

        {error && (
          <p
            role="alert"
            aria-live="assertive"
            className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-300 ring-1 ring-red-500/30"
          >
            {error}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={saving || deleting}
            className={cn(
              'bg-brand-gradient inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-semibold text-black transition hover:brightness-110',
              (saving || deleting) && 'cursor-wait opacity-70',
            )}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {mode === 'create' ? 'Tạo folder' : 'Lưu thay đổi'}
          </button>

          {mode === 'edit' && initial?.id && (
            <button
              type="button"
              onClick={onDelete}
              disabled={saving || deleting}
              className="inline-flex items-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-300 transition hover:bg-red-500/15 disabled:cursor-wait disabled:opacity-60"
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Xóa folder
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
