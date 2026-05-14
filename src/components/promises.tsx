import { ShieldCheck, Wrench, Lock, Package } from 'lucide-react';

const PROMISES = [
  {
    icon: Package,
    title: 'File .exe chạy ngay, không cần cài Python',
    body: 'Tool đóng gói bằng PyInstaller — bạn nhận folder, double-click .exe là chạy. Windows 10/11 64-bit là đủ.',
  },
  {
    icon: ShieldCheck,
    title: 'Xem demo thật rồi mới mua',
    body: 'Mỗi tool có video YouTube quay thẳng màn hình, dùng data thật. Không demo dựng, không slide bóng bẩy.',
  },
  {
    icon: Wrench,
    title: 'Sửa bug miễn phí 30 ngày',
    body: 'Phát hiện lỗi trong 30 ngày sau khi nhận? Nhắn Zalo — mình fix và gửi build mới. Không cần lý do.',
  },
  {
    icon: Lock,
    title: 'Không can thiệp app local nội bộ',
    body: 'Mình chỉ làm automation cho các ứng dụng web như ChatGPT, Google Docs, Excel Online, Google Sheets, Gmail, CRM web. Không chạy hoặc truy cập phần mềm local/nội bộ của công ty bạn.',
  },
];

export function Promises() {
  return (
    <section className="relative mx-auto w-full max-w-6xl px-6 py-24">
      <div className="mb-10 grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-12">
        <div className="md:col-span-5">
          <p className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">
            Cam kết
          </p>
          <h2 className="text-balance text-3xl font-semibold tracking-tight md:text-5xl">
            Mua xong, không lo bị bỏ rơi.
          </h2>
          <p className="mt-5 text-foreground/65">
            Không phải subscription, không phải SaaS bắt nâng cấp. Bạn mua 1 lần, tool thuộc về bạn.
          </p>
        </div>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:col-span-7">
          {PROMISES.map((p) => {
            const Icon = p.icon;
            return (
              <li
                key={p.title}
                className="rounded-2xl border border-white/5 bg-[#0d0d10] p-5"
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/[0.04] text-brand-orange ring-1 ring-white/10">
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <h3 className="mt-4 text-base font-semibold tracking-tight text-foreground/95">
                  {p.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-foreground/65">{p.body}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
