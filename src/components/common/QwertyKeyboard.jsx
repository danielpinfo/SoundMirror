import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { useLearningContext } from '../core/LearningContext';
import { usePlugin } from '../core/PluginContext';
import NonLatinKeyboard from './NonLatinKeyboard';

// Legacy non-Latin fallbacks remain for packs that have not yet moved their
// layouts behind the pack contract. Pack-owned layouts take precedence.
const LEGACY_NON_LATIN_LANGS = ['zh', 'ja', 'ar'];

const ROWS = [
  ['Q','W','E','R','T','Y','U','I','O','P'],
  ['A','S','D','F','G','H','J','K','L'],
  ['Z','X','C','V','B','N','M','⌫'],
];

export default function QwertyKeyboard({ onKey, align = 'center' }) {
  const { t } = useLanguage();
  const { practiceLanguage } = useLearningContext();
  const { activePracticePack } = usePlugin();
  const alignClass = align === 'left' ? 'items-start' : 'items-center';
  const rowJustify = align === 'left' ? 'justify-start' : 'justify-center';

  const packKeyboardLayout = activePracticePack?.getKeyboardLayout?.() ?? null;

  if (packKeyboardLayout || LEGACY_NON_LATIN_LANGS.includes(practiceLanguage)) {
    return (
      <NonLatinKeyboard
        onKey={onKey}
        language={practiceLanguage}
        layout={packKeyboardLayout}
      />
    );
  }

  const packRows = activePracticePack?.getKeyboardRows?.();
  const keyboardRows = Array.isArray(packRows) && packRows.length > 0
    ? packRows
    : ROWS;

  return (
    <div className={`flex flex-col ${alignClass} gap-1.5 w-fit`}>
      <p
        className="text-xs font-bold tracking-widest mb-2 w-full text-center"
        style={{ color: '#00bcd4' }}
      >
        {t('practice.customEntries')}
      </p>

      {keyboardRows.map((row, ri) => (
        <div key={ri} className={`flex gap-1.5 ${rowJustify} flex-wrap`}>
          {row.map((key) => (
            <button
              key={key}
              onClick={() => onKey(key)}
              className="font-bold text-lg md:text-xl rounded-md transition-all active:scale-95 hover:brightness-110"
              style={{
                background: '#00bcd4',
                color: '#0a3d6b',
                border: '1.5px solid #f5c518',
                minWidth: key === '⌫' ? '52px' : '36px',
                height: '40px',
                padding: '0 6px',
              }}
            >
              {key}
            </button>
          ))}
        </div>
      ))}

      <button
        onClick={() => onKey(' ')}
        className={`font-bold text-lg md:text-xl rounded-md transition-all active:scale-95 hover:brightness-110 mt-0.5 ${
          align === 'left' ? 'self-start' : ''
        }`}
        style={{
          background: '#00bcd4',
          color: '#0a3d6b',
          border: '1.5px solid #f5c518',
          width: '200px',
          height: '40px',
        }}
      >
        {t('practice.space')}
      </button>
    </div>
  );
}
