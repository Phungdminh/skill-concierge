'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ImagePlus, Loader2, Save, Trash2 } from 'lucide-react';
import {
  slugify,
  categoriesFor,
  categoryLabelFor,
  normalizeCategories,
  KIND_META,
  SUPPORT_META,
  ALL_KINDS,
  type Product,
  type ProductStatus,
  type ProductKind,
  type PricingMode,
  type SupportOption,
  type ProductVersion,
  type ProductVersionStatus,
} from '@/lib/product-types';
import { cn } from '@/lib/utils';

interface ProductFormProps {
  initial?: Partial<Product>;
  mode: 'create' | 'edit';
  defaultKind?: ProductKind;
}

type ProductVersionFormState = ProductVersion;

const STATUS_OPTIONS: { value: ProductStatus; label: string }[] = [
  { value: 'draft', label: 'Bản nháp' },
  { value: 'published', label: 'Đang bán / Đang chạy' },
  { value: 'sold_out', label: 'Hết / Tạm ngừng' },
  { value: 'archived', label: 'Lưu trữ' },
];

const PRICING_OPTIONS: { value: PricingMode; label: string; hint: string }[] = [
  { value: 'fixed', label: 'Giá cố định', hint: 'Hiển thị "1.500.000đ"' },
  { value: 'from', label: 'Giá từ…', hint: 'Hiển thị "Từ 1.500.000đ"' },
  { value: 'quote', label: 'Liên hệ báo giá', hint: 'Ẩn giá, hiện "Liên hệ"' },
];

const VERSION_STATUS_OPTIONS: { value: ProductVersionStatus; label: string }[] = [
  { value: 'available', label: 'Đang bán' },
  { value: 'beta', label: 'Beta' },
  { value: 'deprecated', label: 'Ngừng khuyến nghị' },
  { value: 'hidden', label: 'Ẩn khỏi public' },
];

const ALL_SUPPORT: SupportOption[] = [
  'drive_folder',
  'zalo_group',
  'one_on_one_call',
];

function toVersionFormState(version: ProductVersion): ProductVersionFormState {
  return {
    ...version,
    status: version.status ?? 'available',
  };
}

function emptyVersion(): ProductVersionFormState {
  return {
    name: '',
    slug: '',
    description: '',
    executable_label: '',
    platform: 'Windows 10+ 64-bit',
    is_default: false,
    status: 'available',
  };
}

export function ProductForm({ initial, mode, defaultKind = 'tool' }: ProductFormProps) {
  const router = useRouter();
  const referenceImageInputRef = useRef<HTMLInputElement>(null);
  const [kind, setKind] = useState<ProductKind>(
    (initial?.kind as ProductKind) ?? defaultKind,
  );
  const [title, setTitle] = useState(initial?.title ?? '');
  const [slug, setSlug] = useState(initial?.slug ?? '');
  const [slugDirty, setSlugDirty] = useState(Boolean(initial?.slug));
  const [tagline, setTagline] = useState(initial?.tagline ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [notice, setNotice] = useState(initial?.notice ?? '');
  const [youtubeUrl, setYoutubeUrl] = useState(initial?.youtube_url ?? '');
  const [thumbnailUrl, setThumbnailUrl] = useState(initial?.thumbnail_url ?? '');
  const [gallery, setGallery] = useState((initial?.gallery ?? []).join('\n'));
  const [promptPreviewContent, setPromptPreviewContent] = useState(initial?.prompt_meta?.preview_content ?? '');
  const [promptFullContent, setPromptFullContent] = useState(initial?.prompt_meta?.full_content ?? '');
  const [promptExplanation, setPromptExplanation] = useState(initial?.prompt_meta?.explanation ?? '');
  const [relatedPromptSlugs, setRelatedPromptSlugs] = useState((initial?.prompt_meta?.related_slugs ?? []).join('\n'));
  const [pricingMode, setPricingMode] = useState<PricingMode>(
    (initial?.pricing_mode as PricingMode) ?? 'fixed',
  );
  const [priceVnd, setPriceVnd] = useState<string>(
    initial?.price_vnd == null ? '' : String(initial.price_vnd),
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    normalizeCategories(initial?.categories ?? [], (initial?.kind as ProductKind) ?? defaultKind),
  );
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const [tags, setTags] = useState((initial?.tags ?? []).join(', '));
  const [versions, setVersions] = useState<ProductVersionFormState[]>(
    (initial?.versions ?? []).map(toVersionFormState),
  );
  const [deliverables, setDeliverables] = useState(
    (initial?.deliverables ?? []).join('\n'),
  );
  const [supportOptions, setSupportOptions] = useState<SupportOption[]>(
    (initial?.support_options as SupportOption[]) ?? [],
  );
  const [durationLabel, setDurationLabel] = useState(initial?.duration_label ?? '');
  const [prerequisites, setPrerequisites] = useState(
    (initial?.prerequisites ?? []).join('\n'),
  );
  const [status, setStatus] = useState<ProductStatus>(
    (initial?.status as ProductStatus) ?? 'draft',
  );
  const [featured, setFeatured] = useState<boolean>(initial?.featured ?? false);
  const [isFree] = useState<boolean>(initial?.is_free ?? false);
  const [sortOrder, setSortOrder] = useState<string>(
    initial?.sort_order == null ? '0' : String(initial.sort_order),
  );
  const viewCount = initial?.view_count ?? 0;
  const [state, setState] = useState<'idle' | 'saving' | 'deleting' | 'error'>('idle');
  const [uploadingReference, setUploadingReference] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const meta = KIND_META[kind];
  const categories = categoriesFor(kind);
  const categorySummary =
    selectedCategories.length === 0
      ? '— Chọn danh mục —'
      : selectedCategories.length === 1
        ? categoryLabelFor(kind, selectedCategories[0])
        : `${selectedCategories.length} danh mục đã chọn`;

  useEffect(() => {
    function closeCategoryDropdown(event: MouseEvent) {
      if (!categoryDropdownRef.current?.contains(event.target as Node)) {
        setCategoryDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', closeCategoryDropdown);
    return () => document.removeEventListener('mousedown', closeCategoryDropdown);
  }, []);

  function onKindChange(nextKind: ProductKind) {
    setKind(nextKind);
    setSelectedCategories((curr) => normalizeCategories(curr, nextKind));
  }

  function toggleCategory(value: string) {
    setSelectedCategories((curr) =>
      curr.includes(value) ? curr.filter((category) => category !== value) : [...curr, value],
    );
  }

  function onTitleChange(value: string) {
    setTitle(value);
    if (!slugDirty) setSlug(slugify(value));
  }

  function toggleSupport(opt: SupportOption) {
    setSupportOptions((curr) =>
      curr.includes(opt) ? curr.filter((o) => o !== opt) : [...curr, opt],
    );
  }

  function updateVersion(index: number, patch: Partial<ProductVersionFormState>) {
    setVersions((curr) => curr.map((version, i) => (i === index ? { ...version, ...patch } : version)));
  }

  function removeVersion(index: number) {
    setVersions((curr) => curr.filter((_, i) => i !== index));
  }

  function markDefaultVersion(index: number) {
    setVersions((curr) => curr.map((version, i) => ({ ...version, is_default: i === index })));
  }

  function serializeVersions() {
    if (kind !== 'tool') return [];
    return versions
      .map((version) => ({
        name: version.name.trim(),
        slug: version.slug?.trim() || undefined,
        description: version.description?.trim() || null,
        executable_label: version.executable_label?.trim() || null,
        platform: version.platform?.trim() || null,
        is_default: version.is_default ?? false,
        status: version.status ?? 'available',
      }))
      .filter((version) => version.name.length > 0);
  }

  async function uploadReferenceImages(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (files.length === 0) return;

    const tooLarge = files.find((file) => file.size > 5 * 1024 * 1024);
    if (tooLarge) {
      setErrorMsg(`Ảnh "${tooLarge.name}" phải nhỏ hơn 5MB.`);
      setState('error');
      return;
    }

    setUploadingReference(true);
    setErrorMsg(null);
    try {
      const uploadedUrls: string[] = [];
      for (const file of files) {
        const fd = new FormData();
        fd.append('file', file);
        const res = await fetch('/api/admin/products/images', { method: 'POST', body: fd });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(body?.error?.message ?? `Không tải được ảnh "${file.name}".`);
        }
        if (typeof body.url === 'string') uploadedUrls.push(body.url);
      }
      setGallery((curr) => [...curr.split('\n').map((s) => s.trim()).filter(Boolean), ...uploadedUrls].join('\n'));
      setState('idle');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Không tải ảnh lên được.');
      setState('error');
    } finally {
      setUploadingReference(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (state === 'saving') return;
    setState('saving');
    setErrorMsg(null);
    const sortOrderNum = Number.parseInt(sortOrder, 10);
    const basePayload = {
      title: title.trim(),
      slug: slug.trim() || slugify(title),
      tagline: tagline.trim() || null,
      description: description.trim() || null,
      notice: kind === 'prompt' ? null : notice.trim() || null,
      youtube_url: kind === 'prompt' ? null : youtubeUrl.trim() || null,
      thumbnail_url: kind === 'prompt' ? null : thumbnailUrl.trim() || null,
      gallery: gallery.split('\n').map((s) => s.trim()).filter(Boolean),
      pricing_mode: kind === 'prompt' || isFree ? 'fixed' : pricingMode,
      price_vnd:
        kind === 'prompt' || isFree || pricingMode === 'quote' || priceVnd.trim() === ''
          ? null
          : Number.parseInt(priceVnd, 10),
      is_free: kind === 'prompt' ? true : false,
      categories: selectedCategories,
      tags: tags.split(',').map((s) => s.trim()).filter(Boolean),
      versions: serializeVersions(),
      deliverables: kind === 'prompt' ? [] : deliverables.split('\n').map((s) => s.trim()).filter(Boolean),
      support_options: kind === 'prompt' ? [] : supportOptions,
      duration_label: kind === 'prompt' ? null : durationLabel.trim() || null,
      prerequisites: kind === 'prompt' ? [] : prerequisites.split('\n').map((s) => s.trim()).filter(Boolean),
      status: kind === 'prompt' ? 'published' : status,
      featured: kind === 'prompt' ? false : featured,
      sort_order: kind === 'prompt' ? 0 : Number.isFinite(sortOrderNum) ? sortOrderNum : 0,
      ...(kind === 'prompt'
        ? {
            prompt_meta: {
              preview_content: promptPreviewContent.trim() || null,
              full_content: promptFullContent.trim() || null,
              explanation: promptExplanation.trim() || null,
              related_slugs: relatedPromptSlugs
                .split('\n')
                .map((s) => s.trim())
                .filter(Boolean),
            },
          }
        : {}),
    };
    const payload =
      mode === 'create' ? { kind, ...basePayload } : basePayload;
    try {
      const url =
        mode === 'create'
          ? '/api/admin/products'
          : `/api/admin/products/${initial?.id}`;
      const res = await fetch(url, {
        method: mode === 'create' ? 'POST' : 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error?.message ?? 'Lưu không thành công');
      }
      router.push('/admin/products');
      router.refresh();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Lỗi không xác định');
      setState('error');
    }
  }

  async function onDelete() {
    if (!initial?.id || state === 'deleting') return;
    if (!confirm(`Xoá "${initial.title}"? Hành động không hoàn tác.`)) return;
    setState('deleting');
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/admin/products/${initial.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error?.message ?? 'Xoá không thành công');
      }
      router.push('/admin/products');
      router.refresh();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Lỗi không xác định');
      setState('error');
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <FormSection
        title="Thông tin cơ bản"
        description={kind === 'prompt' ? 'Nhập tên prompt, slug và mô tả ngắn đúng như khách sẽ thấy trong kho prompt.' : 'Chọn loại sản phẩm, đặt tên dễ hiểu và kiểm tra đường dẫn công khai.'}
      >
        <FormField
          label="Loại sản phẩm"
          htmlFor="kind"
          hint={
            mode === 'edit'
              ? 'Loại sản phẩm đã khoá sau khi tạo. Muốn đổi loại, hãy tạo sản phẩm mới.'
              : 'Chọn trước để gợi ý danh mục, thời lượng và nội dung phù hợp.'
          }
          required
        >
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
            {ALL_KINDS.map((k) => {
              const km = KIND_META[k];
              const KIcon = km.icon;
              const active = k === kind;
              const disabled = mode === 'edit';
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => !disabled && onKindChange(k)}
                  disabled={disabled && !active}
                  className={cn(
                    'flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition',
                    active
                      ? 'border-brand-orange/40 bg-brand-orange/10 text-foreground'
                      : 'border-white/10 bg-white/[0.02] text-foreground/65 hover:bg-white/[0.06]',
                    disabled && !active && 'cursor-not-allowed opacity-30',
                  )}
                >
                  <KIcon className="h-4 w-4" strokeWidth={1.75} />
                  {km.shortLabel}
                </button>
              );
            })}
          </div>
        </FormField>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            label={kind === 'prompt' ? 'Tên prompt' : 'Tiêu đề'}
            htmlFor="title"
            hint={kind === 'prompt' ? 'Tên khách sẽ thấy trong kho prompt và trang chi tiết.' : 'Tên khách sẽ thấy ở card và trang chi tiết.'}
            required
          >
            <input
              id="title"
              required
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder={
                kind === 'tool'
                  ? 'Sheet Cleaner'
                  : kind === 'prompt'
                    ? 'Prompt mẫu cho content marketing'
                    : 'Landing page cho coach 1-1'
              }
              className={inputCls}
            />
          </FormField>
          <FormField
            label="Slug"
            htmlFor="slug"
            hint={`Đường dẫn: ${meta.route}/${slug || '<slug>'}. Để trống để tự tạo từ tiêu đề.`}
          >
            <input
              id="slug"
              value={slug}
              onChange={(e) => {
                setSlugDirty(true);
                setSlug(e.target.value);
              }}
              placeholder="vd: sheet-cleaner"
              className={inputCls}
            />
          </FormField>
        </div>
      </FormSection>

      <FormSection
        title="Nội dung hiển thị"
        description="Viết phần khách hàng dùng để hiểu nhanh sản phẩm, lợi ích và phạm vi sử dụng."
      >
        <FormField label="Mô tả ngắn" htmlFor="tagline" hint="Hiện trên card và đầu trang chi tiết.">
          <input
            id="tagline"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            placeholder="Một câu nêu kết quả chính khách nhận được."
            className={inputCls}
          />
        </FormField>

        <FormField
          label={kind === 'prompt' ? 'Mô tả prompt (Markdown)' : 'Mô tả chi tiết (Markdown)'}
          htmlFor="description"
          hint={kind === 'prompt' ? 'Nói rõ prompt dùng để làm gì, ai nên dùng và kết quả khách nhận được.' : 'Có thể dùng tiêu đề, danh sách, link và code block Markdown.'}
        >
          <textarea
            id="description"
            rows={10}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={
              kind === 'prompt'
                ? '### Prompt này giúp gì?\n- Dành cho ai…\n- Kết quả tạo ra…\n- Cách chỉnh theo ngữ cảnh…'
                : '### Tính năng\n- Tự động hoá X\n- Generate Y'
            }
            className={cn(inputCls, 'font-mono text-[13px]')}
          />
        </FormField>

        {kind !== 'prompt' && (
          <FormField
            label="Lưu ý cho khách"
            htmlFor="notice"
            hint="Hiện ở trang chi tiết để nói rõ giới hạn, cách dùng hoặc trường hợp cần liên hệ làm riêng."
          >
            <textarea
              id="notice"
              rows={3}
              value={notice}
              onChange={(e) => setNotice(e.target.value)}
              placeholder={
                kind === 'tool'
                  ? 'Ví dụ: File prompt có thể gồm nhiều prompt, nhưng mỗi lượt chạy chỉ dùng 1 ảnh. Nếu cần bản input nhiều ảnh, hãy liên hệ để làm riêng.'
                  : 'Ví dụ: Nếu quy trình của bạn khác mô tả, hãy liên hệ trước để mình kiểm tra scope.'
              }
              className={inputCls}
            />
          </FormField>
        )}

        <div className={cn('grid grid-cols-1 gap-4', kind !== 'prompt' && 'md:grid-cols-2')}>
          <FormField
            label={kind === 'prompt' ? 'Đề tài' : 'Danh mục'}
            htmlFor="category-dropdown"
            hint={kind === 'prompt' ? 'Chọn đề tài chuyên ngành để khách lọc prompt trong marketplace dễ hơn.' : 'Có thể chọn nhiều danh mục để khách lọc sản phẩm dễ hơn.'}
          >
            <div ref={categoryDropdownRef} className="relative mt-2">
              <button
                id="category-dropdown"
                type="button"
                aria-haspopup="listbox"
                aria-expanded={categoryDropdownOpen}
                onClick={() => setCategoryDropdownOpen((open) => !open)}
                className="flex w-full items-center justify-between rounded-xl bg-white/[0.02] px-3 py-2.5 text-left text-sm text-foreground ring-1 ring-white/8 transition hover:bg-white/[0.04] focus:outline-none focus:ring-white/25"
              >
                <span className={selectedCategories.length === 0 ? 'text-muted-foreground' : undefined}>
                  {categorySummary}
                </span>
                <span className="text-xs text-foreground/45">Chọn</span>
              </button>

              {categoryDropdownOpen && (
                <div
                  role="listbox"
                  aria-multiselectable="true"
                  className="absolute z-20 mt-2 max-h-72 w-full overflow-y-auto rounded-xl border border-white/10 bg-[#0d0d10] p-2 shadow-2xl shadow-black/40"
                >
                  <button
                    type="button"
                    onClick={() => setSelectedCategories([])}
                    className="mb-1 w-full rounded-lg px-3 py-2 text-left text-sm text-foreground/60 transition hover:bg-white/[0.04] hover:text-foreground"
                  >
                    Không chọn danh mục
                  </button>
                  {categories.map((c) => {
                    const checked = selectedCategories.includes(c.value);
                    return (
                      <label
                        key={c.value}
                        role="option"
                        aria-selected={checked}
                        className={cn(
                          'flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm transition',
                          checked
                            ? 'border-brand-orange/40 bg-brand-orange/10 text-foreground'
                            : 'border-transparent text-foreground/75 hover:border-white/10 hover:bg-white/[0.04] hover:text-foreground',
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleCategory(c.value)}
                          className="h-4 w-4 accent-brand-orange"
                        />
                        <span>{c.label}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          </FormField>
          {kind !== 'prompt' && (
            <FormField
              label="Thời lượng / phạm vi"
              htmlFor="duration_label"
              hint={
                kind === 'webwork'
                  ? 'Website: 7-14 ngày. Portfolio: 3-5 ngày.'
                  : 'Tool có sẵn: giao ngay sau thanh toán. Tool làm riêng: 3-5 ngày.'
              }
            >
              <input
                id="duration_label"
                value={durationLabel}
                onChange={(e) => setDurationLabel(e.target.value)}
                placeholder={
                  kind === 'webwork'
                    ? '7-14 ngày (website) · 3-5 ngày (portfolio)'
                    : 'Giao ngay sau thanh toán · 3-5 ngày nếu làm riêng'
                }
                className={inputCls}
              />
            </FormField>
          )}
        </div>

        <FormField
          label="Thẻ tìm kiếm"
          htmlFor="tags"
          hint="Phân cách bằng dấu phẩy. Dùng từ khoá khách hay tìm."
        >
          <input
            id="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Google Sheets, Automation, Văn phòng"
            className={inputCls}
          />
        </FormField>
      </FormSection>

      <FormSection
        title={kind === 'prompt' ? 'Ảnh references' : 'Media'}
        description={kind === 'prompt' ? 'Thêm ảnh tham khảo để khách hiểu prompt tạo ra kiểu kết quả nào.' : 'Thêm video, ảnh đại diện và ảnh minh hoạ để tăng độ tin cậy khi khách xem sản phẩm.'}
      >
        {kind !== 'prompt' && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField label="Video YouTube" htmlFor="youtube_url" hint="Video demo, walkthrough hoặc giới thiệu sản phẩm.">
              <input
                id="youtube_url"
                type="url"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://youtu.be/xxxxxxxxxxx"
                className={inputCls}
              />
            </FormField>
            <FormField label="Ảnh đại diện" htmlFor="thumbnail_url" hint="Nếu để trống, hệ thống có thể dùng thumbnail từ YouTube.">
              <input
                id="thumbnail_url"
                type="url"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder="https://example.com/cover.png"
                className={inputCls}
              />
            </FormField>
          </div>
        )}

        <FormField
          label={kind === 'prompt' ? 'Ảnh references' : 'Thư viện ảnh'}
          htmlFor="gallery"
          hint={kind === 'prompt' ? 'Bấm tải ảnh từ máy lên, hoặc dán URL nếu ảnh đã có sẵn.' : 'Mỗi URL ảnh trên một dòng. Nên dùng ảnh chụp màn hình thật hoặc kết quả mẫu.'}
        >
          {kind === 'prompt' && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <input
                ref={referenceImageInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={uploadReferenceImages}
              />
              <button
                type="button"
                onClick={() => referenceImageInputRef.current?.click()}
                disabled={uploadingReference}
                className={cn(
                  'inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm text-foreground/80 transition hover:bg-white/[0.04]',
                  uploadingReference && 'cursor-wait opacity-60',
                )}
              >
                {uploadingReference ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ImagePlus className="h-4 w-4" />
                )}
                {uploadingReference ? 'Đang tải ảnh…' : 'Tải ảnh từ máy'}
              </button>
              <span className="text-xs text-foreground/45">JPG, PNG, WebP · tối đa 5MB/ảnh</span>
            </div>
          )}
          <textarea
            id="gallery"
            rows={kind === 'prompt' ? 5 : 3}
            value={gallery}
            onChange={(e) => setGallery(e.target.value)}
            placeholder={kind === 'prompt' ? 'URL ảnh sau khi upload sẽ tự hiện ở đây' : 'https://example.com/shot-1.png&#10;https://example.com/shot-2.png'}
            className={inputCls}
          />
        </FormField>
      </FormSection>

      {kind === 'prompt' && (
        <FormSection
          title="Nội dung prompt"
          description="Các ô này sẽ lưu vào prompt_meta: bản xem trước, bản đầy đủ sau đăng nhập, giải thích cách dùng và prompt liên quan."
        >
          <FormField
            label="Bản xem trước công khai"
            htmlFor="prompt_preview_content"
            hint="Ai cũng xem được phần này. Chỉ dán một đoạn mẫu đủ để khách hiểu, không dán toàn bộ prompt có phí."
          >
            <textarea
              id="prompt_preview_content"
              rows={8}
              value={promptPreviewContent}
              onChange={(e) => setPromptPreviewContent(e.target.value)}
              placeholder="Ví dụ: một đoạn prompt mẫu hoặc phần mở đầu để khách xem trước..."
              className={cn(inputCls, 'font-mono text-[13px]')}
            />
          </FormField>

          <FormField
            label="Prompt đầy đủ"
            htmlFor="prompt_full_content"
            hint="Đây là nội dung chính khách nhận được. Khách chưa đăng nhập sẽ không thấy phần này trên trang public."
          >
            <textarea
              id="prompt_full_content"
              rows={12}
              value={promptFullContent}
              onChange={(e) => setPromptFullContent(e.target.value)}
              placeholder="Dán toàn bộ prompt hoàn chỉnh mà khách sẽ dùng ở đây..."
              className={cn(inputCls, 'font-mono text-[13px]')}
            />
          </FormField>

          <FormField
            label="Giải thích cách dùng prompt"
            htmlFor="prompt_explanation"
            hint="Có thể dùng Markdown để giải thích khi nào dùng, cần thay biến nào, và cách chỉnh tone."
          >
            <textarea
              id="prompt_explanation"
              rows={7}
              value={promptExplanation}
              onChange={(e) => setPromptExplanation(e.target.value)}
              placeholder="### Cách dùng&#10;- Thay [sản phẩm] bằng...&#10;- Chọn tone phù hợp..."
              className={cn(inputCls, 'font-mono text-[13px]')}
            />
          </FormField>

          <FormField
            label="Prompt liên quan"
            htmlFor="related_prompt_slugs"
            hint="Mỗi dòng là một slug prompt khác. Không nhập slug của chính prompt này. Hệ thống sẽ tự loại trùng và tự gợi ý thêm nếu thiếu."
          >
            <textarea
              id="related_prompt_slugs"
              rows={4}
              value={relatedPromptSlugs}
              onChange={(e) => setRelatedPromptSlugs(e.target.value)}
              placeholder="prompt-viet-bai-facebook&#10;prompt-seo-blog"
              className={cn(inputCls, 'font-mono text-[13px]')}
            />
          </FormField>
          <div className="rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 text-sm text-foreground/65">
            Đánh giá prompt không nhập ở đây. Khách đăng nhập và tự đánh giá thật trên trang chi tiết; dữ liệu đó lưu ở bảng <span className="font-mono text-xs text-foreground/80">product_reviews</span>.
          </div>
        </FormSection>
      )}

      {kind !== 'prompt' && (
        <FormSection
          title="Giá & cách bán"
          description="Chọn cách hiển thị giá. Miễn phí hoặc báo giá sẽ tự ẩn ô nhập giá khi không cần."
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField label="Cách hiển thị giá" htmlFor="pricing_mode">
              <select
                id="pricing_mode"
                value={pricingMode}
                disabled={isFree}
                onChange={(e) => setPricingMode(e.target.value as PricingMode)}
                className={cn(inputCls, isFree && 'opacity-40')}
              >
                {PRICING_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value} className="bg-[#0d0d10]">
                    {o.label}
                  </option>
                ))}
              </select>
              <span className="mt-1 block text-[11px] text-foreground/45">
                {PRICING_OPTIONS.find((o) => o.value === pricingMode)?.hint}
              </span>
            </FormField>
            <FormField
              label="Giá bán (VND)"
              htmlFor="price_vnd"
              hint={isFree ? 'Không dùng khi "Miễn phí"' : pricingMode === 'quote' ? 'Không dùng khi "Liên hệ báo giá"' : 'Nhập số nguyên, không phẩy'}
            >
              <NumberStepper
                id="price_vnd"
                min={0}
                step={1000}
                value={priceVnd}
                disabled={isFree || pricingMode === 'quote'}
                onChange={setPriceVnd}
                placeholder="1500000"
              />
            </FormField>
          </div>
        </FormSection>
      )}

      {kind === 'tool' && (
        <FormSection
          title="Các phiên bản của tool"
          description="Dùng khi một tool có nhiều file .exe hoặc nhiều gói tính năng. Video demo vẫn là demo chung của sản phẩm."
        >
          <div className="space-y-3">
            {versions.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-4 text-sm text-foreground/55">
                Chưa có phiên bản nào. Nếu tool chỉ có một bản, bạn có thể để trống.
              </div>
            ) : (
              versions.map((version, index) => (
                <div key={index} className="rounded-2xl border border-white/8 bg-black/15 p-4">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="text-sm font-medium text-foreground/90">Phiên bản {index + 1}</div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => markDefaultVersion(index)}
                        className={cn(
                          'rounded-full px-3 py-1 text-xs transition ring-1',
                          version.is_default
                            ? 'bg-brand-orange/10 text-brand-orange ring-brand-orange/35'
                            : 'text-foreground/55 ring-white/10 hover:bg-white/[0.04] hover:text-foreground',
                        )}
                      >
                        {version.is_default ? 'Mặc định' : 'Đặt mặc định'}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeVersion(index)}
                        className="rounded-full px-3 py-1 text-xs text-red-300 ring-1 ring-red-500/25 transition hover:bg-red-500/10"
                      >
                        Xoá
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField label="Tên phiên bản" htmlFor={`version-name-${index}`} required>
                      <input
                        id={`version-name-${index}`}
                        value={version.name}
                        onChange={(e) => updateVersion(index, { name: e.target.value })}
                        placeholder="MockupAutomation"
                        className={inputCls}
                      />
                    </FormField>
                    <FormField label="Slug/key" htmlFor={`version-slug-${index}`} hint="Dùng để nhận diện nội bộ, viết thường không dấu.">
                      <input
                        id={`version-slug-${index}`}
                        value={version.slug ?? ''}
                        onChange={(e) => updateVersion(index, { slug: e.target.value })}
                        placeholder="mockup-automation"
                        className={inputCls}
                      />
                    </FormField>
                  </div>

                  <FormField label="Mô tả ngắn" htmlFor={`version-description-${index}`}>
                    <textarea
                      id={`version-description-${index}`}
                      rows={2}
                      value={version.description ?? ''}
                      onChange={(e) => updateVersion(index, { description: e.target.value })}
                      placeholder="Phiên bản đầy đủ cho quy trình tạo mockup nhiều bước."
                      className={inputCls}
                    />
                  </FormField>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField label="Tên file .exe" htmlFor={`version-exe-${index}`}>
                      <input
                        id={`version-exe-${index}`}
                        value={version.executable_label ?? ''}
                        onChange={(e) => updateVersion(index, { executable_label: e.target.value })}
                        placeholder="MockupAutomation.exe"
                        className={inputCls}
                      />
                    </FormField>
                    <FormField label="Nền tảng" htmlFor={`version-platform-${index}`}>
                      <input
                        id={`version-platform-${index}`}
                        value={version.platform ?? ''}
                        onChange={(e) => updateVersion(index, { platform: e.target.value })}
                        placeholder="Windows 10+ 64-bit"
                        className={inputCls}
                      />
                    </FormField>
                  </div>

                  <FormField label="Trạng thái" htmlFor={`version-status-${index}`} hint="Tất cả phiên bản dùng chung giá ở phần “Giá & cách bán” phía trên.">
                    <select
                      id={`version-status-${index}`}
                      value={version.status ?? 'available'}
                      onChange={(e) => updateVersion(index, { status: e.target.value as ProductVersionStatus })}
                      className={inputCls}
                    >
                      {VERSION_STATUS_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value} className="bg-[#0d0d10]">
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </FormField>
                </div>
              ))
            )}
          </div>

          <button
            type="button"
            onClick={() => setVersions((curr) => [...curr, emptyVersion()])}
            className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-foreground/80 transition hover:bg-white/[0.04]"
          >
            Thêm phiên bản
          </button>
        </FormSection>
      )}

      {kind !== 'prompt' && (
        <FormSection
          title="Giao hàng & hỗ trợ"
          description="Nói rõ khách sẽ nhận gì, được hỗ trợ qua đâu và cần chuẩn bị gì trước khi mua."
        >
        <FormField
          label="Khách nhận được"
          htmlFor="deliverables"
          hint="Mỗi dòng là một hạng mục. Hiện ở sidebar trang chi tiết."
        >
          <textarea
            id="deliverables"
            rows={4}
            value={deliverables}
            onChange={(e) => setDeliverables(e.target.value)}
            placeholder={
              kind === 'tool'
                ? 'File .exe + folder _internal/&#10;Hướng dẫn sử dụng PDF&#10;Bảo hành 30 ngày'
                : 'Source code (GitHub)&#10;Deploy Vercel/Netlify&#10;Hỗ trợ cấu hình domain'
            }
            className={inputCls}
          />
        </FormField>

        <FormField
          label="Hình thức hỗ trợ / giao hàng"
          htmlFor="support_options"
          hint="Chọn các kênh hoặc cách bàn giao mà khách sẽ nhận."
        >
          <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
            {ALL_SUPPORT.map((opt) => {
              const sm = SUPPORT_META[opt];
              const checked = supportOptions.includes(opt);
              return (
                <label
                  key={opt}
                  className={cn(
                    'flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 text-sm transition',
                    checked
                      ? 'border-brand-orange/40 bg-brand-orange/10'
                      : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.06]',
                  )}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleSupport(opt)}
                    className="mt-0.5 h-4 w-4 accent-brand-orange"
                  />
                  <div className="flex-1 leading-tight">
                    <div className="font-medium">{sm.label}</div>
                    <div className="mt-0.5 text-[11.5px] text-foreground/55">
                      {sm.description}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        </FormField>

        <FormField
          label="Yêu cầu trước khi dùng"
          htmlFor="prerequisites"
          hint="Mỗi dòng là một yêu cầu về thiết bị, tài khoản hoặc kiến thức cần có."
        >
          <textarea
            id="prerequisites"
            rows={3}
            value={prerequisites}
            onChange={(e) => setPrerequisites(e.target.value)}
            placeholder={
              kind === 'tool'
                ? 'Windows 10+ 64-bit&#10;Trình duyệt Chrome'
                : 'Không yêu cầu kiến thức trước'
            }
            className={inputCls}
          />
        </FormField>
        </FormSection>
      )}

      {kind !== 'prompt' && (
        <FormSection
          title="Hiển thị & vận hành"
        description="Các thiết lập nội bộ quyết định sản phẩm có được hiển thị, ưu tiên và thống kê như thế nào."
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField label="Trạng thái" htmlFor="status">
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as ProductStatus)}
              className={inputCls}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value} className="bg-[#0d0d10]">
                  {s.label}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Thứ tự ưu tiên" htmlFor="sort_order" hint="Số lớn hiện trước. Mặc định là 0.">
            <NumberStepper
              id="sort_order"
              min={0}
              value={sortOrder}
              onChange={setSortOrder}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="h-4 w-4 accent-brand-orange"
            />
            <span className="text-sm">
              <span className="font-medium">Nổi bật</span>{' '}
              <span className="text-foreground/55">— ưu tiên hiển thị ở landing page</span>
            </span>
          </label>
          <div className="flex flex-col justify-between rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3">
            <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
              Số lượt xem
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-semibold tabular-nums text-foreground">
                {viewCount.toLocaleString('vi-VN')}
              </span>
              <span className="text-xs text-foreground/55">lượt</span>
            </div>
            <span className="mt-1 block text-[11px] text-foreground/45">
              Tự đếm theo mỗi lượt khách mở trang chi tiết. Không chỉnh sửa thủ công.
            </span>
          </div>
        </div>
        </FormSection>
      )}

      {errorMsg && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-300 ring-1 ring-red-500/30">
          {errorMsg}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-6">
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={state === 'saving' || !title.trim()}
            className={cn(
              'inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition',
              title.trim() && state !== 'saving'
                ? 'bg-brand-gradient text-black hover:brightness-110'
                : 'cursor-not-allowed bg-white/5 text-muted-foreground',
            )}
          >
            {state === 'saving' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Đang lưu…
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {mode === 'create' ? 'Tạo sản phẩm' : 'Lưu thay đổi'}
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-xl border border-white/10 px-5 py-2.5 text-sm text-foreground/80 transition hover:bg-white/[0.04]"
          >
            Huỷ
          </button>
        </div>
        {mode === 'edit' && initial?.id && (
          <button
            type="button"
            onClick={onDelete}
            disabled={state === 'deleting'}
            className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 px-4 py-2.5 text-sm text-red-300 transition hover:bg-red-500/10"
          >
            {state === 'deleting' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            Xoá sản phẩm
          </button>
        )}
      </div>
    </form>
  );
}

const inputCls =
  'mt-2 w-full rounded-xl bg-white/[0.02] px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground ring-1 ring-white/8 transition focus:outline-none focus:ring-white/25';

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/8 bg-white/[0.02] p-4 md:p-5">
      <div className="mb-4">
        <h2 className="text-sm font-semibold tracking-tight text-foreground">{title}</h2>
        <p className="mt-1 text-xs leading-relaxed text-foreground/55">{description}</p>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function FormField({
  label,
  htmlFor,
  hint,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="block">
      <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
        {label} {required && <span className="text-brand-orange">*</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-foreground/45">{hint}</span>}
    </label>
  );
}

function NumberStepper({
  id,
  value,
  onChange,
  min,
  max,
  step = 1,
  disabled,
  placeholder,
}: {
  id?: string;
  value: string;
  onChange: (next: string) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  placeholder?: string;
}) {
  function clamp(n: number) {
    let result = n;
    if (min != null && result < min) result = min;
    if (max != null && result > max) result = max;
    return result;
  }
  function adjust(delta: number) {
    if (disabled) return;
    const parsed = Number.parseInt(value, 10);
    const base = Number.isFinite(parsed) ? parsed : (min ?? 0);
    onChange(String(clamp(base + delta)));
  }
  const allowNegative = min == null || min < 0;
  return (
    <div
      className={cn(
        'mt-2 flex w-full items-stretch overflow-hidden rounded-xl bg-white/[0.02] ring-1 ring-white/8 transition focus-within:ring-white/25',
        disabled && 'opacity-40',
      )}
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label="Giảm"
        onClick={() => adjust(-step)}
        disabled={disabled}
        className="flex w-10 shrink-0 items-center justify-center border-r border-white/8 text-lg leading-none text-foreground/55 transition hover:bg-white/[0.05] hover:text-foreground disabled:cursor-not-allowed"
      >
        −
      </button>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e) => {
          const pattern = allowNegative ? /[^\d-]/g : /[^\d]/g;
          onChange(e.target.value.replace(pattern, ''));
        }}
        className="min-w-0 flex-1 bg-transparent px-2 py-2.5 text-center text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed"
      />
      <button
        type="button"
        tabIndex={-1}
        aria-label="Tăng"
        onClick={() => adjust(step)}
        disabled={disabled}
        className="flex w-10 shrink-0 items-center justify-center border-l border-white/8 text-lg leading-none text-foreground/55 transition hover:bg-white/[0.05] hover:text-foreground disabled:cursor-not-allowed"
      >
        +
      </button>
    </div>
  );
}
