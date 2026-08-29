import {
  initializeJapaneseReadingEngine,
  readJapaneseText,
} from './japaneseReadingEngine';

const LEAD_IN_MS = 40;
const MORA_HOLD_MS = 240;
const MORAIC_N_HOLD_MS = 170;
const SOKUON_HOLD_MS = 140;
const LONG_VOWEL_HOLD_MS = 190;

const BASIC_MORAE = Object.freeze({
  あ: 'a', い: 'i', う: 'u', え: 'e', お: 'o',
  か: 'ka', き: 'ki', く: 'ku', け: 'ke', こ: 'ko',
  さ: 'sa', し: 'shi', す: 'su', せ: 'se', そ: 'so',
  た: 'ta', ち: 'chi', つ: 'tsu', て: 'te', と: 'to',
  な: 'na', に: 'ni', ぬ: 'nu', ね: 'ne', の: 'no',
  は: 'ha', ひ: 'hi', ふ: 'fu', へ: 'he', ほ: 'ho',
  ま: 'ma', み: 'mi', む: 'mu', め: 'me', も: 'mo',
  や: 'ya', ゆ: 'yu', よ: 'yo',
  ら: 'ra', り: 'ri', る: 'ru', れ: 're', ろ: 'ro',
  わ: 'wa', を: 'o', ん: 'n',
  が: 'ga', ぎ: 'gi', ぐ: 'gu', げ: 'ge', ご: 'go',
  ざ: 'za', じ: 'ji', ず: 'zu', ぜ: 'ze', ぞ: 'zo',
  だ: 'da', ぢ: 'ji', づ: 'zu', で: 'de', ど: 'do',
  ば: 'ba', び: 'bi', ぶ: 'bu', べ: 'be', ぼ: 'bo',
  ぱ: 'pa', ぴ: 'pi', ぷ: 'pu', ぺ: 'pe', ぽ: 'po',
  ゔ: 'vu',
  ぁ: 'a', ぃ: 'i', ぅ: 'u', ぇ: 'e', ぉ: 'o',
});

const COMPOUND_MORAE = Object.freeze({
  きゃ: 'kya', きゅ: 'kyu', きょ: 'kyo', きぇ: 'kye',
  ぎゃ: 'gya', ぎゅ: 'gyu', ぎょ: 'gyo', ぎぇ: 'gye',
  しゃ: 'sha', しゅ: 'shu', しょ: 'sho', しぇ: 'she',
  じゃ: 'ja', じゅ: 'ju', じょ: 'jo', じぇ: 'je',
  ちゃ: 'cha', ちゅ: 'chu', ちょ: 'cho', ちぇ: 'che',
  にゃ: 'nya', にゅ: 'nyu', にょ: 'nyo', にぇ: 'nye',
  ひゃ: 'hya', ひゅ: 'hyu', ひょ: 'hyo', ひぇ: 'hye',
  びゃ: 'bya', びゅ: 'byu', びょ: 'byo', びぇ: 'bye',
  ぴゃ: 'pya', ぴゅ: 'pyu', ぴょ: 'pyo', ぴぇ: 'pye',
  みゃ: 'mya', みゅ: 'myu', みょ: 'myo', みぇ: 'mye',
  りゃ: 'rya', りゅ: 'ryu', りょ: 'ryo', りぇ: 'rye',
  いぇ: 'ye',
  うぃ: 'wi', うぇ: 'we', うぉ: 'wo',
  ゔぁ: 'va', ゔぃ: 'vi', ゔぇ: 've', ゔぉ: 'vo', ゔゅ: 'vyu',
  てぃ: 'ti', てゅ: 'tyu', とぅ: 'tu',
  でぃ: 'di', でゅ: 'dyu', どぅ: 'du',
  つぁ: 'tsa', つぃ: 'tsi', つぇ: 'tse', つぉ: 'tso',
  ふぁ: 'fa', ふぃ: 'fi', ふぇ: 'fe', ふぉ: 'fo', ふゅ: 'fyu',
  くぁ: 'kwa', くぃ: 'kwi', くぇ: 'kwe', くぉ: 'kwo',
  ぐぁ: 'gwa', ぐぃ: 'gwi', ぐぇ: 'gwe', ぐぉ: 'gwo',
  すぃ: 'si', ずぃ: 'zi',
});

const GLIDE_ONSETS = Object.freeze({
  ky: ['k', 'y'], gy: ['g', 'y'], ny: ['n', 'y'],
  hy: ['h', 'y'], by: ['b', 'y'], py: ['p', 'y'],
  my: ['m', 'y'], ry: ['r', 'y'], ty: ['t', 'y'],
  dy: ['d', 'y'], fy: ['f', 'y'], vy: ['v', 'y'],
  kw: ['k', 'w'], gw: ['g', 'w'],
});

function normalizeJapanese(input = '') {
  return String(input || '').normalize('NFC').trim();
}

function katakanaToHiragana(input = '') {
  return Array.from(String(input || ''), (character) => {
    const code = character.codePointAt(0);
    if (code >= 0x30a1 && code <= 0x30f6) {
      return String.fromCodePoint(code - 0x60);
    }
    return character;
  }).join('');
}

function trailingVowel(value = '') {
  const match = String(value).match(/[aiueo]$/);
  return match?.[0] || '';
}

function romajiToPhones(romaji = '') {
  const normalized = String(romaji || '').toLowerCase();
  if (!normalized) return [];
  if (normalized === 'n') return ['n'];

  const vowel = trailingVowel(normalized);
  if (!vowel) return [normalized];

  const onset = normalized.slice(0, -1);
  if (!onset) return [vowel];
  if (GLIDE_ONSETS[onset]) return [...GLIDE_ONSETS[onset], vowel];
  if (['sh', 'ch', 'ts'].includes(onset)) return [onset, vowel];
  return [onset, vowel];
}

function frameForPhone(phone = '') {
  const normalized = String(phone || '').toLowerCase();
  if (normalized === 'a') return 1;
  if (normalized === 'e') return 2;
  if (normalized === 'i') return 3;
  if (['u', 'o', 'w'].includes(normalized)) return 5;
  if (['k', 'g'].includes(normalized)) return 6;
  if (['t', 'd', 'q'].includes(normalized)) return 7;
  if (['b', 'p', 'm'].includes(normalized)) return 8;
  if (normalized === 'n') return 9;
  if (normalized === 'ng') return 10;
  if (['s', 'z'].includes(normalized)) return 11;
  if (normalized === 'sh') return 12;
  if (['f', 'v'].includes(normalized)) return 14;
  if (['ch', 'ts', 'j'].includes(normalized)) return 15;
  if (normalized === 'h') return 16;
  if (normalized === 'r') return 17;
  if (normalized === 'l') return 18;
  if (normalized === 'y') return 19;
  return 0;
}

function parseMorae(pronunciationKana = '') {
  const kana = katakanaToHiragana(pronunciationKana);
  const morae = [];
  const unresolvedCharacters = [];

  for (let index = 0; index < kana.length;) {
    const character = kana[index];
    const pair = kana.slice(index, index + 2);

    if (/^[\s\p{P}\p{S}。、・「」『』【】（）［］｛｝！？〜]$/u.test(character)) {
      index += 1;
      continue;
    }

    if (COMPOUND_MORAE[pair]) {
      const romaji = COMPOUND_MORAE[pair];
      morae.push({
        kana: pair,
        romaji,
        display: romaji,
        kind: 'mora',
        phones: romajiToPhones(romaji),
      });
      index += 2;
      continue;
    }

    if (character === 'っ') {
      morae.push({
        kana: character,
        romaji: 'q',
        display: 'pause',
        kind: 'sokuon',
        phones: [],
      });
      index += 1;
      continue;
    }

    if (character === 'ー') {
      const previous = morae[morae.length - 1];
      const vowel = trailingVowel(previous?.romaji || '');
      if (!vowel) {
        unresolvedCharacters.push(character);
      } else {
        morae.push({
          kana: character,
          romaji: vowel,
          display: vowel,
          kind: 'long-vowel',
          phones: [],
          sustainedPhone: vowel,
        });
      }
      index += 1;
      continue;
    }

    const romaji = BASIC_MORAE[character];
    if (romaji) {
      morae.push({
        kana: character,
        romaji,
        display: romaji,
        kind: character === 'ん' ? 'moraic-nasal' : 'mora',
        phones: romajiToPhones(romaji),
      });
      index += 1;
      continue;
    }

    unresolvedCharacters.push(character);
    index += 1;
  }

  for (let index = 0; index < morae.length; index += 1) {
    const mora = morae[index];
    if (mora.kind !== 'sokuon') continue;
    const nextPhone = morae
      .slice(index + 1)
      .flatMap((item) => item.phones || [])
      .find(Boolean);
    mora.display = nextPhone || 'pause';
    mora.sustainedPhone = nextPhone || 'q';
  }

  return { morae, unresolvedCharacters };
}

function durationForMora(mora) {
  if (mora.kind === 'moraic-nasal') return MORAIC_N_HOLD_MS;
  if (mora.kind === 'sokuon') return SOKUON_HOLD_MS;
  if (mora.kind === 'long-vowel') return LONG_VOWEL_HOLD_MS;
  return MORA_HOLD_MS;
}

function buildUntimedResult(text = '') {
  const sourceText = normalizeJapanese(text);

  if (!sourceText) {
    return {
      word: '', normalizedText: '', readingKana: '', pronunciationKana: '',
      helperText: '', pronunciation: '', phonemes: [], expectedPhonemes: [],
      frames: [], expectedFrames: [], tokens: [], tokenGroups: [], morae: [],
      approved: false, unresolved: true,
      validation: { valid: false, reason: 'empty-input', issues: [] },
    };
  }

  const reading = readJapaneseText(sourceText);
  const parsed = parseMorae(reading.pronunciation);
  const unresolved = [
    ...(reading.unresolvedTokens || []),
    ...parsed.unresolvedCharacters,
  ].filter(Boolean);
  const morae = parsed.morae;
  const tokens = morae.flatMap((mora, moraIndex) =>
    (mora.phones || []).map((phoneme) => ({
      phoneme,
      frame: frameForPhone(phoneme),
      moraIndex,
      mora: mora.kana,
      helper: mora.display,
    }))
  );
  const phonemes = tokens.map((token) => token.phoneme);
  const frames = tokens.map((token) => token.frame);
  const helperText = morae.map((mora) => mora.display).join(' ');
  const approved =
    reading.ready === true &&
    unresolved.length === 0 &&
    morae.length > 0 &&
    phonemes.length > 0 &&
    phonemes.length === frames.length;

  return {
    word: sourceText,
    normalizedText: sourceText,
    readingKana: katakanaToHiragana(reading.reading),
    pronunciationKana: katakanaToHiragana(reading.pronunciation),
    helperText,
    pronunciation: helperText,
    phonemes,
    expectedPhonemes: phonemes,
    frames,
    expectedFrames: frames,
    tokens,
    tokenGroups: reading.tokens,
    morae,
    ipaPhonemes: [],
    approved,
    unresolved: !approved,
    reviewRequired: !approved,
    validation: approved
      ? { valid: true, reason: null, issues: [] }
      : {
          valid: false,
          reason: reading.ready ? 'unresolved-japanese-reading' : 'reading-engine-not-ready',
          issues: unresolved,
        },
  };
}

function buildTimedResult(text = '') {
  const untimed = buildUntimedResult(text);
  if (!untimed.approved) {
    return { ...untimed, phonemeTimeline: [], helperChunks: [] };
  }

  const phonemeTimeline = [
    { phoneme: 'neutral', frame: 0, startMs: 0, endMs: LEAD_IN_MS },
  ];
  const helperChunks = [];
  let cursor = LEAD_IN_MS;

  untimed.morae.forEach((mora) => {
    const startMs = cursor;
    const durationMs = durationForMora(mora);
    const endMs = startMs + durationMs;
    const phones = mora.phones || [];

    if (phones.length === 0) {
      const animationPhone = mora.sustainedPhone || 'q';
      phonemeTimeline.push({
        phoneme: animationPhone,
        label: mora.display,
        frame: frameForPhone(animationPhone),
        startMs,
        endMs,
        timingOnly: true,
        moraKind: mora.kind,
      });
    } else {
      const unitDuration = durationMs / phones.length;
      phones.forEach((phoneme, phoneIndex) => {
        phonemeTimeline.push({
          phoneme,
          label: mora.display,
          frame: frameForPhone(phoneme),
          startMs: startMs + unitDuration * phoneIndex,
          endMs: phoneIndex === phones.length - 1
            ? endMs
            : startMs + unitDuration * (phoneIndex + 1),
          moraKind: mora.kind,
        });
      });
    }

    helperChunks.push({
      text: mora.display,
      startMs,
      endMs,
      kana: mora.kana,
      kind: mora.kind,
    });
    cursor = endMs;
  });

  phonemeTimeline.push({
    phoneme: 'neutral',
    frame: 0,
    startMs: cursor,
    endMs: cursor + LEAD_IN_MS,
  });

  return { ...untimed, phonemeTimeline, helperChunks };
}

export async function initializeJapaneseResolver(options = {}) {
  return initializeJapaneseReadingEngine(options);
}

export function resolveJapaneseUnits(text = '') {
  const result = buildUntimedResult(text);
  return {
    resolvedWords: [result.morae],
    morae: result.morae,
    readingKana: result.readingKana,
    pronunciationKana: result.pronunciationKana,
    unresolved: result.unresolved,
  };
}

class PhonemeResolver {
  resolveUntimed(text, _lang = 'ja') {
    return buildUntimedResult(text);
  }

  resolve(text, _lang = 'ja') {
    return buildTimedResult(text);
  }
}

export { frameForPhone };
export default PhonemeResolver;
