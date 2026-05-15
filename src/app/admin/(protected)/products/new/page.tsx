import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { DashboardCard } from '@/components/admin/dashboard-card';
import { ProductForm } from '@/components/admin/product-form';
import { ALL_KINDS, type ProductKind } from '@/lib/product-types';

export const metadata = { title: 'Sản phẩm mới — Admin' };

interface PageProps {
  searchParams: Promise<{ kind?: string }>;
}

export default async function NewProductPage({ searchParams }: PageProps) {
  const { kind } = await searchParams;
  const defaultKind: ProductKind = (ALL_KINDS as string[]).includes(kind ?? '')
    ? (kind as ProductKind)
    : 'tool';

  return (
    <section className="pt-10">
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-1.5 text-sm text-foreground/60 transition hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Sản phẩm
      </Link>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
        Tạo sản phẩm mới
      </h1>
      <p className="mt-2 max-w-2xl text-foreground/65">
        Chọn loại trước. Sau khi lưu, mặc định là &ldquo;Bản nháp&rdquo; — đổi sang &ldquo;Đang bán&rdquo; để hiện trên site.
      </p>

      <div className="mt-6 max-w-md">
        <DashboardCard />
      </div>

      <div className="mt-8 max-w-4xl rounded-3xl border border-white/5 bg-[#0d0d10] p-6 md:p-8">
        <ProductForm mode="create" defaultKind={defaultKind} />
      </div>
    </section>
  );
}
