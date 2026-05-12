'use client';

import { motion } from 'motion/react';

const CHANNELS = [
  {
    brand: 'zalo' as const,
    label: 'Zalo',
    value: '0973309676',
    hint: 'Phản hồi trong giờ hành chính',
    href: 'https://zalo.me/0973309676',
  },
  {
    brand: 'telegram' as const,
    label: 'Telegram',
    value: '@ducminh299',
    hint: 'Cho khách quốc tế',
    href: 'https://t.me/ducminh299',
  },
  {
    brand: 'gmail' as const,
    label: 'Gmail',
    value: 'Phungducminh299@gmail.com',
    hint: 'Brief dài, file đính kèm',
    href: 'mailto:Phungducminh299@gmail.com',
  },
];

export function Contact() {
  return (
    <section id="contact" className="relative mx-auto w-full max-w-6xl px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-[#1a0d10] via-[#0d0d10] to-[#0d0d10] p-10 md:p-14"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full"
          style={{ background: 'radial-gradient(closest-side, rgba(234,56,76,0.35), transparent 70%)' }}
        />

        <div className="relative grid grid-cols-1 gap-10 md:grid-cols-12">
          <div className="md:col-span-6">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Liên hệ</p>
            <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight md:text-5xl">
              Có task đang ngốn thời gian của bạn?
            </h2>
            <p className="mt-4 max-w-md text-foreground/65">
              Kể qua tin nhắn 2–3 dòng cũng đủ. Nếu hợp, mình hẹn call 10 phút trong tuần để chốt scope + báo giá. Không cam kết mua, không spam follow-up.
            </p>
          </div>

          <ul className="space-y-3 md:col-span-6">
            {CHANNELS.map((c) => {
              return (
                <li key={c.label}>
                  <a
                    href={c.href}
                    target="_blank"
                    rel="noreferrer"
                    className="featured-cta group flex items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-4"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-foreground/90">{c.label}</span>
                        <span className="text-[11px] text-muted-foreground">{c.hint}</span>
                      </div>
                      <div className="mt-0.5 truncate text-sm text-foreground/60">{c.value}</div>
                    </div>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </motion.div>

    </section>
  );
}
