export type FaqItem = { q: string; a: string };

export const FAQ_GENERAL: FaqItem[] = [
  {
    q: 'Mình không biết gì về code — có dùng được tool không?',
    a: 'Có. Tool đóng gói thành file .exe — bạn nhận folder, double-click .exe là chạy. Không cần cài Python, không cần config gì. Mỗi tool đều có hướng dẫn ngắn bằng tiếng Việt + video demo.',
  },
  {
    q: 'Yêu cầu cấu hình máy như thế nào?',
    a: 'Windows 10 hoặc 11 64-bit, RAM ≥ 4GB, ổ cứng còn ≥ 500MB. Một số tool có Playwright sẽ tự tải Chromium lần đầu chạy (~120MB).',
  },
  {
    q: 'Cách thanh toán?',
    a: 'Hiện tại sau khi bạn liên hệ qua form, mình gửi thông tin chuyển khoản (VCB / Techcombank / Momo / Zalo Pay). Xác nhận xong mình gửi link Drive tải tool. Payment online tự động đang được setup, sẽ có sớm.',
  },
  {
    q: 'Mất bao lâu từ lúc liên hệ đến lúc nhận tool?',
    a: 'Tool có sẵn trong catalog: nhận file ngay sau khi xác nhận thanh toán (thường <24h). Tool đặt riêng theo yêu cầu: 3–10 ngày tuỳ phức tạp — mình báo timeline rõ trong quote.',
  },
  {
    q: 'Tool chạy lỗi thì sao?',
    a: 'Bảo hành sửa bug miễn phí 30 ngày kể từ ngày giao. Ping Zalo, mô tả lỗi + screenshot, mình fix và gửi build mới. Sau 30 ngày bạn vẫn có thể nhắn — mình sửa lỗi nghiêm trọng free, tính phí với feature mới.',
  },
  {
    q: 'Tool có thu thập dữ liệu không?',
    a: 'Không. Tool chạy 100% local trên máy bạn, không gửi telemetry, không cloud, không subscription. Source code mình tự viết — không có backdoor.',
  },
  {
    q: 'Có thể đặt tool riêng theo nhu cầu không?',
    a: 'Có. Mô tả use case → mình quote. Giá custom thường 1.5–10tr tuỳ phức tạp. Mình build & test trước, bạn xem demo qua YouTube → ưng mới trả tiền.',
  },
  {
    q: 'Tool có dùng được trên Mac / Linux không?',
    a: 'Hiện chỉ build cho Windows. Mac/Linux có thể chạy qua Wine hoặc VM Windows. Nếu nhu cầu lớn mình sẽ build native cho Mac — ping mình nếu bạn cần.',
  },
];

export const FAQ_PRICING: FaqItem[] = [
  {
    q: 'Vì sao giá khác nhau giữa các tool?',
    a: 'Giá tính theo độ phức tạp + thời gian build. Tool đơn giản (1 màn hình, 1 luồng) thường 800k–2tr. Tool có Playwright + multi-thread + GUI nhiều tab thường 3–8tr. Tool enterprise có integration nhiều API: liên hệ báo giá.',
  },
  {
    q: 'Mua xong có được update không?',
    a: 'Update fix bug: miễn phí 30 ngày, sau đó miễn phí với lỗi nghiêm trọng. Update tính năng mới: tính phí thêm — báo giá rõ trước khi làm.',
  },
  {
    q: 'Có giảm giá / combo không?',
    a: 'Mua từ 2 tool trở lên giảm 10%. Sinh viên gửi thẻ giảm 20%. Có case study (mình được share) giảm thêm 15%.',
  },
  {
    q: 'Không hài lòng thì sao?',
    a: 'Trước khi mua: xem video demo + đọc mô tả. Sau khi mua mà tool không khớp với mô tả: hoàn 100% trong 7 ngày. Sau 7 ngày: hỗ trợ sửa cho khớp, không hoàn tiền.',
  },
];
