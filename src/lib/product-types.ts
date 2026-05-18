import type { LucideIcon } from 'lucide-react';
import { Bot, LibraryBig, Globe } from 'lucide-react';

export type ProductKind = 'tool' | 'prompt' | 'webwork';
export type ProductStatus = 'draft' | 'published' | 'sold_out' | 'archived';
export type PricingMode = 'fixed' | 'from' | 'quote';
export type InquiryStatus = 'new' | 'contacted' | 'closed';
export type SupportOption = 'drive_folder' | 'zalo_group' | 'one_on_one_call';
export type ProductVersionStatus = 'available' | 'beta' | 'deprecated' | 'hidden';
export type ProductReviewStatus = 'pending' | 'published' | 'hidden';

export interface PromptMeta {
  preview_content?: string | null;
  full_content?: string | null;
  explanation?: string | null;
  related_slugs?: string[];
}

export interface ProductVersion {
  name: string;
  slug?: string;
  description?: string | null;
  executable_label?: string | null;
  platform?: string | null;
  is_default?: boolean;
  status?: ProductVersionStatus;
}

export interface Product {
  id: string;
  owner_id: string;
  kind: ProductKind;
  slug: string;
  title: string;
  tagline: string | null;
  description: string | null;
  notice: string | null;
  youtube_url: string | null;
  thumbnail_url: string | null;
  gallery: string[];
  pricing_mode: PricingMode;
  price_vnd: number | null;
  is_free: boolean;
  categories: string[];
  tags: string[];
  versions: ProductVersion[];
  deliverables: string[];
  support_options: SupportOption[];
  duration_label: string | null;
  prerequisites: string[];
  prompt_meta: PromptMeta;
  status: ProductStatus;
  featured: boolean;
  sort_order: number;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface ProductReview {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title: string | null;
  body: string | null;
  status: ProductReviewStatus;
  created_at: string;
  updated_at: string;
}

export interface PublicProductReview {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  created_at: string;
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

export interface ProductReviewSummary {
  average: number | null;
  count: number;
}

export interface Inquiry {
  id: string;
  product_id: string | null;
  product_kind: ProductKind | null;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  status: InquiryStatus;
  created_at: string;
}

export interface KindMeta {
  kind: ProductKind;
  label: string;
  shortLabel: string;
  pluralLabel: string;
  description: string;
  route: string;
  icon: LucideIcon;
  accent: string;
  emptyTitle: string;
  emptyBody: string;
  ctaLabel: string;
}

export const KIND_META: Record<ProductKind, KindMeta> = {
  tool: {
    kind: 'tool',
    label: 'Tool desktop',
    shortLabel: 'Tool',
    pluralLabel: 'Tools',
    description: 'File .exe đóng gói sẵn — automation, scraping, mockup, productivity. Mua 1 lần, chạy local trên Windows.',
    route: '/tools',
    icon: Bot,
    accent: 'from-brand-red/70 to-brand-orange/40',
    emptyTitle: 'Tool mới đang trên đường',
    emptyBody: 'Đang đóng gói tool tiếp theo — quay lại sớm nhé. Hoặc nói với mình bạn cần tool gì.',
    ctaLabel: 'Đặt tool riêng',
  },
  prompt: {
    kind: 'prompt',
    label: 'Prompt mẫu',
    shortLabel: 'Prompt mẫu',
    pluralLabel: 'Prompt mẫu',
    description: 'Kho tàng trữ prompt cho tất tần tật về mọi thứ: công việc, học tập, kinh doanh, sáng tạo nội dung, automation và AI hằng ngày.',
    route: '/prompts',
    icon: LibraryBig,
    accent: 'from-brand-amber/70 to-brand-red/40',
    emptyTitle: 'Prompt mẫu đang được cập nhật',
    emptyBody: 'Kho prompt đang được sắp xếp lại — quay lại sớm nhé. Nếu bạn cần prompt cho việc cụ thể, nhắn mình để được gợi ý.',
    ctaLabel: 'Yêu cầu prompt riêng',
  },
  webwork: {
    kind: 'webwork',
    label: 'Làm web / portfolio',
    shortLabel: 'Web / Portfolio',
    pluralLabel: 'Web & Portfolio',
    description: 'Landing page và portfolio cá nhân theo yêu cầu. Vibe-coded gọn nhẹ, deploy Vercel/Netlify, source code đứng tên bạn.',
    route: '/web',
    icon: Globe,
    accent: 'from-brand-red/60 to-brand-amber/30',
    emptyTitle: 'Chưa có case showcase',
    emptyBody: 'Mình đang xin phép khách cũ show portfolio. Trong lúc đó, mô tả nhu cầu của bạn — mình quote trong 24h.',
    ctaLabel: 'Brief project của bạn',
  },
};

export const ALL_KINDS: ProductKind[] = ['tool', 'prompt', 'webwork'];

export const SUPPORT_META: Record<SupportOption, { label: string; description: string }> = {
  drive_folder: {
    label: 'Folder Drive',
    description: 'Video screen-record + PDF + sample config',
  },
  zalo_group: {
    label: 'Zalo group',
    description: 'Group riêng cho khách của tool/prompt mẫu — hỏi đáp trực tiếp',
  },
  one_on_one_call: {
    label: '1-on-1 call 30 phút',
    description: 'Zoom hoặc Zalo video, share màn hình hướng dẫn',
  },
};

export const TOOL_CATEGORIES = [
  { value: 'automation', label: 'Automation' },
  { value: 'scraping', label: 'Scraping' },
  { value: 'mockup', label: 'Mockup / Design' },
  { value: 'desktop', label: 'Desktop App' },
  { value: 'productivity', label: 'Productivity' },
  { value: 'other', label: 'Khác' },
] as const;

export const PROMPT_CATEGORIES = [
  { value: 'content-creator', label: 'Content creator' },
  { value: 'social-media', label: 'Social media' },
  { value: 'seo-blog', label: 'SEO / Blog' },
  { value: 'video-tiktok', label: 'Video / TikTok' },
  { value: 'giao-vien', label: 'Giáo viên' },
  { value: 'hoc-sinh-sinh-vien', label: 'Học sinh / Sinh viên' },
  { value: 'ke-toan-tai-chinh', label: 'Kế toán / Tài chính' },
  { value: 'nhan-su-tuyen-dung', label: 'Nhân sự / Tuyển dụng' },
  { value: 'ban-hang-sales', label: 'Bán hàng / Sales' },
  { value: 'ecommerce-shop', label: 'Shop online / TMĐT' },
  { value: 'cham-soc-khach-hang', label: 'Chăm sóc khách hàng' },
  { value: 'bat-dong-san', label: 'Bất động sản' },
  { value: 'luat-hop-dong', label: 'Luật / Hợp đồng' },
  { value: 'y-te-suc-khoe', label: 'Y tế / Sức khỏe' },
  { value: 'du-lich-khach-san', label: 'Du lịch / Khách sạn' },
  { value: 'nha-hang-fnb', label: 'Nhà hàng / F&B' },
  { value: 'thiet-ke-hinh-anh', label: 'Thiết kế / Hình ảnh' },
  { value: 'lap-trinh', label: 'Lập trình' },
  { value: 'dich-thuat-ngon-ngu', label: 'Dịch thuật / Ngôn ngữ' },
  { value: 'other', label: 'Khác' },
] as const;

export const WEBWORK_CATEGORIES = [
  { value: 'landing', label: 'Landing page' },
  { value: 'portfolio', label: 'Portfolio' },
  { value: 'personal', label: 'Web cá nhân' },
  { value: 'webapp', label: 'Web app cá nhân' },
  { value: 'other', label: 'Khác' },
] as const;

export function categoriesFor(kind: ProductKind) {
  switch (kind) {
    case 'tool':
      return TOOL_CATEGORIES;
    case 'prompt':
      return PROMPT_CATEGORIES;
    case 'webwork':
      return WEBWORK_CATEGORIES;
  }
}

export function categoryLabelFor(kind: ProductKind, value: string): string {
  return categoriesFor(kind).find((category) => category.value === value)?.label ?? value;
}

export function normalizeCategories(values: string[], kind: ProductKind): string[] {
  const allowed = new Set<string>(categoriesFor(kind).map((category) => category.value));
  return Array.from(new Set(values.map((value) => value.trim()).filter((value) => allowed.has(value))));
}

export function formatPriceVnd(price: number | null, mode: PricingMode = 'fixed', isFree = false): string {
  if (isFree) return 'Miễn phí';
  if (mode === 'quote' || price == null) return 'Liên hệ báo giá';
  const formatted = new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  return mode === 'from' ? `Từ ${formatted}` : formatted;
}

export function visibleProductVersions(product: Pick<Product, 'versions'>): ProductVersion[] {
  return product.versions.filter((version) => (version.status ?? 'available') !== 'hidden');
}

export function getPromptMeta(product: Pick<Product, 'prompt_meta'>): PromptMeta {
  const meta = product.prompt_meta ?? {};
  return {
    preview_content: meta.preview_content ?? null,
    full_content: meta.full_content ?? null,
    explanation: meta.explanation ?? null,
    related_slugs: Array.isArray(meta.related_slugs) ? meta.related_slugs : [],
  };
}

export function extractYouTubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([\w-]{11})/,
    /(?:youtu\.be\/)([\w-]{11})/,
    /(?:youtube\.com\/embed\/)([\w-]{11})/,
    /(?:youtube\.com\/shorts\/)([\w-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match) return match[1];
  }
  if (/^[\w-]{11}$/.test(trimmed)) return trimmed;
  return null;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

export function productDetailHref(p: Pick<Product, 'kind' | 'slug'>): string {
  return `${KIND_META[p.kind].route}/${p.slug}`;
}
