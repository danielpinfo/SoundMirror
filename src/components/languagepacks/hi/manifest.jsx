const manifest = {
  id: 'hi',
  name: 'Hindi',
  language: 'Hindi',
  locale: 'hi-IN',
  version: '1.0',

  provider: 'google',

  phonemeSystem: 'pack_units',
  articulationFrames: 20,

  defaultVoice: 'hi-IN-Neural2-A',
  speechRate: 0.4,

  supportsAnalysis: true,
  supportsAirflow: true,

  packOwnsTiming: true,
  packOwnsArticulation: true,
  packOwnsTTS: true,
};

export default manifest;
