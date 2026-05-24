import { notFound } from 'next/navigation';
import { ProductDetail } from '@/components/product-detail';
import { createClient } from '@/lib/supabase/server';
import type { Product } from '@/lib/product-types';
import {
  buildBreadcrumbJsonLd,
  buildProductJsonLd,
  buildProductMetadata,
  jsonLdScript,
} from '@/lib/seo';

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
    .eq('kind', 'webwork')
    .eq('status', 'published')
    .maybeSingle();
  return buildProductMetadata(data as Parameters<typeof buildProductMetadata>[0]);
}

export default async function WebDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .eq('kind', 'webwork')
    .eq('status', 'published')
    .maybeSingle();

  if (error || !data) notFound();
  const product = data as Product;
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript([buildProductJsonLd(product), buildBreadcrumbJsonLd(product)]),
        }}
      />
      <ProductDetail product={product} />
    </>
  );
}
