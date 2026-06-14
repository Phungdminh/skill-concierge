import { createClient } from '@supabase/supabase-js';

/**
 * Cookie-free Supabase client for public, read-only data (sitemap, RSS, etc.).
 *
 * Unlike `@/lib/supabase/server`, this does not call `cookies()`, so routes that
 * use it can be rendered statically instead of being forced into dynamic mode.
 * It uses the anon key, so RLS still applies — only publicly readable rows are returned.
 */
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );
}
