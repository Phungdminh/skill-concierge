import Link from 'next/link';
import { ArrowUpRight, Bot, Mail, MessageCircle, Play, Send, Trophy } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { ProductCard } from '@/components/product-card';
import { YouTubeEmbed } from '@/components/youtube-embed';
import { formatPriceVnd, productDetailHref, type Product } from '@/lib/product-types';

const CONTACT_LINKS = [
  {
    label: 'Zalo',
    value: '0973309676',
    href: 'https://zalo.me/0973309676',
    icon: MessageCircle,
  },
  {
    label: 'Telegram',
    value: '@ducminh299',
    href: 'https://t.me/ducminh299',
    icon: Send,
  },
  {
    label: 'Gmail',
    value: 'Phungducminh299@gmail.com',
    href: 'mailto:Phungducminh299@gmail.com',
    icon: Mail,
  },
];

export async function FeaturedTools() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('kind', 'tool')
    .eq('status', 'published')
    .order('featured', { ascending: false })
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })
    .limit(6);
  const tools: Product[] = (data as Product[] | null) ?? [];
  const { data: bestSellerData } = await supabase
    .from('products')
    .select('*')
    .eq('kind', 'tool')
    .eq('status', 'published')
    .not('youtube_url', 'is', null)
    .order('sales_count', { ascending: false })
    .order('featured', { ascending: false })
    .order('sort_order', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  const bestSeller = bestSellerData as Product | null;

  return (
    <section
      id="featured"
      className="relative mx-auto w-full max-w-6xl px-6 py-24"
    >
      <div className="mb-10 flex flex-col items-start justify-between gap-4 md:mb-12 md:flex-row md:items-end">
        <div>
          <p className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">
            Featured
          </p>
          <h2 className="text-balance text-3xl font-semibold tracking-tight md:text-5xl">
            Tool đang bán
          </h2>
          <p className="mt-4 max-w-2xl text-foreground/60">
            Mỗi tool có video demo trên YouTube — bạn xem cách nó hoạt động thật trước khi mua.
          </p>
        </div>
        <Link
          href="/tools"
          className="featured-cta group inline-flex min-h-12 items-center gap-2 self-start rounded-full border border-white/12 bg-white/[0.03] px-5 py-2.5 text-sm font-medium text-foreground/90 md:self-end"
        >
          Xem tất cả tool
          <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>

      {bestSeller?.youtube_url && (
        <div className="mb-12 grid gap-6 rounded-3xl border border-white/5 bg-[#0d0d10] p-5 md:grid-cols-[1.35fr_0.9fr] md:p-6">
          <YouTubeEmbed
            url={bestSeller.youtube_url}
            title={`Demo ${bestSeller.title}`}
            className="rounded-2xl"
          />
          <div className="flex flex-col justify-center p-1 md:p-3">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-brand-orange/30 bg-brand-orange/10 px-3 py-1 text-[11px] font-medium uppercase tracking-widest text-brand-orange">
              <Trophy className="h-3.5 w-3.5" /> Tool bán chạy nhất
            </span>
            <h3 className="mt-4 text-2xl font-semibold tracking-tight md:text-3xl">
              {bestSeller.title}
            </h3>
            {bestSeller.tagline && (
              <p className="mt-3 text-sm leading-relaxed text-foreground/65 md:text-base">
                {bestSeller.tagline}
              </p>
            )}
            <div className="mt-5 grid gap-3 text-sm text-foreground/70">
              <div>
                <div className="text-[10.5px] uppercase tracking-widest text-muted-foreground">
                  Chức năng
                </div>
                <p className="mt-1">
                  {bestSeller.description
                    ? bestSeller.description.replace(/[#*_`>-]/g, '').split('\n').find(Boolean)?.slice(0, 180)
                    : 'Tự động hỗ trợ một tác vụ lặp lại trên website/app web, giúp giảm thao tác thủ công.'}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {bestSeller.sales_count > 0 && (
                  <span className="rounded-full bg-white/[0.04] px-3 py-1 text-xs text-foreground/75 ring-1 ring-white/8">
                    {bestSeller.sales_count} lượt bán
                  </span>
                )}
                <span className="rounded-full bg-white/[0.04] px-3 py-1 text-xs text-foreground/75 ring-1 ring-white/8">
                  {formatPriceVnd(bestSeller.price_vnd, bestSeller.pricing_mode, bestSeller.is_free)}
                </span>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={productDetailHref(bestSeller)}
                className="featured-cta inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/12 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-foreground/90"
              >
                Xem chi tiết
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                href={`/contact?product=${bestSeller.slug}&kind=tool`}
                className="hero-primary-cta bg-brand-gradient inline-flex min-h-11 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-black"
              >
                <Play className="h-3.5 w-3.5 fill-current" strokeWidth={0} />
                Đặt tool này
              </Link>
            </div>
          </div>
        </div>
      )}

      {tools.length === 0 ? (
        <div className="grid place-items-center rounded-3xl border border-dashed border-white/10 bg-[#0a0a0b] px-6 py-20 text-center">
          <Bot className="h-10 w-10 text-foreground/30" strokeWidth={1.5} />
          <h3 className="mt-5 text-lg font-semibold">Tool mới đang trên đường</h3>
          <p className="mt-2 max-w-md text-sm text-foreground/55">
            Đang đóng gói tool tiếp theo — quay lại sớm nhé. Hoặc nói với mình bạn cần gì.
          </p>
          <Link
            href="/contact"
            className="featured-cta mt-6 inline-flex min-h-12 items-center gap-2 rounded-xl border border-white/12 bg-white/[0.03] px-6 py-3 text-sm font-medium text-foreground/90"
          >
            Đặt tool riêng
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <ProductCard key={tool.id} product={tool} hideKind />
          ))}
        </div>
      )}

      <div className="mt-12 rounded-3xl border border-white/5 bg-[#0d0d10] p-6 md:p-8">
        <div className="max-w-2xl">
          <p className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">
            Cần tool riêng?
          </p>
          <h3 className="text-balance text-2xl font-semibold tracking-tight md:text-3xl">
            Không có tool bạn cần?
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-foreground/60 md:text-base">
            Hãy liên hệ với mình qua Zalo, Telegram hoặc Gmail. Bạn chỉ cần mô tả tác vụ đang làm lặp lại hằng ngày, mình sẽ tư vấn xem có thể làm tool tự động phù hợp hay không.
          </p>
        </div>

        <div className="relative mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
          {CONTACT_LINKS.map((contact) => {
            const Icon = contact.icon;
            return (
              <a
                key={contact.label}
                href={contact.href}
                target="_blank"
                rel="noreferrer"
                className="contact-lift-card group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/5 bg-[#0d0d10] p-6"
              >
                <div className="relative flex items-start gap-4">
                  <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/[0.04] text-brand-orange ring-1 ring-white/10 transition duration-200 group-hover:scale-105 group-hover:bg-white/[0.06] group-hover:ring-white/20">
                    <Icon className="h-7 w-7 transition duration-200" strokeWidth={1.6} />
                  </span>
                  <div className="flex-1">
                    <h4 className="flex items-center gap-1.5 text-xl font-semibold tracking-tight transition duration-200 group-hover:text-foreground">
                      {contact.label}
                      <ArrowUpRight className="h-4 w-4 text-foreground/40 transition duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground/70" />
                    </h4>
                    <p className="mt-2 text-sm text-foreground/65 transition duration-200 group-hover:text-foreground/85">{contact.value}</p>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
