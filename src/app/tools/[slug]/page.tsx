import { notFound } from 'next/navigation';
import { ProductDetail } from '@/components/product-detail';
import { createClient } from '@/lib/supabase/server';
import { getRelatedProducts } from '@/lib/recommendations';
import {
  buildBreadcrumbJsonLd,
  buildProductJsonLd,
  buildProductMetadata,
  jsonLdScript,
} from '@/lib/seo';
import type { Product } from '@/lib/product-types';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from('products')
    .select('kind, slug, title, tagline, description, thumbnail_url, gallery')
    .eq('slug', slug)
    .eq('kind', 'tool')
    .eq('status', 'published')
    .maybeSingle();
  return buildProductMetadata(data as Parameters<typeof buildProductMetadata>[0]);
}

export default async function ToolDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .eq('kind', 'tool')
    .eq('status', 'published')
    .maybeSingle();

  if (error || !data) notFound();
  const product = data as Product;
  const relatedProducts = await getRelatedProducts({ product, supabase, limit: 4 });
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript([buildProductJsonLd(product), buildBreadcrumbJsonLd(product)]),
        }}
      />
      <ProductDetail product={product} relatedProducts={relatedProducts} />
    </>
  );
}
