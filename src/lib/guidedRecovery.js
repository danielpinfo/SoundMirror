const GUIDED_RECOVERY_PHONEME_SCORE = 0.55;
const GUIDED_RECOVERY_MISMATCH_RATIO = 0.4;
const GUIDED_SOUND_PASS_SCORE = 0.7;
const GUIDED_HISTORY_KEY = 'soundmirror_guided_sound_attempts';
const MAX_GUIDED_HISTORY = 500;

function clamp01(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return null;
  return Math.max(0, Math.min(1, numeric));
}

function formatGuidedCopy(translate, key, params, fallback) {
  if (typeof translate === 'function') {
    const localized = translate(key, params);
    if (localized && localized !== key) return localized;
  }

  return String(fallback || '').replace(
    /\{([A-Za-z0-9_]+)\}/g,
    (match, name) =>
      Object.prototype.hasOwnProperty.call(params || {}, name)
        ? String(params[name])
        : match
  );
}

export function shouldStartGuidedRecovery({
  attemptDetected,
  audioScore,
  mismatchCount = 0,
  exactCount = 0,
  expectedCount = 0,
}) {
  if (!attemptDetected || expectedCount <= 0) return false;

  const phonemeScore = clamp01(audioScore);
  const mismatchRatio = Math.max(0, mismatchCount) / expectedCount;
  const exactRatio = Math.max(0, exactCount) / expectedCount;

  return (
    (phonemeScore != null && phonemeScore <= GUIDED_RECOVERY_PHONEME_SCORE) ||
    (mismatchRatio >= GUIDED_RECOVERY_MISMATCH_RATIO && exactRatio < 0.75)
  );
}

export function buildGuidedRecoveryUnits({
  analysisItems,
  expectedPhonemes,
  toDisplayToken,
  getGuidedSoundCue,
}) {
  const aligned = Array.isArray(analysisItems)
    ? analysisItems.filter((item) =>
        String(item?.expectedPhoneme ?? '').trim()
      )
    : [];

  const attemptContext = aligned.find(
    (item) => item?.attemptContext
  )?.attemptContext;

  const missingExpected = Array.isArray(
    attemptContext?.missingExpected
  )
    ? attemptContext.missingExpected
    : [];

  let failed = [
    ...aligned
      .filter((item) => item?.audioMismatch === true)
      .map((item) => ({
        ...item,
        expectedIndex: item?.expectedIndex ?? Number.MAX_SAFE_INTEGER,
      })),
    ...missingExpected.map((item) => ({
      expectedPhoneme: item?.expectedPhoneme,
      expectedIndex: item?.expectedIndex ?? Number.MAX_SAFE_INTEGER,
      coaching: null,
    })),
  ]
    .sort((left, right) => left.expectedIndex - right.expectedIndex)
    .filter((item, index, list) =>
      index === 0 ||
      item.expectedIndex !== list[index - 1].expectedIndex
    );

  if (!failed.length) {
    failed = (Array.isArray(expectedPhonemes) ? expectedPhonemes : [])
      .map((phoneme) => ({ expectedPhoneme: phoneme }));
  }

  return failed
    .map((item, index) => {
      const phoneme = String(item?.expectedPhoneme ?? '').trim();
      if (!phoneme) return null;

      return {
        id: `${index}-${phoneme}`,
        phoneme,
        expectedIndex:
          Number.isInteger(item?.expectedIndex)
            ? item.expectedIndex
            : index,
        display:
          toDisplayToken?.(phoneme) || phoneme,
        coachingTip:
          item?.coaching?.primary?.tip ??
          item?.coaching?.primary?.correction ??
          null,
        guidedCue:
          getGuidedSoundCue?.(phoneme) ?? null,
      };
    })
    .filter(Boolean);
}

export function isGuidedSoundPassed(verdict, options = {}) {
  const analysisItems = Array.isArray(options?.analysisItems)
    ? options.analysisItems
    : [];
  const targetExpectedIndex = Number.isInteger(options?.targetExpectedIndex)
    ? options.targetExpectedIndex
    : null;

  if (analysisItems.length && targetExpectedIndex != null) {
    const targetItem = analysisItems.find(
      (item) => item?.expectedIndex === targetExpectedIndex
    );
    const targetAudioScore = clamp01(targetItem?.audioScore);
    const targetArticulationScore = clamp01(targetItem?.articulationScore);
    const acceptedTargetPhonemes = Array.isArray(
      options?.acceptedTargetPhonemes
    )
      ? options.acceptedTargetPhonemes.map((value) =>
          String(value || '').trim().toLowerCase()
        )
      : [];
    const detectedTargetPhoneme = String(
      targetItem?.detectedPhoneme || targetItem?.phoneme || ''
    ).trim().toLowerCase();
    const closePassAfterFailures = Math.max(
      0,
      Number(options?.closePassAfterFailures) || 0
    );
    const minCloseMouthScore = clamp01(options?.minCloseMouthScore) ?? 0.55;

    const exactTargetPassed =
      targetItem?.exactPhonemeMatch === true &&
      targetAudioScore != null &&
      targetAudioScore >= GUIDED_SOUND_PASS_SCORE;

    const approvedCloseTargetPassed =
      acceptedTargetPhonemes.includes(detectedTargetPhoneme) &&
      Number(options?.failureCount || 0) >= closePassAfterFailures &&
      targetArticulationScore != null &&
      targetArticulationScore >= minCloseMouthScore;

    return exactTargetPassed || approvedCloseTargetPassed;
  }

  const phonemeScore = clamp01(verdict?.audioScore);

  return (
    phonemeScore != null &&
    phonemeScore >= GUIDED_SOUND_PASS_SCORE &&
    Number(verdict?.mismatchCount || 0) === 0 &&
    Number(verdict?.exactCount || 0) >= 1
  );
}

export function getGuidedRecoveryInstruction({
  unit,
  failureCount = 0,
  detectedDisplay = '',
  originalTargetText = '',
  translate,
}) {
  const sound = unit?.display || unit?.phoneme || 'this sound';
  const cue = unit?.guidedCue?.displayText || sound;
  const cueInstruction = cue === sound
    ? formatGuidedCopy(
        translate,
        'guidedCoaching.practiceOnly',
        { sound },
        'Practice only “{sound}”.'
      )
    : formatGuidedCopy(
        translate,
        'guidedCoaching.sayCue',
        { cue, sound },
        'Say “{cue}” to practice the “{sound}” sound.'
      );

  if (failureCount <= 0) {
    return formatGuidedCopy(
      translate,
      'guidedCoaching.watchAndRecord',
      { lead: cueInstruction },
      '{lead} Watch the front and side views, then record the same short cue.'
    );
  }

  if (failureCount === 1) {
    return formatGuidedCopy(
      translate,
      'guidedCoaching.keepTarget',
      { cue },
      'Keep the target on “{cue}”. Slow the movement down and exaggerate the mouth position once.'
    );
  }

  if (failureCount === 2 && detectedDisplay) {
    return formatGuidedCopy(
      translate,
      'guidedCoaching.heardInstead',
      { detected: detectedDisplay, cue },
      'SoundMirror heard “{detected}” instead of “{cue}”. Compare only those two sounds, then try “{cue}” again.'
    );
  }

  if (failureCount === 3) {
    return formatGuidedCopy(
      translate,
      'guidedCoaching.resetCue',
      { cue },
      'Reset “{cue}”: form the mouth position silently first, then add your voice and record one short cue.'
    );
  }

  return formatGuidedCopy(
    translate,
    'guidedCoaching.stayWithCue',
    { cue, target: originalTargetText },
    'Stay with “{cue}” before returning to “{target}”. Replay the short model, watch the coached sound, then record “{cue}”.'
  );
}

export function saveGuidedAttempt(attempt) {
  try {
    const raw = localStorage.getItem(GUIDED_HISTORY_KEY);
    const existing = raw ? JSON.parse(raw) : [];
    const next = [attempt, ...(Array.isArray(existing) ? existing : [])]
      .slice(0, MAX_GUIDED_HISTORY);
    localStorage.setItem(GUIDED_HISTORY_KEY, JSON.stringify(next));
  } catch (error) {
    console.warn('[GUIDED RECOVERY] attempt history could not be saved', error);
  }
}
