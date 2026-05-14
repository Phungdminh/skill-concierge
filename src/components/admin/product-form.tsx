'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save, Trash2 } from 'lucide-react';
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
} from '@/lib/product-types';
import { cn } from '@/lib/utils';

interface ProductFormProps {
  initial?: Partial<Product>;
  mode: 'create' | 'edit';
  defaultKind?: ProductKind;
}

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

const ALL_SUPPORT: SupportOption[] = [
  'drive_folder',
  'zalo_group',
  'one_on_one_call',
  'remote_setup',
];

export function ProductForm({ initial, mode, defaultKind = 'tool' }: ProductFormProps) {
  const router = useRouter();
  const [kind, setKind] = useState<ProductKind>(
    (initial?.kind as ProductKind) ?? defaultKind,
  );
  const [title, setTitle] = useState(initial?.title ?? '');
  const [slug, setSlug] = useState(initial?.slug ?? '');
  const [slugDirty, setSlugDirty] = useState(Boolean(initial?.slug));
  const [tagline, setTagline] = useState(initial?.tagline ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [youtubeUrl, setYoutubeUrl] = useState(initial?.youtube_url ?? '');
  const [thumbnailUrl, setThumbnailUrl] = useState(initial?.thumbnail_url ?? '');
  const [gallery, setGallery] = useState((initial?.gallery ?? []).join('\n'));
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
  const [isFree, setIsFree] = useState<boolean>(initial?.is_free ?? false);
  const [sortOrder, setSortOrder] = useState<string>(
    initial?.sort_order == null ? '0' : String(initial.sort_order),
  );
  const [salesCount, setSalesCount] = useState<string>(
    initial?.sales_count == null ? '0' : String(initial.sales_count),
  );
  const [state, setState] = useState<'idle' | 'saving' | 'deleting' | 'error'>('idle');
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

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (state === 'saving') return;
    setState('saving');
    setErrorMsg(null);
    const sortOrderNum = Number.parseInt(sortOrder, 10);
    const salesCountNum = Number.parseInt(salesCount, 10);
    const basePayload = {
      title: title.trim(),
      slug: slug.trim() || slugify(title),
      tagline: tagline.trim() || null,
      description: description.trim() || null,
      youtube_url: youtubeUrl.trim() || null,
      thumbnail_url: thumbnailUrl.trim() || null,
      gallery: gallery.split('\n').map((s) => s.trim()).filter(Boolean),
      pricing_mode: isFree ? 'fixed' : pricingMode,
      price_vnd:
        isFree || pricingMode === 'quote' || priceVnd.trim() === ''
          ? null
          : Number.parseInt(priceVnd, 10),
      is_free: kind === 'prompt' ? isFree : false,
      categories: selectedCategories,
      tags: tags.split(',').map((s) => s.trim()).filter(Boolean),
      deliverables: deliverables.split('\n').map((s) => s.trim()).filter(Boolean),
      support_options: supportOptions,
      duration_label: durationLabel.trim() || null,
      prerequisites: prerequisites.split('\n').map((s) => s.trim()).filter(Boolean),
      status,
      featured,
      sort_order: Number.isFinite(sortOrderNum) ? sortOrderNum : 0,
      sales_count: Number.isFinite(salesCountNum) && salesCountNum > 0 ? salesCountNum : 0,
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
        description="Chọn loại sản phẩm, đặt tên dễ hiểu và kiểm tra đường dẫn công khai."
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
          <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-4">
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
          <FormField label="Tiêu đề" htmlFor="title" hint="Tên khách sẽ thấy ở card và trang chi tiết." required>
            <input
              id="title"
              required
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder={
                kind === 'tool'
                  ? 'Sheet Cleaner'
                  : kind === 'setup'
                    ? 'Setup OpenClaw cho FX trader'
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
          label="Mô tả chi tiết (Markdown)"
          htmlFor="description"
          hint="Có thể dùng tiêu đề, danh sách, link và code block Markdown."
        >
          <textarea
            id="description"
            rows={10}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={
              kind === 'prompt'
                ? '### Mô tả\n- Prompt dùng cho…\n- Cách chỉnh theo ngữ cảnh…'
                : '### Tính năng\n- Tự động hoá X\n- Generate Y'
            }
            className={cn(inputCls, 'font-mono text-[13px]')}
          />
        </FormField>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField label="Danh mục" htmlFor="category-dropdown" hint="Có thể chọn nhiều danh mục để khách lọc sản phẩm dễ hơn.">
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
          <FormField
            label="Thời lượng / phạm vi"
            htmlFor="duration_label"
            hint={
              kind === 'prompt'
                ? 'Vd: "50 prompt · 5 nhóm use case"'
                : kind === 'setup'
                  ? 'Vd: "30-60 phút remote setup"'
                  : kind === 'webwork'
                    ? 'Vd: "5-7 ngày từ brief đến deploy"'
                    : 'Không bắt buộc với tool'
            }
          >
            <input
              id="duration_label"
              value={durationLabel}
              onChange={(e) => setDurationLabel(e.target.value)}
              placeholder={
                kind === 'prompt'
                  ? '50 prompt · 5 nhóm use case'
                  : kind === 'setup'
                    ? '30-60 phút remote setup'
                    : kind === 'webwork'
                      ? '5-7 ngày từ brief đến deploy'
                      : 'Giao trong 24h'
              }
              className={inputCls}
            />
          </FormField>
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
        title="Media"
        description="Thêm video, ảnh đại diện và ảnh minh hoạ để tăng độ tin cậy khi khách xem sản phẩm."
      >
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

        <FormField
          label="Thư viện ảnh"
          htmlFor="gallery"
          hint="Mỗi URL ảnh trên một dòng. Nên dùng ảnh chụp màn hình thật hoặc kết quả mẫu."
        >
          <textarea
            id="gallery"
            rows={3}
            value={gallery}
            onChange={(e) => setGallery(e.target.value)}
            placeholder="https://example.com/shot-1.png&#10;https://example.com/shot-2.png"
            className={inputCls}
          />
        </FormField>
      </FormSection>

      <FormSection
        title="Giá & cách bán"
        description="Chọn cách hiển thị giá. Miễn phí hoặc báo giá sẽ tự ẩn ô nhập giá khi không cần."
      >
        {kind === 'prompt' && (
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
            <input
              type="checkbox"
              checked={isFree}
              onChange={(e) => setIsFree(e.target.checked)}
              className="h-4 w-4 accent-brand-orange"
            />
            <span className="text-sm">
              <span className="font-medium">Miễn phí</span>{' '}
              <span className="text-foreground/55">— prompt này không tính phí và sẽ hiển thị nhãn &quot;Miễn phí&quot;</span>
            </span>
          </label>
        )}

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
            <input
              id="price_vnd"
              type="number"
              min={0}
              step={1000}
              value={priceVnd}
              disabled={isFree || pricingMode === 'quote'}
              onChange={(e) => setPriceVnd(e.target.value)}
              placeholder="1500000"
              className={cn(inputCls, (isFree || pricingMode === 'quote') && 'opacity-40')}
            />
          </FormField>
        </div>
      </FormSection>

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
                ? 'File .exe + folder _internal/&#10;Hướng dẫn cài đặt PDF&#10;Bảo hành 30 ngày'
                : kind === 'setup'
                  ? 'Video screen-record các bước&#10;File config mẫu&#10;Hỗ trợ Zalo 7 ngày'
                  : kind === 'prompt'
                    ? 'File prompt (PDF/Notion)&#10;Hướng dẫn chỉnh theo ngữ cảnh&#10;Cập nhật mẫu mới miễn phí'
                    : 'Source code (GitHub)&#10;Deploy Vercel/Netlify&#10;Domain setup hỗ trợ'
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
                : kind === 'prompt'
                  ? 'Có tài khoản Claude/ChatGPT&#10;Biết copy và chỉnh thông tin cơ bản'
                  : 'Không yêu cầu kiến thức trước'
            }
            className={inputCls}
          />
        </FormField>
      </FormSection>

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
            <input
              id="sort_order"
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className={inputCls}
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
          <FormField label="Số lượt bán" htmlFor="sales_count" hint="Dùng cho thống kê và chọn demo nổi bật trên landing page.">
            <input
              id="sales_count"
              type="number"
              min="0"
              value={salesCount}
              onChange={(e) => setSalesCount(e.target.value)}
              className={inputCls}
            />
          </FormField>
        </div>
      </FormSection>

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
