'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Briefcase, Camera, Loader2, Save, User } from 'lucide-react';
import { GENDER_OPTIONS, type Gender, type Profile } from '@/lib/profile-types';
import { cn } from '@/lib/utils';

interface ProfileFormProps {
  profile: Pick<Profile, 'full_name' | 'avatar_url' | 'gender' | 'job_title'> | null;
  email: string;
  mode?: 'onboarding' | 'settings';
  redirectTo?: string;
  submitLabel?: string;
  hideAvatar?: boolean;
  skipHref?: string;
}

type SubmitState = 'idle' | 'saving' | 'error' | 'success';

export function ProfileForm({
  profile,
  email,
  mode = 'settings',
  redirectTo,
  submitLabel,
  hideAvatar = false,
  skipHref,
}: ProfileFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? '');
  const [gender, setGender] = useState<Gender | ''>(profile?.gender ?? '');
  const [jobTitle, setJobTitle] = useState(profile?.job_title ?? '');
  const [uploading, setUploading] = useState(false);
  const [state, setState] = useState<SubmitState>('idle');
  const [message, setMessage] = useState<string | null>(null);

  async function onPickAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setState('error');
      setMessage('Ảnh phải nhỏ hơn 5MB.');
      return;
    }
    setUploading(true);
    setMessage(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/profile/avatar', { method: 'POST', body: fd });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body?.error?.message ?? 'Không tải ảnh lên được.');
      }
      setAvatarUrl(body.url as string);
      setState('idle');
    } catch (err) {
      setState('error');
      setMessage(err instanceof Error ? err.message : 'Không tải ảnh lên được.');
    } finally {
      setUploading(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (state === 'saving' || uploading) return;

    const trimmedName = fullName.trim();
    if (trimmedName.length < 2) {
      setState('error');
      setMessage('Tên phải có ít nhất 2 ký tự.');
      return;
    }
    if (!hideAvatar && !avatarUrl) {
      setState('error');
      setMessage('Vui lòng chọn ảnh đại diện.');
      return;
    }

    setState('saving');
    setMessage(null);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          full_name: trimmedName,
          avatar_url: avatarUrl,
          gender: gender || null,
          job_title: jobTitle.trim() || null,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body?.error?.message ?? 'Không lưu được hồ sơ.');
      }
      setState('success');
      setMessage(mode === 'onboarding' ? 'Đã lưu, đang chuyển hướng…' : 'Đã lưu hồ sơ.');
      if (redirectTo) {
        router.push(redirectTo);
        router.refresh();
      } else {
        router.refresh();
      }
    } catch (err) {
      setState('error');
      setMessage(err instanceof Error ? err.message : 'Không lưu được hồ sơ.');
    }
  }

  const isSaving = state === 'saving';
  const canSubmit = !isSaving && !uploading;

  return (
    <form onSubmit={submit} className="space-y-6">
      {!hideAvatar && (
        <div className="flex items-center gap-5">
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full bg-muted ring-1 ring-[var(--ring-subtle)]">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt="Ảnh đại diện"
                fill
                sizes="96px"
                className="object-cover"
                unoptimized
              />
            ) : (
              <span className="grid h-full w-full place-items-center text-muted-foreground">
                <User className="h-9 w-9" strokeWidth={1.5} />
              </span>
            )}
            {uploading && (
              <span className="absolute inset-0 grid place-items-center bg-black/60">
                <Loader2 className="h-5 w-5 animate-spin text-white" />
              </span>
            )}
          </div>

          <div className="space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={onPickAvatar}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition hover:border-brand-orange/40 hover:bg-brand-orange/10 disabled:cursor-wait disabled:opacity-70"
            >
              <Camera className="h-4 w-4" />
              {avatarUrl ? 'Đổi ảnh' : 'Chọn ảnh'}
            </button>
            <p className="text-xs text-muted-foreground">JPG, PNG hoặc WebP, tối đa 5MB.</p>
          </div>
        </div>
      )}

      <div>
        <label htmlFor="pf-name" className="text-[11px] uppercase tracking-widest text-muted-foreground">
          Họ và tên
        </label>
        <div className="mt-2 flex items-center gap-2 rounded-xl bg-card px-3 py-3 ring-1 ring-[var(--ring-subtle)] focus-within:ring-brand-orange/35">
          <User className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
          <input
            id="pf-name"
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Nguyễn Văn A"
            autoComplete="name"
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>
      </div>

      <div>
        <span className="text-[11px] uppercase tracking-widest text-muted-foreground">Email</span>
        <p className="mt-2 rounded-xl border border-border bg-card px-3 py-3 text-sm text-foreground/65">
          {email}
        </p>
      </div>

      <div>
        <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
          Giới tính (tuỳ chọn)
        </span>
        <div className="mt-2 flex flex-wrap gap-2">
          {GENDER_OPTIONS.map((opt) => {
            const active = gender === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setGender(active ? '' : opt.value)}
                className={cn(
                  'rounded-full border px-4 py-1.5 text-sm transition',
                  active
                    ? 'border-brand-orange/40 bg-brand-orange/15 text-brand-orange'
                    : 'border-border bg-card text-foreground/70 hover:border-brand-orange/30',
                )}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label htmlFor="pf-job" className="text-[11px] uppercase tracking-widest text-muted-foreground">
          Công việc (tuỳ chọn)
        </label>
        <div className="mt-2 flex items-center gap-2 rounded-xl bg-card px-3 py-3 ring-1 ring-[var(--ring-subtle)] focus-within:ring-brand-orange/35">
          <Briefcase className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
          <input
            id="pf-job"
            type="text"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="VD: Nhân viên kinh doanh"
            autoComplete="organization-title"
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>
      </div>

      {message && (
        <p
          role={state === 'error' ? 'alert' : 'status'}
          className={cn(
            'rounded-lg px-3 py-2 text-xs ring-1',
            state === 'success'
              ? 'bg-emerald-500/10 text-emerald-300 ring-emerald-500/30'
              : state === 'error'
                ? 'bg-red-500/10 text-red-300 ring-red-500/30'
                : 'bg-card text-foreground/70 ring-[var(--ring-subtle)]',
          )}
        >
          {message}
        </p>
      )}

      <div className="space-y-3">
        <button
          type="submit"
          disabled={!canSubmit}
          className={cn(
            'bg-brand-gradient glow-red group inline-flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold text-black transition hover:brightness-110',
            !canSubmit && 'cursor-wait opacity-70',
          )}
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Đang lưu…
            </>
          ) : (
            <>
              {submitLabel ?? (mode === 'onboarding' ? 'Hoàn tất hồ sơ' : 'Lưu thay đổi')}
              <Save className="h-4 w-4" />
            </>
          )}
        </button>
        {skipHref && (
          <button
            type="button"
            onClick={() => router.push(skipHref)}
            disabled={isSaving}
            className="block w-full text-center text-xs text-muted-foreground transition hover:text-foreground/80 disabled:cursor-wait disabled:opacity-70"
          >
            Bỏ qua bước này
          </button>
        )}
      </div>
    </form>
  );
}
