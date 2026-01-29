import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DualHeadAnimator from '../components/core/DualHeadAnimator';
import { LETTER_TO_FRAME, LETTER_TO_AUDIO, DIGRAPHS, getAudioPath } from '../services/phonemeEngine';
import { getTranslation } from '../i18n/translations';

// Vowels don't need a following vowel sound
const VOWELS = ['a', 'e', 'i', 'o', 'u'];

export default function LetterPracticePage({ language }) {
  const navigate = useNavigate();
  const t = (key) => getTranslation(language, key);

  // Letter state
  const [selectedLetter, setSelectedLetter] = useState('a');
  const [isPlaying, setIsPlaying] = useState(false);
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
  const [detectedSound, setDetectedSound] = useState(null);
  const [isGrading, setIsGrading] = useState(false);

  // Refs
  const animatorRef = useRef(null);
  const audioRef = useRef(null);
  const timerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const videoPreviewRef = useRef(null);
  const playbackVideoRef = useRef(null);
  const chunksRef = useRef([]);

  // Get frame for selected letter
  const getFrame = () => {
    const l = selectedLetter.toLowerCase();
    if (DIGRAPHS[l]) return DIGRAPHS[l].frame;
    return LETTER_TO_FRAME[l] || 0;
  };

  // Build alphabet with special chars
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const specialChars = ['CH', 'SH', 'TH', 'NG'];
  const allChars = [...alphabet, ...specialChars];

  // Check if letter is a vowel
  const isVowel = VOWELS.includes(selectedLetter.toLowerCase());

  // Build animation timeline for letter
  // Consonants: neutral -> consonant -> vowel (ah) -> neutral
  // Vowels: neutral -> vowel -> neutral
  const buildLetterTimeline = useCallback(() => {
    const frame = getFrame();
    
    if (isVowel) {
      return [
        { frame: 0, start: 0, end: 200 },
        { frame, start: 200, end: 700 },
        { frame: 0, start: 700, end: 900 },
      ];
    } else {
      // Consonant + vowel (e.g., "B" = "ba")
      return [
        { frame: 0, start: 0, end: 150 },
        { frame, start: 150, end: 400 },  // Consonant
        { frame: 1, start: 400, end: 700 },  // Vowel "ah" (frame 1)
        { frame: 0, start: 700, end: 900 },
      ];
    }
  }, [selectedLetter, isVowel]);

  // Play animation and audio
  const handlePlay = () => {
    setIsPlaying(true);
  };

  // Called after the 1000ms delay, plays audio
  const handleDelayEnd = () => {
    const audioPath = getAudioPath(selectedLetter, language);
    if (audioRef.current) {
      audioRef.current.pause();
    }
    audioRef.current = new Audio(audioPath);
    audioRef.current.play().catch(() => {
      // Fallback to TTS
      if ('speechSynthesis' in window) {
        const sound = LETTER_TO_AUDIO[selectedLetter.toLowerCase()] || selectedLetter;
        const utterance = new SpeechSynthesisUtterance(sound);
        utterance.rate = 0.7;
        utterance.lang = language;
        window.speechSynthesis.speak(utterance);
      }
    });
  };

  const handleAnimationComplete = () => {
    setIsPlaying(false);
  };

  // Scrubber
  const handleSliderChange = (e) => {
    const val = parseInt(e.target.value);
    setSliderValue(val);
    if (animatorRef.current) {
      animatorRef.current.seekToFrame(val);
    }
  };

  // Start Recording
  const startRecording = async () => {
    try {
      // Reset state
      setHasRecording(false);
      setVisualGrade(null);
      setAudioGrade(null);
      setDetectedSound(null);
      setRecordedBlob(null);
      if (recordedUrl) URL.revokeObjectURL(recordedUrl);
      setRecordedUrl(null);
      chunksRef.current = [];

      // Get media stream
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: true 
      });
      streamRef.current = stream;

      // Show preview
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        videoPreviewRef.current.play();
      }

      // Create MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') 
        ? 'video/webm;codecs=vp9' 
        : 'video/webm';
      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setRecordedBlob(blob);
        setRecordedUrl(url);
        setHasRecording(true);

        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }

        // Perform grading
        performGrading(blob);
      };

      // Start recording
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

  // Stop Recording
  const stopRecording = () => {
    clearInterval(timerRef.current);
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    setIsRecording(false);
  };

  // Perform grading (simulated for now)
  const performGrading = async (blob) => {
    setIsGrading(true);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Generate scores (in real implementation, this would analyze the audio/video)
    const visual = Math.floor(Math.random() * 20) + 78;
    const audio = Math.floor(Math.random() * 20) + 78;
    
    // Simulate detected sound
    const target = LETTER_TO_AUDIO[selectedLetter.toLowerCase()] || selectedLetter;
    const variations = [target, target, target, target.slice(0, -1) + 'e', target + 'h'];
    const detected = variations[Math.floor(Math.random() * variations.length)];

    setVisualGrade(visual);
    setAudioGrade(audio);
    setDetectedSound(detected);
    setIsGrading(false);

    // Save to history
    const history = JSON.parse(localStorage.getItem('soundmirror_history') || '[]');
    history.unshift({
      id: Date.now(),
      type: 'letter',
      target: selectedLetter.toUpperCase(),
      language,
      visualScore: visual / 100,
      audioScore: audio / 100,
      detectedSound: detected,
      date: new Date().toISOString(),
    });
    localStorage.setItem('soundmirror_history', JSON.stringify(history.slice(0, 100)));
  };

  // Replay attempt
  const replayAttempt = () => {
    if (playbackVideoRef.current && recordedUrl) {
      playbackVideoRef.current.src = recordedUrl;
      playbackVideoRef.current.play();
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (recordedUrl) {
        URL.revokeObjectURL(recordedUrl);
      }
      clearInterval(timerRef.current);
    };
  }, [recordedUrl]);

  const targetFrame = getFrame();
  const timeline = buildLetterTimeline();

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
          <button onClick={() => navigate('/practice?word=hello')} style={navBtnStyle}>
            {t('wordPractice')}
          </button>
          <button onClick={() => navigate('/history')} style={navBtnStyle}>
            {t('practiceHistory')}
          </button>
        </div>

        {/* Alphabet Keyboard */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          justifyContent: 'center',
          marginBottom: 24,
          padding: 16,
          backgroundColor: 'rgba(15, 39, 68, 0.6)',
          borderRadius: 12,
        }}>
          {allChars.map((char) => {
            const isSelected = char.toLowerCase() === selectedLetter.toLowerCase();
            const charIsVowel = VOWELS.includes(char.toLowerCase());
            return (
              <button
                key={char}
                onClick={() => { setSelectedLetter(char); setVisualGrade(null); setAudioGrade(null); setHasRecording(false); }}
                style={{
                  width: char.length > 1 ? 56 : 44,
                  height: 44,
                  fontSize: 16,
                  fontWeight: 600,
                  border: isSelected ? '2px solid #3b82f6' : '2px solid transparent',
                  borderRadius: 8,
                  backgroundColor: isSelected ? '#3b82f6' : charIsVowel ? '#ca8a04' : '#1e3a5f',
                  color: isSelected ? '#fff' : charIsVowel ? '#fef3c7' : '#e2e8f0',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {char}
              </button>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Left: Animation */}
          <div style={{
            backgroundColor: 'rgba(15, 39, 68, 0.6)',
            borderRadius: 16,
            padding: 24,
          }}>
            {/* Current Letter Display */}
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <span style={{
                fontSize: 72,
                fontWeight: 700,
                color: isVowel ? '#fbbf24' : '#60a5fa',
              }}>
                {selectedLetter.toUpperCase()}
              </span>
              <div style={{ fontSize: 18, color: '#94a3b8' }}>
                "{LETTER_TO_AUDIO[selectedLetter.toLowerCase()] || selectedLetter}"
                {!isVowel && <span style={{ color: '#64748b' }}> (consonant + vowel)</span>}
              </div>
            </div>

            {/* Dual Head Animator */}
            <DualHeadAnimator
              ref={animatorRef}
              targetFrame={targetFrame}
              timeline={timeline}
              isPlaying={isPlaying}
              preDelay={1000}
              onDelayEnd={handleDelayEnd}
              onAnimationComplete={handleAnimationComplete}
              interpolate={true}
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
                max="19"
                value={sliderValue}
                onChange={handleSliderChange}
                disabled={isPlaying}
                style={{ width: '100%', cursor: isPlaying ? 'not-allowed' : 'pointer' }}
              />
              <div style={{ textAlign: 'center', fontSize: 12, color: '#64748b' }}>
                {t('frame')}: {sliderValue}
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
              height: 280,
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              border: '2px solid #1e3a5f',
              position: 'relative',
            }}>
              {/* Live preview while recording */}
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
              
              {/* Playback video */}
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

              {/* Idle state */}
              {!isRecording && !hasRecording && (
                <div style={{ textAlign: 'center', color: '#475569' }}>
                  <div style={{ fontSize: 48, marginBottom: 8 }}>📹</div>
                  <div>{t('beginPractice')}</div>
                </div>
              )}

              {/* Recording indicator */}
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

              {/* Grading indicator */}
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

            {/* Record Buttons */}
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {/* Visual Grade */}
                <div style={{
                  backgroundColor: '#0f2744',
                  borderRadius: 12,
                  padding: 20,
                  textAlign: 'center',
                  border: '1px solid #1e3a5f',
                }}>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8, textTransform: 'uppercase' }}>
                    {t('visualGrade')}
                  </div>
                  <div style={{
                    fontSize: 48,
                    fontWeight: 700,
                    color: visualGrade >= 85 ? '#10b981' : visualGrade >= 70 ? '#f59e0b' : '#ef4444',
                  }}>
                    {visualGrade}%
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                    Lip & Jaw Position
                  </div>
                </div>

                {/* Audio Grade */}
                <div style={{
                  backgroundColor: '#0f2744',
                  borderRadius: 12,
                  padding: 20,
                  textAlign: 'center',
                  border: '1px solid #1e3a5f',
                }}>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8, textTransform: 'uppercase' }}>
                    {t('audioGrade')}
                  </div>
                  <div style={{
                    fontSize: 48,
                    fontWeight: 700,
                    color: audioGrade >= 85 ? '#10b981' : audioGrade >= 70 ? '#f59e0b' : '#ef4444',
                  }}>
                    {audioGrade}%
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 8 }}>
                    <span style={{ color: '#94a3b8' }}>{t('target')}:</span> "{LETTER_TO_AUDIO[selectedLetter.toLowerCase()]}"
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>
                    <span style={{ color: '#94a3b8' }}>{t('youSaid')}:</span> "{detectedSound}"
                  </div>
                </div>
              </div>
            )}
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
