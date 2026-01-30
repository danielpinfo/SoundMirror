import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { LANGUAGES } from '../lib/constants';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Globe } from 'lucide-react';

export const LanguageSelector = ({ className = '' }) => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className={`flex items-center gap-2 ${className}`} data-testid="language-selector">
      <Globe className="w-5 h-5 text-slate-500" />
      <Select value={language} onValueChange={setLanguage}>
        <SelectTrigger 
          className="w-[180px] bg-white border-slate-200 rounded-xl"
          data-testid="language-select-trigger"
        >
          <SelectValue placeholder={t('choose_language')} />
        </SelectTrigger>
        <SelectContent>
          {LANGUAGES.map((lang) => (
            <SelectItem 
              key={lang.code} 
              value={lang.code}
              data-testid={`language-option-${lang.code}`}
            >
              <span className="flex items-center gap-2">
                <span>{lang.native}</span>
                <span className="text-slate-400 text-sm">({lang.name})</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default LanguageSelector;
