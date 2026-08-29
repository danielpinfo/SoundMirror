/** SoundMirror pronunciation helper — Portuguese (pt-BR) */

import universal500 from './universal500';

/*
 * These lists match the current Portuguese practice presets.
 * They are audit inputs only; pronunciation truth remains in the
 * reviewed helper dictionaries and deterministic helper rules below.
 */
export const PORTUGUESE_PRESET_WORDS = Object.freeze([
  'Olá',
  'Oi',
  'Sorria',
  'Obrigado',
  'Desculpa',
  'Sim',
  'Não',
  'Bem vindo',
  'Adeus',
  'Beijo',
]);

export const PORTUGUESE_PRESET_PHRASES = Object.freeze([
  'Bom dia',
  'Com licença',
  'Boa noite',
  'Como vai',
  'Estou bem',
  'Muito obrigado',
  'Até logo',
  'Até amanhã',
]);

/*
 * Human-reviewed learner helpers.
 *
 * These are visible teaching forms, not IPA and not spelling guides.
 * Hyphens separate sound chunks within a word.
 * Spaces separate words.
 */
export const REVIEWED_PORTUGUESE_HELPERS = Object.freeze({
  olá: 'oh-lah',
  sim: 'seeng',
  não: 'now',

  água: 'ah-gwah',
  comida: 'koh-mee-dah',
  bom: 'bohng',
  ajuda: 'ah-zhoo-dah',
  bonito: 'boh-nee-too',
  prática: 'prah-chee-kah',
  excelente: 'eh-seh-lehn-chee',
  desculpe: 'jees-kool-pee',

  obrigado: 'oh-bree-gah-doh',

  muito: 'm-ooy-toh',

  prazer: 'prah-zehr',
  conhecer: 'koh-nyeh-sehr',
});

export const REVIEWED_PORTUGUESE_PHRASES = Object.freeze({
  'por favor': 'pohr fah-vohr',

  'bom dia':
    'bohng jee-ah',

  'estou bem':
    'ees-toh behng',

  'como você está':
    'koh-moo voh-seh ees-tah',

  'prazer em conhecer você':
    'prah-zehr eeng koh-nyeh-sehr voh-seh',

  'até mais':
    'ah-teh mah-ees',

  'boa noite':
    'boh-ah noy-chee',

  'muito obrigado':
    'm-ooy-toh oh-bree-gah-doh',
});

/*
 * Deterministic word-level corrections.
 *
 * These handle frequent Portuguese forms whose pronunciation is clearer
 * for learners when written explicitly rather than generated mechanically.
 */
const RULE_OVERRIDES = Object.freeze({
  em: 'eeng',
  bem: 'behng',

  dia: 'jee-ah',
  boa: 'boh-ah',
  noite: 'noy-chee',

  como: 'koh-moo',
  você: 'voh-seh',
  está: 'ees-tah',
  estou: 'ees-toh',

  até: 'ah-teh',
  mais: 'mah-ees',

  que: 'kee',
  quê: 'keh',

  mãe: 'myng',
  manhã: 'mah-nyah',
  mão: 'mow',

  coração: 'koh-rah-sow',
  razão: 'hah-zow',
  ação: 'ah-sow',

  chão: 'show',
  pão: 'pow',

  muito: 'm-ooy-toh',
  muitos: 'm-ooy-tohs',

  oito: 'oy-too',
  dois: 'doys',
  seis: 'says',
  dez: 'dehs',

  hoje: 'oh-zhee',
  homem: 'oh-meing',
  jovem: 'zhoh-veing',

  também: 'tahm-behng',
  alguém: 'ahl-geing',
  ninguém: 'neeng-geing',
  quem: 'keing',
  sem: 'seing',
  tem: 'teing',
  trem: 'treing',

  fim: 'feeng',
  jardim: 'zhar-jeeng',
  ruim: 'hoo-eeng',

  algum: 'ahl-goong',
  um: 'oong',
  com: 'kohng',
  som: 'sohng',

  baixo: 'bye-shoo',
  caixa: 'kye-shah',
  deixar: 'day-shahr',

  exemplo: 'eh-zehm-ploo',
  existir: 'eh-zees-cheer',

  mesmo: 'mez-moo',
  desde: 'dehz-jee',
  desligado: 'dehz-lee-gah-doh',

  nascer: 'nah-sehr',
  crescer: 'kreh-sehr',

  língua: 'leen-gwah',

  papel: 'pah-pew',
});

const BASE = {
  á: 'a',
  à: 'a',
  â: 'a',
  ã: 'a',

  é: 'e',
  ê: 'e',

  í: 'i',

  ó: 'o',
  ô: 'o',
  õ: 'o',

  ú: 'u',
};

const VOWEL = {
  a: 'ah',
  á: 'ah',
  à: 'ah',
  â: 'ah',
  ã: 'ah',

  e: 'eh',
  é: 'eh',
  ê: 'eh',

  i: 'ee',
  í: 'ee',

  o: 'oh',
  ó: 'oh',
  ô: 'oh',
  õ: 'oh',

  u: 'oo',
  ú: 'oo',
};

const ONSETS = new Set([
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
  'kw',
]);

function normalizeWord(value = '') {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFC')
    .replace(/[’']/g, '')
    .replace(
      /[^a-záàâãéêíóôõúç]/g,
      ''
    );
}

function surfaceWords(value = '') {
  return String(value ?? '')
    .trim()
    .replace(/[’']/g, ' ')
    .replace(/-/g, ' ')
    .split(/\s+/)
    .map(normalizeWord)
    .filter(Boolean);
}

function normalizeText(value = '') {
  return surfaceWords(value)
    .join(' ');
}

function isVowel(ch = '') {
  return 'aeiouáàâãéêíóôõú'
    .includes(ch);
}

function isFrontVowel(ch = '') {
  return [
    'e',
    'é',
    'ê',
    'i',
    'í',
  ].includes(ch);
}

function isVoicedConsonantLetter(ch = '') {
  return [
    'b',
    'd',
    'g',
    'j',
    'l',
    'm',
    'n',
    'r',
    'v',
    'z',
  ].includes(ch);
}

function base(ch = '') {
  return BASE[ch] || ch;
}

function C(
  value,
  display = value
) {
  return {
    type: 'consonant',
    value,
    display,
  };
}

function V(
  value,
  display
) {
  return {
    type: 'vowel',
    value,
    display,
  };
}

function nasal(vowel) {
  return (
    {
      a: 'ahng',
      e: 'ehng',
      i: 'eeng',
      o: 'ohng',
      u: 'oong',
    }[vowel] || ''
  );
}

function tokenize(word = '') {
  const text =
    normalizeWord(word);

  const output = [];

  let index = 0;

  const pushConsonant = (
    value,
    display = value
  ) => {
    output.push(
      C(value, display)
    );
  };

  const pushVowel = (
    value,
    display
  ) => {
    output.push(
      V(value, display)
    );
  };

  while (
    index < text.length
  ) {
    const current =
      text[index];

    const next =
      text[index + 1] || '';

    const next2 =
      text[index + 2] || '';

    const previous =
      text[index - 1] || '';

    const pair =
      text.slice(
        index,
        index + 2
      );

    /*
     * Portuguese digraphs.
     */

    if (pair === 'nh') {
      pushConsonant(
        'ny',
        'ny'
      );

      index += 2;
      continue;
    }

    if (pair === 'lh') {
      pushConsonant(
        'ly',
        'ly'
      );

      index += 2;
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

    if (pair === 'rr') {
      pushConsonant(
        'h',
        'h'
      );

      index += 2;
      continue;
    }

    if (pair === 'ss') {
      pushConsonant(
        's',
        's'
      );

      index += 2;
      continue;
    }

    /*
     * SC before E/I is one S-family articulation.
     *
     * nascer
     * crescer
     */
    if (
      pair === 'sc' &&
      isFrontVowel(next2)
    ) {
      pushConsonant(
        's',
        's'
      );

      index += 2;
      continue;
    }

    if (pair === 'sç') {
      pushConsonant(
        's',
        's'
      );

      index += 2;
      continue;
    }

    /*
     * XC before E/I is also treated as one S-family articulation
     * for learner display.
     */
    if (
      pair === 'xc' &&
      isFrontVowel(next2)
    ) {
      pushConsonant(
        's',
        's'
      );

      index += 2;
      continue;
    }

    /*
     * QU / GU with silent U before E/I.
     */

    if (
      current === 'q' &&
      next === 'u' &&
      isFrontVowel(next2)
    ) {
      pushConsonant('k');

      pushVowel(
        base(next2),
        VOWEL[next2] ||
        VOWEL[base(next2)] ||
        base(next2)
      );

      index += 3;
      continue;
    }

    if (
      current === 'g' &&
      next === 'u' &&
      isFrontVowel(next2)
    ) {
      pushConsonant('g');

      pushVowel(
        base(next2),
        VOWEL[next2] ||
        VOWEL[base(next2)] ||
        base(next2)
      );

      index += 3;
      continue;
    }

    /*
     * Nasal diphthongs.
     */

    if (pair === 'ão') {
      pushVowel(
        'ão',
        'ow'
      );

      index += 2;
      continue;
    }

    if (pair === 'ãe') {
      pushVowel(
        'ãe',
        'yng'
      );

      index += 2;
      continue;
    }

    if (pair === 'õe') {
      pushVowel(
        'õe',
        'oyng'
      );

      index += 2;
      continue;
    }

    if (current === 'ã') {
      pushVowel(
        'ã',
        'ahng'
      );

      index += 1;
      continue;
    }

    if (current === 'õ') {
      pushVowel(
        'õ',
        'ohng'
      );

      index += 1;
      continue;
    }

    /*
     * Pronounced U in QU before A/O.
     */

    if (
      current === 'q' &&
      next === 'u' &&
      [
        'a',
        'á',
        'à',
        'â',
        'ã',
        'o',
        'ó',
        'ô',
        'õ',
      ].includes(next2)
    ) {
      pushConsonant('k');
      pushConsonant('w');

      index += 2;
      continue;
    }

    if (current === 'q') {
      pushConsonant('k');

      index += 1;
      continue;
    }

    /*
     * Brazilian Portuguese palatalisation:
     *
     * di -> jee
     * ti -> chee
     */

    if (
      current === 'd' &&
      ['i', 'í'].includes(
        next
      )
    ) {
      pushConsonant('j');

      index += 1;
      continue;
    }

    if (
      current === 't' &&
      ['i', 'í'].includes(
        next
      )
    ) {
      pushConsonant('ch');

      index += 1;
      continue;
    }

    /*
     * Final DE / TE commonly reduce toward
     * jee / chee in Brazilian Portuguese.
     */

    if (
      current === 'd' &&
      next === 'e' &&
      index + 2 ===
        text.length
    ) {
      pushConsonant('j');

      pushVowel(
        'i',
        'ee'
      );

      index += 2;
      continue;
    }

    if (
      current === 't' &&
      next === 'e' &&
      index + 2 ===
        text.length
    ) {
      pushConsonant('ch');

      pushVowel(
        'i',
        'ee'
      );

      index += 2;
      continue;
    }

    /*
     * G / C.
     */

    if (current === 'g') {
      pushConsonant(
        isFrontVowel(next)
          ? 'zh'
          : 'g'
      );

      index += 1;
      continue;
    }

    if (current === 'c') {
      pushConsonant(
        isFrontVowel(next)
          ? 's'
          : 'k'
      );

      index += 1;
      continue;
    }

    if (current === 'ç') {
      pushConsonant('s');

      index += 1;
      continue;
    }

    if (current === 'j') {
      pushConsonant('zh');

      index += 1;
      continue;
    }

    /*
     * Portuguese X is context-dependent.
     *
     * It must never be treated as one universal X articulation.
     */

    if (current === 'x') {
      /*
       * Common SH-family forms.
       */
      if (
        text.startsWith('caix') ||
        text.startsWith('baix') ||
        text.startsWith('deix')
      ) {
        pushConsonant(
          'sh',
          'sh'
        );

        index += 1;
        continue;
      }

      /*
       * Common S-family forms.
       */
      if (
        text.startsWith('próxim') ||
        text.startsWith('proxim') ||
        text.startsWith('máxim') ||
        text.startsWith('maxim')
      ) {
        pushConsonant(
          's',
          's'
        );

        index += 1;
        continue;
      }

      /*
       * Initial X commonly uses SH-family articulation.
       */
      if (index === 0) {
        pushConsonant(
          'sh',
          'sh'
        );

        index += 1;
        continue;
      }

      /*
       * ENX- commonly uses SH-family articulation.
       */
      if (
        index >= 2 &&
        text[index - 2] === 'e' &&
        previous === 'n'
      ) {
        pushConsonant(
          'sh',
          'sh'
        );

        index += 1;
        continue;
      }

      /*
       * Initial EX-:
       * before a vowel -> Z-family
       * before a consonant -> S-family
       */
      if (
        index === 1 &&
        text[0] === 'e'
      ) {
        pushConsonant(
          isVowel(next)
            ? 'z'
            : 's'
        );

        index += 1;
        continue;
      }

      /*
       * Remaining X cases use the KS sequence.
       */
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

    /*
     * S voicing.
     */

    if (current === 's') {
      if (
        isVowel(previous) &&
        isVowel(next)
      ) {
        pushConsonant(
          'z',
          'z'
        );

        index += 1;
        continue;
      }

      if (
        index > 0 &&
        isVoicedConsonantLetter(
          next
        )
      ) {
        pushConsonant(
          'z',
          'z'
        );

        index += 1;
        continue;
      }

      pushConsonant(
        's',
        's'
      );

      index += 1;
      continue;
    }

    /*
     * Final written Z commonly sounds like S.
     */

    if (current === 'z') {
      pushConsonant(
        'z',
        index ===
          text.length - 1
          ? 's'
          : 'z'
      );

      index += 1;
      continue;
    }

    /*
     * Brazilian R.
     */

    if (current === 'r') {
      pushConsonant(
        index === 0 ||
        [
          'n',
          'l',
          's',
        ].includes(previous)
          ? 'h'
          : 'r'
      );

      index += 1;
      continue;
    }

    /*
     * Brazilian Portuguese syllable-final L is vocalised toward W.
     */

    if (current === 'l') {
      if (
        !next ||
        !isVowel(next)
      ) {
        pushConsonant(
          'w',
          'w'
        );
      } else {
        pushConsonant(
          'l',
          'l'
        );
      }

      index += 1;
      continue;
    }

    /*
     * Written H is silent.
     */

    if (current === 'h') {
      index += 1;
      continue;
    }

    /*
     * Vowels, diphthongs and nasal codas.
     */

    if (isVowel(current)) {
      const baseVowel =
        base(current);

      /*
       * Internal or final vowel + M/N in coda position
       * produces a nasal vowel.
       *
       * Do not consume N when it belongs to NH.
       */
      const nasalCoda =
        (
          next === 'm' ||
          next === 'n'
        ) &&
        !(
          next === 'n' &&
          next2 === 'h'
        ) &&
        (
          !next2 ||
          !isVowel(next2)
        );

      if (nasalCoda) {
        pushVowel(
          `nasal-${baseVowel}`,
          nasal(baseVowel)
        );

        index += 2;
        continue;
      }

      if (pair === 'oi') {
        pushVowel(
          'oi',
          'oy'
        );

        index += 2;
        continue;
      }

      if (pair === 'ou') {
        pushVowel(
          'ou',
          'oh'
        );

        index += 2;
        continue;
      }

      if (pair === 'ei') {
        pushVowel(
          'ei',
          'ay'
        );

        index += 2;
        continue;
      }

      if (pair === 'ai') {
        pushVowel(
          'ai',
          'ah-ee'
        );

        index += 2;
        continue;
      }

      if (pair === 'eu') {
        pushVowel(
          'eu',
          'eh-oo'
        );

        index += 2;
        continue;
      }

      /*
       * Common unstressed final vowel reductions.
       */

      if (
        index ===
          text.length - 1 &&
        current === 'e'
      ) {
        pushVowel(
          'i',
          'ee'
        );
      } else if (
        index ===
          text.length - 1 &&
        current === 'o'
      ) {
        pushVowel(
          'u',
          'oo'
        );
      } else {
        pushVowel(
          baseVowel,

          VOWEL[current] ||
          VOWEL[
            baseVowel
          ] ||
          baseVowel
        );
      }

      index += 1;
      continue;
    }

    /*
     * Remaining supported consonants.
     */

    if (
      'bdfkmnptvw'.includes(
        current
      )
    ) {
      pushConsonant(
        current
      );

      index += 1;
      continue;
    }

    /*
     * Unknown characters are ignored rather than becoming learner-visible
     * pseudo-phonemes.
     */

    index += 1;
  }

  return output;
}

function syllabify(
  tokens = []
) {
  if (!tokens.length) {
    return [];
  }

  const nuclei = [];

  tokens.forEach(
    (
      token,
      index
    ) => {
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
      nuclei[
        nucleusIndex
      ];

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
        ONSETS.has(pair)
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
        ONSETS.has(
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
      index
    ) =>
      tokens.slice(
        start,
        starts[index + 1] ??
          tokens.length
      )
  );
}

function mechanicalWord(
  word = ''
) {
  const key =
    normalizeWord(word);

  if (!key) {
    return '';
  }

  if (
    RULE_OVERRIDES[key]
  ) {
    return RULE_OVERRIDES[
      key
    ];
  }

  return syllabify(
    tokenize(key)
  )
    .map(
      (syllable) =>
        syllable
          .map(
            (token) =>
              token.display ||
              token.value ||
              ''
          )
          .join('')
    )
    .filter(Boolean)
    .join('-');
}

function buildWordResult(
  word = ''
) {
  const text =
    String(word ?? '').trim();

  const key =
    normalizeWord(text);

  if (!key) {
    return {
      language: 'pt-BR',
      kind: 'word',
      text,
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

  const reviewed =
    REVIEWED_PORTUGUESE_HELPERS[
      key
    ];

  const display =
    reviewed ||
    mechanicalWord(key);

  const valid =
    Boolean(display);

  const humanReviewed =
    Boolean(reviewed);

  return {
    language: 'pt-BR',
    kind: 'word',
    text,
    normalizedText: key,

    display,
    helperText: display,
    pronunciation: display,

    status:
      valid
        ? 'approved'
        : 'unresolved',

    approved:
      valid,

    reviewRequired:
      valid
        ? !humanReviewed
        : true,

    unresolved:
      !valid,

    humanReviewed,

    mechanicallyValidated:
      valid &&
      !humanReviewed,

    approvalSource:
      humanReviewed
        ? 'human-reviewed-locked-helper'
        : valid
          ? 'portuguese-deterministic-helper-rules'
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
      language: 'pt-BR',
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
    surfaceWords(
      sourceText
    ).map(
      buildWordResult
    );

  const unresolvedWords =
    words.filter(
      (word) =>
        word.unresolved
    );

  const phrase =
    REVIEWED_PORTUGUESE_PHRASES[
      normalizedText
    ];

  const display =
    phrase ||
    words
      .map(
        (word) =>
          word.display
      )
      .filter(Boolean)
      .join(' ');

  const valid =
    words.length > 0 &&
    unresolvedWords.length ===
      0 &&
    Boolean(display);

  const humanReviewed =
    valid &&
    (
      Boolean(phrase) ||
      words.every(
        (word) =>
          word.humanReviewed
      )
    );

  return {
    language: 'pt-BR',

    kind:
      words.length === 1
        ? 'word'
        : 'phrase',

    text:
      sourceText,

    normalizedText,

    display,
    helperText: display,
    pronunciation: display,

    status:
      valid
        ? 'approved'
        : 'unresolved',

    approved:
      valid,

    reviewRequired:
      valid
        ? !humanReviewed
        : true,

    unresolved:
      !valid,

    humanReviewed,

    mechanicallyValidated:
      valid &&
      !humanReviewed,

    approvalSource:
      humanReviewed
        ? 'human-reviewed-locked-helper'
        : valid
          ? 'portuguese-deterministic-helper-rules'
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

function universalWords() {
  return Array.isArray(
    universal500
  )
    ? universal500.flatMap(
        (group) =>
          Array.isArray(
            group?.words
          )
            ? group.words
            : []
      )
    : [];
}

export function runPronunciationHelperAudit({
  presetWords =
    PORTUGUESE_PRESET_WORDS,

  presetPhrases =
    PORTUGUESE_PRESET_PHRASES,

  includeUniversal500 =
    true,
} = {}) {
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

    ...(
      includeUniversal500
        ? universalWords()
        : []
    ).map(
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
    languageImplemented:
      true,

    language:
      'pt-BR',

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