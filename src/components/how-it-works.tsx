import { Play, MessageSquare, Download } from 'lucide-react';

const STEPS = [
  {
    icon: Play,
    title: 'Xem video demo',
    desc: 'Bạn xem video để biết tool chạy như thế nào. Thấy phù hợp thì mới mua.',
    badge: 'Bước 1',
  },
  {
    icon: MessageSquare,
    title: 'Bấm mua và nhắn mình',
    desc: 'Bạn bấm “Mua / Đặt câu hỏi”. Mình gửi cách chuyển khoản và trả lời nếu bạn còn thắc mắc.',
    badge: 'Bước 2',
  },
  {
    icon: Download,
    title: 'Nhận file + chạy ngay',
    desc: 'Chuyển khoản xong, bạn nhắn ảnh giao dịch. Mình gửi file và hướng dẫn. Bạn chỉ cần mở file để dùng.',
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
          Xem demo trước. Nếu thấy đúng nhu cầu thì mua. Mua xong mình gửi file và hướng dẫn cách dùng.
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
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-muted text-brand-orange ring-1 ring-[var(--ring-subtle)]">
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
