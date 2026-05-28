import { getCVSystemInstruction, getCVPrompt } from '../prompts';

describe('Prompts Library', () => {
  describe('getCVSystemInstruction', () => {
    it('should return auto language instruction by default', () => {
      const instruction = getCVSystemInstruction('auto');
      expect(instruction).toContain("Always respond in the same language as the user's input.");
    });

    it('should return Indonesian instruction when id is passed', () => {
      const instruction = getCVSystemInstruction('id');
      expect(instruction).toContain('Always respond in Bahasa Indonesia.');
    });

    it('should return English instruction when en is passed', () => {
      const instruction = getCVSystemInstruction('en');
      expect(instruction).toContain('Always respond in English.');
    });

    it('should always mandate JSON output', () => {
      const instruction = getCVSystemInstruction('auto');
      expect(instruction).toContain('ALWAYS output data in valid JSON format');
    });
  });

  describe('getCVPrompt', () => {
    it('should generate a prompt containing all provided sections', () => {
      const personalInfo = 'Name: John Doe\\nEmail: john@example.com';
      const experience = 'Role: Dev at TechCorp';
      const education = 'BSc CS at MIT';
      const projects = 'Project: Web App';
      const jobDesc = 'Looking for a React developer';

      const prompt = getCVPrompt(personalInfo, experience, education, projects, jobDesc);

      expect(prompt).toContain(personalInfo);
      expect(prompt).toContain(experience);
      expect(prompt).toContain(education);
      expect(prompt).toContain(projects);
      expect(prompt).toContain(jobDesc);
    });

    it('should mandate a strict JSON structure including header', () => {
      const prompt = getCVPrompt('Info', 'Exp', 'Edu', 'Proj', 'Job');
      expect(prompt).toContain('"header": {');
      expect(prompt).toContain('"summary":');
      expect(prompt).toContain('"experience":');
      expect(prompt).toContain('"education":');
      expect(prompt).toContain('"projects":');
      expect(prompt).toContain('"skills":');
    });
  });
});
