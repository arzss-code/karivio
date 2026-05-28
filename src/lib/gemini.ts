import { GoogleGenAI } from '@google/genai';

let ai: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
}

export async function generateContent(
  prompt: string,
  systemInstruction: string,
  retries = 3,
  jsonMode = false
): Promise<string> {
  const client = getClient();
  let lastError;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.7,
          maxOutputTokens: 4096,
          ...(jsonMode ? { responseMimeType: 'application/json' } : {})
        },
      });

      const text = response.text;
      if (!text) {
        throw new Error('Empty response from Gemini API');
      }
      return text;
    } catch (error: any) {
      lastError = error;
      const status = error?.status;
      const message = error?.message || String(error);
      
      const isRetryable = 
        status === 429 || 
        status === 503 || 
        message.includes('429') || 
        message.includes('503') ||
        message.includes('busy') ||
        message.includes('high demand') ||
        message.includes('quota');

      if (isRetryable && attempt < retries) {
        const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
        console.warn(`[Gemini API] Request failed (attempt ${attempt}/${retries}). Retrying in ${delay}ms...`, message);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      throw error;
    }
  }

  throw lastError;
}
