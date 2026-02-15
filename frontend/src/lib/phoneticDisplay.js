/**
 * PHONETIC DISPLAY - "HOW IT SOUNDS" PRONUNCIATION RULE SHEET
 * 
 * Core Principle (NON-NEGOTIABLE):
 *   "Vowels must be pronounced clearly, separately, and long —
 *    never compressed into English diphthongs."
 * 
 * This module converts text into READABLE phonetics that match
 * what users should HEAR when practicing pronunciation.
 * 
 * Rules:
 *   - Vowels stay separate unless explicitly tied
 *   - No English diphthong collapse (ai ≠ "eye", ay ≠ "eye")
 *   - Vowel length is mandatory, not optional
 *   - Consonants do NOT steal vowel energy
 *   - Cross-language safe (English is the outlier, not the default)
 */

// =============================================================================
// LETTER PHONETICS (for letter practice)
// =============================================================================

export const LETTER_PHONETICS = {
  'A': 'ah', 'B': 'buh', 'C': 'kuh', 'D': 'duh', 'E': 'eh',
  'F': 'fuh', 'G': 'guh', 'H': 'huh', 'I': 'ee', 'J': 'juh',
  'K': 'kuh', 'L': 'luh', 'M': 'muh', 'N': 'nuh', 'O': 'oh',
  'P': 'puh', 'Q': 'koo', 'R': 'ruh', 'S': 'sss', 'T': 'tuh',
  'U': 'oo', 'V': 'vuh', 'W': 'wuh', 'X': 'ks', 'Y': 'yuh', 'Z': 'zzz',
  'CH': 'chuh', 'SH': 'shuh', 'TH': 'thuh', 'LL': 'yeh',
};

/**
 * Get phonetic for a letter (for Letter Practice mode)
 */
export function getLetterPhonetic(letter) {
  if (!letter) return '';
  const upper = letter.toUpperCase();
  return LETTER_PHONETICS[upper] || letter.toLowerCase();
}

// =============================================================================
// WORD/PHRASE PHONETIC DISPLAY — "HOW IT SOUNDS" RENDERING
// =============================================================================

/**
 * Word-level phonetic dictionary.
 * These follow the Pronunciation Rule Sheet exactly.
 * 
 * KEY RULE: Vowels are separated, long, and pure.
 *   "I" = Aeem (long open + high vowel, NOT a glide)
 *   "fine" = faeen (fa + een, NOT /faɪn/)
 */
const WORD_PHONETICS = {
  // === PRONOUNS & ARTICLES ===
  "i": "Aeem",
  "i'm": "Aeem",
  "i'll": "Aeel",
  "i've": "Aeev",
  "i'd": "Aeed",
  "me": "mee",
  "my": "ma-ee",
  "you": "yoo",
  "your": "yoor",
  "you're": "yoor",
  "he": "hee",
  "she": "shee",
  "we": "wee",
  "they": "theh-ee",
  "the": "thuh",
  "a": "ah",
  "an": "an",

  // === COMMON VERBS ===
  "to": "too",
  "is": "eez",
  "are": "aar",
  "was": "woz",
  "be": "bee",
  "do": "doo",
  "go": "goh",
  "no": "noh",
  "so": "soh",
  "say": "seh-ee",
  "see": "see",
  "come": "kum",
  "have": "hav",
  "give": "geev",
  "live": "leev",
  "move": "moov",
  "love": "luv",
  "make": "meh-eek",
  "take": "teh-eek",
  "like": "la-eek",
  "ride": "ra-eed",
  "hide": "ha-eed",
  "side": "sa-eed",
  "wide": "wa-eed",
  "know": "noh",
  "show": "shoh",
  "grow": "groh",
  "blow": "bloh",
  "flow": "floh",
  "slow": "sloh",

  // === "MAGIC E" WORDS (i_e pattern) ===
  "fine": "faeen",
  "mine": "maeen",
  "wine": "waeen",
  "line": "laeen",
  "nine": "naeen",
  "pine": "paeen",
  "dine": "daeen",
  "vine": "vaeen",
  "time": "taeem",
  "lime": "laeem",
  "dime": "daeem",
  "life": "laeef",
  "wife": "waeef",
  "knife": "naeef",
  "five": "faeev",
  "dive": "daeev",
  "hive": "haeev",
  "nice": "naees",
  "rice": "raees",
  "dice": "daees",
  "ice": "aees",
  "price": "praees",
  "twice": "twaees",
  "smile": "smaeel",
  "while": "waeel",
  "mile": "maeel",
  "file": "faeel",
  "tile": "taeel",
  "fire": "faeer",
  "tire": "taeer",
  "wire": "waeer",
  "hire": "haeer",
  "bite": "baeet",
  "kite": "kaeet",
  "site": "saeet",
  "white": "waeet",
  "write": "raeet",
  "quite": "kwaeet",

  // === "MAGIC E" WORDS (a_e pattern) ===
  "name": "neh-eem",
  "came": "keh-eem",
  "same": "seh-eem",
  "game": "geh-eem",
  "fame": "feh-eem",
  "blame": "bleh-eem",
  "flame": "fleh-eem",
  "made": "meh-eed",
  "fade": "feh-eed",
  "shade": "sheh-eed",
  "trade": "treh-eed",
  "grade": "greh-eed",
  "place": "pleh-ees",
  "face": "feh-ees",
  "race": "reh-ees",
  "space": "speh-ees",
  "safe": "seh-eef",
  "late": "leh-eet",
  "gate": "geh-eet",
  "fate": "feh-eet",
  "state": "steh-eet",
  "date": "deh-eet",
  "make": "meh-eek",
  "take": "teh-eek",
  "bake": "beh-eek",
  "cake": "keh-eek",
  "lake": "leh-eek",
  "wake": "weh-eek",
  "shake": "sheh-eek",
  "brake": "breh-eek",
  "save": "seh-eev",
  "wave": "weh-eev",
  "brave": "breh-eev",
  "gave": "geh-eev",
  "cave": "keh-eev",
  "sale": "seh-eel",
  "tale": "teh-eel",
  "pale": "peh-eel",
  "male": "meh-eel",
  "whale": "weh-eel",
  "scale": "skeh-eel",

  // === "MAGIC E" WORDS (o_e pattern) ===
  "home": "hohm",
  "bone": "bohn",
  "tone": "tohn",
  "stone": "stohn",
  "alone": "a-lohn",
  "phone": "fohn",
  "zone": "zohn",
  "hope": "hohp",
  "rope": "rohp",
  "note": "noht",
  "vote": "voht",
  "those": "thohz",
  "close": "klohz",
  "nose": "nohz",
  "rose": "rohz",
  "chose": "chohz",
  "hole": "hohl",
  "role": "rohl",
  "pole": "pohl",
  "sole": "sohl",
  "whole": "hohl",
  "more": "mohr",
  "store": "stohr",
  "before": "bee-fohr",
  "core": "kohr",

  // === -Y WORDS (long i sound) ===
  "hi": "ha-ee",
  "by": "ba-ee",
  "my": "ma-ee",
  "why": "wa-ee",
  "try": "tra-ee",
  "cry": "kra-ee",
  "dry": "dra-ee",
  "fly": "fla-ee",
  "sky": "ska-ee",
  "buy": "ba-ee",
  "guy": "ga-ee",
  "eye": "a-ee",
  "pie": "pa-ee",
  "tie": "ta-ee",
  "die": "da-ee",
  "lie": "la-ee",
  "bye": "ba-ee",
  "shy": "sha-ee",
  "sly": "sla-ee",
  "spy": "spa-ee",
  "pry": "pra-ee",
  "fry": "fra-ee",
  "reply": "ree-pla-ee",

  // === COMMON EVERYDAY WORDS ===
  "hello": "heh-loh",
  "water": "waa-ter",
  "please": "pleez",
  "thank": "thangk",
  "thanks": "thangks",
  "good": "good",
  "morning": "mor-neeng",
  "night": "na-eet",
  "right": "ra-eet",
  "light": "la-eet",
  "might": "ma-eet",
  "sight": "sa-eet",
  "tight": "ta-eet",
  "fight": "fa-eet",
  "bright": "bra-eet",
  "flight": "fla-eet",
  "high": "ha-ee",
  "sigh": "sa-ee",
  "thigh": "tha-ee",
  "how": "ha-oo",
  "now": "na-oo",
  "cow": "ka-oo",
  "wow": "wa-oo",
  "down": "da-oon",
  "town": "ta-oon",
  "brown": "bra-oon",
  "crown": "kra-oon",
  "found": "fa-oond",
  "sound": "sa-oond",
  "round": "ra-oond",
  "ground": "gra-oond",
  "out": "a-oot",
  "about": "a-ba-oot",
  "shout": "sha-oot",
  "house": "ha-oos",
  "mouse": "ma-oos",
  "loud": "la-ood",
  "cloud": "kla-ood",
  "proud": "pra-ood",
  "boy": "bo-ee",
  "joy": "jo-ee",
  "toy": "to-ee",
  "enjoy": "en-jo-ee",
  "oil": "o-eel",
  "boil": "bo-eel",
  "soil": "so-eel",
  "coin": "ko-een",
  "join": "jo-een",
  "point": "po-eent",
  "day": "deh-ee",
  "way": "weh-ee",
  "play": "pleh-ee",
  "stay": "steh-ee",
  "away": "a-weh-ee",
  "today": "too-deh-ee",
  "may": "meh-ee",
  "pay": "peh-ee",
  "rain": "reh-een",
  "pain": "peh-een",
  "main": "meh-een",
  "brain": "breh-een",
  "train": "treh-een",
  "again": "a-geh-een",
  "wait": "weh-eet",
  "great": "greh-eet",
  "eat": "eet",
  "meet": "meet",
  "feet": "feet",
  "street": "street",
  "sweet": "sweet",
  "sleep": "sleep",
  "keep": "keep",
  "deep": "deep",
  "feel": "feel",
  "real": "reel",
  "meal": "meel",
  "deal": "deel",
  "heal": "heel",
  "read": "reed",
  "need": "need",
  "feed": "feed",
  "seed": "seed",
  "speed": "speed",
  "tree": "tree",
  "free": "free",
  "three": "three",
  "green": "green",
  "seen": "seen",
  "been": "been",
  "food": "food",
  "mood": "mood",
  "cool": "kool",
  "pool": "pool",
  "school": "skool",
  "tool": "tool",
  "room": "room",
  "moon": "moon",
  "soon": "soon",
  "noon": "noon",
  "spoon": "spoon",
  "blue": "bloo",
  "true": "troo",
  "new": "noo",
  "few": "foo",
  "knew": "noo",
  "flew": "floo",
  "grew": "groo",
  "drew": "droo",
  "help": "help",
  "yes": "yes",
  "let": "let",
  "get": "get",
  "set": "set",
  "yet": "yet",
  "wet": "wet",
  "bed": "bed",
  "red": "red",
  "said": "sed",
  "head": "hed",
  "bread": "bred",
  "dead": "ded",
  "read": "reed",
  "lead": "leed",
  "friend": "frend",
  "one": "wun",
  "done": "dun",
  "gone": "gon",
  "son": "sun",
  "won": "wun",
  "fun": "fun",
  "run": "run",
  "sun": "sun",
  "but": "but",
  "cut": "kut",
  "put": "poot",
  "up": "up",
  "cup": "kup",
  "just": "just",
  "must": "must",
  "much": "much",
  "such": "such",
  "touch": "tuch",
  "world": "wurld",
  "word": "wurd",
  "work": "wurk",
  "girl": "gurl",
  "first": "furst",
  "bird": "burd",
  "turn": "turn",
  "learn": "lurn",
  "earth": "urth",
  "heart": "hart",
  "start": "start",
  "part": "part",
  "far": "far",
  "car": "kar",
  "star": "star",
  "hard": "hard",
  "arm": "arm",
  "warm": "worm",
  "from": "from",
  "what": "wot",
  "that": "that",
  "this": "this",
  "with": "with",
  "will": "wil",
  "can": "kan",
  "man": "man",
  "hand": "hand",
  "land": "land",
  "stand": "stand",
  "than": "than",
  "back": "bak",
  "black": "blak",
  "all": "awl",
  "call": "kawl",
  "fall": "fawl",
  "tall": "tawl",
  "small": "smawl",
  "wall": "wawl",
  "ball": "bawl",
  "also": "awl-soh",
  "always": "awl-weh-eez",
  "talk": "tawk",
  "walk": "wawk",
  "thought": "thawt",
  "caught": "kawt",
  "taught": "tawt",
  "because": "bee-kawz",
  "people": "pee-pul",
  "only": "ohn-lee",
  "very": "veh-ree",
  "every": "ev-ree",
  "other": "uh-ther",
  "after": "af-ter",
  "over": "oh-ver",
  "under": "un-der",
  "never": "neh-ver",
  "even": "ee-ven",
  "open": "oh-pen",
  "little": "li-tul",
  "big": "big",
  "long": "long",
  "old": "ohld",
  "new": "noo",
  "many": "meh-nee",
  "some": "sum",
  "would": "wood",
  "could": "kood",
  "should": "shood",
  "their": "thehr",
  "there": "thehr",
  "where": "wehr",
  "here": "heer",
  "when": "wen",
  "then": "then",
  "again": "a-geh-een",
  "year": "yeer",
  "each": "eech",
  "which": "wich",
  "think": "thingk",
  "look": "look",
  "book": "book",
  "took": "took",
  "cook": "kook",
  "good": "good",
  "foot": "foot",
  "wood": "wood",
  "door": "dohr",
  "floor": "flohr",
  "four": "fohr",
  "pour": "pohr",
  "your": "yohr",

  // === MISSING COMMON WORDS ===
  "later": "leh-ter",
  "never": "neh-ver",
  "ever": "eh-ver",
  "over": "oh-ver",
  "under": "un-der",
  "after": "af-ter",
  "better": "beh-ter",
  "letter": "leh-ter",
  "matter": "ma-ter",
  "water": "waa-ter",
  "together": "too-geh-ther",
  "another": "a-nuh-ther",

  // === MULTILINGUAL COMMON WORDS ===
  // Spanish
  "hola": "oh-lah",
  "gracias": "grah-see-ahs",
  "por": "pohr",
  "favor": "fah-vohr",
  "amigo": "ah-mee-goh",
  // French
  "oui": "oo-ee",
  "bonjour": "bon-zhoor",
  "merci": "mehr-see",
  // German
  "nein": "na-een",
  "danke": "dahn-keh",
  "bitte": "bi-teh",
  // Italian
  "ciao": "chah-oh",
  "buono": "boo-oh-noh",
};

/**
 * Pattern-based vowel rules for unknown words.
 * Applied in order (longest patterns first).
 * 
 * CRITICAL: Vowels are SEPARATED, never compressed.
 *   ai → "a-ee" NOT "eye"
 *   ay → "eh-ee" NOT "eye"  
 *   ei → "eh-ee" NOT "ay"
 *   au → "a-oo" NOT "ow"
 *   oi/oy → "o-ee" NOT "oy"
 */
const PHONETIC_PATTERNS = [
  // Longest multi-letter patterns first
  { pattern: 'ight', replace: 'a-eet' },
  { pattern: 'ough', replace: 'oh' },
  { pattern: 'tion', replace: 'shun' },
  { pattern: 'sion', replace: 'zhun' },
  { pattern: 'ould', replace: 'ood' },

  // Vowel digraphs — SEPARATED, NEVER compressed
  { pattern: 'ai', replace: 'eh-ee' },
  { pattern: 'ay', replace: 'eh-ee' },
  { pattern: 'ei', replace: 'eh-ee' },
  { pattern: 'ey', replace: 'eh-ee' },
  { pattern: 'oi', replace: 'o-ee' },
  { pattern: 'oy', replace: 'o-ee' },
  { pattern: 'au', replace: 'a-oo' },
  { pattern: 'aw', replace: 'a-oo' },
  { pattern: 'ou', replace: 'a-oo' },
  { pattern: 'ow', replace: 'oh' },
  { pattern: 'oa', replace: 'oh-ah' },
  { pattern: 'oe', replace: 'o-eh' },

  // Pure long vowels (no compression)
  { pattern: 'ee', replace: 'ee' },
  { pattern: 'ea', replace: 'ee' },
  { pattern: 'oo', replace: 'oo' },

  // Consonant digraphs
  { pattern: 'th', replace: 'th' },
  { pattern: 'ch', replace: 'ch' },
  { pattern: 'sh', replace: 'sh' },
  { pattern: 'ng', replace: 'ng' },
  { pattern: 'ck', replace: 'k' },
  { pattern: 'ph', replace: 'f' },
  { pattern: 'wh', replace: 'w' },
  { pattern: 'wr', replace: 'r' },
  { pattern: 'kn', replace: 'n' },
  { pattern: 'gn', replace: 'n' },

  // Double consonants → single
  { pattern: 'll', replace: 'l' },
  { pattern: 'ss', replace: 's' },
  { pattern: 'tt', replace: 't' },
  { pattern: 'ff', replace: 'f' },
  { pattern: 'rr', replace: 'r' },
  { pattern: 'nn', replace: 'n' },
  { pattern: 'mm', replace: 'm' },
  { pattern: 'pp', replace: 'p' },
  { pattern: 'bb', replace: 'b' },
  { pattern: 'dd', replace: 'd' },
  { pattern: 'gg', replace: 'g' },
  { pattern: 'cc', replace: 'k' },
  { pattern: 'zz', replace: 'z' },
];

/**
 * Handle "magic e" rule: consonant+e at end of word changes vowel pronunciation.
 * e.g., "fine" → the 'i' becomes long (a-ee sound), silent 'e'
 *       "made" → the 'a' becomes long (eh-ee sound), silent 'e'
 */
function handleMagicE(word) {
  // Must end in consonant + e, and be at least 3 chars
  if (word.length < 3 || !word.endsWith('e')) return null;

  const beforeE = word[word.length - 2];
  const consonants = 'bcdfghjklmnpqrstvwxyz';
  if (!consonants.includes(beforeE)) return null;

  // Find the main vowel before the final consonant+e
  const stem = word.slice(0, -1); // remove silent 'e'
  let vowelIdx = -1;
  for (let i = stem.length - 2; i >= 0; i--) {
    if ('aeiou'.includes(stem[i])) {
      vowelIdx = i;
      break;
    }
  }

  if (vowelIdx === -1) return null;

  const vowel = stem[vowelIdx];
  const before = stem.slice(0, vowelIdx);
  const after = stem.slice(vowelIdx + 1);

  // Long vowel sounds (separated, never compressed)
  const longVowels = {
    'a': 'eh-ee',  // "made" → "meh-eed"
    'e': 'ee',     // "these" → "theez"
    'i': 'aee',    // "fine" → "faeen"
    'o': 'oh',     // "home" → "hohm"
    'u': 'oo',     // "cute" → "koot"
  };

  const longSound = longVowels[vowel];
  if (!longSound) return null;

  return before + longSound + after;
}

/**
 * Apply pattern-based rules to a word for phonetic rendering.
 * Used as fallback when word is not in the dictionary.
 */
function applyPatternRules(word) {
  // Try magic-e first
  const magicE = handleMagicE(word);
  if (magicE) return magicE;

  let result = word;
  // Sort patterns by length (longest first) for greedy matching
  const sorted = [...PHONETIC_PATTERNS].sort((a, b) => b.pattern.length - a.pattern.length);

  for (const rule of sorted) {
    result = result.split(rule.pattern).join(rule.replace);
  }

  // Remove silent trailing 'e' that wasn't caught by magic-e
  if (result.endsWith('e') && result.length > 2) {
    const beforeLast = result[result.length - 2];
    if (!'aeiou'.includes(beforeLast)) {
      result = result.slice(0, -1);
    }
  }

  return result;
}

/**
 * Language-specific phonetic rendering.
 * For non-English Latin languages, vowels are already more pure —
 * these just need basic romanization/clarification.
 * For non-Latin scripts (Japanese, Chinese, Hindi, Arabic),
 * we use romanization.
 */
const LANGUAGE_PHONETICS = {
  spanish: {
    "hola": "oh-lah",
    "sí": "see",
    "no": "noh",
    "agua": "ah-goo-ah",
    "comida": "koh-mee-dah",
    "bien": "bee-en",
    "ayuda": "ah-yoo-dah",
    "gracias": "grah-see-ahs",
    "muchas gracias": "moo-chahs grah-see-ahs",
    "estoy bien": "ehs-toy bee-en",
    "buenos días": "boo-eh-nohs dee-ahs",
    "cómo estás": "koh-moh ehs-tahs",
    "mucho gusto": "moo-choh goos-toh",
    "hasta luego": "ahs-tah loo-eh-goh",
    "por favor": "pohr fah-vohr",
    "amigo": "ah-mee-goh",
  },
  italian: {
    "ciao": "chah-oh",
    "sì": "see",
    "no": "noh",
    "acqua": "ah-kwah",
    "cibo": "chee-boh",
    "bene": "beh-neh",
    "aiuto": "ah-yoo-toh",
    "grazie": "grah-tsee-eh",
    "molte grazie": "mohl-teh grah-tsee-eh",
    "sto bene": "stoh beh-neh",
    "buon giorno": "boo-ohn johr-noh",
    "come stai": "koh-meh stah-ee",
    "piacere di conoscerti": "pee-ah-cheh-reh dee koh-noh-shehr-tee",
    "a dopo": "ah doh-poh",
  },
  portuguese: {
    "olá": "oh-lah",
    "sim": "seem",
    "não": "now",
    "água": "ah-gwah",
    "comida": "koh-mee-dah",
    "bem": "beng",
    "ajuda": "ah-zhoo-dah",
    "obrigado": "oh-bree-gah-doh",
    "muito obrigado": "moo-ee-toh oh-bree-gah-doh",
    "estou bem": "ehs-toh beng",
    "bom dia": "bong dee-ah",
    "como vai": "koh-moh vah-ee",
  },
  german: {
    "hallo": "hah-loh",
    "ja": "yah",
    "nein": "na-een",
    "wasser": "vah-ser",
    "essen": "ehs-sen",
    "gut": "goot",
    "hilfe": "hil-feh",
    "danke": "dahn-keh",
    "vielen dank": "fee-len dahnk",
    "mir geht es gut": "meer geht ehs goot",
    "guten morgen": "goo-ten mohr-gen",
    "wie geht es dir": "vee geht ehs deer",
    "freut mich": "froyt meekh",
    "bis später": "bis shpeh-ter",
    "bitte": "bi-teh",
  },
  french: {
    "bonjour": "bon-zhoor",
    "oui": "oo-ee",
    "non": "non",
    "eau": "oh",
    "nourriture": "noo-ree-toor",
    "bien": "bee-en",
    "aide": "ehd",
    "merci": "mehr-see",
    "merci beaucoup": "mehr-see boh-koo",
    "je vais bien": "zhuh veh bee-en",
    "comment allez-vous": "koh-mon ah-leh-voo",
    "enchanté": "on-shon-teh",
    "à plus tard": "ah ploo tahr",
  },
  japanese: {
    "こんにちは": "kon-nee-chee-wah",
    "はい": "hah-ee",
    "いいえ": "ee-ee-eh",
    "水": "mee-zoo",
    "食べ物": "tah-beh-moh-noh",
    "良い": "yoh-ee",
    "助けて": "tah-soo-keh-teh",
    "ありがとう": "ah-ree-gah-toh",
    "ありがとうございます": "ah-ree-gah-toh goh-zah-ee-mahs",
    "元気です": "gen-kee dehs",
    "おはようございます": "oh-hah-yoh goh-zah-ee-mahs",
    "お元気ですか": "oh-gen-kee dehs-kah",
    "はじめまして": "hah-jee-meh-mah-shteh",
    "また後で": "mah-tah ah-toh-deh",
  },
  chinese: {
    "你好": "nee-how",
    "是": "shur",
    "不": "boo",
    "水": "shway",
    "食物": "shur-woo",
    "好": "how",
    "帮助": "bahng-zhoo",
    "谢谢": "shee-eh shee-eh",
    "非常感谢": "fay-chahng gahn-shee-eh",
    "我很好": "woh hen how",
    "早上好": "zow-shahng how",
    "你好吗": "nee-how mah",
    "很高兴认识你": "hen gow-sheeng ren-shur nee",
    "回头见": "hway-toh jee-en",
  },
  hindi: {
    "नमस्ते": "nah-mahs-teh",
    "हाँ": "haan",
    "नहीं": "nah-heen",
    "पानी": "pah-nee",
    "खाना": "khah-nah",
    "अच्छा": "ahch-chah",
    "मदद": "mah-dahd",
    "धन्यवाद": "dhahn-yah-vahd",
    "बहुत धन्यवाद": "bah-hoot dhahn-yah-vahd",
    "मैं ठीक हूँ": "mayn theek hoon",
    "सुप्रभात": "soo-prah-bhaht",
    "आप कैसे हैं": "ahp kay-seh hayn",
  },
  arabic: {
    "مرحبا": "mahr-hah-bah",
    "نعم": "nah-ahm",
    "لا": "lah",
    "ماء": "mah",
    "طعام": "tah-ahm",
    "جيد": "jay-yid",
    "مساعدة": "moo-sah-ah-dah",
    "شكرا": "shook-rahn",
    "شكرا جزيلا": "shook-rahn jah-zee-lahn",
    "أنا بخير": "ah-nah bee-khayr",
    "صباح الخير": "sah-bah ahl-khayr",
    "كيف حالك": "kayf hah-lahk",
  },
};

/**
 * Convert text to readable phonetic display.
 * Follows the "How-It-Sounds" Pronunciation Rule Sheet.
 * 
 * Examples:
 *   "I'm fine" → "Aeem faeen"
 *   "I" → "Aeem"
 *   "my" → "ma-ee"
 *   "you" → "yoo"
 *   "say" → "seh-ee"
 *   "no" → "noh"
 * 
 * @param {string} text - Input text
 * @param {string} language - Language code
 * @returns {string} - Readable phonetic representation
 */
export function textToPhonetic(text, language = 'english') {
  if (!text) return '';

  // For non-English languages, check language-specific dictionary first
  if (language !== 'english' && LANGUAGE_PHONETICS[language]) {
    const langDict = LANGUAGE_PHONETICS[language];
    const lower = text.toLowerCase().trim();
    
    // Check full phrase match first
    if (langDict[lower]) return langDict[lower];
    
    // Try word-by-word lookup
    const words = lower.split(/\s+/);
    const phoneticWords = words.map(word => {
      const cleaned = word.replace(/[^\p{L}\p{N}']/gu, '');
      if (!cleaned) return '';
      if (langDict[cleaned]) return langDict[cleaned];
      // For Latin-script languages, pass through (vowels are already pure)
      if (/^[a-zA-ZÀ-ÿ]+$/.test(cleaned)) return cleaned;
      // For non-Latin scripts, return as-is if not in dictionary
      return cleaned;
    });
    return phoneticWords.filter(w => w).join(' ');
  }

  const words = text.trim().split(/\s+/);
  const phoneticWords = words.map(word => {
    const lower = word.toLowerCase().replace(/[^a-z']/g, '');
    if (!lower) return '';

    // 1. Check exact word match in dictionary
    if (WORD_PHONETICS[lower]) {
      return WORD_PHONETICS[lower];
    }

    // 2. Check without apostrophe (e.g., "i'm" → look up "im" too)
    const noApostrophe = lower.replace(/'/g, '');
    if (WORD_PHONETICS[noApostrophe]) {
      return WORD_PHONETICS[noApostrophe];
    }

    // 3. Apply pattern-based rules for unknown words
    return applyPatternRules(lower);
  });

  return phoneticWords.filter(w => w).join(' ');
}

// =============================================================================
// IPA TO READABLE DISPLAY
// =============================================================================

/**
 * IPA to readable display mapping.
 * CRITICAL: Diphthongs are SEPARATED per the rule sheet.
 *   aɪ → "a-ee" NOT "ai"
 *   eɪ → "eh-ee" NOT "ay"
 *   ɔɪ → "o-ee" NOT "oy"
 *   aʊ → "a-oo" NOT "ow"
 */
const IPA_TO_READABLE = {
  // === VOWELS ===
  'i': 'ee', 'iː': 'ee', 'ɪ': 'i',
  'y': 'oo', 'yː': 'oo', 'ʏ': 'oo',
  'ɨ': 'ih', 'ʉ': 'oo',
  'ɯ': 'oo', 'u': 'oo', 'uː': 'oo', 'ʊ': 'oo',
  'e': 'eh', 'eː': 'eh',
  'ø': 'ur', 'øː': 'ur',
  'ɘ': 'uh', 'ɵ': 'ur',
  'ɤ': 'uh', 'o': 'oh', 'oː': 'oh',
  'ə': 'uh', 'ɚ': 'er',
  'ɛ': 'eh', 'ɜ': 'er', 'ɝ': 'er',
  'œ': 'ur', 'ɞ': 'ur',
  'ʌ': 'uh', 'ɔ': 'aw', 'ɔː': 'aw',
  'æ': 'a', 'ɐ': 'uh',
  'a': 'ah', 'aː': 'ah', 'ɑ': 'ah', 'ɑː': 'ah',
  'ɒ': 'o', 'ɒː': 'o',

  // === DIPHTHONGS — SEPARATED (Rule Sheet compliance) ===
  'eɪ': 'eh-ee',     // NOT "ay"
  'aɪ': 'a-ee',      // NOT "ai" or "eye"
  'ɔɪ': 'o-ee',      // NOT "oy"
  'oʊ': 'oh',        // Pure long o
  'əʊ': 'oh',        // Pure long o
  'aʊ': 'a-oo',      // NOT "ow"
  'ɪə': 'ee-er',
  'eə': 'eh-er',
  'ʊə': 'oo-er',
  'juː': 'yoo',
  'ju': 'yoo',
  'aɪə': 'a-ee-er',
  'aʊə': 'a-oo-er',

  // === CONSONANTS ===
  'p': 'p', 'b': 'b',
  't': 't', 'd': 'd',
  'ʈ': 't', 'ɖ': 'd',
  'c': 'k', 'ɟ': 'j',
  'k': 'k', 'g': 'g',
  'q': 'k', 'ɢ': 'g',
  'ʔ': '',
  'm': 'm', 'ɱ': 'm',
  'n': 'n', 'ɳ': 'n', 'ɲ': 'ny',
  'ŋ': 'ng', 'ɴ': 'ng',
  'ʙ': 'br', 'r': 'r', 'ʀ': 'r',
  'ⱱ': 'v', 'ɾ': 'r', 'ɽ': 'r',
  'ɸ': 'f', 'β': 'v',
  'f': 'f', 'v': 'v',
  'θ': 'th', 'ð': 'th',
  's': 's', 'z': 'z',
  'ʃ': 'sh', 'ʒ': 'zh',
  'ʂ': 'sh', 'ʐ': 'zh',
  'ç': 'h', 'ʝ': 'y',
  'x': 'kh', 'ɣ': 'gh',
  'χ': 'kh', 'ʁ': 'r',
  'ħ': 'h', 'ʕ': 'ah',
  'h': 'h', 'ɦ': 'h',
  'tʃ': 'ch', 'dʒ': 'j',
  'ts': 'ts', 'dz': 'dz',
  'tɕ': 'ch', 'dʑ': 'j',
  'ʋ': 'v', 'ɹ': 'r', 'ɻ': 'r',
  'j': 'y', 'ɰ': 'w',
  'w': 'w', 'ʍ': 'wh',
  'l': 'l', 'ɭ': 'l', 'ʎ': 'ly', 'ʟ': 'l',

  // === MODIFIERS (remove) ===
  'ˈ': '', 'ˌ': '',
  'ː': '',
  '.': '',
  'ʷ': 'w',
  'ʲ': 'y',
  'ˠ': '', 'ˤ': '',
};

/**
 * Convert a single IPA symbol to readable display
 */
export function ipaToReadable(ipa) {
  if (!ipa) return '';

  const clean = ipa.replace(/[ˈˌː.]/g, '').trim();
  if (!clean) return '';

  // Direct lookup
  if (IPA_TO_READABLE[clean]) return IPA_TO_READABLE[clean];

  // Try lowercase
  if (IPA_TO_READABLE[clean.toLowerCase()]) return IPA_TO_READABLE[clean.toLowerCase()];

  // Simple ASCII letter
  if (/^[a-z]$/i.test(clean)) return clean.toLowerCase();

  // Multi-character: try 3-char, 2-char, then 1-char combos
  if (clean.length > 1) {
    let result = '';
    let i = 0;
    while (i < clean.length) {
      // Try 3-char
      if (i + 2 < clean.length) {
        const three = clean.slice(i, i + 3);
        if (IPA_TO_READABLE[three]) {
          result += IPA_TO_READABLE[three];
          i += 3;
          continue;
        }
      }
      // Try 2-char
      if (i + 1 < clean.length) {
        const two = clean.slice(i, i + 2);
        if (IPA_TO_READABLE[two]) {
          result += IPA_TO_READABLE[two];
          i += 2;
          continue;
        }
      }
      // Single char
      result += IPA_TO_READABLE[clean[i]] || clean[i];
      i++;
    }
    return result;
  }

  return clean;
}

/**
 * Convert IPA sequence to readable display array
 */
export function ipaSequenceToReadable(ipaSequence) {
  if (!ipaSequence || !Array.isArray(ipaSequence)) return [];
  return ipaSequence
    .map(p => ipaToReadable(p.symbol || p))
    .filter(s => s.length > 0);
}

/**
 * Join IPA sequence as readable phonetic string
 */
export function ipaSequenceToPhoneticString(ipaSequence) {
  return ipaSequenceToReadable(ipaSequence).join('');
}

// =============================================================================
// FRAME TO SOUND NAME (for animation display)
// =============================================================================

export const FRAME_TO_SOUND_NAME = {
  0: 'neutral',
  1: 'ah/oo',
  2: 'eh',
  3: 'ee',
  4: 'ue',
  5: 'oh',
  6: 'k/g',
  7: 't/d',
  8: 'p/b/m',
  9: 'n',
  10: 'ng',
  11: 's',
  12: 'sh',
  13: 'th',
  14: 'f/v',
  15: 'ch',
  16: 'h',
  17: 'r',
  18: 'l',
  19: 'y',
};

export function getFrameSoundName(frameIndex) {
  return FRAME_TO_SOUND_NAME[frameIndex] || 'neutral';
}

export default {
  getLetterPhonetic,
  textToPhonetic,
  ipaToReadable,
  ipaSequenceToReadable,
  ipaSequenceToPhoneticString,
  getFrameSoundName,
  LETTER_PHONETICS,
  FRAME_TO_SOUND_NAME,
};
