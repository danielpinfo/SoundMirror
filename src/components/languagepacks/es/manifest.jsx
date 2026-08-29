const manifest = {
  id: 'es',
  name: 'Spanish (LatAm)',
  language: 'Spanish',
  locale: 'es-US',
  version: '1.0',

  provider: 'GoogleTTSProvider',
  defaultVoice: 'es-US-Neural2-A',
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
