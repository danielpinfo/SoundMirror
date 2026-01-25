# SoundMirror - Product Requirements Document

## Project Overview
**Name:** SoundMirror  
**Tagline:** See the sound. Master the speech.  
**Type:** Native offline-first articulation visualization system  
**Target Users:** Deaf individuals, mute individuals, language learners, speech therapy patients, ESL students

## Original Problem Statement
Convert existing Base44 web app into a fully native cross-platform mobile and desktop product with minimal internet dependency. Use OS-native TTS on iOS, Android, Windows, and macOS to drive a deterministic sprite-based phoneme articulation engine.

### Core Principles
1. SoundMirror is NOT a talking head - it's a phoneme-driven anatomical teaching system
2. Dual-view sprites: Front (lip/mouth) + Side (tongue/jaw cross-section)
3. Frame #5 of each 10-frame sequence = articulation apex (teaching moment)
4. Everything runs offline except optional updates
5. All assets stored in GitHub repositories (no opaque platform storage)

## User Personas
1. **Deaf Learners** - Need visual speech learning without audio dependency
2. **Mute Individuals** - Understanding mouth movements for communication
3. **Language Learners** - Precise pronunciation guidance
4. **Speech Therapy Patients** - Articulation practice and feedback
5. **ESL Students** - Native-level pronunciation training

## Core Requirements (Static)

### MVP Features
- [x] Dual-head animator (Front View + Side View synchronized)
- [x] Phoneme timeline with current position indicator
- [x] Playback controls (Play/Pause, Reset, Speed 0.25x-1x, Mute)
- [x] Language selector (10 languages including Arabic)
- [x] Word/phrase input with suggestions
- [x] Letter Practice page for individual phonemes
- [x] Combined History + Progress tracking
- [x] Offline-first Bug Reporter with categorized dropdowns

### Technical Requirements
- Desktop: Tauri 2.0 (Windows/macOS)
- Mobile: React Native (Phase 2)
- Shared Core: TypeScript logic + Rust timing engine
- Storage: SQLite/JSON for offline data
- TTS: Native OS speech APIs

## What's Been Implemented

### Phase 1: Web Preview MVP (Jan 25, 2026) ✓
- Complete React frontend with 5 pages
- DualHeadAnimator component with **REAL PNG SPRITES** (500 frames integrated!)
- Phoneme timeline with clickable badges
- Playback controls with speed adjustment (0.25x-1x)
- **10 Languages** (EN, ES, FR, DE, IT, PT, ZH, JA, AR, HI)
- **10 Suggested words per language** (including compounds like "thank you")
- **Word Practice** (renamed from Practice) with:
  - Side-by-side Model Articulation + Recording panel
  - Dual grading: Visual Score (lip/jaw) + Audio Score (pronunciation)
  - Video recorder placeholder with lip outline overlay
  - Playback functionality
- **Letter Practice** with:
  - Full alphabet grid (26+ letters per language)
  - Vowels highlighted in gold/amber
  - Phoneme pronunciation under each letter (e.g., "ah", "buh")
  - Dual head animator + recording panel per letter
- **Progress page** with:
  - 5 stat cards (Total, Average, Visual, Audio, Streak)
  - Download button for institutional storage
  - Visual + Audio score breakdown per session
- Bug Reporter with 6 categories including Recording issues
- Offline indicator
- Medical dark theme UI (sky/cyan accent on slate-900)

### Core Engine Files Created
- `/app/soundmirror/core/phoneme-engine/phoneme-map.ts`
- `/app/soundmirror/core/phoneme-engine/timeline-builder.ts`
- `/app/soundmirror/core/sprite-scheduler/sprite-scheduler.ts`
- `/app/soundmirror/tools/manifest-generator/generate-manifest.js`

### Tauri Desktop Structure
- `/app/soundmirror/apps/desktop/` - Full Tauri 2.0 project
- `/app/soundmirror/apps/desktop/src-tauri/` - Rust backend with TTS stubs

### Asset Management
- IPA Master phoneme table: `/app/soundmirror/assets/phoneme_tables/ipa_master.json`
- 24 phonemes mapped to frame ranges (250 total frames)

## GitHub Repository Structure
```
SoundMirror/ (GitHub: danielpinfo/SoundMirror)
├── sprites_head_front/     # 250 front-view PNGs
├── sprites_head_side/      # 250 side-view PNGs  
├── Base44_export/          # Legacy reference code
```

## Prioritized Backlog

### P0 (Critical - Next Sprint)
1. Import 500 PNG sprites from GitHub into assets folder
2. Run sprite manifest generator to create frame index
3. Replace placeholder shapes with actual sprite images
4. Implement native TTS bridge (Windows SAPI / macOS NSSpeech)
5. Build Tauri desktop executable

### P1 (High Priority)
6. SQLite integration for offline storage
7. Recording functionality with Web Audio API
8. Phoneme comparison/feedback system
9. User progress persistence
10. Language pack loading system

### P2 (Medium Priority)
11. React Native mobile setup (Android)
12. Android TTS bridge
13. iOS TTS bridge (AVSpeechSynthesizer)
14. Airflow overlay animations
15. Additional language packs

### P3 (Future)
16. Cloud sync for progress (opt-in)
17. Speech-to-text comparison
18. Pronunciation scoring algorithm
19. Gamification elements
20. Community language contributions

## Next Tasks List
1. **Import sprites** - Pull 500 PNGs from GitHub repo
2. **Generate manifests** - Run auto-indexer on sprite folders
3. **Wire up sprites** - Replace placeholder animations with real images
4. **Test TTS** - Validate Web Speech API timing
5. **Build Tauri** - Create first desktop executable

## Technical Architecture

```
Frontend (React) → Phoneme Engine (TS) → Sprite Scheduler (TS)
                         ↓                        ↓
              TTS Timing Events         Frame-by-Frame Render
                         ↓                        ↓
              Native TTS Bridge ←→ Dual Head Animator
              (Rust via Tauri)        (Front + Side)
```

## Success Metrics
- App loads and runs 100% offline
- Animation frame rate: 30fps smooth
- TTS sync accuracy: <50ms drift
- Sprite preload: <2s for 250 frames
- Cross-platform: Windows, macOS, Android, iOS

---
*Last Updated: January 25, 2026*
