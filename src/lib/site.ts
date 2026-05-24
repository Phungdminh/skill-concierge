export const SITE_URL = (() => {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (raw && /^https?:\/\//i.test(raw)) {
    return raw.replace(/\/+$/, '');
  }
  return 'https://skillforge.vn';
})();

export const SITE_NAME = 'SkillForge VN';

export const SITE_DESCRIPTION =
  'Tool tự động hoá, prompt và web cá nhân hoá cho team Việt. Tư vấn miễn phí, trả tiền sau khi duyệt demo.';

export function absoluteUrl(path: string): string {
  if (!path) return SITE_URL;
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
