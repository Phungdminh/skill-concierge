'use client';

import { useState } from 'react';
import { Play } from 'lucide-react';
import { extractYouTubeId } from '@/lib/product-types';

interface YouTubeEmbedProps {
  url: string;
  title?: string;
  className?: string;
}

export function YouTubeEmbed({ url, title = 'Video demo', className }: YouTubeEmbedProps) {
  const [active, setActive] = useState(false);
  const videoId = extractYouTubeId(url);

  if (!videoId) {
    return (
      <div className={`grid aspect-video place-items-center rounded-2xl border border-white/5 bg-[#0d0d10] text-sm text-muted-foreground ${className ?? ''}`}>
        Video chưa khả dụng
      </div>
    );
  }

  const poster = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
  const fallbackPoster = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

  return (
    <div className={`relative aspect-video w-full overflow-hidden rounded-2xl border border-white/5 bg-[#0a0a0b] ${className ?? ''}`}>
      {active ? (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      ) : (
        <button
          type="button"
          onClick={() => setActive(true)}
          aria-label={`Phát video: ${title}`}
          className="group absolute inset-0 h-full w-full cursor-pointer"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={poster}
            alt={title}
            onError={(e) => {
              (e.target as HTMLImageElement).src = fallbackPoster;
            }}
            className="absolute inset-0 h-full w-full object-cover transition group-hover:scale-[1.02]"
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
