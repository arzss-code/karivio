'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import InputForm from '@/components/InputForm';
import ResultPreview from '@/components/ResultPreview';
import TopUpModal from '@/components/TopUpModal';

import { Lock } from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createBrowserClient(supabaseUrl, supabaseKey);

export default function AppPage() {
  const router = useRouter();
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setIsAuthenticated(false);
        setIsAuthChecking(false);
      } else {
        setIsAuthenticated(true);
        setIsAuthChecking(false);
      }
    };
    checkAuth();
  }, []);

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/api/auth/callback` }
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
              You need to be signed in to access the resume builder and manage your professional profile.
            </p>
            <button
              onClick={handleSignIn}
              className="w-full flex items-center justify-center gap-2 rounded-full bg-neutral-900 px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-neutral-800 active:scale-95 shadow-sm"
            >
              Sign In with Google
            </button>
            <button
              onClick={() => router.push('/')}
              className="mt-4 w-full text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              Back to Home
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="text-center mb-10 animate-fade-in">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 border border-neutral-200 px-3.5 py-1 text-xs font-medium text-neutral-600 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              AI-Powered Assistant
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900">
              Create Your Perfect Resume
            </h1>
            <p className="mt-3 text-sm text-[var(--color-text-muted)] max-w-2xl mx-auto">
              Fill in your details below and let AI craft professional, ATS-optimized content for you
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <InputForm />
            <ResultPreview />
          </div>
        </div>
      </main>
      <Footer />
      <TopUpModal />
    </>
  );
}
