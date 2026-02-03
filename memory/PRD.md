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
1. **Splash Screen**: 6-second water drop animation with silver raindrop, white splash, concentric ripples at 45°, logo fade-in
2. **Home Page**: Large logo (4X), no "Visual Speech Training" header, larger instructions (3X), Quick Practice (8 single words), Phrases (multi-word), cobalt blue buttons with gold text
3. **Letter Practice**: Dual talking head animation, alphabet keyboard, recording, grading
4. **Word Practice**: "Word Practice" title, no FRONT/SIDE VIEW labels, always-visible keyboard, Quick Practice/Phrases, camera recording
5. **History Library**: Merged Progress, Sessions, and Reports tabs with download/print functionality
6. **Bug Report**: Structured feedback submission

## Technical Architecture

### Frontend (React)
- `/app/frontend/src/pages/`
  - HomePage.jsx - Large logo, Quick Practice words, Phrases, cobalt buttons
  - LetterPracticePage.jsx
  - WordPracticePage.jsx - Always-visible keyboard, no view labels
  - HistoryPage.jsx - Merged with Reports functionality
  - BugReportPage.jsx
- `/app/frontend/src/components/`
  - SplashScreen.jsx - 6-second animation
  - DualHeadAnimation.jsx - Speed control, HOLD indicator, hideViewLabels prop
  - RecordingPanel.jsx - Camera/audio recording with autoEnableCamera
  - MouthTracker.jsx - MediaPipe face tracking
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
- **MediaPipe**: Real-time visual mouth tracking

## What's Been Implemented (Feb 3, 2026)

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
- [x] Backend API (21 endpoints - all passing)
- [x] Gemini AI integration for grading (with fallback mock grading)
- [x] Practice session storage in MongoDB
- [x] Animation controls (play, pause, scrubber)
- [x] Enhanced RecordingPanel with video/audio recording
- [x] Recording timer display
- [x] Real API grading integration sending audio to Gemini AI
- [x] Color-coded score feedback (green 80%+, yellow 60-79%, red <60%)
- [x] Audio playback of recordings
- [x] Target vs Detected phoneme comparison display
- [x] **My Reports Page (ReportsPage.jsx)** - Personal progress analysis with export/print
- [x] Sound Performance table with mastery status
- [x] Mastered Sounds and Focus Areas sections
- [x] Personalized tips based on progress
- [x] **Enhanced Splash Screen** - Water drop animation with concentric ripples at 45° angle
- [x] **Smooth Frame Animation** - CSS crossfade transitions for flicker-free animation
- [x] **Extended Practice Content** - Categories: greetings, basics, family, food, emotions, actions, colors, numbers
- [x] **Phoneme Practice Sentences** - Tongue twisters for each sound (S, R, L, TH, SH, CH, F, V, K, G, B, P, M, N)

### ✅ NEW (Feb 3, 2026)
- [x] **Improved Animation System** - Timed frame sequences with prepare/transition-in/hold/transition-out phases
- [x] **Animation Speed Control** - Slow (600ms), Normal (400ms), Fast (200ms) modes with toggle button
- [x] **Visual HOLD Indicator** - Green border and "HOLD THIS" banner during hold phases for learning
- [x] **TTS Speed Sync** - Text-to-speech rate adjusts to match animation speed
- [x] **Progress Bar** - Shows animation progress percentage
- [x] **Step Indicator** - Shows "Step X of Y • Frame Z" for detailed tracking
- [x] **MouthTracker Component** - MediaPipe Face Mesh integration for real-time lip/mouth tracking
- [x] **MouthTracker Metrics** - Shows opening%, width%, protrusion%, jaw% with shape detection
- [x] **MouthTracker Feedback** - Real-time feedback based on target phoneme ("Open wider", "Round lips", etc.)
- [x] **Refactored PathologistPage → ReportsPage** - Cleaner naming for single-user focus

### 📋 Future Features (Backlog)
- [ ] Real-time streaming phoneme detection via WebSocket
- [ ] Desktop/mobile native app builds (Electron config exists, needs testing)
- [ ] PDF export for progress reports
- [ ] Social sharing for achievements

## Prioritized Backlog

### P0 (Critical) - DONE
- ✅ Implement actual audio phoneme detection using Gemini AI
- ✅ Improve animation speed for visual learning
- ✅ Add MouthTracker for visual feedback

### P1 (High) 
- Test and finalize Electron desktop build (`yarn electron:build`)
- Implement visual grading using MouthTracker data comparison
- Connect MouthTracker metrics to grading score

### P2 (Medium)
- Add more practice words per language
- Export practice history as PDF reports
- Real-time audio streaming to backend (WebSocket)

### P3 (Low)
- Mobile app (React Native/Capacitor)
- Add more languages
- Custom practice list creation

## Next Tasks
1. Test Electron desktop build (`yarn electron:build`)
2. Connect MouthTracker metrics to visual grading score
3. Add comparison between user mouth shape and target phoneme shape
4. Test real-time audio streaming for faster feedback

## Technical Architecture (Updated)

### Frontend (React + ShadcnUI)
- `/app/frontend/src/pages/`
  - HomePage.jsx
  - LetterPracticePage.jsx
  - WordPracticePage.jsx
  - HistoryPage.jsx
  - BugReportPage.jsx
  - ReportsPage.jsx (formerly PathologistPage)
- `/app/frontend/src/components/`
  - SplashScreen.jsx
  - DualHeadAnimation.jsx - **Enhanced with speed control, HOLD indicator, timed frames**
  - RecordingPanel.jsx - **Includes MouthTracker toggle**
  - MouthTracker.jsx - **NEW: MediaPipe Face Mesh for lip tracking**
  - NavigationBar.jsx
- `/app/frontend/electron/`
  - main.js - Electron main process
  - preload.js - Electron preload script

## Credentials & Keys
- **Emergent LLM Key**: Available via emergent_integrations_manager (for Gemini AI grading)
- **AWS S3 Access**: AKIAYCQIF3LNPKEVCI6D (for soundmirror-phoneme-audio bucket - reference only)
- **Assets Location**: All sprites and audio now stored locally in /app/frontend/public/assets/
- **Grading Note**: If no audio data provided or Gemini unavailable, mock grading is used as fallback

## Design Guidelines
- Dark blue theme with silver accents
- Clean, modern, educational feel (not cartoonish)
- Accessible for deaf users
- RTL support for Arabic
