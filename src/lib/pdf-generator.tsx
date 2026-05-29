import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf, Font } from '@react-pdf/renderer';

// Register standard fonts explicitly just in case
// @react-pdf/renderer uses standard 14 fonts natively.
// We can use them directly by name.

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

const ClassicCV = ({ data }: { data: any }) => {
  const { header, summary, experience, education, projects, skills, achievements, certifications } = data;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {header && (
          <View style={styles.header}>
            <Text style={styles.name}>{typeof header.name === 'string' ? header.name : ''}</Text>
            <Text style={styles.contact}>
              {[header.email, header.phone, header.linkedin].filter(v => typeof v === 'string' && v).join('  |  ')}
            </Text>
          </View>
        )}

        {summary && typeof summary === 'string' && (
          <View wrap={false}>
            <Text style={styles.sectionTitle}>Professional Summary</Text>
            <Text style={styles.summary}>{summary}</Text>
          </View>
        )}

        {experience && Array.isArray(experience) && experience.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Professional Experience</Text>
            {experience.map((exp: any, i: number) => (
              <View key={i} style={styles.item} wrap={false}>
                <View style={styles.itemHeader}>
                  <View style={styles.itemTitleContainer}>
                    <Text style={styles.itemTitle}>{typeof exp.title === 'string' ? exp.title : ''}</Text>
                    {exp.company && <Text>, <Text style={styles.itemSubtitle}>{exp.company}</Text></Text>}
                  </View>
                  <Text style={styles.itemDate}>{typeof exp.date === 'string' ? exp.date : ''}</Text>
                </View>
                {Array.isArray(exp.description) && (
                  <View style={styles.bullets}>
                    {exp.description.map((b: any, j: number) => (
                      typeof b === 'string' ? (
                        <View key={j} style={styles.bulletItem}>
                          <Text style={styles.bulletPoint}>•</Text>
                          <Text style={styles.bulletText}>{b}</Text>
                        </View>
                      ) : null
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {projects && Array.isArray(projects) && projects.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Projects</Text>
            {projects.map((proj: any, i: number) => (
              <View key={i} style={styles.item} wrap={false}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>{typeof proj.name === 'string' ? proj.name : ''}</Text>
                </View>
                {typeof proj.description === 'string' && proj.description && (
                  <Text style={[styles.itemSubtitle, { fontSize: 10, marginBottom: 4 }]}>{proj.description}</Text>
                )}
                {Array.isArray(proj.details) && (
                  <View style={styles.bullets}>
                    {proj.details.map((b: any, j: number) => (
                      typeof b === 'string' ? (
                        <View key={j} style={styles.bulletItem}>
                          <Text style={styles.bulletPoint}>•</Text>
                          <Text style={styles.bulletText}>{b}</Text>
                        </View>
                      ) : null
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {education && Array.isArray(education) && education.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Education</Text>
            {education.map((edu: any, i: number) => (
              <View key={i} style={{ marginBottom: 6 }} wrap={false}>
                <View style={styles.itemHeader}>
                  <View style={styles.itemTitleContainer}>
                    <Text style={styles.itemTitle}>{typeof edu.degree === 'string' ? edu.degree : ''}</Text>
                    {edu.institution && <Text>, <Text style={styles.itemSubtitle}>{edu.institution}</Text></Text>}
                  </View>
                  <Text style={styles.itemDate}>{typeof edu.date === 'string' ? edu.date : ''}</Text>
                </View>
                {(edu.gpa || edu.description) && (
                  <View style={styles.eduMeta}>
                    {typeof edu.gpa === 'string' && edu.gpa && <Text>GPA: {edu.gpa}{edu.description ? '  |  ' : ''}</Text>}
                    {typeof edu.description === 'string' && edu.description && <Text>{edu.description}</Text>}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {achievements && Array.isArray(achievements) && achievements.length > 0 && (
          <View wrap={false}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            <View style={styles.bullets}>
              {achievements.map((a: any, i: number) => (
                typeof a === 'string' ? (
                  <View key={i} style={styles.bulletItem}>
                    <Text style={styles.bulletPoint}>•</Text>
                    <Text style={styles.bulletText}>{a}</Text>
                  </View>
                ) : null
              ))}
            </View>
          </View>
        )}

        {certifications && Array.isArray(certifications) && certifications.length > 0 && (
          <View wrap={false}>
            <Text style={styles.sectionTitle}>Certifications</Text>
            {certifications.map((cert: any, i: number) => {
              if (typeof cert === 'string') {
                return <Text key={i} style={{ marginBottom: 4 }}>{cert}</Text>;
              }
              return (
                <Text key={i} style={{ marginBottom: 4 }}>
                  <Text style={styles.itemTitle}>{typeof cert.name === 'string' ? cert.name : ''}</Text>
                  {cert.issuer && typeof cert.issuer === 'string' && <Text> — {cert.issuer}</Text>}
                  {cert.date && typeof cert.date === 'string' && <Text style={styles.itemDate}> ({cert.date})</Text>}
                </Text>
              );
            })}
          </View>
        )}

        {skills && Array.isArray(skills) && skills.length > 0 && (
          <View wrap={false}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <Text style={styles.skillsText}>
              {skills.filter((s: any) => typeof s === 'string').join(' • ')}
            </Text>
          </View>
        )}

      </Page>
    </Document>
  );
};

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
    doc = <ClassicCV data={data.content} />;
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
