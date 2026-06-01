'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';

type Theme = 'light' | 'dark';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

const STORAGE_KEY = 'theme';
let themeTransitionRun = 0;

function isTheme(value: string | null): value is Theme {
  return value === 'light' || value === 'dark';
}

function getSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getCurrentTheme(): Theme {
  if (typeof document === 'undefined') return 'dark';
  const documentTheme = document.documentElement.dataset.theme ?? null;
  if (isTheme(documentTheme)) return documentTheme;
  return getSystemTheme();
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  window.dispatchEvent(new CustomEvent<Theme>('themechange', { detail: theme }));
}

function withoutThemeTransitions(apply: () => void) {
  const root = document.documentElement;
  const run = ++themeTransitionRun;
  window.dispatchEvent(new Event('themechange:start'));
  root.classList.add('theme-changing');
  apply();

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      if (run !== themeTransitionRun) return;
      root.classList.remove('theme-changing');
      window.dispatchEvent(new Event('themechange:end'));
    });
  });
}

export function ThemeToggle({ className, showLabel = false }: ThemeToggleProps) {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    const currentTheme = getCurrentTheme();
    applyTheme(currentTheme);
    window.requestAnimationFrame(() => setTheme(currentTheme));

    function onThemeChange(event: Event) {
      const nextTheme = (event as CustomEvent<Theme>).detail;
      if (isTheme(nextTheme)) setTheme(nextTheme);
    }

    window.addEventListener('themechange', onThemeChange);
    return () => window.removeEventListener('themechange', onThemeChange);
  }, []);

  const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark';
  const label = theme === 'dark' ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối';
  const Icon = theme === 'dark' ? Sun : Moon;

  function toggleTheme() {
    const next = nextTheme;
    withoutThemeTransitions(() => applyTheme(next));
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Theme still applies for the current page when storage is unavailable.
    }
    setTheme(next);
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className={cn(
        'subtle-nav inline-flex h-9 shrink-0 items-center justify-center gap-2 overflow-hidden rounded-full border border-border bg-surface px-3 text-foreground/80 focus-visible:outline-none',
        showLabel ? 'w-full justify-start whitespace-nowrap' : 'w-9 px-0',
        className,
      )}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {showLabel && (
        <span className="text-sm font-medium">
          {theme === 'dark' ? 'Giao diện sáng' : 'Giao diện tối'}
        </span>
      )}
    </button>
  );
}
