-- Migration: security + performance fixes from code review (Sprint 1-3).
--   * FK indexes on products.owner_id and inquiries.product_id (M4)
--   * Backfill profiles.full_name from auth.users.raw_user_meta_data (M5)
--   * product_view_events table for per-visitor/day view dedupe (H2)
--   * Replace increment_product_view with a dedup-aware version (H2)
--   * Add INSERT policy on profiles so user-scoped upserts work (M3)
--   * Length/format CHECK constraints on inquiries (M10)
--
-- Idempotent: safe to re-run.

begin;

-- (M4) FK indexes ---------------------------------------------------------
create index if not exists products_owner_id_idx
  on products(owner_id);

create index if not exists inquiries_product_id_idx
  on inquiries(product_id);

-- (M5) Ensure profiles.full_name exists + backfill -----------------------
alter table profiles
  add column if not exists full_name text;

update profiles p
   set full_name = coalesce(
     u.raw_user_meta_data->>'full_name',
     u.raw_user_meta_data->>'name'
   )
  from auth.users u
 where p.id = u.id
   and (p.full_name is null or btrim(p.full_name) = '')
   and (
     u.raw_user_meta_data->>'full_name' is not null
     or u.raw_user_meta_data->>'name' is not null
   );

-- (M3) Add INSERT policy on profiles so user-scoped upserts work ---------
drop policy if exists "profiles own insert" on profiles;
create policy "profiles own insert" on profiles
  for insert with check (auth.uid() = id);

-- (M10) Length and format CHECKs on inquiries ----------------------------
alter table inquiries
  drop constraint if exists inquiries_name_len_chk;
alter table inquiries
  add constraint inquiries_name_len_chk
  check (char_length(btrim(name)) between 2 and 120);

alter table inquiries
  drop constraint if exists inquiries_email_len_chk;
alter table inquiries
  add constraint inquiries_email_len_chk
  check (char_length(btrim(email)) between 5 and 255);

alter table inquiries
  drop constraint if exists inquiries_email_format_chk;
alter table inquiries
  add constraint inquiries_email_format_chk
  check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$');

alter table inquiries
  drop constraint if exists inquiries_message_len_chk;
alter table inquiries
  add constraint inquiries_message_len_chk
  check (message is null or char_length(message) <= 4000);

alter table inquiries
  drop constraint if exists inquiries_phone_len_chk;
alter table inquiries
  add constraint inquiries_phone_len_chk
  check (phone is null or char_length(phone) <= 40);

-- (H2) product_view_events table -----------------------------------------
-- One row per (product_id, visitor_hash, day). Anti-spam: same visitor on
-- the same day can only increment view_count once. Visitor hash is computed
-- server-side from IP + user-agent; never store raw IP.
create table if not exists product_view_events (
  product_id    uuid not null references products(id) on delete cascade,
  visitor_hash  text not null,
  day           date not null default (now() at time zone 'utc')::date,
  created_at    timestamptz not null default now(),
  primary key (product_id, visitor_hash, day)
);

create index if not exists product_view_events_day_idx
  on product_view_events(day);

alter table product_view_events enable row level security;

-- No public policies: only service role and the dedup function (SECURITY
-- DEFINER) can read/write. Anon clients call the function, not the table.

-- (H2) Replace increment_product_view with dedup-aware version -----------
-- Returns true if a new view was counted, false if it was a duplicate.
create or replace function public.increment_product_view(
  p_id uuid,
  p_visitor_hash text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted_row product_view_events%rowtype;
begin
  if p_visitor_hash is null or length(p_visitor_hash) < 8 then
    return false;
  end if;

  insert into product_view_events (product_id, visitor_hash)
  values (p_id, p_visitor_hash)
  on conflict do nothing
  returning * into inserted_row;

  if inserted_row.product_id is null then
    return false;
  end if;

  update products
     set view_count = view_count + 1
   where id = p_id
     and status = 'published';

  return true;
end;
$$;

-- Re-grant: anon and authenticated may call the function (it enforces dedup
-- internally), but cannot touch the underlying tables directly.
revoke all on function public.increment_product_view(uuid, text) from public;
grant execute on function public.increment_product_view(uuid, text) to anon, authenticated;

-- Drop the legacy single-arg version so callers must pass a visitor hash.
drop function if exists public.increment_product_view(uuid);

commit;

notify pgrst, 'reload schema';
