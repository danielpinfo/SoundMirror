import React, { createContext, useContext } from 'react';

/**
 * SpritePreloadContext
 *
 * DEPRECATED LEGACY GLOBAL SPRITE CACHE
 *
 * SoundMirror now expects sprite ownership to live in the active language pack.
 * Shared global sprite preloading is a drift source and must not drive live
 * pack animation behavior.
 *
 * This context remains only as a compatibility stub so existing imports do not
 * break while the app finishes moving to pack-owned sprite sources.
 *
 * DO NOT preload sprites here.
 * DO NOT fetch AnimationAsset here.
 * DO NOT use this as the live source of front/side frames.
 */

const SpritePreloadContext = createContext({
  front: null,
  side: null,
  ready: false,
});

export function useSpriteCache() {
  return useContext(SpritePreloadContext);
}

export function SpritePreloadProvider({ children }) {
  return (
    <SpritePreloadContext.Provider
      value={{
        front: null,
        side: null,
        ready: false,
      }}
    >
      {children}
    </SpritePreloadContext.Provider>
  );
}