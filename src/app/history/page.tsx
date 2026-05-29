'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TopUpModal from '@/components/TopUpModal';
import { FileText, Loader2, Trash2, Clock, ArrowRight, Lock, Eye, Target } from 'lucide-react';
import { setGenerationResult, setGenerationType, setAtsHistory } from '@/lib/store';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createBrowserClient(supabaseUrl, supabaseKey);

interface HistoryDoc {
  id: string;
  document_type: 'resume' | 'cover_letter' | 'ats_check';
  content: any;
  created_at: string;
}

function getDocTitle(doc: HistoryDoc): string {
  if (doc.document_type === 'ats_check') {
    return `ATS Match Score: ${doc.content?.matchScore || 0}%`;
  }
  if (doc.document_type === 'resume' && doc.content?.header?.name) {
    return `Resume — ${doc.content.header.name}`;
  }
  if (doc.document_type === 'cover_letter') {
    return 'Cover Letter';
  }
  return doc.document_type === 'resume' ? 'Resume' : 'Cover Letter';
}

function getDocPreview(doc: HistoryDoc): string {
  if (doc.document_type === 'ats_check') {
    const kw = doc.content?.missingKeywords?.length || 0;
    const title = doc.content?.jobDescription ? 'Targeted JD' : 'General Check';
    return `Analysis: ${title} | Missing Keywords: ${kw}`;
  }
  if (doc.document_type === 'resume' && doc.content?.summary) {
    return typeof doc.content.summary === 'string'
      ? doc.content.summary.slice(0, 160) + '...'
      : '';
  }
  if (doc.document_type === 'cover_letter' && typeof doc.content === 'string') {
    return doc.content.slice(0, 160) + '...';
  }
  return 'Click to view this document.';
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function HistoryPage() {
  const router = useRouter();
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [documents, setDocuments] = useState<HistoryDoc[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsAuthenticated(false);
        setIsAuthChecking(false);
        setIsLoading(false);
      } else {
        setIsAuthenticated(true);
        setIsAuthChecking(false);
        fetchHistory();
      }
    };
    checkAuth();
  }, []);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/history');
      const data = await res.json();
      if (res.ok) {
        setDocuments(data.documents || []);
      }
    } catch (e) {
      console.error('Failed to load history:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoad = (doc: HistoryDoc) => {
    if (doc.document_type === 'ats_check') {
      setAtsHistory(doc.content, doc.content?.cvText || '', doc.content?.jobDescription || '');
      router.push('/ats-checker');
      return;
    }
    const type = doc.document_type === 'resume' ? 'cv' : 'cover-letter';
    setGenerationResult(doc.content);
    setGenerationType(type as any);
    router.push('/app');
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/history?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setDocuments(prev => prev.filter(d => d.id !== id));
      }
    } catch (e) {
      console.error('Failed to delete:', e);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/api/auth/callback` },
    });
  };

  if (isAuthChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50/50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neutral-900"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50/50 px-4">
          <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-xl border border-neutral-100 text-center animate-slide-up">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 text-neutral-900 mb-6">
              <Lock className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-3">Login Required</h2>
            <p className="text-neutral-500 mb-8 text-sm leading-relaxed">
              Sign in to view your document history.
            </p>
            <button
              onClick={handleSignIn}
              className="w-full flex items-center cursor-pointer justify-center gap-2 rounded-full bg-neutral-900 px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-neutral-800 active:scale-95 shadow-sm"
            >
              Sign In with Google
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-neutral-50/50 pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">Document History</h1>
              <p className="text-sm text-neutral-500 mt-1">
                All your previously generated CVs and cover letters.
              </p>
            </div>
            <Link
              href="/app"
              className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800 transition-colors"
            >
              Create New
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-neutral-400">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="text-sm">Loading your history...</p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && documents.length === 0 && (
            <div className="rounded-3xl border border-neutral-200 bg-white p-16 text-center shadow-sm">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-400">
                <FileText className="h-8 w-8" />
              </div>
              <h3 className="text-base font-bold text-neutral-900 mb-2">No documents yet</h3>
              <p className="text-sm text-neutral-500 mb-6 max-w-sm mx-auto">
                Generate your first CV or cover letter to see it here.
              </p>
              <Link
                href="/app"
                className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white hover:bg-neutral-800 transition-colors"
              >
                Create Your First CV
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}

          {/* Document List */}
          {!isLoading && documents.length > 0 && (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="rounded-2xl border border-neutral-200 bg-white shadow-sm hover:shadow-md hover:border-neutral-300 transition-all duration-200 overflow-hidden"
                >
                  <div className="p-4 sm:p-5">
                    <div className="flex items-start gap-3 sm:gap-4">
                      {/* Icon */}
                      <div className={`shrink-0 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl border ${
                        doc.document_type === 'ats_check' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-neutral-100 text-neutral-600 border-neutral-200'
                      }`}>
                        {doc.document_type === 'ats_check' ? <Target className="h-4 w-4 sm:h-5 sm:w-5" /> : <FileText className="h-4 w-4 sm:h-5 sm:w-5" />}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="text-sm font-bold text-neutral-900 truncate max-w-[160px] sm:max-w-none">{getDocTitle(doc)}</h3>
                          <span className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                            doc.document_type === 'resume' ? 'bg-neutral-900 text-white' : 
                            doc.document_type === 'ats_check' ? 'bg-blue-600 text-white' :
                            'bg-neutral-100 text-neutral-600 border border-neutral-200'
                            }`}>
                            {doc.document_type === 'resume' ? 'CV' : doc.document_type === 'ats_check' ? 'ATS Check' : 'Cover Letter'}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-500 leading-relaxed line-clamp-2 mb-2">
                          {getDocPreview(doc)}
                        </p>
                        <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                          <Clock className="h-3 w-3 shrink-0" />
                          <span>{formatDate(doc.created_at)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions — always visible, stacks below content on mobile */}
                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-neutral-100">
                      <button
                        onClick={() => handleLoad(doc)}
                        className="flex-1 inline-flex items-center cursor-pointer justify-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 active:scale-95 transition-all shadow-sm"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View
                      </button>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        disabled={deletingId === doc.id}
                        className="inline-flex items-center cursor-pointer justify-center rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs font-semibold text-red-500 hover:bg-red-100 active:scale-95 transition-all disabled:opacity-60 disabled:active:scale-100"
                      >
                        {deletingId === doc.id
                          ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          : <Trash2 className="h-3.5 w-3.5" />
                        }
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
      <TopUpModal />
    </>
  );
}
