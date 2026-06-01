import Link from 'next/link';
import { Sparkles, FolderPlus } from 'lucide-react';
import { Footer } from '@/components/footer';
import { PageHeader } from '@/components/page-header';
import { FolderCard } from '@/components/folder-card';
import { ProductCard } from '@/components/product-card';
import { PromptSearch } from '@/components/prompt-search';
import { createClient } from '@/lib/supabase/server';
import { KIND_META, type Product } from '@/lib/product-types';
import type { PromptFolder } from '@/lib/prompt-folder-types';

const META = KIND_META.prompt;

export const metadata = {
  title: META.pluralLabel,
  description: META.description,
};

export const revalidate = 60;

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function PromptsPage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  const query = typeof q === 'string' ? q.trim() : '';

  const supabase = await createClient();

  const [foldersRes, productsRes, searchRes] = await Promise.all([
    supabase
      .from('prompt_folders')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true }),
    supabase
      .from('products')
      .select('folder_id')
      .eq('kind', 'prompt')
      .eq('status', 'published'),
    query
      ? supabase
          .from('products')
          .select('*')
          .eq('kind', 'prompt')
          .eq('status', 'published')
          .or(`title.ilike.%${query}%,tagline.ilike.%${query}%`)
          .order('view_count', { ascending: false })
          .limit(20)
      : null,
  ]);

  const searchResults = (searchRes?.data as Product[] | null) ?? [];

  const folders = (foldersRes.data as PromptFolder[] | null) ?? [];
  const tally = new Map<string, number>();
  let orphanCount = 0;
  for (const row of (productsRes.data ?? [])) {
    const folderId = (row as { folder_id: string | null }).folder_id;
    if (folderId) tally.set(folderId, (tally.get(folderId) ?? 0) + 1);
    else orphanCount += 1;
  }

  return (
    <>
      <main className="min-h-svh">
        <PageHeader
          eyebrow={META.pluralLabel}
          title="Prompt theo từng folder chủ đề"
          intro="Mỗi folder gom các prompt cùng chuyên ngành — content creator, sales, kế toán, lập trình, dịch thuật… Chọn folder phù hợp với công việc của bạn."
          crumbs={[{ label: 'Trang chủ', href: '/' }, { label: META.pluralLabel }]}
        />

        <section className="mx-auto w-full max-w-6xl px-6 py-10">
          <div className="mb-8 max-w-md">
            <PromptSearch defaultValue={query} />
          </div>

          {query ? (
            searchResults.length > 0 ? (
              <>
                <p className="mb-5 text-sm text-foreground/55">
                  {searchResults.length} kết quả cho &ldquo;{query}&rdquo;
                </p>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {searchResults.map((p) => (
                    <ProductCard key={p.id} product={p} hideKind />
                  ))}
                </div>
              </>
            ) : (
              <div className="grid place-items-center rounded-3xl border border-dashed border-border bg-card px-6 py-20 text-center">
                <h3 className="text-lg font-semibold">
                  Không tìm thấy prompt nào
                </h3>
                <p className="mt-2 max-w-md text-sm text-foreground/55">
                  Thử từ khóa khác hoặc xóa tìm kiếm để xem theo folder.
                </p>
              </div>
            )
          ) : folders.length === 0 ? (
            <div className="grid place-items-center rounded-3xl border border-dashed border-border bg-card px-6 py-20 text-center">
              <FolderPlus className="h-10 w-10 text-foreground/30" strokeWidth={1.5} />
              <h3 className="mt-5 text-lg font-semibold">Chưa có folder nào</h3>
              <p className="mt-2 max-w-md text-sm text-foreground/55">
                Folder prompt đang được tổng hợp. Quay lại sớm nhé.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {folders.map((folder) => (
                <FolderCard
                  key={folder.id}
                  folder={folder}
                  promptCount={tally.get(folder.id) ?? 0}
                />
              ))}
              {orphanCount > 0 && (
                <Link
                  href="/prompts/folder/_orphan"
                  className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-dashed border-border bg-card p-5 transition hover:border-brand-orange/30 hover:bg-surface-muted"
                >
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-muted text-foreground/60 ring-1 ring-[var(--ring-subtle)]">
                    <Sparkles className="h-5 w-5" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="mt-5 text-base font-semibold tracking-tight transition group-hover:text-brand-orange md:text-lg">
                      Chưa phân loại
                    </h3>
                    <p className="mt-2 text-sm text-foreground/60">
                      {orphanCount} prompt chưa được gán folder.
                    </p>
                  </div>
                </Link>
              )}
            </div>
          )}
        </section>

        <section className="mx-auto w-full max-w-4xl px-6 pb-24 pt-8 text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-brand-orange ring-1 ring-[var(--ring-subtle)]">
            <Sparkles className="h-6 w-6" strokeWidth={1.75} />
          </span>
          <h2 className="mt-5 text-balance text-2xl font-semibold tracking-tight md:text-3xl">
            Không thấy folder phù hợp?
          </h2>
          <p className="mt-3 text-foreground/65">
            Mô tả công việc lặp lại hằng ngày của bạn — mình build prompt riêng theo workflow.
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
