import type { Metadata } from 'next';
import type { Product, ProductReviewSummary } from './product-types';
import { SITE_NAME, SITE_URL, absoluteUrl } from './site';

const KIND_LABEL: Record<Product['kind'], string> = {
  tool: 'Tool',
  prompt: 'Prompt mẫu',
  webwork: 'Web project',
};

const KIND_PATH: Record<Product['kind'], string> = {
  tool: '/tools',
  prompt: '/prompts',
  webwork: '/web',
};

export function productPath(product: Pick<Product, 'kind' | 'slug'>): string {
  return `${KIND_PATH[product.kind]}/${product.slug}`;
}

function pickImage(product: Pick<Product, 'thumbnail_url' | 'gallery'>): string | null {
  if (product.thumbnail_url) return product.thumbnail_url;
  const gallery = Array.isArray(product.gallery) ? product.gallery : [];
  const first = gallery.find((entry): entry is string => typeof entry === 'string' && entry.length > 0);
  return first ?? null;
}

export function buildProductMetadata(
  product: Pick<Product, 'kind' | 'slug' | 'title' | 'tagline' | 'description' | 'thumbnail_url' | 'gallery'> | null,
): Metadata {
  if (!product) {
    return { title: `${SITE_NAME}` };
  }
  const path = productPath(product);
  const url = absoluteUrl(path);
  const image = pickImage(product);
  const description =
    product.tagline?.trim() ||
    product.description?.replace(/\s+/g, ' ').slice(0, 180) ||
    undefined;

  return {
    title: product.title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      url,
      siteName: SITE_NAME,
      title: `${product.title} — ${SITE_NAME}`,
      description,
      images: image ? [{ url: image, alt: product.title }] : undefined,
      locale: 'vi_VN',
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title: product.title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

type JsonLd = Record<string, unknown>;

export function buildProductJsonLd(
  product: Product,
  reviewSummary?: ProductReviewSummary | null,
): JsonLd {
  const path = productPath(product);
  const url = absoluteUrl(path);
  const image = pickImage(product);

  const ld: JsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.tagline ?? undefined,
    url,
    image: image ? [image] : undefined,
    category: KIND_LABEL[product.kind],
    brand: { '@type': 'Brand', name: SITE_NAME },
  };

  if (
    product.pricing_mode !== 'quote' &&
    typeof product.price_vnd === 'number' &&
    Number.isFinite(product.price_vnd) &&
    product.price_vnd > 0
  ) {
    ld.offers = {
      '@type': 'Offer',
      price: product.price_vnd,
      priceCurrency: 'VND',
      availability:
        product.status === 'published' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url,
    };
  } else if (product.is_free) {
    ld.offers = {
      '@type': 'Offer',
      price: 0,
      priceCurrency: 'VND',
      availability: 'https://schema.org/InStock',
      url,
    };
  }

  if (reviewSummary && typeof reviewSummary.average === 'number' && reviewSummary.count > 0) {
    ld.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: Number(reviewSummary.average.toFixed(2)),
      reviewCount: reviewSummary.count,
    };
  }

  return ld;
}

export function buildBreadcrumbJsonLd(product: Pick<Product, 'kind' | 'slug' | 'title'>): JsonLd {
  const kindPath = KIND_PATH[product.kind];
  const kindLabel = KIND_LABEL[product.kind];
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Trang chủ', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: kindLabel, item: absoluteUrl(kindPath) },
      { '@type': 'ListItem', position: 3, name: product.title, item: absoluteUrl(productPath(product)) },
    ],
  };
}

export function jsonLdScript(data: JsonLd | JsonLd[]): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
