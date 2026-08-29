const manifest = {
  id: 'ar',
  name: 'Arabic',
  language: 'Arabic',
  locale: 'ar-SA',
  textDirection: 'rtl',
  version: '1.0',

  provider: 'GoogleTTSProvider',
  defaultVoice: 'ar-XA-Wavenet-A',
  speechRate: 0.4,

  phonemeSystem: 'pack_units',
  articulationFrames: 20,

  supportsAnalysis: true,
  supportsAirflow: true,

  packOwnsTiming: true,
  packOwnsArticulation: true,
  packOwnsTTS: true,
};

export default manifest;
