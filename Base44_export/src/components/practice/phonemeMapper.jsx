import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Volume2, CheckCircle2, XCircle } from "lucide-react";
import { base44 } from '@/api/base44Client';
import UnifiedRecorder from './UnifiedRecorder';
import { Base44Speech, Base44AvatarController } from './base44Speech';
import { useTranslations } from './translations';

const ALPHABET_SOUNDS = [
  { letter: 'A', phonetic: 'ah', example: 'Apple' },
  { letter: 'B', phonetic: 'buh', example: 'Ball' },
  { letter: 'C', phonetic: 'kuh', example: 'Cat' },
  { letter: 'D', phonetic: 'duh', example: 'Dog' },
  { letter: 'E', phonetic: 'eh', example: 'Egg' },
  { letter: 'F', phonetic: 'fuh', example: 'Fish' },
  { letter: 'G', phonetic: 'guh', example: 'Go' },
  { letter: 'H', phonetic: 'huh', example: 'Hat' },
  { letter: 'I', phonetic: 'ih', example: 'Igloo' },
  { letter: 'J', phonetic: 'juh', example: 'Jump' },
  { letter: 'K', phonetic: 'kuh', example: 'Kite' },
  { letter: 'L', phonetic: 'luh', example: 'Lion' },
  { letter: 'M', phonetic: 'muh', example: 'Moon' },
  { letter: 'N', phonetic: 'nuh', example: 'Nose' },
  { letter: 'Ñ', phonetic: 'enye', example: 'Niño' },
  { letter: 'LL', phonetic: 'yeh', example: 'Llave' },
  { letter: 'O', phonetic: 'oh', example: 'Orange' },
  { letter: 'P', phonetic: 'puh', example: 'Pig' },
  { letter: 'Q', phonetic: 'koo', example: 'Queen' },
  { letter: 'R', phonetic: 'ruh', example: 'Run' },
  { letter: 'S', phonetic: 'sss', example: 'Sun' },
  { letter: 'T', phonetic: 'tuh', example: 'Tree' },
  { letter: 'U', phonetic: 'oo', example: 'Umbrella' },
  { letter: 'V', phonetic: 'vuh', example: 'Van' },
  { letter: 'W', phonetic: 'wuh', example: 'Water' },
  { letter: 'X', phonetic: 'ks', example: 'Box' },
  { letter: 'Y', phonetic: 'yuh', example: 'Yellow' },
  { letter: 'Z', phonetic: 'zzz', example: 'Zebra' }
];

const LANG_SPEECH_CODES = {
  en: 'en-US',
  es: 'es-ES'
};

export default function SoundPractice({ sound, targetWord, onBack, onComplete }) {
  const [selectedSound, setSelectedSound] = useState(sound);
  const [selectedLang] = useState(
    typeof window !== 'undefined' ? localStorage.getItem('soundmirror_lang') || 'en' : 'en'
  );

  const [attempts, setAttempts] = useState([]);
  const [isShowingResult, setIsShowingResult] = useState(false);
  const [currentResult, setCurrentResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [blendshapeHistory, setBlendshapeHistory] = useState([]);

  const t = useTranslations(selectedLang);

  const soundLetter = selectedSound?.letter || '';

  const lookupPhonetic = (letter) => {
    const found = ALPHABET_SOUNDS.find(
      (s) => s.letter.toLowerCase() === letter.toLowerCase()
    );
    return found?.phonetic || letter;
  };

  if (!selectedSound || !soundLetter) {
    return (
      <div className="space-y-6">
        <Button onClick={onBack} variant="ghost" className="gap-2 text-slate-300 hover:text-slate-100">
          <ArrowLeft className="h-4 w-4" /> {t('backToHome')}
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
                  className="h-12 w-12 text-xl font-bold border-blue-500 text-blue-400 hover:bg-blue-900/50"
                >
                  {s.letter}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const safeSound = {
    letter: String(soundLetter),
    phonetic: String(selectedSound.phonetic || lookupPhonetic(soundLetter)),
    example: String(selectedSound.example || targetWord || '')
  };

  const speakSound = async () => {
    try {
      await Base44Speech.speak(safeSound.phonetic, {
        lang: LANG_SPEECH_CODES[selectedLang] || 'en-US',
        avatar: Base44AvatarController
      });
    } catch (err) {}
  };

  const handleRecording = async (audioBlob, blendshapes) => {
    setIsProcessing(true);
    setBlendshapeHistory(blendshapes || []);

    try {
      const file = new File([audioBlob], 'recording.wav', { type: 'audio/wav' });
      const upload = await base44.integrations.Core.UploadFile({ file });

      const response = await base44.functions.invoke('getPhonemes', {
        audioFileUrl: upload.file_url,
        lang: 'eng'
      });

      const phonemeResult = response.data;

      if (phonemeResult.error) throw new Error(phonemeResult.error);

      const rawHeard = phonemeResult.phonemes || '';
      const heardList = phonemeResult.phoneme_list || [];

      const first = heardList[0] || '';

      const result = {
        correct: true,
        heard: rawHeard,
        phonetic: first,
        backend: phonemeResult.backend,
        score: 1.0
      };

      setCurrentResult(result);
      setIsShowingResult(true);
      setAttempts([...attempts, result]);
    } catch (err) {
      alert("Error analyzing audio: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const successfulAttempts = attempts.length;

  return (
    <div className="space-y-6">
      <Button onClick={onBack} variant="ghost" className="gap-2 text-slate-300 hover:text-slate-100">
        <ArrowLeft className="h-4 w-4" /> {t('backToHome')}
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card className="border border-slate-700 bg-slate-800/50 lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-400">{t('chooseLetterToPractice')}</CardTitle>
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
                  className={`h-9 w-9 text-lg font-bold rounded ${
                    s.letter === safeSound.letter
                      ? 'bg-indigo-600 text-white ring-2 ring-indigo-400'
                      : 'bg-blue-900/30 text-blue-400 hover:bg-blue-800/50'
                  }`}
                >
                  {s.letter}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-indigo-800 bg-gradient-to-br from-slate-800 to-indigo-900 lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-center text-2xl text-slate-100">
              {t('practice')} <span className="text-indigo-400">{safeSound.letter}</span>
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div className="inline-block p-8 bg-slate-700 rounded-3xl shadow-lg border-4 border-indigo-700">
                <span className="text-8xl font-bold text-indigo-400">{safeSound.letter}</span>
              </div>
              <p className="text-2xl font-semibold text-slate-200">{t('soundsLike')}: {safeSound.phonetic}</p>
              <p className="text-lg text-slate-400">
                {t('asIn')} "<span className="font-semibold text-slate-300">{safeSound.example}</span>"
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={speakSound}
                className="mt-3 gap-2 text-blue-400 border-blue-600 hover:bg-blue-900/50"
              >
                <Volume2 className="h-4 w-4" /> {t('hearIt')}
              </Button>
            </div>

            <UnifiedRecorder
              targetWord={safeSound.letter}
              targetPhonemes={{ phonetic: safeSound.phonetic, phonemes: [safeSound] }}
              onRecordingComplete={handleRecording}
              isProcessing={isProcessing}
            />

            {isShowingResult && currentResult && (
              <Card className="border-2 border-green-600 bg-green-900/50">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-8 w-8 text-green-400" />
                    <div className="flex-1">
                      <p className="text-lg font-semibold text-green-300">{t('excellent')}</p>
                      <div className="mt-3 p-3 bg-slate-700 rounded-lg border-2 border-purple-700">
                        <p className="text-sm font-semibold text-purple-300 mb-1">{t('whatWeHeard')}:</p>
                        <div className="flex items-baseline gap-3">
                          <span className="text-3xl font-bold text-purple-400">{currentResult.heard}</span>
                          <span className="text-lg text-purple-300">({currentResult.phonetic})</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
