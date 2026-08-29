/**
 * SoundMirror Articulation Map
 * English (US)
 *
 * Pack-owned physical articulation mapping.
 *
 * IMPORTANT:
 * - phonemeSystem defines the canonical English phoneme symbols.
 * - articulationMap decides which of SoundMirror's 20 physical
 *   mouth frames each English phoneme uses.
 * - A language pack does not have to use every universal frame.
 */

const articulationMap = {
  locale: 'en-US',
  neutral_frame: 0,

  frames: [
    {
      index: 0,
      label: 'neutral',
      phonemes: [],
    },

    /*
     * Frame 01 — open / central vowels
     *
     * a  = AE, short A as in "jab"
     * aa = AA, open AH as in "job"
     * ah = AH, reduced/STRUT vowel as in "cup"
     *
     * Diphthongs AW and AY begin from an open vowel posture,
     * so this is their representative physical frame when they
     * are carried as one canonical pack token.
     */
    {
      index: 1,
      label: 'open_vowel',
      phonemes: [
        'a',
        'aa',
        'ah',
        'aw',
        'ai',
      ],
    },

    /*
     * Frame 02 — mid / lax front vowels
     *
     * e  = EH
     * i  = IH
     * ei = EY
     *
     * English canonical "i" is IH, so it belongs here rather
     * than in the high-front EE frame.
     */
    {
      index: 2,
      label: 'mid_vowel',
      phonemes: [
        'e',
        'i',
        'ei',
      ],
    },

    /*
     * Frame 03 — high front vowel
     *
     * ee = IY
     */
    {
      index: 3,
      label: 'front_vowel',
      phonemes: [
        'ee',
      ],
    },

    /*
     * Frame 04 — front rounded vowel
     *
     * English US does not currently define a canonical phoneme
     * that requires this universal physical posture.
     *
     * IMPORTANT:
     * English token "ue" is ARPABET UH. It is NOT the universal
     * front-rounded UE gesture, so it must not be placed here.
     */
    {
      index: 4,
      label: 'rounded_vowel_ue',
      phonemes: [],
    },

    /*
     * Frame 05 — rounded / back vowels and W
     *
     * ue = UH
     * oo = UW
     * o  = AO
     * ow = OW
     * oi = OY
     * w  = W
     */
    {
      index: 5,
      label: 'rounded_vowel_oo',
      phonemes: [
        'ue',
        'oo',
        'o',
        'ow',
        'oi',
        'w',
      ],
    },

    {
      index: 6,
      label: 'velar_stop',
      phonemes: [
        'k',
        'g',
      ],
    },

    {
      index: 7,
      label: 'alveolar_stop',
      phonemes: [
        't',
        'd',
      ],
    },

    {
      index: 8,
      label: 'bilabial',
      phonemes: [
        'b',
        'p',
        'm',
      ],
    },

    {
      index: 9,
      label: 'alveolar_nasal',
      phonemes: [
        'n',
      ],
    },

    {
      index: 10,
      label: 'velar_nasal',
      phonemes: [
        'ng',
      ],
    },

    {
      index: 11,
      label: 'alveolar_fricative',
      phonemes: [
        's',
        'z',
      ],
    },

    {
      index: 12,
      label: 'postalveolar_fricative',
      phonemes: [
        'sh',
        'zh',
      ],
    },

    {
      index: 13,
      label: 'dental_fricative',
      phonemes: [
        'th',
        'dh',
      ],
    },

    {
      index: 14,
      label: 'labiodental_fricative',
      phonemes: [
        'f',
        'v',
      ],
    },

    {
      index: 15,
      label: 'affricate',
      phonemes: [
        'ch',
        'j',
      ],
    },

    {
      index: 16,
      label: 'glottal',
      phonemes: [
        'h',
      ],
    },

    /*
     * Frame 17 — English rhotics
     *
     * r  = consonantal R
     * er = ARPABET ER, the rhotic vowel
     *
     * Both require the English rhotic tongue posture.
     */
    {
      index: 17,
      label: 'rhotic',
      phonemes: [
        'r',
        'er',
      ],
    },

    {
      index: 18,
      label: 'lateral',
      phonemes: [
        'l',
      ],
    },

    {
      index: 19,
      label: 'glide',
      phonemes: [
        'y',
      ],
    },
  ],
};

export const phonemeToFrameIndex = (() => {
  const map = {};

  for (const frame of articulationMap.frames) {
    for (const phoneme of frame.phonemes) {
      map[phoneme] = frame.index;
    }
  }

  return map;
})();

/**
 * Safety fallback.
 *
 * Unknown/control tokens return the neutral frame rather than
 * silently borrowing another articulation posture.
 */
export function resolveFrame(phoneme) {
  return phonemeToFrameIndex[phoneme] ?? 0;
}

export default articulationMap;