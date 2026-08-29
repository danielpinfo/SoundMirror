import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { build } from 'esbuild';

const PROJECT_ROOT = process.cwd();
const PACK_ROOT = path.join(PROJECT_ROOT, 'src', 'components', 'languagepacks');

const PACK_PROFILES = {
  en_us: {
    label: 'English (US)',
    helperAuditExport: 'runEnglishPronunciationHelperAudit',
    samples: ['cream', 'Excuse me', 'unfamiliar'],
    guidedProbe: 'g',
  },
  es: {
    label: 'Spanish',
    helperAuditExport: 'runPronunciationHelperAudit',
    samples: ['Bienvenido', 'Perdóneme', 'biblioteca'],
    guidedProbe: 'b',
  },
  ar: {
    label: 'Arabic',
    helperAuditExport: 'runPronunciationHelperAudit',
    samples: ['مرحبا', 'شكراً', 'الشمس'],
    guidedProbe: 'ب',
  },
  zh: {
    label: 'Mandarin Chinese',
    helperAuditExport: 'runPronunciationHelperAudit',
    samples: ['你好', '不客气', '银行'],
    guidedProbe: 'zh',
  },
  ja: {
    label: 'Japanese',
    helperAuditExport: 'runPronunciationHelperAudit',
    samples: ['笑顔', 'こんにちは', 'ファイル'],
    guidedProbe: 'k',
  },
  hi: {
    label: 'Hindi',
    helperAuditExport: 'runPronunciationHelperAudit',
    samples: ['नमस्ते', 'धन्यवाद', 'शक्ति'],
    guidedProbe: 'kh',
  },
};

const REQUIRED_FILES = [
  'manifest.jsx',
  'phonemeSystem.jsx',
  'PhonemeResolver.jsx',
  'pronunciationHelper.js',
  'articulationMap.jsx',
  'airflowMap.jsx',
  'coachingRules.jsx',
  'uasCoaching.jsx',
  'displayHelpers.jsx',
  'helperRenderer.jsx',
  'uiTranslations.jsx',
  'universal500.jsx',
  'provider/GoogleTTSProvider.jsx',
  'index.jsx',
];

const moduleCache = new Map();

function normalizeArabicBase(value = '') {
  return String(value ?? '')
    .normalize('NFC')
    .replace(/\u0640/g, '')
    .replace(/[\u064B-\u0652\u0670]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseArgs(argv) {
  const args = {
    packs: Object.keys(PACK_PROFILES),
    json: false,
    verbose: false,
  };

  for (const arg of argv) {
    if (arg === '--json') args.json = true;
    if (arg === '--verbose') args.verbose = true;
    if (arg.startsWith('--packs=')) {
      args.packs = arg
        .slice('--packs='.length)
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean);
    }
  }

  const unknown = args.packs.filter((packId) => !PACK_PROFILES[packId]);
  if (unknown.length) {
    throw new Error(`Unknown pack(s): ${unknown.join(', ')}`);
  }

  return args;
}

function packPath(packId, relativePath) {
  return path.join(PACK_ROOT, packId, relativePath);
}

function exists(packId, relativePath) {
  return fs.existsSync(packPath(packId, relativePath));
}

function readText(packId, relativePath) {
  return fs.readFileSync(packPath(packId, relativePath), 'utf8');
}

function listFilesRecursive(rootPath) {
  if (!fs.existsSync(rootPath)) return [];
  return fs.readdirSync(rootPath, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(rootPath, entry.name);
    return entry.isDirectory() ? listFilesRecursive(entryPath) : [entryPath];
  });
}

async function loadBundledModule(filePath) {
  const absolutePath = path.resolve(filePath);
  if (moduleCache.has(absolutePath)) return moduleCache.get(absolutePath);

  const output = await build({
    entryPoints: [absolutePath],
    bundle: true,
    write: false,
    platform: 'node',
    format: 'esm',
    banner: {
      js: "import { createRequire } from 'node:module'; const require = createRequire(process.cwd() + '/audit-language-pack.js');",
    },
    logLevel: 'silent',
  });

  const code = output.outputFiles[0].text;
  const url = `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`;
  const loaded = await import(url);
  moduleCache.set(absolutePath, loaded);
  return loaded;
}

function createReport(packId) {
  return {
    packId,
    label: PACK_PROFILES[packId].label,
    checks: [],
    metrics: {},
  };
}

function addCheck(report, status, code, message, details = undefined) {
  report.checks.push({ status, code, message, ...(details === undefined ? {} : { details }) });
}

function pass(report, code, message, details) {
  addCheck(report, 'pass', code, message, details);
}

function warn(report, code, message, details) {
  addCheck(report, 'warning', code, message, details);
}

function fail(report, code, message, details) {
  addCheck(report, 'error', code, message, details);
}

function getSequences(output = {}) {
  const phonemes = Array.isArray(output.expectedPhonemes)
    ? output.expectedPhonemes
    : Array.isArray(output.phonemes)
      ? output.phonemes
      : [];
  const frames = Array.isArray(output.expectedFrames)
    ? output.expectedFrames
    : Array.isArray(output.frames)
      ? output.frames
      : [];
  const tokens = Array.isArray(output.tokens) ? output.tokens : [];
  return { phonemes, frames, tokens };
}

function sameArray(left, right) {
  return (
    Array.isArray(left) &&
    Array.isArray(right) &&
    left.length === right.length &&
    left.every((value, index) => value === right[index])
  );
}

function timelineIsMonotonic(timeline) {
  if (!Array.isArray(timeline) || timeline.length === 0) return false;

  let previousEnd = -1;
  for (const entry of timeline) {
    if (!Number.isFinite(entry?.startMs) || !Number.isFinite(entry?.endMs)) return false;
    if (entry.startMs < previousEnd || entry.endMs < entry.startMs) return false;
    previousEnd = entry.endMs;
  }

  return true;
}

function flattenLibrary(groups) {
  if (!Array.isArray(groups)) return [];
  return groups.flatMap((group) => (Array.isArray(group?.words) ? group.words : []));
}

async function auditStructure(packId, report) {
  const missing = REQUIRED_FILES.filter((relativePath) => !exists(packId, relativePath));
  if (missing.length) {
    fail(report, 'STRUCTURE_REQUIRED_FILES', 'Required language-pack files are missing.', missing);
  } else {
    pass(report, 'STRUCTURE_REQUIRED_FILES', 'All required language-pack files are present.');
  }

  if (exists(packId, 'guidedSoundLibrary.jsx')) {
    pass(report, 'STRUCTURE_GUIDED_LIBRARY', 'Guided single-sound library is present.');
  } else {
    fail(
      report,
      'STRUCTURE_GUIDED_LIBRARY',
      'Guided single-sound library is missing; guided recovery cannot guarantee phonetic playback.'
    );
  }

  const indexSource = readText(packId, 'index.jsx');
  const helperWired = /run(?:[A-Za-z]+)?PronunciationHelperAudit/.test(indexSource);
  if (helperWired) {
    pass(report, 'WIRING_HELPER_AUDIT', 'Pronunciation-helper audit is exposed by the pack.');
  } else {
    fail(report, 'WIRING_HELPER_AUDIT', 'Pronunciation-helper audit exists on disk but is not wired into the pack.');
  }

  if (/getGuidedSoundCue/.test(indexSource)) {
    pass(report, 'WIRING_GUIDED_LIBRARY', 'Guided single-sound lookup is exposed by the pack.');
  } else {
    fail(report, 'WIRING_GUIDED_LIBRARY', 'The pack does not expose getGuidedSoundCue().');
  }

  if (exists(packId, 'presets.jsx') && !/from ['"]\.\/presets['"]/.test(indexSource)) {
    warn(
      report,
      'WIRING_UNUSED_PRESET_CATALOG',
      'presets.jsx exists but the runtime index does not import it; preset sources can diverge.'
    );
  }
}

async function auditManifest(packId, report) {
  try {
    const module = await loadBundledModule(packPath(packId, 'manifest.jsx'));
    const manifest = module.default;
    const required = ['id', 'language', 'locale', 'provider', 'defaultVoice'];
    const missing = required.filter((key) => !manifest?.[key]);

    if (missing.length) {
      fail(report, 'MANIFEST_REQUIRED_FIELDS', 'Manifest fields are missing.', missing);
    } else {
      pass(report, 'MANIFEST_REQUIRED_FIELDS', 'Manifest contains the required identity and TTS fields.');
    }

    if (Number.isFinite(manifest?.speechRate) && manifest.speechRate >= 0.25 && manifest.speechRate <= 2) {
      pass(report, 'MANIFEST_SPEECH_RATE', `Speech rate is valid (${manifest.speechRate}).`);
    } else {
      fail(report, 'MANIFEST_SPEECH_RATE', 'Manifest speechRate must be between 0.25 and 2.0.');
    }

    if (manifest?.articulationFrames === 20) {
      pass(report, 'MANIFEST_FRAME_COUNT', 'Manifest declares the shared 20-frame articulation system.');
    } else {
      fail(report, 'MANIFEST_FRAME_COUNT', 'Manifest must declare 20 articulation frames.');
    }
  } catch (error) {
    fail(report, 'MANIFEST_LOAD', 'Manifest could not be loaded.', error.message);
  }
}

async function auditHelperEngine(packId, report) {
  const profile = PACK_PROFILES[packId];

  try {
    const module = await loadBundledModule(packPath(packId, 'pronunciationHelper.js'));
    const auditFunction = module[profile.helperAuditExport];

    if (typeof auditFunction !== 'function') {
      fail(report, 'HELPER_AUDIT_EXPORT', `Missing ${profile.helperAuditExport}().`);
      return;
    }

    const result = await auditFunction(
      packId === 'ja'
        ? { dicPath: path.join(PROJECT_ROOT, 'node_modules', 'kuromoji', 'dict') }
        : undefined
    );
    const summary = result?.summary ?? {};
    report.metrics.helperAudit = summary;

    if (result?.languageImplemented === true) {
      pass(report, 'HELPER_IMPLEMENTED', 'Language-specific helper engine reports implemented.');
    } else {
      fail(report, 'HELPER_IMPLEMENTED', 'Language-specific helper engine reports unimplemented.');
    }

    if (Number(summary.total) >= 500) {
      pass(report, 'HELPER_COVERAGE', `Helper audit covers ${summary.total} items.`);
    } else {
      fail(report, 'HELPER_COVERAGE', `Helper audit covers only ${Number(summary.total) || 0} items; at least 500 are required.`);
    }

    if (summary.total > 0 && summary.approved === summary.total && summary.unresolved === 0) {
      pass(report, 'HELPER_RESOLUTION', 'Every audited helper is approved and resolved.');
    } else {
      fail(report, 'HELPER_RESOLUTION', 'Helper audit contains unapproved or unresolved items.', summary);
    }

    if (summary.total > 0 && Array.isArray(result?.items) && result.items.length === summary.total) {
      pass(report, 'HELPER_ITEM_ACCOUNTING', 'Helper item count matches the summary.');
    } else {
      fail(report, 'HELPER_ITEM_ACCOUNTING', 'Helper audit has no accountable item set or does not match the summary.');
    }

    if (packId === 'ar') {
      const presetItems = Array.isArray(result?.items)
        ? result.items.filter((item) => item?.corpus === 'preset-word' || item?.corpus === 'preset-phrase')
        : [];
      const failedPresets = presetItems
        .filter((item) => {
          const phonemes = item?.result?.phonemes;
          const frames = item?.result?.frames;
          const normalizedText = String(item?.result?.normalizedText ?? '');
          return (
            item?.approved !== true ||
            item?.result?.presetTruthApplied !== true ||
            item?.result?.reviewRequired === true ||
            !/[\u064B-\u0652\u0670]/.test(normalizedText) ||
            !Array.isArray(phonemes) ||
            !Array.isArray(frames) ||
            phonemes.length === 0 ||
            phonemes.length !== frames.length
          );
        })
        .map((item) => ({
          corpus: item?.corpus,
          text: item?.text,
          status: item?.status,
          presetTruthApplied: item?.result?.presetTruthApplied,
          normalizedText: item?.result?.normalizedText,
          phonemeCount: item?.result?.phonemes?.length,
          frameCount: item?.result?.frames?.length,
          validation: item?.validation,
        }));

      if (presetItems.length === 18 && failedPresets.length === 0) {
        pass(
          report,
          'AR_PRESET_TRUTH_COVERAGE',
          'All 18 Arabic demo presets use approved, fully vowelled pack truth.'
        );
      } else {
        fail(
          report,
          'AR_PRESET_TRUTH_COVERAGE',
          'Arabic demo presets are missing approved vowelled truth.',
          { presetCount: presetItems.length, failedPresets }
        );
      }

      const catalogItems = Array.isArray(result?.items)
        ? result.items.filter((item) => item?.corpus === 'universal500')
        : [];
      const failedCatalogItems = catalogItems
        .filter((item) => {
          const resolved = item?.result ?? {};
          const normalizedText = String(resolved.normalizedText ?? '');
          return (
            item?.approved !== true ||
            resolved.reviewRequired === true ||
            (resolved.catalogTruthApplied !== true &&
              resolved.presetTruthApplied !== true) ||
            !/[\u064B-\u0652\u0670]/.test(normalizedText) ||
            normalizeArabicBase(normalizedText) !==
              normalizeArabicBase(item?.text) ||
            !Array.isArray(resolved.phonemes) ||
            !Array.isArray(resolved.frames) ||
            resolved.phonemes.length === 0 ||
            resolved.phonemes.length !== resolved.frames.length
          );
        })
        .map((item) => ({
          text: item?.text,
          status: item?.status,
          catalogTruthApplied: item?.result?.catalogTruthApplied,
          presetTruthApplied: item?.result?.presetTruthApplied,
          normalizedText: item?.result?.normalizedText,
          validation: item?.validation,
        }));
      const uniqueCatalogCount = new Set(
        catalogItems.map((item) =>
          String(item?.text ?? '').normalize('NFC').trim()
        )
      ).size;

      if (
        catalogItems.length >= 500 &&
        uniqueCatalogCount === catalogItems.length &&
        failedCatalogItems.length === 0
      ) {
        pass(
          report,
          'AR_CATALOG_TRUTH_COVERAGE',
          `All ${catalogItems.length} unique Arabic library entries use approved, fully vowelled pack truth.`
        );
      } else {
        fail(
          report,
          'AR_CATALOG_TRUTH_COVERAGE',
          'Arabic library entries are missing approved vowelled truth.',
          {
            catalogCount: catalogItems.length,
            uniqueCatalogCount,
            failedCatalogItems,
          }
        );
      }
    }

    if (packId === 'zh') {
      const presetItems = Array.isArray(result?.items)
        ? result.items.filter(
            (item) =>
              item?.corpus === 'preset-word' ||
              item?.corpus === 'preset-phrase'
          )
        : [];
      const catalogItems = Array.isArray(result?.items)
        ? result.items.filter((item) => item?.corpus === 'universal500')
        : [];
      const invalidItems = [...presetItems, ...catalogItems]
        .filter((item) => {
          const resolved = item?.result ?? {};
          return (
            item?.approved !== true ||
            resolved.reviewRequired === true ||
            !String(resolved.helperText || '').trim() ||
            !/\p{Script=Latin}/u.test(String(resolved.helperText || '')) ||
            !/[0-4]/.test(String(resolved.pinyinNumbered || '')) ||
            !Array.isArray(resolved.phonemes) ||
            !Array.isArray(resolved.frames) ||
            resolved.phonemes.length === 0 ||
            resolved.phonemes.length !== resolved.frames.length ||
            !Array.isArray(resolved.tones) ||
            resolved.tones.length === 0 ||
            resolved.tones.some(
              (tone) => !Number.isInteger(tone) || tone < 0 || tone > 4
            )
          );
        })
        .map((item) => ({
          corpus: item?.corpus,
          text: item?.text,
          helperText: item?.result?.helperText,
          pinyinNumbered: item?.result?.pinyinNumbered,
          phonemeCount: item?.result?.phonemes?.length,
          frameCount: item?.result?.frames?.length,
          tones: item?.result?.tones,
          validation: item?.validation,
        }));

      if (
        presetItems.length === 18 &&
        catalogItems.length === 589 &&
        invalidItems.length === 0
      ) {
        pass(
          report,
          'ZH_CONTEXTUAL_HELPER_COVERAGE',
          'All 18 Mandarin presets and 589 unique library entries have aligned contextual pinyin and tone truth.'
        );
      } else {
        fail(
          report,
          'ZH_CONTEXTUAL_HELPER_COVERAGE',
          'Mandarin preset or catalog helpers are missing contextual pinyin, tones, or aligned phoneme truth.',
          {
            presetCount: presetItems.length,
            catalogCount: catalogItems.length,
            invalidItems,
          }
        );
      }
    }
  } catch (error) {
    fail(report, 'HELPER_AUDIT_RUNTIME', 'Pronunciation-helper audit threw an exception.', error.message);
  }
}

async function auditArabicPlaybackTruth(report) {
  try {
    const [packModule, libraryModule] = await Promise.all([
      loadBundledModule(packPath('ar', 'index.jsx')),
      loadBundledModule(packPath('ar', 'universal500.jsx')),
    ]);
    const pack = packModule.default;
    const words = flattenLibrary(libraryModule.default);
    const uniqueWordCount = new Set(
      words.map((word) => String(word).normalize('NFC').trim())
    ).size;
    const failures = [];

    for (const word of words) {
      const playback = pack?.preparePlayback?.(word);
      const ttsText = String(playback?.ttsText ?? '');
      if (
        !playback ||
        (playback.catalogTruthApplied !== true &&
          playback.presetTruthApplied !== true) ||
        !/[\u064B-\u0652\u0670]/.test(ttsText) ||
        normalizeArabicBase(ttsText) !== normalizeArabicBase(word)
      ) {
        failures.push({
          word,
          ttsText,
          catalogTruthApplied: playback?.catalogTruthApplied,
          presetTruthApplied: playback?.presetTruthApplied,
        });
      }
    }

    if (
      words.length >= 500 &&
      uniqueWordCount === words.length &&
      failures.length === 0
    ) {
      pass(
        report,
        'AR_CATALOG_TTS_TRUTH',
        `All ${words.length} unique Arabic library entries send certified vowelled text to TTS.`
      );
    } else {
      fail(
        report,
        'AR_CATALOG_TTS_TRUTH',
        'Arabic catalog playback does not consistently send certified truth to TTS.',
        { catalogCount: words.length, uniqueWordCount, failures }
      );
    }
  } catch (error) {
    fail(
      report,
      'AR_CATALOG_TTS_TRUTH',
      'Arabic catalog playback truth could not be audited.',
      error.message
    );
  }
}

async function auditArabicDetectorCanonicalization(report) {
  try {
    const [
      packModule,
      articulationAnalysisModule,
      translationModule,
    ] = await Promise.all([
      loadBundledModule(packPath('ar', 'index.jsx')),
      loadBundledModule(
        path.join(
          PROJECT_ROOT,
          'src',
          'components',
          'uas',
          'buildArticulationAnalysis.jsx'
        )
      ),
      loadBundledModule(
        path.join(
          PROJECT_ROOT,
          'src',
          'components',
          'i18n',
          'translations.jsx'
        )
      ),
    ]);
    const pack = packModule.default;
    const buildArticulationAnalysis =
      articulationAnalysisModule.buildArticulationAnalysis;
    const translate = translationModule.t;
    const normalize = pack?.normalizeDetectedPhoneme;
    const cases = [
      ['sh', 'C:ش'],
      ['ʃ', 'C:ش'],
      ['u', 'V:u'],
      ['k', 'C:ك'],
      ['r', 'C:ر'],
      ['a', 'V:a'],
      ['n', 'C:ن'],
      ['j', 'C:ج'],
      ['dʒ', 'C:ج'],
      ['z', 'C:ز'],
      ['i', 'V:i'],
      ['l', 'C:ل'],
      ['kh', 'C:خ'],
      ['ʕ', 'C:ع'],
      ['ħ', 'C:ح'],
      ['q', 'C:ق'],
      ['aː', 'V:ا'],
      ['iː', 'V:ي'],
      ['uː', 'V:و'],
    ];
    const failures = cases
      .map(([detected, expected]) => ({
        detected,
        expected,
        actual: typeof normalize === 'function' ? normalize(detected) : null,
      }))
      .filter((item) => item.actual !== item.expected);
    const displayFailures = [
      ['c:ش', 'sh'],
      ['v:u', 'u'],
    ]
      .map(([token, expected]) => ({
        token,
        expected,
        actual: pack?.getDisplayToken?.(token),
      }))
      .filter((item) => item.actual !== item.expected);
    const phraseExpected = pack
      ?.prepareLearningInput?.('شكرا جزيلا')
      ?.expectedPhonemes ?? [];
    const phraseDetected = [
      'sh', 'u', 'k', 'r', 'a', 'n',
      'j', 'a', 'z', 'i', 'l', 'a', 'n',
    ];
    const phraseNormalized = phraseDetected.map((token) =>
      typeof normalize === 'function' ? normalize(token) : token
    );
    const phraseMismatches = phraseExpected
      .map((expected, index) => ({
        index,
        expected,
        detected: phraseNormalized[index] ?? null,
      }))
      .filter((item) => item.expected !== item.detected);
    const phraseAligned =
      phraseExpected.length === phraseNormalized.length &&
      phraseExpected[0] === 'C:ش' &&
      phraseNormalized[0] === 'C:ش' &&
      phraseMismatches.length <= 1;
    const universalProfileLabels = new Set([
      'neutral',
      'open_vowel',
      'mid_vowel',
      'front_vowel',
      'rounded_vowel_ue',
      'rounded_vowel_oo',
      'velar_stop',
      'alveolar_stop',
      'bilabial',
      'alveolar_nasal',
      'velar_nasal',
      'alveolar_fricative',
      'postalveolar_fricative',
      'dental_fricative',
      'labiodental_fricative',
      'affricate',
      'glottal',
      'rhotic',
      'lateral',
      'glide',
    ]);
    const invalidProfileFrames = (pack?.articulationMap?.frames ?? [])
      .filter(
        (frame) =>
          Array.isArray(frame?.phonemes) &&
          frame.phonemes.length > 0 &&
          !universalProfileLabels.has(frame?.label)
      )
      .map((frame) => ({
        index: frame?.index,
        label: frame?.label,
        phonemes: frame?.phonemes,
      }));
    const facialTimeline = Array.from({ length: 81 }, (_, index) => ({
      time: index * 40,
      features: {
        mouth_open: 0.4,
        lip_rounding: 0.25,
        lip_spread: 0.4,
        lip_closure: 0.25,
      },
    }));
    const scoringProbe = typeof buildArticulationAnalysis === 'function'
      ? buildArticulationAnalysis({
          phonemes: phraseDetected,
          expectedPhonemes: phraseExpected,
          timestamps: null,
          facialTimeline,
          articulationMap: pack?.articulationMap,
          coachingRules: pack?.coachingRules,
          normalizeDetectedPhoneme: normalize,
          durationMs: 3200,
        })
      : [];
    const scoringProbeFailures = scoringProbe
      .filter((item) => String(item?.expectedPhoneme ?? '').trim())
      .filter(
        (item) =>
          !Number.isFinite(item?.audioScore) ||
          !Number.isFinite(item?.articulationScore) ||
          !Number.isFinite(item?.finalScore) ||
          !item?.expectedFrameLabel
      )
      .map((item) => ({
        expectedPhoneme: item?.expectedPhoneme,
        detectedPhoneme: item?.detectedPhoneme,
        expectedFrameLabel: item?.expectedFrameLabel,
        audioScore: item?.audioScore,
        articulationScore: item?.articulationScore,
        finalScore: item?.finalScore,
      }));
    const scoringReady =
      scoringProbe.length === phraseExpected.length &&
      scoringProbeFailures.length === 0;
    const arabicCoaching = pack?.buildUASCoachingResult?.({
      expectedPhonemes: phraseExpected,
      detectedPhonemes: phraseDetected,
      uiLanguage: 'ar',
    });
    const coachingMessage = String(
      arabicCoaching?.shortMessage ?? arabicCoaching?.message ?? ''
    );
    const coachingLocalized =
      /[\u0600-\u06FF]/.test(coachingMessage) &&
      !/\b(?:option|translation|recommendation)\b/i.test(coachingMessage) &&
      !coachingMessage.includes('**');
    const verdictUiKeys = [
      'pronunciationVerdict.attempt.closeTitle',
      'pronunciationVerdict.attempt.closeMessage',
      'pronunciationVerdict.combinedHeading',
      'pronunciationVerdict.phonemeResults',
      'pronunciationVerdict.toneResults',
      'pronunciationVerdict.mouthMovement',
      'pronunciationVerdict.speechEvidenceWeight',
      'pronunciationVerdict.detectedSounds',
      'pronunciationVerdict.mouthSupport',
    ];
    const arabicVerdictUi = verdictUiKeys.map((key) => ({
      key,
      value: typeof translate === 'function' ? translate(key, 'ar') : '',
    }));
    const verdictUiLocalized = arabicVerdictUi.every(
      ({ key, value }) =>
        value && value !== key && /[\u0600-\u06FF]/.test(value)
    );
    const coachingBoxSource = fs.readFileSync(
      path.join(
        PROJECT_ROOT,
        'src',
        'components',
        'practice',
        'CoachingBox.jsx'
      ),
      'utf8'
    );
    const verdictUiWired = verdictUiKeys.every((key) =>
      coachingBoxSource.includes(key)
    );

    if (
      failures.length === 0 &&
      displayFailures.length === 0 &&
      phraseAligned &&
      invalidProfileFrames.length === 0 &&
      scoringReady &&
      coachingLocalized &&
      verdictUiLocalized &&
      verdictUiWired
    ) {
      pass(
        report,
        'AR_DETECTOR_CANONICALIZATION',
        'Arabic detector phones, mouth profiles, and scoring align; شكرًا جزيلًا produces a complete verdict instead of false guided recovery.'
      );
    } else {
      fail(
        report,
        'AR_DETECTOR_CANONICALIZATION',
        'Arabic detector phones do not align with canonical resolver units.',
        {
          failures,
          displayFailures,
          phraseExpected,
          phraseNormalized,
          phraseMismatches,
          invalidProfileFrames,
          scoringProbeCount: scoringProbe.length,
          scoringProbeFailures,
          coachingMessage,
          arabicVerdictUi,
          verdictUiWired,
        }
      );
    }
  } catch (error) {
    fail(
      report,
      'AR_DETECTOR_CANONICALIZATION',
      'Arabic detector canonicalization could not be audited.',
      error.message
    );
  }
}

async function auditArabicIsolation(report) {
  try {
    const packModule = await loadBundledModule(packPath('ar', 'index.jsx'));
    const pack = packModule.default;
    const pluginLoaderSource = fs.readFileSync(
      path.join(PROJECT_ROOT, 'src', 'components', 'core', 'PluginLoader.jsx'),
      'utf8'
    );
    const practiceSource = fs.readFileSync(
      path.join(PROJECT_ROOT, 'src', 'pages', 'Practice.jsx'),
      'utf8'
    );
    const animationSource = fs.readFileSync(
      path.join(
        PROJECT_ROOT,
        'src',
        'components',
        'animation',
        'DualHeadAnimation.jsx'
      ),
      'utf8'
    );
    const appSource = fs.readFileSync(
      path.join(PROJECT_ROOT, 'src', 'App.jsx'),
      'utf8'
    );
    const obsoleteTruthFiles = ['cmudict.jsx', 'presets.jsx'].filter(
      (relativePath) => exists('ar', relativePath)
    );
    const deprecatedSharedMapper = path.join(
      PROJECT_ROOT,
      'src',
      'lib',
      'services',
      'ArticulationUnitService.js'
    );
    const eagerArabicOwners = listFilesRecursive(path.join(PROJECT_ROOT, 'src'))
      .filter((filePath) => /\.(?:js|jsx|ts|tsx)$/.test(filePath))
      .filter((filePath) =>
        /(?:from\s+|import\()['"]@\/components\/languagepacks\/ar\//.test(
          fs.readFileSync(filePath, 'utf8')
        )
      )
      .map((filePath) => path.relative(PROJECT_ROOT, filePath).replace(/\\/g, '/'));
    const packGlobalStateOwners = listFilesRecursive(path.join(PACK_ROOT, 'ar'))
      .filter((filePath) => /\.(?:js|jsx|ts|tsx)$/.test(filePath))
      .filter((filePath) =>
        /(?:globalThis|window)\.|localStorage|sessionStorage/.test(
          fs.readFileSync(filePath, 'utf8')
        )
      )
      .map((filePath) => path.relative(PROJECT_ROOT, filePath).replace(/\\/g, '/'));
    const shellArabicBehavior = [
      ['practice-arabic-text', /[\u0600-\u06FF]/.test(practiceSource)],
      ['practice-arabic-branch', /uiLanguage\s*===\s*['"]ar['"]/.test(practiceSource)],
      ['practice-arabic-llm', /Translate to Modern Standard Arabic/.test(practiceSource)],
      ['animation-arabic-branch', /isArabic|activePracticeLanguage\s*===\s*['"]ar['"]/.test(animationSource)],
    ].filter(([, present]) => present).map(([name]) => name);

    const arabicIsolationReady =
      pluginLoaderSource.includes(
        "ar: () => import('@/components/languagepacks/ar/index')"
      ) &&
      sameArray(eagerArabicOwners, [
        'src/components/core/PluginLoader.jsx',
      ]) &&
      !/^import\s+.+languagepacks\/ar\//m.test(appSource) &&
      packGlobalStateOwners.length === 0 &&
      obsoleteTruthFiles.length === 0 &&
      !fs.existsSync(deprecatedSharedMapper) &&
      shellArabicBehavior.length === 0 &&
      pack?.manifest?.textDirection === 'rtl' &&
      pack?.isTargetCompatible?.('شكرًا') === true &&
      pack?.isTargetCompatible?.('cream') === false;

    if (arabicIsolationReady) {
      pass(
        report,
        'AR_PACK_ISOLATION',
        'Arabic owns its script, direction, coaching, guided sounds, and pronunciation truth behind the lazy ar loader; no duplicate truth or Arabic shell branch remains.'
      );
    } else {
      fail(
        report,
        'AR_PACK_ISOLATION',
        'Arabic ownership or its lazy shell boundary is incomplete.',
        {
          eagerArabicOwners,
          packGlobalStateOwners,
          obsoleteTruthFiles,
          deprecatedSharedMapperPresent: fs.existsSync(deprecatedSharedMapper),
          shellArabicBehavior,
          textDirection: pack?.manifest?.textDirection,
        }
      );
    }
  } catch (error) {
    fail(
      report,
      'AR_PACK_ISOLATION',
      'Arabic isolation certification could not be completed.',
      error.message
    );
  }
}

async function auditLibrary(packId, report) {
  try {
    const module = await loadBundledModule(packPath(packId, 'universal500.jsx'));
    const groups = module.default;
    const words = flattenLibrary(groups);
    const uniqueWords = new Set(words.map((word) => String(word).trim()));
    const emptyWords = words.filter((word) => !String(word).trim());
    const duplicateCount = words.length - uniqueWords.size;

    report.metrics.library = {
      groups: Array.isArray(groups) ? groups.length : 0,
      total: words.length,
      unique: uniqueWords.size,
      duplicates: duplicateCount,
    };

    if (words.length >= 500 && emptyWords.length === 0) {
      pass(report, 'LIBRARY_COVERAGE', `Library contains ${words.length} non-empty entries.`);
    } else {
      fail(report, 'LIBRARY_COVERAGE', 'Library must contain at least 500 non-empty entries.');
    }

    if (duplicateCount > 0) {
      warn(report, 'LIBRARY_DUPLICATES', `Library contains ${duplicateCount} duplicate occurrences.`);
    } else {
      pass(report, 'LIBRARY_DUPLICATES', 'Library entries are unique.');
    }
  } catch (error) {
    fail(report, 'LIBRARY_RUNTIME', 'Universal library could not be audited.', error.message);
  }
}

async function auditResolver(packId, report) {
  const profile = PACK_PROFILES[packId];

  try {
    const module = await loadBundledModule(packPath(packId, 'PhonemeResolver.jsx'));
    if (packId === 'ja' && typeof module.initializeJapaneseResolver === 'function') {
      await module.initializeJapaneseResolver({
        dicPath: path.join(PROJECT_ROOT, 'node_modules', 'kuromoji', 'dict'),
      });
    }
    const Resolver = module.PhonemeResolver ?? module.default;
    const resolver = typeof Resolver === 'function' ? new Resolver() : Resolver;

    if (!resolver || typeof resolver.resolveUntimed !== 'function' || typeof resolver.resolve !== 'function') {
      fail(report, 'RESOLVER_INTERFACE', 'Resolver must expose resolveUntimed() and resolve().');
      return null;
    }
    pass(report, 'RESOLVER_INTERFACE', 'Resolver exposes timed and untimed paths.');

    const emptyHelpers = [];
    const emptyPhonemes = [];
    const alignmentFailures = [];
    const tokenFailures = [];
    const invalidFrames = [];
    const timelineFailures = [];

    for (const sample of profile.samples) {
      const untimed = resolver.resolveUntimed(sample);
      const { phonemes, frames, tokens } = getSequences(untimed);

      if (!String(untimed?.helperText ?? '').trim()) emptyHelpers.push(sample);
      if (!phonemes.length) emptyPhonemes.push(sample);
      if (phonemes.length !== frames.length) {
        alignmentFailures.push({ sample, phonemes: phonemes.length, frames: frames.length });
      }
      if (
        tokens.length !== phonemes.length ||
        tokens.some((token, index) => token?.phoneme !== phonemes[index] || token?.frame !== frames[index])
      ) {
        tokenFailures.push(sample);
      }
      if (frames.some((frame) => !Number.isInteger(frame) || frame < 0 || frame > 19)) {
        invalidFrames.push(sample);
      }

      const timed = resolver.resolve(sample);
      if (!timelineIsMonotonic(timed?.phonemeTimeline)) timelineFailures.push(sample);
    }

    if (emptyHelpers.length) {
      fail(report, 'RESOLVER_HELPER_OUTPUT', 'Resolver returned empty helper text.', emptyHelpers);
    } else {
      pass(report, 'RESOLVER_HELPER_OUTPUT', 'Resolver produced helper text for all control samples.');
    }

    if (emptyPhonemes.length) {
      fail(report, 'RESOLVER_PHONEME_OUTPUT', 'Resolver returned empty expected phonemes.', emptyPhonemes);
    } else {
      pass(report, 'RESOLVER_PHONEME_OUTPUT', 'Resolver produced expected phonemes for all control samples.');
    }

    if (alignmentFailures.length) {
      fail(
        report,
        'RESOLVER_FRAME_ALIGNMENT',
        'expectedFrames must align one-for-one with expectedPhonemes.',
        alignmentFailures
      );
    } else {
      pass(report, 'RESOLVER_FRAME_ALIGNMENT', 'Expected phoneme and frame arrays align one-for-one.');
    }

    if (tokenFailures.length) {
      fail(report, 'RESOLVER_TOKEN_ALIGNMENT', 'Token phonemes/frames do not align with expected arrays.', tokenFailures);
    } else {
      pass(report, 'RESOLVER_TOKEN_ALIGNMENT', 'Tokens align with expected phonemes and frames.');
    }

    if (invalidFrames.length) {
      fail(report, 'RESOLVER_FRAME_RANGE', 'Resolver emitted frames outside the shared 0-19 range.', invalidFrames);
    } else {
      pass(report, 'RESOLVER_FRAME_RANGE', 'All control-sample frames are within 0-19.');
    }

    if (timelineFailures.length) {
      fail(report, 'RESOLVER_TIMELINE', 'Timed resolver emitted missing or non-monotonic timelines.', timelineFailures);
    } else {
      pass(report, 'RESOLVER_TIMELINE', 'Timed timelines are present and monotonic.');
    }

    return resolver;
  } catch (error) {
    fail(report, 'RESOLVER_RUNTIME', 'Resolver could not be loaded or executed.', error.message);
    return null;
  }
}

async function auditGuidedSound(packId, report) {
  const profile = PACK_PROFILES[packId];
  if (!exists(packId, 'guidedSoundLibrary.jsx')) return;

  try {
    const module = await loadBundledModule(packPath(packId, 'guidedSoundLibrary.jsx'));
    if (
      packId === 'ja' &&
      typeof module.initializeJapaneseGuidedSoundLibrary === 'function'
    ) {
      await module.initializeJapaneseGuidedSoundLibrary({
        dicPath: path.join(PROJECT_ROOT, 'node_modules', 'kuromoji', 'dict'),
      });
    }
    const getCue = module.getGuidedSoundCue;
    const cue = typeof getCue === 'function' ? getCue(profile.guidedProbe) : null;

    if (
      cue?.ttsText &&
      cue?.displayText &&
      Array.isArray(cue?.expectedPhonemes) &&
      cue.expectedPhonemes.length > 0 &&
      Number.isInteger(cue?.targetExpectedIndex)
    ) {
      pass(report, 'GUIDED_CUE_CONTRACT', `Guided cue for ${profile.guidedProbe} is complete.`);
    } else {
      fail(report, 'GUIDED_CUE_CONTRACT', `Guided cue for ${profile.guidedProbe} is missing required fields.`, cue);
    }

    if (packId === 'ar') {
      const ResolverModule = await loadBundledModule(packPath(packId, 'PhonemeResolver.jsx'));
      const Resolver = ResolverModule.PhonemeResolver ?? ResolverModule.default;
      const resolver = typeof Resolver === 'function' ? new Resolver() : Resolver;
      const cueKeys = Object.keys(module.default ?? {});
      const failures = cueKeys.flatMap((targetPhoneme) => {
        const targetCue = getCue(targetPhoneme);
        const resolved = resolver?.resolveUntimed?.(targetCue?.ttsText);
        const resolvedPhonemes = getSequences(resolved).phonemes;
        const expectedPhonemes = targetCue?.expectedPhonemes ?? [];
        const targetIndex = targetCue?.targetExpectedIndex;
        const validTarget =
          Number.isInteger(targetIndex) &&
          expectedPhonemes[targetIndex] === targetPhoneme;

        return sameArray(resolvedPhonemes, expectedPhonemes) && validTarget
          ? []
          : [{
              targetPhoneme,
              ttsText: targetCue?.ttsText,
              expectedPhonemes,
              resolvedPhonemes,
              targetExpectedIndex: targetIndex,
            }];
      });
      const runtimeAliasFailures = cueKeys.flatMap((targetPhoneme) => {
        const runtimePhoneme = `${targetPhoneme[0].toLowerCase()}${targetPhoneme.slice(1)}`;
        const canonicalCue = getCue(targetPhoneme);
        const runtimeCue = getCue(runtimePhoneme);

        return (
          runtimeCue?.ttsText === canonicalCue?.ttsText &&
          runtimeCue?.targetPhoneme === canonicalCue?.targetPhoneme &&
          sameArray(
            runtimeCue?.expectedPhonemes ?? [],
            canonicalCue?.expectedPhonemes ?? []
          )
        )
          ? []
          : [{
              targetPhoneme,
              runtimePhoneme,
              canonicalCue,
              runtimeCue,
            }];
      });
      const practiceSource = fs.readFileSync(
        path.join(PROJECT_ROOT, 'src', 'pages', 'Practice.jsx'),
        'utf8'
      );
      const guidedPresentationFailures = [
        {
          contract: 'cue-only-title',
          valid: practiceSource.includes(
            'activeGuidedCue?.displayText || activeGuidedUnit.display'
          ),
        },
        {
          contract: 'cue-only-helper',
          valid: practiceSource.includes(
            'activeGuidedPlayback?.helperText || activeGuidedUnit.display'
          ),
        },
        {
          contract: 'cue-helper-timing',
          valid: practiceSource.includes(
            'activeGuidedPlayback?.helperChunks ?? null'
          ),
        },
        {
          contract: 'hide-stale-full-attempt-analysis',
          valid: practiceSource.includes(
            'mappedDisplay && !activeGuidedUnit'
          ),
        },
        {
          contract: 'no-full-target-animation-title',
          valid: !practiceSource.includes(
            '`${activeGuidedUnit.display} · ${fullTargetText}`'
          ),
        },
      ].filter((check) => !check.valid);

      if (
        cueKeys.length >= 30 &&
        failures.length === 0 &&
        runtimeAliasFailures.length === 0 &&
        guidedPresentationFailures.length === 0
      ) {
        pass(
          report,
          'AR_GUIDED_CUE_COVERAGE',
          `All ${cueKeys.length} Arabic cues match resolver truth, runtime aliases, and cue-only guided playback presentation.`
        );
      } else {
        fail(
          report,
          'AR_GUIDED_CUE_COVERAGE',
          'Arabic guided cues are incomplete or disagree with resolver truth.',
          {
            cueCount: cueKeys.length,
            failures,
            runtimeAliasFailures,
            guidedPresentationFailures,
          }
        );
      }
    }
  } catch (error) {
    fail(report, 'GUIDED_CUE_RUNTIME', 'Guided sound library could not be executed.', error.message);
  }
}

function auditTtsPayload(packId, report) {
  const providerSource = readText(packId, 'provider/GoogleTTSProvider.jsx');
  if (/\bspeakingRate\s*(?:[:,])/.test(providerSource)) {
    pass(report, 'TTS_SPEAKING_RATE_PAYLOAD', 'Provider sends the backend speakingRate field.');
  } else if (/\bspeechRate\s*:/.test(providerSource)) {
    warn(
      report,
      'TTS_SPEAKING_RATE_PAYLOAD',
      'Provider sends speechRate while the Base44 function reads speakingRate; the current 0.4 fallback masks the mismatch.'
    );
  } else {
    fail(report, 'TTS_SPEAKING_RATE_PAYLOAD', 'Provider does not send an explicit speaking-rate field.');
  }
}

async function auditEnglishRuntime(report) {
  try {
    const [
      packModule,
      presetModule,
      helperModule,
      libraryModule,
      libraryHelperModule,
      guidedModule,
      articulationModule,
    ] = await Promise.all([
      loadBundledModule(packPath('en_us', 'index.jsx')),
      loadBundledModule(packPath('en_us', 'presets.jsx')),
      loadBundledModule(packPath('en_us', 'pronunciationHelper.js')),
      loadBundledModule(packPath('en_us', 'universal500.jsx')),
      loadBundledModule(packPath('en_us', 'libraryHelpers.jsx')),
      loadBundledModule(packPath('en_us', 'guidedSoundLibrary.jsx')),
      loadBundledModule(packPath('en_us', 'articulationMap.jsx')),
    ]);

    const pack = packModule.default;
    const presetWords = presetModule.ENGLISH_PRESET_WORDS ?? [];
    const presetPhrases = presetModule.ENGLISH_PRESET_PHRASES ?? [];
    const runtimeWords = pack?.getPresetWords?.() ?? [];
    const runtimePhrases = pack?.getPresetPhrases?.() ?? [];
    const helperAudit = helperModule.runEnglishPronunciationHelperAudit?.() ?? null;
    const auditedWords = (helperAudit?.items ?? [])
      .filter((item) => item?.corpus === 'preset-word')
      .map((item) => item.text);
    const auditedPhrases = (helperAudit?.items ?? [])
      .filter((item) => item?.corpus === 'preset-phrase')
      .map((item) => item.text);
    const presetTruthReady =
      JSON.stringify(runtimeWords) === JSON.stringify(presetWords) &&
      JSON.stringify(runtimePhrases) === JSON.stringify(presetPhrases) &&
      sameArray(auditedWords, presetWords.map((item) => item.practice)) &&
      sameArray(auditedPhrases, presetPhrases.map((item) => item.practice));

    if (presetTruthReady) {
      pass(
        report,
        'EN_CANONICAL_PRESETS',
        'English runtime buttons and helper audit share one canonical preset source.'
      );
    } else {
      fail(
        report,
        'EN_CANONICAL_PRESETS',
        'English runtime buttons and helper audit disagree with the canonical presets.',
        { runtimeWords, presetWords, runtimePhrases, presetPhrases, auditedWords, auditedPhrases }
      );
    }

    const groups = Array.isArray(libraryModule.default) ? libraryModule.default : [];
    const libraryWords = flattenLibrary(groups);
    const normalizedLibraryWords = libraryWords.map((word) =>
      String(word || '').trim().toLowerCase()
    );
    const presetWordKeys = new Set(
      presetWords.map((item) => String(item?.practice || '').trim().toLowerCase())
    );
    const overlaps = [...new Set(normalizedLibraryWords.filter((word) => presetWordKeys.has(word)))];
    const unsortedGroups = groups
      .filter((group) => {
        const words = (group?.words ?? []).map((word) => String(word));
        return !sameArray(words, [...words].sort((left, right) => left.localeCompare(right, 'en')));
      })
      .map((group) => group?.id ?? group?.label ?? 'unknown');
    const uniqueCount = new Set(normalizedLibraryWords).size;

    if (
      libraryWords.length >= 500 &&
      uniqueCount === libraryWords.length &&
      overlaps.length === 0 &&
      unsortedGroups.length === 0
    ) {
      pass(
        report,
        'EN_LIBRARY_STRUCTURE',
        `English library contains ${libraryWords.length} unique, alphabetized, non-preset entries.`
      );
    } else {
      fail(
        report,
        'EN_LIBRARY_STRUCTURE',
        'English library must be unique, alphabetized, and separate from preset content.',
        {
          total: libraryWords.length,
          unique: uniqueCount,
          presetOverlaps: overlaps,
          unsortedGroups,
        }
      );
    }

    const creamHelper = libraryHelperModule.getWordLibraryHelper?.('cream');
    if (creamHelper === 'k-r-ee-m') {
      pass(
        report,
        'EN_LIBRARY_HELPER_WIRING',
        'English library helper requests are routed through the pack rule engine.'
      );
    } else {
      fail(
        report,
        'EN_LIBRARY_HELPER_WIRING',
        'English library helper wiring did not generate the cream control.',
        { creamHelper }
      );
    }

    const guidedEntries = Object.entries(guidedModule.default ?? {});
    const phonemeToFrame = articulationModule.phonemeToFrameIndex ?? {};
    const guidedFailures = guidedEntries.flatMap(([targetPhoneme]) => {
      const cue = guidedModule.getGuidedSoundCue?.(targetPhoneme);
      const expectedPhonemes = cue?.expectedPhonemes ?? [];
      const targetIndex = cue?.targetExpectedIndex;
      const mapped = expectedPhonemes.every((phoneme) =>
        Number.isInteger(phonemeToFrame[phoneme])
      );
      const valid =
        cue?.helperText === cue?.displayText &&
        cue?.pronunciation === cue?.displayText &&
        !/[-·]/.test(String(cue?.helperText || '')) &&
        expectedPhonemes.length > 0 &&
        Number.isInteger(targetIndex) &&
        expectedPhonemes[targetIndex] === targetPhoneme &&
        mapped;
      return valid ? [] : [{ targetPhoneme, cue, mapped }];
    });

    if (guidedEntries.length >= 35 && guidedFailures.length === 0) {
      pass(
        report,
        'EN_GUIDED_CUE_COVERAGE',
        `All ${guidedEntries.length} English guided cues have clean helpers, target alignment, and pack-owned animation frames.`
      );
    } else {
      fail(
        report,
        'EN_GUIDED_CUE_COVERAGE',
        'English guided cues are incomplete or disagree with pack articulation truth.',
        { cueCount: guidedEntries.length, failures: guidedFailures }
      );
    }

    const mechanicalControls = ['soundmirror', 'woomarra', 'zorbify'].map((text) => ({
      text,
      result: helperModule.buildEnglishPronunciationHelper?.(text),
    }));
    const invalidMechanicalControls = mechanicalControls.filter(({ result }) =>
      result?.approved !== true ||
      result?.humanReviewed !== false ||
      result?.mechanicallyValidated !== true ||
      result?.phonemeSource !== 'pack-rule-engine' ||
      !String(result?.helperText || '').trim() ||
      !Array.isArray(result?.phonemes) ||
      result.phonemes.length === 0
    );

    if (invalidMechanicalControls.length === 0) {
      pass(
        report,
        'EN_ON_DEMAND_RULE_ENGINE',
        'Unlisted English controls are generated on demand and truthfully marked as mechanical results.'
      );
    } else {
      fail(
        report,
        'EN_ON_DEMAND_RULE_ENGINE',
        'English on-demand helper generation failed its unlisted-word controls.',
        invalidMechanicalControls
      );
    }

    const ruleControls = new Map([
      ['action', 'a-k-sh-uh-n'],
      ['beautiful', 'b-y-oo-t-uh-f-uh-l'],
      ['enough', 'i-n-uh-f'],
      ['knight', 'n-ai-t'],
      ['nation', 'n-ei-sh-uh-n'],
      ['phone', 'f-oh-n'],
      ['question', 'k-w-eh-s-ch-uh-n'],
      ['quick', 'k-w-i-k'],
      ['soundmirror', 's-ow-n-d-m-i-r-er'],
      ['write', 'r-ai-t'],
    ]);
    const failedRuleControls = [...ruleControls].flatMap(([text, expected]) => {
      const actual = helperModule.buildEnglishPronunciationHelper?.(text)?.helperText;
      return actual === expected ? [] : [{ text, expected, actual }];
    });
    if (failedRuleControls.length === 0) {
      pass(
        report,
        'EN_RULE_CONTROLS',
        `All ${ruleControls.size} English grapheme-to-phoneme controls match pack rule truth.`
      );
    } else {
      fail(
        report,
        'EN_RULE_CONTROLS',
        'English grapheme-to-phoneme controls drifted from pack rule truth.',
        failedRuleControls
      );
    }

    const roundedVowelControls = [
      { text: 'good', helper: 'g-uh-d', phonemes: ['g', 'ue', 'd'] },
      { text: 'book', helper: 'b-uh-k', phonemes: ['b', 'ue', 'k'] },
      { text: 'should', helper: 'sh-uh-d', phonemes: ['sh', 'ue', 'd'] },
      { text: 'sloop', helper: 's-l-oo-p', phonemes: ['s', 'l', 'oo', 'p'] },
      { text: 'cup', helper: 'k-uh-p', phonemes: ['k', 'ah', 'p'] },
    ];
    const roundedVowelFailures = roundedVowelControls.flatMap((control) => {
      const result = helperModule.buildEnglishPronunciationHelper?.(control.text);
      return (
        result?.helperText === control.helper &&
        sameArray(result?.phonemes ?? [], control.phonemes)
      )
        ? []
        : [{
            ...control,
            actualHelper: result?.helperText,
            actualPhonemes: result?.phonemes,
          }];
    });
    if (roundedVowelFailures.length === 0) {
      pass(
        report,
        'EN_ROUNDED_VOWEL_CONTRAST',
        'English keeps FOOT /ʊ/, GOOSE /uː/, and STRUT /ʌ/ distinct even when learner-facing helper spelling overlaps.'
      );
    } else {
      fail(
        report,
        'EN_ROUNDED_VOWEL_CONTRAST',
        'English rounded-vowel display or canonical phoneme truth is ambiguous.',
        roundedVowelFailures
      );
    }

    const footWords = [
      'book', 'brook', 'cook', 'crook', 'during', 'foot', 'full', 'good',
      'goodbye', 'hood', 'hook', 'look', 'pull', 'push', 'put', 'shook',
      'should', 'stood', 'sure', 'took', 'woman', 'wood', 'wool', 'would',
    ];
    const gooseWords = [
      'beautiful', 'blue', 'choose', 'computer', 'continue', 'cool',
      'excuse', 'few', 'food', 'group', 'huge', 'human', 'improve',
      'include', 'into', 'introduce', 'issue', 'lose', 'move', 'movie',
      'music', 'new', 'poor', 'produce', 'remove', 'room', 'school',
      'sloop', 'soon', 'student', 'through', 'too', 'two', 'use',
      'usually', 'value', 'view', 'who', 'you',
    ];
    const roundedFamilyFailures = [
      ...footWords.map((text) => ({ text, expected: 'ue', forbidden: 'oo' })),
      ...gooseWords.map((text) => ({ text, expected: 'oo', forbidden: 'ue' })),
    ].flatMap((control) => {
      const result = helperModule.buildEnglishPronunciationHelper?.(control.text);
      const phonemes = result?.phonemes ?? [];
      return phonemes.includes(control.expected) && !phonemes.includes(control.forbidden)
        ? []
        : [{ ...control, helper: result?.helperText, phonemes }];
    });
    if (roundedFamilyFailures.length === 0) {
      pass(
        report,
        'EN_ROUNDED_VOWEL_FAMILIES',
        `All ${footWords.length + gooseWords.length} reviewed English FOOT/GOOSE family controls preserve their canonical vowel.`
      );
    } else {
      fail(
        report,
        'EN_ROUNDED_VOWEL_FAMILIES',
        'One or more English FOOT/GOOSE family controls resolve to the wrong rounded vowel.',
        roundedFamilyFailures
      );
    }

    const englishFamilyControls = [
      // Reduction and syllabic endings.
      ['about', ['ah', 'b', 'aw', 't']],
      ['ability', ['ah', 'b', 'i', 'l', 'ah', 't', 'ee']],
      ['available', ['ah', 'v', 'ei', 'l', 'ah', 'b', 'ah', 'l']],
      ['difference', ['d', 'i', 'f', 'er', 'ah', 'n', 's']],
      ['market', ['m', 'aa', 'r', 'k', 'ah', 't']],
      ['problem', ['p', 'r', 'aa', 'b', 'l', 'ah', 'm']],
      // R-controlled spellings.
      ['area', ['e', 'r', 'ee', 'ah']],
      ['around', ['er', 'aw', 'n', 'd']],
      ['clear', ['k', 'l', 'i', 'r']],
      ['course', ['k', 'o', 'r', 's']],
      ['word', ['w', 'er', 'd']],
      // Digraphs, voicing, and silent letters.
      ['thought', ['th', 'o', 't']],
      ['clothes', ['k', 'l', 'ow', 'dh', 'z']],
      ['special', ['s', 'p', 'e', 'sh', 'ah', 'l']],
      ['measure', ['m', 'e', 'zh', 'er']],
      ['machine', ['m', 'ah', 'sh', 'ee', 'n']],
      ['answer', ['a', 'n', 's', 'er']],
      ['listen', ['l', 'i', 's', 'ah', 'n']],
      ['half', ['h', 'a', 'f']],
      ['build', ['b', 'i', 'l', 'd']],
      // Long-vowel and multi-letter spelling families.
      ['already', ['o', 'l', 'r', 'e', 'd', 'ee']],
      ['behind', ['b', 'i', 'h', 'ai', 'n', 'd']],
      ['create', ['k', 'r', 'ee', 'ei', 't']],
      ['fire', ['f', 'ai', 'er']],
      ['key', ['k', 'ee']],
      ['table', ['t', 'ei', 'b', 'ah', 'l']],
      ['view', ['v', 'y', 'oo']],
      // Voiced consonant families and long multisyllabic controls.
      ['always', ['o', 'l', 'w', 'ei', 'z']],
      ['easy', ['ee', 'z', 'ee']],
      ['those', ['dh', 'ow', 'z']],
      ['environment', ['i', 'n', 'v', 'ai', 'r', 'ah', 'n', 'm', 'ah', 'n', 't']],
      ['experience', ['i', 'k', 's', 'p', 'i', 'r', 'ee', 'ah', 'n', 's']],
      ['identify', ['ai', 'd', 'e', 'n', 't', 'ah', 'f', 'ai']],
      ['education', ['e', 'j', 'ah', 'k', 'ei', 'sh', 'ah', 'n']],
      ['radio', ['r', 'ei', 'd', 'ee', 'ow']],
    ];
    const englishFamilyFailures = englishFamilyControls.flatMap(([text, expected]) => {
      const result = helperModule.buildEnglishPronunciationHelper?.(text);
      return sameArray(result?.phonemes ?? [], expected)
        ? []
        : [{ text, expected, actual: result?.phonemes, helper: result?.helperText }];
    });
    if (englishFamilyFailures.length === 0) {
      pass(
        report,
        'EN_G2P_FAMILY_CERTIFICATION',
        `All ${englishFamilyControls.length} English reduction, ending, r-controlled, digraph, voicing, silent-letter, and long-vowel family controls match canonical pack truth.`
      );
    } else {
      fail(
        report,
        'EN_G2P_FAMILY_CERTIFICATION',
        'One or more English grapheme-to-phoneme family controls drifted from canonical pack truth.',
        englishFamilyFailures
      );
    }

    const viewResult = helperModule.buildEnglishPronunciationHelper?.('view');
    const liveResult = helperModule.buildEnglishPronunciationHelper?.('live');
    const useResult = helperModule.buildEnglishPronunciationHelper?.('use');
    const explicitDisplayAndHomographsReady =
      viewResult?.helperText === 'v-ee-oo-w' &&
      sameArray(viewResult?.phonemes ?? [], ['v', 'y', 'oo']) &&
      sameArray(liveResult?.phonemes ?? [], ['l', 'i', 'v']) &&
      (liveResult?.alternates ?? []).some((item) =>
        sameArray(item?.phonemes ?? [], ['l', 'ai', 'v'])) &&
      sameArray(useResult?.phonemes ?? [], ['y', 'oo', 'z']) &&
      (useResult?.alternates ?? []).some((item) =>
        sameArray(item?.phonemes ?? [], ['y', 'oo', 's']));
    if (explicitDisplayAndHomographsReady) {
      pass(
        report,
        'EN_DISPLAY_AND_HOMOGRAPH_CONTRACT',
        'English keeps learner-explicit view spelling separate from canonical /v y oo/ and records both common pronunciations of live and use.'
      );
    } else {
      fail(
        report,
        'EN_DISPLAY_AND_HOMOGRAPH_CONTRACT',
        'English learner display or homograph alternate metadata is incomplete.',
        { viewResult, liveResult, useResult }
      );
    }

    const helperSummary = helperAudit?.summary ?? {};
    const truthfulProvenance =
      helperSummary.total > 0 &&
      helperSummary.humanReviewed > 0 &&
      helperSummary.mechanicallyValidated > 0 &&
      helperSummary.humanReviewed + helperSummary.mechanicallyValidated === helperSummary.total;
    if (truthfulProvenance) {
      pass(
        report,
        'EN_HELPER_PROVENANCE',
        `English distinguishes ${helperSummary.humanReviewed} reviewed controls from ${helperSummary.mechanicallyValidated} mechanically generated items.`
      );
    } else {
      fail(
        report,
        'EN_HELPER_PROVENANCE',
        'English helper audit provenance is incomplete or misleading.',
        helperSummary
      );
    }

    const providerSource = readText('en_us', 'provider/GoogleTTSProvider.jsx');
    const googleTtsSource = fs.readFileSync(
      path.join(PROJECT_ROOT, 'base44', 'functions', 'googleTTS', 'entry.ts'),
      'utf8'
    );
    const googleTtsLiveSource = fs.readFileSync(
      path.join(PROJECT_ROOT, 'base44', 'functions', 'googleTTSLive', 'entry.ts'),
      'utf8'
    );
    const englishVoiceLine =
      "en: { languageCode: 'en-US', name: 'en-US-Neural2-D', ssmlGender: 'MALE' }";
    if (
      pack?.manifest?.defaultVoice === 'en-US-Neural2-D' &&
      providerSource.includes("'en-US-Neural2-D'") &&
      googleTtsSource.includes(englishVoiceLine) &&
      googleTtsLiveSource.includes(englishVoiceLine)
    ) {
      pass(
        report,
        'EN_TTS_VOICE_AUTHORITY',
        'English pack and both Base44 TTS fallbacks agree on en-US-Neural2-D.'
      );
    } else {
      fail(
        report,
        'EN_TTS_VOICE_AUTHORITY',
        'English TTS voice selection disagrees across pack and backend fallbacks.',
        { manifestVoice: pack?.manifest?.defaultVoice }
      );
    }

    const englishFiles = listFilesRecursive(packPath('en_us', '.'));
    const forbiddenDictionaryReferences = englishFiles.flatMap((filePath) => {
      const source = fs.readFileSync(filePath, 'utf8');
      return /CMU_DICT|APPROVED_ENGLISH_HELPERS|from\s+['"].*cmudict/i.test(source)
        ? [path.relative(PROJECT_ROOT, filePath)]
        : [];
    });
    const cmuFilePresent = exists('en_us', 'cmudict.jsx');
    if (!cmuFilePresent && forbiddenDictionaryReferences.length === 0) {
      pass(
        report,
        'EN_DICTIONARY_REMOVAL',
        'English has no privileged runtime word dictionary or CMU-only grading path.'
      );
    } else {
      fail(
        report,
        'EN_DICTIONARY_REMOVAL',
        'English still contains privileged dictionary authority.',
        { cmuFilePresent, forbiddenDictionaryReferences }
      );
    }

    const practiceSource = fs.readFileSync(
      path.join(PROJECT_ROOT, 'src', 'pages', 'Practice.jsx'),
      'utf8'
    );
    const shellEnglishLeaks = [
      'englishHelperAuditRanRef',
      '[EN HELPER AUDIT',
      "activePack === 'en_us'",
      'activePack === "en_us"',
    ].filter((needle) => practiceSource.includes(needle));
    if (shellEnglishLeaks.length === 0) {
      pass(
        report,
        'EN_SHELL_ISOLATION',
        'Practice shell contains no English-only audit or behavior branch.'
      );
    } else {
      fail(
        report,
        'EN_SHELL_ISOLATION',
        'English-only behavior remains in the shared Practice shell.',
        shellEnglishLeaks
      );
    }

    const [spanishGuided, arabicGuided, mandarinGuided, japaneseGuided] =
      await Promise.all([
        loadBundledModule(packPath('es', 'guidedSoundLibrary.jsx')),
        loadBundledModule(packPath('ar', 'guidedSoundLibrary.jsx')),
        loadBundledModule(packPath('zh', 'guidedSoundLibrary.jsx')),
        loadBundledModule(packPath('ja', 'guidedSoundLibrary.jsx')),
      ]);
    if (typeof japaneseGuided.initializeJapaneseGuidedSoundLibrary === 'function') {
      await japaneseGuided.initializeJapaneseGuidedSoundLibrary({
        dicPath: path.join(PROJECT_ROOT, 'node_modules', 'kuromoji', 'dict'),
      });
    }
    const esU = spanishGuided.getGuidedSoundCue?.('u');
    const arU = arabicGuided.getGuidedSoundCue?.('V:u');
    const zhUe = mandarinGuided.getGuidedSoundCue?.('ue');
    const jaU = japaneseGuided.getGuidedSoundCue?.('u');
    const crossPackRoundedVowelsReady =
      esU?.helperText === 'oo' && sameArray(esU?.expectedPhonemes ?? [], ['u']) &&
      arU?.targetPhoneme === 'V:u' && (arU?.expectedPhonemes ?? []).includes('V:u') &&
      zhUe?.helperText === 'xué' && sameArray(zhUe?.expectedPhonemes ?? [], ['x', 'ue']) &&
      jaU?.helperText === 'u' && sameArray(jaU?.expectedPhonemes ?? [], ['u']);
    if (crossPackRoundedVowelsReady) {
      pass(
        report,
        'EN_CROSS_PACK_ROUNDED_VOWEL_ISOLATION',
        'English FOOT/GOOSE helpers do not alter Spanish /u/, Arabic V:u, Mandarin üe, or Japanese u contracts.'
      );
    } else {
      fail(
        report,
        'EN_CROSS_PACK_ROUNDED_VOWEL_ISOLATION',
        'A rounded-vowel helper contract drifted across language-pack boundaries.',
        { esU, arU, zhUe, jaU }
      );
    }
  } catch (error) {
    fail(
      report,
      'EN_RUNTIME_CERTIFICATION',
      'English runtime certification could not be completed.',
      error.message
    );
  }
}

async function auditSpanishRuntime(report) {
  try {
    const [
      packModule,
      presetModule,
      helperModule,
      libraryModule,
      libraryHelperModule,
      guidedModule,
      translationModule,
    ] = await Promise.all([
      loadBundledModule(packPath('es', 'index.jsx')),
      loadBundledModule(packPath('es', 'presets.jsx')),
      loadBundledModule(packPath('es', 'pronunciationHelper.js')),
      loadBundledModule(packPath('es', 'universal500.jsx')),
      loadBundledModule(packPath('es', 'libraryHelpers.jsx')),
      loadBundledModule(packPath('es', 'guidedSoundLibrary.jsx')),
      loadBundledModule(path.join(PROJECT_ROOT, 'src', 'components', 'i18n', 'translations.jsx')),
    ]);

    const pack = packModule.default;
    const providerSource = readText('es', 'provider/GoogleTTSProvider.jsx');
    const googleTtsSource = fs.readFileSync(
      path.join(PROJECT_ROOT, 'base44', 'functions', 'googleTTS', 'entry.ts'),
      'utf8'
    );
    const googleTtsLiveSource = fs.readFileSync(
      path.join(PROJECT_ROOT, 'base44', 'functions', 'googleTTSLive', 'entry.ts'),
      'utf8'
    );
    const presetWords = presetModule.SPANISH_PRESET_WORDS ?? [];
    const presetPhrases = presetModule.SPANISH_PRESET_PHRASES ?? [];
    const runtimeWords = pack?.getPresetWords?.() ?? [];
    const runtimePhrases = pack?.getPresetPhrases?.() ?? [];
    const helperAudit = helperModule.runPronunciationHelperAudit?.() ?? null;
    const auditedWords = (helperAudit?.items ?? [])
      .filter((item) => item?.corpus === 'preset-word')
      .map((item) => item.text);
    const auditedPhrases = (helperAudit?.items ?? [])
      .filter((item) => item?.corpus === 'preset-phrase')
      .map((item) => item.text);

    const presetTruthReady =
      JSON.stringify(runtimeWords) === JSON.stringify(presetWords) &&
      JSON.stringify(runtimePhrases) === JSON.stringify(presetPhrases) &&
      sameArray(auditedWords, presetWords.map((item) => item.practice)) &&
      sameArray(auditedPhrases, presetPhrases.map((item) => item.practice)) &&
      new Set(auditedWords.map((value) => value.toLocaleLowerCase('es'))).size === auditedWords.length &&
      new Set(auditedPhrases.map((value) => value.toLocaleLowerCase('es'))).size === auditedPhrases.length;

    if (
      pack?.manifest?.defaultVoice === 'es-US-Neural2-A' &&
      providerSource.includes("'es-US-Neural2-A'") &&
      googleTtsSource.includes(
        "es: { languageCode: 'es-US', name: 'es-US-Neural2-A', ssmlGender: 'FEMALE' }"
      ) &&
      googleTtsLiveSource.includes(
        "es: { languageCode: 'es-US', name: 'es-US-Neural2-A', ssmlGender: 'FEMALE' }"
      )
    ) {
      pass(
        report,
        'ES_TTS_FEMALE_VOICE',
        'Spanish uses the female US-Spanish Neural2-A voice in the pack and both Base44 TTS fallbacks.'
      );
    } else {
      fail(
        report,
        'ES_TTS_FEMALE_VOICE',
        'Spanish pack and both Base44 TTS fallbacks must agree on female es-US-Neural2-A.',
        {
          manifestVoice: pack?.manifest?.defaultVoice,
          providerFallbackReady: providerSource.includes("'es-US-Neural2-A'"),
          googleTtsFallbackReady: googleTtsSource.includes(
            "es: { languageCode: 'es-US', name: 'es-US-Neural2-A', ssmlGender: 'FEMALE' }"
          ),
          googleTtsLiveFallbackReady: googleTtsLiveSource.includes(
            "es: { languageCode: 'es-US', name: 'es-US-Neural2-A', ssmlGender: 'FEMALE' }"
          ),
        }
      );
    }

    if (presetTruthReady) {
      pass(
        report,
        'ES_PRESET_SINGLE_SOURCE',
        `Spanish runtime and helper audits share one canonical source (${runtimeWords.length} words, ${runtimePhrases.length} phrases).`
      );
    } else {
      fail(
        report,
        'ES_PRESET_SINGLE_SOURCE',
        'Spanish runtime presets and helper-audit presets have diverged.',
        { presetWords, presetPhrases, runtimeWords, runtimePhrases, auditedWords, auditedPhrases }
      );
    }

    const groups = libraryModule.default ?? [];
    const expectedInitials = {
      group_ab: new Set(['a', 'b']),
      group_cd: new Set(['c', 'd']),
      group_ef: new Set(['e', 'f']),
      group_gh: new Set(['g', 'h']),
      group_ij: new Set(['i', 'j']),
      group_kl: new Set(['k', 'l']),
      group_mn: new Set(['m', 'n', 'ñ']),
      group_op: new Set(['o', 'p']),
      group_qs: new Set(['q', 'r', 's']),
      group_tz: new Set(['t', 'u', 'v', 'w', 'x', 'y', 'z']),
    };
    const initialFor = (value) => {
      const initial = String(value || '').trim().toLocaleLowerCase('es').normalize('NFC')[0] || '';
      return initial === 'ñ'
        ? initial
        : initial.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    };
    const misplaced = groups.flatMap((group) =>
      (group?.words ?? []).flatMap((word) =>
        expectedInitials[group?.id]?.has(initialFor(word))
          ? []
          : [{ group: group?.id, word }]
      )
    );

    if (misplaced.length === 0) {
      pass(
        report,
        'ES_LIBRARY_ALPHABETICAL_GROUPING',
        `All ${flattenLibrary(groups).length} unique Spanish library entries are under their correct headings.`
      );
    } else {
      fail(
        report,
        'ES_LIBRARY_ALPHABETICAL_GROUPING',
        'Spanish library entries appear under incorrect alphabet headings.',
        misplaced.slice(0, 50)
      );
    }

    const libraryHelper = libraryHelperModule.getWordLibraryHelper?.('biblioteca');
    if (typeof libraryHelper === 'string' && libraryHelper.trim()) {
      pass(
        report,
        'ES_LIBRARY_HELPER_WIRING',
        `The 500+ library UI receives pack-generated helper text (biblioteca → ${libraryHelper}).`
      );
    } else {
      fail(
        report,
        'ES_LIBRARY_HELPER_WIRING',
        'Spanish helper generation exists but is not connected to the 500+ library UI.'
      );
    }

    const cueKeys = Object.keys(guidedModule.default ?? {});
    const articulationPhonemes = new Set(
      (pack?.articulationMap?.frames ?? []).flatMap((frame) => frame?.phonemes ?? [])
    );
    const cueFailures = cueKeys.flatMap((targetPhoneme) => {
      const cue = guidedModule.getGuidedSoundCue?.(targetPhoneme);
      const expected = cue?.expectedPhonemes ?? [];
      const targetIndex = cue?.targetExpectedIndex;
      const valid =
        cue?.ttsText &&
        cue?.displayText &&
        cue?.helperText === cue.displayText &&
        cue?.pronunciation === cue.displayText &&
        !/[-·]/.test(cue.helperText) &&
        typeof cue?.ttsSsml === 'string' &&
        cue.ttsSsml.includes('<phoneme') &&
        Number.isInteger(targetIndex) &&
        expected[targetIndex] === targetPhoneme &&
        expected.every((phoneme) => articulationPhonemes.has(phoneme));
      return valid ? [] : [{ targetPhoneme, cue }];
    });

    if (cueKeys.length >= 20 && cueFailures.length === 0) {
      pass(
        report,
        'ES_GUIDED_CUE_COVERAGE',
        `All ${cueKeys.length} Spanish guided cues own separator-free helper text, phonetic SSML, animation truth, and grading truth.`
      );
    } else {
      fail(
        report,
        'ES_GUIDED_CUE_COVERAGE',
        'Spanish guided cues are incomplete, show helper separators, or reference unmapped articulation units.',
        { cueCount: cueKeys.length, cueFailures }
      );
    }

    const verdictTranslationKeys = [
      'attempt.readyTitle',
      'attempt.readyMessage',
      'attempt.heardTitle',
      'attempt.heardMessage',
      'attempt.totalMissTitle',
      'attempt.totalMissMessage',
      'attempt.excellentTitle',
      'attempt.excellentMessage',
      'attempt.excellentEffortTitle',
      'attempt.excellentEffortMessage',
      'attempt.strongTitle',
      'attempt.strongMismatchTitle',
      'attempt.strongMessage',
      'attempt.strongMismatchMessage',
      'attempt.closeTitle',
      'attempt.closeMessage',
      'attempt.developingTitle',
      'attempt.developingMessage',
      'attempt.missTitle',
      'attempt.missMessage',
      'combinedHeading',
      'phonemeResults',
      'toneResults',
      'rhythmResults',
      'mouthMovement',
      'verdictWeight',
      'speechEvidenceWeight',
      'mouthSupport',
      'missingExpectedOne',
      'missingExpectedMany',
      'detectedSounds',
      'mostUsefulCoaching',
      'oneMoreThing',
      'expectedSounds',
      'youSoundedLike',
      'tryThis',
      'correction',
      'showDetailedCoaching',
      'hideDetailedCoaching',
      'details.whatToDo',
      'details.tongue',
      'details.lips',
      'details.jaw',
      'details.airflow',
      'details.voicing',
      'details.visualCue',
      'details.commonMistake',
      'details.practiceDrill',
      'details.successCue',
      'details.compareWith',
    ];
    const translationFallbacks = verdictTranslationKeys.filter((suffix) => {
      const key = `pronunciationVerdict.${suffix}`;
      return translationModule.t(key, 'es', { count: 2, weight: 70 }) ===
        translationModule.t(key, 'en', { count: 2, weight: 70 });
    });

    if (translationFallbacks.length === 0) {
      pass(
        report,
        'ES_VERDICT_UI_LOCALIZATION',
        `All ${verdictTranslationKeys.length} Spanish verdict strings are localized without English fallback.`
      );
    } else {
      fail(
        report,
        'ES_VERDICT_UI_LOCALIZATION',
        'Spanish verdict UI is falling back to English.',
        translationFallbacks
      );
    }

    const pluginLoaderSource = fs.readFileSync(
      path.join(PROJECT_ROOT, 'src', 'components', 'core', 'PluginLoader.jsx'),
      'utf8'
    );
    const keyboardSource = fs.readFileSync(
      path.join(PROJECT_ROOT, 'src', 'components', 'common', 'QwertyKeyboard.jsx'),
      'utf8'
    );
    const practiceSource = fs.readFileSync(
      path.join(PROJECT_ROOT, 'src', 'pages', 'Practice.jsx'),
      'utf8'
    );
    const appSource = fs.readFileSync(path.join(PROJECT_ROOT, 'src', 'App.jsx'), 'utf8');
    const eagerSpanishOwners = listFilesRecursive(path.join(PROJECT_ROOT, 'src'))
      .filter((filePath) => /\.(?:js|jsx|ts|tsx)$/.test(filePath))
      .filter((filePath) =>
        /(?:from\s+|import\()['"]@\/components\/languagepacks\/es\//.test(
          fs.readFileSync(filePath, 'utf8')
        )
      )
      .map((filePath) => path.relative(PROJECT_ROOT, filePath).replace(/\\/g, '/'));
    const packGlobalStateOwners = listFilesRecursive(path.join(PACK_ROOT, 'es'))
      .filter((filePath) => /\.(?:js|jsx|ts|tsx)$/.test(filePath))
      .filter((filePath) =>
        /(?:globalThis|window)\.|localStorage|sessionStorage/.test(
          fs.readFileSync(filePath, 'utf8')
        )
      )
      .map((filePath) => path.relative(PROJECT_ROOT, filePath).replace(/\\/g, '/'));
    const keyboardRows = pack?.getKeyboardRows?.() ?? [];
    const shellSpanishBehavior = [
      ['qwerty-spanish-rows', /SPANISH_ROWS|practiceLanguage\s*===\s*['"]es['"]/.test(keyboardSource)],
      ['practice-spanish-more-words-fallback', /es:\s*['"]Más Palabras['"]/.test(practiceSource)],
      ['practice-spanish-target-fallback', /\bes:\s*\/\^\[\\p\{Script=Latin\}/.test(practiceSource)],
    ].filter(([, present]) => present).map(([name]) => name);

    const spanishIsolationReady =
      pluginLoaderSource.includes(
        "es: () => import('@/components/languagepacks/es/index')"
      ) &&
      sameArray(eagerSpanishOwners, [
        'src/components/core/PluginLoader.jsx',
      ]) &&
      !/^import\s+.+languagepacks\/es\//m.test(appSource) &&
      packGlobalStateOwners.length === 0 &&
      !exists('es', 'cmudict.jsx') &&
      shellSpanishBehavior.length === 0 &&
      keyboardRows.flat().includes('Ñ') &&
      pack?.isTargetCompatible?.('Buenas noches mi amigo') === true &&
      pack?.isTargetCompatible?.('مرحبا') === false;

    if (spanishIsolationReady) {
      pass(
        report,
        'ES_PACK_ISOLATION',
        'Spanish owns Ñ input, target validation, presets, helpers, guided sounds, and pronunciation truth behind the lazy es loader.'
      );
    } else {
      fail(
        report,
        'ES_PACK_ISOLATION',
        'Spanish ownership or its lazy shell boundary is incomplete.',
        {
          eagerSpanishOwners,
          packGlobalStateOwners,
          cmudictPresent: exists('es', 'cmudict.jsx'),
          shellSpanishBehavior,
          keyboardRows,
        }
      );
    }
  } catch (error) {
    fail(
      report,
      'ES_RUNTIME_CERTIFICATION',
      'Spanish runtime certification could not be completed.',
      error.message
    );
  }
}

function sequenceFor(resolver, text) {
  return getSequences(resolver.resolveUntimed(text)).phonemes;
}

async function auditMandarinRuntime(report) {
  try {
    const [
      packModule,
      guidedModule,
      articulationAnalysisModule,
      translationModule,
    ] = await Promise.all([
      loadBundledModule(packPath('zh', 'index.jsx')),
      loadBundledModule(packPath('zh', 'guidedSoundLibrary.jsx')),
      loadBundledModule(
        path.join(
          PROJECT_ROOT,
          'src',
          'components',
          'uas',
          'buildArticulationAnalysis.jsx'
        )
      ),
      loadBundledModule(
        path.join(
          PROJECT_ROOT,
          'src',
          'components',
          'i18n',
          'translations.jsx'
        )
      ),
    ]);
    const pack = packModule.default;
    const translate = translationModule.t;
    const buildArticulationAnalysis =
      articulationAnalysisModule.buildArticulationAnalysis;

    const resolverSource = readText('zh', 'PhonemeResolver.jsx');
    const pluginLoaderSource = fs.readFileSync(
      path.join(PROJECT_ROOT, 'src', 'components', 'core', 'PluginLoader.jsx'),
      'utf8'
    );
    const appSource = fs.readFileSync(path.join(PROJECT_ROOT, 'src', 'App.jsx'), 'utf8');
    const pinyinImportOwners = listFilesRecursive(path.join(PROJECT_ROOT, 'src'))
      .filter((filePath) => /\.(?:js|jsx|ts|tsx)$/.test(filePath))
      .filter((filePath) => /from\s+['"]pinyin-pro['"]|import\(['"]pinyin-pro['"]\)/.test(
        fs.readFileSync(filePath, 'utf8')
      ))
      .map((filePath) => path.relative(PROJECT_ROOT, filePath).replace(/\\/g, '/'));
    const pinyinPackage = JSON.parse(
      fs.readFileSync(path.join(PROJECT_ROOT, 'node_modules', 'pinyin-pro', 'package.json'), 'utf8')
    );
    const obsoleteTruthFiles = ['cedict.jsx', 'cmudict.jsx', 'lexicon.jsx']
      .filter((relativePath) => exists('zh', relativePath));
    const mandarinIsolationReady =
      sameArray(pinyinImportOwners, [
        'src/components/languagepacks/zh/PhonemeResolver.jsx',
      ]) &&
      resolverSource.includes("import { pinyin } from 'pinyin-pro'") &&
      !/globalThis\.(?:pinyin|pinyinPro)|window\.(?:pinyin|pinyinPro)/.test(resolverSource) &&
      pluginLoaderSource.includes(
        "zh: () => import('@/components/languagepacks/zh/index')"
      ) &&
      !/^import\s+.+languagepacks\/zh\//m.test(pluginLoaderSource) &&
      !/^import\s+.+languagepacks\/zh\//m.test(appSource) &&
      pinyinPackage?.sideEffects === false &&
      typeof pinyinPackage?.module === 'string' &&
      obsoleteTruthFiles.length === 0;

    if (mandarinIsolationReady) {
      pass(
        report,
        'ZH_PACK_ISOLATION',
        'Mandarin alone owns the side-effect-free pinyin-pro ESM import, the shell reaches it only through the lazy zh loader, and no duplicate lexical truth source remains.'
      );
    } else {
      fail(
        report,
        'ZH_PACK_ISOLATION',
        'Mandarin pinyin ownership or its lazy shell boundary is incomplete.',
        {
          pinyinImportOwners,
          pinyinPackageModule: pinyinPackage?.module,
          pinyinPackageSideEffects: pinyinPackage?.sideEffects,
          obsoleteTruthFiles,
        }
      );
    }

    const contextualCases = [
      ['你好', 'ni3 hao3', 'nǐ hǎo', [2, 3]],
      ['不客气', 'bu2 ke4 qi4', 'bú kè qì', [2, 4, 4]],
      ['银行', 'yin2 hang2', 'yín háng', [2, 2]],
      ['爸爸', 'ba4 ba0', 'bà ba', [4, 0]],
      ['音乐', 'yin1 yue4', 'yīn yuè', [1, 4]],
    ];
    const contextualFailures = contextualCases
      .map(([text, numbered, helper, surfaceTones]) => {
        const resolved = pack?.prepareLearningInput?.(text) ?? {};
        return {
          text,
          expectedNumbered: numbered,
          actualNumbered: resolved.pinyinNumbered,
          expectedHelper: helper,
          actualHelper: resolved.helperText,
          tones: resolved.tones,
          expectedSurfaceTones: surfaceTones,
          actualSurfaceTones: resolved.surfaceTones,
        };
      })
      .filter(
        (item) =>
          item.actualNumbered !== item.expectedNumbered ||
          item.actualHelper !== item.expectedHelper ||
          !Array.isArray(item.tones) ||
          item.tones.length === 0 ||
          !sameArray(item.actualSurfaceTones, item.expectedSurfaceTones)
      );

    const tripleThird = pack?.prepareLearningInput?.('我很好') ?? {};
    const tripleThirdHonest =
      sameArray(tripleThird.tones, [3, 3, 3]) &&
      Array.isArray(tripleThird.acceptedToneSets) &&
      sameArray(tripleThird.acceptedToneSets[0], [2, 3]) &&
      sameArray(tripleThird.acceptedToneSets[1], [2, 3]) &&
      sameArray(tripleThird.acceptedToneSets[2], [3]);

    if (contextualFailures.length === 0 && tripleThirdHonest) {
      pass(
        report,
        'ZH_CONTEXTUAL_PINYIN',
        'Contextual pinyin preserves polyphonic readings, tone sandhi, and neutral tones.'
      );
    } else {
      fail(
        report,
        'ZH_CONTEXTUAL_PINYIN',
        'Contextual Mandarin pronunciation truth is incorrect.',
        { contextualFailures, tripleThird }
      );
    }

    const playback = pack?.preparePlayback?.('你好') ?? {};
    const visualTimeline = Array.isArray(playback.animationTimeline)
      ? playback.animationTimeline
      : [];
    const visualPhonemes = visualTimeline
      .filter((entry) => !['neutral', 'pause'].includes(entry?.phoneme))
      .map((entry) => entry.phoneme);
    const canonicalPhonemes = visualTimeline
      .filter((entry) => !['neutral', 'pause'].includes(entry?.phoneme))
      .map((entry) => entry.canonicalPhoneme || entry.phoneme);
    const playbackValid =
      playback.helperText === 'nǐ hǎo' &&
      sameArray(playback.phonemes, ['n', 'i', 'h', 'ao']) &&
      sameArray(visualPhonemes, ['n', 'i', 'h', 'a', 'o']) &&
      sameArray(canonicalPhonemes, ['n', 'i', 'h', 'ao', 'ao']) &&
      timelineIsMonotonic(visualTimeline) &&
      Array.isArray(playback.helperChunks) &&
      playback.helperChunks.length === 2;

    if (playbackValid) {
      pass(
        report,
        'ZH_PLAYBACK_TIMELINE',
        'Mandarin playback keeps canonical grading units while compound finals animate through their mouth shapes.'
      );
    } else {
      fail(
        report,
        'ZH_PLAYBACK_TIMELINE',
        'Mandarin playback helper, grading truth, or compound-final animation timeline is incorrect.',
        {
          helperText: playback.helperText,
          gradingPhonemes: playback.phonemes,
          visualPhonemes,
          canonicalPhonemes,
          helperChunks: playback.helperChunks,
          timelineMonotonic: timelineIsMonotonic(visualTimeline),
        }
      );
    }

    const sampleRate = 16000;
    const syllableDurationMs = 650;
    const contourFrequency = (tone, progress) => {
      if (tone === 1) return 220;
      if (tone === 2) return 145 + 105 * progress;
      if (tone === 3) {
        return progress < 0.55
          ? 205 - 90 * (progress / 0.55)
          : 115 + 85 * ((progress - 0.55) / 0.45);
      }
      if (tone === 30) return 195 - 60 * progress;
      return 260 - 145 * progress;
    };
    const buildToneAudio = (tones) => {
      const samplesPerSyllable = Math.round(
        (syllableDurationMs / 1000) * sampleRate
      );
      const samples = new Float32Array(samplesPerSyllable * tones.length);
      let phase = 0;
      tones.forEach((tone, syllableIndex) => {
        for (let sampleIndex = 0; sampleIndex < samplesPerSyllable; sampleIndex += 1) {
          const progress = sampleIndex / Math.max(1, samplesPerSyllable - 1);
          const frequency = contourFrequency(tone, progress);
          const edgeFade = Math.min(1, progress / 0.04, (1 - progress) / 0.04);
          phase += (2 * Math.PI * frequency) / sampleRate;
          samples[syllableIndex * samplesPerSyllable + sampleIndex] =
            Math.sin(phase) * 0.32 * Math.max(0, edgeFade);
        }
      });
      return samples;
    };
    const toneSyllables = [1, 2, 3, 4].map((tone, index) => ({
      hanzi: String(index + 1),
      markedPinyin: `tone-${tone}`,
      tone,
      tokens: [{ phoneme: 'a' }],
    }));
    const toneItems = toneSyllables.map((_, index) => ({
      expectedIndex: index,
      expectedPhoneme: 'a',
      startMs: index * syllableDurationMs,
      endMs: (index + 1) * syllableDurationMs,
    }));
    const toneProbe = pack?.analyzeProsody?.({
      audioSamples: buildToneAudio([1, 2, 3, 4]),
      sampleRate,
      syllables: toneSyllables,
      analysisItems: toneItems,
    });
    const flatAsFallingProbe = pack?.analyzeProsody?.({
      audioSamples: buildToneAudio([1]),
      sampleRate,
      syllables: [{
        hanzi: '错',
        markedPinyin: 'wrong-4',
        tone: 4,
        tokens: [{ phoneme: 'a' }],
      }],
      analysisItems: [{
        expectedIndex: 0,
        expectedPhoneme: 'a',
        startMs: 0,
        endMs: syllableDurationMs,
      }],
    });
    const silentToneProbe = pack?.analyzeProsody?.({
      audioSamples: new Float32Array(
        Math.round((syllableDurationMs / 1000) * sampleRate)
      ),
      sampleRate,
      syllables: [{
        hanzi: '静',
        markedPinyin: 'silent-1',
        tone: 1,
        tokens: [{ phoneme: 'a' }],
      }],
      analysisItems: [{
        expectedIndex: 0,
        expectedPhoneme: 'a',
        startMs: 0,
        endMs: syllableDurationMs,
      }],
    });
    const halfThirdProbe = pack?.analyzeProsody?.({
      audioSamples: buildToneAudio([30]),
      sampleRate,
      syllables: [{
        hanzi: '半',
        markedPinyin: 'half-third',
        tone: 3,
        tokens: [{ phoneme: 'a' }],
      }],
      analysisItems: [{
        expectedIndex: 0,
        expectedPhoneme: 'a',
        startMs: 0,
        endMs: syllableDurationMs,
      }],
    });
    const toneScores = (toneProbe?.syllables ?? []).map((item) => item.score);
    const toneContract = pack?.getProsodyScoringContract?.() ?? null;
    const combinedToneEvidence = pack?.combineSegmentalAndProsody?.({
      segmentalScore: 1,
      prosodyAnalysis: { available: true, score: 0 },
    });
    const abstainedToneEvidence = pack?.combineSegmentalAndProsody?.({
      segmentalScore: 0.82,
      prosodyAnalysis: { available: false, score: null },
    });
    const toneRuntimeValid =
      toneProbe?.available === true &&
      toneProbe?.scoredSyllables === 4 &&
      toneScores.length === 4 &&
      toneScores.every((score) => Number(score) >= 0.68) &&
      flatAsFallingProbe?.available === true &&
      Number(flatAsFallingProbe?.score) <= 0.45 &&
      silentToneProbe?.available === false &&
      silentToneProbe?.abstained === true &&
      halfThirdProbe?.available === true &&
      Number(halfThirdProbe?.score) >= 0.65 &&
      Number(toneContract?.toneShareOfSpeechEvidence) === 0.25 &&
      Math.abs(Number(combinedToneEvidence) - 0.75) < 0.001 &&
      Math.abs(Number(abstainedToneEvidence) - 0.82) < 0.001;

    if (toneRuntimeValid) {
      pass(
        report,
        'ZH_TONE_RUNTIME',
        'Local F0 analysis distinguishes tones 1-4, rejects a wrong contour, and abstains without reliable pitch evidence.'
      );
    } else {
      fail(
        report,
        'ZH_TONE_RUNTIME',
        'Mandarin tone extraction, contour scoring, weighting, or abstention is incorrect.',
        {
          toneScores,
          toneProbe,
          flatAsFallingProbe,
          silentToneProbe,
          halfThirdProbe,
          toneContract,
          combinedToneEvidence,
          abstainedToneEvidence,
        }
      );
    }

    const detectorCases = [
      ['p', 'b'],
      ['pʰ', 'p'],
      ['t', 'd'],
      ['tʰ', 't'],
      ['k', 'g'],
      ['kʰ', 'k'],
      ['tɕ', 'j'],
      ['tɕh', 'q'],
      ['ɕ', 'x'],
      ['tʂ', 'zh'],
      ['tʂʰ', 'ch'],
      ['ʂ', 'sh'],
      ['ts', 'z'],
      ['tsh', 'c'],
      ['x', 'h'],
      ['ŋ', 'ng'],
      ['y2', 'v'],
      ['ɑu2', 'ao'],
      ['uei2', 'ui'],
      ['onɡ5', 'ong'],
    ];
    const detectorFailures = detectorCases
      .map(([raw, expected]) => ({
        raw,
        expected,
        actual: pack?.normalizeDetectedPhoneme?.(raw),
      }))
      .filter((item) => item.actual !== item.expected);

    if (detectorFailures.length === 0) {
      pass(
        report,
        'ZH_DETECTOR_CANONICALIZATION',
        'Mandarin detector IPA maps to pack-owned pinyin initials and finals.'
      );
    } else {
      fail(
        report,
        'ZH_DETECTOR_CANONICALIZATION',
        'Mandarin detector tokens do not align with pack truth.',
        detectorFailures
      );
    }

    const universalProfileLabels = new Set([
      'neutral',
      'open_vowel',
      'mid_vowel',
      'front_vowel',
      'rounded_vowel_ue',
      'rounded_vowel_oo',
      'velar_stop',
      'alveolar_stop',
      'bilabial',
      'alveolar_nasal',
      'velar_nasal',
      'alveolar_fricative',
      'postalveolar_fricative',
      'dental_fricative',
      'labiodental_fricative',
      'affricate',
      'glottal',
      'rhotic',
      'lateral',
      'glide',
    ]);
    const invalidProfileFrames = (pack?.articulationMap?.frames ?? [])
      .filter(
        (frame) =>
          Array.isArray(frame?.phonemes) &&
          frame.phonemes.length > 0 &&
          !universalProfileLabels.has(frame?.label)
      )
      .map((frame) => ({ index: frame.index, label: frame.label }));
    const expected = pack?.prepareLearningInput?.('你好')?.expectedPhonemes ?? [];
    const detected = ['n', 'i2', 'x', 'ɑu2'];
    const facialTimeline = Array.from({ length: 61 }, (_, index) => ({
      time: index * 40,
      features: {
        mouth_open: 0.45,
        lip_rounding: 0.25,
        lip_spread: 0.45,
        lip_closure: 0.2,
      },
    }));
    const scoringProbe = buildArticulationAnalysis({
      phonemes: detected,
      expectedPhonemes: expected,
      facialTimeline,
      articulationMap: pack?.articulationMap,
      coachingRules: pack?.coachingRules,
      normalizeDetectedPhoneme: pack?.normalizeDetectedPhoneme,
      durationMs: 2400,
    });
    const scoringFailures = scoringProbe.filter(
      (item) =>
        !item?.expectedFrameLabel ||
        !Number.isFinite(item?.audioScore) ||
        !Number.isFinite(item?.articulationScore) ||
        !Number.isFinite(item?.finalScore)
    );

    if (
      invalidProfileFrames.length === 0 &&
      scoringProbe.length === expected.length &&
      scoringFailures.length === 0
    ) {
      pass(
        report,
        'ZH_MOUTH_SCORING',
        'Mandarin articulation labels produce complete phoneme-and-mouth verdict evidence.'
      );
    } else {
      fail(
        report,
        'ZH_MOUTH_SCORING',
        'Mandarin mouth scoring is incomplete.',
        { invalidProfileFrames, scoringFailures }
      );
    }

    const cueFailures = Object.keys(guidedModule.default ?? {})
      .map((phoneme) => {
        const cue = guidedModule.getGuidedSoundCue?.(phoneme);
        const resolved = pack?.prepareLearningInput?.(cue?.ttsText);
        return {
          phoneme,
          cue,
          resolvedPhonemes: resolved?.expectedPhonemes,
        };
      })
      .filter(
        ({ phoneme, cue, resolvedPhonemes }) =>
          !cue ||
          !sameArray(cue.expectedPhonemes, resolvedPhonemes) ||
          cue.expectedPhonemes?.[cue.targetExpectedIndex] !== phoneme
      );

    if (Object.keys(guidedModule.default ?? {}).length >= 50 && cueFailures.length === 0) {
      pass(
        report,
        'ZH_GUIDED_RUNTIME',
        'Mandarin guided initials and finals resolve to the exact cue audio and animation truth.'
      );
    } else {
      fail(
        report,
        'ZH_GUIDED_RUNTIME',
        'Mandarin guided cues do not round-trip through the resolver.',
        cueFailures
      );
    }

    const practiceSource = fs.readFileSync(
      path.join(PROJECT_ROOT, 'src', 'pages', 'Practice.jsx'),
      'utf8'
    );
    const guidedDisplaySamples = ['b', 'n', 'ie', 'ao']
      .map((phoneme) => guidedModule.getGuidedSoundCue?.(phoneme))
      .filter(Boolean);
    const guidedDisplayValid =
      /cue\.helperText\s*\|\|/.test(practiceSource) &&
      guidedDisplaySamples.length === 4 &&
      guidedDisplaySamples.every(
        (cue) => cue.helperText && !String(cue.helperText).includes('-')
      );

    if (guidedDisplayValid) {
      pass(
        report,
        'ZH_GUIDED_HELPER_DISPLAY',
        'Guided Mandarin playback displays complete pinyin syllables without shell-inserted hyphens.'
      );
    } else {
      fail(
        report,
        'ZH_GUIDED_HELPER_DISPLAY',
        'Guided Mandarin helper display still splits pinyin syllables with shell formatting.',
        guidedDisplaySamples
      );
    }

    const verdictKeys = [
      'pronunciationVerdict.attempt.closeTitle',
      'pronunciationVerdict.attempt.closeMessage',
      'pronunciationVerdict.combinedHeading',
      'pronunciationVerdict.phonemeResults',
      'pronunciationVerdict.mouthMovement',
      'pronunciationVerdict.detectedSounds',
      'pronunciationVerdict.mouthSupport',
    ];
    const verdictValues = verdictKeys.map((key) => ({
      key,
      value: typeof translate === 'function' ? translate(key, 'zh') : '',
    }));
    const coaching = pack?.buildUASCoachingResult?.({
      expectedPhonemes: expected,
      detectedPhonemes: detected,
      uiLanguage: 'zh',
    });
    const coachingText = String(coaching?.shortMessage || coaching?.message || '');
    const localized =
      verdictValues.every(
        ({ key, value }) => value && value !== key && /[\u3400-\u9FFF]/u.test(value)
      ) && /[\u3400-\u9FFF]/u.test(coachingText);

    if (localized) {
      pass(
        report,
        'ZH_VERDICT_LOCALIZATION',
        'Mandarin verdict and coaching copy follow the Chinese UI language.'
      );
    } else {
      fail(
        report,
        'ZH_VERDICT_LOCALIZATION',
        'Mandarin verdict or coaching copy falls back to English.',
        { verdictValues, coachingText }
      );
    }
  } catch (error) {
    fail(
      report,
      'ZH_RUNTIME_CERTIFICATION',
      'Mandarin runtime certification could not be completed.',
      error.message
    );
  }
}

async function auditJapaneseRuntime(report) {
  try {
    const [packModule, guidedModule, libraryModule, analysisModule, translationModule] =
      await Promise.all([
        loadBundledModule(packPath('ja', 'index.jsx')),
        loadBundledModule(packPath('ja', 'guidedSoundLibrary.jsx')),
        loadBundledModule(packPath('ja', 'universal500.jsx')),
        loadBundledModule(
          path.join(PROJECT_ROOT, 'src', 'components', 'uas', 'buildArticulationAnalysis.jsx')
        ),
        loadBundledModule(
          path.join(PROJECT_ROOT, 'src', 'components', 'i18n', 'translations.jsx')
        ),
      ]);
    const dicPath = path.join(PROJECT_ROOT, 'node_modules', 'kuromoji', 'dict');
    const pack = packModule.default;
    await pack.initialize?.({ dicPath });
    await guidedModule.initializeJapaneseGuidedSoundLibrary?.({ dicPath });

    const browserDictionaryDir = path.join(
      PROJECT_ROOT,
      'public',
      'languagepacks',
      'ja',
      'kuromoji',
      'dict'
    );
    const browserDictionaryAssets = [
      'base.dat.bin', 'cc.dat.bin', 'check.dat.bin', 'tid_map.dat.bin',
      'tid_pos.dat.bin', 'tid.dat.bin', 'unk_char.dat.bin',
      'unk_compat.dat.bin', 'unk_invoke.dat.bin', 'unk_map.dat.bin',
      'unk_pos.dat.bin', 'unk.dat.bin',
    ];
    const missingBrowserAssets = browserDictionaryAssets.filter((name) => {
      const assetPath = path.join(browserDictionaryDir, name);
      if (!fs.existsSync(assetPath) || fs.statSync(assetPath).size === 0) return true;
      const signature = fs.readFileSync(assetPath).subarray(0, 2);
      return signature[0] !== 0x1f || signature[1] !== 0x8b;
    });
    const legacyGzipAssets = fs.existsSync(browserDictionaryDir)
      ? fs.readdirSync(browserDictionaryDir).filter((name) => name.endsWith('.dat.gz'))
      : [];
    const browserRuntimePath = path.join(
      PROJECT_ROOT,
      'src',
      'components',
      'languagepacks',
      'ja',
      'vendor',
      'kuromojiBrowserRuntime.js'
    );
    const browserRuntimeSource = fs.existsSync(browserRuntimePath)
      ? fs.readFileSync(browserRuntimePath, 'utf8')
      : '';
    const readingEngineSource = fs.readFileSync(
      packPath('ja', 'japaneseReadingEngine.js'),
      'utf8'
    );
    const browserRuntimeReady =
      browserRuntimeSource.includes('.dat.bin') &&
      !browserRuntimeSource.includes('.dat.gz') &&
      browserRuntimeSource.includes('export default kuromojiBrowserRuntime') &&
      !browserRuntimeSource.includes('g.kuromoji =') &&
      readingEngineSource.includes("'./vendor/kuromojiBrowserRuntime'") &&
      readingEngineSource.includes("'/languagepacks/ja/kuromoji/dict/'") &&
      !readingEngineSource.includes('globalThis.kuromoji') &&
      !readingEngineSource.includes('window.kuromoji');

    if (
      missingBrowserAssets.length === 0 &&
      legacyGzipAssets.length === 0 &&
      browserRuntimeReady
    ) {
      pass(
        report,
        'JA_BROWSER_DICTIONARY_ASSETS',
        'All 12 browser dictionary assets and the Japanese-only browser runtime are deployable as opaque static assets.'
      );
    } else {
      fail(
        report,
        'JA_BROWSER_DICTIONARY_ASSETS',
        'Japanese browser dictionary assets or its isolated runtime are incomplete.',
        { missingBrowserAssets, legacyGzipAssets, browserRuntimeReady }
      );
    }

    const pluginLoaderSource = fs.readFileSync(
      path.join(PROJECT_ROOT, 'src', 'components', 'core', 'PluginLoader.jsx'),
      'utf8'
    );
    const appSource = fs.readFileSync(path.join(PROJECT_ROOT, 'src', 'App.jsx'), 'utf8');
    const packIds = ['en_us', 'es', 'pt', 'it', 'fr', 'de', 'ja', 'zh', 'ar', 'hi'];
    const eagerPackImports = pluginLoaderSource
      .split(/\r?\n/)
      .filter((line) => /^import\s+.+languagepacks\//.test(line.trim()));
    const missingLazyLoaders = packIds.filter(
      (packId) => !pluginLoaderSource.includes(
        `${packId}: () => import('@/components/languagepacks/${packId}/index')`
      )
    );
    const appPackImports = appSource
      .split(/\r?\n/)
      .filter((line) => /^import\s+.+languagepacks\//.test(line.trim()));

    if (
      eagerPackImports.length === 0 &&
      missingLazyLoaders.length === 0 &&
      appPackImports.length === 0
    ) {
      pass(
        report,
        'JA_PACK_ISOLATION',
        'The shell lazily loads every linguistic pack, and Japanese keeps its tokenizer runtime private to its own chunk.'
      );
    } else {
      fail(
        report,
        'JA_PACK_ISOLATION',
        'The shell still contains an eager language-pack path or an incomplete lazy registry.',
        { eagerPackImports, missingLazyLoaders, appPackImports }
      );
    }

    const truthCases = [
      ['笑顔', 'e ga o'],
      ['お元気ですか', 'o ge n ki de su ka'],
      ['こんにちは', 'ko n ni chi wa'],
      ['こんばんは', 'ko n ba n wa'],
      ['はち', 'ha chi'],
      ['さいふ', 'sa i fu'],
      ['私は東京へ行きます', 'wa ta shi wa to o kyo o e i ki ma su'],
      ['わたしはとうきょうへいきます', 'wa ta shi wa to u kyo o e i ki ma su'],
      ['ファイル', 'fa i ru'],
      ['ティー', 'ti i'],
      ['を', 'o'],
    ];
    const truthFailures = truthCases
      .map(([text, expected]) => {
        const result = pack.prepareLearningInput?.(text);
        return {
          text,
          expected,
          actual: result?.helperText,
          readingKana: result?.readingKana,
          pronunciationKana: result?.pronunciationKana,
          approved: result?.approved,
        };
      })
      .filter((item) => item.actual !== item.expected || item.approved !== true);

    if (truthFailures.length === 0) {
      pass(
        report,
        'JA_CONTEXTUAL_READING_TRUTH',
        'Kanji, contextual particles, modern katakana, and long vowels resolve to approved Japanese mora truth.'
      );
    } else {
      fail(
        report,
        'JA_CONTEXTUAL_READING_TRUTH',
        'Japanese contextual readings or mora helpers disagree with certified controls.',
        truthFailures
      );
    }

    const libraryWords = flattenLibrary(libraryModule.default);
    const playbackFailures = libraryWords.flatMap((text) => {
      const learning = pack.prepareLearningInput?.(text);
      const playback = pack.preparePlayback?.(text);
      const chunks = playback?.helperChunks ?? [];
      const morae = learning?.morae ?? [];
      const chunkText = chunks.map((chunk) => chunk?.text).join(' ');
      const valid =
        learning?.approved === true &&
        playback?.approved === true &&
        timelineIsMonotonic(playback?.timeline) &&
        chunks.length === morae.length &&
        chunkText === learning?.helperText &&
        !String(learning?.helperText || '').includes('-');
      return valid
        ? []
        : [{
            text,
            helperText: learning?.helperText,
            moraCount: morae.length,
            chunkCount: chunks.length,
            chunkText,
            validation: learning?.validation,
          }];
    });

    if (libraryWords.length === 522 && playbackFailures.length === 0) {
      pass(
        report,
        'JA_LIBRARY_PLAYBACK_TRUTH',
        'All 522 unique Japanese library entries have approved, dash-free mora helpers with matching animation timing.'
      );
    } else {
      fail(
        report,
        'JA_LIBRARY_PLAYBACK_TRUTH',
        'Japanese library helper text and playback timing are not fully aligned.',
        { libraryCount: libraryWords.length, failures: playbackFailures }
      );
    }

    const detectorCases = [
      ['ɕ', 'sh'], ['t͡ɕ', 'ch'], ['dʑ', 'j'], ['ɸ', 'f'],
      ['ɯ', 'u'], ['ɾ', 'r'], ['l', 'r'], ['ɴ', 'n'],
      ['j', 'y'], ['ɡ', 'g'], ['ç', 'h'], ['β', 'b'], ['a5', 'a'],
    ];
    const detectorFailures = detectorCases
      .map(([raw, expected]) => ({
        raw,
        expected,
        actual: pack.normalizeDetectedPhoneme?.(raw),
      }))
      .filter((item) => item.actual !== item.expected);

    if (detectorFailures.length === 0) {
      pass(
        report,
        'JA_DETECTOR_CANONICALIZATION',
        'Japanese detector IPA maps to the pack-owned canonical phone inventory.'
      );
    } else {
      fail(
        report,
        'JA_DETECTOR_CANONICALIZATION',
        'Japanese detector IPA does not map to canonical pack phones.',
        detectorFailures
      );
    }

    const universalProfileLabels = new Set([
      'neutral', 'open_vowel', 'mid_vowel', 'front_vowel',
      'rounded_vowel_ue', 'rounded_vowel_oo', 'velar_stop',
      'alveolar_stop', 'bilabial', 'alveolar_nasal', 'velar_nasal',
      'alveolar_fricative', 'postalveolar_fricative', 'dental_fricative',
      'labiodental_fricative', 'affricate', 'glottal', 'rhotic',
      'lateral', 'glide',
    ]);
    const invalidProfiles = (pack.articulationMap?.frames ?? [])
      .filter(
        (frame) =>
          Array.isArray(frame?.phonemes) &&
          frame.phonemes.length > 0 &&
          !universalProfileLabels.has(frame?.label)
      )
      .map((frame) => ({ index: frame.index, label: frame.label }));
    const expected = pack.prepareLearningInput?.('こんにちは')?.expectedPhonemes ?? [];
    const detected = ['k', 'o', 'ɴ', 'n', 'i', 't͡ɕ', 'i', 'w', 'a'];
    const facialTimeline = Array.from({ length: 81 }, (_, index) => ({
      time: index * 40,
      features: {
        mouth_open: 0.45,
        lip_rounding: 0.3,
        lip_spread: 0.45,
        lip_closure: 0.2,
      },
    }));
    const scoringProbe = analysisModule.buildArticulationAnalysis?.({
      phonemes: detected,
      expectedPhonemes: expected,
      facialTimeline,
      articulationMap: pack.articulationMap,
      coachingRules: pack.coachingRules,
      normalizeDetectedPhoneme: pack.normalizeDetectedPhoneme,
      durationMs: 3200,
    }) ?? [];
    const scoringFailures = scoringProbe.filter(
      (item) =>
        !item?.expectedFrameLabel ||
        !Number.isFinite(item?.audioScore) ||
        !Number.isFinite(item?.articulationScore) ||
        !Number.isFinite(item?.finalScore)
    );

    if (
      invalidProfiles.length === 0 &&
      scoringProbe.length === expected.length &&
      scoringFailures.length === 0
    ) {
      pass(
        report,
        'JA_MOUTH_SCORING',
        'Japanese articulation labels produce complete phoneme-and-mouth verdict evidence.'
      );
    } else {
      fail(
        report,
        'JA_MOUTH_SCORING',
        'Japanese mouth scoring is incomplete.',
        { invalidProfiles, expected, scoringCount: scoringProbe.length, scoringFailures }
      );
    }

    const rhythmLearning = pack.prepareLearningInput?.('がっこう') ?? {};
    const buildRhythmItems = (durations, timestampSource) => {
      let cursor = 0;
      return durations.map((duration, expectedIndex) => {
        const startMs = cursor;
        cursor += duration;
        return {
          expectedIndex,
          expectedPhoneme: rhythmLearning.expectedPhonemes?.[expectedIndex],
          detectedPhoneme: rhythmLearning.expectedPhonemes?.[expectedIndex],
          startMs,
          endMs: cursor,
          timestampSource,
        };
      });
    };
    const goodRhythmProbe = pack.analyzeProsody?.({
      prosodyUnits: rhythmLearning.prosodyUnits,
      analysisItems: buildRhythmItems(
        [90, 180, 260, 340],
        'canonical-timestamp-object'
      ),
    });
    const compressedQuantityProbe = pack.analyzeProsody?.({
      prosodyUnits: rhythmLearning.prosodyUnits,
      analysisItems: buildRhythmItems(
        [90, 180, 90, 180],
        'canonical-timestamp-object'
      ),
    });
    const estimatedRhythmProbe = pack.analyzeProsody?.({
      prosodyUnits: rhythmLearning.prosodyUnits,
      analysisItems: buildRhythmItems(
        [90, 180, 260, 340],
        'estimated-even'
      ),
    });
    const rhythmContract = pack.getProsodyScoringContract?.() ?? null;
    const combinedRhythmEvidence = pack.combineSegmentalAndProsody?.({
      segmentalScore: 1,
      prosodyAnalysis: { available: true, score: 0 },
    });
    const abstainedRhythmEvidence = pack.combineSegmentalAndProsody?.({
      segmentalScore: 0.82,
      prosodyAnalysis: { available: false, score: null },
    });
    const rhythmCoaching = pack.buildUASCoachingResult?.({
      expectedPhonemes: rhythmLearning.expectedPhonemes,
      detectedPhonemes: rhythmLearning.expectedPhonemes,
      prosodyAnalysis: {
        available: true,
        score: 0.4,
        weakestUnit: { kind: 'long-vowel', mora: 'こ' },
      },
      uiLanguage: 'ja',
    });
    const rhythmRuntimeValid =
      goodRhythmProbe?.available === true &&
      Number(goodRhythmProbe?.score) >= 0.75 &&
      goodRhythmProbe?.quantityTargets?.some(
        (target) => target?.kind === 'long-vowel'
      ) &&
      goodRhythmProbe?.quantityTargets?.some(
        (target) => target?.kind === 'sokuon'
      ) &&
      compressedQuantityProbe?.available === true &&
      Number(compressedQuantityProbe?.score) <= 0.6 &&
      estimatedRhythmProbe?.available === false &&
      estimatedRhythmProbe?.abstained === true &&
      rhythmContract?.type === 'mora-rhythm' &&
      Number(rhythmContract?.shareOfSpeechEvidence) === 0.15 &&
      rhythmContract?.resultTranslationKey ===
        'pronunciationVerdict.rhythmResults' &&
      Math.abs(Number(combinedRhythmEvidence) - 0.85) < 0.001 &&
      Math.abs(Number(abstainedRhythmEvidence) - 0.82) < 0.001 &&
      rhythmCoaching?.rhythmCoachingActive === true &&
      /[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/u.test(
        String(rhythmCoaching?.message || '')
      );

    if (rhythmRuntimeValid) {
      pass(
        report,
        'JA_MORA_RHYTHM_RUNTIME',
        'Japanese grades long vowels, sokuon, and mora timing from real aligned timestamps, coaches one timing issue, and abstains on estimated timing.'
      );
    } else {
      fail(
        report,
        'JA_MORA_RHYTHM_RUNTIME',
        'Japanese mora-rhythm extraction, weighting, coaching, or abstention is incorrect.',
        {
          rhythmLearning,
          goodRhythmProbe,
          compressedQuantityProbe,
          estimatedRhythmProbe,
          rhythmContract,
          combinedRhythmEvidence,
          abstainedRhythmEvidence,
          rhythmCoaching,
        }
      );
    }

    const cueInventory = guidedModule.getJapaneseGuidedSoundInventory?.() ?? [];
    const cueFailures = cueInventory
      .map((phoneme) => {
        const cue = guidedModule.getGuidedSoundCue?.(phoneme);
        const resolved = pack.prepareLearningInput?.(cue?.ttsText);
        return { phoneme, cue, resolvedPhonemes: resolved?.expectedPhonemes };
      })
      .filter(
        ({ cue, resolvedPhonemes }) =>
          !cue ||
          !sameArray(cue.expectedPhonemes, resolvedPhonemes) ||
          cue.expectedPhonemes?.[cue.targetExpectedIndex] !== cue.targetPhoneme
      );

    if (cueInventory.length >= 25 && cueFailures.length === 0) {
      pass(
        report,
        'JA_GUIDED_RUNTIME',
        `All ${cueInventory.length} Japanese guided phones resolve to matching native cue audio and animation truth.`
      );
    } else {
      fail(
        report,
        'JA_GUIDED_RUNTIME',
        'Japanese guided cues do not round-trip through resolver truth.',
        { cueCount: cueInventory.length, cueFailures }
      );
    }

    const verdictKeys = [
      'pronunciationVerdict.attempt.closeTitle',
      'pronunciationVerdict.attempt.closeMessage',
      'pronunciationVerdict.combinedHeading',
      'pronunciationVerdict.phonemeResults',
      'pronunciationVerdict.rhythmResults',
      'pronunciationVerdict.mouthMovement',
      'pronunciationVerdict.detectedSounds',
      'pronunciationVerdict.mouthSupport',
    ];
    const verdictValues = verdictKeys.map((key) => ({
      key,
      value: translationModule.t?.(key, 'ja') || '',
    }));
    const coaching = pack.buildUASCoachingResult?.({
      expectedPhonemes: expected,
      detectedPhonemes: detected,
      uiLanguage: 'ja',
    });
    const coachingText = String(coaching?.shortMessage || coaching?.message || '');
    const localized =
      verdictValues.every(
        ({ key, value }) =>
          value && value !== key && /[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/u.test(value)
      ) &&
      /[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/u.test(coachingText);

    if (localized) {
      pass(
        report,
        'JA_VERDICT_LOCALIZATION',
        'Japanese verdict and coaching copy follow the selected Japanese UI language.'
      );
    } else {
      fail(
        report,
        'JA_VERDICT_LOCALIZATION',
        'Japanese verdict or coaching copy falls back to English.',
        { verdictValues, coachingText }
      );
    }

    const indexSource = readText('ja', 'index.jsx');
    if (!/toneAnalyzer|lexicalTone|analyzeMandarin|MANDARIN_/i.test(indexSource)) {
      pass(
        report,
        'JA_NO_LEXICAL_TONE_BLEED',
        'Japanese remains mora-based and does not inherit Mandarin lexical-tone behavior.'
      );
    } else {
      fail(
        report,
        'JA_NO_LEXICAL_TONE_BLEED',
        'Mandarin lexical-tone behavior leaked into the Japanese pack.'
      );
    }
  } catch (error) {
    fail(
      report,
      'JA_RUNTIME_CERTIFICATION',
      'Japanese runtime certification could not be completed.',
      error.message
    );
  }
}

async function auditHindiRuntime(report) {
  try {
    const [
      packModule,
      readingModule,
      guidedModule,
      libraryModule,
      analysisModule,
      translationModule,
      scoringModule,
    ] = await Promise.all([
      loadBundledModule(packPath('hi', 'index.jsx')),
      loadBundledModule(packPath('hi', 'hindiReadingEngine.js')),
      loadBundledModule(packPath('hi', 'guidedSoundLibrary.jsx')),
      loadBundledModule(packPath('hi', 'universal500.jsx')),
      loadBundledModule(
        path.join(PROJECT_ROOT, 'src', 'components', 'uas', 'buildArticulationAnalysis.jsx')
      ),
      loadBundledModule(
        path.join(PROJECT_ROOT, 'src', 'components', 'i18n', 'translations.jsx')
      ),
      loadBundledModule(path.join(PROJECT_ROOT, 'src', 'lib', 'practiceScoring.js')),
    ]);
    const pack = packModule.default;

    const requiredUiStrings = ['back', 'next', 'cancel', 'confirm'];
    const missingUiStrings = requiredUiStrings.filter((key) => {
      const value = String(pack?.uiTranslations?.strings?.[key] ?? '').trim();
      return !value || !/[\p{Script=Devanagari}]/u.test(value);
    });
    if (missingUiStrings.length === 0) {
      pass(
        report,
        'HI_UI_TRANSLATION_PARITY',
        'Hindi owns the complete navigation-string set used by the Spanish control pack.'
      );
    } else {
      fail(
        report,
        'HI_UI_TRANSLATION_PARITY',
        'Hindi navigation strings are incomplete or fall back outside Devanagari.',
        missingUiStrings
      );
    }

    const verdictTranslationKeys = [
      'attempt.readyTitle',
      'attempt.readyMessage',
      'attempt.heardTitle',
      'attempt.heardMessage',
      'attempt.totalMissTitle',
      'attempt.totalMissMessage',
      'attempt.excellentTitle',
      'attempt.excellentMessage',
      'attempt.excellentEffortTitle',
      'attempt.excellentEffortMessage',
      'attempt.strongTitle',
      'attempt.strongMismatchTitle',
      'attempt.strongMessage',
      'attempt.strongMismatchMessage',
      'attempt.closeTitle',
      'attempt.closeMessage',
      'attempt.developingTitle',
      'attempt.developingMessage',
      'attempt.missTitle',
      'attempt.missMessage',
      'combinedHeading',
      'phonemeResults',
      'toneResults',
      'rhythmResults',
      'mouthMovement',
      'verdictWeight',
      'speechEvidenceWeight',
      'mouthSupport',
      'missingExpectedOne',
      'missingExpectedMany',
      'detectedSounds',
      'mostUsefulCoaching',
      'oneMoreThing',
      'expectedSounds',
      'youSoundedLike',
      'tryThis',
      'correction',
      'showDetailedCoaching',
      'hideDetailedCoaching',
      'details.whatToDo',
      'details.tongue',
      'details.lips',
      'details.jaw',
      'details.airflow',
      'details.voicing',
      'details.visualCue',
      'details.commonMistake',
      'details.practiceDrill',
      'details.successCue',
      'details.compareWith',
    ];
    const translationFallbacks = verdictTranslationKeys.filter((suffix) => {
      const key = `pronunciationVerdict.${suffix}`;
      return translationModule.t(key, 'hi', { count: 2, weight: 70 }) ===
        translationModule.t(key, 'en', { count: 2, weight: 70 });
    });

    if (translationFallbacks.length === 0) {
      pass(
        report,
        'HI_VERDICT_UI_LOCALIZATION',
        `All ${verdictTranslationKeys.length} Hindi verdict strings are localized without English fallback.`
      );
    } else {
      fail(
        report,
        'HI_VERDICT_UI_LOCALIZATION',
        'Hindi verdict UI is falling back to English.',
        translationFallbacks
      );
    }

    const manifestParity =
      pack?.manifest?.id === 'hi' &&
      pack?.manifest?.supportsAnalysis === true &&
      pack?.manifest?.supportsAirflow === true &&
      pack?.manifest?.packOwnsTiming === true &&
      pack?.manifest?.packOwnsArticulation === true &&
      pack?.manifest?.packOwnsTTS === true;
    if (manifestParity) {
      pass(
        report,
        'HI_MANIFEST_PARITY',
        'Hindi manifest identity and ownership declarations match the certified pack contract.'
      );
    } else {
      fail(
        report,
        'HI_MANIFEST_PARITY',
        'Hindi manifest identity or ownership declarations are incomplete.',
        pack?.manifest
      );
    }

    const controls = readingModule.getHindiReadingControls?.() ?? {};
    const controlFailures = Object.entries(controls)
      .map(([text, expected]) => ({
        text,
        expected,
        actual: pack.prepareLearningInput?.(text)?.expectedPhonemes ?? [],
      }))
      .filter((item) => !sameArray(item.expected, item.actual));

    if (Object.keys(controls).length >= 10 && controlFailures.length === 0) {
      pass(
        report,
        'HI_READING_CONTROLS',
        `All ${Object.keys(controls).length} Hindi conjunct, nukta, nasal, and schwa controls match reviewed truth.`
      );
    } else {
      fail(report, 'HI_READING_CONTROLS', 'Hindi reviewed reading controls diverged.', controlFailures);
    }

    const contrastCases = [
      ['कल', 'काल'], ['दिन', 'दीन'], ['पुल', 'पूल'],
      ['तल', 'टल'], ['दल', 'डल'], ['कर', 'खर'], ['गम', 'घम'],
    ];
    const collapsed = contrastCases
      .filter(([left, right]) =>
        sameArray(
          pack.prepareLearningInput?.(left)?.expectedPhonemes ?? [],
          pack.prepareLearningInput?.(right)?.expectedPhonemes ?? []
        )
      )
      .map(([left, right]) => ({ left, right }));

    if (collapsed.length === 0) {
      pass(
        report,
        'HI_CONTRAST_PRESERVATION',
        'Hindi vowel length, aspiration, and dental/retroflex contrasts remain distinct.'
      );
    } else {
      fail(report, 'HI_CONTRAST_PRESERVATION', 'Distinct Hindi sounds collapsed.', collapsed);
    }

    const words = flattenLibrary(libraryModule.default);
    const runtimeFailures = words
      .map((text) => {
        const learning = pack.prepareLearningInput?.(text) ?? {};
        const playback = pack.preparePlayback?.(text) ?? {};
        return {
          text,
          approved: learning.approved,
          phonemes: learning.expectedPhonemes,
          frames: learning.expectedFrames,
          helperText: learning.helperText,
          timeline: playback.timeline,
        };
      })
      .filter((item) =>
        item.approved !== true ||
        !String(item.helperText || '').trim() ||
        !Array.isArray(item.phonemes) ||
        item.phonemes.length === 0 ||
        !sameArray(
          item.frames,
          item.phonemes.map((phoneme) =>
            pack.articulationMap?.frames?.find((frame) => frame.phonemes?.includes(phoneme))?.index ?? 0
          )
        ) ||
        !timelineIsMonotonic(item.timeline)
      );

    if (words.length >= 500 && runtimeFailures.length === 0) {
      pass(
        report,
        'HI_LIBRARY_RUNTIME',
        `All ${words.length} unique Hindi library entries align helper, phoneme, frame, and animation truth.`
      );
    } else {
      fail(report, 'HI_LIBRARY_RUNTIME', 'Hindi library runtime alignment is incomplete.', {
        libraryCount: words.length,
        failures: runtimeFailures,
      });
    }

    const detectorCases = [
      ['ʈ', 'tt'], ['ɖ', 'dd'], ['t̪', 't'], ['d̪', 'd'],
      ['kʰ', 'kh'], ['ɡʱ', 'gh'], ['t͡ʃ', 'ch'], ['d͡ʒ', 'j'],
      ['ɳ', 'nn'], ['ɲ', 'ny'], ['ŋ', 'ng'], ['ʋ', 'v'], ['ɽ', 'rr'],
      ['ɑː', 'aa'], ['iː', 'ii'], ['uː', 'uu'],
    ];
    const detectorFailures = detectorCases
      .map(([raw, expected]) => ({ raw, expected, actual: pack.normalizeDetectedPhoneme?.(raw) }))
      .filter((item) => item.actual !== item.expected);

    if (detectorFailures.length === 0) {
      pass(
        report,
        'HI_DETECTOR_CANONICALIZATION',
        'Hindi detector IPA maps to the pack-owned canonical phone inventory.'
      );
    } else {
      fail(report, 'HI_DETECTOR_CANONICALIZATION', 'Hindi detector mapping is incomplete.', detectorFailures);
    }

    const inventoryPhonemes = pack.phonemeSystem?.phonemes?.map((item) => item.symbol) ?? [];
    const missingAirflow = inventoryPhonemes.filter(
      (phoneme) => !pack.airflowMap?.byPhoneme?.[phoneme]
    );
    if (inventoryPhonemes.length >= 50 && missingAirflow.length === 0) {
      pass(
        report,
        'HI_AIRFLOW_COVERAGE',
        `All ${inventoryPhonemes.length} canonical Hindi sounds have pack-owned airflow behavior.`
      );
    } else {
      fail(report, 'HI_AIRFLOW_COVERAGE', 'Hindi airflow coverage is incomplete.', missingAirflow);
    }

    const mouthLearning = pack.prepareLearningInput?.('नमस्ते') ?? {};
    const facialTimeline = Array.from({ length: 81 }, (_, index) => ({
      time: index * 40,
      features: {
        mouth_open: 0.5,
        lip_rounding: 0.3,
        lip_spread: 0.45,
        lip_closure: 0.25,
      },
    }));
    const mouthProbe = analysisModule.buildArticulationAnalysis?.({
      phonemes: mouthLearning.expectedPhonemes,
      expectedPhonemes: mouthLearning.expectedPhonemes,
      facialTimeline,
      articulationMap: pack.articulationMap,
      coachingRules: pack.coachingRules,
      normalizeDetectedPhoneme: pack.normalizeDetectedPhoneme,
      durationMs: 3200,
    }) ?? [];
    const mouthFailures = mouthProbe.filter(
      (item) =>
        !item?.expectedFrameLabel ||
        !Number.isFinite(item?.audioScore) ||
        !Number.isFinite(item?.articulationScore) ||
        !Number.isFinite(item?.finalScore)
    );
    const speechOnlyProbe = analysisModule.buildArticulationAnalysis?.({
      phonemes: mouthLearning.expectedPhonemes,
      expectedPhonemes: mouthLearning.expectedPhonemes,
      facialTimeline: [],
      articulationMap: pack.articulationMap,
      coachingRules: pack.coachingRules,
      normalizeDetectedPhoneme: pack.normalizeDetectedPhoneme,
      durationMs: 3200,
    }) ?? [];
    const speechOnlyFailures = speechOnlyProbe.filter(
      (item) =>
        !Number.isFinite(item?.audioScore) ||
        item?.articulationScore != null ||
        item?.exactPhonemeMatch !== true
    );
    const speechOnlyScore = scoringModule.combinePronunciationEvidence?.(1, null);
    if (
      mouthProbe.length === mouthLearning.expectedPhonemes?.length &&
      mouthFailures.length === 0 &&
      speechOnlyProbe.length === mouthLearning.expectedPhonemes?.length &&
      speechOnlyFailures.length === 0 &&
      speechOnlyScore === 1
    ) {
      pass(
        report,
        'HI_MOUTH_SCORING',
        'Hindi preserves complete combined evidence and a real phoneme verdict when mouth frames are unavailable.'
      );
    } else {
      fail(report, 'HI_MOUTH_SCORING', 'Hindi mouth grading is incomplete.', {
        expected: mouthLearning.expectedPhonemes,
        resultCount: mouthProbe.length,
        failures: mouthFailures,
        speechOnlyResultCount: speechOnlyProbe.length,
        speechOnlyFailures,
        speechOnlyScore,
      });
    }

    const inventory = guidedModule.getHindiGuidedSoundInventory?.() ?? [];
    const guidedFailures = inventory
      .map((phoneme) => {
        const cue = guidedModule.getGuidedSoundCue?.(phoneme);
        const resolved = pack.prepareLearningInput?.(cue?.ttsText);
        return { phoneme, cue, resolved: resolved?.expectedPhonemes };
      })
      .filter(({ cue, resolved }) =>
        !cue ||
        !sameArray(cue.expectedPhonemes, resolved) ||
        cue.expectedPhonemes?.[cue.targetExpectedIndex] !== cue.targetPhoneme
      );

    if (inventory.length >= 45 && guidedFailures.length === 0) {
      pass(
        report,
        'HI_GUIDED_RUNTIME',
        `All ${inventory.length} Hindi guided sounds round-trip through pack-owned cue truth.`
      );
    } else {
      fail(report, 'HI_GUIDED_RUNTIME', 'Hindi guided sounds do not round-trip.', {
        count: inventory.length,
        failures: guidedFailures,
      });
    }

    const coaching = pack.buildUASCoachingResult?.({
      expectedPhonemes: ['k', 'a', 'm', 'a', 'l'],
      detectedPhonemes: ['kʰ', 'a', 'm', 'ɑː', 'l'],
      uiLanguage: 'hi',
    });
    if (
      coaching?.closeMatches?.length === 2 &&
      /[\p{Script=Devanagari}]/u.test(String(coaching?.shortMessage || ''))
    ) {
      pass(
        report,
        'HI_COACHING_RUNTIME',
        'Hindi coaching recognizes close aspiration/vowel pairs and follows the Hindi UI language.'
      );
    } else {
      fail(report, 'HI_COACHING_RUNTIME', 'Hindi near-match coaching or localization failed.', coaching);
    }

    const sharedKeyboard = readText('hi', '../../common/NonLatinKeyboard.jsx');
    const qwertyKeyboard = readText('hi', '../../common/QwertyKeyboard.jsx');
    const practiceSource = readText('hi', '../../../pages/Practice.jsx');
    const pluginLoaderSource = readText('hi', '../../core/PluginLoader.jsx');
    const indexSource = readText('hi', 'index.jsx');
    const keyboardSource = readText('hi', 'keyboardLayout.jsx');
    const packOwnsKeyboard =
      !/[\u0900-\u097f]/u.test(sharedKeyboard) &&
      !/["']hi["']/.test(qwertyKeyboard) &&
      /getKeyboardLayout/.test(indexSource) &&
      /[\u0900-\u097f]/u.test(keyboardSource);
    const packOwnsTargetValidation =
      typeof pack?.isTargetCompatible === 'function' &&
      pack.isTargetCompatible('नमस्ते') === true &&
      pack.isTargetCompatible('Bienvenido') === false &&
      !/[\u0900-\u097f]/u.test(practiceSource) &&
      !/\bhi\s*:/.test(practiceSource);
    const obsoleteTruthFiles = ['cmudict.jsx'].filter((relativePath) =>
      exists('hi', relativePath)
    );
    const eagerHindiOwners = listFilesRecursive(path.join(PROJECT_ROOT, 'src'))
      .filter((filePath) => /\.(?:js|jsx|ts|tsx)$/.test(filePath))
      .filter((filePath) =>
        /(?:from\s+|import\()["']@\/components\/languagepacks\/hi\//.test(
          fs.readFileSync(filePath, 'utf8')
        )
      )
      .map((filePath) => path.relative(PROJECT_ROOT, filePath).replace(/\\/g, '/'));
    const lazyLoaderOnly =
      pluginLoaderSource.includes(
        "hi: () => import('@/components/languagepacks/hi/index')"
      ) &&
      sameArray(eagerHindiOwners, ['src/components/core/PluginLoader.jsx']);
    const otherPackBleed = ['ar', 'zh', 'ja', 'en_us', 'es']
      .flatMap((packId) => listFilesRecursive(packPath(packId, '')))
      .filter((filePath) => /hindiReadingEngine|hindiSchwaModel|languagepacks[\\/]hi/i.test(fs.readFileSync(filePath, 'utf8')));

    if (
      packOwnsKeyboard &&
      packOwnsTargetValidation &&
      obsoleteTruthFiles.length === 0 &&
      lazyLoaderOnly &&
      otherPackBleed.length === 0
    ) {
      pass(
        report,
        'HI_PACK_ISOLATION',
        'Hindi reading, schwa, guided-sound, keyboard, target validation, and navigation behavior stays inside the lazy Hindi pack.'
      );
    } else {
      fail(report, 'HI_PACK_ISOLATION', 'Hindi behavior escaped its pack boundary.', {
        packOwnsKeyboard,
        packOwnsTargetValidation,
        obsoleteTruthFiles,
        eagerHindiOwners,
        lazyLoaderOnly,
        otherPackBleed,
      });
    }
  } catch (error) {
    fail(report, 'HI_RUNTIME_CERTIFICATION', 'Hindi runtime certification could not complete.', error.message);
  }
}

function auditArabicInvariants(report, resolver) {
  if (!resolver) return;

  const contrastPairs = [
    ['عَلِمَ', 'عِلْم', 'short-vowel contrast'],
    ['كَتَبَ', 'كُتُب', 'short-vowel contrast'],
    ['حَرّ', 'حر', 'shadda/gemination'],
    ['أكل', 'اكل', 'hamza'],
  ];
  const collapsed = contrastPairs
    .filter(([left, right]) => sameArray(sequenceFor(resolver, left), sequenceFor(resolver, right)))
    .map(([left, right, reason]) => ({ left, right, reason }));

  if (collapsed.length) {
    fail(report, 'AR_CONTRAST_PRESERVATION', 'Distinct Arabic pronunciations collapse to identical phoneme truth.', collapsed);
  } else {
    pass(report, 'AR_CONTRAST_PRESERVATION', 'Arabic vowel, shadda, and hamza contrasts remain distinct.');
  }

  // The certified catalog intentionally resolves علم as عِلْم. Use a genuine
  // unlisted homograph to prove arbitrary unvowelled input still stays honest.
  const ambiguous = resolver.resolveUntimed('ملك');
  const ambiguitySignaled =
    ambiguous?.ambiguous === true ||
    ambiguous?.reviewRequired === true ||
    ambiguous?.status === 'ambiguous' ||
    ambiguous?.validation?.reason === 'ambiguous';
  if (ambiguitySignaled) {
    pass(report, 'AR_UNVOWELLED_AMBIGUITY', 'Unvowelled arbitrary input is explicitly marked ambiguous.');
  } else {
    fail(report, 'AR_UNVOWELLED_AMBIGUITY', 'Unvowelled arbitrary input receives invented certainty instead of an ambiguity signal.');
  }

  const sunSequence = sequenceFor(resolver, 'الشمس');
  const firstSh = sunSequence.indexOf('C:ش');
  const doubledWithoutVowel = firstSh >= 0 && sunSequence[firstSh + 1] === 'C:ش';
  if (doubledWithoutVowel) {
    pass(report, 'AR_SUN_LETTER_ASSIMILATION', 'Sun-letter assimilation preserves consonant doubling without an invented vowel.');
  } else {
    fail(report, 'AR_SUN_LETTER_ASSIMILATION', 'Sun-letter assimilation does not preserve the doubled consonant correctly.', sunSequence);
  }

  const wawSequence = sequenceFor(resolver, 'وَعَدَ');
  const yaSequence = sequenceFor(resolver, 'يَد');
  const glidesAreContextual = wawSequence[0] !== 'V:و' && yaSequence[0] !== 'V:ي';
  if (glidesAreContextual) {
    pass(report, 'AR_GLIDE_CONTEXT', 'Waw and ya are distinguished contextually from long vowels.');
  } else {
    fail(report, 'AR_GLIDE_CONTEXT', 'Waw or ya is always treated as a long vowel, even in consonant position.', {
      wawSequence,
      yaSequence,
    });
  }

  const taMarbuta = resolver.resolveUntimed('مدرسة');
  if (String(taMarbuta?.normalizedText ?? '').includes('ة')) {
    pass(report, 'AR_TA_MARBUTA', 'Ta marbuta remains available for context-sensitive pronunciation.');
  } else {
    fail(report, 'AR_TA_MARBUTA', 'Ta marbuta is irreversibly converted before context-sensitive pronunciation.', {
      normalizedText: taMarbuta?.normalizedText,
    });
  }
}

async function auditPack(packId) {
  const report = createReport(packId);
  await auditStructure(packId, report);
  await auditManifest(packId, report);
  await auditHelperEngine(packId, report);
  await auditLibrary(packId, report);
  const resolver = await auditResolver(packId, report);
  await auditGuidedSound(packId, report);
  auditTtsPayload(packId, report);
  if (packId === 'en_us') {
    await auditEnglishRuntime(report);
  }
  if (packId === 'es') {
    await auditSpanishRuntime(report);
  }
  if (packId === 'ar') {
    await auditArabicPlaybackTruth(report);
    await auditArabicDetectorCanonicalization(report);
    await auditArabicIsolation(report);
    auditArabicInvariants(report, resolver);
  }
  if (packId === 'zh') {
    await auditMandarinRuntime(report);
  }
  if (packId === 'ja') {
    await auditJapaneseRuntime(report);
  }
  if (packId === 'hi') {
    await auditHindiRuntime(report);
  }

  const counts = report.checks.reduce(
    (totals, check) => {
      totals[check.status] += 1;
      return totals;
    },
    { pass: 0, warning: 0, error: 0 }
  );
  report.summary = counts;
  report.valid = counts.error === 0;
  return report;
}

function formatDetails(details) {
  if (details === undefined) return '';
  return `\n      ${JSON.stringify(details)}`;
}

function printTextReport(reports, verbose) {
  console.log('SoundMirror language-pack contract auditor');
  console.log('===========================================');

  for (const report of reports) {
    const state = report.valid ? 'PASS' : 'FAIL';
    console.log(
      `\n${state} ${report.packId} — ${report.label} ` +
        `(${report.summary.pass} passed, ${report.summary.warning} warnings, ${report.summary.error} errors)`
    );

    for (const check of report.checks) {
      if (!verbose && check.status === 'pass') continue;
      const symbol = check.status === 'pass' ? '✓' : check.status === 'warning' ? '!' : '✗';
      console.log(`  ${symbol} [${check.code}] ${check.message}${formatDetails(check.details)}`);
    }
  }

  const totalErrors = reports.reduce((sum, report) => sum + report.summary.error, 0);
  const totalWarnings = reports.reduce((sum, report) => sum + report.summary.warning, 0);
  console.log(`\nResult: ${reports.length} pack(s), ${totalErrors} error(s), ${totalWarnings} warning(s).`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const reports = [];

  for (const packId of args.packs) {
    reports.push(await auditPack(packId));
  }

  if (args.json) {
    console.log(JSON.stringify({ reports }, null, 2));
  } else {
    printTextReport(reports, args.verbose);
  }

  if (reports.some((report) => !report.valid)) process.exitCode = 1;
}

main().catch((error) => {
  console.error(`Language-pack audit failed to start: ${error.stack || error.message}`);
  process.exitCode = 2;
});
