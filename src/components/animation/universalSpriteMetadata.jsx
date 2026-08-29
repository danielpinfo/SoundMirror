const universalSpriteMetadata = {
  version: "universal-mouth-sprites-v2",
  status: "cdn-sprite-metadata",
  frameCount: 20,

  layout: {
    type: "grid",
    columns: 5,
    rows: 4,
    padding: 0,
    spacing: 0,
    frontFrameSize: { w: 939, h: 793 },
    sideFrameSize: { w: 939, h: 793 },
    frontSheetSize: { w: 4695, h: 3172 },
    sideSheetSize: { w: 4695, h: 3172 },
  },

  sheets: {
    front: {
      assetKey: "front_universal_20",
      url: "https://base44.app/api/apps/697ce1adb374adba38acf28d/files/mp/public/697ce1adb374adba38acf28d/5a8849103_front_universal_20.png",
    },
    side: {
      assetKey: "side_universal_20",
      url: "https://base44.app/api/apps/697ce1adb374adba38acf28d/files/mp/public/697ce1adb374adba38acf28d/9664f8587_side_universal_20.png",
    },
  },

  frameLockRule: "front frame N must always pair with side frame N",

  views: {
    master: "front",
    slaves: ["side"],
    frameLock: {
      mode: "same-index",
      rule: "side frame index must always equal front frame index",
      allowIndependentSideTimeline: false,
      allowSideRemap: false
    }
  },

  phonemeToFrame: {
    neutral: 0,
    sil: 0,
    pause: 0,
    spacer: 0,
    word_gap: 0,
    silence_space: 0,

    a: 1,
    ah: 1,
    uh: 1,

    e: 2,
    eh: 2,
    ih: 2,

    i: 3,
    ee: 3,

    ue: 4,

    o: 5,
    oo: 5,
    ou: 5,
    u: 5,
    w: 5,

    k: 6,
    g: 6,

    t: 7,
    d: 7,

    b: 8,
    p: 8,
    m: 8,

    n: 9,

    ng: 10,
    "ŋ": 10,

    s: 11,
    z: 11,

    sh: 12,
    zh: 12,
    "ʃ": 12,

    th: 13,
    dh: 13,
    "θ": 13,

    f: 14,
    v: 14,

    ch: 15,
    j: 15,
    "tʃ": 15,

    h: 16,

    r: 17,

    l: 18,

    ll: 19,
    y: 19,
    lh: 19,
    ly: 19,
  },

  compoundPhonemes: {
    ks: ["k", "s"],
    pf: ["p", "f"],
    ts: ["t", "s"],
    dz: ["d", "z"],
    sht: ["sh", "t"],
    shp: ["sh", "p"],
  },

  notes: [
    "Runtime sprite sheets are CDN-hosted PNG files.",
    "This metadata contains frame geometry and phoneme-to-frame mapping.",
    "This metadata contains no animation timing.",
    "Word-space visual spacers use frame 00 neutral for additional pause time.",
    "No physical 21st frame is required.",
    "Spacer, word_gap, and silence_space all map to frame 00.",
    "AS timing comes from the ReferencePlaybackPlan built from actual teaching audio duration and stays inside that same duration budget.",
    "AS phoneme sequence truth comes from the active language pack prepareLearningInput / learningInput.expectedPhonemes.",
    "Front is the master view; side is a same-index slave view.",
  ],
};

export default universalSpriteMetadata;