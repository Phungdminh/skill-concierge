'use client';

import { Search, Bell, Command } from 'lucide-react';

export function Topbar({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="sticky top-0 z-30 -mx-6 mb-8 flex items-center justify-between border-b border-white/5 bg-[#070708]/85 px-6 py-4 backdrop-blur-xl lg:-mx-10 lg:px-10">
      <div className="flex flex-col leading-tight">
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-3 py-1.5 text-sm text-muted-foreground transition focus-within:border-white/20 md:flex">
          <Search className="h-4 w-4" />
          <input
            placeholder="Tìm skill, user, tool..."
            className="w-56 bg-transparent text-foreground/90 outline-none placeholder:text-muted-foreground"
          />
          <kbd className="ml-2 inline-flex items-center gap-0.5 rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] text-muted-foreground">
            <Command className="h-3 w-3" />K
          </kbd>
        </div>

        <button
          type="button"
          className="relative grid h-9 w-9 place-items-center rounded-full border border-white/8 bg-white/[0.03] text-foreground/70 transition hover:bg-white/[0.06] hover:text-foreground"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-brand-red" />
        </button>
      </div>
    </div>
  );
}
