import { ShieldCheck, Wrench, Lock, Package } from 'lucide-react';

const PROMISES = [
  {
    icon: Package,
    title: 'Nhận file là mở dùng được',
    body: 'Bạn nhận một thư mục có sẵn file chạy. Chỉ cần bấm đúp vào file là mở tool, không cần biết code hay cài thêm thứ phức tạp.',
  },
  {
    icon: ShieldCheck,
    title: 'Xem video trước rồi hãy mua',
    body: 'Mỗi tool đều có video quay màn hình thật. Bạn xem tool chạy như thế nào, thấy đúng nhu cầu thì mới mua.',
  },
  {
    icon: Wrench,
    title: 'Lỗi thì nhắn mình sửa',
    body: 'Trong 30 ngày đầu, nếu tool bị lỗi, bạn chỉ cần nhắn Zalo kèm ảnh lỗi. Mình sửa và gửi lại bản mới miễn phí.',
  },
  {
    icon: Lock,
    title: 'Không đụng vào phần mềm riêng của công ty',
    body: 'Tool chỉ làm việc với các trang web bạn được phép dùng như ChatGPT, Google Docs, Google Sheets, Gmail hoặc CRM web. Mình không truy cập phần mềm nội bộ trên máy công ty bạn.',
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
            Mua xong vẫn có người hỗ trợ.
          </h2>
          <p className="mt-5 text-foreground/65">
            Bạn mua một lần, nhận file về máy và dùng lâu dài. Có lỗi thì nhắn mình, không phải tự mò.
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
