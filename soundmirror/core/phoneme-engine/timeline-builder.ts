/**
 * SoundMirror Timeline Builder
 * Converts text → phoneme sequences with timing
 * Works with OS TTS timing events
 */

import { 
  PhonemeTimeline, 
  PhonemeTimelineEntry, 
  getPhonemeFrame, 
  getNeutralFrame,
  PHONEME_FRAME_MAP 
} from './phoneme-map';

// Language-specific grapheme-to-phoneme rules
export interface LanguageRules {
  code: string;
  name: string;
  graphemeToPhoneme: Record<string, string>;
  defaultPhoneme: string;
}

// English grapheme-to-phoneme (simplified)
export const ENGLISH_RULES: LanguageRules = {
  code: 'en',
  name: 'English',
  graphemeToPhoneme: {
    'a': 'a',
    'e': 'ɛ',
    'i': 'i',
    'o': 'o',
    'u': 'u',
    'b': 'p',  // Uses same lip position as p
    'c': 'k',
    'd': 'd',
    'f': 'f',
    'g': 'g',
    'h': 'h',
    'j': 'tʃ',
    'k': 'k',
    'l': 'l',
    'm': 'p',  // Lip closure like p
    'n': 'n',
    'p': 'p',
    'q': 'k',
    'r': 'r',
    's': 's',
    't': 't',
    'v': 'f',  // Same lip position as f
    'w': 'u',  // Rounded like oo
    'x': 'k',
    'y': 'i',
    'z': 's',  // Same mouth as s
    // Digraphs
    'sh': 'ʃ',
    'ch': 'tʃ',
    'th': 'θ',
    'ng': 'ŋ',
    'ee': 'i',
    'oo': 'u',
    'ea': 'i',
    'ai': 'a',
    'ou': 'u',
  },
  defaultPhoneme: '_',
};

// Spanish grapheme-to-phoneme
export const SPANISH_RULES: LanguageRules = {
  code: 'es',
  name: 'Spanish',
  graphemeToPhoneme: {
    'a': 'a',
    'e': 'ɛ',
    'i': 'i',
    'o': 'o',
    'u': 'u',
    'b': 'p',
    'c': 'k',
    'd': 'd',
    'f': 'f',
    'g': 'g',
    'h': '_',  // Silent in Spanish
    'j': 'h',  // Spanish j is like h
    'k': 'k',
    'l': 'l',
    'm': 'p',
    'n': 'n',
    'ñ': 'n',
    'p': 'p',
    'q': 'k',
    'r': 'r',
    's': 's',
    't': 't',
    'v': 'p',
    'w': 'u',
    'x': 'k',
    'y': 'i',
    'z': 's',
    'll': 'i',
    'rr': 'r',
    'ch': 'tʃ',
    'qu': 'k',
  },
  defaultPhoneme: '_',
};

// Arabic grapheme-to-phoneme (simplified Latin transliteration)
export const ARABIC_RULES: LanguageRules = {
  code: 'ar',
  name: 'Arabic',
  graphemeToPhoneme: {
    'a': 'a',
    'i': 'i',
    'u': 'u',
    'b': 'p',
    't': 't',
    'th': 'θ',
    'j': 'tʃ',
    'h': 'h',
    'kh': 'k',
    'd': 'd',
    'dh': 'θ',
    'r': 'r',
    'z': 's',
    's': 's',
    'sh': 'ʃ',
    'f': 'f',
    'q': 'k',
    'k': 'k',
    'l': 'l',
    'm': 'p',
    'n': 'n',
    'w': 'u',
    'y': 'i',
    '\'': 'ʔ',  // Glottal stop
  },
  defaultPhoneme: '_',
};

const LANGUAGE_RULES: Record<string, LanguageRules> = {
  'en': ENGLISH_RULES,
  'es': SPANISH_RULES,
  'ar': ARABIC_RULES,
};

/**
 * Convert text to phoneme sequence using language rules
 */
export function textToPhonemes(text: string, languageCode: string = 'en'): string[] {
  const rules = LANGUAGE_RULES[languageCode] || ENGLISH_RULES;
  const phonemes: string[] = [];
  const lowerText = text.toLowerCase();
  
  let i = 0;
  while (i < lowerText.length) {
    const char = lowerText[i];
    
    // Skip spaces and punctuation - add neutral frame
    if (/[\s.,!?;:'"()-]/.test(char)) {
      if (phonemes.length === 0 || phonemes[phonemes.length - 1] !== '_') {
        phonemes.push('_');
      }
      i++;
      continue;
    }
    
    // Try digraphs first (2-character sequences)
    if (i < lowerText.length - 1) {
      const digraph = lowerText.slice(i, i + 2);
      if (rules.graphemeToPhoneme[digraph]) {
        phonemes.push(rules.graphemeToPhoneme[digraph]);
        i += 2;
        continue;
      }
    }
    
    // Single character
    const phoneme = rules.graphemeToPhoneme[char] || rules.defaultPhoneme;
    phonemes.push(phoneme);
    i++;
  }
  
  return phonemes;
}

/**
 * Build a timeline from phonemes with estimated timing
 * Default: ~100ms per phoneme (adjust based on TTS speed)
 */
export function buildTimeline(
  text: string,
  languageCode: string = 'en',
  phonemeDuration: number = 100  // milliseconds per phoneme
): PhonemeTimeline {
  const phonemes = textToPhonemes(text, languageCode);
  const entries: PhonemeTimelineEntry[] = [];
  
  let currentTime = 0;
  
  for (const phoneme of phonemes) {
    const frameData = getPhonemeFrame(phoneme) || getNeutralFrame();
    
    entries.push({
      phoneme,
      startTime: currentTime,
      endTime: currentTime + phonemeDuration,
      frameStart: frameData.startFrame,
      frameEnd: frameData.endFrame,
    });
    
    currentTime += phonemeDuration;
  }
  
  return {
    text,
    language: languageCode,
    phonemes: entries,
    totalDuration: currentTime,
  };
}

/**
 * Adjust timeline based on actual TTS timing events
 * Called when TTS provides word/phoneme boundary callbacks
 */
export function adjustTimelineFromTTS(
  timeline: PhonemeTimeline,
  wordBoundaries: Array<{ word: string; startTime: number; endTime: number }>
): PhonemeTimeline {
  if (wordBoundaries.length === 0) return timeline;
  
  const adjustedEntries: PhonemeTimelineEntry[] = [];
  let phonemeIndex = 0;
  
  for (const boundary of wordBoundaries) {
    const wordPhonemes = textToPhonemes(boundary.word, timeline.language);
    const wordDuration = boundary.endTime - boundary.startTime;
    const phonemeDuration = wordDuration / wordPhonemes.length;
    
    let wordTime = boundary.startTime;
    
    for (const phoneme of wordPhonemes) {
      const frameData = getPhonemeFrame(phoneme) || getNeutralFrame();
      
      adjustedEntries.push({
        phoneme,
        startTime: wordTime,
        endTime: wordTime + phonemeDuration,
        frameStart: frameData.startFrame,
        frameEnd: frameData.endFrame,
      });
      
      wordTime += phonemeDuration;
      phonemeIndex++;
    }
    
    // Add neutral frame between words
    if (boundary !== wordBoundaries[wordBoundaries.length - 1]) {
      const neutral = getNeutralFrame();
      adjustedEntries.push({
        phoneme: '_',
        startTime: boundary.endTime,
        endTime: boundary.endTime + 50, // 50ms pause between words
        frameStart: neutral.startFrame,
        frameEnd: neutral.endFrame,
      });
    }
  }
  
  return {
    ...timeline,
    phonemes: adjustedEntries,
    totalDuration: adjustedEntries.length > 0 
      ? adjustedEntries[adjustedEntries.length - 1].endTime 
      : 0,
  };
}

/**
 * Get the current frame index for a given playback time
 */
export function getFrameAtTime(timeline: PhonemeTimeline, currentTime: number): {
  frameIndex: number;
  phoneme: string;
  progress: number;
} {
  // Find the active phoneme entry
  const entry = timeline.phonemes.find(
    e => currentTime >= e.startTime && currentTime < e.endTime
  );
  
  if (!entry) {
    // Return neutral if outside timeline
    return { frameIndex: 0, phoneme: '_', progress: 0 };
  }
  
  // Calculate progress within this phoneme
  const duration = entry.endTime - entry.startTime;
  const elapsed = currentTime - entry.startTime;
  const progress = Math.max(0, Math.min(1, elapsed / duration));
  
  // Interpolate frame index
  const frameRange = entry.frameEnd - entry.frameStart;
  const frameIndex = Math.floor(entry.frameStart + progress * frameRange);
  
  return {
    frameIndex,
    phoneme: entry.phoneme,
    progress,
  };
}

/**
 * Get supported languages
 */
export function getSupportedLanguages(): Array<{ code: string; name: string }> {
  return Object.values(LANGUAGE_RULES).map(r => ({ code: r.code, name: r.name }));
}
