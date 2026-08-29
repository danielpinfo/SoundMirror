/**
 * VoicePreference context — stores selected TTS voice, persisted to localStorage.
 * Available voices (OpenAI TTS):
 *   alloy, echo, fable, onyx (deep male), nova (female), shimmer (female)
 */

import React, { createContext, useContext, useState } from 'react';

const STORAGE_KEY = 'soundmirror_voice';

export const VOICE_OPTIONS = [
  { id: 'onyx',    label: 'Marcus',  gender: 'male',   description: 'Deep & authoritative' },
  { id: 'echo',    label: 'Daniel',  gender: 'male',   description: 'Clear & natural' },
  { id: 'nova',    label: 'Sophia',  gender: 'female', description: 'Warm & expressive' },
  { id: 'shimmer', label: 'Claire',  gender: 'female', description: 'Bright & articulate' },
];

const VoicePreferenceContext = createContext(null);

export function VoicePreferenceProvider({ children }) {
  const [voice, setVoiceState] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) || 'onyx'; } catch { return 'onyx'; }
  });

  const setVoice = (v) => {
    setVoiceState(v);
    try { localStorage.setItem(STORAGE_KEY, v); } catch {}
  };

  return (
    <VoicePreferenceContext.Provider value={{ voice, setVoice, voiceOptions: VOICE_OPTIONS }}>
      {children}
    </VoicePreferenceContext.Provider>
  );
}

export function useVoicePreference() {
  const ctx = useContext(VoicePreferenceContext);
  if (!ctx) throw new Error('useVoicePreference() must be used inside <VoicePreferenceProvider>.');
  return ctx;
}