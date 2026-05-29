import { NextResponse } from 'next/server';
import { generateContent } from '@/lib/gemini';
import { getCoverLetterSystemInstruction, getCoverLetterPrompt } from '@/lib/prompts';
import { checkRateLimit } from '@/lib/rate-limiter';
import { getSupabase, getSupabaseServiceRole } from '@/lib/supabase';

const MAX_INPUT_LENGTH = 5000;

export async function POST(request: Request) {
  try {
    // 1. Check Auth & Credits
    const supabase = await getSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please login first.' }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseServiceRole();
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('credits_balance')
      .eq('id', user.id)
      .single();

    if (!profile || profile.credits_balance <= 0) {
      return NextResponse.json({ error: 'Insufficient credits. Please top up.' }, { status: 403 });
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
    const { name, email, experience, jobDescription, language = 'auto' } = body;

    // Validate
    if (!name || !email || !experience || !jobDescription) {
      return NextResponse.json(
        { error: 'Name, email, experience, and job description are required.' },
        { status: 400 }
      );
    }

    if (experience.length > MAX_INPUT_LENGTH || jobDescription.length > MAX_INPUT_LENGTH) {
      return NextResponse.json(
        { error: `Input must be under ${MAX_INPUT_LENGTH} characters.` },
        { status: 400 }
      );
    }

    // Generate
    const systemInstruction = getCoverLetterSystemInstruction(language);
    const prompt = getCoverLetterPrompt(name, email, experience, jobDescription);
    const result = await generateContent(prompt, systemInstruction);

    // 3. Deduct Credits & Save Document (Atomically via RPC)
    const { data: rpcData, error: rpcError } = await supabaseAdmin.rpc('consume_credit_and_save_doc', {
      p_user_id: user.id,
      p_doc_type: 'cover_letter',
      p_content: result
    });

    if (rpcError) {
      console.error('RPC Error consuming credit/saving doc:', rpcError);
      return NextResponse.json({ error: 'Failed to save generated document.' }, { status: 500 });
    }

    return NextResponse.json({ result }, { status: 200 });
  } catch (error: any) {
    console.error('Cover letter generation error:', error);

    const errorMessage = error?.message || '';
    if (errorMessage.includes('API key') || errorMessage.includes('GEMINI_API_KEY')) {
      return NextResponse.json(
        { error: 'API key is invalid or missing. Please set a valid GEMINI_API_KEY in your .env file.' },
        { status: 401 }
      );
    }

    const status = error?.status || error?.httpStatusCode;
    if (status === 429 || status === 503) {
      return NextResponse.json(
        { error: 'AI service is currently busy or experiencing high demand. Please try again in a few seconds.' },
        { status: 503 }
      );
    }

    return NextResponse.json({ error: 'Failed to generate content. Please try again.' }, { status: 500 });
  }
}
