// One-shot seed: insert a "Prompt viết Meta Description SEO" prompt product
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

const description = `Một prompt chuẩn để tạo meta description SEO dưới 160 ký tự, lồng tự nhiên 2-4 từ khoá mục tiêu và đủ sức kéo click từ trang kết quả tìm kiếm. Dùng cho mọi bài blog: chỉ cần đưa tiêu đề, tóm tắt và keyword, AI sẽ trả về đúng một câu meta hoàn chỉnh.`;

const previewContent = `Với vai trò chuyên gia viết nội dung SEO, hãy tạo một mô tả meta (meta description) hấp dẫn và đầy đủ thông tin cho bài đăng blog.

**Thông tin đầu vào:**
- **Tiêu đề bài blog:** [Tiêu đề bài viết blog của bạn]
- **Nội dung chính/Tóm tắt:** [Mô tả ngắn gọn nội dung cốt lõi hoặc các điểm chính của bài blog]
- **Từ khóa mục tiêu:** [Liệt kê 2-4 từ khóa chính và phụ, cách nhau bởi dấu phẩy]

[…đăng nhập để xem phần yêu cầu chi tiết và bản đầy đủ.]`;

const fullContent = `Với vai trò chuyên gia viết nội dung SEO, hãy tạo một mô tả meta (meta description) hấp dẫn và đầy đủ thông tin cho bài đăng blog.

**Thông tin đầu vào:**
- **Tiêu đề bài blog:** [Tiêu đề bài viết blog của bạn]
- **Nội dung chính/Tóm tắt:** [Mô tả ngắn gọn nội dung cốt lõi hoặc các điểm chính của bài blog]
- **Từ khóa mục tiêu:** [Liệt kê 2-4 từ khóa chính và phụ, cách nhau bởi dấu phẩy]

**Yêu cầu:**
- **Độ dài:** Tuyệt đối không quá 160 ký tự.
- **Giọng điệu:** Hấp dẫn và truyền tải thông tin.
- **SEO:** Tích hợp tự nhiên các từ khóa mục tiêu để cải thiện thứ hạng tìm kiếm.
- **Mục tiêu:** Thu hút người dùng nhấp chuột từ trang kết quả tìm kiếm.

Chỉ cung cấp mô tả meta.`;

const explanation = `### Mục đích của prompt
Prompt này là công cụ đắc lực giúp bạn tạo ra các mô tả meta (meta description) tối ưu hóa SEO cho bài viết blog một cách nhanh chóng và hiệu quả. Mục tiêu chính là tăng khả năng hiển thị của bài viết trên công cụ tìm kiếm, thu hút người đọc nhấp vào liên kết, từ đó tăng lượng truy cập và tương tác, giúp cải thiện thứ hạng SEO tổng thể.

### Cách sử dụng hiệu quả
- **Bước 1 — Điền tiêu đề:** Nhập tiêu đề chính xác của bài viết blog vào placeholder \`[Tiêu đề bài viết blog của bạn]\`.
- **Bước 2 — Tóm tắt nội dung:** Viết 2-3 câu ngắn gọn hoặc liệt kê ý chính của bài. Càng rõ, AI càng tóm lược trúng ý.
- **Bước 3 — Liệt kê từ khoá:** Cung cấp 2-4 từ khoá chính và phụ liên quan chặt chẽ tới nội dung và hành vi tìm kiếm.
- **Bước 4 — Chạy với AI:** Dán prompt đã điền đầy đủ vào ChatGPT, Claude, Grok hoặc Gemini.
- **Bước 5 — Kiểm tra:** Soát lại độ dài (≤160 ký tự), độ hấp dẫn và mức độ tự nhiên của từ khoá. Tinh chỉnh thêm nếu cần.

### Ví dụ cụ thể
**Điền thông tin:**
- Tiêu đề bài blog: *"10 Cách Tối Ưu Hóa Tốc Độ Tải Trang Web Của Bạn"*
- Nội dung chính/Tóm tắt: *"Bài viết hướng dẫn chi tiết các kỹ thuật giảm thời gian tải trang, cải thiện trải nghiệm người dùng, và tăng xếp hạng SEO."*
- Từ khoá mục tiêu: *"tối ưu tốc độ tải trang", "cải thiện website", "SEO website"*

**Kết quả mong đợi:**
> Tìm hiểu 10 cách tối ưu tốc độ tải trang web để cải thiện hiệu suất, trải nghiệm người dùng và xếp hạng SEO của bạn. Hướng dẫn chi tiết!

### Tình huống phù hợp
- **Content creator & Blogger:** tạo meta description chuẩn SEO nhanh cho các bài mới.
- **Chuyên gia SEO:** tối ưu meta hàng loạt, tăng CTR và thứ hạng.
- **Marketer:** nâng tỷ lệ nhấp chuột cho các chiến dịch content.
- **Chủ doanh nghiệp online:** tăng traffic tự nhiên đến trang sản phẩm/dịch vụ.`;

const product = {
  kind: 'prompt',
  title: 'Tối ưu SEO với Prompt viết Meta Description hiệu quả',
  slug: 'prompt-viet-meta-description-seo',
  tagline:
    'Nâng tầm blog của bạn trên công cụ tìm kiếm — prompt chuyên sâu giúp viết meta description chuẩn SEO, thu hút lượt nhấp và tăng thứ hạng hiệu quả.',
  description,
  notice: null,
  youtube_url: null,
  thumbnail_url: null,
  repo_url: null,
  gallery: [],
  pricing_mode: 'fixed',
  price_vnd: null,
  is_free: true,
  categories: ['seo-blog', 'content-creator'],
  tags: [
    'meta-description',
    'seo-onpage',
    'content-marketing',
    'website-copy',
    'toi-uu-tu-khoa',
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
