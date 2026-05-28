'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import InputForm from '@/components/InputForm';
import ResultPreview from '@/components/ResultPreview';
import TopUpModal from '@/components/TopUpModal';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createBrowserClient(supabaseUrl, supabaseKey);

export default function AppPage() {
  const router = useRouter();
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // Redirect to sign in or show a toast
        router.push('/?login=required');
      } else {
        setIsAuthChecking(false);
      }
    };
    checkAuth();
  }, [router]);

  if (isAuthChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50/50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
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
