// coachingMessages.js
// ======================================================================
// Turns scoring-service output (phonemeScores) into user-facing tips
// for the UI.
// ======================================================================

// Base tips per phoneme (independent of issues)
const BASE_TIPS = {
  // TH
  TH: {
    title: "TH – Tongue Between Teeth",
    shortTip: "Gently bite your tongue and blow air.",
    detailedTip:
      "Place the tip of your tongue lightly between your upper and lower front teeth. Keep it relaxed and let air slide out between the tongue and teeth. Lips stay relaxed and slightly open.",
    commonSlip:
      "If it sounds like S or Z, your tongue is hiding behind your teeth. Show a little bit of tongue."
  },

  // R
  R: {
    title: "R – Pull Tongue Back, Don't Tap",
    shortTip: "Curl or bunch your tongue back, not up.",
    detailedTip:
      "Pull the front of your tongue slightly back so it doesn't touch the teeth. The sides of the tongue touch the back side teeth. Lips can be slightly rounded.",
    commonSlip:
      "If it sounds like L, your tongue tip is touching the ridge. Lift it off and pull it back."
  },

  // L
  L: {
    title: "L – Tongue Touches the Ridge",
    shortTip: "Tap the ridge behind your top teeth.",
    detailedTip:
      "Raise the tip of your tongue to the bumpy ridge just behind your upper front teeth. Keep the sides of the tongue slightly lowered so air flows around.",
    commonSlip:
      "If it sounds like W or O, your tongue might be too far back. Make sure the tip really touches the ridge."
  },

  // S / Z
  S: {
    title: "S/Z – Narrow Air Channel",
    shortTip: "Teeth nearly closed, tongue just behind them.",
    detailedTip:
      "Bring your upper and lower teeth close together. Place the tongue just behind the upper teeth, not pressing too hard. Create a tiny air channel down the center of the tongue and push air through.",
    commonSlip:
      "If it sounds like SH, your tongue is too far back or your lips are rounded. Flatten the tongue and spread the lips slightly."
  },

  // SH
  SH: {
    title: "SH – Lips Rounded, Tongue Back",
    shortTip: "Round your lips and pull your tongue back.",
    detailedTip:
      "Move your tongue slightly back and flatten it. Round your lips a little, like for 'shoe'. Teeth are close but not touching. Let air pass over the tongue for a soft, long friction sound.",
    commonSlip:
      "If it sounds like S, your lips are too spread or tongue too far forward. Round the lips and pull the tongue back."
  },

  // CH / JH
  CH: {
    title: "CH/J – Stop + SH",
    shortTip: "Start like T/D, release like SH.",
    detailedTip:
      "Touch the tongue tip to the ridge behind your top teeth, build pressure like T/D, then release into a SH shape with the tongue slightly back and lips a bit rounded.",
    commonSlip:
      "If it sounds like SH only, you're skipping the quick stop. Add a brief, closed contact before releasing."
  },

  // F/V
  F: {
    title: "F/V – Lip on Teeth",
    shortTip: "Rest your top teeth on your bottom lip.",
    detailedTip:
      "Place your top front teeth gently on your lower lip. Blow air between the teeth and lip for F. Turn on your voice for V. Keep the lips soft, not tightly pressed.",
    commonSlip:
      "If it sounds like P or B, your lips are closing fully. Keep the teeth on the lip and don't seal the mouth."
  },

  // K/G
  K: {
    title: "K/G – Back of Tongue Up",
    shortTip: "Lift the back of your tongue to the soft palate.",
    detailedTip:
      "Raise the back of your tongue to touch the soft area at the back of your mouth. Hold briefly, then release the air. Voice off for K, on for G.",
    commonSlip:
      "If it sounds like T or D, you're using the tongue tip instead of the back. Focus on lifting the back of the tongue."
  },

  // T/D
  T: {
    title: "T/D – Tongue Tip Tap",
    shortTip: "Quick tap on the ridge behind your teeth.",
    detailedTip:
      "Touch your tongue tip firmly to the ridge behind your upper front teeth. Build a tiny bit of pressure, then release sharply. Voice off for T, on for D.",
    commonSlip:
      "If it sounds like K, you're using the back of your tongue. Use the tip instead."
  },

  // P/B
  P: {
    title: "P/B – Lips Pop",
    shortTip: "Press lips together, then pop them open.",
    detailedTip:
      "Press both lips firmly together, build up a little air pressure, then release with a small burst. Voice off for P, on for B.",
    commonSlip:
      "If there's no pop, you might be releasing too slowly. Make it quick and crisp."
  },

  // M
  M: {
    title: "M – Lips Closed, Nose On",
    shortTip: "Close both lips and hum through your nose.",
    detailedTip:
      "Press your lips together, keep your tongue relaxed inside, and let your voice vibrate through your nose.",
    commonSlip:
      "If there's no hum, you may be leaking air through your mouth. Keep the lips fully closed."
  },

  // N
  N: {
    title: "N – Tongue on Ridge, Nose On",
    shortTip: "Touch the ridge with your tongue and hum.",
    detailedTip:
      "Place your tongue tip on the ridge behind your upper front teeth, keep the lips apart, and let your voice flow through the nose.",
    commonSlip:
      "If it sounds like D, you may be blocking your nose. Relax and let the sound vibrate in your nose."
  },

  // NG
  NG: {
    title: "NG – Back of Tongue Up, Nose On",
    shortTip: "Lift the back of your tongue and hum.",
    detailedTip:
      "Raise the back of your tongue toward the soft palate, mouth slightly open, and let your voice resonate through your nose.",
    commonSlip:
      "If you add a hard G at the end, relax the tongue so the sound fades instead of popping."
  },

  // W
  W: {
    title: "W – Round Lips, Glide Open",
    shortTip: "Start with tight round lips, then open.",
    detailedTip:
      "Round your lips tightly like you're about to whistle. Voice on, then quickly glide your lips open into the next vowel.",
    commonSlip:
      "If it sounds like V, your teeth are touching your lip. Keep teeth away from lips."
  },

  // Y
  Y: {
    title: "Y – Tongue High, Glide Down",
    shortTip: "Tongue high and front, like starting 'ee'.",
    detailedTip:
      "Raise the front of your tongue high toward the roof of your mouth, almost like saying 'ee'. Then glide down into the next vowel.",
    commonSlip:
      "If it sounds like J, you're adding too much friction. Keep it smooth and gliding."
  },

  // H
  HH: {
    title: "H – Open Throat Breath",
    shortTip: "Open your throat and breathe out gently.",
    detailedTip:
      "Keep your mouth open and relaxed. Let air flow freely from your throat without any friction or vibration.",
    commonSlip:
      "If it's too harsh, you might be tightening your throat. Relax and let it be a gentle breath."
  },

  // Vowels

  IY: {
    title: "EE – Tongue High and Front",
    shortTip: "Smile slightly; tongue high and front.",
    detailedTip:
      "Spread your lips into a small smile. Raise the front of your tongue close to the roof of the mouth. Jaw almost closed.",
    commonSlip: undefined
  },

  IH: {
    title: "I (sit) – Relaxed High Front",
    shortTip: "Like EE but more relaxed.",
    detailedTip:
      "Similar to EE but with a more relaxed tongue and slightly more open jaw. Don't smile as wide.",
    commonSlip: undefined
  },

  EH: {
    title: "E (bed) – Mid Front Vowel",
    shortTip: "Open mouth a bit more than EE.",
    detailedTip:
      "Lower your jaw slightly from EE position. Tongue is mid-height in the front of your mouth.",
    commonSlip: undefined
  },

  AE: {
    title: "A (cat) – Mouth Open, Tongue Low",
    shortTip: "Open wide; tongue low and front.",
    detailedTip:
      "Drop your jaw more than usual. Keep the tongue low and toward the front. Lips are relaxed, not rounded.",
    commonSlip: undefined
  },

  AH: {
    title: "UH (cup) – Central Relaxed",
    shortTip: "Relaxed mouth, tongue in the middle.",
    detailedTip:
      "Keep your mouth and tongue relaxed in a neutral position. Jaw slightly open.",
    commonSlip: undefined
  },

  AA: {
    title: "AH (father) – Open Back Vowel",
    shortTip: "Open wide, tongue low and back.",
    detailedTip:
      "Open your mouth wide. Keep the tongue low and pulled back. Lips are not rounded.",
    commonSlip: undefined
  },

  AO: {
    title: "AW (caught) – Rounded Back",
    shortTip: "Round lips, tongue back.",
    detailedTip:
      "Round your lips slightly. Tongue is low and pulled back. Jaw is fairly open.",
    commonSlip: undefined
  },

  OW: {
    title: "OH (go) – Round and Glide",
    shortTip: "Start rounded, glide to tighter.",
    detailedTip:
      "Start with rounded lips and tongue back. Glide toward a tighter lip position like OO.",
    commonSlip: undefined
  },

  UH: {
    title: "OO (book) – Relaxed Round",
    shortTip: "Slightly rounded, relaxed position.",
    detailedTip:
      "Round your lips gently. Tongue is high and back but relaxed. Not as tight as OO in 'food'.",
    commonSlip: undefined
  },

  UW: {
    title: "OO (food) – Lips Rounded, Tongue Back",
    shortTip: "Round and push your lips forward.",
    detailedTip:
      "Round your lips and push them slightly forward. Raise the back of your tongue toward the soft palate. Jaw almost closed.",
    commonSlip: undefined
  },

  ER: {
    title: "ER – R-Colored Vowel",
    shortTip: "Pull your tongue back; lips slightly rounded.",
    detailedTip:
      "Pull the front of your tongue back from the teeth, bunched in the middle of the mouth. Lips gently rounded.",
    commonSlip:
      "If it sounds like UH, pull the tongue further back and add a little lip rounding."
  },

  AY: {
    title: "AI (my) – Open to High Glide",
    shortTip: "Start open, glide to EE position.",
    detailedTip:
      "Start with mouth open and tongue low (like AH). Glide smoothly to a high front position (like IH).",
    commonSlip: undefined
  },

  AW: {
    title: "OW (cow) – Open to Round Glide",
    shortTip: "Start open, glide to OO position.",
    detailedTip:
      "Start with mouth open and tongue low. Glide to rounded lips and tongue back (like UH).",
    commonSlip: undefined
  },

  OY: {
    title: "OI (boy) – Round to High Glide",
    shortTip: "Start rounded, glide to EE position.",
    detailedTip:
      "Start with rounded lips and tongue back (like AO). Glide to high front tongue (like IH).",
    commonSlip: undefined
  },

  EY: {
    title: "AY (say) – Mid to High Glide",
    shortTip: "Start mid-open, glide toward EE.",
    detailedTip:
      "Start with mouth slightly open, tongue mid-front. Glide smoothly toward the EE position.",
    commonSlip: undefined
  }
};

// Symbol normalization map
const SYMBOL_MAP = {
  Z: "S",
  DH: "TH",
  ZH: "SH",
  JH: "CH",
  V: "F",
  G: "K",
  D: "T",
  B: "P"
};

function normalizeSymbol(symbol) {
  return SYMBOL_MAP[symbol] || symbol;
}

function inferSeverity(score, issues) {
  if (score >= 85 && issues.length === 0) return "nice";
  if (score >= 60) return "focus";
  return "struggle";
}

/**
 * Get coaching message for a phoneme score from scoring-service
 * @param {Object} scoreObj - { symbol, score, issues, weight }
 * @returns {Object} CoachingMessage
 */
export function getCoachingForPhoneme(scoreObj) {
  const baseKey = normalizeSymbol(scoreObj.symbol);
  const base = BASE_TIPS[baseKey];

  // Fallback generic tip
  const defaultBase = {
    title: `${scoreObj.symbol} – Keep practicing this sound`,
    shortTip: "Watch the model carefully and copy the mouth shape.",
    detailedTip:
      "Focus on the position of your tongue, lips, and jaw. Try to exaggerate the shape slightly to feel the movement.",
    commonSlip: undefined
  };

  const chosen = base ?? defaultBase;
  const severity = inferSeverity(scoreObj.score, scoreObj.issues || []);

  let detailedTip = chosen.detailedTip;
  let commonSlip = chosen.commonSlip;

  // Add issue-specific guidance
  if (scoreObj.issues?.includes("missing")) {
    detailedTip +=
      " Try to make this sound clearly instead of skipping it. Hold it a little longer so we can hear it.";
  }

  if (scoreObj.issues?.includes("substitution")) {
    detailedTip +=
      " It sounded like a different sound. Focus on the specific mouth position for this phoneme.";
  }

  if (scoreObj.issues?.includes("duration") || scoreObj.issues?.includes("too_short") || scoreObj.issues?.includes("short")) {
    detailedTip +=
      " Try holding this sound a bit longer.";
  }

  if (scoreObj.issues?.includes("too_long") || scoreObj.issues?.includes("long")) {
    detailedTip +=
      " Try making this sound a bit shorter and crisper.";
  }

  return {
    phoneme: scoreObj.symbol,
    title: chosen.title,
    shortTip: chosen.shortTip,
    detailedTip,
    commonSlip,
    issueLabels: scoreObj.issues || [],
    severity
  };
}

/**
 * Get severity color classes for UI
 */
export function getSeverityColors(severity) {
  switch (severity) {
    case "nice":
      return {
        bg: "bg-green-50",
        border: "border-green-200",
        text: "text-green-800",
        badge: "bg-green-100 text-green-700"
      };
    case "focus":
      return {
        bg: "bg-amber-50",
        border: "border-amber-200",
        text: "text-amber-800",
        badge: "bg-amber-100 text-amber-700"
      };
    case "struggle":
      return {
        bg: "bg-red-50",
        border: "border-red-200",
        text: "text-red-800",
        badge: "bg-red-100 text-red-700"
      };
    default:
      return {
        bg: "bg-slate-50",
        border: "border-slate-200",
        text: "text-slate-800",
        badge: "bg-slate-100 text-slate-700"
      };
  }
}

/**
 * Get severity label for display
 */
export function getSeverityLabel(severity) {
  switch (severity) {
    case "nice":
      return "Great!";
    case "focus":
      return "Keep practicing";
    case "struggle":
      return "Needs work";
    default:
      return "";
  }
}