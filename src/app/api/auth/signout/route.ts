import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function POST(request: Request) {
  const supabase = await getSupabase();
  await supabase.auth.signOut();

  return NextResponse.redirect(new URL('/', request.url));
}

export async function GET(request: Request) {
  return POST(request);
}
