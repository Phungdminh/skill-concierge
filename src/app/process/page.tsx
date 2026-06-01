import { Footer } from '@/components/footer';
import { PageHeader } from '@/components/page-header';
import { HowItWorks } from '@/components/how-it-works';
import { Promises } from '@/components/promises';
import { Faq } from '@/components/faq';
import { FAQ_GENERAL, FAQ_PRICING } from '@/lib/faq-data';
import { Play, MessageSquare, Wallet, Download, Wrench, Sparkles } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Cách mua tool — SkillForge VN',
  description:
    'Quy trình mua tool: xem video demo, liên hệ form, chuyển khoản, nhận file .exe. Bảo hành 30 ngày, không subscription.',
};

const DETAILS = [
  {
    icon: Play,
    title: 'Xem video demo trên YouTube',
    duration: '5–10 phút',
    body: 'Mỗi tool có 1 video quay thẳng màn hình trên máy mình, chạy với dữ liệu thật. Bạn thấy chính xác: giao diện ra sao, click ở đâu, output xuất ra file gì, tốc độ thế nào. Không demo dựng, không slide marketing.',
  },
  {
    icon: MessageSquare,
    title: 'Liên hệ qua form trên trang tool',
    duration: 'Reply <24h',
    body: 'Mỗi trang tool có nút "Mua / Đặt câu hỏi". Bạn điền tên + Zalo/email + câu hỏi (nếu có). Mình rep trong vòng 24h qua Zalo (hoặc email nếu bạn không dùng Zalo) với thông tin thanh toán + hướng dẫn cài.',
  },
  {
    icon: Wallet,
    title: 'Thanh toán + xác nhận',
    duration: '5 phút',
    body: 'Bạn chuyển khoản (VCB / Techcombank / Momo / ZaloPay) — nội dung CK có mã đơn. Mình xác nhận đã nhận tiền. Hoá đơn VAT có nếu bạn cần — báo trước khi chuyển khoản.',
  },
  {
    icon: Download,
    title: 'Nhận file + chạy ngay',
    duration: '< 30 phút sau CK',
    body: 'Mình gửi link Google Drive folder gồm: file .exe chính, folder _internal/ (do PyInstaller sinh ra — đừng xoá), file HUONGDAN.txt + video cài 2 phút. Bạn copy folder ra Desktop, double-click .exe là chạy. Không cần cài Python, không cần config gì khác.',
  },
  {
    icon: Wrench,
    title: 'Bảo hành 30 ngày',
    duration: 'Trong vòng 30 ngày',
    body: 'Tool chạy lỗi → ping Zalo, gửi screenshot + mô tả ngắn. Mình fix bug rồi gửi build mới qua Drive. Không cần lý do, không cần điền form gì cả. Sau 30 ngày: lỗi nghiêm trọng vẫn fix free; feature mới tính phí — báo giá rõ trước khi làm.',
  },
  {
    icon: Sparkles,
    title: 'Đặt tool riêng theo nhu cầu',
    duration: '3–10 ngày',
    body: 'Nếu trong catalog không có tool đúng nhu cầu: mô tả use case trên các app web như ChatGPT, Google Docs, Excel Online, Google Sheets, Gmail hoặc CRM web → mình quote. Mình không chạy hoặc can thiệp vào phần mềm local/nội bộ của công ty bạn. Build xong → bạn xem demo qua YouTube unlisted → ưng mới chuyển khoản.',
  },
];

export default function ProcessPage() {
  return (
    <>
      <main className="min-h-svh">
        <PageHeader
          eyebrow="Cách mua tool"
          title={`Từ "xem demo" đến "tool chạy trên máy" — thường dưới 24h`}
          intro="Không subscription, không SaaS bắt nâng cấp. Use case phù hợp là thao tác trên app web như ChatGPT, Google Docs, Excel Online, Google Sheets — không can thiệp phần mềm local/nội bộ công ty bạn."
          crumbs={[{ label: 'Trang chủ', href: '/' }, { label: 'Cách mua tool' }]}
        />

        <section className="mx-auto w-full max-w-6xl px-6 py-8">
          <ol className="space-y-4">
            {DETAILS.map((d, i) => {
              const Icon = d.icon;
              return (
                <li
                  key={d.title}
                  className="grid grid-cols-1 gap-5 rounded-3xl border border-border bg-card p-7 md:grid-cols-12"
                >
                  <div className="md:col-span-3">
                    <div className="flex items-center gap-3">
                      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-muted text-brand-orange ring-1 ring-[var(--ring-subtle)]">
                        <Icon className="h-6 w-6" strokeWidth={1.75} />
                      </span>
                      <span className="font-mono text-2xl tabular-nums text-muted-foreground/60">
                        0{i + 1}
                      </span>
                    </div>
                  </div>
                  <div className="md:col-span-9">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h2 className="text-balance text-xl font-semibold tracking-tight md:text-2xl">
                        {d.title}
                      </h2>
                      <span className="text-xs uppercase tracking-widest text-muted-foreground">
                        {d.duration}
                      </span>
                    </div>
                    <p className="mt-3 text-foreground/70">{d.body}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        <HowItWorks />
        <Promises />
        <Faq items={[...FAQ_GENERAL, ...FAQ_PRICING]} />

        <section className="mx-auto w-full max-w-4xl px-6 pb-24 text-center">
          <h2 className="text-balance text-3xl font-semibold tracking-tight md:text-4xl">
            Sẵn sàng xem tool nào hợp?
          </h2>
          <p className="mt-4 text-foreground/65">
            Mỗi tool có video demo + mô tả chi tiết. Không cần đăng ký, không cần email.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/tools"
              className="hero-primary-cta bg-brand-gradient glow-red inline-flex items-center justify-center rounded-2xl px-6 py-3 text-sm font-semibold text-black"
            >
              Xem tất cả tool
            </Link>
            <Link
              href="/contact?custom=1"
              className="featured-cta inline-flex items-center justify-center rounded-2xl border border-border bg-card px-6 py-3 text-sm font-medium text-foreground/85"
            >
              Đặt tool riêng theo yêu cầu
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
