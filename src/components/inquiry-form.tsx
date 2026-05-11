'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Mail, Send, User, Phone, MessageSquare } from 'lucide-react';
import { KIND_META, type ProductKind } from '@/lib/product-types';
import { cn } from '@/lib/utils';

interface InquiryFormProps {
  productId?: string;
  productSlug?: string;
  productTitle?: string;
  productKind?: ProductKind;
}

export function InquiryForm({
  productId,
  productSlug,
  productTitle,
  productKind,
}: InquiryFormProps) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const defaultMessage = (() => {
    if (productTitle) return `Mình quan tâm "${productTitle}". Cho mình thêm thông tin về…`;
    if (productKind) {
      const meta = KIND_META[productKind];
      return `Mình muốn hỏi về ${meta.label.toLowerCase()}: `;
    }
    return '';
  })();
  const [message, setMessage] = useState(defaultMessage);
  const [honey, setHoney] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const valid = name.trim().length >= 2 && /@/.test(email);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid || state === 'sending') return;
    setState('sending');
    setErrorMsg(null);
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || null,
          message: message.trim() || null,
          product_id: productId ?? null,
          product_kind: productKind ?? null,
          website: honey,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error?.message ?? 'Gửi không thành công, thử lại nhé.');
      }
      const params = new URLSearchParams();
      if (productSlug) params.set('product', productSlug);
      if (productKind) params.set('kind', productKind);
      router.push(`/thanks${params.toString() ? `?${params}` : ''}`);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Có lỗi xảy ra, thử lại nhé.');
      setState('error');
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {/* Honeypot */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        value={honey}
        onChange={(e) => setHoney(e.target.value)}
        aria-hidden
        className="absolute h-0 w-0 opacity-0"
        style={{ position: 'absolute', left: '-10000px' }}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field icon={User} label="Họ và tên" htmlFor="iq-name">
          <input
            id="iq-name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nguyễn Văn A"
            autoComplete="name"
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </Field>
        <Field icon={Mail} label="Email" htmlFor="iq-email">
          <input
            id="iq-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ban@example.com"
            autoComplete="email"
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </Field>
      </div>

      <Field icon={Phone} label="Số điện thoại / Zalo (tuỳ chọn)" htmlFor="iq-phone">
        <input
          id="iq-phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="09xx xxx xxx"
          autoComplete="tel"
          inputMode="tel"
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
      </Field>

      <Field icon={MessageSquare} label="Lời nhắn" htmlFor="iq-message" align="start">
        <textarea
          id="iq-message"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Use case của bạn, deadline, hoặc câu hỏi cụ thể…"
          className="flex-1 resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
      </Field>

      {errorMsg && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-300 ring-1 ring-red-500/30">
          {errorMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={!valid || state === 'sending'}
        className={cn(
          'group inline-flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold transition',
          valid && state !== 'sending'
            ? 'bg-brand-gradient glow-red text-black hover:brightness-110'
            : 'cursor-not-allowed bg-white/5 text-muted-foreground',
        )}
      >
        {state === 'sending' ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Đang gửi…
          </>
        ) : (
          <>
            Gửi yêu cầu
            <Send className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </>
        )}
      </button>

      <p className="text-center text-xs text-muted-foreground">
        Mình rep trong 24h, qua email hoặc Zalo bạn để lại.
      </p>
    </form>
  );
}

interface FieldProps {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  htmlFor: string;
  align?: 'center' | 'start';
  children: React.ReactNode;
}

function Field({ icon: Icon, label, htmlFor, align = 'center', children }: FieldProps) {
  return (
    <label htmlFor={htmlFor} className="block">
      <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <span
        className={cn(
          'mt-2 flex gap-2 rounded-xl bg-white/[0.02] px-3 py-3 ring-1 ring-white/8 transition focus-within:ring-white/20',
          align === 'center' ? 'items-center' : 'items-start',
        )}
      >
        <Icon
          className={cn('h-4 w-4 text-muted-foreground', align === 'start' && 'mt-0.5')}
          strokeWidth={1.75}
        />
        {children}
      </span>
    </label>
  );
}
