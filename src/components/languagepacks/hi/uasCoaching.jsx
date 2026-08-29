import { normalizeDetectedPhoneme } from './displayHelpers';

const NEAR_GROUPS = [
  ['a', 'aa'], ['i', 'ii'], ['u', 'uu'], ['e', 'ai'], ['o', 'au'],
  ['k', 'kh'], ['g', 'gh'], ['ch', 'chh'], ['j', 'jh'],
  ['tt', 'tth'], ['dd', 'ddh'], ['t', 'th'], ['d', 'dh'],
  ['p', 'ph'], ['b', 'bh'], ['sh', 'ssh'], ['v', 'w'],
  ['n', 'nn'], ['r', 'rr'],
];

function list(value, detected = false) {
  const values = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(/\s+/)
      : [];
  return values
    .map((token) => detected
      ? normalizeDetectedPhoneme(token)
      : String(token || '').trim().toLowerCase())
    .filter(Boolean);
}

function nearMatch(left, right) {
  return NEAR_GROUPS.some((group) => group.includes(left) && group.includes(right));
}

function compare(expected, detected) {
  const rows = expected.length + 1;
  const columns = detected.length + 1;
  const costs = Array.from({ length: rows }, () => Array(columns).fill(0));
  const moves = Array.from({ length: rows }, () => Array(columns).fill(null));
  for (let row = 1; row < rows; row += 1) { costs[row][0] = row; moves[row][0] = 'delete'; }
  for (let column = 1; column < columns; column += 1) { costs[0][column] = column; moves[0][column] = 'insert'; }

  for (let row = 1; row < rows; row += 1) {
    for (let column = 1; column < columns; column += 1) {
      const e = expected[row - 1];
      const d = detected[column - 1];
      const substitution = e === d ? 0 : nearMatch(e, d) ? 0.35 : 1;
      const candidates = [
        [costs[row - 1][column - 1] + substitution, 'align'],
        [costs[row - 1][column] + 1, 'delete'],
        [costs[row][column - 1] + 1, 'insert'],
      ].sort((a, b) => a[0] - b[0]);
      [costs[row][column], moves[row][column]] = candidates[0];
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
      const item = { index: row - 1, expected: expected[row - 1], detected: detected[column - 1] };
      if (item.expected === item.detected) exact.unshift(item);
      else if (nearMatch(item.expected, item.detected)) close.unshift(item);
      else missing.unshift(item);
      row -= 1; column -= 1;
    } else if (move === 'delete' || column === 0) {
      missing.unshift({ index: row - 1, expected: expected[row - 1] });
      row -= 1;
    } else {
      extra.unshift({ index: row, detected: detected[column - 1] });
      column -= 1;
    }
  }
  const score = expected.length
    ? Math.round(((exact.length + close.length * 0.65) / expected.length) * 100)
    : 0;
  return { exact, close, missing, extra, score };
}

export function buildUASCoachingResult(args = {}) {
  const expected = list(args.expectedPhonemes || args.expected);
  const detected = list(
    args.detectedPhonemes || args.detected || args.backendPhonemes,
    true
  );
  const result = compare(expected, detected);
  const hindiUi = String(args.uiLanguage || '').toLowerCase().startsWith('hi');
  const slot = result.score >= 90
    ? 'strong_match'
    : result.score >= 70
      ? 'mostly_clear'
      : result.score >= 35
        ? 'sound_changed'
        : 'hard_to_match';
  const messages = hindiUi
    ? {
        strong_match: 'बहुत अच्छा—आपकी ध्वनियाँ लक्ष्य के बहुत करीब थीं।',
        mostly_clear: 'अच्छा प्रयास। अधिकांश ध्वनियाँ सही थीं; केवल पहली अलग ध्वनि पर ध्यान दें।',
        sound_changed: 'कुछ ध्वनियाँ बदल गईं। धीरे बोलें और पहले अलग सुनाई देने वाली ध्वनि का अभ्यास करें।',
        hard_to_match: 'आइए पहली ध्वनि से शुरू करें और फिर एक-एक करके आगे बढ़ें।',
      }
    : {
        strong_match: 'Great job — your Hindi sounds were very close to the target.',
        mostly_clear: 'Good attempt. Most sounds were close; focus on the first sound that changed.',
        sound_changed: 'Some sounds changed. Slow down and practice the first different Hindi sound.',
        hard_to_match: 'Let’s start with the first Hindi sound, then move forward one sound at a time.',
      };
  const shortMessage = messages[slot];

  return {
    language: 'hi',
    slot,
    subtype: result.missing.length ? 'sound_changed' : null,
    score: result.score,
    shortMessage,
    message: shortMessage,
    summary: shortMessage,
    expectedDisplay: expected.join(' '),
    detectedDisplay: detected.join(' '),
    expectedPhonemes: expected,
    detectedPhonemes: detected,
    exactMatches: result.exact,
    closeMatches: result.close,
    missing: result.missing,
    extra: result.extra,
  };
}

export default buildUASCoachingResult;
