'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { generationState, setGenerationResult, atsHistoryState, setAtsHistory } from '@/lib/store';
import { UploadCloud, FileText, Loader2, Target, Briefcase, Lightbulb, CheckCircle2, XCircle, AlertCircle, Save, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

type AtsResult = {
  matchScore: number;
  missingKeywords: string[];
  strengths: string[];
  suggestions: string[];
  recommendedRoles: string[];
};

export default function AtsCheckerPage() {
  const storeState = useStore(generationState);
  const router = useRouter();

  const [source, setSource] = useState<'generated' | 'upload'>('generated');
  const [jobDescription, setJobDescription] = useState('');

  const [cvText, setCvText] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const [isExtracting, setIsExtracting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const [result, setResult] = useState<AtsResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isHistoryLoad = useRef(false);

  // Load from history exactly once when component mounts
  useEffect(() => {
    const historyData = atsHistoryState.get();
    if (historyData.loadedResult) {
      isHistoryLoad.current = true;
      setSource('upload');
      setCvText(historyData.cvText || '');
      setJobDescription(historyData.jobDescription || '');
      setResult(historyData.loadedResult);
      
      // Clear the store so it doesn't persist
      setAtsHistory(null, '', '');
      
      // Reset the flag after a short delay to allow subsequent renders to complete safely
      setTimeout(() => {
        isHistoryLoad.current = false;
      }, 100);
    }
  }, []); // Run only once

  // Handle source changes separately
  useEffect(() => {
    if (isHistoryLoad.current) return; // Prevent any clearing or overriding while history is loading

    if (source === 'generated' && storeState.result) {
      const formatResult = (res: any) => {
        let text = '';
        if (res.header) {
          text += `${res.header.name || ''}\n${res.header.email || ''} | ${res.header.phone || ''} | ${res.header.linkedin || ''}\n\n`;
        }
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

      setCvText(formatResult(storeState.result));
    } else if (source === 'upload') {
      // Clear data when manually switching to upload tab, but only if we didn't just load from history.
      setCvText('');
      setResult(null);
    }
  }, [source, storeState.result]);

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

      setCvText(data.text);
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
    if (!cvText.trim()) {
      setError('CV Content is empty. Please generate a CV or upload a PDF first.');
      return;
    }

    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/ats-checker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvText, jobDescription }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to analyze CV');

      setResult(data.result);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const syncBackToCV = async () => {
    if (!cvText.trim()) return;
    setIsSyncing(true);
    setError(null);

    try {
      const res = await fetch('/api/parse-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvText }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to parse CV');

      setGenerationResult(data.result);
      router.push('/app'); // Redirect back to preview
    } catch (err: any) {
      setError(err.message || 'Failed to sync CV back to builder.');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50/30">
      <Navbar />

      <main className="flex-1 flex flex-col pt-24 pb-12">
        <div className="mx-auto w-full max-w-[1600px] px-6 lg:px-16 flex-1 flex flex-col">

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

          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[700px]">

            {/* LEFT PANEL: Editor */}
            <div className="flex flex-col rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-neutral-200 bg-neutral-50 px-4 py-3 flex items-center justify-between">
                <div className="flex rounded-lg bg-neutral-200/50 p-1">
                  <button
                    onClick={() => setSource('generated')}
                    className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${source === 'generated' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'
                      }`}
                  >
                    Use Generated CV
                  </button>
                  <button
                    onClick={() => setSource('upload')}
                    className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${source === 'upload' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'
                      }`}
                  >
                    Upload External PDF
                  </button>
                </div>

                {source === 'generated' && (
                  <button
                    onClick={syncBackToCV}
                    disabled={isSyncing || !cvText.trim()}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-60 transition-colors"
                  >
                    {isSyncing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                    Save & Return to PDF
                  </button>
                )}
              </div>

              <div className="flex-1 flex flex-col p-4 relative">
                {source === 'upload' && !cvText && !isExtracting ? (
                  <div
                    className="flex-1 border-2 border-dashed border-neutral-300 rounded-xl flex flex-col items-center justify-center bg-neutral-50 cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                  >
                    <input type="file" ref={fileInputRef} className="hidden" accept="application/pdf" onChange={handleFileChange} />
                    <UploadCloud className="h-10 w-10 text-neutral-400 mb-3" />
                    <span className="font-semibold text-neutral-700">Click to upload or drag PDF here</span>
                    <span className="text-xs text-neutral-500 mt-1">We will extract the text for you to edit.</span>
                  </div>
                ) : isExtracting ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-neutral-500">
                    <Loader2 className="h-8 w-8 animate-spin mb-3 text-blue-500" />
                    <p className="text-sm font-medium">Extracting text from PDF...</p>
                  </div>
                ) : (
                  <textarea
                    className="flex-1 w-full rounded-xl border border-neutral-200 bg-neutral-50/50 p-4 font-mono text-[13px] leading-relaxed text-neutral-800 focus:border-blue-400 focus:ring-4 focus:ring-blue-400/10 resize-none outline-none"
                    value={cvText}
                    onChange={(e) => setCvText(e.target.value)}
                    placeholder="Your CV text will appear here. You can edit it directly."
                  />
                )}
              </div>
            </div>

            {/* RIGHT PANEL: Results */}
            <div className="flex flex-col rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-neutral-200 bg-neutral-50 px-6 py-4">
                <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-500" />
                  ATS Analysis Dashboard
                </h2>
              </div>

              <div className="p-6 flex-1 overflow-y-auto space-y-6">

                {/* Job Description Input */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-2">
                    Target Job Description (Optional)
                  </label>
                  <textarea
                    rows={3}
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-xs focus:border-neutral-400 focus:ring-0 resize-none"
                    placeholder="Paste the job posting here to get a specific Match Score..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                  />
                </div>

                <button
                  onClick={runAnalysis}
                  disabled={isAnalyzing || !cvText.trim()}
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

                    {/* Score */}
                    <div className="flex items-center gap-6 bg-neutral-50/50 p-6 rounded-2xl border border-neutral-100">
                      <div className="relative h-24 w-24 flex shrink-0 items-center justify-center rounded-full bg-white shadow-sm border border-neutral-200">
                        <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100">
                          <circle
                            cx="50" cy="50" r="47" fill="none" stroke="currentColor" strokeWidth="6"
                            className={result.matchScore >= 80 ? "text-green-500" : result.matchScore >= 50 ? "text-yellow-500" : "text-red-500"}
                            strokeDasharray={`${result.matchScore * 2.95} 295`} strokeLinecap="round"
                          />
                        </svg>
                        <div className="flex flex-col items-center">
                          <span className="text-3xl font-extrabold text-neutral-900">{result.matchScore}</span>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-bold text-neutral-900 text-lg">Match Score</h3>
                        <p className="text-xs text-neutral-500 mt-1">
                          {result.matchScore >= 80 ? 'Excellent match! You are highly competitive.' :
                            result.matchScore >= 50 ? 'Good start. Add missing keywords to improve.' :
                              'Low match. Consider heavily tailoring your resume.'}
                        </p>
                      </div>
                    </div>

                    {/* Keywords */}
                    <div>
                      <h3 className="text-sm font-bold text-neutral-900 mb-3 flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-500" /> Missing Keywords
                      </h3>
                      {result.missingKeywords.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {result.missingKeywords.map((kw, idx) => (
                            <button
                              key={idx}
                              title="Copy to clipboard"
                              onClick={() => navigator.clipboard.writeText(kw)}
                              className="inline-flex items-center px-2 py-1 rounded bg-red-50 text-red-700 text-xs font-medium border border-red-100 hover:bg-red-100 transition-colors"
                            >
                              + {kw}
                            </button>
                          ))}
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
