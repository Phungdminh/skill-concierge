'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import * as LucideIcons from 'lucide-react';
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Folder,
  LibraryBig,
  type LucideIcon,
  type LucideProps,
} from 'lucide-react';
import type { PromptFolderWithCount } from '@/lib/prompt-folder-types';
import { cn } from '@/lib/utils';

interface FolderCarouselProps {
  folders: PromptFolderWithCount[];
  eyebrow?: string;
  title?: string;
}

export function FolderCarousel({
  folders,
  eyebrow = 'Theo chủ đề',
  title = 'Chọn folder phù hợp với công việc của bạn',
}: FolderCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const buffer = 8;
    setCanScrollLeft(el.scrollLeft > buffer);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - buffer);
  }, []);

  useEffect(() => {
    updateScrollState();
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);
    return () => {
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [updateScrollState, folders.length]);

  function scrollByCards(direction: -1 | 1) {
    const el = scrollerRef.current;
    if (!el) return;
    const firstCard = el.querySelector<HTMLElement>('[data-carousel-item]');
    const cardWidth = firstCard ? firstCard.offsetWidth + 12 : 280;
    el.scrollBy({ left: direction * cardWidth * 2, behavior: 'smooth' });
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      scrollByCards(1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      scrollByCards(-1);
    }
  }

  return (
    <div>
      <div className="mb-5 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">{eyebrow}</p>
          <h3 className="text-balance text-2xl font-semibold tracking-tight md:text-3xl">{title}</h3>
        </div>
        <Link
          href="/prompts"
          className="featured-cta group inline-flex min-h-10 items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground/90"
        >
          Tất cả chủ đề
          <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>

      {folders.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card px-6 py-12 text-center">
          <span className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-muted text-brand-orange ring-1 ring-[var(--ring-subtle)]">
            <LibraryBig className="h-5 w-5" strokeWidth={1.6} />
          </span>
          <p className="mt-4 text-sm text-foreground/55">Chủ đề prompt đang được tổng hợp. Quay lại sớm nhé.</p>
        </div>
      ) : (
        <div
          className="relative -mx-6 px-6"
          role="region"
          aria-roledescription="carousel"
          aria-label="Chủ đề prompt"
          tabIndex={0}
          onKeyDown={onKeyDown}
        >
          <div
            ref={scrollerRef}
            className="flex snap-x snap-proximity gap-3 overflow-x-auto pb-4"
            style={{ scrollbarWidth: 'thin' }}
          >
            {folders.map((folder) => (
              <FolderChip key={folder.id} folder={folder} />
            ))}
          </div>

          {/* Edge fade gradients (desktop) */}
          <div
            aria-hidden
            className={cn(
              'pointer-events-none absolute inset-y-0 left-0 hidden w-12 bg-gradient-to-r from-[var(--background)] to-transparent transition md:block',
              canScrollLeft ? 'opacity-100' : 'opacity-0',
            )}
          />
          <div
            aria-hidden
            className={cn(
              'pointer-events-none absolute inset-y-0 right-0 hidden w-12 bg-gradient-to-l from-[var(--background)] to-transparent transition md:block',
              canScrollRight ? 'opacity-100' : 'opacity-0',
            )}
          />

          {/* Prev/Next buttons (desktop only) */}
          <button
            type="button"
            aria-label="Cuộn sang trái"
            onClick={() => scrollByCards(-1)}
            disabled={!canScrollLeft}
            className={cn(
              'absolute left-1 top-1/2 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-border bg-surface-solid text-foreground/85 backdrop-blur transition md:grid',
              canScrollLeft
                ? 'opacity-100 hover:border-brand-orange/30 hover:bg-surface-muted'
                : 'pointer-events-none opacity-0',
            )}
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={1.75} />
          </button>
          <button
            type="button"
            aria-label="Cuộn sang phải"
            onClick={() => scrollByCards(1)}
            disabled={!canScrollRight}
            className={cn(
              'absolute right-1 top-1/2 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-border bg-surface-solid text-foreground/85 backdrop-blur transition md:grid',
              canScrollRight
                ? 'opacity-100 hover:border-brand-orange/30 hover:bg-surface-muted'
                : 'pointer-events-none opacity-0',
            )}
          >
            <ChevronRight className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </div>
      )}
    </div>
  );
}

function FolderIconRenderer({ name, ...iconProps }: { name?: string } & LucideProps) {
  const dict = LucideIcons as unknown as Record<string, LucideIcon>;
  const candidate = name ? dict[name] : undefined;
  const Icon: LucideIcon = typeof candidate === 'function' ? candidate : Folder;
  return <Icon {...iconProps} />;
}

function FolderChip({ folder }: { folder: PromptFolderWithCount }) {
  return (
    <Link
      data-carousel-item
      href={`/prompts/folder/${folder.slug}`}
      className="group relative flex w-[260px] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-border bg-card p-5 transition hover:border-brand-orange/40 sm:w-[280px]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(120%_120%_at_50%_0%,rgba(255,122,24,0.18),transparent_70%)] opacity-60 transition group-hover:opacity-100"
      />

      <div className="relative flex items-start justify-between gap-2">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-muted text-brand-orange ring-1 ring-[var(--ring-subtle)]">
          <FolderIconRenderer name={folder.icon ?? undefined} className="h-5 w-5" strokeWidth={1.75} />
        </span>
        <span className="rounded-full bg-muted px-2.5 py-1 text-[10.5px] uppercase tracking-widest text-foreground/55 ring-1 ring-[var(--ring-subtle)]">
          {folder.prompt_count} prompt
        </span>
      </div>

      <h4 className="relative mt-5 line-clamp-2 text-base font-semibold tracking-tight transition group-hover:text-brand-orange">
        {folder.name}
      </h4>
      {folder.description && (
        <p className="relative mt-1.5 line-clamp-2 text-xs text-foreground/55">{folder.description}</p>
      )}

      <span className="relative mt-auto pt-4 text-[10.5px] uppercase tracking-widest text-foreground/40 transition group-hover:text-brand-orange/80">
        Xem folder →
      </span>
    </Link>
  );
}
