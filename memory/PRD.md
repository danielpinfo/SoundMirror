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

### P0 - Phonetic Display Overhaul (COMPLETED - Feb 14, 2026)
- Rewrote `/app/frontend/src/lib/phoneticDisplay.js` with 300+ word dictionary
- "I'm fine" → "Aeem faeen", vowels separated per Pronunciation Rule Sheet
- Magic-e handling, pattern-based fallback for unknown words
- IPA_TO_READABLE: aɪ→"a-ee", eɪ→"eh-ee", aʊ→"a-oo", ɔɪ→"o-ee"

### P0 - Camera/Microphone Improvements (COMPLETED - Feb 14, 2026)
- Enhanced error handling, Permissions-Policy meta tag
- mediaDevices API availability check

### P1 - Phoneme Detection Accuracy (COMPLETED - Feb 15, 2026)
- Allosaurus emit=0.3 for more sensitive detection
- Language-specific models with universal fallback

### P1 - UI Label Corrections (COMPLETED - Feb 15, 2026)
- Current Sound shows actual phoneme from frame timings

### P2 - Layout: Compact Keyboard (COMPLETED - Feb 15, 2026)
- Smaller keys (32px, h-9), single-row layout

### P2 - Multilingual Phonetic Display (COMPLETED - Feb 15, 2026)
- 10 languages: English, Spanish, Italian, Portuguese, German, French, Japanese, Chinese, Hindi, Arabic

### NEW - Pronunciation Quiz Mode (COMPLETED - Feb 15, 2026)
- Optional game activated by "Quiz Mode" button (does NOT auto-start)
- Shows phonetic rendering, user guesses the word
- Difficulty: easy/medium/hard word pools
- Score tracking, Hint system, "Practice this word" link on wrong answers
- Exit button returns to normal mode

### NEW - Airflow Animation System (COMPLETED - Feb 15, 2026)
- Canvas-based airflow visualization overlaid on side-view head sprite
- Three channels: oral (mouth), nasal (nose), breath (idle)
- Phoneme-driven: vowels=oral continuous, nasals=nasal flow, plosives=burst, fricatives=turbulent
- Toggle via Wind icon button, status bar shows "Airflow: On"
- Blue/cyan ribbons, breathing during neutral frames
- **Bug Fix (Feb 15, 2026):** Airflow now visible - ResizeObserver for responsive canvas sizing, increased color opacity

### P0 - Phoneme-to-Frame Mapping Fix (COMPLETED - Feb 15, 2026)
- Fixed 'u' (normalized from 'oo') now maps to Frame 5 (rounded vowel oo_o_ou_w)
- Previously 'u' mapped to Frame 1 (open vowel a_u) - incorrect for "oo" sound
- Word "Food" now correctly shows: Frame 14 (f) → Frame 5 (oo) → Frame 7 (d)
- Test verified: `iteration_14.json` - 100% frontend tests passed

### Previously Completed
- Dual head animation (front + side view) with phoneme-driven timing
- Letter/Word practice pages with quick practice buttons and phrases
- Recording panel with face landmark overlay
- Phoneme comparison and guided focus mode
- History/session management (IndexedDB + MongoDB)
- Bug report page (email MOCKED)

## Testing Status
- Backend: 19/19 tests pass (pytest) across all iterations
- Frontend: All features verified (iterations 11-13)
- Test reports: `/app/test_reports/iteration_11.json` through `iteration_13.json`

## Prioritized Backlog

### P3 - Future
- Electron desktop build
- Real-time audio streaming
- More practice content and custom practice lists
- Bug report email (pending RESEND_API_KEY)
