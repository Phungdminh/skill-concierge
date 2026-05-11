import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

type Crumb = { label: string; href?: string };

export function PageHeader({
  eyebrow,
  title,
  intro,
  crumbs,
  align = 'left',
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  crumbs?: Crumb[];
  align?: 'left' | 'center';
}) {
  const isCenter = align === 'center';
  return (
    <header
      className={`relative mx-auto w-full max-w-6xl px-6 pb-10 pt-32 md:pt-40 ${
        isCenter ? 'text-center' : ''
      }`}
    >
      {crumbs && crumbs.length > 0 && (
        <nav
          aria-label="Breadcrumb"
          className={`mb-5 flex flex-wrap items-center gap-2 text-sm text-muted-foreground md:text-base ${
            isCenter ? 'justify-center' : ''
          }`}
        >
          {crumbs.map((c, i) => {
            const isLast = i === crumbs.length - 1;
            return (
              <span key={i} className="inline-flex items-center gap-1.5">
                {c.href && !isLast ? (
                  <Link href={c.href} className="transition hover:text-foreground">
                    {c.label}
                  </Link>
                ) : (
                  <span className={isLast ? 'text-foreground/80' : ''}>{c.label}</span>
                )}
                {!isLast && <ChevronRight className="h-4 w-4 opacity-50" />}
              </span>
            );
          })}
        </nav>
      )}

      {eyebrow && (
        <p className="mb-3 text-sm uppercase tracking-widest text-muted-foreground md:text-base">{eyebrow}</p>
      )}
      <h1 className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
        {title}
      </h1>
      {intro && (
        <p
          className={`mt-5 text-balance text-lg text-foreground/65 md:text-xl ${
            isCenter ? 'mx-auto max-w-2xl' : 'max-w-2xl'
          }`}
        >
          {intro}
        </p>
      )}
    </header>
  );
}
