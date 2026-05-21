-- Adds the `notice` column to products so admin-created products with a customer-facing
-- limitation/usage note can be saved. Idempotent: safe to run multiple times.

alter table products
  add column if not exists notice text;
