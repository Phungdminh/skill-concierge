'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowRight, Loader2, ShieldCheck, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

function safeAdminPath(value: string | null) {
  if (!value) return '/admin';
  if (!value.startsWith('/admin') || value.startsWith('//')) return '/admin';
  if (value.startsWith('/admin/login') || value.startsWith('/admin/verify')) return '/admin';
  return value;
}

function AdminVerifyForm() {
  const params = useSearchParams();
  const returnTo = safeAdminPath(params.get('returnTo'));
  const [code, setCode] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resendState, setResendState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [resendMsg, setResendMsg] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (state === 'sending') return;
    if (!/^\d{6}$/.test(code.trim())) {
      setState('error');
      setErrorMsg('Nhập mã xác nhận gồm 6 chữ số.');
      return;
    }

    setState('sending');
    setErrorMsg(null);
    try {
      const response = await fetch('/api/admin/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      });
      const payload = await response.json().catch(() => null) as {
        error?: { message?: string };
      } | null;
      if (!response.ok) {
        throw new Error(payload?.error?.message || 'Không xác nhận được mã.');
      }
      window.location.href = returnTo;
    } catch (err) {
      setState('error');
      setErrorMsg(err instanceof Error ? err.message : 'Không xác nhận được mã.');
    }
  }

  async function resendCode() {
    if (resendState === 'sending') return;

    setResendState('sending');
    setResendMsg(null);
    setErrorMsg(null);
    try {
      const response = await fetch('/api/admin/auth/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ returnTo }),
      });
      const payload = await response.json().catch(() => null) as {
        error?: { message?: string };
      } | null;
      if (!response.ok) {
        throw new Error(payload?.error?.message || 'Không gửi lại được mã xác nhận.');
      }
      setCode('');
      setState('idle');
      setResendState('sent');
      setResendMsg('Đã gửi lại mã xác nhận. Kiểm tra email admin nhé.');
    } catch (err) {
      setResendState('error');
      setResendMsg(err instanceof Error ? err.message : 'Không gửi lại được mã xác nhận.');
    }
  }

  return (
    <VerifyShell>
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-40 left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full opacity-30 blur-3xl"
          style={{ background: 'radial-gradient(closest-side, #ea384c 0%, #f97316 40%, transparent 80%)' }}
        />
      </div>

      <div className="relative w-full max-w-md">
        <Link href="/" className="mx-auto mb-8 flex w-fit items-center gap-2 font-semibold tracking-tight">
          <span className="bg-brand-gradient grid h-7 w-7 place-items-center rounded-md text-black">
            <Sparkles className="h-4 w-4" strokeWidth={2.5} />
          </span>
          <span>SkillForge VN</span>
        </Link>

        <div className="glass-solid rounded-3xl p-7 md:p-8">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-orange/10 text-brand-orange ring-1 ring-brand-orange/25">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <h1 className="mt-5 text-balance text-2xl font-semibold tracking-tight md:text-3xl">
            Xác nhận đăng nhập
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-foreground/65">
            Nhập mã 6 chữ số vừa được gửi đến email admin của bạn.
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="admin-code" className="text-[11px] uppercase tracking-widest text-muted-foreground">
                Mã xác nhận
              </label>
              <input
                id="admin-code"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                maxLength={6}
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder="123456"
                aria-invalid={Boolean(errorMsg)}
                aria-describedby={errorMsg ? 'admin-code-error' : undefined}
                className="mt-2 w-full rounded-xl bg-white/[0.02] px-4 py-3 text-center text-2xl font-semibold tracking-[0.35em] text-foreground ring-1 ring-white/8 placeholder:text-muted-foreground focus:outline-none focus:ring-white/20"
              />
            </div>

            {errorMsg ? (
              <p id="admin-code-error" role="alert" className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-300 ring-1 ring-red-500/30">
                {errorMsg}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={state === 'sending'}
              className={cn(
                'bg-brand-gradient glow-red group inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-medium text-black transition',
                state === 'sending' && 'cursor-wait opacity-70',
              )}
            >
              {state === 'sending' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Đang xác nhận
                </>
              ) : (
                <>
                  Vào dashboard
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-4 rounded-2xl bg-white/[0.02] p-4 ring-1 ring-white/8">
            <p className="text-xs leading-relaxed text-foreground/60">
              Chưa thấy email hoặc mã đã hết hạn? Gửi lại mã mới vào email admin.
            </p>
            {resendMsg ? (
              <p
                role="status"
                className={cn(
                  'mt-3 rounded-lg px-3 py-2 text-xs ring-1',
                  resendState === 'error'
                    ? 'bg-red-500/10 text-red-300 ring-red-500/30'
                    : 'bg-emerald-500/10 text-emerald-200 ring-emerald-500/25',
                )}
              >
                {resendMsg}
              </p>
            ) : null}
            <button
              type="button"
              onClick={resendCode}
              disabled={resendState === 'sending'}
              className={cn(
                'mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-5 py-3 text-sm text-foreground/75 transition hover:bg-white/[0.04] hover:text-foreground',
                resendState === 'sending' && 'cursor-wait opacity-70',
              )}
            >
              {resendState === 'sending' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Đang gửi lại mã
                </>
              ) : (
                'Gửi lại mã xác nhận'
              )}
            </button>
          </div>

          <form action="/auth/signout" method="post" className="mt-4">
            <button type="submit" className="w-full rounded-xl border border-white/10 px-5 py-3 text-sm text-foreground/70 transition hover:bg-white/[0.04] hover:text-foreground">
              Đăng xuất
            </button>
          </form>
        </div>
      </div>
    </VerifyShell>
  );
}

function VerifyShell({ children }: { children: React.ReactNode }) {
  return <main className="relative grid min-h-svh place-items-center px-4 py-16">{children}</main>;
}

export default function AdminVerifyPage() {
  return (
    <Suspense
      fallback={
        <VerifyShell>
          <div className="glass-solid w-full max-w-md rounded-3xl p-7 text-sm text-foreground/65 md:p-8">
            Đang tải form xác nhận...
          </div>
        </VerifyShell>
      }
    >
      <AdminVerifyForm />
    </Suspense>
  );
}
