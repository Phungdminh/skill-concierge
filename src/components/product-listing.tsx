import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { Nav } from '@/components/nav';
import { Footer } from '@/components/footer';
import { PageHeader } from '@/components/page-header';
import { ProductCard } from '@/components/product-card';
import { createClient } from '@/lib/supabase/server';
import {
  KIND_META,
  categoriesFor,
  type Product,
  type ProductKind,
} from '@/lib/product-types';
import { cn } from '@/lib/utils';

interface ProductListingProps {
  kind: ProductKind;
  category?: string;
  /** Override the auto-generated page header */
  title?: string;
  intro?: string;
}

export async function ProductListing({ kind, category, title, intro }: ProductListingProps) {
  const meta = KIND_META[kind];
  const Icon = meta.icon;
  const cats = categoriesFor(kind);
  const validCategory = category && cats.some((c) => c.value === category) ? category : undefined;
  const activeCategoryLabel = validCategory ? cats.find((c) => c.value === validCategory)?.label : undefined;
  const supabase = await createClient();

  let query = supabase
    .from('products')
    .select('*')
    .eq('kind', kind)
    .eq('status', 'published')
    .order('featured', { ascending: false })
    .order('sort_order', { ascending: false })
    .order('created_at', { ascending: false });
  if (validCategory) query = query.contains('categories', [validCategory]);

  const { data, error } = await query;
  const products: Product[] = (data as Product[] | null) ?? [];

  return (
    <>
      <Nav />
      <main className="min-h-svh">
        <PageHeader
          eyebrow={meta.pluralLabel}
          title={title ?? meta.label}
          intro={intro ?? meta.description}
          crumbs={[{ label: 'Trang chủ', href: '/' }, { label: meta.pluralLabel }]}
        />

        <section className="mx-auto w-full max-w-6xl px-6 pt-2">
          <div className="flex flex-wrap items-center gap-2">
            <CategoryChip href={meta.route} active={!category} label="Tất cả" />
            {cats.map((c) => (
              <CategoryChip
                key={c.value}
                href={`${meta.route}?category=${c.value}`}
                active={validCategory === c.value}
                label={c.label}
              />
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-6 py-10">
          {error ? (
            <ErrorState message={error.message} />
          ) : products.length === 0 ? (
            <EmptyState kind={kind} category={activeCategoryLabel} />
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} hideKind />
              ))}
            </div>
          )}
        </section>

        <section className="mx-auto w-full max-w-4xl px-6 pb-24 pt-8 text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.04] text-brand-orange ring-1 ring-white/10">
            <Icon className="h-6 w-6" strokeWidth={1.75} />
          </span>
          <h2 className="mt-5 text-balance text-2xl font-semibold tracking-tight md:text-3xl">
            Không thấy {meta.shortLabel.toLowerCase()} bạn cần?
          </h2>
          <p className="mt-3 text-foreground/65">
            Mô tả nhu cầu cụ thể — mình build riêng / quote theo yêu cầu.
          </p>
          <Link
            href={`/contact?kind=${kind}`}
            className="hero-primary-cta bg-brand-gradient glow-red mt-6 inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold text-black"
          >
            <Sparkles className="h-4 w-4" /> {meta.ctaLabel}
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}

function CategoryChip({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'subtle-nav rounded-full border px-4 py-1.5 text-sm focus-visible:outline-none',
        active
          ? 'border-brand-orange/30 bg-brand-orange/15 font-semibold text-brand-orange ring-1 ring-brand-orange/30'
          : 'border-white/10 bg-white/[0.02] text-foreground/75',
      )}
    >
      {label}
    </Link>
  );
}

function EmptyState({ kind, category }: { kind: ProductKind; category?: string }) {
  const meta = KIND_META[kind];
  const Icon = meta.icon;
  return (
    <div className="grid place-items-center rounded-3xl border border-dashed border-white/10 bg-[#0a0a0b] px-6 py-20 text-center">
      <Icon className="h-10 w-10 text-foreground/30" strokeWidth={1.5} />
      <h3 className="mt-5 text-lg font-semibold">
        {category ? `Chưa có ${meta.shortLabel.toLowerCase()} nào trong "${category}"` : meta.emptyTitle}
      </h3>
      <p className="mt-2 max-w-md text-sm text-foreground/55">{meta.emptyBody}</p>
      <Link
        href={`/contact?kind=${kind}`}
        className="featured-cta mt-6 inline-flex items-center gap-2 rounded-xl border border-white/10 px-5 py-2.5 text-sm"
      >
        {meta.ctaLabel}
      </Link>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-6 text-sm text-red-200">
      Không tải được danh sách: {message}
    </div>
  );
}
