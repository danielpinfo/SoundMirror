import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { useLanguage } from '../context/LanguageContext';
import { analyzePhonemes, gradePhonemes } from '../lib/phonemeAnalysis';
import { PhonemeComparisonPanel } from './PhonemeComparisonPanel';
import { GuidedFocusModePanel, identifyFocusPhoneme } from './GuidedFocusModePanel';
import { logPhonemeSequences } from '../lib/ipaDisplayMapping';
import { 
  Mic, 
  Square, 
  Loader2, 
  AlertCircle,
  Target,
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// =============================================================================
// GRADING GATE — Set to true to enable grading after recording
// =============================================================================
const GRADING_ENABLED = true;

// Lip landmark indices for drawing overlay
const LIP_OUTER = [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 409, 270, 269, 267, 0, 37, 39, 40, 185];

export const RecordingPanel = ({ 
  onRecordingComplete, 
  onGradingComplete,
  target = '',
  language = 'english',
}) => {
  const { t } = useLanguage();
  
  // Phoneme comparison state
  const [targetIpaSequence, setTargetIpaSequence] = useState([]);
  const [detectedIpaSequence, setDetectedIpaSequence] = useState([]);
  
  // Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  const animationFrameRef = useRef(null);
  const faceLandmarkerRef = useRef(null);
  const lastVideoTimeRef = useRef(-1);
  
  // State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [grading, setGrading] = useState(null);
  const [isGrading, setIsGrading] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [faceLandmarkerReady, setFaceLandmarkerReady] = useState(false);
  const recordingTimerRef = useRef(null);
  
  // Focus Mode state
  const [focusModeActive, setFocusModeActive] = useState(false);
  const [focusPhoneme, setFocusPhoneme] = useState(null);
  const [focusAttemptCount, setFocusAttemptCount] = useState(0);
  const [focusPreviousScore, setFocusPreviousScore] = useState(null);

  // Load MediaPipe FaceLandmarker
  useEffect(() => {
    loadFaceLandmarker();
    return () => cleanup();
  }, []);

  const loadFaceLandmarker = async () => {
    try {
      // Check if already loaded
      if (window.MediaPipeVision) {
        await initFaceLandmarker();
        return;
      }

      // Load MediaPipe via script tag (works better with build systems)
      const script = document.createElement('script');
      script.type = 'module';
      script.textContent = `
        import { FaceLandmarker, FilesetResolver } from 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs';
        window.MediaPipeVision = { FaceLandmarker, FilesetResolver };
      `;
      document.head.appendChild(script);

      // Wait for script to load
      await new Promise((resolve) => {
        const check = setInterval(() => {
          if (window.MediaPipeVision) {
            clearInterval(check);
            resolve();
          }
        }, 100);
        setTimeout(() => { clearInterval(check); resolve(); }, 5000);
      });

      if (window.MediaPipeVision) {
        await initFaceLandmarker();
      }
    } catch (err) {
      console.error('Error loading MediaPipe:', err);
    }
  };

  const initFaceLandmarker = async () => {
    try {
      const { FaceLandmarker, FilesetResolver } = window.MediaPipeVision;

      const filesetResolver = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
      );

      const landmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
          delegate: 'GPU'
        },
        runningMode: 'VIDEO',
        numFaces: 1,
        outputFaceBlendshapes: true,
        outputFacialTransformationMatrixes: false
      });

      faceLandmarkerRef.current = landmarker;
      setFaceLandmarkerReady(true);
      console.log('[RecordingPanel] FaceLandmarker ready');
    } catch (err) {
      console.error('Error initializing FaceLandmarker:', err);
    }
  };

  const cleanup = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    stopCamera();
  };

  // Start camera and recording together (single button action)
  const startCameraAndRecord = async () => {
    console.log('[RecordingPanel] Begin Practice button clicked');
    setIsCameraLoading(true);
    setCameraError(null);

    try {
      console.log('[RecordingPanel] Requesting media permissions...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: { channelCount: 1, sampleRate: 16000, echoCancellation: true, noiseSuppression: true }
      });

      console.log('[RecordingPanel] Media stream obtained');
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsCameraActive(true);
        setIsCameraLoading(false);
        console.log('[RecordingPanel] Camera started');
        
        // Give camera a moment to stabilize
        await new Promise(resolve => setTimeout(resolve, 300));
        detectFrame();
        
        // Start recording immediately
        audioChunksRef.current = [];

        const audioTracks = stream.getAudioTracks();
        console.log('[RecordingPanel] Audio tracks:', audioTracks.length);
        
        if (audioTracks.length > 0) {
          const audioStream = new MediaStream(audioTracks);
          let options = { mimeType: 'audio/webm;codecs=opus' };
          if (!MediaRecorder.isTypeSupported(options.mimeType)) {
            options = { mimeType: 'audio/webm' };
          }
          if (!MediaRecorder.isTypeSupported(options.mimeType)) {
            options = {};
          }

          const mediaRecorder = new MediaRecorder(audioStream, options);
          mediaRecorderRef.current = mediaRecorder;

          mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
              audioChunksRef.current.push(e.data);
            }
          };

          mediaRecorder.onstop = async () => {
            console.log('[RecordingPanel] Recording stopped, processing...');
            clearInterval(recordingTimerRef.current);
            
            if (audioChunksRef.current.length === 0) {
              console.warn('[RecordingPanel] No audio chunks recorded');
              return;
            }
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });
            const wavBlob = await convertToWav(audioBlob);
            if (!wavBlob) {
              console.warn("convertToWav returned null");
              return;
            }
            
            // GRADING GATE: Only call grading if enabled
            if (GRADING_ENABLED) {
              console.log('[RecordingPanel] Calling performGrading');
              await performGrading(wavBlob);
            } else {
              // Still run IPA detection for logging, but skip grading API calls
              console.log('[RecordingPanel] GRADING_ENABLED=false, running IPA detection only');
              try {
                // Get target IPA sequence (text-based)
                const targetResult = await analyzePhonemes(target, language, null);
                setTargetIpaSequence(targetResult.ipaSequence);
                logPhonemeSequences(targetResult.ipaSequence, 'Target', language);
                
                // Get detected IPA sequence (from Allosaurus)
                const detectionResult = await analyzePhonemes(target, language, wavBlob);
                setDetectedIpaSequence(detectionResult.ipaSequence);
                logPhonemeSequences(detectionResult.ipaSequence, 'Detected', language);
                
                console.log('[RecordingPanel] IPA detection complete (grading skipped)');
                console.log('[RecordingPanel] Duration:', detectionResult.durationMs, 'ms');
              } catch (err) {
                console.error('[RecordingPanel] IPA detection error:', err);
              }
            }
          };

          mediaRecorder.start();
          setIsRecording(true);
          
          // Timer
          setRecordingTime(0);
          recordingTimerRef.current = setInterval(() => {
            setRecordingTime(prev => prev + 1);
          }, 1000);
          
          console.log('[RecordingPanel] Recording started');
        }
      }
    } catch (err) {
      console.error('[RecordingPanel] Error:', err);
      console.error('[RecordingPanel] Error name:', err.name);
      console.error('[RecordingPanel] Error message:', err.message);
      
      let errorMessage = 'Could not access camera/microphone';
      
      if (err.name === 'NotAllowedError') {
        errorMessage = 'Permission denied. Please allow camera/microphone access in your browser settings.';
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'No camera or microphone found. Please connect a device and try again.';
      } else if (err.name === 'NotReadableError') {
        errorMessage = 'Camera/microphone is already in use by another application. Please close other apps using the camera.';
      } else if (err.name === 'OverconstrainedError') {
        errorMessage = 'Camera settings not supported. Trying with default settings...';
        // Try again with minimal constraints
        setTimeout(() => {
          tryWithMinimalConstraints();
        }, 1000);
        return;
      } else {
        errorMessage = `Error: ${err.message || err.name || 'Unknown error'}`;
      }
      
      setCameraError(errorMessage);
      setIsCameraLoading(false);
    }
  };

  const stopCameraAndRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
    // Don't stop the camera immediately - let onstop handler finish first
    setTimeout(() => {
      stopCamera();
    }, 100);
  };

  // Fallback: try with minimal constraints
  const tryWithMinimalConstraints = async () => {
    console.log('[RecordingPanel] Trying with minimal constraints...');
    setIsCameraLoading(true);
    setCameraError(null);

    try {
      // Simplified constraints
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      console.log('[RecordingPanel] Media stream obtained with minimal constraints');
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsCameraActive(true);
        setIsCameraLoading(false);
        console.log('[RecordingPanel] Camera started');
        
        await new Promise(resolve => setTimeout(resolve, 300));
        detectFrame();
        
        // Start recording
        audioChunksRef.current = [];
        const audioTracks = stream.getAudioTracks();
        
        if (audioTracks.length > 0) {
          const audioStream = new MediaStream(audioTracks);
          const mediaRecorder = new MediaRecorder(audioStream);
          mediaRecorderRef.current = mediaRecorder;

          mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
              audioChunksRef.current.push(e.data);
            }
          };

          mediaRecorder.onstop = async () => {
            console.log('[RecordingPanel] Recording stopped, processing...');
            clearInterval(recordingTimerRef.current);
            
            if (audioChunksRef.current.length === 0) {
              console.warn('[RecordingPanel] No audio chunks recorded');
              return;
            }
            const audioBlob = new Blob(audioChunksRef.current);
            const wavBlob = await convertToWav(audioBlob);
            if (wavBlob) {
              // GRADING GATE: Only call grading if enabled
              if (GRADING_ENABLED) {
                await performGrading(wavBlob);
              } else {
                // Still run IPA detection for logging, but skip grading API calls
                console.log('[RecordingPanel] GRADING_ENABLED=false, running IPA detection only');
                try {
                  // Get target IPA sequence (text-based)
                  const targetResult = await analyzePhonemes(target, language, null);
                  setTargetIpaSequence(targetResult.ipaSequence);
                  logPhonemeSequences(targetResult.ipaSequence, 'Target', language);
                  
                  // Get detected IPA sequence (from Allosaurus)
                  const detectionResult = await analyzePhonemes(target, language, wavBlob);
                  setDetectedIpaSequence(detectionResult.ipaSequence);
                  logPhonemeSequences(detectionResult.ipaSequence, 'Detected', language);
                  
                  console.log('[RecordingPanel] IPA detection complete (grading skipped)');
                  console.log('[RecordingPanel] Duration:', detectionResult.durationMs, 'ms');
                } catch (err) {
                  console.error('[RecordingPanel] IPA detection error:', err);
                }
              }
            }
          };

          mediaRecorder.start();
          setIsRecording(true);
          
          setRecordingTime(0);
          recordingTimerRef.current = setInterval(() => {
            setRecordingTime(prev => prev + 1);
          }, 1000);
        }
      }
    } catch (err) {
      console.error('[RecordingPanel] Minimal constraints also failed:', err);
      setCameraError(`Failed to start: ${err.message || err.name}`);
      setIsCameraLoading(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setIsCameraActive(false);
    setIsRecording(false);
  };

  // Frame detection loop - draws video to canvas with face overlay
  const detectFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) {
      animationFrameRef.current = requestAnimationFrame(detectFrame);
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (video.readyState < 2) {
      animationFrameRef.current = requestAnimationFrame(detectFrame);
      return;
    }

    // Draw mirrored video
    ctx.save();
    ctx.scale(-1, 1);
    ctx.translate(-canvas.width, 0);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    // Try face detection if available
    if (faceLandmarkerRef.current && video.currentTime !== lastVideoTimeRef.current) {
      lastVideoTimeRef.current = video.currentTime;
      
      try {
        const results = faceLandmarkerRef.current.detectForVideo(video, performance.now());
        if (results?.faceLandmarks?.length > 0) {
          drawLipOverlay(ctx, results.faceLandmarks[0], canvas.width, canvas.height);
        }
      } catch (err) {
        // Silent fail - just show video without overlay
      }
    }

    // Recording indicator
    if (isRecording) {
      ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
      ctx.beginPath();
      ctx.arc(30, 30, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('REC', 50, 35);
    }

    animationFrameRef.current = requestAnimationFrame(detectFrame);
  }, [isRecording]);

  const drawLipOverlay = (ctx, landmarks, w, h) => {
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    LIP_OUTER.forEach((index, i) => {
      const point = landmarks[index];
      const x = (1 - point.x) * w;
      const y = point.y * h;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.stroke();
  };

  // Convert audio to WAV format
  const convertToWav = async (audioBlob) => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      const offlineContext = new OfflineAudioContext(1, audioBuffer.duration * 16000, 16000);
      const source = offlineContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(offlineContext.destination);
      source.start();
      
      const renderedBuffer = await offlineContext.startRendering();
      const wavBuffer = audioBufferToWav(renderedBuffer);
      return new Blob([wavBuffer], { type: 'audio/wav' });
    } catch (err) {
      console.error('Error converting to WAV:', err);
      return null;
    }
  };

  const audioBufferToWav = (buffer) => {
    const length = buffer.length * buffer.numberOfChannels * 2 + 44;
    const arrayBuffer = new ArrayBuffer(length);
    const view = new DataView(arrayBuffer);
    let pos = 0;

    const setUint16 = (data) => { view.setUint16(pos, data, true); pos += 2; };
    const setUint32 = (data) => { view.setUint32(pos, data, true); pos += 4; };

    setUint32(0x46464952); // RIFF
    setUint32(length - 8);
    setUint32(0x45564157); // WAVE
    setUint32(0x20746d66); // fmt
    setUint32(16);
    setUint16(1); // PCM
    setUint16(buffer.numberOfChannels);
    setUint32(buffer.sampleRate);
    setUint32(buffer.sampleRate * 2 * buffer.numberOfChannels);
    setUint16(buffer.numberOfChannels * 2);
    setUint16(16);
    setUint32(0x61746164); // data
    setUint32(length - pos - 4);

    const channels = [];
    for (let i = 0; i < buffer.numberOfChannels; i++) {
      channels.push(buffer.getChannelData(i));
    }

    let offset = 0;
    while (pos < length) {
      for (let i = 0; i < buffer.numberOfChannels; i++) {
        let sample = Math.max(-1, Math.min(1, channels[i][offset]));
        sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
        view.setInt16(pos, sample, true);
        pos += 2;
      }
      offset++;
    }

    return arrayBuffer;
  };

  // Perform grading with REAL IPA detection via hybrid bridge
  const performGrading = async (audioBlob) => {
    setIsGrading(true);
    
    try {
      // STEP 1: Get target phoneme sequence (text-based analysis)
      console.log('[RecordingPanel] Starting phoneme grading...');
      console.log('[RecordingPanel] Audio blob:', { type: audioBlob.type, size: audioBlob.size });
      
      const targetResult = await analyzePhonemes(target, language, null);
      setTargetIpaSequence(targetResult.ipaSequence);
      logPhonemeSequences(targetResult.ipaSequence, 'Target', language);
      
      // STEP 2: Run native IPA detection via analyzePhonemes with audioBlob
      // This sends the audioBlob to Allosaurus backend for real phoneme detection
      const detectionResult = await analyzePhonemes(target, language, audioBlob);
      setDetectedIpaSequence(detectionResult.ipaSequence);
      logPhonemeSequences(detectionResult.ipaSequence, 'Detected', language);
      
      // Log detected IPA sequence from REAL speech
      console.log('[RecordingPanel] Native IPA detection complete:');
      console.log('[RecordingPanel] Detected ipaSequence:', detectionResult.ipaSequence);
      console.log('[RecordingPanel] Detected symbols:', detectionResult.ipaSequence.map(p => p.symbol));
      console.log('[RecordingPanel] Duration:', detectionResult.durationMs, 'ms');
      
      // STEP 3: Grade using articulatory feature comparison
      const gradingResult = gradePhonemes(targetResult, detectionResult);
      
      console.log('[RecordingPanel] Grading complete:');
      console.log('[RecordingPanel] Overall score:', gradingResult.overallScore);
      console.log('[RecordingPanel] Analysis:', gradingResult.analysis);
      console.log('[RecordingPanel] Feedback:', gradingResult.feedback);
      
      // Transform to display format
      const displayResult = {
        audioScore: gradingResult.overallScore,
        visualScore: gradingResult.overallScore, // Using same score for now
        phonemeDetected: detectionResult.ipaSequence.map(p => p.symbol).join(' '),
        suggestions: gradingResult.feedback,
        detectedIPA: detectionResult.ipaSequence.map(p => p.symbol),
        gradingDetails: gradingResult, // Include full details for debugging
      };
      
      setGrading(displayResult);
      
      // Update focus mode if active
      if (focusModeActive && focusPhoneme) {
        // Find the same position in new grading results
        const newPhonemeScore = gradingResult.phonemeScores?.find(
          ps => ps.position === focusPhoneme.position
        );
        
        if (newPhonemeScore) {
          // Get updated detected display using ipaToDisplay directly
          const detectedPhoneme = detectionResult.ipaSequence?.[focusPhoneme.position];
          const { ipaToDisplay } = require('../lib/ipaDisplayMapping');
          const detectedDisplay = detectedPhoneme 
            ? ipaToDisplay(detectedPhoneme.symbol, language)
            : null;
          
          setFocusPhoneme(prev => ({
            ...prev,
            score: newPhonemeScore.score,
            detectedDisplayText: detectedDisplay,
            feedback: newPhonemeScore.feedback,
          }));
          setFocusAttemptCount(prev => prev + 1);
        }
      }
      
      if (onGradingComplete) {
        onGradingComplete(displayResult);
      }
      
    } catch (error) {
      console.error('[RecordingPanel] Grading error:', error);
      // Use fallback grading on error
      const fallbackResult = {
        audioScore: 0,
        visualScore: 0,
        phonemeDetected: '',
        suggestions: ['Recording failed. Please try again.'],
        detectedIPA: [],
        gradingDetails: null,
      };
      setGrading(fallbackResult);
      if (onGradingComplete) {
        onGradingComplete(fallbackResult);
      }
    } finally {
      setIsGrading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // =============================================================================
  // FOCUS MODE HANDLERS
  // =============================================================================
  
  /**
   * Enter focus mode for a specific phoneme
   */
  const enterFocusMode = () => {
    if (!grading?.gradingDetails) return;
    
    const focus = identifyFocusPhoneme(
      grading.gradingDetails,
      targetIpaSequence,
      detectedIpaSequence,
      language
    );
    
    if (focus) {
      setFocusPhoneme(focus);
      setFocusModeActive(true);
      setFocusAttemptCount(1);
      setFocusPreviousScore(focus.score);
      console.log('[RecordingPanel] Entering Focus Mode for:', focus.targetDisplayText);
    }
  };
  
  /**
   * Exit focus mode and return to full word view
   */
  const exitFocusMode = () => {
    setFocusModeActive(false);
    setFocusPhoneme(null);
    setFocusAttemptCount(0);
    setFocusPreviousScore(null);
    console.log('[RecordingPanel] Exiting Focus Mode');
  };
  
  /**
   * Handle "Try Again" in focus mode - triggers recording for single phoneme
   */
  const handleFocusTryAgain = () => {
    // Store current score before new attempt
    if (focusPhoneme) {
      setFocusPreviousScore(focusPhoneme.score);
    }
    // Trigger recording (reuses existing flow)
    startCameraAndRecord();
  };
  
  /**
   * Update focus phoneme after grading in focus mode
   */
  const updateFocusPhonemeAfterGrading = (newGradingDetails) => {
    if (!focusModeActive || !focusPhoneme) return;
    
    // Find the same position in new grading results
    const newPhonemeScore = newGradingDetails?.phonemeScores?.find(
      ps => ps.position === focusPhoneme.position
    );
    
    if (newPhonemeScore) {
      // Get updated detected display
      const detectedPhoneme = detectedIpaSequence?.[focusPhoneme.position];
      const detectedDisplay = detectedPhoneme 
        ? require('../lib/ipaDisplayMapping').ipaToDisplay(detectedPhoneme.symbol, language)
        : null;
      
      setFocusPhoneme(prev => ({
        ...prev,
        score: newPhonemeScore.score,
        detectedDisplayText: detectedDisplay,
        feedback: newPhonemeScore.feedback,
      }));
      setFocusAttemptCount(prev => prev + 1);
    }
  };

  return (
    <div className="space-y-4" data-testid="recording-panel">
      {/* Video/Canvas Display */}
      <div className="relative bg-slate-900 rounded-xl overflow-hidden" style={{ aspectRatio: '4/3' }}>
        {/* Hidden video element */}
        <video 
          ref={videoRef} 
          className="hidden" 
          playsInline 
          muted 
        />
        
        {/* Canvas where we draw the video + overlay */}
        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          className="w-full h-full object-cover"
        />

        {/* Large "Begin Practice" button overlay when not active */}
        {!isCameraActive && !isCameraLoading && !cameraError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/95 gap-4">
            <p className="text-white text-sm">
              Say: <span className="font-bold text-blue-400">{target}</span>
            </p>
            {isGrading ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center">
                  <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
                </div>
                <p className="text-slate-300 text-sm">Analyzing your pronunciation...</p>
              </div>
            ) : (
              <>
                <Button
                  onClick={startCameraAndRecord}
                  className="w-24 h-24 rounded-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl transition-all"
                  data-testid="begin-practice-btn"
                >
                  <Mic className="h-12 w-12" />
                </Button>
                <p className="text-slate-400 text-xs">Tap to begin practice</p>
              </>
            )}
          </div>
        )}

        {/* Loading */}
        {isCameraLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90">
            <div className="text-center space-y-2">
              <Loader2 className="h-10 w-10 text-blue-500 animate-spin mx-auto" />
              <p className="text-white text-sm">Starting recording...</p>
            </div>
          </div>
        )}

        {/* Error */}
        {cameraError && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-900/90">
            <div className="text-center space-y-3 p-4 max-w-xs">
              <AlertCircle className="h-10 w-10 text-white mx-auto" />
              <p className="text-white text-sm">{cameraError}</p>
              <Button onClick={startCameraAndRecord} variant="outline" size="sm">
                Try Again
              </Button>
            </div>
          </div>
        )}

        {/* Recording timer */}
        {isRecording && (
          <div className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-mono">
            {formatTime(recordingTime)}
          </div>
        )}

        {/* Stop button on left side when recording */}
        {isCameraActive && isRecording && (
          <div className="absolute inset-y-0 left-4 flex items-center z-20">
            <Button
              onClick={stopCameraAndRecording}
              className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 animate-pulse shadow-lg"
              data-testid="stop-recording-btn"
            >
              <Square className="h-8 w-8" />
            </Button>
          </div>
        )}
      </div>

      {/* Phoneme Comparison Panel - Shows user-friendly display (NEVER IPA) */}
      {/* Hide when Focus Mode is active */}
      {!focusModeActive && (targetIpaSequence.length > 0 || detectedIpaSequence.length > 0) && (
        <PhonemeComparisonPanel
          targetIpaSequence={targetIpaSequence}
          detectedIpaSequence={detectedIpaSequence}
          language={language}
        />
      )}
      
      {/* GUIDED FOCUS MODE PANEL */}
      {focusModeActive && focusPhoneme && (
        <GuidedFocusModePanel
          focusPhoneme={focusPhoneme}
          targetDisplayText={focusPhoneme.targetDisplayText}
          detectedDisplayText={focusPhoneme.detectedDisplayText}
          previousScore={focusPreviousScore}
          currentScore={focusPhoneme.score}
          coachingTip={focusPhoneme.coachingTip}
          onTryAgain={handleFocusTryAgain}
          onExit={exitFocusMode}
          isRecording={isRecording}
          isGrading={isGrading}
          attemptCount={focusAttemptCount}
        />
      )}

      {/* Grading Results - Clean, encouraging feedback */}
      {/* Hide when Focus Mode is active */}
      {grading && !isGrading && !focusModeActive && (
        <Card className="bg-slate-800/80 border-slate-700">
          <CardContent className="p-4 space-y-3">
            {/* Encouraging summary based on score */}
            <div className="text-center pb-2">
              {grading.audioScore >= 80 ? (
                <p className="text-emerald-300 font-medium">Great job! Your pronunciation is on point.</p>
              ) : grading.audioScore >= 50 ? (
                <p className="text-blue-300 font-medium">Good effort! A few sounds need attention.</p>
              ) : grading.audioScore > 0 ? (
                <p className="text-amber-300 font-medium">Keep practicing — you&apos;re making progress!</p>
              ) : (
                <p className="text-slate-400 font-medium">Let&apos;s try that again. Speak clearly into the microphone.</p>
              )}
            </div>
            
            {/* Feedback tips - actionable guidance */}
            {grading.suggestions?.length > 0 && grading.audioScore < 100 && (
              <div className="bg-slate-900/50 rounded-lg p-3 space-y-2">
                <p className="text-xs text-slate-500 uppercase tracking-wide">Tips to improve</p>
                {grading.suggestions.slice(0, 2).map((suggestion, idx) => (
                  <p key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                    <span className="text-blue-400 mt-0.5">→</span>
                    <span>{suggestion}</span>
                  </p>
                ))}
              </div>
            )}
            
            {/* Perfect score celebration */}
            {grading.audioScore === 100 && (
              <div className="bg-emerald-900/30 rounded-lg p-3 text-center">
                <p className="text-emerald-300 text-sm">Perfect match! Try another word to keep practicing.</p>
              </div>
            )}
            
            {/* FOCUS MODE ENTRY - "Practice this sound" button */}
            {grading.audioScore < 100 && grading.gradingDetails?.phonemeScores?.some(ps => ps.score < 100) && (
              <div className="pt-2 border-t border-slate-700/50">
                <Button
                  onClick={enterFocusMode}
                  variant="outline"
                  size="sm"
                  className="w-full border-blue-600/50 text-blue-300 hover:bg-blue-900/30 hover:text-blue-200"
                  data-testid="enter-focus-mode-btn"
                >
                  <Target className="w-4 h-4 mr-2" />
                  Practice this sound
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RecordingPanel;
