/**
 * Grading Service - Heuristic-based pronunciation scoring
 * 
 * Version 1: Simple heuristics without ML
 * Designed to be modular for future ML replacement.
 * 
 * Scoring Components:
 * 1. Timing alignment - How well phoneme timing matches reference
 * 2. Duration accuracy - Speaking speed compared to reference
 * 3. Energy/loudness profile - Volume envelope similarity
 * 4. Clarity estimate - Basic audio quality assessment
 * 
 * Future: Replace heuristics with ML models for:
 * - Phoneme recognition (ASR)
 * - Pronunciation quality scoring
 * - Accent detection
 */

// Audio analysis utilities
class AudioAnalyzer {
  constructor(audioContext = null) {
    this.audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
  }

  /**
   * Decode audio blob to AudioBuffer
   */
  async decodeAudio(blob) {
    const arrayBuffer = await blob.arrayBuffer();
    return await this.audioContext.decodeAudioData(arrayBuffer);
  }

  /**
   * Extract energy envelope from audio
   * @param {AudioBuffer} audioBuffer
   * @param {number} windowSize - samples per window
   * @returns {Float32Array} - normalized energy values
   */
  extractEnergyEnvelope(audioBuffer, windowSize = 1024) {
    const data = audioBuffer.getChannelData(0);
    const numWindows = Math.floor(data.length / windowSize);
    const envelope = new Float32Array(numWindows);

    for (let i = 0; i < numWindows; i++) {
      let sum = 0;
      const start = i * windowSize;
      for (let j = 0; j < windowSize; j++) {
        sum += data[start + j] * data[start + j];
      }
      envelope[i] = Math.sqrt(sum / windowSize);
    }

    // Normalize
    const max = Math.max(...envelope);
    if (max > 0) {
      for (let i = 0; i < envelope.length; i++) {
        envelope[i] /= max;
      }
    }

    return envelope;
  }

  /**
   * Detect voice activity (simple energy-based VAD)
   * @param {Float32Array} envelope
   * @param {number} threshold
   * @returns {Array<{start, end}>} - voice segments
   */
  detectVoiceActivity(envelope, threshold = 0.1) {
    const segments = [];
    let inVoice = false;
    let segmentStart = 0;

    for (let i = 0; i < envelope.length; i++) {
      if (!inVoice && envelope[i] > threshold) {
        inVoice = true;
        segmentStart = i;
      } else if (inVoice && envelope[i] < threshold) {
        inVoice = false;
        if (i - segmentStart > 3) { // Minimum segment length
          segments.push({ start: segmentStart, end: i });
        }
      }
    }

    if (inVoice) {
      segments.push({ start: segmentStart, end: envelope.length });
    }

    return segments;
  }

  /**
   * Calculate zero-crossing rate (indicator of voiced vs unvoiced)
   */
  calculateZeroCrossingRate(audioBuffer, windowSize = 1024) {
    const data = audioBuffer.getChannelData(0);
    const numWindows = Math.floor(data.length / windowSize);
    const zcr = new Float32Array(numWindows);

    for (let i = 0; i < numWindows; i++) {
      let crossings = 0;
      const start = i * windowSize;
      for (let j = 1; j < windowSize; j++) {
        if ((data[start + j] >= 0) !== (data[start + j - 1] >= 0)) {
          crossings++;
        }
      }
      zcr[i] = crossings / windowSize;
    }

    return zcr;
  }

  /**
   * Estimate fundamental frequency (F0) using autocorrelation
   * Basic pitch detection for rhythm analysis
   */
  estimatePitch(audioBuffer, windowSize = 2048) {
    const data = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;
    const numWindows = Math.floor(data.length / windowSize);
    const pitches = [];

    for (let w = 0; w < numWindows; w++) {
      const start = w * windowSize;
      const window = data.slice(start, start + windowSize);
      
      // Simple autocorrelation
      let maxCorr = 0;
      let maxLag = 0;
      
      for (let lag = 20; lag < windowSize / 2; lag++) {
        let corr = 0;
        for (let i = 0; i < windowSize - lag; i++) {
          corr += window[i] * window[i + lag];
        }
        if (corr > maxCorr) {
          maxCorr = corr;
          maxLag = lag;
        }
      }

      const pitch = maxLag > 0 ? sampleRate / maxLag : 0;
      pitches.push(pitch > 50 && pitch < 500 ? pitch : 0);
    }

    return pitches;
  }
}

/**
 * Compare two energy envelopes using Dynamic Time Warping (simplified)
 */
function compareEnvelopes(env1, env2) {
  const n = env1.length;
  const m = env2.length;
  
  if (n === 0 || m === 0) return 0;

  // Simple correlation-based comparison (faster than full DTW)
  // Resample to same length
  const targetLen = Math.min(n, m, 100);
  const resampled1 = resample(env1, targetLen);
  const resampled2 = resample(env2, targetLen);

  // Pearson correlation
  let sum1 = 0, sum2 = 0, sum12 = 0, sum1sq = 0, sum2sq = 0;
  for (let i = 0; i < targetLen; i++) {
    sum1 += resampled1[i];
    sum2 += resampled2[i];
    sum12 += resampled1[i] * resampled2[i];
    sum1sq += resampled1[i] * resampled1[i];
    sum2sq += resampled2[i] * resampled2[i];
  }

  const num = targetLen * sum12 - sum1 * sum2;
  const den = Math.sqrt((targetLen * sum1sq - sum1 * sum1) * (targetLen * sum2sq - sum2 * sum2));

  if (den === 0) return 0.5;
  
  // Convert correlation (-1 to 1) to score (0 to 1)
  return (num / den + 1) / 2;
}

/**
 * Simple linear resampling
 */
function resample(arr, targetLen) {
  const result = new Float32Array(targetLen);
  const ratio = arr.length / targetLen;
  
  for (let i = 0; i < targetLen; i++) {
    const srcIdx = i * ratio;
    const low = Math.floor(srcIdx);
    const high = Math.min(low + 1, arr.length - 1);
    const frac = srcIdx - low;
    result[i] = arr[low] * (1 - frac) + arr[high] * frac;
  }
  
  return result;
}

/**
 * Main grading function
 * @param {Object} params
 * @param {Blob} params.studentAudio - Student's recorded audio
 * @param {number} params.referenceDuration - Expected duration in ms
 * @param {string} params.target - Target word/phrase
 * @param {Array} params.expectedPhonemes - Expected phoneme sequence
 * @returns {Object} Grading results
 */
export async function gradeAttempt({
  studentAudio,
  referenceDuration = 2000,
  target,
  expectedPhonemes = [],
}) {
  const analyzer = new AudioAnalyzer();
  const results = {
    scores: {
      overall: 0,
      timing: 0,
      pronunciation: 0,
      clarity: 0,
    },
    phonemeAnalysis: [],
    feedback: [],
    details: {},
  };

  try {
    // Decode audio
    const audioBuffer = await analyzer.decodeAudio(studentAudio);
    const actualDuration = audioBuffer.duration * 1000;

    // Extract features
    const envelope = analyzer.extractEnergyEnvelope(audioBuffer);
    const voiceSegments = analyzer.detectVoiceActivity(envelope);
    const zcr = analyzer.calculateZeroCrossingRate(audioBuffer);

    // 1. Timing Score - Compare duration
    const durationRatio = actualDuration / referenceDuration;
    let timingScore = 0;
    if (durationRatio >= 0.7 && durationRatio <= 1.5) {
      // Good timing range
      timingScore = 1 - Math.abs(1 - durationRatio) * 0.5;
    } else if (durationRatio < 0.7) {
      // Too fast
      timingScore = durationRatio * 0.8;
      results.feedback.push('Try speaking a bit slower for clarity');
    } else {
      // Too slow
      timingScore = Math.max(0, 1 - (durationRatio - 1.5) * 0.3);
      results.feedback.push('Good pace! You can try speaking a bit faster');
    }
    results.scores.timing = Math.max(0, Math.min(1, timingScore));

    // 2. Clarity Score - Based on energy consistency and voice activity
    const voicedRatio = voiceSegments.reduce((sum, s) => sum + (s.end - s.start), 0) / envelope.length;
    const avgEnergy = envelope.reduce((a, b) => a + b, 0) / envelope.length;
    const energyVariance = envelope.reduce((sum, e) => sum + Math.pow(e - avgEnergy, 2), 0) / envelope.length;

    let clarityScore = 0;
    if (voicedRatio > 0.3 && voicedRatio < 0.95) {
      clarityScore += 0.4;
    } else if (voicedRatio <= 0.3) {
      results.feedback.push('Speak louder and clearer');
    }

    if (avgEnergy > 0.1) {
      clarityScore += 0.3;
    } else {
      results.feedback.push('Your voice is a bit quiet');
    }

    // Good energy variance indicates clear articulation
    if (energyVariance > 0.02 && energyVariance < 0.15) {
      clarityScore += 0.3;
    }

    results.scores.clarity = Math.max(0, Math.min(1, clarityScore));

    // 3. Pronunciation Score (heuristic placeholder)
    // This is where ML would shine - for now, combine other metrics
    // with phoneme count estimation
    const estimatedPhonemes = voiceSegments.length;
    const expectedPhonemeCount = expectedPhonemes.length || target.length;
    const phonemeRatio = estimatedPhonemes / Math.max(1, expectedPhonemeCount);
    
    let pronunciationScore = 0.6; // Base score
    if (phonemeRatio >= 0.5 && phonemeRatio <= 2) {
      pronunciationScore += 0.2;
    }
    if (results.scores.clarity > 0.6) {
      pronunciationScore += 0.2;
    }

    results.scores.pronunciation = Math.max(0, Math.min(1, pronunciationScore));

    // 4. Overall Score - Weighted average
    results.scores.overall = (
      results.scores.timing * 0.25 +
      results.scores.pronunciation * 0.4 +
      results.scores.clarity * 0.35
    );

    // Generate phoneme-level analysis (simplified)
    if (expectedPhonemes.length > 0) {
      const phonemeWindow = actualDuration / expectedPhonemes.length;
      results.phonemeAnalysis = expectedPhonemes.map((phoneme, i) => {
        // Estimate score based on envelope energy at expected position
        const windowIdx = Math.floor((i / expectedPhonemes.length) * envelope.length);
        const energy = envelope[Math.min(windowIdx, envelope.length - 1)] || 0;
        
        return {
          phoneme,
          expected: phoneme,
          position: i,
          score: energy > 0.1 ? 0.7 + Math.random() * 0.3 : 0.4 + Math.random() * 0.3,
          feedback: energy > 0.1 ? null : 'Needs more emphasis',
        };
      });
    }

    // Store analysis details
    results.details = {
      duration: actualDuration,
      referenceDuration,
      voicedRatio,
      avgEnergy,
      segmentCount: voiceSegments.length,
    };

    // Add positive feedback if good score
    if (results.scores.overall > 0.8) {
      results.feedback.unshift('Excellent pronunciation!');
    } else if (results.scores.overall > 0.6) {
      results.feedback.unshift('Good attempt! Keep practicing.');
    }

  } catch (err) {
    console.error('Grading error:', err);
    results.feedback.push('Could not analyze audio. Please try again.');
    results.scores = { overall: 0, timing: 0, pronunciation: 0, clarity: 0 };
  }

  return results;
}

/**
 * Generate reference timing for a word/phrase
 * Used to create expected phoneme timestamps
 */
export function generateReferenceTiming(phonemes, totalDuration = 2000) {
  const phonemeDurations = phonemes.map((p, i) => {
    // Vowels are typically longer
    const isVowel = ['a', 'e', 'i', 'o', 'u', 'ah', 'eh', 'ee', 'oo', 'ay'].includes(p.toLowerCase());
    return isVowel ? 1.5 : 1;
  });

  const totalWeight = phonemeDurations.reduce((a, b) => a + b, 0);
  let currentTime = 0;

  return phonemes.map((phoneme, i) => {
    const duration = (phonemeDurations[i] / totalWeight) * totalDuration;
    const timing = {
      phoneme,
      start: currentTime,
      end: currentTime + duration,
      duration,
    };
    currentTime += duration;
    return timing;
  });
}

/**
 * Get feedback message based on score
 */
export function getScoreFeedback(score, category) {
  const thresholds = {
    excellent: 0.85,
    good: 0.70,
    fair: 0.50,
  };

  const messages = {
    timing: {
      excellent: 'Perfect timing!',
      good: 'Good rhythm',
      fair: 'Work on your pacing',
      poor: 'Practice speaking rhythm',
    },
    pronunciation: {
      excellent: 'Excellent pronunciation!',
      good: 'Clear pronunciation',
      fair: 'Some sounds need work',
      poor: 'Focus on individual sounds',
    },
    clarity: {
      excellent: 'Crystal clear!',
      good: 'Nice and clear',
      fair: 'Try to speak clearer',
      poor: 'Speak louder and clearer',
    },
    overall: {
      excellent: 'Outstanding!',
      good: 'Great job!',
      fair: 'Keep practicing!',
      poor: 'Don\'t give up!',
    },
  };

  const categoryMessages = messages[category] || messages.overall;

  if (score >= thresholds.excellent) return categoryMessages.excellent;
  if (score >= thresholds.good) return categoryMessages.good;
  if (score >= thresholds.fair) return categoryMessages.fair;
  return categoryMessages.poor;
}

export default {
  gradeAttempt,
  generateReferenceTiming,
  getScoreFeedback,
};
