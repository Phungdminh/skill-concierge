import Link from 'next/link';
import { ArrowUpRight, Play } from 'lucide-react';
import {
  KIND_META,
  categoryLabelFor,
  extractYouTubeId,
  formatPriceVnd,
  productDetailHref,
  visibleProductVersions,
  type Product,
} from '@/lib/product-types';

interface ProductCardProps {
  product: Product;
  /** Hide the kind chip (use on listing pages that already filter by kind) */
  hideKind?: boolean;
}

export function ProductCard({ product, hideKind = false }: ProductCardProps) {
  const meta = KIND_META[product.kind];
  const KindIcon = meta.icon;
  const videoId = extractYouTubeId(product.youtube_url);
  const cover =
    product.thumbnail_url ??
    product.gallery[0] ??
    (videoId ? `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg` : null);
  const categoryLabels = product.categories.map((category) => categoryLabelFor(product.kind, category));
  const visibleCategoryLabels = categoryLabels.slice(0, 2);
  const hiddenCategoryCount = Math.max(categoryLabels.length - visibleCategoryLabels.length, 0);
  const visibleVersions = product.kind === 'tool' ? visibleProductVersions(product) : [];

  return (
    <Link
      href={productDetailHref(product)}
      className="subtle-card group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/5 bg-[#0d0d10]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 rounded-3xl bg-gradient-to-br from-brand-orange/0 via-brand-red/0 to-brand-amber/0 transition duration-300 group-hover:from-brand-orange/18 group-hover:via-brand-red/8 group-hover:to-brand-amber/10"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 rounded-3xl ring-0 ring-brand-orange/0 transition duration-300 group-hover:ring-2 group-hover:ring-brand-orange/60"
      />

      <div className="relative aspect-video w-full overflow-hidden bg-[#0a0a0b]">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt={product.title}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-xs uppercase tracking-widest text-muted-foreground">
            {meta.shortLabel}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

        {!hideKind && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-[10.5px] font-medium uppercase tracking-widest text-white backdrop-blur">
            <KindIcon className="h-3 w-3" strokeWidth={2} />
            {meta.shortLabel}
          </span>
        )}

        {videoId && (
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">
            <Play className="h-3 w-3 fill-current" strokeWidth={0} /> Demo
          </span>
        )}

        {product.featured && (
          <span className="bg-brand-gradient absolute right-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-black">
            Featured
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        {visibleCategoryLabels.length > 0 && (
          <span className="mb-2 text-[10.5px] uppercase tracking-widest text-muted-foreground">
            {visibleCategoryLabels.join(' · ')}
            {hiddenCategoryCount > 0 ? ` · +${hiddenCategoryCount}` : ''}
          </span>
        )}
        <h3 className="text-balance text-lg font-semibold tracking-tight transition duration-300 group-hover:text-brand-orange">
          {product.title}
        </h3>
        {product.tagline && (
          <p className="mt-2 line-clamp-2 text-sm text-foreground/65 transition duration-300 group-hover:text-foreground/85">{product.tagline}</p>
        )}

        {(product.tags.length > 0 || visibleVersions.length > 1) && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {visibleVersions.length > 1 && (
              <span className="rounded-full bg-brand-orange/10 px-2 py-0.5 text-[11px] text-brand-orange ring-1 ring-brand-orange/25">
                {visibleVersions.length} phiên bản
              </span>
            )}
            {product.tags.slice(0, 4).map((s) => (
              <span
                key={s}
                className="rounded-full bg-white/[0.04] px-2 py-0.5 text-[11px] text-foreground/65 ring-1 ring-white/8"
              >
                {s}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-end justify-between pt-5">
          <div>
            <div className="text-[10.5px] uppercase tracking-widest text-muted-foreground">
              {product.duration_label ?? 'Giá'}
            </div>
            <div className="mt-0.5 text-base font-semibold tabular-nums text-foreground/95">
              {formatPriceVnd(product.price_vnd, product.pricing_mode, product.is_free)}
            </div>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1.5 text-xs text-foreground/65 transition duration-300 group-hover:border-brand-orange/50 group-hover:bg-brand-orange/10 group-hover:text-brand-orange">
            Xem chi tiết
            <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
