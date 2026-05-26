import type { APIRoute } from 'astro';
import { generateContent } from '../../lib/gemini';
import { getCVSystemInstruction, getCVPrompt } from '../../lib/prompts';
import { checkRateLimit } from '../../lib/rate-limiter';

const MAX_INPUT_LENGTH = 5000;

export const POST: APIRoute = async ({ request }) => {
  try {
    // Rate limiting
    const ip =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';
    const rateCheck = checkRateLimit(ip);
    if (!rateCheck.allowed) {
      return new Response(
        JSON.stringify({
          error: 'Too many requests. Please try again in a moment.',
          retryAfterMs: rateCheck.retryAfterMs,
        }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse body
    const body = await request.json();
    const { experience, jobDescription, language = 'auto' } = body;

    // Validate
    if (!experience || !jobDescription) {
      return new Response(
        JSON.stringify({ error: 'Experience and job description are required.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (experience.length > MAX_INPUT_LENGTH || jobDescription.length > MAX_INPUT_LENGTH) {
      return new Response(
        JSON.stringify({ error: `Input must be under ${MAX_INPUT_LENGTH} characters.` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Generate
    const systemInstruction = getCVSystemInstruction(language);
    const prompt = getCVPrompt(experience, jobDescription);
    const result = await generateContent(prompt, systemInstruction);

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
