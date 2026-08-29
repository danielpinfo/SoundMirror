/**
 * src/components/languagepacks/zh/articulationMap.jsx
 *
 * Mandarin Chinese articulation map — pack-owned phoneme/final → frame index (0-19)
 *
 * This map is intentionally broader than a minimal viseme map because the zh pack's
 * resolver emits a richer Mandarin-aware inventory:
 * - initials (b, p, m, f, d, t, n, l, g, k, h, j, q, x, zh, ch, sh, r, z, c, s, y, w)
 * - simple finals (a, e, i, o, u, v, er)
 * - nasal finals (an, ang, en, eng, in, ing, ong, etc.)
 * - compound finals / medials (ia, iao, ie, iu, ua, uo, uai, ui, ve, ue, iong, uang, etc.)
 *
 * The goal is completeness and deterministic pack-owned articulation coverage.
 */

const articulationMap = {
  locale: 'zh-CN',
  neutral_frame: 0,
  frames: [
    { index: 0,  label: 'neutral',             phonemes: [] },

    // Open / low jaw
    { index: 1,  label: 'open_vowel',          phonemes: [
      'a', 'ia', 'ua',
      'an', 'ian', 'uan', 'van',
      'ang', 'iang', 'uang',
      'ai', 'uai',
      'ao', 'iao',
    ] },

    // Mid / spread-mid
    { index: 2,  label: 'mid_vowel',           phonemes: [
      'e', 'ie', 've', 'ue',
      'ei', 'ui',
      'en', 'eng',
      'un', 'uen',
      'ye', 'yue',
    ] },

    // High front spread
    { index: 3,  label: 'front_vowel',         phonemes: [
      'i', 'yi',
      'in', 'yin',
      'ing', 'ying',
      'iang_like_i',
      'iu', 'iou',
      'ian_like_i',
      'iong_like_i',
    ] },

    // Rounded front / ü
    { index: 4,  label: 'rounded_vowel_ue',    phonemes: [
      'v', 'ü', 'u:', 'yu',
      've', 'üe',
      'van', 'üan',
      'vn', 'ün',
      'ue', 'yue',
      'uan:front',
    ] },

    // Rounded back / oo-oh
    { index: 5,  label: 'rounded_vowel_oo',    phonemes: [
      'u', 'wu',
      'o', 'ou', 'you',
      'uo', 'wo',
      'ong', 'iong',
      'ou_like_o',
      'w',
      'ua_like_u',
      'uo_like_u',
      'ui_like_u',
      'iu_like_u',
    ] },

    { index: 6,  label: 'velar_stop',          phonemes: ['g', 'k'] },
    { index: 7,  label: 'alveolar_stop',       phonemes: ['d', 't'] },
    { index: 8,  label: 'bilabial',            phonemes: ['b', 'p', 'm'] },
    { index: 9,  label: 'alveolar_nasal',      phonemes: ['n'] },
    { index: 10, label: 'velar_nasal',         phonemes: ['ng'] },
    { index: 11, label: 'alveolar_fricative',  phonemes: ['s', 'z'] },
    { index: 12, label: 'postalveolar_fricative', phonemes: ['sh', 'x'] },
    { index: 13, label: 'dental_fricative',    phonemes: [] },
    { index: 14, label: 'labiodental_fricative', phonemes: ['f'] },
    { index: 15, label: 'affricate',           phonemes: ['zh', 'ch', 'q', 'c', 'j'] },
    { index: 16, label: 'glottal',             phonemes: ['h'] },
    { index: 17, label: 'rhotic',              phonemes: ['r', 'er'] },
    { index: 18, label: 'lateral',             phonemes: ['l'] },
    { index: 19, label: 'glide',               phonemes: ['y'] },
  ],
};

const FRAME_BY_INDEX = Object.fromEntries(
  articulationMap.frames.map((frame) => [frame.index, frame])
);

function buildDirectMap() {
  const direct = {};

  for (const frame of articulationMap.frames) {
    for (const phoneme of frame.phonemes) {
      direct[phoneme] = frame.index;
    }
  }

  return direct;
}

const DIRECT_MAP = buildDirectMap();

function normalizePhoneme(phoneme = '') {
  return String(phoneme || '')
    .trim()
    .toLowerCase()
    .replace(/[1-5]/g, '')
    .replace(/ü/g, 'v')
    .replace(/u:/g, 'v');
}

function mapInitial(normalized = '') {
  const initialMap = {
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

    y: 19,
    w: 5,
  };

  return initialMap[normalized];
}

function mapFinal(normalized = '') {
  if (!normalized) return 0;

  // Exact complete Mandarin final coverage first.
  const exactFinalMap = {
    // simple
    a: 1,
    o: 5,
    e: 2,
    i: 3,
    u: 5,
    v: 4,
    er: 17,

    // ai/ei/ao/ou
    ai: 1,
    ei: 2,
    ao: 1,
    ou: 5,

    // nasal finals
    an: 1,
    en: 2,
    ang: 1,
    eng: 2,
    ong: 5,

    // i-series
    ia: 1,
    ie: 2,
    iao: 1,
    iou: 3,
    iu: 3,
    ian: 1,
    in: 3,
    iang: 1,
    ing: 3,
    iong: 5,

    // u-series
    ua: 1,
    uo: 5,
    uai: 1,
    uei: 5,
    ui: 5,
    uan: 1,
    uen: 2,
    un: 2,
    uang: 1,
    ueng: 5,

    // ü-series
    ve: 4,
    ue: 4,
    van: 4,
    vn: 4,

    // y / w orthographic pinyin aliases
    yi: 3,
    ya: 1,
    yao: 1,
    ye: 2,
    you: 5,
    yan: 1,
    yin: 3,
    yang: 1,
    ying: 3,
    yong: 5,

    wu: 5,
    wa: 1,
    wo: 5,
    wai: 1,
    wei: 5,
    wan: 1,
    wen: 2,
    wang: 1,
    weng: 5,

    yu: 4,
    yue: 4,
    yuan: 4,
    yun: 4,
  };

  if (exactFinalMap[normalized] !== undefined) {
    return exactFinalMap[normalized];
  }

  // Heuristic fallback for richer/edge finals that may appear later.
  if (normalized === 'ng') return 10;
  if (normalized === 'n') return 9;

  if (normalized.endsWith('ng')) {
    if (normalized.includes('o') || normalized.includes('u')) return 5;
    if (normalized.includes('i')) return 3;
    if (normalized.includes('v')) return 4;
    if (normalized.includes('e')) return 2;
    return 1;
  }

  if (normalized.endsWith('n')) {
    if (normalized.includes('i')) return 3;
    if (normalized.includes('v')) return 4;
    if (normalized.includes('u') && !normalized.includes('a')) return 2;
    if (normalized.includes('e')) return 2;
    return 1;
  }

  if (normalized.includes('v')) return 4;
  if (normalized.includes('i')) return 3;
  if (normalized.includes('u') || normalized.includes('o')) return 5;
  if (normalized.includes('e')) return 2;
  if (normalized.includes('a')) return 1;

  return 0;
}

export const phonemeToFrameIndex = (phoneme) => {
  const normalized = normalizePhoneme(phoneme);
  if (!normalized) return 0;

  if (DIRECT_MAP[normalized] !== undefined) {
    return DIRECT_MAP[normalized];
  }

  const colonBase = normalized.includes(':')
    ? normalized.split(':').pop()
    : normalized;

  if (DIRECT_MAP[colonBase] !== undefined) {
    return DIRECT_MAP[colonBase];
  }

  const initialFrame = mapInitial(colonBase);
  if (initialFrame !== undefined) {
    return initialFrame;
  }

  const finalFrame = mapFinal(colonBase);
  if (finalFrame !== undefined) {
    return finalFrame;
  }

  return 0;
};

export const frameIndexToPhonemes = (frameIndex) => {
  return FRAME_BY_INDEX[frameIndex]?.phonemes ?? [];
};

export default articulationMap;
