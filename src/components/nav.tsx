'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const LINKS = [
  { href: '/tools', anchor: '#featured', label: 'Tools' },
  { href: '/setup', anchor: '#categories', label: 'Setup' },
  { href: '/courses', anchor: '#categories', label: 'Khoá học' },
  { href: '/web', anchor: '#categories', label: 'Web / CV' },
];

export function Nav() {
  const pathname = usePathname();
  const onLanding = pathname === '/';
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <header className="fixed inset-x-0 top-4 z-50 flex justify-center px-4">
        <nav className="glass flex w-full max-w-3xl items-center gap-1 rounded-full px-2 py-2 pr-2 text-sm">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-full px-3 py-1.5 font-semibold tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
          >
            <span className="bg-brand-gradient grid h-6 w-6 place-items-center rounded-md text-black">
              <Sparkles className="h-3.5 w-3.5" strokeWidth={2.5} />
            </span>
            <span>SkillForge</span>
            <span className="text-[10px] font-medium text-muted-foreground">VN</span>
          </Link>

          <span className="mx-1 hidden h-5 w-px bg-white/10 md:block" />

          <ul className="hidden flex-1 items-center gap-1 md:flex">
            {LINKS.map((l) => {
              const href = onLanding ? l.anchor : l.href;
              const active = !onLanding && pathname.startsWith(l.href);
              return (
                <li key={l.label}>
                  <Link
                    href={href}
                    className={cn(
                      'rounded-full px-3 py-1.5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30',
                      active
                        ? 'bg-white/[0.06] text-foreground'
                        : 'text-foreground/70 hover:bg-white/5 hover:text-foreground',
                    )}
                  >
                    {l.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <Link
            href={onLanding ? '#contact' : '/contact'}
            className="ml-auto hidden rounded-full bg-white px-4 py-1.5 font-medium text-black transition hover:bg-white/90 md:inline-flex"
          >
            Nhận quote
          </Link>

          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Mở menu"
            aria-expanded={open}
            className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded-full text-foreground/80 hover:bg-white/5 md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
        </nav>
      </header>

      {/* Mobile drawer */}
      <div
        className={cn(
          'fixed inset-0 z-[60] md:hidden',
          open ? 'pointer-events-auto' : 'pointer-events-none',
        )}
        aria-hidden={!open}
      >
        <div
          onClick={() => setOpen(false)}
          className={cn(
            'absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300',
            open ? 'opacity-100' : 'opacity-0',
          )}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className={cn(
            'absolute inset-x-3 top-3 rounded-3xl border border-white/10 bg-[#0d0d10] p-5 shadow-2xl transition-all duration-300',
            open ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0',
          )}
        >
          <div className="flex items-center justify-between">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 font-semibold tracking-tight"
            >
              <span className="bg-brand-gradient grid h-6 w-6 place-items-center rounded-md text-black">
                <Sparkles className="h-3.5 w-3.5" strokeWidth={2.5} />
              </span>
              <span>SkillForge VN</span>
            </Link>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Đóng menu"
              className="grid h-9 w-9 place-items-center rounded-full text-foreground/80 hover:bg-white/5"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <ul className="mt-6 space-y-1">
            {LINKS.map((l) => (
              <li key={l.label}>
                <Link
                  href={onLanding ? l.anchor : l.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-3 py-3 text-base font-medium text-foreground/85 hover:bg-white/5"
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/about"
                onClick={() => setOpen(false)}
                className="block rounded-xl px-3 py-3 text-base font-medium text-foreground/85 hover:bg-white/5"
              >
                Về mình
              </Link>
            </li>
          </ul>

          <Link
            href={onLanding ? '#contact' : '/contact'}
            onClick={() => setOpen(false)}
            className="mt-4 block w-full rounded-2xl bg-white py-3 text-center font-medium text-black"
          >
            Nhận quote miễn phí
          </Link>
        </div>
      </div>
    </>
  );
}
