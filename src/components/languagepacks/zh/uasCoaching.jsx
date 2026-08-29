/**
 * Chinese pack-owned UAS coaching.
 *
 * AS/UAS rule:
 * This file only interprets user speech-analysis results for Mandarin Chinese
 * coaching. It does not build animation timing and does not control
 * reference playback.
 */

import {
  getDisplayToken,
  normalizeDetectedPhoneme,
} from './displayHelpers';

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

function normalizeDetectedList(value) {
  return toArray(value)
    .map(normalizeDetectedPhoneme)
    .map(normalizeToken)
    .filter(Boolean);
}

function sameToken(a, b) {
  return normalizeToken(a) === normalizeToken(b);
}

function isChineseNearMatch(expected, detected) {
  const e = normalizeToken(expected);
  const d = normalizeToken(detected);

  if (!e || !d) return false;
  if (e === d) return true;

  const nearPairs = new Set([
    // Mandarin retroflex / alveolar uncertainty.
    'zh:z',
    'z:zh',
    'ch:c',
    'c:ch',
    'sh:s',
    's:sh',

    // Mandarin j/q/x may be heard close to broader palatal/affricate sounds.
    'j:zh',
    'zh:j',
    'q:ch',
    'ch:q',
    'x:sh',
    'sh:x',
    'j:z',
    'z:j',
    'q:c',
    'c:q',
    'x:s',
    's:x',

    // Mandarin r often varies in backend output.
    'r:sh',
    'sh:r',
    'r:zh',
    'zh:r',
    'r:z',
    'z:r',
    'r:l',
    'l:r',

    // Aspiration/voicing uncertainty.
    'b:p',
    'p:b',
    'd:t',
    't:d',
    'g:k',
    'k:g',
    'z:c',
    'c:z',
    'j:q',
    'q:j',
    'zh:ch',
    'ch:zh',

    // Nasal endings may simplify.
    'n:ng',
    'ng:n',
    'an:ang',
    'ang:an',
    'en:eng',
    'eng:en',
    'in:ing',
    'ing:in',

    // Final/vowel approximations.
    'ü:u',
    'u:ü',
    'v:u',
    'u:v',
    'üe:ue',
    'ue:üe',
    'er:e',
    'e:er',

    // Common Mandarin final closeness.
    'i:y',
    'y:i',
    'u:w',
    'w:u',
    'o:u',
    'u:o',
    'e:a',
    'a:e',

    // Diphthong / segmented final approximations.
    'ai:a',
    'a:ai',
    'ei:e',
    'e:ei',
    'ao:a',
    'a:ao',
    'ou:o',
    'o:ou',
    'ia:i',
    'i:ia',
    'ie:i',
    'i:ie',
    'iao:i',
    'i:iao',
    'iu:i',
    'i:iu',
    'ua:u',
    'u:ua',
    'uo:u',
    'u:uo',
  ]);

  return nearPairs.has(`${e}:${d}`);
}

function compareSequences(expectedPhonemes, detectedPhonemes) {
  const expected = normalizeList(expectedPhonemes);
  const detected = normalizeDetectedList(detectedPhonemes);

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

    if (e && d && isChineseNearMatch(e, d)) {
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
    return 'I did not hear the Mandarin sounds clearly enough. Try again slowly and clearly.';
  }

  if (score >= 90) {
    return 'Great job — that sounded very close to the Mandarin target.';
  }

  if (score >= 70) {
    return 'Good work — most of the Mandarin sounds were close. Try keeping the initials and finals clear.';
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

    return 'Good start. Try again a little more slowly and keep each Mandarin sound clear.';
  }

  return 'Try again slowly. Focus on matching the first Mandarin sound, then continue through the word.';
}

function buildChineseMessage(comparison) {
  const { expected, detected, exactCount, closeCount, missing, extra, score } =
    comparison;

  if (!expected.length && !detected.length) {
    return '我还没有听到足够清楚的语音，暂时无法比较。';
  }

  if (expected.length && !detected.length) {
    return '我没有听清普通话语音。请放慢速度，再清楚地试一次。';
  }

  if (score >= 90) {
    return '太棒了——你的发音非常接近普通话目标。';
  }

  if (score >= 70) {
    return '做得很好——大多数声母和韵母都很接近。请保持每个音节清楚。';
  }

  if (exactCount > 0 || closeCount > 0) {
    const firstMissing = missing[0]?.expected;
    const firstExtra = extra[0]?.detected;

    if (firstMissing && firstExtra) {
      return `开头很好。请注意 ${firstMissing}；这里听起来更像 ${firstExtra}。`;
    }

    if (firstMissing) {
      return `开头很好。请把 ${firstMissing} 音说得更清楚。`;
    }

    return '开头很好。请稍微放慢速度，让每个普通话音节更清楚。';
  }

  return '请慢慢再试一次。先对准第一个普通话音，再继续整词。';
}

function buildMessage(comparison, uiLanguage = 'en') {
  return String(uiLanguage || '').toLowerCase().startsWith('zh')
    ? buildChineseMessage(comparison)
    : buildEnglishMessage(comparison);
}

function buildToneMessage(prosodyAnalysis, uiLanguage = 'en') {
  if (!prosodyAnalysis?.available || Number(prosodyAnalysis.score) >= 0.72) {
    return '';
  }

  const weakest = (prosodyAnalysis.syllables || [])
    .filter((syllable) => syllable?.available && Number.isFinite(Number(syllable?.score)))
    .sort((left, right) => Number(left.score) - Number(right.score))[0];
  if (!weakest) return '';

  const syllable = weakest.pinyin || weakest.hanzi || '';
  const tone = Number(weakest.scoredAsTone ?? weakest.expectedTone);
  const chinese = String(uiLanguage || '').toLowerCase().startsWith('zh');

  const instructions = chinese
    ? {
        1: `请把“${syllable}”保持在较高而平稳的音高。`,
        2: `请让“${syllable}”的音高从中间向上升。`,
        3: `请让“${syllable}”先降到低处，再稍微回升。`,
        4: `请让“${syllable}”从较高音快速而明确地下降。`,
      }
    : {
        1: `Keep “${syllable}” high and level instead of letting the pitch move.`,
        2: `Let “${syllable}” rise clearly from the middle of your pitch range.`,
        3: `Let “${syllable}” dip low, then recover slightly at the end.`,
        4: `Start “${syllable}” high and let it fall clearly and decisively.`,
      };

  return instructions[tone] || '';
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
  const segmentalMessage = buildMessage(comparison, args.uiLanguage);
  const toneMessage = comparison.score >= 70
    ? buildToneMessage(args.prosodyAnalysis, args.uiLanguage)
    : '';
  const message = toneMessage || segmentalMessage;

  return {
    language: 'zh',
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
    toneCoachingActive: Boolean(toneMessage),
    prosodyAnalysis: args.prosodyAnalysis ?? null,
  };
}

export default buildUASCoachingResult;
