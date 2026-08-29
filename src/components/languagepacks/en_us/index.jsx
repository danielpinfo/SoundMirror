/**
 * SoundMirror Language Pack
 * English (US)
 *
 * Canonical English pack.
 * Pack-owned resolver, display helpers, coaching, curriculum labels,
 * TTS options, playback fallback behavior, and grading pronunciation.
 */

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
  ENGLISH_PRESET_WORDS,
  ENGLISH_PRESET_PHRASES,
} from './presets';

import {
  getDisplayToken,
  sanitizeTranscript,
  normalizeDetectedPhoneme as normalizeEnglishDetectedPhoneme,
} from './displayHelpers';

import {
  getMoreWordsPageName,
  getMoreWordsLabel,
} from './curriculum';

import {
  buildUASCoachingResult as buildEnglishUASCoachingResult,
} from './uasCoaching';

import {
  buildEnglishPronunciationHelper,
  runEnglishPronunciationHelperAudit,
} from './pronunciationHelper';

import {
  getGuidedSoundCue,
} from './guidedSoundLibrary';
import {
  getShortCustomSoundCue,
} from './shortCustomSoundLibrary';

// Pack-owned resolver instance.
// This remains the helper / animation resolver.
const phonemeResolver =
  new PhonemeResolverClass();

/**
 * GRADING PRONUNCIATION
 *
 * The same pack-owned helper rules provide learner text, animation truth, and
 * grading truth. English does not receive a dictionary-only runtime path.
 */
function resolveGradingPhonemes(
  text = ''
) {
  const generated = buildEnglishPronunciationHelper(text);
  return Array.isArray(generated?.phonemes)
    ? generated.phonemes
    : [];
}

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

const EnglishUSPack = {
  manifest,
  phonemeSystem,
  articulationMap,
  airflowMap,
  coachingRules,
  uiTranslations,

  Provider: GoogleTTSProvider,
  PhonemeResolver: phonemeResolver,
  SideAirflow,

  wordLibraryGroups:
    universal500,

  getPresetWords() {
    return ENGLISH_PRESET_WORDS;
  },

  getPresetPhrases() {
    return ENGLISH_PRESET_PHRASES;
  },

  getDisplayToken(
    rawToken
  ) {
    return getDisplayToken(
      rawToken
    );
  },

  sanitizeTranscript(
    text
  ) {
    return sanitizeTranscript(
      text
    );
  },

  /**
   * Convert language-neutral backend IPA into English SoundMirror tokens.
   *
   * Critical distinction:
   * IPA j       -> SoundMirror y
   * IPA dʒ/d͡ʒ  -> SoundMirror j
   */
  normalizeDetectedPhoneme(
    rawToken
  ) {
    return normalizeEnglishDetectedPhoneme(
      rawToken
    );
  },

  buildUASCoachingResult(
    args
  ) {
    return buildEnglishUASCoachingResult({
      ...args,
      getDisplayToken,
      sanitizeTranscript,
    });
  },

  getMoreWordsPageName(
    nativeLanguage
  ) {
    return getMoreWordsPageName(
      nativeLanguage
    );
  },

  getMoreWordsLabel(
    nativeLanguage
  ) {
    return getMoreWordsLabel(
      nativeLanguage
    );
  },

  buildPronunciationHelper(
    text
  ) {
    return buildEnglishPronunciationHelper(
      text
    );
  },

  runPronunciationHelperAudit(
    options
  ) {
    return runEnglishPronunciationHelperAudit(
      options
    );
  },

  getPlaybackRate() {
    return (
      manifest.speechRate ??
      0.4
    );
  },

  getTTSRate() {
    return (
      manifest.speechRate ??
      0.4
    );
  },

  getDefaultVoice() {
    return manifest.defaultVoice;
  },

  getLocale() {
    return manifest.locale;
  },

  getGuidedSoundCue(
    phoneme
  ) {
    return getGuidedSoundCue(
      phoneme
    );
  },

  getProviderOptions() {
    return {
      language: 'en',
      voice:
        manifest.defaultVoice,
      speechRate:
        manifest.speechRate ??
        0.4,
      locale:
        manifest.locale,
    };
  },

  getFrontSpriteUrl() {
    return (
      FRONT_FRAME_URLS[0] ??
      null
    );
  },

  getSideSpriteUrl() {
    return (
      SIDE_FRAME_URLS[0] ??
      null
    );
  },

  getFrontFrameUrls() {
    return FRONT_FRAME_URLS;
  },

  getSideFrameUrls() {
    return SIDE_FRAME_URLS;
  },

  /**
   * Untimed English learning input for AS/UAS.
   *
   * Authority split:
   *
   * Helper resolver:
   * - helperText
   * - pronunciation display
   * - expectedFrames
   * - tokens
   * - tokenGroups
   *
   * Actual target text through the pack rule engine:
   * - expectedPhonemes used for grading
   *
   * Must not return animation timing.
   */
  prepareLearningInput(
    text
  ) {
    const t = String(
      text || ''
    ).trim();

    /*
     * Helper-driven teaching path.
     */
    const r =
      phonemeResolver.resolveUntimed(
        t
      ) || {};

    /*
     * Real-target grading path.
     */
    const gradingExpectedPhonemes =
      resolveGradingPhonemes(
        t
      );

    console.log(
      '[EN GRADING TARGET]',
      {
        targetText: t,

        gradingSource:
          'pack-rule-engine',

        expectedPhonemes:
          gradingExpectedPhonemes,

        helperText:
          typeof r.helperText ===
          'string'
            ? r.helperText
            : '',
      }
    );

    return {
      language: 'en_us',

      text: t,

      normalizedText:
        typeof r.normalizedText ===
        'string'
          ? r.normalizedText
          : '',

      helperText:
        typeof r.helperText ===
        'string'
          ? r.helperText
          : '',

      pronunciation:
        typeof r.pronunciation ===
        'string'
          ? r.pronunciation
          : '',

      /*
       * UAS grading truth:
       * actual target text, not helper text.
       */
      expectedPhonemes:
        gradingExpectedPhonemes,

      /*
       * Teaching animation remains helper-driven.
       */
      expectedFrames:
        Array.isArray(
          r.expectedFrames
        )
          ? r.expectedFrames
          : [],

      tokens:
        Array.isArray(
          r.tokens
        )
          ? r.tokens
          : [],

      tokenGroups:
        Array.isArray(
          r.tokenGroups
        )
          ? r.tokenGroups
          : [],

      articulationMap,
      airflowMap,

      gradingSource:
        gradingExpectedPhonemes.length >
        0
          ? 'pack-rule-engine'
          : null,
    };
  },

  /**
   * Timed helper / animation playback path.
   *
   * This remains helper-driven.
   * It does NOT provide grading truth.
   */
  preparePlayback(
    text
  ) {
    const t = String(
      text || ''
    ).trim();

    const r =
      phonemeResolver.resolve(
        t,
        'en'
      ) || {};

    const timeline =
      Array.isArray(
        r.phonemeTimeline
      )
        ? r.phonemeTimeline
        : [];

    const helperChunks =
      Array.isArray(
        r.helperChunks
      )
        ? r.helperChunks
        : timeline
            .filter(
              (entry) =>
                entry?.label
            )
            .map(
              (entry) => ({
                text:
                  entry.label,

                startMs:
                  entry.startMs,

                endMs:
                  entry.endMs,
              })
            );

    const helperText =
      typeof r.helperText ===
      'string'
        ? r.helperText
        : '';

    const pronunciation =
      typeof r.pronunciation ===
      'string'
        ? r.pronunciation
        : helperText;

    return {
      /*
       * Natural TTS still receives the actual target text.
       */
      ttsText: t,

      timeline,
      helperChunks,
      helperText,
      pronunciation,
    };
  },

  async preparePlaybackWithAudio(
    text,
    options = {}
  ) {
    const base =
      this.preparePlayback(
        text
      );

    if (!base) {
      return null;
    }

    const shortCustomCue =
      options?.targetSource ===
      'custom input'
        ? getShortCustomSoundCue(
            base.ttsText
          )
        : null;

    try {
      const Provider =
        this.Provider;

      const provider =
        Provider
          ? new Provider(
              this.PhonemeResolver,
              this.getProviderOptions?.()
            )
          : null;

      const result =
        provider
          ? await provider.synthesize(
              base.ttsText,
              'en',
              {
                ...this.getProviderOptions?.(),
                ssml:
                  options?.preparedPlayback
                    ?.ttsSsml ??
                  shortCustomCue?.ttsSsml ??
                  null,
              }
            )
          : null;

      const audioUrl =
        result?.audio ??
        null;

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

export {
  phonemeResolver as PhonemeResolver,
};

export default EnglishUSPack;
