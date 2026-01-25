# SoundMirror

**Native Offline-First Articulation Visualization System**

See the sound. Master the speech.

---

## Overview

SoundMirror is a cross-platform articulation visualization tool designed for:
- **Deaf individuals** - Visual speech learning without audio dependency
- **Mute individuals** - Understanding mouth movements for communication
- **Language learners** - Precise pronunciation guidance
- **Speech therapy patients** - Articulation practice and feedback
- **ESL students** - Native-level pronunciation training

### Core Principle

SoundMirror is **NOT a talking head**. It is a **phoneme-driven anatomical teaching system** that:
1. Maps text → IPA phonemes → sprite frame sequences
2. Synchronizes dual-view sprites (front lip/mouth + side tongue/jaw) with TTS playback
3. Uses **Frame #5** of each 10-frame sequence as the articulation **apex** (teaching moment)
4. Runs **100% offline** after initial install

---

## Architecture

```
soundmirror/
├── core/                          # Shared TypeScript logic
│   ├── phoneme-engine/            # Text → phoneme → timeline
│   │   ├── phoneme-map.ts         # IPA ↔ frame mapping
│   │   └── timeline-builder.ts    # Timing calculations
│   └── sprite-scheduler/          # Frame synchronization
│       └── sprite-scheduler.ts    # Animation timing engine
│
├── apps/
│   └── desktop/                   # Tauri 2.0 (Windows/macOS)
│       ├── src/                   # React UI
│       │   ├── components/
│       │   │   ├── practice/      # DualHeadAnimator, Timeline, Controls
│       │   │   ├── ui/            # WordInput, LanguageSelector
│       │   │   └── layout/        # Navigation layout
│       │   └── pages/             # Home, Practice, Letters, Progress, Report
│       └── src-tauri/             # Rust backend
│           └── src/main.rs        # Native TTS bridges
│
├── assets/
│   ├── sprites/
│   │   ├── front/                 # 250 front-view PNGs
│   │   └── side/                  # 250 side-view PNGs
│   └── phoneme_tables/            # IPA mapping JSON files
│
└── tools/
    └── manifest-generator/        # Auto-index PNG assets
```

---

## Pages

| Page | Description |
|------|-------------|
| **Home** | Word input, language selector, quick practice |
| **Practice** | Dual-head animator with TTS and recording |
| **Letter Practice** | Individual phoneme articulation learning |
| **Progress** | Combined history + analytics (merged) |
| **Bug Reporter** | Offline-first issue reporting with dropdowns |

---

## Technology Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Desktop Shell | **Tauri 2.0** | Lightweight (~10MB), native performance |
| UI Framework | **React + Tailwind** | Modern, accessible, dark theme |
| Core Logic | **TypeScript** | Portable, readable, typed |
| Timing Engine | **Rust** | Sub-millisecond precision |
| TTS | **Native OS** | Windows SAPI, macOS NSSpeech |
| Storage | **SQLite/JSON** | Offline-first, no cloud dependency |

---

## Animation System

### Sprite Frames
- **250 total frames** per view (front + side)
- Frame `000` = neutral/closed mouth
- **10 frames per phoneme**
- **Frame #5 = apex** (peak articulation, the teaching moment)

### Frame Flow
```
Frames 1-4:  Ease-in to target mouth shape
Frame 5:     APEX - Hold position (visual highlight)
Frames 6-10: Ease-out transition to next phoneme
```

### Naming Convention
```
sprites/front/frame_000.png → frame_249.png
sprites/side/frame_000.png → frame_249.png
```

---

## Phoneme Mapping (from PDF)

| Phoneme | IPA | Frame Range | Example |
|---------|-----|-------------|---------|
| Neutral | _ | 0 | silence |
| /a/ | P001 | 1-10 | father |
| /i/ | P002 | 11-20 | see |
| /u/ | P003 | 21-30 | food |
| /ɛ/ | P004 | 31-40 | bed |
| /o/ | P005 | 41-50 | go |
| /p/ | P007 | 61-70 | pat |
| /t/ | P008 | 71-80 | top |
| /ʃ/ | P016 | 151-160 | ship |
| /θ/ | P017 | 161-170 | think |
| ... | ... | ... | ... |

Full mapping in `assets/phoneme_tables/ipa_master.json`

---

## Development

### Prerequisites
- **Node.js 18+**
- **Rust 1.70+** (for Tauri)
- **Tauri CLI**: `npm install -g @tauri-apps/cli`

### Desktop App
```bash
cd soundmirror/apps/desktop

# Install dependencies
npm install

# Development mode
npm run tauri dev

# Build for production
npm run tauri build
```

### Generate Sprite Manifests
```bash
cd soundmirror/tools/manifest-generator
node generate-manifest.js --input ../../assets/sprites --output ../../assets/sprite_manifests
```

---

## Asset Management

**All assets stored in GitHub** - No opaque platform storage.

```
soundmirror-assets/
├── sprites/
│   ├── front/
│   │   ├── en/
│   │   ├── es/
│   │   ├── ar/
│   │   └── universal/
│   ├── side/
│       └── ...
├── phoneme_tables/
├── sprite_manifests/
└── airflow_overlays/
```

---

## Roadmap

### Phase 1: Desktop MVP ✓
- [x] Tauri project structure
- [x] DualHeadAnimator component
- [x] Phoneme timeline engine
- [x] Playback controls with speed adjustment
- [x] All 5 pages implemented
- [ ] Native TTS integration (Windows/macOS)
- [ ] SQLite offline storage

### Phase 2: Android
- [ ] React Native project
- [ ] Android TTS bridge
- [ ] Port sprite renderer

### Phase 3: iOS
- [ ] iOS TTS bridge (AVSpeechSynthesizer)
- [ ] App Store deployment

---

## License

© 2026 SoundMirror. All rights reserved.

---

## Support

For bug reports, use the in-app Bug Reporter (offline-first, syncs when online).
