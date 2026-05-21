import { z } from 'zod';

export function isSafeHttpUrl(value: string | null | undefined): value is string {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return false;
  }
  return parsed.protocol === 'http:' || parsed.protocol === 'https:';
}

export function safeHttpUrl(value: string | null | undefined): string | null {
  return isSafeHttpUrl(value) ? value.trim() : null;
}

export const httpUrl = (opts: { max?: number; message?: string } = {}) => {
  const { max = 2048, message = 'URL phải là http hoặc https.' } = opts;
  return z
    .string()
    .trim()
    .max(max)
    .url(message)
    .refine((u) => /^https?:\/\//i.test(u), { message });
};
