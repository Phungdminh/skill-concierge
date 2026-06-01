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
    a: 'Hiện tại sau khi bạn liên hệ qua form, mình gửi thông tin chuyển khoản. Xác nhận xong mình gửi link Drive tải tool hoặc nội dung bạn đã mua.',
  },
  {
    q: 'Mất bao lâu từ lúc liên hệ đến lúc nhận tool?',
    a: 'Tool có sẵn trong catalog: nhận file ngay sau khi hoàn thành thanh toán. Tool đặt riêng theo yêu cầu: 3–10 ngày tuỳ phức tạp — mình báo timeline rõ trong quote.',
  },
  {
    q: 'Tool chạy lỗi thì sao?',
    a: 'Bảo hành sửa bug miễn phí 30 ngày kể từ ngày giao. Ping Zalo, mô tả lỗi + screenshot, mình fix và gửi build mới. Sau 30 ngày bạn vẫn có thể nhắn — mình sửa lỗi nghiêm trọng free, tính phí với feature mới.',
  },
  {
    q: 'Tool có thu thập dữ liệu không?',
    a: 'Không. Tool chạy trên máy bạn, không gửi telemetry, không cloud, không subscription. Lưu ý: mình không chạy hoặc can thiệp vào phần mềm local/nội bộ của công ty bạn. Use case phù hợp là thao tác trên các ứng dụng web như ChatGPT, Google Docs, Excel Online, Google Sheets, Gmail, CRM web, v.v.',
  },
  {
    q: 'Có thể đặt tool riêng theo nhu cầu không?',
    a: 'Có. Mô tả use case → mình quote. Giá custom thường 1.5–10tr tuỳ phức tạp. Mình build & test trước, bạn xem demo qua YouTube → ưng mới trả tiền.',
  },
  {
    q: 'Làm web ở đây gồm những loại nào?',
    a: 'Mình nhận landing page và web cá nhân gọn nhẹ, tập trung vào giới thiệu dịch vụ/sản phẩm và tạo form liên hệ. Không định vị là hệ thống nội bộ phức tạp hay phần mềm quản trị doanh nghiệp.',
  },
  {
    q: 'Prompt mẫu dùng cho những việc gì?',
    a: 'Prompt mẫu được chia theo nhu cầu như công việc, học tập, kinh doanh, sáng tạo nội dung và automation. Bạn chỉ cần copy, chỉnh vài thông tin theo ngữ cảnh rồi dùng với ChatGPT/Claude.',
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
