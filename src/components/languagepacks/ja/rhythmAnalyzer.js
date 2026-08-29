/*
 * Japanese mora-quantity and rhythm analysis.
 *
 * This pack-owned layer deliberately grades timing rather than pitch accent.
 * Long vowels, sokuon (small っ), and moraic ん are contrastive timing units,
 * while lexical pitch patterns vary by dialect and are not present in the
 * pack's dictionary truth. The analyzer therefore uses only real backend
 * phoneme timestamps and abstains when the shared shell had to estimate them.
 */

export const JAPANESE_RHYTHM_SHARE_OF_SPEECH_EVIDENCE = 0.15;

const VOWEL_PHONES = new Set(['a', 'i', 'u', 'e', 'o']);

function clamp01(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  return Math.max(0, Math.min(1, number));
}

function median(values = []) {
  const sorted = values
    .map(Number)
    .filter((value) => Number.isFinite(value) && value > 0)
    .sort((left, right) => left - right);
  if (!sorted.length) return null;
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
}

function reliableTimestamp(item) {
  const source = String(item?.timestampSource || '');
  const startMs = Number(item?.startMs);
  const endMs = Number(item?.endMs);
  return (
    source !== '' &&
    source !== 'estimated-even' &&
    Number.isFinite(startMs) &&
    Number.isFinite(endMs) &&
    endMs > startMs
  );
}

function durationMs(item) {
  return Math.max(0, Number(item?.endMs) - Number(item?.startMs));
}

function ratioScore(observed, expected) {
  if (!(observed > 0) || !(expected > 0)) return null;
  const distance = Math.abs(Math.log(observed / expected));
  return clamp01(Math.exp(-distance * 1.55));
}

function extendedTimingScore(ratio, { low, full, high }) {
  if (!Number.isFinite(ratio) || ratio <= 0) return null;
  if (ratio < low) return clamp01((ratio - 0.75) / (low - 0.75));
  if (ratio <= high) return 1;
  return clamp01(1 - (ratio - high) / Math.max(0.25, full));
}

function buildTimingGroups(morae = [], analysisItems = []) {
  const groups = [];
  let expectedIndex = 0;
  let pendingSokuon = 0;

  morae.forEach((mora, moraIndex) => {
    const kind = String(mora?.kind || 'mora');
    const phones = Array.isArray(mora?.phones)
      ? mora.phones.filter(Boolean)
      : [];

    if (kind === 'sokuon') {
      pendingSokuon += 1;
      return;
    }

    if (kind === 'long-vowel') {
      const host = groups[groups.length - 1];
      if (host) {
        host.expectedMoraCount += 1;
        host.quantityKinds.push('long-vowel');
        host.quantityLabels.push(String(mora?.display || mora?.kana || ''));
      }
      return;
    }

    if (!phones.length) return;

    const expectedIndices = phones.map(() => expectedIndex++);
    const group = {
      moraIndex,
      kana: String(mora?.kana || ''),
      display: String(mora?.display || ''),
      kind,
      phones,
      expectedIndices,
      expectedMoraCount: 1 + pendingSokuon,
      quantityKinds: pendingSokuon > 0 ? ['sokuon'] : [],
      quantityLabels: pendingSokuon > 0 ? ['っ'] : [],
    };
    pendingSokuon = 0;
    groups.push(group);
  });

  return groups.map((group) => {
    const items = analysisItems
      .filter((item) => group.expectedIndices.includes(Number(item?.expectedIndex)))
      .filter(reliableTimestamp)
      .sort((left, right) => Number(left.startMs) - Number(right.startMs));
    const first = items[0] || null;
    const last = items[items.length - 1] || null;
    const startMs = first ? Number(first.startMs) : null;
    const endMs = last ? Number(last.endMs) : null;
    const observedDurationMs =
      startMs != null && endMs != null && endMs > startMs
        ? endMs - startMs
        : null;

    return {
      ...group,
      timedItemCount: items.length,
      fullyTimed: items.length === group.expectedIndices.length,
      startMs,
      endMs,
      observedDurationMs,
      onsetDurationMs:
        first && !VOWEL_PHONES.has(String(group.phones[0] || ''))
          ? durationMs(first)
          : null,
      vowelDurationMs:
        last && VOWEL_PHONES.has(String(group.phones.at(-1) || ''))
          ? durationMs(last)
          : null,
      timestampSources: [...new Set(items.map((item) => item.timestampSource))],
    };
  });
}

function scoreQuantityTargets(groups, plainGroups) {
  const plainVowelReference = median(
    plainGroups.map((group) => group.vowelDurationMs)
  );
  const plainOnsetReference = median(
    plainGroups.map((group) => group.onsetDurationMs)
  );
  const targets = [];

  groups.forEach((group) => {
    if (group.quantityKinds.includes('long-vowel')) {
      const ratio = plainVowelReference
        ? group.vowelDurationMs / plainVowelReference
        : null;
      targets.push({
        kind: 'long-vowel',
        moraIndex: group.moraIndex,
        mora: group.kana,
        display: group.display,
        observedRatio: ratio,
        score: extendedTimingScore(ratio, { low: 1.35, full: 1.1, high: 2.8 }),
      });
    }

    if (group.quantityKinds.includes('sokuon')) {
      const ratio = plainOnsetReference
        ? group.onsetDurationMs / plainOnsetReference
        : null;
      targets.push({
        kind: 'sokuon',
        moraIndex: group.moraIndex,
        mora: group.kana,
        display: group.display,
        observedRatio: ratio,
        score: extendedTimingScore(ratio, { low: 1.2, full: 1.0, high: 2.7 }),
      });
    }
  });

  return targets;
}

export function analyzeJapaneseMoraRhythm({
  prosodyUnits = [],
  analysisItems = [],
} = {}) {
  const morae = Array.isArray(prosodyUnits) ? prosodyUnits : [];
  const items = Array.isArray(analysisItems) ? analysisItems : [];
  const groups = buildTimingGroups(morae, items);
  const timedGroups = groups.filter((group) => group.fullyTimed);
  const coverage = groups.length ? timedGroups.length / groups.length : 0;

  if (groups.length < 2 || coverage < 0.6) {
    return {
      available: false,
      abstained: true,
      score: null,
      coverage,
      groups,
      quantityTargets: [],
      reason: items.some(reliableTimestamp)
        ? 'insufficient-aligned-mora-timing'
        : 'backend-timestamps-required',
      method: 'backend-aligned-mora-relative-duration',
    };
  }

  const baseUnitMs = median(
    timedGroups.map(
      (group) => group.observedDurationMs / group.expectedMoraCount
    )
  );
  const scoredGroups = timedGroups.map((group) => {
    const observedMoraUnits = baseUnitMs
      ? group.observedDurationMs / baseUnitMs
      : null;
    return {
      ...group,
      observedMoraUnits,
      score: ratioScore(observedMoraUnits, group.expectedMoraCount),
    };
  });
  const timingScores = scoredGroups
    .map((group) => group.score)
    .filter((score) => score != null);
  const timingScore = timingScores.length
    ? timingScores.reduce((sum, score) => sum + score, 0) / timingScores.length
    : null;
  const plainGroups = scoredGroups.filter(
    (group) => group.expectedMoraCount === 1
  );
  const quantityTargets = scoreQuantityTargets(scoredGroups, plainGroups);
  const quantityScores = quantityTargets
    .map((target) => target.score)
    .filter((score) => score != null);
  const quantityScore = quantityScores.length
    ? quantityScores.reduce((sum, score) => sum + score, 0) / quantityScores.length
    : null;
  const score = quantityScore == null
    ? timingScore
    : timingScore == null
      ? quantityScore
      : timingScore * 0.35 + quantityScore * 0.65;
  const weakestQuantity = quantityTargets
    .filter((target) => target.score != null)
    .sort((left, right) => left.score - right.score)[0] || null;
  const weakestGroup = scoredGroups
    .filter((group) => group.score != null)
    .sort((left, right) => left.score - right.score)[0] || null;

  return {
    available: score != null,
    abstained: score == null,
    score: clamp01(score),
    coverage,
    timingScore: clamp01(timingScore),
    quantityScore: clamp01(quantityScore),
    groups: scoredGroups,
    quantityTargets,
    weakestUnit: weakestQuantity || weakestGroup,
    method: 'backend-aligned-mora-relative-duration',
    reason: score == null ? 'insufficient-relative-duration-evidence' : null,
  };
}

/**
 * @param {{
 *   segmentalScore?: number | null,
 *   prosodyAnalysis?: { available?: boolean, score?: number | null } | null,
 * }} [options]
 */
export function combineJapaneseSpeechEvidence({
  segmentalScore,
  prosodyAnalysis,
} = {}) {
  const segmental = clamp01(segmentalScore);
  const rhythm = prosodyAnalysis?.available
    ? clamp01(prosodyAnalysis.score)
    : null;
  if (segmental == null) return null;
  if (rhythm == null) return segmental;
  return clamp01(
    segmental * (1 - JAPANESE_RHYTHM_SHARE_OF_SPEECH_EVIDENCE) +
    rhythm * JAPANESE_RHYTHM_SHARE_OF_SPEECH_EVIDENCE
  );
}

export default analyzeJapaneseMoraRhythm;
