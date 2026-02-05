/**
 * NATIVE DETECTION BRIDGE
 * 
 * Client-side interface for calling the native phoneme detection service.
 * This bridges the browser UI to the backend detection endpoint.
 * 
 * Pipeline:
 *   Browser (PCM data) → detectPhonemesNative() → Backend /api/phoneme/detect → ipaSequence
 */

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

/**
 * @typedef {Object} IPAPhoneme
 * @property {string} symbol - IPA symbol
 * @property {Object} features - Articulatory features
 * @property {number} startMs - Start time in ms
 * @property {number} endMs - End time in ms
 * @property {number} confidence - Confidence 0-1
 */

/**
 * @typedef {Object} PhonemeDetectionResult
 * @property {IPAPhoneme[]} ipaSequence - Detected phoneme sequence
 * @property {number} durationMs - Audio duration in ms
 */

/**
 * Call native phoneme detection service
 * 
 * @param {Float32Array} pcmData - Mono PCM audio data
 * @param {number} sampleRate - Sample rate in Hz
 * @param {string} language - Language code
 * @returns {Promise<PhonemeDetectionResult>}
 */
export async function detectPhonemesNative(pcmData, sampleRate, language = 'english') {
  console.log('[NativeDetectionBridge] Sending PCM to backend:', {
    pcmLength: pcmData.length,
    sampleRate,
    language,
  });

  try {
    const response = await fetch(`${API_URL}/api/phoneme/detect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pcmData: Array.from(pcmData),  // Convert Float32Array to regular array for JSON
        sampleRate,
        language,
      }),
    });

    if (!response.ok) {
      throw new Error(`Detection service error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    console.log('[NativeDetectionBridge] Received response:', {
      ipaSequenceLength: result.ipaSequence?.length || 0,
      durationMs: result.durationMs,
    });

    return result;

  } catch (error) {
    console.error('[NativeDetectionBridge] Error calling detection service:', error);
    
    // Return empty result on error
    return {
      ipaSequence: [],
      durationMs: 0,
    };
  }
}

/**
 * Check if native detection service is available
 * @returns {Promise<boolean>}
 */
export async function isNativeDetectionAvailable() {
  try {
    const response = await fetch(`${API_URL}/api/health`);
    return response.ok;
  } catch {
    return false;
  }
}

export default {
  detectPhonemesNative,
  isNativeDetectionAvailable,
};
