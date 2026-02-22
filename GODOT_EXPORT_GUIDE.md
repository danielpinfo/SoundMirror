# SoundMirror - Godot Export Guide

## Overview
This document contains all the core logic, assets, and algorithms from SoundMirror to help you rebuild it in Godot.

---

## 1. ASSET INVENTORY

### Mouth Animation Sprites (40 total)
Location: `/frontend/public/assets/heads/`

#### Front View (20 frames)
```
front/front_00_at_rest.png    - Neutral/rest position
front/front_01_a_u.png        - Open vowels (a, u, ah)
front/front_02_e.png          - E sound
front/front_03_ee_z_x.png     - EE, Z, X sounds
front/front_04_ue.png         - German ü sound
front/front_05_oo_o_ou_w.png  - Rounded vowels (oo, o, ou, w)
front/front_06_c_k_q_g.png    - Back consonants
front/front_07_t_tsk_d_j.png  - Alveolar consonants
front/front_08_b_p_m.png      - Bilabial consonants
front/front_09_n.png          - N sound
front/front_10_ng.png         - NG sound
front/front_11_s.png          - S sound
front/front_12_sh.png         - SH sound
front/front_13_th.png         - TH sound
front/front_14_f_v.png        - Labiodental (f, v)
front/front_15_ch.png         - CH sound
front/front_16_h.png          - H sound
front/front_17_r.png          - R sound
front/front_18_L.png          - L sound
front/front_19_LL_y.png       - LL, Y sounds
```

#### Side View (20 frames) - Same naming convention
```
side/side_00_at_rest.png through side/side_19_LL_y.png
```

### Audio Files
Location: `/frontend/public/assets/audio/`
Format: `{lang_code}-{phoneme}.mp3`
Examples: `en-ah.mp3`, `es-ka.mp3`, `fr-oh.mp3`

### Logo
Location: `/frontend/public/assets/LOGO.png`

---

## 2. PHONEME TO FRAME MAPPING (Core Logic)

This is the heart of the animation system. Use this dictionary in GDScript:

```gdscript
# GDScript Dictionary
var PHONEME_FRAME_MAP = {
    # Vowels
    "a": 1, "ah": 1,                        # frame 1: open vowel
    "e": 2, "eh": 2,                        # frame 2: e
    "ee": 3, "i": 3,                        # frame 3: ee/i
    "ü": 4, "ue": 4,                        # frame 4: German ü
    "o": 5, "oo": 5, "ou": 5, "w": 5,       # frame 5: rounded vowels
    "u": 5,                                  # frame 5: u (as in "food")
    "uh": 1,                                 # frame 1: schwa
    
    # Consonants
    "c": 6, "k": 6, "q": 6, "g": 6,         # frame 6: back consonants
    "t": 7, "d": 7, "j": 7,                  # frame 7: alveolar
    "b": 8, "p": 8, "m": 8,                  # frame 8: bilabial
    "z": 3, "x": 3,                          # frame 3: (shares with ee)
    "n": 9,                                  # frame 9: n
    "ng": 10,                                # frame 10: ng
    "s": 11,                                 # frame 11: s
    "sh": 12,                                # frame 12: sh
    "th": 13,                                # frame 13: th
    "f": 14, "v": 14,                        # frame 14: labiodental
    "ch": 15,                                # frame 15: ch
    "h": 16,                                 # frame 16: h
    "r": 17,                                 # frame 17: r
    "l": 18,                                 # frame 18: L
    "ll": 19, "y": 19,                       # frame 19: LL/y
    
    # Rest states
    "": 0, "neutral": 0, "at_rest": 0, "silence": 0, " ": 0, "rest": 0
}
```

---

## 3. VISEME FALLBACK MAPPING

When a phoneme isn't in the main map, fall back to these:

```gdscript
var VISEME_FALLBACK_MAP = {
    # IPA symbols
    "ʃ": "sh", "ʒ": "sh", "θ": "th", "ð": "th",
    "tʃ": "ch", "dʒ": "j", "ŋ": "ng",
    
    # IPA vowels
    "ɪ": "i", "ɛ": "e", "æ": "a", "ə": "uh",
    "ʌ": "uh", "ʊ": "oo", "ɔ": "o", "ɑ": "a",
    
    # Diphthongs
    "eɪ": "e", "aɪ": "a", "ɔɪ": "o", "oʊ": "o", "aʊ": "a",
    
    # Double consonants -> single
    "pp": "p", "bb": "b", "tt": "t", "dd": "d",
    "kk": "k", "gg": "g", "mm": "m", "nn": "n",
    "ss": "s", "ff": "f", "rr": "r", "ll": "l",
    
    # Language-specific
    "ñ": "n", "ç": "s", "ß": "s", "sch": "sh"
}
```

---

## 4. FRAME RESOLUTION FUNCTION

```gdscript
func get_frame_for_phoneme(phoneme: String) -> int:
    var normalized = phoneme.to_lower().strip_edges()
    
    # Direct match
    if PHONEME_FRAME_MAP.has(normalized):
        return PHONEME_FRAME_MAP[normalized]
    
    # Fallback match
    if VISEME_FALLBACK_MAP.has(normalized):
        var fallback = VISEME_FALLBACK_MAP[normalized]
        return get_frame_for_phoneme(fallback)  # Recursive
    
    # Try first character for unknown multi-char
    if normalized.length() > 1:
        var first_char = normalized[0]
        if PHONEME_FRAME_MAP.has(first_char):
            return PHONEME_FRAME_MAP[first_char]
    
    # Default to rest
    return 0
```

---

## 5. AIRFLOW ANIMATION RULES

### Sound Types & Airflow Behavior

```gdscript
enum AirflowType { NONE, ORAL, NASAL, PLOSIVE_RELEASE }

var PHONEME_AIRFLOW = {
    # Oral sounds (air exits mouth)
    "a": AirflowType.ORAL, "e": AirflowType.ORAL, "i": AirflowType.ORAL,
    "o": AirflowType.ORAL, "u": AirflowType.ORAL,
    "s": AirflowType.ORAL, "sh": AirflowType.ORAL, "f": AirflowType.ORAL,
    "v": AirflowType.ORAL, "z": AirflowType.ORAL, "th": AirflowType.ORAL,
    "h": AirflowType.ORAL, "r": AirflowType.ORAL, "l": AirflowType.ORAL,
    "w": AirflowType.ORAL, "y": AirflowType.ORAL, "ch": AirflowType.ORAL,
    "j": AirflowType.ORAL,
    
    # Nasal sounds (air exits nose)
    "m": AirflowType.NASAL, "n": AirflowType.NASAL, "ng": AirflowType.NASAL,
    
    # Plosives (no air during closure, burst on release)
    "b": AirflowType.PLOSIVE_RELEASE,
    "p": AirflowType.PLOSIVE_RELEASE,
    "t": AirflowType.PLOSIVE_RELEASE,
    "d": AirflowType.PLOSIVE_RELEASE,
    "k": AirflowType.PLOSIVE_RELEASE,
    "g": AirflowType.PLOSIVE_RELEASE
}
```

### Idle Breathing Cycle

```gdscript
var breath_cycle_duration = 6.0  # seconds (3s inhale + 3s exhale)

func get_breathing_state(elapsed_time: float) -> String:
    var phase = fmod(elapsed_time, breath_cycle_duration) / breath_cycle_duration
    if phase < 0.5:
        return "inhale"  # First 3 seconds
    else:
        return "exhale"  # Last 3 seconds
```

### Breathing Rules
1. Breathing animation shows through NOSE only (not mouth)
2. Always start with INHALE after speaking completes
3. Inhale: ribbons point INTO the nose (right direction)
4. Exhale: ribbons fan OUT from the nose (left direction)
5. No breathing during active speech animation

---

## 6. ANIMATION TIMING

```gdscript
const FRAME_DURATION_MS = 200  # Milliseconds per phoneme frame
const BREATH_CYCLE_DURATION = 6.0  # Seconds for full inhale+exhale

# For word animation, calculate total duration:
func get_animation_duration(phoneme_count: int) -> float:
    return phoneme_count * (FRAME_DURATION_MS / 1000.0)
```

---

## 7. SUPPORTED LANGUAGES & ALPHABETS

```gdscript
var LANGUAGES = [
    {"code": "english", "name": "English", "dir": "ltr"},
    {"code": "spanish", "name": "Spanish", "dir": "ltr"},
    {"code": "italian", "name": "Italian", "dir": "ltr"},
    {"code": "portuguese", "name": "Portuguese", "dir": "ltr"},
    {"code": "german", "name": "German", "dir": "ltr"},
    {"code": "french", "name": "French", "dir": "ltr"},
    {"code": "japanese", "name": "Japanese", "dir": "ltr"},
    {"code": "chinese", "name": "Chinese", "dir": "ltr"},
    {"code": "hindi", "name": "Hindi", "dir": "ltr"},
    {"code": "arabic", "name": "Arabic", "dir": "rtl"}
]

var ALPHABETS = {
    "english": ["A","B","C","D","E","F","G","H","I","J","K","L","M",
                "N","O","P","Q","R","S","T","U","V","W","X","Y","Z",
                "CH","SH","TH"],
    "spanish": ["A","B","C","D","E","F","G","H","I","J","K","L","M",
                "N","Ñ","O","P","Q","R","S","T","U","V","W","X","Y","Z",
                "CH","LL","RR"],
    # ... (see constants.js for full list)
}
```

---

## 8. PRACTICE WORDS (Sample Data)

```gdscript
var PRACTICE_WORDS = {
    "english": ["Hello", "Yes", "No", "Please", "Water", "Food", "Good", "Help"],
    "spanish": ["Hola", "Sí", "No", "Por favor", "Agua", "Comida", "Bueno", "Ayuda"],
    "french": ["Bonjour", "Oui", "Non", "S'il vous plaît", "Eau", "Nourriture", "Bon", "Aide"]
}
```

---

## 9. PHONEME PRACTICE SENTENCES

For specific sound practice:

```gdscript
var PHONEME_SENTENCES = {
    "s": ["Sally sells seashells", "Six slippery snails"],
    "r": ["Red roses are rare", "Robert ran rapidly"],
    "l": ["Little lambs leap lightly", "Lovely lilies bloom"],
    "th": ["The three brothers think", "Through thick and thin"],
    "sh": ["She sells shiny shoes", "Shelly should share"],
    "ch": ["Charlie chose chocolate", "Children cheer cheerfully"]
}
```

---

## 10. GODOT IMPLEMENTATION SUGGESTIONS

### Scene Structure
```
Main
├── UI (Control)
│   ├── WordInput
│   ├── LanguageSelector
│   └── PlayButton
├── AnimationDisplay (Node2D)
│   ├── FrontView (AnimatedSprite2D)
│   ├── SideView (AnimatedSprite2D)
│   └── AirflowOverlay (Node2D) - Custom drawing
├── AudioPlayer (AudioStreamPlayer)
└── RecordingManager (Node) - For mic input
```

### AnimatedSprite2D Setup
1. Create a SpriteFrames resource with 20 frames (0-19)
2. Load front_00 through front_19 as frames
3. Do the same for side view
4. Switch frames programmatically based on phoneme

### Airflow Drawing (Custom _draw)
```gdscript
extends Node2D

func _draw():
    if showing_airflow:
        # Draw ribbons as curved lines with arrowheads
        var ribbon_color = Color(0, 0.82, 1, 0.8)  # Cyan
        for ribbon in ribbons:
            draw_polyline(ribbon.points, ribbon_color, 2.5)
            draw_arrowhead(ribbon.end_point, ribbon.angle)
```

### Audio Recording in Godot
```gdscript
var effect: AudioEffectRecord
var recording: AudioStreamWAV

func _ready():
    var idx = AudioServer.get_bus_index("Record")
    effect = AudioServer.get_bus_effect(idx, 0) as AudioEffectRecord

func start_recording():
    effect.set_recording_active(true)

func stop_recording():
    effect.set_recording_active(false)
    recording = effect.get_recording()
```

---

## 11. FILES TO COPY

### Essential Assets
```
/frontend/public/assets/heads/front/*.png  (20 files)
/frontend/public/assets/heads/side/*.png   (20 files)
/frontend/public/assets/LOGO.png
/frontend/public/assets/audio/*.mp3        (200+ files, optional)
```

### Reference Code (for logic extraction)
```
/frontend/src/lib/constants.js             - All mappings & data
/frontend/src/lib/phonemeAnalysis.js       - Phoneme parsing logic
/frontend/src/components/AirflowAnimation.jsx - Airflow rendering
/frontend/src/components/DualHeadAnimation.jsx - Animation controller
```

---

## 12. QUICK START CHECKLIST

1. [ ] Export to GitHub (Save to GitHub button)
2. [ ] Clone repo locally
3. [ ] Copy `/frontend/public/assets/heads/` to Godot project
4. [ ] Create SpriteFrames with 20 frames for front and side
5. [ ] Implement PHONEME_FRAME_MAP dictionary
6. [ ] Create phoneme-to-frame lookup function
7. [ ] Build basic UI with word input
8. [ ] Add animation playback system
9. [ ] Implement airflow overlay (optional)
10. [ ] Add audio recording (optional)

---

## Questions?

The original React/Python source code is available in your GitHub export. Key files:
- `constants.js` - All data and mappings
- `AirflowAnimation.jsx` - Complex airflow rendering logic
- `phonemeAnalysis.js` - How words are converted to phoneme sequences
