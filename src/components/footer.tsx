import Link from 'next/link';
import { Sparkles } from 'lucide-react';

const COLS: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: 'Sản phẩm',
    links: [
      { label: 'Tool desktop', href: '/tools' },
      { label: 'Hướng dẫn setup', href: '/setup' },
      { label: 'Prompt mẫu', href: '/prompts' },
      { label: 'Web / portfolio cá nhân', href: '/web' },
    ],
  },
  {
    heading: 'Tham khảo',
    links: [
      { label: 'Cách mua', href: '/process' },
      { label: 'Về mình', href: '/about' },
      { label: 'Liên hệ', href: '/contact' },
      { label: 'Đặt riêng', href: '/contact' },
    ],
  },
  {
    heading: 'Pháp lý',
    links: [
      { label: 'Chính sách bảo mật', href: '/legal/privacy' },
      { label: 'Điều khoản dịch vụ', href: '/legal/terms' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative mt-12 border-t border-white/5 bg-[#080809]">
      <div className="mx-auto w-full max-w-6xl px-6 py-14">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-12">
          <div className="col-span-2 md:col-span-4">
            <Link href="/" className="inline-flex items-center gap-2 font-semibold tracking-tight">
              <span className="bg-brand-gradient grid h-7 w-7 place-items-center rounded-md text-black">
                <Sparkles className="h-6 w-6 shrink-0" strokeWidth={2.5} />
              </span>
              <span className="text-base">SkillForge</span>
              <span className="text-[10px] font-medium text-muted-foreground">VN</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-foreground/60">
              Tool desktop tự build — Python + Playwright đóng gói .exe. Mỗi tool quay video demo trên YouTube, mua 1 lần, chạy local trên máy bạn.
            </p>
            <p className="mt-6 text-[11px] uppercase tracking-widest text-muted-foreground">
              Made in Hanoi · Single-creator shop
            </p>
          </div>

          {COLS.map((c) => (
            <div key={c.heading} className="md:col-span-2 lg:col-span-2">
              <h3 className="text-[11px] uppercase tracking-widest text-muted-foreground">
                {c.heading}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {c.links.map((l) => (
                  <li key={`${c.heading}-${l.label}`}>
                    <Link
                      href={l.href}
                      className="text-sm text-foreground/75 transition hover:text-foreground"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="col-span-2 md:col-span-2">
            <h3 className="text-[11px] uppercase tracking-widest text-muted-foreground">
              Liên hệ nhanh
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <a
                  href="https://zalo.me/0973309676"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-foreground/75 transition hover:text-foreground"
                >
                  Zalo: 0973309676
                </a>
              </li>
              <li>
                <a
                  href="mailto:Phungducminh299@gmail.com"
                  className="inline-flex items-center gap-2 text-foreground/75 transition hover:text-foreground"
                >
                  Phungducminh299@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="https://t.me/ducminh299"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-foreground/75 transition hover:text-foreground"
                >
                  Telegram @ducminh299
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-white/5 pt-6 text-xs text-muted-foreground md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} SkillForge VN — Desktop tool storefront</p>
          <p className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Đang nhận đơn custom (3–10 ngày)
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
