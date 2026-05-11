'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { ALL_KINDS, KIND_META } from '@/lib/product-types';

const CARD_COPY: Record<
  (typeof ALL_KINDS)[number],
  { tag: string; pitch: string; bullets: string[] }
> = {
  tool: {
    tag: 'File .exe sẵn sàng',
    pitch: 'Tool desktop đóng gói — automation, scraping, mockup, productivity.',
    bullets: ['Có video demo trên YouTube', 'Chạy local · không cloud', 'Mua 1 lần · bảo hành 30 ngày'],
  },
  setup: {
    tag: 'Cho non-IT',
    pitch: 'Mình setup giúp: MCP, plugin AI, OpenClaw, FX broker API, Claude Code…',
    bullets: ['Remote setup qua TeamViewer/AnyDesk', 'Video screen-record để xem lại', 'Hỗ trợ Zalo 14 ngày'],
  },
  course: {
    tag: 'Học AI cho người mới',
    pitch: 'Khoá học AI cơ bản — cách dùng Claude/ChatGPT đúng để automate công việc.',
    bullets: ['Folder Drive video + PDF', 'Zalo group hỏi đáp', 'Cập nhật khi có version mới'],
  },
  webwork: {
    tag: 'Theo yêu cầu',
    pitch: 'Landing page, portfolio, CV online — vibe-coded gọn nhẹ, deploy nhanh.',
    bullets: ['5-7 ngày từ brief đến deploy', 'Source code đứng tên bạn', '2 vòng revise miễn phí'],
  },
};

export function Categories() {
  return (
    <section id="categories" className="relative mx-auto w-full max-w-6xl px-6 py-24">
      <div className="mb-12 text-center">
        <p className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">
          Sản phẩm
        </p>
        <h2 className="text-balance text-3xl font-semibold tracking-tight md:text-5xl">
          4 thứ mình giúp bạn được
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-foreground/60">
          Từ tool đóng gói sẵn đến setup tận tay, từ học cách dùng AI đến làm web theo yêu cầu.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {ALL_KINDS.map((k, i) => {
          const meta = KIND_META[k];
          const copy = CARD_COPY[k];
          const Icon = meta.icon;
          return (
            <motion.div
              key={k}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ delay: i * 0.06, duration: 0.5 }}
            >
              <Link
                href={meta.route}
                className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/5 bg-[#0d0d10] p-7 transition hover:border-white/15"
              >
                <div
                  aria-hidden
                  className={`pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gradient-to-br ${meta.accent} opacity-25 blur-3xl transition-opacity group-hover:opacity-45`}
                />

                <div className="relative flex items-start gap-5">
                  <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/[0.04] text-brand-orange ring-1 ring-white/10">
                    <Icon className="h-7 w-7" strokeWidth={1.6} />
                  </span>
                  <div className="flex-1">
                    <p className="text-[10.5px] uppercase tracking-widest text-muted-foreground">
                      {copy.tag}
                    </p>
                    <h3 className="mt-1.5 flex items-center gap-1.5 text-2xl font-semibold tracking-tight">
                      {meta.label}
                      <ArrowUpRight className="h-4 w-4 text-foreground/40 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground" />
                    </h3>
                    <p className="mt-2 text-sm text-foreground/65">{copy.pitch}</p>
                  </div>
                </div>

                <ul className="relative mt-6 space-y-2 border-t border-white/5 pt-5 text-sm text-foreground/70">
                  {copy.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2.5">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-orange" />
                      {b}
                    </li>
                  ))}
                </ul>

                <span className="relative mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-foreground/80 transition group-hover:text-foreground">
                  Xem {meta.pluralLabel.toLowerCase()}
                  <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
