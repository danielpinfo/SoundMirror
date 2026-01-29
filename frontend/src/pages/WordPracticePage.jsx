import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DualHeadAnimator from '../components/core/DualHeadAnimator';
import { generateWordTimeline, textToPhonemes } from '../services/phonemeEngine';
import { getTranslation } from '../i18n/translations';

// Preselected practice words (same in all pages)
const PRACTICE_WORDS = ['Hello', 'Goodbye', 'Please', 'Thank You', 'Sorry', 'Yes', 'No', 'Water', 'Good Morning', 'How Are You'];

export default function WordPracticePage({ language }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const word = searchParams.get('word') || 'hello';
  const t = (key) => getTranslation(language, key);

  // Animation state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [sliderValue, setSliderValue] = useState(0);

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasRecording, setHasRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [recordedUrl, setRecordedUrl] = useState(null);

  // Grading state
  const [visualGrade, setVisualGrade] = useState(null);
  const [audioGrade, setAudioGrade] = useState(null);
  const [detectedText, setDetectedText] = useState(null);
  const [isGrading, setIsGrading] = useState(false);

  // Input state
  const [inputWord, setInputWord] = useState('');

  // Refs
  const animatorRef = useRef(null);
  const timerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const videoPreviewRef = useRef(null);
  const playbackVideoRef = useRef(null);
  const chunksRef = useRef([]);

  // Generate timeline for word
  const timeline = generateWordTimeline(word, 150);
  const totalDuration = timeline[timeline.length - 1]?.end || 1000;
  const phonemes = textToPhonemes(word);

  // Play animation with TTS
  const handlePlay = () => {
    setIsPlaying(true);
    setCurrentTime(0);
  };

  // Called after delay - play TTS
  const handleDelayEnd = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.rate = 0.8;
      utterance.lang = language;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleAnimationComplete = () => {
    setIsPlaying(false);
  };

  const handleTimeUpdate = (time) => {
    setCurrentTime(time);
    setSliderValue(Math.round((time / totalDuration) * 100));
  };

  // Scrubber
  const handleSliderChange = (e) => {
    const val = parseInt(e.target.value);
    setSliderValue(val);
    const time = (val / 100) * totalDuration;
    if (animatorRef.current) {
      animatorRef.current.seekToTime(time);
    }
  };

  // Start Recording
  const startRecording = async () => {
    try {
      setHasRecording(false);
      setVisualGrade(null);
      setAudioGrade(null);
      setDetectedText(null);
      setRecordedBlob(null);
      if (recordedUrl) URL.revokeObjectURL(recordedUrl);
      setRecordedUrl(null);
      chunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: true 
      });
      streamRef.current = stream;

      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        videoPreviewRef.current.play();
      }

      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') 
        ? 'video/webm;codecs=vp9' 
        : 'video/webm';
      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setRecordedBlob(blob);
        setRecordedUrl(url);
        setHasRecording(true);

        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }

        performGrading(blob);
      };

      recorder.start(100);
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(t => t + 100);
      }, 100);

    } catch (err) {
      console.error('Recording error:', err);
      alert('Could not access camera/microphone. Please allow permissions.');
    }
  };

  const stopRecording = () => {
    clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  // Perform grading
  const performGrading = async (blob) => {
    setIsGrading(true);
    await new Promise(resolve => setTimeout(resolve, 1200));

    const visual = Math.floor(Math.random() * 20) + 78;
    const audio = Math.floor(Math.random() * 20) + 78;
    
    // Simulate phonetic detection - what the user actually said
    const variations = [
      word,
      word,
      word.replace(/e/gi, 'a'),
      word.replace(/o/gi, 'u'),
      word + 'h',
      word.slice(0, -1),
    ];
    const detected = variations[Math.floor(Math.random() * variations.length)];

    setVisualGrade(visual);
    setAudioGrade(audio);
    setDetectedText(detected);
    setIsGrading(false);

    // Save to history
    const history = JSON.parse(localStorage.getItem('soundmirror_history') || '[]');
    history.unshift({
      id: Date.now(),
      type: 'word',
      target: word,
      language,
      visualScore: visual / 100,
      audioScore: audio / 100,
      detectedText: detected,
      date: new Date().toISOString(),
    });
    localStorage.setItem('soundmirror_history', JSON.stringify(history.slice(0, 100)));
  };

  const replayAttempt = () => {
    if (playbackVideoRef.current && recordedUrl) {
      playbackVideoRef.current.src = recordedUrl;
      playbackVideoRef.current.play();
    }
  };

  const handleWordSubmit = (e) => {
    e.preventDefault();
    if (inputWord.trim()) {
      navigate(`/practice?word=${encodeURIComponent(inputWord.trim())}`);
      setInputWord('');
      setVisualGrade(null);
      setAudioGrade(null);
      setHasRecording(false);
    }
  };

  const handleWordClick = (w) => {
    navigate(`/practice?word=${encodeURIComponent(w)}`);
    setVisualGrade(null);
    setAudioGrade(null);
    setHasRecording(false);
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (recordedUrl) URL.revokeObjectURL(recordedUrl);
      clearInterval(timerRef.current);
    };
  }, [recordedUrl]);

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const specialChars = ['CH', 'SH', 'TH', 'NG'];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0a1628 0%, #0f2744 100%)',
      color: '#e2e8f0',
      padding: '24px',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Navigation */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          <button onClick={() => navigate('/')} style={navBtnStyle}>
            ← {t('backHome')}
          </button>
          <button onClick={() => navigate('/letters')} style={navBtnStyle}>
            {t('letterPractice')}
          </button>
          <button onClick={() => navigate('/history')} style={navBtnStyle}>
            {t('practiceHistory')}
          </button>
        </div>

        {/* Current Word Display */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h1 style={{ fontSize: 48, fontWeight: 700, color: '#60a5fa', margin: 0 }}>
            {word}
          </h1>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 12 }}>
            {phonemes.map((p, i) => (
              <span
                key={i}
                style={{
                  padding: '6px 12px',
                  fontSize: 14,
                  fontWeight: 500,
                  borderRadius: 6,
                  backgroundColor: p.isPause ? 'transparent' : '#1e3a5f',
                  color: p.isPause ? '#475569' : '#94a3b8',
                  border: '1px solid #2d4a6f',
                }}
              >
                {p.char.toUpperCase()}
              </span>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
          {/* Left: Animation */}
          <div style={{
            backgroundColor: 'rgba(15, 39, 68, 0.6)',
            borderRadius: 16,
            padding: 24,
          }}>
            <DualHeadAnimator
              ref={animatorRef}
              timeline={timeline}
              isPlaying={isPlaying}
              preDelay={1000}
              onDelayEnd={handleDelayEnd}
              onAnimationComplete={handleAnimationComplete}
              onTimeUpdate={handleTimeUpdate}
              interpolate={true}
            />

            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <button
                onClick={handlePlay}
                disabled={isPlaying}
                style={{
                  padding: '14px 40px',
                  fontSize: 16,
                  fontWeight: 600,
                  borderRadius: 10,
                  border: 'none',
                  backgroundColor: isPlaying ? '#475569' : '#3b82f6',
                  color: '#fff',
                  cursor: isPlaying ? 'not-allowed' : 'pointer',
                }}
              >
                {isPlaying ? 'Playing...' : `▶ ${t('play')}`}
              </button>
            </div>

            <div style={{ marginTop: 20 }}>
              <input
                type="range"
                min="0"
                max="100"
                value={sliderValue}
                onChange={handleSliderChange}
                disabled={isPlaying}
                style={{ width: '100%', cursor: isPlaying ? 'not-allowed' : 'pointer' }}
              />
              <div style={{ textAlign: 'center', fontSize: 12, color: '#64748b' }}>
                {Math.round(currentTime)}ms / {totalDuration}ms
              </div>
            </div>
          </div>

          {/* Right: Recording & Grading */}
          <div style={{
            backgroundColor: 'rgba(15, 39, 68, 0.6)',
            borderRadius: 16,
            padding: 24,
          }}>
            <div style={{
              backgroundColor: '#0a1628',
              borderRadius: 12,
              height: 260,
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              border: '2px solid #1e3a5f',
              position: 'relative',
            }}>
              <video
                ref={videoPreviewRef}
                autoPlay
                muted
                playsInline
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: isRecording ? 'block' : 'none',
                }}
              />
              
              <video
                ref={playbackVideoRef}
                playsInline
                controls
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: hasRecording && !isRecording ? 'block' : 'none',
                }}
              />

              {!isRecording && !hasRecording && (
                <div style={{ textAlign: 'center', color: '#475569' }}>
                  <div style={{ fontSize: 48, marginBottom: 8 }}>📹</div>
                  <div>{t('beginPractice')}</div>
                </div>
              )}

              {isRecording && (
                <div style={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 12px',
                  backgroundColor: 'rgba(239, 68, 68, 0.9)',
                  borderRadius: 20,
                }}>
                  <div style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    backgroundColor: '#fff',
                    animation: 'pulse 1s infinite',
                  }} />
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>
                    {(recordingTime / 1000).toFixed(1)}s
                  </span>
                </div>
              )}

              {isGrading && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(0, 20, 40, 0.8)',
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
                    <div style={{ color: '#60a5fa' }}>Analyzing...</div>
                  </div>
                </div>
              )}
            </div>

            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  disabled={isGrading}
                  style={{
                    padding: '16px 40px',
                    fontSize: 16,
                    fontWeight: 600,
                    borderRadius: 10,
                    border: 'none',
                    backgroundColor: isGrading ? '#475569' : '#10b981',
                    color: '#fff',
                    cursor: isGrading ? 'not-allowed' : 'pointer',
                  }}
                >
                  ● {t('beginPractice')}
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  style={{
                    padding: '16px 40px',
                    fontSize: 16,
                    fontWeight: 600,
                    borderRadius: 10,
                    border: 'none',
                    backgroundColor: '#ef4444',
                    color: '#fff',
                    cursor: 'pointer',
                  }}
                >
                  ■ {t('stop')} ({(recordingTime / 1000).toFixed(1)}s)
                </button>
              )}
              
              {hasRecording && !isRecording && (
                <button
                  onClick={replayAttempt}
                  style={{
                    marginLeft: 12,
                    padding: '16px 24px',
                    fontSize: 16,
                    fontWeight: 600,
                    borderRadius: 10,
                    border: '1px solid #3b82f6',
                    backgroundColor: 'transparent',
                    color: '#60a5fa',
                    cursor: 'pointer',
                  }}
                >
                  ▶ {t('replayAttempt')}
                </button>
              )}
            </div>

            {/* Grading Results */}
            {visualGrade !== null && !isGrading && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <div style={{
                    backgroundColor: '#0f2744',
                    borderRadius: 12,
                    padding: 16,
                    textAlign: 'center',
                    border: '1px solid #1e3a5f',
                  }}>
                    <div style={{ fontSize: 11, color: '#64748b', marginBottom: 6, textTransform: 'uppercase' }}>
                      {t('visualGrade')}
                    </div>
                    <div style={{
                      fontSize: 40,
                      fontWeight: 700,
                      color: visualGrade >= 85 ? '#10b981' : visualGrade >= 70 ? '#f59e0b' : '#ef4444',
                    }}>
                      {visualGrade}%
                    </div>
                  </div>

                  <div style={{
                    backgroundColor: '#0f2744',
                    borderRadius: 12,
                    padding: 16,
                    textAlign: 'center',
                    border: '1px solid #1e3a5f',
                  }}>
                    <div style={{ fontSize: 11, color: '#64748b', marginBottom: 6, textTransform: 'uppercase' }}>
                      {t('audioGrade')}
                    </div>
                    <div style={{
                      fontSize: 40,
                      fontWeight: 700,
                      color: audioGrade >= 85 ? '#10b981' : audioGrade >= 70 ? '#f59e0b' : '#ef4444',
                    }}>
                      {audioGrade}%
                    </div>
                  </div>
                </div>

                <div style={{
                  backgroundColor: '#0f2744',
                  borderRadius: 12,
                  padding: 16,
                  border: '1px solid #1e3a5f',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ color: '#64748b', fontSize: 12 }}>{t('target')}:</span>
                    <span style={{ color: '#60a5fa', fontWeight: 600 }}>"{word}"</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b', fontSize: 12 }}>{t('youSaid')}:</span>
                    <span style={{ color: '#f59e0b', fontWeight: 600 }}>"{detectedText}"</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Preselected Practice Words */}
        <div style={{
          backgroundColor: 'rgba(15, 39, 68, 0.6)',
          borderRadius: 16,
          padding: 24,
          marginBottom: 24,
        }}>
          <div style={{ 
            fontSize: 12, 
            color: '#64748b', 
            textTransform: 'uppercase', 
            letterSpacing: '1px',
            marginBottom: 16,
            textAlign: 'center',
          }}>
            {t('practiceWords')}
          </div>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 10,
            justifyContent: 'center',
          }}>
            {PRACTICE_WORDS.map((w) => (
              <button
                key={w}
                onClick={() => handleWordClick(w)}
                style={{
                  padding: '10px 18px',
                  fontSize: 14,
                  fontWeight: 500,
                  borderRadius: 8,
                  border: word.toLowerCase() === w.toLowerCase() ? '2px solid #3b82f6' : '1px solid #2d4a6f',
                  backgroundColor: word.toLowerCase() === w.toLowerCase() ? 'rgba(59, 130, 246, 0.2)' : '#0f2744',
                  color: '#e2e8f0',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {w}
              </button>
            ))}
          </div>
        </div>

        {/* Word Input & Keyboard */}
        <div style={{
          backgroundColor: 'rgba(15, 39, 68, 0.6)',
          borderRadius: 16,
          padding: 24,
        }}>
          <form onSubmit={handleWordSubmit} style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 12 }}>
              <input
                type="text"
                value={inputWord}
                onChange={(e) => setInputWord(e.target.value)}
                placeholder={t('enterWord')}
                style={{
                  flex: 1,
                  padding: '14px 18px',
                  fontSize: 16,
                  borderRadius: 8,
                  border: '1px solid #2d4a6f',
                  backgroundColor: '#0a1628',
                  color: '#e2e8f0',
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                style={{
                  padding: '14px 28px',
                  fontSize: 15,
                  fontWeight: 600,
                  borderRadius: 8,
                  border: 'none',
                  backgroundColor: '#3b82f6',
                  color: '#fff',
                  cursor: 'pointer',
                }}
              >
                {t('play')} →
              </button>
            </div>
          </form>

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 6,
            justifyContent: 'center',
          }}>
            {[...alphabet, ...specialChars].map((char) => (
              <button
                key={char}
                onClick={() => setInputWord(prev => prev + char.toLowerCase())}
                style={{
                  width: char.length > 1 ? 48 : 36,
                  height: 36,
                  fontSize: 14,
                  fontWeight: 500,
                  border: '1px solid #2d4a6f',
                  borderRadius: 6,
                  backgroundColor: '#1e3a5f',
                  color: '#e2e8f0',
                  cursor: 'pointer',
                }}
              >
                {char}
              </button>
            ))}
            <button
              onClick={() => setInputWord(prev => prev + ' ')}
              style={{
                width: 80,
                height: 36,
                fontSize: 12,
                border: '1px solid #2d4a6f',
                borderRadius: 6,
                backgroundColor: '#1e3a5f',
                color: '#94a3b8',
                cursor: 'pointer',
              }}
            >
              SPACE
            </button>
            <button
              onClick={() => setInputWord(prev => prev.slice(0, -1))}
              style={{
                width: 60,
                height: 36,
                fontSize: 12,
                border: '1px solid #2d4a6f',
                borderRadius: 6,
                backgroundColor: '#1e3a5f',
                color: '#94a3b8',
                cursor: 'pointer',
              }}
            >
              ← DEL
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

const navBtnStyle = {
  padding: '10px 18px',
  fontSize: 14,
  fontWeight: 500,
  borderRadius: 8,
  border: '1px solid #2d4a6f',
  backgroundColor: '#0f2744',
  color: '#e2e8f0',
  cursor: 'pointer',
};
