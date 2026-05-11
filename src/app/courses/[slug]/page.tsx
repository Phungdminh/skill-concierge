import { notFound } from 'next/navigation';
import { ProductDetail } from '@/components/product-detail';
import { createClient } from '@/lib/supabase/server';
import type { Product } from '@/lib/product-types';

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
    .eq('kind', 'course')
    .eq('status', 'published')
    .maybeSingle();
  if (!data) return { title: 'Khoá học — SkillForge VN' };
  return {
    title: `${data.title} — SkillForge VN`,
    description: data.tagline ?? undefined,
  };
}

export default async function CourseDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .eq('kind', 'course')
    .eq('status', 'published')
    .maybeSingle();

  if (error || !data) notFound();
  return <ProductDetail product={data as Product} />;
}
