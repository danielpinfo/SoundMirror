import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { DEFAULT_PRACTICE_WORDS } from '../lib/constants';
import LanguageSelector from '../components/LanguageSelector';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { BookOpen, History, Bug, Type, ArrowRight, FileText, Stethoscope } from 'lucide-react';

const LOGO_URL = 'https://customer-assets.emergentagent.com/job_articlearn/artifacts/q4s66aiu_LOGO.png';

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
      className="min-h-screen bg-cobalt-gradient"
    >
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-blue-500/20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <img 
            src={LOGO_URL}
            alt="SoundMirror"
            className="h-10 md:h-12"
          />
          <LanguageSelector />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Visual Speech Training
          </h2>
          <p className="text-blue-200 text-lg max-w-2xl mx-auto leading-relaxed">
            {t('instructions')}
          </p>
        </div>

        {/* Practice Input */}
        <Card className="mb-8 shadow-lg bg-cobalt-surface card-hover border-blue-500/20">
          <CardContent className="p-6">
            <form onSubmit={handleInputSubmit} className="flex gap-3">
              <Input
                type="text"
                placeholder={t('input_practice')}
                value={practiceInput}
                onChange={(e) => setPracticeInput(e.target.value)}
                className="flex-1 h-12 rounded-xl border-blue-500/30 bg-[#0f2847] text-white placeholder:text-blue-300/50 focus:border-blue-400 text-lg"
                data-testid="practice-input"
              />
              <Button 
                type="submit" 
                className="h-12 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold"
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
          <h3 className="text-sm font-semibold text-blue-300 uppercase tracking-wider mb-4">
            Quick Practice
          </h3>
          <div className="flex flex-wrap gap-3">
            {quickWords.map((word, index) => (
              <Button
                key={index}
                variant="outline"
                onClick={() => handlePractice(word)}
                className="rounded-full px-5 py-2 bg-[#1e4976]/50 border-blue-500/30 hover:border-blue-400 hover:bg-blue-600/30 text-blue-200 hover:text-white font-medium card-hover"
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
            <h3 className="text-sm font-semibold text-blue-300 uppercase tracking-wider mb-4">
              Phrases
            </h3>
            <div className="flex flex-wrap gap-3">
              {phrases.map((phrase, index) => (
                <Button
                  key={index}
                  variant="outline"
                  onClick={() => handlePractice(phrase)}
                  className="rounded-full px-6 py-2 bg-blue-600/20 border-blue-400/40 hover:border-blue-300 text-blue-200 hover:text-white font-medium card-hover"
                  data-testid={`phrase-${index}`}
                >
                  {phrase}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card 
            className="cursor-pointer card-hover bg-cobalt-surface border-blue-500/20 group"
            onClick={() => navigate('/letter-practice')}
            data-testid="nav-letter-practice"
          >
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-600/30 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                <Type className="w-6 h-6 text-blue-300 group-hover:text-white transition-colors" />
              </div>
              <div>
                <h4 className="font-semibold text-white">{t('letter_practice')}</h4>
                <p className="text-sm text-blue-300">Practice individual sounds</p>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer card-hover bg-cobalt-surface border-blue-500/20 group"
            onClick={() => navigate('/history')}
            data-testid="nav-history"
          >
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-600/30 flex items-center justify-center group-hover:bg-slate-500 transition-colors">
                <History className="w-6 h-6 text-slate-300 group-hover:text-white transition-colors" />
              </div>
              <div>
                <h4 className="font-semibold text-white">{t('history')}</h4>
                <p className="text-sm text-blue-300">View past sessions</p>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer card-hover bg-gradient-to-br from-purple-600/20 to-blue-600/20 border-purple-500/30 group"
            onClick={() => navigate('/reports')}
            data-testid="nav-reports"
          >
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-600/30 flex items-center justify-center group-hover:bg-purple-600 transition-colors">
                <Stethoscope className="w-6 h-6 text-purple-300 group-hover:text-white transition-colors" />
              </div>
              <div>
                <h4 className="font-semibold text-white">My Reports</h4>
                <p className="text-sm text-purple-300">Progress analysis</p>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer card-hover bg-cobalt-surface border-blue-500/20 group"
            onClick={() => navigate('/bug-report')}
            data-testid="nav-bug-report"
          >
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center group-hover:bg-red-500 transition-colors">
                <Bug className="w-6 h-6 text-red-400 group-hover:text-white transition-colors" />
              </div>
              <div>
                <h4 className="font-semibold text-white">{t('bug_report')}</h4>
                <p className="text-sm text-blue-300">Report an issue</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer Info */}
        <div className="mt-16 text-center text-blue-400/60 text-sm">
          <p>SoundMirror - Visual Speech Articulation Training</p>
          <p className="mt-1">For deaf education, speech therapy, and language learning</p>
        </div>
      </main>
    </div>
  );
}
