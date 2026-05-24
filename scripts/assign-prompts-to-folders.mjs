// Assign existing prompts to the appropriate prompt_folders by mapping each
// product slug → folder slug. Runs idempotently.
//
// Run after `supabase/migrations/prompt-folders.sql` is applied:
//   node --env-file=.env.local scripts/assign-prompts-to-folders.mjs

import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// Hand-curated mapping: product_slug → folder_slug.
// Reasoning lives in the report doc; this file is the source of truth for
// historical prompt placements.
const ASSIGNMENTS = [
  { product_slug: 'prompt-viet-meta-description-seo',                                folder_slug: 'seo-blog' },
  { product_slug: 'prompt-tao-lich-hoc-hieu-qua-toi-uu-cho-moi-loi-song-ca-nhan',    folder_slug: 'hoc-sinh-sinh-vien' },
  { product_slug: 'prompt-xay-dung-content-website-chuyen-nghiep-theo-ngach',        folder_slug: 'content-creator' },
  { product_slug: 'prompt-ai-tao-mo-bai-thuyet-trinh-5-kich-ban-hook',               folder_slug: 'content-creator' },
  { product_slug: 'prompt-huong-dan-xay-dung-chatbot-thuong-mai-dien-tu-cho-cua-hang', folder_slug: 'ecommerce-shop' },
  { product_slug: 'prompt-y-tuong-content-marketing-mang-xa-hoi',                    folder_slug: 'social-media' },
];

async function main() {
  // 1) Verify migration is applied.
  const probe = await supabase.from('prompt_folders').select('id, slug').limit(1);
  if (probe.error) {
    console.error('\n⚠  prompt_folders table not found. Run supabase/migrations/prompt-folders.sql first.\n');
    console.error('   Error:', probe.error.message);
    process.exit(1);
  }

  // 2) Load full folder registry.
  const { data: folders, error: foldersError } = await supabase
    .from('prompt_folders')
    .select('id, slug, name');
  if (foldersError) {
    console.error('Failed to load folders:', foldersError.message);
    process.exit(1);
  }
  const folderBySlug = new Map(folders.map((f) => [f.slug, f]));
  console.log(`Loaded ${folders.length} folders.`);

  // 3) Apply each assignment.
  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const { product_slug, folder_slug } of ASSIGNMENTS) {
    const folder = folderBySlug.get(folder_slug);
    if (!folder) {
      console.error(`✗ ${product_slug}  → folder "${folder_slug}" not found, skipping`);
      failed += 1;
      continue;
    }

    // Find the prompt by slug (must be kind='prompt' to avoid accidental writes).
    const { data: product, error: lookupError } = await supabase
      .from('products')
      .select('id, slug, folder_id')
      .eq('slug', product_slug)
      .eq('kind', 'prompt')
      .maybeSingle();

    if (lookupError) {
      console.error(`✗ ${product_slug}  lookup failed:`, lookupError.message);
      failed += 1;
      continue;
    }

    if (!product) {
      console.log(`-  ${product_slug}  not found, skipping`);
      skipped += 1;
      continue;
    }

    if (product.folder_id === folder.id) {
      console.log(`=  ${product_slug.padEnd(60)} already → ${folder.name}`);
      skipped += 1;
      continue;
    }

    const { error: updateError } = await supabase
      .from('products')
      .update({ folder_id: folder.id })
      .eq('id', product.id);

    if (updateError) {
      console.error(`✗  ${product_slug}  update failed:`, updateError.message);
      failed += 1;
      continue;
    }

    console.log(`✓  ${product_slug.padEnd(60)} → ${folder.name}`);
    updated += 1;
  }

  console.log(`\nSummary: updated=${updated} skipped=${skipped} failed=${failed}`);
  if (failed > 0) process.exit(2);
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
