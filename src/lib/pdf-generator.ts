// This file runs client-side only
// pdfmake must be dynamically imported

export type TemplateType = 'classic' | 'modern' | 'minimal';
export type ContentType = 'cv' | 'cover-letter';

interface PDFData {
  content: any; // Can be string for cover letter, or object for CV
  type: ContentType;
  template: TemplateType;
  fallbackName?: string; // If header.name is missing
}

async function loadPdfMake() {
  // @ts-ignore - pdfmake doesn't ship proper ESM types
  const pdfMakeModule = await import('pdfmake/build/pdfmake');
  // @ts-ignore
  const pdfFontsModule = await import('pdfmake/build/vfs_fonts');

  const pdfMake = pdfMakeModule.default || pdfMakeModule;
  const pdfFonts = pdfFontsModule.default || pdfFontsModule;

  let vfs = null;
  if (pdfFonts && pdfFonts.pdfMake && pdfFonts.pdfMake.vfs) {
    vfs = pdfFonts.pdfMake.vfs;
  } else if (pdfFonts && pdfFonts.vfs) {
    vfs = pdfFonts.vfs;
  } else if (pdfFonts && Object.keys(pdfFonts).some(k => k.includes('.ttf'))) {
    vfs = pdfFonts;
  } else if (typeof window !== 'undefined' && (window as any).pdfMake && (window as any).pdfMake.vfs) {
    vfs = (window as any).pdfMake.vfs;
  }

  if (vfs) {
    pdfMake.vfs = vfs;
  } else {
    console.error("Could not find pdfMake vfs object", { pdfFonts });
  }

  return pdfMake;
}

function getClassicCVTemplate(data: any): any {
  const { header, summary, experience, education, projects, skills, achievements, certifications } = data;
  
  const contentItems = [];
  
  // Header
  if (header) {
    contentItems.push({ text: header.name || 'Your Name', style: 'header', alignment: 'center' });
    const contactParts = [header.email, header.phone, header.linkedin].filter(Boolean);
    contentItems.push({
      text: contactParts.join('  |  '),
      alignment: 'center',
      fontSize: 10,
      color: '#333',
      margin: [0, 4, 0, 15] as number[],
    });
  }

  const addSectionTitle = (title: string) => {
    contentItems.push({ text: title, style: 'sectionTitle' });
    contentItems.push({
      canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#000' }],
      margin: [0, -6, 0, 8] as number[],
    });
  };

  // Summary
  if (summary && typeof summary === 'string') {
    addSectionTitle('PROFESSIONAL SUMMARY');
    contentItems.push({ text: summary, alignment: 'justify', margin: [0, 0, 0, 12] as number[] });
  }

  // Experience
  if (experience && experience.length > 0) {
    addSectionTitle('PROFESSIONAL EXPERIENCE');
    experience.forEach((exp: any) => {
      contentItems.push({
        columns: [
          { text: [{ text: exp.title, bold: true }, ', ', { text: exp.company, italics: true }], width: '*' },
          { text: exp.date, width: 'auto', alignment: 'right' }
        ],
        margin: [0, 0, 0, 4] as number[]
      });
      if (exp.description && Array.isArray(exp.description) && exp.description.length > 0) {
        contentItems.push({
          ul: exp.description.filter((b: any) => typeof b === 'string'),
          alignment: 'justify',
          margin: [10, 0, 0, 10] as number[]
        });
      }
    });
  }

  // Projects
  if (projects && projects.length > 0) {
    addSectionTitle('PROJECTS');
    projects.forEach((proj: any) => {
      contentItems.push({
        text: [{ text: proj.name, bold: true }],
        margin: [0, 0, 0, 2] as number[]
      });
      if (proj.description) {
        contentItems.push({ text: proj.description, italics: true, fontSize: 9, margin: [0, 0, 0, 4] as number[] });
      }
      if (proj.details && proj.details.length > 0) {
        contentItems.push({
          ul: proj.details,
          margin: [10, 0, 0, 10] as number[]
        });
      }
    });
  }

  // Education
  if (education && Array.isArray(education) && education.length > 0) {
    addSectionTitle('EDUCATION');
    education.forEach((edu: any) => {
      const eduLeft: any[] = [];
      if (typeof edu.degree === 'string') eduLeft.push({ text: edu.degree, bold: true });
      if (typeof edu.institution === 'string') eduLeft.push({ text: ', ' }, { text: edu.institution, italics: true });
      contentItems.push({
        columns: [
          { text: eduLeft, width: '*' },
          { text: typeof edu.date === 'string' ? edu.date : '', width: 'auto', alignment: 'right' }
        ],
        margin: [0, 0, 0, 2] as number[]
      });
      if (edu.gpa || edu.description) {
        const metaParts = [];
        if (typeof edu.gpa === 'string' && edu.gpa) metaParts.push(`GPA: ${edu.gpa}`);
        if (typeof edu.description === 'string' && edu.description) metaParts.push(edu.description);
        contentItems.push({ text: metaParts.join('  |  '), fontSize: 9, color: '#444', margin: [0, 0, 0, 6] as number[] });
      } else {
        contentItems.push({ text: '', margin: [0, 0, 0, 6] as number[] });
      }
    });
  }

  // Achievements
  if (achievements && Array.isArray(achievements) && achievements.length > 0) {
    addSectionTitle('ACHIEVEMENTS');
    contentItems.push({
      ul: achievements.filter((a: any) => typeof a === 'string'),
      margin: [10, 0, 0, 10] as number[]
    });
  }

  // Certifications
  if (certifications && Array.isArray(certifications) && certifications.length > 0) {
    addSectionTitle('CERTIFICATIONS');
    certifications.forEach((cert: any) => {
      if (typeof cert === 'string') {
        contentItems.push({ text: cert, margin: [0, 0, 0, 4] as number[] });
      } else {
        const parts: any[] = [];
        if (typeof cert.name === 'string') parts.push({ text: cert.name, bold: true });
        if (typeof cert.issuer === 'string' && cert.issuer) parts.push({ text: ` — ${cert.issuer}` });
        if (typeof cert.date === 'string' && cert.date) parts.push({ text: ` (${cert.date})` });
        contentItems.push({ text: parts, margin: [0, 0, 0, 4] as number[] });
      }
    });
  }

  // Skills
  if (skills && skills.length > 0) {
    addSectionTitle('SKILLS');
    contentItems.push({
      text: skills.join(' • '),
      margin: [0, 0, 0, 12] as number[]
    });
  }

  return {
    content: contentItems,
    styles: {
      header: {
        fontSize: 24,
        bold: true,
        color: '#000',
        margin: [0, 0, 0, 2] as number[],
      },
      sectionTitle: {
        fontSize: 12,
        bold: true,
        color: '#000',
        margin: [0, 10, 0, 8] as number[],
      },
    },
    defaultStyle: { font: 'Roboto', fontSize: 10, lineHeight: 1.4, color: '#000' },
    pageMargins: [50, 50, 50, 50] as number[],
  };
}

function getCoverLetterTemplate(data: string, name?: string): any {
  const lines = data.split('\n').filter(line => line.trim() !== '');
  const contentItems = lines.map(line => ({ text: line, margin: [0, 0, 0, 10] as number[] }));
  
  return {
    content: [
      { text: name || 'Applicant', style: 'header' },
      { text: 'COVER LETTER', style: 'sectionTitle', margin: [0, 10, 0, 20] as number[] },
      ...contentItems
    ],
    styles: {
      header: { fontSize: 20, bold: true },
      sectionTitle: { fontSize: 14, color: '#555', decoration: 'underline' }
    },
    defaultStyle: { font: 'Roboto', fontSize: 11, lineHeight: 1.5 },
    pageMargins: [50, 50, 50, 50] as number[],
  };
}

export async function generatePDF(data: PDFData): Promise<void> {
  const pdfMake = await loadPdfMake();

  let docDefinition;
  
  if (data.type === 'cv') {
    docDefinition = getClassicCVTemplate(data.content);
  } else {
    docDefinition = getCoverLetterTemplate(typeof data.content === 'string' ? data.content : JSON.stringify(data.content), data.fallbackName);
  }

  const name = data.type === 'cv' && data.content?.header?.name ? data.content.header.name : (data.fallbackName || 'Document');
  const fileName = data.type === 'cv' ? `${name.replace(/\s+/g, '_')}_Resume.pdf` : `${name.replace(/\s+/g, '_')}_Cover_Letter.pdf`;

  pdfMake.createPdf(docDefinition).download(fileName);
}
