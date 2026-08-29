
/**
 * Speed Control Utility - No UI rendering
 * Provides speed presets and helper functions for speed cycling
 */

export const SPEED_PRESETS = {
  slow: { label: 'Slow', frameRepeat: 3, frameDelayMultiplier: 1.2 },
  regular: { label: 'Regular', frameRepeat: 1, frameDelayMultiplier: 1.0 },
  fast: { label: 'Fast', frameRepeat: 0.7, frameDelayMultiplier: 0.85 },
  veryFast: { label: 'Very Fast', frameRepeat: 0.5, frameDelayMultiplier: 0.7 },
};

export const SPEED_ORDER = ['slow', 'regular', 'fast', 'veryFast'];

export const getNextSpeed = (currentSpeed) => {
  const currentIndex = SPEED_ORDER.indexOf(currentSpeed);
  const nextIndex = (currentIndex + 1) % SPEED_ORDER.length;
  return SPEED_ORDER[nextIndex];
};

export const getSpeedButtonColors = (speed) => {
  const colors = {
    slow: 'bg-blue-950 border-yellow-500 border-2 hover:bg-blue-950',
    regular: 'bg-blue-700 border-silver/30 border hover:bg-blue-700',
    fast: 'bg-cyan-500 border-yellow-500 border-2 text-slate-900 hover:bg-cyan-500',
    veryFast: 'bg-yellow-400 border-blue-600 border-2 text-blue-800 font-semibold hover:bg-yellow-400',
  };
  return colors[speed] || colors.slow;
};

export default function SpeedControl() {
  return null;
}