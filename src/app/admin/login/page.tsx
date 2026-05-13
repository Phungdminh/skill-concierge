'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowRight, Loader2, Lock, Mail, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

function AdminLoginForm() {
  const params = useSearchParams();
  const returnTo = params.get('returnTo') ?? '/admin';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function validateEmail() {
    if (/^\S+@\S+\.\S+$/.test(email.trim())) {
      setErrorMsg(null);
      return true;
    }
    setErrorMsg('Nhập email hợp lệ.');
    return false;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (state === 'sending') return;
    if (!validateEmail()) return;
    if (password.length < 6) {
      setErrorMsg('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }
    setState('sending');
    setErrorMsg(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;

      const safeReturnTo = returnTo.startsWith('/admin') && !returnTo.startsWith('//') ? returnTo : '/admin';
      const challengeResponse = await fetch('/api/admin/auth/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ returnTo: safeReturnTo }),
      });
      const challengePayload = await challengeResponse.json().catch(() => null) as {
        next?: string;
        error?: { message?: string };
      } | null;

      if (!challengeResponse.ok) {
        throw new Error(challengePayload?.error?.message || 'Không gửi được mã xác nhận.');
      }

      window.location.href = challengePayload?.next ?? `/admin/verify?returnTo=${encodeURIComponent(safeReturnTo)}`;
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      setErrorMsg(
        message.toLowerCase().includes('invalid login') || message.toLowerCase().includes('invalid credentials')
          ? 'Email hoặc mật khẩu không đúng.'
          : message || 'Không đăng nhập được. Vui lòng thử lại.',
      );
      setState('error');
    }
  }

  return (
    <LoginShell>
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
          <h1 className="text-balance text-2xl font-semibold tracking-tight md:text-3xl">
            Admin đăng nhập
          </h1>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="admin-email" className="text-[11px] uppercase tracking-widest text-muted-foreground">
                Email
              </label>
              <div className="mt-2 flex items-center gap-2 rounded-xl bg-white/[0.02] px-3 py-3 ring-1 ring-white/8 focus-within:ring-white/20">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <input
                  id="admin-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  onBlur={validateEmail}
                  placeholder="admin@example.com"
                  aria-invalid={Boolean(errorMsg)}
                  aria-describedby={errorMsg ? 'admin-login-error' : undefined}
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label htmlFor="admin-password" className="text-[11px] uppercase tracking-widest text-muted-foreground">
                Mật khẩu
              </label>
              <div className="mt-2 flex items-center gap-2 rounded-xl bg-white/[0.02] px-3 py-3 ring-1 ring-white/8 focus-within:ring-white/20">
                <Lock className="h-4 w-4 text-muted-foreground" />
                <input
                  id="admin-password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  placeholder="Nhập mật khẩu admin"
                  aria-invalid={Boolean(errorMsg)}
                  aria-describedby={errorMsg ? 'admin-login-error' : undefined}
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </div>
            </div>

            {errorMsg ? (
              <p id="admin-login-error" role="alert" className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-300 ring-1 ring-red-500/30">
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
                  <Loader2 className="h-4 w-4 animate-spin" /> Đang đăng nhập
                </>
              ) : (
                <>
                  Đăng nhập admin
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </LoginShell>
  );
}

function LoginShell({ children }: { children: React.ReactNode }) {
  return <main className="relative grid min-h-svh place-items-center px-4 py-16">{children}</main>;
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <LoginShell>
          <div className="glass-solid w-full max-w-md rounded-3xl p-7 text-sm text-foreground/65 md:p-8">
            Đang tải form đăng nhập...
          </div>
        </LoginShell>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
