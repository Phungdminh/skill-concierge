'use client';

import { useState } from 'react';
import { KIND_META, type ProductKind } from '@/lib/product-types';

interface ProductImageProps {
  src: string | null | undefined;
  alt?: string;
  kind: ProductKind;
  className?: string;
  fallbackClassName?: string;
}

export function ProductImage({
  src,
  alt = '',
  kind,
  className,
  fallbackClassName,
}: ProductImageProps) {
  const [failed, setFailed] = useState(false);
  const meta = KIND_META[kind];
  const Icon = meta.icon;

  if (src && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className={className}
        onError={() => setFailed(true)}
      />
    );
  }

  const accessibilityProps = alt
    ? { role: 'img' as const, 'aria-label': alt }
    : { 'aria-hidden': true as const };

  return (
    <div className={fallbackClassName ?? className} {...accessibilityProps}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,122,24,0.32),transparent_34%),radial-gradient(circle_at_75%_70%,rgba(255,196,87,0.18),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))]" />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.10)_0_1px,transparent_1px_18px)] opacity-20" />
      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center gap-2 text-center text-foreground/80">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-black/35 ring-1 ring-white/12">
          <Icon className="h-5 w-5 text-brand-orange" strokeWidth={1.8} />
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-foreground/55">
          {meta.shortLabel}
        </span>
      </div>
    </div>
  );
}
