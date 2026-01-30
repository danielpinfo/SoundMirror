import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { DEFAULT_PRACTICE_WORDS } from '../lib/constants';
import LanguageSelector from '../components/LanguageSelector';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { BookOpen, History, Bug, Type, ArrowRight } from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const [practiceInput, setPracticeInput] = useState('');
  
  const practiceWords = DEFAULT_PRACTICE_WORDS[language] || DEFAULT_PRACTICE_WORDS.english;
  const quickWords = practiceWords.slice(0, 8);
  const phrases = practiceWords.slice(8, 10);

  const handlePractice = (word) => {
    navigate(`/word-practice?word=${encodeURIComponent(word)}`);
  };

  const handleInputSubmit = (e) => {
    e.preventDefault();
    if (practiceInput.trim()) {
      handlePractice(practiceInput.trim());
    }
  };

  return (
    <div 
      data-testid="home-page" 
      className="min-h-screen bg-gradient-to-b from-slate-50 to-white"
    >
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-white/20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 
            className="text-2xl font-bold tracking-tight"
            style={{
              fontFamily: 'Manrope, sans-serif',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            SoundMirror
          </h1>
          <LanguageSelector />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Visual Speech Training
          </h2>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed">
            {t('instructions')}
          </p>
        </div>

        {/* Practice Input */}
        <Card className="mb-8 shadow-lg border-slate-100 card-hover">
          <CardContent className="p-6">
            <form onSubmit={handleInputSubmit} className="flex gap-3">
              <Input
                type="text"
                placeholder={t('input_practice')}
                value={practiceInput}
                onChange={(e) => setPracticeInput(e.target.value)}
                className="flex-1 h-12 rounded-xl border-slate-200 bg-slate-50 focus:bg-white text-lg"
                data-testid="practice-input"
              />
              <Button 
                type="submit" 
                className="h-12 px-6 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold"
                disabled={!practiceInput.trim()}
                data-testid="practice-submit-btn"
              >
                <span className="hidden sm:inline mr-2">{t('play')}</span>
                <ArrowRight className="w-5 h-5" />
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Quick Practice Words */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
            Quick Practice
          </h3>
          <div className="flex flex-wrap gap-3">
            {quickWords.map((word, index) => (
              <Button
                key={index}
                variant="outline"
                onClick={() => handlePractice(word)}
                className="rounded-full px-5 py-2 bg-white border-slate-200 hover:border-sky-300 hover:bg-sky-50 text-slate-700 hover:text-sky-700 font-medium card-hover"
                data-testid={`quick-word-${index}`}
              >
                {word}
              </Button>
            ))}
          </div>
        </div>

        {/* Phrase Practice */}
        {phrases.length > 0 && (
          <div className="mb-12">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
              Phrases
            </h3>
            <div className="flex flex-wrap gap-3">
              {phrases.map((phrase, index) => (
                <Button
                  key={index}
                  variant="outline"
                  onClick={() => handlePractice(phrase)}
                  className="rounded-full px-6 py-2 bg-gradient-to-r from-sky-50 to-white border-sky-200 hover:border-sky-300 text-sky-700 font-medium card-hover"
                  data-testid={`phrase-${index}`}
                >
                  {phrase}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card 
            className="cursor-pointer card-hover border-slate-100 group"
            onClick={() => navigate('/letter-practice')}
            data-testid="nav-letter-practice"
          >
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-sky-100 flex items-center justify-center group-hover:bg-sky-600 transition-colors">
                <Type className="w-6 h-6 text-sky-600 group-hover:text-white transition-colors" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-800">{t('letter_practice')}</h4>
                <p className="text-sm text-slate-500">Practice individual sounds</p>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer card-hover border-slate-100 group"
            onClick={() => navigate('/history')}
            data-testid="nav-history"
          >
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-slate-600 transition-colors">
                <History className="w-6 h-6 text-slate-600 group-hover:text-white transition-colors" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-800">{t('history')}</h4>
                <p className="text-sm text-slate-500">View past sessions</p>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer card-hover border-slate-100 group"
            onClick={() => navigate('/bug-report')}
            data-testid="nav-bug-report"
          >
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center group-hover:bg-red-500 transition-colors">
                <Bug className="w-6 h-6 text-red-500 group-hover:text-white transition-colors" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-800">{t('bug_report')}</h4>
                <p className="text-sm text-slate-500">Report an issue</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer Info */}
        <div className="mt-16 text-center text-slate-400 text-sm">
          <p>SoundMirror - Visual Speech Articulation Training</p>
          <p className="mt-1">For deaf education, speech therapy, and language learning</p>
        </div>
      </main>
    </div>
  );
}
