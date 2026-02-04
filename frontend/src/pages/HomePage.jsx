import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import LanguageSelector from '../components/LanguageSelector';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { Type, ArrowRight, Bug, History } from 'lucide-react';

const LOGO_URL = '/assets/LOGO.png';

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

export default function HomePage() {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const [practiceInput, setPracticeInput] = useState('');
  
  const quickWords = QUICK_PRACTICE_WORDS[language] || QUICK_PRACTICE_WORDS.english;
  const phrases = PRACTICE_PHRASES[language] || PRACTICE_PHRASES.english;

  const handlePractice = (word) => {
    navigate(`/word-practice?word=${encodeURIComponent(word)}`);
  };

  const handleInputSubmit = (e) => {
    e.preventDefault();
    if (practiceInput.trim()) {
      handlePractice(practiceInput.trim());
    }
  };

  // Cobalt blue button style with bright gold text
  const cobaltButtonStyle = "rounded-full px-5 py-2 bg-[#0047AB] hover:bg-[#003d91] border-2 border-[#0047AB] text-[#FFD700] font-semibold shadow-md hover:shadow-lg transition-all";
  const cobaltButtonStyleOutline = "rounded-full px-6 py-2 bg-[#0047AB]/80 hover:bg-[#0047AB] border-2 border-[#0047AB] text-[#FFD700] font-semibold shadow-md hover:shadow-lg transition-all";

  return (
    <div 
      data-testid="home-page" 
      className="min-h-screen bg-cobalt-gradient"
    >
      {/* Header - Only language selector */}
      <header className="sticky top-0 z-40 glass border-b border-blue-500/20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-end">
          <LanguageSelector />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Logo - 4X larger at top center */}
        <div className="text-center mb-8">
          <img 
            src={LOGO_URL}
            alt="SoundMirror"
            className="h-40 md:h-48 mx-auto"
          />
        </div>

        {/* Instructions - 3X larger (no Visual Speech Training header) */}
        <div className="text-center mb-12">
          <p className="text-blue-100 text-2xl md:text-3xl max-w-3xl mx-auto leading-relaxed font-medium">
            {t('instructions')}
          </p>
        </div>

        {/* Practice Input - Matching cobalt blue design */}
        <div className="mb-8">
          <form onSubmit={handleInputSubmit} className="flex gap-3">
            <Input
              type="text"
              placeholder={t('input_practice')}
              value={practiceInput}
              onChange={(e) => setPracticeInput(e.target.value)}
              className="flex-1 h-12 rounded-full border-2 border-[#0047AB] bg-[#0047AB]/20 text-[#FFD700] placeholder:text-[#FFD700]/50 focus:border-[#FFD700] focus:bg-[#0047AB]/30 text-lg font-semibold px-6"
              style={{ caretColor: '#FFD700' }}
              data-testid="practice-input"
            />
            <Button 
              type="submit" 
              className={`h-12 px-6 ${cobaltButtonStyle}`}
              disabled={!practiceInput.trim()}
              data-testid="practice-submit-btn"
            >
              <span className="hidden sm:inline mr-2">{t('play')}</span>
              <ArrowRight className="w-5 h-5" />
            </Button>
          </form>
        </div>

        {/* Quick Practice - 8 Single Words */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-blue-300 uppercase tracking-wider mb-4">
            Quick Practice
          </h3>
          <div className="flex flex-wrap gap-3">
            {quickWords.map((word, index) => (
              <Button
                key={index}
                onClick={() => handlePractice(word)}
                className={cobaltButtonStyle}
                data-testid={`quick-word-${index}`}
              >
                {word}
              </Button>
            ))}
          </div>
        </div>

        {/* Phrases - Multi-word phrases */}
        <div className="mb-12">
          <h3 className="text-sm font-semibold text-blue-300 uppercase tracking-wider mb-4">
            Phrases
          </h3>
          <div className="flex flex-wrap gap-3">
            {phrases.map((phrase, index) => (
              <Button
                key={index}
                onClick={() => handlePractice(phrase)}
                className={cobaltButtonStyleOutline}
                data-testid={`phrase-${index}`}
              >
                {phrase}
              </Button>
            ))}
          </div>
        </div>

        {/* Navigation Cards - Only 3 now (Letter Practice, History Library, Bug Report) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card 
            className="cursor-pointer card-hover bg-cobalt-surface border-blue-500/20 group"
            onClick={() => navigate('/letter-practice')}
            data-testid="nav-letter-practice"
          >
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#0047AB]/30 flex items-center justify-center group-hover:bg-[#0047AB] transition-colors">
                <Type className="w-6 h-6 text-[#FFD700] group-hover:text-[#FFD700] transition-colors" />
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
              <div className="w-12 h-12 rounded-xl bg-[#0047AB]/30 flex items-center justify-center group-hover:bg-[#0047AB] transition-colors">
                <History className="w-6 h-6 text-[#FFD700] group-hover:text-[#FFD700] transition-colors" />
              </div>
              <div>
                <h4 className="font-semibold text-white">{t('history')}</h4>
                <p className="text-sm text-blue-300">View progress & sessions</p>
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
