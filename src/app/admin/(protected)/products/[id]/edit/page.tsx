import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { DashboardCard } from '@/components/admin/dashboard-card';
import { ProductForm } from '@/components/admin/product-form';
import { createClient } from '@/lib/supabase/server';
import { KIND_META, type Product } from '@/lib/product-types';

export const metadata = { title: 'Sửa sản phẩm — Admin' };
export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error || !data) notFound();
  const product = data as Product;
  const meta = KIND_META[product.kind];

  return (
    <section className="pt-10">
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-1.5 text-sm text-foreground/60 transition hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Sản phẩm
      </Link>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
        Sửa: {product.title}
      </h1>
      <p className="mt-2 max-w-2xl text-foreground/65">
        Loại: <span className="text-foreground/90">{meta.label}</span> · URL:{' '}
        <code className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[12px]">
          {meta.route}/{product.slug}
        </code>
      </p>

      <div className="mt-6 max-w-md">
        <DashboardCard />
      </div>

      <div className="mt-8 max-w-4xl rounded-3xl border border-white/5 bg-[#0d0d10] p-6 md:p-8">
        <ProductForm mode="edit" initial={product} />
      </div>
    </section>
  );
}
