'use client';

import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { FaqItem } from '@/lib/faq-data';

export function Faq({
  items,
  id,
  eyebrow = 'FAQ',
  title = 'Câu hỏi hay gặp',
  intro,
}: {
  items: FaqItem[];
  id?: string;
  eyebrow?: string;
  title?: string;
  intro?: string;
}) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id={id} className="relative mx-auto w-full max-w-3xl px-6 py-24">
      <div className="mb-10 text-center">
        <p className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">{eyebrow}</p>
        <h2 className="text-balance text-3xl font-semibold tracking-tight md:text-5xl">{title}</h2>
        {intro && <p className="mx-auto mt-4 max-w-xl text-foreground/60">{intro}</p>}
      </div>

      <ul className="divide-y divide-white/5 rounded-3xl border border-white/5 bg-[#0d0d10]">
        {items.map((item, i) => {
          const isOpen = open === i;
          return (
            <li key={item.q}>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="faq-row flex w-full items-start justify-between gap-4 px-6 py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange/40"
              >
                <span className="text-base font-medium leading-snug text-foreground/95 md:text-lg">
                  {item.q}
                </span>
                <span className="faq-icon mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/[0.04] text-foreground/70 ring-1 ring-white/10 transition duration-200">
                  {isOpen ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                </span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.21, 0.47, 0.32, 0.98] }}
                    className="overflow-hidden"
                  >
                    <p className="px-6 pb-6 pr-14 text-[15px] leading-relaxed text-foreground/70">
                      {item.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
