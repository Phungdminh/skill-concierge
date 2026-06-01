import Link from 'next/link';
import { Footer } from '@/components/footer';
import { Home, ArrowRight } from 'lucide-react';

const LINKS = [
  { href: '/tools', label: 'Catalog tool' },
  { href: '/process', label: 'Cách mua' },
  { href: '/about', label: 'Về mình' },
  { href: '/contact', label: 'Liên hệ' },
];

export default function NotFound() {
  return (
    <>
      <main className="grid min-h-[80svh] place-items-center px-6 pt-32">
        <div className="text-center">
          <p className="bg-brand-gradient mx-auto inline-block bg-clip-text font-mono text-8xl font-bold tabular-nums text-transparent md:text-9xl">
            404
          </p>
          <h1 className="mt-6 text-balance text-3xl font-semibold tracking-tight md:text-4xl">
            Trang này chưa tồn tại (hoặc không tồn tại nữa)
          </h1>
          <p className="mx-auto mt-4 max-w-md text-foreground/60">
            Có thể link bị cũ, hoặc bạn gõ tay nhầm. Ở dưới là vài chỗ bạn có thể quan tâm.
          </p>

          <Link
            href="/"
            className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-foreground px-5 py-3 text-sm font-medium text-background transition hover:bg-foreground/90"
          >
            <Home className="h-4 w-4" /> Về trang chủ
          </Link>

          <ul className="mx-auto mt-10 grid max-w-md grid-cols-2 gap-3">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="group flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground/80 transition hover:bg-surface-muted"
                >
                  {l.label}
                  <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </main>
      <Footer />
    </>
  );
}
