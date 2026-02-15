# SoundMirror - Product Requirements Document

## Original Problem Statement
SoundMirror is a tool designed to help mute individuals practice speech by providing visual and phonetic feedback. The application shows animated mouth/face positions synchronized with phoneme analysis, allowing users to see how sounds should be formed and compare their speech attempts against target pronunciations.

## Core Mission
Provide accurate, understandable, and immediate feedback on pronunciation across 10 languages.

## Architecture
- **Frontend**: React + Tailwind CSS + Shadcn UI
- **Backend**: FastAPI + Allosaurus (phoneme recognition) + MongoDB
- **Key Libraries**: MediaPipe (face landmarks), Web Audio API

## What's Been Implemented

### P0 Critical - Phonetic Display (COMPLETED - Feb 14, 2026)
- Completely rewrote `/app/frontend/src/lib/phoneticDisplay.js` following the user's "Pronunciation Rule Sheet"
- Vowels are separated, long, and pure — never compressed into English diphthongs
- "I'm fine" → "Aeem faeen" (verified)
- 300+ word dictionary with magic-e handling and pattern-based fallback
- IPA_TO_READABLE mapping: aɪ→"a-ee", eɪ→"eh-ee", aʊ→"a-oo", ɔɪ→"o-ee"

### P0 Critical - Camera/Microphone (IMPROVED - Feb 14, 2026)
- Enhanced error handling with specific permission guidance
- Added mediaDevices API availability check
- Added Permissions-Policy meta tag
- Better error messages guiding users to browser address bar

### P1 - Phoneme Detection Accuracy (COMPLETED - Feb 15, 2026)
- Tuned Allosaurus with `emit=0.3` for more sensitive detection
- Language-specific model with universal fallback
- Audio normalization and noise gating in backend

### P1 - UI Label Corrections (COMPLETED - Feb 15, 2026)
- Current Sound display now shows actual phoneme from frame timings (e.g., "eh", "h", "l") instead of frame group names (e.g., "p/b/m")
- Uses `ipaToReadable()` for user-friendly display

### P2 - Layout Adjustments (COMPLETED - Feb 15, 2026)
- Keyboard made compact: smaller keys (32px min-width, h-9), tighter spacing
- Keyboard fits in single/double row layout
- Recording results panel uses horizontal layout next to video

### P2 - Multilingual Phonetic Display (COMPLETED - Feb 15, 2026)
- Added LANGUAGE_PHONETICS dictionaries for all 10 languages
- Spanish: "Hola" → "oh-lah", "Gracias" → "grah-see-ahs"
- German: "Nein" → "na-een", "Guten Morgen" → "goo-ten mohr-gen"
- French: "Oui" → "oo-ee", "Merci beaucoup" → "mehr-see boh-koo"
- Japanese: "こんにちは" → "kon-nee-chee-wah"
- Chinese, Hindi, Arabic also supported

### Previously Completed
- Dual head animation (front + side view) with phoneme-driven timing
- Letter/Word practice pages with quick practice buttons and phrases
- Recording panel with face landmark overlay
- Phoneme comparison and guided focus mode
- History/session management (IndexedDB + MongoDB)
- 10-language support
- Bug report page (email MOCKED)

## Testing Status
- Backend: 19/19 tests pass (pytest) - iterations 11 & 12
- Frontend: All phonetic display, UI, and navigation tests pass
- Test reports: `/app/test_reports/iteration_11.json`, `/app/test_reports/iteration_12.json`

## Prioritized Backlog

### P3 - Future
- Airflow Animation system
- Electron desktop build
- Real-time audio streaming
- More practice content and custom practice lists
- Bug report email feature (pending RESEND_API_KEY)

## Known Limitations
- Camera permissions are browser/origin-specific
- Bug report email is MOCKED (no RESEND_API_KEY)
- AI grading falls back to mock scores when Gemini unavailable
