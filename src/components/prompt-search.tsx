'use client';

import { useRef, useEffect, useTransition } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Search, X } from 'lucide-react';

interface Props {
  defaultValue?: string;
}

export function PromptSearch({ defaultValue = '' }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  function push(value: string) {
    const trimmed = value.trim();
    const params = new URLSearchParams();
    if (trimmed) params.set('q', trimmed);
    const qs = params.toString();
    startTransition(() => {
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => push(e.target.value), 300);
  }

  function handleClear() {
    if (inputRef.current) inputRef.current.value = '';
    push('');
  }

  return (
    <div className="relative">
      <Search
        className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-foreground/40"
        strokeWidth={1.8}
      />
      <input
        ref={inputRef}
        type="text"
        defaultValue={defaultValue}
        onChange={handleChange}
        placeholder="Tìm prompt theo tên, mô tả…"
        className="w-full rounded-2xl border border-white/10 bg-white/[0.03] py-3 pl-11 pr-10 text-sm text-foreground placeholder:text-foreground/35 transition focus:border-brand-orange/40 focus:outline-none focus:ring-1 focus:ring-brand-orange/25"
      />
      {(defaultValue || isPending) && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-foreground/40 transition hover:text-foreground/70"
          aria-label="Xóa tìm kiếm"
        >
          {isPending ? (
            <span className="block h-4 w-4 animate-spin rounded-full border-2 border-foreground/20 border-t-brand-orange" />
          ) : (
            <X className="h-4 w-4" strokeWidth={2} />
          )}
        </button>
      )}
    </div>
  );
}
