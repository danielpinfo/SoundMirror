import React, { createContext, useContext, useState, useEffect } from 'react';
import { getLanguageSetting, setLanguageSetting } from '../lib/db';
import { getTranslations } from '../lib/api';

// Default translations (English)
const defaultTranslations = {
  home: "Home",
  letter_practice: "Letter Practice",
  word_practice: "Word Practice",
  history: "History Library",
  bug_report: "Report a Bug",
  choose_language: "Choose Language",
  instructions: "1) Choose or type in a word, 2) Watch the animation 3) Record yourself 4) Practice and improve",
  input_practice: "Input a Practice Word or Sentence",
  begin_practice: "Begin Practice",
  play: "Play",
  stop: "Stop",
  retry: "Retry",
  replay_attempt: "Replay Your Attempt",
  visual_grade: "Visual Grade",
  audio_grade: "Audio Grade",
  target: "Target",
  detected: "Detected",
  suggestions: "Suggestions for Improvement",
  return_home: "Return Home",
};

const LanguageContext = createContext({
  language: 'english',
  setLanguage: () => {},
  translations: defaultTranslations,
  isRTL: false,
});

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState('english');
  const [translations, setTranslations] = useState(defaultTranslations);
  const [isRTL, setIsRTL] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load saved language on mount
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLanguage = await getLanguageSetting();
        if (savedLanguage) {
          await changeLanguage(savedLanguage);
        }
      } catch (error) {
        console.error('Error loading language:', error);
      } finally {
        setLoading(false);
      }
    };
    loadLanguage();
  }, []);

  const changeLanguage = async (newLanguage) => {
    try {
      // Fetch translations from API
      const newTranslations = await getTranslations(newLanguage);
      setTranslations(newTranslations);
      setLanguageState(newLanguage);
      setIsRTL(newLanguage === 'arabic');
      
      // Save to local storage
      await setLanguageSetting(newLanguage);
      
      // Update document direction
      document.documentElement.dir = newLanguage === 'arabic' ? 'rtl' : 'ltr';
    } catch (error) {
      console.error('Error changing language:', error);
      // Fallback to default translations
      setTranslations(defaultTranslations);
    }
  };

  const setLanguage = (newLanguage) => {
    changeLanguage(newLanguage);
  };

  // Helper function to get translation with fallback
  const t = (key) => {
    return translations[key] || defaultTranslations[key] || key;
  };

  if (loading) {
    return null; // Or a loading spinner
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, translations, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;
