'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Briefcase, Loader2, Save, Sparkles, User } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { GENDER_OPTIONS, type Gender, profileNeedsOnboarding } from '@/lib/profile-types';
import { cn } from '@/lib/utils';

const DISMISS_KEY = 'skillforge-onboarding-dismissed';

const FOCUSABLE_SELECTOR =
  'a[href], area[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function OnboardingModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState<Gender | ''>('');
  const [jobTitle, setJobTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  const checkProfile = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setOpen(false);
      return;
    }
    try {
      if (sessionStorage.getItem(DISMISS_KEY) === user.id) {
        setOpen(false);
        return;
      }
    } catch {
      // sessionStorage might be unavailable; ignore
    }
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, gender, job_title')
      .eq('id', user.id)
      .maybeSingle();

    if (profileNeedsOnboarding(profile ?? null)) {
      setFullName(profile?.full_name ?? '');
      setGender((profile?.gender as Gender) ?? '');
      setJobTitle(profile?.job_title ?? '');
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (cancelled) return;
      if (event === 'SIGNED_OUT') {
        try {
          sessionStorage.removeItem(DISMISS_KEY);
        } catch {
          // ignore
        }
        setOpen(false);
      } else {
        void checkProfile().catch(() => {});
      }
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [checkProfile]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Focus management: capture opener, focus first field, restore on close.
  useEffect(() => {
    if (!open) return;
    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
    const node = dialogRef.current;
    if (node) {
      const focusables = node.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      const first = focusables[0];
      // Run after paint so React has flushed.
      requestAnimationFrame(() => first?.focus());
    }
    return () => {
      const previous = previouslyFocusedRef.current;
      if (previous && typeof previous.focus === 'function') {
        previous.focus();
      }
    };
  }, [open]);

  // Escape closes; Tab is trapped within the dialog.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        void skip();
        return;
      }
      if (e.key !== 'Tab') return;
      const node = dialogRef.current;
      if (!node) return;
      const focusables = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
        (el) => !el.hasAttribute('disabled') && el.offsetParent !== null,
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    const name = fullName.trim();
    if (name.length < 2) {
      setError('Tên phải có ít nhất 2 ký tự.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          full_name: name,
          gender: gender || null,
          job_title: jobTitle.trim() || null,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error?.message ?? 'Không lưu được hồ sơ.');
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không lưu được hồ sơ.');
    } finally {
      setSaving(false);
    }
  }

  async function skip() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      try {
        sessionStorage.setItem(DISMISS_KEY, user.id);
      } catch {
        // ignore
      }
    }
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      ref={dialogRef}
      className="fixed inset-0 z-[100] grid place-items-center px-4 py-8"
    >
      <div
        aria-hidden="true"
        onClick={() => void skip()}
        className="absolute inset-0 cursor-default bg-[var(--overlay)] backdrop-blur-sm"
      />
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-border bg-card shadow-2xl">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 left-1/2 h-[280px] w-[420px] -translate-x-1/2 rounded-full opacity-30 blur-3xl"
          style={{
            background:
              'radial-gradient(closest-side, #ea384c 0%, #f97316 40%, transparent 80%)',
          }}
        />
        <div className="relative p-6 md:p-7">
          <div className="mb-5 flex items-center gap-2">
            <span className="bg-brand-gradient grid h-7 w-7 place-items-center rounded-md text-black">
              <Sparkles className="h-4 w-4" strokeWidth={2.5} />
            </span>
            <span className="text-[11px] uppercase tracking-widest text-brand-orange">
              Chào mừng
            </span>
          </div>
          <h2 id="onboarding-title" className="text-balance text-2xl font-semibold tracking-tight">
            Hoàn tất hồ sơ
          </h2>
          <p className="mt-2 text-sm text-foreground/65">
            Chỉ tên là bắt buộc. Các phần khác bạn có thể để trống hoặc cập nhật sau ở trang Hồ sơ.
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="ob-name" className="text-[11px] uppercase tracking-widest text-muted-foreground">
                Họ và tên
              </label>
              <div className="mt-2 flex items-center gap-2 rounded-xl bg-card px-3 py-3 ring-1 ring-[var(--ring-subtle)] focus-within:ring-brand-orange/35">
                <User className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
                <input
                  id="ob-name"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Nguyễn Văn A"
                  autoComplete="name"
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </div>
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
              <label htmlFor="ob-job" className="text-[11px] uppercase tracking-widest text-muted-foreground">
                Công việc (tuỳ chọn)
              </label>
              <div className="mt-2 flex items-center gap-2 rounded-xl bg-card px-3 py-3 ring-1 ring-[var(--ring-subtle)] focus-within:ring-brand-orange/35">
                <Briefcase className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
                <input
                  id="ob-job"
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="VD: Nhân viên kinh doanh"
                  autoComplete="organization-title"
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </div>
            </div>

            {error && (
              <p role="alert" aria-live="assertive" className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-300 ring-1 ring-red-500/30">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className={cn(
                'bg-brand-gradient glow-red group inline-flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold text-black transition hover:brightness-110',
                saving && 'cursor-wait opacity-70',
              )}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Đang lưu…
                </>
              ) : (
                <>
                  Hoàn tất
                  <Save className="h-4 w-4" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => void skip()}
              disabled={saving}
              className="block w-full text-center text-xs text-muted-foreground transition hover:text-foreground/80 disabled:cursor-wait disabled:opacity-70"
            >
              Bỏ qua bước này
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
