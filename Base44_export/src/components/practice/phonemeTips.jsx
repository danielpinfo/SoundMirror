// Professional phoneme tips based on articulatory phonetics research
// References: DVTD (Dresden Vocal Tract Dataset), VocalTractLab, Oculus OVR LipSync

export const PHONEME_TIPS = {
  // TH sounds - dental fricatives
  TH: {
    title: 'TH (/θ ð/) – Tongue Between Teeth',
    short: 'Gently bite your tongue and blow air.',
    detailed: 'Place the tip of your tongue lightly between your upper and lower front teeth. Keep your tongue relaxed. Let the air slide over the tongue and out between the teeth. Your lips stay relaxed and slightly open.',
    mistake: 'If it sounds like "s" or "z", your tongue is hiding behind your teeth. Show a little bit of tongue.',
    category: 'fricative'
  },
  
  // R sound - approximant
  R: {
    title: 'R (/r/) – Pull Tongue Back, Don\'t Tap',
    short: 'Curl or bunch your tongue back, not up.',
    detailed: 'Pull the front of your tongue slightly back so it doesn\'t touch the teeth. The sides of the tongue gently touch the back side teeth. Lips can be slightly rounded. Keep the tongue off the alveolar ridge (the bump behind your upper teeth).',
    mistake: 'If it sounds like "L", your tongue tip is touching the ridge. Lift it off and pull it back.',
    category: 'approximant'
  },
  
  // L sound - lateral approximant
  L: {
    title: 'L (/l/) – Tongue Touches the Ridge',
    short: 'Tap the ridge behind your top teeth.',
    detailed: 'Raise the tip of your tongue to the bumpy ridge just behind your upper front teeth. For "clear L" (start of a syllable), keep the tongue front raised and the sides lowered. For "dark L" (end of a word), the back of the tongue lifts slightly toward the soft palate.',
    mistake: 'If it sounds like "w" or "o", your tongue might be too far back. Make sure the tip really touches the ridge.',
    category: 'approximant'
  },
  
  // S/Z sounds - sibilants
  S: {
    title: 'S/Z (/s z/) – Narrow Air Channel',
    short: 'Teeth nearly closed, tongue behind them.',
    detailed: 'Bring your upper and lower teeth close together (small gap). Place the tongue just behind the upper teeth, not touching them too hard. Create a tiny air channel down the middle of the tongue. Push air through that channel so you hear a hissing sound.',
    mistake: 'If it sounds like "sh", your tongue is too far back or lips are too rounded. Flatten the tongue and spread the lips slightly.',
    category: 'fricative'
  },
  Z: { 
    title: 'S/Z (/s z/) – Narrow Air Channel',
    short: 'Teeth nearly closed, tongue behind them.',
    detailed: 'Same as S, but with voice ON.',
    mistake: 'If it sounds like "sh", your tongue is too far back.',
    category: 'fricative'
  },
  
  // SH sound - postalveolar fricative
  SH: {
    title: 'SH (/ʃ/) – Lips Rounded, Tongue Back',
    short: 'Round your lips and pull your tongue back.',
    detailed: 'Move your tongue slightly back and flatten it. Round your lips a little as if you\'re about to say "shoe." Teeth are close but not touching. Let the air pass over the center of the tongue with a soft, longer friction sound.',
    mistake: 'If it sounds like "s", your lips are too spread or tongue too far forward. Round the lips and pull the tongue back.',
    category: 'fricative'
  },
  
  // CH/J sounds - affricates
  CH: {
    title: 'CH/J (/tʃ dʒ/) – Stop + SH',
    short: 'Start like "T/D", release like "SH".',
    detailed: 'For CH, touch the tongue tip to the alveolar ridge (like /t/), build pressure, then release into a SH shape (tongue back, lips slightly rounded). For J, do the same with voicing (voice ON).',
    mistake: 'If it sounds like "sh" only, you\'re skipping the stop part. Add a short, closed contact before releasing.',
    category: 'affricate'
  },
  J: {
    title: 'CH/J (/tʃ dʒ/) – Stop + SH',
    short: 'Start like "D", release like "ZH".',
    detailed: 'Touch the tongue tip to the ridge, build pressure with voice ON, then release into a ZH shape.',
    mistake: 'If it sounds like "zh" only, add the stop part at the beginning.',
    category: 'affricate'
  },
  
  // F/V sounds - labiodental
  F: {
    title: 'F/V (/f v/) – Lip on Teeth',
    short: 'Gently bite your bottom lip with your top teeth.',
    detailed: 'Place your top front teeth gently on your bottom lip. Blow air between the teeth and lip for /f/. Turn on your voice for /v/. Keep the jaw relaxed and the lips soft, not pulled back.',
    mistake: 'If it sounds like "p" or "b", your lips are closing fully. Keep the teeth on the lip and don\'t seal the mouth.',
    category: 'fricative'
  },
  V: {
    title: 'F/V (/f v/) – Lip on Teeth',
    short: 'Same as F, but with voice ON.',
    detailed: 'Place your top front teeth gently on your bottom lip. Turn on your voice and blow air.',
    mistake: 'If it sounds like "b", your lips are closing fully.',
    category: 'fricative'
  },
  
  // P/B sounds - bilabial stops
  P: {
    title: 'P/B (/p b/) – Both Lips Closed, Then Burst',
    short: 'Close your lips, build pressure, then pop.',
    detailed: 'Close both lips firmly. Build a little air pressure behind the lips. Then open them quickly so the air bursts out. For /b/, turn your voice on; for /p/, keep it off.',
    mistake: 'If there\'s no clear "pop", you may be opening too slowly or not building enough pressure.',
    category: 'stop'
  },
  B: {
    title: 'P/B (/p b/) – Both Lips Closed, Then Burst',
    short: 'Close your lips, build pressure with voice, then pop.',
    detailed: 'Same as P, but with voice ON throughout.',
    mistake: 'If there\'s no clear burst, build more pressure before releasing.',
    category: 'stop'
  },
  
  // M sound - bilabial nasal
  M: {
    title: 'M (/m/) – Lips Closed, Air Through Nose',
    short: 'Close your lips and hum.',
    detailed: 'Press both lips together gently. Voice is ON. The air flows out through your nose, creating a humming sound. Keep lips relaxed, not tense.',
    mistake: 'If it sounds muffled, your nose might be blocked. Make sure air can flow through your nose.',
    category: 'nasal'
  },
  
  // N sound - alveolar nasal
  N: {
    title: 'N (/n/) – Tongue on Ridge, Air Through Nose',
    short: 'Touch tongue to ridge, hum through nose.',
    detailed: 'Press the tip of your tongue against the alveolar ridge (behind upper front teeth). Voice is ON. Air flows out through your nose.',
    mistake: 'If it sounds like "m", your tongue isn\'t touching the ridge. Make sure the tip touches.',
    category: 'nasal'
  },
  
  // NG sound - velar nasal
  NG: {
    title: 'NG (/ŋ/) – Back of Tongue Up, Air Through Nose',
    short: 'Lift back of tongue to soft palate.',
    detailed: 'Raise the back of your tongue to touch the soft palate (back of the roof of your mouth). Voice is ON. Air flows through your nose.',
    mistake: 'If it sounds like "n", your tongue is too far forward. Use the back of your tongue.',
    category: 'nasal'
  },
  
  // K/G sounds - velar stops
  K: {
    title: 'K/G (/k g/) – Back of Tongue Up',
    short: 'Lift the back of your tongue to the soft palate.',
    detailed: 'Raise the back (dorsum) of your tongue to touch the soft palate (the soft area at the back of the mouth). Hold briefly, then release the air. Lips are neutral. Voice off for /k/, on for /g/.',
    mistake: 'If it sounds like "t" or "d", you\'re using the tip instead of the back. Focus on lifting the back of the tongue.',
    category: 'stop'
  },
  G: {
    title: 'K/G (/k g/) – Back of Tongue Up',
    short: 'Lift back of tongue, with voice ON.',
    detailed: 'Same as K, but with voice ON throughout.',
    mistake: 'If it sounds like "d", you\'re using the tongue tip instead of the back.',
    category: 'stop'
  },
  
  // T/D sounds - alveolar stops
  T: {
    title: 'T/D (/t d/) – Tongue Tip on Ridge',
    short: 'Touch tongue tip to the ridge, then release.',
    detailed: 'Press the tip of your tongue firmly against the alveolar ridge (behind upper front teeth). Build a little pressure, then release quickly. Voice off for /t/, on for /d/.',
    mistake: 'If the sound is unclear, make sure you\'re releasing the tongue quickly.',
    category: 'stop'
  },
  D: {
    title: 'T/D (/t d/) – Tongue Tip on Ridge',
    short: 'Touch tongue tip to ridge with voice ON.',
    detailed: 'Same as T, but with voice ON.',
    mistake: 'If it sounds like "t", add your voice.',
    category: 'stop'
  },
  
  // Y sound - palatal approximant
  Y: {
    title: 'Y (/j/) – Tongue High and Forward',
    short: 'Like starting to say "ee", then slide into the next sound.',
    detailed: 'Raise the front of your tongue very high toward the hard palate, almost touching it. Lips spread slightly like a gentle smile. Then glide smoothly into the following vowel.',
    mistake: 'If it sounds like "ee", you\'re holding too long. Make it a quick glide.',
    category: 'approximant'
  },
  
  // W sound - labial-velar approximant
  W: {
    title: 'W (/w/) – Rounded Lips, Tongue Back',
    short: 'Round your lips tightly and push them forward.',
    detailed: 'Round and push your lips forward, almost like saying "oo". Raise the back of your tongue toward the soft palate. Then glide into the following vowel.',
    mistake: 'If it sounds like "v", your bottom lip is touching your teeth. Keep both lips rounded and forward.',
    category: 'approximant'
  },
  
  // H sound
  H: {
    title: 'H (/h/) – Open Throat, Breathe Out',
    short: 'Open mouth, push air from throat.',
    detailed: 'Open your mouth in the position of the vowel that follows. Push air from your throat without any friction. It\'s like a soft exhale.',
    mistake: 'If it\'s too harsh, relax your throat more.',
    category: 'fricative'
  },
  
  // Vowels
  EE: {
    title: '/iː/ (EE) – as in "see"',
    short: 'Smile slightly; tongue high and front.',
    detailed: 'Spread your lips into a small smile. Raise the front of your tongue very close to the hard palate. Jaw is almost closed. Air flows smoothly without friction.',
    category: 'vowel'
  },
  I: {
    title: '/ɪ/ (IH) – as in "sit"',
    short: 'Relaxed smile, tongue slightly lower.',
    detailed: 'Similar to EE but more relaxed. Tongue is high but not as close to the palate. Lips slightly spread.',
    category: 'vowel'
  },
  E: {
    title: '/e/ (EY) – as in "say"',
    short: 'Mid-open mouth, tongue mid-front.',
    detailed: 'Open mouth slightly more than for EE. Tongue is in the middle height, toward the front. May glide slightly toward EE at the end.',
    category: 'vowel'
  },
  A: {
    title: '/æ/ (A) – as in "cat"',
    short: 'Open wide; tongue low and front.',
    detailed: 'Drop your jaw more than for other vowels. Keep the tongue low and toward the front of the mouth. Lips are relaxed, not rounded.',
    category: 'vowel'
  },
  AH: {
    title: '/ɑː/ (AH) – as in "father"',
    short: 'Open wide; tongue low and back.',
    detailed: 'Drop your jaw. Move the tongue low and toward the back of the mouth. Lips relaxed and slightly open.',
    category: 'vowel'
  },
  O: {
    title: '/ɔː/ (AW) – as in "saw"',
    short: 'Round lips slightly; jaw open.',
    detailed: 'Open your jaw moderately. Round your lips a little. Tongue is in the back, mid-height.',
    category: 'vowel'
  },
  OO: {
    title: '/uː/ (OO) – as in "food"',
    short: 'Round and push your lips forward.',
    detailed: 'Round your lips and push them slightly forward. Raise the back of your tongue so it is close to the soft palate. Jaw nearly closed.',
    category: 'vowel'
  },
  U: {
    title: '/ʊ/ (UH) – as in "book"',
    short: 'Relaxed lip rounding, tongue high-back.',
    detailed: 'Similar to OO but more relaxed. Lips rounded but not as pushed forward. Tongue high in the back.',
    category: 'vowel'
  },
  ER: {
    title: '/ɜːr/ (ER) – as in "bird"',
    short: 'Pull tongue back; lips slightly rounded.',
    detailed: 'Pull the front of your tongue back from the teeth, either bunched high in the center or slightly curled back. Lips can be gently rounded. The tongue does not touch the ridge or teeth.',
    category: 'vowel'
  }
};

// Feedback messages based on score
export const FEEDBACK_MESSAGES = {
  high: [
    "Great work! Your mouth shape is very close to the target.",
    "This is sounding and looking strong. Keep it up.",
    "You've almost mastered this one. One or two more tries and you're golden.",
    "Excellent! Your articulation is on point."
  ],
  medium: [
    "You're close. Let's fine-tune the tongue and lip position.",
    "Nice start — your sound is almost there. Focus on the highlighted areas.",
    "Good progress! Try one more time and exaggerate the mouth shape a bit.",
    "Getting there! Pay attention to the tips below."
  ],
  low: [
    "That's okay — this is a tricky sound for many learners.",
    "We found a few things to adjust. Watch the model slowly, then try again.",
    "Don't worry about the score. Focus on copying the shape, not being perfect.",
    "Let's work on this together. Focus on one tip at a time."
  ],
  improvement: [
    "Nice improvement! Your mouth shape is getting closer every time.",
    "You fixed part of the sound. Now let's focus on the tongue tip.",
    "Better! Keep practicing this one.",
    "You're training new muscles — it's normal for this to feel strange at first."
  ]
};

// Get tip for a phoneme/letter
export const getTipForPhoneme = (letter) => {
  const l = letter?.toUpperCase() || '';
  
  // Handle digraphs
  if (l === 'TH') return PHONEME_TIPS.TH;
  if (l === 'SH') return PHONEME_TIPS.SH;
  if (l === 'CH') return PHONEME_TIPS.CH;
  if (l === 'NG') return PHONEME_TIPS.NG;
  
  // Direct mapping
  if (PHONEME_TIPS[l]) return PHONEME_TIPS[l];
  
  // Letter to phoneme mapping
  const mapping = {
    'A': 'A', 'E': 'E', 'I': 'I', 'O': 'O', 'U': 'U',
    'C': 'K', 'X': 'S', 'Q': 'K'
  };
  
  return PHONEME_TIPS[mapping[l]] || null;
};

// Get random feedback message
export const getFeedbackMessage = (score, previousScore = null) => {
  if (previousScore !== null && score > previousScore + 10) {
    const msgs = FEEDBACK_MESSAGES.improvement;
    return msgs[Math.floor(Math.random() * msgs.length)];
  }
  
  if (score >= 85) {
    const msgs = FEEDBACK_MESSAGES.high;
    return msgs[Math.floor(Math.random() * msgs.length)];
  }
  if (score >= 60) {
    const msgs = FEEDBACK_MESSAGES.medium;
    return msgs[Math.floor(Math.random() * msgs.length)];
  }
  const msgs = FEEDBACK_MESSAGES.low;
  return msgs[Math.floor(Math.random() * msgs.length)];
};