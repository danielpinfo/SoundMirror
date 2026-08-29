const manifest = {
  id: 'pt',
  name: 'Portuguese (Brazil)',
  language: 'Portuguese',
  locale: 'pt-BR',
  version: '1.0',

  provider: 'GoogleTTSProvider',
  defaultVoice: 'pt-BR-Neural2-A',
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