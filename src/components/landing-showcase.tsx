import Link from 'next/link';
import { ArrowUpRight, Bot, Eye, Globe, TrendingUp } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { FolderCarousel } from '@/components/folder-carousel';
import { InteractiveShowcaseRow } from '@/components/interactive-showcase-row';
import { ProductImage } from '@/components/product-image';
import { SectionFrame } from '@/components/section-frame';
import { YouTubeEmbed } from '@/components/youtube-embed';
import { productPreviewImage } from '@/lib/product-images';
import { createClient } from '@/lib/supabase/server';
import {
  extractYouTubeId,
  productDetailHref,
  type Product,
} from '@/lib/product-types';
import type { PromptFolder, PromptFolderWithCount } from '@/lib/prompt-folder-types';

export type ProductRankItem = Pick<
  Product,
  'id' | 'kind' | 'slug' | 'title' | 'view_count' | 'youtube_url' | 'tagline' | 'thumbnail_url' | 'gallery'
>;

async function loadShowcase() {
  const supabase = await createClient();
  const [
    heroToolRes,
    rankToolsRes,
    heroWebRes,
    rankWebsRes,
    foldersRes,
    promptCountsRes,
  ] = await Promise.all([
    supabase
      .from('products')
      .select('*')
      .eq('status', 'published')
      .eq('kind', 'tool')
      .order('featured', { ascending: false })
      .order('sort_order', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('products')
      .select('id, kind, slug, title, view_count, youtube_url, tagline, thumbnail_url, gallery')
      .eq('status', 'published')
      .eq('kind', 'tool')
      .order('view_count', { ascending: false })
      .order('featured', { ascending: false })
      .order('sort_order', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('products')
      .select('*')
      .eq('status', 'published')
      .eq('kind', 'webwork')
      .order('featured', { ascending: false })
      .order('sort_order', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('products')
      .select('id, kind, slug, title, view_count, youtube_url, tagline, thumbnail_url, gallery')
      .eq('status', 'published')
      .eq('kind', 'webwork')
      .order('view_count', { ascending: false })
      .order('featured', { ascending: false })
      .order('sort_order', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('prompt_folders')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true }),
    supabase
      .from('products')
      .select('folder_id')
      .eq('status', 'published')
      .eq('kind', 'prompt'),
  ]);

  // Tally published-prompt counts per folder, drop empty folders.
  const tally = new Map<string, number>();
  for (const row of (promptCountsRes.data ?? []) as Array<{ folder_id: string | null }>) {
    if (row.folder_id) tally.set(row.folder_id, (tally.get(row.folder_id) ?? 0) + 1);
  }
  const folders: PromptFolderWithCount[] = ((foldersRes.data as PromptFolder[] | null) ?? [])
    .map((folder) => ({ ...folder, prompt_count: tally.get(folder.id) ?? 0 }))
    .filter((folder) => folder.prompt_count > 0);

  return {
    tool: (heroToolRes.data as Product | null) ?? null,
    toolRanking: ((rankToolsRes.data as ProductRankItem[] | null) ?? []) as ProductRankItem[],
    web: (heroWebRes.data as Product | null) ?? null,
    webRanking: ((rankWebsRes.data as ProductRankItem[] | null) ?? []) as ProductRankItem[],
    promptFolders: folders,
  };
}

export async function LandingShowcase() {
  const { tool, toolRanking, web, webRanking, promptFolders } = await loadShowcase();

  return (
    <div className="relative mx-auto w-full max-w-6xl space-y-12 px-6 pb-24 md:space-y-16">
      <section id="tools">
        <SectionFrame>
          <header className="mb-8">
            <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">
              Tool .exe
            </p>
            <h2 className="text-balance text-2xl font-semibold tracking-tight md:text-3xl">
              Tự động làm thay bạn — mỗi ngày vài tiếng
            </h2>
          </header>
          <ShowcaseRow
            eyebrow="Tool nổi bật"
            product={tool}
            ranking={toolRanking}
            rankingTitle="Tool xem nhiều nhất"
            icon={Bot}
            seeAllHref="/tools"
            seeAllTitle="Tất cả tool"
            seeAllDesc="Duyệt toàn bộ tool .exe mình đang bán."
            emptyTitle="Tool mới đang đóng gói"
            emptyBody="Quay lại sớm — hoặc nhắn mình bạn cần tool gì."
          />
        </SectionFrame>
      </section>

      <section id="web">
        <SectionFrame>
          <header className="mb-8">
            <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">
              Vibe-coded
            </p>
            <h2 className="text-balance text-2xl font-semibold tracking-tight md:text-3xl">
              Tạo web theo yêu cầu
            </h2>
            <p className="mt-3 max-w-2xl text-foreground/65">
              Dưới đây là danh sách những website đã tạo.
            </p>
          </header>
          <ShowcaseRow
            eyebrow="Web / portfolio nổi bật"
            product={web}
            ranking={webRanking}
            rankingTitle="Web xem nhiều nhất"
            icon={Globe}
            seeAllHref="/web"
            seeAllTitle="Tất cả dự án web"
            seeAllDesc="Landing page và portfolio đã từng làm."
            emptyTitle="Đang chọn dự án mới để showcase"
            emptyBody="Brief project của bạn — mình quote trong 24h."
          />
        </SectionFrame>
      </section>

      <section id="prompts">
        <SectionFrame>
          <FolderCarousel folders={promptFolders} />
        </SectionFrame>
      </section>
    </div>
  );
}

function ShowcaseRow({
  eyebrow,
  product,
  ranking,
  rankingTitle,
  icon,
  seeAllHref,
  seeAllTitle,
  seeAllDesc,
  emptyTitle,
  emptyBody,
}: {
  eyebrow: string;
  product: Product | null;
  ranking: ProductRankItem[];
  rankingTitle: string;
  icon: LucideIcon;
  seeAllHref: string;
  seeAllTitle: string;
  seeAllDesc: string;
  emptyTitle: string;
  emptyBody: string;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[7fr_3fr] lg:grid-rows-[4fr_1fr]">
      <InteractiveShowcaseRow
        heroProduct={product}
        rankingItems={ranking}
        rankingTitle={rankingTitle}
        eyebrow={eyebrow}
        emptyTitle={emptyTitle}
        emptyBody={emptyBody}
      />
      <SeeAllCard
        href={seeAllHref}
        icon={icon}
        title={seeAllTitle}
        desc={seeAllDesc}
      />
    </div>
  );
}

function HeroProductCard({
  product,
  eyebrow,
  emptyTitle,
  emptyBody,
  className,
}: {
  product: Product | null;
  eyebrow: string;
  emptyTitle: string;
  emptyBody: string;
  className?: string;
}) {
  if (!product) {
    return (
      <div
        className={`grid h-full min-h-[280px] place-items-center rounded-3xl border border-dashed border-white/10 bg-[#0a0a0b] px-8 py-16 text-center ${className ?? ''}`}
      >
        <div>
          <p className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">
            {eyebrow}
          </p>
          <h3 className="text-xl font-semibold tracking-tight text-foreground/85">
            {emptyTitle}
          </h3>
          <p className="mt-3 text-sm text-foreground/55">{emptyBody}</p>
        </div>
      </div>
    );
  }

  const image = productPreviewImage(product);
  const hasVideo = extractYouTubeId(product.youtube_url) !== null;
  const detailHref = productDetailHref(product);

  return (
    <div
      className={`flex h-full flex-col overflow-hidden rounded-3xl border border-white/8 bg-[#0a0a0b] ${className ?? ''}`}
    >
      {hasVideo && product.youtube_url ? (
        <YouTubeEmbed
          url={product.youtube_url}
          title={product.title}
          bare
          fill
          className="aspect-video lg:aspect-auto lg:flex-[7]"
        />
      ) : (
        <Link
          href={detailHref}
          className="group relative block aspect-video w-full overflow-hidden lg:aspect-auto lg:flex-[7]"
          aria-label={product.title}
        >
          <ProductImage
            src={image}
            alt={product.title}
            kind={product.kind}
            className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
            fallbackClassName="absolute inset-0 transition duration-500 group-hover:scale-[1.04]"
          />
        </Link>
      )}

      <div className="flex flex-col gap-4 p-6 md:p-8 lg:flex-[3] lg:justify-between">
        <div>
          <p className="text-[10.5px] uppercase tracking-widest text-muted-foreground">
            {eyebrow}
          </p>
          <h3 className="mt-2 line-clamp-2 text-2xl font-semibold tracking-tight md:text-3xl">
            {product.title}
          </h3>
          {product.tagline && (
            <p className="mt-2 line-clamp-2 max-w-2xl text-sm text-foreground/65 md:text-base">
              {product.tagline}
            </p>
          )}
        </div>
        <Link
          href={detailHref}
          className="group inline-flex w-fit items-center gap-1.5 rounded-full border border-brand-orange/40 bg-brand-orange/10 px-4 py-2 text-sm font-medium text-brand-orange transition hover:border-brand-orange hover:bg-brand-orange hover:text-white"
        >
          Xem chi tiết
          <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>
    </div>
  );
}

function RankingCard({
  items,
  title,
}: {
  items: ProductRankItem[];
  title: string;
}) {
  return (
    <div className="relative flex h-full min-h-[280px] flex-col overflow-hidden rounded-3xl border border-white/8 bg-[#0d0d10] p-5">
      <div className="mb-3 flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-orange/15 text-brand-orange ring-1 ring-brand-orange/25">
          <TrendingUp className="h-4 w-4" strokeWidth={2} />
        </span>
        <div>
          <p className="text-[10.5px] uppercase tracking-widest text-muted-foreground">
            Top xem nhiều
          </p>
          <h3 className="text-base font-semibold tracking-tight md:text-lg">
            {title}
          </h3>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="grid flex-1 place-items-center px-4 text-center">
          <p className="text-sm text-foreground/55">
            Chưa có dữ liệu xếp hạng.
          </p>
        </div>
      ) : (
        <ol className="flex flex-1 flex-col gap-0.5">
          {items.map((item, index) => (
            <li key={item.id}>
              <Link
                href={productDetailHref(item)}
                className="group flex items-center gap-3 rounded-xl px-2 py-2.5 transition hover:bg-white/[0.04]"
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-white/[0.04] text-xs font-semibold tabular-nums text-foreground/65 ring-1 ring-white/10 transition group-hover:bg-brand-orange/20 group-hover:text-brand-orange group-hover:ring-brand-orange/30">
                  {index + 1}
                </span>
                <span className="line-clamp-1 flex-1 text-sm text-foreground/85 transition group-hover:text-brand-orange">
                  {item.title}
                </span>
                <span className="inline-flex shrink-0 items-center gap-1 text-xs tabular-nums text-foreground/45">
                  <Eye className="h-3.5 w-3.5" strokeWidth={1.8} />
                  {item.view_count.toLocaleString('vi-VN')}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function SeeAllCard({
  href,
  icon: Icon,
  title,
  desc,
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="group relative flex h-full min-h-[140px] flex-col justify-between overflow-hidden rounded-3xl border border-white/8 bg-[#0d0d10] p-5 transition hover:border-brand-orange/40 hover:bg-[#101015]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-gradient-to-br from-brand-orange/30 to-brand-amber/10 opacity-30 blur-3xl transition duration-300 group-hover:opacity-70"
      />
      <div className="relative flex items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/[0.04] text-brand-orange ring-1 ring-white/10 transition group-hover:bg-brand-orange group-hover:text-white group-hover:ring-brand-orange/40">
          <Icon className="h-5 w-5" strokeWidth={1.6} />
        </span>
        <div className="min-w-0">
          <h3 className="text-base font-semibold tracking-tight transition group-hover:text-brand-orange md:text-lg">
            {title}
          </h3>
          <p className="mt-0.5 line-clamp-1 text-xs text-foreground/60">
            {desc}
          </p>
        </div>
      </div>
      <span className="relative mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-brand-orange">
        Xem tất cả
        <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </span>
    </Link>
  );
}

