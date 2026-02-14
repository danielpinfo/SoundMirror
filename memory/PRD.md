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
- "I'm fine" → "Aeem faeen" (verified ✅)
- "No" → "noh", "you" → "yoo", "say" → "seh-ee", "my" → "ma-ee"
- 300+ word dictionary with magic-e handling and pattern-based fallback
- IPA_TO_READABLE mapping updated: aɪ→"a-ee", eɪ→"eh-ee", aʊ→"a-oo", ɔɪ→"o-ee"

### P0 Critical - Camera/Microphone (IMPROVED - Feb 14, 2026)
- Enhanced error handling in RecordingPanel.jsx with specific permission guidance
- Added mediaDevices API availability check
- Added Permissions-Policy meta tag to index.html
- Better error messages guiding users to browser address bar permission settings
- NOTE: Camera permissions are per-origin in browsers. User may need to grant permission for new preview URL.

### Backend (Working)
- Allosaurus phoneme recognizer initialized and healthy
- All 19 backend API tests passing (health, languages, phoneme detection, sessions, grading, bug reports)
- Phoneme detection endpoint `/api/phoneme/detect` working with PCM audio data

### Previously Completed
- Dual head animation (front + side view) with phoneme-driven timing
- Letter practice page with alphabet keyboard
- Word practice page with quick practice words and phrases
- Recording panel with face landmark overlay
- Phoneme comparison panel (target vs detected)
- Guided focus mode for problem sounds
- History/session management (IndexedDB + MongoDB)
- 10-language support (English, Spanish, Italian, Portuguese, German, French, Japanese, Chinese, Hindi, Arabic)
- Bug report page (email MOCKED - needs RESEND_API_KEY)

## Prioritized Backlog

### P1 - In Progress
- Improve phoneme detection accuracy (test with "bloogoosful" type words)
- UI label verification (post phonetic fix)

### P2 - Upcoming
- Layout adjustments (keyboard position, grading results placement)
- Translate phonetic displays to match selected language
- IPA analysis pipeline: handle silent 'e' in phoneme tokenization

### P3 - Future
- Airflow Animation system
- Electron desktop build
- Real-time audio streaming
- More practice content and custom practice lists
- Bug report email feature (pending RESEND_API_KEY)

## Testing Status
- Backend: 19/19 tests pass (pytest)
- Frontend: All critical phonetic display tests pass
- Test report: `/app/test_reports/iteration_11.json`

## Known Limitations
- Camera permissions are browser/origin-specific
- Bug report email is MOCKED (no RESEND_API_KEY)
- AI grading falls back to mock scores when Gemini unavailable
