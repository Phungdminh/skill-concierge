-- Migration: prompt_folders table + folder_id on products.
--   * New table `prompt_folders` (id, slug, name, description, icon, cover_image_url, sort_order)
--   * Add `products.folder_id uuid` with ON DELETE SET NULL
--   * Seed 20 initial folders matching the legacy PROMPT_CATEGORIES list
--   * Backfill folder_id from categories[1] for existing prompts
--   * RLS: public read on prompt_folders
--
-- Decision (locked in by user):
--   * One folder per prompt (1-to-many via nullable FK)
--   * Delete folder -> set folder_id = NULL (prompts not deleted)
--   * Prompt categories deprecated in UI but column kept for rollback
--
-- Idempotent: safe to re-run.

begin;

-- 1) prompt_folders table -------------------------------------------------
create table if not exists prompt_folders (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  icon text,
  cover_image_url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table prompt_folders
  drop constraint if exists prompt_folders_slug_format_chk;
alter table prompt_folders
  add constraint prompt_folders_slug_format_chk
  check (slug ~ '^[a-z0-9][a-z0-9-]*[a-z0-9]$' and char_length(slug) between 2 and 80);

alter table prompt_folders
  drop constraint if exists prompt_folders_name_len_chk;
alter table prompt_folders
  add constraint prompt_folders_name_len_chk
  check (char_length(btrim(name)) between 1 and 120);

create index if not exists prompt_folders_sort_idx
  on prompt_folders(sort_order, name);

-- 2) RLS ----------------------------------------------------------------
alter table prompt_folders enable row level security;

drop policy if exists "prompt_folders public read" on prompt_folders;
create policy "prompt_folders public read" on prompt_folders
  for select using (true);

-- Writes are server-only (service role). No public insert/update/delete policy.

-- 3) Seed initial 20 folders --------------------------------------------
-- Slugs match the legacy PROMPT_CATEGORIES values so backfill works.
insert into prompt_folders (slug, name, description, icon, sort_order) values
  ('content-creator',     'Content creator',       'Prompt cho người sáng tạo nội dung — script, idea, caption, hook.',                'Sparkles',     10),
  ('social-media',        'Social media',          'Prompt cho Facebook, Instagram, Threads, LinkedIn.',                                 'Share2',       20),
  ('seo-blog',            'SEO / Blog',            'Prompt viết bài chuẩn SEO, meta description, keyword research.',                     'FileText',     30),
  ('video-tiktok',        'Video / TikTok',        'Prompt script TikTok, Reels, YouTube Shorts.',                                       'Clapperboard', 40),
  ('giao-vien',           'Giáo viên',             'Prompt giáo án, đề thi, slide bài giảng, feedback học sinh.',                        'GraduationCap',50),
  ('hoc-sinh-sinh-vien',  'Học sinh / Sinh viên',  'Prompt học tập, tóm tắt sách, làm bài tập, luyện đề.',                               'BookOpen',     60),
  ('ke-toan-tai-chinh',   'Kế toán / Tài chính',   'Prompt nghiệp vụ kế toán, phân tích báo cáo, công thức Excel.',                      'Calculator',   70),
  ('nhan-su-tuyen-dung',  'Nhân sự / Tuyển dụng',  'Prompt JD, sàng lọc CV, email phỏng vấn, đánh giá.',                                 'Users',        80),
  ('ban-hang-sales',      'Bán hàng / Sales',      'Prompt cold email, kịch bản gọi, xử lý từ chối.',                                    'TrendingUp',   90),
  ('ecommerce-shop',      'Shop online / TMĐT',    'Prompt mô tả sản phẩm, livestream, phản hồi khách shop.',                            'ShoppingBag', 100),
  ('cham-soc-khach-hang', 'Chăm sóc khách hàng',   'Prompt phản hồi, xin lỗi, xử lý khiếu nại lịch sự.',                                 'Headphones',  110),
  ('bat-dong-san',        'Bất động sản',          'Prompt mô tả căn hộ, kịch bản tư vấn, follow-up khách.',                             'Home',        120),
  ('luat-hop-dong',       'Luật / Hợp đồng',       'Prompt soạn bản nháp hợp đồng, đọc điều khoản (chỉ tham khảo).',                     'Scale',       130),
  ('y-te-suc-khoe',       'Y tế / Sức khỏe',       'Prompt giáo dục sức khỏe, ghi chú khám (chỉ tham khảo).',                            'HeartPulse',  140),
  ('du-lich-khach-san',   'Du lịch / Khách sạn',   'Prompt lịch trình, mô tả tour, email khách hàng.',                                   'Plane',       150),
  ('nha-hang-fnb',        'Nhà hàng / F&B',        'Prompt menu, mô tả món, kịch bản review.',                                           'UtensilsCrossed', 160),
  ('thiet-ke-hinh-anh',   'Thiết kế / Hình ảnh',   'Prompt cho Midjourney, DALL-E, Stable Diffusion.',                                   'Image',       170),
  ('lap-trinh',           'Lập trình',             'Prompt code review, debug, refactor, giải thích.',                                   'Code',        180),
  ('dich-thuat-ngon-ngu', 'Dịch thuật / Ngôn ngữ', 'Prompt dịch, luyện phát âm, tạo glossary song ngữ.',                                 'Languages',   190),
  ('other',               'Khác',                  'Các prompt chưa thuộc nhóm cụ thể.',                                                  'Layers',      999)
on conflict (slug) do nothing;

-- 4) Add folder_id to products ------------------------------------------
alter table products
  add column if not exists folder_id uuid references prompt_folders(id) on delete set null;

create index if not exists products_folder_id_idx
  on products(folder_id)
  where folder_id is not null;

-- 5) Backfill folder_id from categories[1] for existing prompts ---------
-- Postgres arrays are 1-indexed; categories[1] is the first category.
update products p
   set folder_id = pf.id
  from prompt_folders pf
 where p.kind = 'prompt'
   and p.folder_id is null
   and array_length(p.categories, 1) >= 1
   and pf.slug = p.categories[1];

-- 6) Trigger to keep updated_at fresh on prompt_folders -----------------
create or replace function public.touch_prompt_folder_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists prompt_folders_touch_updated_at on prompt_folders;
create trigger prompt_folders_touch_updated_at
  before update on prompt_folders
  for each row execute function public.touch_prompt_folder_updated_at();

commit;

notify pgrst, 'reload schema';
