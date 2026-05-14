'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const LINKS = [
  { href: '/tools', label: 'Tools' },
  { href: '/setup', label: 'Setup' },
  { href: '/prompts', label: 'Prompt mẫu' },
  { href: '/web', label: 'Web / Portfolio' },
  { href: '/about', label: 'Giới thiệu' },
];

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const menuButton = menuButtonRef.current;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();
    return () => {
      document.body.style.overflow = '';
      menuButton?.focus();
    };
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!open) return;
      if (e.key === 'Escape') {
        setOpen(false);
        return;
      }
      if (e.key !== 'Tab' || !drawerRef.current) return;

      const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <header className="fixed inset-x-0 top-4 z-50 flex justify-center px-4">
        <nav className="glass flex w-full max-w-3xl items-center gap-1 rounded-full px-2 py-2 pr-2 text-sm">
          <Link
            href="/"
            className="subtle-nav group flex items-center gap-2 rounded-full border border-transparent px-3 py-1.5 font-semibold tracking-tight focus-visible:outline-none"
          >
            <span className="nav-logo-mark bg-brand-gradient grid h-6 w-6 place-items-center rounded-md text-black transition duration-200">
              <Sparkles className="h-3.5 w-3.5" strokeWidth={2.5} />
            </span>
            <span>SkillForge</span>
            <span className="text-[10px] font-medium text-muted-foreground">VN</span>
          </Link>

          <span className="mx-1 hidden h-5 w-px bg-white/10 md:block" />

          <ul className="hidden flex-1 items-center gap-1 md:flex">
            {LINKS.map((l) => {
              const active = pathname.startsWith(l.href);
              return (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className={cn(
                      'subtle-nav whitespace-nowrap rounded-full border border-transparent px-3 py-1.5 focus-visible:outline-none',
                      active
                        ? 'bg-brand-orange/15 text-brand-orange ring-1 ring-brand-orange/30'
                        : 'text-foreground/70',
                    )}
                  >
                    {l.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <Link
            href="/login?returnTo=/contact"
            className="subtle-nav ml-auto hidden rounded-full border border-transparent bg-white px-4 py-1.5 font-medium text-black md:inline-flex"
          >
            Đăng nhập
          </Link>

          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Mở menu"
            aria-expanded={open}
            className="subtle-nav ml-auto inline-flex h-9 w-9 items-center justify-center rounded-full border border-transparent text-foreground/80 focus-visible:outline-none md:hidden"
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
          ref={drawerRef}
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
              ref={closeButtonRef}
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Đóng menu"
              className="subtle-nav grid h-9 w-9 place-items-center rounded-full border border-transparent text-foreground/80 focus-visible:outline-none"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <ul className="mt-6 space-y-1">
            {LINKS.map((l) => (
              <li key={l.label}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="subtle-nav block rounded-xl border border-transparent px-3 py-3 text-base font-medium text-foreground/85"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          <Link
            href="/login?returnTo=/contact"
            onClick={() => setOpen(false)}
            className="subtle-nav mt-4 block w-full rounded-2xl border border-transparent bg-white py-3 text-center font-medium text-black"
          >
            Đăng nhập
          </Link>
        </div>
      </div>
    </>
  );
}
