'use client';
import React, { useState } from 'react';
import { useStore } from '@nanostores/react';
import { generationState } from '../lib/store';
import { FileText, Loader2, Download, Settings2, Printer } from 'lucide-react';

export default function ResultPreview() {
  const state = useStore(generationState);
  const [template, setTemplate] = useState('classic');

  const handleDownload = () => {
    window.print();
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
    if (!data) return null;
    const { header, summary, experience, education, projects, skills } = data;

    return (
      <div className="cv-document">
        <style dangerouslySetInnerHTML={{__html: `
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
          }
          .cv-bullets {
            margin: 0;
            padding-left: 18px;
          }
          .cv-bullets li {
            margin-bottom: 4px;
          }
          .cv-skills-text {
            line-height: 1.6;
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
            <div className="cv-name">{header.name}</div>
            <div className="cv-contact">
              {[header.email, header.phone, header.linkedin].filter(Boolean).join('  |  ')}
            </div>
          </div>
        )}

        {summary && (
          <>
            <div className="cv-section-title">Professional Summary</div>
            <div className="cv-summary">{summary}</div>
          </>
        )}

        {experience && experience.length > 0 && (
          <>
            <div className="cv-section-title">Professional Experience</div>
            {experience.map((exp: any, i: number) => (
              <div key={i} className="cv-item">
                <div className="cv-item-header">
                  <div>
                    <span className="cv-item-title">{exp.title}</span>,{' '}
                    <span className="cv-item-subtitle">{exp.company}</span>
                  </div>
                  <div className="cv-item-date">{exp.date}</div>
                </div>
                {exp.description && (
                  <ul className="cv-bullets">
                    {exp.description.map((b: string, j: number) => (
                      <li key={j}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </>
        )}

        {projects && projects.length > 0 && (
          <>
            <div className="cv-section-title">Projects</div>
            {projects.map((proj: any, i: number) => (
              <div key={i} className="cv-item">
                <div className="cv-item-header">
                  <span className="cv-item-title">{proj.name}</span>
                </div>
                {proj.description && <div className="cv-item-subtitle mb-1" style={{ fontSize: '10pt' }}>{proj.description}</div>}
                {proj.details && (
                  <ul className="cv-bullets">
                    {proj.details.map((b: string, j: number) => (
                      <li key={j}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </>
        )}

        {education && education.length > 0 && (
          <>
            <div className="cv-section-title">Education</div>
            {education.map((edu: any, i: number) => (
              <div key={i} className="cv-item" style={{ marginBottom: '4px' }}>
                <div className="cv-item-header">
                  <div>
                    <span className="cv-item-title">{edu.degree}</span>,{' '}
                    <span className="cv-item-subtitle">{edu.institution}</span>
                  </div>
                  <div className="cv-item-date">{edu.date}</div>
                </div>
              </div>
            ))}
          </>
        )}

        {skills && skills.length > 0 && (
          <>
            <div className="cv-section-title">Skills</div>
            <div className="cv-skills-text">
              {skills.join(' • ')}
            </div>
          </>
        )}
      </div>
    );
  };

  const renderCoverLetter = (text: string) => {
    return (
      <div className="cl-content whitespace-pre-wrap leading-relaxed text-neutral-900" style={{ fontFamily: "'Times New Roman', Times, serif", fontSize: '11pt' }}>
        <style dangerouslySetInnerHTML={{__html: `
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
          <div className="relative">
            <select 
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 appearance-none pr-10 cursor-pointer hover:border-neutral-300 focus:outline-none focus:ring-0 transition-all shadow-sm"
            >
              <option value="classic">Harvard ATS Template</option>
              <option value="modern">Modern Professional</option>
            </select>
            <Settings2 className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          </div>

          <button 
            onClick={handleDownload}
            className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-neutral-800 transition-colors active:scale-95"
          >
            <Printer className="h-4 w-4" />
            Print / Save as PDF
          </button>
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
