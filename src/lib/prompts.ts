export function getCVSystemInstruction(language: string): string {
  const langInstruction =
    language === 'auto'
      ? "Always respond in the same language as the user's input."
      : language === 'id'
        ? 'Always respond in Bahasa Indonesia.'
        : 'Always respond in English.';

  return `You are an expert professional resume writer. You specialize in writing concise, impactful resume bullet points using the STAR (Situation, Task, Action, Result) framework. You always start with strong action verbs and quantify results whenever possible. You NEVER invent information not provided by the user. ${langInstruction}`;
}

export function getCVPrompt(experience: string, jobDescription: string): string {
  return `Based on the following information, generate professional resume bullet points in STAR format.

Raw Experience/Skills:
${experience}

Target Job Description:
${jobDescription}

Guidelines:
1. Start each bullet with a strong action verb (Engineered, Optimized, Spearheaded, Led, Developed, etc.)
2. Follow STAR: embed Situation context, the Task, specific Actions taken, and measurable Results
3. Keep each bullet to 1-2 lines maximum
4. Quantify results with percentages, dollar amounts, time saved, or team sizes where data is provided
5. Include relevant technical skills and keywords from the job description naturally
6. Generate 5-8 bullet points total
7. If information is insufficient for a STAR element, work with what's available
8. Format as a clean bulleted list using • character
9. Group related bullets under relevant section headers if applicable`;
}

export function getCoverLetterSystemInstruction(language: string): string {
  const langInstruction =
    language === 'auto'
      ? "Always respond in the same language as the user's input."
      : language === 'id'
        ? 'Always respond in Bahasa Indonesia.'
        : 'Always respond in English.';

  return `You are a professional career coach and hiring manager expert. You write compelling, tailored cover letters that connect a candidate's specific achievements to the employer's needs. You NEVER invent information not found in the provided experience. You avoid clichés like "I am excited to apply" or "I am a hard worker." ${langInstruction}`;
}

export function getCoverLetterPrompt(
  name: string,
  email: string,
  experience: string,
  jobDescription: string
): string {
  return `Write a tailored cover letter for the following position.

Candidate: ${name} (${email})
Candidate's Experience & Skills:
${experience}

Job Description:
${jobDescription}

Instructions:
1. Identify the top 3-5 challenges this role is expected to solve from the job description
2. Write a cover letter (under 350 words) connecting the candidate's achievements to those challenges
3. Tone: professional, confident, natural
4. Start with a strong hook showing genuine interest
5. Use specific, quantified achievements from the provided experience
6. Naturally incorporate keywords from the job description (ATS-friendly)
7. End with a confident, respectful call to action
8. Structure: Greeting → Opening hook → Body (2 paragraphs) → Closing
9. Use proper letter formatting with line breaks between paragraphs`;
}
