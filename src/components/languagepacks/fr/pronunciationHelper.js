/**
 * SoundMirror pronunciation helper — French (fr)
 *
 * Visible learner guidance only.
 * - Hyphens separate sound chunks inside a word.
 * - Spaces preserve word boundaries in phrases.
 * - This file does not control animation, frames, timing, or TTS.
 * - PhonemeResolver remains the hidden phoneme/animation authority.
 */

import universal500 from './universal500';

export const FRENCH_PRESET_WORDS = Object.freeze([
  'Salut',
  'Souris',
  'Merci',
  'Pardon',
  'Oui',
  'Non',
  'Bonsoir',
  'Baiser',
  'Bienvenue',
]);

export const FRENCH_PRESET_PHRASES = Object.freeze([
  'Bonjour',
  'Au revoir',
  'Excusez-moi',
  'Comment ça va ?',
  'Je vais bien.',
  'Merci beaucoup.',
  'À bientôt',
  'Bonne nuit',
]);

/**
 * Explicitly reviewed and accepted helpers.
 */
export const REVIEWED_FRENCH_HELPERS = Object.freeze({
  bonjour: 'bohn-zhoor',
  salut: 'sah-loo',
  souris: 'soo-ree',
  merci: 'mehr-see',
  pardon: 'pahr-dohn',
  oui: 'wee',
  non: 'nohn',
  bienvenue: 'byehn-veh-noo',
  baiser: 'beh-zay',
  bonsoir: 'bohn-swahr',

  comment: 'koh-mahn',
  ça: 'sah',
  va: 'vah',
  je: 'zhuh',
  vais: 'veh',
  bien: 'byehn',
  beaucoup: 'boh-koo',
});

export const REVIEWED_FRENCH_PHRASES = Object.freeze({
  'au revoir': 'oh ruh-vwahr',
  'excusez moi': 'ehk-skew-zay mwah',
  'bonne nuit': 'bun nwee',
});

/**
 * Useful teaching exceptions for common French words.
 * These are deterministic language rules, not marked as human-reviewed.
 */
const FRENCH_RULE_OVERRIDES = Object.freeze({
  à: 'ah',
  au: 'oh',
  aux: 'oh',
  eau: 'oh',

  de: 'duh',
  des: 'day',
  du: 'doo',
  le: 'luh',
  les: 'lay',
  ce: 'suh',
  se: 'suh',
  me: 'muh',
  te: 'tuh',
  ne: 'nuh',
  que: 'kuh',

  et: 'ay',
  est: 'eh',
  un: 'uhn',
  une: 'oon',

  revoir: 'ruh-vwahr',
  excusez: 'ehk-skew-zay',
  moi: 'mwah',

  bonne: 'bun',
  nuit: 'nwee',

  bientôt: 'byehn-toh',
  'aujourd’hui': 'oh-zhoor-dwee',
  aujourdhui: 'oh-zhoor-dwee',

  huit: 'weet',
  six: 'sees',
  dix: 'dees',
  sept: 'seht',
  fils: 'fees',

  plus: 'ploo',
  très: 'treh',
  faux: 'foh',
  voix: 'vwah',
  fois: 'fwah',
  trois: 'trwah',
  froid: 'frwah',

  œil: 'uh-y',
  cœur: 'kuhr',
  sœur: 'suhr',

  femme: 'fahm',
  homme: 'uhm',

  blanc: 'blahn',
  temps: 'tahn',
  corps: 'kohr',
  prix: 'pree',

  monsieur: 'muh-syuh',
});

const SIMPLE_VOWEL_DISPLAY = Object.freeze({
  a: 'ah',
  à: 'ah',
  â: 'ah',

  e: 'eh',
  è: 'eh',
  ê: 'eh',
  ë: 'eh',

  é: 'ay',

  i: 'ee',
  î: 'ee',
  ï: 'ee',
  y: 'ee',

  o: 'oh',
  ô: 'oh',

  u: 'oo',
  ù: 'oo',
  û: 'oo',
  ü: 'oo',

  œ: 'uh',
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

  'sh',
  'zh',
  'ny',
]);

function normalizeWord(value = '') {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFC')
    .replace(/[’']/g, '')
    .replace(/[^a-zàâçéèêëîïôùûüÿœ]/g, '');
}

function tokenizeSurfaceWords(value = '') {
  return String(value ?? '')
    .trim()
    .replace(/[’']/g, ' ')
    .replace(/-/g, ' ')
    .split(/\s+/)
    .map(normalizeWord)
    .filter(Boolean);
}

function normalizeText(value = '') {
  return tokenizeSurfaceWords(value)
    .join(' ');
}

function consonant(value) {
  return {
    type: 'consonant',
    value,
    display: value,
  };
}

function vowel(
  value,
  display
) {
  return {
    type: 'vowel',
    value,
    display,
  };
}

function isFrenchVowelCharacter(
  value = ''
) {
  return [
    'a',
    'à',
    'â',

    'e',
    'é',
    'è',
    'ê',
    'ë',

    'i',
    'î',
    'ï',
    'y',

    'o',
    'ô',

    'u',
    'ù',
    'û',
    'ü',

    'œ',
  ].includes(value);
}

function isFrenchLetter(
  value = ''
) {
  return /[a-zàâçéèêëîïôùûüÿœ]/i.test(
    value
  );
}

function isNasalBlocked(
  nextCharacter = ''
) {
  return (
    isFrenchVowelCharacter(
      nextCharacter
    ) ||
    nextCharacter === 'n' ||
    nextCharacter === 'm'
  );
}

function isFinalSilentConsonant(
  text,
  index
) {
  const current =
    text[index];

  if (
    index !==
    text.length - 1
  ) {
    return false;
  }

  return [
    'd',
    'g',
    'p',
    's',
    't',
    'x',
    'z',
  ].includes(current);
}

function displayForPlainE(
  text,
  index
) {
  const next =
    text[index + 1] || '';

  const afterNext =
    text[index + 2] || '';

  if (!next) {
    return '';
  }

  /*
   * Open unstressed e before consonant + vowel
   * generally reads more clearly as French schwa.
   *
   * Examples:
   * petit → puh-tee
   * venir → vuh-neer
   */
  if (
    isFrenchLetter(next) &&
    !isFrenchVowelCharacter(next) &&
    isFrenchVowelCharacter(
      afterNext
    )
  ) {
    return 'uh';
  }

  return 'eh';
}

function tokenizePronunciation(
  word = ''
) {
  const text =
    normalizeWord(word);

  const tokens = [];

  let index = 0;

  const pushConsonant = (
    value,
    display = value
  ) => {
    tokens.push({
      ...consonant(value),
      display,
    });
  };

  const pushVowel = (
    value,
    display
  ) => {
    tokens.push(
      vowel(
        value,
        display
      )
    );
  };

  while (
    index < text.length
  ) {
    const current =
      text[index];

    const next =
      text[index + 1] || '';

    const pair =
      text.slice(
        index,
        index + 2
      );

    const triple =
      text.slice(
        index,
        index + 3
      );

    const four =
      text.slice(
        index,
        index + 4
      );

    /*
     * French -eaux / eau / au.
     */
    if (four === 'eaux') {
      pushVowel(
        'o',
        'oh'
      );

      index += 4;
      continue;
    }

    if (triple === 'eau') {
      pushVowel(
        'o',
        'oh'
      );

      index += 3;
      continue;
    }

    if (pair === 'au') {
      pushVowel(
        'o',
        'oh'
      );

      index += 2;
      continue;
    }

    /*
     * -er and -ez at the end generally sound like é.
     */
    if (
      (
        pair === 'er' ||
        pair === 'ez'
      ) &&
      index + 2 ===
        text.length
    ) {
      pushVowel(
        'é',
        'ay'
      );

      index += 2;
      continue;
    }

    /*
     * Common -ais / -ait / -aient family.
     */
    if (
      text.startsWith(
        'aient',
        index
      ) &&
      index + 5 ===
        text.length
    ) {
      pushVowel(
        'è',
        'eh'
      );

      index += 5;
      continue;
    }

    if (
      (
        triple === 'ais' ||
        triple === 'ait'
      ) &&
      index + 3 ===
        text.length
    ) {
      pushVowel(
        'è',
        'eh'
      );

      index += 3;
      continue;
    }

    /*
     * -tion.
     */
    if (
      text.startsWith(
        'tion',
        index
      )
    ) {
      pushConsonant(
        's',
        's'
      );

      pushConsonant(
        'y',
        'y'
      );

      pushVowel(
        'on',
        'ohn'
      );

      index += 4;
      continue;
    }

    /*
     * oin = nasal "wahn".
     */
    if (
      triple === 'oin'
    ) {
      pushVowel(
        'oin',
        'wahn'
      );

      index += 3;
      continue;
    }

    /*
     * ien commonly reads like "yehn".
     */
    if (
      triple === 'ien'
    ) {
      pushVowel(
        'ien',
        'yehn'
      );

      index += 3;
      continue;
    }

    /*
     * Nasal vowel families.
     */
    const nasalInPatterns = [
      'ain',
      'ein',
    ];

    const matchedTripleIn =
      nasalInPatterns.find(
        (pattern) =>
          text.startsWith(
            pattern,
            index
          )
      );

    if (
      matchedTripleIn &&
      !isNasalBlocked(
        text[
          index +
          matchedTripleIn.length
        ] || ''
      )
    ) {
      pushVowel(
        'in',
        'ehn'
      );

      index +=
        matchedTripleIn.length;

      continue;
    }

    if (
      [
        'in',
        'im',
        'yn',
        'ym',
      ].includes(pair) &&
      !isNasalBlocked(
        text[index + 2] || ''
      )
    ) {
      pushVowel(
        'in',
        'ehn'
      );

      index += 2;
      continue;
    }

    if (
      [
        'an',
        'am',
        'en',
        'em',
      ].includes(pair) &&
      !isNasalBlocked(
        text[index + 2] || ''
      )
    ) {
      pushVowel(
        'an',
        'ahn'
      );

      index += 2;
      continue;
    }

    if (
      [
        'on',
        'om',
      ].includes(pair) &&
      !isNasalBlocked(
        text[index + 2] || ''
      )
    ) {
      pushVowel(
        'on',
        'ohn'
      );

      index += 2;
      continue;
    }

    if (
      [
        'un',
        'um',
      ].includes(pair) &&
      !isNasalBlocked(
        text[index + 2] || ''
      )
    ) {
      pushVowel(
        'un',
        'uhn'
      );

      index += 2;
      continue;
    }

    /*
     * French vowel combinations.
     */
    if (pair === 'oi') {
      pushVowel(
        'oi',
        'wah'
      );

      index += 2;
      continue;
    }

    if (pair === 'ou') {
      pushVowel(
        'ou',
        'oo'
      );

      index += 2;
      continue;
    }

    if (pair === 'ui') {
      pushVowel(
        'ui',
        'wee'
      );

      index += 2;
      continue;
    }

    if (
      pair === 'eu' ||
      pair === 'œu'
    ) {
      pushVowel(
        'eu',
        'uh'
      );

      index += 2;
      continue;
    }

    if (
      pair === 'ai' ||
      pair === 'ei'
    ) {
      pushVowel(
        'è',
        'eh'
      );

      index += 2;
      continue;
    }

    /*
     * gn = ny.
     */
    if (pair === 'gn') {
      pushConsonant(
        'ny',
        'ny'
      );

      index += 2;
      continue;
    }

    /*
     * ill after a vowel often produces a y-like glide.
     */
    if (
      triple === 'ill' &&
      index > 0 &&
      isFrenchVowelCharacter(
        text[index - 1]
      )
    ) {
      pushConsonant(
        'y',
        'y'
      );

      index += 3;
      continue;
    }

    if (pair === 'ch') {
      pushConsonant(
        'sh',
        'sh'
      );

      index += 2;
      continue;
    }

    if (pair === 'ph') {
      pushConsonant(
        'f',
        'f'
      );

      index += 2;
      continue;
    }

    if (pair === 'th') {
      pushConsonant(
        't',
        't'
      );

      index += 2;
      continue;
    }

    if (pair === 'qu') {
      pushConsonant(
        'k',
        'k'
      );

      index += 2;
      continue;
    }

    if (current === 'ç') {
      pushConsonant(
        's',
        's'
      );

      index += 1;
      continue;
    }

    if (current === 'c') {
      pushConsonant(
        [
          'e',
          'é',
          'è',
          'ê',
          'ë',
          'i',
          'î',
          'ï',
          'y',
        ].includes(next)
          ? 's'
          : 'k'
      );

      index += 1;
      continue;
    }

    if (current === 'g') {
      if (
        [
          'e',
          'é',
          'è',
          'ê',
          'ë',
          'i',
          'î',
          'ï',
          'y',
        ].includes(next)
      ) {
        pushConsonant(
          'zh',
          'zh'
        );
      } else {
        pushConsonant(
          'g',
          'g'
        );
      }

      index += 1;
      continue;
    }

    /*
     * French h is silent for visible helper purposes.
     */
    if (current === 'h') {
      index += 1;
      continue;
    }

    if (current === 'j') {
      pushConsonant(
        'zh',
        'zh'
      );

      index += 1;
      continue;
    }

    /*
     * Double s stays s.
     * Single s between vowels becomes z.
     */
    if (pair === 'ss') {
      pushConsonant(
        's',
        's'
      );

      index += 2;
      continue;
    }

    if (current === 's') {
      if (
        index ===
        text.length - 1
      ) {
        index += 1;
        continue;
      }

      const previous =
        text[index - 1] || '';

      if (
        isFrenchVowelCharacter(
          previous
        ) &&
        isFrenchVowelCharacter(
          next
        )
      ) {
        pushConsonant(
          'z',
          'z'
        );
      } else {
        pushConsonant(
          's',
          's'
        );
      }

      index += 1;
      continue;
    }

    /*
     * Final consonants commonly silent in French.
     */
    if (
      isFinalSilentConsonant(
        text,
        index
      )
    ) {
      index += 1;
      continue;
    }

    /*
     * x elsewhere = ks.
     */
    if (current === 'x') {
      pushConsonant(
        'k',
        'k'
      );

      pushConsonant(
        's',
        's'
      );

      index += 1;
      continue;
    }

    if (current === 'z') {
      pushConsonant(
        'z',
        'z'
      );

      index += 1;
      continue;
    }

    /*
     * Final e is normally silent.
     */
    if (
      current === 'e' &&
      index ===
        text.length - 1
    ) {
      index += 1;
      continue;
    }

    if (current === 'e') {
      const display =
        displayForPlainE(
          text,
          index
        );

      if (display) {
        pushVowel(
          'e',
          display
        );
      }

      index += 1;
      continue;
    }

    if (
      isFrenchVowelCharacter(
        current
      )
    ) {
      pushVowel(
        current,
        SIMPLE_VOWEL_DISPLAY[
          current
        ] || current
      );

      index += 1;
      continue;
    }

    /*
     * Collapse doubled consonants for visible guidance.
     */
    if (
      current === next &&
      !isFrenchVowelCharacter(
        current
      )
    ) {
      pushConsonant(
        current,
        current
      );

      index += 2;
      continue;
    }

    if (
      isFrenchLetter(
        current
      )
    ) {
      pushConsonant(
        current,
        current
      );

      index += 1;
      continue;
    }

    index += 1;
  }

  return tokens;
}

function syllabify(
  tokens = []
) {
  if (!tokens.length) {
    return [];
  }

  const nuclei = [];

  tokens.forEach(
    (token, index) => {
      if (
        token.type ===
        'vowel'
      ) {
        nuclei.push(index);
      }
    }
  );

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
    const previousNucleus =
      nuclei[nucleusIndex];

    const nextNucleus =
      nuclei[
        nucleusIndex + 1
      ];

    const cluster =
      tokens.slice(
        previousNucleus + 1,
        nextNucleus
      );

    let nextStart;

    if (
      cluster.length === 0
    ) {
      nextStart =
        nextNucleus;
    } else if (
      cluster.length === 1
    ) {
      nextStart =
        previousNucleus + 1;
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

      nextStart =
        VALID_ONSET_CLUSTERS.has(
          pair
        )
          ? previousNucleus + 1
          : previousNucleus + 2;
    } else {
      const finalPair =
        cluster
          .slice(-2)
          .map(
            (token) =>
              token.value
          )
          .join('');

      nextStart =
        VALID_ONSET_CLUSTERS.has(
          finalPair
        )
          ? nextNucleus - 2
          : nextNucleus - 1;
    }

    starts.push(
      nextStart
    );
  }

  return starts.map(
    (
      start,
      syllableIndex
    ) => {
      const end =
        starts[
          syllableIndex + 1
        ] ??
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
  return tokens
    .map(
      (token) =>
        token.display ||
        token.value ||
        ''
    )
    .join('');
}

function mechanicallyBuildWordHelper(
  word = ''
) {
  const normalized =
    normalizeWord(word);

  if (!normalized) {
    return '';
  }

  if (
    FRENCH_RULE_OVERRIDES[
      normalized
    ]
  ) {
    return FRENCH_RULE_OVERRIDES[
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
      language: 'fr',
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
    REVIEWED_FRENCH_HELPERS[
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
    language: 'fr',
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
          ? 'french-deterministic-helper-rules'
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
      language: 'fr',
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
    tokenizeSurfaceWords(
      sourceText
    ).map(
      buildWordResult
    );

  const unresolvedWords =
    words.filter(
      (word) =>
        word.unresolved
    );

  const phraseOverride =
    REVIEWED_FRENCH_PHRASES[
      normalizedText
    ];

  const generatedDisplay =
    words
      .map(
        (word) =>
          word.display
      )
      .filter(Boolean)
      .join(' ');

  const display =
    phraseOverride ||
    generatedDisplay;

  const valid =
    words.length > 0 &&
    unresolvedWords.length === 0 &&
    Boolean(display);

  const humanReviewed =
    valid &&
    (
      Boolean(
        phraseOverride
      ) ||
      words.every(
        (word) =>
          word.humanReviewed
      )
    );

  return {
    language: 'fr',

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
          ? 'french-deterministic-helper-rules'
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
    !Array.isArray(
      universal500
    )
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
    FRENCH_PRESET_WORDS,

  presetPhrases =
    FRENCH_PRESET_PHRASES,

  includeUniversal500 = true,
} = {}) {
  const universalWords =
    includeUniversal500
      ? collectUniversal500Words()
      : [];

  const entries = [
    ...presetWords.map(
      (text) => ({
        corpus:
          'preset-word',
        text,
      })
    ),

    ...presetPhrases.map(
      (text) => ({
        corpus:
          'preset-phrase',
        text,
      })
    ),

    ...universalWords.map(
      (text) => ({
        corpus:
          'universal500',
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
    language: 'fr',

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