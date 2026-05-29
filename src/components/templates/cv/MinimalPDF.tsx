import React from 'react';
import { Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    paddingTop: 30,
    paddingBottom: 30,
    paddingLeft: 40,
    paddingRight: 40,
    fontSize: 9.5,
    lineHeight: 1.35,
    color: '#000000',
  },
  header: {
    textAlign: 'center',
    marginBottom: 8,
  },
  name: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 20,
    marginBottom: 12,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  contact: {
    fontSize: 9.5,
    color: '#737373',
    textAlign: 'center',
  },
  sectionTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    textTransform: 'uppercase',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    borderBottomStyle: 'solid',
    marginTop: 7.5,
    marginBottom: 4.5,
    paddingBottom: 1.5,
  },
  item: {
    marginBottom: 6,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 1.5,
  },
  itemTitleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
    paddingRight: 7.5,
  },
  itemTitle: {
    fontFamily: 'Helvetica-Bold',
  },
  itemSubtitle: {
    fontFamily: 'Helvetica-Oblique',
  },
  itemDate: {
    fontSize: 9,
  },
  bullets: {
    marginLeft: 4,
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 1.5,
  },
  bulletPoint: {
    width: 8,
    fontSize: 9.5,
  },
  bulletText: {
    flex: 1,
    textAlign: 'justify',
  },
  skillsText: {
    textAlign: 'justify',
  },
  summary: {
    textAlign: 'justify',
    marginBottom: 6,
  },
  eduMeta: {
    fontSize: 9,
    color: '#333333',
    marginTop: 1,
    textAlign: 'justify',
  }
});

export default function MinimalPDF({ data }: { data: any }) {
  const { header, summary, experience, education, projects, skills, achievements, certifications } = data;

  return (
    <Page size="A4" style={styles.page}>

      {header && (
        <View style={styles.header}>
          <Text style={styles.name}>{typeof header.name === 'string' ? header.name : ''}</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 4 }}>
            {[header.email, header.phone, header.linkedin].filter(v => typeof v === 'string' && v).map((item, i, arr) => (
              <View key={i} style={{ flexDirection: 'row', gap: 4 }}>
                <Text style={styles.contact}>{item}</Text>
                {i < arr.length - 1 && <Text style={styles.contact}>|</Text>}
              </View>
            ))}
          </View>
        </View>
      )}

      {summary && typeof summary === 'string' && (
        <View wrap={false}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <Text style={styles.summary}>{summary}</Text>
        </View>
      )}

      {experience && Array.isArray(experience) && experience.length > 0 && (
        <View>
          <Text style={styles.sectionTitle}>Experience</Text>
          {experience.map((exp: any, i: number) => (
            <View key={i} style={[styles.item, i === experience.length - 1 ? { marginBottom: 0 } : {}]} wrap={false}>
              <View style={styles.itemHeader}>
                <View style={styles.itemTitleContainer}>
                  <Text>
                    <Text style={styles.itemTitle}>{typeof exp.title === 'string' ? exp.title : ''}</Text>
                    {exp.company && <Text> | <Text style={styles.itemSubtitle}>{exp.company}</Text></Text>}
                  </Text>
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
            <View key={i} style={[styles.item, i === projects.length - 1 ? { marginBottom: 0 } : {}]} wrap={false}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemTitle}>{typeof proj.name === 'string' ? proj.name : ''}</Text>
              </View>
              {typeof proj.description === 'string' && proj.description && (
                <Text style={[styles.itemSubtitle, { fontSize: 9.5, marginBottom: 4, marginTop: -2 }]}>{proj.description}</Text>
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
            <View key={i} style={[{ marginBottom: 4.5 }, i === education.length - 1 ? { marginBottom: 0 } : {}]} wrap={false}>
              <View style={styles.itemHeader}>
                <View style={styles.itemTitleContainer}>
                  <Text>
                    <Text style={styles.itemTitle}>{typeof edu.degree === 'string' ? edu.degree : ''}</Text>
                    {edu.institution && <Text> | <Text style={styles.itemSubtitle}>{edu.institution}</Text></Text>}
                    {typeof edu.gpa === 'string' && edu.gpa && <Text style={{ fontSize: 9.5 }}>{'   '}| GPA: {edu.gpa}</Text>}
                  </Text>
                </View>
                <Text style={styles.itemDate}>{typeof edu.date === 'string' ? edu.date : ''}</Text>
              </View>
              {typeof edu.description === 'string' && edu.description && (
                <View style={styles.eduMeta}>
                  <Text>{edu.description}</Text>
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
                <View key={i} style={[styles.bulletItem, i === achievements.length - 1 ? { marginBottom: 0 } : {}]}>
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
              return <Text key={i} style={{ marginBottom: i === certifications.length - 1 ? 0 : 4 }}>{cert}</Text>;
            }
            return (
              <Text key={i} style={{ marginBottom: i === certifications.length - 1 ? 0 : 4 }}>
                <Text style={styles.itemTitle}>{typeof cert.name === 'string' ? cert.name : ''}</Text>
                {cert.issuer && typeof cert.issuer === 'string' && <Text> | {cert.issuer}</Text>}
                {cert.date && typeof cert.date === 'string' && <Text style={styles.itemDate}> ({cert.date})</Text>}
              </Text>
            );
          })}
        </View>
      )}

      {skills && Array.isArray(skills) && skills.length > 0 && (() => {
        const categorized = skills.filter((s: any) => typeof s === 'string' && s.indexOf(':') > -1);
        const plain = skills.filter((s: any) => typeof s === 'string' && s.indexOf(':') === -1);
        return (
          <View wrap={false}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.skillsText}>
              {categorized.map((s: string, i: number) => {
                const colonIndex = s.indexOf(':');
                const category = s.slice(0, colonIndex + 1);
                const items = s.slice(colonIndex + 1).trim();
                return (
                  <View key={`cat-${i}`} style={{ flexDirection: 'row', marginBottom: 3 }}>
                    <Text style={{ fontFamily: 'Helvetica-Bold', marginRight: 4.5 }}>{category}</Text>
                    <Text style={{ flex: 1, textAlign: 'left' }}>{items}</Text>
                  </View>
                );
              })}
              {plain.length > 0 && (
                <Text style={{ marginBottom: 3, textAlign: 'left' }}>
                  {plain.join('   \u2022   ')}
                </Text>
              )}
            </View>
          </View>
        );
      })()}

    </Page>
  );
}
