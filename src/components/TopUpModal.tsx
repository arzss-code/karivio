'use client';

import { useState, useEffect } from 'react';
import Script from 'next/script';
import { Gem, X, Check } from 'lucide-react';

export default function TopUpModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-topup', handleOpen);
    return () => window.removeEventListener('open-topup', handleOpen);
  }, []);

  const closeModal = () => setIsOpen(false);

  const handleBuy = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId: 'starter' })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 401) {
          alert('Please login first to top up credits.');
          window.location.reload();
          return;
        }
        throw new Error(data.error || 'Payment initialization failed');
      }

      const token = data.token;
      
      // @ts-ignore
      window.snap.pay(token, {
        onSuccess: function(result: any) {
          alert("Payment success! Your credits will be updated automatically.");
          closeModal();
        },
        onPending: function(result: any) {
          alert("Waiting for your payment!");
          closeModal();
        },
        onError: function(result: any) {
          alert("Payment failed!");
          closeModal();
        },
        onClose: function() {
          // customer closed the popup
        }
      });
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <Script src="https://app.sandbox.midtrans.com/snap/snap.js" data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY} strategy="lazyOnload" />
      
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4">
        <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm transition-opacity" onClick={closeModal}></div>
        
        <div className="relative w-full max-w-md transform rounded-3xl bg-white p-7 shadow-2xl transition-all animate-scale-in border border-neutral-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-neutral-900 flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-900">
                <Gem className="h-4 w-4" />
              </div>
              Top Up Credits
            </h3>
            <button onClick={closeModal} className="rounded-full p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border-2 border-neutral-200 bg-neutral-50 p-5 relative overflow-hidden">
              <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-neutral-200/30"></div>
              <div className="relative z-10">
                <div className="text-sm font-semibold text-neutral-500 mb-1">Starter Pack</div>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-extrabold text-neutral-900">Rp 10.000</span>
                </div>
                <ul className="text-sm font-medium text-neutral-700 space-y-2.5 mb-6">
                  <li className="flex items-center gap-2.5">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-900 text-white">
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </div>
                    Get 10 AI Generations
                  </li>
                  <li className="flex items-center gap-2.5">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-900 text-white">
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </div>
                    Unlock ATS Templates
                  </li>
                </ul>
                
                <button 
                  onClick={handleBuy} 
                  disabled={isLoading}
                  className="w-full rounded-xl bg-neutral-900 py-3 text-sm font-semibold text-white shadow-sm hover:bg-neutral-800 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100"
                >
                  {!isLoading ? (
                    <span>Buy with QRIS / GoPay</span>
                  ) : (
                    <svg className="h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
          
          <p className="mt-5 text-center text-xs font-medium text-neutral-400">
            Secure payment processed by Midtrans
          </p>
        </div>
      </div>
    </>
  );
}
