/**
 * VoicePicker — lets users choose their preferred TTS voice on the Home screen.
 */

import React from 'react';
import { useVoicePreference } from '../core/VoicePreference';
import { useLanguage } from '../i18n/LanguageContext';

const CYAN   = '#00bcd4';
const COBALT = '#0a3d6b';

// Maps voice id to translation key
const VOICE_DESC_KEY = { onyx: 'marcus', echo: 'daniel', nova: 'sophia', shimmer: 'claire' };

export default function VoicePicker() {
  const { voice, setVoice, voiceOptions } = useVoicePreference();
  const { t } = useLanguage();

  return (
    <div className="w-full max-w-sm mx-auto">
      <p className="text-xs font-bold tracking-widest mb-3 text-center" style={{ color: CYAN }}>
        {t('home.chooseVoice')}
      </p>
      <div className="grid grid-cols-2 gap-2">
        {voiceOptions.map((opt) => {
          const active = voice === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => setVoice(opt.id)}
              className="flex flex-col items-center py-2 px-3 rounded-lg transition-all hover:brightness-110 active:scale-95"
              style={{
                background: active ? CYAN : 'rgba(0,188,212,0.1)',
                border: `2px solid ${active ? '#f5c518' : 'rgba(0,188,212,0.4)'}`,
                color: active ? COBALT : CYAN,
              }}
            >
              <span className="text-sm font-bold">{opt.label}</span>
              <span className="text-xs opacity-80" style={{ color: active ? COBALT : '#a0c4d8' }}>
                {t(`home.voiceDescriptions.${VOICE_DESC_KEY[opt.id]}`) || opt.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}