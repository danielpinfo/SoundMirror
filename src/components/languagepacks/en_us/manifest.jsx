const manifest = {
  id: 'en_us',
  name: 'English (US)',
  language: 'English',
  locale: 'en-US',
  version: '1.0',

  provider: 'GoogleTTSProvider',
  defaultVoice: 'en-US-Neural2-D',
  // speechRate is kept temporarily for backward compatibility.
  // teachingSpeechRate is the audible instructional TTS rate.
  // analysisSpeechRate is the PE-only clean reference TTS rate.
  speechRate: 0.4,
  teachingSpeechRate: 0.4,
  analysisSpeechRate: 1.0,

  phonemeSystem: 'pack_units',
  articulationFrames: 20,

  supportsAnalysis: true,
  supportsAirflow: true,

  packOwnsTiming: true,
  packOwnsArticulation: true,
  packOwnsTTS: true,
};

export default manifest;