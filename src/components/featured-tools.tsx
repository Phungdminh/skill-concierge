import Link from 'next/link';
import { ArrowUpRight, Bot } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { ProductCard } from '@/components/product-card';
import type { Product } from '@/lib/product-types';

export async function FeaturedTools() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('kind', 'tool')
    .eq('status', 'published')
    .order('featured', { ascending: false })
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })
    .limit(6);
  const tools: Product[] = (data as Product[] | null) ?? [];
  return (
    <section
      id="featured"
      className="relative mx-auto w-full max-w-6xl px-6 py-24"
    >
      <div className="mb-10 flex flex-col items-start justify-between gap-4 md:mb-12 md:flex-row md:items-end">
        <div>
          <p className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">
            Featured
          </p>
          <h2 className="text-balance text-3xl font-semibold tracking-tight md:text-5xl">
            Tool đang bán
          </h2>
          <p className="mt-4 max-w-2xl text-foreground/60">
            Mỗi tool có video demo trên YouTube — bạn xem cách nó hoạt động thật trước khi mua.
          </p>
        </div>
        <Link
          href="/tools"
          className="featured-cta group inline-flex min-h-12 items-center gap-2 self-start rounded-full border border-white/12 bg-white/[0.03] px-5 py-2.5 text-sm font-medium text-foreground/90 md:self-end"
        >
          Xem tất cả tool
          <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>

      {tools.length === 0 ? (
        <div className="grid place-items-center rounded-3xl border border-dashed border-white/10 bg-[#0a0a0b] px-6 py-20 text-center">
          <Bot className="h-10 w-10 text-foreground/30" strokeWidth={1.5} />
          <h3 className="mt-5 text-lg font-semibold">Tool mới đang trên đường</h3>
          <p className="mt-2 max-w-md text-sm text-foreground/55">
            Đang đóng gói tool tiếp theo — quay lại sớm nhé. Hoặc nói với mình bạn cần gì.
          </p>
          <Link
            href="/contact"
            className="featured-cta mt-6 inline-flex min-h-12 items-center gap-2 rounded-xl border border-white/12 bg-white/[0.03] px-6 py-3 text-sm font-medium text-foreground/90"
          >
            Đặt tool riêng
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <ProductCard key={tool.id} product={tool} hideKind />
          ))}
        </div>
      )}
    </section>
  );
}
