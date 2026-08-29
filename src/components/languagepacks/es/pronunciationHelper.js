/**
 * SoundMirror pronunciation helper — Spanish (es)
 *
 * Visible learner guidance only.
 * - Hyphens separate sound chunks inside a word.
 * - Spaces preserve word boundaries in phrases.
 * - This file does not control animation, frames, timing, or TTS.
 * - The Spanish PhonemeResolver remains the hidden phoneme authority.
 *
 * Audit terminology:
 * - approved = a valid helper was produced
 * - humanReviewed = Dan explicitly reviewed that helper style/example
 * - mechanicallyValidated = produced by the deterministic Spanish rules below
 */

import universal500 from './universal500';
import {
  SPANISH_PRESET_WORDS as SPANISH_RUNTIME_WORDS,
  SPANISH_PRESET_PHRASES as SPANISH_RUNTIME_PHRASES,
} from './presets';

export const SPANISH_PRESET_WORDS = Object.freeze(
  SPANISH_RUNTIME_WORDS.map((item) => item.practice)
);

export const SPANISH_PRESET_PHRASES = Object.freeze(
  SPANISH_RUNTIME_PHRASES.map((item) => item.practice)
);

/**
 * Explicitly reviewed helpers.
 *
 * These are the examples reviewed and accepted before the full
 * Spanish helper library was activated.
 */
export const REVIEWED_SPANISH_HELPERS = Object.freeze({
  hola: 'oh-lah',
  oye: 'oh-yeh',
  sonríe: 'sohn-rree-eh',
  gracias: 'grah-syahs',
  perdón: 'pehr-dohn',
  sí: 'see',
  no: 'noh',
  bienvenido: 'byehn-beh-nee-doh',
  adiós: 'ah-dyohs',
  beso: 'beh-soh',

  buenos: 'bweh-nohs',
  días: 'dee-ahs',
  perdóneme: 'pehr-doh-neh-meh',
  buenas: 'bweh-nahs',
  noches: 'noh-chehs',
  cómo: 'koh-moh',
  estás: 'ehs-tahs',
  estoy: 'ehs-toy',
  muchas: 'moo-chahs',
  pronto: 'prohn-toh',

  amigo: 'ah-mee-goh',
  año: 'ah-nyoh',
  ayuda: 'ah-yoo-dah',
  boca: 'boh-kah',
  cabeza: 'kah-beh-sah',
  calle: 'kah-yeh',
  ciudad: 'syoo-dahd',
  corazón: 'koh-rah-sohn',
  cuerpo: 'kwehr-poh',
  decir: 'deh-seer',
  escuela: 'ehs-kweh-lah',
  familia: 'fah-mee-lyah',
  feliz: 'feh-lees',
  gente: 'hehn-teh',
  guerra: 'geh-rrah',
  hermano: 'ehr-mah-noh',
  llave: 'yah-beh',
  mujer: 'moo-hehr',
  niño: 'nee-nyoh',
  queso: 'keh-soh',
});

const BASE_VOWEL = Object.freeze({
  á: 'a',
  é: 'e',
  í: 'i',
  ó: 'o',
  ú: 'u',
  ü: 'u',
});

const VOWEL_DISPLAY = Object.freeze({
  a: 'ah',
  e: 'eh',
  i: 'ee',
  o: 'oh',
  u: 'oo',
});

const DIPHTHONG_DISPLAY = Object.freeze({
  ia: 'yah',
  ie: 'yeh',
  io: 'yoh',
  iu: 'yoo',

  ua: 'wah',
  ue: 'weh',
  ui: 'wee',
  uo: 'woh',

  ai: 'eye',
  ei: 'ay',
  oi: 'oy',
  au: 'ow',

  eu: 'eh-oo',
  ou: 'oh-oo',
});

const VALID_ONSET_CLUSTERS = new Set([
  'bl',
  'br',
  'cl',
  'cr',
  'dr',
  'fl',
  'fr',
  'gl',
  'gr',
  'pl',
  'pr',
  'tr',
  'tl',
]);

function normalizeWord(value = '') {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFC')
    .replace(/[^a-záéíóúüñ]/g, '');
}

function wordsFromText(value = '') {
  return String(value ?? '')
    .trim()
    .split(/\s+/)
    .map(normalizeWord)
    .filter(Boolean);
}

function normalizeText(value = '') {
  return wordsFromText(value).join(' ');
}

function consonant(value) {
  return {
    value,
    type: 'consonant',
    accentedWeak: false,
  };
}

function vowel(value, accentedWeak = false) {
  return {
    value,
    type: 'vowel',
    accentedWeak,
  };
}

function tokenizePronunciation(word = '') {
  const s = normalizeWord(word);

  const tokens = [];

  let i = 0;

  while (i < s.length) {
    const ch = s[i];
    const next = s[i + 1] || '';

    const pair = s.slice(i, i + 2);
    const tri = s.slice(i, i + 3);

    /*
     * güe / güi:
     * the ü is pronounced.
     */
    if (tri === 'güe') {
      tokens.push(
        consonant('g'),
        vowel('u'),
        vowel('e')
      );

      i += 3;
      continue;
    }

    if (tri === 'güi') {
      tokens.push(
        consonant('g'),
        vowel('u'),
        vowel('i')
      );

      i += 3;
      continue;
    }

    /*
     * gue / gui:
     * the u is silent.
     */
    if (tri === 'gue') {
      tokens.push(
        consonant('g'),
        vowel('e')
      );

      i += 3;
      continue;
    }

    if (tri === 'gui') {
      tokens.push(
        consonant('g'),
        vowel('i')
      );

      i += 3;
      continue;
    }

    /*
     * qu:
     * u is silent.
     */
    if (pair === 'qu') {
      tokens.push(
        consonant('k')
      );

      i += 2;
      continue;
    }

    if (pair === 'ch') {
      tokens.push(
        consonant('ch')
      );

      i += 2;
      continue;
    }

    /*
     * SoundMirror Spanish baseline uses yeísmo.
     */
    if (pair === 'll') {
      tokens.push(
        consonant('y')
      );

      i += 2;
      continue;
    }

    if (pair === 'rr') {
      tokens.push(
        consonant('rr')
      );

      i += 2;
      continue;
    }

    if (ch === 'ñ') {
      tokens.push(
        consonant('ny')
      );

      i += 1;
      continue;
    }

    /*
     * Silent h.
     */
    if (ch === 'h') {
      i += 1;
      continue;
    }

    /*
     * Latin-American teaching baseline.
     */
    if (ch === 'j') {
      tokens.push(
        consonant('h')
      );

      i += 1;
      continue;
    }

    if (ch === 'z') {
      tokens.push(
        consonant('s')
      );

      i += 1;
      continue;
    }

    if (ch === 'v') {
      tokens.push(
        consonant('v')
      );

      i += 1;
      continue;
    }

    if (ch === 'c') {
      tokens.push(
        consonant(
          ['e', 'é', 'i', 'í'].includes(next)
            ? 's'
            : 'k'
        )
      );

      i += 1;
      continue;
    }

    if (ch === 'g') {
      tokens.push(
        consonant(
          ['e', 'é', 'i', 'í'].includes(next)
            ? 'h'
            : 'g'
        )
      );

      i += 1;
      continue;
    }

    if (ch === 'r') {
      const previous =
        s[i - 1] || '';

      const strong =
        i === 0 ||
        ['n', 'l', 's'].includes(previous);

      tokens.push(
        consonant(
          strong ? 'rr' : 'r'
        )
      );

      i += 1;
      continue;
    }

    /*
     * Final y behaves as vowel i.
     * Elsewhere it is the y glide.
     */
    if (ch === 'y') {
      if (i === s.length - 1) {
        tokens.push(
          vowel('i')
        );
      } else {
        tokens.push(
          consonant('y')
        );
      }

      i += 1;
      continue;
    }

    if (ch === 'x') {
      tokens.push(
        consonant('k'),
        consonant('s')
      );

      i += 1;
      continue;
    }

    if (
      'aeiouáéíóúü'.includes(ch)
    ) {
      const base =
        BASE_VOWEL[ch] || ch;

      tokens.push(
        vowel(
          base,
          ch === 'í' ||
          ch === 'ú'
        )
      );

      i += 1;
      continue;
    }

    if (
      'bcdfklmnpqstw'.includes(ch)
    ) {
      tokens.push(
        consonant(
          ch === 'q'
            ? 'k'
            : ch
        )
      );

      i += 1;
      continue;
    }

    i += 1;
  }

  return tokens;
}

function isStrongVowel(token) {
  return (
    token?.type === 'vowel' &&
    ['a', 'e', 'o'].includes(
      token.value
    )
  );
}

function vowelsJoin(
  left,
  right
) {
  if (
    left?.type !== 'vowel' ||
    right?.type !== 'vowel'
  ) {
    return false;
  }

  if (
    left.accentedWeak ||
    right.accentedWeak
  ) {
    return false;
  }

  /*
   * Two strong vowels form a hiatus.
   *
   * A pair containing an unstressed
   * weak vowel i/u forms a diphthong.
   */
  return !(
    isStrongVowel(left) &&
    isStrongVowel(right)
  );
}

function syllabify(tokens = []) {
  if (!tokens.length) {
    return [];
  }

  const nuclei = [];

  let i = 0;

  while (i < tokens.length) {
    if (
      tokens[i].type !== 'vowel'
    ) {
      i += 1;
      continue;
    }

    const start = i;

    let end = i;

    while (
      end + 1 < tokens.length &&
      tokens[end + 1].type ===
        'vowel' &&
      vowelsJoin(
        tokens[end],
        tokens[end + 1]
      )
    ) {
      end += 1;
    }

    nuclei.push({
      start,
      end,
    });

    i = end + 1;
  }

  if (!nuclei.length) {
    return [tokens];
  }

  const starts = [0];

  for (
    let n = 0;
    n < nuclei.length - 1;
    n += 1
  ) {
    const previousNucleusEnd =
      nuclei[n].end;

    const nextNucleusStart =
      nuclei[n + 1].start;

    const cluster =
      tokens.slice(
        previousNucleusEnd + 1,
        nextNucleusStart
      );

    let nextSyllableStart;

    if (cluster.length === 0) {
      nextSyllableStart =
        nextNucleusStart;
    } else if (
      cluster.length === 1
    ) {
      nextSyllableStart =
        previousNucleusEnd + 1;
    } else if (
      cluster.length === 2
    ) {
      const pair =
        cluster
          .map(
            (token) =>
              token.value
          )
          .join('');

      nextSyllableStart =
        VALID_ONSET_CLUSTERS.has(
          pair
        )
          ? previousNucleusEnd + 1
          : previousNucleusEnd + 2;
    } else {
      const finalPair =
        cluster
          .slice(-2)
          .map(
            (token) =>
              token.value
          )
          .join('');

      nextSyllableStart =
        VALID_ONSET_CLUSTERS.has(
          finalPair
        )
          ? nextNucleusStart - 2
          : nextNucleusStart - 1;
    }

    starts.push(
      nextSyllableStart
    );
  }

  return starts.map(
    (start, index) => {
      const end =
        starts[index + 1] ??
        tokens.length;

      return tokens.slice(
        start,
        end
      );
    }
  );
}

function renderSyllable(
  tokens = []
) {
  const output = [];

  let i = 0;

  while (i < tokens.length) {
    const token = tokens[i];
    const next = tokens[i + 1];

    if (
      token?.type === 'vowel' &&
      next?.type === 'vowel' &&
      vowelsJoin(token, next)
    ) {
      const pair =
        `${token.value}${next.value}`;

      output.push(
        DIPHTHONG_DISPLAY[pair] ||
        `${
          VOWEL_DISPLAY[
            token.value
          ] || token.value
        }${
          VOWEL_DISPLAY[
            next.value
          ] || next.value
        }`
      );

      i += 2;
      continue;
    }

    if (
      token?.type === 'vowel'
    ) {
      output.push(
        VOWEL_DISPLAY[
          token.value
        ] || token.value
      );
    } else {
      output.push(
        token?.value || ''
      );
    }

    i += 1;
  }

  return output.join('');
}

function mechanicallyBuildWordHelper(
  word = ''
) {
  const tokens =
    tokenizePronunciation(word);

  const syllables =
    syllabify(tokens);

  return syllables
    .map(renderSyllable)
    .filter(Boolean)
    .join('-');
}

function buildWordResult(
  word = ''
) {
  const sourceText =
    String(word ?? '').trim();

  const normalizedText =
    normalizeWord(sourceText);

  if (!normalizedText) {
    return {
      language: 'es',
      kind: 'word',
      text: sourceText,
      normalizedText: '',
      display: '',
      helperText: '',
      pronunciation: '',
      status: 'unresolved',
      approved: false,
      reviewRequired: true,
      unresolved: true,
      humanReviewed: false,
      mechanicallyValidated: false,

      validation: {
        valid: false,
        reason: 'empty-word',
      },
    };
  }

  const reviewedHelper =
    REVIEWED_SPANISH_HELPERS[
      normalizedText
    ];

  const display =
    reviewedHelper ||
    mechanicallyBuildWordHelper(
      normalizedText
    );

  const humanReviewed =
    Boolean(reviewedHelper);

  const valid =
    Boolean(display);

  return {
    language: 'es',
    kind: 'word',
    text: sourceText,
    normalizedText,

    display,
    helperText: display,
    pronunciation: display,

    status:
      valid
        ? 'approved'
        : 'unresolved',

    approved: valid,

    reviewRequired:
      valid
        ? !humanReviewed
        : true,

    unresolved: !valid,

    humanReviewed,

    mechanicallyValidated:
      valid &&
      !humanReviewed,

    approvalSource:
      humanReviewed
        ? 'human-reviewed-locked-helper'
        : valid
          ? 'spanish-deterministic-helper-rules'
          : null,

    validation: {
      valid,

      reason:
        valid
          ? null
          : 'helper-not-produced',
    },
  };
}

export function buildPronunciationHelper(
  text = ''
) {
  const sourceText =
    String(text ?? '').trim();

  const normalizedText =
    normalizeText(sourceText);

  if (!normalizedText) {
    return {
      language: 'es',
      kind: 'text',
      text: sourceText,
      normalizedText: '',

      display: '',
      helperText: '',
      pronunciation: '',

      status: 'unresolved',
      approved: false,
      reviewRequired: true,
      unresolved: true,

      humanReviewed: false,
      mechanicallyValidated: false,

      words: [],

      validation: {
        valid: false,
        reason: 'empty-text',
      },
    };
  }

  const words =
    wordsFromText(sourceText)
      .map(buildWordResult);

  const unresolvedWords =
    words.filter(
      (word) =>
        word.unresolved
    );

  const display =
    words
      .map(
        (word) =>
          word.display
      )
      .filter(Boolean)
      .join(' ');

  const valid =
    words.length > 0 &&
    unresolvedWords.length === 0;

  const humanReviewed =
    valid &&
    words.every(
      (word) =>
        word.humanReviewed
    );

  const mechanicallyValidated =
    valid &&
    !humanReviewed;

  return {
    language: 'es',

    kind:
      words.length === 1
        ? 'word'
        : 'phrase',

    text: sourceText,
    normalizedText,

    display,
    helperText: display,
    pronunciation: display,

    status:
      valid
        ? 'approved'
        : 'unresolved',

    approved: valid,

    reviewRequired:
      valid
        ? !humanReviewed
        : true,

    unresolved: !valid,

    humanReviewed,
    mechanicallyValidated,

    approvalSource:
      humanReviewed
        ? 'human-reviewed-locked-helper'
        : valid
          ? 'spanish-deterministic-helper-rules'
          : null,

    words,

    validation: {
      valid,

      reason:
        valid
          ? null
          : 'one-or-more-words-unresolved',

      issues:
        unresolvedWords.map(
          (word) =>
            `${
              word.normalizedText ||
              word.text
            }:helper-not-produced`
        ),
    },
  };
}

function collectUniversal500Words() {
  if (
    !Array.isArray(universal500)
  ) {
    return [];
  }

  return universal500.flatMap(
    (group) =>
      Array.isArray(
        group?.words
      )
        ? group.words
        : []
  );
}

export function runPronunciationHelperAudit({
  presetWords =
    SPANISH_PRESET_WORDS,

  presetPhrases =
    SPANISH_PRESET_PHRASES,

  includeUniversal500 = true,
} = {}) {
  const universalWords =
    includeUniversal500
      ? collectUniversal500Words()
      : [];

  /*
   * Keep the source corpus exactly
   * as supplied.
   *
   * Repeated library/preset entries
   * remain repeated audit items.
   */
  const entries = [
    ...presetWords.map(
      (text) => ({
        corpus: 'preset-word',
        text,
      })
    ),

    ...presetPhrases.map(
      (text) => ({
        corpus: 'preset-phrase',
        text,
      })
    ),

    ...universalWords.map(
      (text) => ({
        corpus: 'universal500',
        text,
      })
    ),
  ];

  const items =
    entries.map(
      (entry) => {
        const result =
          buildPronunciationHelper(
            entry.text
          );

        return {
          corpus:
            entry.corpus,

          text:
            entry.text,

          status:
            result.status,

          approved:
            result.approved,

          reviewRequired:
            result.reviewRequired,

          unresolved:
            result.unresolved,

          humanReviewed:
            result.humanReviewed,

          mechanicallyValidated:
            result.mechanicallyValidated,

          display:
            result.display,

          validation:
            result.validation,

          result,
        };
      }
    );

  const approvedItems =
    items.filter(
      (item) =>
        item.status ===
        'approved'
    );

  const reviewItems =
    items.filter(
      (item) =>
        item.status ===
        'review'
    );

  const unresolvedItems =
    items.filter(
      (item) =>
        item.status ===
        'unresolved'
    );

  const humanReviewedItems =
    items.filter(
      (item) =>
        item.humanReviewed
    );

  const mechanicallyValidatedItems =
    items.filter(
      (item) =>
        item.approved &&
        !item.humanReviewed
    );

  return {
    languageImplemented: true,
    language: 'es',

    items,
    approvedItems,
    reviewItems,
    unresolvedItems,
    humanReviewedItems,
    mechanicallyValidatedItems,

    summary: {
      total:
        items.length,

      approved:
        approvedItems.length,

      review:
        reviewItems.length,

      unresolved:
        unresolvedItems.length,

      humanReviewed:
        humanReviewedItems.length,

      mechanicallyValidated:
        mechanicallyValidatedItems.length,

      presetWords:
        items.filter(
          (item) =>
            item.corpus ===
            'preset-word'
        ).length,

      presetPhrases:
        items.filter(
          (item) =>
            item.corpus ===
            'preset-phrase'
        ).length,

      universal500:
        items.filter(
          (item) =>
            item.corpus ===
            'universal500'
        ).length,
    },
  };
}

export default {
  buildPronunciationHelper,
  runPronunciationHelperAudit,
};
