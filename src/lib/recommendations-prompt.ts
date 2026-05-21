import type { Product } from '@/lib/product-types';
import { getPromptMeta } from '@/lib/product-types';
import type { createClient } from '@/lib/supabase/server';

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

interface GetRelatedPromptsArgs {
  product: Product;
  supabase: SupabaseServerClient;
  limit?: number;
  manualSlugs?: string[];
}

const MAX_LIMIT = 8;
const MIN_TOKEN_LENGTH = 2;
const CACHE_TTL_MS = 60_000;

const VIETNAMESE_STOP_WORDS = new Set([
  'va', 'cua', 'cho', 'voi', 'la', 'tu', 'den', 'tai', 'trong', 'ngoai',
  'tren', 'duoi', 'sau', 'truoc', 'nay', 'do', 'kia', 'mot', 'hai', 'ba',
  'cac', 'nhung', 'moi', 'tat', 'ca', 'rat', 'qua', 'lam', 'duoc', 'co',
  'khong', 'chua', 'da', 'dang', 'se', 'phai', 'nen', 'cung', 'thi', 'ma',
  'neu', 'hoac', 'hay', 'nhu', 'vi', 'boi', 'nho', 'ban', 'minh', 'toi',
  'no', 'ho', 'chung', 'ai', 'gi', 'sao', 'nao', 'dau', 'khi', 'luc',
  'ra', 'vao', 'len', 'xuong', 'di', 've', 'qua', 'lai', 'theo',
  'the', 'and', 'or', 'for', 'with', 'in', 'on', 'at', 'to', 'of',
  'is', 'are', 'was', 'were', 'be', 'been', 'being', 'a', 'an',
]);

interface CorpusEntry {
  product: Product;
  tokens: string[];
  termFreq: Map<string, number>;
}

interface CachedCorpus {
  signature: string;
  entries: CorpusEntry[];
  idf: Map<string, number>;
  vectors: Map<string, Map<string, number>>;
  norms: Map<string, number>;
  cachedAt: number;
}

let corpusCache: CachedCorpus | null = null;

export async function getRelatedPromptsTfIdf({
  product,
  supabase,
  limit = 4,
  manualSlugs = [],
}: GetRelatedPromptsArgs): Promise<Product[]> {
  const cappedLimit = Math.max(1, Math.min(limit, MAX_LIMIT));
  const picked: Product[] = [];
  const seen = new Set<string>([product.id]);

  if (manualSlugs.length > 0) {
    const { data: manualRows } = await supabase
      .from('products')
      .select('*')
      .eq('kind', 'prompt')
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

  const corpus = await loadPromptCorpus(supabase);
  if (corpus.entries.length === 0) return picked;

  const queryVector = corpus.vectors.get(product.id);
  const queryNorm = corpus.norms.get(product.id);
  if (!queryVector || !queryNorm) return picked;

  const scored: { product: Product; similarity: number }[] = [];
  for (const entry of corpus.entries) {
    if (seen.has(entry.product.id)) continue;
    const otherVector = corpus.vectors.get(entry.product.id);
    const otherNorm = corpus.norms.get(entry.product.id);
    if (!otherVector || !otherNorm) continue;
    const similarity = cosineSimilarity(queryVector, queryNorm, otherVector, otherNorm);
    if (similarity > 0) scored.push({ product: entry.product, similarity });
  }

  scored.sort((a, b) => {
    if (b.similarity !== a.similarity) return b.similarity - a.similarity;
    if (b.product.view_count !== a.product.view_count) {
      return b.product.view_count - a.product.view_count;
    }
    return b.product.created_at.localeCompare(a.product.created_at);
  });

  for (const { product: candidate } of scored) {
    if (picked.length >= cappedLimit) break;
    picked.push(candidate);
    seen.add(candidate.id);
  }

  return picked;
}

async function loadPromptCorpus(supabase: SupabaseServerClient): Promise<CachedCorpus> {
  const { data: rows } = await supabase
    .from('products')
    .select('*')
    .eq('kind', 'prompt')
    .eq('status', 'published');

  const products = (rows ?? []) as Product[];
  const signature = buildCorpusSignature(products);
  const now = Date.now();

  if (
    corpusCache &&
    corpusCache.signature === signature &&
    now - corpusCache.cachedAt < CACHE_TTL_MS
  ) {
    return corpusCache;
  }

  const entries: CorpusEntry[] = products.map((product) => {
    const tokens = tokenize(buildPromptText(product));
    return {
      product,
      tokens,
      termFreq: countTerms(tokens),
    };
  });

  const docFreq = new Map<string, number>();
  for (const entry of entries) {
    const uniqueTerms = new Set(entry.termFreq.keys());
    for (const term of uniqueTerms) {
      docFreq.set(term, (docFreq.get(term) ?? 0) + 1);
    }
  }

  const totalDocs = Math.max(1, entries.length);
  const idf = new Map<string, number>();
  for (const [term, freq] of docFreq) {
    idf.set(term, Math.log((1 + totalDocs) / (1 + freq)) + 1);
  }

  const vectors = new Map<string, Map<string, number>>();
  const norms = new Map<string, number>();

  for (const entry of entries) {
    const vector = new Map<string, number>();
    const docLength = Math.max(1, entry.tokens.length);
    let normSquared = 0;
    for (const [term, freq] of entry.termFreq) {
      const tf = freq / docLength;
      const weight = tf * (idf.get(term) ?? 0);
      if (weight > 0) {
        vector.set(term, weight);
        normSquared += weight * weight;
      }
    }
    vectors.set(entry.product.id, vector);
    norms.set(entry.product.id, Math.sqrt(normSquared));
  }

  corpusCache = { signature, entries, idf, vectors, norms, cachedAt: now };
  return corpusCache;
}

function buildCorpusSignature(products: Product[]): string {
  return products
    .map((product) => `${product.id}:${product.updated_at}`)
    .sort()
    .join('|');
}

function buildPromptText(product: Product): string {
  const promptMeta = getPromptMeta(product);
  return [
    product.title,
    product.title,
    product.tagline ?? '',
    product.description ?? '',
    product.tags.join(' '),
    product.categories.join(' '),
    promptMeta.preview_content ?? '',
    promptMeta.full_content ?? '',
    promptMeta.explanation ?? '',
  ]
    .filter(Boolean)
    .join(' \n ');
}

function tokenize(input: string): string[] {
  const normalized = stripDiacritics(input.toLowerCase());
  const tokens: string[] = [];
  let current = '';
  for (const char of normalized) {
    if ((char >= 'a' && char <= 'z') || (char >= '0' && char <= '9')) {
      current += char;
    } else {
      if (current.length >= MIN_TOKEN_LENGTH && !VIETNAMESE_STOP_WORDS.has(current)) {
        tokens.push(current);
      }
      current = '';
    }
  }
  if (current.length >= MIN_TOKEN_LENGTH && !VIETNAMESE_STOP_WORDS.has(current)) {
    tokens.push(current);
  }
  return tokens;
}

function stripDiacritics(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd');
}

function countTerms(tokens: string[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const token of tokens) {
    counts.set(token, (counts.get(token) ?? 0) + 1);
  }
  return counts;
}

function cosineSimilarity(
  a: Map<string, number>,
  normA: number,
  b: Map<string, number>,
  normB: number,
): number {
  if (normA === 0 || normB === 0) return 0;
  const [smaller, larger] = a.size <= b.size ? [a, b] : [b, a];
  let dot = 0;
  for (const [term, weight] of smaller) {
    const other = larger.get(term);
    if (other !== undefined) dot += weight * other;
  }
  return dot / (normA * normB);
}
