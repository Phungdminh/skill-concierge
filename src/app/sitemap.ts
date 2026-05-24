import type { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';
import { SITE_URL } from '@/lib/site';

export const revalidate = 3600;

const STATIC_ROUTES: { path: string; changeFreq: MetadataRoute.Sitemap[number]['changeFrequency']; priority: number }[] = [
  { path: '/', changeFreq: 'daily', priority: 1.0 },
  { path: '/tools', changeFreq: 'daily', priority: 0.9 },
  { path: '/prompts', changeFreq: 'daily', priority: 0.9 },
  { path: '/web', changeFreq: 'weekly', priority: 0.8 },
  { path: '/contact', changeFreq: 'monthly', priority: 0.6 },
  { path: '/about', changeFreq: 'monthly', priority: 0.5 },
  { path: '/process', changeFreq: 'monthly', priority: 0.5 },
  { path: '/legal/privacy', changeFreq: 'yearly', priority: 0.2 },
  { path: '/legal/terms', changeFreq: 'yearly', priority: 0.2 },
];

const KIND_TO_PATH: Record<'tool' | 'prompt' | 'webwork', string> = {
  tool: '/tools',
  prompt: '/prompts',
  webwork: '/web',
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFreq,
    priority: r.priority,
  }));

  try {
    const supabase = await createClient();
    const [productsRes, foldersRes] = await Promise.all([
      supabase
        .from('products')
        .select('slug, kind, updated_at')
        .eq('status', 'published'),
      supabase
        .from('prompt_folders')
        .select('slug, updated_at'),
    ]);

    const productEntries: MetadataRoute.Sitemap = (productsRes.data ?? [])
      .filter((p) => p.kind in KIND_TO_PATH && typeof p.slug === 'string')
      .map((p) => ({
        url: `${SITE_URL}${KIND_TO_PATH[p.kind as 'tool' | 'prompt' | 'webwork']}/${p.slug}`,
        lastModified: p.updated_at ? new Date(p.updated_at) : now,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }));

    const folderEntries: MetadataRoute.Sitemap = (foldersRes.data ?? [])
      .filter((f) => typeof f.slug === 'string')
      .map((f) => ({
        url: `${SITE_URL}/prompts/folder/${f.slug}`,
        lastModified: f.updated_at ? new Date(f.updated_at) : now,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));

    return [...staticEntries, ...folderEntries, ...productEntries];
  } catch (err) {
    console.error('sitemap: failed to fetch entries', err);
    return staticEntries;
  }
}
