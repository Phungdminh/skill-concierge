'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink, Play } from 'lucide-react';
import { extractYouTubeId } from '@/lib/product-types';

interface YouTubeEmbedProps {
  url: string;
  title?: string;
  className?: string;
  bare?: boolean;
  fill?: boolean;
}

export function YouTubeEmbed({ url, title = 'Video demo', className, bare = false, fill = false }: YouTubeEmbedProps) {
  const [active, setActive] = useState(false);
  const [posterFallback, setPosterFallback] = useState(false);
  const videoId = extractYouTubeId(url);
  const chrome = bare ? '' : 'rounded-2xl border border-border';
  const sizing = fill ? '' : 'aspect-video';

  if (!videoId) {
    return (
      <div className={`grid place-items-center bg-card text-sm text-muted-foreground ${sizing} ${chrome} ${className ?? ''}`}>
        Video chưa khả dụng
      </div>
    );
  }

  const poster = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
  const fallbackPoster = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  const embedSrc = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;

  return (
    <div className={`relative w-full overflow-hidden bg-card ${sizing} ${chrome} ${className ?? ''}`}>
      {active ? (
        <>
          <iframe
            src={embedSrc}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
          <Link
            href={watchUrl}
            target="_blank"
            rel="noreferrer"
            className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-black/65 px-3 py-1.5 text-xs text-white backdrop-blur transition hover:bg-black/80"
          >
            Mở trên YouTube
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </>
      ) : (
        <button
          type="button"
          onClick={() => setActive(true)}
          aria-label={`Phát video: ${title}`}
          className="group absolute inset-0 h-full w-full cursor-pointer"
        >
          <Image
            src={posterFallback ? fallbackPoster : poster}
            alt={title}
            fill
            sizes="(min-width: 1024px) 800px, 100vw"
            loading="lazy"
            onError={() => setPosterFallback(true)}
            className="object-cover transition group-hover:scale-[1.02]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/30" />
          <span className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-brand-gradient text-black shadow-[0_8px_32px_rgba(234,56,76,0.45)] transition group-hover:scale-105">
            <Play className="h-7 w-7 translate-x-0.5 fill-current" strokeWidth={0} />
          </span>
        </button>
      )}
    </div>
  );
}
