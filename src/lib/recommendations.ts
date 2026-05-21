import type { Product } from '@/lib/product-types';
import type { createClient } from '@/lib/supabase/server';

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

interface GetRelatedProductsArgs {
  product: Product;
  supabase: SupabaseServerClient;
  limit?: number;
  manualSlugs?: string[];
}

const CANDIDATE_POOL_SIZE = 30;
const MAX_LIMIT = 8;

const CATEGORY_WEIGHT = 3;
const TAG_WEIGHT = 1;
const FEATURED_BOOST = 0.5;
const VIEW_BOOST_FACTOR = 0.2;

export async function getRelatedProducts({
  product,
  supabase,
  limit = 4,
  manualSlugs = [],
}: GetRelatedProductsArgs): Promise<Product[]> {
  const cappedLimit = Math.max(1, Math.min(limit, MAX_LIMIT));
  const picked: Product[] = [];
  const seen = new Set<string>([product.id]);

  if (manualSlugs.length > 0) {
    const { data: manualRows } = await supabase
      .from('products')
      .select('*')
      .eq('kind', product.kind)
      .eq('status', 'published')
      .in('slug', manualSlugs)
      .neq('id', product.id);

    const bySlug = new Map<string, Product>(
      (manualRows ?? []).map((row) => [row.slug as string, row as Product]),
    );
    for (const slug of manualSlugs) {
      const match = bySlug.get(slug);
      if (match && !seen.has(match.id)) {
        picked.push(match);
        seen.add(match.id);
        if (picked.length >= cappedLimit) return picked;
      }
    }
  }

  const candidates = await fetchCandidatePool(product, supabase);
  const scored = candidates
    .filter((candidate) => !seen.has(candidate.id))
    .map((candidate) => ({
      candidate,
      score: scoreCandidate(product, candidate),
    }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.candidate.view_count !== a.candidate.view_count) {
        return b.candidate.view_count - a.candidate.view_count;
      }
      return b.candidate.created_at.localeCompare(a.candidate.created_at);
    });

  for (const { candidate } of scored) {
    if (picked.length >= cappedLimit) break;
    picked.push(candidate);
    seen.add(candidate.id);
  }

  return picked;
}

async function fetchCandidatePool(
  product: Product,
  supabase: SupabaseServerClient,
): Promise<Product[]> {
  const baseQuery = () =>
    supabase
      .from('products')
      .select('*')
      .eq('kind', product.kind)
      .eq('status', 'published')
      .neq('id', product.id)
      .limit(CANDIDATE_POOL_SIZE);

  const rows = new Map<string, Product>();

  if (product.categories.length > 0) {
    const { data } = await baseQuery().overlaps('categories', product.categories);
    for (const row of data ?? []) rows.set((row as Product).id, row as Product);
  }

  if (product.tags.length > 0 && rows.size < CANDIDATE_POOL_SIZE) {
    const { data } = await baseQuery().overlaps('tags', product.tags);
    for (const row of data ?? []) {
      if (!rows.has((row as Product).id)) {
        rows.set((row as Product).id, row as Product);
      }
    }
  }

  if (rows.size === 0) {
    const { data } = await baseQuery()
      .order('featured', { ascending: false })
      .order('sort_order', { ascending: false })
      .order('view_count', { ascending: false })
      .order('created_at', { ascending: false });
    for (const row of data ?? []) rows.set((row as Product).id, row as Product);
  }

  return Array.from(rows.values());
}

function scoreCandidate(product: Product, candidate: Product): number {
  const categoryOverlap = countOverlap(product.categories, candidate.categories);
  const tagOverlap = countOverlap(product.tags, candidate.tags);

  let score = categoryOverlap * CATEGORY_WEIGHT + tagOverlap * TAG_WEIGHT;
  if (candidate.featured) score += FEATURED_BOOST;
  score += Math.log10(Math.max(0, candidate.view_count) + 1) * VIEW_BOOST_FACTOR;

  return score;
}

function countOverlap(a: string[], b: string[]): number {
  if (a.length === 0 || b.length === 0) return 0;
  const set = new Set(a);
  let count = 0;
  for (const value of b) {
    if (set.has(value)) count += 1;
  }
  return count;
}
