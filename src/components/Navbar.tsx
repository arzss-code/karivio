'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { Sparkles, Menu, X, LogOut, ChevronDown, User, Gem } from 'lucide-react';
import { useStore } from '@nanostores/react';
import { userProfileState, setUserProfile, updateCredits } from '@/lib/userStore';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createBrowserClient(supabaseUrl, supabaseKey);

export default function Navbar() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const userProfile = useStore(userProfileState);

  useEffect(() => {
    let realtimeChannel: any = null;

    const checkSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('credits_balance, full_name, email')
          .eq('id', user.id)
          .single();

        if (profile) {
          setUserProfile({ id: user.id, ...profile });

          // Listen to Realtime updates for the current user's profile
          const channelName = `profile-credits-sync-${user.id}-${Date.now()}`;
          realtimeChannel = supabase.channel(channelName)
            .on(
              'postgres_changes',
              {
                event: 'UPDATE',
                schema: 'public',
                table: 'profiles',
                filter: `id=eq.${user.id}`
              },
              (payload) => {
                if (payload.new && typeof payload.new.credits_balance !== 'undefined') {
                  updateCredits(payload.new.credits_balance);
                }
              }
            )
            .subscribe();

        } else {
          setUserProfile({
            id: user.id,
            full_name: user.user_metadata?.full_name || 'User',
            email: user.email || '',
            credits_balance: 0
          });
        }
      }
    };

    checkSession();

    const onScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
      }
    };
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
      className={`fixed top-0 inset-x-0 z-50 border-b transition-all duration-300 ${isScrolled
        ? 'bg-white/80 backdrop-blur-md border-neutral-200 shadow-[0_4px_30px_rgba(0,0,0,0.03)]'
        : 'bg-transparent border-transparent'
        }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <Link href="/" className="group flex items-center gap-2.5 transition-transform duration-300 hover:opacity-80">
          <img src="/icon.svg" alt="Karivio Logo" className="h-8 w-8 transition-transform duration-300 group-hover:scale-110" />
          <span className="text-[1.05rem] font-bold tracking-tight text-neutral-900">Karivio</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors">
              Home
            </Link>
            <Link href="/app" className="text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors">
              Create CV
            </Link>
            <Link href="/ats-checker" className="text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors">
              ATS Checker
            </Link>
            {userProfile && (
              <Link href="/history" className="text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors">
                History
              </Link>
            )}
          </div>

          <div className="h-4 w-px bg-neutral-200"></div>

          {userProfile ? (
            <div className="flex items-center gap-5">
              <button
                type="button"
                onClick={() => window.dispatchEvent(new Event('open-topup'))}
                className="group flex items-center cursor-pointer gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 shadow-sm transition-all hover:border-neutral-300 hover:bg-neutral-50 hover:shadow"
              >
                <Gem className="h-3.5 w-3.5 text-blue-500" />
                <span>{userProfile.credits_balance} Credits</span>
              </button>

              <div className="relative group">
                <div className="flex items-center gap-2 cursor-pointer rounded-full border border-neutral-200 bg-white p-1 pr-3 hover:bg-neutral-50 transition-colors">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-100 text-xs font-bold text-neutral-700">
                    {userProfile.full_name ? userProfile.full_name.charAt(0).toUpperCase() : <User className="h-3 w-3" />}
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-neutral-400 group-hover:text-neutral-600 transition-colors" />
                </div>

                <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-neutral-100 bg-white p-2 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 origin-top-right translate-y-1 group-hover:translate-y-0">
                  <div className="px-3 py-2.5 mb-1 rounded-xl bg-neutral-50/50">
                    <p className="text-sm font-medium text-neutral-900 truncate">{userProfile.full_name}</p>
                    <p className="text-xs text-neutral-500 truncate mt-0.5">{userProfile.email}</p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center cursor-pointer gap-2 rounded-xl px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={handleSignIn}
              className="inline-flex items-center cursor-pointer justify-center rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-neutral-800 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
            >
              Sign In
            </button>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden flex h-10 w-10 items-center justify-center rounded-full bg-white border border-neutral-200 text-neutral-600 transition-colors hover:bg-neutral-50"
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      <div className={`md:hidden absolute inset-x-0 top-full border-b border-neutral-200/60 bg-white/95 backdrop-blur-xl transition-all duration-300 ease-in-out ${isMenuOpen ? 'opacity-100 visible translate-y-0 shadow-lg' : 'opacity-0 invisible -translate-y-2'}`}>
        <div className="flex flex-col px-6 py-8 space-y-6">
          <div className="flex flex-col space-y-4">
            <Link href="/" onClick={() => setIsMenuOpen(false)} className="text-base font-medium text-neutral-600 hover:text-neutral-900 py-1 transition-colors">Home</Link>
            <Link href="/app" onClick={() => setIsMenuOpen(false)} className="text-base font-medium text-neutral-600 hover:text-neutral-900 py-1 transition-colors">Create CV</Link>
            <Link href="/ats-checker" onClick={() => setIsMenuOpen(false)} className="text-base font-medium text-neutral-600 hover:text-neutral-900 py-1 transition-colors">ATS Checker</Link>
            {userProfile && (
              <Link href="/history" onClick={() => setIsMenuOpen(false)} className="text-base font-medium text-neutral-600 hover:text-neutral-900 py-1 transition-colors">History</Link>
            )}
          </div>

          <div className="h-px w-full bg-neutral-100"></div>

          {userProfile ? (
            <div className="flex flex-col space-y-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-100 text-sm font-bold text-neutral-700 border border-neutral-200">
                  {userProfile.full_name ? userProfile.full_name.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-bold text-neutral-900 truncate">{userProfile.full_name}</span>
                  <span className="text-xs text-neutral-500 truncate">{userProfile.email}</span>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-neutral-50 p-4 border border-neutral-200/60 shadow-sm">
                <div className="flex items-center gap-2.5">
                  <Gem className="h-5 w-5 text-blue-500" />
                  <span className="text-sm font-semibold text-neutral-700">Credits Available</span>
                </div>
                <span className="text-lg font-bold text-neutral-900">{userProfile.credits_balance}</span>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <button
                  onClick={() => { setIsMenuOpen(false); window.dispatchEvent(new Event('open-topup')); }}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-neutral-900 px-4 py-3.5 text-sm font-bold text-white hover:bg-neutral-800 transition-colors shadow-sm active:scale-[0.98]"
                >
                  Top Up Credits
                </button>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-red-100 bg-white px-4 py-3.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleSignIn}
              className="w-full rounded-xl bg-neutral-900 px-4 py-4 text-base font-semibold text-white transition-colors hover:bg-neutral-800 text-center shadow-md active:scale-[0.98]"
            >
              Sign In to Continue
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
