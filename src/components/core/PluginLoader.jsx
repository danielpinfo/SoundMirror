/**
 * PluginLoader
 */

import { createSpeechPackContract } from '@/lib/speechPackContract';

const PACK_LOADERS = {
  en_us: () => import('@/components/languagepacks/en_us/index'),
  es: () => import('@/components/languagepacks/es/index'),
  pt: () => import('@/components/languagepacks/pt/index'),
  it: () => import('@/components/languagepacks/it/index'),
  fr: () => import('@/components/languagepacks/fr/index'),
  de: () => import('@/components/languagepacks/de/index'),
  ja: () => import('@/components/languagepacks/ja/index'),
  zh: () => import('@/components/languagepacks/zh/index'),
  ar: () => import('@/components/languagepacks/ar/index'),
  hi: () => import('@/components/languagepacks/hi/index'),
};

const PACK_CACHE = new Map();

let _activePack = null;
let _config = null;
let _voice = null;

function _shutdownCurrent() {
  if (_config?.provider?.shutdown) {
    try {
      _config.provider.shutdown();
    } catch {}
  }
  _config = null;
}

function _getPackProviderOptions(pack) {
  if (typeof pack.getProviderOptions === 'function') {
    const options = pack.getProviderOptions();
    if (options && typeof options === 'object') {
      return options;
    }
  }

  const locale =
    typeof pack.getLocale === 'function'
      ? pack.getLocale()
      : pack?.manifest?.locale;

  const language =
    typeof locale === 'string' && locale.includes('-')
      ? locale.split('-')[0].toLowerCase()
      : typeof locale === 'string'
      ? locale.toLowerCase()
      : 'en';

  return {
    voice:
      typeof pack.getDefaultVoice === 'function'
        ? pack.getDefaultVoice()
        : _voice,
    speechRate:
      typeof pack.getPlaybackRate === 'function'
        ? pack.getPlaybackRate()
        : 0.4,
    language,
    locale,
  };
}

export function registerPack(packId, packDef) {
  PACK_LOADERS[packId] = typeof packDef === 'function'
    ? packDef
    : async () => packDef;
  PACK_CACHE.delete(packId);
}

export function unregisterPack(packId) {
  if (packId === _activePack) {
    throw new Error(`Cannot unregister active pack "${packId}"`);
  }
  delete PACK_LOADERS[packId];
  PACK_CACHE.delete(packId);
}

async function loadPack(packId) {
  if (PACK_CACHE.has(packId)) {
    return PACK_CACHE.get(packId);
  }

  const loader = PACK_LOADERS[packId];
  if (!loader) {
    throw new Error(`Language pack is not installed: "${packId}"`);
  }

  const loadedModule = await loader();
  const pack = loadedModule?.default ?? loadedModule;

  if (!pack || typeof pack !== 'object') {
    throw new Error(`Language pack did not export a valid contract: "${packId}"`);
  }

  PACK_CACHE.set(packId, pack);
  return pack;
}

export async function setActivePack(packId, voice = null) {
  if (!PACK_LOADERS[packId]) {
    packId = 'en_us';
  }

  if (voice) {
    _voice = voice;
  }

  if (packId === _activePack && _config) {
    return _config;
  }

  _shutdownCurrent();
  _activePack = packId;
  return initialize();
}

export async function initialize() {
  if (_config) return _config;
  if (!_activePack) return null;

  const requestedPackId = _activePack;
  const pack = await loadPack(requestedPackId);

  if (_activePack !== requestedPackId) {
    return initialize();
  }

  // Packs with local linguistic engines may prepare them before the shared
  // shell asks for helper, animation, grading, or guided-sound truth.
  if (typeof pack.initialize === 'function') {
    await pack.initialize();
  }

  const providerOptions = _getPackProviderOptions(pack);

  const provider = new pack.Provider(
    pack.PhonemeResolver ?? null,
    providerOptions
  );

  const speechContract = createSpeechPackContract({
    packId: _activePack,
    pack,
    provider,
  });

  const validation = speechContract.validatePack();

  if (!validation.valid) {
    throw new Error(
      `Pack contract invalid for "${_activePack}": ${validation.errors.join(
        ', '
      )}`
    );
  }

  const livePack = pack;

  livePack.provider = provider;
  livePack.packId = _activePack;
  livePack.language = livePack.manifest?.language ?? _activePack;
  livePack.locale = livePack.manifest?.locale ?? null;
  livePack.phonemeResolver = livePack.PhonemeResolver ?? null;

  Object.assign(livePack, speechContract);

  _config = livePack;

  return _config;
}

export function getConfig() {
  return _config;
}

export function isLanguageLoaded() {
  return _config !== null;
}

export function activePackId() {
  return _activePack;
}

export function getInstalledPacks() {
  return Object.keys(PACK_LOADERS);
}

export function getActivePack() {
  return _activePack;
}
