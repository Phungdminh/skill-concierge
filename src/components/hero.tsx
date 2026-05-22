import { Sparkles } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative isolate flex flex-col">
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center px-6 pb-12 pt-32 text-center">
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
      </div>
    </section>
  );
}
