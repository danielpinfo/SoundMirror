import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import WordInput from '../components/practice/WordInput';
import LanguageSelector from '../components/practice/LanguageSelector';
import PracticeWordsList from '../components/practice/PracticeWordsList';
import { useTranslations } from '../components/practice/translations';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Activity, TrendingUp, Sparkles, History, BookA, GraduationCap } from "lucide-react";
import { motion } from "framer-motion";

const PHONEME_BACKEND_BASE_URL = "https://base44-phoneme-backend-production.up.railway.app";

export default function Home() {
  const [selectedLang, setSelectedLang] = useState(() => {
    return localStorage.getItem('soundmirror_lang') || 'en';
  });
  const [languages, setLanguages] = useState([]);
  const [isLoadingLangs, setIsLoadingLangs] = useState(true);
  const [langpackStatus, setLangpackStatus] = useState(null);
  const [isLoadingLangpack, setIsLoadingLangpack] = useState(false);

  // All 10 supported languages as fallback
  const DEFAULT_LANGUAGES = [
    { code: 'en', nativeName: 'English', englishName: 'English', flag: '🇺🇸' },
    { code: 'es', nativeName: 'Español', englishName: 'Spanish', flag: '🇪🇸' },
    { code: 'fr', nativeName: 'Français', englishName: 'French', flag: '🇫🇷' },
    { code: 'de', nativeName: 'Deutsch', englishName: 'German', flag: '🇩🇪' },
    { code: 'it', nativeName: 'Italiano', englishName: 'Italian', flag: '🇮🇹' },
    { code: 'pt', nativeName: 'Português', englishName: 'Portuguese', flag: '🇧🇷' },
    { code: 'zh', nativeName: '中文', englishName: 'Chinese', flag: '🇨🇳' },
    { code: 'ja', nativeName: '日本語', englishName: 'Japanese', flag: '🇯🇵' },
    { code: 'ar', nativeName: 'العربية', englishName: 'Arabic', flag: '🇸🇦' },
    { code: 'hi', nativeName: 'हिन्दी', englishName: 'Hindi', flag: '🇮🇳' },
  ];

  // Use default languages directly (includes all 9 languages including Arabic)
  useEffect(() => {
    setLanguages(DEFAULT_LANGUAGES);
    setIsLoadingLangs(false);
  }, []);



  const handleLanguageChange = (langCode) => {
    setSelectedLang(langCode);
    localStorage.setItem('soundmirror_lang', langCode);
  };

  const t = useTranslations(selectedLang);

  const handleWordSelect = (word) => {
    window.location.href = createPageUrl('Practice') + `?word=${encodeURIComponent(word)}`;
  };

  const loadLangpack = async () => {
    setIsLoadingLangpack(true);
    try {
      const response = await fetch(`https://soundmirror-phoneme-audio.s3.us-east-1.amazonaws.com/langpacks/base44.langpack.${selectedLang}.v1.json`);
      const data = await response.json();
      
      // Normalize tokens before saving
      if (data.mapping && Array.isArray(data.mapping.items)) {
        data.mapping.items.forEach(item => {
          item.token_norm = (item.token || "").trim().toLowerCase().normalize("NFC");
        });
      }
      
      localStorage.setItem('base44.langpack.current', JSON.stringify(data));
      localStorage.setItem('base44.langpack.lang', selectedLang);
      
      setLangpackStatus({
        loaded: true,
        schema: data.schema,
        lang: data.lang,
        version: data.version,
        itemsCount: data?.mapping?.items?.length || 0
      });
    } catch (err) {
      console.error('Failed to load langpack:', err);
      setLangpackStatus({ loaded: false, error: err.message });
    } finally {
      setIsLoadingLangpack(false);
    }
  };

  const clearLangpack = () => {
    localStorage.removeItem('base44.langpack.current');
    localStorage.removeItem('base44.langpack.lang');
    setLangpackStatus(null);
  };

  useEffect(() => {
    const stored = localStorage.getItem('base44.langpack.current');
    const storedLang = localStorage.getItem('base44.langpack.lang');
    if (stored && storedLang) {
      try {
        const data = JSON.parse(stored);
        setLangpackStatus({
          loaded: true,
          schema: data.schema,
          lang: data.lang,
          version: data.version,
          itemsCount: data?.mapping?.items?.length || 0
        });
      } catch (err) {
        console.error('Failed to parse stored langpack:', err);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950">
      <div className="container mx-auto px-2 py-2 md:px-6 md:py-8 max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-2 md:mb-8 space-y-1 md:space-y-3"
        >
          <div className="flex items-center justify-center gap-1.5 md:gap-3 mb-1 md:mb-4">
            <div className="w-8 h-8 md:w-12 md:h-12 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
              <Activity className="h-4 w-4 md:h-6 md:w-6 text-white" />
            </div>
            <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              SoundMirror
            </h1>
          </div>

          {/* Language Selector */}
          <div className="flex justify-center mb-1 gap-2 items-end">
            <LanguageSelector
              languages={languages}
              selectedLang={selectedLang}
              onLanguageChange={handleLanguageChange}
              isLoading={isLoadingLangs}
            />
            <Button
              onClick={loadLangpack}
              disabled={isLoadingLangpack}
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white h-8"
            >
              {isLoadingLangpack ? 'Loading...' : 'Load Langpack'}
            </Button>
          </div>
          
          {/* Langpack Status */}
          {langpackStatus && (
            <Card className="mt-2 p-2 bg-slate-800/90 border border-slate-600 max-w-md mx-auto">
              <div className="flex justify-between items-start">
                <div className="text-xs space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`font-bold ${langpackStatus.loaded ? 'text-green-400' : 'text-red-400'}`}>
                      {langpackStatus.loaded ? '✓ Loaded OK' : '✗ Failed'}
                    </span>
                  </div>
                  {langpackStatus.loaded && (
                    <>
                      <div className="text-slate-300">
                        <span className="text-slate-400">Schema:</span> <span className="font-mono">{langpackStatus.schema}</span>
                      </div>
                      <div className="text-slate-300">
                        <span className="text-slate-400">Lang:</span> <span className="font-mono">{langpackStatus.lang}</span>
                      </div>
                      <div className="text-slate-300">
                        <span className="text-slate-400">Version:</span> <span className="font-mono">{langpackStatus.version}</span>
                      </div>
                      <div className="text-slate-300">
                        <span className="text-slate-400">Items:</span> <span className="font-mono">{langpackStatus.itemsCount}</span>
                      </div>
                    </>
                  )}
                  {langpackStatus.error && (
                    <div className="text-red-400 text-xs">{langpackStatus.error}</div>
                  )}
                </div>
                <Button
                  onClick={clearLangpack}
                  size="sm"
                  variant="ghost"
                  className="text-red-400 hover:text-red-300 hover:bg-red-950 h-6 text-xs"
                >
                  Clear
                </Button>
              </div>
            </Card>
          )}
          <p className="text-[11px] md:text-sm text-slate-300 leading-tight md:leading-relaxed px-2">
            {t('appTagline')}
          </p>

          {/* Teacher Training Info */}
          <div className="mx-auto mt-1 md:mt-4 p-1.5 md:p-3 rounded-md bg-emerald-900/30 border border-emerald-700/50">
            <p className="text-[10px] md:text-xs text-slate-300 leading-tight md:leading-normal">
              {t('teacherTrainingInfo')}
            </p>
          </div>
        </motion.div>

        {/* Main Word Input Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-2.5 md:p-6 bg-slate-800/90 backdrop-blur border border-slate-700 shadow-xl">
            <div className="mb-1.5 md:mb-4">
              <h2 className="text-lg md:text-xl font-bold text-slate-100">
                {t('whatToPractice')}
              </h2>
            </div>
            <WordInput onWordSelect={handleWordSelect} lang={selectedLang} placeholder={t('typeWord')} />

            {/* Practice Words */}
            <div className="mt-2 md:mt-4 pt-2 md:pt-4 border-t border-slate-600">
              <h3 className="text-[10px] md:text-sm font-semibold text-slate-300 mb-1 md:mb-2">
                {t('suggestedWords')}
              </h3>
              <div className="flex flex-wrap gap-1 md:gap-2">
                {(t('practiceWordsList') || ['hello', 'water', 'apple', 'morning', 'thank you', 'beautiful', 'together', 'adventure', 'wonderful', 'communicate', 'pronunciation', 'opportunity', 'international', 'congratulations']).map((word) => (
                  <Button
                    key={word}
                    onClick={() => handleWordSelect(word)}
                    className="bg-sky-500 hover:bg-sky-600 text-black border-sky-400 transition-all text-[10px] md:text-sm py-0.5 md:py-2 px-2 md:px-4 h-6 md:h-10"
                  >
                    {word}
                  </Button>
                ))}
              </div>
            </div>
            </Card>
            </motion.div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-2"
        >
          <Card className="p-1.5 md:p-6 bg-gradient-to-br from-slate-800 to-indigo-900 border border-slate-700">
            <h3 className="text-sm md:text-xl font-bold text-slate-100 mb-1 md:mb-4 text-center">
              {t('howItWorks')}
            </h3>
            <div className="grid grid-cols-3 gap-1 md:gap-6">
              <div className="text-center">
                <div className="w-5 h-5 md:w-12 md:h-12 rounded bg-blue-600 text-white flex items-center justify-center mx-auto text-xs md:text-xl font-bold">
                  1
                </div>
                <h4 className="font-semibold text-slate-100 text-[9px] md:text-sm leading-tight md:leading-normal mt-0.5 md:mt-2">{t('step1Title')}</h4>
              </div>
              <div className="text-center">
                <div className="w-5 h-5 md:w-12 md:h-12 rounded bg-indigo-600 text-white flex items-center justify-center mx-auto text-xs md:text-xl font-bold">
                  2
                </div>
                <h4 className="font-semibold text-slate-100 text-[9px] md:text-sm leading-tight md:leading-normal mt-0.5 md:mt-2">{t('step2Title')}</h4>
              </div>
              <div className="text-center">
                <div className="w-5 h-5 md:w-12 md:h-12 rounded bg-purple-600 text-white flex items-center justify-center mx-auto text-xs md:text-xl font-bold">
                  3
                </div>
                <h4 className="font-semibold text-slate-100 text-[9px] md:text-sm leading-tight md:leading-normal mt-0.5 md:mt-2">{t('step3Title')}</h4>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Footer Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-2 md:mt-6 grid grid-cols-2 gap-1 md:gap-4"
        >
          <Link to={createPageUrl('LetterPractice')}>
            <Button variant="outline" size="sm" className="w-full gap-0.5 md:gap-2 border-indigo-500 text-indigo-400 hover:bg-indigo-950 text-[10px] md:text-base h-7 md:h-12 px-1 md:px-4">
              <BookA className="h-2.5 w-2.5 md:h-5 md:w-5" />
              {t('practiceLetters')}
            </Button>
          </Link>
          <Link to={createPageUrl('History')}>
            <Button variant="outline" size="sm" className="w-full gap-0.5 md:gap-2 text-[10px] md:text-base h-7 md:h-12 px-1 md:px-4">
              <History className="h-2.5 w-2.5 md:h-5 md:w-5" />
              {t('practiceHistory')}
            </Button>
          </Link>
          <Link to={createPageUrl('Progress')}>
            <Button variant="outline" size="sm" className="w-full gap-0.5 md:gap-2 text-[10px] md:text-base h-7 md:h-12 px-1 md:px-4">
              <TrendingUp className="h-2.5 w-2.5 md:h-5 md:w-5" />
              {t('viewProgress')}
            </Button>
          </Link>
          <Link to={createPageUrl('TeachLetters')}>
            <Button variant="outline" size="sm" className="w-full gap-0.5 md:gap-2 border-emerald-500 text-emerald-400 hover:bg-emerald-950 text-[10px] md:text-base h-7 md:h-12 px-1 md:px-4">
              <GraduationCap className="h-2.5 w-2.5 md:h-5 md:w-5" />
              {t('teacherTraining')}
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}