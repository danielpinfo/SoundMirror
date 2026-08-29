let worker = null;
let nextRequestId = 1;
const pending = new Map();

function getWorker() {
  if (worker) return worker;

  worker = new Worker(
    new URL('../../workers/phonemeInference.worker.js', import.meta.url),
    { type: 'module' }
  );

  worker.onmessage = (event) => {
    const { id, ok, result, error } = event.data || {};
    const request = pending.get(id);
    if (!request) return;

    pending.delete(id);
    if (ok) request.resolve(result);
    else request.reject(new Error(error || 'Browser phoneme analysis failed'));
  };

  worker.onerror = (event) => {
    const error = new Error(event?.message || 'Browser phoneme worker failed');
    for (const request of pending.values()) request.reject(error);
    pending.clear();
    worker?.terminate();
    worker = null;
  };

  return worker;
}

function requestWorker(type, audio = null) {
  const id = nextRequestId++;
  const activeWorker = getWorker();

  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });

    if (audio instanceof Float32Array) {
      const transferableAudio = audio.slice();
      activeWorker.postMessage(
        { id, type, audioBuffer: transferableAudio.buffer },
        [transferableAudio.buffer]
      );
    } else {
      activeWorker.postMessage({ id, type });
    }
  });
}

export function preloadBrowserPhonemeModel() {
  return requestWorker('preload');
}

export function analyzeBrowserPhonemes(audio) {
  return requestWorker('analyze', audio);
}
