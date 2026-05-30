'use client';

import React, { useState } from 'react';
import { Sparkles, Check, X, Loader2, RefreshCw } from 'lucide-react';

interface RewriteSuggestionProps {
  sentence: string;
  context: string;
  onApply: (oldText: string, newText: string) => void;
  onDismiss: () => void;
}

export default function RewriteSuggestion({ sentence, context, onApply, onDismiss }: RewriteSuggestionProps) {
  const [isRewriting, setIsRewriting] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRewrite = async () => {
    setIsRewriting(true);
    setError(null);
    try {
      const res = await fetch('/api/ats-rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sentence, context }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to rewrite');
      setSuggestion(data.rewrittenSentence);
    } catch (err: any) {
      setError(err.message || 'Error generating suggestion.');
    } finally {
      setIsRewriting(false);
    }
  };

  return (
    <div className="absolute z-10 mt-2 w-80 rounded-xl border border-neutral-200 bg-white shadow-xl shadow-neutral-900/5 overflow-hidden animate-fade-in">
      <div className="flex items-center justify-between border-b border-neutral-100 bg-neutral-50 px-3 py-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-600">
          <Sparkles className="h-3.5 w-3.5" />
          AI Smart Rewrite
        </div>
        <button onClick={onDismiss} className="text-neutral-400 hover:text-neutral-600 transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="p-3 text-xs text-neutral-600 space-y-3">
        {!suggestion && !isRewriting && (
          <div>
            <p className="mb-3">This sentence lacks strong action verbs or quantitative metrics. Want to make it stand out?</p>
            <button
              onClick={handleRewrite}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-neutral-900 px-3 py-2 font-medium text-white hover:bg-neutral-800 transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Generate Suggestion
            </button>
          </div>
        )}

        {isRewriting && (
          <div className="flex flex-col items-center justify-center py-4 text-blue-500">
            <Loader2 className="h-5 w-5 animate-spin mb-2" />
            <span className="font-medium">Crafting STAR bullet point...</span>
          </div>
        )}

        {error && (
          <div className="text-red-500 font-medium">
            {error}
          </div>
        )}

        {suggestion && (
          <div className="space-y-3 animate-fade-in">
            <div className="rounded-lg bg-blue-50/50 p-2.5 border border-blue-100 text-blue-900 font-medium leading-relaxed">
              {suggestion}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onApply(sentence, suggestion)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 font-medium text-white hover:bg-blue-700 transition-colors"
              >
                <Check className="h-3.5 w-3.5" />
                Apply Change
              </button>
              <button
                onClick={handleRewrite}
                className="inline-flex items-center justify-center rounded-lg border border-neutral-200 bg-white px-3 py-2 text-neutral-600 hover:bg-neutral-50 transition-colors"
                title="Regenerate"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
