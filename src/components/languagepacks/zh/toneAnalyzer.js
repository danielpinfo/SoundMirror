/*
 * Mandarin lexical-tone analysis.
 *
 * This module is deliberately pack-owned. The shared practice shell only
 * offers recorded samples and aligned phoneme timing to an optional prosody
 * hook; it contains no Mandarin contour rules.
 *
 * F0 extraction follows the cumulative-mean normalized difference used by
 * YIN (de Cheveigne & Kawahara, 2002). Tone targets use the conventional
 * Chao contours: T1 55, T2 35, T3 214, and T4 51. Neutral-tone syllables are
 * retained in the result but are not graded from pitch alone.
 */

export const MANDARIN_TONE_SHARE_OF_SPEECH_EVIDENCE = 0.25;

const MIN_F0_HZ = 65;
const MAX_F0_HZ = 500;
const FRAME_MS = 64;
const HOP_MS = 12;
const YIN_THRESHOLD = 0.16;
const MIN_FRAME_RMS = 0.006;
const MIN_PITCH_POINTS = 5;
const CONTOUR_POINTS = 5;

function clamp01(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  return Math.max(0, Math.min(1, number));
}

function median(values = []) {
  const sorted = values
    .map(Number)
    .filter(Number.isFinite)
    .sort((left, right) => left - right);
  if (!sorted.length) return null;
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
}

function frameRms(samples, start, length) {
  let sum = 0;
  let mean = 0;
  for (let index = 0; index < length; index += 1) {
    mean += samples[start + index] || 0;
  }
  mean /= Math.max(1, length);
  for (let index = 0; index < length; index += 1) {
    const centered = (samples[start + index] || 0) - mean;
    sum += centered * centered;
  }
  return Math.sqrt(sum / Math.max(1, length));
}

function estimateFramePitch(samples, sampleRate, start, frameSize) {
  if (frameRms(samples, start, frameSize) < MIN_FRAME_RMS) return null;

  const minTau = Math.max(2, Math.floor(sampleRate / MAX_F0_HZ));
  const maxTau = Math.min(
    Math.floor(sampleRate / MIN_F0_HZ),
    Math.floor(frameSize / 2) - 1
  );
  const compareLength = frameSize - maxTau;
  if (maxTau <= minTau || compareLength < 1) return null;

  const difference = new Float64Array(maxTau + 1);
  for (let tau = 1; tau <= maxTau; tau += 1) {
    let sum = 0;
    for (let index = 0; index < compareLength; index += 1) {
      const delta =
        (samples[start + index] || 0) -
        (samples[start + index + tau] || 0);
      sum += delta * delta;
    }
    difference[tau] = sum;
  }

  const normalized = new Float64Array(maxTau + 1);
  normalized[0] = 1;
  let running = 0;
  for (let tau = 1; tau <= maxTau; tau += 1) {
    running += difference[tau];
    normalized[tau] = running > 0
      ? (difference[tau] * tau) / running
      : 1;
  }

  let selectedTau = -1;
  for (let tau = minTau; tau <= maxTau; tau += 1) {
    if (normalized[tau] >= YIN_THRESHOLD) continue;
    while (
      tau + 1 <= maxTau &&
      normalized[tau + 1] < normalized[tau]
    ) {
      tau += 1;
    }
    selectedTau = tau;
    break;
  }

  if (selectedTau < 0) {
    let bestValue = 1;
    for (let tau = minTau; tau <= maxTau; tau += 1) {
      if (normalized[tau] < bestValue) {
        bestValue = normalized[tau];
        selectedTau = tau;
      }
    }
    if (selectedTau < 0 || bestValue > 0.28) return null;
  }

  const left = normalized[Math.max(minTau, selectedTau - 1)];
  const center = normalized[selectedTau];
  const right = normalized[Math.min(maxTau, selectedTau + 1)];
  const denominator = left - 2 * center + right;
  const refinedTau = Math.abs(denominator) > 1e-9
    ? selectedTau + (0.5 * (left - right)) / denominator
    : selectedTau;
  const frequency = sampleRate / refinedTau;
  const confidence = clamp01(1 - center);

  if (
    !Number.isFinite(frequency) ||
    frequency < MIN_F0_HZ ||
    frequency > MAX_F0_HZ ||
    confidence == null ||
    confidence < 0.7
  ) {
    return null;
  }

  return { frequency, confidence };
}

export function extractPitchTrack({
  audioSamples,
  sampleRate = 16000,
  startMs = 0,
  endMs = null,
} = {}) {
  if (!(audioSamples instanceof Float32Array) || audioSamples.length === 0) {
    return [];
  }

  const safeRate = Number(sampleRate) > 0 ? Number(sampleRate) : 16000;
  const frameSize = Math.max(256, Math.round((FRAME_MS / 1000) * safeRate));
  const hopSize = Math.max(1, Math.round((HOP_MS / 1000) * safeRate));
  const startSample = Math.max(
    0,
    Math.min(audioSamples.length - 1, Math.round((Number(startMs) / 1000) * safeRate))
  );
  const requestedEnd = Number.isFinite(Number(endMs))
    ? Math.round((Number(endMs) / 1000) * safeRate)
    : audioSamples.length;
  const endSample = Math.max(
    startSample,
    Math.min(audioSamples.length, requestedEnd)
  );
  const points = [];

  for (
    let offset = startSample;
    offset + frameSize <= endSample;
    offset += hopSize
  ) {
    const estimate = estimateFramePitch(
      audioSamples,
      safeRate,
      offset,
      frameSize
    );
    if (!estimate) continue;
    points.push({
      timeMs: ((offset + frameSize / 2) / safeRate) * 1000,
      f0Hz: estimate.frequency,
      confidence: estimate.confidence,
    });
  }

  if (points.length < 2) return points;

  const corrected = [];
  for (const point of points) {
    let frequency = point.f0Hz;
    const previous = corrected[corrected.length - 1]?.f0Hz;
    if (Number.isFinite(previous)) {
      while (frequency / previous > 1.75) frequency /= 2;
      while (previous / frequency > 1.75) frequency *= 2;
      const jumpSemitones = Math.abs(12 * Math.log2(frequency / previous));
      if (jumpSemitones > 8) continue;
    }
    corrected.push({ ...point, f0Hz: frequency });
  }

  return corrected;
}

function interpolateContour(track, pointCount = CONTOUR_POINTS) {
  if (!Array.isArray(track) || track.length < MIN_PITCH_POINTS) return null;
  const start = track[0].timeMs;
  const end = track[track.length - 1].timeMs;
  if (!(end > start)) return null;

  const values = [];
  for (let bin = 0; bin < pointCount; bin += 1) {
    const binStart = start + ((end - start) * bin) / pointCount;
    const binEnd = start + ((end - start) * (bin + 1)) / pointCount;
    const frequencies = track
      .filter((point, index) =>
        point.timeMs >= binStart &&
        (bin === pointCount - 1
          ? point.timeMs <= binEnd
          : point.timeMs < binEnd) &&
        index >= 0
      )
      .map((point) => point.f0Hz);
    values.push(median(frequencies));
  }

  for (let index = 0; index < values.length; index += 1) {
    if (Number.isFinite(values[index])) continue;
    let left = index - 1;
    let right = index + 1;
    while (left >= 0 && !Number.isFinite(values[left])) left -= 1;
    while (right < values.length && !Number.isFinite(values[right])) right += 1;
    if (left >= 0 && right < values.length) {
      const progress = (index - left) / (right - left);
      values[index] = values[left] * (1 - progress) + values[right] * progress;
    } else if (left >= 0) {
      values[index] = values[left];
    } else if (right < values.length) {
      values[index] = values[right];
    }
  }

  if (values.some((value) => !Number.isFinite(value))) return null;
  const reference = median(values);
  return values.map((frequency) => 12 * Math.log2(frequency / reference));
}

function similarityToTemplate(contour, template) {
  const observedMean = contour.reduce((sum, value) => sum + value, 0) / contour.length;
  const templateMean = template.reduce((sum, value) => sum + value, 0) / template.length;
  const observed = contour.map((value) => value - observedMean);
  const expected = template.map((value) => value - templateMean);
  const dot = observed.reduce((sum, value, index) => sum + value * expected[index], 0);
  const observedNorm = Math.sqrt(observed.reduce((sum, value) => sum + value * value, 0));
  const expectedNorm = Math.sqrt(expected.reduce((sum, value) => sum + value * value, 0));
  if (observedNorm < 0.15 || expectedNorm < 0.15) return 0.5;
  return clamp01((dot / (observedNorm * expectedNorm) + 1) / 2) ?? 0;
}

const TONE_TEMPLATES = Object.freeze({
  2: [-2, -1.2, -0.3, 0.8, 2],
  3: [1, -0.8, -2, -0.8, 1],
  4: [2, 1.1, 0.1, -1, -2],
});

function rampScore(value, low, high) {
  if (!Number.isFinite(value)) return 0;
  if (value <= low) return 0;
  if (value >= high) return 1;
  return (value - low) / (high - low);
}

export function scoreToneContour(contour, expectedTone) {
  if (!Array.isArray(contour) || contour.length !== CONTOUR_POINTS) return null;
  const tone = Number(expectedTone);
  if (tone === 0) return null;

  const start = (contour[0] + contour[1]) / 2;
  const end = (contour[3] + contour[4]) / 2;
  const range = Math.max(...contour) - Math.min(...contour);

  if (tone === 1) {
    const flatness = 1 - (clamp01((range - 0.7) / 4.3) ?? 1);
    const levelDirection = 1 - (clamp01((Math.abs(end - start) - 0.4) / 3.6) ?? 1);
    return clamp01(flatness * 0.65 + levelDirection * 0.35);
  }

  if (tone === 2) {
    const rise = end - start;
    const direction = rampScore(rise, -0.5, 2.4);
    const shape = similarityToTemplate(contour, TONE_TEMPLATES[2]);
    return clamp01(direction * 0.65 + shape * 0.35);
  }

  if (tone === 3) {
    const middle = Math.min(contour[1], contour[2], contour[3]);
    const dip = Math.min(start, end) - middle;
    const recovery = end - middle;
    const dipScore = rampScore(dip, -0.2, 1.5);
    const recoveryScore = rampScore(recovery, -0.3, 1.5);
    const shape = similarityToTemplate(contour, TONE_TEMPLATES[3]);
    const fullThird = dipScore * 0.4 + recoveryScore * 0.25 + shape * 0.35;

    /*
     * In connected speech, a non-final third tone is commonly realized as a
     * low/half-third contour without the citation-tone recovery. Accept that
     * gentler fall, while keeping a steep T4-like fall outside the pass band.
     */
    const fall = start - end;
    const gentleFall =
      rampScore(fall, 0.4, 2.2) *
      (1 - rampScore(fall, 5, 10));
    const halfThird = gentleFall * 0.9;
    return clamp01(Math.max(fullThird, halfThird));
  }

  if (tone === 4) {
    const fall = start - end;
    const direction = rampScore(fall, -0.5, 2.8);
    const shape = similarityToTemplate(contour, TONE_TEMPLATES[4]);
    return clamp01(direction * 0.65 + shape * 0.35);
  }

  return null;
}

function syllableWindow(syllable, expectedStartIndex, analysisItems) {
  const tokenCount = Math.max(1, Array.isArray(syllable?.tokens) ? syllable.tokens.length : 1);
  const finalExpectedIndex = expectedStartIndex + tokenCount - 1;
  const finalEntry = analysisItems.find(
    (item) => Number(item?.expectedIndex) === finalExpectedIndex
  );
  if (!finalEntry) return null;
  const startMs = Number(finalEntry.startMs);
  const endMs = Number(finalEntry.endMs);
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs <= startMs) {
    return null;
  }
  return { startMs, endMs };
}

export function analyzeMandarinTones({
  audioSamples,
  sampleRate = 16000,
  syllables = [],
  analysisItems = [],
} = {}) {
  const safeSyllables = Array.isArray(syllables) ? syllables : [];
  const safeItems = Array.isArray(analysisItems) ? analysisItems : [];
  const results = [];
  let expectedStartIndex = 0;

  for (let index = 0; index < safeSyllables.length; index += 1) {
    const syllable = safeSyllables[index] || {};
    const tokenCount = Math.max(1, Array.isArray(syllable.tokens) ? syllable.tokens.length : 1);
    const acceptedTones = (Array.isArray(syllable.acceptedTones)
      ? syllable.acceptedTones
      : [syllable.surfaceTone ?? syllable.tone])
      .map(Number)
      .filter((tone) => Number.isInteger(tone) && tone >= 0 && tone <= 4);
    const expectedTone = Number(
      syllable.surfaceTone ?? acceptedTones[0] ?? syllable.tone
    );
    const window = syllableWindow(syllable, expectedStartIndex, safeItems);
    expectedStartIndex += tokenCount;

    if (!window || acceptedTones.every((tone) => tone === 0)) {
      results.push({
        index,
        hanzi: syllable.hanzi || '',
        pinyin: syllable.markedPinyin || syllable.numberedPinyin || '',
        expectedTone,
        acceptedTones,
        available: false,
        reason: expectedTone === 0 ? 'neutral-tone-not-pitch-graded' : 'aligned-final-window-missing',
      });
      continue;
    }

    const duration = window.endMs - window.startMs;
    const inset = Math.min(35, duration * 0.08);
    const track = extractPitchTrack({
      audioSamples,
      sampleRate,
      startMs: window.startMs + inset,
      endMs: window.endMs - inset,
    });
    const contour = interpolateContour(track);
    const candidateScores = acceptedTones
      .filter((tone) => tone > 0)
      .map((tone) => ({ tone, score: scoreToneContour(contour, tone) }))
      .filter((candidate) => candidate.score != null)
      .sort((left, right) => right.score - left.score);
    const bestCandidate = candidateScores[0] ?? null;
    const score = bestCandidate?.score ?? null;

    results.push({
      index,
      hanzi: syllable.hanzi || '',
      pinyin: syllable.markedPinyin || syllable.numberedPinyin || '',
      expectedTone,
      acceptedTones,
      scoredAsTone: bestCandidate?.tone ?? null,
      available: score != null && track.length >= MIN_PITCH_POINTS,
      score,
      contour,
      pitchPointCount: track.length,
      meanConfidence: track.length
        ? track.reduce((sum, point) => sum + point.confidence, 0) / track.length
        : null,
      startMs: window.startMs,
      endMs: window.endMs,
    });
  }

  const scored = results.filter((result) => result.available && result.score != null);
  const requiredNonNeutral = safeSyllables.filter((syllable) =>
    (Array.isArray(syllable?.acceptedTones)
      ? syllable.acceptedTones
      : [syllable?.surfaceTone ?? syllable?.tone])
      .some((tone) => Number(tone) > 0)
  ).length;
  const coverage = requiredNonNeutral > 0 ? scored.length / requiredNonNeutral : 0;
  const score = scored.length
    ? scored.reduce((sum, result) => sum + result.score, 0) / scored.length
    : null;
  const available = score != null && coverage >= 0.5;

  return {
    available,
    score: available ? clamp01(score) : null,
    coverage,
    scoredSyllables: scored.length,
    requiredSyllables: requiredNonNeutral,
    syllables: results,
    method: 'yin-f0-chao-contour',
    abstained: !available,
    reason: available ? null : 'insufficient-reliable-pitch-evidence',
  };
}

export function combineMandarinSpeechEvidence({
  segmentalScore,
  prosodyAnalysis,
} = {}) {
  const segmental = clamp01(segmentalScore);
  const tone = prosodyAnalysis?.available
    ? clamp01(prosodyAnalysis.score)
    : null;
  if (segmental == null) return null;
  if (tone == null) return segmental;
  return clamp01(
    segmental * (1 - MANDARIN_TONE_SHARE_OF_SPEECH_EVIDENCE) +
    tone * MANDARIN_TONE_SHARE_OF_SPEECH_EVIDENCE
  );
}

export default analyzeMandarinTones;
