'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductReviewFormProps {
  productId: string;
  isLoggedIn: boolean;
  loginHref: string;
}

export function ProductReviewForm({ productId, isLoggedIn, loginHref }: ProductReviewFormProps) {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [state, setState] = useState<'idle' | 'saving' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (state === 'saving') return;
    setState('saving');
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          rating,
          title: title.trim() || null,
          body: body.trim() || null,
        }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json?.error?.message ?? 'Không lưu được đánh giá.');
      }
      setTitle('');
      setBody('');
      setState('idle');
      router.refresh();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Có lỗi xảy ra.');
      setState('error');
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-4 text-sm text-foreground/65">
        <p>Đăng nhập để gửi đánh giá thật sau khi dùng prompt.</p>
        <Link
          href={loginHref}
          className="mt-3 inline-flex rounded-xl bg-brand-gradient px-4 py-2 text-sm font-semibold text-black transition hover:brightness-110"
        >
          Đăng nhập để đánh giá
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-white/8 bg-white/[0.02] p-4">
      <div className="text-sm font-semibold text-foreground">Viết đánh giá của bạn</div>
      <div className="mt-3 flex items-center gap-1" aria-label="Chọn số sao">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setRating(value)}
            className="rounded-md p-1 text-brand-orange transition hover:bg-white/[0.04] focus:outline-none focus:ring-2 focus:ring-brand-orange/40"
            aria-label={`${value} sao`}
          >
            <Star className={cn('h-5 w-5', value <= rating && 'fill-current')} strokeWidth={1.75} />
          </button>
        ))}
      </div>

      <label htmlFor="review-title" className="mt-4 block text-[11px] uppercase tracking-widest text-muted-foreground">
        Tiêu đề ngắn
      </label>
      <input
        id="review-title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={120}
        placeholder="Prompt dễ chỉnh và dùng được ngay"
        className={inputCls}
      />

      <label htmlFor="review-body" className="mt-4 block text-[11px] uppercase tracking-widest text-muted-foreground">
        Nội dung đánh giá
      </label>
      <textarea
        id="review-body"
        rows={4}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        maxLength={2000}
        placeholder="Prompt này giúp bạn làm việc gì nhanh hơn?"
        className={inputCls}
      />

      {errorMsg && (
        <p className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-300 ring-1 ring-red-500/30">
          {errorMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={state === 'saving'}
        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-gradient px-4 py-2.5 text-sm font-semibold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {state === 'saving' && <Loader2 className="h-4 w-4 animate-spin" />}
        Gửi đánh giá
      </button>
    </form>
  );
}

const inputCls =
  'mt-2 w-full rounded-xl bg-white/[0.02] px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground ring-1 ring-white/8 transition focus:outline-none focus:ring-white/25';
