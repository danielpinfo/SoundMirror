/**
 * LanguageSelector - Dropdown for selecting practice language
 * Supports 10 languages including Arabic
 */

import React, { useState } from 'react';
import { ChevronDown, Check, Globe } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
];

export default function LanguageSelector({
  selectedLang = 'en',
  onLanguageChange = () => {},
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  
  const selectedLanguage = LANGUAGES.find(l => l.code === selectedLang) || LANGUAGES[0];

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          flex items-center gap-3 px-4 py-2.5 rounded-xl
          bg-slate-800/60 border border-slate-700/50
          hover:border-slate-600 transition-all duration-200
          focus-ring min-w-[180px]
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        data-testid="language-selector"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="text-xl">{selectedLanguage.flag}</span>
        <div className="flex-1 text-left">
          <div className="text-sm font-medium text-slate-200">{selectedLanguage.name}</div>
          <div className="text-xs text-slate-500">{selectedLanguage.nativeName}</div>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div 
            className="absolute top-full left-0 mt-2 w-full z-20 py-2 
                       bg-slate-900/95 backdrop-blur-xl border border-slate-700 
                       rounded-xl shadow-xl animate-scale-in"
            role="listbox"
          >
            {LANGUAGES.map((lang) => {
              const isSelected = lang.code === selectedLang;
              return (
                <button
                  key={lang.code}
                  onClick={() => {
                    onLanguageChange(lang.code);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-2.5 text-left
                    hover:bg-slate-800 transition-colors
                    ${isSelected ? 'bg-sky-500/10' : ''}
                  `}
                  role="option"
                  aria-selected={isSelected}
                  data-testid={`lang-option-${lang.code}`}
                >
                  <span className="text-xl">{lang.flag}</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-slate-200">{lang.name}</div>
                    <div className="text-xs text-slate-500">{lang.nativeName}</div>
                  </div>
                  {isSelected && (
                    <Check className="w-4 h-4 text-sky-400" />
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export { LANGUAGES };
