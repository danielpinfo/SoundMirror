/**
 * English (US) learner-helper rules.
 *
 * This is a pack-owned grapheme-to-phoneme rule engine, not a library-word
 * dictionary. A reviewed irregular set handles English spellings that cannot be
 * derived reliably from their letters; every other word follows the same
 * ordered rules, including words typed by the learner at runtime.
 */

const IRREGULAR_RULE_EXCEPTIONS = Object.freeze({
  a: 'uh', able: 'ei-b-uh-l', again: 'uh-g-eh-n', already: 'aw-l-r-eh-d-ee',
  always: 'aw-l-w-ei-z', an: 'a-n', and: 'a-n-d',
  animal: 'a-n-uh-m-uh-l', answer: 'a-n-s-er', area: 'air-ee-uh',
  around: 'er-ow-n-d', are: 'ar', author: 'aw-th-er', baby: 'b-ei-b-ee',
  be: 'b-ee', been: 'b-i-n', beautiful: 'b-y-oo-t-i-f-uh-l',
  behind: 'b-i-h-ai-n-d',
  believe: 'b-i-l-ee-v', blood: 'b-l-uh-d', both: 'b-oh-th',
  bread: 'b-r-eh-d', build: 'b-i-l-d', business: 'b-i-z-n-uh-s', buy: 'b-ai',
  camera: 'k-a-m-er-uh', carry: 'k-a-r-ee', cause: 'k-ah-z',
  certain: 's-er-t-uh-n',
  choose: 'ch-oo-z', clothes: 'k-l-oh-dh-z', color: 'k-uh-l-er',
  correct: 'k-er-eh-k-t', could: 'k-u-d', course: 'k-or-s',
  create: 'k-r-ee-ei-t', decide: 'd-i-s-ai-d',
  develop: 'd-i-v-eh-l-uh-p', difficult: 'd-i-f-uh-k-uh-l-t',
  does: 'd-uh-z', done: 'd-uh-n', door: 'd-aw-r',
  education: 'eh-j-uh-k-ei-sh-uh-n', effort: 'eh-f-er-t',
  either: 'ee-dh-er', enough: 'i-n-uh-f',
  environment: 'i-n-v-ai-r-uh-n-m-uh-n-t', even: 'ee-v-i-n',
  evening: 'ee-v-n-i-ng', especially: 'uh-s-p-eh-sh-l-ee',
  example: 'i-g-z-a-m-p-uh-l', excuse: 'i-k-s-k-y-oo-z',
  experience: 'i-k-s-p-i-r-ee-uh-n-s', eye: 'ai', family: 'f-a-m-uh-l-ee',
  father: 'f-ah-dh-er', final: 'f-ai-n-uh-l', fire: 'f-ai-er',
  flood: 'f-l-uh-d', foot: 'f-u-t', forward: 'f-or-w-er-d',
  four: 'f-aw-r', full: 'f-u-l', give: 'g-i-v', gone: 'g-ah-n',
  good: 'g-u-d', goodbye: 'g-u-d-b-ai', guess: 'g-eh-s', half: 'h-a-f',
  have: 'h-a-v', he: 'h-ee', hear: 'h-eer', hello: 'h-uh-l-oh',
  her: 'h-er', hi: 'h-ai',
  here: 'h-eer', his: 'h-i-z', history: 'h-i-s-t-er-ee',
  hotel: 'h-oh-t-eh-l', hour: 'ow-er', hundred: 'h-uh-n-d-r-uh-d',
  husband: 'h-uh-z-b-uh-n-d', i: 'ai', idea: 'ai-d-ee-uh',
  identify: 'ai-d-eh-n-t-uh-f-ai', important: 'i-m-p-or-t-uh-n-t',
  interest: 'i-n-t-r-uh-s-t', interesting: 'i-n-t-r-uh-s-t-i-ng',
  into: 'i-n-t-oo', is: 'i-z', item: 'ai-t-uh-m', knowledge: 'n-ah-l-uh-j',
  language: 'l-a-ng-g-w-uh-j', laugh: 'l-a-f', listen: 'l-i-s-uh-n',
  live: 'l-i-v',
  lose: 'l-oo-z', love: 'l-uh-v', machine: 'm-uh-sh-ee-n', me: 'm-ee',
  measure: 'm-eh-zh-er', memory: 'm-eh-m-er-ee', minute: 'm-i-n-uh-t',
  many: 'm-eh-n-ee', market: 'm-ar-k-uh-t', model: 'm-ah-d-uh-l',
  money: 'm-uh-n-ee', morning: 'm-or-n-i-ng',
  move: 'm-oo-v', my: 'm-ai', of: 'uh-v', office: 'aw-f-i-s',
  often: 'aw-f-uh-n', once: 'w-uh-n-s', one: 'w-uh-n',
  onion: 'uh-n-y-uh-n', only: 'oh-n-l-ee', our: 'ow-er',
  parent: 'p-air-uh-n-t', people: 'p-ee-p-uh-l', police: 'p-uh-l-ee-s',
  popular: 'p-ah-p-y-uh-l-er', possible: 'p-ah-s-uh-b-uh-l',
  practice: 'p-r-a-k-t-uh-s', prepare: 'p-r-ee-p-air',
  pretty: 'p-r-i-t-ee', problem: 'p-r-ah-b-l-uh-m', pull: 'p-u-l',
  push: 'p-u-sh', put: 'p-u-t', quiet: 'k-w-ai-uh-t',
  radio: 'r-ei-d-ee-oh', receive: 'r-uh-s-ee-v', record: 'r-uh-k-or-d',
  report: 'r-ee-p-or-t', said: 's-eh-d', says: 's-eh-z',
  second: 's-eh-k-uh-n-d', several: 's-eh-v-r-uh-l', she: 'sh-ee',
  should: 'sh-u-d',
  social: 's-oh-sh-uh-l', some: 's-uh-m', someone: 's-uh-m-w-uh-n',
  something: 's-uh-m-th-i-ng', sometimes: 's-uh-m-t-ai-m-z',
  sorry: 's-ah-r-ee', special: 's-p-eh-sh-uh-l',
  suddenly: 's-uh-d-uh-n-l-ee', suggest: 's-uh-j-eh-s-t',
  the: 'dh-uh', their: 'dh-air', there: 'dh-air', they: 'dh-ei',
  this: 'dh-i-s', thought: 'th-aw-t', through: 'th-r-oo', to: 't-oo',
  together: 't-uh-g-eh-dh-er', tomorrow: 't-uh-m-or-oh', two: 't-oo',
  type: 't-ai-p', use: 'y-oo-z', very: 'v-eh-r-ee', video: 'v-i-d-ee-oh',
  want: 'w-ah-n-t', was: 'w-uh-z', wash: 'w-ah-sh', watch: 'w-ah-ch',
  water: 'w-aw-t-er', we: 'w-ee', welcome: 'w-eh-l-k-uh-m', were: 'w-er',
  what: 'w-uh-t', where: 'w-air', who: 'h-oo', why: 'w-ai',
  worry: 'w-er-ee', would: 'w-u-d', you: 'y-oo', your: 'y-or',
});

/**
 * English spelling families that specifically contain FOOT /ʊ/ or GOOSE
 * /uː/. These are reviewed vowel-family rules, not the 500+ practice library.
 * English spelling does not provide enough context to derive every member
 * (compare book/sloop, should, blue, group, and sure) from letters alone.
 */
const ROUNDED_VOWEL_RULE_EXCEPTIONS = Object.freeze({
  beautiful: 'b-y-oo-t-uh-f-uh-l',
  blue: 'b-l-oo',
  computer: 'k-uh-m-p-y-oo-t-er',
  continue: 'k-uh-n-t-i-n-y-oo',
  during: 'd-u-r-i-ng',
  few: 'f-y-oo',
  group: 'g-r-oo-p',
  human: 'h-y-oo-m-uh-n',
  improve: 'i-m-p-r-oo-v',
  include: 'i-n-k-l-oo-d',
  introduce: 'i-n-t-r-uh-d-oo-s',
  issue: 'i-sh-oo',
  movie: 'm-oo-v-ee',
  music: 'm-y-oo-z-i-k',
  new: 'n-oo',
  produce: 'p-r-uh-d-oo-s',
  remove: 'r-ee-m-oo-v',
  school: 's-k-oo-l',
  student: 's-t-oo-d-uh-n-t',
  sure: 'sh-u-r',
  usually: 'y-oo-zh-uh-w-uh-l-ee',
  value: 'v-a-l-y-oo',
  view: 'v-y-oo',
  woman: 'w-u-m-uh-n',
});

const INITIAL_RULES = Object.freeze([
  ['kn', ['n']], ['gn', ['n']], ['pn', ['n']], ['ps', ['s']], ['wr', ['r']],
]);

const LETTER_RULES = Object.freeze([
  ['tch', ['ch']], ['dge', ['j']], ['igh', ['ai']],
  ['ation', ['ei', 'sh', 'uh', 'n']], ['stion', ['s', 'ch', 'uh', 'n']],
  ['tion', ['sh', 'uh', 'n']], ['sion', ['zh', 'uh', 'n']],
  ['cian', ['sh', 'uh', 'n']], ['cial', ['sh', 'uh', 'l']],
  ['tial', ['sh', 'uh', 'l']], ['ture', ['ch', 'er']],
  ['eigh', ['ei']], ['ph', ['f']],
  ['irror', ['i', 'r', 'er']],
  ['ck', ['k']], ['ng', ['ng']], ['sh', ['sh']], ['ch', ['ch']],
  ['th', ['th']], ['wh', ['w']], ['qu', ['k', 'w']], ['ai', ['ei']],
  ['ay', ['ei']], ['ee', ['ee']], ['ea', ['ee']], ['oa', ['oh']],
  ['oi', ['oi']], ['oy', ['oi']], ['au', ['aw']], ['aw', ['aw']],
  ['er', ['er']], ['ir', ['er']], ['ur', ['er']], ['ar', ['ar']],
  ['or', ['or']],
]);

const SHORT_VOWELS = Object.freeze({ a: 'a', e: 'eh', i: 'i', o: 'ah', u: 'uh' });
const LONG_VOWELS = Object.freeze({ a: 'ei', e: 'ee', i: 'ai', o: 'oh', u: 'yoo' });
const VOICELESS_FINALS = new Set(['f', 'k', 'p', 's', 'sh', 't', 'th', 'ch']);

const REDUCED_INITIAL_A_WORDS = new Set([
  'ability', 'about', 'above', 'adult', 'again', 'ago', 'agree', 'allow',
  'alone', 'along', 'among', 'amount', 'appear', 'attention', 'available',
  'avoid', 'away',
]);

const REDUCED_BE_WORDS = new Set([
  'become', 'before', 'begin', 'behind', 'believe', 'below', 'between',
]);

const VOICED_TH_WORDS = new Set([
  'either', 'father', 'mother', 'other', 'than', 'that', 'their', 'them',
  'then', 'there', 'these', 'they', 'this', 'those', 'together', 'with',
]);

const HARD_G_WORDS = new Set([
  'begin', 'get', 'girl', 'give', 'gone', 'good', 'goodbye', 'great', 'green',
  'ground', 'group', 'grow', 'guess',
]);

const SHORT_EA_WORDS = new Set(['bread', 'head', 'measure', 'read', 'ready']);
const LONG_A_EA_WORDS = new Set(['great']);
const LONG_IE_WORDS = new Set(['die', 'lie', 'pie', 'tie']);
const LONG_I_CONSONANT_WORDS = new Set(['child', 'find', 'kind', 'mind']);
const LONG_I_FINAL_Y_WORDS = new Set(['buy', 'dry', 'reply', 'try', 'why']);
const LONG_OW_WORDS = new Set([
  'below', 'grow', 'know', 'low', 'own', 'show', 'window',
]);
const FOOT_OO_WORDS = new Set(['hood', 'stood', 'wood', 'wool']);
const REDUCED_AL_WORDS = new Set([
  'animal', 'final', 'general', 'hospital', 'local', 'total',
]);
const REDUCED_EN_WORDS = new Set([
  'certain', 'garden', 'happen', 'kitchen', 'listen', 'often', 'open', 'seven',
]);
const REDUCED_ON_WORDS = new Set(['common', 'person', 'reason', 'second']);
const REDUCED_EL_WORDS = new Set(['level', 'travel']);
const REDUCED_AGE_WORDS = new Set(['image', 'knowledge', 'message']);
const VOICED_S_WORDS = new Set([
  'easy', 'raise', 'rise', 'these', 'those',
]);
const INITIAL_AL_AW_WORDS = new Set(['almost', 'already', 'also', 'always']);
const REDUCED_INITIAL_E_WORDS = new Set(['effect', 'event']);
const REDUCED_INITIAL_RE_WORDS = new Set([
  'remember', 'repeat', 'reply', 'result', 'return',
]);
const STRUT_O_WORDS = new Set([
  'above', 'among', 'become', 'come', 'complete', 'cover', 'discover', 'front',
  'month', 'mother', 'nothing', 'other', 'position', 'provide', 'son', 'today',
]);
const STRUT_OU_WORDS = new Set(['country', 'touch', 'young']);
const OPEN_AW_O_WORDS = new Set(['loss', 'off', 'offer']);
const LONG_O_WORDS = new Set(['almost', 'local', 'most', 'open', 'over', 'program', 'total']);
const LONG_A_INTERNAL_WORDS = new Set(['paper', 'table']);
const REDUCED_ENDING_WORDS = new Set([
  'difference', 'different', 'distance', 'present',
]);

function normalize(text = '') {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z'\s-]/g, '')
    .replace(/[-\s]+/g, ' ')
    .trim();
}

function isVowel(letter = '') {
  return Object.prototype.hasOwnProperty.call(SHORT_VOWELS, letter);
}

function contextualRule(word, index) {
  const rest = word.slice(index);

  if (index === 0 && word.startsWith('arriv')) {
    return { length: 3, tokens: ['er'] };
  }
  if (index === 0 && word.startsWith('ex') && word.length > 2) {
    return {
      length: 2,
      tokens: isVowel(word[2]) ? ['i', 'g', 'z'] : ['i', 'k', 's'],
    };
  }
  if (index === 0 && REDUCED_BE_WORDS.has(word)) {
    return { length: 2, tokens: ['b', 'i'] };
  }
  if (index === 0 && REDUCED_INITIAL_E_WORDS.has(word)) {
    return { length: 1, tokens: ['i'] };
  }
  if (index === 0 && REDUCED_INITIAL_RE_WORDS.has(word)) {
    return { length: 2, tokens: ['r', 'i'] };
  }
  if (
    index === 0 &&
    REDUCED_INITIAL_A_WORDS.has(word)
  ) {
    return { length: 1, tokens: ['uh'] };
  }

  if (rest.startsWith('ear')) {
    if (/^(?:early|learn)/.test(word)) return { length: 3, tokens: ['er'] };
    if (/^(?:bear|wear)/.test(word)) return { length: 3, tokens: ['air'] };
    if (word === 'heart') return { length: 3, tokens: ['ar'] };
    return { length: 3, tokens: ['ihr'] };
  }
  if (rest.startsWith('air')) return { length: 3, tokens: ['air'] };
  if (rest === 'are' && word !== 'are') return { length: 3, tokens: ['air'] };
  if (rest.startsWith('wor')) return { length: 3, tokens: ['w', 'er'] };
  if (rest.startsWith('war')) return { length: 3, tokens: ['w', 'or'] };
  if (index === 0 && rest.startsWith('al') && INITIAL_AL_AW_WORDS.has(word)) {
    return { length: 2, tokens: ['aw', 'l'] };
  }
  if (rest.startsWith('all')) return { length: 3, tokens: ['aw', 'l'] };
  if (rest.startsWith('alk')) return { length: 3, tokens: ['aw', 'k'] };
  if (rest.startsWith('old')) return { length: 3, tokens: ['oh', 'l', 'd'] };
  if (rest.startsWith('ange')) return { length: 4, tokens: ['ei', 'n', 'j'] };

  if (rest === 'ey') return { length: 2, tokens: ['ee'] };
  if (rest === 'ity' && word.length > 4) {
    return { length: 3, tokens: ['uh', 't', 'ee'] };
  }
  if (rest === 'able' && word.length > 6) {
    return { length: 4, tokens: ['uh', 'b', 'uh', 'l'] };
  }
  if (rest === 'ire') return { length: 3, tokens: ['ai', 'er'] };
  if (rest.startsWith('uy') && word === 'buy') {
    return { length: 2, tokens: ['ai'] };
  }
  if (rest.startsWith('ui') && word === 'build') {
    return { length: 2, tokens: ['i'] };
  }
  if (rest.startsWith('ie') && word === 'believe') {
    return { length: 2, tokens: ['ee'] };
  }

  if (rest.startsWith('ea')) {
    if (SHORT_EA_WORDS.has(word)) return { length: 2, tokens: ['eh'] };
    if (LONG_A_EA_WORDS.has(word)) return { length: 2, tokens: ['ei'] };
  }
  if (rest.startsWith('ie')) {
    if (LONG_IE_WORDS.has(word)) return { length: 2, tokens: ['ai'] };
    if (/^(?:field|piece)$/.test(word)) return { length: 2, tokens: ['ee'] };
    if (word === 'friend') return { length: 2, tokens: ['eh'] };
  }
  if (
    LONG_I_CONSONANT_WORDS.has(word) &&
    (rest.startsWith('ind') || rest.startsWith('ild'))
  ) {
    return rest.startsWith('ind')
      ? { length: 3, tokens: ['ai', 'n', 'd'] }
      : { length: 3, tokens: ['ai', 'l', 'd'] };
  }

  if (rest === 'o') return { length: 1, tokens: ['oh'] };
  if (rest === 'y' && LONG_I_FINAL_Y_WORDS.has(word)) {
    return { length: 1, tokens: ['ai'] };
  }
  if (rest.startsWith('ow')) {
    return { length: 2, tokens: LONG_OW_WORDS.has(word) ? ['oh'] : ['ow'] };
  }
  if (rest.startsWith('ou') && STRUT_OU_WORDS.has(word)) {
    return { length: 2, tokens: ['uh'] };
  }
  if (word[index] === 'o' && STRUT_O_WORDS.has(word)) {
    return { length: 1, tokens: ['uh'] };
  }
  if (word[index] === 'o' && OPEN_AW_O_WORDS.has(word)) {
    return { length: 1, tokens: ['aw'] };
  }
  if (word[index] === 'o' && LONG_O_WORDS.has(word)) {
    return { length: 1, tokens: ['oh'] };
  }
  if (word[index] === 'a' && LONG_A_INTERNAL_WORDS.has(word)) {
    return { length: 1, tokens: ['ei'] };
  }
  if (word[index] === 'o' && word.slice(index + 1, index + 3) === 'ng') {
    return { length: 1, tokens: ['aw'] };
  }
  if (word[index] === 'n' && word[index + 1] === 'k') {
    return { length: 1, tokens: ['ng'] };
  }
  if (word.slice(index, index + 2) === 'th' && VOICED_TH_WORDS.has(word)) {
    return { length: 2, tokens: ['dh'] };
  }

  const finalSyllabicLe = rest.match(/^([bcdfgkmnpstz])le$/);
  if (finalSyllabicLe) {
    return { length: 3, tokens: [finalSyllabicLe[1], 'uh', 'l'] };
  }
  if (rest === 'al' && REDUCED_AL_WORDS.has(word)) {
    return { length: 2, tokens: ['uh', 'l'] };
  }
  if (rest === 'en' && REDUCED_EN_WORDS.has(word)) {
    return { length: 2, tokens: ['uh', 'n'] };
  }
  if (rest === 'on' && REDUCED_ON_WORDS.has(word)) {
    return { length: 2, tokens: ['uh', 'n'] };
  }
  if (rest === 'el' && REDUCED_EL_WORDS.has(word)) {
    return { length: 2, tokens: ['uh', 'l'] };
  }
  if (rest === 'age' && REDUCED_AGE_WORDS.has(word)) {
    return { length: 3, tokens: ['uh', 'j'] };
  }
  if (
    REDUCED_ENDING_WORDS.has(word) &&
    (rest.startsWith('ence') || rest.startsWith('ent') || rest.startsWith('ance'))
  ) {
    return {
      length: rest.length,
      tokens: rest.startsWith('ent') ? ['uh', 'n', 't'] : ['uh', 'n', 's'],
    };
  }

  return null;
}

function matchOrderedRule(word, index) {
  const rules = index === 0 ? [...INITIAL_RULES, ...LETTER_RULES] : LETTER_RULES;
  const rest = word.slice(index);
  for (const [pattern, tokens] of rules) {
    if (rest.startsWith(pattern)) return { length: pattern.length, tokens };
  }
  return null;
}

function isSilentFinalE(word, index) {
  return word[index] === 'e' && index === word.length - 1 && word.length > 2;
}

function isMagicEVowel(word, index) {
  return (
    isVowel(word[index]) &&
    index + 2 === word.length - 1 &&
    !isVowel(word[index + 1]) &&
    word[index + 2] === 'e'
  );
}

function resolveOuOw(word, index) {
  const pair = word.slice(index, index + 2);
  if (pair === 'ou') return ['ow'];
  if (pair !== 'ow') return null;
  return LONG_OW_WORDS.has(word) ? ['oh'] : ['ow'];
}

function resolveOo(word, index) {
  if (word.slice(index, index + 2) !== 'oo') return null;
  const followedByK = word[index + 2] === 'k';
  const longBeforeK = word === 'kook' || word === 'spook';
  const reviewedFootFamily =
    FOOT_OO_WORDS.has(word) ||
    word.endsWith('hood') ||
    word.endsWith('stood') ||
    word.includes('wood') ||
    word.startsWith('wool');
  return (followedByK && !longBeforeK) || reviewedFootFamily ? ['u'] : ['oo'];
}

function resolveConsonant(word, index, tokens) {
  const letter = word[index];
  const next = word[index + 1] || '';
  const previous = word[index - 1] || '';
  if (letter === 'c') return /[eiy]/.test(next) ? ['s'] : ['k'];
  if (letter === 'g') return /[eiy]/.test(next) && !HARD_G_WORDS.has(word) ? ['j'] : ['g'];
  if (letter === 'x') return index === 0 ? ['z'] : ['k', 's'];
  if (letter === 'q') return ['k'];
  if (letter === 'y') return index === word.length - 1 ? ['ee'] : ['y'];
  if (letter === 's' && VOICED_S_WORDS.has(word)) return ['z'];
  if (
    letter === 's' &&
    isVowel(previous) &&
    isVowel(next) &&
    !(next === 'e' && index + 1 === word.length - 1)
  ) return ['z'];
  if (letter === 'd' && index === word.length - 1 && word.endsWith('ed')) {
    return VOICELESS_FINALS.has(tokens.at(-1)) ? ['t'] : ['d'];
  }
  return [letter];
}

function postProcessTokens(tokens = []) {
  const output = [];
  for (const token of tokens) {
    const previous = output.at(-1);
    const consonant = /^(?:b|ch|d|dh|f|g|h|j|k|l|m|n|ng|p|r|s|sh|t|th|v|w|y|z|zh)$/;
    if (token === previous && consonant.test(token)) continue;
    output.push(token);
  }
  return output;
}

export function resolveSimpleWord(rawWord = '') {
  const word = normalize(rawWord).replace(/\s/g, '');
  if (!word) return '';
  if (ROUNDED_VOWEL_RULE_EXCEPTIONS[word]) {
    return ROUNDED_VOWEL_RULE_EXCEPTIONS[word];
  }
  if (IRREGULAR_RULE_EXCEPTIONS[word]) return IRREGULAR_RULE_EXCEPTIONS[word];

  const tokens = [];
  let index = 0;
  while (index < word.length) {
    if (isSilentFinalE(word, index)) {
      index += 1;
      continue;
    }
    const contextual = contextualRule(word, index);
    if (contextual) {
      tokens.push(...contextual.tokens);
      index += contextual.length;
      continue;
    }
    const ouOw = resolveOuOw(word, index);
    if (ouOw) {
      tokens.push(...ouOw);
      index += 2;
      continue;
    }
    const oo = resolveOo(word, index);
    if (oo) {
      tokens.push(...oo);
      index += 2;
      continue;
    }
    const matched = matchOrderedRule(word, index);
    if (matched) {
      tokens.push(...matched.tokens);
      index += matched.length;
      continue;
    }
    const letter = word[index];
    if (isVowel(letter)) {
      tokens.push(isMagicEVowel(word, index) ? LONG_VOWELS[letter] : SHORT_VOWELS[letter]);
    } else {
      tokens.push(...resolveConsonant(word, index, tokens));
    }
    index += 1;
  }
  return postProcessTokens(tokens).join('-');
}

export function resolveEnglishHelperText(text = '') {
  const normalized = normalize(text);
  if (!normalized) return '';
  return normalized.split(' ').map(resolveSimpleWord).filter(Boolean).join(' ');
}

const pronunciationRules = { locale: 'en-US', resolveEnglishHelperText, resolveSimpleWord };

export default pronunciationRules;
