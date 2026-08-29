/**
 * Mandarin guided-sound cues.
 *
 * Pinyin initials cannot be synthesized honestly as alphabet names. Each cue
 * therefore uses a short native Mandarin syllable whose resolved initial or
 * final contains the requested target. The resolver supplies matching helper,
 * animation, and grading truth for the same spoken cue.
 */

import PhonemeResolver from './PhonemeResolver';

const resolver = new PhonemeResolver();

const INITIAL_CUES = Object.freeze({
  b: '八',
  p: '趴',
  m: '妈',
  f: '发',
  d: '搭',
  t: '他',
  n: '拿',
  l: '拉',
  g: '嘎',
  k: '咖',
  h: '哈',
  j: '鸡',
  q: '七',
  x: '西',
  zh: '知',
  ch: '吃',
  sh: '师',
  r: '日',
  z: '资',
  c: '词',
  s: '思',
});

const FINAL_CUES = Object.freeze({
  a: '啊',
  o: '哦',
  e: '鹅',
  i: '一',
  u: '屋',
  v: '鱼',
  ai: '爱',
  ei: '黑',
  ao: '熬',
  ou: '欧',
  an: '安',
  en: '恩',
  ang: '昂',
  eng: '冷',
  ong: '东',
  ia: '家',
  ie: '别',
  iao: '小',
  iu: '九',
  ian: '天',
  in: '林',
  iang: '想',
  ing: '听',
  iong: '熊',
  ua: '花',
  uo: '多',
  uai: '快',
  ui: '水',
  uan: '关',
  un: '伦',
  uang: '光',
  ueng: '翁',
  ue: '学',
  ve: '月',
  van: '元',
  vn: '云',
  er: '儿',
});

function normalizeTarget(rawPhoneme) {
  return String(rawPhoneme || '')
    .trim()
    .toLowerCase()
    .replace(/[0-5]$/g, '')
    .replace(/ü/g, 'v')
    .replace(/u:/g, 'v');
}

function buildCue(targetPhoneme, ttsText) {
  const resolved = resolver.resolveUntimed(ttsText, 'zh');
  const expectedPhonemes = Array.isArray(resolved?.expectedPhonemes)
    ? resolved.expectedPhonemes
    : [];
  const targetExpectedIndex = expectedPhonemes.indexOf(targetPhoneme);

  if (targetExpectedIndex < 0) return null;

  return {
    ttsText,
    displayText: ttsText,
    helperText: resolved.helperText,
    pronunciation: resolved.pronunciation,
    pinyinNumbered: resolved.pinyinNumbered,
    expectedPhonemes,
    targetPhoneme,
    targetExpectedIndex,
    tone: resolved.tones?.[0] ?? null,
  };
}

export function getGuidedSoundCue(rawPhoneme) {
  const targetPhoneme = normalizeTarget(rawPhoneme);
  if (!targetPhoneme) return null;

  const ttsText =
    INITIAL_CUES[targetPhoneme] ||
    FINAL_CUES[targetPhoneme] ||
    null;

  return ttsText ? buildCue(targetPhoneme, ttsText) : null;
}

const guidedSoundLibrary = Object.freeze(
  Object.fromEntries(
    [...Object.keys(INITIAL_CUES), ...Object.keys(FINAL_CUES)]
      .map((phoneme) => [phoneme, getGuidedSoundCue(phoneme)])
      .filter(([, cue]) => cue)
  )
);

export default guidedSoundLibrary;
