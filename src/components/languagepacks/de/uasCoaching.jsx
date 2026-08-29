/**
 * German pack-owned UAS coaching.
 *
 * AS/UAS rule:
 * This file only interprets user speech-analysis results for German coaching.
 * It does not build animation timing and does not control reference playback.
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

function isGermanNearMatch(expected, detected) {
  const e = normalizeToken(expected);
  const d = normalizeToken(detected);

  if (!e || !d) return false;
  if (e === d) return true;

  const nearPairs = new Set([
    // German r varies strongly by speaker, region, and backend output.
    'r:a',
    'a:r',
    'r:e',
    'e:r',

    // German final devoicing and backend uncertainty.
    'b:p',
    'p:b',
    'd:t',
    't:d',
    'g:k',
    'k:g',

    // German ch has two major variants, plus rough backend approximations.
    'ch:kh',
    'kh:ch',
    'ch:k',
    'k:ch',
    'kh:k',
    'k:kh',
    'ch:h',
    'h:ch',
    'kh:h',
    'h:kh',

    // German sch / s / z uncertainty.
    'sch:sh',
    'sh:sch',
    'sch:s',
    's:sch',
    's:z',
    'z:s',

    // German z is often ts, and pf may be simplified by learners/backends.
    'z:ts',
    'ts:z',
    'pf:p',
    'p:pf',
    'pf:f',
    'f:pf',

    // German j / y display and backend variants.
    'j:y',
    'y:j',

    // German w is learner-facing v in this pack.
    'w:v',
    'v:w',
    'v:f',
    'f:v',

    // Rounded vowel approximations.
    'ü:u',
    'u:ü',
    'ü:i',
    'i:ü',
    'ö:o',
    'o:ö',
    'ö:e',
    'e:ö',

    // Common diphthong approximations.
    'ai:a',
    'a:ai',
    'au:a',
    'a:au',
    'eu:oy',
    'oy:eu',
    'eu:o',
    'o:eu',
    'oy:o',
    'o:oy',

    // Long/short display simplifications.
    'ie:i',
    'i:ie',
    'ee:i',
    'i:ee',
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

    if (e && d && isGermanNearMatch(e, d)) {
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
    return 'I did not hear the German sounds clearly enough. Try again slowly and clearly.';
  }

  if (score >= 90) {
    return 'Great job — that sounded very close to the German target.';
  }

  if (score >= 70) {
    return 'Good work — most of the German sounds were close. Try keeping the consonants crisp.';
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

    return 'Good start. Try again a little more slowly and keep each German sound clear.';
  }

  return 'Try again slowly. Focus on matching the first German sound, then continue through the word.';
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
    language: 'de',
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