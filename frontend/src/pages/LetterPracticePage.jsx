import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import DualHeadAnimation from '../components/DualHeadAnimation';
import RecordingPanel from '../components/RecordingPanel';
import AlphabetKeyboard from '../components/AlphabetKeyboard';
import { Button } from '../components/ui/button';
import { savePracticeSession } from '../lib/db';
import { Home, BookOpen, History } from 'lucide-react';

export default function LetterPracticePage() {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const [selectedLetter, setSelectedLetter] = useState('');
  const animationRef = useRef(null);

  const handleKeySelect = useCallback((key) => {
    setSelectedLetter(key);
  }, []);

  const handleGradingComplete = useCallback(async (grading) => {
    // Save session to local storage
    try {
      await savePracticeSession({
        sessionType: 'letter',
        target: selectedLetter,
        language,
        visualScore: grading.visualScore,
        audioScore: grading.audioScore,
        phonemeDetected: grading.phonemeDetected,
        suggestions: grading.suggestions,
      });
    } catch (error) {
      console.error('Error saving session:', error);
    }
  }, [selectedLetter, language]);

  return (
    <div 
      data-testid="letter-practice-page" 
      className="min-h-screen bg-gradient-to-b from-slate-50 to-white"
    >
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-white/20">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="rounded-full"
              data-testid="nav-home-btn"
            >
              <Home className="w-4 h-4 mr-1" />
              {t('return_home')}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/word-practice')}
              className="rounded-full"
              data-testid="nav-word-practice-btn"
            >
              <BookOpen className="w-4 h-4 mr-1" />
              {t('word_practice')}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/history')}
              className="rounded-full"
              data-testid="nav-history-btn"
            >
              <History className="w-4 h-4 mr-1" />
              {t('history')}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 max-w-6xl">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-6" style={{ fontFamily: 'Manrope, sans-serif' }}>
          {t('letter_practice')}
        </h1>

        {/* Alphabet Keyboard */}
        <AlphabetKeyboard
          selectedKey={selectedLetter}
          onKeySelect={handleKeySelect}
          className="mb-8"
        />

        {/* Selected Letter Display */}
        {selectedLetter && (
          <div className="text-center mb-6">
            <p className="text-sm text-slate-500 uppercase tracking-wider mb-2">Practicing</p>
            <div className="inline-flex items-center justify-center w-20 h-20 bg-sky-600 text-white text-4xl font-bold rounded-2xl shadow-lg">
              {selectedLetter}
            </div>
          </div>
        )}

        {/* Main Practice Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Animation Panel */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Reference Animation</h3>
            <DualHeadAnimation
              ref={animationRef}
              target={selectedLetter ? `${selectedLetter.toLowerCase()}a` : ''}
              showControls={true}
              autoPlay={false}
            />
          </div>

          {/* Recording Panel */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Your Practice</h3>
            {selectedLetter ? (
              <RecordingPanel
                target={selectedLetter}
                onGradingComplete={handleGradingComplete}
              />
            ) : (
              <div className="aspect-video bg-slate-100 rounded-xl flex items-center justify-center">
                <p className="text-slate-500 text-center px-4">
                  Select a letter from the keyboard above to begin practice
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
