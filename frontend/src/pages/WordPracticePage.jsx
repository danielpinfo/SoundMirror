import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import DualHeadAnimation from '../components/DualHeadAnimation';
import RecordingPanel from '../components/RecordingPanel';
import AlphabetKeyboard from '../components/AlphabetKeyboard';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { savePracticeSession } from '../lib/db';
import { Home, Type, History, ArrowRight } from 'lucide-react';

export default function WordPracticePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language, t } = useLanguage();
  const [practiceWord, setPracticeWord] = useState('');
  const [inputValue, setInputValue] = useState('');
  const animationRef = useRef(null);

  // Get word from URL params
  useEffect(() => {
    const wordParam = searchParams.get('word');
    if (wordParam) {
      setPracticeWord(wordParam);
      setInputValue(wordParam);
    }
  }, [searchParams]);

  const handleInputSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setPracticeWord(inputValue.trim());
    }
  };

  const handleKeySelect = useCallback((key) => {
    setInputValue((prev) => prev + key);
  }, []);

  const handleGradingComplete = useCallback(async (grading) => {
    // Save session to local storage
    try {
      await savePracticeSession({
        sessionType: 'word',
        target: practiceWord,
        language,
        visualScore: grading.visualScore,
        audioScore: grading.audioScore,
        phonemeDetected: grading.phonemeDetected,
        suggestions: grading.suggestions,
      });
    } catch (error) {
      console.error('Error saving session:', error);
    }
  }, [practiceWord, language]);

  return (
    <div 
      data-testid="word-practice-page" 
      className="min-h-screen bg-cobalt-gradient"
    >
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-blue-500/20">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="rounded-full text-blue-200 hover:text-white hover:bg-blue-600/30"
              data-testid="nav-home-btn"
            >
              <Home className="w-4 h-4 mr-1" />
              {t('return_home')}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/letter-practice')}
              className="rounded-full text-blue-200 hover:text-white hover:bg-blue-600/30"
              data-testid="nav-letter-practice-btn"
            >
              <Type className="w-4 h-4 mr-1" />
              {t('letter_practice')}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/history')}
              className="rounded-full text-blue-200 hover:text-white hover:bg-blue-600/30"
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
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-6" style={{ fontFamily: 'Manrope, sans-serif' }}>
          {t('word_practice')}
        </h1>

        {/* Word Input */}
        <div className="mb-6">
          <form onSubmit={handleInputSubmit} className="flex gap-3 max-w-2xl">
            <Input
              type="text"
              placeholder={t('input_practice')}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 h-12 rounded-xl border-blue-500/30 bg-[#0f2847] text-white placeholder:text-blue-300/50 focus:border-blue-400 text-lg"
              data-testid="word-input"
            />
            <Button 
              type="submit" 
              className="h-12 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold"
              disabled={!inputValue.trim()}
              data-testid="word-submit-btn"
            >
              <span className="hidden sm:inline mr-2">{t('play')}</span>
              <ArrowRight className="w-5 h-5" />
            </Button>
          </form>
        </div>

        {/* Current Word Display */}
        {practiceWord && (
          <div className="text-center mb-6">
            <p className="text-sm text-blue-300 uppercase tracking-wider mb-2">Practicing</p>
            <div className="inline-block px-8 py-4 bg-blue-600 text-white text-2xl font-bold rounded-2xl shadow-lg shadow-blue-500/30">
              {practiceWord}
            </div>
          </div>
        )}

        {/* Main Practice Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Animation Panel */}
          <div className="bg-cobalt-surface rounded-2xl border border-blue-500/20 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Reference Animation</h3>
            <DualHeadAnimation
              ref={animationRef}
              target={practiceWord}
              showControls={true}
              autoPlay={false}
            />
          </div>

          {/* Recording Panel */}
          <div className="bg-cobalt-surface rounded-2xl border border-blue-500/20 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Your Practice</h3>
            {practiceWord ? (
              <RecordingPanel
                target={practiceWord}
                onGradingComplete={handleGradingComplete}
              />
            ) : (
              <div className="aspect-video bg-[#0f2847] rounded-xl flex items-center justify-center border border-blue-500/20">
                <p className="text-blue-300 text-center px-4">
                  Enter a word or sentence above to begin practice
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Keyboard for typing */}
        <div className="mt-8">
          <h3 className="text-sm font-semibold text-blue-300 uppercase tracking-wider mb-4">
            On-Screen Keyboard
          </h3>
          <AlphabetKeyboard
            onKeySelect={handleKeySelect}
          />
        </div>
      </main>
    </div>
  );
}
