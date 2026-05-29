import React from 'react';
import EditableField from '../../EditableField';
import { updateGenerationResultField } from '../../../lib/store';

export default function ClassicHTML({ data }: { data: any }) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
  if ('_inlines' in data || 'content' in data) return null;

  const { header, summary, experience, education, projects, skills, achievements, certifications } = data;

  return (
    <div className="cv-document">
      <style dangerouslySetInnerHTML={{
        __html: `
        .cv-document {
          font-family: 'Times', 'Times New Roman', serif;
          color: #000;
          line-height: 1.4;
          font-size: 11pt;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }
        .cv-header {
          text-align: center;
          margin-bottom: 16px;
        }
        .cv-name {
          font-size: 24pt;
          font-weight: bold;
          margin-bottom: 4px;
          letter-spacing: 0.5px;
        }
        .cv-contact {
          font-size: 10pt;
          color: #333;
        }
        .cv-section-title {
          font-size: 12pt;
          font-weight: bold;
          text-transform: uppercase;
          border-bottom: 1px solid #000;
          margin-top: 16px;
          margin-bottom: 8px;
          padding-bottom: 2px;
          page-break-after: avoid;
          break-after: avoid;
        }
        .cv-item {
          margin-bottom: 12px;
          page-break-inside: avoid;
          break-inside: avoid;
        }
        .cv-item-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 4px;
        }
        .cv-item-title {
          font-weight: bold;
        }
        .cv-item-subtitle {
          font-style: italic;
        }
        .cv-item-date {
          white-space: nowrap;
          font-size: 10pt;
        }
        .cv-bullets {
          margin: 0;
          padding-left: 18px;
          text-align: justify;
        }
        .cv-bullets li {
          margin-bottom: 4px;
        }
        .cv-skills-text {
          text-align: justify;
        }
        .cv-summary {
          text-align: justify;
        }
        .cv-edu-meta {
          font-size: 10pt;
          color: #444;
          margin-top: 2px;
          text-align: justify;
        }
        
        @media print {
          body * {
            visibility: hidden;
          }
          .print-container, .print-container * {
            visibility: visible;
          }
          .print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0;
            margin: 0;
            background: white;
            box-shadow: none;
            border: none;
          }
          @page {
            margin: 2cm;
            size: A4;
          }
        }
      `}} />

      {header && (
        <div className="cv-header">
          <div className="cv-name">
            <EditableField
              value={typeof header.name === 'string' ? header.name : ''}
              onChange={(val) => updateGenerationResultField(['header', 'name'], val)}
              placeholder="Your Name"
            />
          </div>
          <div className="cv-contact flex justify-center gap-2 items-center flex-wrap">
            <EditableField value={typeof header.email === 'string' ? header.email : ''} onChange={(val) => updateGenerationResultField(['header', 'email'], val)} placeholder="Email" /> |
            <EditableField value={typeof header.phone === 'string' ? header.phone : ''} onChange={(val) => updateGenerationResultField(['header', 'phone'], val)} placeholder="Phone" /> |
            <EditableField value={typeof header.linkedin === 'string' ? header.linkedin : ''} onChange={(val) => updateGenerationResultField(['header', 'linkedin'], val)} placeholder="LinkedIn" />
          </div>
        </div>
      )}

      {summary && typeof summary === 'string' && (
        <>
          <div className="cv-section-title">Professional Summary</div>
          <div className="cv-summary">
            <EditableField value={summary} onChange={(val) => updateGenerationResultField(['summary'], val)} multiline />
          </div>
        </>
      )}

      {experience && Array.isArray(experience) && experience.length > 0 && (
        <>
          <div className="cv-section-title">Professional Experience</div>
          {experience.map((exp: any, i: number) => (
            <div key={i} className="cv-item">
              <div className="cv-item-header flex-wrap">
                <div>
                  <span className="cv-item-title">
                    <EditableField value={typeof exp.title === 'string' ? exp.title : ''} onChange={(val) => updateGenerationResultField(['experience', i, 'title'], val)} placeholder="Job Title" />
                  </span>,{' '}
                  <span className="cv-item-subtitle">
                    <EditableField value={typeof exp.company === 'string' ? exp.company : ''} onChange={(val) => updateGenerationResultField(['experience', i, 'company'], val)} placeholder="Company" />
                  </span>
                </div>
                <div className="cv-item-date">
                  <EditableField value={typeof exp.date === 'string' ? exp.date : ''} onChange={(val) => updateGenerationResultField(['experience', i, 'date'], val)} placeholder="Date" />
                </div>
              </div>
              {Array.isArray(exp.description) && (
                <ul className="cv-bullets">
                  {exp.description.map((b: any, j: number) => (
                    typeof b === 'string' ? (
                      <li key={j}>
                        <EditableField value={b} onChange={(val) => updateGenerationResultField(['experience', i, 'description', j], val)} multiline />
                      </li>
                    ) : null
                  ))}
                </ul>
              )}
            </div>
          ))}
        </>
      )}

      {projects && Array.isArray(projects) && projects.length > 0 && (
        <>
          <div className="cv-section-title">Projects</div>
          {projects.map((proj: any, i: number) => (
            <div key={i} className="cv-item">
              <div className="cv-item-header">
                <span className="cv-item-title">
                  <EditableField value={typeof proj.name === 'string' ? proj.name : ''} onChange={(val) => updateGenerationResultField(['projects', i, 'name'], val)} placeholder="Project Name" />
                </span>
              </div>
              {typeof proj.description === 'string' && proj.description && (
                <div className="cv-item-subtitle mb-1" style={{ fontSize: '10pt' }}>
                  <EditableField value={proj.description} onChange={(val) => updateGenerationResultField(['projects', i, 'description'], val)} multiline />
                </div>
              )}
              {Array.isArray(proj.details) && (
                <ul className="cv-bullets">
                  {proj.details.map((b: any, j: number) => (
                    typeof b === 'string' ? (
                      <li key={j}>
                        <EditableField value={b} onChange={(val) => updateGenerationResultField(['projects', i, 'details', j], val)} multiline />
                      </li>
                    ) : null
                  ))}
                </ul>
              )}
            </div>
          ))}
        </>
      )}

      {education && Array.isArray(education) && education.length > 0 && (
        <>
          <div className="cv-section-title">Education</div>
          {education.map((edu: any, i: number) => (
            <div key={i} className="cv-item" style={{ marginBottom: '6px' }}>
              <div className="cv-item-header flex-wrap">
                <div>
                  <span className="cv-item-title">
                    <EditableField value={typeof edu.degree === 'string' ? edu.degree : ''} onChange={(val) => updateGenerationResultField(['education', i, 'degree'], val)} placeholder="Degree" />
                  </span>,{' '}
                  <span className="cv-item-subtitle">
                    <EditableField value={typeof edu.institution === 'string' ? edu.institution : ''} onChange={(val) => updateGenerationResultField(['education', i, 'institution'], val)} placeholder="Institution" />
                  </span>
                  {typeof edu.gpa === 'string' && edu.gpa && (
                    <span style={{ fontSize: '10pt', marginLeft: '6px' }}>
                      | GPA: <EditableField value={edu.gpa} onChange={(val) => updateGenerationResultField(['education', i, 'gpa'], val)} placeholder="GPA" />
                    </span>
                  )}
                </div>
                <div className="cv-item-date">
                  <EditableField value={typeof edu.date === 'string' ? edu.date : ''} onChange={(val) => updateGenerationResultField(['education', i, 'date'], val)} placeholder="Date" />
                </div>
              </div>
              {typeof edu.description === 'string' && edu.description && (
                <div className="cv-edu-meta">
                  <EditableField value={edu.description} onChange={(val) => updateGenerationResultField(['education', i, 'description'], val)} multiline />
                </div>
              )}
            </div>
          ))}
        </>
      )}

      {achievements && Array.isArray(achievements) && achievements.length > 0 && (
        <>
          <div className="cv-section-title">Achievements</div>
          <ul className="cv-bullets">
            {achievements.map((a: any, i: number) => (
              typeof a === 'string' ? (
                <li key={i}>
                  <EditableField value={a} onChange={(val) => updateGenerationResultField(['achievements', i], val)} multiline />
                </li>
              ) : null
            ))}
          </ul>
        </>
      )}

      {certifications && Array.isArray(certifications) && certifications.length > 0 && (
        <>
          <div className="cv-section-title">Certifications</div>
          {certifications.map((cert: any, i: number) => {
            if (typeof cert === 'string') {
              return (
                <div key={i} style={{ marginBottom: 4 }}>
                  <EditableField value={cert} onChange={(val) => updateGenerationResultField(['certifications', i], val)} />
                </div>
              );
            }
            return (
              <div key={i} style={{ marginBottom: 4 }} className="page-break-inside-avoid">
                <span className="cv-item-title">
                  <EditableField value={typeof cert.name === 'string' ? cert.name : ''} onChange={(val) => updateGenerationResultField(['certifications', i, 'name'], val)} placeholder="Certification Name" />
                </span>
                {cert.issuer && typeof cert.issuer === 'string' && (
                  <span> — <EditableField value={cert.issuer} onChange={(val) => updateGenerationResultField(['certifications', i, 'issuer'], val)} placeholder="Issuer" /></span>
                )}
                {cert.date && typeof cert.date === 'string' && (
                  <span className="cv-item-date"> (<EditableField value={cert.date} onChange={(val) => updateGenerationResultField(['certifications', i, 'date'], val)} placeholder="Date" />)</span>
                )}
              </div>
            );
          })}
        </>
      )}

      {skills && Array.isArray(skills) && skills.length > 0 && (() => {
        const categorized = skills.map((s: any, i: number) => ({ s, i })).filter(({ s }) => typeof s === 'string' && s.indexOf(':') > -1);
        const plain = skills.map((s: any, i: number) => ({ s, i })).filter(({ s }) => typeof s === 'string' && s.indexOf(':') === -1);
        return (
          <>
            <div className="cv-section-title">Skills</div>
            <div className="cv-skills-text">
              {categorized.map(({ s, i }: { s: string; i: number }) => {
                const colonIndex = s.indexOf(':');
                const category = s.slice(0, colonIndex + 1);
                const items = s.slice(colonIndex + 1).trim();
                return (
                  <div key={i} style={{ marginBottom: 4 }} className="flex">
                    <strong style={{ marginRight: '6px', whiteSpace: 'nowrap' }}>{category}</strong>
                    <EditableField value={items} onChange={(val) => updateGenerationResultField(['skills', i], `${category} ${val}`)} className="flex-1" />
                  </div>
                );
              })}
              {plain.length > 0 && (
                <div style={{ marginBottom: 4 }}>
                  {plain.map(({ s, i }: { s: string; i: number }, idx: number) => (
                    <React.Fragment key={i}>
                      <EditableField value={s} onChange={(val) => updateGenerationResultField(['skills', i], val)} />
                      {idx < plain.length - 1 && <span className="mx-1">&bull;</span>}
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>
          </>
        );
      })()}
    </div>
  );
}
