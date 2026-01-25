/**
 * Home Page - Main entry point for SoundMirror
 * Word input, language selector, quick practice suggestions
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Sparkles, Mic2, BookA } from 'lucide-react';
import WordInput from '../components/ui/WordInput';
import LanguageSelector from '../components/ui/LanguageSelector';

// Suggested words by language
const SUGGESTIONS = {
  en: ['hello', 'water', 'beautiful', 'pronunciation', 'opportunity'],
  es: ['hola', 'agua', 'hermoso', 'comunicación', 'oportunidad'],
  fr: ['bonjour', 'eau', 'magnifique', 'prononciation', 'opportunité'],
  de: ['hallo', 'wasser', 'schön', 'aussprache', 'gelegenheit'],
  it: ['ciao', 'acqua', 'bellissimo', 'pronuncia', 'opportunità'],
  pt: ['olá', 'água', 'bonito', 'pronúncia', 'oportunidade'],
  zh: ['你好', '水', '美丽', '发音', '机会'],
  ja: ['こんにちは', '水', '美しい', '発音', '機会'],
  ar: ['مرحبا', 'ماء', 'جميل', 'نطق', 'فرصة'],
  hi: ['नमस्ते', 'पानी', 'सुंदर', 'उच्चारण', 'अवसर'],
};

export default function Home() {
  const navigate = useNavigate();
  const [selectedLang, setSelectedLang] = useState(() => {
    return localStorage.getItem('soundmirror_lang') || 'en';
  });
  const [isLoading, setIsLoading] = useState(false);

  // Save language preference
  useEffect(() => {
    localStorage.setItem('soundmirror_lang', selectedLang);
  }, [selectedLang]);

  const handleWordSubmit = (word) => {
    setIsLoading(true);
    // Navigate to practice page with word and language
    navigate(`/practice?word=${encodeURIComponent(word)}&lang=${selectedLang}`);
  };

  const suggestions = SUGGESTIONS[selectedLang] || SUGGESTIONS.en;

  return (
    <div className="min-h-screen p-8 lg:p-12">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div 
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-400 
                         flex items-center justify-center shadow-lg"
              style={{ boxShadow: '0 0 40px rgba(56, 189, 248, 0.3)' }}
            >
              <Activity className="w-8 h-8 text-slate-900" />
            </div>
            <h1 className="text-5xl font-bold text-gradient-primary font-[Manrope]">
              SoundMirror
            </h1>
          </div>
          
          <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            See the sound. Master the speech.
            <br />
            <span className="text-slate-500">
              Precise articulation visualization for pronunciation learning.
            </span>
          </p>
        </div>

        {/* Language & Input Section */}
        <div className="glass-card p-8 mb-8 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 mb-8">
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-slate-100 mb-2">
                What would you like to practice?
              </h2>
              <p className="text-slate-400">
                Enter any word or phrase to see how it's pronounced.
              </p>
            </div>
            <LanguageSelector
              selectedLang={selectedLang}
              onLanguageChange={setSelectedLang}
            />
          </div>

          <WordInput
            onSubmit={handleWordSubmit}
            suggestions={suggestions}
            isLoading={isLoading}
            lang={selectedLang}
            placeholder="Type a word or phrase..."
          />
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <button
            onClick={() => navigate('/letters')}
            className="glass-card p-6 text-left group hover:border-indigo-500/50 transition-all duration-200"
            data-testid="quick-letters"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center
                             group-hover:bg-indigo-500/30 transition-colors">
                <BookA className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-100">Practice Letters</h3>
                <p className="text-sm text-slate-400">Learn individual phoneme articulations</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate('/history')}
            className="glass-card p-6 text-left group hover:border-emerald-500/50 transition-all duration-200"
            data-testid="quick-progress"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center
                             group-hover:bg-emerald-500/30 transition-colors">
                <Sparkles className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-100">Your Progress</h3>
                <p className="text-sm text-slate-400">View practice history and improvements</p>
              </div>
            </div>
          </button>
        </div>

        {/* How It Works */}
        <div className="mt-12 glass-card p-8 animate-slide-up" style={{ animationDelay: '300ms' }}>
          <h3 className="text-xl font-semibold text-slate-100 mb-6 text-center">
            How SoundMirror Works
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-sky-500/20 flex items-center justify-center mx-auto mb-3
                             text-sky-400 font-bold text-lg">
                1
              </div>
              <h4 className="font-semibold text-slate-200 mb-1">Enter a Word</h4>
              <p className="text-sm text-slate-400">Type any word or phrase you want to practice</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center mx-auto mb-3
                             text-cyan-400 font-bold text-lg">
                2
              </div>
              <h4 className="font-semibold text-slate-200 mb-1">Watch & Listen</h4>
              <p className="text-sm text-slate-400">See precise mouth positions synced with audio</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-3
                             text-emerald-400 font-bold text-lg">
                3
              </div>
              <h4 className="font-semibold text-slate-200 mb-1">Practice & Improve</h4>
              <p className="text-sm text-slate-400">Record yourself and get instant feedback</p>
            </div>
          </div>
        </div>

        {/* Offline Indicator */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full 
                         bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Fully Offline Ready
          </div>
        </div>
      </div>
    </div>
  );
}
