/**
 * Japanese pack-owned UAS coaching.
 *
 * AS/UAS rule:
 * This file only interprets user speech-analysis results for Japanese
 * coaching. It does not build animation timing and does not control
 * reference playback.
 */

import { normalizeDetectedPhoneme } from './displayHelpers';

function toArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') return value.split(/\s+/).filter(Boolean);
  return [];
}

function normalizeToken(token) {
  return normalizeDetectedPhoneme(token);
}

function normalizeList(value) {
  return toArray(value).map(normalizeToken).filter(Boolean);
}

function normalizeExpectedList(value) {
  return toArray(value)
    .map((token) => String(token || '').trim().toLowerCase())
    .filter(Boolean);
}

function sameToken(a, b) {
  return String(a || '') === String(b || '');
}

function isJapaneseNearMatch(expected, detected) {
  const e = String(expected || '').trim().toLowerCase();
  const d = String(detected || '').trim().toLowerCase();

  if (!e || !d) return false;
  if (e === d) return true;

  const nearPairs = new Set([
    // Japanese r is often detected near English r/l/flap-like sounds.
    'r:l',
    'l:r',

    // ん can surface as n, m, or ng depending on neighboring sounds.
    'n:m',
    'm:n',
    'n:ng',
    'ng:n',

    // Japanese /ɯ/ often normalizes to u, but backend may vary.
    'u:ɯ',
    'ɯ:u',

    // ふ may be heard as fu, hu, or f depending on backend behavior.
    'fu:hu',
    'hu:fu',
    'f:h',
    'h:f',

    // し / しゃ family uncertainty.
    'shi:sh',
    'sh:shi',
    'sha:sh',
    'sh:sha',
    'shu:sh',
    'sh:shu',
    'sho:sh',
    'sh:sho',

    // ち / ちゃ family uncertainty.
    'chi:ch',
    'ch:chi',
    'cha:ch',
    'ch:cha',
    'chu:ch',
    'ch:chu',
    'cho:ch',
    'ch:cho',

    // つ often gets detected as ts or su by broad phoneme models.
    'tsu:ts',
    'ts:tsu',
    'tsu:su',
    'su:tsu',

    // じ / じゃ family uncertainty.
    'ji:j',
    'j:ji',
    'ja:j',
    'j:ja',
    'ju:j',
    'j:ju',
    'jo:j',
    'j:jo',

    // Voicing uncertainty.
    'k:g',
    'g:k',
    's:z',
    'z:s',
    't:d',
    'd:t',
    'p:b',
    'b:p',

    // Common vowel closeness in backend output.
    'e:i',
    'i:e',
    'o:u',
    'u:o',

    // Long vowel / small pause markers should be gentle.
    'q:k',
    'k:q',
    'q:t',
    't:q',
  ]);

  return nearPairs.has(`${e}:${d}`);
}

function compareSequences(expectedPhonemes, detectedPhonemes) {
  const expected = normalizeExpectedList(expectedPhonemes);
  const detected = normalizeList(detectedPhonemes);
  const rows = expected.length + 1;
  const columns = detected.length + 1;
  const costs = Array.from({ length: rows }, () => Array(columns).fill(0));
  const moves = Array.from({ length: rows }, () => Array(columns).fill(null));

  for (let row = 1; row < rows; row += 1) {
    costs[row][0] = row;
    moves[row][0] = 'delete';
  }
  for (let column = 1; column < columns; column += 1) {
    costs[0][column] = column;
    moves[0][column] = 'insert';
  }

  for (let row = 1; row < rows; row += 1) {
    for (let column = 1; column < columns; column += 1) {
      const expectedToken = expected[row - 1];
      const detectedToken = detected[column - 1];
      const matchCost = sameToken(expectedToken, detectedToken)
        ? 0
        : isJapaneseNearMatch(expectedToken, detectedToken)
          ? 0.35
          : 1;
      const candidates = [
        { cost: costs[row - 1][column - 1] + matchCost, move: 'align' },
        { cost: costs[row - 1][column] + 1, move: 'delete' },
        { cost: costs[row][column - 1] + 1, move: 'insert' },
      ].sort((left, right) => left.cost - right.cost);
      costs[row][column] = candidates[0].cost;
      moves[row][column] = candidates[0].move;
    }
  }

  const exact = [];
  const close = [];
  const missing = [];
  const extra = [];

  let row = expected.length;
  let column = detected.length;
  while (row > 0 || column > 0) {
    const move = moves[row]?.[column];
    if (move === 'align') {
      const e = expected[row - 1];
      const d = detected[column - 1];
      const item = { index: row - 1, expected: e, detected: d };
      if (sameToken(e, d)) exact.unshift(item);
      else if (isJapaneseNearMatch(e, d)) close.unshift(item);
      else missing.unshift(item);
      row -= 1;
      column -= 1;
    } else if (move === 'delete' || column === 0) {
      missing.unshift({ index: row - 1, expected: expected[row - 1] });
      row -= 1;
    } else {
      extra.unshift({ index: row, detected: detected[column - 1] });
      column -= 1;
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

function buildMessage(comparison, uiLanguage = 'en') {
  const { expected, detected, exactCount, closeCount, missing, extra, score } =
    comparison;

  const japaneseUi = String(uiLanguage || '').toLowerCase().startsWith('ja');

  if (!expected.length && !detected.length) {
    if (japaneseUi) return '比較できる音声が十分に聞き取れませんでした。';
    return 'I could not hear speech clearly enough to compare it yet.';
  }

  if (expected.length && !detected.length) {
    if (japaneseUi) return '日本語の音を十分に聞き取れませんでした。ゆっくり、はっきりもう一度発音してください。';
    return 'I did not hear the Japanese sounds clearly enough. Try again slowly and clearly.';
  }

  if (score >= 90) {
    if (japaneseUi) return 'とても良い発音です。日本語の目標音にほぼ一致しました。';
    return 'Great job — that sounded very close to the Japanese target.';
  }

  if (score >= 70) {
    if (japaneseUi) return 'よくできました。ほとんどの音が近いです。一つずつ均等にはっきり発音しましょう。';
    return 'Good work — most of the Japanese sounds were close. Try keeping each syllable even and clear.';
  }

  if (exactCount > 0 || closeCount > 0) {
    const firstMissing = missing[0]?.expected;
    const firstExtra = extra[0]?.detected;

    if (firstMissing && firstExtra) {
      if (japaneseUi) return `良い出だしです。「${firstMissing}」を意識してください。この位置では「${firstExtra}」と聞こえました。`;
      return `Good start. Listen for ${firstMissing}; I heard ${firstExtra} in that spot.`;
    }

    if (firstMissing) {
      if (japaneseUi) return `良い出だしです。「${firstMissing}」の音をもう少しはっきり発音してください。`;
      return `Good start. Try to make the ${firstMissing} sound more clearly.`;
    }

    if (japaneseUi) return '良い出だしです。少しゆっくり、各音をはっきり発音してもう一度試してください。';
    return 'Good start. Try again a little more slowly and keep each Japanese sound clear.';
  }

  if (japaneseUi) return 'ゆっくりもう一度試しましょう。最初の日本語の音を合わせてから、残りの音へ進んでください。';
  return 'Try again slowly. Focus on matching the first Japanese sound, then continue through the word.';
}

function buildRhythmMessage(prosodyAnalysis, uiLanguage = 'en') {
  if (!prosodyAnalysis?.available || Number(prosodyAnalysis.score) >= 0.72) {
    return '';
  }

  const weakest = prosodyAnalysis.weakestUnit || null;
  const japaneseUi = String(uiLanguage || '').toLowerCase().startsWith('ja');
  const mora = weakest?.mora || weakest?.display || '';

  if (weakest?.kind === 'long-vowel') {
    return japaneseUi
      ? `「${mora}」の母音を、もう一拍分長く保ってください。短い母音二つ分の長さを目安にしましょう。`
      : `Hold the vowel in “${mora}” for one extra mora—about the length of two short vowels.`;
  }

  if (weakest?.kind === 'sokuon') {
    return japaneseUi
      ? `「${mora}」の前で小さい「っ」の一拍を保ち、次の子音を少し長く止めてください。`
      : `Give the small っ one full beat before “${mora}” by holding the next consonant briefly.`;
  }

  return japaneseUi
    ? '音を急がず、各モーラを一拍ずつ均等に並べて発音してください。'
    : 'Keep each Japanese mora on an even beat instead of rushing one part of the word.';
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
  const rhythmMessage = comparison.score >= 70
    ? buildRhythmMessage(args.prosodyAnalysis, args.uiLanguage)
    : '';
  const message = rhythmMessage || segmentalMessage;

  return {
    language: 'ja',
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
    rhythmCoachingActive: Boolean(rhythmMessage),
    prosodyAnalysis: args.prosodyAnalysis ?? null,
  };
}

export default buildUASCoachingResult;
