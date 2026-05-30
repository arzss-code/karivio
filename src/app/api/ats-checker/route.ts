import { NextResponse } from 'next/server';
import { generateContent, generateContentWithPdf } from '@/lib/gemini';
import { getAtsCheckerSystemInstruction, getAtsCheckerPrompt } from '@/lib/prompts';
import { checkRateLimit } from '@/lib/rate-limiter';
import { getSupabase, getSupabaseServiceRole } from '@/lib/supabase';

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
    const { cvText, jobDescription, formatIssues = [], cvJson = null } = body;

    if (!cvText) {
      return NextResponse.json({ error: 'Missing CV content.' }, { status: 400 });
    }

    const systemInstruction = getAtsCheckerSystemInstruction();
    const prompt = getAtsCheckerPrompt(cvText, jobDescription, formatIssues);

    let rawJsonText = await generateContent(prompt, systemInstruction, 3, true);

    // Clean up response if it contains markdown formatting
    let cleanedJsonText = rawJsonText;
    if (cleanedJsonText.startsWith('```json')) {
      cleanedJsonText = cleanedJsonText.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (cleanedJsonText.startsWith('```')) {
      cleanedJsonText = cleanedJsonText.replace(/^```\n/, '').replace(/\n```$/, '');
    }

    const result = JSON.parse(cleanedJsonText);

    // Deduct 1 credit and save to history
    const { data: rpcData, error: rpcError } = await supabaseAdmin.rpc('consume_credit_and_save_doc', {
      p_user_id: user.id,
      p_doc_type: 'ats_check',
      p_content: { ...result, cvText, jobDescription, cvJson }
    });

    if (rpcError) {
      console.error('RPC Error consuming credit/saving doc:', rpcError);
      return NextResponse.json({ error: 'Failed to save ATS history.' }, { status: 500 });
    }

    return NextResponse.json({ result });

  } catch (error: any) {
    console.error('ATS Checker Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process ATS check. Please try again.' },
      { status: 500 }
    );
  }
}
