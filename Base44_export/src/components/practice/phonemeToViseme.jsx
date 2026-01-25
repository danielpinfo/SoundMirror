// Complete English A-Z letter-to-viseme mapping
const LETTER_TO_VISEME = {
  // Vowels (open mouth)
  A: "open",
  E: "open",
  I: "open",
  O: "open",
  U: "open",

  // Bilabials (closed lips)
  M: "bilabial",
  B: "bilabial",
  P: "bilabial",

  // Labiodentals (F/V)
  F: "fv",
  V: "fv",

  // Sibilants / fricatives
  S: "sibilant",
  Z: "sibilant",
  C: "sibilant",
  X: "sibilant",
  J: "sibilant",

  // R sound
  R: "r",

  // Everything else: neutral
  D: "neutral",
  T: "neutral",
  N: "neutral",
  L: "neutral",
  K: "neutral",
  G: "neutral",
  H: "neutral",
  Q: "neutral",
  W: "neutral",
  Y: "neutral"
};

/**
 * Map a generic symbol (letter, digraph, simple phoneme string, or IPA fragment)
 * to one of our mouth "viseme" keys:
 *
 * - "open"
 * - "bilabial"
 * - "fv"
 * - "sibilant"
 * - "th"
 * - "neutral"
 *
 * This function is designed to be language-agnostic: it can handle
 * simple Latin letters (A, B, CH, LL, etc.) and some common IPA
 * phoneme forms (tʃ, dʒ, ʃ, ʒ, θ, ð, ɲ, ʝ, etc.).
 */
export function symbolToViseme(symbol) {
  if (symbol == null) return "neutral";

  const raw = symbol.toString().trim();
  if (!raw) return "neutral";

  const lower = raw.toLowerCase();
  const upper = raw.toUpperCase();

  // ---- 1) IPA dental/interdental fricatives ----
  if (lower.includes("θ") || lower.includes("ð")) {
    return "th";
  }

  // ---- 2) English TH digraph ----
  if (upper === "TH") {
    return "th";
  }

  // ---- 3) Single-letter mapping using LETTER_TO_VISEME ----
  if (upper.length === 1 && LETTER_TO_VISEME[upper]) {
    return LETTER_TO_VISEME[upper];
  }

  // ---- 4) Spanish digraphs ----
  if (upper === "CH") {
    return "sibilant";
  }

  if (upper === "LL" || upper === "RR") {
    return "open";
  }

  if (upper === "Ñ") {
    return "open";
  }

  // ---- 5) IPA / phoneme-aware mapping ----
  const hasIpaChars = /[ʃʒʂʐʝɲθðɟçɕʑt͡ʃd͡ʒ]/u.test(lower);

  if (hasIpaChars) {
    if (
      lower.includes("tʃ") ||
      lower.includes("t͡ʃ") ||
      lower.includes("dʒ") ||
      lower.includes("d͡ʒ") ||
      lower.includes("ʃ") ||
      lower.includes("ʒ") ||
      lower.includes("ç") ||
      lower.includes("ɕ") ||
      lower.includes("ʑ")
    ) {
      return "sibilant";
    }

    if (lower.includes("ɲ")) {
      return "open";
    }

    if (lower.includes("ʝ") || lower.includes("ʎ") || lower === "j") {
      return "open";
    }

    if (/[aeiouɑæɛɪʊʌɔøyœɶɐəɜ]/u.test(lower)) {
      return "open";
    }
  }

  // ---- 6) Simple vowel heuristic ----
  const firstChar = upper[0];
  if ("AEIOUÁÉÍÓÚ".includes(firstChar)) {
    return "open";
  }

  // ---- 7) Fallback ----
  return "neutral";
}