'use client';
import React, { useState } from 'react';
import { useStore } from '@nanostores/react';
import { generationState, updateGenerationResultField } from '../lib/store';
import { FileText, Loader2, Download, Settings2, Printer } from 'lucide-react';
import { generatePDF } from '../lib/pdf-generator';
import EditableField from './EditableField';

export default function ResultPreview() {
  const state = useStore(generationState);
  const [template, setTemplate] = useState('classic');
  const [isDownloading, setIsDownloading] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDirectDownload = async () => {
    if (!state.result) return;
    setIsDownloading(true);
    try {
      await generatePDF({
        content: state.result,
        type: (state.type ?? 'cv') as import('../lib/pdf-generator').ContentType,
        template: 'classic',
        fallbackName: 'My_Document'
      });
    } catch (error) {
      console.error('Failed to generate PDF directly:', error);
      alert('Failed to download PDF. You can still use the Print option.');
    } finally {
      setIsDownloading(false);
    }
  };

  const renderEmptyState = () => (
    <div className="animate-fade-in">
      <div className="rounded-2xl border border-neutral-200 bg-white p-8 sm:p-12 text-center shadow-sm">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-neutral-100 text-neutral-400 border border-neutral-200/50">
          <FileText className="h-8 w-8" />
        </div>
        <h3 className="text-base font-bold text-neutral-900 mb-2">Your Results Will Appear Here</h3>
        <p className="text-sm text-neutral-500 max-w-sm mx-auto leading-relaxed">
          Fill in your details on the left and click generate. Our AI will craft professional content tailored to your target role.
        </p>
      </div>
    </div>
  );

  const renderLoadingState = () => (
    <div className="animate-scale-in">
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 text-white">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
          <div>
            <p className="text-sm font-bold text-neutral-900">AI is crafting your content...</p>
            <p className="text-xs text-neutral-500">This usually takes 5-15 seconds</p>
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-3.5 w-full rounded bg-neutral-100 animate-pulse"></div>
          <div className="h-3.5 w-[92%] rounded bg-neutral-50 animate-pulse"></div>
          <div className="h-3.5 w-[97%] rounded bg-neutral-100 animate-pulse"></div>
          <div className="h-3.5 w-[85%] rounded bg-neutral-50 animate-pulse"></div>
        </div>
      </div>
    </div>
  );

  const renderCV = (data: any) => {
    // Safety guard: if data is not a plain object (e.g. pdfmake internal), abort
    if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
    // Check for pdfmake leak (objects with _inlines keys)
    if ('_inlines' in data || 'content' in data) return null;

    const { header, summary, experience, education, projects, skills, achievements, certifications } = data;

    return (
      <div className="cv-document">
        <style dangerouslySetInnerHTML={{
          __html: `
          .cv-document {
            font-family: 'Times', 'Roboto', 'Helvetica Neue', Helvetica, Arial, sans-serif;
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
            line-height: 1.6;
          }
          .cv-summary {
            text-align: justify;
          }
          .cv-edu-meta {
            font-size: 10pt;
            color: #444;
            margin-top: 2px;
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
                  </div>
                  <div className="cv-item-date">
                    <EditableField value={typeof edu.date === 'string' ? edu.date : ''} onChange={(val) => updateGenerationResultField(['education', i, 'date'], val)} placeholder="Date" />
                  </div>
                </div>
                {(edu.gpa || edu.description) && (
                  <div className="cv-edu-meta flex flex-wrap gap-2">
                    {typeof edu.gpa === 'string' && edu.gpa && (
                      <span>GPA: <EditableField value={edu.gpa} onChange={(val) => updateGenerationResultField(['education', i, 'gpa'], val)} placeholder="GPA" />{edu.description ? '  |  ' : ''}</span>
                    )}
                    {typeof edu.description === 'string' && edu.description && (
                      <span>
                        <EditableField value={edu.description} onChange={(val) => updateGenerationResultField(['education', i, 'description'], val)} />
                      </span>
                    )}
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

        {skills && Array.isArray(skills) && skills.length > 0 && (
          <>
            <div className="cv-section-title">Skills</div>
            <div className="cv-skills-text">
              {/* To make comma-separated skills editable individually, we map them */}
              {skills.map((s: any, i: number) => (
                <React.Fragment key={i}>
                  {typeof s === 'string' ? (
                    <EditableField value={s} onChange={(val) => updateGenerationResultField(['skills', i], val)} />
                  ) : null}
                  {i < skills.length - 1 ? <span className="mx-1">•</span> : null}
                </React.Fragment>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  const renderCoverLetter = (text: string) => {
    return (
      <div className="cl-content whitespace-pre-wrap leading-relaxed text-neutral-900" style={{ fontFamily: "'Roboto', 'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: '11pt', wordWrap: 'break-word', overflowWrap: 'break-word' }}>
        <style dangerouslySetInnerHTML={{
          __html: `
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
              margin: 2.5cm;
              size: A4;
            }
          }
        `}} />
        <EditableField
          value={text}
          onChange={(val) => updateGenerationResultField([], val)}
          multiline
          className="block w-full min-h-[500px]"
        />
      </div>
    );
  };

  const renderContent = () => {
    if (!state.result) return null;

    return (
      <div className="animate-scale-in flex flex-col h-full lg:max-h-[calc(100vh-8rem)] rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden">

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 px-6 py-4 bg-neutral-50 shrink-0">
          <div className="relative hidden sm:block">
            <select
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 appearance-none pr-10 cursor-pointer hover:border-neutral-300 focus:outline-none focus:ring-0 transition-all shadow-sm"
            >
              <option value="classic">Harvard ATS Template</option>
            </select>
            <Settings2 className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-none inline-flex items-center cursor-pointer justify-center gap-2 rounded-xl bg-white border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-700 shadow-sm hover:bg-neutral-50 transition-colors"
            >
              <Printer className="h-4 w-4" />
              Print
            </button>
            <button
              onClick={handleDirectDownload}
              disabled={isDownloading}
              className="flex-1 sm:flex-none inline-flex items-center cursor-pointer justify-center gap-2 rounded-xl bg-neutral-900 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-neutral-800 transition-colors active:scale-95 disabled:opacity-70"
            >
              {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Download PDF
            </button>
          </div>
        </div>

        {/* Document Preview Area */}
        <div className="p-6 sm:p-8 flex-1 overflow-y-auto bg-neutral-100/50 flex justify-center">
          <div
            className="print-container bg-white shadow-md border border-neutral-200 w-full"
            style={{
              maxWidth: '210mm',
              minHeight: '297mm',
              padding: '40px 50px'
            }}
          >
            {state.type === 'cv' ? renderCV(state.result) : renderCoverLetter(typeof state.result === 'string' ? state.result : JSON.stringify(state.result))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <section id="result-preview-section" className="lg:sticky lg:top-24 h-full">
      {!state.isGenerating && !state.result && renderEmptyState()}
      {state.isGenerating && renderLoadingState()}
      {!state.isGenerating && state.result && renderContent()}
    </section>
  );
}
