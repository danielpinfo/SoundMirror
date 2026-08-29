export default {
  "description": "SoundMirror Articulation Frame Definition Table — Authoritative Reference",
  "notes": [
    "Frame indices are shared by both front_XX.png and side_XX.png sprite sets.",
    "Front frames are master; side frames are slaves and always follow the same index.",
    "Frame numbers 00–19 are permanent and must not be reordered.",
    "Language packs decide how letters and letter combinations resolve to these universal physical frames.",
    "Spacer and pause segments use frame 00 neutral."
  ],
  "frames": [
    {
      "index": 0,
      "label": "neutral",
      "description": "Neutral mouth / pause / spacer",
      "phonemes": ["neutral", "sil", "pause", "spacer", "word_gap", "silence_space"]
    },
    {
      "index": 1,
      "label": "open_vowel",
      "description": "A / ah / uh",
      "phonemes": ["a", "ah", "uh"]
    },
    {
      "index": 2,
      "label": "mid_vowel",
      "description": "E / eh / ih",
      "phonemes": ["e", "eh", "ih"]
    },
    {
      "index": 3,
      "label": "front_vowel",
      "description": "EE / i",
      "phonemes": ["ee", "i"]
    },
    {
      "index": 4,
      "label": "rounded_vowel_ue",
      "description": "UE",
      "phonemes": ["ue"]
    },
    {
      "index": 5,
      "label": "rounded_vowel_oo",
      "description": "OO / o / ou / u / w",
      "phonemes": ["oo", "o", "ou", "u", "w"]
    },
    {
      "index": 6,
      "label": "velar_stop",
      "description": "K / g",
      "phonemes": ["k", "g"]
    },
    {
      "index": 7,
      "label": "alveolar_stop",
      "description": "T / d",
      "phonemes": ["t", "d"]
    },
    {
      "index": 8,
      "label": "bilabial",
      "description": "B / p / m",
      "phonemes": ["b", "p", "m"]
    },
    {
      "index": 9,
      "label": "alveolar_nasal",
      "description": "N",
      "phonemes": ["n"]
    },
    {
      "index": 10,
      "label": "velar_nasal",
      "description": "NG",
      "phonemes": ["ng"]
    },
    {
      "index": 11,
      "label": "alveolar_fricative",
      "description": "S / z",
      "phonemes": ["s", "z"]
    },
    {
      "index": 12,
      "label": "postalveolar_fricative",
      "description": "SH / zh",
      "phonemes": ["sh", "zh"]
    },
    {
      "index": 13,
      "label": "dental_fricative",
      "description": "TH / dh",
      "phonemes": ["th", "dh"]
    },
    {
      "index": 14,
      "label": "labiodental_fricative",
      "description": "F / v",
      "phonemes": ["f", "v"]
    },
    {
      "index": 15,
      "label": "affricate",
      "description": "CH / j",
      "phonemes": ["ch", "j"]
    },
    {
      "index": 16,
      "label": "glottal",
      "description": "H",
      "phonemes": ["h"]
    },
    {
      "index": 17,
      "label": "rhotic",
      "description": "R",
      "phonemes": ["r"]
    },
    {
      "index": 18,
      "label": "lateral",
      "description": "L",
      "phonemes": ["l"]
    },
    {
      "index": 19,
      "label": "glide",
      "description": "LL / y / lh / ly",
      "phonemes": ["ll", "y", "lh", "ly"]
    }
  ]
};