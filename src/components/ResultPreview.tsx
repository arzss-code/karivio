'use client';
import React, { useState } from 'react';
import { useStore } from '@nanostores/react';
import { generationState, updateGenerationResultField } from '../lib/store';
import { FileText, Loader2, Download, Settings2, ZoomIn, ZoomOut, Maximize, Target } from 'lucide-react';
import { generatePDF } from '../lib/pdf-generator';
import Link from 'next/link';
import EditableField from './EditableField';
import ClassicHTML from './templates/cv/ClassicHTML';
import ModernHTML from './templates/cv/ModernHTML';
import MinimalHTML from './templates/cv/MinimalHTML';
import PaginatedPreview from './PaginatedPreview';

export default function ResultPreview() {
  const state = useStore(generationState);
  const [template, setTemplate] = useState('classic');
  const [isDownloading, setIsDownloading] = useState(false);
  const [zoom, setZoom] = useState(0.7);
  const [zoomText, setZoomText] = useState("70");

  React.useEffect(() => {
    setZoomText(Math.round(zoom * 100).toString());
  }, [zoom]);

  const handleZoomSubmit = () => {
    const val = parseInt(zoomText.replace(/\D/g, ''));
    if (!isNaN(val)) {
      setZoom(Math.max(0.2, Math.min(val / 100, 3)));
    } else {
      setZoomText(Math.round(zoom * 100).toString());
    }
  };

  const handleZoomIn = () => setZoom(z => Math.min(z + 0.1, 3));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.1, 0.2));
  const handleZoomReset = () => setZoom(1);



  const handleDirectDownload = async () => {
    if (!state.result) return;
    setIsDownloading(true);
    try {
      await generatePDF({
        content: state.result,
        type: (state.type ?? 'cv') as import('../lib/pdf-generator').ContentType,
        template: template as any,
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
    switch (template) {
      case 'modern':
        return <ModernHTML data={data} />;
      case 'minimal':
        return <MinimalHTML data={data} />;
      case 'classic':
      default:
        return <ClassicHTML data={data} />;
    }
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
      <div className="animate-scale-in flex flex-col h-full lg:h-[calc(100vh-1rem)] rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden relative">

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3 border-b border-neutral-200 bg-neutral-50/80 px-5 py-3 shrink-0">
          <div className="relative">
            <select
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-bold text-neutral-700 appearance-none pr-8 cursor-pointer hover:border-neutral-300 focus:outline-none focus:ring-0 shadow-sm"
            >
              <option value="classic">Classic ATS</option>
              <option value="modern">Modern Clean</option>
              <option value="minimal">Minimal Compact</option>
            </select>
            <Settings2 className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
          </div>

          <div className="flex items-center gap-2">
            {state.type === 'cv' && (
              <Link
                href="/ats-checker"
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 shadow-sm border border-blue-200 hover:bg-blue-100 transition-colors active:scale-95"
              >
                <Target className="h-3.5 w-3.5" />
                <span className="hidden xl:inline">Check ATS Score</span>
                <span className="hidden sm:inline xl:hidden">ATS Score</span>
              </Link>
            )}
            <button
              onClick={handleDirectDownload}
              disabled={isDownloading}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-neutral-800 transition-colors active:scale-95 disabled:opacity-70"
            >
              {isDownloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">Download PDF</span>
            </button>
          </div>
        </div>

        {/* Document Preview Wrapper */}
        <div className="relative flex-1 flex flex-col min-h-0 bg-neutral-200/80">

          {/* Floating Zoom Controls (Moved out of Toolbar) */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 bg-white/90 backdrop-blur-md border border-neutral-200/80 rounded-full px-2 py-1.5 shadow-xl">
            <button onClick={handleZoomOut} className="p-1.5 text-neutral-600 hover:text-black hover:bg-neutral-100 rounded-full transition-all" title="Zoom Out">
              <ZoomOut className="h-4 w-4" />
            </button>
            <div className="flex items-center justify-center min-w-[3rem]">
              <form onSubmit={(e) => { e.preventDefault(); handleZoomSubmit(); }}>
                <input
                  type="text"
                  className="text-xs font-bold text-neutral-700 w-8 text-center bg-transparent border-none focus:ring-0 p-0 m-0 outline-none"
                  value={zoomText}
                  onChange={(e) => setZoomText(e.target.value)}
                  onBlur={handleZoomSubmit}
                />
              </form>
              <span className="text-xs font-bold text-neutral-700">%</span>
            </div>
            <button onClick={handleZoomIn} className="p-1.5 text-neutral-600 hover:text-black hover:bg-neutral-100 rounded-full transition-all" title="Zoom In">
              <ZoomIn className="h-4 w-4" />
            </button>
          </div>

          {/* Document Preview Area */}
          <div className="flex-1 overflow-auto bg-neutral-200/80">
            <PaginatedPreview zoom={zoom}>
              <div style={{ padding: '0 66px' }}>
                {state.type === 'cv' ? renderCV(state.result) : renderCoverLetter(typeof state.result === 'string' ? state.result : JSON.stringify(state.result))}
              </div>
            </PaginatedPreview>
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
