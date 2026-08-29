function normalizePhonemeKey(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/^[\/]+|[\/]+$/g, '');
}

function buildLearningInputFrameMap(learningInput) {
  const map = {};
  const tokens = Array.isArray(learningInput?.tokens) ? learningInput.tokens : [];

  tokens.forEach((token) => {
    const phoneme = normalizePhonemeKey(token?.phoneme);
    const frame = Number.isFinite(token?.frame) ? token.frame : null;
    if (phoneme && frame != null && map[phoneme] == null) {
      map[phoneme] = frame;
    }
  });

  const expectedPhonemes = Array.isArray(learningInput?.expectedPhonemes)
    ? learningInput.expectedPhonemes
    : [];
  const expectedFrames = Array.isArray(learningInput?.expectedFrames)
    ? learningInput.expectedFrames
    : [];

  expectedPhonemes.forEach((phonemeValue, index) => {
    const phoneme = normalizePhonemeKey(phonemeValue);
    const frame = expectedFrames[index];
    if (phoneme && Number.isFinite(frame) && map[phoneme] == null) {
      map[phoneme] = frame;
    }
  });

  return map;
}

function buildArticulationFrameMap(articulationMap) {
  const map = {};
  const frames = Array.isArray(articulationMap?.frames) ? articulationMap.frames : [];

  frames.forEach((frameEntry) => {
    const frameIndex = Number.isFinite(frameEntry?.index) ? frameEntry.index : null;
    const phonemes = Array.isArray(frameEntry?.phonemes) ? frameEntry.phonemes : [];

    if (frameIndex == null) return;

    phonemes.forEach((phonemeValue) => {
      const phoneme = normalizePhonemeKey(phonemeValue);
      if (phoneme && map[phoneme] == null) {
        map[phoneme] = frameIndex;
      }
    });
  });

  return map;
}

function resolveFrameForPhoneme(phoneme, sources) {
  const key = normalizePhonemeKey(phoneme);
  if (!key) return 0;

  for (const source of sources) {
    if (!source) continue;
    const frame = source[key];
    if (Number.isFinite(frame)) {
      return frame;
    }
  }

  return 0;
}

const SPACER_MS = 500;
const SPACER_FRAME = 1;

export function buildAsTimeline({
  audioDurationMs,
  pePhonemes,
  learningInput,
  spriteMetadata,
}) {
  const spokenAudioDurationMs = Math.max(0, Math.round(Number(audioDurationMs) || 0));
  const normalizedPePhonemes = Array.isArray(pePhonemes)
    ? pePhonemes.map(normalizePhonemeKey).filter(Boolean)
    : [];

  const tokenGroups = Array.isArray(learningInput?.tokenGroups)
    ? learningInput.tokenGroups
    : [];

  const hasWordGroups = tokenGroups.length > 1;

  const sequenceEntries = hasWordGroups
    ? tokenGroups.flatMap((group, groupIndex) => {
        const groupEntries = (Array.isArray(group?.tokens) ? group.tokens : [])
          .map((token) => normalizePhonemeKey(token?.phoneme))
          .filter(Boolean)
          .map((phoneme) => ({ phoneme, kind: 'speech' }));

        if (groupIndex < tokenGroups.length - 1) {
          groupEntries.push({
            phoneme: 'spacer',
            kind: 'spacer',
            frame: SPACER_FRAME,
            durationMs: SPACER_MS,
            audioAdvanceMs: 0,
          });
        }

        return groupEntries;
      })
    : normalizedPePhonemes.map((phoneme) => ({ phoneme, kind: 'speech' }));

  if (!sequenceEntries.length || spokenAudioDurationMs <= 0) {
    return [];
  }

  const spriteFrameMap = spriteMetadata?.phonemeToFrame || null;
  const learningTokenMap = buildLearningInputFrameMap(learningInput);
  const articulationFrameMap = buildArticulationFrameMap(learningInput?.articulationMap);
  const frameSources = [spriteFrameMap, learningTokenMap, articulationFrameMap];

  const boundedEntries = [
    { phoneme: 'neutral', frame: 0, kind: 'speech' },
    ...sequenceEntries,
    { phoneme: 'neutral', frame: 0, kind: 'speech' },
  ];

  const spokenEntries = boundedEntries.filter((entry) => entry.kind !== 'spacer');
  const spokenCount = spokenEntries.length;

  if (spokenCount <= 0) {
    return [];
  }

  const spacerCount = boundedEntries.filter((entry) => entry.kind === 'spacer').length;
  const spacerBudgetMs = Math.min(
    spacerCount * SPACER_MS,
    Math.floor(spokenAudioDurationMs * 0.4)
  );
  const baseSpacerDurationMs = spacerCount > 0
    ? Math.floor(spacerBudgetMs / spacerCount)
    : 0;
  const remainingDurationMs = Math.max(1, spokenAudioDurationMs - spacerBudgetMs);
  const baseSpokenDurationMs = Math.max(1, Math.floor(remainingDurationMs / spokenCount));

  const spokenDurations = [];
  let assignedSpokenMs = 0;

  for (let i = 0; i < spokenCount; i++) {
    const isLastSpoken = i === spokenCount - 1;
    const durationMs = isLastSpoken
      ? Math.max(1, remainingDurationMs - assignedSpokenMs)
      : baseSpokenDurationMs;

    spokenDurations.push(durationMs);
    assignedSpokenMs += durationMs;
  }

  const spacerDurations = [];
  let assignedSpacerMs = 0;

  for (let i = 0; i < spacerCount; i++) {
    const isLastSpacer = i === spacerCount - 1;
    const durationMs = isLastSpacer
      ? Math.max(0, spacerBudgetMs - assignedSpacerMs)
      : baseSpacerDurationMs;

    spacerDurations.push(durationMs);
    assignedSpacerMs += durationMs;
  }

  let spokenIndex = 0;
  let spacerIndex = 0;
  let cursorMs = 0;

  const timeline = boundedEntries.map((entry) => {
    const startMs = cursorMs;
    const isSpacer = entry.kind === 'spacer';
    const durationMs = isSpacer
      ? Math.max(0, spacerDurations[spacerIndex++] ?? 0)
      : spokenDurations[spokenIndex++] ?? 1;
    const endMs = startMs + durationMs;
    cursorMs = endMs;

    return {
      phoneme: entry.phoneme,
      frame: Number.isFinite(entry.frame)
        ? entry.frame
        : entry.phoneme === 'neutral'
          ? 0
          : resolveFrameForPhoneme(entry.phoneme, frameSources),
      kind: isSpacer ? 'spacer' : 'speech',
      ...(isSpacer
        ? {
            durationMs,
            audioAdvanceMs: durationMs,
          }
        : {}),
      startMs,
      endMs,
    };
  });

  if (timeline.length > 0) {
    timeline[timeline.length - 1].endMs = spokenAudioDurationMs;
  }

  return timeline;
}