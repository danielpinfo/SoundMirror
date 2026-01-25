import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';

const PHONEME_BACKEND_BASE_URL = "https://base44-phoneme-backend-production.up.railway.app";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Volume2, BookA } from "lucide-react";
import { motion } from "framer-motion";
import PhonemeDisplay from '../components/practice/PhonemeDisplay';
import PhonemeTimeline from '../components/practice/PhonemeTimeline';
import PhonemeTimelinePlayer from '../components/practice/PhonemeTimelinePlayer';
import SoundPractice from '../components/practice/SoundPractice';
import UnifiedRecorder from '../components/practice/UnifiedRecorder';
import UnifiedResults from '../components/practice/UnifiedResults';
import VisemeAnimator from '../components/practice/VisemeAnimator';
import TTSSpriteAnimator from '../components/practice/TTSSpriteAnimator';
import WordVisemeAnimator from '../components/practice/WordVisemeAnimator';
import DualHeadAnimator from '../components/practice/DualHeadAnimator';
import { getPhonemeData } from '../components/practice/phonemeDatabase';
import { speak as speakText, warmup as warmupTTS } from '../components/practice/base44Speech';
import { useTranslations } from '../components/practice/translations';

const LANG_SPEECH_CODES = {
  en: 'en-US', es: 'es-ES', fr: 'fr-FR', de: 'de-DE',
  it: 'it-IT', pt: 'pt-BR', zh: 'zh-CN', ja: 'ja-JP'
};

export default function Practice() {
  const navigate = useNavigate();
  const [targetWord, setTargetWord] = useState('');
  const [targetPhonemes, setTargetPhonemes] = useState(null);
  const [isLoadingTarget, setIsLoadingTarget] = useState(true);
  const [currentMode, setCurrentMode] = useState('overview'); // overview, practice, results, sound-practice
  const [feedbackResult, setFeedbackResult] = useState(null);
  const [blendshapeHistory, setBlendshapeHistory] = useState([]);
  const [practicingSound, setPracticingSound] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [alignmentData, setAlignmentData] = useState(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState(null);

  const [selectedLang, setSelectedLang] = useState('en');
  const [frameIndex, setFrameIndex] = useState(1);
  const [mouthAnimationKey, setMouthAnimationKey] = useState(0);
  const [isWordAnimating, setIsWordAnimating] = useState(false);
  const [totalFramePosition, setTotalFramePosition] = useState(0);
  const [animatedFramePosition, setAnimatedFramePosition] = useState(0);
  const [isVisemeReady, setIsVisemeReady] = useState(false);
  const [isVisemeLoading, setIsVisemeLoading] = useState(false);
  const visemePreloadReqId = useRef(0);
  const ttsPreloadedRef = useRef(false);
  const [missingWordVisemes, setMissingWordVisemes] = useState([]);

  const t = useTranslations(selectedLang);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const lang = urlParams.get('lang') || localStorage.getItem('soundmirror_lang') || 'en';
    
    // Default words by language
    const defaultWords = {
      en: 'hello',
      es: 'hola',
      fr: 'bonjour',
      de: 'hallo',
      it: 'ciao',
      pt: 'olá',
      zh: '你好',
      ja: 'こんにちは'
    };
    
    const word = urlParams.get('word') || defaultWords[lang] || 'hello';
    setTargetWord(word);
    setSelectedLang(lang);
    loadTargetPhonemes(word);
  }, []);

  const preloadWordVisemes = async (word, phonetic) => {
    const reqId = ++visemePreloadReqId.current;
    setIsVisemeReady(false);
    setIsVisemeLoading(true);

    console.log('[Practice] Starting viseme preload for:', word, phonetic);

    try {
      // Import parseWordWithRules for proper phoneme parsing
      const { parseWordWithRules } = await import('../components/practice/phonemeRulesMap');

      const textToPreload = (word || '').toLowerCase().replace(/[^a-zñçàâäéèêëïîôöûüœæ]/g, '');
      const phonemes = parseWordWithRules(textToPreload, selectedLang);

      console.log('[Practice] Phonemes to preload:', phonemes);
      
      // Import getVisemeUrl dynamically
      const { getVisemeUrl } = await import('../components/practice/visemeUrls');

      const allUrls = [];
      phonemes.forEach((phoneme, idx) => {
        // First phoneme: frames 0-4 (5 frames), middle: frames 1-4 (4 frames), last: frames 1-6 (6 frames)
        let startFrame = idx === 0 ? 0 : 1;
        let endFrame = idx === phonemes.length - 1 ? 6 : 4;

        for (let i = startFrame; i <= endFrame; i++) {
          const url = getVisemeUrl(phoneme, i + 1); // getVisemeUrl uses 1-based indexing
          if (url) allUrls.push(url);
        }
      });

      console.log('[Practice] Preloading', allUrls.length, 'viseme frames for phonemes:', phonemes.join(' '));
      
      // Preload all frames in parallel
      await Promise.all(allUrls.map(url => 
        new Promise((resolve) => {
          const img = new Image();
          img.onload = () => resolve(true);
          img.onerror = () => {
            console.warn('[Practice] Failed to load:', url);
            resolve(false);
          };
          img.src = url;
        })
      ));
      
      if (reqId !== visemePreloadReqId.current) {
        console.log('[Practice] Preload cancelled (newer request)');
        return;
      }
      
      console.log('[Practice] Viseme preload complete!');
      setIsVisemeReady(true);
    } catch (e) {
      console.error('[Practice] Viseme preload error:', e);
      setIsVisemeReady(true); // Allow playing anyway
    } finally {
      setIsVisemeLoading(false);
    }
  };

  const preloadWordTTS = async (word) => {
    if (ttsPreloadedRef.current) return;
    try {
      const langCode = LANG_SPEECH_CODES[selectedLang] || 'en-US';
      console.log('[Practice] Preloading TTS for:', word, 'lang:', langCode);
      await warmupTTS(langCode);
      // Do a silent dummy speak to warm up the synthesis engine
      console.log('[Practice] Warming up synthesis engine with dummy speak');
      await speakText(' ', { lang: langCode, rate: 0.85, volume: 0 });
      ttsPreloadedRef.current = true;
      console.log('[Practice] TTS preload complete');
    } catch (e) {
      console.error('[Practice] TTS preload error:', e);
    }
  };

  const loadTargetPhonemes = async (word) => {
    setIsLoadingTarget(true);
    try {
      // First check the pre-built database for faster loading
      const cachedData = getPhonemeData(word);
      if (cachedData) {
        setTargetPhonemes(cachedData);
        await Promise.all([
          preloadWordVisemes(word, cachedData.phonetic),
          preloadWordTTS(word)
        ]);
        setIsLoadingTarget(false);
        return;
      }

      // Fall back to LLM for words not in database
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Convert the word "${word}" into phonemes for pronunciation practice.
        
Return a JSON object with:
- text: the original word
- phonetic: simple phonetic spelling (like "heh-LOH" for "Hello")
- phonemes: array of objects, each with:
  - letter: the letter(s) from the original word
  - phoneme: IPA symbol
  - phonetic: simple pronunciation guide
  - example: example word using this sound
  - articulationTip: brief tip on how to make this sound

Make it simple and clear for someone learning pronunciation.`,
        response_json_schema: {
          type: "object",
          properties: {
            text: { type: "string" },
            phonetic: { type: "string" },
            phonemes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  letter: { type: "string" },
                  phoneme: { type: "string" },
                  phonetic: { type: "string" },
                  example: { type: "string" },
                  articulationTip: { type: "string" }
                }
              }
            }
          }
        }
      });

      setTargetPhonemes(result);
      await Promise.all([
        preloadWordVisemes(word, result.phonetic),
        preloadWordTTS(word)
      ]);
    } catch (error) {
      console.error('Error loading phonemes:', error);
      const fallback = {
        text: word,
        phonetic: word.toLowerCase(),
        phonemes: word.split('').map(letter => ({
          letter: letter.toUpperCase(),
          phoneme: letter.toLowerCase(),
          phonetic: letter.toLowerCase(),
          example: word
        }))
      };
      setTargetPhonemes(fallback);
      await Promise.all([
        preloadWordVisemes(word, fallback.phonetic),
        preloadWordTTS(word)
      ]);
    } finally {
      setIsLoadingTarget(false);
    }
  };

  const speakWord = async () => {
        console.log('[Practice] speakWord called');
        const langCode = LANG_SPEECH_CODES[selectedLang] || 'en-US';

        // Start audio immediately without waiting
        speakText(targetWord, {
          lang: langCode,
          rate: 0.57,
          pitch: 1.0
        }).catch(error => console.error('[Practice] TTS error:', error));

        // Start animation at same time
        setIsWordAnimating(true);
      };

  const handleRecordingComplete = async (audioBlob, blendshapes) => {
    setIsProcessing(true);
    setBlendshapeHistory(blendshapes || []);
    try {
      // Upload audio
      const file = new File([audioBlob], 'recording.wav', { type: 'audio/wav' });
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      console.log('[Practice] Calling getPhonemes with:', file_url);
      const response = await base44.functions.invoke('getPhonemes', {
        audioFileUrl: file_url,
        lang: selectedLang,
        targetText: targetWord,
      });

      const phonemeResult = response.data || response;
      if (phonemeResult.error) {
        throw new Error(phonemeResult.error);
      }

      console.log('[Practice] Backend used:', phonemeResult.backend);
      console.log('[Practice] Phonemes detected:', phonemeResult.phonemes);
      console.log('[Practice] Raw phoneme_list:', phonemeResult.phoneme_list);
      console.log('[Practice] Target phonemes:', targetPhonemes?.phonemes);

      // Calculate actual score by comparing detected phonemes to target
      const rawDetected = phonemeResult.phoneme_list || 
        (phonemeResult.phonemes ? phonemeResult.phonemes.split(/\s+/) : []);
      
      // Backend may return syllables - split them into individual phonemes
      const splitIntoPhonemes = (syllables) => {
        const result = [];
        for (const syl of syllables) {
          let i = 0;
          while (i < syl.length) {
            if (syl[i] === 'ñ') {
              result.push('ɲ');
              i++;
            } else if (i + 1 < syl.length && (syl.substring(i, i+2) === 'ch' || syl.substring(i, i+2) === 'll')) {
              result.push(syl.substring(i, i+2));
              i += 2;
            } else {
              result.push(syl[i]);
              i++;
            }
          }
        }
        return result;
      };
      
      const detectedPhonemes = splitIntoPhonemes(rawDetected).map(p => p.toLowerCase().replace(/ː/g, ''));
      const targetPhonemeList = (targetPhonemes?.phonemes || []).map(p => (p.phoneme || p.letter || '').toLowerCase().replace(/ː/g, ''));
      
      console.log('[Practice] Detected phonemes (cleaned):', detectedPhonemes);
      console.log('[Practice] Target phonemes (cleaned):', targetPhonemeList);
      
      // Phoneme similarity mapping
      const similarPhonemes = {
        'h': ['h', 'ɦ', 'ʰ', 'hh'],
        'e': ['e', 'ɛ', 'ə', 'ɜ', 'eh', 'ae'],
        'ɛ': ['e', 'ɛ', 'ə', 'eh', 'ae'],
        'l': ['l', 'ɫ', 'ɭ', 'll'],
        'o': ['o', 'ɔ', 'oʊ', 'əʊ', 'ɒ', 'ow', 'oh', 'ao'],
        'oʊ': ['o', 'oʊ', 'əʊ', 'ɔ', 'ow', 'oh', 'ao'],
        'ə': ['ə', 'ɐ', 'ʌ', 'a', 'ah', 'ax', 'uh'],
        'ʌ': ['ə', 'ɐ', 'ʌ', 'a', 'ah', 'ax', 'uh'],
        'i': ['i', 'ɪ', 'iː', 'iy', 'ih', 'ee'],
        'ɪ': ['i', 'ɪ', 'iː', 'iy', 'ih'],
        'u': ['u', 'ʊ', 'uː', 'uw', 'uh'],
        'ʊ': ['u', 'ʊ', 'uː', 'uw', 'uh'],
        'æ': ['æ', 'a', 'ɛ', 'ae', 'ah'],
        'ɑ': ['ɑ', 'a', 'ɒ', 'aa', 'ah'],
        'ɔ': ['ɔ', 'o', 'ɒ', 'ao', 'aw'],
        'eɪ': ['eɪ', 'e', 'ey', 'ay'],
        'aɪ': ['aɪ', 'ay', 'ai'],
        'aʊ': ['aʊ', 'aw', 'ao'],
        'r': ['r', 'ɹ', 'ɾ', 'rr', 'er'],
        'ɹ': ['r', 'ɹ', 'ɾ', 'rr'],
        'θ': ['θ', 'th'],
        'ð': ['ð', 'dh', 'th'],
        'ʃ': ['ʃ', 'sh'],
        'ʒ': ['ʒ', 'zh'],
        'tʃ': ['tʃ', 'ch'],
        'dʒ': ['dʒ', 'jh', 'j'],
        'ŋ': ['ŋ', 'ng'],
        'ɲ': ['ɲ', 'ñ', 'ny', 'ni'],
        'n': ['n', 'nn'],
        'm': ['m', 'mm'],
        'w': ['w', 'wh'],
        'j': ['j', 'y', 'jj'],
        'k': ['k', 'kk', 'c'],
        'g': ['g', 'gg'],
        't': ['t', 'tt', 'dx'],
        'd': ['d', 'dd'],
        'p': ['p', 'pp'],
        'b': ['b', 'bb'],
        'f': ['f', 'ff'],
        'v': ['v', 'vv'],
        's': ['s', 'ss'],
        'z': ['z', 'zz'],
      };
      
      const areSimilar = (p1, p2) => {
        const clean1 = p1.replace(/ː/g, '').replace(/ˈ/g, '').replace(/ˌ/g, '').toLowerCase().trim();
        const clean2 = p2.replace(/ː/g, '').replace(/ˈ/g, '').replace(/ˌ/g, '').toLowerCase().trim();
        
        // Exact match
        if (clean1 === clean2) return true;
        
        // Substring match
        if (clean1.length > 0 && clean2.length > 0) {
          if (clean1.includes(clean2) || clean2.includes(clean1)) return true;
        }
        
        // First character match for consonants (very lenient for similar articulation)
        if (clean1[0] && clean2[0] && clean1[0] === clean2[0]) return true;
        
        // Check similarity mapping
        for (const [key, variants] of Object.entries(similarPhonemes)) {
          const allVariants = [key, ...variants];
          if (allVariants.some(v => v === clean1 || v.includes(clean1) || clean1.includes(v)) &&
              allVariants.some(v => v === clean2 || v.includes(clean2) || clean2.includes(v))) {
            return true;
          }
        }
        
        return false;
      };
      
      // Build alignment with actual comparison
      const alignment = [];
      const problemPhonemes = [];
      let matchCount = 0;
      let totalTarget = targetPhonemeList.length || 1;
      const matchedTargets = new Set();
      
      detectedPhonemes.forEach((detectedP) => {
        for (let tIdx = 0; tIdx < targetPhonemeList.length; tIdx++) {
          if (matchedTargets.has(tIdx)) continue;
          const targetP = targetPhonemeList[tIdx];
          if (areSimilar(targetP, detectedP)) {
            matchedTargets.add(tIdx);
            break;
          }
        }
      });
      
      targetPhonemeList.forEach((targetP, idx) => {
        const targetInfo = targetPhonemes?.phonemes?.[idx] || {};
        const wasMatched = matchedTargets.has(idx);
        
        console.log(`[Practice] Phoneme ${idx}: target="${targetP}", matched=${wasMatched}`);
        
        if (wasMatched) {
          matchCount++;
          alignment.push({
            letter: targetInfo.letter || targetP,
            phoneme: targetP,
            phonetic: targetInfo.phonetic || '',
            status: 'match',
            score: 1.0
          });
        } else {
          alignment.push({
            letter: targetInfo.letter || targetP,
            phoneme: targetP,
            phonetic: targetInfo.phonetic || '',
            status: 'mismatch',
            score: 0.0
          });
          problemPhonemes.push({
            letter: targetInfo.letter || targetP,
            phoneme: targetP,
            score: 0.0
          });
        }
      });
      
      // Accurate scoring: exactly matched / total expected
      const calculatedScore = totalTarget > 0 ? matchCount / totalTarget : 0;
      
      console.log('[Practice] Final score:', calculatedScore, `(${matchCount}/${totalTarget} matched)`);

      const safeResult = {
        target: {
          text: targetWord,
          phonetic: targetPhonemes?.phonetic || targetWord,
          phonemes: targetPhonemes?.phonemes || []
        },
        produced: {
          text: phonemeResult.phonemes || '',
          phonetic: '',
          phonemes: phonemeResult.phonemes || ''
        },
        alignment: alignment,
        score: calculatedScore,
        feedback: problemPhonemes.length > 0 
          ? [`${t('focusOnSound')} "${problemPhonemes[0]?.letter}" ${t('sound')}`, t('speakSlowly')]
          : [t('greatPronunciation')],
        problemPhonemes: problemPhonemes,
        backend: phonemeResult.backend
      };

      // Save practice session to history
      await base44.entities.PracticeSession.create({
        word: targetWord,
        score: safeResult.score,
        produced_text: safeResult.produced.text,
        problem_phonemes: safeResult.problemPhonemes,
        detailed_analysis: safeResult
      });

      setFeedbackResult(safeResult);
      setCurrentMode('results');
    } catch (error) {
      console.error('Error analyzing pronunciation:', error);
      alert(`Failed to analyze: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePracticeSound = (sound) => {
    setPracticingSound(sound);
    setCurrentMode('sound-practice');
  };

  const handleSoundPracticeComplete = () => {
    setCurrentMode('overview');
    setPracticingSound(null);
  };

  if (isLoadingTarget) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 text-blue-400 animate-spin mx-auto" />
          <p className="text-lg text-slate-300">{t('preparing')} {targetWord}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950">
      <div className="container mx-auto px-2 py-2 max-w-3xl">
        {currentMode !== 'sound-practice' && (
          <div className="flex items-center justify-between mb-2">
            <Button 
              variant="ghost" 
              className="gap-1 text-slate-300 hover:text-slate-100 h-7 py-6 px-4 md:h-auto md:py-2 md:px-3"
              onClick={() => navigate(createPageUrl('Home'))}
            >
              <div className="scale-[0.67] flex items-center gap-1">
                <div className="scale-[1.5] flex items-center gap-1">
                  <ArrowLeft className="h-4 w-4" />
                  {t('backToHome')}
                </div>
              </div>
            </Button>
            <Button 
              variant="outline" 
              className="gap-1 border-indigo-500 text-indigo-400 hover:bg-indigo-950 h-7 py-6 px-4 md:h-auto md:py-2 md:px-3"
              onClick={() => navigate(createPageUrl('LetterPractice'))}
            >
              <div className="scale-[0.67] flex items-center gap-1">
                <div className="scale-[1.5] flex items-center gap-1">
                  <BookA className="h-4 w-4" />
                  {t('practiceLetters')}
                </div>
              </div>
            </Button>
          </div>
        )}

        {currentMode === 'sound-practice' ? (
          <SoundPractice
            sound={practicingSound}
            targetWord={targetWord}
            onBack={() => setCurrentMode('results')}
            onComplete={handleSoundPracticeComplete}
          />
        ) : currentMode === 'results' && feedbackResult ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <div className="text-center mb-1">
              <h2 className="text-base font-bold text-slate-100">{t('results')} "{targetWord}"</h2>
            </div>
            
            <UnifiedResults
              result={feedbackResult}
              blendshapeHistory={blendshapeHistory}
              targetPhonemes={targetPhonemes}
              onPracticeSound={handlePracticeSound}
              onTryAgain={() => {
                setTotalFramePosition(1);
                setCurrentMode('overview');
              }}
            />
            
            {/* Phoneme Timeline Player with audio sync */}
            {alignmentData && recordedAudioUrl && (
              <PhonemeTimelinePlayer
                audioUrl={recordedAudioUrl}
                alignmentData={alignmentData}
                targetPhonemes={targetPhonemes?.phonemes}
                onPhonemeClick={(idx, phoneme) => {
                  console.log('Clicked phoneme:', phoneme);
                }}
              />
            )}
            
            <div className="text-center">
              <Button
                onClick={() => {
                  setTotalFramePosition(1);
                  setCurrentMode('overview');
                }}
                variant="outline"
              >
                {t('backToOverview')}
              </Button>
            </div>
            </motion.div>
            ) : currentMode === 'practice' ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <UnifiedRecorder
              targetWord={targetWord}
              targetPhonemes={targetPhonemes}
              onRecordingComplete={handleRecordingComplete}
              isProcessing={isProcessing}
            />
            
            <div className="text-center">
              <Button
                onClick={() => {
                  setTotalFramePosition(1);
                  setCurrentMode('overview');
                }}
                variant="outline"
              >
                {t('backToOverview')}
              </Button>
            </div>
            </motion.div>
            ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card className="border border-slate-700 bg-slate-800/90 backdrop-blur">
              <CardHeader className="py-2">
                <CardTitle className="text-lg text-center text-slate-100">
                  {t('practice')}: <span className="text-blue-400">{targetWord}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 py-1">
                <div className="text-center space-y-1">
                  {/* Static word display - TTS audio only, no animation for now */}
                  <div className="flex flex-col items-center gap-1 py-1">
                    <div className="text-lg text-slate-300 font-medium">
                      {targetPhonemes?.phonetic || targetWord}
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-3">
                    {/* Dual-Head Animation Showcase */}
                     <DualHeadAnimator
                       phonemeTokens={targetPhonemes?.phonemes?.map(p => p.phoneme?.toLowerCase() || p.letter?.toLowerCase()) || ['neutral']}
                       isPlaying={isWordAnimating}
                       playbackRate={1.0}
                       frameDuration={100}
                       onAnimationComplete={() => setIsWordAnimating(false)}
                       maxWidth={712}
                     />

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={speakWord}
                      disabled={isWordAnimating || !targetPhonemes}
                      className="gap-0.5 text-blue-400 hover:text-blue-300 disabled:opacity-50 h-8 w-8 p-0"
                    >
                      <Volume2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    onClick={() => setCurrentMode('practice')}
                    size="sm"
                    className="w-full h-10 text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    {t('startPracticeBtn')}
                  </Button>
                  <p className="text-center text-slate-400 mt-1.5 text-xs">
                    {t('howItWorksDetail')}
                  </p>
                </div>
                </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-slate-800 to-indigo-900 border border-slate-700">
                <CardContent className="py-2">
                <div className="text-center">
                  <p className="text-slate-300 text-xs">
                    <strong>{t('howItWorks')}:</strong> {t('practiceExplanation') || 'Watch your mouth shape in real-time while recording your voice. Get instant feedback on both your pronunciation and articulation.'}
                  </p>
                </div>
                </CardContent>
                </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}