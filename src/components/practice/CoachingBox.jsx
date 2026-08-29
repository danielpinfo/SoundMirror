import React, { useEffect, useMemo, useState } from 'react';
import {
  Loader2,
  Mic,
  GraduationCap,
  Play,
  CheckCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { localizeCurriculum } from '../curriculum/curriculumTranslations';
import { usePlugin } from '../core/PluginContext';
import { useLanguage } from '../i18n/LanguageContext';
import {
  PHONEME_RESULT_WEIGHT,
  MOUTH_MOVEMENT_WEIGHT,
  combinePronunciationEvidence,
} from '../../lib/practiceScoring';
import { getGuidedRecoveryInstruction } from '../../lib/guidedRecovery';

const CYAN = '#00bcd4';

const STATUS_COLORS = {
  correct: '#22c55e',
  close: '#f5c518',
  incorrect: '#ef4444',
};

const MATCH_COLORS = {
  exact: '#22c55e',
  close: '#f5c518',
  partial: '#f97316',
  miss: '#ef4444',
};

const TOTAL_MISS_JOKES = Object.freeze([
  'That was close… if you were speaking Martian. 😄 Let’s try that one again.',
  'Well, we definitely made a sound! 😄 Let’s give the target another shot.',
  'I think that pronunciation took the scenic route. 😄 Let’s bring it back home and try again.',
  'That one surprised even SoundMirror. 😄 Reset, listen once, and give it another go.',
  'Bold attempt! 😄 The target sound went one way and we went another. Let’s line them up and try again.',
]);

const TOTAL_MISS_STORAGE_KEY = 'soundmirror_last_total_miss_joke_index';

function clamp01(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return null;
  }

  return Math.max(0, Math.min(1, number));
}

function finiteNumber(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function toPercent(value) {
  const number = finiteNumber(value);

  if (number == null) {
    return null;
  }

  const normalized = number <= 1 ? number * 100 : number;
  return Math.max(0, Math.min(100, normalized));
}

function average(values) {
  const finite = values
    .map((value) => finiteNumber(value))
    .filter((value) => value != null);

  if (!finite.length) {
    return null;
  }

  return finite.reduce((sum, value) => sum + value, 0) / finite.length;
}

function getNextTotalMissJoke() {
  let previousIndex = -1;

  try {
    const stored = window.sessionStorage.getItem(TOTAL_MISS_STORAGE_KEY);
    const parsed = Number(stored);

    if (
      Number.isInteger(parsed) &&
      parsed >= 0 &&
      parsed < TOTAL_MISS_JOKES.length
    ) {
      previousIndex = parsed;
    }
  } catch {
    previousIndex = -1;
  }

  const nextIndex =
    previousIndex >= 0
      ? (previousIndex + 1) % TOTAL_MISS_JOKES.length
      : 0;

  try {
    window.sessionStorage.setItem(
      TOTAL_MISS_STORAGE_KEY,
      String(nextIndex)
    );
  } catch {
    // Session storage is optional. The joke still renders if unavailable.
  }

  return TOTAL_MISS_JOKES[nextIndex];
}

function getAttemptBand(score01) {
  if (!Number.isFinite(score01)) {
    return 'unscored';
  }

  if (score01 >= 0.93) return 'excellent';
  if (score01 >= 0.82) return 'strong';
  if (score01 >= 0.65) return 'close';
  if (score01 >= 0.35) return 'developing';
  return 'miss';
}

/**
 * Presentation-level attempt summary.
 *
 * The per-phoneme comparator already produced the two evidence halves:
 *   70% phoneme-result evidence
 *   30% mouth/articulation evidence
 *
 * This view model only aggregates those already-produced results so the
 * CoachingBox can present one attempt-level response instead of repeating
 * feedback once per phoneme.
 *
 * Missing expected phonemes count as zero on the phoneme-result half.
 * Mouth evidence is averaged only where synchronized evidence actually exists;
 * it is never fabricated for a missing visual window.
 */
function buildAttemptSummary(coachingData) {
  const items = Array.isArray(
    coachingData?.perPhonemeArticulationAnalysis
  )
    ? coachingData.perPhonemeArticulationAnalysis
    : [];

  const attemptDetected =
    items.some((item) => item?.attemptDetected === true) ||
    Boolean(String(coachingData?.transcript ?? '').trim());

  const context =
    items.find((item) => item?.attemptContext)?.attemptContext ?? null;

  const missingExpectedCount = Math.max(
    0,
    Number(context?.missingExpectedCount) || 0
  );

  const editDistance = finiteNumber(context?.editDistance);

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
    const score = finiteNumber(item?.audioScore);
    return sum + (score == null ? 0 : Math.max(0, Math.min(1, score)));
  }, 0);

  const derivedSegmentalAudioScore =
    comparisonDenominator > 0
      ? Math.max(
          0,
          Math.min(1, audioScoreSum / comparisonDenominator)
        )
      : null;
  const explicitSegmentalAudioScore = finiteNumber(
    coachingData?.segmentalAudioScore
  );
  const segmentalAudioScore = explicitSegmentalAudioScore != null
    ? Math.max(0, Math.min(1, explicitSegmentalAudioScore))
    : derivedSegmentalAudioScore;
  const explicitAudioScore = finiteNumber(coachingData?.audioScore);
  const audioScore = explicitAudioScore != null
    ? Math.max(0, Math.min(1, explicitAudioScore))
    : segmentalAudioScore;
  const prosodyScore = coachingData?.prosodyAnalysis?.available === true
    ? finiteNumber(coachingData?.prosodyAnalysis?.score)
    : null;

  const articulationScores = alignedExpectedItems
    .map((item) => finiteNumber(item?.articulationScore))
    .filter((value) => value != null)
    .map((value) => Math.max(0, Math.min(1, value)));

  const articulationScore = average(articulationScores);

  const derivedFinalScore =
    audioScore != null
      ? combinePronunciationEvidence(audioScore, articulationScore)
      : null;

  const explicitScorePercent = toPercent(coachingData?.score);
  const score01 =
    explicitScorePercent != null
      ? explicitScorePercent / 100
      : derivedFinalScore;

  const scorePercent =
    score01 != null ? Math.round(score01 * 100) : null;

  const mismatchItems = items.filter(
    (item) => item?.audioMismatch === true
  );

  const exactItems = items.filter(
    (item) => item?.exactPhonemeMatch === true
  );

  const mismatchCount =
    mismatchItems.length + missingExpectedCount;

  const totalMiss = Boolean(
    coachingData?.guidedRecovery?.active ||
      (
        attemptDetected &&
        audioScore != null &&
        audioScore <= 0.3 &&
        mismatchCount > 0 &&
        exactItems.length === 0 &&
        (editDistance == null || editDistance > 0)
      )
  );

  const band = getAttemptBand(score01);

  const correctionCandidates = mismatchItems
    .filter((item) => item?.coaching?.primary)
    .sort((left, right) => {
      const leftScore = finiteNumber(left?.finalScore) ?? 1;
      const rightScore = finiteNumber(right?.finalScore) ?? 1;

      if (leftScore !== rightScore) {
        return leftScore - rightScore;
      }

      const leftPriority =
        Number(left?.coaching?.primary?.priority) || 0;
      const rightPriority =
        Number(right?.coaching?.primary?.priority) || 0;

      return rightPriority - leftPriority;
    });

  const primaryItem = correctionCandidates[0] ?? null;
  const primaryCard = primaryItem?.coaching?.primary ?? null;

  let secondaryCard = null;

  if (primaryItem?.coaching?.secondary?.length) {
    secondaryCard = primaryItem.coaching.secondary[0] ?? null;
  }

  if (!secondaryCard && correctionCandidates.length > 1) {
    secondaryCard = correctionCandidates[1]?.coaching?.primary ?? null;
  }

  return {
    items,
    attemptDetected,
    audioScore,
    segmentalAudioScore,
    prosodyScore,
    prosodyAnalysis: coachingData?.prosodyAnalysis ?? null,
    articulationScore,
    score01,
    scorePercent,
    scoreReady:
      audioScore != null &&
      score01 != null,
    band,
    mismatchCount,
    missingExpectedCount,
    exactCount: exactItems.length,
    editDistance,
    totalMiss,
    primaryItem,
    primaryCard,
    secondaryCard,
  };
}

function buildAttemptMessage(summary, totalMissJoke, t, uiLanguage) {
  if (!summary.attemptDetected) {
    return {
      tone: 'neutral',
      title: t('pronunciationVerdict.attempt.readyTitle'),
      message: t('pronunciationVerdict.attempt.readyMessage'),
    };
  }

  if (!summary.scoreReady) {
    return {
      tone: 'neutral',
      title: t('pronunciationVerdict.attempt.heardTitle'),
      message: t('pronunciationVerdict.attempt.heardMessage'),
    };
  }

  if (summary.totalMiss) {
    return {
      tone: 'playful',
      title: t('pronunciationVerdict.attempt.totalMissTitle'),
      message: String(uiLanguage || '').toLowerCase().startsWith('en')
        ? totalMissJoke || TOTAL_MISS_JOKES[0]
        : t('pronunciationVerdict.attempt.totalMissMessage'),
    };
  }

  if (
    summary.band === 'excellent' &&
    summary.mismatchCount === 0
  ) {
    return {
      tone: 'excellent',
      title: t('pronunciationVerdict.attempt.excellentTitle'),
      message: t('pronunciationVerdict.attempt.excellentMessage'),
    };
  }

  if (summary.band === 'excellent') {
    return {
      tone: 'strong',
      title: t('pronunciationVerdict.attempt.excellentEffortTitle'),
      message: t('pronunciationVerdict.attempt.excellentEffortMessage'),
    };
  }

  if (summary.band === 'strong') {
    return {
      tone: 'strong',
      title:
        summary.mismatchCount === 0
          ? t('pronunciationVerdict.attempt.strongTitle')
          : t('pronunciationVerdict.attempt.strongMismatchTitle'),
      message:
        summary.mismatchCount === 0
          ? t('pronunciationVerdict.attempt.strongMessage')
          : t('pronunciationVerdict.attempt.strongMismatchMessage'),
    };
  }

  if (summary.band === 'close') {
    return {
      tone: 'close',
      title: t('pronunciationVerdict.attempt.closeTitle'),
      message: t('pronunciationVerdict.attempt.closeMessage'),
    };
  }

  if (summary.band === 'developing') {
    return {
      tone: 'developing',
      title: t('pronunciationVerdict.attempt.developingTitle'),
      message: t('pronunciationVerdict.attempt.developingMessage'),
    };
  }

  return {
    tone: 'miss',
    title: t('pronunciationVerdict.attempt.missTitle'),
    message: t('pronunciationVerdict.attempt.missMessage'),
  };
}

function getToneStyle(tone) {
  if (tone === 'excellent') {
    return {
      border: '#22c55e',
      background: 'rgba(34,197,94,0.12)',
      title: '#22c55e',
    };
  }

  if (tone === 'strong') {
    return {
      border: '#38bdf8',
      background: 'rgba(56,189,248,0.10)',
      title: '#38bdf8',
    };
  }

  if (tone === 'close') {
    return {
      border: '#f5c518',
      background: 'rgba(245,197,24,0.10)',
      title: '#f5c518',
    };
  }

  if (tone === 'playful') {
    return {
      border: '#a78bfa',
      background: 'rgba(167,139,250,0.11)',
      title: '#c4b5fd',
    };
  }

  if (tone === 'developing') {
    return {
      border: '#f59e0b',
      background: 'rgba(245,158,11,0.09)',
      title: '#fbbf24',
    };
  }

  if (tone === 'miss') {
    return {
      border: '#fb7185',
      background: 'rgba(251,113,133,0.08)',
      title: '#fda4af',
    };
  }

  return {
    border: 'rgba(148,163,184,0.45)',
    background: 'rgba(148,163,184,0.07)',
    title: '#cbd5e1',
  };
}

function ScoreDial({ score, t }) {
  const clamp = Math.max(
    0,
    Math.min(100, Math.round(score ?? 0))
  );

  const color =
    clamp >= 93
      ? '#22c55e'
      : clamp >= 82
        ? '#38bdf8'
        : clamp >= 65
          ? '#f5c518'
          : clamp >= 35
            ? '#f59e0b'
            : '#ef4444';

  return (
    <div style={{ textAlign: 'center' }}>
      <div
        style={{
          fontSize: 42,
          fontWeight: 800,
          color,
          lineHeight: 1,
        }}
      >
        {clamp}
      </div>

      <div
        style={{
          fontSize: 11,
          color: '#94a3b8',
          fontWeight: 600,
          textTransform: 'uppercase',
          marginTop: 2,
        }}
      >
        {t('practice.accuracy')}
      </div>
    </div>
  );
}

function EvidenceHalf({ label, score, note }) {
  const percent =
    score == null
      ? null
      : Math.round(
          Math.max(0, Math.min(1, score)) * 100
        );

  return (
    <div
      className="rounded-lg px-3 py-2"
      style={{
        flex: 1,
        minWidth: 0,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.09)',
      }}
    >
      <div
        className="text-xs font-bold"
        style={{ color: CYAN }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: 22,
          fontWeight: 800,
          color: '#e2f7fb',
          lineHeight: 1.15,
          marginTop: 3,
        }}
      >
        {percent == null ? '—' : `${percent}%`}
      </div>

      <div
        className="text-xs mt-1"
        style={{ color: '#94a3b8' }}
      >
        {note}
      </div>
    </div>
  );
}

function CoachingDetailRow({ label, value }) {
  if (!value) {
    return null;
  }

  return (
    <div>
      <div
        className="text-xs font-bold mb-1"
        style={{ color: '#f5c518' }}
      >
        {label}
      </div>

      <div
        className="text-sm leading-relaxed"
        style={{ color: 'rgba(255,255,255,0.82)' }}
      >
        {value}
      </div>
    </div>
  );
}

function DetailedCoachingCard({ card, t }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [card]);

  if (!card) {
    return null;
  }

  return (
    <div
      className="rounded-xl p-3"
      style={{
        background: 'rgba(0,188,212,0.07)',
        border: '1px solid rgba(0,188,212,0.28)',
      }}
    >
      <p
        className="text-sm font-extrabold"
        style={{ color: CYAN }}
      >
        {card.title || t('pronunciationVerdict.tryThis')}
      </p>

      {card.tip && (
        <p
          className="text-sm leading-relaxed mt-1"
          style={{ color: 'rgba(255,255,255,0.9)' }}
        >
          {card.tip}
        </p>
      )}

      {card.correction && (
        <div
          className="rounded-lg px-3 py-2 mt-2"
          style={{
            background: 'rgba(245,197,24,0.08)',
            border: '1px solid rgba(245,197,24,0.28)',
          }}
        >
          <span
            className="text-xs font-bold"
            style={{ color: '#f5c518' }}
          >
            {t('pronunciationVerdict.correction')}:{' '}
          </span>

          <span
            className="text-sm"
            style={{ color: 'rgba(255,255,255,0.88)' }}
          >
            {card.correction}
          </span>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all hover:brightness-110"
        style={{
          color: CYAN,
          background: 'rgba(0,188,212,0.09)',
          border: '1px solid rgba(0,188,212,0.22)',
        }}
      >
        {open
          ? t('pronunciationVerdict.hideDetailedCoaching')
          : t('pronunciationVerdict.showDetailedCoaching')}
        {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
      </button>

      {open && (
        <div className="flex flex-col gap-3 mt-3">
          <CoachingDetailRow
            label={t('pronunciationVerdict.details.whatToDo')}
            value={card.whatToDo}
          />

          <CoachingDetailRow
            label={t('pronunciationVerdict.details.tongue')}
            value={card.tongue}
          />

          <CoachingDetailRow
            label={t('pronunciationVerdict.details.lips')}
            value={card.lips}
          />

          <CoachingDetailRow
            label={t('pronunciationVerdict.details.jaw')}
            value={card.jaw}
          />

          <CoachingDetailRow
            label={t('pronunciationVerdict.details.airflow')}
            value={card.airflow}
          />

          <CoachingDetailRow
            label={t('pronunciationVerdict.details.voicing')}
            value={card.voicing}
          />

          <CoachingDetailRow
            label={t('pronunciationVerdict.details.visualCue')}
            value={card.visualCue}
          />

          <CoachingDetailRow
            label={t('pronunciationVerdict.details.commonMistake')}
            value={card.commonMistake}
          />

          <CoachingDetailRow
            label={t('pronunciationVerdict.details.practiceDrill')}
            value={card.practiceDrill}
          />

          <CoachingDetailRow
            label={t('pronunciationVerdict.details.successCue')}
            value={card.successCue}
          />

          <CoachingDetailRow
            label={t('pronunciationVerdict.details.compareWith')}
            value={card.compareWith}
          />
        </div>
      )}
    </div>
  );
}

// ── Curriculum mini-browser shown in the empty state ──────────────────────────
function CurriculumBrowser({
  levels,
  completedIds,
  onLessonSelect,
  t,
}) {
  const [openLevel, setOpenLevel] = React.useState(1);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 mb-1">
        <GraduationCap size={16} color={CYAN} />

        <span
          className="text-sm font-bold tracking-widest"
          style={{ color: CYAN }}
        >
          {t('practice.lessonCurriculum').toUpperCase()}
        </span>

        <span
          className="text-sm ml-auto"
          style={{ color: '#64748b' }}
        >
          {completedIds.size} /{' '}
          {(levels || []).reduce(
            (sum, level) => sum + level.lessons.length,
            0
          )}{' '}
          {t('curriculum.done')}
        </span>
      </div>

      {(levels || []).map((level) => {
        const isOpen = openLevel === level.level;
        const passed = level.lessons.filter((lesson) =>
          completedIds.has(lesson.id)
        ).length;

        return (
          <div
            key={level.level}
            className="rounded-xl overflow-hidden"
            style={{ border: `1px solid ${level.color}44` }}
          >
            <button
              className="w-full flex items-center gap-3 px-3 py-2 text-left"
              style={{ background: `${level.color}12` }}
              onClick={() =>
                setOpenLevel(isOpen ? null : level.level)
              }
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{
                  background: level.color,
                  color: '#0a1628',
                }}
              >
                {level.level}
              </div>

              <span
                className="flex-1 text-sm font-semibold"
                style={{ color: level.color }}
              >
                {level.title}
              </span>

              <span
                className="text-sm"
                style={{ color: '#64748b' }}
              >
                {passed}/{level.lessons.length}
              </span>

              {isOpen ? (
                <ChevronUp size={12} color={level.color} />
              ) : (
                <ChevronDown size={12} color={level.color} />
              )}
            </button>

            {isOpen && (
              <div className="px-2 pb-2 pt-1 flex flex-col gap-1.5">
                {level.lessons.map((lesson) => {
                  const isPassed = completedIds.has(lesson.id);

                  return (
                    <button
                      key={lesson.id}
                      onClick={() => onLessonSelect(lesson)}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all hover:brightness-110"
                      style={{
                        background: isPassed
                          ? `${level.color}15`
                          : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${
                          isPassed
                            ? level.color + '66'
                            : 'rgba(255,255,255,0.1)'
                        }`,
                      }}
                    >
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{
                          background: isPassed
                            ? level.color
                            : 'rgba(255,255,255,0.1)',
                        }}
                      >
                        {isPassed ? (
                          <CheckCircle
                            size={12}
                            color="#0a1628"
                          />
                        ) : (
                          <Play
                            size={10}
                            color={level.color}
                          />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-semibold truncate"
                          style={{
                            color: isPassed
                              ? level.color
                              : '#e2e8f0',
                          }}
                        >
                          {lesson.label}
                        </p>

                        <p
                          className="text-sm truncate"
                          style={{ color: '#94a3b8' }}
                        >
                          "{lesson.word}"
                        </p>
                      </div>

                      {isPassed && (
                        <span
                          className="text-xs flex-shrink-0"
                          style={{ color: level.color }}
                        >
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Main CoachingBox ───────────────────────────────────────────────────────────
export default function CoachingBox({
  coachingData,
  targetWord,
  activeCurriculumLesson,
  completedIds = new Set(),
  onLessonSelect,
  onExitGuidedRecovery,
}) {
  const { t, uiLanguage } = useLanguage();

  const {
    activePracticePack,
    activePracticeLanguage,
  } = usePlugin();

  const [curriculumOpen, setCurriculumOpen] = useState(false);
  const [totalMissJoke, setTotalMissJoke] = useState('');

  const showCurriculum = !coachingData;
  const guided = coachingData?.guidedRecovery ?? null;
  const guidedActive = guided?.active === true;
  const guidedCompleted = guided?.completed === true;
  const guidedVisible = guidedActive || guidedCompleted;
  const guidedUnit = guidedActive
    ? guided.units?.[guided.currentIndex] ?? null
    : null;
  const guidedInstruction = useMemo(() => {
    if (guidedCompleted) {
      return t('guidedCoaching.sequenceComplete', {
        target: guided?.originalTargetText || targetWord || '',
      });
    }

    if (!guidedActive || !guidedUnit) {
      return guided?.instruction || '';
    }

    const instruction = getGuidedRecoveryInstruction({
      unit: guidedUnit,
      failureCount: Number(guided.failureCount || 0),
      detectedDisplay: guided.lastDetectedDisplay || '',
      originalTargetText: guided.originalTargetText || targetWord || '',
      translate: t,
    });

    if (guided.justPassed) {
      return `${t('guidedCoaching.soundMatched', {
        sound: guided.justPassed,
      })} ${instruction}`;
    }

    if (
      Number(guided.currentIndex || 0) === 0 &&
      Number(guided.failureCount || 0) === 0
    ) {
      return `${t('guidedCoaching.firstSoundIntro', {
        target: guided.originalTargetText || targetWord || '',
      })} ${instruction}`;
    }

    return instruction;
  }, [
    guided,
    guidedActive,
    guidedCompleted,
    guidedUnit,
    t,
    targetWord,
  ]);

  const PACK_CURR =
    activePracticePack?.getCurriculum?.() ||
    localizeCurriculum(activePracticeLanguage);

  const attemptSummary = useMemo(
    () => buildAttemptSummary(coachingData),
    [coachingData]
  );
  const prosodyContract =
    activePracticePack?.getProsodyScoringContract?.() || {};
  const prosodyShare = Math.max(
    0,
    Math.min(
      1,
      Number(
        prosodyContract.shareOfSpeechEvidence ??
        prosodyContract.toneShareOfSpeechEvidence ??
        0
      ) || 0
    )
  );
  const prosodyResultTranslationKey =
    prosodyContract.resultTranslationKey ||
    'pronunciationVerdict.toneResults';

  useEffect(() => {
    if (!attemptSummary.totalMiss || guidedVisible) {
      setTotalMissJoke('');
      return;
    }

    setTotalMissJoke(
      getNextTotalMissJoke()
    );
  }, [coachingData, attemptSummary.totalMiss, guidedVisible]);

  const attemptMessage = useMemo(
    () => buildAttemptMessage(
      attemptSummary,
      totalMissJoke,
      t,
      uiLanguage
    ),
    [attemptSummary, t, totalMissJoke, uiLanguage]
  );

  const toneStyle = getToneStyle(
    attemptMessage.tone
  );

  const MATCH_LABELS = {
    exact: `✓ ${t('curriculum.passed')}`,
    close: `~ ${t('practice.matchClose')}`,
    partial: `△ ${t('practice.matchPartial')}`,
    miss: `✗ ${t('practice.matchMiss')}`,
  };

  const fallbackSuggestion =
    coachingData?.uasCoaching?.shortMessage ||
    coachingData?.suggestions ||
    '';

  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-3"
      style={{
        background: 'rgba(0,0,0,0.3)',
        border: '1px solid rgba(0,188,212,0.3)',
      }}
    >
      <p
        className="text-xs font-bold tracking-widest text-center"
        style={{ color: CYAN }}
      >
        {t('practice.coaching')}
      </p>

      {/* Lesson Curriculum toggle button — always visible */}
      <button
        onClick={() => setCurriculumOpen((open) => !open)}
        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl font-bold text-sm transition-all hover:brightness-110"
        style={{
          background: 'rgba(0,188,212,0.12)',
          border: `1px solid ${CYAN}55`,
          color: CYAN,
        }}
      >
        <GraduationCap size={15} color={CYAN} />
        {t('practice.lessonCurriculum')}
        {curriculumOpen ? (
          <ChevronUp size={14} />
        ) : (
          <ChevronDown size={14} />
        )}
      </button>

      {curriculumOpen && (
        <CurriculumBrowser
          levels={PACK_CURR}
          completedIds={completedIds}
          onLessonSelect={(lesson) => {
            onLessonSelect(lesson);
            setCurriculumOpen(false);
          }}
          t={t}
        />
      )}

      {!showCurriculum && !curriculumOpen ? (
        <div className="flex flex-col gap-3">
          {/* Target vs heard */}
          <div
            className="rounded-xl p-3"
            style={{
              background: 'rgba(0,0,0,0.25)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div
              style={{
                display: 'flex',
                gap: 8,
                alignItems: 'stretch',
              }}
            >
              <div
                style={{
                  flex: 1,
                  textAlign: 'center',
                }}
              >
                <p
                  className="text-xs font-bold mb-1"
                  style={{ color: '#f5c518' }}
                >
                  {t('practice.target')}
                </p>

                <p
                  style={{
                    color: '#f5c518',
                    fontSize: 28,
                    fontWeight: 800,
                    lineHeight: 1.1,
                    wordBreak: 'break-word',
                    fontFamily: 'monospace',
                  }}
                >
                  {targetWord || '—'}
                </p>
              </div>

              <div
                style={{
                  width: 1,
                  background: 'rgba(255,255,255,0.12)',
                  margin: '4px 0',
                }}
              />

              <div
                style={{
                  flex: 1,
                  textAlign: 'center',
                }}
              >
                <p
                  className="text-xs font-bold mb-1"
                  style={{ color: CYAN }}
                >
                  {t('practice.youSoundedLike')}
                </p>

                {coachingData.analyzing ? (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 4,
                      paddingTop: 4,
                    }}
                  >
                    <Loader2
                      size={20}
                      className="animate-spin"
                      style={{ color: CYAN }}
                    />

                    <span
                      style={{
                        color: 'rgba(0,188,212,0.6)',
                        fontSize: 11,
                      }}
                    >
                      {t('practice.listening')}
                    </span>
                  </div>
                ) : coachingData.transcript ? (
                  <p
                    style={{
                      color: CYAN,
                      fontSize: 28,
                      fontWeight: 800,
                      lineHeight: 1.1,
                      wordBreak: 'break-word',
                      fontFamily: 'monospace',
                    }}
                  >
                    {coachingData.transcript}
                  </p>
                ) : (
                  <p
                    style={{
                      color: 'rgba(255,255,255,0.2)',
                      fontSize: 22,
                      fontWeight: 600,
                    }}
                  >
                    —
                  </p>
                )}
              </div>
            </div>

            {coachingData.match && !coachingData.analyzing && (
              <div
                style={{
                  textAlign: 'center',
                  marginTop: 8,
                }}
              >
                <span
                  className="text-xs px-3 py-0.5 rounded-full font-bold"
                  style={{
                    background: `${MATCH_COLORS[coachingData.match]}22`,
                    border: `1px solid ${MATCH_COLORS[coachingData.match]}66`,
                    color: MATCH_COLORS[coachingData.match],
                  }}
                >
                  {MATCH_LABELS[coachingData.match] ?? coachingData.match}
                </span>
              </div>
            )}
          </div>

          {!coachingData.analyzing && (
            <>
              {guidedVisible ? (
                <div
                  className="rounded-xl p-3 flex flex-col gap-3"
                  style={{
                    background: guidedCompleted
                      ? 'rgba(34,197,94,0.12)'
                      : 'rgba(245,197,24,0.10)',
                    border: `1px solid ${guidedCompleted ? '#22c55e' : '#f5c518'}`,
                  }}
                >
                  <div>
                    <p
                      className="text-base font-extrabold"
                      style={{ color: guidedCompleted ? '#22c55e' : '#f5c518' }}
                    >
                      {guidedCompleted
                        ? t('guidedCoaching.readyForWholeTarget')
                        : t('guidedCoaching.guidedSoundPractice')}
                    </p>

                    <p
                      className="text-sm leading-relaxed mt-1"
                      style={{ color: 'rgba(255,255,255,0.9)' }}
                    >
                      {guidedInstruction}
                    </p>
                  </div>

                  {guidedActive && guidedUnit && (
                    <div
                      className="rounded-lg px-3 py-2"
                      style={{
                        background: 'rgba(0,0,0,0.22)',
                        border: '1px solid rgba(255,255,255,0.12)',
                      }}
                    >
                      <p className="text-xs" style={{ color: '#94a3b8' }}>
                        {t('guidedCoaching.targetProgress', {
                          target: guided.originalTargetText,
                          current: Number(guided.currentIndex || 0) + 1,
                          total: guided.units?.length || 1,
                        })}
                      </p>
                      <p
                        className="mt-1 font-extrabold"
                        style={{
                          color: '#f5c518',
                          fontFamily: 'monospace',
                          fontSize: 30,
                        }}
                      >
                        {guidedUnit.display || guidedUnit.phoneme}
                      </p>
                    </div>
                  )}

                  {guidedActive && onExitGuidedRecovery && (
                    <button
                      type="button"
                      onClick={onExitGuidedRecovery}
                      className="rounded-lg px-3 py-2 text-sm font-bold transition-all hover:brightness-110"
                      style={{
                        background: 'rgba(0,188,212,0.12)',
                        border: `1px solid ${CYAN}88`,
                        color: CYAN,
                      }}
                    >
                      {t('guidedCoaching.tryWholeTarget')}
                    </button>
                  )}
                </div>
              ) : (
                <div
                  className="rounded-xl p-3"
                  style={{
                    background: toneStyle.background,
                    border: `1px solid ${toneStyle.border}`,
                  }}
                >
                  <p
                    className="text-base font-extrabold"
                    style={{ color: toneStyle.title }}
                  >
                    {attemptMessage.title}
                  </p>

                  <p
                    className="text-sm leading-relaxed mt-1"
                    style={{ color: 'rgba(255,255,255,0.88)' }}
                  >
                    {attemptMessage.message}
                  </p>
                </div>
              )}

              {/* 70 / 30 verdict */}
              {attemptSummary.scoreReady && (
                <div
                  className="rounded-xl p-3 flex flex-col gap-3"
                  style={{
                    background: 'rgba(0,188,212,0.07)',
                    border: '1px solid rgba(0,188,212,0.25)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <Mic size={13} style={{ color: CYAN }} />

                    <p
                      className="text-xs font-bold"
                      style={{ color: CYAN }}
                    >
                      {t(
                        attemptSummary.articulationScore == null
                          ? 'pronunciationVerdict.phonemeResults'
                          : 'pronunciationVerdict.combinedHeading'
                      )}
                    </p>
                  </div>

                  <ScoreDial
                    score={attemptSummary.scorePercent}
                    t={t}
                  />

                  <div
                    style={{
                      display: 'flex',
                      gap: 8,
                      flexWrap: 'wrap',
                    }}
                  >
                    <EvidenceHalf
                      label={t('pronunciationVerdict.phonemeResults')}
                      score={attemptSummary.segmentalAudioScore}
                      note={attemptSummary.prosodyScore != null
                        ? t('pronunciationVerdict.speechEvidenceWeight', {
                            weight: Math.round(
                              (1 - prosodyShare) * 100
                            ),
                          })
                        : t('pronunciationVerdict.verdictWeight', {
                            weight:
                              attemptSummary.articulationScore == null
                                ? 100
                                : Math.round(PHONEME_RESULT_WEIGHT * 100),
                          })}
                    />

                    {attemptSummary.prosodyScore != null && (
                      <EvidenceHalf
                        label={t(prosodyResultTranslationKey)}
                        score={attemptSummary.prosodyScore}
                        note={t('pronunciationVerdict.speechEvidenceWeight', {
                          weight: Math.round(
                            prosodyShare * 100
                          ),
                        })}
                      />
                    )}

                    {attemptSummary.articulationScore != null && (
                      <EvidenceHalf
                        label={t('pronunciationVerdict.mouthMovement')}
                        score={attemptSummary.articulationScore}
                        note={t('pronunciationVerdict.verdictWeight', {
                          weight: Math.round(MOUTH_MOVEMENT_WEIGHT * 100),
                        })}
                      />
                    )}
                  </div>

                  {attemptSummary.articulationScore != null && (
                    <p
                      className="text-xs text-center"
                      style={{ color: '#94a3b8' }}
                    >
                      {t('pronunciationVerdict.mouthSupport')}
                    </p>
                  )}

                  {attemptSummary.missingExpectedCount > 0 && (
                    <p
                      className="text-xs text-center"
                      style={{ color: '#f5c518' }}
                    >
                      {t(
                        attemptSummary.missingExpectedCount === 1
                          ? 'pronunciationVerdict.missingExpectedOne'
                          : 'pronunciationVerdict.missingExpectedMany',
                        { count: attemptSummary.missingExpectedCount }
                      )}
                    </p>
                  )}
                </div>
              )}

              {/* Existing phoneme breakdown remains available */}
              {!guidedVisible && coachingData.phonemeBreakdown?.length > 0 && (
                <div
                  className="rounded-xl p-3"
                  style={{
                    background: 'rgba(255,255,255,0.035)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <p
                    className="text-xs font-bold mb-2"
                    style={{ color: CYAN }}
                  >
                    {t('pronunciationVerdict.detectedSounds')}
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 5,
                    }}
                  >
                    {coachingData.phonemeBreakdown.map((phoneme, index) => (
                      <div
                        key={index}
                        title={phoneme.note}
                        style={{
                          padding: '3px 8px',
                          borderRadius: 6,
                          fontSize: 12,
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          background: `${
                            STATUS_COLORS[phoneme.status] ?? '#94a3b8'
                          }22`,
                          border: `1px solid ${
                            STATUS_COLORS[phoneme.status] ?? '#94a3b8'
                          }66`,
                          color:
                            STATUS_COLORS[phoneme.status] ?? '#94a3b8',
                          cursor: 'default',
                        }}
                      >
                        {phoneme.phoneme}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Evidence-based detailed coaching: mismatch only */}
              {!guidedVisible &&
                attemptSummary.mismatchCount > 0 &&
                attemptSummary.primaryCard && (
                  <div className="flex flex-col gap-2">
                    <p
                      className="text-xs font-bold"
                      style={{ color: CYAN }}
                    >
                      {t('pronunciationVerdict.mostUsefulCoaching')}
                    </p>

                    <DetailedCoachingCard
                      card={attemptSummary.primaryCard}
                      t={t}
                    />

                    {attemptSummary.secondaryCard?.tip && (
                      <div
                        className="rounded-lg px-3 py-2"
                        style={{
                          background: 'rgba(255,255,255,0.035)',
                          border: '1px solid rgba(255,255,255,0.08)',
                        }}
                      >
                        <p
                          className="text-xs font-bold mb-1"
                          style={{ color: '#94a3b8' }}
                        >
                          {t('pronunciationVerdict.oneMoreThing')}
                        </p>

                        <p
                          className="text-sm leading-relaxed"
                          style={{ color: 'rgba(255,255,255,0.78)' }}
                        >
                          {attemptSummary.secondaryCard.tip}
                        </p>
                      </div>
                    )}
                  </div>
                )}

              {/* Language-pack UAS fallback, only when no detailed card exists */}
              {!guidedVisible &&
                attemptSummary.mismatchCount > 0 &&
                !attemptSummary.primaryCard &&
                fallbackSuggestion && (
                  <div
                    className="rounded-xl p-3"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                  >
                    <p
                      className="text-xs font-bold mb-1"
                      style={{ color: CYAN }}
                    >
                      {t('practice.tips')}:
                    </p>

                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: 'rgba(255,255,255,0.8)' }}
                    >
                      {fallbackSuggestion}
                    </p>
                  </div>
                )}

              {/* Expected / detected display from the pack */}
              {!guidedVisible && coachingData.uasCoaching?.expectedDisplay && (
                <div
                  className="rounded-xl p-3 flex flex-col gap-2"
                  style={{
                    background: 'rgba(255,255,255,0.035)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <div>
                    <p
                      className="text-xs font-bold mb-1"
                      style={{ color: '#f5c518' }}
                    >
                      {t('pronunciationVerdict.expectedSounds')}:
                    </p>

                    <p
                      className="text-sm leading-relaxed"
                      style={{
                        color: '#f5c518',
                        fontFamily: 'monospace',
                      }}
                    >
                      {coachingData.uasCoaching.expectedDisplay}
                    </p>
                  </div>

                  {coachingData.uasCoaching.detectedDisplay && (
                    <div>
                      <p
                        className="text-xs font-bold mb-1"
                        style={{ color: CYAN }}
                      >
                        {t('pronunciationVerdict.youSoundedLike')}:
                      </p>

                      <p
                        className="text-sm leading-relaxed"
                        style={{
                          color: CYAN,
                          fontFamily: 'monospace',
                        }}
                      >
                        {coachingData.uasCoaching.detectedDisplay}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Lesson passed banner */}
          {coachingData.lessonPassed && (
            <div
              style={{
                textAlign: 'center',
                padding: '6px 0',
              }}
            >
              <span
                className="text-sm font-bold px-4 py-2 rounded-full"
                style={{
                  background: 'rgba(167,139,250,0.2)',
                  border: '1.5px solid #a78bfa',
                  color: '#a78bfa',
                }}
              >
                {t('practice.lessonPassed')}
              </span>
            </div>
          )}

          {/* Session saved badge */}
          {coachingData.sessionSaved && (
            <div style={{ textAlign: 'center' }}>
              <span
                className="text-xs px-3 py-1 rounded-full"
                style={{
                  background: 'rgba(34,197,94,0.15)',
                  border: '1px solid rgba(34,197,94,0.35)',
                  color: '#22c55e',
                }}
              >
                {t('practice.savedToLibrary')}
              </span>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
