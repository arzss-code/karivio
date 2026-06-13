import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function GET(request: Request) {
  // Verifikasi request berasal dari Vercel Cron
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const supabase = await getSupabase();
    
    // Melakukan query ringan untuk menjaga instance database tetap aktif
    const { data, error } = await supabase.from('profiles').select('id').limit(1);

    if (error) {
      console.error('Error keeping Supabase alive:', error);
      return new NextResponse('Error pinging database', { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Database pinged successfully' });
  } catch (error) {
    console.error('Unexpected error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
