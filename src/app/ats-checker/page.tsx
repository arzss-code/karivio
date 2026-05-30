'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { generationState, setGenerationResult, atsHistoryState, setAtsHistory } from '@/lib/store';
import { UploadCloud, FileText, Loader2, Target, Briefcase, Lightbulb, CheckCircle2, XCircle, AlertCircle, Save, RefreshCw, Sparkles, ZoomIn, ZoomOut, Maximize, Settings2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

import RewriteSuggestion from '@/components/ats/RewriteSuggestion';
import ClassicHTML from '@/components/templates/cv/ClassicHTML';
import ModernHTML from '@/components/templates/cv/ModernHTML';
import MinimalHTML from '@/components/templates/cv/MinimalHTML';
import PaginatedPreview from '@/components/PaginatedPreview';

const formatResultToText = (res: any) => {
  if (!res) return '';
  let text = '';
  if (res.header) text += `${res.header.name || ''}\n${res.header.email || ''} | ${res.header.phone || ''} | ${res.header.linkedin || ''}\n\n`;
  if (res.summary) text += `SUMMARY\n${res.summary}\n\n`;
  if (res.experience?.length) {
    text += `EXPERIENCE\n`;
    res.experience.forEach((e: any) => {
      text += `${e.title} at ${e.company} (${e.date})\n`;
      e.description?.forEach((d: string) => text += `- ${d}\n`);
      text += '\n';
    });
  }
  if (res.education?.length) {
    text += `EDUCATION\n`;
    res.education.forEach((e: any) => {
      text += `${e.degree} - ${e.institution} (${e.date})\n`;
      if (e.gpa) text += `GPA: ${e.gpa}\n`;
      if (e.description) text += `${e.description}\n`;
      text += '\n';
    });
  }
  if (res.projects?.length) {
    text += `PROJECTS\n`;
    res.projects.forEach((p: any) => {
      text += `${p.name}: ${p.description}\n`;
      p.details?.forEach((d: string) => text += `- ${d}\n`);
      text += '\n';
    });
  }
  if (res.skills?.length) text += `SKILLS\n${res.skills.join(', ')}\n\n`;
  return text;
};

const replaceTextInJson = (obj: any, oldText: string, newText: string): any => {
  if (typeof obj === 'string') {
    if (obj.includes(oldText)) return obj.replace(oldText, newText);
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(item => replaceTextInJson(item, oldText, newText));
  }
  if (obj !== null && typeof obj === 'object') {
    const newObj: any = {};
    for (const key in obj) {
      newObj[key] = replaceTextInJson(obj[key], oldText, newText);
    }
    return newObj;
  }
  return obj;
};

const CircularProgress = ({ value, label, subtitle }: { value: number, label: string, subtitle: string }) => {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;
  const colorClass = value >= 80 ? "text-green-500" : value >= 50 ? "text-yellow-500" : "text-red-500";
  return (
    <div className="flex flex-col items-center bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="relative h-20 w-20 flex items-center justify-center mb-3">
        <svg className="transform -rotate-90 w-20 h-20">
          <circle cx="40" cy="40" r={radius} stroke="currentColor" strokeWidth="6" fill="transparent" className="text-neutral-100" />
          <circle
            cx="40" cy="40" r={radius}
            stroke="currentColor"
            strokeWidth="6"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={`transition-all duration-1000 ease-out ${colorClass}`}
            strokeLinecap="round"
          />
        </svg>
        <span className={`absolute text-xl font-bold ${colorClass}`}>{value}</span>
      </div>
      <h3 className="font-bold text-neutral-900 text-sm mb-1">{label}</h3>
      <p className="text-[10px] text-neutral-500 text-center leading-relaxed h-8">{subtitle}</p>
    </div>
  );
};

type AtsResult = {
  matchScore: number;
  formatScore: number;
  impactScore: number;
  missingKeywords: {
    critical: string[];
    important: string[];
    optional: string[];
  };
  strengths: string[];
  suggestions: string[];
  weakSentences: string[];
  recommendedRoles: string[];
};

export default function AtsCheckerPage() {
  const storeState = useStore(generationState);
  const router = useRouter();

  const [source, setSource] = useState<'generated' | 'upload'>('generated');
  const [jobDescription, setJobDescription] = useState('');

  const [template, setTemplate] = useState('classic');
  const [zoom, setZoom] = useState(0.8);

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [formatIssues, setFormatIssues] = useState<string[]>([]);
  const [activeWeakSentence, setActiveWeakSentence] = useState<string | null>(null);
  const [successSentence, setSuccessSentence] = useState<string | null>(null);

  const [recentDocs, setRecentDocs] = useState<any[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);

  const [isExtracting, setIsExtracting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSavingDoc, setIsSavingDoc] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const [result, setResult] = useState<AtsResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isHistoryLoad = useRef(false);

  // Fetch history if landing empty
  useEffect(() => {
    if (!storeState.result && source === 'generated' && !isHistoryLoad.current) {
      const fetchHistory = async () => {
        setIsLoadingDocs(true);
        try {
          const res = await fetch('/api/history');
          const data = await res.json();
          if (res.ok && data.documents) {
            setRecentDocs(data.documents.filter((d: any) => d.document_type === 'resume').slice(0, 3));
          }
        } catch (e) {
          console.error('Failed to load history:', e);
        } finally {
          setIsLoadingDocs(false);
        }
      };
      fetchHistory();
    }
  }, [storeState.result, source]);

  // Load from history exactly once when component mounts
  useEffect(() => {
    const historyData = atsHistoryState.get();
    if (historyData.loadedResult) {
      isHistoryLoad.current = true;
      setSource('generated');
      setJobDescription(historyData.jobDescription || '');
      setResult(historyData.loadedResult);
      if (historyData.loadedResult.cvJson) {
        setGenerationResult(historyData.loadedResult.cvJson);
      }
      setAtsHistory(null, '', '');
      setTimeout(() => {
        isHistoryLoad.current = false;
      }, 100);
    }
  }, []);

  // Handle source changes separately
  useEffect(() => {
    if (isHistoryLoad.current) return;

    if (source === 'upload') {
      setResult(null);
      setFormatIssues([]);
      setActiveWeakSentence(null);
    }
  }, [source]);

  // Auto-highlight effect
  useEffect(() => {
    if (!activeWeakSentence) return;
    const timer = setTimeout(() => {
      const container = document.querySelector('.print-container');
      if (!container) return;

      const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null);
      let node;
      while ((node = walker.nextNode())) {
        const text = node.nodeValue?.trim() || '';
        if (text.length > 10 && (text.includes(activeWeakSentence) || activeWeakSentence.includes(text))) {
          const parent = node.parentElement;
          if (parent) {
            // Because of CSS columns (horizontal pagination), we scroll inline
            parent.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });

            const originalBg = parent.style.backgroundColor;
            const originalTransition = parent.style.transition;
            parent.style.transition = 'background-color 0.3s ease';
            parent.style.backgroundColor = '#fef08a';
            setTimeout(() => {
              parent.style.backgroundColor = originalBg;
              setTimeout(() => { parent.style.transition = originalTransition; }, 300);
            }, 2000);
          }
          break;
        }
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [activeWeakSentence]);

  const loadRecentDoc = (doc: any) => {
    setGenerationResult(doc.content);
    setSource('generated');
  };

  const saveDocument = async () => {
    if (!storeState.result) return;
    setIsSavingDoc(true);
    try {
      const res = await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ document_type: 'resume', content: storeState.result }),
      });
      if (!res.ok) throw new Error('Failed to save document');
      alert('Document saved successfully to your history!');
    } catch (e) {
      console.error('Save error:', e);
      alert('Error saving document.');
    } finally {
      setIsSavingDoc(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (file.type !== 'application/pdf') {
      alert('Please upload a valid PDF file.');
      return;
    }

    setPdfFile(file);
    setIsExtracting(true);
    setError(null);

    try {
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result?.toString().split(',')[1] || '');
        reader.readAsDataURL(file);
      });

      const res = await fetch('/api/extract-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdfBase64: base64 }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to extract text');

      if (data.formatIssues) {
        setFormatIssues(data.formatIssues);
      }

      const parseRes = await fetch('/api/parse-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvText: data.text }),
      });

      const parseData = await parseRes.json();
      if (!parseRes.ok) throw new Error(parseData.error || 'Failed to parse CV into visual format');

      setGenerationResult(parseData.result);
      setSource('generated');
    } catch (err: any) {
      setError(err.message || 'Failed to extract PDF text.');
      setPdfFile(null);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileUpload(file);
  };

  const runAnalysis = async () => {
    setError(null);
    const cvText = formatResultToText(storeState.result);
    if (!cvText.trim()) {
      setError('CV Content is empty. Please generate a CV or upload a PDF first.');
      return;
    }

    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/ats-checker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvText, jobDescription, formatIssues, cvJson: storeState.result }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to analyze CV');

      setResult(data.result);
      setActiveWeakSentence(null);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50/30">
      <Navbar />

      <main className="min-h-screen bg-neutral-50/30 pt-24 pb-16">
        <div className="mx-auto w-full max-w-[1600px] px-6 lg:px-16">

          <div className="mb-6 text-center animate-slide-down">
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
              ATS Optimizer Workspace
            </h1>
            <p className="mt-2 text-neutral-600">
              Edit your resume text directly on the left and see your ATS score update on the right.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 flex items-start gap-3 animate-fade-in">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

            {/* LEFT PANEL: Editor */}
            <div className="flex flex-col rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden h-[800px] lg:h-[calc(100vh-1rem)] lg:sticky lg:top-24">
              <div className="border-b border-neutral-200 bg-neutral-50 px-4 py-3 flex items-center justify-between flex-wrap gap-2 shrink-0">
                <div className="flex rounded-lg bg-neutral-200/50 p-1">
                  <button
                    onClick={() => setSource('generated')}
                    className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${source === 'generated' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'
                      }`}
                  >
                    Visual Preview
                  </button>
                  <button
                    onClick={() => setSource('upload')}
                    className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${source === 'upload' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'
                      }`}
                  >
                    Upload PDF
                  </button>
                </div>

                {source === 'generated' && storeState.result && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={saveDocument}
                      disabled={isSavingDoc}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60 transition-colors mr-1"
                      title="Save edits to History"
                    >
                      {isSavingDoc ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                      <span className="hidden sm:inline">Save</span>
                    </button>
                    <div className="relative">
                      <select
                        value={template}
                        onChange={(e) => setTemplate(e.target.value)}
                        className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 appearance-none pr-8 cursor-pointer shadow-sm"
                      >
                        <option value="classic">Classic ATS</option>
                        <option value="modern">Modern</option>
                        <option value="minimal">Minimal</option>
                      </select>
                      <Settings2 className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
                    </div>
                    <div className="flex items-center bg-white border border-neutral-200 rounded-lg shadow-sm">
                      <button onClick={() => setZoom(z => Math.max(z - 0.1, 0.3))} className="p-1.5 text-neutral-500 hover:text-neutral-900"><ZoomOut className="h-3.5 w-3.5" /></button>
                      <span className="text-[10px] font-bold px-1">{Math.round(zoom * 100)}%</span>
                      <button onClick={() => setZoom(z => Math.min(z + 0.1, 2))} className="p-1.5 text-neutral-500 hover:text-neutral-900"><ZoomIn className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex-1 flex flex-col relative bg-neutral-200/50 overflow-hidden min-h-0">
                {source === 'upload' ? (
                  <div className="p-4 flex-1 flex flex-col">
                    {isExtracting ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-neutral-500">
                        <Loader2 className="h-8 w-8 animate-spin mb-3 text-blue-500" />
                        <p className="text-sm font-medium">Extracting and parsing PDF with AI...</p>
                        <p className="text-xs mt-2 text-neutral-400">This usually takes 5-10 seconds</p>
                      </div>
                    ) : (
                      <div
                        className="flex-1 border-2 border-dashed border-neutral-300 rounded-xl flex flex-col items-center justify-center bg-neutral-50 cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                      >
                        <input type="file" ref={fileInputRef} className="hidden" accept="application/pdf" onChange={handleFileChange} />
                        <UploadCloud className="h-10 w-10 text-neutral-400 mb-3" />
                        <span className="font-semibold text-neutral-700">Click to upload or drag PDF here</span>
                        <span className="text-xs text-neutral-500 mt-1">We will generate an editable visual CV for you.</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex-1 overflow-auto bg-neutral-200/50">
                    {storeState.result ? (
                      <PaginatedPreview zoom={zoom}>
                        <div style={{ padding: '0 66px' }}>
                          {template === 'modern' ? <ModernHTML data={storeState.result} /> :
                            template === 'minimal' ? <MinimalHTML data={storeState.result} /> :
                              <ClassicHTML data={storeState.result} />}
                        </div>
                      </PaginatedPreview>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-lg mx-auto w-full">
                        <div className="w-full bg-white rounded-3xl border border-neutral-200 shadow-sm p-8 animate-slide-up">
                          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-400">
                            <FileText className="h-8 w-8" />
                          </div>
                          <h3 className="text-xl font-bold text-neutral-900 mb-2 text-center">Welcome to ATS Checker</h3>
                          <p className="text-sm text-neutral-500 mb-8 leading-relaxed text-center">
                            Start by selecting a previously generated resume from your history, or upload a new PDF to analyze.
                          </p>

                          <div className="space-y-4">

                            {isLoadingDocs ? (
                              <div className="py-4 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-neutral-400" /></div>
                            ) : recentDocs.length > 0 ? (
                              <div className="pb-4 border-b border-neutral-100">
                                <h4 className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-3">Recent Documents</h4>
                                <div className="space-y-2">
                                  {recentDocs.map(doc => (
                                    <button
                                      key={doc.id}
                                      onClick={() => loadRecentDoc(doc)}
                                      className="w-full text-left p-3 rounded-xl border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 transition-colors flex items-center justify-between group"
                                    >
                                      <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="bg-blue-50 text-blue-600 p-2 rounded-lg"><FileText className="w-4 h-4" /></div>
                                        <span className="text-sm font-semibold text-neutral-800 truncate">
                                          {doc.content?.header?.name ? `Resume — ${doc.content.header.name}` : 'Resume'}
                                        </span>
                                      </div>
                                      <ArrowRight className="w-4 h-4 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ) : null}

                            <button
                              onClick={() => setSource('upload')}
                              className="w-full flex items-center justify-center gap-2 rounded-xl bg-neutral-900 px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-neutral-800 active:scale-95 shadow-sm"
                            >
                              <UploadCloud className="h-4 w-4" />
                              Upload New PDF
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT PANEL: Results */}
            <div className="flex flex-col rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden h-[800px] lg:h-[calc(100vh-1rem)] lg:sticky lg:top-24">
              <div className="border-b border-neutral-200 bg-neutral-50 px-6 py-4 shrink-0">
                <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-500" />
                  ATS Analysis Dashboard
                </h2>
              </div>

              <div className="p-6 flex-1 overflow-y-auto space-y-6 min-h-0 relative">

                {/* Job Description Input */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-2">
                    Target Job Description (Optional)
                  </label>
                  <textarea
                    rows={4}
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-xs focus:border-neutral-400 focus:ring-0 resize-none"
                    placeholder="Paste the job posting here to get a specific Match Score..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                  />
                </div>

                <button
                  onClick={runAnalysis}
                  disabled={isAnalyzing || !storeState.result}
                  className="w-full inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold text-white bg-neutral-900 shadow-sm hover:bg-neutral-800 transition-colors disabled:opacity-60"
                >
                  {isAnalyzing ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing (1 credit)...</>
                  ) : (
                    <><RefreshCw className="w-4 h-4 mr-2" /> {result ? 'Re-Analyze Resume' : 'Analyze Resume'}</>
                  )}
                </button>

                {/* Results */}
                {result && (
                  <div className="animate-fade-in space-y-8 pt-4 border-t border-neutral-100">

                    {/* Scores */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <CircularProgress
                        value={result.matchScore}
                        label="Match Score"
                        subtitle="Keyword alignment with job description."
                      />
                      <CircularProgress
                        value={result.formatScore}
                        label="Format Score"
                        subtitle="ATS-friendly layout and structure."
                      />
                      <CircularProgress
                        value={result.impactScore}
                        label="Impact Score"
                        subtitle="Usage of metrics and action verbs."
                      />
                    </div>

                    {/* Strengths */}
                    {result.strengths && result.strengths.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-sm font-bold text-neutral-900 mb-3 flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" /> Strengths (What you did well)
                        </h3>
                        <ul className="space-y-2">
                          {result.strengths.map((str, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-neutral-700 bg-green-50/50 p-3 rounded-lg border border-green-100/50">
                              <span className="font-bold text-green-500 mt-0.5">✓</span>
                              <span>{str}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Weak Sentences & Smart Rewrite */}
                    {result.weakSentences && result.weakSentences.length > 0 && (
                      <div>
                        <h3 className="text-sm font-bold text-neutral-900 mb-3 flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-blue-500" /> Needs Improvement (Smart Rewrite)
                        </h3>
                        <div className="space-y-3">
                          {result.weakSentences.map((sentence, idx) => (
                            <div key={idx} className="relative rounded-lg border border-yellow-200 bg-yellow-50/50 p-3 text-xs text-neutral-800 transition-all">
                              {successSentence === sentence ? (
                                <div className="flex items-center gap-2 text-green-600 font-bold justify-center h-full py-2 animate-fade-in">
                                  <CheckCircle2 className="h-5 w-5 animate-scale-in" /> Perbaikan diterapkan!
                                </div>
                              ) : (
                                <>
                                  <p className="mb-2 italic">"{sentence}"</p>
                                  <button
                                    onClick={() => setActiveWeakSentence(activeWeakSentence === sentence ? null : sentence)}
                                    className="inline-flex items-center gap-1.5 rounded bg-white px-2 py-1 text-[11px] font-semibold text-blue-600 shadow-sm border border-blue-100 hover:bg-blue-50 transition-colors"
                                  >
                                    <Sparkles className="h-3 w-3" />
                                    Fix with AI
                                  </button>

                                  {activeWeakSentence === sentence && (
                                    <RewriteSuggestion
                                      sentence={sentence}
                                      context={formatResultToText(storeState.result)}
                                      onApply={(oldT, newT) => {
                                        const updatedJson = replaceTextInJson(storeState.result, oldT, newT);
                                        setGenerationResult(updatedJson);
                                        setActiveWeakSentence(null);
                                        setSuccessSentence(sentence);
                                        setTimeout(() => {
                                          setSuccessSentence(null);
                                          setResult(prev => prev ? { ...prev, weakSentences: prev.weakSentences.filter(s => s !== sentence) } : prev);
                                        }, 2000);
                                      }}
                                      onDismiss={() => setActiveWeakSentence(null)}
                                    />
                                  )}
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Keywords */}
                    <div>
                      <h3 className="text-sm font-bold text-neutral-900 mb-3 flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-500" /> Missing Keywords
                      </h3>
                      {Object.entries(result.missingKeywords).some(([_, kws]) => kws.length > 0) ? (
                        <div className="space-y-3">
                          {result.missingKeywords.critical?.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-neutral-700 mb-1">Critical (Must Have)</p>
                              <div className="flex flex-wrap gap-2">
                                {result.missingKeywords.critical.map((kw, idx) => (
                                  <span key={idx} className="inline-flex items-center px-2 py-1 rounded bg-red-50 text-red-700 text-xs font-medium border border-red-100">
                                    {kw}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {result.missingKeywords.important?.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-neutral-700 mb-1">Important</p>
                              <div className="flex flex-wrap gap-2">
                                {result.missingKeywords.important.map((kw, idx) => (
                                  <span key={idx} className="inline-flex items-center px-2 py-1 rounded bg-orange-50 text-orange-700 text-xs font-medium border border-orange-100">
                                    {kw}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {result.missingKeywords.optional?.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-neutral-700 mb-1">Optional (Bonus)</p>
                              <div className="flex flex-wrap gap-2">
                                {result.missingKeywords.optional.map((kw, idx) => (
                                  <span key={idx} className="inline-flex items-center px-2 py-1 rounded bg-yellow-50 text-yellow-700 text-xs font-medium border border-yellow-100">
                                    {kw}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-neutral-500 italic">No missing keywords detected!</p>
                      )}
                    </div>

                    {/* Suggestions */}
                    <div>
                      <h3 className="text-sm font-bold text-neutral-900 mb-3 flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-yellow-500" /> Suggestions
                      </h3>
                      <ul className="space-y-2">
                        {result.suggestions.map((sug, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-neutral-700 bg-neutral-50 p-3 rounded-lg border border-neutral-100">
                            <span className="font-bold text-neutral-400 mt-0.5">{idx + 1}.</span>
                            <span>{sug}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Recommended Roles */}
                    <div>
                      <h3 className="text-sm font-bold text-neutral-900 mb-3 flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-blue-500" /> Recommended Roles
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {result.recommendedRoles.map((role, idx) => (
                          <span key={idx} className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-semibold border border-blue-100">
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>

                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
