import Link from 'next/link';
import { Play, Sparkles } from 'lucide-react';

const STATS = [
  { label: 'Tổng số tool', value: '50+' },
  { label: 'Khách hài lòng', value: '95%' },
  { label: 'Giao trung bình', value: '3 ngày' },
];

export function Hero() {
  return (
    <section className="relative isolate flex min-h-[100svh] flex-col">
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-6 pb-16 pt-32 text-center">
        <span className="glass mb-8 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs text-foreground/80">
          <span className="bg-brand-gradient grid h-4 w-4 place-items-center rounded-full text-black">
            <Sparkles className="h-2.5 w-2.5" strokeWidth={3} />
          </span>
          Desktop tools — Made in Vietnam
        </span>

        <h1 className="max-w-5xl text-balance text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl lg:text-[88px]">
          Tool desktop{' '}
          <span className="text-brand-gradient">tự chạy task</span>
          <br className="hidden md:block" /> thay bạn thao tác thủ công.
        </h1>

        <p className="mt-6 max-w-2xl text-balance text-lg text-foreground/70 md:text-xl">
          Tool là ứng dụng hỗ trợ tự động thực hiện các tác vụ lặp lại hằng ngày trên website hoặc app web, giúp giảm thao tác thủ công. Mỗi tool đều có video demo để bạn xem cách hoạt động trước khi nhận file qua Zalo hoặc Drive.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="#featured"
            className="hero-secondary-cta group inline-flex items-center gap-2 rounded-2xl border border-white/12 bg-white/[0.02] px-6 py-3.5 text-sm font-medium text-foreground/85 backdrop-blur"
          >
            <Play className="h-4 w-4 fill-current" strokeWidth={0} />
            Xem demo tool nổi bật nhất
          </Link>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-10 gap-y-5">
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
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> File .exe sẵn cài
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-orange" /> Video demo mỗi tool
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-red" /> Sửa bug free 30 ngày
          </span>
        </div>
      </div>
    </section>
  );
}
