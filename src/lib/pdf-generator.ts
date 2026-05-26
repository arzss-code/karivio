// This file runs client-side only
// pdfmake must be dynamically imported

export type TemplateType = 'classic' | 'modern' | 'minimal';
export type ContentType = 'cv' | 'cover-letter';

interface PDFData {
  name: string;
  email: string;
  phone?: string;
  linkedin?: string;
  content: string;
  type: ContentType;
  template: TemplateType;
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

function parseContentToLines(content: string): string[] {
  return content.split('\n').filter((line) => line.trim() !== '');
}

function getContactParts(data: PDFData): string[] {
  const parts = [data.email];
  if (data.phone) parts.push(data.phone);
  if (data.linkedin) parts.push(data.linkedin);
  return parts;
}

function getClassicTemplate(data: PDFData): any {
  // Classic: Traditional, single-column, serif-like feel
  // Header with name centered, contact info below
  // Content with clear section dividers (horizontal lines)
  const lines = parseContentToLines(data.content);
  const contentItems = lines.map((line) => {
    if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
      return { text: line, margin: [10, 2, 0, 2] as number[], fontSize: 10 };
    }
    return { text: line, margin: [0, 4, 0, 4] as number[], fontSize: 10 };
  });

  const contactParts = getContactParts(data);

  return {
    content: [
      { text: data.name, style: 'header', alignment: 'center' },
      {
        text: contactParts.join(' | '),
        alignment: 'center',
        fontSize: 9,
        color: '#666',
        margin: [0, 4, 0, 15] as number[],
      },
      {
        canvas: [
          { type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#333' },
        ],
        margin: [0, 0, 0, 10] as number[],
      },
      {
        text: data.type === 'cv' ? 'PROFESSIONAL EXPERIENCE' : 'COVER LETTER',
        style: 'sectionTitle',
      },
      ...contentItems,
    ],
    styles: {
      header: {
        fontSize: 22,
        bold: true,
        color: '#1a1a1a',
        margin: [0, 0, 0, 2] as number[],
      },
      sectionTitle: {
        fontSize: 12,
        bold: true,
        color: '#333',
        margin: [0, 10, 0, 8] as number[],
        decoration: 'underline',
      },
    },
    defaultStyle: { font: 'Roboto', fontSize: 10, lineHeight: 1.4 },
    pageMargins: [50, 50, 50, 50] as number[],
  };
}

function getModernTemplate(data: PDFData): any {
  // Modern: Left color accent bar, two-tone header, contemporary feel
  const lines = parseContentToLines(data.content);
  const contentItems = lines.map((line) => {
    if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
      return { text: line, margin: [10, 2, 0, 2] as number[], fontSize: 10 };
    }
    return { text: line, margin: [0, 4, 0, 4] as number[], fontSize: 10 };
  });

  const contactParts = getContactParts(data);

  return {
    content: [
      {
        canvas: [{ type: 'rect', x: 0, y: 0, w: 515, h: 70, color: '#6C3CE1' }],
        margin: [0, 0, 0, 0] as number[],
        absolutePosition: { x: 50, y: 50 },
      },
      {
        text: data.name,
        fontSize: 24,
        bold: true,
        color: '#ffffff',
        margin: [10, 10, 0, 2] as number[],
      },
      {
        text: contactParts.join(' • '),
        fontSize: 9,
        color: '#e0d4ff',
        margin: [10, 0, 0, 30] as number[],
      },
      {
        text: data.type === 'cv' ? 'Professional Experience' : 'Cover Letter',
        fontSize: 14,
        bold: true,
        color: '#6C3CE1',
        margin: [0, 10, 0, 8] as number[],
      },
      {
        canvas: [
          { type: 'line', x1: 0, y1: 0, x2: 80, y2: 0, lineWidth: 3, lineColor: '#6C3CE1' },
        ],
        margin: [0, 0, 0, 10] as number[],
      },
      ...contentItems,
    ],
    defaultStyle: { font: 'Roboto', fontSize: 10, lineHeight: 1.5 },
    pageMargins: [50, 50, 50, 50] as number[],
  };
}

function getMinimalTemplate(data: PDFData): any {
  // Minimal: Maximum whitespace, subtle, elegant, just the essentials
  const lines = parseContentToLines(data.content);
  const contentItems = lines.map((line) => {
    if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
      return { text: line, margin: [0, 3, 0, 3] as number[], fontSize: 10 };
    }
    return { text: line, margin: [0, 5, 0, 5] as number[], fontSize: 10 };
  });

  const contactParts = getContactParts(data);

  return {
    content: [
      {
        text: data.name,
        fontSize: 28,
        bold: true,
        color: '#111',
        margin: [0, 20, 0, 5] as number[],
      },
      {
        text: contactParts.join('  ·  '),
        fontSize: 9,
        color: '#888',
        margin: [0, 0, 0, 30] as number[],
      },
      ...contentItems,
    ],
    defaultStyle: { font: 'Roboto', fontSize: 10, lineHeight: 1.6, color: '#333' },
    pageMargins: [60, 60, 60, 60] as number[],
  };
}

export async function generatePDF(data: PDFData): Promise<void> {
  const pdfMake = await loadPdfMake();

  let docDefinition;
  switch (data.template) {
    case 'modern':
      docDefinition = getModernTemplate(data);
      break;
    case 'minimal':
      docDefinition = getMinimalTemplate(data);
      break;
    case 'classic':
    default:
      docDefinition = getClassicTemplate(data);
      break;
  }

  const fileName =
    data.type === 'cv'
      ? `${data.name.replace(/\s+/g, '_')}_Resume.pdf`
      : `${data.name.replace(/\s+/g, '_')}_Cover_Letter.pdf`;

  pdfMake.createPdf(docDefinition).download(fileName);
}
