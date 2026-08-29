import OnnxPhonemeDetector from '../lib/phonemeEngine/OnnxPhonemeDetector';

self.onmessage = async (event) => {
  const { id, type, audioBuffer } = event.data || {};

  try {
    if (type === 'preload') {
      await OnnxPhonemeDetector.preload();
      self.postMessage({ id, ok: true, result: { ready: true } });
      return;
    }

    if (type !== 'analyze' || !(audioBuffer instanceof ArrayBuffer)) {
      throw new Error('Invalid browser phoneme worker request');
    }

    const audio = new Float32Array(audioBuffer);
    const result = await OnnxPhonemeDetector.detect(audio);
    self.postMessage({ id, ok: true, result });
  } catch (error) {
    self.postMessage({
      id,
      ok: false,
      error: error?.message || String(error),
    });
  }
};
