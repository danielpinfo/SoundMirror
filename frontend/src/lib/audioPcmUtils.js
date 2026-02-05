/**
 * AUDIO PCM EXTRACTION UTILITIES
 * 
 * Scaffold for future phoneme detection pipeline.
 * Converts recorded audio into raw PCM data.
 * 
 * Pipeline (future):
 *   Audio Blob → extractPcmFromAudioBlob() → PCM Data → [Phoneme Detection] → ipaSequence
 * 
 * This file ONLY handles: audioBlob → Float32Array PCM
 * Phoneme detection will be added in a future step.
 */

/**
 * Extract raw PCM data from an audio Blob
 * 
 * @param {Blob} audioBlob - Recorded audio blob (e.g. audio/webm, audio/wav)
 * @returns {Promise<{pcmData: Float32Array, sampleRate: number}>}
 */
export async function extractPcmFromAudioBlob(audioBlob) {
  if (!audioBlob || !(audioBlob instanceof Blob)) {
    throw new Error('[extractPcmFromAudioBlob] Invalid input: expected Blob');
  }

  console.log('[extractPcmFromAudioBlob] Input blob:', {
    type: audioBlob.type,
    size: audioBlob.size,
  });

  // Convert Blob to ArrayBuffer
  const arrayBuffer = await audioBlob.arrayBuffer();

  // Create AudioContext for decoding
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();

  try {
    // Decode audio data
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    const sampleRate = audioBuffer.sampleRate;
    const numberOfChannels = audioBuffer.numberOfChannels;
    const length = audioBuffer.length;

    console.log('[extractPcmFromAudioBlob] Decoded audio:', {
      sampleRate,
      numberOfChannels,
      length,
      duration: audioBuffer.duration.toFixed(2) + 's',
    });

    // Extract PCM data (mono)
    let pcmData;

    if (numberOfChannels === 1) {
      // Single channel - use directly
      pcmData = audioBuffer.getChannelData(0);
    } else {
      // Multiple channels - downmix to mono by averaging
      pcmData = new Float32Array(length);
      
      for (let i = 0; i < length; i++) {
        let sum = 0;
        for (let channel = 0; channel < numberOfChannels; channel++) {
          sum += audioBuffer.getChannelData(channel)[i];
        }
        pcmData[i] = sum / numberOfChannels;
      }

      console.log('[extractPcmFromAudioBlob] Downmixed', numberOfChannels, 'channels to mono');
    }

    console.log('[extractPcmFromAudioBlob] Output PCM:', {
      pcmLength: pcmData.length,
      sampleRate: sampleRate,
    });

    return {
      pcmData,
      sampleRate,
    };

  } finally {
    // Clean up AudioContext
    await audioContext.close();
  }
}

export default {
  extractPcmFromAudioBlob,
};
