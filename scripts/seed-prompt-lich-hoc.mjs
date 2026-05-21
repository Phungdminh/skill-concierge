// One-shot seed: insert a "Prompt tạo lịch học hiệu quả" prompt product
// using the service role key. Idempotent by slug.

import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

function loadEnv(file) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    if (!process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
  }
}
loadEnv(path.join(process.cwd(), '.env.local'));
loadEnv(path.join(process.cwd(), '.env'));

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminEmail = process.env.ADMIN_EMAIL;
if (!url || !key || !adminEmail) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / ADMIN_EMAIL.');
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function findAdminUserId(email) {
  let page = 1;
  for (;;) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const hit = data.users.find((u) => (u.email ?? '').toLowerCase() === email.toLowerCase());
    if (hit) return hit.id;
    if (data.users.length < 200) return null;
    page += 1;
  }
}

const description = `Một prompt được thiết kế sẵn để biến lịch học lộn xộn thành một thời khoá biểu khoa học, cân bằng giữa môn ưu tiên, thời gian nghỉ và các cam kết cá nhân khác. Phù hợp cho học sinh, sinh viên và người đi làm muốn học thêm kỹ năng mới mà không đảo lộn cuộc sống.`;

const previewContent = `Bạn là một trợ lý học tập chuyên nghiệp. Nhiệm vụ của bạn là thiết kế một lịch học cá nhân hóa và hiệu quả cao.

Để thực hiện điều này, tôi sẽ cung cấp cho bạn các chi tiết sau:
- **Trọng tâm học tập của tôi:** [Liệt kê các môn học hoặc chủ đề, kèm theo mức độ ưu tiên hoặc độ khó (ví dụ: Toán (cao), Lịch sử (trung bình), Khoa học (thấp))]
- **Mục tiêu thời gian học hàng tuần của tôi:** [Ví dụ: 20 giờ tổng cộng, 3-4 giờ mỗi ngày]
- **Cam kết cá nhân & Thói quen hàng ngày của tôi:** [Mô tả các cam kết cố định hàng ngày/hàng tuần như công việc, thể thao, thời gian gia đình, hoạt động xã hội, thời gian ngủ/dậy ưa thích, các khoảng thời gian có thể học]

[…đăng nhập để xem prompt đầy đủ và phần hướng dẫn chi tiết.]`;

const fullContent = `Bạn là một trợ lý học tập chuyên nghiệp. Nhiệm vụ của bạn là thiết kế một lịch học cá nhân hóa và hiệu quả cao.

Để thực hiện điều này, tôi sẽ cung cấp cho bạn các chi tiết sau:
- **Trọng tâm học tập của tôi:** [Liệt kê các môn học hoặc chủ đề, kèm theo mức độ ưu tiên hoặc độ khó (ví dụ: Toán (cao), Lịch sử (trung bình), Khoa học (thấp))]
- **Mục tiêu thời gian học hàng tuần của tôi:** [Ví dụ: 20 giờ tổng cộng, 3-4 giờ mỗi ngày]
- **Cam kết cá nhân & Thói quen hàng ngày của tôi:** [Mô tả các cam kết cố định hàng ngày/hàng tuần như công việc, thể thao, thời gian gia đình, hoạt động xã hội, thời gian ngủ/dậy ưa thích, các khoảng thời gian có thể học]
- **Sở thích học tập của tôi (Tùy chọn):** [Ví dụ: Tôi thích các buổi học ngắn, tập trung; Tôi dễ bị phân tâm; Tôi thích dùng flashcard; Tôi muốn kết hợp ôn tập chủ động]
- **Mục tiêu học tập của tôi (Tùy chọn):** [Ví dụ: Chuẩn bị cho kỳ thi cuối kỳ, học một kỹ năng mới, cải thiện điểm số ở các môn cụ thể]

Dựa trên các chi tiết này, hãy tạo một kế hoạch học tập toàn diện cho [ví dụ: một tuần 7 ngày hoặc 5 ngày trong tuần]. Lịch trình cần:
1.  **Phân bổ thời gian hiệu quả:** Phân chia thời gian học tập cho các môn học, ưu tiên theo nhu cầu.
2.  **Đảm bảo cân bằng:** Tích hợp các khoảng nghỉ ngắn, đều đặn (ví dụ: sau mỗi 45-60 phút).
3.  **Kết hợp đa dạng phương pháp học tập:** Đề xuất nhiều kỹ thuật khác nhau (ví dụ: Pomodoro, lặp lại ngắt quãng, ôn tập chủ động, giải bài tập) để duy trì sự hứng thú và hiệu quả.
4.  **Gợi ý công cụ/kỹ thuật theo dõi tiến độ:** Đề xuất các cách đơn giản để theo dõi quá trình học (ví dụ: công cụ theo dõi thói quen, tự kiểm tra, buổi ôn tập).
5.  **Định dạng đầu ra:** Trình bày lịch học dưới dạng **bảng** rõ ràng, dễ đọc, chia nhỏ từng ngày theo các khung giờ (ví dụ: khoảng 30-60 phút) và các hoạt động được giao. Bao gồm tóm tắt ngắn gọn các chiến lược chính ở cuối.`;

const explanation = `### Mục đích của prompt
Prompt này giúp bạn tạo ra một lịch học cá nhân hóa, tối ưu theo lối sống và mục tiêu riêng của bạn. Thay vì mất thời gian tự lập kế hoạch, AI sẽ giúp bạn có một lịch trình khoa học, cân bằng, đảm bảo hiệu quả học tập và duy trì động lực.

### Cách sử dụng hiệu quả
- **Điền chi tiết vào placeholder:** Thay thế nội dung trong các dấu ngoặc vuông \`[]\` bằng thông tin cụ thể của bạn (môn học, thời gian rảnh, cam kết cá nhân, sở thích học tập). Càng chi tiết, lịch học càng phù hợp.
- **Xác định mục tiêu rõ ràng:** Nêu rõ bạn muốn học để thi, học kỹ năng mới, hay cải thiện điểm số.
- **Lựa chọn định dạng:** Yêu cầu AI trình bày lịch học theo định dạng mong muốn (ví dụ: bảng theo ngày).
- **Sử dụng với công cụ AI:** Dán prompt đã điền đầy đủ vào ChatGPT, Claude, Grok hoặc Gemini để nhận về lịch học. Sau đó bạn có thể điều chỉnh thêm nếu cần.

### Ví dụ cụ thể
**Điền:**
- Trọng tâm học tập: Toán (ưu tiên cao), Tiếng Anh (trung bình)
- Mục tiêu thời gian: 3 giờ/ngày, 5 ngày/tuần
- Cam kết: Lớp học thêm 19h–21h thứ 3, 5; Tập gym 6h–7h sáng thứ 2, 4, 6
- Sở thích: Thích học ngắn, tập trung 45 phút, nghỉ 15 phút

**Kết quả mong đợi:** Một bảng lịch học chi tiết cho 5 ngày trong tuần, chia theo khung giờ, ghi rõ môn học, thời gian nghỉ, gợi ý phương pháp học và cách theo dõi tiến độ.

### Tình huống phù hợp
- Học sinh, sinh viên muốn tối ưu hóa lịch ôn thi hiệu quả.
- Người đi làm muốn học thêm kỹ năng mới nhưng có lịch trình bận rộn.
- Bất kỳ ai cần một kế hoạch học tập khoa học, cân bằng để đạt mục tiêu.
- Người muốn khắc phục tình trạng học không hiệu quả, thiếu động lực.`;

const product = {
  kind: 'prompt',
  title: 'Prompt tạo lịch học hiệu quả tối ưu cho mọi lối sống cá nhân',
  slug: 'prompt-tao-lich-hoc-hieu-qua-toi-uu-cho-moi-loi-song-ca-nhan',
  tagline:
    'Tối ưu hóa thời gian học tập của bạn! Xây dựng lịch trình học cá nhân hóa, cân bằng mọi môn học và cam kết cá nhân — nâng cao hiệu suất với kế hoạch thông minh, đa dạng phương pháp và công cụ theo dõi tiến độ.',
  description,
  notice: null,
  youtube_url: null,
  thumbnail_url: null,
  repo_url: null,
  gallery: [],
  pricing_mode: 'fixed',
  price_vnd: null,
  is_free: true,
  categories: ['hoc-sinh-sinh-vien'],
  tags: [
    'lich-hoc-ca-nhan',
    'lap-ke-hoach-hoc-tap',
    'toi-uu-hoc-tap',
    'pomodoro',
    'on-tap-chu-dong',
  ],
  versions: [],
  deliverables: [],
  support_options: [],
  duration_label: null,
  prerequisites: [],
  prompt_meta: {
    preview_content: previewContent,
    full_content: fullContent,
    explanation,
    related_slugs: [],
  },
  status: 'published',
  featured: false,
  sort_order: 0,
};

const ownerId = await findAdminUserId(adminEmail);
if (!ownerId) {
  console.error(`Admin user with email ${adminEmail} not found in auth.users.`);
  process.exit(1);
}

const { data: existing } = await supabase
  .from('products')
  .select('id, slug')
  .eq('slug', product.slug)
  .maybeSingle();

if (existing) {
  const { data, error } = await supabase
    .from('products')
    .update(product)
    .eq('id', existing.id)
    .select()
    .single();
  if (error) {
    console.error('Update failed:', error);
    process.exit(1);
  }
  console.log('Updated existing prompt:', data.id, '→', `/prompts/${data.slug}`);
} else {
  const { data, error } = await supabase
    .from('products')
    .insert({ ...product, owner_id: ownerId })
    .select()
    .single();
  if (error) {
    console.error('Insert failed:', error);
    process.exit(1);
  }
  console.log('Created prompt:', data.id, '→', `/prompts/${data.slug}`);
}
