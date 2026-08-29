/**
 * SoundMirror PhonemeResolver
 * English (US)
 *
 * Pack-owned rule-engine authority.
 *
 * Locked rules:
 * - pronunciationHelper.js is the only pronunciation authority
 * - visible helper text is parsed into canonical phonemes
 * - only pack-rule-engine phonemes may reach animation or grading
 * - no word dictionary or cross-language fallback is accepted as runtime truth
 * - partial phrases never produce partial animation or grading truth
 * - frame authority remains pack-owned in articulationMap.jsx
 */

import {
  helperForPhoneme,
  isVowel,
} from './phonemeSystem';

import {
  resolveFrame,
} from './articulationMap';

import {
  buildEnglishPronunciationHelper,
} from './pronunciationHelper';

const RULE_PHONEME_SOURCE =
  'pack-rule-engine';

const TIMING = {
  /*
   * Legacy timing used only by the backward-compatible timed resolver.
   * Current reference animation is scaled to teaching-audio duration.
   */
  DEFAULT_HOLD: 130,
  VOWEL_HOLD: 160,
  LEAD_IN_MS: 40,
  PAUSE_MS: 80,
};

function holdForPhoneme(phoneme) {
  return isVowel(phoneme)
    ? TIMING.VOWEL_HOLD
    : TIMING.DEFAULT_HOLD;
}

function buildToken(phoneme) {
  const normalized = String(
    phoneme || ''
  ).trim();

  if (!normalized) {
    return null;
  }

  return {
    phoneme: normalized,
    label:
      helperForPhoneme(normalized) ||
      normalized,
    frame:
      resolveFrame(normalized),
    holdMs:
      holdForPhoneme(normalized),
  };
}

function withoutTiming(token = {}) {
  return {
    phoneme:
      token.phoneme,
    label:
      token.label,
    frame:
      token.frame,
  };
}

function normalizeSourceWord(value = '') {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z']/g, '');
}

function isResolvedHelperWord(
  wordResult
) {
  return Boolean(
    wordResult &&
    wordResult.approved === true &&
    wordResult.unresolved !== true &&
    wordResult.helperAuthority === true &&
    wordResult.phonemeSource ===
      RULE_PHONEME_SOURCE &&
    wordResult.validation?.valid === true &&
    Array.isArray(
      wordResult.phonemes
    ) &&
    wordResult.phonemes.length > 0 &&
    String(
      wordResult.helperText ||
      wordResult.display ||
      ''
    ).trim()
  );
}

function wordIdentity(
  wordResult
) {
  return String(
    wordResult?.normalizedText ||
    wordResult?.sourceText ||
    ''
  ).trim();
}

function unresolvedTruth({
  sourceText,
  helperResult,
  helperText,
  unresolvedWords,
  issues,
}) {
  return {
    sourceText,

    normalizedText: String(
      helperResult?.normalizedText ||
      ''
    ).trim(),

    helperText: '',

    approved: false,
    reviewRequired: true,
    unresolved: true,

    helperAuthority: false,
    phonemeSource: null,

    status:
      helperResult?.status ||
      'unresolved',

    unresolvedWords:
      Array.isArray(unresolvedWords)
        ? unresolvedWords
        : [],

    validation: {
      valid: false,
      issues:
        Array.isArray(issues) &&
        issues.length > 0
          ? issues
          : [
              'pack-rule-engine-unresolved',
            ],
    },

    rejectedHelperText:
      helperText || '',

    tokenGroups: [],
    tokens: [],
    expectedPhonemes: [],
    expectedFrames: [],
  };
}

/**
 * Resolve pronunciation from pack-owned helper rules only.
 *
 * pronunciationHelper.js performs the actual helper-text parsing. This
 * resolver verifies its authority markers before allowing the resulting
 * canonical phonemes to reach animation or grading.
 */
function resolveHelperTruth(text = '') {
  const sourceText = String(
    text || ''
  ).trim();

  const helperResult =
    buildEnglishPronunciationHelper(
      sourceText
    ) || {};

  const helperText = String(
    helperResult.helperText ||
    helperResult.display ||
    helperResult.pronunciation ||
    ''
  ).trim();

  const words =
    Array.isArray(helperResult.words)
      ? helperResult.words
      : [];

  const rejectedWords =
    words.filter(
      (wordResult) =>
        !isResolvedHelperWord(
          wordResult
        )
    );

  const unresolvedWords =
    rejectedWords
      .map(wordIdentity)
      .filter(Boolean);

  const authorityValid =
    helperResult.helperAuthority ===
      true &&
    helperResult.phonemeSource ===
      RULE_PHONEME_SOURCE;

  const resultValid =
    sourceText.length > 0 &&
    helperResult.approved === true &&
    helperResult.unresolved !== true &&
    helperResult.validation?.valid ===
      true &&
    authorityValid &&
    words.length > 0 &&
    rejectedWords.length === 0 &&
    helperText.length > 0 &&
    Array.isArray(
      helperResult.phonemes
    ) &&
    helperResult.phonemes.length > 0;

  if (!resultValid) {
    const issues = [
      ...(
        Array.isArray(
          helperResult.validation?.issues
        )
          ? helperResult.validation.issues
          : []
      ),
    ];

    if (
      helperResult.helperAuthority !==
      true
    ) {
      issues.push(
        'helper-authority-marker-missing'
      );
    }

    if (
      helperResult.phonemeSource !==
      RULE_PHONEME_SOURCE
    ) {
      issues.push(
        'phoneme-source-not-pack-rule-engine'
      );
    }

    rejectedWords.forEach(
      (wordResult) => {
        const identity =
          wordIdentity(wordResult) ||
          'unknown';

        if (
          wordResult?.approved !== true
        ) {
          issues.push(
            `${identity}:helper-not-approved`
          );
        }

        if (
          wordResult?.helperAuthority !==
          true
        ) {
          issues.push(
            `${identity}:helper-authority-marker-missing`
          );
        }

        if (
          wordResult?.phonemeSource !==
          RULE_PHONEME_SOURCE
        ) {
          issues.push(
            `${identity}:phoneme-source-not-pack-rule-engine`
          );
        }

        if (
          !Array.isArray(
            wordResult?.phonemes
          ) ||
          wordResult.phonemes.length ===
            0
        ) {
          issues.push(
            `${identity}:no-helper-derived-phonemes`
          );
        }
      }
    );

    const uniqueIssues = [
      ...new Set(
        issues.filter(Boolean)
      ),
    ];

    if (sourceText) {
      console.warn(
        '[EN PACK RULE ENGINE] Target unresolved',
        {
          sourceText,

          normalizedText:
            helperResult.normalizedText ||
            '',

          status:
            helperResult.status ||
            'unresolved',

          helperAuthority:
            helperResult.helperAuthority ??
            false,

          phonemeSource:
            helperResult.phonemeSource ??
            null,

          unresolvedWords,

          issues:
            uniqueIssues,
        }
      );
    }

    return unresolvedTruth({
      sourceText,
      helperResult,
      helperText,
      unresolvedWords,
      issues:
        uniqueIssues.length > 0
          ? uniqueIssues
          : [
              'pack-rule-engine-unresolved',
            ],
    });
  }

  const tokenGroups =
    words.map(
      (
        wordResult,
        wordIndex
      ) => {
        const phonemes = [
          ...wordResult.phonemes,
        ];

        const tokens =
          phonemes
            .map(buildToken)
            .filter(Boolean);

        return {
          word:
            wordIdentity(
              wordResult
            ) ||
            normalizeSourceWord(
              wordResult.sourceText ||
              ''
            ),

          sourceWord: String(
            wordResult.sourceText ||
            ''
          ).trim(),

          helperText: String(
            wordResult.helperText ||
            wordResult.display ||
            ''
          ).trim(),

          wordIndex,

          helperAuthority: true,

          phonemeSource:
            RULE_PHONEME_SOURCE,

          tokens,
        };
      }
    );

  const tokenFailure =
    tokenGroups.some(
      (group) =>
        !Array.isArray(
          group.tokens
        ) ||
        group.tokens.length === 0
    );

  if (tokenFailure) {
    return unresolvedTruth({
      sourceText,
      helperResult,
      helperText,
      unresolvedWords:
        tokenGroups
          .filter(
            (group) =>
              !group.tokens.length
          )
          .map(
            (group) =>
              group.word
          ),
      issues: [
        'pack-rule-engine-produced-no-runtime-tokens',
      ],
    });
  }

  const tokens =
    tokenGroups.flatMap(
      (group) =>
        group.tokens
    );

  const expectedPhonemes =
    tokens.map(
      (token) =>
        token.phoneme
    );

  const expectedFrames =
    tokens.map(
      (token) =>
        token.frame
    );

  return {
    sourceText,

    normalizedText: String(
      helperResult.normalizedText ||
      ''
    ).trim(),

    helperText,

    approved: true,
    reviewRequired: false,
    unresolved: false,

    helperAuthority: true,

    phonemeSource:
      RULE_PHONEME_SOURCE,

    status:
      helperResult.status ||
      'approved',

    unresolvedWords: [],

    validation: {
      valid: true,
      issues: [],
    },

    tokenGroups,
    tokens,
    expectedPhonemes,
    expectedFrames,
  };
}

export class PhonemeResolver {
  /**
   * Untimed English resolver path for animation preparation and UAS.
   *
   * No animation timing is returned from this method.
   */
  resolveUntimed(text = '') {
    const truth =
      resolveHelperTruth(text);

    const tokenGroups =
      truth.tokenGroups.map(
        (group) => ({
          word:
            group.word,

          sourceWord:
            group.sourceWord,

          helperText:
            group.helperText,

          wordIndex:
            group.wordIndex,

          helperAuthority:
            group.helperAuthority,

          phonemeSource:
            group.phonemeSource,

          tokens:
            group.tokens.map(
              withoutTiming
            ),
        })
      );

    const tokens =
      tokenGroups.flatMap(
        (group) =>
          group.tokens
      );

    return {
      text:
        truth.sourceText,

      normalizedText:
        truth.normalizedText,

      helperText:
        truth.helperText,

      pronunciation:
        truth.helperText,

      expectedPhonemes:
        truth.expectedPhonemes,

      expectedFrames:
        truth.expectedFrames,

      tokens,
      tokenGroups,

      /*
       * Compatibility marker retained for existing diagnostics.
       */
      helperAuthority:
        truth.helperAuthority
          ? 'pronunciationHelper'
          : null,

      helperAuthorityConfirmed:
        truth.helperAuthority,

      phonemeSource:
        truth.phonemeSource,

      helperStatus:
        truth.status,

      helperApproved:
        truth.approved,

      reviewRequired:
        truth.reviewRequired,

      unresolved:
        truth.unresolved,

      unresolvedWords:
        truth.unresolvedWords,

      validation:
        truth.validation,
    };
  }

  /**
   * Legacy timed playback path.
   *
   * This uses the same pack-rule-derived phonemes as resolveUntimed().
   * Its timing is fallback data that Practice later scales to teaching audio.
   */
  resolve(text = '') {
    const truth =
      resolveHelperTruth(text);

    if (!truth.sourceText) {
      return {
        word: '',
        helperText: '',
        helperChunks: [],
        phonemeTimeline: [],
        pronunciation: '',
        phonemes: [],
        frames: [0, 0],

        helperAuthority: null,
        helperAuthorityConfirmed:
          false,
        phonemeSource: null,

        helperStatus:
          'unresolved',

        helperApproved:
          false,

        reviewRequired:
          true,

        unresolved:
          true,

        unresolvedWords: [],

        validation: {
          valid: false,
          issues: [
            'empty-text',
          ],
        },
      };
    }

    /*
     * Never manufacture partial animation or scoring truth.
     */
    if (
      !truth.approved ||
      truth.helperAuthority !== true ||
      truth.phonemeSource !==
        RULE_PHONEME_SOURCE ||
      truth.tokens.length === 0
    ) {
      return {
        word:
          truth.sourceText,

        helperText: '',

        helperChunks: [],

        phonemeTimeline: [
          {
            phoneme:
              'neutral',

            frame: 0,

            startMs: 0,

            endMs:
              TIMING.LEAD_IN_MS,
          },

          {
            phoneme:
              'neutral',

            frame: 0,

            startMs:
              TIMING.LEAD_IN_MS,

            endMs:
              TIMING.LEAD_IN_MS *
              2,
          },
        ],

        pronunciation: '',

        phonemes: [],
        frames: [0, 0],

        helperAuthority: null,

        helperAuthorityConfirmed:
          false,

        phonemeSource: null,

        helperStatus:
          truth.status,

        helperApproved:
          false,

        reviewRequired:
          true,

        unresolved:
          true,

        unresolvedWords:
          truth.unresolvedWords,

        validation:
          truth.validation,
      };
    }

    const phonemeTimeline = [];
    const phonemes = [];
    const frames = [0];
    const helperChunks = [];

    let cursor = 0;

    phonemeTimeline.push({
      phoneme:
        'neutral',

      frame: 0,

      startMs: 0,

      endMs:
        TIMING.LEAD_IN_MS,
    });

    cursor =
      TIMING.LEAD_IN_MS;

    truth.tokenGroups.forEach(
      (
        group,
        wordIndex
      ) => {
        if (wordIndex > 0) {
          phonemeTimeline.push({
            phoneme:
              'pause',

            frame: 0,

            startMs:
              cursor,

            endMs:
              cursor +
              TIMING.PAUSE_MS,
          });

          frames.push(0);

          cursor +=
            TIMING.PAUSE_MS;
        }

        const wordStartMs =
          cursor;

        group.tokens.forEach(
          (token) => {
            const startMs =
              cursor;

            const endMs =
              cursor +
              token.holdMs;

            phonemeTimeline.push({
              phoneme:
                token.phoneme,

              label:
                token.label,

              frame:
                token.frame,

              startMs,
              endMs,

              helperAuthority:
                true,

              phonemeSource:
                RULE_PHONEME_SOURCE,
            });

            phonemes.push(
              token.phoneme
            );

            frames.push(
              token.frame
            );

            cursor =
              endMs;
          }
        );

        if (group.helperText) {
          helperChunks.push({
            text:
              group.helperText,

            startMs:
              wordStartMs,

            endMs:
              cursor,

            wordIndex,

            helperAuthority:
              true,

            phonemeSource:
              RULE_PHONEME_SOURCE,
          });
        }
      }
    );

    phonemeTimeline.push({
      phoneme:
        'neutral',

      frame: 0,

      startMs:
        cursor,

      endMs:
        cursor +
        TIMING.LEAD_IN_MS,
    });

    frames.push(0);

    return {
      word:
        truth.sourceText,

      helperText:
        truth.helperText,

      helperChunks,
      phonemeTimeline,

      pronunciation:
        truth.helperText,

      phonemes,
      frames,

      helperAuthority:
        'pronunciationHelper',

      helperAuthorityConfirmed:
        true,

      phonemeSource:
        RULE_PHONEME_SOURCE,

      helperStatus:
        truth.status,

      helperApproved:
        true,

      reviewRequired:
        false,

      unresolved:
        false,

      unresolvedWords: [],

      validation:
        truth.validation,
    };
  }
}

export default PhonemeResolver;
