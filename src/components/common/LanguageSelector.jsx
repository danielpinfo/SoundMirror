import React, { useMemo } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { useLearningContext } from '../core/LearningContext';
import { translations } from '../i18n/translations';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const FALLBACK_LANGUAGES = {
  en: 'English',
  es: 'Español',
};

export default function LanguageSelector({ large = false }) {
  const { uiLanguage, setUiLanguage } = useLanguage();
  const { mode, setNativeLanguage, setBothLanguages } = useLearningContext();

  const languageOptions = useMemo(() => {
    const fromActiveUi = translations?.[uiLanguage]?.languages;
    const fromEnglish = translations?.en?.languages;

    if (fromActiveUi && Object.keys(fromActiveUi).length > 0) {
      return fromActiveUi;
    }

    if (fromEnglish && Object.keys(fromEnglish).length > 0) {
      return fromEnglish;
    }

    return FALLBACK_LANGUAGES;
  }, [uiLanguage]);

  const safeValue = languageOptions[uiLanguage] ? uiLanguage : 'en';

  const handleLanguageChange = (value) => {
    setUiLanguage(value);

    if (mode === 'single') {
      setBothLanguages(value);
    } else {
      setNativeLanguage(value);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <Select value={safeValue} onValueChange={handleLanguageChange}>
        <SelectTrigger
          className={`${
            large ? 'w-64 text-xl py-6' : 'w-40'
          } bg-white/10 border-silver text-white hover:bg-white/20`}
        >
          <SelectValue placeholder="Select language" />
        </SelectTrigger>

        <SelectContent
          className="border-silver"
          style={{ background: '#00bcd4', color: '#0a3d6b' }}
        >
          {Object.entries(languageOptions).map(([code, name]) => (
            <SelectItem
              key={code}
              value={code}
              className="font-bold"
              style={{ color: '#0a3d6b' }}
            >
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}