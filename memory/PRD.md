# SoundMirror - Product Requirements Document

## Project Overview
**SoundMirror** is a visual speech articulation training platform designed for deaf users, language learners, and speech therapy education. The core function is to visually demonstrate how speech is physically formed in the mouth through anatomical animations, then record and grade user attempts.

## Original Problem Statement
Build a visual speech articulation training platform that:
- Animates anatomical mouth, tongue, jaw, and airflow positions using PNG sprite frames
- Supports 10 languages (English, Spanish, Italian, Portuguese, German, French, Japanese, Chinese, Hindi, Arabic)
- Records user audio/video attempts and grades both visual articulation and audio output
- Detects actual phonemes produced (not speech-to-text intent recognition)

## Target Audience
- **Primary**: Deaf users learning speech articulation
- **Secondary**: Language learners, speech therapy patients and educators
- **Tertiary**: Pronunciation coaches and ESL students

## Core Requirements
1. **Splash Screen**: Water drop animation (4 seconds)
2. **Home Page**: Language selector, instructions, practice word input, quick practice buttons
3. **Letter Practice**: Dual talking head animation (front/side), alphabet keyboard, recording, grading
4. **Word Practice**: Same as Letter Practice but for full words/sentences
5. **History Library**: Store and replay past practice sessions
6. **Bug Report**: Structured feedback submission

## Technical Architecture

### Frontend (React)
- `/app/frontend/src/pages/`
  - HomePage.jsx
  - LetterPracticePage.jsx
  - WordPracticePage.jsx
  - HistoryPage.jsx
  - BugReportPage.jsx
- `/app/frontend/src/components/`
  - SplashScreen.jsx
  - DualHeadAnimation.jsx
  - RecordingPanel.jsx
  - NavigationBar.jsx

### Backend (FastAPI + MongoDB)
- `/app/backend/server.py` - Main API server
- Endpoints: /api/languages, /api/alphabet, /api/phoneme-map, /api/grade, /api/sessions, /api/bug-reports

### Assets (Local Storage for Native App)
- `/app/frontend/public/assets/heads/front/` - 20 PNG front view sprites
- `/app/frontend/public/assets/heads/side/` - 20 PNG side view sprites
- `/app/frontend/public/assets/audio/` - 240 MP3 phoneme audio files (10 languages)

### Integrations
- **Gemini AI** (via Emergent LLM key): Phoneme analysis and grading
- **AWS S3** (reference): Original audio file storage

## What's Been Implemented (Feb 2, 2026)

### ✅ Completed
- [x] Home page with SoundMirror branding and language selector
- [x] 10 language support with UI translations
- [x] Letter Practice page with dual head animation (MASTER/SLAVE)
- [x] 40 PNG sprite images downloaded and stored locally
- [x] 240 MP3 audio files downloaded from S3 and stored locally
- [x] constants.js updated to use local asset paths
- [x] Alphabet keyboard with special characters (CH, SH, TH, etc.)
- [x] Word Practice page structure
- [x] History Library page with Progress Tracker dashboard
- [x] Progress Tracker: Day streaks, phoneme mastery, achievements
- [x] Weekly activity chart visualization
- [x] 8 gamified achievements (First Step, Dedicated Learner, etc.)
- [x] Bug Report page with structured form
- [x] Backend API (28 endpoints - all passing)
- [x] Gemini AI integration for grading (with fallback mock grading)
- [x] Practice session storage in MongoDB
- [x] Animation controls (play, pause, scrubber)
- [x] Enhanced RecordingPanel with video/audio recording
- [x] Recording timer display
- [x] Real API grading integration sending audio to Gemini AI
- [x] Color-coded score feedback (green 80%+, yellow 60-79%, red <60%)
- [x] Audio playback of recordings
- [x] Target vs Detected phoneme comparison display
- [x] **My Reports Page** - Personal progress analysis with export/print
- [x] Sound Performance table with mastery status
- [x] Mastered Sounds and Focus Areas sections
- [x] Personalized tips based on progress
- [x] **Enhanced Splash Screen** - Water drop animation with concentric ripples at 45° angle
- [x] **Smooth Frame Animation** - CSS crossfade transitions (100ms) for flicker-free animation
- [x] **Extended Practice Content** - Categories: greetings, basics, family, food, emotions, actions, colors, numbers
- [x] **Phoneme Practice Sentences** - Tongue twisters for each sound (S, R, L, TH, SH, CH, F, V, K, G, B, P, M, N)

### 📋 Future Features (Backlog)
- [ ] Visual mouth analysis from camera feed (ML model)
- [ ] Real-time streaming phoneme detection
- [ ] Desktop/mobile native app builds (Electron/React Native)
- [ ] Multi-client management for clinics (enterprise feature)
- [ ] Session notes and annotations (enterprise feature)

## Prioritized Backlog

### P0 (Critical)
- Implement actual audio phoneme detection using Gemini AI with audio input
- Add video recording for visual grading

### P1 (High)
- Improve splash screen animation
- Add frame interpolation for smoother sprite animations
- Implement real visual grading from camera feed

### P2 (Medium)
- Add more practice words per language
- Export practice history as PDF reports
- Add progress tracking and achievements

### P3 (Low)
- Native desktop app packaging (Electron/Tauri)
- Mobile app (React Native/Capacitor)
- Add more languages

## Next Tasks
1. Test Gemini AI grading with real audio input
2. Implement video recording panel
3. Refine splash screen water drop animation
4. Add frame interpolation for smoother animations

## Credentials & Keys
- **Emergent LLM Key**: sk-emergent-fF558Af025265A551E
- **AWS S3 Access**: AKIAYCQIF3LNPKEVCI6D (for soundmirror-phoneme-audio bucket)
- **Assets Location**: All sprites and audio now stored locally in /app/frontend/public/assets/

## Design Guidelines
- Dark blue theme with silver accents
- Clean, modern, educational feel (not cartoonish)
- Accessible for deaf users
- RTL support for Arabic
