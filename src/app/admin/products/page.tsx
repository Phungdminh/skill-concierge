import Link from 'next/link';
import { Plus, Pencil, ExternalLink } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import {
  formatPriceVnd,
  productDetailHref,
  KIND_META,
  ALL_KINDS,
  type Product,
  type ProductKind,
} from '@/lib/product-types';
import { cn } from '@/lib/utils';

export const metadata = { title: 'Sản phẩm — Admin' };
export const dynamic = 'force-dynamic';

const STATUS_LABEL: Record<string, string> = {
  draft: 'Nháp',
  published: 'Đang bán',
  sold_out: 'Hết',
  archived: 'Lưu trữ',
};

const STATUS_STYLE: Record<string, string> = {
  draft: 'bg-white/[0.06] text-foreground/75 ring-white/10',
  published: 'bg-emerald-500/10 text-emerald-300 ring-emerald-500/30',
  sold_out: 'bg-amber-500/10 text-amber-300 ring-amber-500/30',
  archived: 'bg-white/[0.04] text-foreground/45 ring-white/8',
};

interface PageProps {
  searchParams: Promise<{ kind?: string }>;
}

export default async function AdminProductsPage({ searchParams }: PageProps) {
  const { kind: kindFilter } = await searchParams;
  const validKind = (ALL_KINDS as string[]).includes(kindFilter ?? '')
    ? (kindFilter as ProductKind)
    : null;

  const supabase = await createClient();
  let q = supabase
    .from('products')
    .select('*')
    .order('updated_at', { ascending: false });
  if (validKind) q = q.eq('kind', validKind);
  const { data } = await q;
  const products: Product[] = (data as Product[] | null) ?? [];

  return (
    <section className="pt-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Admin</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">Sản phẩm</h1>
          <p className="mt-2 text-foreground/65">
            Tool, setup guide, khoá học, web/CV — tất cả nháp và đang bán.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="bg-brand-gradient inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-semibold text-black"
        >
          <Plus className="h-4 w-4" /> Tạo sản phẩm
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <KindChip href="/admin/products" active={validKind === null} label="Tất cả" />
        {ALL_KINDS.map((k) => (
          <KindChip
            key={k}
            href={`/admin/products?kind=${k}`}
            active={validKind === k}
            label={KIND_META[k].shortLabel}
          />
        ))}
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-white/5 bg-[#0d0d10]">
        {products.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-foreground/55">
            Chưa có sản phẩm{validKind ? ` thuộc loại ${KIND_META[validKind].label}` : ''}.
            Bấm &ldquo;Tạo sản phẩm&rdquo; để bắt đầu.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-white/5 text-left text-[11px] uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-normal">Sản phẩm</th>
                <th className="px-4 py-3 font-normal">Loại</th>
                <th className="px-4 py-3 font-normal">Giá</th>
                <th className="px-4 py-3 font-normal">Trạng thái</th>
                <th className="px-4 py-3 font-normal">Cập nhật</th>
                <th className="px-4 py-3 font-normal"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {products.map((p) => {
                const meta = KIND_META[p.kind];
                const KIcon = meta.icon;
                return (
                  <tr key={p.id} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <div className="font-medium">{p.title}</div>
                      <div className="text-xs text-foreground/55">{meta.route}/{p.slug}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.04] px-2.5 py-0.5 text-[11px] text-foreground/80 ring-1 ring-white/10">
                        <KIcon className="h-3 w-3" strokeWidth={1.75} />
                        {meta.shortLabel}
                      </span>
                    </td>
                    <td className="px-4 py-3 tabular-nums text-foreground/80">
                      {formatPriceVnd(p.price_vnd, p.pricing_mode)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[10.5px] uppercase tracking-widest ring-1 ${STATUS_STYLE[p.status]}`}
                      >
                        {STATUS_LABEL[p.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-foreground/55">
                      {new Date(p.updated_at).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        {p.status === 'published' && (
                          <Link
                            href={productDetailHref(p)}
                            target="_blank"
                            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs text-foreground/65 transition hover:bg-white/[0.05] hover:text-foreground"
                          >
                            <ExternalLink className="h-3.5 w-3.5" /> Xem
                          </Link>
                        )}
                        <Link
                          href={`/admin/products/${p.id}/edit`}
                          className="inline-flex items-center gap-1 rounded-lg bg-white/[0.06] px-2.5 py-1.5 text-xs text-foreground/85 transition hover:bg-white/[0.1]"
                        >
                          <Pencil className="h-3.5 w-3.5" /> Sửa
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}

function KindChip({
  href,
  active,
  label,
}: {
  href: string;
  active: boolean;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'rounded-full px-3.5 py-1.5 text-xs transition',
        active
          ? 'bg-brand-gradient font-semibold text-black'
          : 'border border-white/10 bg-white/[0.02] text-foreground/75 hover:bg-white/[0.06]',
      )}
    >
      {label}
    </Link>
  );
}
