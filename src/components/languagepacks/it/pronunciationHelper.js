/**
 * SoundMirror pronunciation helper — Italian (it)
 *
 * Visible learner guidance only.
 * - Hyphens separate sound chunks inside a word.
 * - Spaces preserve word boundaries in phrases.
 * - This file does not control animation, frames, timing, or TTS.
 * - PhonemeResolver remains the hidden phoneme and animation authority.
 */

import universal500 from './universal500';

export const ITALIAN_PRESET_WORDS = Object.freeze([
  'Ciao',
  'Salve',
  'Sorridi',
  'Grazie',
  'Scusa',
  'Sì',
  'No',
  'Benvenuto',
  'Addio',
  'Bacio',
]);

export const ITALIAN_PRESET_PHRASES = Object.freeze([
  'Buongiorno',
  'Mi scusi',
  'Buonasera',
  'Come stai',
  'Sto bene',
  'Grazie mille',
  'A presto',
  'Buona notte',
]);

/**
 * Entries explicitly reviewed and accepted by Dan.
 */
export const REVIEWED_ITALIAN_HELPERS = Object.freeze({
  ciao: 'chow',
  salve: 'sahl-veh',
  sorridi: 'sohr-rree-dee',
  grazie: 'grah-tsee-yeh',
  scusa: 'skoo-zah',
  sì: 'see',
  no: 'noh',
  benvenuto: 'behn-veh-noo-toh',
  addio: 'ahd-dee-oh',
  bacio: 'bah-choh',

  buongiorno: 'bwohn-johr-noh',
  mi: 'mee',
  scusi: 'skoo-zee',
  buonasera: 'bwoh-nah-seh-rah',
  come: 'koh-meh',
  stai: 'stah-ee',
  sto: 'stoh',
  bene: 'beh-neh',
  mille: 'meel-leh',
  presto: 'prehs-toh',
});

/**
 * Necessary teaching exceptions that were not part of the
 * explicit review batch.
 */
const ITALIAN_RULE_OVERRIDES = Object.freeze({
  a: 'ah',
  io: 'ee-oh',
  più: 'pyoo',
  giù: 'joo',
  già: 'jah',
  lì: 'lee',
  perché: 'pehr-keh',
  allesterno: 'ahl-lehs-tehr-noh',
});

const BASE_VOWEL = Object.freeze({
  à: 'a',
  è: 'e',
  é: 'e',
  ì: 'i',
  ò: 'o',
  ù: 'u',
});

const VOWEL_DISPLAY = Object.freeze({
  a: 'ah',
  e: 'eh',
  i: 'ee',
  o: 'oh',
  u: 'oo',
});

const VOWEL_PAIR_DISPLAY = Object.freeze({
  ia: 'yah',
  ie: 'yeh',
  io: 'yoh',
  iu: 'yoo',

  ua: 'wah',
  ue: 'weh',
  ui: 'wee',
  uo: 'woh',

  ai: 'ah-ee',
  ei: 'eh-ee',
  oi: 'oh-ee',
  au: 'ah-oo',

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
  'vr',
  'sk',
  'sp',
  'st',
]);

function normalizeWord(value = '') {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFC')
    .replace(/[’']/g, '')
    .replace(/[^a-zàèéìòù]/g, '');
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
  };
}

function vowel(value) {
  return {
    value,
    type: 'vowel',
  };
}

function baseVowel(value = '') {
  return BASE_VOWEL[value] || value;
}

function isVowelCharacter(value = '') {
  return 'aeiouàèéìòù'.includes(value);
}

function isVoicedConsonant(value = '') {
  return [
    'b',
    'd',
    'g',
    'l',
    'm',
    'n',
    'r',
    'v',
  ].includes(value);
}

function tokenizePronunciation(word = '') {
  const text = normalizeWord(word);
  const tokens = [];

  let index = 0;

  const pushConsonant = (value) => {
    tokens.push(consonant(value));
  };

  const pushVowel = (value) => {
    tokens.push(
      vowel(baseVowel(value))
    );
  };

  while (index < text.length) {
    const current = text[index];
    const next = text[index + 1] || '';

    const pair = text.slice(
      index,
      index + 2
    );

    const triple = text.slice(
      index,
      index + 3
    );

    const four = text.slice(
      index,
      index + 4
    );

    /*
     * scia / scio / sciu
     */
    if (
      four.startsWith('sci') &&
      ['a', 'o', 'u'].includes(
        text[index + 3] || ''
      )
    ) {
      pushConsonant('sh');
      pushVowel(text[index + 3]);

      index += 4;
      continue;
    }

    if (triple === 'sce') {
      pushConsonant('sh');
      pushVowel('e');

      index += 3;
      continue;
    }

    if (triple === 'sci') {
      pushConsonant('sh');
      pushVowel('i');

      index += 3;
      continue;
    }

    /*
     * cia / cio / ciu
     */
    if (
      [
        'cia',
        'cio',
        'ciu',
      ].includes(triple)
    ) {
      pushConsonant('ch');
      pushVowel(triple[2]);

      index += 3;
      continue;
    }

    /*
     * gia / gio / giu
     */
    if (
      [
        'gia',
        'gio',
        'giu',
      ].includes(triple)
    ) {
      pushConsonant('j');
      pushVowel(triple[2]);

      index += 3;
      continue;
    }

    /*
     * Italian gli.
     */
    if (
      triple === 'gli' &&
      (
        !text[index + 3] ||
        isVowelCharacter(
          text[index + 3]
        )
      )
    ) {
      pushConsonant('ly');

      index += 3;
      continue;
    }

    /*
     * Italian gn.
     */
    if (pair === 'gn') {
      pushConsonant('ny');

      index += 2;
      continue;
    }

    /*
     * Hard c before e/i.
     */
    if (
      [
        'che',
        'chi',
      ].includes(triple)
    ) {
      pushConsonant('k');

      index += 2;
      continue;
    }

    /*
     * Hard g before e/i.
     */
    if (
      [
        'ghe',
        'ghi',
      ].includes(triple)
    ) {
      pushConsonant('g');

      index += 2;
      continue;
    }

    /*
     * qu = kw.
     */
    if (pair === 'qu') {
      pushConsonant('k');
      pushConsonant('w');

      index += 2;
      continue;
    }

    /*
     * buon / buona family.
     */
    if (triple === 'buo') {
      pushConsonant('b');
      pushConsonant('w');
      pushVowel('o');

      index += 3;
      continue;
    }

    /*
     * sc before a back vowel = sk.
     * sc before e/i = sh.
     */
    if (pair === 'sc') {
      if (
        [
          'e',
          'i',
          'è',
          'é',
          'ì',
        ].includes(next)
      ) {
        pushConsonant('sh');
      } else {
        pushConsonant('s');
        pushConsonant('k');
      }

      index += 2;
      continue;
    }

    /*
     * Doubled consonants remain visible.
     */
    if (
      pair.length === 2 &&
      pair[0] === pair[1] &&
      !isVowelCharacter(pair[0])
    ) {
      const doubled = pair[0];

      const after =
        text[index + 2] || '';

      if (doubled === 'r') {
        pushConsonant('r');
        pushConsonant('r');

        index += 2;
        continue;
      }

      if (doubled === 'z') {
        pushConsonant('ts');
        pushConsonant('ts');

        index += 2;
        continue;
      }

      if (doubled === 'c') {
        const sound =
          [
            'e',
            'i',
            'è',
            'é',
            'ì',
          ].includes(after)
            ? 'ch'
            : 'k';

        pushConsonant(sound);
        pushConsonant(sound);

        index += 2;
        continue;
      }

      if (doubled === 'g') {
        const sound =
          [
            'e',
            'i',
            'è',
            'é',
            'ì',
          ].includes(after)
            ? 'j'
            : 'g';

        pushConsonant(sound);
        pushConsonant(sound);

        index += 2;
        continue;
      }

      const sound =
        doubled === 'h'
          ? ''
          : doubled === 'q'
            ? 'k'
            : doubled === 'y'
              ? 'i'
              : doubled;

      if (sound) {
        pushConsonant(sound);
        pushConsonant(sound);
      }

      index += 2;
      continue;
    }

    if (current === 'c') {
      pushConsonant(
        [
          'e',
          'i',
          'è',
          'é',
          'ì',
        ].includes(next)
          ? 'ch'
          : 'k'
      );

      index += 1;
      continue;
    }

    if (current === 'g') {
      pushConsonant(
        [
          'e',
          'i',
          'è',
          'é',
          'ì',
        ].includes(next)
          ? 'j'
          : 'g'
      );

      index += 1;
      continue;
    }

    /*
     * S between vowels or before a voiced
     * consonant is shown as z.
     */
    if (current === 's') {
      const previous =
        text[index - 1] || '';

      const voiced =
        (
          isVowelCharacter(previous) &&
          isVowelCharacter(next)
        ) ||
        isVoicedConsonant(next);

      pushConsonant(
        voiced ? 'z' : 's'
      );

      index += 1;
      continue;
    }

    /*
     * Pack teaching baseline for z.
     */
    if (current === 'z') {
      pushConsonant('ts');

      index += 1;
      continue;
    }

    /*
     * Silent h.
     */
    if (current === 'h') {
      index += 1;
      continue;
    }

    if (current === 'x') {
      pushConsonant('k');
      pushConsonant('s');

      index += 1;
      continue;
    }

    if (current === 'q') {
      pushConsonant('k');

      index += 1;
      continue;
    }

    if (current === 'y') {
      pushVowel('i');

      index += 1;
      continue;
    }

    if (
      isVowelCharacter(current)
    ) {
      pushVowel(current);

      index += 1;
      continue;
    }

    if (
      'bdfklmnprtvwj'.includes(
        current
      )
    ) {
      pushConsonant(current);

      index += 1;
      continue;
    }

    index += 1;
  }

  return tokens;
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

  return (
    ['i', 'u'].includes(
      left.value
    ) ||
    ['i', 'u'].includes(
      right.value
    )
  );
}

function syllabify(tokens = []) {
  if (!tokens.length) {
    return [];
  }

  const nuclei = [];
  let index = 0;

  while (index < tokens.length) {
    if (
      tokens[index].type !==
      'vowel'
    ) {
      index += 1;
      continue;
    }

    const start = index;
    let end = index;

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

    index = end + 1;
  }

  if (!nuclei.length) {
    return [tokens];
  }

  const starts = [0];

  for (
    let nucleusIndex = 0;
    nucleusIndex <
      nuclei.length - 1;
    nucleusIndex += 1
  ) {
    const previousNucleusEnd =
      nuclei[nucleusIndex].end;

    const nextNucleusStart =
      nuclei[nucleusIndex + 1]
        .start;

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
      const clusterPair =
        cluster
          .map(
            (token) =>
              token.value
          )
          .join('');

      nextSyllableStart =
        VALID_ONSET_CLUSTERS.has(
          clusterPair
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
    (start, syllableIndex) => {
      const end =
        starts[
          syllableIndex + 1
        ] ?? tokens.length;

      return tokens.slice(
        start,
        end
      );
    }
  );
}

function consonantDisplay(
  value = ''
) {
  return {
    ch: 'ch',
    j: 'j',
    sh: 'sh',
    ny: 'ny',
    ly: 'ly',
    ts: 'ts',
  }[value] || value;
}

function renderSyllable(
  tokens = []
) {
  const output = [];
  let index = 0;

  while (index < tokens.length) {
    const token = tokens[index];

    const next =
      tokens[index + 1];

    if (
      token?.type === 'vowel' &&
      next?.type === 'vowel' &&
      vowelsJoin(token, next)
    ) {
      const pair =
        `${token.value}${next.value}`;

      output.push(
        VOWEL_PAIR_DISPLAY[pair] ||
        `${
          VOWEL_DISPLAY[
            token.value
          ] || token.value
        }-${
          VOWEL_DISPLAY[
            next.value
          ] || next.value
        }`
      );

      index += 2;
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
        consonantDisplay(
          token?.value || ''
        )
      );
    }

    index += 1;
  }

  return output.join('');
}

function mechanicallyBuildWordHelper(
  word = ''
) {
  const normalized =
    normalizeWord(word);

  if (
    ITALIAN_RULE_OVERRIDES[
      normalized
    ]
  ) {
    return ITALIAN_RULE_OVERRIDES[
      normalized
    ];
  }

  const tokens =
    tokenizePronunciation(
      normalized
    );

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
      language: 'it',
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
    REVIEWED_ITALIAN_HELPERS[
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
    language: 'it',
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
          ? 'italian-deterministic-helper-rules'
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
      language: 'it',
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

  return {
    language: 'it',

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

    mechanicallyValidated:
      valid &&
      !humanReviewed,

    approvalSource:
      humanReviewed
        ? 'human-reviewed-locked-helper'
        : valid
          ? 'italian-deterministic-helper-rules'
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
      Array.isArray(group?.words)
        ? group.words
        : []
  );
}

export function runPronunciationHelperAudit({
  presetWords =
    ITALIAN_PRESET_WORDS,

  presetPhrases =
    ITALIAN_PRESET_PHRASES,

  includeUniversal500 = true,
} = {}) {
  const universalWords =
    includeUniversal500
      ? collectUniversal500Words()
      : [];

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
    language: 'it',

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