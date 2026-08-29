const LEAD_IN_MS = 40;
const PAUSE_MS = 80;
const DEFAULT_HOLD = 130;
const VOWEL_HOLD = 160;
const VOWEL_FRAMES = new Set([1, 2, 3, 4, 5]);

function frameHold(frame) {
  return VOWEL_FRAMES.has(frame) ? VOWEL_HOLD : DEFAULT_HOLD;
}

function normalizeGerman(input = '') {
  return String(input || '').toLowerCase().normalize('NFC');
}

function isVowel(ch = '') {
  return ['a', 'e', 'i', 'o', 'u', 'ä', 'ö', 'ü'].includes(ch);
}

function isFrontVowel(ch = '') {
  return ['e', 'i', 'ä', 'ö', 'ü'].includes(ch);
}

function isConsonant(ch = '') {
  return !!ch && !isVowel(ch) && /[a-zäöüß]/i.test(ch);
}

export function resolveGermanUnits(word) {
  const s = normalizeGerman(word);
  const units = [];
  let i = 0;

  const push = (key, label = key) => units.push({ key, label });

  while (i < s.length) {
    const c4 = s.slice(i, i + 4);
    const c3 = s.slice(i, i + 3);
    const c2 = s.slice(i, i + 2);
    const c1 = s[i];
    const prev = s[i - 1] || '';
    const isFinal = i === s.length - 1;

    if (!c1 || !c1.trim()) {
      i += 1;
      continue;
    }

    if (c4 === 'tsch') {
      push('t', 't');
      push('sh', 'sh');
      i += 4;
      continue;
    }

    if (c3 === 'sch') {
      push('sh', 'sh');
      i += 3;
      continue;
    }

    if (c3 === 'chs') {
      push('k', 'k');
      push('s', 's');
      i += 3;
      continue;
    }

    if (c2 === 'ch') {
      const sound = isFrontVowel(prev) ? 'ch' : 'kh';
      push(sound, sound);
      i += 2;
      continue;
    }

    if (c2 === 'ei') {
      push('ai', 'ai');
      i += 2;
      continue;
    }

    if (c2 === 'ie') {
      push('ee', 'ee');
      i += 2;
      continue;
    }

    if (c2 === 'eu' || c2 === 'äu') {
      push('oy', 'oy');
      i += 2;
      continue;
    }

    if (c2 === 'au') {
      push('au', 'au');
      i += 2;
      continue;
    }

    if (c2 === 'pf') {
      push('pf', 'pf');
      i += 2;
      continue;
    }

    if (c1 === 'ß') {
      push('s', 's');
      i += 1;
      continue;
    }

    if (c1 === 'z') {
      push('ts', 'ts');
      i += 1;
      continue;
    }

    if (c1 === 'ä') {
      push('e', 'e');
      i += 1;
      continue;
    }

    if (c1 === 'ö') {
      push('oe', 'oe');
      i += 1;
      continue;
    }

    if (c1 === 'ü') {
      push('ue', 'ue');
      i += 1;
      continue;
    }

    if (c2.length === 2 && c2[0] === c2[1] && isConsonant(c2[0])) {
      const doubled = c2[0] === 'z' ? 'ts' : c2[0] === 'ß' ? 's' : c2[0];
      push(doubled, doubled);
      i += 2;
      continue;
    }

    if (c1 === 's') {
      push(i === 0 ? 'z' : 's', i === 0 ? 'z' : 's');
      i += 1;
      continue;
    }

    if (c1 === 'j') {
      push('y', 'y');
      i += 1;
      continue;
    }

    if (c1 === 'w') {
      push('v', 'v');
      i += 1;
      continue;
    }

    if (c1 === 'v') {
      push('f', 'f');
      i += 1;
      continue;
    }

    if (c1 === 'h') {
      if (i === 0) {
        push('h', 'h');
      }

      i += 1;
      continue;
    }

    if (c1 === 'b') {
      push(isFinal ? 'p' : 'b', isFinal ? 'p' : 'b');
      i += 1;
      continue;
    }

    if (c1 === 'd') {
      push(isFinal ? 't' : 'd', isFinal ? 't' : 'd');
      i += 1;
      continue;
    }

    if (c1 === 'g') {
      push(isFinal ? 'k' : 'g', isFinal ? 'k' : 'g');
      i += 1;
      continue;
    }

    if (isVowel(c1)) {
      push(c1, c1);
      i += 1;
      continue;
    }

    push(c1, c1);
    i += 1;
  }

  return units;
}

function unitToToken(unit) {
  const frame =
    {
      a: 1,
      ai: 1,
      au: 1,

      e: 2,

      i: 3,
      ee: 3,

      oe: 4,
      ue: 4,
      oy: 4,

      o: 5,
      u: 5,

      k: 6,
      g: 6,
      kh: 6,

      t: 7,
      d: 7,

      b: 8,
      p: 8,
      m: 8,

      n: 9,

      s: 11,
      z: 11,

      sh: 12,
      ch: 12,

      f: 14,
      v: 14,

      ts: 15,
      pf: 15,

      h: 16,

      r: 17,

      l: 18,

      y: 19,
    }[unit.key] ?? 0;

  return {
    phoneme: unit.key,
    label: unit.label,
    frame,
    holdMs: frameHold(frame),
    trill: false,
  };
}

function resolveUntimedGerman(text = '') {
  const word = String(text || '').trim();

  if (!word) {
    return {
      word: '',
      normalizedText: '',
      helperText: '',
      phonemes: [],
      expectedPhonemes: [],
      frames: [0, 0],
      expectedFrames: [0, 0],
      pronunciation: '',
      ipaPhonemes: [],
      tokenGroups: [],
    };
  }

  const words = word.split(/\s+/).filter(Boolean);
  const resolvedWords = words.map((rawWord) => {
    const units = resolveGermanUnits(rawWord);
    const tokens = units.map(unitToToken);

    return {
      rawText: rawWord,
      units,
      tokens,
      helperText: units.map((u) => u.label).join('-'),
      phonemes: tokens.map((token) => token.phoneme),
      frames: tokens.map((token) => token.frame),
    };
  });

  const tokens = resolvedWords.flatMap((group) => group.tokens);
  const phonemes = tokens.map((token) => token.phoneme);
  const innerFrames = tokens.map((token) => token.frame);
  const helperText = resolvedWords.map((group) => group.helperText).join(' ');
  const pronunciation = helperText;

  return {
    word,
    normalizedText: normalizeGerman(word),
    helperText,
    phonemes,
    expectedPhonemes: phonemes,
    frames: [0, ...innerFrames, 0],
    expectedFrames: [0, ...innerFrames, 0],
    pronunciation,
    ipaPhonemes: [],
    tokenGroups: resolvedWords.map((group) => ({
      rawText: group.rawText,
      helperText: group.helperText,
      phonemes: group.phonemes,
      expectedPhonemes: group.phonemes,
      frames: group.frames,
      expectedFrames: group.frames,
    })),
  };
}

export class PhonemeResolver {
  resolveUntimed(text, _lang = 'de') {
    return resolveUntimedGerman(text);
  }

  resolve(text, _lang = 'de') {
    const word = String(text || '').trim();

    if (!word) {
      return {
        word: '',
        helperText: '',
        phonemes: [],
        frames: [0, 0],
        pronunciation: '',
        phonemeTimeline: [],
        ipaPhonemes: [],
      };
    }

    const words = word.split(/\s+/).filter(Boolean);
    const resolvedWords = words.map(resolveGermanUnits);
    const allTokens = [];

    resolvedWords.forEach((units, wi) => {
      if (wi > 0) allTokens.push(null);
      units.forEach((unit) => allTokens.push(unitToToken(unit)));
    });

    const helperText = resolvedWords
      .map((units) => units.map((u) => u.label).join('-'))
      .join(' ');

    const pronunciation = helperText;

    const frameSequence = [0];
    const phonemeTimeline = [];
    const phonemes = [];
    let cursor = LEAD_IN_MS;

    phonemeTimeline.push({
      phoneme: 'neutral',
      frame: 0,
      startMs: 0,
      endMs: LEAD_IN_MS,
    });

    for (const token of allTokens) {
      if (token === null) {
        frameSequence.push(0);
        phonemeTimeline.push({
          phoneme: 'pause',
          label: '',
          frame: 0,
          startMs: cursor,
          endMs: cursor + PAUSE_MS,
        });
        cursor += PAUSE_MS;
        continue;
      }

      frameSequence.push(token.frame);
      phonemeTimeline.push({
        phoneme: token.phoneme,
        label: token.label,
        frame: token.frame,
        startMs: cursor,
        endMs: cursor + token.holdMs,
      });
      phonemes.push(token.phoneme);
      cursor += token.holdMs;
    }

    frameSequence.push(0);
    phonemeTimeline.push({
      phoneme: 'neutral',
      frame: 0,
      startMs: cursor,
      endMs: cursor + LEAD_IN_MS,
    });

    return {
      word,
      helperText,
      phonemes,
      frames: frameSequence,
      pronunciation,
      phonemeTimeline,
      ipaPhonemes: [],
    };
  }
}

export default PhonemeResolver;