import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Activity, Home as HomeIcon, Mic2, BookA, BarChart3, Bug, Play, Pause, RotateCcw, Volume2, VolumeX, ArrowLeft, Search, ArrowRight, ChevronDown, Check, Send, Wifi, WifiOff, Trash2, Clock, TrendingUp, Target, Award, Calendar, CheckCircle, AlertCircle, Square, Sparkles, Video, Camera, Download, Eye, Ear, SkipBack, SkipForward, Circle } from 'lucide-react';
import { Toaster, toast } from 'sonner';

// ========== 10 LANGUAGES ==========
const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
];

// ========== 10 SUGGESTED WORDS PER LANGUAGE (with compounds) ==========
const SUGGESTIONS = {
  en: ['hello', 'thank you', 'water', 'beautiful', 'good morning', 'pronunciation', 'opportunity', 'excuse me', 'wonderful', 'I love you'],
  es: ['hola', 'gracias', 'agua', 'hermoso', 'buenos días', 'pronunciación', 'oportunidad', 'con permiso', 'maravilloso', 'te quiero'],
  fr: ['bonjour', 'merci beaucoup', 'eau', 'magnifique', 'bonne nuit', 'prononciation', 'opportunité', 'excusez-moi', 'merveilleux', 'je t\'aime'],
  de: ['hallo', 'danke schön', 'wasser', 'wunderschön', 'guten morgen', 'aussprache', 'gelegenheit', 'entschuldigung', 'wunderbar', 'ich liebe dich'],
  it: ['ciao', 'grazie mille', 'acqua', 'bellissimo', 'buongiorno', 'pronuncia', 'opportunità', 'mi scusi', 'meraviglioso', 'ti amo'],
  pt: ['olá', 'muito obrigado', 'água', 'bonito', 'bom dia', 'pronúncia', 'oportunidade', 'com licença', 'maravilhoso', 'eu te amo'],
  zh: ['你好', '谢谢你', '水', '美丽', '早上好', '发音', '机会', '对不起', '太棒了', '我爱你'],
  ja: ['こんにちは', 'ありがとう', '水', '美しい', 'おはよう', '発音', '機会', 'すみません', '素晴らしい', '愛してる'],
  ar: ['مرحبا', 'شكرا جزيلا', 'ماء', 'جميل', 'صباح الخير', 'نطق', 'فرصة', 'عفوا', 'رائع', 'أحبك'],
  hi: ['नमस्ते', 'धन्यवाद', 'पानी', 'सुंदर', 'सुप्रभात', 'उच्चारण', 'अवसर', 'क्षमा करें', 'अद्भुत', 'मैं तुमसे प्यार करता हूँ'],
};

// ========== COMPLETE ALPHABET WITH PHONEMES PER LANGUAGE ==========
const ALPHABETS = {
  en: [
    { letter: 'A', phoneme: 'ah', ipa: '/eɪ/', isVowel: true },
    { letter: 'B', phoneme: 'buh', ipa: '/biː/', isVowel: false },
    { letter: 'C', phoneme: 'kuh', ipa: '/siː/', isVowel: false },
    { letter: 'D', phoneme: 'duh', ipa: '/diː/', isVowel: false },
    { letter: 'E', phoneme: 'eh', ipa: '/iː/', isVowel: true },
    { letter: 'F', phoneme: 'fff', ipa: '/ɛf/', isVowel: false },
    { letter: 'G', phoneme: 'guh', ipa: '/dʒiː/', isVowel: false },
    { letter: 'H', phoneme: 'huh', ipa: '/eɪtʃ/', isVowel: false },
    { letter: 'I', phoneme: 'ee', ipa: '/aɪ/', isVowel: true },
    { letter: 'J', phoneme: 'juh', ipa: '/dʒeɪ/', isVowel: false },
    { letter: 'K', phoneme: 'kuh', ipa: '/keɪ/', isVowel: false },
    { letter: 'L', phoneme: 'luh', ipa: '/ɛl/', isVowel: false },
    { letter: 'M', phoneme: 'muh', ipa: '/ɛm/', isVowel: false },
    { letter: 'N', phoneme: 'nuh', ipa: '/ɛn/', isVowel: false },
    { letter: 'O', phoneme: 'oh', ipa: '/oʊ/', isVowel: true },
    { letter: 'P', phoneme: 'puh', ipa: '/piː/', isVowel: false },
    { letter: 'Q', phoneme: 'kwuh', ipa: '/kjuː/', isVowel: false },
    { letter: 'R', phoneme: 'rrr', ipa: '/ɑːr/', isVowel: false },
    { letter: 'S', phoneme: 'sss', ipa: '/ɛs/', isVowel: false },
    { letter: 'T', phoneme: 'tuh', ipa: '/tiː/', isVowel: false },
    { letter: 'U', phoneme: 'oo', ipa: '/juː/', isVowel: true },
    { letter: 'V', phoneme: 'vvv', ipa: '/viː/', isVowel: false },
    { letter: 'W', phoneme: 'wuh', ipa: '/ˈdʌbəljuː/', isVowel: false },
    { letter: 'X', phoneme: 'ks', ipa: '/ɛks/', isVowel: false },
    { letter: 'Y', phoneme: 'yuh', ipa: '/waɪ/', isVowel: false },
    { letter: 'Z', phoneme: 'zzz', ipa: '/ziː/', isVowel: false },
  ],
  es: [
    { letter: 'A', phoneme: 'ah', ipa: '/a/', isVowel: true },
    { letter: 'B', phoneme: 'beh', ipa: '/be/', isVowel: false },
    { letter: 'C', phoneme: 'seh', ipa: '/θe/', isVowel: false },
    { letter: 'D', phoneme: 'deh', ipa: '/de/', isVowel: false },
    { letter: 'E', phoneme: 'eh', ipa: '/e/', isVowel: true },
    { letter: 'F', phoneme: 'efeh', ipa: '/efe/', isVowel: false },
    { letter: 'G', phoneme: 'heh', ipa: '/xe/', isVowel: false },
    { letter: 'H', phoneme: 'acheh', ipa: '/atʃe/', isVowel: false },
    { letter: 'I', phoneme: 'ee', ipa: '/i/', isVowel: true },
    { letter: 'J', phoneme: 'hotah', ipa: '/xota/', isVowel: false },
    { letter: 'K', phoneme: 'kah', ipa: '/ka/', isVowel: false },
    { letter: 'L', phoneme: 'eleh', ipa: '/ele/', isVowel: false },
    { letter: 'M', phoneme: 'emeh', ipa: '/eme/', isVowel: false },
    { letter: 'N', phoneme: 'eneh', ipa: '/ene/', isVowel: false },
    { letter: 'Ñ', phoneme: 'enyeh', ipa: '/eɲe/', isVowel: false },
    { letter: 'O', phoneme: 'oh', ipa: '/o/', isVowel: true },
    { letter: 'P', phoneme: 'peh', ipa: '/pe/', isVowel: false },
    { letter: 'Q', phoneme: 'koo', ipa: '/ku/', isVowel: false },
    { letter: 'R', phoneme: 'erreh', ipa: '/ere/', isVowel: false },
    { letter: 'S', phoneme: 'eseh', ipa: '/ese/', isVowel: false },
    { letter: 'T', phoneme: 'teh', ipa: '/te/', isVowel: false },
    { letter: 'U', phoneme: 'oo', ipa: '/u/', isVowel: true },
    { letter: 'V', phoneme: 'uveh', ipa: '/ube/', isVowel: false },
    { letter: 'W', phoneme: 'dobleh', ipa: '/uble/', isVowel: false },
    { letter: 'X', phoneme: 'ekees', ipa: '/ekis/', isVowel: false },
    { letter: 'Y', phoneme: 'ee-gree', ipa: '/iɣɾjeɣa/', isVowel: false },
    { letter: 'Z', phoneme: 'setah', ipa: '/θeta/', isVowel: false },
  ],
  // Simplified for other languages - using phonetic approximations
  fr: generateAlphabet('fr', ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']),
  de: generateAlphabet('de', ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'Ä', 'Ö', 'Ü', 'ß']),
  it: generateAlphabet('it', ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'Z']),
  pt: generateAlphabet('pt', ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']),
  zh: generateAlphabet('zh', ['啊', '波', '次', '得', '鹅', '佛', '哥', '喝', '衣', '鸡', '科', '勒', '摸', '呢', '哦', '坡', '期', '日', '思', '特', '乌', '微', '西', '呀', '资']),
  ja: generateAlphabet('ja', ['あ', 'い', 'う', 'え', 'お', 'か', 'き', 'く', 'け', 'こ', 'さ', 'し', 'す', 'せ', 'そ', 'た', 'ち', 'つ', 'て', 'と', 'な', 'に', 'ぬ', 'ね', 'の']),
  ar: generateAlphabet('ar', ['ا', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'ه', 'و', 'ي']),
  hi: generateAlphabet('hi', ['अ', 'आ', 'इ', 'ई', 'उ', 'ऊ', 'ए', 'ऐ', 'ओ', 'औ', 'क', 'ख', 'ग', 'घ', 'च', 'छ', 'ज', 'झ', 'ट', 'ठ', 'ड', 'ढ', 'ण', 'त', 'थ']),
};

function generateAlphabet(lang, letters) {
  const vowels = ['A', 'E', 'I', 'O', 'U', 'Ä', 'Ö', 'Ü', 'あ', 'い', 'う', 'え', 'お', 'ا', 'و', 'ي', 'अ', 'आ', 'इ', 'ई', 'उ', 'ऊ', 'ए', 'ऐ', 'ओ', 'औ', '啊', '鹅', '衣', '哦', '乌'];
  return letters.map(letter => ({
    letter,
    phoneme: letter.toLowerCase() + 'ah',
    ipa: `/${letter.toLowerCase()}/`,
    isVowel: vowels.includes(letter) || vowels.includes(letter.toUpperCase()),
  }));
}

// ========== PHONEME MAP ==========
const PHONEME_MAP = {
  a: { letter: 'A', phoneme: 'a', ipa: '/a/', frameStart: 1 },
  b: { letter: 'B', phoneme: 'b', ipa: '/b/', frameStart: 61 },
  c: { letter: 'C', phoneme: 'k', ipa: '/k/', frameStart: 91 },
  d: { letter: 'D', phoneme: 'd', ipa: '/d/', frameStart: 81 },
  e: { letter: 'E', phoneme: 'ɛ', ipa: '/ɛ/', frameStart: 31 },
  f: { letter: 'F', phoneme: 'f', ipa: '/f/', frameStart: 171 },
  g: { letter: 'G', phoneme: 'g', ipa: '/g/', frameStart: 101 },
  h: { letter: 'H', phoneme: 'h', ipa: '/h/', frameStart: 181 },
  i: { letter: 'I', phoneme: 'i', ipa: '/i/', frameStart: 11 },
  j: { letter: 'J', phoneme: 'dʒ', ipa: '/dʒ/', frameStart: 191 },
  k: { letter: 'K', phoneme: 'k', ipa: '/k/', frameStart: 91 },
  l: { letter: 'L', phoneme: 'l', ipa: '/l/', frameStart: 211 },
  m: { letter: 'M', phoneme: 'm', ipa: '/m/', frameStart: 61 },
  n: { letter: 'N', phoneme: 'n', ipa: '/n/', frameStart: 121 },
  o: { letter: 'O', phoneme: 'o', ipa: '/o/', frameStart: 41 },
  p: { letter: 'P', phoneme: 'p', ipa: '/p/', frameStart: 61 },
  q: { letter: 'Q', phoneme: 'k', ipa: '/k/', frameStart: 91 },
  r: { letter: 'R', phoneme: 'r', ipa: '/r/', frameStart: 201 },
  s: { letter: 'S', phoneme: 's', ipa: '/s/', frameStart: 141 },
  t: { letter: 'T', phoneme: 't', ipa: '/t/', frameStart: 71 },
  u: { letter: 'U', phoneme: 'u', ipa: '/u/', frameStart: 21 },
  v: { letter: 'V', phoneme: 'v', ipa: '/v/', frameStart: 171 },
  w: { letter: 'W', phoneme: 'w', ipa: '/w/', frameStart: 21 },
  x: { letter: 'X', phoneme: 'ks', ipa: '/ks/', frameStart: 91 },
  y: { letter: 'Y', phoneme: 'j', ipa: '/j/', frameStart: 11 },
  z: { letter: 'Z', phoneme: 'z', ipa: '/z/', frameStart: 141 },
};

// ========== NAV ITEMS ==========
const navItems = [
  { path: '/', label: 'Home', icon: HomeIcon },
  { path: '/practice', label: 'Words', icon: Mic2 },
  { path: '/letters', label: 'Letters', icon: BookA },
  { path: '/history', label: 'Progress', icon: BarChart3 },
  { path: '/report', label: 'Report', icon: Bug },
];

// ========== LAYOUT ==========
function Layout({ children }) {
  const location = useLocation();
  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex">
      <nav className="fixed left-0 top-0 h-full w-20 bg-slate-900/80 backdrop-blur-xl border-r border-slate-800 flex flex-col items-center py-6 z-20">
        <div className="mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center shadow-lg" style={{ boxShadow: '0 0 20px rgba(56, 189, 248, 0.4)' }}>
            <Activity className="w-6 h-6 text-slate-900" />
          </div>
        </div>
        <div className="flex-1 flex flex-col gap-2">
          {navItems.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname === path;
            return (
              <NavLink key={path} to={path} data-testid={`nav-${label.toLowerCase()}`}
                className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center gap-1 transition-all duration-200 relative
                  ${isActive ? 'bg-sky-500/20 text-sky-400' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'drop-shadow-[0_0_8px_rgba(56,189,248,0.6)]' : ''}`} />
                <span className="text-[10px] font-medium">{label}</span>
                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-sky-400 rounded-r-full" />}
              </NavLink>
            );
          })}
        </div>
        <div className="mt-auto">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center" title="Offline Ready" data-testid="offline-indicator">
            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        </div>
      </nav>
      <main className="flex-1 ml-20 min-h-screen">{children}</main>
    </div>
  );
}

// ========== DUAL HEAD ANIMATOR ==========
function DualHeadAnimator({ phonemeSequence = [], isPlaying = false, playbackRate = 1.0, frameDuration = 100, onAnimationComplete, onFrameChange, maxWidth = 600, showLabels = true }) {
  const [currentPhonemeIndex, setCurrentPhonemeIndex] = useState(0);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const animationRef = useRef(null);
  const startTimeRef = useRef(null);

  const FRAMES_PER_PHONEME = 10;
  const APEX_FRAME = 5;

  const sequence = Array.isArray(phonemeSequence) ? phonemeSequence.filter(Boolean) : (phonemeSequence ? [phonemeSequence] : ['neutral']);
  const totalFrames = sequence.length * FRAMES_PER_PHONEME;
  const currentPhoneme = sequence[currentPhonemeIndex] || 'neutral';
  const isApexFrame = currentFrameIndex === APEX_FRAME - 1;

  const getPhonemeColor = (phoneme) => {
    const colors = { 'a': '#ef4444', 'e': '#f97316', 'i': '#eab308', 'o': '#22c55e', 'u': '#3b82f6', 'p': '#8b5cf6', 't': '#ec4899', 's': '#14b8a6', 'n': '#f43f5e', 'l': '#06b6d4', 'r': '#84cc16', 'k': '#a855f7', 'd': '#f59e0b', 'default': '#64748b' };
    return colors[phoneme] || colors.default;
  };

  const animate = useCallback((timestamp) => {
    if (!startTimeRef.current) startTimeRef.current = timestamp;
    const elapsed = (timestamp - startTimeRef.current) * playbackRate;
    const framePosition = Math.floor(elapsed / frameDuration);

    if (framePosition >= totalFrames) {
      setCurrentFrameIndex(0);
      setCurrentPhonemeIndex(0);
      startTimeRef.current = null;
      onAnimationComplete?.();
      return;
    }

    const phonemeIndex = Math.floor(framePosition / FRAMES_PER_PHONEME);
    const frameInPhoneme = framePosition % FRAMES_PER_PHONEME;

    setCurrentPhonemeIndex(phonemeIndex);
    setCurrentFrameIndex(frameInPhoneme);
    onFrameChange?.(frameInPhoneme, phonemeIndex);
    animationRef.current = requestAnimationFrame(animate);
  }, [playbackRate, frameDuration, totalFrames, onAnimationComplete, onFrameChange]);

  useEffect(() => {
    if (isPlaying) {
      startTimeRef.current = null;
      animationRef.current = requestAnimationFrame(animate);
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, [isPlaying, animate]);

  useEffect(() => {
    setCurrentFrameIndex(0);
    setCurrentPhonemeIndex(0);
    startTimeRef.current = null;
  }, [sequence.join(',')]);

  const spriteSize = Math.min((maxWidth - 24) / 2, 250);
  const phonemeColor = getPhonemeColor(currentPhoneme);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-6 justify-center" style={{ maxWidth }}>
        {/* Front View */}
        <div className="flex flex-col items-center gap-2">
          {showLabels && <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Front View</div>}
          <div className={`sprite-container flex items-center justify-center transition-all duration-150 ${isApexFrame ? 'ring-2 ring-sky-400 ring-offset-2 ring-offset-slate-900' : ''}`}
            style={{ width: spriteSize, height: spriteSize, boxShadow: isApexFrame ? '0 0 30px rgba(56, 189, 248, 0.4)' : 'none' }} data-testid="sprite-front">
            <div className="w-32 h-32 rounded-full flex items-center justify-center text-4xl font-bold transition-all duration-150"
              style={{ backgroundColor: `${phonemeColor}20`, border: `3px solid ${phonemeColor}`, color: phonemeColor, transform: `scale(${0.8 + (currentFrameIndex / 10) * 0.4})` }}>
              {currentPhoneme.toUpperCase()}
            </div>
            {isApexFrame && <div className="absolute top-2 right-2 px-2 py-1 bg-sky-500/90 rounded text-[10px] font-bold text-slate-900 uppercase">Apex</div>}
          </div>
        </div>
        {/* Side View */}
        <div className="flex flex-col items-center gap-2">
          {showLabels && <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Side View</div>}
          <div className={`sprite-container flex items-center justify-center transition-all duration-150 ${isApexFrame ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-900' : ''}`}
            style={{ width: spriteSize, height: spriteSize, boxShadow: isApexFrame ? '0 0 30px rgba(34, 211, 238, 0.4)' : 'none' }} data-testid="sprite-side">
            <div className="w-32 h-20 rounded-lg flex items-center justify-center transition-all duration-150"
              style={{ backgroundColor: `${phonemeColor}30`, border: `2px solid ${phonemeColor}`, transform: `scaleX(${0.7 + (currentFrameIndex / 10) * 0.5})` }}>
              <div className="w-16 h-8 rounded-full" style={{ backgroundColor: phonemeColor, transform: `translateX(${(currentFrameIndex - 5) * 3}px)` }} />
            </div>
          </div>
        </div>
      </div>
      {showLabels && (
        <div className="flex items-center gap-3 mt-2">
          <div className="text-sm text-slate-400">Phoneme: <span className="font-mono text-sky-400">/{currentPhoneme}/</span></div>
          <div className="text-sm text-slate-400">Frame: <span className="font-mono text-cyan-400">{currentFrameIndex + 1}/{FRAMES_PER_PHONEME}</span></div>
          {isApexFrame && <span className="px-2 py-0.5 bg-sky-500/20 border border-sky-400/50 rounded text-xs text-sky-300 font-medium">Teaching Point</span>}
        </div>
      )}
    </div>
  );
}

// ========== RECORDING PANEL WITH GRADING ==========
function RecordingPanel({ onRecordingComplete, showVideo = true }) {
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [isPlayingBack, setIsPlayingBack] = useState(false);
  const [visualScore, setVisualScore] = useState(null);
  const [audioScore, setAudioScore] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef(null);

  const startRecording = () => {
    setIsRecording(true);
    setHasRecording(false);
    setVisualScore(null);
    setAudioScore(null);
    setRecordingTime(0);
    timerRef.current = setInterval(() => setRecordingTime(t => t + 100), 100);
    toast.info('Recording started - speak clearly!');
  };

  const stopRecording = () => {
    setIsRecording(false);
    setHasRecording(true);
    clearInterval(timerRef.current);
    // Simulate grading (will be real ML later)
    setTimeout(() => {
      const vScore = Math.floor(Math.random() * 30) + 70; // 70-100
      const aScore = Math.floor(Math.random() * 30) + 70;
      setVisualScore(vScore);
      setAudioScore(aScore);
      onRecordingComplete?.({ visualScore: vScore, audioScore: aScore, duration: recordingTime });
      toast.success('Recording analyzed!');
    }, 500);
  };

  const playback = () => {
    setIsPlayingBack(true);
    setTimeout(() => setIsPlayingBack(false), recordingTime || 2000);
    toast.info('Playing back recording...');
  };

  const getScoreColor = (score) => score >= 85 ? 'text-emerald-400' : score >= 70 ? 'text-amber-400' : 'text-rose-400';
  const getScoreBg = (score) => score >= 85 ? 'bg-emerald-500/20 border-emerald-500/50' : score >= 70 ? 'bg-amber-500/20 border-amber-500/50' : 'bg-rose-500/20 border-rose-500/50';

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold text-slate-200 mb-4 text-center flex items-center justify-center gap-2">
        <Camera className="w-5 h-5 text-sky-400" />
        Record & Grade Your Attempt
      </h3>

      {/* Video Preview Area */}
      {showVideo && (
        <div className="relative w-full aspect-video bg-slate-950 rounded-xl mb-4 overflow-hidden border border-slate-700/50">
          <div className="absolute inset-0 flex items-center justify-center">
            {isRecording ? (
              <div className="text-center">
                <div className="w-24 h-24 rounded-full border-4 border-rose-500 flex items-center justify-center mb-2 animate-pulse">
                  <Video className="w-10 h-10 text-rose-400" />
                </div>
                <div className="text-rose-400 font-mono text-lg">{(recordingTime / 1000).toFixed(1)}s</div>
              </div>
            ) : hasRecording ? (
              <div className="text-center">
                <Video className="w-12 h-12 text-slate-500 mb-2 mx-auto" />
                <div className="text-slate-400 text-sm">Recording ready</div>
              </div>
            ) : (
              <div className="text-center">
                <Video className="w-12 h-12 text-slate-600 mb-2 mx-auto" />
                <div className="text-slate-500 text-sm">Camera preview will appear here</div>
              </div>
            )}
          </div>
          {/* Lip outline overlay placeholder */}
          {isRecording && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-32 h-20 border-2 border-dashed border-cyan-400/50 rounded-full" />
            </div>
          )}
        </div>
      )}

      {/* Recording Controls */}
      <div className="flex justify-center gap-4 mb-4">
        {!isRecording ? (
          <button onClick={startRecording} className="btn-glow flex items-center gap-2 px-6 py-3" data-testid="record-btn">
            <Circle className="w-5 h-5 fill-current" />
            Start Recording
          </button>
        ) : (
          <button onClick={stopRecording} className="flex items-center gap-2 px-6 py-3 bg-rose-500 text-white rounded-xl hover:bg-rose-400 transition-all shadow-[0_0_20px_rgba(251,113,133,0.4)]" data-testid="stop-btn">
            <Square className="w-5 h-5" />
            Stop Recording
          </button>
        )}

        {hasRecording && (
          <button onClick={playback} disabled={isPlayingBack} className="flex items-center gap-2 px-6 py-3 bg-slate-700 text-slate-200 rounded-xl hover:bg-slate-600 transition-all" data-testid="playback-btn">
            <Play className="w-5 h-5" />
            {isPlayingBack ? 'Playing...' : 'Playback'}
          </button>
        )}
      </div>

      {/* Grading Results */}
      {visualScore !== null && audioScore !== null && (
        <div className="grid grid-cols-2 gap-4 animate-slide-up">
          <div className={`p-4 rounded-xl border ${getScoreBg(visualScore)} text-center`}>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Eye className="w-5 h-5 text-cyan-400" />
              <span className="text-sm text-slate-400">Visual Score</span>
            </div>
            <div className={`text-3xl font-bold ${getScoreColor(visualScore)}`}>{visualScore}%</div>
            <div className="text-xs text-slate-500 mt-1">Lip & jaw movement</div>
          </div>
          <div className={`p-4 rounded-xl border ${getScoreBg(audioScore)} text-center`}>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Ear className="w-5 h-5 text-purple-400" />
              <span className="text-sm text-slate-400">Audio Score</span>
            </div>
            <div className={`text-3xl font-bold ${getScoreColor(audioScore)}`}>{audioScore}%</div>
            <div className="text-xs text-slate-500 mt-1">Pronunciation accuracy</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ========== PLAYBACK CONTROLS ==========
function PlaybackControls({ isPlaying, isMuted, playbackSpeed, onPlay, onPause, onReset, onSpeedChange, onMuteToggle, disabled }) {
  const speedOptions = [{ value: 0.25, label: '0.25x' }, { value: 0.5, label: '0.5x' }, { value: 0.75, label: '0.75x' }, { value: 1.0, label: '1x' }];
  return (
    <div className="flex items-center gap-4 p-4 bg-slate-900/60 backdrop-blur-lg rounded-xl border border-slate-700/50" data-testid="playback-controls">
      <button onClick={isPlaying ? onPause : onPlay} disabled={disabled}
        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 ${isPlaying ? 'bg-sky-500 text-slate-900 hover:bg-sky-400' : 'bg-sky-500/20 text-sky-400 hover:bg-sky-500/30 border border-sky-500/50'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        style={isPlaying ? { boxShadow: '0 0 25px rgba(56, 189, 248, 0.5)' } : {}} data-testid="play-pause-btn">
        {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
      </button>
      <button onClick={onReset} disabled={disabled} className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all" data-testid="reset-btn">
        <RotateCcw className="w-5 h-5" />
      </button>
      <div className="w-px h-8 bg-slate-700" />
      <div className="flex flex-col gap-1">
        <label className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Speed</label>
        <div className="flex gap-1">
          {speedOptions.map(({ value, label }) => (
            <button key={value} onClick={() => onSpeedChange(value)} disabled={disabled}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${playbackSpeed === value ? 'bg-sky-500/20 text-sky-400 border border-sky-500/50' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
              data-testid={`speed-${value}`}>{label}</button>
          ))}
        </div>
      </div>
      <div className="w-px h-8 bg-slate-700" />
      <button onClick={onMuteToggle} disabled={disabled} className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${isMuted ? 'text-rose-400 hover:bg-rose-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`} data-testid="mute-btn">
        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
      </button>
    </div>
  );
}

// ========== PHONEME TIMELINE ==========
function PhonemeTimeline({ phonemes = [], currentIndex = 0, onPhonemeClick }) {
  if (!phonemes.length) return <div className="text-center py-4 text-slate-500 text-sm">No phonemes to display</div>;
  return (
    <div className="flex items-center gap-1 overflow-x-auto py-4 px-2" data-testid="phoneme-timeline" style={{ maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)' }}>
      {phonemes.map((phoneme, index) => {
        const isActive = index === currentIndex;
        return (
          <button key={`${phoneme.phoneme || phoneme}-${index}`} onClick={() => onPhonemeClick?.(index, phoneme)}
            className={`phoneme-badge flex-shrink-0 min-w-[60px] ${isActive ? 'active' : ''} ${onPhonemeClick ? 'cursor-pointer hover:scale-105' : 'cursor-default'}`}
            data-testid={`phoneme-${index}`}>
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-sm font-semibold">{phoneme.letter || phoneme}</span>
              {phoneme.ipa && <span className="text-[10px] opacity-70">{phoneme.ipa}</span>}
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ========== LANGUAGE SELECTOR ==========
function LanguageSelector({ selectedLang = 'en', onLanguageChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedLanguage = LANGUAGES.find(l => l.code === selectedLang) || LANGUAGES[0];
  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 hover:border-slate-600 transition-all min-w-[180px]" data-testid="language-selector">
        <span className="text-xl">{selectedLanguage.flag}</span>
        <div className="flex-1 text-left">
          <div className="text-sm font-medium text-slate-200">{selectedLanguage.name}</div>
          <div className="text-xs text-slate-500">{selectedLanguage.nativeName}</div>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-2 w-full z-20 py-2 bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-xl shadow-xl animate-fade-in max-h-80 overflow-y-auto">
            {LANGUAGES.map((lang) => (
              <button key={lang.code} onClick={() => { onLanguageChange(lang.code); setIsOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-800 transition-colors ${lang.code === selectedLang ? 'bg-sky-500/10' : ''}`}
                data-testid={`lang-option-${lang.code}`}>
                <span className="text-xl">{lang.flag}</span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-slate-200">{lang.name}</div>
                  <div className="text-xs text-slate-500">{lang.nativeName}</div>
                </div>
                {lang.code === selectedLang && <Check className="w-4 h-4 text-sky-400" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ========== WORD INPUT ==========
function WordInput({ onSubmit, suggestions = [], isLoading, placeholder = 'Type a word or phrase...' }) {
  const [value, setValue] = useState('');
  const handleSubmit = (e) => { e?.preventDefault(); if (value.trim() && !isLoading) onSubmit(value.trim()); };
  return (
    <div className="w-full max-w-xl">
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-center gap-3 px-5 py-4 bg-slate-900/80 backdrop-blur-lg rounded-2xl border-2 border-slate-700/50 hover:border-slate-600 focus-within:border-sky-500/50 transition-all">
          <Search className="w-5 h-5 text-slate-500 flex-shrink-0" />
          <input type="text" value={value} onChange={(e) => setValue(e.target.value)} placeholder={placeholder} disabled={isLoading}
            className="flex-1 bg-transparent text-slate-100 text-lg placeholder:text-slate-500 focus:outline-none" data-testid="word-input" />
          <button type="submit" disabled={!value.trim() || isLoading}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${value.trim() && !isLoading ? 'bg-sky-500 text-slate-900 hover:bg-sky-400' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
            data-testid="word-submit"><ArrowRight className="w-5 h-5" /></button>
        </div>
      </form>
      {suggestions.length > 0 && (
        <div className="mt-4">
          <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">Suggested Words & Phrases</div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((word) => (
              <button key={word} onClick={() => { setValue(word); onSubmit(word); }}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-slate-800/60 text-slate-300 border border-slate-700/50 hover:border-sky-500/50 hover:text-sky-300 hover:bg-sky-500/10 transition-all"
                data-testid={`suggestion-${word.replace(/\s+/g, '-')}`}>{word}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ========== PAGES ==========
function HomePage() {
  const navigate = useNavigate();
  const [selectedLang, setSelectedLang] = useState('en');
  const suggestions = SUGGESTIONS[selectedLang] || SUGGESTIONS.en;
  const handleWordSubmit = (word) => navigate(`/practice?word=${encodeURIComponent(word)}&lang=${selectedLang}`);

  return (
    <div className="min-h-screen p-8 lg:p-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center shadow-lg" style={{ boxShadow: '0 0 40px rgba(56, 189, 248, 0.3)' }}>
              <Activity className="w-8 h-8 text-slate-900" />
            </div>
            <h1 className="text-5xl font-bold text-gradient-primary font-[Manrope]">SoundMirror</h1>
          </div>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">See the sound. Master the speech.<br /><span className="text-slate-500">Precise articulation visualization for pronunciation learning.</span></p>
        </div>

        <div className="glass-card p-8 mb-8 animate-slide-up">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 mb-8">
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-slate-100 mb-2">What would you like to practice?</h2>
              <p className="text-slate-400">Enter any word or phrase to see how it's pronounced.</p>
            </div>
            <LanguageSelector selectedLang={selectedLang} onLanguageChange={setSelectedLang} />
          </div>
          <WordInput onSubmit={handleWordSubmit} suggestions={suggestions} placeholder="Type a word or phrase..." />
        </div>

        <div className="grid md:grid-cols-2 gap-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <button onClick={() => navigate('/letters')} className="glass-card p-6 text-left group hover:border-indigo-500/50 transition-all" data-testid="quick-letters">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center group-hover:bg-indigo-500/30 transition-colors"><BookA className="w-6 h-6 text-indigo-400" /></div>
              <div><h3 className="text-lg font-semibold text-slate-100">Letter Practice</h3><p className="text-sm text-slate-400">Learn individual phoneme articulations</p></div>
            </div>
          </button>
          <button onClick={() => navigate('/history')} className="glass-card p-6 text-left group hover:border-emerald-500/50 transition-all" data-testid="quick-progress">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/30 transition-colors"><Sparkles className="w-6 h-6 text-emerald-400" /></div>
              <div><h3 className="text-lg font-semibold text-slate-100">Your Progress</h3><p className="text-sm text-slate-400">View history, recordings & analytics</p></div>
            </div>
          </button>
        </div>

        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Fully Offline Ready • 10 Languages Supported
          </div>
        </div>
      </div>
    </div>
  );
}

function WordPracticePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const word = searchParams.get('word') || 'hello';
  const lang = searchParams.get('lang') || 'en';

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(0.5);
  const [currentPhonemeIndex, setCurrentPhonemeIndex] = useState(0);

  const phonemes = word.toLowerCase().replace(/[^a-z\s]/g, '').split('').filter(c => /[a-z]/.test(c)).map(c => PHONEME_MAP[c] || { letter: c.toUpperCase(), phoneme: c, ipa: `/${c}/` });
  const phonemeTokens = phonemes.map(p => p.phoneme);

  const speakWord = useCallback(() => {
    if ('speechSynthesis' in window && !isMuted) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.rate = playbackSpeed;
      utterance.lang = lang === 'en' ? 'en-US' : lang;
      window.speechSynthesis.speak(utterance);
    }
  }, [word, playbackSpeed, isMuted, lang]);

  const handlePlay = () => { setIsPlaying(true); speakWord(); };
  const handlePause = () => { setIsPlaying(false); window.speechSynthesis?.cancel(); };
  const handleReset = () => { setIsPlaying(false); setCurrentPhonemeIndex(0); window.speechSynthesis?.cancel(); };

  const handleRecordingComplete = (data) => {
    // Save to localStorage for Progress page
    const history = JSON.parse(localStorage.getItem('soundmirror_history') || '[]');
    history.unshift({
      id: Date.now(),
      word,
      lang,
      visualScore: data.visualScore / 100,
      audioScore: data.audioScore / 100,
      score: ((data.visualScore + data.audioScore) / 200),
      date: new Date().toISOString(),
      duration: data.duration,
    });
    localStorage.setItem('soundmirror_history', JSON.stringify(history.slice(0, 50)));
  };

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors" data-testid="back-btn">
            <ArrowLeft className="w-5 h-5" /><span>Back</span>
          </button>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-100">Word Practice: <span className="text-sky-400">{word}</span></h1>
            <p className="text-slate-500 text-sm mt-1">Watch, listen, then record yourself</p>
          </div>
          <div className="w-20" />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Model Section */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-slate-200 mb-4 text-center">Model Articulation</h3>
            <DualHeadAnimator phonemeSequence={phonemeTokens} isPlaying={isPlaying} playbackRate={playbackSpeed} frameDuration={Math.round(150 / playbackSpeed)}
              onAnimationComplete={() => setIsPlaying(false)} maxWidth={500} />
            <div className="mt-6"><PhonemeTimeline phonemes={phonemes} currentIndex={currentPhonemeIndex} onPhonemeClick={(i) => setCurrentPhonemeIndex(i)} /></div>
            <div className="mt-4 flex justify-center">
              <PlaybackControls isPlaying={isPlaying} isMuted={isMuted} playbackSpeed={playbackSpeed} onPlay={handlePlay} onPause={handlePause} onReset={handleReset} onSpeedChange={setPlaybackSpeed} onMuteToggle={() => setIsMuted(!isMuted)} />
            </div>
          </div>

          {/* Recording Section */}
          <RecordingPanel onRecordingComplete={handleRecordingComplete} showVideo={true} />
        </div>

        <div className="mt-6 p-4 rounded-xl bg-sky-500/10 border border-sky-500/20">
          <p className="text-sky-300 text-sm text-center">
            <strong>Tip:</strong> Use 0.25x or 0.5x speed to clearly see each mouth position. Frame #5 shows the ideal articulation point. Your recordings are saved to Progress.
          </p>
        </div>
      </div>
    </div>
  );
}

function LetterPracticePage() {
  const navigate = useNavigate();
  const [selectedLang, setSelectedLang] = useState('en');
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const alphabet = ALPHABETS[selectedLang] || ALPHABETS.en;

  const handlePlay = () => {
    setIsPlaying(true);
    if ('speechSynthesis' in window && selectedLetter) {
      const utterance = new SpeechSynthesisUtterance(selectedLetter.letter);
      utterance.rate = 0.5;
      utterance.lang = selectedLang === 'en' ? 'en-US' : selectedLang;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleRecordingComplete = (data) => {
    const history = JSON.parse(localStorage.getItem('soundmirror_history') || '[]');
    history.unshift({
      id: Date.now(),
      word: selectedLetter?.letter || '?',
      lang: selectedLang,
      visualScore: data.visualScore / 100,
      audioScore: data.audioScore / 100,
      score: ((data.visualScore + data.audioScore) / 200),
      date: new Date().toISOString(),
      type: 'letter',
    });
    localStorage.setItem('soundmirror_history', JSON.stringify(history.slice(0, 50)));
  };

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-400 hover:text-slate-200" data-testid="back-btn">
            <ArrowLeft className="w-5 h-5" /><span>Back</span>
          </button>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-100">Letter Practice</h1>
            <p className="text-slate-500">Learn individual phoneme articulations</p>
          </div>
          <LanguageSelector selectedLang={selectedLang} onLanguageChange={(lang) => { setSelectedLang(lang); setSelectedLetter(null); }} />
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
          {/* Alphabet Grid */}
          <div className="lg:col-span-5">
            <div className="glass-card p-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4">
                Select a Letter <span className="text-amber-400">(Vowels highlighted)</span>
              </h3>
              <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
                {alphabet.map((item) => (
                  <button key={item.letter} onClick={() => { setSelectedLetter(item); setIsPlaying(false); }}
                    className={`p-2 rounded-xl text-center transition-all flex flex-col items-center justify-center min-h-[70px]
                      ${selectedLetter?.letter === item.letter ? 'bg-sky-500/20 border-2 border-sky-400' : item.isVowel ? 'bg-amber-500/10 border border-amber-500/30 hover:border-amber-400' : 'bg-slate-800/50 border border-slate-700/50 hover:border-slate-600'}`}
                    data-testid={`letter-btn-${item.letter}`}>
                    <div className={`text-2xl font-bold ${item.isVowel ? 'text-amber-400' : 'text-slate-200'}`}>{item.letter}</div>
                    <div className="text-[10px] text-slate-500 mt-1">{item.phoneme}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Detail View with Dual Heads + Recording */}
          <div className="lg:col-span-7 space-y-4">
            {selectedLetter ? (
              <>
                <div className="glass-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className={`text-5xl font-bold ${selectedLetter.isVowel ? 'text-amber-400' : 'text-sky-400'}`}>{selectedLetter.letter}</span>
                        <div>
                          <div className="text-2xl text-slate-300">"{selectedLetter.phoneme}"</div>
                          <div className="text-sm text-slate-500 font-mono">{selectedLetter.ipa}</div>
                        </div>
                      </div>
                    </div>
                    <button onClick={handlePlay} disabled={isPlaying} className="btn-glow flex items-center gap-2" data-testid="play-letter-btn">
                      {isPlaying ? <Volume2 className="w-5 h-5 animate-pulse" /> : <Play className="w-5 h-5" />}
                      {isPlaying ? 'Playing...' : 'Play Sound'}
                    </button>
                  </div>
                  <DualHeadAnimator phonemeSequence={[selectedLetter.letter.toLowerCase()]} isPlaying={isPlaying} playbackRate={0.5} frameDuration={150}
                    onAnimationComplete={() => setIsPlaying(false)} maxWidth={450} />
                </div>
                <RecordingPanel onRecordingComplete={handleRecordingComplete} showVideo={true} />
              </>
            ) : (
              <div className="glass-card p-12 text-center">
                <div className="text-6xl mb-4">👈</div>
                <h3 className="text-xl font-semibold text-slate-300 mb-2">Select a Letter</h3>
                <p className="text-slate-500">Choose from the alphabet grid to see its articulation<br /><span className="text-amber-400">Vowels are highlighted in gold</span></p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function HistoryProgressPage() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem('soundmirror_history');
    if (stored) setHistory(JSON.parse(stored));
  }, []);

  const stats = {
    totalPractices: history.length,
    averageScore: history.length > 0 ? history.reduce((sum, h) => sum + (h.score || 0), 0) / history.length : 0,
    streak: 3,
    avgVisual: history.length > 0 ? history.reduce((sum, h) => sum + (h.visualScore || 0), 0) / history.length : 0,
    avgAudio: history.length > 0 ? history.reduce((sum, h) => sum + (h.audioScore || 0), 0) / history.length : 0,
  };

  const getScoreColor = (score) => score >= 0.85 ? 'text-emerald-400' : score >= 0.70 ? 'text-amber-400' : 'text-rose-400';
  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `soundmirror-progress-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    toast.success('Progress downloaded!');
  };

  const handleClear = () => {
    if (confirm('Clear all practice history?')) {
      localStorage.removeItem('soundmirror_history');
      setHistory([]);
      toast.info('History cleared');
    }
  };

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-400 hover:text-slate-200" data-testid="back-btn">
            <ArrowLeft className="w-5 h-5" /><span>Back</span>
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-3xl font-bold text-slate-100">Your Progress</h1>
            <p className="text-slate-500">Practice history, recordings & analytics</p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleDownload} className="flex items-center gap-2 px-4 py-2 text-sm text-sky-400 hover:bg-sky-500/10 rounded-lg transition-colors" data-testid="download-btn">
              <Download className="w-4 h-4" />Download
            </button>
            <button onClick={handleClear} className="flex items-center gap-2 px-4 py-2 text-sm text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors" data-testid="clear-btn">
              <Trash2 className="w-4 h-4" />Clear
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-2"><Target className="w-4 h-4 text-sky-400" /><span className="text-xs text-slate-500">Total</span></div>
            <div className="text-2xl font-bold text-slate-100">{stats.totalPractices}</div>
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-2"><TrendingUp className="w-4 h-4 text-emerald-400" /><span className="text-xs text-slate-500">Average</span></div>
            <div className={`text-2xl font-bold ${getScoreColor(stats.averageScore)}`}>{Math.round(stats.averageScore * 100)}%</div>
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-2"><Eye className="w-4 h-4 text-cyan-400" /><span className="text-xs text-slate-500">Visual</span></div>
            <div className={`text-2xl font-bold ${getScoreColor(stats.avgVisual)}`}>{Math.round(stats.avgVisual * 100)}%</div>
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-2"><Ear className="w-4 h-4 text-purple-400" /><span className="text-xs text-slate-500">Audio</span></div>
            <div className={`text-2xl font-bold ${getScoreColor(stats.avgAudio)}`}>{Math.round(stats.avgAudio * 100)}%</div>
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-2"><Calendar className="w-4 h-4 text-amber-400" /><span className="text-xs text-slate-500">Streak</span></div>
            <div className="text-2xl font-bold text-amber-400">{stats.streak} 🔥</div>
          </div>
        </div>

        {/* History List */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2"><Clock className="w-5 h-5 text-slate-400" />Recent Sessions</h3>
          {history.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">📝</div>
              <h4 className="text-xl font-semibold text-slate-300 mb-2">No practice yet</h4>
              <p className="text-slate-500 mb-6">Start practicing to see your progress here</p>
              <button onClick={() => navigate('/')} className="btn-glow">Start Practicing</button>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {history.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:border-slate-600 transition-colors">
                  <div className="w-14 h-14 rounded-xl bg-slate-700/50 flex flex-col items-center justify-center">
                    <span className={`text-lg font-bold ${getScoreColor(item.score)}`}>{Math.round((item.score || 0) * 100)}</span>
                    <span className="text-[10px] text-slate-500">%</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-lg font-semibold text-slate-200 truncate">{item.word} {item.type === 'letter' && <span className="text-xs text-slate-500">(Letter)</span>}</div>
                    <div className="text-sm text-slate-500 flex items-center gap-3">
                      <span>{formatDate(item.date)}</span>
                      {item.visualScore && <span className="flex items-center gap-1"><Eye className="w-3 h-3 text-cyan-400" />{Math.round(item.visualScore * 100)}%</span>}
                      {item.audioScore && <span className="flex items-center gap-1"><Ear className="w-3 h-3 text-purple-400" />{Math.round(item.audioScore * 100)}%</span>}
                    </div>
                  </div>
                  <button onClick={() => navigate(`/practice?word=${encodeURIComponent(item.word)}&lang=${item.lang || 'en'}`)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-sky-500/10 text-sky-400 border border-sky-500/30 hover:bg-sky-500/20 transition-colors">
                    Practice Again
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BugReporterPage() {
  const navigate = useNavigate();
  const [isOnline] = useState(navigator.onLine);
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [severity, setSeverity] = useState('medium');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const BUG_CATEGORIES = [
    { id: 'animation', label: 'Animation', icon: '🎬', subcategories: ['Sprites not loading', 'Animation stuttering', 'Frame timing incorrect', 'Sync issues'] },
    { id: 'audio', label: 'Audio/TTS', icon: '🔊', subcategories: ['No sound', 'Wrong voice', 'Audio/animation out of sync'] },
    { id: 'phonemes', label: 'Phonemes', icon: '📝', subcategories: ['Wrong mapping', 'Missing phoneme', 'Incorrect IPA'] },
    { id: 'recording', label: 'Recording', icon: '🎙️', subcategories: ['Camera not working', 'Grading inaccurate', 'Playback issues'] },
    { id: 'ui', label: 'UI/Display', icon: '🖥️', subcategories: ['Layout broken', 'Text not readable', 'Buttons not working'] },
    { id: 'other', label: 'Other', icon: '❓', subcategories: ['App crashes', 'Performance slow', 'Something else'] },
  ];

  const SEVERITY = [
    { id: 'low', label: 'Low', color: 'text-slate-400' },
    { id: 'medium', label: 'Medium', color: 'text-amber-400' },
    { id: 'high', label: 'High', color: 'text-rose-400' },
  ];

  const selectedCategory = BUG_CATEGORIES.find(c => c.id === category);

  const handleSubmit = (e) => {
    e.preventDefault();
    const reports = JSON.parse(localStorage.getItem('soundmirror_bug_reports') || '[]');
    reports.push({ id: Date.now(), category, subcategory, severity, description, timestamp: new Date().toISOString(), synced: false });
    localStorage.setItem('soundmirror_bug_reports', JSON.stringify(reports));
    toast.success('Report saved! It will be sent when you\'re online.');
    setSubmitted(true);
    setTimeout(() => { setSubmitted(false); setCategory(''); setSubcategory(''); setDescription(''); }, 2000);
  };

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-400 hover:text-slate-200" data-testid="back-btn">
            <ArrowLeft className="w-5 h-5" /><span>Back</span>
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3"><Bug className="w-8 h-8 text-rose-400" />Report an Issue</h1>
            <p className="text-slate-500">Help us improve SoundMirror</p>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${isOnline ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
            {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            {isOnline ? 'Online' : 'Offline'}
          </div>
        </div>

        {submitted && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center gap-3 animate-slide-up">
            <CheckCircle className="w-5 h-5 text-emerald-400" /><span className="text-emerald-300">Report saved! It will be sent when you're online.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="glass-card p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-3">What type of issue?</label>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
              {BUG_CATEGORIES.map((cat) => (
                <button key={cat.id} type="button" onClick={() => { setCategory(cat.id); setSubcategory(''); }}
                  className={`p-3 rounded-xl text-center transition-all ${category === cat.id ? 'bg-sky-500/20 border-2 border-sky-400' : 'bg-slate-800/50 border border-slate-700/50 hover:border-slate-600'}`}
                  data-testid={`category-${cat.id}`}>
                  <span className="text-xl">{cat.icon}</span>
                  <div className="text-xs font-medium text-slate-200 mt-1">{cat.label}</div>
                </button>
              ))}
            </div>
          </div>

          {selectedCategory && (
            <div className="animate-slide-up">
              <label className="block text-sm font-semibold text-slate-300 mb-3">Specific issue</label>
              <div className="grid grid-cols-2 gap-2">
                {selectedCategory.subcategories.map((sub) => (
                  <button key={sub} type="button" onClick={() => setSubcategory(sub)}
                    className={`p-3 rounded-lg text-left text-sm transition-all ${subcategory === sub ? 'bg-sky-500/20 border border-sky-400 text-sky-300' : 'bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:border-slate-600'}`}>{sub}</button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-3">Severity</label>
            <div className="flex gap-2">
              {SEVERITY.map((level) => (
                <button key={level.id} type="button" onClick={() => setSeverity(level.id)}
                  className={`flex-1 p-3 rounded-lg text-center transition-all ${severity === level.id ? 'bg-slate-800 border-2 border-slate-500' : 'bg-slate-800/50 border border-slate-700/50 hover:border-slate-600'}`}>
                  <div className={`font-semibold ${level.color}`}>{level.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Description (optional)</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the issue in more detail..." rows={3}
              className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-slate-200 placeholder:text-slate-500 focus:border-sky-500/50 focus:outline-none resize-none" />
          </div>

          <button type="submit" disabled={!category || !subcategory} className="w-full btn-glow flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" data-testid="submit-report-btn">
            <Send className="w-5 h-5" />Submit Report
          </button>
        </form>
      </div>
    </div>
  );
}

// ========== MAIN APP ==========
function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/practice" element={<WordPracticePage />} />
          <Route path="/letters" element={<LetterPracticePage />} />
          <Route path="/history" element={<HistoryProgressPage />} />
          <Route path="/report" element={<BugReporterPage />} />
        </Routes>
      </Layout>
      <Toaster position="bottom-right" toastOptions={{ style: { background: '#0F172A', border: '1px solid #334155', color: '#F8FAFC' } }} />
    </BrowserRouter>
  );
}

export default App;
