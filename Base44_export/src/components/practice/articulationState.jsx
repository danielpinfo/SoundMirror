// /src/components/practice/articulationState.js

// High-level articulator state that can drive a 3D rig.
export function createArticulationState(overrides = {}) {
  return {
    // 0 = jaws closed, 1 = fully open (like /AA/)
    jawOpen: 0,

    // 0 = neutral, 1 = super rounded (like /U/)
    lipRound: 0,

    // 0 = neutral, 1 = very spread (like /IY/)
    lipSpread: 0,

    // Tongue tip height: 0 = low, 1 = high toward palate/teeth
    tongueTipRaise: 0.5,

    // Tongue tip advancement: 0 = back, 1 = forward toward teeth
    tongueTipAdvance: 0.5,

    // Tongue body height: 0 = low, 1 = high (for /IY/, etc.)
    tongueBodyRaise: 0.5,

    // Tongue body backness: 0 = front, 1 = back (for /U/, /K/, /G/)
    tongueBodyBackness: 0.5,

    // Nasal port: 0 = closed (oral only), 1 = fully open (nasals)
    velumOpen: 0,

    ...overrides,
  };
}

/**
 * Map the legacy PinkTrombone-style ARTIC_STATES
 * (tongue[8], lips, velum, jawOpen) into this higher level state.
 *
 * legacy = { tongue: [...8 numbers...], lips, velum, jawOpen }
 */
export function mapLegacyStateToArticulation(legacy) {
  if (!legacy) return createArticulationState();

  const tongue = legacy.tongue || [0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4];

  // In the legacy model, index 0 = back, 7 = front.
  const back = tongue[0];
  const midBack = tongue[2];
  const midFront = tongue[4];
  const tip = tongue[7];

  const clamp01 = (v) => Math.max(0, Math.min(1, v));

  const jawOpen = clamp01(legacy.jawOpen ?? 0.2);
  const lips = clamp01(legacy.lips ?? 0.3);
  const velum = clamp01(legacy.velum ?? 1.0);

  return createArticulationState({
    jawOpen,

    // If lips is high = rounded, also reduce spread.
    lipRound: lips,
    lipSpread: 1 - lips,

    tongueTipRaise: clamp01(tip),
    tongueTipAdvance: clamp01(0.8 * tip + 0.2 * midFront),

    tongueBodyRaise: clamp01((midBack + midFront) / 2),
    tongueBodyBackness: clamp01((back + midBack) / 2),

    // In the legacy states: velum=1 oral, velum=0 nasal.
    // Here we want velumOpen = "nasal port open".
    velumOpen: 1 - velum,
  });
}