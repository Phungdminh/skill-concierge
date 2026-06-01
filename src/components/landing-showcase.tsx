import Link from 'next/link';
import { ArrowUpRight, Bot, Globe } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { FolderCarousel } from '@/components/folder-carousel';
import { InteractiveShowcaseRow } from '@/components/interactive-showcase-row';
import { SectionFrame } from '@/components/section-frame';
import { createClient } from '@/lib/supabase/server';
import type { Product } from '@/lib/product-types';
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
            eyebrow="Web cá nhân nổi bật"
            product={web}
            ranking={webRanking}
            rankingTitle="Web xem nhiều nhất"
            icon={Globe}
            seeAllHref="/web"
            seeAllTitle="Tất cả dự án web"
            seeAllDesc="Landing page và web cá nhân đã từng làm."
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
      className="group relative flex h-full min-h-[140px] flex-col justify-between overflow-hidden rounded-3xl border border-border bg-card p-5 transition hover:border-brand-orange/40 hover:bg-surface-muted"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-gradient-to-br from-brand-orange/30 to-brand-amber/10 opacity-30 blur-3xl transition duration-300 group-hover:opacity-70"
      />
      <div className="relative flex items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-muted text-brand-orange ring-1 ring-[var(--ring-subtle)] transition group-hover:bg-brand-orange group-hover:text-white group-hover:ring-brand-orange/40">
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

