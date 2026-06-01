import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SectionFrameProps {
  children: ReactNode;
  className?: string;
  /** Variant for visual emphasis: "default" = subtle highlight, "cta" = warmer gradient for action zones */
  variant?: 'default' | 'cta';
}

/**
 * Visible card frame used for landing-page sections (tools / web / prompts /
 * promises / faq). Provides:
 *   - rounded shape with stronger border + inner ring
 *   - subtle vertical gradient (lighter at top, fades down)
 *   - drop shadow for depth (sits above page background)
 *   - decorative top accent line in brand color
 *   - radial glow at top-center for warmth
 *
 * Use `variant="cta"` for the contact/CTA panel — uses a warmer red-tinted
 * gradient and red-tinted shadow.
 */
export function SectionFrame({ children, className, variant = 'default' }: SectionFrameProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-3xl border p-6 md:p-10',
        variant === 'default'
          ? 'border-border bg-gradient-to-b from-surface via-surface/80 to-surface-muted/50 shadow-[var(--shadow-frame)] ring-1 ring-inset ring-[var(--ring-subtle)]'
          : 'border-border bg-gradient-to-br from-brand-red/12 via-surface to-background shadow-[var(--shadow-brand)] ring-1 ring-inset ring-[var(--ring-subtle)]',
        className,
      )}
    >
      {/* Top accent line in brand color */}
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent to-transparent md:inset-x-14',
          variant === 'default' ? 'via-brand-orange/55' : 'via-brand-orange/70',
        )}
      />

      {/* Top radial glow for warmth */}
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-x-0 -top-2 h-40',
          variant === 'default'
            ? 'bg-[radial-gradient(70%_120%_at_50%_0%,rgba(255,122,24,0.12),transparent_70%)]'
            : 'bg-[radial-gradient(70%_120%_at_70%_0%,rgba(234,56,76,0.18),transparent_70%)]',
        )}
      />

      {/* Subtle corner shimmer (top-left) */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-12 -top-12 h-40 w-40 rounded-full bg-[radial-gradient(closest-side,var(--ring-subtle),transparent_70%)]"
      />

      <div className="relative">{children}</div>
    </div>
  );
}
