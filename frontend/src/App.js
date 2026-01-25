import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Activity, Home as HomeIcon, Mic2, BookA, BarChart3, Bug, Play, Pause, RotateCcw, Volume2, VolumeX, ArrowLeft, Search, ArrowRight, ChevronDown, Check, Send, Wifi, WifiOff, Trash2, Clock, TrendingUp, Target, Award, Calendar, CheckCircle, AlertCircle, Square, Sparkles } from 'lucide-react';
import { Toaster, toast } from 'sonner';

// ========== PHONEME DATA ==========
const PHONEME_MAP = {
  a: { letter: 'A', phoneme: 'a', ipa: '/a/', frameStart: 1, example: 'father' },
  b: { letter: 'B', phoneme: 'b', ipa: '/b/', frameStart: 61, example: 'bat' },
  c: { letter: 'C', phoneme: 'k', ipa: '/k/', frameStart: 91, example: 'cat' },
  d: { letter: 'D', phoneme: 'd', ipa: '/d/', frameStart: 81, example: 'dog' },
  e: { letter: 'E', phoneme: 'ɛ', ipa: '/ɛ/', frameStart: 31, example: 'bed' },
  f: { letter: 'F', phoneme: 'f', ipa: '/f/', frameStart: 171, example: 'fan' },
  g: { letter: 'G', phoneme: 'g', ipa: '/g/', frameStart: 101, example: 'go' },
  h: { letter: 'H', phoneme: 'h', ipa: '/h/', frameStart: 181, example: 'hat' },
  i: { letter: 'I', phoneme: 'i', ipa: '/i/', frameStart: 11, example: 'see' },
  j: { letter: 'J', phoneme: 'dʒ', ipa: '/dʒ/', frameStart: 191, example: 'jam' },
  k: { letter: 'K', phoneme: 'k', ipa: '/k/', frameStart: 91, example: 'key' },
  l: { letter: 'L', phoneme: 'l', ipa: '/l/', frameStart: 211, example: 'lip' },
  m: { letter: 'M', phoneme: 'm', ipa: '/m/', frameStart: 61, example: 'mom' },
  n: { letter: 'N', phoneme: 'n', ipa: '/n/', frameStart: 121, example: 'no' },
  o: { letter: 'O', phoneme: 'o', ipa: '/o/', frameStart: 41, example: 'go' },
  p: { letter: 'P', phoneme: 'p', ipa: '/p/', frameStart: 61, example: 'pat' },
  q: { letter: 'Q', phoneme: 'k', ipa: '/k/', frameStart: 91, example: 'queen' },
  r: { letter: 'R', phoneme: 'r', ipa: '/r/', frameStart: 201, example: 'red' },
  s: { letter: 'S', phoneme: 's', ipa: '/s/', frameStart: 141, example: 'see' },
  t: { letter: 'T', phoneme: 't', ipa: '/t/', frameStart: 71, example: 'top' },
  u: { letter: 'U', phoneme: 'u', ipa: '/u/', frameStart: 21, example: 'food' },
  v: { letter: 'V', phoneme: 'v', ipa: '/v/', frameStart: 171, example: 'van' },
  w: { letter: 'W', phoneme: 'w', ipa: '/w/', frameStart: 21, example: 'win' },
  x: { letter: 'X', phoneme: 'ks', ipa: '/ks/', frameStart: 91, example: 'box' },
  y: { letter: 'Y', phoneme: 'j', ipa: '/j/', frameStart: 11, example: 'yes' },
  z: { letter: 'Z', phoneme: 'z', ipa: '/z/', frameStart: 141, example: 'zoo' },
};

const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
];

const SUGGESTIONS = {
  en: ['hello', 'water', 'beautiful', 'pronunciation', 'opportunity'],
  es: ['hola', 'agua', 'hermoso', 'comunicación'],
  fr: ['bonjour', 'eau', 'magnifique'],
  de: ['hallo', 'wasser', 'schön'],
  ar: ['مرحبا', 'ماء', 'جميل'],
};

// ========== LAYOUT ==========
const navItems = [
  { path: '/', label: 'Home', icon: HomeIcon },
  { path: '/practice', label: 'Practice', icon: Mic2 },
  { path: '/letters', label: 'Letters', icon: BookA },
  { path: '/history', label: 'Progress', icon: BarChart3 },
  { path: '/report', label: 'Report', icon: Bug },
];

function Layout({ children }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex">
      <nav className="fixed left-0 top-0 h-full w-20 bg-slate-900/80 backdrop-blur-xl border-r border-slate-800 flex flex-col items-center py-6 z-20">
        <div className="mb-8">
          <div 
            className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center shadow-lg"
            style={{ boxShadow: '0 0 20px rgba(56, 189, 248, 0.4)' }}
          >
            <Activity className="w-6 h-6 text-slate-900" />
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-2">
          {navItems.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname === path;
            return (
              <NavLink
                key={path}
                to={path}
                data-testid={`nav-${label.toLowerCase()}`}
                className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center gap-1 transition-all duration-200 group relative
                  ${isActive ? 'bg-sky-500/20 text-sky-400' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'}`}
              >
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
function DualHeadAnimator({ phonemeSequence = [], isPlaying = false, playbackRate = 1.0, frameDuration = 100, onAnimationComplete, maxWidth = 600 }) {
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

  // Animation using placeholder colored boxes (until sprites are loaded)
  const getPhonemeColor = (phoneme) => {
    const colors = {
      'a': '#ef4444', 'e': '#f97316', 'i': '#eab308', 'o': '#22c55e', 'u': '#3b82f6',
      'p': '#8b5cf6', 't': '#ec4899', 's': '#14b8a6', 'n': '#f43f5e', 'l': '#06b6d4',
      'r': '#84cc16', 'k': '#a855f7', 'd': '#f59e0b', 'default': '#64748b'
    };
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
    animationRef.current = requestAnimationFrame(animate);
  }, [playbackRate, frameDuration, totalFrames, onAnimationComplete]);

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
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Front View</div>
          <div 
            className={`sprite-container flex items-center justify-center transition-all duration-150 ${isApexFrame ? 'ring-2 ring-sky-400 ring-offset-2 ring-offset-slate-900' : ''}`}
            style={{ width: spriteSize, height: spriteSize, boxShadow: isApexFrame ? '0 0 30px rgba(56, 189, 248, 0.4)' : 'none' }}
            data-testid="sprite-front"
          >
            <div 
              className="w-32 h-32 rounded-full flex items-center justify-center text-4xl font-bold transition-all duration-150"
              style={{ backgroundColor: `${phonemeColor}20`, border: `3px solid ${phonemeColor}`, color: phonemeColor, transform: `scale(${0.8 + (currentFrameIndex / 10) * 0.4})` }}
            >
              {currentPhoneme.toUpperCase()}
            </div>
            {isApexFrame && <div className="absolute top-2 right-2 px-2 py-1 bg-sky-500/90 rounded text-[10px] font-bold text-slate-900 uppercase">Apex</div>}
          </div>
        </div>

        {/* Side View */}
        <div className="flex flex-col items-center gap-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Side View</div>
          <div 
            className={`sprite-container flex items-center justify-center transition-all duration-150 ${isApexFrame ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-900' : ''}`}
            style={{ width: spriteSize, height: spriteSize, boxShadow: isApexFrame ? '0 0 30px rgba(34, 211, 238, 0.4)' : 'none' }}
            data-testid="sprite-side"
          >
            <div 
              className="w-32 h-20 rounded-lg flex items-center justify-center transition-all duration-150"
              style={{ backgroundColor: `${phonemeColor}30`, border: `2px solid ${phonemeColor}`, transform: `scaleX(${0.7 + (currentFrameIndex / 10) * 0.5})` }}
            >
              <div className="w-16 h-8 rounded-full" style={{ backgroundColor: phonemeColor, transform: `translateX(${(currentFrameIndex - 5) * 3}px)` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-2">
        <div className="text-sm text-slate-400">Phoneme: <span className="font-mono text-sky-400">/{currentPhoneme}/</span></div>
        <div className="text-sm text-slate-400">Frame: <span className="font-mono text-cyan-400">{currentFrameIndex + 1}/{FRAMES_PER_PHONEME}</span></div>
        {isApexFrame && <span className="px-2 py-0.5 bg-sky-500/20 border border-sky-400/50 rounded text-xs text-sky-300 font-medium">Teaching Point</span>}
      </div>
    </div>
  );
}

// ========== PLAYBACK CONTROLS ==========
function PlaybackControls({ isPlaying, isMuted, playbackSpeed, onPlay, onPause, onReset, onSpeedChange, onMuteToggle, disabled }) {
  const speedOptions = [{ value: 0.25, label: '0.25x' }, { value: 0.5, label: '0.5x' }, { value: 0.75, label: '0.75x' }, { value: 1.0, label: '1x' }];

  return (
    <div className="flex items-center gap-4 p-4 bg-slate-900/60 backdrop-blur-lg rounded-xl border border-slate-700/50" data-testid="playback-controls">
      <button
        onClick={isPlaying ? onPause : onPlay}
        disabled={disabled}
        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 focus-ring
          ${isPlaying ? 'bg-sky-500 text-slate-900 hover:bg-sky-400' : 'bg-sky-500/20 text-sky-400 hover:bg-sky-500/30 border border-sky-500/50'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        style={isPlaying ? { boxShadow: '0 0 25px rgba(56, 189, 248, 0.5)' } : {}}
        data-testid="play-pause-btn"
      >
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
            <button
              key={value}
              onClick={() => onSpeedChange(value)}
              disabled={disabled}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-all
                ${playbackSpeed === value ? 'bg-sky-500/20 text-sky-400 border border-sky-500/50' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
              data-testid={`speed-${value}`}
            >
              {label}
            </button>
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
          <button
            key={`${phoneme.phoneme || phoneme}-${index}`}
            onClick={() => onPhonemeClick?.(index, phoneme)}
            className={`phoneme-badge flex-shrink-0 min-w-[60px] ${isActive ? 'active' : ''} ${onPhonemeClick ? 'cursor-pointer hover:scale-105' : 'cursor-default'}`}
            data-testid={`phoneme-${index}`}
          >
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
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 hover:border-slate-600 transition-all min-w-[180px]"
        data-testid="language-selector"
      >
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
          <div className="absolute top-full left-0 mt-2 w-full z-20 py-2 bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-xl shadow-xl animate-fade-in">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => { onLanguageChange(lang.code); setIsOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-800 transition-colors ${lang.code === selectedLang ? 'bg-sky-500/10' : ''}`}
                data-testid={`lang-option-${lang.code}`}
              >
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

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (value.trim() && !isLoading) onSubmit(value.trim());
  };

  return (
    <div className="w-full max-w-xl">
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-center gap-3 px-5 py-4 bg-slate-900/80 backdrop-blur-lg rounded-2xl border-2 border-slate-700/50 hover:border-slate-600 focus-within:border-sky-500/50 transition-all">
          <Search className="w-5 h-5 text-slate-500 flex-shrink-0" />
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            disabled={isLoading}
            className="flex-1 bg-transparent text-slate-100 text-lg placeholder:text-slate-500 focus:outline-none"
            data-testid="word-input"
          />
          <button
            type="submit"
            disabled={!value.trim() || isLoading}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${value.trim() && !isLoading ? 'bg-sky-500 text-slate-900 hover:bg-sky-400' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
            data-testid="word-submit"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </form>

      {suggestions.length > 0 && (
        <div className="mt-4">
          <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">Suggested Words</div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((word) => (
              <button
                key={word}
                onClick={() => { setValue(word); onSubmit(word); }}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-slate-800/60 text-slate-300 border border-slate-700/50 hover:border-sky-500/50 hover:text-sky-300 hover:bg-sky-500/10 transition-all"
                data-testid={`suggestion-${word}`}
              >
                {word}
              </button>
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

  const handleWordSubmit = (word) => {
    navigate(`/practice?word=${encodeURIComponent(word)}&lang=${selectedLang}`);
  };

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
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            See the sound. Master the speech.
            <br /><span className="text-slate-500">Precise articulation visualization for pronunciation learning.</span>
          </p>
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
              <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center group-hover:bg-indigo-500/30 transition-colors">
                <BookA className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-100">Practice Letters</h3>
                <p className="text-sm text-slate-400">Learn individual phoneme articulations</p>
              </div>
            </div>
          </button>

          <button onClick={() => navigate('/history')} className="glass-card p-6 text-left group hover:border-emerald-500/50 transition-all" data-testid="quick-progress">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/30 transition-colors">
                <Sparkles className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-100">Your Progress</h3>
                <p className="text-sm text-slate-400">View practice history and improvements</p>
              </div>
            </div>
          </button>
        </div>

        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Fully Offline Ready
          </div>
        </div>
      </div>
    </div>
  );
}

function PracticePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const word = searchParams.get('word') || 'hello';
  const lang = searchParams.get('lang') || 'en';

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(0.5);
  const [currentPhonemeIndex, setCurrentPhonemeIndex] = useState(0);

  const phonemes = word.toLowerCase().split('').filter(c => /[a-z]/.test(c)).map(c => PHONEME_MAP[c] || { letter: c.toUpperCase(), phoneme: c, ipa: `/${c}/` });
  const phonemeTokens = phonemes.map(p => p.phoneme);

  const speakWord = useCallback(() => {
    if ('speechSynthesis' in window && !isMuted) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.rate = playbackSpeed;
      window.speechSynthesis.speak(utterance);
    }
  }, [word, playbackSpeed, isMuted]);

  const handlePlay = () => { setIsPlaying(true); speakWord(); };
  const handlePause = () => { setIsPlaying(false); window.speechSynthesis?.cancel(); };
  const handleReset = () => { setIsPlaying(false); setCurrentPhonemeIndex(0); window.speechSynthesis?.cancel(); };

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors" data-testid="back-btn">
            <ArrowLeft className="w-5 h-5" /><span>Back</span>
          </button>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-100">Practice: <span className="text-sky-400">{word}</span></h1>
            <p className="text-slate-500 text-sm mt-1">Watch the articulation, then record yourself</p>
          </div>
          <div className="w-20" />
        </div>

        <div className="glass-card p-8 mb-6">
          <DualHeadAnimator
            phonemeSequence={phonemeTokens}
            isPlaying={isPlaying}
            playbackRate={playbackSpeed}
            frameDuration={Math.round(150 / playbackSpeed)}
            onAnimationComplete={() => setIsPlaying(false)}
            maxWidth={600}
          />
          <div className="mt-8">
            <PhonemeTimeline phonemes={phonemes} currentIndex={currentPhonemeIndex} onPhonemeClick={(i) => setCurrentPhonemeIndex(i)} />
          </div>
          <div className="mt-6 flex justify-center">
            <PlaybackControls isPlaying={isPlaying} isMuted={isMuted} playbackSpeed={playbackSpeed} onPlay={handlePlay} onPause={handlePause} onReset={handleReset} onSpeedChange={setPlaybackSpeed} onMuteToggle={() => setIsMuted(!isMuted)} />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/20">
          <p className="text-sky-300 text-sm text-center">
            <strong>Tip:</strong> Use 0.25x or 0.5x speed to clearly see each mouth position. Frame #5 shows the ideal articulation point.
          </p>
        </div>
      </div>
    </div>
  );
}

function LetterPracticePage() {
  const navigate = useNavigate();
  const [selectedPhoneme, setSelectedPhoneme] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const PHONEMES = [
    { id: 'a', ipa: '/a/', name: 'ah', example: 'father', description: 'Open mouth, tongue low' },
    { id: 'i', ipa: '/i/', name: 'ee', example: 'see', description: 'Lips spread, tongue high front' },
    { id: 'u', ipa: '/u/', name: 'oo', example: 'food', description: 'Lips rounded, tongue high back' },
    { id: 'e', ipa: '/ɛ/', name: 'eh', example: 'bed', description: 'Mouth half-open, tongue mid' },
    { id: 'o', ipa: '/o/', name: 'oh', example: 'go', description: 'Lips rounded, tongue mid back' },
    { id: 'p', ipa: '/p/', name: 'puh', example: 'pat', description: 'Lips closed, then burst open' },
    { id: 't', ipa: '/t/', name: 'tuh', example: 'top', description: 'Tongue touches ridge behind teeth' },
    { id: 's', ipa: '/s/', name: 'sss', example: 'see', description: 'Tongue near ridge, hissing' },
    { id: 'n', ipa: '/n/', name: 'nnn', example: 'no', description: 'Tongue tip at ridge, air through nose' },
    { id: 'l', ipa: '/l/', name: 'lll', example: 'lip', description: 'Tongue tip at ridge, air around sides' },
    { id: 'r', ipa: '/r/', name: 'rrr', example: 'red', description: 'Tongue curled back slightly' },
    { id: 'f', ipa: '/f/', name: 'fff', example: 'fan', description: 'Lower lip touches upper teeth' },
  ];

  const handlePlay = () => {
    setIsPlaying(true);
    if ('speechSynthesis' in window && selectedPhoneme) {
      const utterance = new SpeechSynthesisUtterance(selectedPhoneme.example);
      utterance.rate = 0.5;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-400 hover:text-slate-200" data-testid="back-btn">
            <ArrowLeft className="w-5 h-5" /><span>Back</span>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-100">Letter Practice</h1>
            <p className="text-slate-500">Learn individual phoneme articulations</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5">
            <div className="glass-card p-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4">Select a Sound</h3>
              <div className="grid grid-cols-4 gap-2">
                {PHONEMES.map((phoneme) => (
                  <button
                    key={phoneme.id}
                    onClick={() => { setSelectedPhoneme(phoneme); setIsPlaying(false); }}
                    className={`p-3 rounded-xl text-center transition-all ${selectedPhoneme?.id === phoneme.id ? 'bg-sky-500/20 border-2 border-sky-400 text-sky-300' : 'bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:border-slate-600'}`}
                    data-testid={`phoneme-btn-${phoneme.id}`}
                  >
                    <div className="text-lg font-mono">{phoneme.ipa}</div>
                    <div className="text-[10px] text-slate-500 mt-1">{phoneme.name}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            {selectedPhoneme ? (
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-4xl font-mono text-sky-400">{selectedPhoneme.ipa}</span>
                      <span className="text-2xl text-slate-300">"{selectedPhoneme.name}"</span>
                    </div>
                    <p className="text-slate-400 mt-2">As in: <span className="text-slate-200 font-medium">{selectedPhoneme.example}</span></p>
                  </div>
                  <button onClick={handlePlay} disabled={isPlaying} className="btn-glow flex items-center gap-2" data-testid="play-phoneme-btn">
                    {isPlaying ? <Volume2 className="w-5 h-5 animate-pulse" /> : <Play className="w-5 h-5" />}
                    {isPlaying ? 'Playing...' : 'Play Sound'}
                  </button>
                </div>
                <DualHeadAnimator phonemeSequence={[selectedPhoneme.id]} isPlaying={isPlaying} playbackRate={0.5} frameDuration={150} onAnimationComplete={() => setIsPlaying(false)} maxWidth={500} />
                <div className="mt-6 p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                  <h4 className="text-sm font-semibold text-cyan-400 mb-1">Articulation Tip</h4>
                  <p className="text-slate-300">{selectedPhoneme.description}</p>
                </div>
              </div>
            ) : (
              <div className="glass-card p-12 text-center">
                <div className="text-6xl mb-4">👈</div>
                <h3 className="text-xl font-semibold text-slate-300 mb-2">Select a Sound</h3>
                <p className="text-slate-500">Choose a phoneme from the grid to see its articulation</p>
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
  const [history] = useState([
    { id: 1, word: 'hello', score: 0.92, date: '2026-01-25T14:30:00', lang: 'en' },
    { id: 2, word: 'beautiful', score: 0.78, date: '2026-01-25T14:25:00', lang: 'en' },
    { id: 3, word: 'pronunciation', score: 0.65, date: '2026-01-25T14:20:00', lang: 'en' },
  ]);

  const stats = { totalPractices: history.length, averageScore: history.reduce((sum, h) => sum + h.score, 0) / history.length || 0, streak: 3 };

  const getScoreColor = (score) => score >= 0.85 ? 'text-emerald-400' : score >= 0.70 ? 'text-amber-400' : 'text-rose-400';
  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-400 hover:text-slate-200" data-testid="back-btn">
            <ArrowLeft className="w-5 h-5" /><span>Back</span>
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-100">Your Progress</h1>
            <p className="text-slate-500">Practice history and improvement tracking</p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="glass-card p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-sky-500/20 flex items-center justify-center"><Target className="w-5 h-5 text-sky-400" /></div>
              <span className="text-sm text-slate-500">Total Practices</span>
            </div>
            <div className="text-3xl font-bold text-slate-100">{stats.totalPractices}</div>
          </div>
          <div className="glass-card p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center"><TrendingUp className="w-5 h-5 text-emerald-400" /></div>
              <span className="text-sm text-slate-500">Average Score</span>
            </div>
            <div className={`text-3xl font-bold ${getScoreColor(stats.averageScore)}`}>{Math.round(stats.averageScore * 100)}%</div>
          </div>
          <div className="glass-card p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center"><Calendar className="w-5 h-5 text-amber-400" /></div>
              <span className="text-sm text-slate-500">Day Streak</span>
            </div>
            <div className="text-3xl font-bold text-amber-400">{stats.streak} 🔥</div>
          </div>
          <div className="glass-card p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center"><Award className="w-5 h-5 text-purple-400" /></div>
              <span className="text-sm text-slate-500">Best Word</span>
            </div>
            <div className="text-xl font-bold text-purple-400 truncate">hello</div>
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2"><Clock className="w-5 h-5 text-slate-400" />Recent Practice Sessions</h3>
          <div className="space-y-3">
            {history.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:border-slate-600 transition-colors">
                <div className={`w-16 h-16 rounded-xl flex flex-col items-center justify-center border bg-opacity-20 ${getScoreColor(item.score).replace('text', 'border').replace('-400', '-500/50')}`}>
                  <span className={`text-xl font-bold ${getScoreColor(item.score)}`}>{Math.round(item.score * 100)}</span>
                  <span className="text-[10px] text-slate-500">%</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-lg font-semibold text-slate-200 truncate">{item.word}</div>
                  <div className="text-sm text-slate-500">{formatDate(item.date)}</div>
                </div>
                <button onClick={() => navigate(`/practice?word=${encodeURIComponent(item.word)}&lang=${item.lang}`)} className="px-4 py-2 rounded-lg text-sm font-medium bg-sky-500/10 text-sky-400 border border-sky-500/30 hover:bg-sky-500/20 transition-colors" data-testid={`practice-again-${item.id}`}>
                  Practice Again
                </button>
              </div>
            ))}
          </div>
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
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <span className="text-emerald-300">Report saved! It will be sent when you're online.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="glass-card p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-3">What type of issue?</label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {BUG_CATEGORIES.map((cat) => (
                <button key={cat.id} type="button" onClick={() => { setCategory(cat.id); setSubcategory(''); }}
                  className={`p-3 rounded-xl text-left transition-all ${category === cat.id ? 'bg-sky-500/20 border-2 border-sky-400' : 'bg-slate-800/50 border border-slate-700/50 hover:border-slate-600'}`}
                  data-testid={`category-${cat.id}`}
                >
                  <span className="text-xl">{cat.icon}</span>
                  <div className="text-sm font-medium text-slate-200 mt-1">{cat.label}</div>
                </button>
              ))}
            </div>
          </div>

          {selectedCategory && (
            <div className="animate-slide-up">
              <label className="block text-sm font-semibold text-slate-300 mb-3">Specific issue</label>
              <div className="space-y-2">
                {selectedCategory.subcategories.map((sub) => (
                  <button key={sub} type="button" onClick={() => setSubcategory(sub)}
                    className={`w-full p-3 rounded-lg text-left text-sm transition-all ${subcategory === sub ? 'bg-sky-500/20 border border-sky-400 text-sky-300' : 'bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:border-slate-600'}`}
                  >{sub}</button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-3">Severity</label>
            <div className="flex gap-2">
              {SEVERITY.map((level) => (
                <button key={level.id} type="button" onClick={() => setSeverity(level.id)}
                  className={`flex-1 p-3 rounded-lg text-center transition-all ${severity === level.id ? 'bg-slate-800 border-2 border-slate-500' : 'bg-slate-800/50 border border-slate-700/50 hover:border-slate-600'}`}
                >
                  <div className={`font-semibold ${level.color}`}>{level.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Description (optional)</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the issue in more detail..." rows={3}
              className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-slate-200 placeholder:text-slate-500 focus:border-sky-500/50 focus:outline-none resize-none"
            />
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
          <Route path="/practice" element={<PracticePage />} />
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
