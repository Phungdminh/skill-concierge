import { Footer } from '@/components/footer';
import { PageHeader } from '@/components/page-header';

export const metadata = {
  title: 'Điều khoản dịch vụ — SkillForge VN',
  description:
    'Điều khoản hợp tác giữa bạn và mình. Viết ngắn, dễ hiểu, không gài chữ nhỏ.',
};

const SECTIONS = [
  {
    h: '1. Phạm vi',
    p: [
      'Điều khoản này áp dụng khi bạn liên hệ và/hoặc thuê mình làm dịch vụ qua website skill-concierge (hoặc tên miền thay thế).',
      'Mỗi case có hợp đồng riêng — điều khoản trang này không thay thế hợp đồng cụ thể. Khi có mâu thuẫn, hợp đồng riêng có giá trị cao hơn.',
    ],
  },
  {
    h: '2. Thanh toán',
    p: [
      'Mình KHÔNG yêu cầu đặt cọc. Bạn chỉ trả 100% phí setup SAU khi duyệt demo build trên dữ liệu thật.',
      'Phí vận hành tháng thanh toán đầu mỗi tháng. Trễ 7 ngày → mình tạm pause skill cho đến khi thanh toán. Trễ 30 ngày → kết thúc hợp tác, bạn vẫn giữ source code.',
      'Có xuất hoá đơn VAT 10% nếu cần. MST của mình: 0xxx-xxx-xxx (đăng ký hộ kinh doanh tại Hà Nội).',
    ],
  },
  {
    h: '3. Bàn giao & quyền sở hữu',
    p: [
      'Source code, ảnh / nội dung do mình tạo cho bạn → thuộc về bạn 100% sau khi bạn thanh toán phí setup.',
      'Mình giữ quyền dùng các đoạn code thư viện riêng (không chứa logic nghiệp vụ của bạn) cho project khác.',
      'Mình được phép share case study (đã ẩn thông tin nhạy cảm theo NDA) trên portfolio, trừ khi bạn yêu cầu rõ là không.',
    ],
  },
  {
    h: '4. Bảo hành',
    p: [
      '30 ngày bảo hành miễn phí kể từ ngày bàn giao: lỗi nào không-do-bạn (code mình viết, integration mình setup) — mình fix free.',
      'Sau 30 ngày, bảo hành nằm trong gói vận hành tháng. Nếu bạn không mua gói vận hành: lỗi do code mình viết vẫn bảo hành miễn phí 90 ngày.',
      'Không bảo hành: thay đổi từ phía vendor (Shopee, TikTok, OpenAI… đổi API, đổi giá), yêu cầu thêm tính năng mới.',
    ],
  },
  {
    h: '5. Hủy & hoàn tiền',
    p: [
      'Trước khi duyệt demo: hủy free, không tốn gì.',
      'Sau khi đã trả phí setup nhưng chưa bàn giao: hoàn 50% nếu mình chưa work, 0% nếu mình đã work >50% scope.',
      'Hủy gói vận hành: nghỉ bất cứ lúc nào, không phí hủy. Mình vẫn hỗ trợ migration nếu bạn chuyển sang dev khác.',
    ],
  },
  {
    h: '6. Trách nhiệm pháp lý',
    p: [
      'Mình bảo đảm code không vi phạm bản quyền của bên thứ ba.',
      'Bạn chịu trách nhiệm về nội dung / dữ liệu bạn cung cấp (ảnh, text, danh sách khách hàng…).',
      'Tổng mức bồi thường tối đa, trong mọi trường hợp = phí setup case đó. Không bồi thường thiệt hại gián tiếp (doanh thu mất, cơ hội…).',
    ],
  },
  {
    h: '7. Tranh chấp',
    p: [
      'Hai bên thiện chí thương lượng trong 30 ngày trước khi đưa ra cơ quan tài phán.',
      'Nếu không giải quyết được: Toà án Nhân dân quận Cầu Giấy, Hà Nội có thẩm quyền giải quyết. Áp dụng pháp luật Việt Nam.',
    ],
  },
];

export default function TermsPage() {
  return (
    <>
      <main className="min-h-svh">
        <PageHeader
          eyebrow="Pháp lý"
          title="Điều khoản dịch vụ"
          intro="Hiệu lực từ 01/2026. Khi có thay đổi quan trọng, mình email báo trước 30 ngày."
          crumbs={[{ label: 'Trang chủ', href: '/' }, { label: 'Điều khoản' }]}
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
        </article>
      </main>
      <Footer />
    </>
  );
}
