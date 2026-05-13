import type { User } from '@supabase/supabase-js';
import { isAdminEmailVerified } from './admin-verification';
import { createClient } from './supabase/server';

export function isAdmin(user: User | null | undefined): boolean {
  if (!user?.email) return false;
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  if (!adminEmail) return false;
  return user.email.toLowerCase().trim() === adminEmail;
}

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function requireAdminIdentityOnly() {
  const user = await getCurrentUser();
  if (!isAdmin(user)) return null;
  return user;
}

export async function requireAdmin() {
  const user = await requireAdminIdentityOnly();
  if (!user) return null;
  if (!(await isAdminEmailVerified(user))) return null;
  return user;
}
