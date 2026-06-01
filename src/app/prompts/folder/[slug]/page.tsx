import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { notFound } from 'next/navigation';
import { Footer } from '@/components/footer';
import { PageHeader } from '@/components/page-header';
import { ProductCard } from '@/components/product-card';
import { createClient } from '@/lib/supabase/server';
import { KIND_META, type Product } from '@/lib/product-types';
import type { PromptFolder } from '@/lib/prompt-folder-types';
import { absoluteUrl } from '@/lib/site';

const META = KIND_META.prompt;
const ORPHAN_SLUG = '_orphan';

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  if (slug === ORPHAN_SLUG) {
    return {
      title: 'Prompt chưa phân loại',
      description: 'Các prompt chưa được gán folder cụ thể.',
      alternates: { canonical: `/prompts/folder/${ORPHAN_SLUG}` },
    };
  }
  const supabase = await createClient();
  const { data } = await supabase
    .from('prompt_folders')
    .select('name, description')
    .eq('slug', slug)
    .maybeSingle();
  if (!data) return { title: 'Folder prompt' };
  return {
    title: data.name,
    description: data.description ?? `Prompt mẫu trong folder ${data.name}.`,
    alternates: { canonical: `/prompts/folder/${slug}` },
    openGraph: {
      type: 'website',
      title: `${data.name} — SkillForge VN`,
      description: data.description ?? `Prompt mẫu trong folder ${data.name}.`,
      url: absoluteUrl(`/prompts/folder/${slug}`),
      locale: 'vi_VN',
    },
  };
}

export default async function PromptFolderPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  let folder: PromptFolder | null = null;
  let products: Product[] = [];

  if (slug === ORPHAN_SLUG) {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('kind', 'prompt')
      .eq('status', 'published')
      .is('folder_id', null)
      .order('featured', { ascending: false })
      .order('sort_order', { ascending: false })
      .order('created_at', { ascending: false });
    products = (data as Product[] | null) ?? [];
  } else {
    const { data: folderRow } = await supabase
      .from('prompt_folders')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();
    if (!folderRow) notFound();
    folder = folderRow as PromptFolder;

    const { data: productsRow } = await supabase
      .from('products')
      .select('*')
      .eq('kind', 'prompt')
      .eq('status', 'published')
      .eq('folder_id', folder.id)
      .order('featured', { ascending: false })
      .order('sort_order', { ascending: false })
      .order('created_at', { ascending: false });
    products = (productsRow as Product[] | null) ?? [];
  }

  const title = folder ? folder.name : 'Prompt chưa phân loại';
  const intro =
    folder?.description ??
    (folder
      ? `Prompt mẫu chuyên cho ${folder.name.toLowerCase()}.`
      : 'Các prompt chưa được gán folder cụ thể.');

  return (
    <>
      <main className="min-h-svh">
        <PageHeader
          eyebrow="Folder"
          title={title}
          intro={intro}
          crumbs={[
            { label: 'Trang chủ', href: '/' },
            { label: META.pluralLabel, href: '/prompts' },
            { label: title },
          ]}
        />

        <section className="mx-auto w-full max-w-6xl px-6 pt-2">
          <Link
            href="/prompts"
            className="inline-flex items-center gap-1.5 text-sm text-foreground/60 transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Tất cả folder
          </Link>
        </section>

        <section className="mx-auto w-full max-w-6xl px-6 py-10">
          {products.length === 0 ? (
            <div className="grid place-items-center rounded-3xl border border-dashed border-border bg-card px-6 py-20 text-center">
              <Sparkles className="h-10 w-10 text-foreground/30" strokeWidth={1.5} />
              <h3 className="mt-5 text-lg font-semibold">Folder này chưa có prompt</h3>
              <p className="mt-2 max-w-md text-sm text-foreground/55">
                Mình đang tổng hợp. Trong lúc đó bạn có thể duyệt các folder khác.
              </p>
              <Link
                href="/prompts"
                className="featured-cta mt-6 inline-flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm"
              >
                Xem các folder khác
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} hideKind />
              ))}
            </div>
          )}
        </section>

        <section className="mx-auto w-full max-w-4xl px-6 pb-24 pt-8 text-center">
          <h2 className="text-balance text-2xl font-semibold tracking-tight md:text-3xl">
            Cần prompt riêng theo workflow?
          </h2>
          <p className="mt-3 text-foreground/65">
            Mô tả task lặp lại — mình build prompt set sạch dùng được ngay.
          </p>
          <Link
            href={`/contact?kind=prompt`}
            className="hero-primary-cta bg-brand-gradient glow-red mt-6 inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold text-black"
          >
            <Sparkles className="h-4 w-4" /> {META.ctaLabel}
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
