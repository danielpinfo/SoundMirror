import * as ort from 'onnxruntime-web/wasm';
import vocab from './vocab.json';
import tokenizerConfig from './tokenizer_config.json';
import preprocessorConfig from './preprocessor_config.json';

const MODEL_URL =
  'https://pub-c6411b9fe33c460e8d41d81cf6837749.r2.dev/model-int8-sections1-4-preprocessed-layers0-23.onnx';
const PROVIDER = 'wav2vec2-onnx-int8-browser';
const ORT_VERSION = '1.24.3';

// Keep the runtime version pinned to the installed package. The older R2
// runtime files belong to the original detector and are not binary-compatible
// with every newer onnxruntime-web release.
ort.env.wasm.numThreads = 1;
ort.env.wasm.proxy = false;
ort.env.wasm.simd = false;
ort.env.wasm.wasmPaths =
  `https://cdn.jsdelivr.net/npm/onnxruntime-web@${ORT_VERSION}/dist/`;

let sessionPromise = null;

function getSession() {
  if (!sessionPromise) {
    console.log('[ORT CONFIG EXPANDED]', JSON.stringify({
      modelUrl: MODEL_URL,
      wasm: ort.env.wasm
    }, null, 2));

    sessionPromise = (async () => {
      console.log('[ONNX] session create start');
      const session = await ort.InferenceSession.create(MODEL_URL, {
        executionProviders: ['wasm']
      });
      console.log('[ONNX] session create done');
      return session;
    })();
  }
  return sessionPromise;
}

async function preload() {
  await getSession();
  return true;
}

function getIdToTokenMap() {
  if (Array.isArray(vocab)) return vocab;

  return Object.entries(vocab)
    .sort((a, b) => Number(a[1]) - Number(b[1]))
    .reduce((acc, [token, id]) => {
      acc[Number(id)] = token;
      return acc;
    }, []);
}

function normalizeInput(float32Audio) {
  const doNormalize = preprocessorConfig?.do_normalize !== false;
  if (!doNormalize) return float32Audio;

  let sum = 0;
  for (let i = 0; i < float32Audio.length; i++) sum += float32Audio[i];
  const mean = sum / Math.max(float32Audio.length, 1);

  let varianceSum = 0;
  for (let i = 0; i < float32Audio.length; i++) {
    const centered = float32Audio[i] - mean;
    varianceSum += centered * centered;
  }

  const variance = varianceSum / Math.max(float32Audio.length, 1);
  const std = Math.sqrt(variance + 1e-7);
  const normalized = new Float32Array(float32Audio.length);

  for (let i = 0; i < float32Audio.length; i++) {
    normalized[i] = (float32Audio[i] - mean) / std;
  }

  return normalized;
}

function argmaxIndex(values, start, width) {
  let bestIndex = 0;
  let bestValue = values[start];

  for (let i = 1; i < width; i++) {
    const value = values[start + i];
    if (value > bestValue) {
      bestValue = value;
      bestIndex = i;
    }
  }

  return bestIndex;
}

function decodeCTC(logits) {
  const dims = logits?.dims || [];
  const data = logits?.data;
  const [, timeSteps, vocabSize] = dims;

  if (!data || !timeSteps || !vocabSize) {
    throw new Error('Invalid ONNX output shape');
  }

  const idToToken = getIdToTokenMap();
  const specialTokens = new Set([
    tokenizerConfig?.pad_token,
    tokenizerConfig?.bos_token,
    tokenizerConfig?.eos_token,
    tokenizerConfig?.unk_token,
  ]);

  const ids = [];

  for (let t = 0; t < timeSteps; t++) {
    const start = t * vocabSize;
    ids.push(argmaxIndex(data, start, vocabSize));
  }

  const collapsed = [];
  let previous = null;
  for (const id of ids) {
    if (id !== previous) collapsed.push(id);
    previous = id;
  }

  const phonemes = collapsed
    .map((id) => idToToken[id])
    .filter((token) => token && !specialTokens.has(token))
    .map((token) => String(token).trim())
    .filter(Boolean);

  return {
    phonemes,
    raw: phonemes.join(' '),
    provider: PROVIDER,
  };
}

async function detect(float32Audio) {
  if (!(float32Audio instanceof Float32Array)) {
    throw new Error('OnnxPhonemeDetector expects Float32Array audio');
  }

  const normalized = normalizeInput(float32Audio);
  const session = await getSession();
  const inputName = session.inputNames[0];
  const outputName = session.outputNames[0];
  const feeds = {
    [inputName]: new ort.Tensor('float32', normalized, [1, normalized.length]),
  };

  const outputs = await session.run(feeds);
  return decodeCTC(outputs[outputName]);
}

const OnnxPhonemeDetector = {
  MODEL_URL,
  preload,
  detect,
};

export default OnnxPhonemeDetector;
