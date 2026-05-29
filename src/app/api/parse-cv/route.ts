import { NextResponse } from 'next/server';
import { generateContent } from '@/lib/gemini';
import { getParseCVPrompt } from '@/lib/prompts';
import { checkRateLimit } from '@/lib/rate-limiter';
import { getSupabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const supabase = await getSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please login first.' }, { status: 401 });
    }

    const rateCheck = checkRateLimit(user.id);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again in a moment.', retryAfterMs: rateCheck.retryAfterMs },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { cvText } = body;

    if (!cvText) {
      return NextResponse.json({ error: 'Missing CV content.' }, { status: 400 });
    }

    const systemInstruction = 'You are a precise data extractor. Your job is to convert unstructured resume text into a specific structured JSON format without losing or adding information.';
    const prompt = getParseCVPrompt(cvText);

    const rawJsonText = await generateContent(prompt, systemInstruction, 3, true);

    let cleanedJsonText = rawJsonText;
    if (cleanedJsonText.startsWith('```json')) {
      cleanedJsonText = cleanedJsonText.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (cleanedJsonText.startsWith('```')) {
      cleanedJsonText = cleanedJsonText.replace(/^```\n/, '').replace(/\n```$/, '');
    }

    const result = JSON.parse(cleanedJsonText);

    return NextResponse.json({ result });

  } catch (error: any) {
    console.error('Parse CV Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to parse CV text into JSON.' },
      { status: 500 }
    );
  }
}
