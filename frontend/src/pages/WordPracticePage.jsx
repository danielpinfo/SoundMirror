import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DualHeadAnimator from '../components/core/DualHeadAnimator';
import { generateWordTimeline, textToPhonemes, LETTER_TO_FRAME, DIGRAPHS } from '../services/phonemeEngine';
import { getTranslation } from '../i18n/translations';

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
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [videoStream, setVideoStream] = useState(null);

  // Grading state
  const [visualGrade, setVisualGrade] = useState(null);
  const [audioGrade, setAudioGrade] = useState(null);
  const [detectedText, setDetectedText] = useState(null);

  // Input state
  const [inputWord, setInputWord] = useState('');

  // Refs
  const animatorRef = useRef(null);
  const timerRef = useRef(null);
  const videoPreviewRef = useRef(null);
  const recordedVideoRef = useRef(null);

  // Generate timeline for word
  const timeline = generateWordTimeline(word, 150);
  const totalDuration = timeline[timeline.length - 1]?.end || 1000;
  const phonemes = textToPhonemes(word);

  // Play animation with TTS
  const handlePlay = () => {
    setIsPlaying(true);
    setCurrentTime(0);

    // Use native TTS
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

  // Handle time updates from animator
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

  // Recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setVideoStream(stream);
      
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
      }

      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        setRecordedBlob(blob);
        setHasRecording(true);
        
        // Simulate grading
        setTimeout(() => {
          setVisualGrade(Math.floor(Math.random() * 25) + 75);
          setAudioGrade(Math.floor(Math.random() * 25) + 75);
          // Simulate phonetic detection
          const variants = [word, word.replace('e', 'a'), word + 'h', word.slice(0, -1)];
          setDetectedText(variants[Math.floor(Math.random() * variants.length)]);
        }, 800);
      };

      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      setHasRecording(false);
      setVisualGrade(null);
      setAudioGrade(null);

      timerRef.current = setInterval(() => {
        setRecordingTime((t) => t + 100);
      }, 100);
    } catch (err) {
      console.error('Recording error:', err);
      alert('Could not access camera/microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
    }
    clearInterval(timerRef.current);
    setIsRecording(false);
  };

  const replayAttempt = () => {
    if (recordedBlob && recordedVideoRef.current) {
      recordedVideoRef.current.src = URL.createObjectURL(recordedBlob);
      recordedVideoRef.current.play();
    }
  };

  // Handle new word input
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

  // Cleanup
  useEffect(() => {
    return () => {
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
      }
      clearInterval(timerRef.current);
    };
  }, [videoStream]);

  // Alphabet for keyboard
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
            {/* Dual Head Animator */}
            <DualHeadAnimator
              ref={animatorRef}
              timeline={timeline}
              isPlaying={isPlaying}
              onAnimationComplete={handleAnimationComplete}
              onTimeUpdate={handleTimeUpdate}
            />

            {/* Play Button */}
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

            {/* Scrubber */}
            <div style={{ marginTop: 20 }}>
              <input
                type="range"
                min="0"
                max="100"
                value={sliderValue}
                onChange={handleSliderChange}
                style={{ width: '100%' }}
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
            {/* Video Preview */}
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
              {isRecording ? (
                <video
                  ref={videoPreviewRef}
                  autoPlay
                  muted
                  playsInline
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : hasRecording ? (
                <video
                  ref={recordedVideoRef}
                  playsInline
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
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
                  <span style={{ fontSize: 14, fontWeight: 600 }}>
                    {(recordingTime / 1000).toFixed(1)}s
                  </span>
                </div>
              )}
            </div>

            {/* Record Button */}
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  style={{
                    padding: '16px 40px',
                    fontSize: 16,
                    fontWeight: 600,
                    borderRadius: 10,
                    border: 'none',
                    backgroundColor: '#10b981',
                    color: '#fff',
                    cursor: 'pointer',
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
                  ■ {t('stop')}
                </button>
              )}
              
              {hasRecording && (
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
            {visualGrade !== null && (
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

                {/* What you said */}
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

        {/* Word Input & Keyboard */}
        <div style={{
          backgroundColor: 'rgba(15, 39, 68, 0.6)',
          borderRadius: 16,
          padding: 24,
        }}>
          {/* Text Input */}
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

          {/* Alphabet Keyboard */}
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
