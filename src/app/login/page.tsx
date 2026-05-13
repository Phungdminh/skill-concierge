'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowRight, Loader2, Lock, Mail, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

type AuthMode = 'login' | 'signup' | 'forgot';
type SubmitState = 'idle' | 'sending' | 'error' | 'success';

function LoginForm() {
  const params = useSearchParams();
  const returnTo = params.get('returnTo') ?? '/contact';
  const safeReturnTo = returnTo.startsWith('/') ? returnTo : '/contact';
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [state, setState] = useState<SubmitState>('idle');
  const [message, setMessage] = useState<string | null>(null);

  const isSending = state === 'sending';

  function resetMessage() {
    if (message) setMessage(null);
    if (state === 'error' || state === 'success') setState('idle');
  }

  function requireTerms() {
    if (acceptedTerms) return true;
    setState('error');
    setMessage('Bạn cần xác nhận đã đọc điều khoản và chính sách bảo mật trước khi tiếp tục.');
    return false;
  }

  function validateEmail() {
    if (/^\S+@\S+\.\S+$/.test(email.trim())) return true;
    setState('error');
    setMessage('Nhập email hợp lệ.');
    return false;
  }

  function validatePassword() {
    if (password.length >= 6) return true;
    setState('error');
    setMessage('Mật khẩu phải có ít nhất 6 ký tự.');
    return false;
  }

  async function signInWithGoogle() {
    if (isSending) return;
    if (!requireTerms()) return;
    setState('sending');
    setMessage(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(safeReturnTo)}`,
          queryParams: { prompt: 'select_account' },
        },
      });
      if (error) throw error;
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Không đăng nhập được bằng Google.');
      setState('error');
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (isSending) return;
    if (!requireTerms()) return;
    if (!validateEmail()) return;
    if (mode !== 'forgot' && !validatePassword()) return;

    setState('sending');
    setMessage(null);
    try {
      const supabase = createClient();

      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(safeReturnTo)}`,
          },
        });
        if (error) throw error;
        setState('success');
        setMessage('Đã tạo tài khoản. Nếu Supabase yêu cầu xác nhận email, hãy kiểm tra hộp thư của bạn.');
        return;
      }

      if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent('/login')}`,
        });
        if (error) throw error;
        setState('success');
        setMessage('Đã gửi email đặt lại mật khẩu. Hãy kiểm tra hộp thư của bạn.');
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;
      window.location.href = safeReturnTo;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '';
      setMessage(
        errorMessage.toLowerCase().includes('invalid login') || errorMessage.toLowerCase().includes('invalid credentials')
          ? 'Email hoặc mật khẩu không đúng.'
          : errorMessage || 'Không thể xử lý yêu cầu. Vui lòng thử lại.',
      );
      setState('error');
    }
  }

  function switchMode(nextMode: AuthMode) {
    setMode(nextMode);
    setPassword('');
    setState('idle');
    setMessage(null);
  }

  const title = mode === 'signup' ? 'Tạo tài khoản' : mode === 'forgot' ? 'Quên mật khẩu' : 'Đăng nhập';
  const intro = mode === 'signup'
    ? 'Tạo tài khoản để gửi yêu cầu riêng và liên hệ nhanh hơn.'
    : mode === 'forgot'
      ? 'Nhập email để nhận liên kết đặt lại mật khẩu.'
      : 'Đăng nhập để gửi yêu cầu riêng nhanh hơn.';

  return (
    <LoginShell>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div
          className="absolute -top-40 left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full opacity-30 blur-3xl"
          style={{
            background:
              'radial-gradient(closest-side, #ea384c 0%, #f97316 40%, transparent 80%)',
          }}
        />
      </div>

      <div className="relative w-full max-w-md">
        <Link
          href="/"
          className="mx-auto mb-8 flex w-fit items-center gap-2 font-semibold tracking-tight"
        >
          <span className="bg-brand-gradient grid h-7 w-7 place-items-center rounded-md text-black">
            <Sparkles className="h-4 w-4" strokeWidth={2.5} />
          </span>
          <span>SkillForge VN</span>
        </Link>

        <div className="glass-solid rounded-3xl p-7 md:p-8">
          <h1 className="text-balance text-2xl font-semibold tracking-tight md:text-3xl">
            {title}
          </h1>
          <p className="mt-2 text-sm text-foreground/65">{intro}</p>

          {mode === 'login' ? (
            <>
              <button
                type="button"
                onClick={signInWithGoogle}
                disabled={isSending}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-medium text-foreground/90 transition hover:border-brand-orange/45 hover:bg-brand-orange/10 disabled:cursor-wait disabled:opacity-70"
              >
                {isSending ? 'Đang xử lý...' : 'Tiếp tục với Google'}
                <ArrowRight className="h-4 w-4" />
              </button>

              <div className="my-6 flex items-center gap-3 text-[11px] uppercase tracking-widest text-muted-foreground">
                <span className="h-px flex-1 bg-white/10" />
                Hoặc
                <span className="h-px flex-1 bg-white/10" />
              </div>
            </>
          ) : null}

          <form onSubmit={submit} className={cn('space-y-4', mode === 'forgot' && 'mt-6')}>
            <div>
              <label htmlFor="user-email" className="text-[11px] uppercase tracking-widest text-muted-foreground">
                Email
              </label>
              <div className="mt-2 flex items-center gap-2 rounded-xl bg-white/[0.02] px-3 py-3 ring-1 ring-white/8 focus-within:ring-white/20">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <input
                  id="user-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    resetMessage();
                  }}
                  placeholder="ban@example.com"
                  aria-invalid={state === 'error'}
                  aria-describedby={message ? 'login-message' : undefined}
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </div>
            </div>

            {mode !== 'forgot' ? (
              <div>
                <label htmlFor="user-password" className="text-[11px] uppercase tracking-widest text-muted-foreground">
                  Mật khẩu
                </label>
                <div className="mt-2 flex items-center gap-2 rounded-xl bg-white/[0.02] px-3 py-3 ring-1 ring-white/8 focus-within:ring-white/20">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <input
                    id="user-password"
                    type="password"
                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      resetMessage();
                    }}
                    placeholder={mode === 'signup' ? 'Tạo mật khẩu' : 'Nhập mật khẩu'}
                    aria-invalid={state === 'error'}
                    aria-describedby={message ? 'login-message' : undefined}
                    className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                  />
                </div>
              </div>
            ) : null}

            <label className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3 text-xs leading-5 text-foreground/65">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => {
                  setAcceptedTerms(e.target.checked);
                  resetMessage();
                }}
                className="mt-1 h-4 w-4 rounded border-white/20 bg-transparent accent-brand-orange"
              />
              <span>
                Tôi xác nhận đã đọc và đồng ý với{' '}
                <Link href="/legal/terms" className="text-brand-orange hover:underline">
                  điều khoản
                </Link>{' '}
                và{' '}
                <Link href="/legal/privacy" className="text-brand-orange hover:underline">
                  chính sách bảo mật
                </Link>
                .
              </span>
            </label>

            {message ? (
              <p
                id="login-message"
                role={state === 'error' ? 'alert' : 'status'}
                className={cn(
                  'rounded-lg px-3 py-2 text-xs ring-1',
                  state === 'success'
                    ? 'bg-emerald-500/10 text-emerald-300 ring-emerald-500/30'
                    : 'bg-red-500/10 text-red-300 ring-red-500/30',
                )}
              >
                {message}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSending}
              className={cn(
                'bg-brand-gradient glow-red group inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-medium text-black transition',
                isSending && 'cursor-wait opacity-70',
              )}
            >
              {isSending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Đang xử lý
                </>
              ) : (
                <>
                  {mode === 'signup' ? 'Tạo tài khoản' : mode === 'forgot' ? 'Gửi email đặt lại mật khẩu' : 'Đăng nhập bằng email'}
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
            {mode !== 'login' ? (
              <button type="button" onClick={() => switchMode('login')} className="hover:text-brand-orange hover:underline">
                Đã có tài khoản? Đăng nhập
              </button>
            ) : null}
            {mode !== 'signup' ? (
              <button type="button" onClick={() => switchMode('signup')} className="hover:text-brand-orange hover:underline">
                Tạo tài khoản
              </button>
            ) : null}
            {mode === 'login' ? (
              <button type="button" onClick={() => switchMode('forgot')} className="hover:text-brand-orange hover:underline">
                Quên mật khẩu?
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </LoginShell>
  );
}

function LoginShell({ children }: { children: React.ReactNode }) {
  return <main className="relative grid min-h-svh place-items-center px-4 py-16">{children}</main>;
}

export default function LoginPage() {
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
      <LoginForm />
    </Suspense>
  );
}
