import type { APIRoute } from 'astro';
import { generateContent } from '../../lib/gemini';
import { getCVSystemInstruction, getCVPrompt } from '../../lib/prompts';
import { checkRateLimit } from '../../lib/rate-limiter';
import { getSupabase, getSupabaseServiceRole } from '../../lib/supabase';

const MAX_INPUT_LENGTH = 5000;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // 1. Check Auth & Credits
    const supabase = getSupabase(cookies);
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized. Please login first.' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    const supabaseAdmin = getSupabaseServiceRole();
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('credits_balance')
      .eq('id', session.user.id)
      .single();

    if (!profile || profile.credits_balance <= 0) {
      return new Response(JSON.stringify({ error: 'Insufficient credits. Please top up.' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
    }

    // 2. Rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const rateCheck = checkRateLimit(session.user.id); // Rate limit by user ID now instead of IP
    if (!rateCheck.allowed) {
      return new Response(
        JSON.stringify({ error: 'Too many requests. Please try again in a moment.', retryAfterMs: rateCheck.retryAfterMs }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse body
    const body = await request.json();
    const { 
      personalInfo = '',
      experience = '', 
      education = '',
      projects = '',
      jobDescription = '', 
      language = 'auto' 
    } = body;

    // Validate
    if (!experience && !jobDescription) {
      return new Response(
        JSON.stringify({ error: 'Experience or job description is required.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const inputLength = experience.length + education.length + projects.length + jobDescription.length;
    if (inputLength > MAX_INPUT_LENGTH * 2) {
      return new Response(
        JSON.stringify({ error: `Total input must be under ${MAX_INPUT_LENGTH * 2} characters.` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Generate
    const systemInstruction = getCVSystemInstruction(language);
    const prompt = getCVPrompt(personalInfo, experience, education, projects, jobDescription);
    const resultText = await generateContent(prompt, systemInstruction, 3, true);
    
    // Attempt to parse JSON safely
    let result;
    try {
      result = JSON.parse(resultText);
    } catch (e) {
      result = { error: "Failed to parse JSON", raw: resultText };
    }

    // 3. Deduct Credits & Save Document (Atomically via RPC)
    const { data: rpcData, error: rpcError } = await supabaseAdmin.rpc('consume_credit_and_save_doc', {
      p_user_id: session.user.id,
      p_doc_type: 'resume',
      p_content: result
    });

    if (rpcError) {
      console.error('RPC Error consuming credit/saving doc:', rpcError);
      return new Response(JSON.stringify({ error: 'Failed to save generated document.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ result }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('CV generation error:', error);

    const errorMessage = error?.message || '';
    if (errorMessage.includes('API key') || errorMessage.includes('GEMINI_API_KEY')) {
      return new Response(
        JSON.stringify({
          error: 'API key is invalid or missing. Please set a valid GEMINI_API_KEY in your .env file.',
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const status = error?.status || error?.httpStatusCode;
    if (status === 429 || status === 503) {
      return new Response(
        JSON.stringify({
          error: 'AI service is currently busy or experiencing high demand. Please try again in a few seconds.',
        }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Failed to generate content. Please try again.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
