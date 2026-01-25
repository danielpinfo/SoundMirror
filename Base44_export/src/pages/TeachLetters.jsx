// TeachLetters.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, GraduationCap, BookOpen, Volume2, Save, Play } from "lucide-react";
import { base44 } from '@/api/base44Client';
import UnifiedRecorder from '../components/practice/UnifiedRecorder';
import { useTranslations } from '../components/practice/translations';
import VisemeAnimator from '../components/practice/VisemeAnimator';
import { speak as speakText } from '../components/practice/base44Speech';

// Alphabet data for each supported language
// Main update: use "a" vowels for consonant letter models: "ba", "pa", "ta", etc.
const ALPHABET_BY_LANG = {
  en: [
    { letter: 'A', phonetic: 'ah',  type: 'vowel',     example: 'Apple' },
    { letter: 'B', phonetic: 'ba',  type: 'consonant', example: 'Ball' },
    { letter: 'C', phonetic: 'ca',  type: 'consonant', example: 'Cat' },
    { letter: 'D', phonetic: 'da',  type: 'consonant', example: 'Dog' },
    { letter: 'E', phonetic: 'eh',  type: 'vowel',     example: 'Egg' },
    { letter: 'F', phonetic: 'fa',  type: 'consonant', example: 'Fish' },
    { letter: 'G', phonetic: 'ga',  type: 'consonant', example: 'Go' },
    { letter: 'H', phonetic: 'ha',  type: 'consonant', example: 'Hat' },
    { letter: 'I', phonetic: 'ih',  type: 'vowel',     example: 'Igloo' },
    { letter: 'J', phonetic: 'ja',  type: 'consonant', example: 'Jump' },
    { letter: 'K', phonetic: 'ka',  type: 'consonant', example: 'Kite' },
    { letter: 'L', phonetic: 'la',  type: 'consonant', example: 'Lion' },
    { letter: 'M', phonetic: 'ma',  type: 'consonant', example: 'Moon' },
    { letter: 'N', phonetic: 'na',  type: 'consonant', example: 'Nose' },
    { letter: 'O', phonetic: 'oh',  type: 'vowel',     example: 'Orange' },
    { letter: 'P', phonetic: 'pa',  type: 'consonant', example: 'Pig' },
    { letter: 'Q', phonetic: 'kwa', type: 'consonant', example: 'Queen' },
    { letter: 'R', phonetic: 'ra',  type: 'consonant', example: 'Run' },
    { letter: 'S', phonetic: 'sss', type: 'consonant', example: 'Sun' },
    { letter: 'T', phonetic: 'ta',  type: 'consonant', example: 'Tree' },
    { letter: 'U', phonetic: 'oo',  type: 'vowel',     example: 'Umbrella' },
    { letter: 'V', phonetic: 'va',  type: 'consonant', example: 'Van' },
    { letter: 'W', phonetic: 'wa',  type: 'consonant', example: 'Water' },
    { letter: 'X', phonetic: 'ks',  type: 'consonant', example: 'Box' },
    { letter: 'Y', phonetic: 'ya',  type: 'consonant', example: 'Yellow' },
    { letter: 'Z', phonetic: 'zzz', type: 'consonant', example: 'Zebra' },
  ],
  es: [
    { letter: 'A',  phonetic: 'a',   type: 'vowel',     example: 'Agua' },
    { letter: 'B',  phonetic: 'ba',  type: 'consonant', example: 'Bueno' },
    { letter: 'C',  phonetic: 'ca',  type: 'consonant', example: 'Casa' },
    { letter: 'D',  phonetic: 'da',  type: 'consonant', example: 'Día' },
    { letter: 'E',  phonetic: 'e',   type: 'vowel',     example: 'Estrella' },
    { letter: 'F',  phonetic: 'fa',  type: 'consonant', example: 'Flor' },
    { letter: 'G',  phonetic: 'ga',  type: 'consonant', example: 'Gato' },
    { letter: 'H',  phonetic: '',    type: 'consonant', example: 'Hola' },
    { letter: 'I',  phonetic: 'i',   type: 'vowel',     example: 'Iglesia' },
    { letter: 'J',  phonetic: 'ja',  type: 'consonant', example: 'Jugar' },
    { letter: 'K',  phonetic: 'ka',  type: 'consonant', example: 'Kilo' },
    { letter: 'L',  phonetic: 'la',  type: 'consonant', example: 'Luna' },
    { letter: 'M',  phonetic: 'ma',  type: 'consonant', example: 'Mesa' },
    { letter: 'N',  phonetic: 'na',  type: 'consonant', example: 'Noche' },
    { letter: 'Ñ',  phonetic: 'ña',  type: 'consonant', example: 'Niño' },
    { letter: 'LL', phonetic: 'ia',  type: 'consonant', example: 'Llave' },
    { letter: 'O',  phonetic: 'o',   type: 'vowel',     example: 'Oso' },
    { letter: 'P',  phonetic: 'pa',  type: 'consonant', example: 'Perro' },
    { letter: 'Q',  phonetic: 'ka',  type: 'consonant', example: 'Queso' },
    { letter: 'R',  phonetic: 'ra',  type: 'consonant', example: 'Rosa' },
    { letter: 'S',  phonetic: 'sa',  type: 'consonant', example: 'Sol' },
    { letter: 'T',  phonetic: 'ta',  type: 'consonant', example: 'Taza' },
    { letter: 'U',  phonetic: 'u',   type: 'vowel',     example: 'Uva' },
    { letter: 'V',  phonetic: 'va',  type: 'consonant', example: 'Verde' },
    { letter: 'W',  phonetic: 'wa',  type: 'consonant', example: 'Whisky' },
    { letter: 'X',  phonetic: 'xa',  type: 'consonant', example: 'Xilófono' },
    { letter: 'Y',  phonetic: 'ya',  type: 'consonant', example: 'Yo' },
    { letter: 'Z',  phonetic: 'sa',  type: 'consonant', example: 'Zapato' },
  ],
};

// ---- IPA comparison helpers -----------------------------------------

function normalizeIPAUnit(unit) {
  return String(unit || '')
    .toLowerCase()
    .replace(/[ːˑˈˌ]/g, '')              // length & stress marks
    .normalize('NFD')                    // split base + diacritics
    .replace(/[\u0300-\u036f]/g, '')     // remove diacritics
    .trim();
}

/**
 * Compute a simple overlap score between expected & detected IPA unit arrays.
 * Returns a number between 0 and 1, or null if we don't have enough data.
 */
function computeIpaMatchScore(expectedUnits, detectedUnits) {
  const expected = (expectedUnits || [])
    .map(normalizeIPAUnit)
    .filter(Boolean);
  const detected = (detectedUnits || [])
    .map(normalizeIPAUnit)
    .filter(Boolean);

  if (!expected.length || !detected.length) return null;

  const used = new Set();
  let matches = 0;

  expected.forEach((e) => {
    const idx = detected.findIndex((d, i) => !used.has(i) && d === e);
    if (idx !== -1) {
      matches += 1;
      used.add(idx);
    }
  });

  const denom = Math.max(expected.length, detected.length);
  if (!denom) return null;
  return matches / denom;
}

// ---------------------------------------------------------------------

export default function TeachLetters() {
  const [selectedLang, setSelectedLang] = useState('en');
  const [selectedSound, setSelectedSound] = useState(null);
  const [recordings, setRecordings] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [goldenReference, setGoldenReference] = useState(null); // ⬅️ averaged IPA / phonemes from backend
  const [animationKey, setAnimationKey] = useState(0);
  const [frame, setFrame] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [derivedPhonetic, setDerivedPhonetic] = useState('');
  const [customPhonetic, setCustomPhonetic] = useState('');
  const [isSavingPhonetic, setIsSavingPhonetic] = useState(false);
  const [hasPlayedPhonetic, setHasPlayedPhonetic] = useState(false);
  const [pendingRecording, setPendingRecording] = useState(null);
  const [isPlayingRecording, setIsPlayingRecording] = useState(false);

  const t = useTranslations(selectedLang);
  const ALPHABET_SOUNDS = ALPHABET_BY_LANG[selectedLang] || ALPHABET_BY_LANG.en;

  useEffect(() => {
    const lang = localStorage.getItem('soundmirror_lang') || 'en';
    setSelectedLang(lang);
  }, []);

  const handleRecordingComplete = async (audioBlob, blendshapes) => {
    if (!selectedSound) return;

    setIsProcessing(true);
    try {
      const file = new File([audioBlob], 'recording.wav', { type: 'audio/wav' });
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      const response = await base44.functions.invoke('getPhonemes', {
        audioFileUrl: file_url,
        lang: selectedLang === 'es' ? 'es' : 'en',
        targetText: selectedSound.letter
      });

      const phonemeResult = response.data || response;
      console.log('[TeachLetters] Phoneme analysis:', phonemeResult);

      // Store pending recording for review - don't save yet
      setPendingRecording({
        audioBlob,
        audioUrl: file_url,
        blendshapes,
        phonemeResult,
        attemptNumber: recordings.length + 1
      });

    } catch (error) {
      console.error('[TeachLetters] Error:', error);
      alert(`Failed to process recording: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAcceptRecording = async () => {
    if (!pendingRecording) return;

    setIsProcessing(true);
    try {
      const storeResult = await base44.functions.invoke('storeTrainingData', {
        letter: selectedSound.letter,
        language: selectedLang,
        audioFileUrl: pendingRecording.audioUrl,
        phonemeData: pendingRecording.phonemeResult,
        blendshapes: pendingRecording.blendshapes,
        attemptNumber: pendingRecording.attemptNumber
      });

      console.log('[TeachLetters] Stored training data:', storeResult.data);

      // Capture golden reference if backend provides an averaged structure
      if (storeResult?.data?.averagePhonemeData) {
        console.log('[TeachLetters] Golden reference (averagePhonemeData):', storeResult.data.averagePhonemeData);
        setGoldenReference(storeResult.data.averagePhonemeData);
      }

      setRecordings((prev) => [
        ...prev,
        {
          attemptNumber: pendingRecording.attemptNumber,
          phonemeData: pendingRecording.phonemeResult,
          timestamp: new Date().toISOString()
        }
      ]);

      if (storeResult?.data?.complete) {
        setIsComplete(true);

        // Derive phonetic spelling from averaged data
        if (storeResult?.data?.averagePhonemeData) {
          try {
            const phonResult = await base44.functions.invoke('derivePhonetic', {
              letter: selectedSound.letter,
              language: selectedLang,
              averagePhonemeData: storeResult.data.averagePhonemeData
            });

            const derived = phonResult.data?.derived_phonetic || '';
            setDerivedPhonetic(derived);
            setCustomPhonetic(derived);
          } catch (err) {
            console.warn('Failed to derive phonetic:', err);
            setDerivedPhonetic(selectedSound.phonetic);
            setCustomPhonetic(selectedSound.phonetic);
          }
        }
      }

      setPendingRecording(null);
    } catch (error) {
      console.error('[TeachLetters] Error saving recording:', error);
      alert(`Failed to save recording: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTryAgainRecording = () => {
    setPendingRecording(null);
  };

  const handlePlaybackRecording = async () => {
    if (!pendingRecording) return;

    setIsPlayingRecording(true);
    try {
      const audio = new Audio(pendingRecording.audioUrl);
      audio.play();
      audio.onended = () => setIsPlayingRecording(false);
    } catch (err) {
      console.error('Failed to play recording:', err);
      setIsPlayingRecording(false);
    }
  };

  const handleSelectLetter = (sound) => {
    setSelectedSound(sound);
    setRecordings([]);
    setIsComplete(false);
    setGoldenReference(null);
    setFrame(1);
    setIsAnimating(false);
  };

  const handleReset = () => {
    setSelectedSound(null);
    setRecordings([]);
    setIsComplete(false);
    setGoldenReference(null);
    setFrame(1);
    setIsAnimating(false);
    setDerivedPhonetic('');
    setCustomPhonetic('');
  };

  const handleSaveCustomPhonetic = async () => {
    if (!customPhonetic.trim()) return;
    
    setIsSavingPhonetic(true);
    try {
      console.log('[TeachLetters] HARD RULE: Saving phonetic:', customPhonetic.trim(), 'for', selectedSound.letter);
      
      // HARD RULE: This saved phonetic will be used in Letter Practice
      const existing = await base44.entities.CustomPhonetic.filter({
        letter: selectedSound.letter,
        language: selectedLang
      });

      if (existing.length > 0) {
        await base44.entities.CustomPhonetic.update(existing[0].id, {
          custom_phonetic: customPhonetic.trim(),
          derived_phonetic: derivedPhonetic,
          ipa_units: goldenReference?.ipa_units || goldenReference?.phoneme_list || []
        });
      } else {
        await base44.entities.CustomPhonetic.create({
          letter: selectedSound.letter,
          language: selectedLang,
          custom_phonetic: customPhonetic.trim(),
          derived_phonetic: derivedPhonetic,
          ipa_units: goldenReference?.ipa_units || goldenReference?.phoneme_list || []
        });
      }

      // HARD RULE: After save, Letter Practice will use this exact pronunciation
      console.log('[TeachLetters] Saved. Letter Practice will now use:', customPhonetic.trim());
      alert(`✓ ${t('customPronunciationSaved')} "${selectedSound.letter}" ${t('willNowSound')} "${customPhonetic.trim()}" ${t('inYourPracticeSessions')}`);
    } catch (err) {
      console.error('Failed to save custom phonetic:', err);
      alert(`Failed to save: ${err.message}`);
    } finally {
      setIsSavingPhonetic(false);
    }
  };

  const handleTestPhonetic = async () => {
    if (!customPhonetic.trim()) return;
    
    setHasPlayedPhonetic(false);
    
    try {
      // HARD RULE: Always use phoneme pronunciation with strict language code
      const textToSpeak = customPhonetic.trim().toLowerCase();
      const speechLang = selectedLang === 'es' ? 'es-ES' : 'en-US';
      
      console.log('[TeachLetters] HARD RULE: Testing phoneme:', textToSpeak, 'in', speechLang);
      
      // HARD RULE: This MUST sound identical to what will play in Letter Practice
      const audioPromise = speakText(textToSpeak, {
        lang: speechLang,
        rate: 0.95
      });

      await new Promise(resolve => setTimeout(resolve, 500));

      setIsAnimating(true);
      setAnimationKey(prev => prev + 1);
      setFrame(0);

      await audioPromise;
      
      setHasPlayedPhonetic(true);
    } catch (err) {
      console.warn('Speech failed:', err);
    } finally {
      setIsAnimating(false);
      setTimeout(() => setFrame(0), 100);
    }
  };

  const handleSpeak = async () => {
    try {
      // HARD RULE: Use default phonetic before any training saves
      const textToSpeak = (selectedSound.phonetic || selectedSound.letter).toLowerCase();
      const speechLang = selectedLang === 'es' ? 'es-ES' : 'en-US';
      
      console.log('[TeachLetters] HARD RULE: Speaking default phoneme:', textToSpeak, 'in', speechLang);
      
      // HARD RULE: This shows how letter will sound BEFORE training
      const audioPromise = speakText(textToSpeak, {
        lang: speechLang,
        rate: 0.95
      });

      await new Promise(resolve => setTimeout(resolve, 500));

      setIsAnimating(true);
      setAnimationKey(prev => prev + 1);
      setFrame(0);

      await audioPromise;
    } catch (err) {
      console.warn('Speech failed:', err);
    } finally {
      setIsAnimating(false);
      setTimeout(() => setFrame(0), 100);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-950">
      <div className="container mx-auto px-2 py-2 md:px-6 md:py-8 max-w-6xl">
        <Button variant="ghost" className="mb-2 md:mb-6 gap-1 md:gap-2 text-slate-300 hover:text-slate-100 h-7 md:h-auto text-xs md:text-base" asChild>
          <Link to={createPageUrl('Home')}>
            <ArrowLeft className="h-4 w-4" />
            {t('backToHome')}
          </Link>
        </Button>

        <div className="mb-2 md:mb-6">
          <div className="flex items-center gap-1.5 md:gap-3 mb-1 md:mb-3">
            <GraduationCap className="h-5 w-5 md:h-8 md:w-8 text-emerald-400" />
            <h1 className="text-lg md:text-3xl font-bold text-slate-100">{t('teacherTrainingMode')}</h1>
          </div>
          <p className="text-slate-400 mt-0.5 md:mt-2 text-[10px] md:text-base">
            {t('recordEachLetter')}
          </p>
        </div>

        {!selectedSound ? (
          <Card className="border border-emerald-700 bg-gradient-to-br from-slate-800 to-emerald-900">
            <CardHeader className="py-2 md:py-6">
              <CardTitle className="text-center text-base md:text-2xl text-slate-100">
                {t('selectLetterToTeach')}
              </CardTitle>
            </CardHeader>
            <CardContent className="py-2 md:py-6">
              <div className="grid grid-cols-6 sm:grid-cols-9 gap-1 md:gap-3">
                {ALPHABET_SOUNDS.map((s) => (
                  <Button
                    key={s.letter}
                    onClick={() => handleSelectLetter(s)}
                    variant="outline"
                    className={`h-10 w-10 md:h-16 md:w-16 text-lg md:text-2xl font-bold ${
                      s.type === 'vowel'
                        ? 'border-amber-500 text-amber-400 hover:bg-amber-900/50'
                        : 'border-emerald-500 text-emerald-400 hover:bg-emerald-900/50'
                    }`}
                  >
                    {s.letter}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2 md:space-y-4">
            {/* Progress Header */}
            <Card className="border border-emerald-600 bg-gradient-to-br from-slate-800 to-emerald-900">
              <CardContent className="py-2 md:py-6">
                <div className="space-y-2 md:space-y-4 mb-2 md:mb-4">
                  <div className="flex items-center justify-between">
                    <Link to={`${createPageUrl('ManualAdjustment')}?letter=${selectedSound.letter}&lang=${selectedLang}`}>
                      <Button variant="outline" size="sm" className="h-7 md:h-auto text-xs md:text-base border-blue-500 text-blue-400">
                        Manual Adjustments
                      </Button>
                    </Link>
                    <Button onClick={handleReset} variant="outline" size="sm" className="h-7 md:h-auto text-xs md:text-base">
                      {t('chooseDifferentLetter')}
                    </Button>
                  </div>
                  
                  <div className="flex flex-col gap-3 md:gap-4">
                    <div className="w-full flex flex-col items-center gap-2">
                      <VisemeAnimator
                        token={selectedSound.letter.toLowerCase()}
                        displayLabel={selectedSound.letter}
                        showLabel={false}
                        showInternalControls={false}
                        animationKey={animationKey}
                        frame={isAnimating ? undefined : frame - 1}
                        onFrameChange={(f) => setFrame(f + 1)}
                        frameCount={8}
                        fps={12}
                      />
                      
                      {!isAnimating && (
                        <div className="w-full max-w-md">
                          <input
                            type="range"
                            min={1}
                            max={8}
                            value={frame}
                            onChange={(e) => setFrame(Number(e.target.value))}
                            className="w-full"
                          />
                          <div className="text-xs text-center text-slate-400 mt-1">
                            {frame}/8
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="w-full">
                      <div className="flex items-center gap-2 md:gap-4 mb-2">
                        <h2 className="text-xl md:text-3xl font-bold text-slate-100">
                          {t('teaching')}: <span className="text-emerald-400">{selectedSound.letter}</span>
                        </h2>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleSpeak}
                          className="text-emerald-400 hover:text-emerald-300 h-16 w-16 md:h-20 md:w-20 p-0 rounded-full border-2 border-emerald-400"
                        >
                          <Volume2 className="h-20 w-20 md:h-24 md:w-24" />
                        </Button>
                      </div>
                      
                      <p className="text-xs md:text-base font-bold text-slate-100">
                        {t('soundsLike')} "{selectedSound.phonetic}" {t('asIn')} "{selectedSound.example}"
                      </p>
                      <p className="text-[10px] md:text-sm font-bold text-slate-100 mt-1">
                        {t('useSliderExplore')}
                      </p>
                      <p className="text-[9px] md:text-xs font-bold text-yellow-400 mt-1">
                        {t('warningPhoneme')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 mb-2">
                  {[1, 2, 3].map((num) => (
                    <div
                      key={num}
                      className={`flex items-center justify-center w-8 h-8 rounded-full border ${
                        recordings.length >= num
                          ? 'bg-emerald-500 border-emerald-400 text-white'
                          : recordings.length === num - 1
                          ? 'bg-emerald-900 border-emerald-500 text-emerald-300 animate-pulse'
                          : 'bg-slate-700 border-slate-600 text-slate-400'
                      }`}
                    >
                      {recordings.length >= num ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <span className="font-bold">{num}</span>
                      )}
                    </div>
                  ))}
                </div>

                <p className="text-center text-slate-300 mb-1 text-xs">
                  {isComplete
                    ? `✓ ${t('trainingComplete')}`
                    : `${t('recordAttempt')} ${recordings.length + 1} ${t('of')} 3`}
                </p>
              </CardContent>
            </Card>

            {/* Recorder */}
            {!isComplete && !pendingRecording && (
              <UnifiedRecorder
                targetWord={selectedSound.letter}
                targetPhonemes={{
                  phonetic: selectedSound.phonetic,
                  phonemes: [selectedSound],
                }}
                onRecordingComplete={handleRecordingComplete}
                isProcessing={isProcessing}
              />
            )}

            {/* Recording Review */}
            {pendingRecording && (
              <Card className="border border-yellow-600 bg-yellow-900/20">
                <CardContent className="py-4">
                  <h3 className="text-lg font-bold text-yellow-100 mb-2">
                    Review Recording {pendingRecording.attemptNumber}
                  </h3>
                  <div className="mb-3 p-3 bg-slate-800/70 rounded">
                    <p className="text-sm text-slate-300 mb-1">
                      Detected: "{pendingRecording.phonemeResult.primary || pendingRecording.phonemeResult.phonemes || '—'}"
                    </p>
                    <p className="text-xs text-slate-400">
                      IPA Units: [{(pendingRecording.phonemeResult.ipa_units || []).join(', ')}]
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handlePlaybackRecording}
                      disabled={isPlayingRecording}
                      variant="outline"
                      className="flex-1 border-emerald-600 text-emerald-400"
                    >
                      <Volume2 className="h-4 w-4 mr-2" />
                      Playback Recording
                    </Button>
                    <Button
                      onClick={handleTryAgainRecording}
                      variant="outline"
                      className="flex-1"
                    >
                      Try Again
                    </Button>
                  </div>
                  <Button
                    onClick={handleAcceptRecording}
                    disabled={isProcessing}
                    className="w-full mt-2 bg-green-600 hover:bg-green-700"
                  >
                    {isProcessing ? 'Saving...' : 'Accept Recorded Result'}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Recordings Summary with IPA comparison */}
            {recordings.length > 0 && (
              <Card className="border border-slate-700 bg-slate-800/50">
                <CardHeader className="py-2">
                  <CardTitle className="text-sm text-slate-200">
                    {t('recordedAttempts')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                  {goldenReference && (
                    <div className="mb-2 p-2 rounded bg-emerald-900/40 border border-emerald-600">
                      <p className="text-[10px] font-semibold text-emerald-200 mb-0.5">
                        Golden reference (averaged teacher IPA)
                      </p>
                      <p className="text-[9px] text-emerald-100">
                        IPA Units:&nbsp;
                        [
                        {(goldenReference.ipa_units ||
                          goldenReference.phoneme_list ||
                          []
                        ).join(', ')}
                        ]
                      </p>
                      {goldenReference.raw_transcription && (
                        <p className="text-[9px] text-emerald-200 mt-0.5">
                          Backend text snapshot: "{goldenReference.raw_transcription}"
                        </p>
                      )}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    {recordings.map((rec, idx) => {
                      const attemptIpa =
                        rec.phonemeData.ipa_units ||
                        rec.phonemeData.phoneme_list ||
                        [];
                      const goldenIpa = goldenReference
                        ? (goldenReference.ipa_units ||
                           goldenReference.phoneme_list ||
                           [])
                        : [];
                      const matchScore =
                        goldenReference
                          ? computeIpaMatchScore(goldenIpa, attemptIpa)
                          : null;

                      return (
                        <div
                          key={idx}
                          className="p-2 bg-slate-700/50 rounded border border-slate-600"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-emerald-400">
                              Attempt {rec.attemptNumber}
                            </span>
                            <span className="text-xs text-slate-400">
                              {new Date(rec.timestamp).toLocaleTimeString()}
                            </span>
                          </div>

                          <div className="mt-1 text-xs text-slate-300">
                            Detected: "
                            {rec.phonemeData.primary ||
                              rec.phonemeData.phonemes ||
                              '—'}
                            "
                          </div>

                          <div className="mt-0.5 text-[9px] text-slate-400">
                            IPA Units: [
                            {(rec.phonemeData.ipa_units || []).join(', ')}
                            ]
                          </div>

                          {goldenReference && (
                            <>
                              <div className="mt-0.5 text-[9px] text-slate-400">
                                Golden IPA: [
                                {goldenIpa.join(', ')}
                                ]
                              </div>
                              {matchScore !== null && (
                                <div className="mt-0.5 text-[9px]">
                                  <span className="text-slate-300">
                                    Match vs golden:
                                  </span>{' '}
                                  <span
                                    className={
                                      matchScore >= 0.8
                                        ? 'text-emerald-300 font-semibold'
                                        : matchScore >= 0.5
                                        ? 'text-amber-300 font-semibold'
                                        : 'text-red-300 font-semibold'
                                    }
                                  >
                                    {Math.round(matchScore * 100)}%
                                  </span>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Completion / Golden reference summary */}
            {isComplete && (
              <Card className="border border-emerald-500 bg-gradient-to-br from-emerald-900/50 to-slate-800">
                <CardContent className="py-2">
                  <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto mb-2" />
                  <h3 className="text-base font-bold text-slate-100 mb-2 text-center">
                    {t('trainingCompleteTitle')}
                  </h3>

                  {/* Custom Phonetic Editor */}
                  <div className="max-w-md mx-auto mb-2 p-2 rounded bg-slate-900/60 border border-emerald-600">
                    <p className="text-xs font-semibold text-emerald-200 mb-1.5">
                      {t('customPronunciationFor')} "{selectedSound.letter}"
                    </p>

                    {derivedPhonetic && (
                      <p className="text-[10px] text-slate-300 mb-1">
                        {t('aiSuggested')} <span className="font-bold text-emerald-300">"{derivedPhonetic}"</span>
                      </p>
                    )}

                    <div className="flex gap-1 mb-1.5">
                      <input
                        type="text"
                        value={customPhonetic}
                        onChange={(e) => {
                          setCustomPhonetic(e.target.value);
                          setHasPlayedPhonetic(false);
                        }}
                        placeholder={t('enterPhonetic')}
                        className="flex-1 px-2 py-1 bg-slate-800 border border-slate-600 rounded text-slate-100 text-xs"
                      />
                      {!hasPlayedPhonetic ? (
                        <Button
                          onClick={handleTestPhonetic}
                          variant="outline"
                          size="sm"
                          className="border-emerald-600 text-emerald-400 h-7 px-2"
                        >
                          <Volume2 className="h-3 w-3" />
                        </Button>
                      ) : (
                        <Button
                          onClick={handleTestPhonetic}
                          variant="outline"
                          size="sm"
                          className="border-emerald-600 text-emerald-400 h-10 w-10 rounded-full p-0"
                        >
                          <Play className="h-5 w-5" />
                        </Button>
                      )}
                    </div>

                    <Button
                      onClick={handleSaveCustomPhonetic}
                      disabled={!customPhonetic.trim() || isSavingPhonetic}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 h-7 text-xs"
                    >
                      {isSavingPhonetic ? t('saving') : t('saveCustomPronunciation')}
                    </Button>

                    {goldenReference && (
                      <div className="mt-1.5 pt-1.5 border-t border-slate-700">
                        <p className="text-[9px] text-slate-400">
                          {t('ipaUnits')} [{(goldenReference.ipa_units || goldenReference.phoneme_list || []).join(', ')}]
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-center gap-1.5 flex-wrap">
                    <Link to={`${createPageUrl('ManualAdjustment')}?letter=${selectedSound.letter}&lang=${selectedLang}`}>
                      <Button variant="outline" size="sm" className="h-7 text-xs border-blue-500 text-blue-400">
                        Manual Adjustments
                      </Button>
                    </Link>
                    <Button
                      onClick={handleReset}
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 h-7 text-xs"
                    >
                      <BookOpen className="h-3 w-3 mr-1" />
                      {t('teachAnotherLetter')}
                    </Button>
                    <Link to={createPageUrl('LetterPractice')}>
                      <Button variant="outline" size="sm" className="h-7 text-xs">{t('backToHome')}</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}