// Viseme Sprite Catalogue System
// 
// This system catalogues unique mouth position frames and allows
// animations to reference them by ID, eliminating redundancy.
// Instead of storing 10 frames per phoneme, we identify unique
// frames across all phonemes and store each once.

import { VISEME_URLS } from './visemeUrls';

/**
 * Build a catalogue of unique frames across all visemes
 * Returns: { catalogue: [{ id, url, description }], phonemeMap: { phoneme: [frameIds] } }
 */
export function buildSpriteCatalogue() {
  const urlToId = new Map(); // Track unique URLs
  const catalogue = []; // Array of unique frames
  const phonemeMap = {}; // Map phonemes to their frame IDs
  
  let nextId = 1;
  
  // Process each phoneme's frames
  for (const [phoneme, phonemeData] of Object.entries(VISEME_URLS)) {
    phonemeMap[phoneme] = [];
    
    // Extract front view frames
    const urls = Array.isArray(phonemeData?.front) ? phonemeData.front : [];
    
    urls.forEach((url, frameIndex) => {
      // Check if this URL already exists in catalogue
      if (urlToId.has(url)) {
        // Reuse existing frame ID
        const existingId = urlToId.get(url);
        phonemeMap[phoneme].push(existingId);
      } else {
        // New unique frame - add to catalogue
        const frameId = `frame_${nextId}`;
        nextId++;
        
        catalogue.push({
          id: frameId,
          url: url,
          description: `${phoneme}_${frameIndex}`,
          usedBy: [phoneme], // Track which phonemes use this frame
        });
        
        urlToId.set(url, frameId);
        phonemeMap[phoneme].push(frameId);
      }
    });
  }
  
  // Update usedBy tracking for shared frames
  for (const [phoneme, frameIds] of Object.entries(phonemeMap)) {
    frameIds.forEach(frameId => {
      const frame = catalogue.find(f => f.id === frameId);
      if (frame && !frame.usedBy.includes(phoneme)) {
        frame.usedBy.push(phoneme);
      }
    });
  }
  
  return {
    catalogue,
    phonemeMap,
    stats: {
      totalFrames: catalogue.length,
      originalFrames: Object.values(VISEME_URLS).reduce((sum, phonemeData) => {
        const frontFrames = Array.isArray(phonemeData?.front) ? phonemeData.front : [];
        return sum + frontFrames.length;
      }, 0),
      savedFrames: Object.values(VISEME_URLS).reduce((sum, phonemeData) => {
        const frontFrames = Array.isArray(phonemeData?.front) ? phonemeData.front : [];
        return sum + frontFrames.length;
      }, 0) - catalogue.length,
    }
  };
}

/**
 * Get a frame URL by ID from the catalogue
 */
export function getFrameById(frameId, catalogue) {
  const frame = catalogue.find(f => f.id === frameId);
  return frame ? frame.url : null;
}

/**
 * Get frame sequence for a phoneme (returns array of frame IDs)
 */
export function getPhonemeFrameSequence(phoneme, phonemeMap) {
  const normalized = String(phoneme || "").trim().toLowerCase();
  
  // Handle special cases
  if (normalized === "ña" || normalized === "ñ") {
    return phonemeMap["ña"] || phonemeMap["ñ"] || [];
  }
  
  // Strip trailing 'a' (ba -> b)
  if (normalized.length === 2 && normalized.endsWith("a") && phonemeMap[normalized[0]]) {
    return phonemeMap[normalized[0]];
  }
  
  return phonemeMap[normalized] || [];
}

/**
 * Preload all frames in the catalogue
 */
export async function preloadCatalogue(catalogue) {
  const promises = catalogue.map(frame => 
    new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ id: frame.id, success: true });
      img.onerror = () => resolve({ id: frame.id, success: false });
      img.src = frame.url;
    })
  );
  
  const results = await Promise.all(promises);
  const failed = results.filter(r => !r.success);
  
  return {
    loaded: results.filter(r => r.success).length,
    failed: failed.length,
    failedIds: failed.map(r => r.id),
  };
}

/**
 * Get statistics about frame reuse
 */
export function getCatalogueStats(catalogue) {
  const sharedFrames = catalogue.filter(f => f.usedBy.length > 1);
  const uniqueFrames = catalogue.filter(f => f.usedBy.length === 1);
  
  return {
    totalUnique: catalogue.length,
    sharedFrames: sharedFrames.length,
    uniqueFrames: uniqueFrames.length,
    mostReused: sharedFrames
      .sort((a, b) => b.usedBy.length - a.usedBy.length)
      .slice(0, 5)
      .map(f => ({
        id: f.id,
        count: f.usedBy.length,
        phonemes: f.usedBy,
      })),
  };
}

// Build the catalogue on module load
const SPRITE_CATALOGUE = buildSpriteCatalogue();

// Export the built catalogue and helper functions
export const { catalogue, phonemeMap, stats } = SPRITE_CATALOGUE;

export default {
  catalogue,
  phonemeMap,
  stats,
  getFrameById,
  getPhonemeFrameSequence,
  preloadCatalogue,
  getCatalogueStats,
};