import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import {
  ALL_KINDS,
  KIND_META,
  type Product,
  type ProductKind,
  productDetailHref,
} from '@/lib/product-types';
import { createClient } from '@/lib/supabase/server';

const CARD_COPY: Record<
  ProductKind,
  { tag: string; pitch: string; empty: string; previewLabel: string }
> = {
  tool: {
    tag: 'Tool dùng ngay',
    pitch: 'Các file .exe đã đóng gói sẵn để bạn mở lên và dùng cho công việc hằng ngày.',
    empty: 'Chưa có tool nào được đăng.',
    previewLabel: 'Tool đang có',
  },
  prompt: {
    tag: 'Prompt có ảnh tham khảo',
    pitch: 'Xem tên prompt và ảnh reference trước, cần bản đầy đủ thì đăng nhập để lấy.',
    empty: 'Chưa có prompt nào được đăng.',
    previewLabel: 'Prompt mới',
  },
  webwork: {
    tag: 'Dự án đã làm',
    pitch: 'Một vài landing page và portfolio đã từng làm để bạn hình dung phong cách.',
    empty: 'Chưa có dự án nào được đăng.',
    previewLabel: 'Dự án mẫu',
  },
};

function youtubeThumb(url: string | null) {
  const match = url?.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  return match ? `https://i.ytimg.com/vi/${match[1]}/hqdefault.jpg` : null;
}

function previewImage(product: Product) {
  if (product.kind === 'prompt') {
    return product.gallery[0] ?? product.thumbnail_url ?? null;
  }
  return product.thumbnail_url ?? youtubeThumb(product.youtube_url) ?? product.gallery[0] ?? null;
}

function ProductPreview({ product }: { product: Product }) {
  const image = previewImage(product);

  return (
    <Link
      href={productDetailHref(product)}
      className="group/item flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.025] p-2.5 transition hover:border-brand-orange/40 hover:bg-brand-orange/10"
    >
      <span className="relative grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-white/[0.04] text-xs font-semibold text-foreground/45 ring-1 ring-white/10">
        {image ? (
          <Image
            src={image}
            alt=""
            fill
            sizes="56px"
            className="object-cover transition duration-300 group-hover/item:scale-105"
          />
        ) : (
          KIND_META[product.kind].label.slice(0, 2)
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="line-clamp-1 block text-sm font-medium text-foreground/90 transition group-hover/item:text-brand-orange">
          {product.title}
        </span>
        <span className="mt-1 line-clamp-1 block text-xs text-foreground/50">
          {product.kind === 'webwork'
            ? 'Dự án đã từng làm'
            : product.tagline || KIND_META[product.kind].label}
        </span>
      </span>
      <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-foreground/30 transition group-hover/item:translate-x-0.5 group-hover/item:-translate-y-0.5 group-hover/item:text-brand-orange" />
    </Link>
  );
}

export async function Categories() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('products')
    .select('*')
    .in('kind', ALL_KINDS)
    .eq('status', 'published')
    .order('featured', { ascending: false })
    .order('sort_order', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(18);

  const products = (data ?? []) as Product[];
  const productsByKind = Object.fromEntries(
    ALL_KINDS.map((kind) => [
      kind,
      products.filter((product) => product.kind === kind).slice(0, 4),
    ]),
  ) as Record<ProductKind, Product[]>;

  return (
    <section id="categories" className="relative mx-auto w-full max-w-6xl px-6 py-24">
      <div className="mb-12 text-center">
        <p className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">
          Sản phẩm
        </p>
        <h2 className="text-balance text-3xl font-semibold tracking-tight md:text-5xl">
          3 thứ mình giúp bạn được
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-foreground/60">
          Mỗi nhóm đều có ví dụ thật: tool đang bán, prompt có ảnh reference và web/portfolio đã từng làm.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {ALL_KINDS.map((k) => {
          const meta = KIND_META[k];
          const copy = CARD_COPY[k];
          const Icon = meta.icon;
          const previewProducts = productsByKind[k];

          return (
            <div key={k} className="interactive-card group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/5 bg-[#0d0d10] p-6">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-brand-orange/0 via-brand-orange/0 to-brand-orange/0 transition duration-300 group-hover:from-brand-orange/20 group-hover:via-brand-red/10 group-hover:to-brand-amber/10"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-3xl ring-0 ring-brand-orange/0 transition duration-300 group-hover:ring-2 group-hover:ring-brand-orange/60"
              />
              <div
                aria-hidden
                className={`pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gradient-to-br ${meta.accent} opacity-25 blur-3xl transition duration-300 group-hover:scale-150 group-hover:opacity-80`}
              />

              <div className="relative flex items-start gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/[0.04] text-brand-orange ring-1 ring-white/10 transition duration-300 group-hover:scale-110 group-hover:bg-brand-orange group-hover:text-white group-hover:ring-brand-orange/40">
                  <Icon className="h-6 w-6 transition duration-300 group-hover:rotate-3" strokeWidth={1.6} />
                </span>
                <div className="flex-1">
                  <p className="text-[10.5px] uppercase tracking-widest text-muted-foreground">
                    {copy.tag}
                  </p>
                  <h3 className="mt-1.5 text-2xl font-semibold tracking-tight transition duration-300 group-hover:text-brand-orange">
                    {meta.label}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/65 transition duration-300 group-hover:text-foreground/85">
                    {copy.pitch}
                  </p>
                </div>
              </div>

              <div className="relative mt-6 flex flex-1 flex-col border-t border-white/5 pt-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-xs font-medium uppercase tracking-widest text-foreground/40">
                    {copy.previewLabel}
                  </p>
                  <Link
                    href={meta.route}
                    className="inline-flex items-center gap-1 text-xs font-medium text-brand-orange/90 transition hover:text-brand-orange"
                  >
                    Xem tất cả
                    <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </div>

                {previewProducts.length > 0 ? (
                  <div className="space-y-2.5">
                    {previewProducts.map((product) => (
                      <ProductPreview key={product.id} product={product} />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-4 text-sm text-foreground/45">
                    {copy.empty}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
