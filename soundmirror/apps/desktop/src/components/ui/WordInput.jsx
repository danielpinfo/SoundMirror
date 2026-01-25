/**
 * WordInput - Text input for entering words/phrases to practice
 * Shows phoneme preview as user types
 */

import React, { useState, useCallback } from 'react';
import { Search, ArrowRight, Loader2 } from 'lucide-react';

export default function WordInput({
  onSubmit = () => {},
  placeholder = 'Type a word or phrase...',
  suggestions = [],
  isLoading = false,
  lang = 'en',
}) {
  const [value, setValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = useCallback((e) => {
    e?.preventDefault();
    if (value.trim() && !isLoading) {
      onSubmit(value.trim());
    }
  }, [value, isLoading, onSubmit]);

  const handleSuggestionClick = useCallback((word) => {
    setValue(word);
    onSubmit(word);
  }, [onSubmit]);

  return (
    <div className="w-full max-w-xl">
      {/* Input Form */}
      <form onSubmit={handleSubmit} className="relative">
        <div 
          className={`
            flex items-center gap-3 px-5 py-4 
            bg-slate-900/80 backdrop-blur-lg rounded-2xl
            border-2 transition-all duration-200
            ${isFocused 
              ? 'border-sky-500/50 shadow-[0_0_20px_rgba(56,189,248,0.15)]' 
              : 'border-slate-700/50 hover:border-slate-600'
            }
          `}
        >
          <Search className="w-5 h-5 text-slate-500 flex-shrink-0" />
          
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            disabled={isLoading}
            className="flex-1 bg-transparent text-slate-100 text-lg placeholder:text-slate-500 
                       focus:outline-none disabled:opacity-50"
            data-testid="word-input"
            autoComplete="off"
            spellCheck="false"
          />

          <button
            type="submit"
            disabled={!value.trim() || isLoading}
            className={`
              w-10 h-10 rounded-xl flex items-center justify-center
              transition-all duration-200 focus-ring
              ${value.trim() && !isLoading
                ? 'bg-sky-500 text-slate-900 hover:bg-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.3)]' 
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }
            `}
            data-testid="word-submit"
            aria-label="Practice this word"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <ArrowRight className="w-5 h-5" />
            )}
          </button>
        </div>
      </form>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="mt-4">
          <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">
            Suggested Words
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((word) => (
              <button
                key={word}
                onClick={() => handleSuggestionClick(word)}
                className="px-4 py-2 rounded-xl text-sm font-medium
                           bg-slate-800/60 text-slate-300 border border-slate-700/50
                           hover:border-sky-500/50 hover:text-sky-300 hover:bg-sky-500/10
                           transition-all duration-200 focus-ring"
                data-testid={`suggestion-${word}`}
              >
                {word}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
