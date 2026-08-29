/**
 * SoundMirror pronunciation helper — Arabic (ar)
 *
 * Arabic commonly omits short vowels. A helper may be rendered for any input,
 * but an unvowelled spelling must not be presented as certified pronunciation
 * truth. Marked entries are mechanically validated by the pack resolver;
 * unmarked entries remain visible, accountable review items until the language
 * pack supplies a vowelled form.
 */

import PhonemeResolver from './PhonemeResolver';
import universal500 from './universal500';

export const ARABIC_PRESET_WORDS = Object.freeze([
  'مرحبا',
  'أهلا',
  'ابتسم',
  'شكرا',
  'آسف',
  'نعم',
  'لا',
  'أهلاً وسهلاً',
  'وداعا',
  'قبلة',
]);

export const ARABIC_PRESET_PHRASES = Object.freeze([
  'صباح الخير',
  'اعذرني',
  'مساء الخير',
  'كيف حالك',
  'أنا بخير',
  'شكرا جزيلا',
  'أراك قريبا',
  'تصبح على خير',
]);

const resolver = new PhonemeResolver();

function wordsFromText(value = '') {
  return String(value ?? '')
    .normalize('NFC')
    .trim()
    .split(/\s+/)
    .map((word) => word.trim())
    .filter(Boolean);
}

function buildWordResult(word = '') {
  const sourceText = String(word ?? '').normalize('NFC').trim();
  const resolved = resolver.resolveUntimed(sourceText, 'ar') || {};
  const display = String(resolved.helperText || resolved.pronunciation || '').trim();
  const hasOutput =
    Boolean(display) &&
    Array.isArray(resolved.expectedPhonemes) &&
    resolved.expectedPhonemes.length > 0;
  const ambiguous =
    resolved.ambiguous === true || resolved.validation?.reason === 'ambiguous';
  const approved = hasOutput && !ambiguous;
  const status = approved ? 'approved' : hasOutput ? 'review' : 'unresolved';

  return {
    language: 'ar',
    kind: 'word',
    text: sourceText,
    normalizedText: String(resolved.normalizedText || sourceText),
    display,
    helperText: display,
    pronunciation: display,
    phonemes: Array.isArray(resolved.expectedPhonemes)
      ? resolved.expectedPhonemes
      : [],
    frames: Array.isArray(resolved.expectedFrames)
      ? resolved.expectedFrames
      : [],
    status,
    approved,
    reviewRequired: !approved,
    unresolved: !hasOutput,
    humanReviewed: false,
    mechanicallyValidated: approved,
    ambiguityReason: ambiguous ? 'short-vowels-not-written' : null,
    presetTruthApplied: resolved.presetTruthApplied === true,
    catalogTruthApplied: resolved.catalogTruthApplied === true,
    truthEntryId: resolved.truthEntryId ?? null,
    approvalSource: approved
      ? resolved.truthSource || 'arabic-mark-preserving-resolver'
      : null,
    validation: {
      valid: approved,
      reason: approved
        ? null
        : ambiguous
          ? 'ambiguous'
          : 'helper-not-produced',
    },
  };
}

export function buildPronunciationHelper(text = '') {
  const sourceText = String(text ?? '').normalize('NFC').trim();
  const sourceWords = wordsFromText(sourceText);

  if (!sourceWords.length) {
    return {
      language: 'ar',
      kind: 'text',
      text: sourceText,
      normalizedText: '',
      display: '',
      helperText: '',
      pronunciation: '',
      status: 'unresolved',
      approved: false,
      reviewRequired: true,
      unresolved: true,
      humanReviewed: false,
      mechanicallyValidated: false,
      words: [],
      validation: { valid: false, reason: 'empty-text' },
    };
  }

  const fullResolved = resolver.resolveUntimed(sourceText, 'ar') || {};
  const fullDisplay = String(
    fullResolved.helperText || fullResolved.pronunciation || ''
  ).trim();
  const certifiedTruthApproved =
    (fullResolved.presetTruthApplied === true ||
      fullResolved.catalogTruthApplied === true) &&
    fullResolved.ambiguous !== true &&
    Boolean(fullDisplay) &&
    Array.isArray(fullResolved.expectedPhonemes) &&
    fullResolved.expectedPhonemes.length > 0;
  const words = sourceWords.map(buildWordResult);

  if (certifiedTruthApproved) {
    return {
      language: 'ar',
      kind: words.length === 1 ? 'word' : 'phrase',
      text: sourceText,
      normalizedText: String(fullResolved.normalizedText || sourceText),
      display: fullDisplay,
      helperText: fullDisplay,
      pronunciation: fullDisplay,
      phonemes: fullResolved.expectedPhonemes,
      frames: Array.isArray(fullResolved.expectedFrames)
        ? fullResolved.expectedFrames
        : [],
      status: 'approved',
      approved: true,
      reviewRequired: false,
      unresolved: false,
      humanReviewed: false,
      mechanicallyValidated: true,
      presetTruthApplied: fullResolved.presetTruthApplied === true,
      catalogTruthApplied: fullResolved.catalogTruthApplied === true,
      truthEntryId: fullResolved.truthEntryId ?? null,
      approvalSource:
        fullResolved.truthSource || 'arabic-vowelled-catalog-truth',
      words,
      validation: { valid: true, reason: null, issues: [] },
    };
  }

  const unresolvedWords = words.filter((word) => word.unresolved);
  const reviewWords = words.filter((word) => word.status === 'review');
  const display = words.map((word) => word.display).filter(Boolean).join(' ');
  const approved = unresolvedWords.length === 0 && reviewWords.length === 0;
  const unresolved = unresolvedWords.length > 0;
  const status = approved ? 'approved' : unresolved ? 'unresolved' : 'review';

  return {
    language: 'ar',
    kind: words.length === 1 ? 'word' : 'phrase',
    text: sourceText,
    normalizedText: words.map((word) => word.normalizedText).join(' '),
    display,
    helperText: display,
    pronunciation: display,
    phonemes: words.flatMap((word) => word.phonemes),
    frames: words.flatMap((word) => word.frames),
    status,
    approved,
    reviewRequired: !approved,
    unresolved,
    humanReviewed: false,
    mechanicallyValidated: approved,
    presetTruthApplied: false,
    truthEntryId: null,
    approvalSource: approved ? 'arabic-mark-preserving-resolver' : null,
    words,
    validation: {
      valid: approved,
      reason: approved
        ? null
        : unresolved
          ? 'one-or-more-words-unresolved'
          : 'ambiguous',
      issues: [
        ...unresolvedWords.map(
          (word) => `${word.normalizedText || word.text}:helper-not-produced`
        ),
        ...reviewWords.map(
          (word) => `${word.normalizedText || word.text}:short-vowels-not-written`
        ),
      ],
    },
  };
}

function collectUniversal500Words() {
  if (!Array.isArray(universal500)) return [];
  return universal500.flatMap((group) =>
    Array.isArray(group?.words) ? group.words : []
  );
}

export function runPronunciationHelperAudit({
  presetWords = ARABIC_PRESET_WORDS,
  presetPhrases = ARABIC_PRESET_PHRASES,
  includeUniversal500 = true,
} = {}) {
  const entries = [
    ...presetWords.map((text) => ({ corpus: 'preset-word', text })),
    ...presetPhrases.map((text) => ({ corpus: 'preset-phrase', text })),
    ...(includeUniversal500 ? collectUniversal500Words() : []).map((text) => ({
      corpus: 'universal500',
      text,
    })),
  ];

  const items = entries.map((entry) => {
    const result = buildPronunciationHelper(entry.text);
    return {
      ...entry,
      status: result.status,
      approved: result.approved,
      reviewRequired: result.reviewRequired,
      unresolved: result.unresolved,
      display: result.display,
      validation: result.validation,
      result,
    };
  });

  const approvedItems = items.filter((item) => item.status === 'approved');
  const reviewItems = items.filter((item) => item.status === 'review');
  const unresolvedItems = items.filter((item) => item.status === 'unresolved');
  const presetItems = items.filter((item) => item.corpus !== 'universal500');
  const presetApprovedItems = presetItems.filter((item) => item.approved);
  const catalogItems = items.filter((item) => item.corpus === 'universal500');
  const catalogApprovedItems = catalogItems.filter((item) => item.approved);

  return {
    languageImplemented: true,
    language: 'ar',
    items,
    approvedItems,
    reviewItems,
    unresolvedItems,
    summary: {
      total: items.length,
      approved: approvedItems.length,
      review: reviewItems.length,
      unresolved: unresolvedItems.length,
      presetApproved: presetApprovedItems.length,
      catalogApproved: catalogApprovedItems.length,
      presetWords: items.filter((item) => item.corpus === 'preset-word').length,
      presetPhrases: items.filter((item) => item.corpus === 'preset-phrase').length,
      universal500: items.filter((item) => item.corpus === 'universal500').length,
    },
  };
}

export default {
  buildPronunciationHelper,
  runPronunciationHelperAudit,
};
