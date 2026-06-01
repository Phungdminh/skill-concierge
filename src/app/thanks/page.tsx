import { Footer } from '@/components/footer';
import Link from 'next/link';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Đã nhận tin — SkillForge VN',
  description: 'Cảm ơn bạn đã liên hệ. Mình sẽ rep trong 24h.',
};

const WHAT_NEXT = [
  {
    when: 'Trong 24h tới',
    body: 'Mình đọc tin nhắn của bạn, rep qua Zalo (hoặc email) với thông tin chuyển khoản. Tool có sẵn trong catalog: gửi link Drive ngay sau khi xác nhận thanh toán.',
  },
  {
    when: 'Sau khi nhận file',
    body: 'Bạn copy folder ra Desktop, double-click .exe là chạy. Có file HUONGDAN.txt + video cài 2 phút. Bí ping Zalo mình hướng dẫn trực tiếp.',
  },
  {
    when: '30 ngày bảo hành',
    body: 'Phát hiện lỗi → ping Zalo + screenshot, mình fix và gửi build mới. Không cần lý do, không cần điền form. Sau 30 ngày: lỗi nghiêm trọng vẫn free.',
  },
];

export default function ThanksPage() {
  return (
    <>
      <main className="min-h-svh">
        <section className="relative mx-auto flex w-full max-w-3xl flex-col items-center px-6 pb-16 pt-40 text-center">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/30">
            <CheckCircle2 className="h-8 w-8" strokeWidth={1.75} />
          </span>
          <h1 className="mt-8 text-balance text-4xl font-semibold tracking-tight md:text-5xl">
            Đã nhận tin. Mình sẽ rep trong 24h.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-foreground/65">
            Trong lúc đợi, bạn có thể xem qua các tool đang có sẵn hoặc đọc cách mình làm việc.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/tools"
              className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-5 py-3 text-sm font-medium text-foreground/90 transition hover:bg-white/[0.06]"
            >
              Xem tools
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/process"
              className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-5 py-3 text-sm font-medium text-foreground/90 transition hover:bg-white/[0.06]"
            >
              Cách mua tool
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <section className="mx-auto w-full max-w-3xl px-6 pb-24">
          <h2 className="text-xs uppercase tracking-widest text-muted-foreground">
            Tiếp theo sẽ ra sao
          </h2>
          <ol className="mt-5 space-y-3">
            {WHAT_NEXT.map((s, i) => (
              <li
                key={s.when}
                className="grid grid-cols-12 gap-4 rounded-2xl border border-border bg-card p-5"
              >
                <div className="col-span-12 md:col-span-3">
                  <div className="font-mono text-xs tabular-nums text-muted-foreground">
                    Bước 0{i + 1}
                  </div>
                  <div className="mt-1 font-medium text-foreground/95">{s.when}</div>
                </div>
                <p className="col-span-12 text-sm text-foreground/70 md:col-span-9">{s.body}</p>
              </li>
            ))}
          </ol>
        </section>
      </main>
      <Footer />
    </>
  );
}
