import { Nav } from '@/components/nav';
import { Footer } from '@/components/footer';
import { PageHeader } from '@/components/page-header';
import { Faq } from '@/components/faq';
import { FAQ_GENERAL } from '@/lib/faq-data';
import { Code2, Coffee, MapPin, Terminal } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Về mình — SkillForge VN',
  description:
    'Single-creator shop: mình tự build tool desktop Python + Playwright, đóng gói .exe, quay video YouTube, bán trực tiếp. Không nhân viên, không middleman.',
};

const STATS = [
  { label: 'Năm code', value: '8+' },
  { label: 'Tool đã ship', value: '12+' },
  { label: 'Khách quay lại', value: '78%' },
  { label: 'Bảo hành', value: '30d' },
];

const FIT = [
  'Bạn cần tool tự động hoá 1 task lặp tốn >3 giờ/tuần',
  'Bạn không biết code, muốn double-click .exe là chạy',
  'Bạn ngại subscription SaaS đắt + lock-in',
  'Bạn dùng Windows 10/11 và muốn data nằm yên trên máy',
];

const NOT_FIT = [
  'Bạn cần SaaS multi-user, có dashboard cloud — mình build desktop',
  'Bạn dùng Mac/Linux native (Wine/VM được, native thì chưa)',
  'Bạn muốn enterprise contract + SLA 99.99% — mình là solo shop',
  'Bạn cần tool kết nối API trả phí cao (ChatGPT 4o, Claude Max) mà không chịu trả key của bạn',
];

export default function AboutPage() {
  return (
    <>
      <Nav />
      <main className="min-h-svh">
        <PageHeader
          eyebrow="Về mình"
          title="Một người. Build tool. Bán trực tiếp."
          intro="Mình tên Khang, làm developer ~8 năm. SkillForge VN là single-creator shop: mỗi tool trên trang này mình tự lên ý tưởng, build (Python + Playwright + CustomTkinter), đóng gói PyInstaller, quay video YouTube, và bán trực tiếp. Không có nhân viên trung gian, không có agency markup."
          crumbs={[{ label: 'Trang chủ', href: '/' }, { label: 'Về mình' }]}
        />

        <section className="mx-auto w-full max-w-6xl px-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {STATS.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-white/5 bg-[#0d0d10] p-5"
              >
                <div className="text-3xl font-semibold tabular-nums text-foreground">
                  {s.value}
                </div>
                <div className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-6 py-20">
          <div className="grid gap-10 md:grid-cols-12 md:gap-16">
            <div className="md:col-span-7">
              <h2 className="text-balance text-2xl font-semibold tracking-tight md:text-3xl">
                Cách mình build tool
              </h2>
              <div className="mt-6 space-y-5 text-foreground/75">
                <p>
                  Mỗi tool bắt đầu từ <strong className="text-foreground">1 task lặp cụ thể</strong> — mình hoặc bạn bè đang mất thời gian làm thủ công mỗi tuần. Mình prototype trong 1–2 ngày, dùng thử 1 tuần với data thật, fix các edge case rồi mới publish.
                </p>
                <p>
                  Stack chính: <strong className="text-foreground">Python</strong> cho logic, <strong className="text-foreground">Playwright</strong> cho web automation, <strong className="text-foreground">CustomTkinter</strong> cho GUI. Đóng gói bằng <strong className="text-foreground">PyInstaller</strong> → bạn nhận folder gồm file .exe + folder _internal/. Double-click .exe là chạy.
                </p>
                <p>
                  Mỗi tool đều có <strong className="text-foreground">video YouTube quay thẳng màn hình</strong> dùng data thật — bạn thấy chính xác tool làm gì trước khi quyết định mua. Không demo dựng, không slide marketing.
                </p>
                <p>
                  Code mình viết để chạy local, <strong className="text-foreground">không gửi telemetry</strong>, không phone-home. Bạn có thể chạy offline (trừ tool cần Playwright crawl web). Source code mình giữ riêng, nhưng nếu bạn cần audit security trước khi mua — ping mình, mình share repo private cho bạn review.
                </p>
              </div>
            </div>

            <aside className="md:col-span-5">
              <div className="rounded-3xl border border-white/5 bg-gradient-to-br from-[#1a0d10] via-[#0d0d10] to-[#0d0d10] p-7">
                <div className="flex items-center gap-3">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/[0.04] text-2xl ring-1 ring-white/10">
                    👋
                  </span>
                  <div>
                    <div className="text-sm font-medium text-foreground/95">Khang Nguyễn</div>
                    <div className="text-xs text-muted-foreground">Solo · Single-creator shop</div>
                  </div>
                </div>
                <ul className="mt-6 space-y-3 text-sm">
                  <li className="flex items-center gap-3 text-foreground/75">
                    <MapPin className="h-4 w-4 text-brand-orange" /> Hà Nội · Remote toàn VN
                  </li>
                  <li className="flex items-center gap-3 text-foreground/75">
                    <Code2 className="h-4 w-4 text-brand-orange" /> Python · Playwright · CustomTkinter · PyInstaller
                  </li>
                  <li className="flex items-center gap-3 text-foreground/75">
                    <Coffee className="h-4 w-4 text-brand-orange" /> 9h–18h GMT+7, reply Zalo &lt;4h
                  </li>
                  <li className="flex items-center gap-3 text-foreground/75">
                    <Terminal className="h-4 w-4 text-brand-orange" /> Tool chạy Windows 10/11 64-bit
                  </li>
                </ul>
                <Link
                  href="/tools"
                  className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-white px-4 py-3 text-sm font-medium text-black transition hover:bg-white/90"
                >
                  Xem catalog tool
                </Link>
              </div>
            </aside>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-6 py-12">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-emerald-500/15 bg-emerald-500/[0.03] p-7">
              <h3 className="text-xs uppercase tracking-widest text-emerald-300/90">
                Phù hợp nếu
              </h3>
              <ul className="mt-4 space-y-3">
                {FIT.map((f) => (
                  <li key={f} className="flex gap-3 text-sm text-foreground/80">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl border border-white/5 bg-[#0d0d10] p-7">
              <h3 className="text-xs uppercase tracking-widest text-muted-foreground">
                Không phù hợp nếu
              </h3>
              <ul className="mt-4 space-y-3">
                {NOT_FIT.map((f) => (
                  <li key={f} className="flex gap-3 text-sm text-foreground/65">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-white/20" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <Faq items={FAQ_GENERAL} id="faq" />
      </main>
      <Footer />
    </>
  );
}
