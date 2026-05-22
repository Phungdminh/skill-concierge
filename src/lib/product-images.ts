import { extractYouTubeId, type Product } from '@/lib/product-types';

function youtubeThumbnail(url: string | null | undefined, quality: 'hqdefault' | 'maxresdefault') {
  const videoId = extractYouTubeId(url);
  return videoId ? `https://i.ytimg.com/vi/${videoId}/${quality}.jpg` : null;
}

export function productCardImage(product: Pick<Product, 'thumbnail_url' | 'gallery' | 'youtube_url'>) {
  return product.thumbnail_url ?? product.gallery[0] ?? youtubeThumbnail(product.youtube_url, 'maxresdefault');
}

export function productPreviewImage(product: Pick<Product, 'kind' | 'thumbnail_url' | 'gallery' | 'youtube_url'>) {
  if (product.kind === 'prompt') {
    return product.gallery[0] ?? product.thumbnail_url ?? null;
  }
  return product.thumbnail_url ?? youtubeThumbnail(product.youtube_url, 'hqdefault') ?? product.gallery[0] ?? null;
}
