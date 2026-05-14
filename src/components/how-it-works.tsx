import { Play, MessageSquare, Download } from 'lucide-react';

const STEPS = [
  {
    icon: Play,
    title: 'Xem video demo',
    desc: 'Mỗi tool có video YouTube chạy thật với một task hằng ngày tương đương, gần giống hoặc cùng concept với việc bạn đang làm. Bạn xem được tool xử lý ra sao, giao diện thế nào và output cuối cùng là gì — trước khi quyết định.',
    badge: 'Bước 1',
  },
  {
    icon: MessageSquare,
    title: 'Liên hệ qua form',
    desc: 'Ưng tool nào → bấm "Mua / Đặt câu hỏi", điền form. Mình rep trong 24h qua Zalo / Email với thông tin thanh toán và hướng dẫn.',
    badge: 'Bước 2',
  },
  {
    icon: Download,
    title: 'Nhận file + chạy ngay',
    desc: 'Sau khi xác nhận, mình gửi link Drive folder gồm app .exe + hướng dẫn ngắn. Bạn kích đúp để mở tool trên máy; tool sẽ hỗ trợ thao tác với website/app web phù hợp, không can thiệp vào phần mềm local hoặc hệ thống nội bộ công ty.',
    badge: 'Bước 3',
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="relative mx-auto w-full max-w-6xl px-6 py-24">
      <div className="mb-14 text-center">
        <p className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">
          Cách mua tool
        </p>
        <h2 className="text-balance text-3xl font-semibold tracking-tight md:text-5xl">
          3 bước. Không cần biết code.
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-foreground/60">
          Tool phù hợp cho các use case thao tác trên website/app web như ChatGPT, Google Docs, Excel Online, Google Sheets, Gmail hoặc CRM web. Mình không chạy hay can thiệp vào phần mềm local/nội bộ của công ty bạn.
        </p>
      </div>

      <ol className="relative grid grid-cols-1 gap-4 md:grid-cols-3">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          return (
            <li
              key={s.title}
              className="glass relative flex flex-col rounded-2xl p-6"
            >
              <div className="flex items-center justify-between">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/[0.04] text-brand-orange ring-1 ring-white/8">
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <span className="text-[10.5px] uppercase tracking-widest text-muted-foreground">
                  {s.badge}
                </span>
              </div>
              <div className="mt-5 text-[11px] tabular-nums text-muted-foreground">
                {String(i + 1).padStart(2, '0')}
              </div>
              <h3 className="mt-1 text-xl font-semibold tracking-tight">{s.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-foreground/70">{s.desc}</p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
