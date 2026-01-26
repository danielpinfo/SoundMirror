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

### Phase 1: Web Preview MVP (Jan 25-26, 2026) ✓
- Complete React frontend with 5 pages
- **Refactored Code Architecture** ✅ COMPLETED (Jan 26, 2026)
  - App.js reduced from 1651 to 1322 lines
  - DualHeadAnimator moved to `/src/components/common/DualHeadAnimator.jsx`
  - Phoneme engine moved to `/src/data/phonemeMap.js`
  - Proper component structure with `/src/components/`, `/src/data/`, `/src/context/`
- **NEW 20-Frame Sprite Engine** ✅ REBUILT (Jan 26, 2026)
  - **Single sprite sheet per view** (2 files total: front_master.png 12MB, side_master.png 19MB)
  - **30 FPS movie-quality animation** using requestAnimationFrame
  - 20 frames total (0-19), each representing specific phoneme groups
  - **Letter Practice**: Full consonant + vowel pronunciation (B = "bah" = F2→F1)
  - **Word Practice**: Smooth flow with transitions between phonemes
  - Frame mapping:
    - F0: neutral | F1: a,u | F2: b,p,m | F3: ee,z,x,i | F4: oo,o,ou,w
    - F5: e | F6: ü | F7: c,k,q,g | F8: t,d,j,tsk | F9: n
    - F10: ng | F11: s | F12: sh | F13: th | F14: f,v
    - F15: h | F16: ch | F17: r | F18: L | F19: LL,y
  - All consonants include vowel endings (bah, cah, dah, etc.)
  - Smooth transitions with golden "apex" indicator
- **Digraph Handling** ✅ VERIFIED
  - 'll', 'sh', 'ch', 'th', 'ng', 'ph', 'wh', 'ck', 'gh' treated as single phonemes
  - Example: 'hello' = H, E, LL, O (4 phonemes, not 5)
- **Asset Structure:**
  - `/assets/sprites/front_master.png` (12 MB, 939x15860px)
  - `/assets/sprites/side_master.png` (19 MB, 939x15860px)
- **Pre-recorded Phoneme Audio (from S3):**
  - 240 MP3 files for all 10 languages
  - Stored at `/assets/audio/phonemes/{lang}-{phoneme}.mp3`
  - Used for Letter Practice instead of robotic TTS
- Full i18n support for 10 languages
- Splash screen with falling water drop and thick white ripples
- Word Practice: large camera LEFT, model articulation RIGHT
- Letter Practice: alphabet grid with vowels highlighted, dual head animators
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
- **SPRITES INTEGRATED:** `/app/frontend/public/assets/sprites/front/` (250 PNG frames)
- **SPRITES INTEGRATED:** `/app/frontend/public/assets/sprites/side/` (250 PNG frames)

## GitHub Repository Structure
```
SoundMirror/ (GitHub: danielpinfo/SoundMirror)
├── sprites_head_front/     # 250 front-view PNGs
├── sprites_head_side/      # 250 side-view PNGs  
├── Base44_export/          # Legacy reference code
```

## Prioritized Backlog

### P0 (Critical - Next Sprint)
1. ✅ Import 500 PNG sprites from GitHub into assets folder - **COMPLETED**
2. ✅ Replace placeholder shapes with actual sprite images - **COMPLETED**
3. Implement native TTS bridge (Windows SAPI / macOS NSSpeech)
4. Build Tauri desktop executable
5. Real camera/microphone recording with browser APIs

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
1. ✅ **Import sprites** - Pulled 500 PNGs from GitHub repo - **DONE**
2. ✅ **Wire up sprites** - DualHeadAnimator now uses real PNG sprites - **DONE**
3. ✅ **Animation Engine** - Clinical-grade engine with sweet spot logic - **DONE (Jan 26, 2026)**
4. ✅ **Digraph Handling** - 'll', 'sh', 'ch', 'th' as single phonemes - **DONE (Jan 26, 2026)**
5. **Real Recording** - Implement camera/microphone capture with Web APIs
6. **Animation Scrubbing** - Add slider to manually scrub through animation frames
7. **Test TTS** - Validate Web Speech API timing sync with sprites
8. **Build Tauri** - Create first desktop executable

---
*Last Updated: January 26, 2026 - Animation engine tested and verified*
