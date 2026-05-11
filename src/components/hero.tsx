'use client';

import Link from 'next/link';
import { motion, type Variants } from 'motion/react';
import { Play, Sparkles, Wrench, ArrowRight } from 'lucide-react';
import { AnimatedBackground } from './animated-background';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      duration: 0.6,
      ease: [0.21, 0.47, 0.32, 0.98] as [number, number, number, number],
    },
  }),
};

const STATS = [
  { label: 'Tool đã giao', value: '12+' },
  { label: 'Khách hài lòng', value: '95%' },
  { label: 'Giao trung bình', value: '3 ngày' },
];

export function Hero() {
  return (
    <section className="relative isolate flex min-h-[100svh] flex-col">
      <AnimatedBackground />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-6 pb-16 pt-32 text-center">
        <motion.span
          custom={0}
          initial="hidden"
          animate="show"
          variants={fadeUp}
          className="glass mb-8 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs text-foreground/80"
        >
          <span className="bg-brand-gradient grid h-4 w-4 place-items-center rounded-full text-black">
            <Sparkles className="h-2.5 w-2.5" strokeWidth={3} />
          </span>
          Desktop tools — Made in Vietnam
        </motion.span>

        <motion.h1
          custom={1}
          initial="hidden"
          animate="show"
          variants={fadeUp}
          className="max-w-5xl text-balance text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl lg:text-[88px]"
        >
          Tool desktop{' '}
          <span className="text-brand-gradient">tự build</span>
          <br className="hidden md:block" /> giải quyết task lặp.
        </motion.h1>

        <motion.p
          custom={2}
          initial="hidden"
          animate="show"
          variants={fadeUp}
          className="mt-6 max-w-2xl text-balance text-lg text-foreground/70 md:text-xl"
        >
          Automation · Scraping · Mockup · Productivity. Mình quay video demo cho từng tool — xem ưng thì mua, mình giao file qua Zalo / Drive.
        </motion.p>

        <motion.div
          custom={3}
          initial="hidden"
          animate="show"
          variants={fadeUp}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          <Link
            href="/tools"
            className="bg-brand-gradient glow-red group inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-semibold text-black"
          >
            <Wrench className="h-4 w-4" />
            Xem tất cả tools
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="#featured"
            className="group inline-flex items-center gap-2 rounded-2xl border border-white/12 bg-white/[0.02] px-6 py-3.5 text-sm font-medium text-foreground/85 backdrop-blur transition hover:bg-white/[0.06]"
          >
            <Play className="h-4 w-4 fill-current" strokeWidth={0} />
            Xem demo nổi bật
          </Link>
        </motion.div>

        <motion.div
          custom={4}
          initial="hidden"
          animate="show"
          variants={fadeUp}
          className="mt-12 flex flex-wrap items-center justify-center gap-x-10 gap-y-5"
        >
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl font-semibold tabular-nums text-foreground md:text-3xl">
                {s.value}
              </div>
              <div className="mt-1 text-[11px] uppercase tracking-widest text-muted-foreground">
                {s.label}
              </div>
            </div>
          ))}
        </motion.div>

        <motion.div
          custom={5}
          initial="hidden"
          animate="show"
          variants={fadeUp}
          className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground"
        >
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> File .exe sẵn cài
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-orange" /> Video demo mỗi tool
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-red" /> Sửa bug free 30 ngày
          </span>
        </motion.div>
      </div>
    </section>
  );
}
