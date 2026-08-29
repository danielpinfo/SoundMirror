/**
 * Arabic pack-owned UAS coaching.
 *
 * AS/UAS rule:
 * This file only interprets user speech-analysis results for Arabic coaching.
 * It does not build animation timing and does not control reference playback.
 *
 * Arabic-specific notes:
 * - Internal token order remains normal.
 * - RTL is handled by the UI/presentation layer.
 * - Guttural, emphatic, nasal, and final consonant tolerance lives here.
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

function stripArabicResolverPrefix(token = '') {
  return String(token || '').replace(/^[CV]:/, '');
}

function isArabicNearMatch(expected, detected) {
  const e = normalizeToken(stripArabicResolverPrefix(expected));
  const d = normalizeToken(stripArabicResolverPrefix(detected));

  if (!e || !d) return false;
  if (e === d) return true;

  const nearPairs = new Set([
    // Short vowel / long vowel tolerance.
    'a:aa',
    'aa:a',
    'i:ii',
    'ii:i',
    'u:uu',
    'uu:u',

    // Common vowel uncertainty from broad backend models.
    'a:e',
    'e:a',
    'a:ɑ',
    'ɑ:a',
    'u:o',
    'o:u',
    'i:e',
    'e:i',

    // Final tanween / audible n tolerance.
    'n:ng',
    'ng:n',
    'ن:n',
    'n:ن',

    // Arabic r/l backend uncertainty.
    'r:l',
    'l:r',
    'ر:r',
    'r:ر',
    'ل:l',
    'l:ل',

    // Arabic guttural/back-throat family.
    'kh:h',
    'h:kh',
    'gh:h',
    'h:gh',
    'gh:kh',
    'kh:gh',
    'ḥ:h',
    'h:ḥ',
    'ح:h',
    'h:ح',
    'خ:kh',
    'kh:خ',
    'غ:gh',
    'gh:غ',
    'ع:aa',
    'aa:ع',
    'ع:a',
    'a:ع',
    'ء:a',
    'a:ء',

    // Dental/interdental uncertainty.
    'th:t',
    't:th',
    'dh:d',
    'd:dh',
    'ث:th',
    'th:ث',
    'ذ:dh',
    'dh:ذ',

    // Emphatic/plain consonant tolerance.
    'ṣ:s',
    's:ṣ',
    'ḍ:d',
    'd:ḍ',
    'ṭ:t',
    't:ṭ',
    'ẓ:z',
    'z:ẓ',
    'ص:s',
    's:ص',
    'ض:d',
    'd:ض',
    'ط:t',
    't:ط',
    'ظ:z',
    'z:ظ',

    // Backend voicing/aspiration uncertainty.
    'b:p',
    'p:b',
    'd:t',
    't:d',
    'g:k',
    'k:g',
    'q:k',
    'k:q',
    'ز:s',
    's:ز',
    'س:z',
    'z:س',

    // Arabic sh / j / ch-style broad backend uncertainty.
    'sh:s',
    's:sh',
    'j:sh',
    'sh:j',
    'ج:j',
    'j:ج',
    'ش:sh',
    'sh:ش',

    // Glides.
    'w:u',
    'u:w',
    'y:i',
    'i:y',
    'و:u',
    'u:و',
    'ي:i',
    'i:ي',
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

    if (e && d && isArabicNearMatch(e, d)) {
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

function buildEnglishMessage(comparison) {
  const { expected, detected, exactCount, closeCount, missing, extra, score } =
    comparison;

  if (!expected.length && !detected.length) {
    return 'I could not hear speech clearly enough to compare it yet.';
  }

  if (expected.length && !detected.length) {
    return 'I did not hear the Arabic sounds clearly enough. Try again slowly and clearly.';
  }

  if (score >= 90) {
    return 'Great job — that sounded very close to the Arabic target.';
  }

  if (score >= 70) {
    return 'Good work — most of the Arabic sounds were close. Try keeping the throat sounds and final consonants clear.';
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

    return 'Good start. Try again a little more slowly and keep each Arabic sound clear.';
  }

  return 'Try again slowly. Focus on matching the first Arabic sound, then continue through the word.';
}

function buildArabicMessage(comparison) {
  const { expected, detected, exactCount, closeCount, missing, extra, score } =
    comparison;

  if (!expected.length && !detected.length) {
    return 'لم ألتقط كلامًا واضحًا بما يكفي للمقارنة بعد.';
  }

  if (expected.length && !detected.length) {
    return 'لم أسمع الأصوات العربية بوضوح كافٍ. حاول مرة أخرى ببطء ووضوح.';
  }

  if (score >= 90) {
    return 'أحسنت — كان نطقك قريبًا جدًا من الهدف العربي.';
  }

  if (score >= 70) {
    return 'عمل جيد — معظم الأصوات العربية كانت قريبة. حافظ على وضوح أصوات الحلق والحروف النهائية.';
  }

  if (exactCount > 0 || closeCount > 0) {
    const firstMissing = missing[0]?.expected;
    const firstExtra = extra[0]?.detected;

    if (firstMissing && firstExtra) {
      return `بداية جيدة. ركّز على صوت ${firstMissing}؛ فقد سمعت ${firstExtra} في موضعه.`;
    }

    if (firstMissing) {
      return `بداية جيدة. حاول نطق صوت ${firstMissing} بوضوح أكبر.`;
    }

    return 'بداية جيدة. حاول مرة أخرى ببطء قليلًا مع توضيح كل صوت عربي.';
  }

  return 'حاول مرة أخرى ببطء. طابق الصوت العربي الأول، ثم أكمل بقية الكلمة.';
}

function buildMessage(comparison, uiLanguage = 'en') {
  return String(uiLanguage || '').toLowerCase().startsWith('ar')
    ? buildArabicMessage(comparison)
    : buildEnglishMessage(comparison);
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
  const message = buildMessage(comparison, args.uiLanguage);

  return {
    language: 'ar',
    rtl: true,
    score: comparison.score,
    message,
    shortMessage: message,
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
