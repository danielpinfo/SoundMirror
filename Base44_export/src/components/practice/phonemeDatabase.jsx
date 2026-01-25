// phonemeDatabase.js
// Pre-built phoneme data for common words - faster than LLM generation

export const PHONEME_DATABASE = {
  // Common practice words
  "hello": {
    text: "Hello",
    phonetic: "heh-LOH",
    phonemes: [
      { letter: "H", phoneme: "h", phonetic: "h", example: "hat", articulationTip: "Breathe out gently, mouth relaxed" },
      { letter: "E", phoneme: "ɛ", phonetic: "eh", example: "bed", articulationTip: "Open mouth slightly, tongue mid-front" },
      { letter: "L", phoneme: "l", phonetic: "l", example: "lip", articulationTip: "Tongue tip touches ridge behind upper teeth" },
      { letter: "O", phoneme: "oʊ", phonetic: "oh", example: "go", articulationTip: "Round lips, start open then close slightly" }
    ]
  },
  "world": {
    text: "World",
    phonetic: "WURLD",
    phonemes: [
      { letter: "W", phoneme: "w", phonetic: "w", example: "water", articulationTip: "Round lips tightly, then release" },
      { letter: "OR", phoneme: "ɜr", phonetic: "ur", example: "bird", articulationTip: "Curl tongue back, lips slightly rounded" },
      { letter: "L", phoneme: "l", phonetic: "l", example: "lip", articulationTip: "Tongue tip on ridge" },
      { letter: "D", phoneme: "d", phonetic: "d", example: "dog", articulationTip: "Tongue tip on ridge, release with voice" }
    ]
  },
  "three": {
    text: "Three",
    phonetic: "THREE",
    phonemes: [
      { letter: "TH", phoneme: "θ", phonetic: "th", example: "think", articulationTip: "Tongue tip between teeth, blow air gently" },
      { letter: "R", phoneme: "r", phonetic: "r", example: "red", articulationTip: "Curl tongue back, don't touch roof" },
      { letter: "EE", phoneme: "i", phonetic: "ee", example: "see", articulationTip: "Smile wide, tongue high and forward" }
    ]
  },
  "the": {
    text: "The",
    phonetic: "THUH",
    phonemes: [
      { letter: "TH", phoneme: "ð", phonetic: "th", example: "this", articulationTip: "Tongue between teeth, add voice vibration" },
      { letter: "E", phoneme: "ə", phonetic: "uh", example: "about", articulationTip: "Very relaxed, neutral mouth" }
    ]
  },
  "think": {
    text: "Think",
    phonetic: "THINK",
    phonemes: [
      { letter: "TH", phoneme: "θ", phonetic: "th", example: "three", articulationTip: "Tongue tip between teeth, no voice" },
      { letter: "I", phoneme: "ɪ", phonetic: "i", example: "sit", articulationTip: "Short sound, mouth slightly open" },
      { letter: "N", phoneme: "n", phonetic: "n", example: "no", articulationTip: "Tongue on ridge, hum through nose" },
      { letter: "K", phoneme: "k", phonetic: "k", example: "cat", articulationTip: "Back of tongue touches soft palate" }
    ]
  },
  "thank you": {
    text: "Thank you",
    phonetic: "THANK YOO",
    phonemes: [
      { letter: "TH", phoneme: "θ", phonetic: "th", example: "think", articulationTip: "Tongue between teeth, blow air" },
      { letter: "A", phoneme: "æ", phonetic: "a", example: "cat", articulationTip: "Open mouth, spread lips slightly" },
      { letter: "N", phoneme: "n", phonetic: "n", example: "no", articulationTip: "Tongue on ridge, hum through nose" },
      { letter: "K", phoneme: "k", phonetic: "k", example: "cat", articulationTip: "Back of tongue up" },
      { letter: "Y", phoneme: "j", phonetic: "y", example: "yes", articulationTip: "Tongue high and forward" },
      { letter: "OO", phoneme: "u", phonetic: "oo", example: "food", articulationTip: "Tight lip pucker" }
    ]
  },
  "beautiful": {
    text: "Beautiful",
    phonetic: "BYOO-tih-ful",
    phonemes: [
      { letter: "B", phoneme: "b", phonetic: "b", example: "bat", articulationTip: "Press lips together, release with voice" },
      { letter: "Y", phoneme: "j", phonetic: "y", example: "yes", articulationTip: "Tongue high, like starting 'ee'" },
      { letter: "OO", phoneme: "u", phonetic: "oo", example: "food", articulationTip: "Tight lip pucker" },
      { letter: "T", phoneme: "t", phonetic: "t", example: "top", articulationTip: "Tongue tip on ridge, release sharply" },
      { letter: "I", phoneme: "ɪ", phonetic: "ih", example: "sit", articulationTip: "Short, relaxed" },
      { letter: "F", phoneme: "f", phonetic: "f", example: "fun", articulationTip: "Upper teeth on lower lip" },
      { letter: "UL", phoneme: "əl", phonetic: "ul", example: "full", articulationTip: "Relaxed vowel into L" }
    ]
  },
  "water": {
    text: "Water",
    phonetic: "WAH-ter",
    phonemes: [
      { letter: "W", phoneme: "w", phonetic: "w", example: "wet", articulationTip: "Round lips tightly" },
      { letter: "A", phoneme: "ɔ", phonetic: "aw", example: "caught", articulationTip: "Open mouth, rounded lips" },
      { letter: "T", phoneme: "t", phonetic: "t", example: "top", articulationTip: "Quick tongue tap" },
      { letter: "ER", phoneme: "ər", phonetic: "er", example: "her", articulationTip: "Curl tongue back slightly" }
    ]
  },
  "question": {
    text: "Question",
    phonetic: "KWES-chun",
    phonemes: [
      { letter: "QU", phoneme: "kw", phonetic: "kw", example: "quick", articulationTip: "K sound into rounded W" },
      { letter: "E", phoneme: "ɛ", phonetic: "eh", example: "bed", articulationTip: "Mid-open mouth" },
      { letter: "S", phoneme: "s", phonetic: "s", example: "sun", articulationTip: "Teeth together, hiss" },
      { letter: "CH", phoneme: "tʃ", phonetic: "ch", example: "chair", articulationTip: "Start with T, release into SH" },
      { letter: "UN", phoneme: "ən", phonetic: "un", example: "button", articulationTip: "Relaxed vowel into N" }
    ]
  },
  "really": {
    text: "Really",
    phonetic: "REE-lee",
    phonemes: [
      { letter: "R", phoneme: "r", phonetic: "r", example: "red", articulationTip: "Curl tongue back, don't touch roof" },
      { letter: "EA", phoneme: "i", phonetic: "ee", example: "see", articulationTip: "Smile wide, long sound" },
      { letter: "LL", phoneme: "l", phonetic: "l", example: "lip", articulationTip: "Tongue tip on ridge" },
      { letter: "Y", phoneme: "i", phonetic: "ee", example: "happy", articulationTip: "End with smile" }
    ]
  },
  "computer": {
    text: "Computer",
    phonetic: "kum-PYOO-ter",
    phonemes: [
      { letter: "C", phoneme: "k", phonetic: "k", example: "cat", articulationTip: "Back of tongue up" },
      { letter: "O", phoneme: "ə", phonetic: "uh", example: "about", articulationTip: "Relaxed, quick" },
      { letter: "M", phoneme: "m", phonetic: "m", example: "mom", articulationTip: "Lips together, hum" },
      { letter: "P", phoneme: "p", phonetic: "p", example: "pop", articulationTip: "Lips together, puff of air" },
      { letter: "U", phoneme: "ju", phonetic: "yoo", example: "use", articulationTip: "Y glide into OO" },
      { letter: "T", phoneme: "t", phonetic: "t", example: "top", articulationTip: "Tongue tap" },
      { letter: "ER", phoneme: "ər", phonetic: "er", example: "her", articulationTip: "Curl tongue back" }
    ]
  },
  "pronunciation": {
    text: "Pronunciation",
    phonetic: "pruh-NUN-see-AY-shun",
    phonemes: [
      { letter: "P", phoneme: "p", phonetic: "p", example: "pop", articulationTip: "Lips together, puff" },
      { letter: "R", phoneme: "r", phonetic: "r", example: "red", articulationTip: "Curl tongue back" },
      { letter: "O", phoneme: "ə", phonetic: "uh", example: "about", articulationTip: "Quick, relaxed" },
      { letter: "N", phoneme: "n", phonetic: "n", example: "no", articulationTip: "Tongue on ridge" },
      { letter: "U", phoneme: "ʌ", phonetic: "uh", example: "cup", articulationTip: "Open, relaxed" },
      { letter: "N", phoneme: "n", phonetic: "n", example: "no", articulationTip: "Tongue on ridge" },
      { letter: "C", phoneme: "s", phonetic: "s", example: "sun", articulationTip: "Teeth together, hiss" },
      { letter: "I", phoneme: "i", phonetic: "ee", example: "see", articulationTip: "Smile wide" },
      { letter: "A", phoneme: "eɪ", phonetic: "ay", example: "say", articulationTip: "Start open, glide to EE" },
      { letter: "TION", phoneme: "ʃən", phonetic: "shun", example: "nation", articulationTip: "SH into relaxed UN" }
    ]
  },
  // Spanish words
  "manzana": {
    text: "Manzana",
    phonetic: "mahn-sa-nah",
    phonemes: [
      { letter: "M", phoneme: "m", phonetic: "m", example: "mesa", articulationTip: "Lips together, hum" },
      { letter: "A", phoneme: "a", phonetic: "ah", example: "casa", articulationTip: "Open mouth wide" },
      { letter: "N", phoneme: "n", phonetic: "n", example: "no", articulationTip: "Tongue on ridge" },
      { letter: "Z", phoneme: "s", phonetic: "sa", example: "zapato", articulationTip: "Teeth together, hiss" },
      { letter: "A", phoneme: "a", phonetic: "ah", example: "casa", articulationTip: "Open mouth wide" },
      { letter: "N", phoneme: "n", phonetic: "n", example: "no", articulationTip: "Tongue on ridge" },
      { letter: "A", phoneme: "a", phonetic: "ah", example: "casa", articulationTip: "Open mouth wide" }
    ]
  },
  "hola": {
    text: "Hola",
    phonetic: "oh-lah",
    phonemes: [
      { letter: "H", phoneme: "", phonetic: "", example: "hola", articulationTip: "Silent in Spanish" },
      { letter: "O", phoneme: "o", phonetic: "oh", example: "oso", articulationTip: "Round lips" },
      { letter: "L", phoneme: "l", phonetic: "l", example: "luna", articulationTip: "Tongue tip on ridge" },
      { letter: "A", phoneme: "a", phonetic: "ah", example: "casa", articulationTip: "Open mouth wide" }
    ]
  }
};

// Tongue/articulation presets for Pink Trombone visualization
export const TONGUE_PRESETS = {
  // Vowels
  "i": { tongueIndex: 0.9, tongueDiameter: 2.5, lipDiameter: 1.5, velum: 0.01 },
  "ɪ": { tongueIndex: 0.85, tongueDiameter: 2.8, lipDiameter: 1.5, velum: 0.01 },
  "e": { tongueIndex: 0.8, tongueDiameter: 3.0, lipDiameter: 1.5, velum: 0.01 },
  "ɛ": { tongueIndex: 0.75, tongueDiameter: 3.2, lipDiameter: 1.6, velum: 0.01 },
  "æ": { tongueIndex: 0.7, tongueDiameter: 3.5, lipDiameter: 1.7, velum: 0.01 },
  "ə": { tongueIndex: 0.5, tongueDiameter: 3.0, lipDiameter: 1.5, velum: 0.01 },
  "ʌ": { tongueIndex: 0.45, tongueDiameter: 3.3, lipDiameter: 1.6, velum: 0.01 },
  "ɑ": { tongueIndex: 0.3, tongueDiameter: 3.8, lipDiameter: 1.8, velum: 0.01 },
  "ɔ": { tongueIndex: 0.25, tongueDiameter: 3.5, lipDiameter: 1.0, velum: 0.01 },
  "o": { tongueIndex: 0.2, tongueDiameter: 3.2, lipDiameter: 0.8, velum: 0.01 },
  "ʊ": { tongueIndex: 0.15, tongueDiameter: 2.8, lipDiameter: 0.7, velum: 0.01 },
  "u": { tongueIndex: 0.1, tongueDiameter: 2.5, lipDiameter: 0.5, velum: 0.01 },
  
  // Consonants
  "p": { tongueIndex: 0.5, tongueDiameter: 3.0, lipDiameter: 0.0, velum: 0.01 },
  "b": { tongueIndex: 0.5, tongueDiameter: 3.0, lipDiameter: 0.0, velum: 0.01 },
  "m": { tongueIndex: 0.5, tongueDiameter: 3.0, lipDiameter: 0.0, velum: 0.4 },
  "f": { tongueIndex: 0.5, tongueDiameter: 3.0, lipDiameter: 0.3, velum: 0.01 },
  "v": { tongueIndex: 0.5, tongueDiameter: 3.0, lipDiameter: 0.3, velum: 0.01 },
  "θ": { tongueIndex: 0.95, tongueDiameter: 2.0, lipDiameter: 1.2, velum: 0.01 },
  "ð": { tongueIndex: 0.95, tongueDiameter: 2.0, lipDiameter: 1.2, velum: 0.01 },
  "t": { tongueIndex: 0.9, tongueDiameter: 0.5, lipDiameter: 1.5, velum: 0.01 },
  "d": { tongueIndex: 0.9, tongueDiameter: 0.5, lipDiameter: 1.5, velum: 0.01 },
  "n": { tongueIndex: 0.9, tongueDiameter: 0.5, lipDiameter: 1.5, velum: 0.4 },
  "s": { tongueIndex: 0.88, tongueDiameter: 1.0, lipDiameter: 1.3, velum: 0.01 },
  "z": { tongueIndex: 0.88, tongueDiameter: 1.0, lipDiameter: 1.3, velum: 0.01 },
  "ʃ": { tongueIndex: 0.75, tongueDiameter: 1.5, lipDiameter: 0.8, velum: 0.01 },
  "ʒ": { tongueIndex: 0.75, tongueDiameter: 1.5, lipDiameter: 0.8, velum: 0.01 },
  "tʃ": { tongueIndex: 0.78, tongueDiameter: 0.5, lipDiameter: 0.8, velum: 0.01 },
  "dʒ": { tongueIndex: 0.78, tongueDiameter: 0.5, lipDiameter: 0.8, velum: 0.01 },
  "k": { tongueIndex: 0.3, tongueDiameter: 0.5, lipDiameter: 1.5, velum: 0.01 },
  "g": { tongueIndex: 0.3, tongueDiameter: 0.5, lipDiameter: 1.5, velum: 0.01 },
  "ŋ": { tongueIndex: 0.3, tongueDiameter: 0.5, lipDiameter: 1.5, velum: 0.4 },
  "l": { tongueIndex: 0.85, tongueDiameter: 1.5, lipDiameter: 1.5, velum: 0.01 },
  "r": { tongueIndex: 0.6, tongueDiameter: 2.0, lipDiameter: 1.2, velum: 0.01 },
  "w": { tongueIndex: 0.15, tongueDiameter: 2.5, lipDiameter: 0.4, velum: 0.01 },
  "j": { tongueIndex: 0.9, tongueDiameter: 2.2, lipDiameter: 1.4, velum: 0.01 },
  "h": { tongueIndex: 0.5, tongueDiameter: 3.5, lipDiameter: 1.5, velum: 0.01 }
};

// Get phoneme data for a word (from database or fallback to generating)
export function getPhonemeData(word) {
  const key = word.toLowerCase().trim();
  return PHONEME_DATABASE[key] || null;
}

// Get tongue preset for a phoneme
export function getTonguePreset(phoneme) {
  return TONGUE_PRESETS[phoneme] || TONGUE_PRESETS["ə"]; // Default to schwa
}

// List of suggested words for practice
export const SUGGESTED_WORDS = [
  { word: "Hello", difficulty: "easy" },
  { word: "World", difficulty: "easy" },
  { word: "Three", difficulty: "medium" },
  { word: "The", difficulty: "easy" },
  { word: "Think", difficulty: "medium" },
  { word: "Thank you", difficulty: "medium" },
  { word: "Beautiful", difficulty: "hard" },
  { word: "Water", difficulty: "medium" },
  { word: "Question", difficulty: "hard" },
  { word: "Really", difficulty: "medium" },
  { word: "Computer", difficulty: "hard" },
  { word: "Pronunciation", difficulty: "hard" }
];