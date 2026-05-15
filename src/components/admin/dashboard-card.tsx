import Link from 'next/link';
import { LayoutDashboard } from 'lucide-react';

export function DashboardCard() {
  return (
    <Link
      href="/admin"
      className="group flex items-center justify-between rounded-2xl border border-white/5 bg-[#0d0d10] p-4 transition hover:border-white/15 hover:bg-white/[0.02]"
    >
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/[0.04] text-brand-orange ring-1 ring-white/10">
          <LayoutDashboard className="h-4 w-4" strokeWidth={1.75} />
        </span>
        <div>
          <div className="text-sm font-semibold tracking-tight">Trở về dashboard</div>
          <div className="mt-0.5 text-xs text-foreground/55">Quay lại trang tổng quan admin</div>
        </div>
      </div>
      <span className="text-lg text-foreground/35 transition group-hover:translate-x-0.5 group-hover:text-foreground/70">→</span>
    </Link>
  );
}
