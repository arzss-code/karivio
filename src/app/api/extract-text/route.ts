import { NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limiter';
import { getSupabase } from '@/lib/supabase';
import { parsePdfWithLayout } from '@/lib/pdf-parser';

export async function POST(request: Request) {
  try {
    // 1. Check Auth
    const supabase = await getSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please login first.' }, { status: 401 });
    }

    // 2. Rate limiting
    const rateCheck = checkRateLimit(user.id);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again in a moment.', retryAfterMs: rateCheck.retryAfterMs },
        { status: 429 }
      );
    }

    // Parse body
    const body = await request.json();
    const { pdfBase64 } = body;

    if (!pdfBase64) {
      return NextResponse.json({ error: 'Missing PDF.' }, { status: 400 });
    }

    // Convert Base64 to ArrayBuffer
    const binaryString = atob(pdfBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const pdfBuffer = bytes.buffer;

    // Use our pdfjs-dist based parser
    const parseResult = await parsePdfWithLayout(pdfBuffer);

    return NextResponse.json({ 
      text: parseResult.text,
      formatIssues: parseResult.formatIssues,
      hasMultipleColumns: parseResult.hasMultipleColumns
    });

  } catch (error: any) {
    console.error('PDF Extraction Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to extract text from PDF.' },
      { status: 500 }
    );
  }
}
