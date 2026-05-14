import { Nav } from '@/components/nav';
import { Footer } from '@/components/footer';
import { PageHeader } from '@/components/page-header';
import { Faq } from '@/components/faq';
import { FAQ_GENERAL } from '@/lib/faq-data';
import {
  Bot,
  BriefcaseBusiness,
  Clock,
  FileText,
  Globe,
  MousePointerClick,
  PackageCheck,
  Settings2,
  ShieldCheck,
  Sparkles,
  Video,
  Wrench,
} from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Giới thiệu — SkillForge VN',
  description:
    'Tại sao SkillForge VN ra đời — tool tự động hoá, setup AI, website portfolio đẹp cho người tìm việc, và kho prompt thực chiến.',
};

const STATS = [
  { label: 'Tool đã ship', value: '12+' },
  { label: 'Khách quay lại', value: '78%' },
  { label: 'Setup thành công', value: '100%' },
  { label: 'Bảo hành tool', value: '30d' },
];

const OFFERINGS = [
  {
    icon: Bot,
    tag: 'Tool desktop',
    href: '/tools',
    title: 'Tự động hoá task lặp',
    body: 'File .exe đóng gói sẵn — double-click là chạy. Không cần cài Python, không cần biết code. Mỗi tool giải quyết một task cụ thể đang ngốn >3 giờ/tuần của bạn trên website hoặc app web.',
    cta: 'Xem tool',
  },
  {
    icon: Settings2,
    tag: 'Setup dịch vụ',
    href: '/setup',
    title: 'Setup AI cho non-IT',
    body: 'Mình setup tận tay các công cụ AI như MCP, Claude Code, OpenClaw, FX broker API — qua remote màn hình. Bạn chỉ cần có máy tính, mình lo toàn bộ kỹ thuật và để lại video hướng dẫn.',
    cta: 'Xem setup',
  },
  {
    icon: Globe,
    tag: 'Web / Portfolio',
    href: '/web',
    title: 'Website portfolio đẹp cho người tìm việc',
    body: 'Landing page cá nhân hoặc portfolio đẹp, hiệu ứng mượt — kết hợp cùng CV giúp bạn nổi bật khi apply việc. Giao trong 5–7 ngày, source code đứng tên bạn, 2 vòng revise miễn phí.',
    cta: 'Xem portfolio',
  },
  {
    icon: FileText,
    tag: 'Prompt mẫu',
    href: '/prompts',
    title: 'Kho prompt thực chiến',
    body: 'Tập hợp các prompt mẫu đã được kiểm chứng cho công việc, học tập, kinh doanh và sáng tạo nội dung. Copy là dùng được ngay — không cần mày mò thử sai hàng giờ với ChatGPT hay Claude.',
    cta: 'Xem prompt',
  },
];

const BENEFITS = [
  {
    icon: Clock,
    title: 'Lấy lại thời gian',
    body: 'Những tác vụ lặp mỗi ngày tốn hàng giờ mà không tạo ra giá trị. Tool ở đây làm thay bạn, để bạn tập trung vào việc thật sự quan trọng.',
  },
  {
    icon: MousePointerClick,
    title: 'Không cần biết code',
    body: 'Bạn nhận file .exe, double-click là chạy. Không cài Python, không mở terminal. Giao diện GUI đơn giản, dùng ngay từ phút đầu.',
  },
  {
    icon: BriefcaseBusiness,
    title: 'Portfolio giúp bạn nổi bật khi tìm việc',
    body: 'Website cá nhân hiệu ứng đẹp kết hợp CV tạo ấn tượng mạnh với nhà tuyển dụng. Bạn có link gửi kèm hồ sơ, thay vì chỉ một file PDF.',
  },
  {
    icon: Sparkles,
    title: 'Dùng AI đúng cách từ ngày đầu',
    body: 'Prompt mẫu thực chiến và setup AI tận tay giúp bạn khai thác ChatGPT, Claude đúng cách — không mất thời gian thử sai.',
  },
  {
    icon: Video,
    title: 'Xem demo thật trước khi mua',
    body: 'Mỗi tool đều có video YouTube quay thẳng màn hình. Bạn thấy chính xác tool làm gì, output là gì — trước khi quyết định.',
  },
  {
    icon: PackageCheck,
    title: 'Mua một lần, dùng mãi',
    body: 'Không subscription, không lock-in. Bạn trả một lần, nhận về máy, dùng bao lâu tuỳ ý. Data nằm yên trên máy bạn.',
  },
  {
    icon: Wrench,
    title: 'Sửa bug miễn phí 30 ngày',
    body: 'Nếu tool gặp lỗi trong 30 ngày sau khi nhận, nhắn Zalo — mình fix và gửi build mới. Không cần lý do.',
  },
  {
    icon: ShieldCheck,
    title: 'Hỗ trợ tận tay qua Zalo',
    body: 'Không chatbot, không ticket queue. Bạn nhắn Zalo trực tiếp — mình reply thủ công trong giờ hành chính.',
  },
];

const FIT = [
  'Bạn đang tốn >3 giờ/tuần làm task lặp lại trên máy tính',
  'Bạn đang tìm việc và muốn portfolio đẹp kết hợp cùng CV',
  'Bạn muốn setup AI (MCP, Claude Code…) nhưng không rành kỹ thuật',
  'Bạn muốn dùng ChatGPT/Claude hiệu quả hơn với prompt đúng',
  'Bạn ngại subscription SaaS đắt và không muốn lock-in',
];

const NOT_FIT = [
  'Bạn cần SaaS multi-user có dashboard cloud — mình build desktop',
  'Bạn dùng Mac/Linux native (Wine/VM được, native thì chưa)',
  'Bạn muốn enterprise contract + SLA 99.99% — mình là solo shop',
  'Bạn cần tool can thiệp vào phần mềm local/nội bộ công ty',
];

export default function AboutPage() {
  return (
    <>
      <Nav />
      <main className="min-h-svh">
        <PageHeader
          eyebrow="Giới thiệu"
          title="Tại sao mình build website này?"
          intro="Mỗi ngày có hàng triệu người đang làm đi làm lại cùng một thao tác — copy-paste, điền form, gom data — và không biết rằng việc đó có thể tự động hoá. Người tìm việc thiếu một portfolio đẹp để gửi kèm CV. Người mới dùng AI mất hàng giờ thử sai prompt. SkillForge VN ra đời để giải quyết cả ba."
          crumbs={[{ label: 'Trang chủ', href: '/' }, { label: 'Giới thiệu' }]}
        />

        {/* Stats */}
        <section className="mx-auto w-full max-w-6xl px-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="rounded-2xl border border-white/5 bg-[#0d0d10] p-5">
                <div className="text-3xl font-semibold tabular-nums text-foreground">{s.value}</div>
                <div className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Story */}
        <section className="mx-auto w-full max-w-6xl px-6 py-20">
          <div className="grid gap-10 md:grid-cols-12 md:gap-16">
            <div className="md:col-span-7">
              <h2 className="text-balance text-2xl font-semibold tracking-tight md:text-3xl">
                Câu chuyện đằng sau
              </h2>
              <div className="mt-6 space-y-5 text-foreground/75">
                <p>
                  Mình bắt đầu từ việc build tool cho chính mình — những task lặp lại mỗi ngày đang ngốn mất <strong className="text-foreground">hàng giờ</strong> mà không tạo ra giá trị gì. Sau khi tự động hoá xong, mình nhận ra đây không phải vấn đề riêng của mình — rất nhiều người đang làm đúng những việc đó mỗi ngày và không biết có cách khác.
                </p>
                <p>
                  Nhưng đó mới chỉ là một phần. Mình cũng thấy rất nhiều bạn đang tìm việc chỉ có một file CV PDF — trong khi một <strong className="text-foreground">website portfolio đẹp</strong> kết hợp cùng CV có thể tạo ấn tượng hoàn toàn khác với nhà tuyển dụng. Và ngày càng nhiều người muốn dùng AI nhưng không biết bắt đầu từ đâu, mất hàng giờ thử sai <strong className="text-foreground">prompt</strong> mà không ra kết quả.
                </p>
                <p>
                  SkillForge VN gom cả bốn thứ đó lại: <strong className="text-foreground">tool tự động hoá</strong>, <strong className="text-foreground">setup AI tận tay</strong>, <strong className="text-foreground">website portfolio</strong> và <strong className="text-foreground">kho prompt thực chiến</strong>. Không có middleman, không agency markup — bạn làm việc trực tiếp với người build.
                </p>
              </div>
            </div>

            <aside className="md:col-span-5">
              <div className="rounded-3xl border border-white/5 bg-gradient-to-br from-[#1a0d10] via-[#0d0d10] to-[#0d0d10] p-7">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  Website này dành cho bạn nếu
                </p>
                <ul className="mt-5 space-y-4">
                  <li className="flex gap-3 text-sm text-foreground/80">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-orange" />
                    Bạn tốn &gt;3 giờ/tuần làm một task lặp lại
                  </li>
                  <li className="flex gap-3 text-sm text-foreground/80">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-orange" />
                    Bạn đang tìm việc và muốn portfolio đẹp kèm CV
                  </li>
                  <li className="flex gap-3 text-sm text-foreground/80">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-orange" />
                    Bạn muốn setup AI nhưng không rành kỹ thuật
                  </li>
                  <li className="flex gap-3 text-sm text-foreground/80">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-orange" />
                    Bạn muốn dùng AI hiệu quả hơn với prompt đúng
                  </li>
                </ul>
                <Link
                  href="/contact"
                  className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-white px-4 py-3 text-sm font-medium text-black transition hover:bg-white/90"
                >
                  Liên hệ tư vấn miễn phí
                </Link>
              </div>
            </aside>
          </div>
        </section>

        {/* 4 offerings */}
        <section className="mx-auto w-full max-w-6xl px-6 pb-8">
          <div className="mb-10 text-center">
            <p className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">Dịch vụ</p>
            <h2 className="text-balance text-2xl font-semibold tracking-tight md:text-3xl">
              4 thứ mình có thể giúp bạn
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {OFFERINGS.map((o) => {
              const Icon = o.icon;
              return (
                <div key={o.tag} className="flex flex-col rounded-3xl border border-white/5 bg-[#0d0d10] p-7">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/[0.04] text-brand-orange ring-1 ring-white/10">
                      <Icon className="h-5 w-5" strokeWidth={1.75} />
                    </span>
                    <span className="text-[10.5px] uppercase tracking-widest text-muted-foreground">{o.tag}</span>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold tracking-tight text-foreground/95">{o.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-foreground/65">{o.body}</p>
                  <Link
                    href={o.href}
                    className="mt-5 inline-flex w-fit items-center gap-1.5 rounded-full border border-white/10 px-4 py-1.5 text-sm font-medium text-foreground/80 transition hover:border-brand-orange/40 hover:bg-brand-orange/10 hover:text-brand-orange"
                  >
                    {o.cta} →
                  </Link>
                </div>
              );
            })}
          </div>
        </section>

        {/* Benefits grid */}
        <section className="mx-auto w-full max-w-6xl px-6 py-16">
          <div className="mb-10 text-center">
            <p className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">Lợi ích</p>
            <h2 className="text-balance text-2xl font-semibold tracking-tight md:text-3xl">
              Website này giúp ích gì cho bạn?
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map((b) => {
              const Icon = b.icon;
              return (
                <div key={b.title} className="rounded-2xl border border-white/5 bg-[#0d0d10] p-6">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/[0.04] text-brand-orange ring-1 ring-white/10">
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                  <h3 className="mt-4 text-sm font-semibold tracking-tight text-foreground/95">{b.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/60">{b.body}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Fit / Not fit */}
        <section className="mx-auto w-full max-w-6xl px-6 pb-16">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-emerald-500/15 bg-emerald-500/[0.03] p-7">
              <h3 className="text-xs uppercase tracking-widest text-emerald-300/90">Phù hợp nếu</h3>
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
              <h3 className="text-xs uppercase tracking-widest text-muted-foreground">Không phù hợp nếu</h3>
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
