# SoundMirror - Product Requirements Document

## Original Problem Statement
SoundMirror - A visual speech articulation training platform for deaf users, language learners, and speech therapy education. The core function is to visually show how speech is physically formed in the mouth using animated PNG sprites, then video/audio record user's attempts, show phoneme detection results, and grade attempts using audio/video comparison.

## User Personas
1. **Deaf Users** - Learning to speak by seeing mouth formations
2. **Language Learners** - Learning pronunciation in 10 different languages
3. **Speech Therapy Patients** - Practicing articulation with visual feedback
4. **Speech Therapists/Educators** - Using tool for teaching

## Core Requirements (Static)
- Splash screen with water drop animation (4 seconds)
- Multi-language support (10 languages)
- Dual synchronized talking head animations (front + side view)
- Letter/phoneme practice with alphabet keyboard
- Word/sentence practice
- Audio/video recording with camera access
- Visual and audio grading (0-100%)
- Practice history storage (IndexedDB - local only)
- Bug report system

## What's Been Implemented (Jan 30, 2026)

### Pages
1. **Splash Screen** - Water drop ripple animation with SoundMirror logo reveal (4 seconds)
2. **Home Page** - Language selector (10 languages), practice word input, quick practice buttons, navigation
3. **Letter Practice Page** - Alphabet keyboard, dual head animation, play/pause/scrubber, recording panel
4. **Word Practice Page** - Word input, dual head animation, recording panel
5. **History Library Page** - Statistics cards, session list, search/filter, export/delete
6. **Bug Report Page** - Platform/Page/Severity/Feature Area dropdowns, description, submit

### Technical Implementation
- React frontend with Tailwind CSS and Shadcn/UI components
- FastAPI backend with MongoDB
- PNG sprite animations from GitHub repository
- IndexedDB for offline-first local storage
- CSS/JS frame interpolation for animations
- Session storage for splash screen state

### Backend APIs
- `/api/languages` - 10 supported languages
- `/api/translations/{language}` - UI translations
- `/api/alphabet/{language}` - Language-specific alphabets
- `/api/practice-words/{language}` - Practice word lists
- `/api/phoneme-map` - Phoneme to frame mapping
- `/api/word-to-frames` - Word to animation frame sequence
- `/api/sessions` - CRUD for practice sessions
- `/api/grade` - Grading endpoint (MOCKED)
- `/api/bug-reports` - Bug report submission

## Prioritized Backlog

### P0 - Critical (Next)
- Integrate real Gemini AI for phoneme detection and grading
- Connect to S3 bucket for prerecorded audio files
- Implement actual audio recording and playback

### P1 - High Priority
- Add real phoneme detection from audio (not mocked)
- Visual grading with face/mouth detection from video
- Audio waveform visualization during recording

### P2 - Medium Priority
- Add more frame interpolation for smoother animations
- Offline audio/video storage optimization
- Export practice session as video

### P3 - Lower Priority
- Cloud sync option (currently local only)
- User accounts and progress tracking
- Social sharing of progress

## Architecture
```
Frontend (React + Tailwind + Shadcn)
├── Pages: Home, LetterPractice, WordPractice, History, BugReport
├── Components: SplashScreen, DualHeadAnimation, RecordingPanel, AlphabetKeyboard
├── Context: LanguageContext (i18n)
├── Storage: IndexedDB (idb library)
└── Assets: PNG sprites from GitHub

Backend (FastAPI + MongoDB)
├── Routes: /api/*
├── Models: PracticeSession, BugReport, GradingRequest/Response
├── Data: Phoneme maps, alphabets, translations
└── Integration: Gemini AI (to be fully integrated)
```

## Mocked Features
- **Grading API** (`/api/grade`): Returns random scores (55-95%) and mock feedback
- Audio phoneme detection not yet implemented
- Visual mouth analysis not yet implemented
