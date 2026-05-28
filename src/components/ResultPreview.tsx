'use client';
import React, { useState } from 'react';
import { useStore } from '@nanostores/react';
import { generationState } from '../lib/store';
import { FileText, Loader2, Download, Settings2, Printer } from 'lucide-react';
import { generatePDF } from '../lib/pdf-generator';

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
            font-family: 'Times New Roman', Times, serif;
            color: #000;
            line-height: 1.4;
            font-size: 11pt;
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
          }
          .cv-item {
            margin-bottom: 12px;
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
            <div className="cv-name">{typeof header.name === 'string' ? header.name : ''}</div>
            <div className="cv-contact">
              {[header.email, header.phone, header.linkedin].filter(v => typeof v === 'string' && v).join('  |  ')}
            </div>
          </div>
        )}

        {summary && typeof summary === 'string' && (
          <>
            <div className="cv-section-title">Professional Summary</div>
            <div className="cv-summary">{summary}</div>
          </>
        )}

        {experience && Array.isArray(experience) && experience.length > 0 && (
          <>
            <div className="cv-section-title">Professional Experience</div>
            {experience.map((exp: any, i: number) => (
              <div key={i} className="cv-item">
                <div className="cv-item-header">
                  <div>
                    <span className="cv-item-title">{typeof exp.title === 'string' ? exp.title : ''}</span>,{' '}
                    <span className="cv-item-subtitle">{typeof exp.company === 'string' ? exp.company : ''}</span>
                  </div>
                  <div className="cv-item-date">{typeof exp.date === 'string' ? exp.date : ''}</div>
                </div>
                {Array.isArray(exp.description) && (
                  <ul className="cv-bullets">
                    {exp.description.map((b: any, j: number) => (
                      typeof b === 'string' ? <li key={j}>{b}</li> : null
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
                  <span className="cv-item-title">{typeof proj.name === 'string' ? proj.name : ''}</span>
                </div>
                {typeof proj.description === 'string' && proj.description && (
                  <div className="cv-item-subtitle mb-1" style={{ fontSize: '10pt' }}>{proj.description}</div>
                )}
                {Array.isArray(proj.details) && (
                  <ul className="cv-bullets">
                    {proj.details.map((b: any, j: number) => (
                      typeof b === 'string' ? <li key={j}>{b}</li> : null
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
                <div className="cv-item-header">
                  <div>
                    <span className="cv-item-title">{typeof edu.degree === 'string' ? edu.degree : ''}</span>,{' '}
                    <span className="cv-item-subtitle">{typeof edu.institution === 'string' ? edu.institution : ''}</span>
                  </div>
                  <div className="cv-item-date">{typeof edu.date === 'string' ? edu.date : ''}</div>
                </div>
                {(edu.gpa || edu.description) && (
                  <div className="cv-edu-meta">
                    {typeof edu.gpa === 'string' && edu.gpa && <span>GPA: {edu.gpa}{edu.description ? '  |  ' : ''}</span>}
                    {typeof edu.description === 'string' && edu.description && <span>{edu.description}</span>}
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
                typeof a === 'string' ? <li key={i}>{a}</li> : null
              ))}
            </ul>
          </>
        )}

        {certifications && Array.isArray(certifications) && certifications.length > 0 && (
          <>
            <div className="cv-section-title">Certifications</div>
            {certifications.map((cert: any, i: number) => {
              if (typeof cert === 'string') return <div key={i} style={{ marginBottom: 4 }}>{cert}</div>;
              return (
                <div key={i} style={{ marginBottom: 4 }}>
                  <span className="cv-item-title">{typeof cert.name === 'string' ? cert.name : ''}</span>
                  {cert.issuer && typeof cert.issuer === 'string' && <span> — {cert.issuer}</span>}
                  {cert.date && typeof cert.date === 'string' && <span className="cv-item-date"> ({cert.date})</span>}
                </div>
              );
            })}
          </>
        )}

        {skills && Array.isArray(skills) && skills.length > 0 && (
          <>
            <div className="cv-section-title">Skills</div>
            <div className="cv-skills-text">
              {skills.filter((s: any) => typeof s === 'string').join(' • ')}
            </div>
          </>
        )}
      </div>
    );
  };

  const renderCoverLetter = (text: string) => {
    return (
      <div className="cl-content whitespace-pre-wrap leading-relaxed text-neutral-900" style={{ fontFamily: "'Times New Roman', Times, serif", fontSize: '11pt' }}>
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
        {text}
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
