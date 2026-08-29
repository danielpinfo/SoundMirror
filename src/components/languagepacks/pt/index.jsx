import manifest from './manifest';
import phonemeSystem from './phonemeSystem';
import articulationMap from './articulationMap';
import airflowMap from './airflowMap';
import coachingRules from './coachingRules';
import uiTranslations from './uiTranslations';
import GoogleTTSProvider from './provider/GoogleTTSProvider';
import PhonemeResolverClass from './PhonemeResolver';
import SideAirflow from './SideAirflow';
import { getDisplayToken, sanitizeTranscript } from './displayHelpers';
import { getMoreWordsPageName, getMoreWordsLabel } from './curriculum';
import { buildUASCoachingResult as buildPortugueseUASCoachingResult } from './uasCoaching';

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

const PortuguesePack = {
  manifest,
  phonemeSystem,
  articulationMap,
  airflowMap,
  coachingRules,
  uiTranslations,

  Provider: GoogleTTSProvider,
  PhonemeResolver: phonemeResolver,
  SideAirflow,

  getPresetWords() {
    return [
      { id: 'pt-word-1', practice: 'Olá' },
      { id: 'pt-word-2', practice: 'Oi' },
      { id: 'pt-word-3', practice: 'Sorria' },
      { id: 'pt-word-4', practice: 'Obrigado' },
      { id: 'pt-word-5', practice: 'Desculpa' },
      { id: 'pt-word-6', practice: 'Sim' },
      { id: 'pt-word-7', practice: 'Não' },
      { id: 'pt-word-8', practice: 'Bem vindo' },
      { id: 'pt-word-9', practice: 'Adeus' },
      { id: 'pt-word-10', practice: 'Beijo' },
    ];
  },

  getPresetPhrases() {
    return [
      { id: 'pt-phrase-1', practice: 'Bom dia' },
      { id: 'pt-phrase-2', practice: 'Com licença' },
      { id: 'pt-phrase-3', practice: 'Boa noite' },
      { id: 'pt-phrase-4', practice: 'Como vai' },
      { id: 'pt-phrase-5', practice: 'Estou bem' },
      { id: 'pt-phrase-6', practice: 'Muito obrigado' },
      { id: 'pt-phrase-7', practice: 'Até logo' },
      { id: 'pt-phrase-8', practice: 'Até amanhã' },
    ];
  },

  getDisplayToken(rawToken) {
    return getDisplayToken(rawToken);
  },

  sanitizeTranscript(text) {
    return sanitizeTranscript(text);
  },

  buildUASCoachingResult(args) {
    return buildPortugueseUASCoachingResult({
      ...args,
      getDisplayToken,
      sanitizeTranscript,
    });
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

  getProviderOptions() {
    return {
      language: 'pt',
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
    const resolved = phonemeResolver.resolveUntimed(t, 'pt') || {};

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
          : t.toLowerCase().normalize('NFC'),

      language: 'pt',
      locale: manifest.locale,

      expectedPhonemes,
      phonemes: expectedPhonemes,

      expectedFrames,
      frames: expectedFrames,

      helperText,
      pronunciation,

      tokenGroups: toSafeArray(resolved.tokenGroups),
      ipaPhonemes: toSafeArray(resolved.ipaPhonemes),

      articulationMap,
      airflowMap,
      coachingRules,
    };
  },

  preparePlayback(text) {
    const t = normalizeText(text);

    const r = phonemeResolver.resolve(t, 'pt') || {};

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

  async preparePlaybackWithAudio(text) {
    const base = this.preparePlayback(text);
    if (!base) return null;

    try {
      const Provider = this.Provider;
      const provider = Provider
        ? new Provider(this.PhonemeResolver, this.getProviderOptions?.())
        : null;

      const res = provider
        ? await provider.synthesize(base.ttsText, 'pt', this.getProviderOptions?.())
        : null;
      const audioUrl = res?.audio ?? null;

      return { ...base, audioUrl };
    } catch (_) {
      return { ...base, audioUrl: null };
    }
  },
};

export { phonemeResolver as PhonemeResolver };
export default PortuguesePack;