import { Footer } from '@/components/footer';
import { PageHeader } from '@/components/page-header';
import { InquiryForm } from '@/components/inquiry-form';
import { createClient } from '@/lib/supabase/server';
import { ArrowUpRight } from 'lucide-react';
import {
  ALL_KINDS,
  KIND_META,
  type Product,
  type ProductKind,
} from '@/lib/product-types';

export const metadata = {
  title: 'Liên hệ — SkillForge VN',
  description:
    'Đặt mua tool, đặt setup, lấy prompt mẫu, hay yêu cầu làm web — rep trong 24h qua Zalo / Telegram / Email.',
};

const CHANNELS = [
  {
    brand: 'zalo' as const,
    label: 'Zalo',
    value: '0973309676',
    hint: 'Phản hồi nhanh nhất · <4h trong giờ HC',
    href: 'https://zalo.me/0973309676',
  },
  {
    brand: 'telegram' as const,
    label: 'Telegram',
    value: '@ducminh299',
    hint: 'Cho khách quốc tế · <8h',
    href: 'https://t.me/ducminh299',
  },
  {
    brand: 'gmail' as const,
    label: 'Gmail',
    value: 'Phungducminh299@gmail.com',
    hint: 'Brief dài, file đính kèm · <24h',
    href: 'mailto:Phungducminh299@gmail.com',
  },
];

interface PageProps {
  searchParams: Promise<{ product?: string; kind?: string }>;
}

export default async function ContactPage({ searchParams }: PageProps) {
  const { product: productSlug, kind: kindParam } = await searchParams;
  const kind: ProductKind | undefined = (ALL_KINDS as string[]).includes(kindParam ?? '')
    ? (kindParam as ProductKind)
    : undefined;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let product: Pick<Product, 'id' | 'slug' | 'title' | 'kind'> | null = null;
  if (productSlug) {
    let q = supabase
      .from('products')
      .select('id, slug, title, kind')
      .eq('slug', productSlug)
      .eq('status', 'published');
    if (kind) q = q.eq('kind', kind);
    const { data } = await q.maybeSingle();
    if (data) product = data;
  }

  const showForm = product != null || kind != null;
  const kindMeta = kind ? KIND_META[kind] : null;

  const title = product
    ? `Đặt: ${product.title}`
    : kindMeta
      ? kindMeta.ctaLabel
      : 'Làm theo yêu cầu riêng';

  const intro = product
    ? 'Điền form bên dưới — mình rep trong 24h kèm thông tin thanh toán và bước tiếp theo.'
    : kindMeta
      ? `Mô tả nhu cầu ${kindMeta.shortLabel.toLowerCase()} riêng của bạn — mình rep trong 24h với hướng xử lý và quote sơ bộ.`
      : 'Kể nhu cầu của bạn về tool, setup, prompt mẫu hoặc web — mình rep trong 24h với mức quote sơ bộ.';

  return (
    <>
      <main className="min-h-svh">
        <PageHeader
          eyebrow="Liên hệ"
          title={title}
          intro={intro}
          crumbs={[{ label: 'Trang chủ', href: '/' }, { label: 'Liên hệ' }]}
          align="center"
        />

        {showForm && (
          <section className="mx-auto w-full max-w-2xl px-6 py-6">
            <div className="rounded-3xl border border-white/5 bg-[#0d0d10] p-6 md:p-8">
              <InquiryForm
                productId={product?.id}
                productSlug={product?.slug}
                productTitle={product?.title}
                productKind={product?.kind ?? kind}
                userEmail={user?.email ?? undefined}
                userName={
                  typeof user?.user_metadata?.full_name === 'string'
                    ? user.user_metadata.full_name
                    : typeof user?.user_metadata?.name === 'string'
                      ? user.user_metadata.name
                      : undefined
                }
              />
            </div>
          </section>
        )}

        <section className="mx-auto w-full max-w-6xl px-6 py-12">
          {showForm && (
            <h2 className="mb-6 text-center text-xs uppercase tracking-widest text-muted-foreground">
              Hoặc liên hệ kênh khác
            </h2>
          )}
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {CHANNELS.map((c) => {
              return (
                <li key={c.label}>
                  <a
                    href={c.href}
                    target="_blank"
                    rel="noreferrer"
                    className="interactive-card group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/5 bg-[#0d0d10] p-6"
                  >
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-brand-orange/0 via-brand-orange/0 to-brand-orange/0 transition duration-300 group-hover:from-brand-orange/20 group-hover:via-brand-red/10 group-hover:to-brand-amber/10"
                    />
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0 rounded-2xl ring-0 ring-brand-orange/0 transition duration-300 group-hover:ring-2 group-hover:ring-brand-orange/60"
                    />
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br from-brand-orange to-brand-red opacity-20 blur-3xl transition duration-300 group-hover:scale-150 group-hover:opacity-70"
                    />
                    <div className="relative flex items-center justify-between">
                      <div className="text-base font-semibold text-foreground/90 transition duration-300 group-hover:text-brand-orange">{c.label}</div>
                      <ArrowUpRight className="h-4 w-4 text-foreground/30 transition duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand-orange" />
                    </div>
                    <div className="relative mt-2 text-sm text-foreground/60 transition duration-300 group-hover:text-foreground/85">{c.value}</div>
                  </a>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="mx-auto w-full max-w-3xl px-6 pb-24 text-center">
          <p className="text-sm text-foreground/55">
            Mình sẽ xử lý yêu cầu của bạn trong thời gian nhanh nhất.
          </p>
          <p className="mt-2 text-sm text-foreground/55">
            Uy tín là trên hết.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
