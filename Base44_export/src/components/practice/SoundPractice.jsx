import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Volume2, CheckCircle2, XCircle } from "lucide-react";
import { base44 } from '@/api/base44Client';
import UnifiedRecorder from './UnifiedRecorder';
import { speak as speakText } from './base44Speech';
import { useTranslations } from './translations';

const LETTER_TARGETS = {
  // ---------------------------
  // English
  // ---------------------------
  en: {
    A: { ipa: ['æ', 'eɪ', 'ɑː'], base44: [] },
    B: { ipa: ['b'], base44: [] },
    C: { ipa: ['k', 's'], base44: [] },
    D: { ipa: ['d'], base44: [] },
    E: { ipa: ['iː', 'ɛ'], base44: [] },
    F: { ipa: ['f'], base44: [] },
    G: { ipa: ['ɡ', 'dʒ'], base44: [] },
    H: { ipa: ['h'], base44: [] },
    I: { ipa: ['aɪ', 'ɪ'], base44: [] },
    J: { ipa: ['dʒ'], base44: [] },
    K: { ipa: ['k'], base44: [] },
    L: { ipa: ['l'], base44: [] },
    M: { ipa: ['m'], base44: [] },
    N: { ipa: ['n'], base44: [] },
    O: { ipa: ['oʊ', 'ɒ', 'ɑː'], base44: [] },
    P: { ipa: ['p'], base44: [] },
    Q: { ipa: ['kw'], base44: [] },
    R: { ipa: ['ɹ', 'r'], base44: [] },
    S: { ipa: ['s', 'z'], base44: [] },
    T: { ipa: ['t'], base44: [] },
    U: { ipa: ['uː', 'ʌ', 'juː'], base44: [] },
    V: { ipa: ['v'], base44: [] },
    W: { ipa: ['w'], base44: [] },
    X: { ipa: ['ks', 'gz'], base44: [] },
    Y: { ipa: ['j', 'aɪ', 'ɪ'], base44: [] },
    Z: { ipa: ['z', 's'], base44: [] },
  },

  // ---------------------------
  // Spanish
  // ---------------------------
  es: {
    A: { ipa: ['a'], base44: [] },
    B: { ipa: ['b', 'β'], base44: [] },
    C: { ipa: ['c', 'θ', 's'], base44: [] },
    D: { ipa: ['d', 'ð'], base44: [] },
    E: { ipa: ['e'], base44: [] },
    F: { ipa: ['f'], base44: [] },
    G: { ipa: ['g', 'ɣ', 'x'], base44: [] },

    // H is *silent* in Spanish
    H: { ipa: [], base44: [], behavior: 'silent' },

    I: { ipa: ['i'], base44: [] },
    J: { ipa: ['x'], base44: [] },
    K: { ipa: ['k'], base44: [] },
    L: { ipa: ['l'], base44: [] },

    // LL: [ʎ]/[ʝ]/[j] depending on dialect
    LL: { ipa: ['ʎ', 'ʝ', 'j'], base44: [] },

    M: { ipa: ['m'], base44: [] },
    N: { ipa: ['n'], base44: [] },

    // Ñ: palatal nasal
    Ñ: { ipa: ['ɲ'], base44: [] },

    O: { ipa: ['o'], base44: [] },
    P: { ipa: ['p'], base44: [] },
    Q: { ipa: ['k'], base44: [] },
    R: { ipa: ['ɾ', 'r'], base44: [] },
    S: { ipa: ['s'], base44: [] },
    T: { ipa: ['t'], base44: [] },
    U: { ipa: ['u'], base44: [] },
    V: { ipa: ['b', 'β'], base44: [] },
    W: { ipa: ['w'], base44: [] },
    X: { ipa: ['ks', 's', 'x'], base44: [] },
    Y: { ipa: ['i', 'j', 'i'], base44: [] },
    Z: { ipa: ['s', 's'], base44: [] },
  },
};

// Alphabet with phonetic pronunciations and example words
const ALPHABET_SOUNDS = [
  { letter: 'A', phonetic: 'ah', type: 'vowel', example: 'Abre' },
  { letter: 'B', phonetic: 'buh', type: 'consonant', example: 'Burro' },
  { letter: 'C', phonetic: 'cah', type: 'consonant', example: 'Casa' },
  { letter: 'D', phonetic: 'dah', type: 'consonant', example: 'Donde' },
  { letter: 'E', phonetic: 'eh', type: 'vowel', example: 'Elefante' },
  { letter: 'F', phonetic: 'fuh', type: 'consonant', example: 'Flor' },
  { letter: 'G', phonetic: 'guh', type: 'consonant', example: 'Gato' },
  { letter: 'H', phonetic: 'huh', type: 'consonant', example: 'Hombre' },
  { letter: 'I', phonetic: 'ih', type: 'vowel', example: 'Iglesia' },
  { letter: 'J', phonetic: 'juh', type: 'consonant', example: 'Jirafa' },
  { letter: 'K', phonetic: 'kah', type: 'consonant', example: 'Kilo' },
  { letter: 'L', phonetic: 'luh', type: 'consonant', example: 'Luna' },
  { letter: 'M', phonetic: 'muh', type: 'consonant', example: 'Mesa' },
  { letter: 'N', phonetic: 'en', type: 'consonant', example: 'Nunca' },
  { letter: 'Ñ', phonetic: 'nye', type: 'consonant', example: 'Niño' },
  { letter: 'LL', phonetic: 'yeh', type: 'consonant', example: 'Llave' },
  { letter: 'O', phonetic: 'oh', type: 'vowel', example: 'Oso' },
  { letter: 'P', phonetic: 'peh', type: 'consonant', example: 'Perro' },
  { letter: 'Q', phonetic: 'koo', type: 'consonant', example: 'Queso' },
  { letter: 'R', phonetic: 'rr', type: 'consonant', example: 'Raro' },
  { letter: 'S', phonetic: 'seh', type: 'consonant', example: 'Silla' },
  { letter: 'T', phonetic: 'teh', type: 'consonant', example: 'Tigre' },
  { letter: 'U', phonetic: 'oo', type: 'vowel', example: 'Uva' },
  { letter: 'V', phonetic: 'veh', type: 'consonant', example: 'Vaca' },
  { letter: 'W', phonetic: 'wu', type: 'consonant', example: 'Wafle' },
  { letter: 'X', phonetic: 'ks', type: 'consonant', example: 'Xilofono' },
  { letter: 'Y', phonetic: 'i', type: 'consonant', example: 'Yate' },
  { letter: 'Z', phonetic: 'seh-tah', type: 'consonant', example: 'Zorro' },
];

// Spanish *sound-based* hints for letters (not alphabet names)
const SPANISH_LETTER_SOUND_HINTS = {
  A: 'a',
  B: 'ba',
  C: 'ca',     // can refine later for ce/ci
  D: 'da',
  E: 'e',
  F: 'fa',
  G: 'ga',
  H: '(silencio)',
  I: 'i',
  J: 'ha',     // approximated "ja" sound /x/
  K: 'ka',
  L: 'la',
  LL: 'ya',
  M: 'ma',
  N: 'na',
  Ñ: 'nya',
  O: 'o',
  P: 'pa',
  Q: 'ka',
  R: 'ra',
  S: 'sa',
  T: 'ta',
  U: 'u',
  V: 'va',     // or 'ba', depending how you want to teach it
  W: 'wa',
  X: 'ksa',
  Y: 'ya',
  Z: 'sa',     // or 'θa' for Castilian
};

const LANG_SPEECH_CODES = {
  en: 'en-US', es: 'es-ES', fr: 'fr-FR', de: 'de-DE',
  it: 'it-IT', pt: 'pt-BR', zh: 'zh-CN', ja: 'ja-JP'
};

export default function SoundPractice({ sound, targetWord, onBack, onComplete }) {
  // ALL HOOKS MUST BE DECLARED AT THE TOP
  const [selectedSound, setSelectedSound] = useState(sound);
  const [selectedLang, setSelectedLang] = useState(() =>
    typeof window !== 'undefined'
      ? localStorage.getItem('soundmirror_lang') || 'en'
      : 'en'
  );
  const [attempts, setAttempts] = useState([]);
  const [isShowingResult, setIsShowingResult] = useState(false);
  const [currentResult, setCurrentResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [blendshapeHistory, setBlendshapeHistory] = useState([]);

  const t = useTranslations(selectedLang);

  // Handle both formats: {letter, phonetic} from target and {phoneme, score} from problemPhonemes
  const soundLetter = selectedSound?.letter || selectedSound?.phoneme || '';

  // Look up phonetic from ALPHABET_SOUNDS if not provided
  // Now language-aware: Spanish uses sound-based hints instead of alphabet names
  const lookupPhonetic = (letter) => {
    const upper = (letter || '').toUpperCase();

    // If Spanish is active, prefer sound-based hints
    if (String(selectedLang).toLowerCase().startsWith('es')) {
      const hint = SPANISH_LETTER_SOUND_HINTS[upper];
      if (hint) return hint;
    }

    const found = ALPHABET_SOUNDS.find(
      (s) => s.letter.toLowerCase() === upper.toLowerCase()
    );
    return found?.phonetic || letter;
  };

  // Show alphabet picker if no sound selected
  if (!selectedSound || !soundLetter) {
    return (
      <div className="space-y-6">
        <Button
          onClick={onBack}
          variant="ghost"
          className="gap-2 text-slate-300 hover:text-slate-100"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('backToHome')}
        </Button>

        <Card className="border-2 border-indigo-800 bg-gradient-to-br from-slate-800 to-indigo-900">
          <CardHeader>
            <CardTitle className="text-center text-2xl text-slate-100">
              {t('chooseLetterToPractice')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-6 sm:grid-cols-9 gap-2">
              {ALPHABET_SOUNDS.map((s) => (
                <Button
                  key={s.letter}
                  onClick={() => setSelectedSound(s)}
                  variant="outline"
                  className={`h-12 w-12 text-xl font-bold ${
                    s.type === 'vowel'
                      ? 'border-amber-500 text-amber-400 hover:bg-amber-900/50'
                      : 'border-blue-500 text-blue-400 hover:bg-blue-900/50'
                  }`}
                >
                  {s.letter}
                </Button>
              ))}
            </div>
            <div className="flex justify-center gap-6 mt-4 text-sm text-slate-400">
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-amber-500" /> {t('vowels')}
              </span>
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-blue-500" /> {t('consonants')}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Ensure all sound properties are strings
  const safeSound = {
    letter: String(soundLetter),
    phonetic: String(selectedSound.phonetic || lookupPhonetic(soundLetter)),
    example: String(selectedSound.example || targetWord || ''),
    articulationTip: String(selectedSound.articulationTip || ''),
    type: selectedSound.type || 'consonant',
  };

  const speakSound = async () => {
    try {
      await speakText(safeSound.phonetic || safeSound.letter, {
        lang: LANG_SPEECH_CODES[selectedLang] || 'en-US'
      });
    } catch (err) {
      console.warn('Speech failed:', err);
    }
  };

  // 🔊 Core recording handler – now using unified backend shape + LETTER_TARGETS
  const handleRecording = async (audioBlob, blendshapes) => {
    setIsProcessing(true);
    setBlendshapeHistory(blendshapes || []);

    try {
      // ------------------------------------------------------
      // 1) Upload audio to Base44
      // ------------------------------------------------------
      const file = new File([audioBlob], 'recording.wav', { type: 'audio/wav' });
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      console.log('[SoundPractice] Calling getPhonemes with:', file_url);
      const response = await base44.functions.invoke('getPhonemes', {
        audioFileUrl: file_url,
        lang: selectedLang, // use UI language (en/es/etc.)
        targetText: safeSound.letter,
      });

      console.log('[SoundPractice] Raw invoke response:', response);
      const phonemeResult = response.data || response;

      if (phonemeResult.error) {
        throw new Error(phonemeResult.error);
      }

      console.log('[SoundPractice] Backend used:', phonemeResult.backend);
      console.log(
        '[SoundPractice] expected_ipa from backend:',
        phonemeResult.expected_ipa
      );

      // ------------------------------------------------------
      // 2) Raw strings / arrays from backend
      // ------------------------------------------------------
      const rawPhonemeString =
        typeof phonemeResult.phonemes === 'string'
          ? phonemeResult.phonemes
          : Array.isArray(phonemeResult.phoneme_list)
          ? phonemeResult.phoneme_list.join(' ')
          : '';

      const rawPhonemeList = Array.isArray(phonemeResult.phoneme_list)
        ? phonemeResult.phoneme_list
        : rawPhonemeString
        ? rawPhonemeString.split(/\s+/).filter((p) => p.length > 0)
        : [];

      console.log('[SoundPractice] rawPhonemeString:', rawPhonemeString);
      console.log('[SoundPractice] rawPhonemeList:', rawPhonemeList);

      // ------------------------------------------------------
      // 3) IPA + Base44 from backend (preferred channels)
      // ------------------------------------------------------
      const ipaUnitsFromBackend = Array.isArray(phonemeResult.ipa_units)
        ? phonemeResult.ipa_units
        : null;

      const base44UnitsFromBackend = Array.isArray(phonemeResult.base44)
        ? phonemeResult.base44
        : null;

      // Normalize to lowercase, strip length marks
      const detectedIpa = (ipaUnitsFromBackend && ipaUnitsFromBackend.length
        ? ipaUnitsFromBackend
        : rawPhonemeList
      ).map((p) =>
        String(p)
          .toLowerCase()
          .replace(/ː/g, '')
          .trim()
      );

      const detectedBase44 = (base44UnitsFromBackend || []).map((p) =>
        String(p).toLowerCase().trim()
      );

      console.log('[SoundPractice] detectedIpa:', detectedIpa);
      console.log('[SoundPractice] detectedBase44:', detectedBase44);

      // ------------------------------------------------------
      // 4) Look up expected targets from LETTER_TARGETS
      // ------------------------------------------------------
      const baseLang = (selectedLang || 'en').slice(0, 2); // "en-US" -> "en"
      const letterKey = safeSound.letter.toUpperCase();

      const langTargets = LETTER_TARGETS[baseLang] || LETTER_TARGETS.en || {};
      const letterConfig = langTargets[letterKey] || null;

      const expectedIpa = (letterConfig?.ipa || []).map((p) =>
        String(p)
          .toLowerCase()
          .replace(/ː/g, '')
          .trim()
      );
      const expectedBase44 = (letterConfig?.base44 || []).map((p) =>
        String(p).toLowerCase().trim()
      );

      console.log('[SoundPractice] baseLang:', baseLang);
      console.log('[SoundPractice] letterKey:', letterKey);
      console.log('[SoundPractice] expectedIpa:', expectedIpa);
      console.log('[SoundPractice] expectedBase44:', expectedBase44);
      console.log('[SoundPractice] letterConfig:', letterConfig);

      // ------------------------------------------------------
      // 5) Scoring logic – smarter, penalizes extra consonants
      // ------------------------------------------------------
      const isVowelIpa = (symbol) => {
        if (!symbol) return false;
        const s = String(symbol).toLowerCase();
        const vowelCores = [
          'a', 'e', 'i', 'o', 'u',
          'æ', 'ɛ', 'ɪ', 'ʊ', 'ə', 'ɒ', 'ɑ', 'ɔ',
          'eɪ', 'oʊ', 'aɪ', 'aʊ', 'ɔɪ', 'ju'
        ];
        return vowelCores.some((v) => s.includes(v));
      };

      const matchesExpected = (det, expectedList) => {
        const d = String(det).toLowerCase();
        return expectedList.some((exp) => {
          const e = String(exp).toLowerCase();
          return d === e || d.includes(e) || e.includes(d);
        });
      };

      let isCorrect = false;

      // Special case: silent letters (e.g., Spanish H)
      if (letterConfig && letterConfig.behavior === 'silent') {
        const hasAnyPhoneme =
          (detectedIpa && detectedIpa.length && detectedIpa.join('').trim() !== '') ||
          (rawPhonemeString && rawPhonemeString.trim() !== '');
        isCorrect = !hasAnyPhoneme;
      } else {
        const primary = detectedIpa[0] || '';
        const rest = detectedIpa.slice(1);

        const primaryMatch =
          expectedIpa.length > 0 ? matchesExpected(primary, expectedIpa) : false;

        // Penalize unexpected *consonants* after the primary letter
        const unexpectedConsonant = rest.some((sym) => {
          if (!sym) return false;
          // Ignore vowels in the tail (M + A is fine)
          if (isVowelIpa(sym)) return false;
          // Ignore repeats of the same target consonant
          if (expectedIpa.length > 0 && matchesExpected(sym, expectedIpa)) {
            return false;
          }
          // Anything else is an unexpected consonant (like trailing B)
          return true;
        });

        if (primaryMatch && !unexpectedConsonant) {
          // Clean hit: correct letter, no extra wrong consonants
          isCorrect = true;
        } else {
          // Fallback: looser matching (in case of weird segmentation)
          const ipaAnyMatch =
            expectedIpa.length > 0 &&
            detectedIpa.some((det) => matchesExpected(det, expectedIpa));

          const base44Match =
            expectedBase44.length > 0 &&
            detectedBase44.some((det) => matchesExpected(det, expectedBase44));

          isCorrect = ipaAnyMatch || base44Match;
        }
      }

      // ------------------------------------------------------
      // 6) Primary phonetic + *short* "what we heard" for UI
      // ------------------------------------------------------
      const primaryIpa =
        (phonemeResult.dominant && phonemeResult.dominant.ipa) ||
        (detectedIpa && detectedIpa[0]) ||
        '';

      // Build a mirror string from IPA if available
      const ipaString =
        (Array.isArray(phonemeResult.ipa_units) &&
          phonemeResult.ipa_units.length > 0
          ? phonemeResult.ipa_units.join(' ')
          : typeof phonemeResult.ipa === 'string'
          ? phonemeResult.ipa
          : ''
        ) || '';

      // NEW: syllable-level primary, if provided by backend / normalized function
      const primarySyllable =
        (phonemeResult.syllable && phonemeResult.syllable.primary) ||
        phonemeResult.primary ||
        '';

      // Raw debug string (can still be long, for logs)
      const heardTextRaw =
        ipaString ||
        phonemeResult.raw_transcription ||
        rawPhonemeString ||
        '';

      // What we actually SHOW to the user: prefer a short syllable
      const heardTextDisplay =
        primarySyllable ||
        primaryIpa ||
        heardTextRaw ||
        '(nothing detected)';

      console.log('[SoundPractice] ipaString:', ipaString);
      console.log('[SoundPractice] raw_transcription:', phonemeResult.raw_transcription);
      console.log('[SoundPractice] rawPhonemeString:', rawPhonemeString);
      console.log('[SoundPractice] primarySyllable:', primarySyllable);
      console.log('[SoundPractice] heardTextDisplay:', heardTextDisplay);

      const result = {
        correct: isCorrect,
        score: isCorrect ? 1.0 : 0.3,
        heard: heardTextDisplay,     // SHORT, syllable-level view
        heardRaw: heardTextRaw,      // Full debug string if you ever need it
        primary: primarySyllable,    // Syllable (e.g. "wa", "ta", "ña")
        phonetic: primaryIpa,        // First IPA unit
        backend: phonemeResult.backend,
        // canonical "should sound like" IPA from backend (if available)
        expectedIpa: phonemeResult.expected_ipa || null,
        feedback: isCorrect
          ? `Great! That sounded like a proper "${safeSound.letter}" sound.`
          : `We heard "${heardTextDisplay || 'unclear'}" but we're looking for "${
              safeSound.letter
            }" (${safeSound.phonetic}) - ${
              safeSound.articulationTip || 'Try adjusting your tongue position.'
            }`,
      };

      setCurrentResult(result);
      setIsShowingResult(true);
      setAttempts((prev) => [...prev, result]);

      if (result.correct && attempts.filter((a) => a && a.correct).length >= 2) {
        setTimeout(() => onComplete(), 2000);
      }
    } catch (error) {
      console.error('Error analyzing sound:', error);
      const errorMsg = error.message?.includes('Phoneme backend unavailable')
        ? 'Phoneme backend unavailable. Please check the server.'
        : `Failed to analyze: ${error.message}`;
      alert(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  const successfulAttempts = attempts.filter((a) => a && a.correct).length;

  return (
    <div className="space-y-6">
      <Button
        onClick={onBack}
        variant="ghost"
        className="gap-2 text-slate-300 hover:text-slate-100"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('backToHome')}
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Alphabet List - Left Side */}
        <Card className="border border-slate-700 bg-slate-800/50 lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-400">
              {t('chooseLetterToPractice')}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-6 lg:grid-cols-4 gap-1">
              {ALPHABET_SOUNDS.map((s) => (
                <button
                  key={s.letter}
                  onClick={() => {
                    setSelectedSound(s);
                    setAttempts([]);
                    setIsShowingResult(false);
                    setCurrentResult(null);
                  }}
                  className={`h-9 w-9 text-lg font-bold rounded transition-all ${
                    s.letter === safeSound.letter
                      ? 'bg-indigo-600 text-white ring-2 ring-indigo-400'
                      : s.type === 'vowel'
                      ? 'bg-amber-900/30 text-amber-400 hover:bg-amber-800/50'
                      : 'bg-blue-900/30 text-blue-400 hover:bg-blue-800/50'
                  }`}
                >
                  {s.letter}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Practice Area - Right Side */}
        <Card className="border-2 border-indigo-800 bg-gradient-to-br from-slate-800 to-indigo-900 lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-center text-2xl text-slate-100">
              {t('practice')} <span className="text-indigo-400">{safeSound.letter}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Sound Display */}
            <div className="text-center space-y-4">
              <div className="inline-block p-8 bg-slate-700 rounded-3xl shadow-lg border-4 border-indigo-700">
                <span className="text-8xl font-bold text-indigo-400">
                  {safeSound.letter}
                </span>
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-semibold text-slate-200">
                  {t('soundsLike')}: {safeSound.phonetic}
                </p>
                <p className="text-lg text-slate-400">
                  {t('asIn')}{' '}
                  "<span className="font-semibold text-slate-300">
                    {safeSound.example}
                  </span>
                  "
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={speakSound}
                  className="mt-3 gap-2 text-blue-400 border-blue-600 hover:bg-blue-900/50"
                >
                  <Volume2 className="h-4 w-4" />
                  {t('hearIt')}
                </Button>
              </div>
            </div>

            {/* Recording Interface with Camera */}
            <UnifiedRecorder
              targetWord={safeSound.letter}
              targetPhonemes={{ phonetic: safeSound.phonetic, phonemes: [safeSound] }}
              onRecordingComplete={handleRecording}
              isProcessing={isProcessing}
            />

            {/* Result Feedback */}
            {isShowingResult && currentResult && (
              <Card
                className={`border-2 ${
                  currentResult.correct
                    ? 'border-green-600 bg-green-900/50'
                    : 'border-amber-600 bg-amber-900/50'
                }`}
              >
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      {currentResult.correct ? (
                        <CheckCircle2 className="h-8 w-8 text-green-400 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-8 w-8 text-amber-400 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p
                          className={`text-lg font-semibold ${
                            currentResult.correct
                              ? 'text-green-300'
                              : 'text-amber-300'
                          }`}
                        >
                          {currentResult.correct ? t('excellent') : t('notQuiteRight')}
                        </p>

                        {/* Short, syllable-level "what we heard" */}
                        <div className="mt-3 p-3 bg-slate-700 rounded-lg border-2 border-purple-700">
                          <p className="text-sm font-semibold text-purple-300 mb-1">
                            {t('whatWeHeard')}:
                          </p>
                          <div className="flex items-baseline gap-3 overflow-x-auto">
                            <span className="text-3xl font-bold text-purple-400 whitespace-nowrap">
                              {currentResult.heard}
                            </span>
                            <span className="text-lg text-purple-300">
                              ({currentResult.phonetic})
                            </span>
                          </div>
                        </div>

                        <div className="mt-2 text-sm text-slate-400">
                          {t('matchScore')}: {Math.round(currentResult.score * 100)}%
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Articulation Tip */}
            <Card className="bg-slate-700 border-slate-600">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <Volume2 className="h-6 w-6 text-blue-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-slate-200 mb-1">
                      {t('howToMakeSound')}:
                    </p>
                    <p className="text-slate-300 leading-relaxed">
                      {safeSound.articulationTip ||
                        `${safeSound.letter} - ${safeSound.type}`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Progress */}
            <div className="flex items-center justify-center gap-2">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full transition-all ${
                    i < successfulAttempts ? 'bg-green-500 scale-110' : 'bg-slate-600'
                  }`}
                />
              ))}
              <span className="ml-2 text-sm text-slate-400">
                {successfulAttempts}/3 {t('correct')}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}