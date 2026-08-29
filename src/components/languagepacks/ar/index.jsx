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
import { buildUASCoachingResult as buildArabicUASCoachingResult } from './uasCoaching';
import {
  buildPronunciationHelper as buildArabicPronunciationHelper,
  runPronunciationHelperAudit as runArabicPronunciationHelperAudit,
} from './pronunciationHelper';
import { getGuidedSoundCue } from './guidedSoundLibrary';

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

function normalizeText(text = '') {
  return String(text || '').trim();
}

function toSafeArray(value) {
  return Array.isArray(value) ? value : [];
}

function ensureTimelineArray(value) {
  return Array.isArray(value) ? value : [];
}

function buildHelperChunksFromTimeline(timeline) {
  return ensureTimelineArray(timeline)
    .filter(
      (entry) =>
        entry?.label &&
        entry?.phoneme !== 'neutral' &&
        entry?.phoneme !== 'pause'
    )
    .map((entry) => ({
      text: entry.label,
      startMs: entry.startMs,
      endMs: entry.endMs,
    }));
}

const ArabicPack = {
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
    const value = String(text || '').normalize('NFC').trim();
    if (!value) return true;

    return /^[\p{Script=Arabic}\p{Script=Common}\p{Script=Inherited}]+$/u.test(
      value
    );
  },

  getPresetWords() {
    return [
      { id: 'ar-word-1', practice: 'مرحبا', rtl: true },
      { id: 'ar-word-2', practice: 'أهلا', rtl: true },
      { id: 'ar-word-3', practice: 'ابتسم', rtl: true },
      { id: 'ar-word-4', practice: 'شكرا', rtl: true },
      { id: 'ar-word-5', practice: 'آسف', rtl: true },
      { id: 'ar-word-6', practice: 'نعم', rtl: true },
      { id: 'ar-word-7', practice: 'لا', rtl: true },
      { id: 'ar-word-8', practice: 'أهلاً وسهلاً', rtl: true },
      { id: 'ar-word-9', practice: 'وداعا', rtl: true },
      { id: 'ar-word-10', practice: 'قبلة', rtl: true },
    ];
  },

  getPresetPhrases() {
    return [
      { id: 'ar-phrase-1', practice: 'صباح الخير', rtl: true },
      { id: 'ar-phrase-2', practice: 'اعذرني', rtl: true },
      { id: 'ar-phrase-3', practice: 'مساء الخير', rtl: true },
      { id: 'ar-phrase-4', practice: 'كيف حالك', rtl: true },
      { id: 'ar-phrase-5', practice: 'أنا بخير', rtl: true },
      { id: 'ar-phrase-6', practice: 'شكرا جزيلا', rtl: true },
      { id: 'ar-phrase-7', practice: 'أراك قريبا', rtl: true },
      { id: 'ar-phrase-8', practice: 'تصبح على خير', rtl: true },
    ];
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
    return buildArabicUASCoachingResult({
      ...args,
      getDisplayToken,
      sanitizeTranscript,
    });
  },

  buildPronunciationHelper(text) {
    return buildArabicPronunciationHelper(text);
  },

  runPronunciationHelperAudit(options) {
    return runArabicPronunciationHelperAudit(options);
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
      language: 'ar',
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

  prepareLearningInput(text) {
    const t = normalizeText(text);
    const resolved = phonemeResolver.resolveUntimed(t, 'ar') || {};

    const expectedPhonemes = toSafeArray(
      resolved.expectedPhonemes || resolved.phonemes
    );

    const expectedFrames = toSafeArray(
      resolved.expectedFrames || resolved.frames
    );

    const helperText =
      typeof resolved.helperText === 'string' ? resolved.helperText : '';

    const pronunciation =
      typeof resolved.pronunciation === 'string'
        ? resolved.pronunciation
        : helperText;

    return {
      text: t,
      normalizedText:
        typeof resolved.normalizedText === 'string'
          ? resolved.normalizedText
          : t.normalize('NFC'),

      language: 'ar',
      locale: manifest.locale,
      rtl: true,

      expectedPhonemes,
      phonemes: expectedPhonemes,

      expectedFrames,
      frames: expectedFrames,

      helperText,
      pronunciation,

      tokens: toSafeArray(resolved.tokens),
      tokenGroups: toSafeArray(resolved.tokenGroups),
      ipaPhonemes: toSafeArray(resolved.ipaPhonemes),

      ambiguous: resolved.ambiguous === true,
      reviewRequired: resolved.reviewRequired === true,
      status: resolved.status,
      validation: resolved.validation,

      articulationMap,
      airflowMap,
      coachingRules,
    };
  },

  preparePlayback(text) {
    const t = normalizeText(text);
    const result = phonemeResolver.resolve(t, 'ar') || {};

    const timeline = ensureTimelineArray(result.phonemeTimeline);
    const phonemes = toSafeArray(result.phonemes);
    const frames = toSafeArray(result.frames);

    const helperChunks = Array.isArray(result.helperChunks)
      ? result.helperChunks
      : buildHelperChunksFromTimeline(timeline);

    const helperText =
      typeof result.helperText === 'string' ? result.helperText : '';

    const pronunciation =
      typeof result.pronunciation === 'string'
        ? result.pronunciation
        : helperText;
    const ttsText =
      (result.presetTruthApplied === true ||
        result.catalogTruthApplied === true) &&
      typeof result.normalizedText === 'string'
        ? result.normalizedText
        : t;

    return {
      ttsText,

      helperText,
      pronunciation,
      helperChunks,

      timeline,
      phonemeTimeline: timeline,
      animationTimeline: timeline,

      phonemes,
      frames,

      ambiguous: result.ambiguous === true,
      reviewRequired: result.reviewRequired === true,
      status: result.status,
      validation: result.validation,
      presetTruthApplied: result.presetTruthApplied === true,
      catalogTruthApplied: result.catalogTruthApplied === true,
      truthSource: result.truthSource,
      truthEntryId: result.truthEntryId,

      rtl: true,
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
        ? await provider.synthesize(base.ttsText, 'ar', this.getProviderOptions?.())
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
};

export { phonemeResolver as PhonemeResolver };
export const AR_UNIVERSAL_500 = universal500;
export default ArabicPack;
