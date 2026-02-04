import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import DualHeadAnimation from '../components/DualHeadAnimation';
import RecordingPanel from '../components/RecordingPanel';
import AlphabetKeyboard from '../components/AlphabetKeyboard';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { savePracticeSession } from '../lib/db';
import { Home, Type, History, ArrowRight } from 'lucide-react';

// Quick Practice - Single words only (8 words)
const QUICK_PRACTICE_WORDS = {
  english: ['Hello', 'Yes', 'No', 'Please', 'Water', 'Food', 'Good', 'Help'],
  spanish: ['Hola', 'Sí', 'No', 'Agua', 'Comida', 'Bien', 'Ayuda', 'Gracias'],
  italian: ['Ciao', 'Sì', 'No', 'Acqua', 'Cibo', 'Bene', 'Aiuto', 'Grazie'],
  portuguese: ['Olá', 'Sim', 'Não', 'Água', 'Comida', 'Bem', 'Ajuda', 'Obrigado'],
  german: ['Hallo', 'Ja', 'Nein', 'Wasser', 'Essen', 'Gut', 'Hilfe', 'Danke'],
  french: ['Bonjour', 'Oui', 'Non', 'Eau', 'Nourriture', 'Bien', 'Aide', 'Merci'],
  japanese: ['こんにちは', 'はい', 'いいえ', '水', '食べ物', '良い', '助けて', 'ありがとう'],
  chinese: ['你好', '是', '不', '水', '食物', '好', '帮助', '谢谢'],
  hindi: ['नमस्ते', 'हाँ', 'नहीं', 'पानी', 'खाना', 'अच्छा', 'मदद', 'धन्यवाद'],
  arabic: ['مرحبا', 'نعم', 'لا', 'ماء', 'طعام', 'جيد', 'مساعدة', 'شكرا'],
};

// Phrases - Multi-word phrases only
const PRACTICE_PHRASES = {
  english: ['Thank you', "I'm fine", 'Good morning', 'How are you', 'Nice to meet you', 'See you later'],
  spanish: ['Muchas gracias', 'Estoy bien', 'Buenos días', 'Cómo estás', 'Mucho gusto', 'Hasta luego'],
  italian: ['Molte grazie', 'Sto bene', 'Buon giorno', 'Come stai', 'Piacere di conoscerti', 'A dopo'],
  portuguese: ['Muito obrigado', 'Estou bem', 'Bom dia', 'Como vai', 'Prazer em conhecê-lo', 'Até logo'],
  german: ['Vielen Dank', 'Mir geht es gut', 'Guten Morgen', 'Wie geht es dir', 'Freut mich', 'Bis später'],
  french: ['Merci beaucoup', 'Je vais bien', 'Bonjour', 'Comment allez-vous', 'Enchanté', 'À plus tard'],
  japanese: ['ありがとうございます', '元気です', 'おはようございます', 'お元気ですか', 'はじめまして', 'また後で'],
  chinese: ['非常感谢', '我很好', '早上好', '你好吗', '很高兴认识你', '回头见'],
  hindi: ['बहुत धन्यवाद', 'मैं ठीक हूँ', 'सुप्रभात', 'आप कैसे हैं', 'आपसे मिलकर अच्छा लगा', 'फिर मिलेंगे'],
  arabic: ['شكرا جزيلا', 'أنا بخير', 'صباح الخير', 'كيف حالك', 'سعيد بلقائك', 'أراك لاحقا'],
};

export default function WordPracticePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language, t } = useLanguage();
  const [practiceWord, setPracticeWord] = useState('');
  const [inputValue, setInputValue] = useState('');
  const animationRef = useRef(null);

  const quickWords = QUICK_PRACTICE_WORDS[language] || QUICK_PRACTICE_WORDS.english;
  const phrases = PRACTICE_PHRASES[language] || PRACTICE_PHRASES.english;

  // Cobalt blue button style with bright gold text
  const cobaltButtonStyle = "rounded-full px-4 py-1.5 bg-[#0047AB] hover:bg-[#003d91] border border-[#0047AB] text-[#FFD700] font-medium text-sm shadow-sm hover:shadow transition-all";

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

  const handleQuickPractice = (word) => {
    setPracticeWord(word);
    setInputValue(word);
  };

  const handleKeySelect = useCallback((key) => {
    setInputValue((prev) => prev + key);
  }, []);

  // Animation complete handler - animation already resets itself internally
  const handleAnimationComplete = useCallback(() => {
    // Animation has completed and auto-reset - no action needed
    console.log('Animation completed for:', practiceWord);
  }, [practiceWord]);

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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-4 max-w-7xl">
        {/* Page Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-6 text-center" style={{ fontFamily: 'Manrope, sans-serif' }}>
          Word Practice
        </h1>

        {/* Practice Input Section */}
        <Card className="mb-6 shadow-lg bg-cobalt-surface border-blue-500/20">
          <CardContent className="p-4">
            <form onSubmit={handleInputSubmit} className="flex gap-3 mb-4">
              <Input
                type="text"
                placeholder={t('input_practice')}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1 h-11 rounded-full border-2 border-[#0047AB] bg-[#0047AB]/20 text-[#FFD700] placeholder:text-[#FFD700]/50 focus:border-[#FFD700] focus:bg-[#0047AB]/30 font-semibold px-5"
                style={{ caretColor: '#FFD700' }}
                data-testid="word-input"
              />
              <Button 
                type="submit" 
                className="h-11 px-5 rounded-full bg-[#0047AB] hover:bg-[#003d91] border-2 border-[#0047AB] text-[#FFD700] font-semibold"
                disabled={!inputValue.trim()}
                data-testid="word-submit-btn"
              >
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
            
            {/* Quick Practice Words */}
            <div className="mb-3">
              <p className="text-xs text-blue-400 uppercase tracking-wider mb-2">Quick Practice</p>
              <div className="flex flex-wrap gap-2">
                {quickWords.map((word, index) => (
                  <Button
                    key={index}
                    onClick={() => handleQuickPractice(word)}
                    className={`${cobaltButtonStyle} text-lg`}
                    data-testid={`quick-word-${index}`}
                  >
                    {word}
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Phrases */}
            <div>
              <p className="text-xs text-blue-400 uppercase tracking-wider mb-2">Phrases</p>
              <div className="flex flex-wrap gap-2">
                {phrases.map((phrase, index) => (
                  <Button
                    key={index}
                    onClick={() => handleQuickPractice(phrase)}
                    className={`${cobaltButtonStyle} text-lg`}
                    data-testid={`phrase-${index}`}
                  >
                    {phrase}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Word Display */}
        {practiceWord && (
          <div className="text-center mb-4">
            <p className="text-sm text-blue-300 uppercase tracking-wider mb-2">Practicing</p>
            <div className="inline-block px-8 py-3 bg-[#0047AB] text-[#FFD700] text-2xl font-bold rounded-2xl shadow-lg">
              {practiceWord}
            </div>
          </div>
        )}

        {/* Animation Section - No "Reference Animation" heading, no Front/Side labels */}
        <div className="bg-cobalt-surface rounded-2xl border border-blue-500/20 shadow-sm p-6 mb-6">
          <div className="max-w-4xl mx-auto">
            <DualHeadAnimation
              ref={animationRef}
              target={practiceWord}
              mode="word"
              showControls={true}
              autoPlay={false}
              onAnimationComplete={handleAnimationComplete}
              hideViewLabels={true}
            />
          </div>
        </div>

        {/* Recording Panel and Keyboard - Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recording Panel - Camera, Mouth Tracking, and Grading all enabled */}
          <div className="bg-cobalt-surface rounded-2xl border border-blue-500/20 shadow-sm p-5">
            <h3 className="text-lg font-semibold text-white mb-4">Your Practice</h3>
            {practiceWord ? (
              <RecordingPanel
                target={practiceWord}
                language={language}
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

          {/* Keyboard Section - Always visible */}
          <div>
            <h3 className="text-sm font-semibold text-blue-300 uppercase tracking-wider mb-3">
              On-Screen Keyboard
            </h3>
            <AlphabetKeyboard
              onKeySelect={handleKeySelect}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
