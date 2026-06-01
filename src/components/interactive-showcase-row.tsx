'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Eye, ExternalLink, TrendingUp } from 'lucide-react';
import { YouTubeEmbed } from '@/components/youtube-embed';
import { ProductImage } from '@/components/product-image';
import { productPreviewImage } from '@/lib/product-images';
import {
  extractYouTubeId,
  productDetailHref,
  type Product,
} from '@/lib/product-types';
import type { ProductRankItem } from '@/components/landing-showcase';

interface Props {
  heroProduct: Product | null;
  rankingItems: ProductRankItem[];
  rankingTitle: string;
  eyebrow: string;
  emptyTitle: string;
  emptyBody: string;
}

export function InteractiveShowcaseRow({
  heroProduct,
  rankingItems,
  rankingTitle,
  eyebrow,
  emptyTitle,
  emptyBody,
}: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected: ProductRankItem | Product | null =
    selectedId
      ? rankingItems.find((i) => i.id === selectedId) ?? null
      : heroProduct;

  return (
    <>
      {/* Hero preview area */}
      <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card lg:row-span-2">
        {!selected ? (
          <div className="grid h-full min-h-[280px] place-items-center px-8 py-16 text-center">
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
        ) : (
          <>
            {extractYouTubeId(selected.youtube_url) && selected.youtube_url ? (
              <YouTubeEmbed
                key={selected.id}
                url={selected.youtube_url}
                title={selected.title}
                bare
                fill
                className="aspect-video lg:aspect-auto lg:flex-[7]"
              />
            ) : (
              <Link
                href={productDetailHref(selected)}
                className="group relative block aspect-video w-full overflow-hidden lg:aspect-auto lg:flex-[7]"
                aria-label={selected.title}
              >
                <ProductImage
                  src={productPreviewImage(selected)}
                  alt={selected.title}
                  kind={selected.kind}
                  className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                  fallbackClassName="absolute inset-0 transition duration-500 group-hover:scale-[1.04]"
                />
              </Link>
            )}
            <div className="flex flex-col gap-4 p-6 md:p-8 lg:flex-[3] lg:justify-between">
              <div>
                <p className="text-[10.5px] uppercase tracking-widest text-muted-foreground">
                  {selectedId ? 'Đang xem' : eyebrow}
                </p>
                <h3 className="mt-2 line-clamp-2 text-2xl font-semibold tracking-tight md:text-3xl">
                  {selected.title}
                </h3>
                {selected.tagline && (
                  <p className="mt-2 line-clamp-2 max-w-2xl text-sm text-foreground/65 md:text-base">
                    {selected.tagline}
                  </p>
                )}
              </div>
              <Link
                href={productDetailHref(selected)}
                className="group inline-flex w-fit items-center gap-1.5 rounded-full border border-brand-orange/40 bg-brand-orange/10 px-4 py-2 text-sm font-medium text-brand-orange transition hover:border-brand-orange hover:bg-brand-orange hover:text-white"
              >
                Xem chi tiết
                <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>
          </>
        )}
      </div>

      {/* Ranking card */}
      <div className="relative flex h-full min-h-[280px] flex-col overflow-hidden rounded-3xl border border-border bg-card p-5">
        <div className="mb-3 flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-orange/15 text-brand-orange ring-1 ring-brand-orange/25">
            <TrendingUp className="h-4 w-4" strokeWidth={2} />
          </span>
          <div>
            <p className="text-[10.5px] uppercase tracking-widest text-muted-foreground">
              Top xem nhiều
            </p>
            <h3 className="text-base font-semibold tracking-tight md:text-lg">
              {rankingTitle}
            </h3>
          </div>
        </div>

        {rankingItems.length === 0 ? (
          <div className="grid flex-1 place-items-center px-4 text-center">
            <p className="text-sm text-foreground/55">
              Chưa có dữ liệu xếp hạng.
            </p>
          </div>
        ) : (
          <ol className="flex flex-1 flex-col gap-0.5">
            {rankingItems.map((item, index) => {
              const isActive = selected?.id === item.id;
              return (
                <li key={item.id} className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setSelectedId(item.id)}
                    className={`group flex flex-1 items-center gap-3 rounded-xl px-2 py-2.5 transition hover:bg-muted ${
                      isActive
                        ? 'bg-brand-orange/10 ring-1 ring-brand-orange/25'
                        : ''
                    }`}
                  >
                    <span
                      className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg text-xs font-semibold tabular-nums ring-1 transition ${
                        isActive
                          ? 'bg-brand-orange/20 text-brand-orange ring-brand-orange/30'
                          : 'bg-muted text-foreground/65 ring-[var(--ring-subtle)] group-hover:bg-brand-orange/20 group-hover:text-brand-orange group-hover:ring-brand-orange/30'
                      }`}
                    >
                      {index + 1}
                    </span>
                    <span
                      className={`line-clamp-1 flex-1 text-left text-sm transition ${
                        isActive
                          ? 'text-brand-orange'
                          : 'text-foreground/85 group-hover:text-brand-orange'
                      }`}
                    >
                      {item.title}
                    </span>
                    <span className="inline-flex shrink-0 items-center gap-1 text-xs tabular-nums text-foreground/45">
                      <Eye className="h-3.5 w-3.5" strokeWidth={1.8} />
                      {item.view_count.toLocaleString('vi-VN')}
                    </span>
                  </button>
                  <Link
                    href={productDetailHref(item)}
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-foreground/30 transition hover:bg-muted hover:text-brand-orange"
                    title="Mở trang chi tiết"
                  >
                    <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.8} />
                  </Link>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </>
  );
}
