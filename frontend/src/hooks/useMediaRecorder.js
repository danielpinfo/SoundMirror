/**
 * useMediaRecorder Hook
 * 
 * Handles audio and video recording using MediaRecorder API.
 * Designed for student speech and face capture in SoundMirror.
 * 
 * Data Flow:
 * 1. Request permissions -> MediaStream
 * 2. MediaStream -> MediaRecorder -> Blob chunks
 * 3. Blob -> URL for playback or IndexedDB for persistence
 */

import { useState, useRef, useCallback, useEffect } from 'react';

// Recording states for UI
export const RecordingState = {
  IDLE: 'idle',
  REQUESTING: 'requesting',
  READY: 'ready',
  RECORDING: 'recording',
  PAUSED: 'paused',
  STOPPED: 'stopped',
  ERROR: 'error',
};

/**
 * Custom hook for audio/video recording
 * @param {Object} options - Configuration options
 * @param {boolean} options.audio - Enable audio recording
 * @param {boolean} options.video - Enable video recording
 * @param {number} options.maxDuration - Max recording duration in ms (default: 30000)
 */
export function useMediaRecorder({ 
  audio = true, 
  video = false, 
  maxDuration = 30000 
} = {}) {
  const [state, setState] = useState(RecordingState.IDLE);
  const [error, setError] = useState(null);
  const [duration, setDuration] = useState(0);
  const [recordingBlob, setRecordingBlob] = useState(null);
  const [recordingUrl, setRecordingUrl] = useState(null);
  const [stream, setStream] = useState(null);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopStream();
      if (timerRef.current) clearInterval(timerRef.current);
      if (recordingUrl) URL.revokeObjectURL(recordingUrl);
    };
  }, []);

  // Stop all tracks in the stream
  const stopStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  // Request media permissions and setup stream
  const requestPermissions = useCallback(async () => {
    setState(RecordingState.REQUESTING);
    setError(null);

    try {
      const constraints = {
        audio: audio ? {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        } : false,
        video: video ? {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        } : false,
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      setState(RecordingState.READY);
      return mediaStream;
    } catch (err) {
      console.error('Media permission error:', err);
      setError(err.message || 'Failed to access media devices');
      setState(RecordingState.ERROR);
      return null;
    }
  }, [audio, video]);

  // Start recording
  const startRecording = useCallback(async () => {
    let activeStream = stream;
    
    if (!activeStream) {
      activeStream = await requestPermissions();
      if (!activeStream) return;
    }

    // Clear previous recording
    if (recordingUrl) {
      URL.revokeObjectURL(recordingUrl);
      setRecordingUrl(null);
    }
    setRecordingBlob(null);
    chunksRef.current = [];
    setDuration(0);

    try {
      // Determine mime type
      const mimeType = video 
        ? (MediaRecorder.isTypeSupported('video/webm;codecs=vp9') 
            ? 'video/webm;codecs=vp9' 
            : 'video/webm')
        : (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
            ? 'audio/webm;codecs=opus'
            : 'audio/webm');

      const recorder = new MediaRecorder(activeStream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setRecordingBlob(blob);
        setRecordingUrl(url);
        setState(RecordingState.STOPPED);
      };

      recorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        setError('Recording failed');
        setState(RecordingState.ERROR);
      };

      // Start recording with 100ms chunks for better granularity
      recorder.start(100);
      startTimeRef.current = Date.now();
      setState(RecordingState.RECORDING);

      // Duration timer
      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        setDuration(elapsed);

        // Auto-stop at max duration
        if (elapsed >= maxDuration) {
          stopRecording();
        }
      }, 100);

    } catch (err) {
      console.error('Start recording error:', err);
      setError(err.message || 'Failed to start recording');
      setState(RecordingState.ERROR);
    }
  }, [stream, video, maxDuration, recordingUrl, requestPermissions]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  // Pause recording
  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setState(RecordingState.PAUSED);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  }, []);

  // Resume recording
  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setState(RecordingState.RECORDING);
      const pausedDuration = duration;
      startTimeRef.current = Date.now() - pausedDuration;
      timerRef.current = setInterval(() => {
        setDuration(Date.now() - startTimeRef.current);
      }, 100);
    }
  }, [duration]);

  // Reset to initial state
  const reset = useCallback(() => {
    stopRecording();
    stopStream();
    if (recordingUrl) {
      URL.revokeObjectURL(recordingUrl);
    }
    setRecordingUrl(null);
    setRecordingBlob(null);
    setDuration(0);
    setError(null);
    setState(RecordingState.IDLE);
  }, [stopRecording, stopStream, recordingUrl]);

  return {
    // State
    state,
    error,
    duration,
    recordingBlob,
    recordingUrl,
    stream,
    isRecording: state === RecordingState.RECORDING,
    isPaused: state === RecordingState.PAUSED,
    hasRecording: !!recordingUrl,

    // Actions
    requestPermissions,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    reset,
    stopStream,
  };
}

export default useMediaRecorder;
