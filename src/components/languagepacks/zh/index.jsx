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
import { buildUASCoachingResult as buildChineseUASCoachingResult } from './uasCoaching';
import {
  buildPronunciationHelper as buildChinesePronunciationHelper,
  runPronunciationHelperAudit as runChinesePronunciationHelperAudit,
} from './pronunciationHelper';
import { getGuidedSoundCue } from './guidedSoundLibrary';
import {
  analyzeMandarinTones,
  combineMandarinSpeechEvidence,
  MANDARIN_TONE_SHARE_OF_SPEECH_EVIDENCE,
} from './toneAnalyzer';

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
    .filter((entry) => entry?.label && entry?.phoneme !== 'neutral' && entry?.phoneme !== 'pause')
    .map((entry) => ({
      text: entry.label,
      startMs: entry.startMs,
      endMs: entry.endMs,
    }));
}

const ChinesePack = {
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

  getPresetWords() {
    return [
      { id: 'zh-word-1', practice: '你好' },
      { id: 'zh-word-2', practice: '嗨' },
      { id: 'zh-word-3', practice: '微笑' },
      { id: 'zh-word-4', practice: '谢谢' },
      { id: 'zh-word-5', practice: '对不起' },
      { id: 'zh-word-6', practice: '是' },
      { id: 'zh-word-7', practice: '不' },
      { id: 'zh-word-8', practice: '欢迎' },
      { id: 'zh-word-9', practice: '再见' },
      { id: 'zh-word-10', practice: '亲吻' },
    ];
  },

  getPresetPhrases() {
    return [
      { id: 'zh-phrase-1', practice: '早上好' },
      { id: 'zh-phrase-2', practice: '不好意思' },
      { id: 'zh-phrase-3', practice: '晚上好' },
      { id: 'zh-phrase-4', practice: '你好吗' },
      { id: 'zh-phrase-5', practice: '我很好' },
      { id: 'zh-phrase-6', practice: '非常感谢' },
      { id: 'zh-phrase-7', practice: '回头见' },
      { id: 'zh-phrase-8', practice: '晚安' },
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
    return buildChineseUASCoachingResult({
      ...args,
      getDisplayToken,
      sanitizeTranscript,
    });
  },

  buildPronunciationHelper(text) {
    return buildChinesePronunciationHelper(text);
  },

  runPronunciationHelperAudit(options) {
    return runChinesePronunciationHelperAudit(options);
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

  analyzeProsody(args) {
    return analyzeMandarinTones(args);
  },

  combineSegmentalAndProsody(args) {
    return combineMandarinSpeechEvidence(args);
  },

  getProsodyScoringContract() {
    return {
      type: 'lexical-tone',
      shareOfSpeechEvidence:
        MANDARIN_TONE_SHARE_OF_SPEECH_EVIDENCE,
      resultTranslationKey: 'pronunciationVerdict.toneResults',
      toneShareOfSpeechEvidence:
        MANDARIN_TONE_SHARE_OF_SPEECH_EVIDENCE,
    };
  },

  getProviderOptions() {
    return {
      language: 'zh',
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
    const resolved = phonemeResolver.resolveUntimed(t, 'zh') || {};

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

      language: 'zh',
      locale: manifest.locale,

      expectedPhonemes,
      phonemes: expectedPhonemes,

      expectedFrames,
      frames: expectedFrames,

      helperText,
      pronunciation,

      pinyinNumbered:
        typeof resolved.pinyinNumbered === 'string'
          ? resolved.pinyinNumbered
          : '',
      tones: toSafeArray(resolved.tones),
      surfaceTones: toSafeArray(resolved.surfaceTones),
      acceptedToneSets: toSafeArray(resolved.acceptedToneSets),
      syllables: toSafeArray(resolved.syllables),

      tokens: toSafeArray(resolved.tokens),
      tokenGroups: toSafeArray(resolved.tokenGroups),
      ipaPhonemes: toSafeArray(resolved.ipaPhonemes),

      articulationMap,
      airflowMap,
      coachingRules,
    };
  },

  preparePlayback(text) {
    const t = normalizeText(text);
    const result = phonemeResolver.resolve(t, 'zh') || {};

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

    return {
      ttsText: t,

      helperText,
      pronunciation,
      pinyinNumbered:
        typeof result.pinyinNumbered === 'string'
          ? result.pinyinNumbered
          : '',
      tones: toSafeArray(result.tones),
      surfaceTones: toSafeArray(result.surfaceTones),
      acceptedToneSets: toSafeArray(result.acceptedToneSets),
      helperChunks,

      // Keep the full Hanzi -> pinyin -> frame timeline available under
      // every timeline key the shell may consume. This protects Chinese from
      // falling back to character-level helper chunks instead of phoneme-level
      // animation entries.
      timeline,
      phonemeTimeline: timeline,
      animationTimeline: timeline,

      phonemes,
      frames,
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
        ? await provider.synthesize(base.ttsText, 'zh', this.getProviderOptions?.())
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
export default ChinesePack;
