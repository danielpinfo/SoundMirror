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
      className={`p-2 bg-cobalt-surface rounded-xl border border-blue-500/20 ${className}`}
      data-testid="alphabet-keyboard"
    >
      <div className="flex flex-wrap gap-1.5 justify-center">
        {alphabet.map((key, index) => (
          <button
            key={`${key}-${index}`}
            onClick={() => handleKeyClick(key)}
            className={`keyboard-key text-sm px-2 py-1 ${selectedKey === key ? 'active' : ''}`}
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
