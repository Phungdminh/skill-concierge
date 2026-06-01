import Link from 'next/link';
import { ArrowRight, Mail, Plus, Package, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { ALL_KINDS, KIND_META, type Inquiry } from '@/lib/product-types';

export const metadata = {
  title: 'Admin — SkillForge VN',
};

export const dynamic = 'force-dynamic';

export default async function AdminHome() {
  const supabase = await createClient();
  const [
    { count: toolsCount },
    { count: promptsCount },
    { count: webworkCount },
    { count: inquiriesNew },
    { data: recentInquiries },
  ] = await Promise.all([
    supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('kind', 'tool'),
    supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('kind', 'prompt'),
    supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('kind', 'webwork'),
    supabase
      .from('inquiries')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'new'),
    supabase
      .from('inquiries')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  const inquiries = (recentInquiries as Inquiry[] | null) ?? [];

  return (
    <section className="pt-10">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">Admin</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">Tổng quan</h1>
      <p className="mt-3 text-foreground/65">
        Quản lý sản phẩm (tool / prompt mẫu / web) và inquiry từ khách.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat label="Tool" value={toolsCount ?? 0} />
        <Stat label="Prompt" value={promptsCount ?? 0} />
        <Stat label="Web cá nhân" value={webworkCount ?? 0} />
        <Stat label="Inquiry mới" value={inquiriesNew ?? 0} accent />
      </div>

      <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Link
          href="/admin/products"
          className="group flex items-center justify-between rounded-3xl border border-white/5 bg-[#0d0d10] p-6 transition hover:border-white/15"
        >
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/[0.04] ring-1 ring-white/10">
              <Package className="h-5 w-5 text-brand-orange" />
            </span>
            <div>
              <h2 className="text-base font-semibold tracking-tight">Quản lý sản phẩm</h2>
              <p className="text-sm text-foreground/65">Tạo, sửa, publish — 4 loại</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </Link>

        <Link
          href="/admin/inquiries"
          className="group flex items-center justify-between rounded-3xl border border-white/5 bg-[#0d0d10] p-6 transition hover:border-white/15"
        >
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/[0.04] ring-1 ring-white/10">
              <Mail className="h-5 w-5 text-brand-orange" />
            </span>
            <div>
              <h2 className="text-base font-semibold tracking-tight">Inquiries</h2>
              <p className="text-sm text-foreground/65">Khách hỏi mua, đánh dấu đã liên hệ</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div className="mt-10">
        <p className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">
          Tạo nhanh theo loại
        </p>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {ALL_KINDS.map((k) => {
            const meta = KIND_META[k];
            const KIcon = meta.icon;
            return (
              <Link
                key={k}
                href={`/admin/products/new?kind=${k}`}
                className="group flex items-center gap-3 rounded-2xl border border-white/5 bg-[#0d0d10] p-4 transition hover:border-white/15 hover:bg-white/[0.02]"
              >
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/[0.04] text-brand-orange ring-1 ring-white/10">
                  <KIcon className="h-4 w-4" strokeWidth={1.75} />
                </span>
                <div className="flex-1">
                  <div className="text-sm font-medium">{meta.shortLabel}</div>
                  <div className="text-[11px] text-foreground/55">+ Tạo mới</div>
                </div>
                <Plus className="h-4 w-4 text-foreground/45 transition group-hover:text-foreground" />
              </Link>
            );
          })}
        </div>
      </div>

      <div className="mt-10 rounded-3xl border border-white/5 bg-[#0d0d10]">
        <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
          <h2 className="text-sm font-semibold tracking-tight">Inquiry mới nhất</h2>
          <Link
            href="/admin/inquiries"
            className="text-xs text-foreground/65 transition hover:text-foreground"
          >
            Xem tất cả →
          </Link>
        </div>
        {inquiries.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-foreground/55">
            Chưa có inquiry nào. Sau khi publish sản phẩm, khách sẽ liên hệ qua đây.
          </div>
        ) : (
          <ul className="divide-y divide-white/5">
            {inquiries.map((iq) => (
              <li key={iq.id} className="px-6 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium">{iq.name}</span>
                      <StatusPill status={iq.status} />
                      {iq.product_kind && (
                        <span className="text-[11px] text-foreground/55">
                          · {KIND_META[iq.product_kind].shortLabel}
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 text-xs text-foreground/55">
                      {iq.email}
                      {iq.phone ? ` · ${iq.phone}` : ''}
                    </div>
                    {iq.message && (
                      <p className="mt-1.5 line-clamp-2 text-sm text-foreground/75">
                        {iq.message}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 text-[11px] text-muted-foreground">
                    {new Date(iq.created_at).toLocaleString('vi-VN')}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-[#0d0d10] p-5">
      <div className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div
        className={`mt-1.5 text-3xl font-semibold tabular-nums ${accent ? 'text-brand-orange' : ''}`}
      >
        {value}
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
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
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] uppercase tracking-widest ring-1 ${styles[status] ?? 'bg-white/5 text-foreground/70 ring-white/10'}`}
    >
      {status === 'closed' && <CheckCircle2 className="h-3 w-3" />}
      {labels[status] ?? status}
    </span>
  );
}
