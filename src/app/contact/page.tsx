import { Nav } from '@/components/nav';
import { Footer } from '@/components/footer';
import { PageHeader } from '@/components/page-header';
import { InquiryForm } from '@/components/inquiry-form';
import { createClient } from '@/lib/supabase/server';
import { MessageCircle, Mail, Send, Clock } from 'lucide-react';
import {
  ALL_KINDS,
  KIND_META,
  type Product,
  type ProductKind,
} from '@/lib/product-types';

export const metadata = {
  title: 'Liên hệ — SkillForge VN',
  description:
    'Đặt mua tool, đặt setup, đăng ký khoá học, hay yêu cầu làm web — rep trong 24h qua Zalo / Telegram / Email.',
};

const CHANNELS = [
  {
    icon: MessageCircle,
    label: 'Zalo',
    value: '0xx xxx xxxx',
    hint: 'Phản hồi nhanh nhất · <4h trong giờ HC',
    href: 'https://zalo.me/0000000000',
  },
  {
    icon: Send,
    label: 'Telegram',
    value: '@yourhandle',
    hint: 'Cho khách quốc tế · <8h',
    href: 'https://t.me/yourhandle',
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'hello@your-domain.vn',
    hint: 'Brief dài, file đính kèm · <24h',
    href: 'mailto:hello@your-domain.vn',
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

  let product: Pick<Product, 'id' | 'slug' | 'title' | 'kind'> | null = null;
  if (productSlug) {
    const supabase = await createClient();
    let q = supabase
      .from('products')
      .select('id, slug, title, kind')
      .eq('slug', productSlug)
      .eq('status', 'published');
    if (kind) q = q.eq('kind', kind);
    const { data } = await q.maybeSingle();
    if (data) product = data;
  }

  const activeKind = product?.kind ?? kind;
  const kindMeta = activeKind ? KIND_META[activeKind] : null;

  const title = product
    ? `Đặt: ${product.title}`
    : kindMeta
      ? kindMeta.ctaLabel
      : 'Đặt sản phẩm hoặc yêu cầu làm riêng.';

  const intro = product
    ? 'Điền form bên dưới — mình rep trong 24h kèm thông tin thanh toán và bước tiếp theo.'
    : kindMeta
      ? `Kể nhu cầu của bạn về ${kindMeta.label.toLowerCase()} — mình rep trong 24h với mức quote sơ bộ.`
      : 'Kể use case của bạn — mình rep trong 24h với mức quote sơ bộ. Không spam follow-up.';

  return (
    <>
      <Nav />
      <main className="min-h-svh">
        <PageHeader
          eyebrow="Liên hệ"
          title={title}
          intro={intro}
          crumbs={[{ label: 'Trang chủ', href: '/' }, { label: 'Liên hệ' }]}
          align="center"
        />

        <section className="mx-auto w-full max-w-2xl px-6 py-6">
          <div className="rounded-3xl border border-white/5 bg-[#0d0d10] p-6 md:p-8">
            <InquiryForm
              productId={product?.id}
              productSlug={product?.slug}
              productTitle={product?.title}
              productKind={product?.kind ?? kind}
            />
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-6 py-12">
          <h2 className="mb-6 text-center text-xs uppercase tracking-widest text-muted-foreground">
            Hoặc liên hệ kênh khác
          </h2>
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {CHANNELS.map((c) => {
              const Icon = c.icon;
              return (
                <li key={c.label}>
                  <a
                    href={c.href}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex h-full flex-col rounded-2xl border border-white/5 bg-[#0d0d10] p-6 transition hover:border-white/15 hover:bg-white/[0.02]"
                  >
                    <span className="grid h-12 w-12 place-items-center rounded-xl bg-white/[0.04] text-brand-orange ring-1 ring-white/10">
                      <Icon className="h-5 w-5" strokeWidth={1.75} />
                    </span>
                    <div className="mt-4 text-sm font-medium text-foreground/90">{c.label}</div>
                    <div className="mt-1 text-sm text-foreground/60">{c.value}</div>
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" /> {c.hint}
                    </div>
                  </a>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="mx-auto w-full max-w-3xl px-6 pb-24 text-center">
          <p className="text-sm text-foreground/55">
            Mình ở Hà Nội (GMT+7). Cuối tuần vẫn rep, nhưng để dành thứ 2 đầu giờ cho call.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
