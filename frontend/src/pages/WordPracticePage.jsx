import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import DualHeadAnimation from '../components/DualHeadAnimation';
import RecordingPanel from '../components/RecordingPanel';
import AlphabetKeyboard from '../components/AlphabetKeyboard';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { savePracticeSession } from '../lib/db';
import { Home, Type, History, ArrowRight, X } from 'lucide-react';

export default function WordPracticePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language, t } = useLanguage();
  const [practiceWord, setPracticeWord] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [showKeyboard, setShowKeyboard] = useState(false);
  const animationRef = useRef(null);

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
          <div className="flex items-center justify-between">
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

            {/* Word Input in Header */}
            <form onSubmit={handleInputSubmit} className="flex gap-2 items-center">
              <Input
                type="text"
                placeholder={t('input_practice')}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-64 h-10 rounded-xl border-blue-500/30 bg-[#0f2847] text-white placeholder:text-blue-300/50 focus:border-blue-400"
                data-testid="word-input"
              />
              <Button 
                type="submit" 
                size="sm"
                className="h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold"
                disabled={!inputValue.trim()}
                data-testid="word-submit-btn"
              >
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-4 max-w-7xl">
        {/* Current Word Display */}
        {practiceWord && (
          <div className="text-center mb-4">
            <p className="text-sm text-blue-300 uppercase tracking-wider mb-2">Practicing</p>
            <div className="inline-block px-8 py-3 bg-blue-600 text-white text-2xl font-bold rounded-2xl shadow-lg shadow-blue-500/30">
              {practiceWord}
            </div>
          </div>
        )}

        {/* Large Animation Section */}
        <div className="bg-cobalt-surface rounded-2xl border border-blue-500/20 shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Reference Animation</h3>
          <div className="max-w-4xl mx-auto">
            <DualHeadAnimation
              ref={animationRef}
              target={practiceWord}
              showControls={true}
              autoPlay={false}
            />
          </div>
        </div>

        {/* Recording Panel and Keyboard Toggle */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recording Panel */}
          <div className="bg-cobalt-surface rounded-2xl border border-blue-500/20 shadow-sm p-5">
            <h3 className="text-lg font-semibold text-white mb-4">Your Practice</h3>
            {practiceWord ? (
              <RecordingPanel
                target={practiceWord}
                onGradingComplete={handleGradingComplete}
              />
            ) : (
              <div className="aspect-video bg-[#0a1628] rounded-xl flex items-center justify-center border border-blue-500/20">
                <p className="text-blue-300 text-center px-4">
                  Enter a word or sentence above to begin
                </p>
              </div>
            )}
          </div>

          {/* Keyboard Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-blue-300 uppercase tracking-wider">
                On-Screen Keyboard
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowKeyboard(!showKeyboard)}
                className="text-blue-300 hover:text-white"
              >
                {showKeyboard ? <X className="w-4 h-4" /> : 'Show'}
              </Button>
            </div>
            {showKeyboard && (
              <AlphabetKeyboard
                onKeySelect={handleKeySelect}
              />
            )}
            {!showKeyboard && (
              <div 
                className="bg-cobalt-surface rounded-2xl border border-blue-500/20 p-8 text-center cursor-pointer hover:bg-[#1a3a5c] transition-colors"
                onClick={() => setShowKeyboard(true)}
              >
                <p className="text-blue-300">Click to show on-screen keyboard</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
