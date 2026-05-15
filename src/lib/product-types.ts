import type { LucideIcon } from 'lucide-react';
import { Bot, Wrench, LibraryBig, Globe } from 'lucide-react';

export type ProductKind = 'tool' | 'setup' | 'prompt' | 'webwork';
export type ProductStatus = 'draft' | 'published' | 'sold_out' | 'archived';
export type PricingMode = 'fixed' | 'from' | 'quote';
export type InquiryStatus = 'new' | 'contacted' | 'closed';
export type SupportOption = 'drive_folder' | 'zalo_group' | 'one_on_one_call' | 'remote_setup';
export type ProductVersionStatus = 'available' | 'beta' | 'deprecated' | 'hidden';

export interface ProductVersion {
  name: string;
  slug?: string;
  description?: string | null;
  executable_label?: string | null;
  platform?: string | null;
  price_vnd?: number | null;
  pricing_mode?: PricingMode;
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
  status: ProductStatus;
  featured: boolean;
  sort_order: number;
  sales_count: number;
  created_at: string;
  updated_at: string;
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
  setup: {
    kind: 'setup',
    label: 'Hướng dẫn setup',
    shortLabel: 'Setup',
    pluralLabel: 'Setup guides',
    description: 'Setup giúp non-IT: MCP server, plugin AI, OpenClaw, FX broker API, Claude Code, v.v. — bạn không phải tự đọc docs.',
    route: '/setup',
    icon: Wrench,
    accent: 'from-brand-orange/70 to-brand-amber/40',
    emptyTitle: 'Setup guide đang biên soạn',
    emptyBody: 'Đang ghi hình các bộ setup guide đầu tiên. Bạn cần setup gì cụ thể? Ping mình.',
    ctaLabel: 'Đặt setup riêng',
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

export const ALL_KINDS: ProductKind[] = ['tool', 'setup', 'prompt', 'webwork'];

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
  remote_setup: {
    label: 'Remote setup',
    description: 'TeamViewer / AnyDesk — mình vào máy bạn setup luôn',
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

export const SETUP_CATEGORIES = [
  { value: 'mcp', label: 'MCP server' },
  { value: 'plugin', label: 'Plugin / Extension' },
  { value: 'openclaw', label: 'OpenClaw / FX' },
  { value: 'broker-api', label: 'Broker API' },
  { value: 'claude-code', label: 'Claude Code / AI agent' },
  { value: 'integration', label: 'API integration' },
  { value: 'other', label: 'Khác' },
] as const;

export const PROMPT_CATEGORIES = [
  { value: 'cong-viec', label: 'Công việc' },
  { value: 'kinh-doanh', label: 'Kinh doanh' },
  { value: 'sang-tao', label: 'Sáng tạo nội dung' },
  { value: 'hoc-tap', label: 'Học tập' },
  { value: 'automation', label: 'Automation' },
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
    case 'setup':
      return SETUP_CATEGORIES;
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

export function formatVersionPrice(
  version: ProductVersion,
  product: Pick<Product, 'price_vnd' | 'pricing_mode' | 'is_free'>,
): string {
  return formatPriceVnd(
    version.price_vnd ?? product.price_vnd,
    version.pricing_mode ?? product.pricing_mode,
    product.is_free,
  );
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
