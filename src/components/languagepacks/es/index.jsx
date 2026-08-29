import manifest from './manifest';
import phonemeSystem from './phonemeSystem';
import articulationMap from './articulationMap';
import airflowMap from './airflowMap';
import coachingRules from './coachingRules';
import uiTranslations from './uiTranslations';
import GoogleTTSProvider from './provider/GoogleTTSProvider';
import PhonemeResolverClass from './PhonemeResolver';
import SideAirflow from './SideAirflow';
import universal500 from './universal500';
import {
  getDisplayToken,
  normalizeDetectedPhoneme,
  sanitizeTranscript,
} from './displayHelpers';
import { getMoreWordsPageName, getMoreWordsLabel } from './curriculum';
import { buildUASCoachingResult as buildSpanishUASCoachingResult } from './uasCoaching';
import {
  buildPronunciationHelper as buildSpanishPronunciationHelper,
  runPronunciationHelperAudit as runSpanishPronunciationHelperAudit,
} from './pronunciationHelper';
import { getGuidedSoundCue } from './guidedSoundLibrary';
import {
  SPANISH_PRESET_WORDS,
  SPANISH_PRESET_PHRASES,
} from './presets';

// Pack-owned resolver instance
const phonemeResolver = new PhonemeResolverClass();

const FRONT_ASSET_BASE =
  'https://raw.githubusercontent.com/danielpinfo/SoundMirror/Heads_front-_side/animation_front';
const SIDE_ASSET_BASE =
  'https://raw.githubusercontent.com/danielpinfo/SoundMirror/Heads_front-_side/animation_side';

const FRONT_FRAME_URLS = [
  `${FRONT_ASSET_BASE}/front_00_neutral.png`,
  `${FRONT_ASSET_BASE}/front_01_a_ah_uh.png`,
  `${FRONT_ASSET_BASE}/front_02_e_eh_ih.png`,
  `${FRONT_ASSET_BASE}/front_03_ee_i.png`,
  `${FRONT_ASSET_BASE}/front_04_ue.png`,
  `${FRONT_ASSET_BASE}/front_05_oo_o_ou_u_w.png`,
  `${FRONT_ASSET_BASE}/front_06_k_g.png`,
  `${FRONT_ASSET_BASE}/front_07_t_d.png`,
  `${FRONT_ASSET_BASE}/front_08_b_p_m.png`,
  `${FRONT_ASSET_BASE}/front_09_n.png`,
  `${FRONT_ASSET_BASE}/front_10_ng.png`,
  `${FRONT_ASSET_BASE}/front_11_s_z.png`,
  `${FRONT_ASSET_BASE}/front_12_sh_zh.png`,
  `${FRONT_ASSET_BASE}/front_13_th_dh.png`,
  `${FRONT_ASSET_BASE}/front_14_f_v.png`,
  `${FRONT_ASSET_BASE}/front_15_ch_j.png`,
  `${FRONT_ASSET_BASE}/front_16_h.png`,
  `${FRONT_ASSET_BASE}/front_17_r.png`,
  `${FRONT_ASSET_BASE}/front_18_L.png`,
  `${FRONT_ASSET_BASE}/front_19_ll_y_lh_ly.png`,
];

const SIDE_FRAME_URLS = [
  `${SIDE_ASSET_BASE}/side_00_neutral.png`,
  `${SIDE_ASSET_BASE}/side_01_a_ah_uh.png`,
  `${SIDE_ASSET_BASE}/side_02_e_eh_ih.png`,
  `${SIDE_ASSET_BASE}/side_03_ee_i.png`,
  `${SIDE_ASSET_BASE}/side_04_ue.png`,
  `${SIDE_ASSET_BASE}/side_05_oo_o_ou_u_w.png`,
  `${SIDE_ASSET_BASE}/side_06_k_g.png`,
  `${SIDE_ASSET_BASE}/side_07_t_d.png`,
  `${SIDE_ASSET_BASE}/side_08_b_p_m.png`,
  `${SIDE_ASSET_BASE}/side_09_n.png`,
  `${SIDE_ASSET_BASE}/side_10_ng.png`,
  `${SIDE_ASSET_BASE}/side_11_s_z.png`,
  `${SIDE_ASSET_BASE}/side_12_sh_zh.png`,
  `${SIDE_ASSET_BASE}/side_13_th_dh.png`,
  `${SIDE_ASSET_BASE}/side_14_f_v.png`,
  `${SIDE_ASSET_BASE}/side_15_ch_j.png`,
  `${SIDE_ASSET_BASE}/side_16_h.png`,
  `${SIDE_ASSET_BASE}/side_17_r.png`,
  `${SIDE_ASSET_BASE}/side_18_L.png`,
  `${SIDE_ASSET_BASE}/side_19_ll_y_lh_ly.png`,
];

const SHORT_CUSTOM_IPA = Object.freeze({
  a: 'a',
  e: 'e',
  i: 'i',
  o: 'o',
  u: 'u',
  b: 'b',
  v: 'v',
  p: 'p',
  t: 't',
  d: 'd',
  k: 'k',
  g: 'ɡ',
  m: 'm',
  n: 'n',
  ny: 'ɲ',
  f: 'f',
  s: 's',
  h: 'x',
  ch: 'tʃ',
  r: 'ɾ',
  rr: 'r',
  l: 'l',
  y: 'j',
  w: 'w',
});

function escapeSsml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function buildShortCustomSsml(text) {
  const visibleText = String(text || '').trim();
  const letters = visibleText.replace(/[^a-záéíóúüñ]/gi, '');

  if (!letters || letters.length > 2 || visibleText.includes(' ')) return null;

  const resolved = phonemeResolver.resolveUntimed(visibleText);
  const expectedPhonemes = Array.isArray(resolved?.expectedPhonemes)
    ? resolved.expectedPhonemes
    : [];
  const ipa = expectedPhonemes.map((phoneme) => SHORT_CUSTOM_IPA[phoneme]).join('');

  if (!ipa || expectedPhonemes.some((phoneme) => !SHORT_CUSTOM_IPA[phoneme])) {
    return null;
  }

  return `<speak><phoneme alphabet="ipa" ph="${escapeSsml(ipa)}">${escapeSsml(visibleText)}</phoneme></speak>`;
}

const SpanishPack = {
  manifest,
  phonemeSystem,
  articulationMap,
  airflowMap,
  coachingRules,
  uiTranslations,

  Provider: GoogleTTSProvider,
  PhonemeResolver: phonemeResolver,
  SideAirflow,
  wordLibraryGroups: universal500,

  getKeyboardRows() {
    return [
      ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
      ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ñ'],
      ['Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫'],
    ];
  },

  isTargetCompatible(text) {
    const value = String(text || '').trim();
    return Boolean(value) && /^[\p{Script=Latin}\p{N}\p{P}\s]+$/u.test(value);
  },

  getPresetWords() {
    return SPANISH_PRESET_WORDS.map((item) => ({ ...item }));
  },

  getPresetPhrases() {
    return SPANISH_PRESET_PHRASES.map((item) => ({ ...item }));
  },

  getDisplayToken(rawToken) {
    return getDisplayToken(rawToken);
  },

  sanitizeTranscript(text) {
    return sanitizeTranscript(text);
  },

  normalizeDetectedPhoneme(rawToken) {
    return normalizeDetectedPhoneme(rawToken);
  },

  buildUASCoachingResult(args) {
    return buildSpanishUASCoachingResult({
      ...args,
      getDisplayToken,
      sanitizeTranscript,
    });
  },

  buildPronunciationHelper(text) {
    return buildSpanishPronunciationHelper(text);
  },

  runPronunciationHelperAudit(options) {
    return runSpanishPronunciationHelperAudit(options);
  },

  getMoreWordsPageName(nativeLanguage) {
    return getMoreWordsPageName(nativeLanguage);
  },

  getMoreWordsLabel(nativeLanguage) {
    return getMoreWordsLabel(nativeLanguage);
  },

  getPlaybackRate() {
    return manifest.speechRate ?? 0.4;
  },

  getTTSRate() {
    return manifest.speechRate ?? 0.4;
  },

  getDefaultVoice() {
    return manifest.defaultVoice;
  },

  getLocale() {
    return manifest.locale;
  },

  getGuidedSoundCue(phoneme) {
    return getGuidedSoundCue(phoneme);
  },

  getProviderOptions() {
    return {
      language: 'es',
      voice: manifest.defaultVoice,
      speechRate: manifest.speechRate ?? 0.4,
      locale: manifest.locale,
    };
  },

  getFrontSpriteUrl() {
    return FRONT_FRAME_URLS[0] ?? null;
  },

  getSideSpriteUrl() {
    return SIDE_FRAME_URLS[0] ?? null;
  },

  getFrontFrameUrls() {
    return FRONT_FRAME_URLS;
  },

  getSideFrameUrls() {
    return SIDE_FRAME_URLS;
  },

  /**
   * Untimed Spanish learning input for AS/UAS.
   * Returns helper data, expected phonemes, frames, articulationMap, and airflowMap.
   * Must not return animation timing.
   */
  prepareLearningInput(text) {
    const t = String(text || '').trim();
    const r = phonemeResolver.resolveUntimed(t) || {};

    return {
      language: 'es',
      text: t,
      normalizedText: typeof r.normalizedText === 'string' ? r.normalizedText : '',
      helperText: typeof r.helperText === 'string' ? r.helperText : '',
      pronunciation: typeof r.pronunciation === 'string' ? r.pronunciation : '',
      expectedPhonemes: Array.isArray(r.expectedPhonemes) ? r.expectedPhonemes : [],
      expectedFrames: Array.isArray(r.expectedFrames) ? r.expectedFrames : [],
      tokens: Array.isArray(r.tokens) ? r.tokens : [],
      tokenGroups: Array.isArray(r.tokenGroups) ? r.tokenGroups : [],
      articulationMap,
      airflowMap,
    };
  },

  /**
   * Legacy timed playback path.
   *
   * Current AS/UAS architecture should use prepareLearningInput(text)
   * for untimed expected phonemes. This method is retained for playback,
   * helper chunks, and backward compatibility.
   */
  preparePlayback(text) {
    const t = String(text || '').trim();

    const r = phonemeResolver.resolve(t, 'es') || {};

    const timeline = Array.isArray(r.phonemeTimeline) ? r.phonemeTimeline : [];
    const helperChunks = Array.isArray(r.helperChunks)
      ? r.helperChunks
      : timeline
          .filter((e) => e?.label)
          .map((e) => ({
            text: e.label,
            startMs: e.startMs,
            endMs: e.endMs,
          }));

    const helperText = typeof r.helperText === 'string' ? r.helperText : '';
    const pronunciation =
      typeof r.pronunciation === 'string' ? r.pronunciation : helperText;

    return {
      ttsText: t,
      timeline,
      helperChunks,
      helperText,
      pronunciation,
    };
  },

  async preparePlaybackWithAudio(text, options = {}) {
    const base = this.preparePlayback(text);
    if (!base) return null;

    const guidedSsml = options?.preparedPlayback?.ttsSsml ?? null;
    const shortCustomSsml = options?.targetSource === 'custom input'
      ? buildShortCustomSsml(base.ttsText)
      : null;

    try {
      const Provider = this.Provider;
      const provider = Provider
        ? new Provider(this.PhonemeResolver, this.getProviderOptions?.())
        : null;

      const res = provider
        ? await provider.synthesize(base.ttsText, 'es', {
            ...this.getProviderOptions?.(),
            ssml: guidedSsml ?? shortCustomSsml,
          })
        : null;
      const audioUrl = res?.audio ?? null;

      return { ...base, audioUrl };
    } catch (_) {
      return { ...base, audioUrl: null };
    }
  },
};

export { phonemeResolver as PhonemeResolver };
export default SpanishPack;
