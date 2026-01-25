/**
 * SoundMirror Phoneme Engine
 * Maps IPA phonemes to sprite frame indices
 * Frame 00 = neutral/closed mouth
 * 250 frames total (front=master, side=slave)
 */

export interface PhonemeFrame {
  phoneme: string;
  frameId: string;
  startFrame: number;
  endFrame: number;
  description: string;
  examples: string[];
  articulationNotes?: string;
}

export interface PhonemeTimeline {
  text: string;
  language: string;
  phonemes: PhonemeTimelineEntry[];
  totalDuration: number;
}

export interface PhonemeTimelineEntry {
  phoneme: string;
  startTime: number;  // milliseconds
  endTime: number;
  frameStart: number;
  frameEnd: number;
}

// Master phoneme-to-frame mapping from your PDF
// Frame P00X maps to sprite frame ranges
export const PHONEME_FRAME_MAP: Record<string, PhonemeFrame> = {
  // Vowels
  'a': {
    phoneme: 'a',
    frameId: 'P001',
    startFrame: 1,
    endFrame: 10,
    description: '"ah" sound',
    examples: ['father', 'spa'],
  },
  'i': {
    phoneme: 'i',
    frameId: 'P002',
    startFrame: 11,
    endFrame: 20,
    description: '"ee" sound',
    examples: ['see', 'machine'],
  },
  'u': {
    phoneme: 'u',
    frameId: 'P003',
    startFrame: 21,
    endFrame: 30,
    description: '"oo" sound',
    examples: ['food', 'blue'],
  },
  'ɛ': {
    phoneme: 'ɛ',
    frameId: 'P004',
    startFrame: 31,
    endFrame: 40,
    description: '"eh" sound',
    examples: ['bed', 'met'],
  },
  'o': {
    phoneme: 'o',
    frameId: 'P005',
    startFrame: 41,
    endFrame: 50,
    description: '"oh" sound (pure vowel, no glide)',
    examples: ['go'],
    articulationNotes: 'Held, no glide',
  },
  'y': {
    phoneme: 'y',
    frameId: 'P006',
    startFrame: 51,
    endFrame: 60,
    description: 'Rounded "ee"',
    examples: ['French "tu"', 'German "über"'],
    articulationNotes: 'Rounded lips',
  },

  // Plosives
  'p': {
    phoneme: 'p',
    frameId: 'P007',
    startFrame: 61,
    endFrame: 70,
    description: '"p" sound',
    examples: ['pat'],
    articulationNotes: 'Lip closure',
  },
  't': {
    phoneme: 't',
    frameId: 'P008',
    startFrame: 71,
    endFrame: 80,
    description: '"t" sound',
    examples: ['top'],
    articulationNotes: 'Tongue to ridge',
  },
  'd': {
    phoneme: 'd',
    frameId: 'P009',
    startFrame: 81,
    endFrame: 90,
    description: '"d" sound (same mouth as /t/)',
    examples: ['dog'],
  },
  'k': {
    phoneme: 'k',
    frameId: 'P010',
    startFrame: 91,
    endFrame: 100,
    description: '"k" sound',
    examples: ['cat'],
    articulationNotes: 'Back of tongue',
  },
  'g': {
    phoneme: 'g',
    frameId: 'P011',
    startFrame: 101,
    endFrame: 110,
    description: '"g" sound (same mouth as /k/)',
    examples: ['go'],
  },
  'ʔ': {
    phoneme: 'ʔ',
    frameId: 'P012',
    startFrame: 111,
    endFrame: 120,
    description: 'Glottal stop',
    examples: ['uh-oh'],
    articulationNotes: 'Throat closure',
  },

  // Nasals
  'n': {
    phoneme: 'n',
    frameId: 'P013',
    startFrame: 121,
    endFrame: 130,
    description: '"n" sound (same tongue as /t/)',
    examples: ['no'],
  },
  'ŋ': {
    phoneme: 'ŋ',
    frameId: 'P014',
    startFrame: 131,
    endFrame: 140,
    description: '"ng" sound',
    examples: ['sing'],
    articulationNotes: 'Back nasal',
  },

  // Fricatives
  's': {
    phoneme: 's',
    frameId: 'P015',
    startFrame: 141,
    endFrame: 150,
    description: '"s" sound',
    examples: ['see'],
  },
  'ʃ': {
    phoneme: 'ʃ',
    frameId: 'P016',
    startFrame: 151,
    endFrame: 160,
    description: '"sh" sound',
    examples: ['ship'],
  },
  'θ': {
    phoneme: 'θ',
    frameId: 'P017',
    startFrame: 161,
    endFrame: 170,
    description: '"th" (voiceless)',
    examples: ['think'],
  },
  'f': {
    phoneme: 'f',
    frameId: 'P018',
    startFrame: 171,
    endFrame: 180,
    description: '"f" sound',
    examples: ['fan'],
    articulationNotes: 'Lip-to-teeth',
  },
  'h': {
    phoneme: 'h',
    frameId: 'P019',
    startFrame: 181,
    endFrame: 190,
    description: '"h" sound',
    examples: ['hat'],
    articulationNotes: 'Open breath',
  },

  // Affricates
  'tʃ': {
    phoneme: 'tʃ',
    frameId: 'P020',
    startFrame: 191,
    endFrame: 200,
    description: '"ch" sound',
    examples: ['chair'],
  },

  // Liquids
  'r': {
    phoneme: 'r',
    frameId: 'P021',
    startFrame: 201,
    endFrame: 210,
    description: '"r" sound (general rhotic)',
    examples: ['red'],
  },
  'l': {
    phoneme: 'l',
    frameId: 'P022',
    startFrame: 211,
    endFrame: 220,
    description: '"l" sound',
    examples: ['lip'],
  },
  'ɬ': {
    phoneme: 'ɬ',
    frameId: 'P023',
    startFrame: 221,
    endFrame: 230,
    description: 'Welsh "ll" (voiceless lateral)',
    examples: ['Welsh "ll"'],
    articulationNotes: 'Air around tongue',
  },

  // Clicks
  'ǃ': {
    phoneme: 'ǃ',
    frameId: 'P024',
    startFrame: 231,
    endFrame: 240,
    description: 'Dental click',
    examples: ['tsk'],
    articulationNotes: 'Dental',
  },

  // Neutral (closed mouth)
  '_': {
    phoneme: '_',
    frameId: 'P000',
    startFrame: 0,
    endFrame: 0,
    description: 'Neutral closed mouth',
    examples: ['silence', 'pause'],
  },
};

// Phoneme aliases for common representations
export const PHONEME_ALIASES: Record<string, string> = {
  'ah': 'a',
  'ee': 'i',
  'oo': 'u',
  'eh': 'ɛ',
  'oh': 'o',
  'sh': 'ʃ',
  'th': 'θ',
  'ch': 'tʃ',
  'ng': 'ŋ',
};

/**
 * Get the frame data for a phoneme
 */
export function getPhonemeFrame(phoneme: string): PhonemeFrame | undefined {
  const normalized = PHONEME_ALIASES[phoneme.toLowerCase()] || phoneme;
  return PHONEME_FRAME_MAP[normalized];
}

/**
 * Get the neutral/closed mouth frame
 */
export function getNeutralFrame(): PhonemeFrame {
  return PHONEME_FRAME_MAP['_'];
}

/**
 * Calculate frame index for a given time within a phoneme duration
 * Uses linear interpolation between startFrame and endFrame
 */
export function calculateFrameIndex(
  phoneme: PhonemeFrame,
  currentTime: number,
  startTime: number,
  endTime: number
): number {
  const duration = endTime - startTime;
  const elapsed = currentTime - startTime;
  const progress = Math.max(0, Math.min(1, elapsed / duration));
  
  const frameRange = phoneme.endFrame - phoneme.startFrame;
  return Math.floor(phoneme.startFrame + progress * frameRange);
}

/**
 * Get all supported phonemes
 */
export function getSupportedPhonemes(): string[] {
  return Object.keys(PHONEME_FRAME_MAP).filter(p => p !== '_');
}
