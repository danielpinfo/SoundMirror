export type PhonemeDetectionRequest = {
  audioBase64: string;
  language?: string;
};

export type PhonemeSegment = {
  phoneme: string;

  // milliseconds
  startMs: number;
  endMs: number;

  // 0–1
  confidence?: number;
};

export type PhonemeDetectionResponse = {
  provider: string;

  // normalized phoneme stream
  phonemes: string[];

  // time-aligned phonemes
  segments: PhonemeSegment[];

  // overall confidence
  confidence: number;

  // optional raw engine output (before pack normalization)
  rawPhonemes?: string[];
};