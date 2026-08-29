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
import { buildUASCoachingResult as buildHindiUASCoachingResult } from './uasCoaching';
import {
  buildPronunciationHelper as buildHindiPronunciationHelper,
  runPronunciationHelperAudit,
} from './pronunciationHelper';
import { getGuidedSoundCue } from './guidedSoundLibrary';
import { getHindiKeyboardLayout } from './keyboardLayout';

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

const HindiPack = {
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

  isTargetCompatible(text) {
    const value = String(text || '').trim();
    return Boolean(value) && /^[\p{Script=Devanagari}\p{N}\p{P}\s]+$/u.test(value);
  },

  getDisplayToken(rawToken) {
    return getDisplayToken(rawToken);
  },

  normalizeDetectedPhoneme(rawToken) {
    return normalizeDetectedPhoneme(rawToken);
  },

  sanitizeTranscript(text) {
    return sanitizeTranscript(text);
  },

  buildUASCoachingResult(args) {
    return buildHindiUASCoachingResult(args);
  },

  buildPronunciationHelper(text) {
    return buildHindiPronunciationHelper(text);
  },

  runPronunciationHelperAudit(options) {
    return runPronunciationHelperAudit(options);
  },

  getGuidedSoundCue(phoneme) {
    return getGuidedSoundCue(phoneme);
  },

  getMoreWordsPageName(nativeLanguage) {
    return getMoreWordsPageName(nativeLanguage);
  },

  getMoreWordsLabel(nativeLanguage) {
    return getMoreWordsLabel(nativeLanguage);
  },

  getKeyboardLayout() {
    return getHindiKeyboardLayout();
  },

  getPresetWords() {
    return [
      { id: 'hi-word-1', practice: 'नमस्ते' },
      { id: 'hi-word-2', practice: 'हाय' },
      { id: 'hi-word-3', practice: 'मुस्कान' },
      { id: 'hi-word-4', practice: 'धन्यवाद' },
      { id: 'hi-word-5', practice: 'माफ़ी' },
      { id: 'hi-word-6', practice: 'हाँ' },
      { id: 'hi-word-7', practice: 'नहीं' },
      { id: 'hi-word-8', practice: 'स्वागत' },
      { id: 'hi-word-9', practice: 'अलविदा' },
      { id: 'hi-word-10', practice: 'चुंबन' },
    ];
  },

  getPresetPhrases() {
    return [
      { id: 'hi-phrase-1', practice: 'सुप्रभात' },
      { id: 'hi-phrase-2', practice: 'माफ़ कीजिए' },
      { id: 'hi-phrase-3', practice: 'शुभ संध्या' },
      { id: 'hi-phrase-4', practice: 'आप कैसे हैं?' },
      { id: 'hi-phrase-5', practice: 'मैं ठीक हूँ।' },
      { id: 'hi-phrase-6', practice: 'बहुत धन्यवाद।' },
      { id: 'hi-phrase-7', practice: 'फिर मिलेंगे' },
      { id: 'hi-phrase-8', practice: 'शुभ रात्रि' },
    ];
  },

  prepareLearningInput(text) {
    const t = String(text || '').trim();
    const result = phonemeResolver.resolveUntimed(t) || {};
    const expectedPhonemes = Array.isArray(result.expectedPhonemes)
      ? result.expectedPhonemes
      : [];

    return {
      text: t,
      normalizedText: result.normalizedText || t.normalize('NFC'),
      language: 'hi',
      locale: manifest.locale,
      rtl: false,
      expectedPhonemes,
      phonemes: expectedPhonemes,
      expectedFrames: Array.isArray(result.expectedFrames) ? result.expectedFrames : [],
      frames: Array.isArray(result.expectedFrames) ? result.expectedFrames : [],
      helperText: result.helperText ?? '',
      pronunciation: result.pronunciation ?? result.helperText ?? '',
      approved: result.approved === true,
      unresolved: result.unresolved === true,
      validation: result.validation || null,
      tokens: Array.isArray(result.tokens) ? result.tokens : [],
      tokenGroups: Array.isArray(result.tokenGroups) ? result.tokenGroups : [],
      ipaPhonemes: Array.isArray(result.ipaPhonemes) ? result.ipaPhonemes : [],
      articulationMap,
      airflowMap,
      coachingRules,
    };
  },

  preparePlayback(text) {
    const t = String(text || '').trim();
    const result = phonemeResolver.resolve(t) || null;
    if (!result) return null;

    return {
      ttsText: t,
      helperText: result.helperText ?? '',
      pronunciation: result.pronunciation ?? '',
      helperChunks: result.helperChunks ?? null,
      timeline: result.phonemeTimeline ?? [],
    };
  },

  async preparePlaybackWithAudio(text) {
    const base = this.preparePlayback(text);
    if (!base) return null;

    try {
      const Provider = this.Provider;
      const provider = Provider
        ? new Provider(this.PhonemeResolver, this.getProviderOptions?.())
        : null;

      const res = provider
        ? await provider.synthesize(base.ttsText, 'hi')
        : null;

      const audioUrl = res?.audio ?? null;

      return {
        ...base,
        audioUrl,
      };
    } catch (_) {
      return {
        ...base,
        audioUrl: null,
      };
    }
  },

  getPlaybackRate() {
    return manifest?.speechRate ?? 0.4;
  },

  getTTSRate() {
    return manifest?.speechRate ?? 0.4;
  },

  getDefaultVoice() {
    return manifest?.defaultVoice ?? null;
  },

  getLocale() {
    return manifest?.locale ?? 'hi-IN';
  },

  getProviderOptions() {
    return {
      voice: manifest?.defaultVoice ?? null,
      speechRate: manifest?.speechRate ?? 0.4,
      language: 'hi',
      locale: manifest?.locale ?? 'hi-IN',
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
};

export { phonemeResolver as PhonemeResolver };
export default HindiPack;
