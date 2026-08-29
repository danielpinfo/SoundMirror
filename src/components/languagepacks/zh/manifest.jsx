const manifest = {
  id: 'zh',
  name: 'Chinese',
  language: 'Chinese',
  locale: 'zh-CN',
  version: '1.0',

  provider: 'GoogleTTSProvider',
  defaultVoice: 'cmn-CN-Wavenet-A',
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