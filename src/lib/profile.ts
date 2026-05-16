import type { User } from '@supabase/supabase-js';
import { createClient } from './supabase/server';
import type { Profile } from './profile-types';

export async function getCurrentUserWithProfile(): Promise<
  { user: User; profile: Profile | null } | null
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();
  return { user, profile: (profile as Profile | null) ?? null };
}
