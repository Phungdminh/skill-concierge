'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Sparkles,
  Package,
  Mail,
  ArrowLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const items = [
  { href: '/admin', label: 'Tổng quan', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Sản phẩm', icon: Package },
  { href: '/admin/inquiries', label: 'Inquiries', icon: Mail },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-svh w-64 flex-col border-r border-white/5 bg-[#070708] p-4 lg:flex">
      <Link href="/" className="mb-8 flex items-center gap-2 px-2 py-1">
        <span className="bg-brand-gradient grid h-7 w-7 place-items-center rounded-md text-black">
          <Sparkles className="h-4 w-4" strokeWidth={2.5} />
        </span>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold tracking-tight">SkillForge</span>
          <span className="text-[10px] text-muted-foreground">Admin Console</span>
        </div>
      </Link>

      <nav className="flex flex-col gap-0.5">
        {items.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition',
                active
                  ? 'bg-white/[0.06] text-foreground'
                  : 'text-foreground/60 hover:bg-white/[0.03] hover:text-foreground/90',
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r bg-brand-gradient" />
              )}
              <Icon className="h-4 w-4" strokeWidth={1.75} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-1">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground/60 transition hover:bg-white/[0.03] hover:text-foreground/90"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
          Về trang chủ
        </Link>
        <form action="/auth/signout" method="post" className="px-3 py-2">
          <button type="submit" className="text-sm text-foreground/60 transition hover:text-foreground">
            Đăng xuất
          </button>
        </form>
      </div>
    </aside>
  );
}
