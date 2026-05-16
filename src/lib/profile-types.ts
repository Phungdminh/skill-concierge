export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  gender: Gender | null;
  job_title: string | null;
  provider: string;
  role: 'customer' | 'admin';
  created_at: string;
  updated_at: string;
}

export const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'male', label: 'Nam' },
  { value: 'female', label: 'Nữ' },
  { value: 'other', label: 'Khác' },
  { value: 'prefer_not_to_say', label: 'Không muốn nói' },
];

export function genderLabel(value: Gender | null | undefined): string {
  if (!value) return '';
  return GENDER_OPTIONS.find((option) => option.value === value)?.label ?? '';
}

export function profileNeedsOnboarding(
  profile: Pick<Profile, 'full_name'> | null | undefined,
): boolean {
  if (!profile) return true;
  if (!profile.full_name?.trim()) return true;
  return false;
}

export function safeReturnTo(value: string | null | undefined, fallback = '/'): string {
  if (!value) return fallback;
  if (!value.startsWith('/')) return fallback;
  if (value.startsWith('//')) return fallback;
  return value;
}
