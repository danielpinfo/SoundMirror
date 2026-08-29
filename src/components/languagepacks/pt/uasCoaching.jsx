/**
 * Portuguese pack-owned UAS coaching.
 *
 * AS/UAS rule:
 * This file only interprets user speech-analysis results for Portuguese
 * coaching. It does not build animation timing and does not control
 * reference playback.
 */

import { getDisplayToken } from './displayHelpers';

function toArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') return value.split(/\s+/).filter(Boolean);
  return [];
}

function normalizeToken(token) {
  return getDisplayToken(token);
}

function normalizeList(value) {
  return toArray(value).map(normalizeToken).filter(Boolean);
}

function sameToken(a, b) {
  return normalizeToken(a) === normalizeToken(b);
}

function isPortugueseNearMatch(expected, detected) {
  const e = normalizeToken(expected);
  const d = normalizeToken(detected);

  if (!e || !d) return false;
  if (e === d) return true;

  const nearPairs = new Set([
    // Portuguese r variants are highly variable by region and backend output.
    'r:rr',
    'rr:r',
    'rr:h',
    'h:rr',
    'rr:x',
    'x:rr',
    'r:ɾ',
    'ɾ:r',

    // Portuguese j/ch/sibilant uncertainty.
    'j:ch',
    'ch:j',
    's:z',
    'z:s',

    // Portuguese palatal / affricate uncertainty.
    'j:d',
    'd:j',
    'ch:t',
    't:ch',

    // Nasal vowel approximation.
    'an:a',
    'a:an',
    'en:e',
    'e:en',
    'in:i',
    'i:in',
    'on:o',
    'o:on',
    'un:u',
    'u:un',
    'ão:an',
    'an:ão',
    'ãe:an',
    'an:ãe',
    'õe:on',
    'on:õe',

    // Common Portuguese glide/diphthong approximations.
    'ei:e',
    'e:ei',
    'au:a',
    'a:au',
    'w:u',
    'u:w',

    // Palatal consonants may be heard as simpler sounds.
    'nh:n',
    'n:nh',
    'lh:l',
    'l:lh',
  ]);

  return nearPairs.has(`${e}:${d}`);
}

function compareSequences(expectedPhonemes, detectedPhonemes) {
  const expected = normalizeList(expectedPhonemes);
  const detected = normalizeList(detectedPhonemes);

  const maxLen = Math.max(expected.length, detected.length);
  const exact = [];
  const close = [];
  const missing = [];
  const extra = [];

  for (let i = 0; i < maxLen; i += 1) {
    const e = expected[i] || '';
    const d = detected[i] || '';

    if (e && d && sameToken(e, d)) {
      exact.push({ index: i, expected: e, detected: d });
      continue;
    }

    if (e && d && isPortugueseNearMatch(e, d)) {
      close.push({ index: i, expected: e, detected: d });
      continue;
    }

    if (e && !d) {
      missing.push({ index: i, expected: e });
      continue;
    }

    if (!e && d) {
      extra.push({ index: i, detected: d });
      continue;
    }

    if (e && d) {
      missing.push({ index: i, expected: e, detected: d });
    }
  }

  const exactCount = exact.length;
  const closeCount = close.length;
  const expectedCount = expected.length;
  const detectedCount = detected.length;
  const score =
    expectedCount > 0
      ? Math.round(((exactCount + closeCount * 0.65) / expectedCount) * 100)
      : 0;

  return {
    expected,
    detected,
    exact,
    close,
    missing,
    extra,
    exactCount,
    closeCount,
    expectedCount,
    detectedCount,
    score: Math.max(0, Math.min(100, score)),
  };
}

function buildMessage(comparison) {
  const { expected, detected, exactCount, closeCount, missing, extra, score } =
    comparison;

  if (!expected.length && !detected.length) {
    return 'I could not hear speech clearly enough to compare it yet.';
  }

  if (expected.length && !detected.length) {
    return 'I did not hear the Portuguese sounds clearly enough. Try again slowly and clearly.';
  }

  if (score >= 90) {
    return 'Great job — that sounded very close to the Portuguese target.';
  }

  if (score >= 70) {
    return 'Good work — most of the Portuguese sounds were close. Try smoothing the sounds together one more time.';
  }

  if (exactCount > 0 || closeCount > 0) {
    const firstMissing = missing[0]?.expected;
    const firstExtra = extra[0]?.detected;

    if (firstMissing && firstExtra) {
      return `Good start. Listen for ${firstMissing}; I heard ${firstExtra} in that spot.`;
    }

    if (firstMissing) {
      return `Good start. Try to make the ${firstMissing} sound more clearly.`;
    }

    return 'Good start. Try again a little more slowly and keep each Portuguese sound clear.';
  }

  return 'Try again slowly. Focus on matching the first Portuguese sound, then continue through the word.';
}

export function buildUASCoachingResult(args = {}) {
  const expectedPhonemes = args.expectedPhonemes || args.expected || [];
  const detectedPhonemes =
    args.detectedPhonemes ||
    args.detected ||
    args.backendPhonemes ||
    args.userPhonemes ||
    [];

  const comparison = compareSequences(expectedPhonemes, detectedPhonemes);
  const message = buildMessage(comparison);

  return {
    language: 'pt',
    score: comparison.score,
    message,
    summary: message,

    expectedPhonemes: comparison.expected,
    detectedPhonemes: comparison.detected,

    exactMatches: comparison.exact,
    closeMatches: comparison.close,
    missing: comparison.missing,
    extra: comparison.extra,

    isStrongMatch: comparison.score >= 90,
    isCloseMatch: comparison.score >= 70,
  };
}

export default buildUASCoachingResult;