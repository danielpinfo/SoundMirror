/**
 * ArticulationController
 *
 * DEPRECATED SHARED CONTROLLER
 *
 * This file previously generated animation timelines from frame sequences.
 * SoundMirror now uses pack-authored timelines exclusively.
 *
 * This controller remains only as a compatibility stub to prevent
 * legacy imports from breaking.
 *
 * DO NOT use this file for animation timing.
 * DO NOT add timing logic here.
 * DO NOT modify animation behavior here.
 */

export const FRAME_DEFS = {};
export const FRAME_COUNT = 0;
export const NEUTRAL_FRAME = 0;

export function validateSequence() {
  return { valid: true, error: null };
}

export function buildTimeline() {
  console.warn('[ArticulationController] Deprecated — pack-owned timeline required');
  return [];
}

export const TEST_SEQUENCE = [];