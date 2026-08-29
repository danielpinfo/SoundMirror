import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';

import {
  initialize,
  setActivePack as loaderSetActivePack,
  getInstalledPacks,
} from './PluginLoader';

import { useVoicePreference } from './VoicePreference';
import { useLearningContext } from './LearningContext';

const PluginContext = createContext(null);

function normalizeLanguage(language) {
  return String(language || '')
    .trim()
    .toLowerCase()
    .replace(/-/g, '_');
}

function packIdForLanguage(language) {
  const normalized = normalizeLanguage(language);

const PACK_MAP = {
  // English
  en: 'en_us',
  en_us: 'en_us',
  english: 'en_us',

  // Spanish
  es: 'es',
  es_es: 'es',
  es_us: 'es',
  spanish: 'es',

  // Portuguese
  pt: 'pt',
  pt_br: 'pt',
  pt_pt: 'pt',
  portuguese: 'pt',
  portuguese_br: 'pt',
  portuguese_brazil: 'pt',

  // Italian
  it: 'it',
  it_it: 'it',
  italian: 'it',

  // French
  fr: 'fr',
  fr_fr: 'fr',
  french: 'fr',

  // German
  de: 'de',
  de_de: 'de',
  german: 'de',

  // Arabic
  ar: 'ar',
  ar_sa: 'ar',
  arabic: 'ar',

  // Hindi
  hi: 'hi',
  hi_in: 'hi',
  hindi: 'hi',

  // Japanese
  ja: 'ja',
  ja_jp: 'ja',
  japanese: 'ja',

  // Chinese
  zh: 'zh',
  zh_cn: 'zh',
  chinese: 'zh',
  mandarin: 'zh',
};

  return PACK_MAP[normalized] ?? 'en_us';
}

export function PluginProvider({ children }) {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { voice } = useVoicePreference();
  const { practiceLanguage } = useLearningContext();

  const [activeLanguage, setActiveLanguage] = useState(practiceLanguage);
  const [activePack, setActivePack] = useState(packIdForLanguage(practiceLanguage));

  useEffect(() => {
    let mounted = true;

    async function boot() {
      const packId = packIdForLanguage(practiceLanguage);

      setActiveLanguage(practiceLanguage);
      setActivePack(packId);
      setLoading(true);
      setError(null);

      try {
        await initialize();
        const cfg = await loaderSetActivePack(packId, voice);

        if (!mounted) return;
        setConfig(cfg);
      } catch (err) {
        console.error('[PluginProvider] init error:', err);
        if (!mounted) return;
        setError(err?.message ?? 'Failed to initialize language pack');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    boot();

    return () => {
      mounted = false;
    };
  }, []);  

  useEffect(() => {
    let mounted = true;

    async function switchPack() {
      const packId = packIdForLanguage(practiceLanguage);

      setActiveLanguage(practiceLanguage);
      setActivePack(packId);
      setLoading(true);
      setError(null);

      try {
        const cfg = await loaderSetActivePack(packId, voice);
        if (!mounted) return;
        setConfig(cfg);
      } catch (err) {
        console.error('[PluginProvider] switch error:', err);
        if (!mounted) return;
        setError(err?.message ?? 'Failed to switch language pack');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    switchPack();

    return () => {
      mounted = false;
    };
  }, [practiceLanguage, voice]);

  const activatePack = useCallback(
    async (packId) => {
      setLoading(true);
      setConfig(null);
      setError(null);

      try {
        const newConfig = await loaderSetActivePack(packId, voice);
        setActivePack(packId);
        setConfig(newConfig);
        return newConfig;
      } catch (err) {
        console.error('[PluginProvider] activation error:', err);
        setError(err?.message ?? 'Failed to activate pack');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [voice]
  );

  const activePracticePack = useMemo(() => {
    if (!config || config.packId !== activePack) return null;
    return config;
  }, [config, activePack]);

  const contextValue = {
    ...(activePracticePack ?? {}),
    activePracticePack,
    activePracticePackId: activePack,
    activePracticeLanguage: activeLanguage,
    speechReady: !!activePracticePack,
    isLanguageLoaded: activePracticePack !== null,
    activePackId: activePack,
    installedPacks: getInstalledPacks(),
    isLoading: loading,
    activatePack,
  };

  if (error) {
    return (
      <div
        style={{
          background: '#000',
          color: '#f87171',
          padding: 32,
          fontFamily: 'monospace',
        }}
      >
        <strong>[PluginLoader Error]</strong> {error}
      </div>
    );
  }

  return (
    <PluginContext.Provider value={contextValue}>
      {children}
    </PluginContext.Provider>
  );
}

export function usePlugin() {
  const ctx = useContext(PluginContext);
  if (!ctx) throw new Error('usePlugin must be used inside PluginProvider');
  return ctx;
}