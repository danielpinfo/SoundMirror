import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ALPHABETS } from '../lib/constants';

export const AlphabetKeyboard = ({ 
  selectedKey = '', 
  onKeySelect,
  className = '',
}) => {
  const { language } = useLanguage();
  const alphabet = ALPHABETS[language] || ALPHABETS.english;

  const handleKeyClick = (key) => {
    if (onKeySelect) {
      onKeySelect(key);
    }
  };

  return (
    <div 
      className={`p-4 bg-slate-50 rounded-2xl border border-slate-200 ${className}`}
      data-testid="alphabet-keyboard"
    >
      <div className="flex flex-wrap gap-2 justify-center">
        {alphabet.map((key, index) => (
          <button
            key={`${key}-${index}`}
            onClick={() => handleKeyClick(key)}
            className={`keyboard-key ${selectedKey === key ? 'active' : ''}`}
            data-testid={`keyboard-key-${key}`}
          >
            {key}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AlphabetKeyboard;
