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

---

## What's Been Implemented

### Phase 1: Web Preview MVP (Jan 25-27, 2026) ✓

#### Sprint 1: Core Application (Jan 25-26) ✓
- Complete React frontend with 5 pages
- **Refactored Code Architecture** ✅
  - DualHeadAnimator at `/src/components/common/DualHeadAnimator.jsx`
  - Phoneme engine at `/src/data/phonemeMap.js`
  - Proper component structure with `/src/components/`, `/src/data/`, `/src/context/`

#### Sprint 2: Animation Engine (Jan 26) ✓
- **NEW 20-Frame Sprite Engine** ✅ REBUILT
  - **Single sprite sheet per view** (2 files: front_master.png, side_master.png)
  - **30 FPS movie-quality animation** using requestAnimationFrame
  - 20 frames (0-19), each representing specific phoneme groups
  - **Letter Practice**: Full consonant + vowel pronunciation (B = "bah" = F2→F1)
  - **Word Practice**: Smooth flow with transitions between phonemes
  - Frame mapping:
    - F0: neutral | F1: a,u | F2: b,p,m | F3: ee,z,x,i | F4: oo,o,ou,w
    - F5: e | F6: ü | F7: c,k,q,g | F8: t,d,j,tsk | F9: n
    - F10: ng | F11: s | F12: sh | F13: th | F14: f,v
    - F15: h | F16: ch | F17: r | F18: L | F19: LL,y
- **Digraph Handling** ✅ VERIFIED
  - 'll', 'sh', 'ch', 'th', 'ng', 'ph', 'wh', 'ck', 'gh' treated as single phonemes

#### Sprint 3: Recording & Grading System (Jan 27) ✅ COMPLETED
- **Audio & Video Recording** ✅
  - `/src/hooks/useMediaRecorder.js` - Full MediaRecorder API integration
  - Audio recording with microphone
  - Video recording with webcam
  - Real-time audio level visualization
  - Download recording functionality
- **Attempt History System** ✅
  - `/src/hooks/useAttemptHistory.js` - IndexedDB persistence
  - Save up to 100 attempts with timestamps
  - Track scores, phoneme analysis, feedback
- **Grading Service v1 (Heuristic)** ✅
  - `/src/services/gradingService.js` - Audio analysis pipeline
  - Energy envelope extraction
  - Voice activity detection
  - Timing alignment scoring
  - Pronunciation scoring (heuristic placeholder)
  - Clarity scoring based on energy variance
- **Recording Studio Component** ✅
  - `/src/components/recording/RecordingStudio.jsx`
  - Audio/Video mode toggle
  - Real-time recording indicator with audio level
  - Automatic grading on recording stop
  - Score display with feedback
- **Timeline Scrubber Component** ✅
  - `/src/components/recording/TimelineScrubber.jsx`
  - Visual phoneme segments on timeline
  - Clickable scrubbing
  - Play/Pause with frame-accurate seeking
  - Vowel vs consonant color coding
- **Comparison View Component** ✅
  - `/src/components/recording/ComparisonView.jsx`
  - Side-by-side and overlay modes
  - Synchronized playback
  - Score comparison display
- **Enhanced DualHeadAnimator** ✅
  - Smooth crossfade transitions between frames
  - Cubic easing for natural movement
  - External seek support for scrubbing
  - Configurable blend duration

---

## Architecture

### Current File Structure
```
/app/frontend/
├── public/
│   └── assets/
│       ├── audio/phonemes/     # 240 MP3s
│       └── sprites/
│           ├── front_master.png (939x15860px, 12MB)
│           └── side_master.png  (939x15860px, 19MB)
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   └── DualHeadAnimator.jsx   # Core animation component
│   │   ├── recording/
│   │   │   ├── RecordingStudio.jsx    # Audio/video recording
│   │   │   ├── TimelineScrubber.jsx   # Timeline navigation
│   │   │   └── ComparisonView.jsx     # Side-by-side comparison
│   │   └── ui/                        # Shadcn components
│   ├── data/
│   │   └── phonemeMap.js              # Phonetic engine
│   ├── hooks/
│   │   ├── useMediaRecorder.js        # Recording hook
│   │   └── useAttemptHistory.js       # History persistence
│   ├── services/
│   │   └── gradingService.js          # Heuristic scoring
│   └── App.js                         # Main app with pages
```

### Data Flow
```
User Input (Word/Letter)
     ↓
phonemeMap.js (Text → Viseme Sequence)
     ↓
DualHeadAnimator (Viseme → Sprite Frames)
     ↓
Sprite Sheet Rendering (CSS background-position)
     ↓
User Records Attempt
     ↓
useMediaRecorder (MediaRecorder API)
     ↓
gradingService (Audio Analysis)
     ↓
Score Display + useAttemptHistory (IndexedDB)
```

---

## Prioritized Backlog

### P0 (Critical - Next Sprint)
1. ✅ Import 500 PNG sprites from GitHub - **COMPLETED**
2. ✅ Real camera/microphone recording - **COMPLETED (Jan 27)**
3. ✅ Timeline scrubbing - **COMPLETED (Jan 27)**
4. Fix non-English language animations (Chinese/Japanese)
5. Build Tauri desktop executable

### P1 (High Priority)
6. SQLite integration for offline storage
7. ML-based pronunciation scoring (replace heuristics)
8. User progress persistence across sessions
9. Language pack loading system
10. Native TTS bridge (Windows SAPI / macOS NSSpeech)

### P2 (Medium Priority)
11. React Native mobile setup (Android)
12. Android TTS bridge
13. iOS TTS bridge (AVSpeechSynthesizer)
14. Airflow overlay animations
15. Additional language packs

### P3 (Future - Deferred per User Spec)
16. Native C++/Rust SoundMirrorCore engine
17. Godot desktop cockpit
18. iOS/Android native SDK wrappers
19. Parametric articulator splines (tongue/lips physics)
20. Neural frame interpolation (RIFE)
21. Offline sprite expansion tool
22. Coarticulation physics modeling

---

## Key Technical Concepts

- **Frontend:** React 18, Tailwind CSS, Vite
- **Animation:** CSS sprite animation via `background-position`, `requestAnimationFrame` timing, CSS opacity crossfades
- **Recording:** MediaRecorder API, Web Audio API for analysis
- **Storage:** IndexedDB for attempts, localStorage for settings
- **Phonetics:** Custom phonetic engine mapping text patterns to 20-frame viseme library

---

## Next Tasks
1. **Test Recording Flow** - Verify full record → grade → history pipeline
2. **Fix Non-English** - Debug Chinese/Japanese animation defaulting to 'a'
3. **Tauri Build** - Create first desktop executable
4. **ML Scoring Integration** - Replace heuristic grading with actual speech recognition

---
*Last Updated: January 27, 2026 - Recording & Grading System Implemented*
