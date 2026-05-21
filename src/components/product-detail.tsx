import Link from 'next/link';
import { AlertTriangle, ArrowLeft, ArrowUpRight, CheckCircle2, Globe, LockKeyhole, Sparkles, Star, Tag, Clock } from 'lucide-react';
import { Footer } from '@/components/footer';
import { ProductCard } from '@/components/product-card';
import { PromptCopyButton } from '@/components/prompt-copy-button';
import { ProductReviewForm } from '@/components/product-review-form';
import { YouTubeEmbed } from '@/components/youtube-embed';
import { ViewTracker } from '@/components/view-tracker';
import {
  KIND_META,
  SUPPORT_META,
  categoryLabelFor,
  formatPriceVnd,
  getPromptMeta,
  visibleProductVersions,
  type Product,
  type ProductReviewSummary,
  type ProductVersionStatus,
  type PublicProductReview,
} from '@/lib/product-types';
import { renderMarkdown } from '@/lib/markdown';
import { safeHttpUrl } from '@/lib/url-safety';

interface ProductDetailProps {
  product: Product;
  viewerId?: string | null;
  reviews?: PublicProductReview[];
  reviewSummary?: ProductReviewSummary;
  relatedProducts?: Product[];
  loginHref?: string;
}

const MOCKUP_AUTOMATION_NOTICE = 'Tool Mockup Automation có thể xuất ra nhiều ảnh mockup sau khi chạy, phù hợp khi bạn cần tạo hàng loạt ảnh sản phẩm từ cùng một quy trình.';
const MOCKUP_COLLAGE_PROMPT_NOTICE = 'File prompt có thể có rất nhiều prompt, có thể lên đến 100 prompt, nhưng output chỉ là 1 ảnh. Trong ảnh đó sẽ bao gồm nhiều ảnh nhỏ được đặt trong các khung tách nhau. Nếu bạn muốn phiên bản xuất nhiều ảnh riêng lẻ, hãy liên hệ để mình làm riêng theo quy trình của bạn.';
const AUTO_PROMPT_POSTING_NOTICE = 'File prompt có thể gồm nhiều prompt, nhưng mỗi lượt chạy chỉ dùng 1 ảnh. Nếu cần bản input nhiều ảnh, hãy liên hệ để làm riêng.';

const PAYMENT_INFO = {
  bank: 'Techcombank',
  accountNumber: '9868886886',
  accountName: 'PHUNG DUC MINH',
  qrSrc: '/payment-qr.jpg',
};

const DEFAULT_BULLETS: Record<Product['kind'], string[]> = {
  tool: [
    'File .exe đóng gói, không cần cài Python',
    'Hướng dẫn sử dụng chi tiết',
    'Sửa bug miễn phí trong 30 ngày',
  ],
  prompt: [
    'Kho prompt dùng ngay',
    'Có hướng dẫn chỉnh theo ngữ cảnh',
    'Cập nhật thêm mẫu mới',
  ],
  webwork: [
    '2 vòng revise miễn phí',
    'Source code đứng tên bạn',
    'Hướng dẫn deploy + handover',
  ],
};

export function ProductDetail({
  product,
  viewerId = null,
  reviews = [],
  reviewSummary = { average: null, count: 0 },
  relatedProducts = [],
  loginHref = `/login?returnTo=${encodeURIComponent(KIND_META[product.kind].route + '/' + product.slug)}`,
}: ProductDetailProps) {
  const meta = KIND_META[product.kind];
  const Icon = meta.icon;
  const html = renderMarkdown(product.description);
  const bullets = product.deliverables.length > 0 ? product.deliverables : DEFAULT_BULLETS[product.kind];
  const versions = product.kind === 'tool' ? visibleProductVersions(product) : [];
  const normalizedSlug = product.slug.replace(/-/g, '').toLowerCase();
  const normalizedTitle = product.title.replace(/\s/g, '').toLowerCase();
  const isAutoPromptPosting = normalizedSlug.includes('dangprompt') || normalizedSlug.includes('autoprompt') || normalizedTitle.includes('đăngprompt') || normalizedTitle.includes('dangprompt');
  const notice = product.notice || (normalizedSlug === 'mockupautomation'
    ? MOCKUP_AUTOMATION_NOTICE
    : normalizedSlug === 'mockupcollageprompt'
      ? MOCKUP_COLLAGE_PROMPT_NOTICE
      : isAutoPromptPosting
        ? AUTO_PROMPT_POSTING_NOTICE
        : null);
  const showPaymentInfo = !product.is_free && product.pricing_mode !== 'quote';
  const promptMeta = product.kind === 'prompt' ? getPromptMeta(product) : null;
  const promptExplanationHtml = promptMeta?.explanation ? renderMarkdown(promptMeta.explanation) : '';
  const promptFullContent = promptMeta?.full_content?.trim() ?? '';
  const promptPreviewContent = promptMeta?.preview_content?.trim() ?? '';
  const promptDisplayContent = viewerId
    ? promptFullContent || promptPreviewContent
    : promptPreviewContent || promptFullContent;
  const hasPromptBody = Boolean(promptDisplayContent);
  const shouldLockPrompt = !viewerId && Boolean(promptFullContent);
  const safeRepoUrl = safeHttpUrl(product.repo_url);

  return (
    <>
      <ViewTracker productId={product.id} />
      <main className="min-h-svh pb-16 pt-28">
        <div className="mx-auto w-full max-w-6xl px-6">
          <Link
            href={meta.route}
            className="inline-flex items-center gap-1.5 text-sm text-foreground/60 transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Tất cả {meta.pluralLabel.toLowerCase()}
          </Link>

          <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.04] px-3 py-1 text-[11px] uppercase tracking-widest text-muted-foreground ring-1 ring-white/8">
                  <Icon className="h-3 w-3" strokeWidth={2.25} /> {meta.label}
                </span>
                {product.categories.map((category) => (
                  <span key={category} className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.04] px-3 py-1 text-[11px] uppercase tracking-widest text-muted-foreground ring-1 ring-white/8">
                    <Tag className="h-3 w-3" /> {categoryLabelFor(product.kind, category)}
                  </span>
                ))}
                {product.duration_label && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.04] px-3 py-1 text-[11px] uppercase tracking-widest text-muted-foreground ring-1 ring-white/8">
                    <Clock className="h-3 w-3" /> {product.duration_label}
                  </span>
                )}
              </div>

              <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight md:text-5xl">
                {product.title}
              </h1>
              {product.tagline && (
                <p className="mt-4 max-w-3xl text-balance text-lg text-foreground/70">
                  {product.tagline}
                </p>
              )}

              {product.kind === 'prompt' && product.gallery[0] && (
                <div className="mt-8 overflow-hidden rounded-2xl border border-white/5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.gallery[0]}
                    alt={`${product.title} ảnh tham khảo`}
                    loading="lazy"
                    className="w-full object-cover"
                  />
                </div>
              )}

              {product.youtube_url && (
                <div className="mt-8">
                  <YouTubeEmbed url={product.youtube_url} title={product.title} />
                </div>
              )}

              {product.kind === 'webwork' && safeRepoUrl && (
                <a
                  href={safeRepoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Mở link source / demo: ${safeRepoUrl.replace(/^https?:\/\//, '')}`}
                  className="mt-8 flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-white/25 hover:bg-white/[0.06]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Globe aria-hidden="true" className="h-5 w-5 shrink-0 text-foreground/85" strokeWidth={1.75} />
                    <div className="min-w-0">
                      <div className="text-xs uppercase tracking-widest text-muted-foreground">
                        Source / Demo
                      </div>
                      <div className="mt-0.5 truncate text-sm font-medium text-foreground/90">
                        {safeRepoUrl.replace(/^https?:\/\//, '')}
                      </div>
                    </div>
                  </div>
                  <ArrowUpRight aria-hidden="true" className="h-4 w-4 shrink-0 text-foreground/55" strokeWidth={2} />
                </a>
              )}

              {product.tags.length > 0 && (
                <div className="mt-8 flex flex-wrap gap-2">
                  {product.tags.map((s) => (
                    <span
                      key={s}
                      className="rounded-full bg-white/[0.04] px-3 py-1 text-xs text-foreground/80 ring-1 ring-white/10"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}

              {versions.length > 0 && (
                <div className="mt-10 rounded-2xl border border-white/5 bg-white/[0.02] p-5">
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        Phiên bản
                      </h2>
                      <p className="mt-2 text-sm text-foreground/60">
                        Sản phẩm này có nhiều phiên bản. Chọn bản phù hợp với quy trình của bạn khi liên hệ.
                      </p>
                    </div>
                    <span className="rounded-full bg-brand-orange/10 px-3 py-1 text-xs text-brand-orange ring-1 ring-brand-orange/25">
                      {versions.length} phiên bản
                    </span>
                  </div>
                  <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
                    {versions.map((version) => (
                      <div key={version.slug ?? version.name} className="rounded-2xl border border-white/8 bg-black/15 p-4">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <h3 className="text-base font-semibold tracking-tight text-foreground/95">{version.name}</h3>
                            {version.executable_label && (
                              <div className="mt-1 text-xs text-foreground/45">{version.executable_label}</div>
                            )}
                          </div>
                          <VersionStatusBadge status={version.status ?? 'available'} />
                        </div>
                        {version.description && (
                          <p className="mt-3 text-sm leading-relaxed text-foreground/65">{version.description}</p>
                        )}
                        {version.platform && (
                          <div className="mt-4 flex flex-wrap gap-2 text-xs text-foreground/60">
                            <span className="rounded-full bg-white/[0.04] px-2.5 py-1 ring-1 ring-white/8">{version.platform}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {versions.length > 0 && (
                <Link
                  href={`/contact?kind=${product.kind}`}
                  className="featured-cta group mt-4 flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.02] p-5"
                >
                  <div>
                    <div className="text-sm font-medium">Cần khác đi 1 chút?</div>
                    <div className="mt-0.5 text-xs text-foreground/55">{meta.ctaLabel}</div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
              )}

              {product.prerequisites.length > 0 && (
                <div className="mt-10 rounded-2xl border border-white/5 bg-white/[0.02] p-5">
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Yêu cầu trước khi bắt đầu
                  </h2>
                  <ul className="mt-4 space-y-2.5">
                    {product.prerequisites.map((p) => (
                      <li key={p} className="flex items-start gap-2.5 text-sm text-foreground/80">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-orange" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {notice && product.kind !== 'prompt' && (
                <div className="mt-10 rounded-2xl border border-brand-orange/25 bg-brand-orange/10 p-5">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-brand-orange" strokeWidth={2} />
                    <div>
                      <h2 className="text-xs font-semibold uppercase tracking-widest text-brand-orange">
                        Lưu ý trước khi mua
                      </h2>
                      <p className="mt-2 text-sm leading-relaxed text-foreground/80">
                        {notice}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {html && (
                <article
                  className="mt-10 max-w-none"
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              )}

              {promptMeta && (
                <div className="mt-10 space-y-6">
                  {hasPromptBody && (
                    <section className="rounded-2xl border border-white/8 bg-white/[0.02] p-5">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                          Nội dung prompt
                        </h2>
                        {!shouldLockPrompt && (
                          <PromptCopyButton content={promptDisplayContent} />
                        )}
                      </div>
                      <div className="relative mt-4">
                        <pre
                          className={`whitespace-pre-wrap rounded-2xl bg-black/25 p-4 font-mono text-sm leading-relaxed text-foreground/80 ring-1 ring-white/8 ${
                            shouldLockPrompt ? 'max-h-72 overflow-hidden' : ''
                          }`}
                        >
                          {promptDisplayContent}
                        </pre>
                        {shouldLockPrompt && (
                          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 rounded-b-2xl bg-gradient-to-t from-[#0d0d10] via-[#0d0d10]/85 to-transparent" />
                        )}
                      </div>

                      {shouldLockPrompt && (
                        <Link
                          href={loginHref}
                          className="group mt-4 flex items-center justify-between gap-4 rounded-2xl border border-brand-orange/25 bg-brand-orange/10 p-5 transition hover:border-brand-orange/45 hover:bg-brand-orange/15"
                        >
                          <div className="flex items-start gap-3">
                            <LockKeyhole className="mt-0.5 h-5 w-5 shrink-0 text-brand-orange" strokeWidth={2} />
                            <div>
                              <div className="text-sm font-semibold text-foreground">Xem thêm prompt đầy đủ</div>
                              <p className="mt-1 text-sm leading-relaxed text-foreground/65">
                                Đăng nhập (miễn phí) để mở khóa toàn bộ nội dung prompt và lưu lại cho lần sau.
                              </p>
                            </div>
                          </div>
                          <ArrowUpRight className="h-5 w-5 shrink-0 text-brand-orange transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                        </Link>
                      )}
                    </section>
                  )}

                  {promptExplanationHtml && (
                    <section className="rounded-2xl border border-white/8 bg-white/[0.02] p-5">
                      <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        Giải thích cách dùng prompt
                      </h2>
                      <div
                        className="mt-4 max-w-none"
                        dangerouslySetInnerHTML={{ __html: promptExplanationHtml }}
                      />
                    </section>
                  )}
                </div>
              )}

              {product.kind !== 'prompt' && product.gallery.length > 0 && (
                <div className="mt-12">
                  <h2 className="text-base font-semibold uppercase tracking-widest text-muted-foreground">
                    Screenshots
                  </h2>
                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {product.gallery.map((src) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={src}
                        src={src}
                        alt={`${product.title} screenshot`}
                        loading="lazy"
                        className="rounded-2xl border border-white/5"
                      />
                    ))}
                  </div>
                </div>
              )}

              {product.kind === 'prompt' && (
                <section className="mt-12 rounded-2xl border border-white/8 bg-white/[0.02] p-5">
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        Đánh giá prompt
                      </h2>
                      <div className="mt-2 flex items-center gap-2 text-sm text-foreground/70">
                        <Star className="h-4 w-4 fill-brand-orange text-brand-orange" strokeWidth={1.75} />
                        {reviewSummary.average == null
                          ? 'Chưa có đánh giá'
                          : `${reviewSummary.average.toFixed(1)} / 5 từ ${reviewSummary.count} đánh giá`}
                      </div>
                    </div>
                  </div>

                  {reviews.length > 0 && (
                    <div className="mt-5 space-y-3">
                      {reviews.map((review) => (
                        <article key={review.id} className="rounded-2xl border border-white/8 bg-black/15 p-4">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="text-sm font-medium text-foreground/90">
                              {review.profile?.full_name ?? 'Khách hàng SkillForge'}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-brand-orange">
                              <Star className="h-3.5 w-3.5 fill-current" strokeWidth={0} />
                              {review.rating}/5
                            </div>
                          </div>
                          {review.title && <h3 className="mt-3 text-sm font-semibold text-foreground/90">{review.title}</h3>}
                          {review.body && <p className="mt-2 text-sm leading-relaxed text-foreground/65">{review.body}</p>}
                        </article>
                      ))}
                    </div>
                  )}

                  <div className="mt-5">
                    <ProductReviewForm productId={product.id} isLoggedIn={Boolean(viewerId)} loginHref={loginHref} />
                  </div>
                </section>
              )}

              {relatedProducts.length > 0 && (
                <section className="mt-12">
                  <h2 className="text-base font-semibold uppercase tracking-widest text-muted-foreground">
                    {product.kind === 'tool'
                      ? 'Tool liên quan'
                      : product.kind === 'prompt'
                        ? 'Prompt liên quan'
                        : 'Project tương tự'}
                  </h2>
                  <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    {relatedProducts.map((related) => (
                      <ProductCard key={related.id} product={related} hideKind />
                    ))}
                  </div>
                </section>
              )}
            </div>

            <aside className="lg:col-span-4">
              <div className="sticky top-24 space-y-4">
                <div className="rounded-3xl border border-white/5 bg-gradient-to-br from-[#1a0d10] via-[#0d0d10] to-[#0d0d10] p-6">
                  <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
                    Giá
                  </div>
                  <div className="mt-1 text-3xl font-semibold tabular-nums">
                    {formatPriceVnd(product.price_vnd, product.pricing_mode, product.is_free)}
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-foreground/65">
                    {product.is_free
                      ? 'Miễn phí. Nhấn nút bên dưới để nhận file.'
                      : product.pricing_mode === 'quote'
                        ? 'Bạn gửi nhu cầu, mình báo giá lại rõ ràng.'
                        : 'Muốn mua thì chuyển khoản theo QR bên dưới. Xong nhắn mình để nhận file.'}
                  </p>

                  <Link
                    href={`/contact?product=${product.slug}&kind=${product.kind}`}
                    className="hero-primary-cta bg-brand-gradient glow-red mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold text-black"
                  >
                    <Sparkles className="h-4 w-4" />{' '}
                    {product.is_free ? 'Nhận prompt miễn phí' : product.pricing_mode === 'quote' ? 'Yêu cầu báo giá' : 'Mua / Đặt câu hỏi'}
                  </Link>

                  <ul className="mt-5 space-y-2.5 text-sm text-foreground/75">
                    {bullets.map((b) => (
                      <Bullet key={b}>{b}</Bullet>
                    ))}
                  </ul>
                </div>

                {showPaymentInfo && (
                  <div className="rounded-3xl border border-brand-orange/20 bg-[#0d0d10] p-6">
                    <div className="text-[11px] uppercase tracking-widest text-brand-orange">
                      Cách mua
                    </div>
                    <ol className="mt-3 space-y-1.5 text-sm leading-relaxed text-foreground/70">
                      <li>1. Quét mã QR hoặc chuyển khoản.</li>
                      <li>2. Nhắn mình ảnh giao dịch.</li>
                      <li>3. Mình gửi file qua Zalo/Drive.</li>
                    </ol>
                    <div className="mt-4 overflow-hidden rounded-2xl border border-white/8 bg-white p-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={PAYMENT_INFO.qrSrc}
                        alt="QR chuyển khoản SkillForge VN"
                        className="aspect-square w-full object-contain"
                      />
                    </div>
                    <dl className="mt-4 space-y-2.5 text-sm">
                      <div className="flex justify-between gap-3">
                        <dt className="text-foreground/55">Ngân hàng</dt>
                        <dd className="text-right font-medium text-foreground/90">{PAYMENT_INFO.bank}</dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt className="text-foreground/55">Số tài khoản</dt>
                        <dd className="text-right font-semibold tabular-nums text-foreground/95">{PAYMENT_INFO.accountNumber}</dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt className="text-foreground/55">Chủ tài khoản</dt>
                        <dd className="text-right font-medium text-foreground/90">{PAYMENT_INFO.accountName}</dd>
                      </div>
                      <div className="rounded-2xl bg-white/[0.04] p-3 ring-1 ring-white/8">
                        <dt className="text-[11px] uppercase tracking-widest text-muted-foreground">Nội dung chuyển khoản</dt>
                        <dd className="mt-1 font-semibold text-foreground/95">Tên - chuyển khoản {product.title}</dd>
                      </div>
                    </dl>
                    <p className="mt-4 text-sm leading-relaxed text-foreground/65">
                      Nhớ kiểm tra đúng tên <span className="font-medium text-foreground/90">{PAYMENT_INFO.accountName}</span> trước khi chuyển.
                    </p>
                  </div>
                )}

                {product.support_options.length > 0 && (
                  <div className="rounded-3xl border border-white/5 bg-[#0d0d10] p-6">
                    <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
                      Hình thức hỗ trợ
                    </div>
                    <ul className="mt-4 space-y-3">
                      {product.support_options.map((opt) => {
                        const m = SUPPORT_META[opt];
                        return (
                          <li key={opt}>
                            <div className="text-sm font-medium text-foreground/95">{m.label}</div>
                            <div className="mt-0.5 text-xs text-foreground/55">{m.description}</div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function VersionStatusBadge({ status }: { status: ProductVersionStatus }) {
  const label =
    status === 'beta'
      ? 'Beta'
      : status === 'deprecated'
        ? 'Ngừng khuyến nghị'
        : 'Đang bán';
  return (
    <span className="rounded-full bg-white/[0.04] px-2.5 py-1 text-[11px] text-foreground/65 ring-1 ring-white/8">
      {label}
    </span>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5">
      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-orange" strokeWidth={2.25} />
      <span>{children}</span>
    </li>
  );
}
