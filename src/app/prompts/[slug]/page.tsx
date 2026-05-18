import { notFound } from 'next/navigation';
import { ProductDetail } from '@/components/product-detail';
import { createClient } from '@/lib/supabase/server';
import { getPromptMeta, type Product, type PublicProductReview } from '@/lib/product-types';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from('products')
    .select('title, tagline')
    .eq('slug', slug)
    .eq('kind', 'prompt')
    .eq('status', 'published')
    .maybeSingle();
  if (!data) return { title: 'Prompt mẫu — SkillForge VN' };
  return {
    title: `${data.title} — SkillForge VN`,
    description: data.tagline ?? undefined,
  };
}

export default async function PromptDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .eq('kind', 'prompt')
    .eq('status', 'published')
    .maybeSingle();

  if (error || !data) notFound();

  const product = data as Product;
  const promptMeta = getPromptMeta(product);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: reviewRows } = await supabase
    .from('product_reviews')
    .select('id, rating, title, body, created_at')
    .eq('product_id', product.id)
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  const reviews = (reviewRows ?? []).map((row) => ({
    id: row.id,
    rating: row.rating,
    title: row.title,
    body: row.body,
    created_at: row.created_at,
    profile: null,
  })) as PublicProductReview[];
  const reviewSummary = {
    average: reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : null,
    count: reviews.length,
  };

  const relatedBySlug: Product[] = [];
  if (promptMeta.related_slugs && promptMeta.related_slugs.length > 0) {
    const { data: manualRelated } = await supabase
      .from('products')
      .select('*')
      .eq('kind', 'prompt')
      .eq('status', 'published')
      .in('slug', promptMeta.related_slugs)
      .neq('id', product.id);
    const bySlug = new Map((manualRelated ?? []).map((item) => [item.slug, item as Product]));
    for (const relatedSlug of promptMeta.related_slugs) {
      const related = bySlug.get(relatedSlug);
      if (related) relatedBySlug.push(related);
    }
  }

  const relatedProducts = [...relatedBySlug];
  if (relatedProducts.length < 4) {
    let fallbackQuery = supabase
      .from('products')
      .select('*')
      .eq('kind', 'prompt')
      .eq('status', 'published')
      .neq('id', product.id)
      .order('featured', { ascending: false })
      .order('sort_order', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(12);

    if (product.categories.length > 0) {
      fallbackQuery = fallbackQuery.overlaps('categories', product.categories);
    }

    const { data: fallbackRows } = await fallbackQuery;
    for (const item of fallbackRows ?? []) {
      if (relatedProducts.length >= 4) break;
      if (!relatedProducts.some((related) => related.id === item.id)) {
        relatedProducts.push(item as Product);
      }
    }
  }

  return (
    <ProductDetail
      product={product}
      viewerId={user?.id ?? null}
      reviews={reviews}
      reviewSummary={reviewSummary}
      relatedProducts={relatedProducts}
      loginHref={`/login?returnTo=/prompts/${product.slug}`}
    />
  );
}
