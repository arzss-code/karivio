'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

// Initialize Supabase client for browser
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createBrowserClient(supabaseUrl, supabaseKey);

export default function Navbar() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('credits_balance, full_name, email')
          .eq('id', session.user.id)
          .single();
        
        if (profile) {
          setUserProfile(profile);
        } else {
          setUserProfile({
            full_name: session.user.user_metadata?.full_name || 'User',
            email: session.user.email,
            credits_balance: 0
          });
        }
      }
    };
    
    checkSession();

    const onScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/api/auth/callback` }
    });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUserProfile(null);
    router.push('/');
  };

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-xl border-b border-[var(--color-border)] shadow-sm' : 'bg-white/50 backdrop-blur-xl border-b border-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <Link href="/" className="group flex items-center gap-2 text-neutral-900">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-neutral-900 transition-transform duration-300 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
          </svg>
          <span className="text-lg font-extrabold tracking-tight text-neutral-900">CareerGen</span>
        </Link>

        <div className="hidden items-center gap-4 md:flex">
          <Link href="/" className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:text-neutral-900 hover:bg-neutral-50/80">Home</Link>
          <Link href="/app" className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:text-neutral-900 hover:bg-neutral-50/80">Create CV</Link>
          
          <div className="h-5 w-px bg-neutral-200 mx-2"></div>

          {userProfile ? (
            <div className="flex items-center gap-4">
              <button 
                type="button" 
                onClick={() => window.dispatchEvent(new Event('open-topup'))} 
                className="flex items-center gap-1.5 rounded-full bg-neutral-100/80 px-3.5 py-1.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-200/80 transition-all shadow-sm border border-neutral-200 hover:-translate-y-px"
              >
                <span>💎</span>
                <span>{userProfile.credits_balance} Credits</span>
                <svg className="h-3.5 w-3.5 ml-1 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </button>
              
              <div className="relative group">
                <div className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-neutral-900 text-sm font-bold text-white shadow-[0_2px_8px_0_oklch(0_0_0_/_0.15)] ring-2 ring-white hover:scale-105 transition-transform duration-200">
                  {userProfile.full_name ? userProfile.full_name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white/90 backdrop-blur-xl p-2 shadow-xl ring-1 ring-black/5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 origin-top-right translate-y-1 group-hover:translate-y-0">
                  <div className="px-3 py-2 border-b border-neutral-100 mb-1">
                    <p className="text-sm font-medium text-neutral-900 truncate">{userProfile.full_name}</p>
                    <p className="text-xs text-[var(--color-text-muted)] truncate">{userProfile.email}</p>
                  </div>
                  <button onClick={handleSignOut} className="w-full text-left cursor-pointer rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-error)] hover:bg-[var(--color-error)]/5 transition-colors">
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button onClick={handleSignIn} className="group relative inline-flex cursor-pointer items-center gap-2 rounded-lg bg-white border border-neutral-200 hover:bg-neutral-50 px-4 py-2 text-sm font-medium text-neutral-700 transition-all duration-200 shadow-sm hover:shadow">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>Login with Google</span>
            </button>
          )}
        </div>

        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)} 
          className="relative flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-lg transition-colors hover:bg-neutral-100 md:hidden"
        >
          <span className={`h-0.5 w-5 bg-neutral-900 rounded-full transition-transform ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
          <span className={`h-0.5 w-5 bg-neutral-900 rounded-full transition-opacity ${isMenuOpen ? 'opacity-0' : ''}`}></span>
          <span className={`h-0.5 w-5 bg-neutral-900 rounded-full transition-transform ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
        </button>
      </div>
    </nav>
  );
}
