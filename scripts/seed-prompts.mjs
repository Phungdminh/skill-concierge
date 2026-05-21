// Generic prompt seeder. Reads a JSON file of prompt entries and upserts each
// into the products table (kind='prompt') via the service role key.
//
// Usage:
//   node scripts/seed-prompts.mjs                              # default: scripts/prompts.json
//   node scripts/seed-prompts.mjs path/to/my-prompts.json
//
// JSON shape — see scripts/prompts.example.json for a full template.

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

// Kept in sync with src/lib/product-types.ts:PROMPT_CATEGORIES. The DB has no
// CHECK constraint on this array, so the seeder rejects unknown values early.
const VALID_PROMPT_CATEGORIES = new Set([
  'content-creator',
  'social-media',
  'seo-blog',
  'video-tiktok',
  'giao-vien',
  'hoc-sinh-sinh-vien',
  'ke-toan-tai-chinh',
  'nhan-su-tuyen-dung',
  'ban-hang-sales',
  'ecommerce-shop',
  'cham-soc-khach-hang',
  'bat-dong-san',
  'luat-hop-dong',
  'y-te-suc-khoe',
  'du-lich-khach-san',
  'nha-hang-fnb',
  'thiet-ke-hinh-anh',
  'lap-trinh',
  'dich-thuat-ngon-ngu',
  'other',
]);

function slugify(input) {
  return String(input)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function requireString(entry, key, idx) {
  const v = entry[key];
  if (typeof v !== 'string' || v.trim().length === 0) {
    throw new Error(`Entry #${idx + 1}: field "${key}" must be a non-empty string.`);
  }
  return v;
}

function normalizeEntry(raw, idx) {
  const title = requireString(raw, 'title', idx).trim();
  const fullContent = requireString(raw, 'fullContent', idx);
  const tagline = requireString(raw, 'tagline', idx).trim();
  const explanation = requireString(raw, 'explanation', idx);

  const slug = (raw.slug && String(raw.slug).trim()) || slugify(title);
  const categories = Array.isArray(raw.categories) ? raw.categories.map(String) : [];
  if (categories.length === 0) {
    throw new Error(`Entry #${idx + 1} ("${title}"): "categories" must contain at least one value.`);
  }
  const invalid = categories.filter((c) => !VALID_PROMPT_CATEGORIES.has(c));
  if (invalid.length > 0) {
    throw new Error(
      `Entry #${idx + 1} ("${title}"): unknown categories: ${invalid.join(', ')}. ` +
        `See src/lib/product-types.ts:PROMPT_CATEGORIES.`,
    );
  }

  const tags = Array.isArray(raw.tags)
    ? raw.tags.map(String).map((t) => t.trim()).filter(Boolean)
    : [];

  return {
    kind: 'prompt',
    title,
    slug,
    tagline,
    description: raw.description ? String(raw.description) : null,
    notice: null,
    youtube_url: null,
    thumbnail_url: raw.thumbnailUrl ? String(raw.thumbnailUrl) : null,
    repo_url: null,
    gallery: raw.thumbnailUrl ? [String(raw.thumbnailUrl)] : [],
    pricing_mode: 'fixed',
    price_vnd: null,
    is_free: true,
    categories,
    tags,
    versions: [],
    deliverables: [],
    support_options: [],
    duration_label: null,
    prerequisites: [],
    prompt_meta: {
      preview_content: raw.previewContent ? String(raw.previewContent) : null,
      full_content: fullContent,
      explanation,
      related_slugs: Array.isArray(raw.relatedSlugs) ? raw.relatedSlugs.map(String) : [],
    },
    status: raw.status === 'draft' ? 'draft' : 'published',
    featured: Boolean(raw.featured) || false,
    sort_order: Number.isFinite(raw.sortOrder) ? raw.sortOrder : 0,
  };
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

const inputPath = path.resolve(
  process.cwd(),
  process.argv[2] ?? 'scripts/prompts.json',
);
if (path.basename(inputPath) === 'prompts.example.json') {
  console.error('Refusing to seed from prompts.example.json (template file).');
  console.error('Hint: copy it to scripts/prompts.json, edit your prompts, then re-run.');
  process.exit(1);
}
if (!fs.existsSync(inputPath)) {
  console.error(`Input file not found: ${inputPath}`);
  console.error(`Hint: copy scripts/prompts.example.json to ${inputPath} and edit.`);
  process.exit(1);
}

const raw = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
if (!Array.isArray(raw)) {
  console.error('Input must be a JSON array of prompt entries.');
  process.exit(1);
}
if (raw.length === 0) {
  console.log('No entries to seed. Exiting.');
  process.exit(0);
}

const entries = raw.map((entry, idx) => normalizeEntry(entry, idx));

// Reject duplicate slugs within the input file early so the user catches typos
// before any DB writes hit. Without this, the second entry would silently
// overwrite the first via the per-row upsert path below.
const slugCounts = new Map();
for (const entry of entries) {
  slugCounts.set(entry.slug, (slugCounts.get(entry.slug) ?? 0) + 1);
}
const duplicates = [...slugCounts.entries()].filter(([, n]) => n > 1).map(([s]) => s);
if (duplicates.length > 0) {
  console.error(`Duplicate slug(s) in input: ${duplicates.join(', ')}`);
  process.exit(1);
}

const ownerId = await findAdminUserId(adminEmail);
if (!ownerId) {
  console.error(`Admin user with email ${adminEmail} not found in auth.users.`);
  process.exit(1);
}

let created = 0;
let updated = 0;
for (const entry of entries) {
  const { data: existing } = await supabase
    .from('products')
    .select('id, slug')
    .eq('slug', entry.slug)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from('products')
      .update(entry)
      .eq('id', existing.id);
    if (error) {
      console.error(`✗ Update "${entry.slug}":`, error.message);
      process.exit(1);
    }
    console.log(`↻ updated  /prompts/${entry.slug}`);
    updated += 1;
  } else {
    const { error } = await supabase
      .from('products')
      .insert({ ...entry, owner_id: ownerId });
    if (error) {
      console.error(`✗ Insert "${entry.slug}":`, error.message);
      process.exit(1);
    }
    console.log(`✓ created  /prompts/${entry.slug}`);
    created += 1;
  }
}

console.log(`\nDone. ${created} created, ${updated} updated, total ${entries.length}.`);
