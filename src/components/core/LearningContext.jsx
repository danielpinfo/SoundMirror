import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getLanguageCode } from '../i18n/translations';

// Persistent Learning Context
// Shapes the future UI behavior without changing current flows
// {
//   nativeLanguage,
//   practiceLanguage, // defaults to nativeLanguage
//   mode: 'single' | 'dual' // derived
// }

const STORAGE_KEY = 'soundmirror-learning-context-v1';

const LearningContext = createContext(null);

function readStoredContext() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || typeof data !== 'object') return null;
    if (!data.nativeLanguage || !data.practiceLanguage) return null;
    return data;
  } catch {
    return null;
  }
}

function writeStoredContext(ctx) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      nativeLanguage: ctx.nativeLanguage,
      practiceLanguage: ctx.practiceLanguage,
    }));
  } catch {}
}

function computeMode(nativeLanguage, practiceLanguage) {
  return nativeLanguage === practiceLanguage ? 'single' : 'dual';
}

export function LearningContextProvider({ children }) {
  // Bootstrap from storage OR fall back to current app language
  const initialNative = getLanguageCode();
  const stored = readStoredContext();

  const [nativeLanguage, setNativeLanguageState] = useState(
    stored?.nativeLanguage || initialNative || 'en'
  );
  const [practiceLanguage, setPracticeLanguageState] = useState(
    stored?.practiceLanguage || stored?.nativeLanguage || initialNative || 'en'
  );

  // Persist on change (single source of truth stored compactly)
  useEffect(() => {
    writeStoredContext({ nativeLanguage, practiceLanguage });
  }, [nativeLanguage, practiceLanguage]);

  const setNativeLanguage = (code) => {
    setNativeLanguageState(code);
  };

  const setPracticeLanguage = (code) => {
    setPracticeLanguageState(code);
  };

  const setBothLanguages = (code) => {
    setNativeLanguageState(code);
    setPracticeLanguageState(code);
  };

  const value = useMemo(() => ({
    nativeLanguage,
    practiceLanguage,
    mode: computeMode(nativeLanguage, practiceLanguage),
    setNativeLanguage,
    setPracticeLanguage,
    setBothLanguages,
  }), [nativeLanguage, practiceLanguage]);

  return (
    <LearningContext.Provider value={value}>{children}</LearningContext.Provider>
  );
}

export function useLearningContext() {
  const ctx = useContext(LearningContext);
  if (!ctx) throw new Error('useLearningContext must be used within LearningContextProvider');
  return ctx;
}