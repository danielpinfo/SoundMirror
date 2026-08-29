function logPackContractError(packId, message, details = {}) {
  console.error(`[PACK CONTRACT] ${message}`, { packId, ...details });
}

function deriveLanguageCode(pack) {
  const locale = pack?.manifest?.locale || '';
  return locale.split('-')[0]?.toLowerCase() || 'en';
}

function getAirflowEntry(airflowMap, phoneme, frame) {
  if (!airflowMap) return null;

  if (phoneme != null && airflowMap.byPhoneme?.[phoneme]) {
    return airflowMap.byPhoneme[phoneme];
  }

  if (frame != null && airflowMap.byFrame?.[frame]) {
    return airflowMap.byFrame[frame];
  }

  if (airflowMap.byPhoneme?.neutral) {
    return airflowMap.byPhoneme.neutral;
  }

  if (airflowMap.byFrame?.[0]) {
    return airflowMap.byFrame[0];
  }

  return null;
}

function buildFramesFromTimeline(timeline = []) {
  if (!Array.isArray(timeline) || timeline.length === 0) {
    return [0];
  }

  const frames = timeline.map((entry) =>
    Number.isFinite(entry?.frame) ? entry.frame : 0
  );

  if (frames[0] !== 0) {
    return [0, ...frames];
  }

  return frames;
}

export function createSpeechPackContract({ packId, pack, provider }) {
  const languageCode = deriveLanguageCode(pack);
  const resolver = pack?.PhonemeResolver ?? null;
  const articulationMap = pack?.articulationMap ?? null;
  const airflowMap = pack?.airflowMap ?? null;
  const manifest = pack?.manifest ?? null;

  const packPreparePracticeText =
    typeof pack?.preparePracticeText === 'function'
      ? pack.preparePracticeText.bind(pack)
      : null;

  const packResolveUnits =
    typeof pack?.resolveUnits === 'function'
      ? pack.resolveUnits.bind(pack)
      : null;

  const packBuildAnimationTimeline =
    typeof pack?.buildAnimationTimeline === 'function'
      ? pack.buildAnimationTimeline.bind(pack)
      : null;

  const packBuildAirflowTimeline =
    typeof pack?.buildAirflowTimeline === 'function'
      ? pack.buildAirflowTimeline.bind(pack)
      : null;

  const packBuildHelperData =
    typeof pack?.buildHelperData === 'function'
      ? pack.buildHelperData.bind(pack)
      : null;

  const packGetFrontFrameMap =
    typeof pack?.getFrontFrameMap === 'function'
      ? pack.getFrontFrameMap.bind(pack)
      : null;

  const packGetSideFrameMap =
    typeof pack?.getSideFrameMap === 'function'
      ? pack.getSideFrameMap.bind(pack)
      : null;

  const packGetPresetWords =
    typeof pack?.getPresetWords === 'function'
      ? pack.getPresetWords.bind(pack)
      : null;

  const packGetPresetPhrases =
    typeof pack?.getPresetPhrases === 'function'
      ? pack.getPresetPhrases.bind(pack)
      : null;

  const packGetTTSConfig =
    typeof pack?.getTTSConfig === 'function'
      ? pack.getTTSConfig.bind(pack)
      : null;

  const packSynthesize =
    typeof pack?.synthesize === 'function'
      ? pack.synthesize.bind(pack)
      : null;

  const packPreparePlayback =
    typeof pack?.preparePlayback === 'function'
      ? pack.preparePlayback.bind(pack)
      : null;

  const contract = {
    packId,
    languageCode,
    manifest,
    provider,
    articulationMap,
    airflowMap,
    SideAirflow: pack?.SideAirflow ?? null,

    preparePracticeText(text) {
      if (packPreparePracticeText) {
        return packPreparePracticeText(text);
      }

      return String(text || '').trim();
    },

    resolveUnits(text) {
      const prepared = this.preparePracticeText(text);

      if (!prepared) {
        return {
          word: '',
          helperText: '',
          helperChunks: [],
          phonemeTimeline: [],
          pronunciation: '',
          phonemes: [],
          frames: [0],
        };
      }

      if (packResolveUnits) {
        const resolved = packResolveUnits(prepared);

        if (!resolved || typeof resolved !== 'object') {
          logPackContractError(packId, 'invalid pack resolveUnits output', {
            reason: 'pack_resolveUnits_returned_null',
            text: prepared,
          });
          return null;
        }

        if (!Array.isArray(resolved.phonemeTimeline)) {
          logPackContractError(packId, 'invalid pack resolveUnits output', {
            reason: 'pack_resolveUnits_missing_timeline',
            text: prepared,
            resolved,
          });
          return null;
        }

        return {
          ...resolved,
          frames: Array.isArray(resolved.frames)
            ? resolved.frames
            : buildFramesFromTimeline(resolved.phonemeTimeline),
        };
      }

      if (packPreparePlayback) {
        const prep = packPreparePlayback(prepared);

        if (!prep || typeof prep !== 'object') {
          logPackContractError(packId, 'invalid preparePlayback output', {
            reason: 'preparePlayback_returned_null',
            text: prepared,
          });
          return null;
        }

        const phonemeTimeline = Array.isArray(prep.timeline) ? prep.timeline : [];

        return {
          word: prep.ttsText ?? prepared,
          helperText: typeof prep.helperText === 'string' ? prep.helperText : '',
          helperChunks: Array.isArray(prep.helperChunks) ? prep.helperChunks : [],
          phonemeTimeline,
          pronunciation:
            typeof prep.pronunciation === 'string'
              ? prep.pronunciation
              : (typeof prep.helperText === 'string' ? prep.helperText : ''),
          phonemes: phonemeTimeline.map((entry) => entry?.phoneme).filter(Boolean),
          frames: buildFramesFromTimeline(phonemeTimeline),
        };
      }

      if (!resolver || typeof resolver.resolve !== 'function') {
        logPackContractError(packId, 'missing resolver output', {
          reason: 'resolver_missing',
          text: prepared,
        });
        return null;
      }

      const resolved = resolver.resolve(prepared, languageCode);

      if (!resolved || typeof resolved !== 'object') {
        logPackContractError(packId, 'missing resolver output', {
          reason: 'resolver_returned_null',
          text: prepared,
        });
        return null;
      }

      if (!Array.isArray(resolved.phonemeTimeline)) {
        logPackContractError(packId, 'invalid resolver output', {
          reason: 'resolver_shape_invalid',
          text: prepared,
          resolved,
        });
        return null;
      }

      return {
        ...resolved,
        frames: Array.isArray(resolved.frames)
          ? resolved.frames
          : buildFramesFromTimeline(resolved.phonemeTimeline),
      };
    },

    buildAnimationTimeline(resolvedUnits) {
      if (packBuildAnimationTimeline) {
        return packBuildAnimationTimeline(resolvedUnits);
      }

      const timeline = resolvedUnits?.phonemeTimeline ?? null;

      if (!Array.isArray(timeline) || timeline.length === 0) {
        logPackContractError(packId, 'missing animation timeline', {
          reason: 'phonemeTimeline_missing',
        });
        return null;
      }

      return timeline;
    },

    getFrontFrameMap() {
      if (packGetFrontFrameMap) {
        return packGetFrontFrameMap();
      }

      if (!articulationMap) {
        logPackContractError(packId, 'missing front frame map');
        return null;
      }

      return articulationMap;
    },

    getSideFrameMap() {
      if (packGetSideFrameMap) {
        return packGetSideFrameMap();
      }

      if (!articulationMap) {
        logPackContractError(packId, 'missing side frame map');
        return null;
      }

      return articulationMap;
    },

    buildAirflowTimeline(resolvedUnits) {
      if (packBuildAirflowTimeline) {
        return packBuildAirflowTimeline(resolvedUnits);
      }

      if (!airflowMap) {
        logPackContractError(packId, 'missing airflow timeline', {
          reason: 'airflowMap_missing',
        });
        return null;
      }

      const timeline = resolvedUnits?.phonemeTimeline ?? null;

      if (!Array.isArray(timeline) || timeline.length === 0) {
        logPackContractError(packId, 'missing airflow timeline', {
          reason: 'phonemeTimeline_missing',
        });
        return null;
      }

      return timeline.map((entry) => {
        const airflow = getAirflowEntry(
          airflowMap,
          entry?.phoneme ?? null,
          entry?.frame ?? null
        );

        return {
          ...entry,
          airflow: airflow ?? null,
        };
      });
    },

    buildHelperData(resolvedUnits) {
      if (packBuildHelperData) {
        return packBuildHelperData(resolvedUnits);
      }

      const helperText = resolvedUnits?.helperText ?? '';
      const pronunciation = resolvedUnits?.pronunciation ?? helperText;

      if (!helperText && !pronunciation) {
        logPackContractError(packId, 'missing helper data', {
          reason: 'helper_data_missing',
        });
        return null;
      }

      return { helperText, pronunciation };
    },

    getTTSConfig() {
      if (packGetTTSConfig) {
        return packGetTTSConfig();
      }

      return {
        language: languageCode,
        locale: provider?.locale ?? manifest?.locale ?? null,
        voice:
          typeof provider?.getVoice === 'function'
            ? provider.getVoice()
            : provider?.voice ?? null,
        providerName: provider?.name ?? null,
      };
    },

    synthesize(text) {
      const prepared = this.preparePracticeText(text);

      if (packSynthesize) {
        return packSynthesize(prepared);
      }

      if (!provider || typeof provider.synthesize !== 'function') {
        logPackContractError(packId, 'missing TTS config', {
          reason: 'provider_missing',
          text: prepared,
        });
        return Promise.resolve({ audio: null });
      }

      const ttsLanguage =
        provider?.locale ||
        manifest?.locale ||
        languageCode;

      return provider.synthesize(prepared, ttsLanguage);
    },

    getPresetWords(nativeLanguage) {
      if (packGetPresetWords) {
        return packGetPresetWords(nativeLanguage);
      }

      return [];
    },

    getPresetPhrases(nativeLanguage) {
      if (packGetPresetPhrases) {
        return packGetPresetPhrases(nativeLanguage);
      }

      return [];
    },

    validatePack() {
      const errors = [];

      if (!manifest || typeof manifest !== 'object') {
        errors.push('missing manifest');
      }

      const hasPackOwnedResolver =
        packResolveUnits ||
        packPreparePlayback ||
        (resolver && typeof resolver.resolve === 'function');

      if (!hasPackOwnedResolver) {
        errors.push('missing resolver output');
      }

      if (!articulationMap || !Array.isArray(articulationMap.frames)) {
        errors.push('missing front frame map');
      }

      if (!articulationMap || !Array.isArray(articulationMap.frames)) {
        errors.push('missing side frame map');
      }

      if (!airflowMap || (!airflowMap.byPhoneme && !airflowMap.byFrame)) {
        errors.push('missing airflow timeline');
      }

      const hasSynthesize =
        packSynthesize || (provider && typeof provider.synthesize === 'function');

      if (!hasSynthesize) {
        errors.push('missing TTS config');
      }

      errors.forEach((error) => logPackContractError(packId, error));

      return {
        valid: errors.length === 0,
        errors,
      };
    },
  };

  return contract;
}

export default createSpeechPackContract;