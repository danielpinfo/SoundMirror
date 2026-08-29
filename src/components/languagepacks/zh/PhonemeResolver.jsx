/**
 * Mandarin Chinese pronunciation resolver.
 *
 * Context is essential in Mandarin: individual Hanzi can be polyphonic and
 * tones change in connected speech. Resolve complete words/phrases with the
 * pack-owned pinyin engine, then expose one canonical initial/final token per
 * audible unit. Tone remains attached as syllable metadata and in the learner
 * helper instead of being silently discarded.
 */

import { pinyin } from 'pinyin-pro';

const LEAD_IN_MS = 40;
const INITIAL_HOLD_MS = 95;
const FINAL_HOLD_MS = 150;
const SYLLABLE_PAUSE_MS = 35;
const WORD_PAUSE_MS = 80;

const CHINESE_PUNCTUATION =
  /[？?！!。，,.；;：:、…“”"'‘’（）()《》〈〉【】[\]{}\-—]/g;

function normalizeChinese(input = '') {
  return String(input || '')
    .normalize('NFC')
    .replace(CHINESE_PUNCTUATION, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function stripToneNumber(value = '') {
  return String(value || '')
    .toLowerCase()
    .replace(/[0-5]$/g, '')
    .replace(/ü/g, 'v')
    .replace(/u:/g, 'v');
}

function toneNumber(value = '') {
  const match = String(value || '').match(/([0-5])$/);
  if (!match) return 0;
  const parsed = Number(match[1]);
  return parsed === 5 ? 0 : parsed;
}

function initialToFrame(initial = '') {
  return (
    {
      b: 8,
      p: 8,
      m: 8,
      f: 14,
      d: 7,
      t: 7,
      n: 9,
      l: 18,
      g: 6,
      k: 6,
      h: 16,
      j: 15,
      q: 15,
      x: 12,
      zh: 15,
      ch: 15,
      sh: 12,
      r: 17,
      z: 11,
      c: 15,
      s: 11,
    }[initial] ?? 0
  );
}

function finalToFrame(final = '') {
  const normalized = stripToneNumber(final);
  if (!normalized) return 0;

  const exact = {
    a: 1,
    o: 5,
    e: 2,
    i: 3,
    u: 5,
    v: 4,
    er: 17,
    ai: 1,
    ei: 2,
    ao: 1,
    ou: 5,
    an: 1,
    en: 2,
    ang: 1,
    eng: 2,
    ong: 5,
    ia: 1,
    ie: 2,
    iao: 1,
    iu: 3,
    iou: 3,
    ian: 1,
    in: 3,
    iang: 1,
    ing: 3,
    iong: 5,
    ua: 1,
    uo: 5,
    uai: 1,
    ui: 5,
    uei: 5,
    uan: 1,
    un: 2,
    uen: 2,
    uang: 1,
    ueng: 5,
    ue: 4,
    ve: 4,
    van: 4,
    vn: 4,
  };

  if (exact[normalized] !== undefined) return exact[normalized];
  if (normalized.endsWith('ng')) return 10;
  if (normalized.endsWith('n')) return 9;
  if (normalized.includes('v')) return 4;
  if (normalized.includes('i')) return 3;
  if (normalized.includes('u') || normalized.includes('o')) return 5;
  if (normalized.includes('e')) return 2;
  return 1;
}

const FINAL_VISUAL_SEGMENTS = Object.freeze({
  ai: ['a', 'i'],
  ei: ['e', 'i'],
  ao: ['a', 'o'],
  ou: ['o', 'u'],
  an: ['a', 'n'],
  en: ['e', 'n'],
  ang: ['a', 'ng'],
  eng: ['e', 'ng'],
  ong: ['o', 'ng'],
  ia: ['i', 'a'],
  ie: ['i', 'e'],
  iao: ['i', 'a', 'o'],
  iu: ['i', 'o', 'u'],
  iou: ['i', 'o', 'u'],
  ian: ['i', 'a', 'n'],
  in: ['i', 'n'],
  iang: ['i', 'a', 'ng'],
  ing: ['i', 'ng'],
  iong: ['i', 'o', 'ng'],
  ua: ['u', 'a'],
  uo: ['u', 'o'],
  uai: ['u', 'a', 'i'],
  ui: ['u', 'e', 'i'],
  uei: ['u', 'e', 'i'],
  uan: ['u', 'a', 'n'],
  un: ['u', 'e', 'n'],
  uen: ['u', 'e', 'n'],
  uang: ['u', 'a', 'ng'],
  ueng: ['u', 'e', 'ng'],
  ue: ['v', 'e'],
  ve: ['v', 'e'],
  van: ['v', 'a', 'n'],
  vn: ['v', 'n'],
});

function visualStepsForToken(token) {
  if (token?.role !== 'final') {
    return [{ phoneme: token.phoneme, frame: token.frame }];
  }

  const segments = FINAL_VISUAL_SEGMENTS[token.phoneme] || [token.phoneme];
  return segments.map((phoneme) => ({
    phoneme,
    frame: finalToFrame(phoneme),
  }));
}

function resolveSegment(segment = '') {
  const numbered = pinyin(segment, {
    type: 'all',
    toneType: 'num',
    toneSandhi: true,
    initialPattern: 'standard',
    nonZh: 'removed',
    v: true,
  });
  const marked = pinyin(segment, {
    type: 'array',
    toneType: 'symbol',
    toneSandhi: true,
    nonZh: 'removed',
  });

  const syllables = numbered.map((item, index) => {
    const numberedPinyin = String(item?.pinyin || item?.result || '').trim();
    const markedPinyin = String(marked[index] || numberedPinyin).trim();
    const initial = stripToneNumber(item?.initial || '');
    const final = stripToneNumber(item?.final || numberedPinyin.slice(initial.length));
    const tone = toneNumber(numberedPinyin);
    const resolved = Boolean(item?.isZh && numberedPinyin && final);

    const tokens = [];
    if (resolved && initial) {
      tokens.push({
        phoneme: initial,
        frame: initialToFrame(initial),
        holdMs: INITIAL_HOLD_MS,
        role: 'initial',
        tone: null,
      });
    }
    if (resolved) {
      tokens.push({
        phoneme: final,
        frame: finalToFrame(final),
        holdMs: FINAL_HOLD_MS,
        role: 'final',
        tone,
      });
    }

    return {
      hanzi: item?.origin || '',
      label: markedPinyin,
      markedPinyin,
      numberedPinyin,
      plainPinyin: stripToneNumber(numberedPinyin),
      initial,
      final,
      tone,
      surfaceTone: tone,
      acceptedTones: resolved ? [tone] : [],
      resolved,
      tokens: tokens.map((token) => ({
        ...token,
        label: markedPinyin,
        hanzi: item?.origin || '',
        numberedPinyin,
        markedPinyin,
      })),
    };
  });

  for (let start = 0; start < syllables.length; start += 1) {
    if (syllables[start]?.tone !== 3) continue;
    let end = start + 1;
    while (end < syllables.length && syllables[end]?.tone === 3) end += 1;
    const runLength = end - start;

    if (runLength === 2) {
      syllables[start].surfaceTone = 2;
      syllables[start].acceptedTones = [2];
    } else if (runLength >= 3) {
      /*
       * Three-or-more T3 sequences depend on prosodic grouping. Accept T2
       * or a reduced T3 on non-final members rather than inventing one
       * syntactic parse from unsegmented learner input. The final T3 remains
       * the anchor.
       */
      for (let index = start; index < end - 1; index += 1) {
        syllables[index].surfaceTone = null;
        syllables[index].acceptedTones = [2, 3];
      }
    }

    start = end - 1;
  }

  syllables.forEach((syllable) => {
    syllable.tokens = syllable.tokens.map((token) => ({
      ...token,
      surfaceTone: token.role === 'final' ? syllable.surfaceTone : null,
      acceptedTones: token.role === 'final' ? syllable.acceptedTones : [],
    }));
  });

  return syllables;
}

export function resolveChineseUnits(text = '') {
  const normalizedText = normalizeChinese(text);
  if (!normalizedText) return { normalizedText: '', resolvedWords: [] };

  const resolvedWords = normalizedText
    .split(/\s+/)
    .filter(Boolean)
    .map((segment) => resolveSegment(segment));

  return { normalizedText, resolvedWords };
}

function emptyResult() {
  return {
    word: '',
    normalizedText: '',
    helperText: '',
    pronunciation: '',
    pinyinNumbered: '',
    phonemes: [],
    expectedPhonemes: [],
    frames: [],
    expectedFrames: [],
    helperChunks: [],
    ipaPhonemes: [],
    tones: [],
    surfaceTones: [],
    acceptedToneSets: [],
    syllables: [],
    tokens: [],
    tokenGroups: [],
    unresolvedUnits: [],
    status: 'unresolved',
    approved: false,
    reviewRequired: true,
    unresolved: true,
    validation: { valid: false, reason: 'empty-text', issues: [] },
  };
}

function buildUntimedChinese(text = '') {
  const sourceText = String(text || '').trim();
  const { normalizedText, resolvedWords } = resolveChineseUnits(sourceText);
  if (!normalizedText) return emptyResult();

  const syllables = resolvedWords.flat();
  const unresolvedUnits = syllables
    .filter((syllable) => !syllable.resolved)
    .map((syllable) => syllable.hanzi || '?');
  const tokenGroups = syllables.map((syllable) => ({
    units: [syllable],
    tokens: syllable.tokens,
    helperText: syllable.markedPinyin,
    pronunciation: syllable.markedPinyin,
    numberedPinyin: syllable.numberedPinyin,
    phonemes: syllable.tokens.map((token) => token.phoneme),
    expectedPhonemes: syllable.tokens.map((token) => token.phoneme),
    frames: syllable.tokens.map((token) => token.frame),
    expectedFrames: syllable.tokens.map((token) => token.frame),
    tone: syllable.tone,
  }));
  const tokens = tokenGroups.flatMap((group) => group.tokens);
  const phonemes = tokens.map((token) => token.phoneme);
  const frames = tokens.map((token) => token.frame);
  const helperText = resolvedWords
    .map((word) => word.map((syllable) => syllable.markedPinyin).join(' '))
    .join(' · ');
  const pinyinNumbered = resolvedWords
    .map((word) => word.map((syllable) => syllable.numberedPinyin).join(' '))
    .join(' · ');
  const approved = unresolvedUnits.length === 0 && phonemes.length > 0;

  return {
    word: normalizedText,
    normalizedText,
    helperText,
    pronunciation: helperText,
    pinyinNumbered,
    phonemes,
    expectedPhonemes: phonemes,
    frames,
    expectedFrames: frames,
    helperChunks: [],
    ipaPhonemes: [],
    tones: syllables.map((syllable) => syllable.tone),
    surfaceTones: syllables.map((syllable) => syllable.surfaceTone),
    acceptedToneSets: syllables.map((syllable) => syllable.acceptedTones),
    syllables,
    tokens,
    tokenGroups,
    unresolvedUnits,
    status: approved ? 'approved' : 'unresolved',
    approved,
    reviewRequired: !approved,
    unresolved: !approved,
    mechanicallyValidated: approved,
    validation: {
      valid: approved,
      reason: approved ? null : 'one-or-more-hanzi-unresolved',
      issues: unresolvedUnits.map((unit) => `${unit}:pinyin-not-resolved`),
    },
  };
}

export class PhonemeResolver {
  resolveUntimed(text, _lang = 'zh') {
    return buildUntimedChinese(text);
  }

  resolve(text, _lang = 'zh') {
    const untimed = buildUntimedChinese(text);
    if (!untimed.normalizedText) {
      return { ...untimed, phonemeTimeline: [] };
    }

    const phonemeTimeline = [];
    const helperChunks = [];
    let cursor = 0;

    phonemeTimeline.push({
      phoneme: 'neutral',
      frame: 0,
      startMs: cursor,
      endMs: cursor + LEAD_IN_MS,
    });
    cursor += LEAD_IN_MS;

    untimed.tokenGroups.forEach((group, groupIndex) => {
      const chunkStart = cursor;
      group.tokens.forEach((token) => {
        const visualSteps = visualStepsForToken(token);
        const stepHoldMs = token.holdMs / visualSteps.length;

        visualSteps.forEach((step, stepIndex) => {
          phonemeTimeline.push({
            phoneme: step.phoneme,
            canonicalPhoneme: token.phoneme,
            label: token.markedPinyin,
            hanzi: token.hanzi,
            frame: step.frame,
            tone:
              token.role === 'final' && stepIndex === visualSteps.length - 1
                ? token.tone
                : null,
            surfaceTone:
              token.role === 'final' && stepIndex === visualSteps.length - 1
                ? token.surfaceTone
                : null,
            acceptedTones:
              token.role === 'final' && stepIndex === visualSteps.length - 1
                ? token.acceptedTones
                : [],
            role: token.role,
            startMs: cursor,
            endMs: cursor + stepHoldMs,
          });
          cursor += stepHoldMs;
        });
      });

      helperChunks.push({
        text: group.helperText,
        startMs: chunkStart,
        endMs: cursor,
      });

      if (groupIndex < untimed.tokenGroups.length - 1) {
        const pauseMs = SYLLABLE_PAUSE_MS;
        phonemeTimeline.push({
          phoneme: 'pause',
          frame: 0,
          startMs: cursor,
          endMs: cursor + pauseMs,
        });
        cursor += pauseMs;
      }
    });

    if (untimed.normalizedText.includes(' ')) {
      cursor += WORD_PAUSE_MS - SYLLABLE_PAUSE_MS;
    }

    phonemeTimeline.push({
      phoneme: 'neutral',
      frame: 0,
      startMs: cursor,
      endMs: cursor + LEAD_IN_MS,
    });

    return {
      ...untimed,
      helperChunks,
      phonemeTimeline,
    };
  }
}

export default PhonemeResolver;
