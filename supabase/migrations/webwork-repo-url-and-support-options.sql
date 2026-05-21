-- Migration: webwork repo_url column + replace one_on_one_call with github_repo.
-- Idempotent: safe to re-run on an already-migrated DB.
-- Wrapped in a transaction so the constraint drop + data backfill + new constraint
-- either all commit or all roll back — no window where products allow arbitrary
-- support_options values.

begin;

-- 1) repo_url for webwork products (paste public GitHub repo to showcase).
alter table products
  add column if not exists repo_url text;

-- 2) Audit: how many rows still carry the deprecated `one_on_one_call` option.
--    Logged as a notice so a deploy operator can see the blast radius before
--    the next statement strips the value.
do $$
declare
  affected_rows integer;
begin
  select count(*)
    into affected_rows
    from products
    where 'one_on_one_call' = any(coalesce(support_options, '{}'::text[]));
  raise notice 'Migration: % product row(s) still contain one_on_one_call and will be cleaned.', affected_rows;
end
$$;

-- 3) Drop old constraint so the cleanup update is allowed to write the new shape.
alter table products
  drop constraint if exists products_support_options_check;

-- 4) Strip deprecated value in-place.
update products
  set support_options = array_remove(coalesce(support_options, '{}'::text[]), 'one_on_one_call')
  where 'one_on_one_call' = any(coalesce(support_options, '{}'::text[]));

-- 5) Re-add the constraint with the new enum.
alter table products
  add constraint products_support_options_check check (
    support_options is null
    or support_options <@ array['drive_folder', 'zalo_group', 'github_repo']::text[]
  );

commit;
