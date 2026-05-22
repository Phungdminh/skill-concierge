import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ProductImportForm } from '@/components/admin/product-import-form';

export const metadata = { title: 'Import sản phẩm — Admin' };

export default function ImportProductsPage() {
  return (
    <section className="pt-10">
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-1.5 text-sm text-foreground/60 transition hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Sản phẩm
      </Link>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Import sản phẩm từ Sheet / CSV
          </h1>
          <p className="mt-2 max-w-2xl text-foreground/65">
            Dán bảng từ Google Sheets hoặc upload CSV để tạo hàng loạt tool, prompt và web/portfolio ngay trong admin.
          </p>
        </div>
      </div>

      <div className="mt-8 max-w-6xl">
        <ProductImportForm />
      </div>
    </section>
  );
}
