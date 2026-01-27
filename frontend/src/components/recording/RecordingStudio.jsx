/**
 * RecordingStudio Component
 * 
 * Full-featured recording panel with:
 * - Webcam preview and recording
 * - Microphone recording
 * - Playback controls
 * - Real-time audio visualization
 * - Integration with grading service
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Video, Mic, Square, Play, Pause, RotateCcw, 
  Camera, CameraOff, MicOff, Volume2, Download,
  CheckCircle, AlertCircle, Loader2
} from 'lucide-react';
import { useMediaRecorder, RecordingState } from '../../hooks/useMediaRecorder';
import { gradeAttempt } from '../../services/gradingService';

export function RecordingStudio({
  target = '',
  expectedPhonemes = [],
  referenceDuration = 2000,
  onRecordingComplete,
  onGradingComplete,
  compact = false,
}) {
  // Recording hooks
  const audioRecorder = useMediaRecorder({ audio: true, video: false, maxDuration: 30000 });
  const videoRecorder = useMediaRecorder({ audio: true, video: true, maxDuration: 30000 });

  // State
  const [mode, setMode] = useState('audio'); // 'audio' | 'video'
  const [isGrading, setIsGrading] = useState(false);
  const [gradingResults, setGradingResults] = useState(null);
  const [isPlayingBack, setIsPlayingBack] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);

  // Refs
  const videoPreviewRef = useRef(null);
  const playbackRef = useRef(null);
  const analyserRef = useRef(null);
  const animationRef = useRef(null);

  // Get active recorder based on mode
  const recorder = mode === 'video' ? videoRecorder : audioRecorder;

  // Setup video preview when stream is available
  useEffect(() => {
    if (videoPreviewRef.current && videoRecorder.stream && mode === 'video') {
      videoPreviewRef.current.srcObject = videoRecorder.stream;
    }
  }, [videoRecorder.stream, mode]);

  // Audio level visualization
  useEffect(() => {
    if (!recorder.stream || !recorder.isRecording) {
      setAudioLevel(0);
      return;
    }

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioContext.createMediaStreamSource(recorder.stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    analyserRef.current = analyser;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const updateLevel = () => {
      if (!recorder.isRecording) return;
      
      analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      setAudioLevel(average / 255);
      animationRef.current = requestAnimationFrame(updateLevel);
    };

    updateLevel();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      audioContext.close();
    };
  }, [recorder.stream, recorder.isRecording]);

  // Handle recording completion and grading
  const handleRecordingStop = useCallback(async () => {
    recorder.stopRecording();
  }, [recorder]);

  // Grade when recording is available
  useEffect(() => {
    if (recorder.hasRecording && recorder.recordingBlob && !gradingResults) {
      performGrading();
    }
  }, [recorder.hasRecording, recorder.recordingBlob]);

  const performGrading = async () => {
    if (!recorder.recordingBlob) return;

    setIsGrading(true);
    try {
      const results = await gradeAttempt({
        studentAudio: recorder.recordingBlob,
        referenceDuration,
        target,
        expectedPhonemes,
      });

      setGradingResults(results);
      onGradingComplete?.(results);
      onRecordingComplete?.({
        blob: recorder.recordingBlob,
        url: recorder.recordingUrl,
        duration: recorder.duration,
        grades: results,
      });
    } catch (err) {
      console.error('Grading failed:', err);
    } finally {
      setIsGrading(false);
    }
  };

  // Start recording
  const handleStart = async () => {
    setGradingResults(null);
    await recorder.startRecording();
  };

  // Toggle playback
  const togglePlayback = () => {
    if (!playbackRef.current) return;
    
    if (isPlayingBack) {
      playbackRef.current.pause();
      setIsPlayingBack(false);
    } else {
      playbackRef.current.play();
      setIsPlayingBack(true);
    }
  };

  // Reset
  const handleReset = () => {
    recorder.reset();
    setGradingResults(null);
    setIsPlayingBack(false);
  };

  // Download recording
  const handleDownload = () => {
    if (!recorder.recordingUrl) return;
    const a = document.createElement('a');
    a.href = recorder.recordingUrl;
    a.download = `soundmirror_${target}_${Date.now()}.${mode === 'video' ? 'webm' : 'webm'}`;
    a.click();
  };

  // Score color helper
  const getScoreColor = (score) => {
    if (score >= 0.85) return 'text-emerald-400';
    if (score >= 0.70) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getScoreBg = (score) => {
    if (score >= 0.85) return 'bg-emerald-500';
    if (score >= 0.70) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const formatDuration = (ms) => {
    const secs = Math.floor(ms / 1000);
    const ms100 = Math.floor((ms % 1000) / 100);
    return `${secs}.${ms100}s`;
  };

  return (
    <div className={`bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 ${compact ? 'p-3' : 'p-5'}`} data-testid="recording-studio">
      {/* Header with mode toggle */}
      <div className="flex items-center justify-between mb-4">
        <h3 className={`font-semibold text-slate-200 flex items-center gap-2 ${compact ? 'text-sm' : 'text-base'}`}>
          {mode === 'video' ? <Video className="w-4 h-4 text-cyan-400" /> : <Mic className="w-4 h-4 text-cyan-400" />}
          Record Your Attempt
        </h3>
        <div className="flex gap-1 p-1 bg-slate-800 rounded-lg">
          <button
            onClick={() => { setMode('audio'); recorder.reset(); setGradingResults(null); }}
            className={`px-3 py-1 rounded text-xs font-medium transition-all ${
              mode === 'audio' ? 'bg-sky-500/20 text-sky-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mic className="w-3 h-3 inline mr-1" /> Audio
          </button>
          <button
            onClick={() => { setMode('video'); recorder.reset(); setGradingResults(null); }}
            className={`px-3 py-1 rounded text-xs font-medium transition-all ${
              mode === 'video' ? 'bg-sky-500/20 text-sky-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Video className="w-3 h-3 inline mr-1" /> Video
          </button>
        </div>
      </div>

      {/* Preview / Playback Area */}
      <div className={`relative bg-slate-950 rounded-xl mb-4 overflow-hidden border border-slate-700/50 ${compact ? 'h-32' : 'aspect-video max-h-64'}`}>
        {/* Video Preview (when recording video) */}
        {mode === 'video' && recorder.stream && !recorder.hasRecording && (
          <video
            ref={videoPreviewRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        )}

        {/* Playback (when recording exists) */}
        {recorder.hasRecording && (
          mode === 'video' ? (
            <video
              ref={playbackRef}
              src={recorder.recordingUrl}
              className="w-full h-full object-cover"
              onEnded={() => setIsPlayingBack(false)}
            />
          ) : (
            <audio
              ref={playbackRef}
              src={recorder.recordingUrl}
              onEnded={() => setIsPlayingBack(false)}
            />
          )
        )}

        {/* Recording Indicator */}
        {recorder.isRecording && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30">
            <div className="relative">
              {/* Audio level ring */}
              <div 
                className="absolute inset-0 rounded-full border-4 border-rose-500/50 transition-transform"
                style={{ transform: `scale(${1 + audioLevel * 0.5})` }}
              />
              <div className="w-16 h-16 rounded-full bg-rose-500/20 border-2 border-rose-500 flex items-center justify-center animate-pulse">
                {mode === 'video' ? <Video className="w-8 h-8 text-rose-400" /> : <Mic className="w-8 h-8 text-rose-400" />}
              </div>
            </div>
            <div className="mt-3 text-rose-400 font-mono text-2xl">{formatDuration(recorder.duration)}</div>
            <div className="text-rose-300/70 text-sm">Recording...</div>
          </div>
        )}

        {/* Idle State */}
        {!recorder.isRecording && !recorder.hasRecording && !recorder.stream && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
            {mode === 'video' ? (
              <>
                <CameraOff className="w-12 h-12 mb-2 text-slate-600" />
                <div className="text-sm">Camera Preview</div>
              </>
            ) : (
              <>
                <MicOff className="w-12 h-12 mb-2 text-slate-600" />
                <div className="text-sm">Ready to Record</div>
              </>
            )}
          </div>
        )}

        {/* Playback Ready State */}
        {recorder.hasRecording && mode === 'audio' && !isPlayingBack && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            </div>
            <div className="mt-2 text-emerald-400 text-sm">Recording Ready</div>
            <div className="text-slate-500 text-xs">{formatDuration(recorder.duration)}</div>
          </div>
        )}

        {/* Grading Indicator */}
        {isGrading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50">
            <Loader2 className="w-10 h-10 text-sky-400 animate-spin" />
            <div className="mt-2 text-sky-400 text-sm">Analyzing...</div>
          </div>
        )}

        {/* Audio Level Bar */}
        {recorder.isRecording && (
          <div className="absolute bottom-2 left-2 right-2 h-2 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-75"
              style={{ width: `${audioLevel * 100}%` }}
            />
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 mb-4">
        {!recorder.isRecording && !recorder.hasRecording && (
          <button
            onClick={handleStart}
            disabled={recorder.state === RecordingState.REQUESTING}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-500 to-cyan-500 text-slate-900 font-semibold rounded-xl hover:brightness-110 transition-all disabled:opacity-50"
            data-testid="start-recording-btn"
          >
            <div className="w-3 h-3 rounded-full bg-slate-900" />
            Start Recording
          </button>
        )}

        {recorder.isRecording && (
          <button
            onClick={handleRecordingStop}
            className="flex items-center gap-2 px-6 py-3 bg-rose-500 text-white font-semibold rounded-xl hover:bg-rose-600 transition-all"
            data-testid="stop-recording-btn"
          >
            <Square className="w-4 h-4" />
            Stop ({formatDuration(recorder.duration)})
          </button>
        )}

        {recorder.hasRecording && (
          <>
            <button
              onClick={togglePlayback}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-slate-200 rounded-xl hover:bg-slate-600"
              data-testid="playback-btn"
            >
              {isPlayingBack ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isPlayingBack ? 'Pause' : 'Play'}
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-400 rounded-xl hover:bg-slate-700 hover:text-slate-200"
            >
              <RotateCcw className="w-4 h-4" />
              Retry
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-400 rounded-xl hover:bg-slate-700 hover:text-slate-200"
            >
              <Download className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Grading Results */}
      {gradingResults && (
        <div className="border-t border-slate-700/50 pt-4" data-testid="grading-results">
          {/* Overall Score */}
          <div className="text-center mb-4">
            <div className={`text-4xl font-bold ${getScoreColor(gradingResults.scores.overall)}`}>
              {Math.round(gradingResults.scores.overall * 100)}%
            </div>
            <div className="text-slate-400 text-sm">Overall Score</div>
          </div>

          {/* Score Bars */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {Object.entries(gradingResults.scores)
              .filter(([key]) => key !== 'overall')
              .map(([key, value]) => (
                <div key={key} className="text-center">
                  <div className="text-xs text-slate-500 capitalize mb-1">{key}</div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden mb-1">
                    <div 
                      className={`h-full ${getScoreBg(value)} transition-all duration-500`}
                      style={{ width: `${value * 100}%` }}
                    />
                  </div>
                  <div className={`text-sm font-semibold ${getScoreColor(value)}`}>
                    {Math.round(value * 100)}%
                  </div>
                </div>
              ))}
          </div>

          {/* Feedback */}
          {gradingResults.feedback.length > 0 && (
            <div className="space-y-1">
              {gradingResults.feedback.map((fb, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  {i === 0 && gradingResults.scores.overall >= 0.7 ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  )}
                  <span className="text-slate-300">{fb}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Permission Error */}
      {recorder.error && (
        <div className="mt-3 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg">
          <div className="flex items-center gap-2 text-rose-400 text-sm">
            <AlertCircle className="w-4 h-4" />
            {recorder.error}
          </div>
        </div>
      )}
    </div>
  );
}

export default RecordingStudio;
