import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../components/i18n/LanguageContext';
import { translations } from '../components/i18n/translations';
import { createPageUrl } from '@/utils/pageUtils';
import LanguageSelector from '../components/common/LanguageSelector';
import QwertyKeyboard from '../components/common/QwertyKeyboard';
import DualHeadAnimation from '../components/animation/DualHeadAnimation';
import PracticeRecorder from '../components/practice/PracticeRecorder';
import CoachingBox from '../components/practice/CoachingBox';
import { ArrowLeft, History } from 'lucide-react';
import { usePlugin } from '../components/core/PluginContext';
import { PracticeArchive } from '../components/analysis/PracticeArchive';
import { useLearningContext } from '../components/core/LearningContext';
import PracticeLanguageModal from '../components/home/PracticeLanguageModal';
import { AudioPlayer } from '../components/animation/AudioPlayer';
import { clearTraceBuffer, ensureTraceBuffer, pushTrace } from '@/lib/traceBuffer';
import { scaleTimelineToAudio } from '@/runtime/playback/scaleTimelineToAudio';
import { buildArticulationAnalysis } from '../components/uas/buildArticulationAnalysis';
import {
  analyzeBrowserPhonemes,
  preloadBrowserPhonemeModel,
} from '../lib/phonemeEngine/browserPhonemeService';
import {
  PHONEME_RESULT_WEIGHT,
  MOUTH_MOVEMENT_WEIGHT,
  combinePronunciationEvidence,
} from '../lib/practiceScoring';
import {
  buildGuidedRecoveryUnits,
  getGuidedRecoveryInstruction,
  isGuidedSoundPassed,
  shouldStartGuidedRecovery,
  saveGuidedAttempt,
} from '../lib/guidedRecovery';

const archive = new PracticeArchive();
const getCurriculumKey = (lang) => `soundmirror_curriculum_passed_${lang || 'en'}`;

const LOGO_URL =
  'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697ce1adb374adba38acf28d/ff290666e_LOGO.png';
const CYAN = '#00bcd4';
const COBALT = '#0a3d6b';
const PILL_STYLE = {
  background: CYAN,
  color: COBALT,
  border: '1.5px solid #f5c518',
};

const diagnosticTraceMode = false;
const UAS_AUDIO_INPUT_MODE = 'minimal_processed_float32';
// 'processed_float32'
// 'minimal_processed_float32'
// 'minimal_float32_with_activity_spacers'
// 'raw_blob_base64'
// 'processed_float32'
// 'minimal_processed_float32'
// 'raw_blob_base64'
const UAS_TARGET_TEXT_MODE = 'plain';
// 'plain'
// 'word_token_spacers'


function finiteScore(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function clampScore01(value) {
  const number = finiteScore(value);
  if (number == null) return null;
  return Math.max(0, Math.min(1, number));
}

function resolveFrameForPhoneme(pack, phoneme) {
  const frames = Array.isArray(pack?.articulationMap?.frames)
    ? pack.articulationMap.frames
    : [];

  const match = frames.find((frame) =>
    Array.isArray(frame?.phonemes) && frame.phonemes.includes(phoneme)
  );

  return Number.isFinite(match?.index) ? match.index : 0;
}

function resolvePackGuidedCue(pack, unit) {
  if (!pack || !unit?.phoneme) return null;

  const cue = pack.getGuidedSoundCue?.(unit.phoneme) ?? null;
  if (!cue?.ttsText) return null;

  let expectedPhonemes = Array.isArray(cue.expectedPhonemes)
    ? cue.expectedPhonemes.filter(Boolean)
    : [];

  if (!expectedPhonemes.length) {
    const learningInput = pack.prepareLearningInput?.(cue.ttsText) ?? null;
    expectedPhonemes = Array.isArray(learningInput?.expectedPhonemes)
      ? learningInput.expectedPhonemes.filter(Boolean)
      : [];
  }

  if (!expectedPhonemes.length) return null;

  const targetExpectedIndex = Number.isInteger(cue.targetExpectedIndex)
    ? cue.targetExpectedIndex
    : Math.max(0, expectedPhonemes.indexOf(unit.phoneme));

  return {
    ...cue,
    targetPhoneme: cue.targetPhoneme || unit.phoneme,
    targetExpectedIndex,
    expectedPhonemes,
    displayText: cue.displayText || unit.display || unit.phoneme,
  };
}

function buildGuidedCuePlayback(pack, cue) {
  if (!pack || !cue?.ttsText || !cue.expectedPhonemes?.length) return null;

  const leadMs = 240;
  const soundMs = 560;
  let cursor = leadMs;
  const timeline = [
    { phoneme: 'neutral', frame: 0, startMs: 0, endMs: leadMs },
  ];

  const helperChunks = cue.expectedPhonemes.map((phoneme) => {
    const startMs = cursor;
    const endMs = startMs + soundMs;
    cursor = endMs;

    timeline.push({
      phoneme,
      label: pack.getDisplayToken?.(phoneme) || phoneme,
      frame: resolveFrameForPhoneme(pack, phoneme),
      startMs,
      endMs,
      guidedSoundCue: true,
    });

    return {
      text: pack.getDisplayToken?.(phoneme) || phoneme,
      startMs,
      endMs,
    };
  });

  timeline.push({
    phoneme: 'neutral',
    frame: 0,
    startMs: cursor,
    endMs: cursor + leadMs,
  });

  return {
    ttsText: cue.ttsText,
    ttsSsml: cue.ttsSsml ?? null,
    timeline,
    helperChunks,
    helperText:
      cue.helperText ||
      cue.pronunciation ||
      helperChunks.map((chunk) => chunk.text).join('-'),
    pronunciation: cue.pronunciation || cue.displayText,
  };
}

/*
 * Builds the one official attempt verdict used everywhere outside the
 * per-phoneme comparator: CoachingBox, curriculum passing, History, and
 * PracticeArchive.
 *
 * Contract:
 *   70% already-produced phoneme-result evidence
 *   30% synchronized mouth/articulation evidence
 *
 * Missing expected phonemes count against the phoneme half. Extra detected
 * phonemes also increase the comparison denominator, so insertions are not
 * accidentally rewarded. Mouth evidence is averaged only where a real
 * expected phoneme had a synchronized visual window; no visual score is
 * invented for a sound that was never produced.
 */
function buildOfficialAttemptVerdict(analysisItems, options = {}) {
  const items = Array.isArray(analysisItems)
    ? analysisItems
    : [];

  if (!items.length) {
    return {
      scoreReady: false,
      score01: null,
      scorePercent: null,
      audioScore: null,
      articulationScore: null,
      match: null,
      mismatchCount: 0,
      missingExpectedCount: 0,
      exactCount: 0,
    };
  }

  const context =
    items.find((item) => item?.attemptContext)?.attemptContext ?? null;

  const expectedAvailable =
    context?.expectedAvailable !== false &&
    items.some((item) => String(item?.expectedPhoneme ?? '').trim());

  if (!expectedAvailable) {
    return {
      scoreReady: false,
      score01: null,
      scorePercent: null,
      audioScore: null,
      articulationScore: null,
      match: null,
      mismatchCount: 0,
      missingExpectedCount: 0,
      exactCount: 0,
    };
  }

  const missingExpectedCount = Math.max(
    0,
    Number(context?.missingExpectedCount) || 0
  );

  const alignedExpectedItems = items.filter(
    (item) => String(item?.expectedPhoneme ?? '').trim()
  );

  const expectedCount =
    alignedExpectedItems.length + missingExpectedCount;

  const comparisonDenominator = Math.max(
    expectedCount,
    items.length
  );

  const audioScoreSum = items.reduce((sum, item) => {
    const score = clampScore01(item?.audioScore);
    return sum + (score == null ? 0 : score);
  }, 0);

  const segmentalAudioScore =
    comparisonDenominator > 0
      ? clampScore01(audioScoreSum / comparisonDenominator)
      : null;
  const requestedAudioScore = clampScore01(options?.audioScoreOverride);
  const audioScore = requestedAudioScore ?? segmentalAudioScore;

  const articulationScores = alignedExpectedItems
    .map((item) => clampScore01(item?.articulationScore))
    .filter((value) => value != null);

  const articulationScore =
    articulationScores.length > 0
      ? clampScore01(
          articulationScores.reduce((sum, value) => sum + value, 0) /
            articulationScores.length
        )
      : null;

  const score01 =
    audioScore != null
      ? combinePronunciationEvidence(audioScore, articulationScore)
      : null;

  const scorePercent =
    score01 != null
      ? Math.round(score01 * 100)
      : null;

  const mismatchCount =
    items.filter((item) => item?.audioMismatch === true).length +
    missingExpectedCount;

  const exactCount =
    items.filter((item) => item?.exactPhonemeMatch === true).length;

  let match = null;

  if (score01 != null) {
    if (score01 >= 0.93 && mismatchCount === 0) {
      match = 'exact';
    } else if (score01 >= 0.65) {
      match = 'close';
    } else if (score01 >= 0.35) {
      match = 'partial';
    } else {
      match = 'miss';
    }
  }

  return {
    scoreReady: score01 != null,
    score01,
    scorePercent,
    audioScore,
    segmentalAudioScore,
    articulationScore,
    match,
    mismatchCount,
    missingExpectedCount,
    exactCount,
  };
}

function buildOfficialPhonemeBreakdown(analysisItems, toDisplayToken) {
  const items = Array.isArray(analysisItems)
    ? analysisItems
    : [];

  return items.map((item) => {
    const finalScore = clampScore01(item?.finalScore);

    let status = 'incorrect';

    if (item?.exactPhonemeMatch === true) {
      status = 'correct';
    } else if (
      item?.audioMismatch === true &&
      finalScore != null &&
      finalScore >= 0.65
    ) {
      status = 'close';
    }

    const coachingTip =
      item?.coaching?.primary?.tip ??
      item?.coaching?.primary?.correction ??
      null;

    const feedbackText = Array.isArray(item?.feedback)
      ? item.feedback.filter(Boolean).join(' ')
      : '';

    return {
      phoneme: toDisplayToken(
        item?.detectedPhoneme ?? item?.phoneme ?? ''
      ),
      status,
      note: coachingTip || feedbackText || '',
      expectedPhoneme: item?.expectedPhoneme ?? null,
      detectedPhoneme: item?.detectedPhoneme ?? item?.phoneme ?? null,
      audioScore: item?.audioScore ?? null,
      articulationScore: item?.articulationScore ?? null,
      finalScore: item?.finalScore ?? null,
    };
  });
}

export default function Practice() {
  const { t, uiLanguage } = useLanguage();

  useEffect(() => {
    ensureTraceBuffer();
    clearTraceBuffer();
  }, []);

  const { nativeLanguage } = useLearningContext();

  const {
    activePracticePack,
    activePracticePackId,
    activePracticeLanguage,
    speechReady,
  } = usePlugin();

  const practiceLanguage = activePracticeLanguage;
  const navigate = useNavigate();
  const [showLangModal, setShowLangModal] = useState(false);

  const isRtlPractice =
    activePracticePack?.manifest?.textDirection === 'rtl';

  const moreWordsLanguage = nativeLanguage || uiLanguage;
  const visibleLanguageNames =
    translations[uiLanguage]?.languages ||
    translations.en?.languages ||
    {};
  const visibleUiLanguage = visibleLanguageNames[uiLanguage] || uiLanguage;
  const visiblePracticeLanguage =
    visibleLanguageNames[practiceLanguage] || practiceLanguage;

  // The visible label is localized by the active pack, but routing must remain
  // language-agnostic. Localized page names are not registered application URLs.
  const moreWordsPageName = 'MorePracticeWords';

  const moreWordsLabel =
    activePracticePack?.getMoreWordsLabel?.(moreWordsLanguage) ||
    {
      it: 'Più Parole',
      pt: 'Mais Palavras',
      de: 'Mehr Wörter',
      fr: 'Plus de mots',
      ja: 'もっと単語',
      zh: '更多单词',
    }[moreWordsLanguage] ||
    'More Practice Words';

  const urlParams = new URLSearchParams(window.location.search);
  const initialWord = urlParams.get('word') || '';

  const presetWordPairs = useMemo(() => {
    const items = activePracticePack?.getPresetWords?.(nativeLanguage) ?? [];
    const seen = new Set();

    return items.filter((item) => {
      const text = String(item?.practice || '').trim();
      const key = text.toLowerCase();

      if (!text) return false;
      if (seen.has(key)) return false;

      seen.add(key);
      return true;
    });
  }, [activePracticePack, nativeLanguage]);

  const presetPhrasePairs = useMemo(() => {
    const items = activePracticePack?.getPresetPhrases?.(nativeLanguage) ?? [];
    const seen = new Set();

    return items.filter((item) => {
      const text = String(item?.practice || '').trim();
      const key = `${String(item?.id || '').trim()}::${text.toLowerCase()}`;

      if (!text) return false;
      if (seen.has(key)) return false;

      seen.add(key);
      return true;
    });
  }, [activePracticePack, nativeLanguage]);

  const renderPresetChip = (item) => {
    const isRtlChip = !!item?.rtl;

    return (
      <button
        key={item.id}
        onClick={() => handleQuickWord(item.practice, item.meaning)}
        dir={isRtlChip ? 'rtl' : undefined}
        className={`px-3 py-1.5 rounded-full font-medium text-sm transition-all hover:brightness-110 active:scale-95 ${
          isRtlChip ? 'text-right' : 'text-left'
        }`}
        style={PILL_STYLE}
      >
        <div className="leading-tight">
          <span className="font-extrabold text-lg md:text-xl">{item.practice}</span>
        </div>
        {item.meaning && item.meaning !== item.practice && (
          <div className="text-xs opacity-80 leading-tight">{item.meaning}</div>
        )}
      </button>
    );
  };

  const [inputValue, setInputValue] = useState(initialWord);
  const [practiceTargetSource, setPracticeTargetSource] = useState(
    initialWord ? 'query/init' : 'empty'
  );

  const [activeCurriculumLesson, setActiveCurriculumLesson] = useState(
    urlParams.get('lessonId')
      ? {
          id: urlParams.get('lessonId'),
          word: urlParams.get('word') || '',
          passScore: urlParams.get('passScore')
            ? parseInt(urlParams.get('passScore'))
            : null,
        }
      : null
  );

  const [completedIds, setCompletedIds] = useState(() => {
    try {
      const s = localStorage.getItem(getCurriculumKey(practiceLanguage));
      return new Set(s ? JSON.parse(s) : []);
    } catch {
      return new Set();
    }
  });

  const lessonId = activeCurriculumLesson?.id ?? null;
  const passScore = activeCurriculumLesson?.passScore ?? null;

  const [sourceText, setSourceText] = useState('');
  const [helperText, setHelperText] = useState('');
  const [helperChunks, setHelperChunks] = useState(null);
  const [pronunciation, setPronunciation] = useState('');
  const [timeline, setTimeline] = useState(null);
  const [displayTimeline, setDisplayTimeline] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);

  const [playCount, setPlayCount] = useState(0);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [isUsingFallbackTTS, setIsUsingFallbackTTS] = useState(false);
  const [coachingData, setCoachingData] = useState(null);
  const [guidedRecovery, setGuidedRecovery] = useState(null);
  const [selectedPresetMeaning, setSelectedPresetMeaning] = useState(null);
  const [currentTraceToken, setCurrentTraceToken] = useState(null);
  const [isAnalyzingPhonemes, setIsAnalyzingPhonemes] = useState(false);
  const [phonemeAnalysisResult, setPhonemeAnalysisResult] = useState(null);
  const [phonemeAnalysisError, setPhonemeAnalysisError] = useState(null);
  const [referencePhonemesResult, setReferencePhonemesResult] = useState(null);

  const fullTargetText = (sourceText || inputValue || '').trim();
  const activeGuidedUnit = guidedRecovery?.active
    ? guidedRecovery.units?.[guidedRecovery.currentIndex] ?? null
    : null;
  const activeGuidedCue = useMemo(
    () => resolvePackGuidedCue(activePracticePack, activeGuidedUnit),
    [activePracticePack, activeGuidedUnit]
  );
  const activeGuidedPlayback = useMemo(
    () => activeGuidedCue
      ? buildGuidedCuePlayback(activePracticePack, activeGuidedCue)
      : null,
    [activePracticePack, activeGuidedCue]
  );
  const recordingTargetText =
    activeGuidedCue?.displayText || activeGuidedUnit?.display || fullTargetText;

  useEffect(() => {
    if (
      guidedRecovery?.active &&
      fullTargetText &&
      guidedRecovery.originalTargetText !== fullTargetText
    ) {
      setGuidedRecovery(null);
    }
  }, [fullTargetText, guidedRecovery]);

  const toDisplayToken = useCallback(
    (rawToken) => {
      if (!rawToken) return '';
      return activePracticePack?.getDisplayToken?.(rawToken) ?? String(rawToken);
    },
    [activePracticePack]
  );

  const sanitizeTranscript = useCallback(
    (text) => {
      if (activePracticePack?.sanitizeTranscript) {
        return activePracticePack.sanitizeTranscript(text);
      }
      if (!text) return '';
      return String(text).split(/\s+/).map(toDisplayToken).filter(Boolean).join(' ');
    },
    [activePracticePack, toDisplayToken]
  );

  const mappedDisplay = useMemo(() => {
    const list = phonemeAnalysisResult?.phonemes;
    if (!Array.isArray(list) || list.length === 0) return null;
    const raw = list.map((p) => String(p).trim()).filter(Boolean);
    const helpers = raw.map((p) => toDisplayToken(p)).filter(Boolean);
    return { raw, helpersString: helpers.join(' ') };
  }, [phonemeAnalysisResult, toDisplayToken]);

  const resolveDebounceRef = useRef(null);
  const synthDebounceRef = useRef(null);
  const synthGenRef = useRef(0);
  const synthRetryCountRef = useRef(0);

  const audioKeyRef = useRef('');
  const playbackAudioRef = useRef(null);
  if (!playbackAudioRef.current) {
    playbackAudioRef.current = new AudioPlayer();
  }

  const quickPracticeRef = useRef(false);
  const hasInitializedPracticePackRef = useRef(false);
  const previousPackIdRef = useRef(null);
  const currentTraceWordRef = useRef(null);
  const currentTraceTokenRef = useRef(null);
  const phrasePanelRef = useRef(null);
  const phraseChipContainerRef = useRef(null);
  const playbackRegionRef = useRef(null);
  const playGuardRef = useRef(false);
  const uasWarmupAttemptedRef = useRef(false);
  const latestLearningInputRef = useRef({
    targetText: '',
    expectedPhonemes: [],
    helperText: '',
    tones: [],
    syllables: [],
    prosodyUnits: [],
  });

  const startTraceForWord = useCallback(
    (word, stage = 'unknown') => {
      const traceToken = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      currentTraceWordRef.current = word;
      currentTraceTokenRef.current = traceToken;
      setCurrentTraceToken(traceToken);
      clearTraceBuffer();
      const payload = {
        traceToken,
        stage,
        selectedWord: word,
        activePracticePackId,
        practiceLanguage,
      };
      pushTrace('interaction start', payload);
      return traceToken;
    },
    [activePracticePackId, practiceLanguage]
  );

  const getTraceTokenForWord = useCallback(
    (word, stage = 'unknown') => {
      const expectedTraceToken = currentTraceTokenRef.current;
      if (expectedTraceToken && currentTraceWordRef.current === word) {
        return expectedTraceToken;
      }



      return startTraceForWord(word, stage);
    },
    [activePracticePackId, startTraceForWord]
  );

  const clearWordQueryParam = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    if (!params.has('word')) return;
    params.delete('word');
    const next = `${window.location.pathname}${
      params.toString() ? `?${params.toString()}` : ''
    }`;
    window.history.replaceState({}, '', next);
  }, []);

  const isTargetCompatibleWithPack = useCallback((target, packLanguage) => {
    const value = (target || '').trim();
    if (!value) return true;

    if (typeof activePracticePack?.isTargetCompatible === 'function') {
      return activePracticePack.isTargetCompatible(value);
    }

    const tests = {
      zh: /[㐀-鿿]/,
      ja: /[぀-ヿ㐀-鿿]/,
      en: /^[\p{Script=Latin}\p{N}\p{P}\s]+$/u,
      fr: /^[\p{Script=Latin}\p{N}\p{P}\s]+$/u,
      de: /^[\p{Script=Latin}\p{N}\p{P}\s]+$/u,
      it: /^[\p{Script=Latin}\p{N}\p{P}\s]+$/u,
      pt: /^[\p{Script=Latin}\p{N}\p{P}\s]+$/u,
    };

    const matcher = tests[packLanguage];
    return matcher ? matcher.test(value) : true;
  }, [activePracticePack]);

  const getPlaybackDurationMs = () => {
    const p = playbackAudioRef.current;
    if (!p) return 0;
    const seconds = p.duration || 0;
    return Math.max(0, Math.round(seconds * 1000));
  };

  useEffect(() => {
    if (!activePracticePackId) return;


    const previousPackId = previousPackIdRef.current;

    const incomingTarget = inputValue.trim();
    if (!incomingTarget) {
      previousPackIdRef.current = activePracticePackId;
      return;
    }

    const compatible = isTargetCompatibleWithPack(incomingTarget, practiceLanguage);
    const actionTaken = compatible ? 'kept' : 'cleared';
    const reason = compatible
      ? 'target_compatible_with_pack'
      : 'target_incompatible_with_pack';


    if (!compatible) {
      setInputValue('');
      setSourceText('');
      setHelperText('');
      setHelperChunks(null);
      setPronunciation('');
      setTimeline(null);
      setDisplayTimeline(null);
      setAudioUrl(null);
      setSelectedPresetMeaning(null);
      setPracticeTargetSource('empty');
      setActiveCurriculumLesson(null);
      clearWordQueryParam();
    }

    previousPackIdRef.current = activePracticePackId;
  }, [
    activePracticePackId,
    clearWordQueryParam,
    initialWord,
    inputValue,
    isTargetCompatibleWithPack,
    practiceLanguage,
    practiceTargetSource,
  ]);

  const resolvePhonemes = useCallback(
    (text) => {
      const trimmed = text.trim();
      if (!trimmed || !activePracticePack || !speechReady) {
        setSourceText('');
        setHelperText('');
        setHelperChunks(null);
        setPronunciation('');
        setTimeline(null);
        setDisplayTimeline(null);
        setAudioUrl(null);
        return null;
      }

      const systemText = activePracticePack.preparePracticeText?.(trimmed) ?? trimmed;
      if (!isTargetCompatibleWithPack(systemText, practiceLanguage)) {
        console.log('[PACK/TEXT BUG] display target', {
          activePracticePackId,
          displayedTarget: systemText,
          targetSource: practiceTargetSource,
        });
        return null;
      }

      const traceToken = getTraceTokenForWord(systemText, 'display');

      if (typeof activePracticePack?.preparePlayback === 'function') {
        const prep = activePracticePack.preparePlayback(systemText) || null;
        if (!prep) {
          setSourceText('');
          setHelperText('');
          setHelperChunks(null);
          setPronunciation('');
          setTimeline(null);
          setDisplayTimeline(null);
          setAudioUrl(null);
          return null;
        }

        const ttsText = prep.ttsText ?? systemText;
        setSourceText(ttsText);
        const helperTxt = prep.helperText ?? '';
        setHelperText(helperTxt);
        setHelperChunks(prep.helperChunks ?? null);
        setPronunciation(prep.pronunciation ?? '');
        setTimeline(prep.timeline ?? null);

        pushTrace('resolver entry', {
          traceToken,
          practiceLanguage,
          selectedWord: ttsText,
          activePracticePackId,
          resolverSource: activePracticePack?.packId ?? 'unknown',
        });
        pushTrace('resolver result', {
          practiceLanguage,
          selectedWord: ttsText,
          hasTimeline: !!prep?.timeline,
          timelineLength: prep?.timeline?.length ?? 0,
        });
        pushTrace('helper payload', {
          traceToken,
          practiceLanguage,
          selectedWord: ttsText,
          activePracticePackId,
          helperText: helperTxt,
          helperSource: activePracticePack?.packId ?? 'unknown',
        });

        return {
          ttsText,
          result: null,
          animationTimeline: prep.timeline ?? null,
          airflowTimeline: null,
          helperData: {
            helperText: helperTxt,
            helperChunks: prep.helperChunks ?? null,
            pronunciation: prep.pronunciation ?? '',
          },
        };
      }

      setSourceText(systemText);

      const result = activePracticePack.resolveUnits(systemText);
      if (!result) {
        setHelperText('');
        setHelperChunks(null);
        setPronunciation('');
        setTimeline(null);
        return null;
      }

      const animationTimeline = activePracticePack.buildAnimationTimeline(result);
      const airflowTimeline = activePracticePack.buildAirflowTimeline(result);
      const helperData = activePracticePack.buildHelperData(result);
      const frontFrameMap = activePracticePack.getFrontFrameMap();
      const sideFrameMap = activePracticePack.getSideFrameMap();

      if (!animationTimeline) {
        setHelperText('');
        setHelperChunks(null);
        setPronunciation('');
        setTimeline(null);
        return null;
      }

      pushTrace('resolver entry', {
        traceToken,
        practiceLanguage,
        selectedWord: systemText,
        activePracticePackId,
        resolverSource: activePracticePack.packId,
      });

      pushTrace('resolver result', {
        practiceLanguage,
        selectedWord: systemText,
        hasTimeline: !!animationTimeline,
        timelineLength: animationTimeline?.length,
        hasResolvedWords: !!result?.resolvedWords,
      });

      const resolvedHelperText = helperData?.helperText ?? '';

      pushTrace('helper payload', {
        traceToken,
        practiceLanguage,
        selectedWord: systemText,
        activePracticePackId,
        helperText: resolvedHelperText,
        helperSource: activePracticePack.packId,
      });


      setHelperText(resolvedHelperText);
      setHelperChunks(result?.helperChunks ?? null);
      setPronunciation(helperData?.pronunciation ?? '');
      setTimeline(animationTimeline);

      return {
        ttsText: systemText,
        result,
        animationTimeline,
        airflowTimeline,
        helperData,
      };
    },
    [
      activePracticePack,
      activePracticePackId,
      practiceLanguage,
      practiceTargetSource,
      sourceText,
      speechReady,
      isTargetCompatibleWithPack,
      getTraceTokenForWord,
    ]
  );

  const handleExitGuidedRecovery = useCallback(() => {
    const restoredTarget = String(
      guidedRecovery?.originalTargetText ||
      coachingData?.guidedRecovery?.originalTargetText ||
      fullTargetText ||
      ''
    ).trim();

    synthGenRef.current += 1;
    const player = playbackAudioRef.current;
    player?.pause();
    player?.setSource(null);
    audioKeyRef.current = '';
    setAudioUrl(null);
    setDisplayTimeline(null);
    setTimeline(null);
    setIsLoadingAudio(false);
    setGuidedRecovery(null);
    setCoachingData((current) => current
      ? {
          ...current,
          guidedRecovery: {
            active: false,
            exited: true,
            originalTargetText:
              current.guidedRecovery?.originalTargetText || restoredTarget,
          },
        }
      : current
    );

    if (restoredTarget) {
      setInputValue(restoredTarget);
      resolvePhonemes(restoredTarget);
    }
  }, [coachingData, fullTargetText, guidedRecovery, resolvePhonemes]);

  const synthesizeAudio = useCallback(
    async (text, options = {}) => {
      const preparedPlayback = options?.preparedPlayback ?? null;
      const audioCacheKey =
        options?.audioCacheKey ?? `${practiceLanguage}::${text}`;
      const preserveTarget = options?.preserveTarget === true;
      const resolved = preserveTarget && preparedPlayback
        ? {
            ttsText: preparedPlayback.ttsText || text,
            result: {
              helperChunks: preparedPlayback.helperChunks ?? null,
            },
            animationTimeline: preparedPlayback.timeline ?? null,
          }
        : resolvePhonemes(text);
      if (!resolved) {
        setIsLoadingAudio(false);
        return null;
      }

      const { ttsText } = resolved;
      let learningInput = null;
      if (
        !preserveTarget &&
        typeof activePracticePack?.prepareLearningInput === 'function'
      ) {
        learningInput = activePracticePack.prepareLearningInput(ttsText);
        latestLearningInputRef.current = {
          targetText: ttsText,
          expectedPhonemes: Array.isArray(learningInput?.expectedPhonemes) ? learningInput.expectedPhonemes : [],
          helperText: learningInput?.helperText ?? '',
          tones: learningInput?.tones ?? [],
          syllables: learningInput?.syllables ?? [],
          prosodyUnits: learningInput?.prosodyUnits ?? [],
        };
      }
      const prep =
        preparedPlayback ?? (
        typeof activePracticePack?.preparePlayback === 'function'
          ? activePracticePack.preparePlayback(ttsText)
          : null);

      const baseTimelineFromPrep = prep?.timeline ?? resolved.animationTimeline;
      const wordTexts = Array.isArray(learningInput?.tokenGroups)
        ? learningInput.tokenGroups.map((group) => group?.word).filter(Boolean)
        : [];

      synthGenRef.current += 1;
      const myGen = synthGenRef.current;
      setAudioUrl(null);
      setIsLoadingAudio(true);
      setIsUsingFallbackTTS(false);

      try {
        let audioUrlLocal = null;
        let analysisAudioUrl = null;
        let phraseDurationMs = null;

        if (typeof activePracticePack?.preparePlaybackWithAudio === 'function') {
          const full = await activePracticePack.preparePlaybackWithAudio(
            ttsText,
            {
              preparedPlayback,
              targetSource: options?.targetSource ?? practiceTargetSource,
            }
          );
          analysisAudioUrl = full?.audioUrl ?? null;
          audioUrlLocal = analysisAudioUrl;

        } else {
          const ProviderClass = activePracticePack?.Provider;
          const provider = ProviderClass
            ? new ProviderClass(
                activePracticePack?.PhonemeResolver,
                activePracticePack?.getProviderOptions?.()
              )
            : null;

          const analysisSpeechRate =
            activePracticePack?.manifest?.analysisSpeechRate ?? 1.0;

          const teachingSpeechRate =
            activePracticePack?.manifest?.teachingSpeechRate ??
            activePracticePack?.manifest?.speechRate ??
            undefined;

          const analysisAudioResult = await provider?.synthesize(
            ttsText,
            practiceLanguage,
            { speechRate: analysisSpeechRate }
          );
          analysisAudioUrl = analysisAudioResult?.audio ?? null;

          const teachingAudioResult = await provider?.synthesize(
            ttsText,
            practiceLanguage,
            teachingSpeechRate != null ? { speechRate: teachingSpeechRate } : {}
          );
          audioUrlLocal = teachingAudioResult?.audio ?? null;


        }

        if (synthGenRef.current !== myGen) return null;

        if (!audioUrlLocal) {
          setIsUsingFallbackTTS(false);
          const player = playbackAudioRef.current;
          player?.pause();
          player?.setSource(null);
          setAudioUrl(null);
          return { audio: null, timeline: null, helperChunks: null };
        }

        synthRetryCountRef.current = 0;
        audioKeyRef.current = audioCacheKey;
        setAudioUrl(audioUrlLocal);

        const player = playbackAudioRef.current;
        player?.setSource(audioUrlLocal);

        await new Promise((resolve) => {
          if (!player) return resolve();

          if (player.duration && player.duration > 0) {
            return resolve();
          }

          let settled = false;

          const done = () => {
            if (settled) return;
            settled = true;
            player.removeEventListener('loadedmetadata', done);
            player.removeEventListener('durationchange', done);
            player.removeEventListener('loadeddata', done);
            player.removeEventListener('canplaythrough', done);
            player.removeEventListener('error', done);
            clearTimeout(timer);
            resolve();
          };

          const timer = setTimeout(done, 1500);

          player.addEventListener('loadedmetadata', done);
          player.addEventListener('durationchange', done);
          player.addEventListener('loadeddata', done);
          player.addEventListener('canplaythrough', done);
          player.addEventListener('error', done);
        });

        let audioDurationMs = phraseDurationMs ?? getPlaybackDurationMs();
        if (audioDurationMs <= 0 && player) {
          await new Promise((resolve) => {
            let settled = false;
            const done = () => {
              if (settled) return;
              settled = true;
              player.removeEventListener('durationchange', onChange);
              player.removeEventListener('loadeddata', onChange);
              player.removeEventListener('canplaythrough', onChange);
              clearTimeout(timer);
              resolve();
            };
            const onChange = () => {
              if (player.duration && player.duration > 0) done();
            };
            const timer = setTimeout(done, 5500);
            player.addEventListener('durationchange', onChange);
            player.addEventListener('loadeddata', onChange);
            player.addEventListener('canplaythrough', onChange);
          });
          audioDurationMs = getPlaybackDurationMs();
        }
        if (audioDurationMs <= 0) {
          return null;
        }
        if (synthGenRef.current !== myGen) return null;

        if (audioDurationMs > 0 && baseTimelineFromPrep?.length > 0) {
          let cursor = 0;
          const normalized = baseTimelineFromPrep.map((e) => {
            const hold = e.hold ?? e.duration ?? 0;
            const transition = e.transition ?? 0;
            const start = e.startMs ?? e.start ?? cursor;
            const end = e.endMs ?? e.end ?? start + hold + transition;
            cursor = end;
            return { ...e, startMs: start, endMs: end };
          });

          const baseDurationMs = Math.max(
            normalized[normalized.length - 1]?.endMs ?? 0,
            1
          );
          const scale = audioDurationMs / baseDurationMs;

          const scaledTimeline = scaleTimelineToAudio(normalized, audioDurationMs);
          console.log('[TRACE synth] scale', {
            audioDurationMs,
            baseDurationMs,
            scale: Number(scale.toFixed(3)),
            first3: scaledTimeline
              .slice(0, 3)
              .map((e) => ({ ph: e.phoneme, fr: e.frame, s: e.startMs, e: e.endMs })),
          });
          setTimeline(scaledTimeline);

          const baseHelperChunks =
            typeof activePracticePack?.preparePlayback === 'function'
              ? prep?.helperChunks ?? null
              : resolved.result?.helperChunks ?? null;

          let scaledHelperChunks = null;
          if (baseHelperChunks?.length) {
            scaledHelperChunks = baseHelperChunks.map((chunk) => ({
              ...chunk,
              startMs: Math.round((chunk.startMs ?? 0) * scale),
              endMs: Math.round((chunk.endMs ?? 0) * scale),
            }));
            console.log('[TRACE synth] helperScale', {
              count: baseHelperChunks.length,
              first3: scaledHelperChunks.slice(0, 3),
            });
            setHelperChunks(scaledHelperChunks);
          }

          return {
            audio: audioUrlLocal,
            timeline: scaledTimeline,
            helperChunks: scaledHelperChunks,
          };
        }

        return { audio: audioUrlLocal, timeline: null, helperChunks: null };
      } catch (err) {
        console.warn('[Practice] synth failed:', err?.message || err);

        const retryDelaysMs = [1500, 3000];
        const retryIndex = synthRetryCountRef.current;

        if (retryIndex < retryDelaysMs.length) {
          synthRetryCountRef.current += 1;
          await new Promise((resolve) => setTimeout(resolve, retryDelaysMs[retryIndex]));
          return synthesizeAudio(text, options);
        }

        synthRetryCountRef.current = 0;
        setIsUsingFallbackTTS(true);
        return null;
      } finally {
        if (synthGenRef.current === myGen) {
          setIsLoadingAudio(false);
        }
      }
    },
    [
      practiceLanguage,
      resolvePhonemes,
      activePracticePack,
      activePracticePackId,
      practiceTargetSource,
    ]
  );

  useEffect(() => {
    setDisplayTimeline(null);
  }, [inputValue, activePracticePackId, practiceLanguage]);

  useEffect(() => {
    const target = (sourceText || inputValue || '').trim();
    const expectedKey = `${practiceLanguage}::${target}`;
    const currentKey = audioKeyRef.current;

    if (!target || (currentKey && currentKey !== expectedKey)) {
      const player = playbackAudioRef.current;
      player?.pause();
      player?.setSource(null);
      audioKeyRef.current = '';
      setAudioUrl(null);
      setDisplayTimeline(null);
    }
  }, [sourceText, inputValue, practiceLanguage]);

  useEffect(() => {
    clearTimeout(resolveDebounceRef.current);
    if (typeof activePracticePack?.preparePlayback === 'function') {
      resolvePhonemes(inputValue);
    } else {
      resolveDebounceRef.current = setTimeout(
        () => resolvePhonemes(inputValue),
        120
      );
    }
    return () => {
      clearTimeout(resolveDebounceRef.current);
    };
  }, [inputValue, resolvePhonemes, activePracticePack]);

  useEffect(() => {
    if (!inputValue.trim()) return;
    if (speechReady && activePracticePack) resolvePhonemes(inputValue);
  }, [activePracticePack, speechReady, inputValue, resolvePhonemes]);

  useEffect(() => {
    clearTimeout(synthDebounceRef.current);
    return () => {
      clearTimeout(synthDebounceRef.current);
    };
  }, []);

  useEffect(() => {
    if (!hasInitializedPracticePackRef.current) {
      hasInitializedPracticePackRef.current = true;
      return;
    }

    setInputValue('');
    setSourceText('');
    setHelperText('');
    setPronunciation('');
    setTimeline(null);
    setDisplayTimeline(null);
    setAudioUrl(null);
    setSelectedPresetMeaning(null);
    setGuidedRecovery(null);
    quickPracticeRef.current = false;
  }, [practiceLanguage]);

  const handlePlay = useCallback(async () => {
    if (playGuardRef.current) {
      return;
    }
    playGuardRef.current = true;
    setIsUsingFallbackTTS(false);

    const ap = playbackAudioRef.current;
    ap?.pause();

    const normalTarget = sourceText || inputValue;
    const guidedPlayback = activeGuidedPlayback;
    const selectedWord = guidedPlayback?.ttsText || normalTarget;
    const traceToken = getTraceTokenForWord(selectedWord, 'play');

    const selectedAudioKey = guidedPlayback
      ? `${practiceLanguage}::guided::${selectedWord}::${guidedPlayback.ttsSsml || guidedPlayback.pronunciation || 'phonetic'}`
      : `${practiceLanguage}::${practiceTargetSource === 'custom input' ? 'custom::' : ''}${selectedWord}`;

    if (!selectedWord.trim()) {
      playGuardRef.current = false;
      return;
    }

    const resolvedNow = guidedPlayback
      ? {
          animationTimeline: guidedPlayback.timeline,
          result: { helperChunks: guidedPlayback.helperChunks },
        }
      : typeof activePracticePack?.preparePlayback === 'function'
        ? (() => {
            const prep = activePracticePack.preparePlayback(selectedWord) || null;
            return {
              animationTimeline: prep?.timeline ?? null,
              result: { helperChunks: prep?.helperChunks ?? null },
            };
          })()
        : resolvePhonemes(selectedWord);

    const activeTimeline =
      audioKeyRef.current === selectedAudioKey && timeline?.length
        ? timeline
        : resolvedNow?.animationTimeline ?? [];
    if (!activeTimeline?.length) {
      playGuardRef.current = false;
      return;
    }

    pushTrace('play trigger', {
      traceToken,
      practiceLanguage,
      selectedWord,
      activePracticePackId,
      timestamp: Date.now(),
    });

    if (diagnosticTraceMode) {
      setDisplayTimeline(activeTimeline);
      setPlayCount((n) => n + 1);
      playGuardRef.current = false;
      return;
    }

    if (!audioUrl || audioKeyRef.current !== selectedAudioKey) {
      const result = await synthesizeAudio(
        selectedWord,
        guidedPlayback
          ? {
              preserveTarget: true,
              preparedPlayback: guidedPlayback,
              audioCacheKey: selectedAudioKey,
            }
          : {
              audioCacheKey: selectedAudioKey,
              targetSource: practiceTargetSource,
            }
      );

      if (!result?.audio) {
        playGuardRef.current = false;
        return null;
      }

      const immediateTimeline = result.timeline ?? activeTimeline;
      if (immediateTimeline?.length) {
        setTimeline(immediateTimeline);
        setHelperChunks(result.helperChunks ?? helperChunks);
        setDisplayTimeline(immediateTimeline);
        setPlayCount((n) => n + 1);
        playGuardRef.current = false;
        return;
      }
      playGuardRef.current = false;
      return null;
    }

    setDisplayTimeline(activeTimeline);
    setPlayCount((n) => n + 1);
    playGuardRef.current = false;
  }, [
    activePracticePack,
    activePracticePackId,
    activeGuidedPlayback,
    helperChunks,
    inputValue,
    practiceLanguage,
    practiceTargetSource,
    resolvePhonemes,
    sourceText,
    synthesizeAudio,
    timeline,
    getTraceTokenForWord,
    audioUrl,
  ]);

  const handleAnimationComplete = () => {
    setIsUsingFallbackTTS(false);
  };

  const handleInputChange = (e) => {
    setSelectedPresetMeaning(null);
    setPracticeTargetSource(e.target.value.trim() ? 'custom input' : 'empty');
    setInputValue(e.target.value);
  };

  const handleInputKeyPress = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) handlePlay();
  };

  const handleKey = (key) => {
    setSelectedPresetMeaning(null);
    setPracticeTargetSource('custom input');
    setInputValue((v) => {
      const base = quickPracticeRef.current ? '' : v;
      quickPracticeRef.current = false;
      const nextTarget =
        key === '⌫'
          ? base
            ? base.slice(0, -1)
            : v.slice(0, -1)
          : key === ' '
          ? base + ' '
          : base + key.toLowerCase();

      return nextTarget;
    });
  };

  const handleQuickWord = (word, meaning = null) => {
    if (guidedRecovery?.active) {
      handleExitGuidedRecovery();
    }
    startTraceForWord(word, 'click');
    quickPracticeRef.current = true;
    setSelectedPresetMeaning(meaning);
    setPracticeTargetSource('preset');
    setInputValue(word);

    setTimeout(() => {
      synthesizeAudio(word, { targetSource: 'preset' })
        .then((result) => {
          if (!result?.audio) {
            setIsUsingFallbackTTS(false);
          }
        })
        .catch(() => {
          setIsUsingFallbackTTS(false);
        });
    }, 0);
  };

  const handleLessonSelect = async (lesson) => {
    startTraceForWord(lesson.word, 'lesson-select');
    quickPracticeRef.current = true;
    setPracticeTargetSource('query/init');
    setInputValue(lesson.word);
    setActiveCurriculumLesson(lesson);
    setCoachingData(null);
  };


  async function blobToWavBase64(blob, debugSource = "unknown") {
    const arrayBuffer = await blob.arrayBuffer();
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioCtx();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer.slice(0));

    const srcLength = audioBuffer.length;
    const srcRate = audioBuffer.sampleRate;
    const channels = audioBuffer.numberOfChannels;
    const srcDurationSec = audioBuffer.duration || (srcRate ? srcLength / srcRate : 0);

    const mono = new Float32Array(srcLength);
    for (let ch = 0; ch < channels; ch++) {
      const data = audioBuffer.getChannelData(ch);
      for (let i = 0; i < srcLength; i++) mono[i] += data[i] / channels;
    }

    let monoPeak = 0;
    let monoSumSq = 0;
    let monoNonZero = 0;
    for (let i = 0; i < mono.length; i++) {
      const v = mono[i];
      const av = Math.abs(v);
      if (av > monoPeak) monoPeak = av;
      monoSumSq += v * v;
      if (av > 1e-5) monoNonZero += 1;
    }
    const monoRms = mono.length ? Math.sqrt(monoSumSq / mono.length) : 0;

    const targetRate = 16000;
    let resampled = mono;
    if (srcRate !== targetRate) {
      const ratio = targetRate / srcRate;
      const outLen = Math.max(1, Math.round(mono.length * ratio));
      const out = new Float32Array(outLen);
      for (let i = 0; i < outLen; i++) {
        const pos = i / ratio;
        const left = Math.floor(pos);
        const right = Math.min(left + 1, mono.length - 1);
        const t = pos - left;
        out[i] = mono[left] * (1 - t) + mono[right] * t;
      }
      resampled = out;
    }

    let resampledPeak = 0;
    let resampledSumSq = 0;
    let resampledNonZero = 0;
    let leadingNearZero = 0;
    let seenNonZero = false;

    for (let i = 0; i < resampled.length; i++) {
      const v = resampled[i];
      const av = Math.abs(v);
      if (av > resampledPeak) resampledPeak = av;
      resampledSumSq += v * v;
      if (av > 1e-5) {
        resampledNonZero += 1;
        if (!seenNonZero) seenNonZero = true;
      } else if (!seenNonZero) {
        leadingNearZero += 1;
      }
    }

    const resampledRms = resampled.length ? Math.sqrt(resampledSumSq / resampled.length) : 0;
    const resampledDurationSec = targetRate ? resampled.length / targetRate : 0;
    const leadingSilenceMs = targetRate
      ? Math.round((leadingNearZero / targetRate) * 1000)
      : 0;

    if (resampledPeak > 1) {
      const scale = 1 / resampledPeak;
      for (let i = 0; i < resampled.length; i++) resampled[i] *= scale;
    }

    const frontPaddingMs = debugSource === 'tts-reference' ? 750 : 0;
    if (debugSource === 'tts-reference') {
      const frontPadSamples = Math.round(targetRate * 0.75);
      const padded = new Float32Array(frontPadSamples + resampled.length);
      padded.set(resampled, frontPadSamples);
      resampled = padded;
    }

    const finalDurationSec = targetRate ? resampled.length / targetRate : 0;

    console.log('[WAV DEBUG]', {
      debugSource,
      blobType: blob?.type || 'unknown',
      sourceSampleRate: srcRate,
      sourceChannels: channels,
      sourceFrames: srcLength,
      sourceDurationSec: Number(srcDurationSec.toFixed(3)),
      monoPeak: Number(monoPeak.toFixed(6)),
      monoRms: Number(monoRms.toFixed(6)),
      monoNonZeroSamples: monoNonZero,
      monoNonZeroRatio: mono.length ? Number((monoNonZero / mono.length).toFixed(6)) : 0,
      targetSampleRate: targetRate,
      resampledFrames: resampled.length,
      resampledDurationSec: Number(resampledDurationSec.toFixed(3)),
      resampledPeak: Number(resampledPeak.toFixed(6)),
      resampledRms: Number(resampledRms.toFixed(6)),
      resampledNonZeroSamples: resampledNonZero,
      resampledNonZeroRatio: resampled.length
        ? Number((resampledNonZero / resampled.length).toFixed(6))
        : 0,
      leadingSilenceMs,
      frontPaddingMs,
      finalFrames: resampled.length,
      finalDurationSec: Number(finalDurationSec.toFixed(3)),
    });

    return resampled;
  }

  async function blobToMinimalFloat32(blob) {
    const arrayBuffer = await blob.arrayBuffer();
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioCtx();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer.slice(0));

    const srcLength = audioBuffer.length;
    const srcRate = audioBuffer.sampleRate;
    const channels = audioBuffer.numberOfChannels;
    const primaryChannel = channels > 0 ? audioBuffer.getChannelData(0) : new Float32Array(0);
    const sourceData = primaryChannel?.length
      ? primaryChannel
      : channels > 1
        ? audioBuffer.getChannelData(1)
        : new Float32Array(0);

    const targetRate = 16000;
    let output = new Float32Array(sourceData);

    if (srcRate !== targetRate) {
      const ratio = targetRate / srcRate;
      const outLen = Math.max(1, Math.round(sourceData.length * ratio));
      const out = new Float32Array(outLen);
      for (let i = 0; i < outLen; i++) {
        const pos = i / ratio;
        const left = Math.floor(pos);
        const right = Math.min(left + 1, sourceData.length - 1);
        const t = pos - left;
        out[i] = sourceData[left] * (1 - t) + sourceData[right] * t;
      }
      output = out;
    }

    let peak = 0;
    let sumSq = 0;
    let leadingNearZero = 0;
    let seenNonZero = false;
    let first500Peak = 0;
    let first2000Peak = 0;

    for (let i = 0; i < output.length; i++) {
      const v = output[i];
      const av = Math.abs(v);
      if (av > peak) peak = av;
      sumSq += v * v;
      if (i < 500 && av > first500Peak) first500Peak = av;
      if (i < 2000 && av > first2000Peak) first2000Peak = av;
      if (av > 1e-5) {
        if (!seenNonZero) seenNonZero = true;
      } else if (!seenNonZero) {
        leadingNearZero += 1;
      }
    }

    if (peak > 1) {
      const scale = 1 / peak;
      for (let i = 0; i < output.length; i++) {
        output[i] *= scale;
      }
      peak = 1;
      first500Peak = Math.min(first500Peak * scale, 1);
      first2000Peak = Math.min(first2000Peak * scale, 1);
      sumSq = 0;
      for (let i = 0; i < output.length; i++) {
        sumSq += output[i] * output[i];
      }
    }

    const rms = output.length ? Math.sqrt(sumSq / output.length) : 0;
    const finalDurationSec = targetRate ? output.length / targetRate : 0;
    const leadingSilenceMs = targetRate ? Math.round((leadingNearZero / targetRate) * 1000) : 0;

    console.log('[UAS MINIMAL FLOAT32 DEBUG]', {
      sourceSampleRate: srcRate,
      sourceChannels: channels,
      sourceFrames: srcLength,
      finalFrames: output.length,
      finalDurationSec: Number(finalDurationSec.toFixed(3)),
      peak: Number(peak.toFixed(6)),
      rms: Number(rms.toFixed(6)),
      first500Peak: Number(first500Peak.toFixed(6)),
      first2000Peak: Number(first2000Peak.toFixed(6)),
      leadingSilenceMs,
    });

    return output;
  }

  function buildAudioActivitySegments(float32Audio, sampleRate) {
    const audio = float32Audio instanceof Float32Array
      ? float32Audio
      : new Float32Array(float32Audio || []);
    const sr = Number(sampleRate) || 16000;
    const totalSamples = audio.length;
    const totalDurationMs = sr > 0 ? (totalSamples / sr) * 1000 : 0;

    return {
      sampleRate: sr,
      totalSamples,
      totalDurationMs: Number(totalDurationMs.toFixed(1)),
      thresholdUsed: 0,
      firstSoundMs: null,
      lastSoundMs: null,
      segments: [],
      gaps: []
    };
  }

  function buildFloat32WithActivitySpacers(float32Audio, sampleRate, activitySegments, insertedSpacerMs = 500) {
    const audio = float32Audio instanceof Float32Array
      ? float32Audio
      : new Float32Array(float32Audio || []);
    const sr = Number(sampleRate) || 16000;
    const diagnostics = activitySegments || buildAudioActivitySegments(audio, sr);
    const segments = Array.isArray(diagnostics?.segments) ? diagnostics.segments : [];

    if (!audio.length || !segments.length) {
      console.log('[UAS ACTIVITY SPACER BUILD]', {
        originalSamples: audio.length,
        originalDurationMs: sr ? Math.round((audio.length / sr) * 1000) : 0,
        segmentCount: segments.length,
        insertedSpacerMs,
        finalSamples: audio.length,
        finalDurationMs: sr ? Math.round((audio.length / sr) * 1000) : 0,
        first5Segments: segments.slice(0, 5),
        first5Gaps: Array.isArray(diagnostics?.gaps) ? diagnostics.gaps.slice(0, 5) : [],
      });

      return {
        spacedAudio: audio,
        insertedSpacerMs,
        activitySegments: diagnostics,
      };
    }

    const spacerSamples = Math.max(0, Math.round((sr * insertedSpacerMs) / 1000));
    const rebuiltParts = [];
    let finalSamples = 0;

    segments.forEach((segment, index) => {
      const startSample = Math.max(0, Math.min(audio.length, Math.round((segment.startMs / 1000) * sr)));
      const endSample = Math.max(startSample, Math.min(audio.length, Math.round((segment.endMs / 1000) * sr)));
      const slice = audio.slice(startSample, endSample);
      rebuiltParts.push(slice);
      finalSamples += slice.length;

      if (index < segments.length - 1 && spacerSamples > 0) {
        rebuiltParts.push(new Float32Array(spacerSamples));
        finalSamples += spacerSamples;
      }
    });

    const spacedAudio = new Float32Array(finalSamples);
    let offset = 0;
    for (const part of rebuiltParts) {
      spacedAudio.set(part, offset);
      offset += part.length;
    }

    console.log('[UAS ACTIVITY SPACER BUILD]', {
      originalSamples: audio.length,
      originalDurationMs: sr ? Math.round((audio.length / sr) * 1000) : 0,
      segmentCount: segments.length,
      insertedSpacerMs,
      finalSamples: spacedAudio.length,
      finalDurationMs: sr ? Math.round((spacedAudio.length / sr) * 1000) : 0,
      first5Segments: segments.slice(0, 5),
      first5Gaps: Array.isArray(diagnostics?.gaps) ? diagnostics.gaps.slice(0, 5) : [],
    });

    return {
      spacedAudio,
      insertedSpacerMs,
      activitySegments: diagnostics,
    };
  }

  const WAVE2VEC_BACKEND_URL =
    'https://soundmirror-wav2vec-backend-304389051034.us-central1.run.app/analyze';

  async function analyzePracticeAudioBackend(
    preparedAudio,
    sampleRate,
    activePracticePackId,
    practiceLanguage,
    targetText,
    options = {}
  ) {
    console.log('[UAS AUDIO INPUT MODE]', UAS_AUDIO_INPUT_MODE);

    const visibleTargetText = targetText || '';
    const uasTargetText =
      UAS_TARGET_TEXT_MODE === 'word_token_spacers'
        ? visibleTargetText
            .toLowerCase()
            .replace(/[.,!?;:]+$/g, '')
            .trim()
            .split(/\s+/)
            .filter(Boolean)
            .join(' | ')
        : visibleTargetText;

    console.log('[UAS TARGET TEXT MODE]');
    console.log(UAS_TARGET_TEXT_MODE);
    console.log('[UAS TARGET TEXT SENT]', {
      visibleTargetText,
      uasTargetText,
    });

    if (
      UAS_AUDIO_INPUT_MODE !== 'raw_blob_base64' &&
      preparedAudio instanceof Float32Array
    ) {
      try {
        if (options?.isWarmup) {
          await preloadBrowserPhonemeModel();
          return {
            provider: 'wav2vec2-onnx-int8-browser',
            phonemes: [],
            timestamps: [],
            ready: true,
          };
        }

        console.log('[BROWSER PHONEME] analysis starting', {
          samples: preparedAudio.length,
          sampleRate,
        });

        const localResult = await analyzeBrowserPhonemes(preparedAudio);
        console.log('[BROWSER PHONEME] analysis complete', localResult);

        return {
          ...localResult,
          timestamps: Array.isArray(localResult?.timestamps)
            ? localResult.timestamps
            : [],
        };
      } catch (error) {
        console.warn(
          '[BROWSER PHONEME] local analysis failed; using Cloud Run fallback',
          error?.message || error
        );
      }
    }

    const payload =
      UAS_AUDIO_INPUT_MODE === 'raw_blob_base64'
        ? {
            rawAudioBase64: options?.rawAudioBase64,
            rawAudioMimeType: options?.rawAudioMimeType,
            processingMode: 'raw_blob_base64',
            packId: activePracticePackId,
            language: practiceLanguage,
            targetText: uasTargetText,
            ...(options?.isWarmup ? { isWarmup: true } : {}),
          }
        : {
            audioFloat32: Array.from(preparedAudio || []),
            sampleRate: 16000,
            packId: activePracticePackId,
            language: practiceLanguage,
            targetText: uasTargetText,
            ...(options?.isWarmup ? { isWarmup: true } : {}),
          };

    if (UAS_AUDIO_INPUT_MODE === 'raw_blob_base64') {
      console.log('[UAS RAW BLOB PAYLOAD]', {
        mimeType: options?.rawAudioMimeType,
        blobSize: options?.rawAudioBlobSize ?? null,
        targetText: uasTargetText,
        packId: activePracticePackId,
        language: practiceLanguage,
      });
    }

    console.log('[BACKEND PHONEME] request sending', {
      url: WAVE2VEC_BACKEND_URL,
      sampleRate,
      activePracticePackId,
      practiceLanguage,
      targetText: uasTargetText,
      samples: preparedAudio?.length ?? 0,
      isWarmup: !!options?.isWarmup,
      processingMode: payload?.processingMode ?? 'processed_float32',
      segmentCount: options?.audioActivitySegments?.segments?.length ?? 0,
      gapCount: options?.audioActivitySegments?.gaps?.length ?? 0,
      firstSoundMs: options?.audioActivitySegments?.firstSoundMs ?? null,
      lastSoundMs: options?.audioActivitySegments?.lastSoundMs ?? null,
    });

    try {
      const response = await fetch(WAVE2VEC_BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('[BACKEND PHONEME] response received', data);
      console.log('[UAS RAW BACKEND RESPONSE]', data);
      console.log('[UAS RAW BACKEND RESPONSE]', {
        phonemes: data?.phonemes,
        phonemeCount: Array.isArray(data?.phonemes) ? data.phonemes.length : null,
        timestamps: data?.timestamps,
        timestampCount: Array.isArray(data?.timestamps) ? data.timestamps.length : null,
        transcript: data?.transcript,
        confidence: data?.confidence,
        debug: data?.debug,
      });
      return data;
    } catch (error) {
      if (options?.isWarmup) {
        throw error;
      }

      console.log('[BACKEND PHONEME] unavailable', {
        url: WAVE2VEC_BACKEND_URL,
        message: error?.message || error,
      });

      return {
        provider: 'wav2vec2-backend-unavailable',
        phonemes: [],
        timestamps: [],
        confidence: null,
        tips: ['Backend phoneme service is not connected yet.'],
        disabled: true,
      };
    }
  }

  const warmupUASBackend = useCallback(async () => {
    try {
      if (UAS_AUDIO_INPUT_MODE === 'raw_blob_base64') {
        return;
      }

      const silentAudio = new Float32Array(8000);

      await analyzePracticeAudioBackend(
        silentAudio,
        16000,
        activePracticePackId,
        practiceLanguage,
        'warmup',
        { isWarmup: true }
      );
    } catch (err) {
      console.warn('[UAS] warmup failed silently:', err?.message || err);
    }
  }, [analyzePracticeAudioBackend, activePracticePackId, practiceLanguage]);

  useEffect(() => {
    uasWarmupAttemptedRef.current = false;
  }, [activePracticePackId]);

  useEffect(() => {
    if (!speechReady || !activePracticePackId) return;
    if (uasWarmupAttemptedRef.current) return;

    uasWarmupAttemptedRef.current = true;
    void warmupUASBackend();
  }, [speechReady, activePracticePackId, warmupUASBackend]);

  const handleRecordingComplete = useCallback(
    async (recordingData) => {
      const facial = recordingData.facialTimeline ?? [];
      const guidedAtRecordingStart = guidedRecovery?.active
        ? guidedRecovery
        : null;
      const guidedUnitAtRecordingStart = guidedAtRecordingStart
        ? guidedAtRecordingStart.units?.[
            guidedAtRecordingStart.currentIndex
          ] ?? null
        : null;
      const guidedCueAtRecordingStart = resolvePackGuidedCue(
        activePracticePack,
        guidedUnitAtRecordingStart
      );
      const attemptTargetText =
        guidedCueAtRecordingStart?.ttsText ||
        guidedUnitAtRecordingStart?.display ||
        fullTargetText;

      /*
       * Do not coach from facial movement alone.
       *
       * Mouth movement supports the eventual verdict, but it does not
       * create a pronunciation error by itself. Wait for the already-produced
       * phoneme results before deciding whether praise or coaching is earned.
       */
      setCoachingData({
        facialTimeline: facial,
        suggestions: 'Analysing your pronunciation…',
        analyzing: true,
        sessionSaved: false,
      });

      let audioResult = null;
      try {
        setIsAnalyzingPhonemes(true);
        setPhonemeAnalysisError(null);
        let preparedAudio = null;
        let rawAudioBase64 = null;
        let rawAudioMimeType = null;
        let rawAudioBlobSize = null;
        let audioActivitySegments = null;

        if (UAS_AUDIO_INPUT_MODE === 'raw_blob_base64') {
          const rawBlob = recordingData.audioBlob ?? recordingData.blob ?? null;

          if (rawBlob) {
            rawAudioBase64 = await new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => {
                const result = typeof reader.result === 'string' ? reader.result : '';
                const base64 = result.includes(',') ? result.split(',')[1] : result;
                resolve(base64);
              };
              reader.onerror = () => reject(reader.error || new Error('Failed to read raw audio blob'));
              reader.readAsDataURL(rawBlob);
            });
            rawAudioMimeType = rawBlob.type || null;
            rawAudioBlobSize = rawBlob.size || null;
          }
        } else if (
          UAS_AUDIO_INPUT_MODE === 'minimal_processed_float32' ||
          UAS_AUDIO_INPUT_MODE === 'minimal_float32_with_activity_spacers'
        ) {
          if (recordingData.audioBlob) {
            preparedAudio = await blobToMinimalFloat32(recordingData.audioBlob);
          } else if (recordingData.blob) {
            preparedAudio = await blobToMinimalFloat32(recordingData.blob);
          }
        } else {
          if (recordingData.audioBlob) {
            preparedAudio = await blobToWavBase64(recordingData.audioBlob, 'user-recording');
          } else if (recordingData.blob) {
            preparedAudio = await blobToWavBase64(recordingData.blob, 'user-recording');
          }
        }

        if (preparedAudio || rawAudioBase64) {
          if (
            (UAS_AUDIO_INPUT_MODE === 'minimal_processed_float32' ||
              UAS_AUDIO_INPUT_MODE === 'minimal_float32_with_activity_spacers') &&
            preparedAudio
          ) {
            audioActivitySegments = buildAudioActivitySegments(preparedAudio, 16000);
            console.log('[UAS AUDIO ACTIVITY SEGMENTS]', audioActivitySegments);
          }

          if (
            UAS_AUDIO_INPUT_MODE === 'minimal_float32_with_activity_spacers' &&
            preparedAudio
          ) {
            const spacerBuild = buildFloat32WithActivitySpacers(
              preparedAudio,
              16000,
              audioActivitySegments,
              500
            );
            preparedAudio = spacerBuild.spacedAudio;
            audioActivitySegments = spacerBuild.activitySegments;
          }

          const pd = await analyzePracticeAudioBackend(
            preparedAudio,
            16000,
            activePracticePackId,
            practiceLanguage,
            attemptTargetText,
            {
              rawAudioBase64,
              rawAudioMimeType,
              rawAudioBlobSize,
              audioActivitySegments,
            }
          );

          const canonicalPhonemes = Array.isArray(pd?.canonicalPhonemes)
            ? pd.canonicalPhonemes
            : [];

          const canonicalTimestamps = Array.isArray(pd?.canonicalTimestamps)
            ? pd.canonicalTimestamps
            : [];

          const rawPhonemes = Array.isArray(pd?.phonemes)
            ? pd.phonemes
            : [];

          const rawTimestamps = Array.isArray(pd?.timestamps)
            ? pd.timestamps
            : [];

          const analysisPhonemes =
            canonicalPhonemes.length > 0
              ? canonicalPhonemes
              : rawPhonemes;

          const analysisTimestamps =
            canonicalTimestamps.length > 0
              ? canonicalTimestamps
              : rawTimestamps;

          const timingSource =
            canonicalTimestamps.length > 0
              ? 'canonicalTimestamps'
              : rawTimestamps.length > 0
                ? 'timestamps'
                : 'estimated-even';

          console.log('[UAS PD CONSUMED BY PRACTICE]', {
            rawPhonemes,
            rawPhonemeCount: rawPhonemes.length,
            rawTimestamps,
            rawTimestampCount: rawTimestamps.length,
            canonicalPhonemes,
            canonicalPhonemeCount: canonicalPhonemes.length,
            canonicalTimestamps,
            canonicalTimestampCount: canonicalTimestamps.length,
            analysisPhonemes,
            analysisPhonemeCount: analysisPhonemes.length,
            analysisTimestamps,
            analysisTimestampCount: analysisTimestamps.length,
            timingSource,
          });

          const currentTargetText = fullTargetText;
          const latestLearningInput = latestLearningInputRef.current;
          let gradingLearningInput = null;

          if (
            !guidedAtRecordingStart &&
            currentTargetText.trim() &&
            typeof activePracticePack?.prepareLearningInput === 'function'
          ) {
            try {
              gradingLearningInput =
                activePracticePack.prepareLearningInput(currentTargetText);
            } catch (error) {
              console.warn(
                '[UAS] grading truth preparation failed',
                error?.message || error
              );
            }
          }

          let expectedPhonemes = guidedCueAtRecordingStart?.expectedPhonemes?.length
            ? guidedCueAtRecordingStart.expectedPhonemes
            : guidedUnitAtRecordingStart?.phoneme
              ? [guidedUnitAtRecordingStart.phoneme]
            : Array.isArray(gradingLearningInput?.expectedPhonemes)
              ? gradingLearningInput.expectedPhonemes
            : latestLearningInput?.targetText === currentTargetText &&
                Array.isArray(latestLearningInput?.expectedPhonemes)
              ? latestLearningInput.expectedPhonemes
              : [];

          /*
           * A learner can record without first pressing Play. In that case the
           * cached learning input may not exist yet. Resolve expected truth
           * directly from the active pack rather than forfeiting the phoneme
           * half of the verdict.
           */
          if (
            !guidedAtRecordingStart &&
            expectedPhonemes.length === 0 &&
            currentTargetText.trim() &&
            typeof activePracticePack?.prepareLearningInput === 'function'
          ) {
            try {
              const freshLearningInput =
                activePracticePack.prepareLearningInput(currentTargetText);

              expectedPhonemes = Array.isArray(
                freshLearningInput?.expectedPhonemes
              )
                ? freshLearningInput.expectedPhonemes
                : [];

              latestLearningInputRef.current = {
                targetText: currentTargetText,
                expectedPhonemes,
                helperText: freshLearningInput?.helperText ?? '',
                tones: freshLearningInput?.tones ?? [],
                syllables: freshLearningInput?.syllables ?? [],
                prosodyUnits: freshLearningInput?.prosodyUnits ?? [],
              };
            } catch (error) {
              console.warn(
                '[UAS] expected phoneme preparation failed',
                error?.message || error
              );
            }
          }

          const perPhonemeArticulationAnalysis = buildArticulationAnalysis({
            phonemes: analysisPhonemes,
            expectedPhonemes,
            timestamps: analysisTimestamps,
            facialTimeline: facial,
            articulationMap: activePracticePack?.articulationMap,
            coachingRules: activePracticePack?.coachingRules,
            normalizeDetectedPhoneme:
              activePracticePack?.normalizeDetectedPhoneme,
            durationMs: recordingData?.durationMs ?? facial?.[facial.length - 1]?.time ?? null,
          });
          const segmentalVerdict = buildOfficialAttemptVerdict(
            perPhonemeArticulationAnalysis
          );
          let prosodyAnalysis = null;

          if (
            !guidedAtRecordingStart &&
            preparedAudio instanceof Float32Array &&
            typeof activePracticePack?.analyzeProsody === 'function'
          ) {
            try {
              prosodyAnalysis = activePracticePack.analyzeProsody({
                audioSamples: preparedAudio,
                sampleRate: 16000,
                targetText: currentTargetText,
                tones: gradingLearningInput?.tones ?? [],
                syllables: gradingLearningInput?.syllables ?? [],
                prosodyUnits: gradingLearningInput?.prosodyUnits ?? [],
                analysisItems: perPhonemeArticulationAnalysis,
                durationMs:
                  recordingData?.durationMs ??
                  facial?.[facial.length - 1]?.time ??
                  null,
              });
            } catch (error) {
              console.warn(
                '[UAS] pack prosody analysis abstained',
                error?.message || error
              );
            }
          }

          const combinedSpeechEvidence =
            typeof activePracticePack?.combineSegmentalAndProsody === 'function'
              ? activePracticePack.combineSegmentalAndProsody({
                  segmentalScore: segmentalVerdict.audioScore,
                  prosodyAnalysis,
                })
              : segmentalVerdict.audioScore;
          const officialVerdict = buildOfficialAttemptVerdict(
            perPhonemeArticulationAnalysis,
            { audioScoreOverride: combinedSpeechEvidence }
          );

          console.log('[UAS ARTICULATION SUMMARY]', {
            timingSource,
            count: perPhonemeArticulationAnalysis?.length || 0,
            first5: (perPhonemeArticulationAnalysis || []).slice(0, 5),
            officialScorePercent: officialVerdict.scorePercent,
            phonemeEvidencePercent:
              officialVerdict.audioScore != null
                ? Math.round(officialVerdict.audioScore * 100)
                : null,
            segmentalEvidencePercent:
              officialVerdict.segmentalAudioScore != null
                ? Math.round(officialVerdict.segmentalAudioScore * 100)
                : null,
            prosodyEvidencePercent:
              prosodyAnalysis?.score != null
                ? Math.round(prosodyAnalysis.score * 100)
                : null,
            prosodyEvidenceAvailable: prosodyAnalysis?.available === true,
            mouthEvidencePercent:
              officialVerdict.articulationScore != null
                ? Math.round(officialVerdict.articulationScore * 100)
                : null,
            mismatchCount: officialVerdict.mismatchCount,
            missingExpectedCount: officialVerdict.missingExpectedCount,
            match: officialVerdict.match,
          });

          const phonemeString = analysisPhonemes.join(' ');

          const uasCoaching = !guidedAtRecordingStart &&
            activePracticePack?.buildUASCoachingResult
            ? activePracticePack.buildUASCoachingResult({
                targetText: currentTargetText,
                expectedPhonemes,
                detectedPhonemes: analysisPhonemes,
                prosodyAnalysis,
                uiLanguage,
              })
            : null;

          const officialPhonemeBreakdown =
            buildOfficialPhonemeBreakdown(
              perPhonemeArticulationAnalysis,
              toDisplayToken
            );

          const evidenceBasedTips = [
            ...new Set(
              perPhonemeArticulationAnalysis
                .filter((item) => item?.audioMismatch === true)
                .flatMap((item) => {
                  const primaryTip = item?.coaching?.primary?.tip;
                  const feedback = Array.isArray(item?.feedback)
                    ? item.feedback
                    : [];

                  return [primaryTip, ...feedback].filter(Boolean);
                })
            ),
          ];

          const attemptDetected = analysisPhonemes.length > 0;
          const expectedCount = expectedPhonemes.length;
          const guidedRecoveryNeeded =
            !guidedAtRecordingStart &&
            shouldStartGuidedRecovery({
              attemptDetected,
              audioScore: officialVerdict.audioScore,
              mismatchCount: officialVerdict.mismatchCount,
              exactCount: officialVerdict.exactCount,
              expectedCount,
            });

          const guidedRecoveryUnits = guidedRecoveryNeeded
            ? buildGuidedRecoveryUnits({
                analysisItems: perPhonemeArticulationAnalysis,
                expectedPhonemes,
                toDisplayToken,
                getGuidedSoundCue:
                  activePracticePack?.getGuidedSoundCue,
              })
            : [];

          const guidedSoundPassed = guidedAtRecordingStart
            ? isGuidedSoundPassed(officialVerdict, {
                analysisItems: perPhonemeArticulationAnalysis,
                targetExpectedIndex:
                  guidedCueAtRecordingStart?.targetExpectedIndex ?? 0,
                acceptedTargetPhonemes:
                  guidedCueAtRecordingStart?.acceptedTargetPhonemes,
                closePassAfterFailures:
                  guidedCueAtRecordingStart?.closePassAfterFailures,
                minCloseMouthScore:
                  guidedCueAtRecordingStart?.minCloseMouthScore,
                failureCount:
                  guidedAtRecordingStart?.failureCount ?? 0,
              })
            : false;

          audioResult = {
            transcript: phonemeString,
            youSoundedLike: phonemeString,
            phonemeProvider: pd?.provider ?? 'unknown',
            detectedPhonemes: analysisPhonemes,
            expectedPhonemes,
            detectionConfidence: pd?.confidence ?? null,

            /*
             * One official attempt score, in percentage points, used by the
             * UI, curriculum, and archive. Phoneme evidence leads while
             * synchronized mouth movement remains supporting evidence.
             */
            score: officialVerdict.scorePercent,
            score01: officialVerdict.score01,
            audioScore: officialVerdict.audioScore,
            segmentalAudioScore: officialVerdict.segmentalAudioScore,
            prosodyAnalysis,
            articulationScore: officialVerdict.articulationScore,
            scoreWeights: {
              phonemeResults: PHONEME_RESULT_WEIGHT,
              mouthArticulation: MOUTH_MOVEMENT_WEIGHT,
            },
            match: officialVerdict.match,
            mismatchCount: officialVerdict.mismatchCount,
            missingExpectedCount: officialVerdict.missingExpectedCount,

            phonemeBreakdown: officialPhonemeBreakdown,
            chunkLevelFeedback: officialPhonemeBreakdown,
            perPhonemeArticulationAnalysis,
            tips: evidenceBasedTips,
            uasCoaching,
            guidedRecoveryNeeded,
            guidedRecoveryUnits,
            guidedSoundPassed,
          };

          setPhonemeAnalysisResult({
            ...pd,
            phonemes: analysisPhonemes,
            timestamps: analysisTimestamps,
            timingSource,
            rawPhonemes,
            rawTimestamps,
            canonicalPhonemes,
            canonicalTimestamps,
          });
        }
      } catch (err) {
        setPhonemeAnalysisError(err?.message || 'Phoneme analysis failed');
        console.warn('[Practice] phoneme analysis failed:', err?.message || err);
      } finally {
        setIsAnalyzingPhonemes(false);
      }

      const hasDetectedSpeechAttempt =
        Array.isArray(audioResult?.detectedPhonemes) &&
        audioResult.detectedPhonemes.length > 0;

      let guidedRecoveryPresentation = null;
      const isGuidedAttempt = Boolean(guidedAtRecordingStart);

      if (isGuidedAttempt && audioResult) {
        const currentUnit = guidedUnitAtRecordingStart;
        const detectedDisplay = (audioResult.detectedPhonemes || [])
          .map(toDisplayToken)
          .filter(Boolean)
          .join(' ');
        const passed = audioResult.guidedSoundPassed === true;

        saveGuidedAttempt({
          timestamp: Date.now(),
          packId: activePracticePackId,
          language: practiceLanguage,
          originalTargetText:
            guidedAtRecordingStart.originalTargetText,
          targetPhoneme: currentUnit?.phoneme ?? null,
          targetDisplay: currentUnit?.display ?? null,
          detectedDisplay,
          phonemeScore:
            audioResult.audioScore != null
              ? Math.round(audioResult.audioScore * 100)
              : null,
          passed,
        });

        if (passed) {
          const nextIndex =
            guidedAtRecordingStart.currentIndex + 1;

          if (nextIndex < guidedAtRecordingStart.units.length) {
            const nextState = {
              ...guidedAtRecordingStart,
              currentIndex: nextIndex,
              failureCount: 0,
              lastDetectedDisplay: '',
            };
            const nextUnit = nextState.units[nextIndex];
            const instruction =
              `${t('guidedCoaching.soundMatched', {
                sound: currentUnit?.display || currentUnit?.phoneme || '',
              })} ` +
              getGuidedRecoveryInstruction({
                unit: nextUnit,
                failureCount: 0,
                originalTargetText:
                  nextState.originalTargetText,
                translate: t,
              });

            setGuidedRecovery(nextState);
            guidedRecoveryPresentation = {
              ...nextState,
              instruction,
              justPassed: currentUnit?.display ?? null,
            };
          } else {
            setGuidedRecovery(null);
            guidedRecoveryPresentation = {
              active: false,
              completed: true,
              originalTargetText:
                guidedAtRecordingStart.originalTargetText,
              instruction: t('guidedCoaching.sequenceComplete', {
                target: guidedAtRecordingStart.originalTargetText,
              }),
            };
          }
        } else {
          const nextState = {
            ...guidedAtRecordingStart,
            failureCount:
              Number(guidedAtRecordingStart.failureCount || 0) + 1,
            lastDetectedDisplay: detectedDisplay,
          };
          const instruction = getGuidedRecoveryInstruction({
            unit: currentUnit,
            failureCount: nextState.failureCount,
            detectedDisplay,
            originalTargetText:
              nextState.originalTargetText,
            translate: t,
          });

          setGuidedRecovery(nextState);
          guidedRecoveryPresentation = {
            ...nextState,
            instruction,
          };
        }
      } else if (
        audioResult?.guidedRecoveryNeeded &&
        audioResult.guidedRecoveryUnits?.length
      ) {
        const nextState = {
          active: true,
          originalTargetText: fullTargetText,
          units: audioResult.guidedRecoveryUnits,
          currentIndex: 0,
          failureCount: 0,
          lastDetectedDisplay: '',
        };
        const instruction =
          `${t('guidedCoaching.firstSoundIntro', {
            target: fullTargetText,
          })} ` +
          getGuidedRecoveryInstruction({
            unit: nextState.units[0],
            failureCount: 0,
            originalTargetText: fullTargetText,
            translate: t,
          });

        setGuidedRecovery(nextState);
        guidedRecoveryPresentation = {
          ...nextState,
          instruction,
        };
      }

      let suggestions = guidedRecoveryPresentation?.instruction ||
        (hasDetectedSpeechAttempt
          ? audioResult?.uasCoaching?.shortMessage ||
            audioResult?.tips?.[0] ||
            t('pronunciationVerdict.attempt.developingTitle')
          : t('pronunciationVerdict.attempt.readyMessage'));

      let transcript = audioResult?.transcript ?? null;
      if (transcript) console.log('[UAS TRANSCRIPT BEFORE SANITIZE]', transcript);
      if (transcript) transcript = sanitizeTranscript(transcript);
      if (transcript) console.log('[UAS TRANSCRIPT AFTER SANITIZE]', transcript);

      const coachingResult = {
        facialTimeline: facial,
        suggestions,
        analyzing: false,
        sessionSaved: false,
        transcript,
        score: audioResult?.score ?? null,
        score01: audioResult?.score01 ?? null,
        audioScore: audioResult?.audioScore ?? null,
        segmentalAudioScore: audioResult?.segmentalAudioScore ?? null,
        prosodyAnalysis: audioResult?.prosodyAnalysis ?? null,
        articulationScore: audioResult?.articulationScore ?? null,
        scoreWeights: audioResult?.scoreWeights ?? null,
        match: audioResult?.match ?? null,
        mismatchCount: audioResult?.mismatchCount ?? 0,
        missingExpectedCount: audioResult?.missingExpectedCount ?? 0,
        phonemeBreakdown: audioResult?.phonemeBreakdown ?? null,
        perPhonemeArticulationAnalysis: audioResult?.perPhonemeArticulationAnalysis ?? [],
        uasCoaching: audioResult?.uasCoaching ?? null,
        guidedRecovery: guidedRecoveryPresentation,
      };

      if (!isGuidedAttempt) {
        try {
          await archive.saveSession({
            timestamp: Date.now(),
            language: practiceLanguage,
            languageCode: practiceLanguage,
            packId: activePracticePackId,
            targetSource: practiceTargetSource,
            word: sourceText || inputValue,
            audioBlob: recordingData.audioBlob ?? recordingData.blob ?? null,
            videoBlob: recordingData.blob ?? null,
            phonemeTimeline: timeline ?? [],
            scores: audioResult?.score != null ? [audioResult.score] : [],
            feedback: [suggestions],
            transcript: transcript ?? null,
            score: audioResult?.score ?? null,
            match: audioResult?.match ?? null,
            phonemeBreakdown: audioResult?.phonemeBreakdown ?? null,
            facialTimeline: facial,
            scoring: {
              phonemeResults: audioResult?.audioScore ?? null,
              segmentalPhonemes: audioResult?.segmentalAudioScore ?? null,
              prosody: audioResult?.prosodyAnalysis ?? null,
              mouthArticulation: audioResult?.articulationScore ?? null,
              weights: audioResult?.scoreWeights ?? {
                phonemeResults: PHONEME_RESULT_WEIGHT,
                mouthArticulation: MOUTH_MOVEMENT_WEIGHT,
              },
              mismatchCount: audioResult?.mismatchCount ?? 0,
              missingExpectedCount: audioResult?.missingExpectedCount ?? 0,
            },
          });
          coachingResult.sessionSaved = true;
        } catch (e) {
          console.warn('[Practice] Failed to save session:', e.message);
        }
      }

      if (
        !isGuidedAttempt &&
        lessonId &&
        passScore != null &&
        audioResult?.score != null &&
        audioResult.score >= passScore
      ) {
        try {
          const key = getCurriculumKey(practiceLanguage);
          const stored = localStorage.getItem(key);
          const ids = new Set(stored ? JSON.parse(stored) : []);
          ids.add(lessonId);
          localStorage.setItem(key, JSON.stringify([...ids]));
          setCompletedIds(new Set(ids));
          coachingResult.lessonPassed = true;
        } catch {}
      }

      setCoachingData(coachingResult);
    },
    [
      activePracticePack,
      activePracticePackId,
      fullTargetText,
      guidedRecovery,
      inputValue,
      lessonId,
      passScore,
      practiceLanguage,
      practiceTargetSource,
      sanitizeTranscript,
      sourceText,
      timeline,
      toDisplayToken,
      t,
    ]
  );

  return (
    <div
      className="min-h-screen w-full overflow-y-auto"
      style={{
        background:
          'linear-gradient(to bottom, #0a1628 0%, #0d2447 35%, #0a3d6b 70%, #0a6e8a 100%)',
      }}
    >
      <div className="my-1 pt-5 pr-2 pb-3 pl-1 relative flex items-center justify-center md:mx-48">
        <div
          className="absolute"
          style={{ left: '12.5%', transform: 'translateX(-50%)' }}
        >
          <button
            onClick={() => navigate(createPageUrl('Home'))}
            className="flex flex-col items-center gap-1 p-3 rounded-xl transition-all hover:brightness-110 active:scale-95"
            style={PILL_STYLE}
          >
            <ArrowLeft className="w-6 h-6" style={{ color: COBALT }} />
            <span className="text-xs font-semibold" style={{ color: COBALT }}>
              {t('nav.home')}
            </span>
          </button>
        </div>

        <img
          src={LOGO_URL}
          alt="SoundMirror"
          className="w-[180px] md:w-[300px]"
          style={{ maxWidth: '45vw' }}
        />

        <div
          className="absolute"
          style={{ right: '12.5%', transform: 'translateX(50%)' }}
        >
          <button
            onClick={() => navigate(createPageUrl('HistoryLibrary'))}
            className="flex flex-col items-center gap-1 p-3 rounded-xl transition-all hover:brightness-110 active:scale-95"
            style={PILL_STYLE}
          >
            <History className="w-6 h-6" style={{ color: COBALT }} />
            <span className="text-xs font-semibold" style={{ color: COBALT }}>
              {t('nav.library')}
            </span>
          </button>
        </div>
      </div>

      <div className="flex flex-col items-center gap-3 pb-4">
        <LanguageSelector />
        <div
          className="rounded-lg px-4 py-2 text-sm text-white"
          style={{
            background: 'rgba(0,188,212,0.10)',
            border: '1px solid rgba(245,197,24,0.6)',
          }}
        >
          {t('languageChoice.uiLanguage', {
            language: visibleUiLanguage,
          })}{' '}
          · {t('languageChoice.practiceLanguage')}: {visiblePracticeLanguage}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pb-14">
        <div className="flex gap-3 mb-4 items-center">
          <input
            type="text"
            dir="auto"
            placeholder={t('practice.placeholder')}
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleInputKeyPress}
            className={`flex-1 h-12 px-4 rounded-md placeholder-yellow-400/50 outline-none ${
              isRtlPractice ? 'text-right' : ''
            }`}
            style={{
              background: 'rgba(0,188,212,0.15)',
              border: '2px solid #f5c518',
              color: '#f5c518',
            }}
          />
        </div>

        <div className="flex flex-col md:flex-row gap-2 mb-6 items-start justify-start">
          <div className="flex-shrink-0 flex justify-start">
            <QwertyKeyboard onKey={handleKey} align="left" />
          </div>

          <div className="flex flex-col gap-4 flex-1 min-w-0 w-full">
            <div className="md:flex-1 min-w-[14rem] w-full">
              <p
                className="text-xs font-bold tracking-widest mb-2 text-center"
                style={{ color: CYAN }}
              >
                {t('practice.quickPractice')}
              </p>
              <div className="flex flex-wrap gap-2 justify-start">
                {presetWordPairs.length > 0
                  ? presetWordPairs
                      .slice(0, (t('home.presetWords') || []).length)
                      .map(renderPresetChip)
                  : null}
              </div>
            </div>

            <div ref={phrasePanelRef} className="w-full min-w-0 overflow-hidden">
              <div className="flex items-center justify-between gap-3 mb-2">
                <p
                  className="text-xs font-bold tracking-widest text-center"
                  style={{ color: CYAN }}
                >
                  {t('practice.phrases')}
                </p>
                <button
                  onClick={() => navigate(createPageUrl(moreWordsPageName))}
                  className="px-3 py-1.5 rounded-full font-semibold text-xs transition-all hover:brightness-110 active:scale-95"
                  style={{
                    background: '#f5c518',
                    color: COBALT,
                    border: `1.5px solid ${CYAN}`,
                  }}
                >
                  {moreWordsLabel}
                </button>
              </div>

              <div
                ref={phraseChipContainerRef}
                className="flex flex-wrap content-start gap-2 justify-start items-start max-h-72 overflow-y-auto pr-2"
              >
                {presetPhrasePairs.length > 0
                  ? presetPhrasePairs
                      .slice(0, (t('home.presetPhrases') || []).length)
                      .map(renderPresetChip)
                  : null}
              </div>
            </div>
          </div>
        </div>

        <div
          ref={playbackRegionRef}
          className="mb-6 rounded-2xl p-4"
          style={{
            background: 'rgba(0,0,0,0.3)',
            border: '1px solid rgba(0,188,212,0.3)',
          }}
        >
          {isUsingFallbackTTS && (
            <div
              className="mb-3 text-center text-sm font-semibold rounded-md px-3 py-2"
              style={{
                background: 'rgba(245,197,24,0.12)',
                border: '1px solid #f5c518',
                color: '#f5c518',
              }}
            >
              Using Device Audio
            </div>
          )}

          <DualHeadAnimation
            timeline={displayTimeline ?? timeline}
            playCount={playCount}
            onPlayComplete={handleAnimationComplete}
            audioUrl={audioUrl}
            audioPlayerInstance={playbackAudioRef.current}
            audioStartMs={0}
            traceToken={currentTraceTokenRef.current}
            playLabel={
              activeGuidedUnit
                ? {
                    word:
                      activeGuidedCue?.displayText || activeGuidedUnit.display,
                    phonetic:
                      activeGuidedUnit.display,
                    helper:
                      activeGuidedPlayback?.helperText || activeGuidedUnit.display,
                    helperChunks:
                      activeGuidedPlayback?.helperChunks ?? null,
                  }
                : sourceText
                  ? {
                    word: sourceText,
                    phonetic: pronunciation,
                    helper: helperText,
                    helperChunks,
                    meaning:
                      nativeLanguage !== practiceLanguage
                        ? selectedPresetMeaning || undefined
                        : undefined,
                    }
                  : null
            }
            onPlay={handlePlay}
            isLoadingAudio={isLoadingAudio || !speechReady}
          />
        </div>

        {isAnalyzingPhonemes && (
          <div className="mb-3 text-center text-sm rounded-md px-3 py-2" style={{ background: 'rgba(245,197,24,0.10)', border: '1px solid #f5c518', color: '#f5c518' }}>
            Analyzing speech…
          </div>
        )}
        {phonemeAnalysisError && (
          <div className="mb-3 text-center text-sm rounded-md px-3 py-2" style={{ background: 'rgba(255,0,0,0.10)', border: '1px solid #f87171', color: '#f87171' }}>
            {String(phonemeAnalysisError)}
          </div>
        )}
        {mappedDisplay && !activeGuidedUnit && (
          <div className="mb-3 rounded-md px-3 py-2" style={{ background: 'rgba(245,197,24,0.08)', border: '1px solid #f5c518', color: '#e2f7fb' }}>
            <div className="text-sm font-semibold">Pronunciation</div>
            <div className="text-sm mt-1">{mappedDisplay.helpersString}</div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PracticeRecorder
            targetWord={recordingTargetText}
            onRecordingComplete={handleRecordingComplete}
            isProcessing={isAnalyzingPhonemes}
          />
          <CoachingBox
            coachingData={coachingData}
            targetWord={recordingTargetText}
            activeCurriculumLesson={activeCurriculumLesson}
            completedIds={completedIds}
            onLessonSelect={handleLessonSelect}
            onExitGuidedRecovery={handleExitGuidedRecovery}
          />
        </div>
      </div>

      <PracticeLanguageModal
        open={showLangModal}
        startStep="select"
        onCancel={() => setShowLangModal(false)}
        onProceed={() => setShowLangModal(false)}
      />
    </div>
  );
}
