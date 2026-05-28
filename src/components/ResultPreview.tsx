import React, { useState } from 'react';
import { useStore } from '@nanostores/react';
import { generationState } from '../lib/store';
import { FileText, Loader2, Download, Settings2 } from 'lucide-react';

export default function ResultPreview() {
  const state = useStore(generationState);
  const [template, setTemplate] = useState('classic');

  const handleDownload = () => {
    window.print();
  };

  const renderEmptyState = () => (
    <div className="animate-fade-in">
      <div className="rounded-2xl border border-neutral-200/80 bg-white/95 backdrop-blur-sm p-8 sm:p-12 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-neutral-100 text-neutral-400 border border-neutral-200/50">
          <FileText className="h-8 w-8" />
        </div>
        <h3 className="text-base font-semibold text-neutral-900 mb-2">Your Results Will Appear Here</h3>
        <p className="text-sm text-neutral-500 max-w-sm mx-auto leading-relaxed">
          Fill in your details on the left and click a generate button. Our AI will craft professional content tailored to your target role.
        </p>
      </div>
    </div>
  );

  const renderLoadingState = () => (
    <div className="animate-scale-in">
      <div className="rounded-2xl border border-neutral-200/80 bg-white/95 backdrop-blur-sm p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-600 border border-primary-100">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
          <div>
            <p className="text-sm font-semibold text-neutral-900">AI is crafting your content...</p>
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
    const { summary, experience, education, projects, skills } = data;
    // Note: since we're using a store and form is separate, we don't have direct access to the form inputs anymore for name/contact in the preview.
    // However, the AI often generates a complete CV including the header if we asked it to, OR we can store personal info in the store.
    // For now, let's assume the AI generates the content correctly or we display placeholders if missing.

    return (
      <>
        {summary && (
          <>
            <div className="section-title">Professional Summary</div>
            <div className="cv-summary">{summary}</div>
          </>
        )}

        {experience && experience.length > 0 && (
          <>
            <div className="section-title">Experience</div>
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
            <div className="section-title">Projects</div>
            {projects.map((proj: any, i: number) => (
              <div key={i} className="cv-item">
                <div className="cv-item-header">
                  <span className="cv-item-title">{proj.name}</span>
                </div>
                {proj.description && <div className="cv-item-subtitle mb-1">{proj.description}</div>}
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
            <div className="section-title">Education</div>
            {education.map((edu: any, i: number) => (
              <div key={i} className="cv-item mb-2">
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
            <div className="section-title">Skills</div>
            <div className="cv-skills">
              {skills.map((skill: string, i: number) => (
                <span key={i} className="cv-skill-pill">{skill}</span>
              ))}
            </div>
          </>
        )}
      </>
    );
  };

  const renderCoverLetter = (text: string) => {
    return (
      <div className="cl-content mt-8 whitespace-pre-wrap text-sm leading-relaxed text-neutral-800">
        {text}
      </div>
    );
  };

  const renderContent = () => {
    if (!state.result) return null;

    return (
      <div className="animate-scale-in">
        <div className="rounded-2xl border border-neutral-200/80 bg-white/95 backdrop-blur-sm shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col lg:max-h-[calc(100vh-5rem)]">
          
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 px-4 py-3 bg-neutral-50/50">
            <div className="relative">
              <select 
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-600 appearance-none pr-8 cursor-pointer hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all"
              >
                <option value="classic">Classic Template (ATS)</option>
                <option value="modern">Modern Template</option>
                <option value="minimal">Minimal Template</option>
              </select>
              <Settings2 className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
            </div>

            <button 
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 rounded-lg border border-primary-950 bg-primary-900 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-primary-800 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              Download PDF
            </button>
          </div>

          <div className="p-6 sm:p-8 flex-1 overflow-y-auto bg-neutral-100/50">
            <div 
              className={`bg-white shadow-sm border border-neutral-200 mx-auto print-area template-${template}`} 
              style={{ maxWidth: '210mm', minHeight: '297mm', padding: '2rem' }}
            >
              {state.type === 'cv' ? renderCV(state.result) : renderCoverLetter(typeof state.result === 'string' ? state.result : JSON.stringify(state.result))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section id="result-preview-section" className="lg:sticky lg:top-24">
      {!state.isGenerating && !state.result && renderEmptyState()}
      {state.isGenerating && renderLoadingState()}
      {!state.isGenerating && state.result && renderContent()}
    </section>
  );
}
