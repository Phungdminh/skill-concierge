import { NextResponse } from 'next/server';
import { clearAdminVerificationCookies } from '@/lib/admin-verification';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  await clearAdminVerificationCookies();
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL('/', request.url), { status: 303 });
}
