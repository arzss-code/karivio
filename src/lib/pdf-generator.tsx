import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf, Font } from '@react-pdf/renderer';

// Register standard fonts explicitly just in case
// @react-pdf/renderer uses standard 14 fonts natively.
// We can use them directly by name.
import ClassicPDF from '../components/templates/cv/ClassicPDF';
import ModernPDF from '../components/templates/cv/ModernPDF';
import MinimalPDF from '../components/templates/cv/MinimalPDF';

export type TemplateType = 'classic' | 'modern' | 'minimal';
export type ContentType = 'cv' | 'cover-letter';

export interface PDFData {
  content: any;
  type: ContentType;
  template: TemplateType;
  fallbackName?: string;
}

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Times-Roman',
    paddingTop: 40,
    paddingBottom: 40,
    paddingLeft: 50,
    paddingRight: 50,
    fontSize: 11,
    lineHeight: 1.4,
    color: '#000000',
  },
  header: {
    textAlign: 'center',
    marginBottom: 16,
  },
  name: {
    fontFamily: 'Times-Bold',
    fontSize: 24,
    marginBottom: 4,
  },
  contact: {
    fontSize: 10,
    color: '#333333',
  },
  sectionTitle: {
    fontFamily: 'Times-Bold',
    fontSize: 12,
    textTransform: 'uppercase',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    borderBottomStyle: 'solid',
    marginTop: 16,
    marginBottom: 8,
    paddingBottom: 2,
  },
  item: {
    marginBottom: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  itemTitleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
    paddingRight: 10,
  },
  itemTitle: {
    fontFamily: 'Times-Bold',
  },
  itemSubtitle: {
    fontFamily: 'Times-Italic',
  },
  itemDate: {
    fontSize: 10,
  },
  bullets: {
    marginLeft: 15,
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  bulletPoint: {
    width: 12,
    fontSize: 11,
  },
  bulletText: {
    flex: 1,
    textAlign: 'justify',
  },
  skillsText: {
    lineHeight: 1.6,
  },
  summary: {
    textAlign: 'justify',
  },
  eduMeta: {
    fontSize: 10,
    color: '#444444',
    marginTop: 2,
    flexDirection: 'row',
  },
  clPage: {
    fontFamily: 'Times-Roman',
    paddingTop: 50,
    paddingBottom: 50,
    paddingLeft: 50,
    paddingRight: 50,
    fontSize: 11,
    lineHeight: 1.5,
    color: '#000000',
  },
  clContent: {
    marginBottom: 10,
  }
});

const CoverLetter = ({ data, name }: { data: string; name?: string }) => {
  const lines = data.split('\n').filter(line => line.trim() !== '');

  return (
    <Document>
      <Page size="A4" style={styles.clPage}>
        <Text style={{ fontFamily: 'Times-Bold', fontSize: 20, marginBottom: 10 }}>{name || 'Applicant'}</Text>
        <Text style={{ fontSize: 14, color: '#555555', textDecoration: 'underline', marginBottom: 20 }}>COVER LETTER</Text>
        {lines.map((line, i) => (
          <Text key={i} style={styles.clContent}>{line}</Text>
        ))}
      </Page>
    </Document>
  );
};

export async function generatePDF(data: PDFData): Promise<void> {
  let doc;
  if (data.type === 'cv') {
    switch (data.template) {
      case 'modern':
        doc = <Document><ModernPDF data={data.content} /></Document>;
        break;
      case 'minimal':
        doc = <Document><MinimalPDF data={data.content} /></Document>;
        break;
      case 'classic':
      default:
        doc = <Document><ClassicPDF data={data.content} /></Document>;
        break;
    }
  } else {
    doc = <CoverLetter data={typeof data.content === 'string' ? data.content : JSON.stringify(data.content)} name={data.fallbackName} />;
  }

  const name = data.type === 'cv' && data.content?.header?.name ? data.content.header.name : (data.fallbackName || 'Document');
  const fileName = data.type === 'cv' ? `${name.replace(/\s+/g, '_')}_Resume.pdf` : `${name.replace(/\s+/g, '_')}_Cover_Letter.pdf`;

  try {
    const blob = await pdf(doc).toBlob();
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
}
