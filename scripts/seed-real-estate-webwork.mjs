// One-shot seed: insert the "Website bất động sản Hà Nội" webwork product
// using the service role key. Looks up admin user by ADMIN_EMAIL to set owner_id.

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

const description = `### Dành cho ai
Chủ sàn bất động sản, đội môi giới hoặc agency muốn có website riêng để showcase dự án và thu lead — không phụ thuộc các trang đăng tin chung.

### Tính năng cho khách xem
- Trang chủ với banner, dự án nổi bật và tin tức mới.
- Danh sách + chi tiết **dự án** (theo khu vực, tiến độ, chủ đầu tư).
- Danh sách + chi tiết **tin mua bán** với ảnh, vị trí, giá.
- Trang **theo khu vực** (\`/khu-vuc/[slug]\`) gom tin theo quận/phường.
- **Tìm kiếm** đa tiêu chí: loại hình, giá, diện tích, khu vực.
- Trang **tin tức / bài viết** cho SEO và content marketing.
- Form **liên hệ / tư vấn** gắn vào từng dự án để thu lead.
- Trang giới thiệu, FAQ, chính sách — đầy đủ cho doanh nghiệp.

### Khu vực tài khoản người dùng
- Đăng ký / đăng nhập / quên mật khẩu (JWT + HTTP-only cookie).
- Đăng tin bất động sản ngay từ tài khoản.
- Quản lý tin đã đăng, tin đã lưu, lịch sử liên hệ.
- Hồ sơ cá nhân.

### Khu vực quản trị (admin)
- Dashboard tổng quan.
- Duyệt tin chờ trước khi public.
- Quản lý dự án, bất động sản, bài viết, banner.
- Quản lý lead / yêu cầu tư vấn từ form.
- Quản lý người dùng và phân quyền.
- Cấu hình SEO (meta title, description, sitemap, robots).
- Thông báo admin khi có tin mới cần duyệt.

### Công nghệ
- **Next.js 16** App Router + **React 19** + **TypeScript**.
- **Tailwind CSS 4** cho UI.
- **MongoDB + Mongoose** cho dữ liệu.
- **JWT** + **bcryptjs** cho xác thực.
- Sitemap + robots tự sinh, sẵn sàng SEO.`;

const product = {
  kind: 'webwork',
  title: 'Website bất động sản Hà Nội',
  slug: 'website-bat-dong-san-ha-noi',
  tagline:
    'Nền tảng giới thiệu dự án, đăng tin mua bán và thu lead tư vấn, kèm khu admin đầy đủ cho chủ sàn.',
  description,
  notice: null,
  youtube_url: null,
  thumbnail_url: null,
  repo_url: 'https://github.com/Phungdminh/real-estate-project',
  gallery: [],
  pricing_mode: 'quote',
  price_vnd: null,
  is_free: false,
  categories: [],
  tags: [],
  versions: [],
  deliverables: [],
  support_options: ['drive_folder', 'zalo_group', 'github_repo'],
  duration_label: null,
  prerequisites: [],
  prompt_meta: {},
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
  console.log('Updated existing product:', data.id, '→', `/web/${data.slug}`);
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
  console.log('Created product:', data.id, '→', `/web/${data.slug}`);
}
