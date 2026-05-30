import { NextResponse } from 'next/server';
import { generateContent } from '@/lib/gemini';
import { checkRateLimit } from '@/lib/rate-limiter';
import { getSupabase } from '@/lib/supabase';

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
    const { sentence, context } = body;

    if (!sentence) {
      return NextResponse.json({ error: 'Missing sentence.' }, { status: 400 });
    }

    const systemInstruction = 'You are an expert career coach and resume writer. Your job is to rewrite a weak resume bullet point into a strong, impactful bullet point using the STAR (Situation, Task, Action, Result) method. Always start with a strong Action Verb. Add placeholders like [X]% or [Metric] if the user needs to fill in numbers. Return ONLY the rewritten sentence as plain text without quotes or explanations.';
    
    const prompt = `Rewrite this resume bullet point to make it more impactful:\n\nOriginal: "${sentence}"\n\nContext (Job or Full CV Context): ${context || 'None provided'}\n\nRewritten Bullet Point:`;

    const rewrittenSentence = await generateContent(prompt, systemInstruction, 3, false);

    return NextResponse.json({ rewrittenSentence: rewrittenSentence.trim() });

  } catch (error: any) {
    console.error('ATS Rewrite Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to rewrite sentence. Please try again.' },
      { status: 500 }
    );
  }
}
