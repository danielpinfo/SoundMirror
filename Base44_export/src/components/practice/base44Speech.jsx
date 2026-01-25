// components/practice/base44Speech.js
// Full replacement: picks best available voices (Google/Microsoft/Natural),
// cancels reliably, and forces phoneme pronunciation (not letter spelling)

let _voicesCache = [];
let _voicesReadyPromise = null;

const PREFERRED_NAME_HINTS = [
  "google",
  "microsoft",
  "natural",
  "neural",
  "premium",
  "enhanced",
  "online",
];

const AVOID_NAME_HINTS = [
  "espeak",
  "festival",
  "robot",
];

function _getSynth() {
  if (typeof window === "undefined") return null;
  return window.speechSynthesis || null;
}

function _normalizeLang(lang) {
  const s = String(lang || "en-US").trim();
  if (!s) return "en-US";
  if (s.includes("-")) return s;

  // "en" -> "en-US" etc
  const base = s.toLowerCase();
  if (base === "es") return "es-ES";
  if (base === "fr") return "fr-FR";
  if (base === "de") return "de-DE";
  if (base === "it") return "it-IT";
  if (base === "pt") return "pt-BR";
  if (base === "zh") return "zh-CN";
  if (base === "ja") return "ja-JP";
  return "en-US";
}

function _scoreVoice(v, requestedLang) {
  const req = _normalizeLang(requestedLang);
  const reqBase = req.split("-")[0].toLowerCase();
  const vLang = String(v?.lang || "").toLowerCase();
  const name = String(v?.name || "").toLowerCase();

  let score = 0;

  // Language match is king
  if (vLang === req.toLowerCase()) score += 1000;
  else if (vLang.startsWith(reqBase)) score += 800;
  else if (vLang.startsWith("en")) score += 200; // last resort

  // Prefer higher quality names
  for (const h of PREFERRED_NAME_HINTS) {
    if (name.includes(h)) score += 80;
  }
  for (const h of AVOID_NAME_HINTS) {
    if (name.includes(h)) score -= 200;
  }

  // Slight preference for non-local-service voices (often better)
  if (name.includes("local")) score -= 10;

  return score;
}

function _pickBestVoice(voices, requestedLang) {
  if (!voices || voices.length === 0) return null;

  let best = null;
  let bestScore = -Infinity;

  for (const v of voices) {
    const s = _scoreVoice(v, requestedLang);
    if (s > bestScore) {
      bestScore = s;
      best = v;
    }
  }
  return best;
}

function _loadVoicesOnce(timeoutMs = 2500) {
  if (_voicesReadyPromise) return _voicesReadyPromise;

  _voicesReadyPromise = new Promise((resolve) => {
    const synth = _getSynth();
    if (!synth || !synth.getVoices) return resolve([]);

    const tryGet = () => {
      const v = synth.getVoices();
      if (v && v.length) {
        _voicesCache = v;
        return true;
      }
      return false;
    };

    if (tryGet()) return resolve(_voicesCache);

    const onChanged = () => {
      if (tryGet()) {
        synth.removeEventListener?.("voiceschanged", onChanged);
        resolve(_voicesCache);
      }
    };
    synth.addEventListener?.("voiceschanged", onChanged);

    setTimeout(() => {
      tryGet();
      synth.removeEventListener?.("voiceschanged", onChanged);
      resolve(_voicesCache || []);
    }, timeoutMs);
  });

  return _voicesReadyPromise;
}

// Use WORD JOINER (U+2060) instead of space to prevent letter spelling
// Spaces (including hair-space) encourage letter spelling: "b a" -> "B-A"
const WORD_JOINER = "\u2060";

function _massageTextForTTS(text, lang = "en-US") {
  const t = String(text ?? "").trim().toLowerCase();
  if (!t) return "";

  // Only apply shaping to short, letter-only tokens like "ba", "ra", "sa", "ll", "ñ"
  // If it has spaces/punctuation already, leave it alone
  const isShortToken = /^[a-záéíóúüñ]{1,4}$/i.test(t);
  if (!isShortToken) return t;

  // Break abbreviation/initialism heuristics without inserting a word break
  // Example: "ba" -> "b⁠a" (with invisible word joiner)
  const shaped = t.split("").join(WORD_JOINER);

  // Tiny punctuation helps engines treat it as spoken text instead of an acronym
  return shaped + ".";
}

export function stop() {
  const synth = _getSynth();
  try {
    synth?.cancel?.();
  } catch (_) {}
}

export async function warmup(lang = "en-US") {
  // Loads voices early so first playback isn't "default/robot"
  await _loadVoicesOnce();
  // also "touch" the best voice so it gets selected immediately when speaking
  const v = _pickBestVoice(_voicesCache, lang);
  return v || null;
}

/**
 * speak(text, opts)
 * opts: { lang, rate, pitch, volume, interrupt=true }
 */
export async function speak(text, opts = {}) {
  const synth = _getSynth();
  if (!synth || typeof SpeechSynthesisUtterance === "undefined") {
    throw new Error("Speech synthesis not supported in this browser.");
  }

  const lang = _normalizeLang(opts.lang || "en-US");
  // CRITICAL: Force lowercase to prevent spelling out capital letters
  const toSpeakRaw = String(text ?? "").toLowerCase().trim();
  // HARD RULE: Pass language to massage function for language-specific phoneme rules
  const toSpeak = _massageTextForTTS(toSpeakRaw, lang);
  if (!toSpeak.trim()) return;

  // Always kill any queued speech so we don't replay old syllables.
  const interrupt = opts.interrupt !== false;
  if (interrupt) {
    try {
      synth.cancel();
      // Some engines need a tiny beat to truly clear
      await new Promise((r) => setTimeout(r, 30));
      synth.cancel();
    } catch (_) {}
  }

  await _loadVoicesOnce();
  
  // HARD RULE: Language-specific voice selection - NO BLEED-THROUGH between languages
  let voice;
  const langBase = lang.split('-')[0].toLowerCase();
  
  // Filter voices STRICTLY by language to prevent cross-contamination
  const languageMatchedVoices = _voicesCache.filter(v => {
    const vLang = String(v?.lang || "").toLowerCase();
    return vLang.startsWith(langBase);
  });
  
  if (languageMatchedVoices.length > 0) {
    // Within matched language, prefer high-quality voices
    voice = _pickBestVoice(languageMatchedVoices, lang);
  } else {
    // Fallback only if no language match found
    voice = _pickBestVoice(_voicesCache, lang);
  }

  // Normal speech rate - slow rates make spelling MORE likely for short tokens
  const rate = typeof opts.rate === "number" ? opts.rate : 0.9;
  const pitch = typeof opts.pitch === "number" ? opts.pitch : 1.0;
  const volume = typeof opts.volume === "number" ? opts.volume : 1.0;

  return new Promise((resolve, reject) => {
    try {
      const u = new SpeechSynthesisUtterance(toSpeak);
      u.lang = lang;
      if (voice) u.voice = voice;

      u.rate = Math.max(0.1, Math.min(2.0, rate));
      u.pitch = Math.max(0.0, Math.min(2.0, pitch));
      u.volume = Math.max(0.0, Math.min(1.0, volume));

      u.onend = () => resolve(true);
      u.onerror = (e) => reject(e);

      synth.speak(u);
    } catch (err) {
      reject(err);
    }
  });
}

// Preload voices silently in background without auto-playing
// This ensures first playback uses high-quality voices, not default
try {
  _loadVoicesOnce();
} catch (_) {}