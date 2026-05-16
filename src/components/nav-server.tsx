import { createClient } from '@/lib/supabase/server';
import { Nav, type NavInitialProfile, type NavInitialUser } from './nav';

export async function NavServer() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: NavInitialProfile = null;
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('id', user.id)
      .maybeSingle();
    profile = (data as NavInitialProfile) ?? null;
  }

  const initialUser: NavInitialUser = user
    ? { id: user.id, email: user.email ?? null }
    : null;

  return <Nav initialUser={initialUser} initialProfile={profile} />;
}
