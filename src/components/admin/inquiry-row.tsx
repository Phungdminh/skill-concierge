'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Loader2, Mail, MessageCircle, Phone } from 'lucide-react';
import { KIND_META, type Inquiry, type InquiryStatus } from '@/lib/product-types';
import { cn } from '@/lib/utils';

interface InquiryRowProps {
  inquiry: Inquiry;
  productTitle?: string | null;
}

const STATUS_OPTIONS: { value: InquiryStatus; label: string }[] = [
  { value: 'new', label: 'Mới' },
  { value: 'contacted', label: 'Đã liên hệ' },
  { value: 'closed', label: 'Đóng' },
];

export function InquiryRow({ inquiry, productTitle }: InquiryRowProps) {
  const router = useRouter();
  const [status, setStatus] = useState<InquiryStatus>(inquiry.status);
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function changeStatus(next: InquiryStatus) {
    if (next === status) return;
    setError(null);
    const prev = status;
    setStatus(next);
    startTransition(async () => {
      const res = await fetch(`/api/admin/inquiries/${inquiry.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) {
        setStatus(prev);
        const body = await res.json().catch(() => ({}));
        setError(body?.error?.message ?? 'Không cập nhật được');
        return;
      }
      router.refresh();
    });
  }

  const kindLabel = inquiry.product_kind ? KIND_META[inquiry.product_kind].shortLabel : null;

  return (
    <li className="px-6 py-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start justify-between gap-3 text-left"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate font-medium">{inquiry.name}</span>
            <StatusPill status={status} />
            {kindLabel && (
              <span className="rounded-full bg-white/[0.04] px-2 py-0.5 text-[10.5px] uppercase tracking-widest text-foreground/65 ring-1 ring-white/10">
                {kindLabel}
              </span>
            )}
            {productTitle && (
              <span className="text-xs text-foreground/55">· về: {productTitle}</span>
            )}
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-foreground/55">
            <span className="inline-flex items-center gap-1">
              <Mail className="h-3 w-3" /> {inquiry.email}
            </span>
            {inquiry.phone && (
              <span className="inline-flex items-center gap-1">
                <Phone className="h-3 w-3" /> {inquiry.phone}
              </span>
            )}
          </div>
          {inquiry.message && (
            <p
              className={cn(
                'mt-2 text-sm text-foreground/80',
                open ? 'whitespace-pre-line' : 'line-clamp-2',
              )}
            >
              {inquiry.message}
            </p>
          )}
        </div>
        <span className="shrink-0 text-[11px] text-muted-foreground">
          {new Date(inquiry.created_at).toLocaleString('vi-VN')}
        </span>
      </button>

      {open && (
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/5 pt-4">
          <span className="text-xs text-foreground/55">Đánh dấu:</span>
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              disabled={pending}
              onClick={() => changeStatus(opt.value)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs transition',
                opt.value === status
                  ? 'bg-brand-gradient font-semibold text-black'
                  : 'border border-white/10 bg-white/[0.02] text-foreground/80 hover:bg-white/[0.06]',
              )}
            >
              {opt.value === status && pending && (
                <Loader2 className="mr-1 inline h-3 w-3 animate-spin" />
              )}
              {opt.label}
            </button>
          ))}
          {inquiry.phone && (
            <a
              href={`https://zalo.me/${inquiry.phone.replace(/\D/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-foreground/80 transition hover:bg-white/[0.04]"
            >
              <MessageCircle className="h-3.5 w-3.5" /> Mở Zalo
            </a>
          )}
          {error && <span className="text-xs text-red-300">{error}</span>}
        </div>
      )}
    </li>
  );
}

function StatusPill({ status }: { status: InquiryStatus }) {
  const styles: Record<string, string> = {
    new: 'bg-brand-orange/15 text-brand-orange ring-brand-orange/30',
    contacted: 'bg-amber-500/10 text-amber-300 ring-amber-500/30',
    closed: 'bg-emerald-500/10 text-emerald-300 ring-emerald-500/30',
  };
  const labels: Record<string, string> = {
    new: 'Mới',
    contacted: 'Đã liên hệ',
    closed: 'Đóng',
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] uppercase tracking-widest ring-1 ${styles[status]}`}
    >
      {status === 'closed' && <CheckCircle2 className="h-3 w-3" />}
      {labels[status]}
    </span>
  );
}
