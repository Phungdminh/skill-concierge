import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, CheckCircle2, Sparkles, Tag, Clock } from 'lucide-react';
import { Nav } from '@/components/nav';
import { Footer } from '@/components/footer';
import { YouTubeEmbed } from '@/components/youtube-embed';
import {
  KIND_META,
  SUPPORT_META,
  formatPriceVnd,
  type Product,
} from '@/lib/product-types';
import { renderMarkdown } from '@/lib/markdown';

interface ProductDetailProps {
  product: Product;
}

const DEFAULT_BULLETS: Record<Product['kind'], string[]> = {
  tool: [
    'File .exe đóng gói, không cần cài Python',
    'Hướng dẫn dùng + setup chi tiết',
    'Sửa bug miễn phí trong 30 ngày',
  ],
  setup: [
    '1-on-1 hướng dẫn từ A-Z',
    'Hỗ trợ trong 14 ngày sau setup',
    'Document config riêng cho máy bạn',
  ],
  course: [
    'Truy cập trọn đời folder Drive',
    'Zalo group hỗ trợ trực tiếp',
    'Cập nhật khi có version mới',
  ],
  webwork: [
    '2 vòng revise miễn phí',
    'Source code đứng tên bạn',
    'Hướng dẫn deploy + handover',
  ],
};

export function ProductDetail({ product }: ProductDetailProps) {
  const meta = KIND_META[product.kind];
  const Icon = meta.icon;
  const html = renderMarkdown(product.description);
  const bullets = product.deliverables.length > 0 ? product.deliverables : DEFAULT_BULLETS[product.kind];

  return (
    <>
      <Nav />
      <main className="min-h-svh pb-16 pt-28">
        <div className="mx-auto w-full max-w-6xl px-6">
          <Link
            href={meta.route}
            className="inline-flex items-center gap-1.5 text-sm text-foreground/60 transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Tất cả {meta.pluralLabel.toLowerCase()}
          </Link>

          <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.04] px-3 py-1 text-[11px] uppercase tracking-widest text-muted-foreground ring-1 ring-white/8">
                  <Icon className="h-3 w-3" strokeWidth={2.25} /> {meta.label}
                </span>
                {product.category && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.04] px-3 py-1 text-[11px] uppercase tracking-widest text-muted-foreground ring-1 ring-white/8">
                    <Tag className="h-3 w-3" /> {product.category}
                  </span>
                )}
                {product.duration_label && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.04] px-3 py-1 text-[11px] uppercase tracking-widest text-muted-foreground ring-1 ring-white/8">
                    <Clock className="h-3 w-3" /> {product.duration_label}
                  </span>
                )}
              </div>

              <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight md:text-5xl">
                {product.title}
              </h1>
              {product.tagline && (
                <p className="mt-4 max-w-3xl text-balance text-lg text-foreground/70">
                  {product.tagline}
                </p>
              )}

              {product.youtube_url && (
                <div className="mt-8">
                  <YouTubeEmbed url={product.youtube_url} title={product.title} />
                </div>
              )}

              {product.tags.length > 0 && (
                <div className="mt-8 flex flex-wrap gap-2">
                  {product.tags.map((s) => (
                    <span
                      key={s}
                      className="rounded-full bg-white/[0.04] px-3 py-1 text-xs text-foreground/80 ring-1 ring-white/10"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}

              {product.prerequisites.length > 0 && (
                <div className="mt-10 rounded-2xl border border-white/5 bg-white/[0.02] p-5">
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Yêu cầu trước khi bắt đầu
                  </h2>
                  <ul className="mt-4 space-y-2.5">
                    {product.prerequisites.map((p) => (
                      <li key={p} className="flex items-start gap-2.5 text-sm text-foreground/80">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-orange" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {html && (
                <article
                  className="mt-10 max-w-none"
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              )}

              {product.gallery.length > 0 && (
                <div className="mt-12">
                  <h2 className="text-base font-semibold uppercase tracking-widest text-muted-foreground">
                    Screenshots
                  </h2>
                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {product.gallery.map((src) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={src}
                        src={src}
                        alt={`${product.title} screenshot`}
                        loading="lazy"
                        className="rounded-2xl border border-white/5"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <aside className="lg:col-span-4">
              <div className="sticky top-24 space-y-4">
                <div className="rounded-3xl border border-white/5 bg-gradient-to-br from-[#1a0d10] via-[#0d0d10] to-[#0d0d10] p-6">
                  <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
                    Giá
                  </div>
                  <div className="mt-1 text-3xl font-semibold tabular-nums">
                    {formatPriceVnd(product.price_vnd, product.pricing_mode)}
                  </div>
                  <p className="mt-3 text-xs text-foreground/55">
                    {product.pricing_mode === 'quote'
                      ? 'Báo giá theo yêu cầu — mô tả scope, mình quote trong 24h.'
                      : 'Thanh toán 1 lần. Giao qua Zalo/Drive trong vòng 24h sau xác nhận.'}
                  </p>

                  <Link
                    href={`/contact?product=${product.slug}&kind=${product.kind}`}
                    className="bg-brand-gradient glow-red mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold text-black"
                  >
                    <Sparkles className="h-4 w-4" />{' '}
                    {product.pricing_mode === 'quote' ? 'Yêu cầu báo giá' : 'Mua / Đặt câu hỏi'}
                  </Link>

                  <ul className="mt-5 space-y-2.5 text-sm text-foreground/75">
                    {bullets.map((b) => (
                      <Bullet key={b}>{b}</Bullet>
                    ))}
                  </ul>
                </div>

                {product.support_options.length > 0 && (
                  <div className="rounded-3xl border border-white/5 bg-[#0d0d10] p-6">
                    <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
                      Hình thức hỗ trợ
                    </div>
                    <ul className="mt-4 space-y-3">
                      {product.support_options.map((opt) => {
                        const m = SUPPORT_META[opt];
                        return (
                          <li key={opt}>
                            <div className="text-sm font-medium text-foreground/95">{m.label}</div>
                            <div className="mt-0.5 text-xs text-foreground/55">{m.description}</div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                <Link
                  href={`/contact?kind=${product.kind}`}
                  className="group flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.02] p-5 transition hover:bg-white/[0.05]"
                >
                  <div>
                    <div className="text-sm font-medium">Cần khác đi 1 chút?</div>
                    <div className="mt-0.5 text-xs text-foreground/55">{meta.ctaLabel}</div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5">
      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-orange" strokeWidth={2.25} />
      <span>{children}</span>
    </li>
  );
}
