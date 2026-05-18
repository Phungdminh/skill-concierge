import { Footer } from '@/components/footer';
import { PageHeader } from '@/components/page-header';

export const metadata = {
  title: 'Chính sách bảo mật — SkillForge VN',
  description:
    'Mình thu thập, lưu trữ và sử dụng dữ liệu của bạn như thế nào. Viết bằng tiếng người, không phải tiếng luật.',
};

const SECTIONS = [
  {
    h: '1. Mình thu thập dữ liệu gì',
    p: [
      'Khi bạn liên hệ qua form: tên / Zalo / email + nội dung task bạn mô tả. Mình lưu vào CRM (Notion) chỉ để rep bạn, không bán lại cho ai.',
      'Khi bạn ký hợp đồng: thông tin cần thiết để xuất hoá đơn (tên công ty, MST, địa chỉ). Lưu trong phần mềm kế toán riêng.',
      'Khi mình build skill cho bạn: mình có thể tiếp xúc dữ liệu nội bộ của bạn (Sheet, Drive, database…). Phần này được ràng buộc bằng NDA ký trước.',
    ],
  },
  {
    h: '2. Mình KHÔNG làm gì với dữ liệu',
    p: [
      'Mình không bán email / Zalo của bạn cho bên thứ ba.',
      'Mình không train model AI nào trên dữ liệu nghiệp vụ của bạn.',
      'Mình không lưu credential (API key, mật khẩu) của bạn sau khi project kết thúc — bạn rotate, mình xoá local.',
    ],
  },
  {
    h: '3. Dữ liệu được host ở đâu',
    p: [
      'Mặc định: trên hạ tầng của BẠN (Supabase project, Vercel account, AWS account của bạn). Mình chỉ hỗ trợ cấu hình và bàn giao rõ ràng.',
      'Trường hợp bạn yêu cầu mình host hộ: dùng Vercel (US-East / SG region) + Supabase (Singapore). Tuân theo PDPA.',
      'Backup tự động hàng ngày, retain 30 ngày. Bạn có quyền yêu cầu xoá vĩnh viễn bất cứ lúc nào.',
    ],
  },
  {
    h: '4. Cookie & analytics',
    p: [
      'Website này dùng Vercel Analytics (anonymous, không gắn ID cá nhân) để biết page nào nhiều người xem.',
      'Không có Google Analytics, không có Facebook Pixel trên domain marketing này. Nếu mình build website cho bạn và bạn yêu cầu pixel — mình cấu hình theo yêu cầu.',
    ],
  },
  {
    h: '5. Bạn có quyền gì',
    p: [
      'Yêu cầu mình xoá toàn bộ dữ liệu của bạn — ping Zalo / email, mình xử lý trong 7 ngày.',
      'Yêu cầu export tất cả dữ liệu mình lưu về bạn (data portability) — gửi qua email mã hoá.',
      'Khiếu nại — gửi email Phungducminh299@gmail.com, mình rep trong 48h.',
    ],
  },
];

export default function PrivacyPage() {
  return (
    <>
      <main className="min-h-svh">
        <PageHeader
          eyebrow="Pháp lý"
          title="Chính sách bảo mật"
          intro="Mình viết bằng tiếng người. Phiên bản này áp dụng từ 01/2026, lần cập nhật gần nhất: 05/2026."
          crumbs={[{ label: 'Trang chủ', href: '/' }, { label: 'Bảo mật' }]}
        />

        <article className="mx-auto w-full max-w-2xl space-y-10 px-6 pb-24">
          {SECTIONS.map((s) => (
            <section key={s.h}>
              <h2 className="text-lg font-semibold tracking-tight text-foreground/95">{s.h}</h2>
              <div className="mt-3 space-y-3">
                {s.p.map((para, i) => (
                  <p key={i} className="text-foreground/70">
                    {para}
                  </p>
                ))}
              </div>
            </section>
          ))}

          <section className="rounded-2xl border border-white/5 bg-[#0d0d10] p-6 text-sm text-foreground/65">
            <p>
              <strong className="text-foreground/85">Câu hỏi cụ thể?</strong> Email{' '}
              <a
                className="text-brand-orange hover:underline"
                href="mailto:Phungducminh299@gmail.com"
              >
                Phungducminh299@gmail.com
              </a>
              {' '}— mình trả lời trong 48h, kể cả khi bạn không phải khách hàng.
            </p>
          </section>
        </article>
      </main>
      <Footer />
    </>
  );
}
