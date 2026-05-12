-- Run in Supabase SQL editor after creating the project.
-- SkillForge VN — single-creator multi-kind storefront (tool / setup / prompt / webwork).

-- Clean slate (idempotent re-runs)
-- Dropping tables with cascade also removes their policies, indexes, and foreign keys.
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
drop table if exists inquiries cascade;
drop table if exists products cascade;
drop table if exists tools cascade;
drop table if exists task_runs cascade;
drop table if exists tasks cascade;
drop table if exists skills cascade;

create table products (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade not null,
  kind text not null check (kind in ('tool','setup','prompt','webwork')),
  slug text unique not null,
  title text not null,
  tagline text,
  description text,                                                  -- markdown long-form
  youtube_url text,
  thumbnail_url text,
  gallery jsonb default '[]'::jsonb,                                 -- array of image URLs
  pricing_mode text default 'fixed' check (pricing_mode in ('fixed','from','quote')),
  price_vnd integer,                                                 -- nullable when pricing_mode='quote'
  is_free boolean default false not null,                            -- free prompt/download option
  category text,                                                     -- kind-specific: automation/scraping/mockup, mcp/openclaw/api, ai-basic/prompt, landing/portfolio …
  tags text[] default '{}',                                          -- stack/topic chips
  deliverables jsonb default '[]'::jsonb,                            -- array of strings (bullet list shown on detail page)
  support_options text[] default '{}',                               -- subset of: drive_folder, zalo_group, one_on_one_call, remote_setup
  duration_label text,                                               -- "5 bài × ~30 phút", "Giao 3 ngày", v.v.
  prerequisites jsonb default '[]'::jsonb,                           -- array of strings shown for setup/prompt kinds
  status text default 'draft' check (status in ('draft','published','sold_out','archived')),
  featured boolean default false,
  sort_order integer default 0,
  sales_count integer default 0 not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table inquiries (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete set null,
  product_kind text,                                                 -- snapshot at submit time (survives product delete)
  name text not null,
  email text not null,
  phone text,
  message text,
  status text default 'new' check (status in ('new','contacted','closed')),
  created_at timestamptz default now()
);

create index products_published_idx
  on products(status, kind, featured desc, sort_order desc, created_at desc);
create index products_best_seller_idx
  on products(status, kind, sales_count desc, featured desc, sort_order desc, created_at desc);
create index products_kind_idx
  on products(kind, status);
create index inquiries_status_idx
  on inquiries(status, created_at desc);

alter table products enable row level security;
alter table inquiries enable row level security;

-- products: public read of published, owner sees & writes everything
create policy "products public read" on products
  for select using (status = 'published');
create policy "products owner full" on products
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- inquiries: anyone can submit, only the single creator (any row in products.owner_id) can read/update
create policy "inquiries public insert" on inquiries
  for insert with check (true);
create policy "inquiries admin read" on inquiries
  for select using (
    exists (select 1 from products where products.owner_id = auth.uid())
  );
create policy "inquiries admin update" on inquiries
  for update using (
    exists (select 1 from products where products.owner_id = auth.uid())
  );
