export function getCVSystemInstruction(language: string): string {
  const langInstruction =
    language === 'auto'
      ? "Always respond in the same language as the user's input."
      : language === 'id'
        ? 'Always respond in Bahasa Indonesia.'
        : 'Always respond in English.';

  return `You are an expert professional resume writer. You specialize in writing concise, impactful resume bullet points using the STAR (Situation, Task, Action, Result) framework. You ALWAYS output data in valid JSON format. You NEVER invent information not provided by the user, but you do structure it elegantly. ${langInstruction}`;
}

export function getCVPrompt(
  personalInfo: string,
  experience: string, 
  education: string, 
  projects: string, 
  jobDescription: string,
  achievements?: string,
  certifications?: string,
): string {
  return `Based on the following information, generate a professional resume structured in JSON format.

Personal Info / Header:
${personalInfo}

Experience Details:
${experience}

Education Details:
${education}

Project Details:
${projects}

${achievements ? `Achievements:\n${achievements}\n\n` : ''}${certifications ? `Certifications:\n${certifications}\n\n` : ''}Target Job Description:
${jobDescription}

Guidelines for the JSON output:
1. The output MUST be a valid JSON object with the following structure:
{
  "header": {
    "name": "Full Name",
    "email": "Email Address",
    "phone": "Phone Number (if any)",
    "linkedin": "LinkedIn URL (if any)"
  },
  "summary": "A strong, 3-4 sentence professional summary tailored to the target job description.",
  "experience": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "date": "Month Year - Month Year",
      "description": [
        "Bullet point 1 in STAR format starting with a strong action verb.",
        "Bullet point 2..."
      ]
    }
  ],
  "education": [
    {
      "degree": "Degree Name",
      "institution": "Institution Name",
      "date": "Year - Year",
      "gpa": "GPA (if provided, else omit key)",
      "description": "Short description of relevant coursework or honors (if provided, else omit key)"
    }
  ],
  "projects": [
    {
      "name": "Project Name",
      "description": "Brief description",
      "details": ["Bullet point 1", "Bullet point 2"]
    }
  ],
  "achievements": [
    "Achievement 1",
    "Achievement 2"
  ],
  "certifications": [
    {
      "name": "Certification Name",
      "issuer": "Issuing Organization",
      "date": "Year (if known)"
    }
  ],
  "skills": ["Skill 1", "Skill 2", "Skill 3"]
}
2. Only include "achievements" key if achievement data is provided. Otherwise omit it entirely.
3. Only include "certifications" key if certification data is provided. Otherwise omit it entirely.
4. Only include "gpa" and "description" inside education items if the data was provided.
5. Start each experience and project bullet with a strong action verb (Engineered, Optimized, Spearheaded, Led, Developed, etc.)
6. Follow STAR: embed Situation context, the Task, specific Actions taken, and measurable Results
7. Quantify results with percentages, dollar amounts, time saved, or team sizes where data is provided
8. Include relevant technical skills and keywords from the job description naturally
9. Generate 3-5 bullet points per experience/project
10. ONLY output the JSON object, without markdown formatting like \`\`\`json or any other text.`;
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
