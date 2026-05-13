import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { InquiryRow } from '@/components/admin/inquiry-row';
import type { Inquiry, InquiryStatus } from '@/lib/product-types';
import { cn } from '@/lib/utils';

export const metadata = { title: 'Inquiries — Admin' };
export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

const FILTERS: { value: 'all' | InquiryStatus; label: string }[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'new', label: 'Mới' },
  { value: 'contacted', label: 'Đã liên hệ' },
  { value: 'closed', label: 'Đóng' },
];

export default async function AdminInquiriesPage({ searchParams }: PageProps) {
  const { status } = await searchParams;
  const active = (status as InquiryStatus | undefined) ?? 'all';
  const supabase = await createClient();

  let q = supabase
    .from('inquiries')
    .select('*')
    .order('created_at', { ascending: false });
  if (active !== 'all') q = q.eq('status', active);
  const { data: rawInquiries } = await q;
  const inquiries: Inquiry[] = (rawInquiries as Inquiry[] | null) ?? [];

  const productIds = Array.from(
    new Set(inquiries.map((i) => i.product_id).filter((v): v is string => Boolean(v))),
  );
  let productMap: Record<string, string> = {};
  if (productIds.length > 0) {
    const { data: productRows } = await supabase
      .from('products')
      .select('id, title')
      .in('id', productIds);
    productMap = Object.fromEntries(
      (productRows ?? []).map((p: { id: string; title: string }) => [p.id, p.title]),
    );
  }

  return (
    <section className="pt-10">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">Admin</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">Inquiries</h1>
      <p className="mt-2 text-foreground/65">
        Khách hỏi mua / hỏi build riêng. Bấm để xem chi tiết, đánh dấu trạng thái.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const href =
            f.value === 'all' ? '/admin/inquiries' : `/admin/inquiries?status=${f.value}`;
          const isActive = active === f.value;
          return (
            <Link
              key={f.value}
              href={href}
              className={cn(
                'rounded-full px-3.5 py-1.5 text-xs transition',
                isActive
                  ? 'bg-brand-gradient font-semibold text-black'
                  : 'border border-white/10 bg-white/[0.02] text-foreground/75 hover:bg-white/[0.06]',
              )}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-white/5 bg-[#0d0d10]">
        {inquiries.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-foreground/55">
            Chưa có inquiry nào ở đây.
          </div>
        ) : (
          <ul className="divide-y divide-white/5">
            {inquiries.map((iq) => (
              <InquiryRow
                key={iq.id}
                inquiry={iq}
                productTitle={iq.product_id ? productMap[iq.product_id] : null}
              />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
