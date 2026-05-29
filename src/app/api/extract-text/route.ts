import { NextResponse } from 'next/server';
import { generateContentWithPdf } from '@/lib/gemini';
import { checkRateLimit } from '@/lib/rate-limiter';
import { getSupabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    // 1. Check Auth (Does not cost credits to just extract text, but requires login)
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

    const systemInstruction = 'You are an accurate OCR and text extraction tool. Your only job is to read the provided PDF and output its text exactly as it appears, structured cleanly with line breaks. Do not add any conversational text.';
    const prompt = 'Extract all text from this PDF.';

    const extractedText = await generateContentWithPdf(pdfBase64, prompt, systemInstruction, 3, false);

    return NextResponse.json({ text: extractedText });

  } catch (error: any) {
    console.error('PDF Extraction Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to extract text from PDF.' },
      { status: 500 }
    );
  }
}
