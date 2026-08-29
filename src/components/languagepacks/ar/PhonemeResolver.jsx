import { getArabicVowelledPresetTruth } from './vowelledPresetTruth';
import { getArabicVowelledCatalogTruth } from './vowelledCatalogTruth';

const ARABIC_BASE_LETTER = /[\u0621-\u063A\u0641-\u064A\u0671]/;
const TATWEEL = /\u0640/g; // ـ

const ARABIC_MARK = /[\u064B-\u0652\u0670]/;
const FATHATAN = '\u064B';
const DAMMATAN = '\u064C';
const KASRATAN = '\u064D';
const FATHA = '\u064E';
const DAMMA = '\u064F';
const KASRA = '\u0650';
const SHADDA = '\u0651';
const SUKUN = '\u0652';
const DAGGER_ALIF = '\u0670';

const SUN_LETTERS = new Set([
  'ت',
  'ث',
  'د',
  'ذ',
  'ر',
  'ز',
  'س',
  'ش',
  'ص',
  'ض',
  'ط',
  'ظ',
  'ل',
  'ن',
]);

const LEAD_IN_MS = 40;

// Arabic pack timing tuned for ~0.4 playback.
// Timed resolve() keeps these values for legacy/playback fallback.
// Untimed resolveUntimed() does not expose animation timing.
const C_HOLD = 85;
const V_SHORT = 70;
const LONG_VOWEL_WEIGHT = 1.8;
const V_LONG = Math.round(V_SHORT * LONG_VOWEL_WEIGHT);
const WORD_PAUSE_FRAC = 0.12;
const MULTI_WORD_PACING_BONUS_FRAC = 0.05;
const FINAL_PHONEME_EXTENSION_MS = 120;

function normalizeArabic(input = '') {
  let s = String(input || '').normalize('NFC');

  s = s.replace(TATWEEL, '');
  s = s.replace(/[\u0660-\u0669]/g, ''); // Arabic-Indic digits
  s = s.replace(/\s+/g, ' ').trim();

  return s;
}

function splitArabicGraphemes(input = '') {
  const graphemes = [];

  for (const char of [...input]) {
    if (char.trim() === '') {
      if (graphemes.at(-1)?.type !== 'S') graphemes.push({ type: 'S' });
      continue;
    }

    if (ARABIC_MARK.test(char)) {
      const previous = graphemes.at(-1);
      if (previous?.type === 'G') previous.marks.push(char);
      continue;
    }

    if (ARABIC_BASE_LETTER.test(char)) {
      graphemes.push({ type: 'G', base: char, marks: [] });
    }
  }

  return graphemes;
}

function resolveDefiniteArticles(graphemes = []) {
  const output = [];
  let word = [];

  function flushWord() {
    const hasDefiniteArticle =
      word.length >= 3 &&
      ['ا', 'أ', 'إ', 'آ', 'ٱ'].includes(word[0]?.base) &&
      word[1]?.base === 'ل';

    if (hasDefiniteArticle && SUN_LETTERS.has(word[2]?.base)) {
      const sunLetter = {
        ...word[2],
        marks: word[2].marks.includes(SHADDA)
          ? [...word[2].marks]
          : [SHADDA, ...word[2].marks],
      };

      // The definite article is heard as a short /a/ followed by a doubled
      // sun letter. The written form remains untouched in normalizedText.
      output.push({ type: 'V', v: 'a', source: 'sun-article' });
      output.push(sunLetter, ...word.slice(3));
    } else if (hasDefiniteArticle) {
      output.push({ type: 'V', v: 'a', source: 'definite-article' });
      output.push(...word.slice(1));
    } else {
      output.push(...word);
    }
    word = [];
  }

  graphemes.forEach((grapheme) => {
    if (grapheme.type === 'S') {
      flushWord();
      if (output.at(-1)?.type !== 'S') output.push(grapheme);
      return;
    }
    word.push(grapheme);
  });
  flushWord();

  return output;
}

function vowelFrame(v) {
  if (v === 'a') return 1;
  if (v === 'e') return 2;
  if (v === 'i') return 3;
  if (v === 'o' || v === 'u') return 5;
  return 1;
}

function consonantFrame(ch) {
  if ('بم'.includes(ch)) return 8;
  if ('ن'.includes(ch)) return 9;
  if ('ل'.includes(ch)) return 18;
  if ('ر'.includes(ch)) return 17;

  if ('تدط'.includes(ch)) return 7;
  if ('سصز'.includes(ch)) return 11;
  if ('ثذظ'.includes(ch)) return 13;

  if ('ف'.includes(ch)) return 14;

  if ('كق'.includes(ch)) return 6;

  if ('جش'.includes(ch)) return 12;

  // Arabic guttural/back-throat family.
  if ('غخ'.includes(ch)) return 16;
  if ('حهعء'.includes(ch)) return 16;

  if ('ي'.includes(ch)) return 19;
  if ('و'.includes(ch)) return 5;

  return 7;
}

function isLongVowel(ch) {
  return ch === 'ا' || ch === 'و' || ch === 'ي';
}

function normalizeVowelValue(v) {
  if (v === 'ا') return 'a';
  if (v === 'و') return 'u';
  if (v === 'ي') return 'i';
  return v;
}

function displayVowel(v) {
  if (v === 'a') return FATHA;
  if (v === 'i') return KASRA;
  if (v === 'u') return DAMMA;
  return v;
}

function tokenPhoneme(unit) {
  if (unit.type === 'C') return `C:${unit.c}`;
  if (unit.type === 'V') return `V:${unit.v}`;
  return 'pause';
}

function tokenFrame(unit) {
  if (unit.type === 'C') return consonantFrame(unit.c);
  if (unit.type === 'V') return vowelFrame(normalizeVowelValue(unit.v));
  return 0;
}

function tokenLabel(unit) {
  if (unit.type === 'C') return unit.c;
  if (unit.type === 'V') return displayVowel(unit.v);
  return '';
}

function replaceTrailingShortVowel(out, shortVowel, longVowel) {
  const previous = out.at(-1);
  if (previous?.type === 'V' && previous.v === shortVowel) {
    out[out.length - 1] = { type: 'V', v: longVowel };
    return true;
  }
  return false;
}

function appendMarkedVowels(out, marks = []) {
  if (marks.includes(FATHATAN)) {
    out.push({ type: 'V', v: 'a' }, { type: 'C', c: 'ن' });
  } else if (marks.includes(DAMMATAN)) {
    out.push({ type: 'V', v: 'u' }, { type: 'C', c: 'ن' });
  } else if (marks.includes(KASRATAN)) {
    out.push({ type: 'V', v: 'i' }, { type: 'C', c: 'ن' });
  } else if (marks.includes(FATHA)) {
    out.push({ type: 'V', v: 'a' });
  } else if (marks.includes(DAMMA)) {
    out.push({ type: 'V', v: 'u' });
  } else if (marks.includes(KASRA)) {
    out.push({ type: 'V', v: 'i' });
  }

  if (marks.includes(DAGGER_ALIF)) {
    replaceTrailingShortVowel(out, 'a', 'ا') || out.push({ type: 'V', v: 'ا' });
  }
}

function tokenizeArabicToCV(input = '') {
  const out = [];
  const graphemes = resolveDefiniteArticles(splitArabicGraphemes(input));

  for (let i = 0; i < graphemes.length; i += 1) {
    const grapheme = graphemes[i];

    if (grapheme.type === 'S') {
      out.push({ type: 'S' });
      continue;
    }

    if (grapheme.type === 'V') {
      out.push(grapheme);
      continue;
    }

    const c = grapheme.base;
    const marks = grapheme.marks || [];
    const hasPronunciationMark = marks.some((mark) =>
      [FATHATAN, DAMMATAN, KASRATAN, FATHA, DAMMA, KASRA, SHADDA, SUKUN, DAGGER_ALIF].includes(mark)
    );

    if (c === 'آ') {
      out.push({ type: 'C', c: 'ء' }, { type: 'V', v: 'ا' });
      appendMarkedVowels(out, marks);
      continue;
    }

    if (['أ', 'إ', 'ؤ', 'ئ', 'ء'].includes(c)) {
      out.push({ type: 'C', c: 'ء' });
      if (marks.includes(SHADDA)) out.push({ type: 'C', c: 'ء' });
      appendMarkedVowels(out, marks);
      continue;
    }

    if (c === 'ا' || c === 'ٱ' || c === 'ى') {
      const previousGrapheme = graphemes[i - 1];
      if (previousGrapheme?.marks?.includes(FATHATAN)) continue;

      if (marks.includes(FATHATAN)) {
        out.push({ type: 'V', v: 'a' }, { type: 'C', c: 'ن' });
        continue;
      }

      if (marks.some((mark) => [FATHA, DAMMA, KASRA].includes(mark))) {
        appendMarkedVowels(out, marks);
        continue;
      }

      replaceTrailingShortVowel(out, 'a', 'ا') || out.push({ type: 'V', v: 'ا' });
      appendMarkedVowels(out, marks);
      continue;
    }

    if ((c === 'و' || c === 'ي') && !hasPronunciationMark) {
      const shortVowel = c === 'و' ? 'u' : 'i';
      if (replaceTrailingShortVowel(out, shortVowel, c)) continue;

      // Without a matching preceding short vowel, waw and ya are glides.
      out.push({ type: 'C', c });
      continue;
    }

    if (c === 'ة') {
      const nextInWord = graphemes
        .slice(i + 1)
        .find((next) => next.type === 'G' || next.type === 'S');
      const isWordFinal = !nextInWord || nextInWord.type === 'S';
      if (isWordFinal) {
        out.push({ type: 'V', v: 'a' });
      } else {
        out.push({ type: 'C', c: 'ت' });
        appendMarkedVowels(out, marks);
      }
      continue;
    }

    out.push({ type: 'C', c });
    if (marks.includes(SHADDA)) out.push({ type: 'C', c });
    appendMarkedVowels(out, marks);
  }

  return out.filter((unit, index, units) => {
    if (unit.type !== 'S') return true;
    return index > 0 && index < units.length - 1 && units[index - 1]?.type !== 'S';
  });
}

function pronunciationMetadata(normalizedText = '') {
  const words = [];
  let currentWord = [];

  splitArabicGraphemes(normalizedText).forEach((item) => {
    if (item.type === 'S') {
      if (currentWord.length) words.push(currentWord);
      currentWord = [];
      return;
    }
    currentWord.push(item);
  });
  if (currentWord.length) words.push(currentWord);

  const wordMarkCounts = words.map((word) =>
    word.reduce(
      (count, grapheme) =>
        count + grapheme.marks.filter((mark) => ARABIC_MARK.test(mark)).length,
      0
    )
  );
  const markCount = wordMarkCounts.reduce((total, count) => total + count, 0);
  const explicitVowelOrRest = new Set([
    FATHATAN,
    DAMMATAN,
    KASRATAN,
    FATHA,
    DAMMA,
    KASRA,
    SUKUN,
    DAGGER_ALIF,
  ]);

  const ambiguous = words.some((word) =>
    word.some((grapheme, index) => {
      if (word.length <= 1) return false;

      const base = grapheme.base;
      const isFinal = index === word.length - 1;
      const hasExplicitVowelOrRest = grapheme.marks.some((mark) =>
        explicitVowelOrRest.has(mark)
      );

      if (base === 'آ' || base === 'ا' || base === 'ٱ' || base === 'ى') {
        return false;
      }

      if (base === 'ة' && isFinal) return false;

      if ((base === 'و' || base === 'ي') && !hasExplicitVowelOrRest) {
        const previous = word[index - 1];
        const matchingShortVowel = base === 'و' ? DAMMA : KASRA;
        return !previous?.marks?.includes(matchingShortVowel);
      }

      // At pause, an otherwise fully specified word may end on an unmarked
      // consonant. Internal unmarked consonants leave the short vowel unknown.
      if (isFinal) return false;
      return !hasExplicitVowelOrRest;
    })
  );

  if (ambiguous) {
    return {
      ambiguous: true,
      reviewRequired: true,
      status: 'ambiguous',
      validation: { valid: false, reason: 'ambiguous' },
    };
  }

  return {
    ambiguous: false,
    reviewRequired: false,
    status: markCount > 0 ? 'marked' : 'resolved',
    validation: { valid: true, reason: null },
  };
}

function normalizeAndTokenize(text = '') {
  const wordRaw = String(text || '').trim();

  if (!wordRaw) {
    return {
      wordRaw: '',
      normalizedText: '',
      units: [],
    };
  }

  const sourceNormalizedText = normalizeArabic(wordRaw);
  const presetTruthEntry = getArabicVowelledPresetTruth(sourceNormalizedText);
  const catalogTruthEntry = getArabicVowelledCatalogTruth(sourceNormalizedText);
  const truthEntry = presetTruthEntry ?? catalogTruthEntry;
  const truthSource = presetTruthEntry
    ? 'arabic-vowelled-preset-truth'
    : catalogTruthEntry
      ? 'arabic-vowelled-catalog-truth'
      : null;
  const normalizedText = normalizeArabic(truthEntry?.vowelled ?? wordRaw);

  return {
    wordRaw,
    sourceNormalizedText,
    normalizedText,
    units: tokenizeArabicToCV(normalizedText),
    metadata: {
      ...pronunciationMetadata(normalizedText),
      presetTruthApplied: Boolean(presetTruthEntry),
      catalogTruthApplied: Boolean(catalogTruthEntry),
      truthSource,
      truthEntryId: truthEntry?.id ?? null,
    },
  };
}

function buildHelperText(units = []) {
  return units
    .map((u) => {
      if (u.type === 'C') return u.c;
      if (u.type === 'V') return tokenLabel(u);
      return '';
    })
    .filter((value, index, arr) => {
      // Keep separators meaningful but avoid leading/trailing empty chunks.
      if (value) return true;
      return index > 0 && index < arr.length - 1;
    })
    .join('·')
    .replace(/·{2,}/g, '·')
    .replace(/^·|·$/g, '');
}

function buildTokenGroups(units = []) {
  const groups = [];
  let current = {
    units: [],
    tokens: [],
    phonemes: [],
    expectedPhonemes: [],
    frames: [],
    expectedFrames: [],
    helperText: '',
  };

  function flush() {
    if (!current.units.length && !current.tokens.length) return;

    current.helperText = buildHelperText(current.units);
    groups.push(current);

    current = {
      units: [],
      tokens: [],
      phonemes: [],
      expectedPhonemes: [],
      frames: [],
      expectedFrames: [],
      helperText: '',
    };
  }

  units.forEach((unit) => {
    if (unit.type === 'S') {
      flush();
      return;
    }

    const phoneme = tokenPhoneme(unit);
    const frame = tokenFrame(unit);
    const label = tokenLabel(unit);

    const token = {
      ...unit,
      phoneme,
      expectedPhoneme: phoneme,
      frame,
      expectedFrame: frame,
      label,
    };

    current.units.push(unit);
    current.tokens.push(token);
    current.phonemes.push(phoneme);
    current.expectedPhonemes.push(phoneme);
    current.frames.push(frame);
    current.expectedFrames.push(frame);
  });

  flush();

  return groups;
}

function buildUntimedArabic(text = '') {
  const { wordRaw, normalizedText, units, metadata } = normalizeAndTokenize(text);

  if (!wordRaw) {
    return {
      word: '',
      normalizedText: '',
      helperText: '',
      phonemes: [],
      expectedPhonemes: [],
      frames: [],
      expectedFrames: [],
      pronunciation: '',
      helperChunks: [],
      ipaPhonemes: [],
      tokens: [],
      tokenGroups: [],
      ambiguous: false,
      reviewRequired: false,
      status: 'empty',
      validation: { valid: false, reason: 'empty' },
    };
  }

  const tokenGroups = buildTokenGroups(units);
  const tokens = tokenGroups.flatMap((group) => group.tokens);

  const phonemes = tokens.map((token) => token.phoneme);
  const innerFrames = tokens.map((token) => token.frame);
  const helperText = buildHelperText(units);

  return {
    word: wordRaw,
    normalizedText,
    helperText,
    phonemes,
    expectedPhonemes: phonemes,
    frames: innerFrames,
    expectedFrames: innerFrames,
    pronunciation: helperText,
    helperChunks: [],
    ipaPhonemes: [],
    tokens,
    tokenGroups,
    ...metadata,
  };
}

export class PhonemeResolver {
  resolveUntimed(text, _lang = 'ar') {
    return buildUntimedArabic(text);
  }

  resolve(text, _lang = 'ar') {
    const { wordRaw, normalizedText, units, metadata } = normalizeAndTokenize(text);

    if (!wordRaw) {
      return {
        word: '',
        helperText: '',
        helperChunks: [],
        phonemes: [],
        frames: [0, 0],
        pronunciation: '',
        phonemeTimeline: [],
        ipaPhonemes: [],
      };
    }

    const helperText = buildHelperText(units);

    const helperChunks = [];
    const phonemeTimeline = [];
    const phonemes = [];
    const frames = [0];

    let cursor = 0;
    let lastFrame = 0;
    let wordIdx = 0;

    phonemeTimeline.push({
      phoneme: 'neutral',
      frame: 0,
      startMs: 0,
      endMs: LEAD_IN_MS,
    });

    cursor = LEAD_IN_MS;

    for (let i = 0; i < units.length; i += 1) {
      const u = units[i];

      if (u.type === 'S') {
        wordIdx += 1;

        const baseSyl = C_HOLD + V_SHORT;
        const scaledPauseFrac =
          WORD_PAUSE_FRAC * (1 + wordIdx * MULTI_WORD_PACING_BONUS_FRAC);
        const wordPause = Math.max(1, Math.round(baseSyl * scaledPauseFrac));

        phonemeTimeline.push({
          phoneme: 'pause',
          frame: lastFrame,
          startMs: cursor,
          endMs: cursor + wordPause,
        });

        frames.push(lastFrame);
        cursor += wordPause;
        continue;
      }

      if (u.type === 'C') {
        const frame = consonantFrame(u.c);
        const phoneme = tokenPhoneme(u);

        phonemeTimeline.push({
          phoneme,
          label: u.c,
          frame,
          startMs: cursor,
          endMs: cursor + C_HOLD,
        });

        helperChunks.push({
          text: u.c,
          startMs: cursor,
          endMs: cursor + C_HOLD,
        });

        phonemes.push(phoneme);
        frames.push(frame);
        cursor += C_HOLD;
        lastFrame = frame;
        continue;
      }

      const isLong = isLongVowel(u.v);
      const normalizedVowel = normalizeVowelValue(u.v);
      const frame = vowelFrame(normalizedVowel);
      const hold = isLong ? V_LONG : V_SHORT;
      const displayV = displayVowel(u.v);
      const phoneme = tokenPhoneme(u);

      phonemeTimeline.push({
        phoneme,
        label: displayV,
        frame,
        startMs: cursor,
        endMs: cursor + hold,
      });

      helperChunks.push({
        text: displayV,
        startMs: cursor,
        endMs: cursor + hold,
      });

      phonemes.push(phoneme);
      frames.push(frame);
      cursor += hold;
      lastFrame = frame;
    }

    const lastArticulatedEntry = [...phonemeTimeline]
      .reverse()
      .find(
        (entry) =>
          entry?.phoneme !== 'pause' &&
          entry?.phoneme !== 'neutral' &&
          entry?.frame !== 0
      );

    if (lastArticulatedEntry) {
      const oldEndMs = lastArticulatedEntry.endMs;
      lastArticulatedEntry.endMs += FINAL_PHONEME_EXTENSION_MS;

      const lastHelperChunk = [...helperChunks]
        .reverse()
        .find((chunk) => chunk?.endMs === oldEndMs);

      if (lastHelperChunk) {
        lastHelperChunk.endMs += FINAL_PHONEME_EXTENSION_MS;
      }

      cursor += FINAL_PHONEME_EXTENSION_MS;
    }

    phonemeTimeline.push({
      phoneme: 'neutral',
      frame: 0,
      startMs: cursor,
      endMs: cursor + LEAD_IN_MS,
    });

    frames.push(0);

    return {
      word: wordRaw,
      normalizedText,
      helperText,
      helperChunks,
      phonemes,
      frames,
      pronunciation: helperText,
      phonemeTimeline,
      ipaPhonemes: [],
      ...metadata,
    };
  }
}

export default PhonemeResolver;
