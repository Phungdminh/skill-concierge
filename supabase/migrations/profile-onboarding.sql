-- Run in Supabase SQL editor. Creates the profiles table (if missing),
-- the auto-insert trigger, RLS policies, avatars storage bucket,
-- and backfills profile rows for users who signed up before this ran.

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  gender text check (gender in ('male','female','other','prefer_not_to_say')),
  job_title text,
  provider text default 'google' not null,
  role text default 'customer' not null check (role in ('customer','admin')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- In case the table already existed without the new columns, add them now.
alter table profiles
  add column if not exists gender text check (gender in ('male','female','other','prefer_not_to_say')),
  add column if not exists job_title text;

create index if not exists profiles_email_idx on profiles(email);

alter table profiles enable row level security;

drop policy if exists "profiles own read" on profiles;
drop policy if exists "profiles own update" on profiles;

create policy "profiles own read" on profiles
  for select using (auth.uid() = id);
create policy "profiles own update" on profiles
  for update using (auth.uid() = id)
  with check (
    auth.uid() = id
    and role = (select role from profiles where id = auth.uid())
  );

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, provider, role)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url',
    coalesce(new.raw_app_meta_data->>'provider', 'google'),
    'customer'
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(profiles.full_name, excluded.full_name),
    avatar_url = coalesce(profiles.avatar_url, excluded.avatar_url),
    provider = excluded.provider,
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert or update on auth.users
for each row execute function public.handle_new_user();

-- Backfill profiles for existing auth.users who signed up before the trigger existed.
insert into public.profiles (id, email, full_name, avatar_url, provider, role)
select
  u.id,
  coalesce(u.email, ''),
  coalesce(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name'),
  u.raw_user_meta_data->>'avatar_url',
  coalesce(u.raw_app_meta_data->>'provider', 'google'),
  'customer'
from auth.users u
on conflict (id) do nothing;

-- avatars storage bucket
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "avatars public read" on storage.objects;
drop policy if exists "avatars owner write" on storage.objects;
drop policy if exists "avatars owner update" on storage.objects;
drop policy if exists "avatars owner delete" on storage.objects;

create policy "avatars public read" on storage.objects
  for select using (bucket_id = 'avatars');
create policy "avatars owner write" on storage.objects
  for insert with check (
    bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
  );
create policy "avatars owner update" on storage.objects
  for update using (
    bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
  );
create policy "avatars owner delete" on storage.objects
  for delete using (
    bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Make sure PostgREST picks up the new table immediately.
notify pgrst, 'reload schema';
