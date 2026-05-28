'use client';

import { useState, useEffect } from 'react';
import Script from 'next/script';

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
          alert("Payment success! Your credits will be updated shortly.");
          closeModal();
          setTimeout(() => window.location.reload(), 2000);
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
        <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm transition-opacity" onClick={closeModal}></div>
        
        <div className="relative w-full max-w-md transform rounded-2xl bg-white p-6 shadow-xl transition-all animate-scale-in">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
              <span>💎</span> Top Up Credits
            </h3>
            <button onClick={closeModal} className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 transition-colors">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border-2 border-blue-100 bg-blue-50 p-4 relative overflow-hidden">
              <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-blue-200/50"></div>
              <div className="relative z-10">
                <div className="text-sm font-semibold text-blue-900 mb-1">Starter Pack</div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-2xl font-bold text-neutral-900">Rp 10.000</span>
                </div>
                <ul className="text-sm text-neutral-700 space-y-1 mb-4">
                  <li className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-[var(--color-success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    Get 10 AI Generations
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-[var(--color-success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    Unlock ATS Templates
                  </li>
                </ul>
                
                <button 
                  onClick={handleBuy} 
                  disabled={isLoading}
                  className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {!isLoading ? (
                    <span>Buy with QRIS / GoPay</span>
                  ) : (
                    <svg className="h-4 w-4 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
          
          <p className="mt-4 text-center text-xs text-[var(--color-text-muted)]">
            Secure payment processed by Midtrans
          </p>
        </div>
      </div>
    </>
  );
}
