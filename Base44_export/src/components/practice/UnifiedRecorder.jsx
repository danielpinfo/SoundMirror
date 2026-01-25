import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, Square, Loader2, Camera, CameraOff, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import VisemeComparisonDisplay from './VisemeComparisonDisplay';
import { useTranslations } from './translations';

// Lip landmark indices
const LIP_OUTER = [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 409, 270, 269, 267, 0, 37, 39, 40, 185];

export default function UnifiedRecorder({ 
  targetWord, 
  targetPhonemes, 
  onRecordingComplete,
  isProcessing = false
}) {
  // All refs first
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const faceLandmarkerRef = useRef(null);
  const animationFrameRef = useRef(null);
  const lastVideoTimeRef = useRef(-1);
  const blendshapeHistoryRef = useRef([]);

  // All state hooks together
  const [selectedLang, setSelectedLang] = useState(() => 
    typeof window !== 'undefined' ? localStorage.getItem('soundmirror_lang') || 'en' : 'en'
  );
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [blendshapes, setBlendshapes] = useState(null);
  const [faceLandmarkerReady, setFaceLandmarkerReady] = useState(false);
  const [loadingStage, setLoadingStage] = useState('');
  const [backendReady, setBackendReady] = useState(false);

  // Translation hook - must be called unconditionally
  const t = useTranslations(selectedLang);

  // Load face landmarker on mount and wake up backend
  useEffect(() => {
    loadFaceLandmarker();
    wakeUpBackend();
    return () => cleanup();
  }, []);

  // Wake up the Railway backend (cold start can take 10-20s)
  const wakeUpBackend = async () => {
    try {
      const backendUrl = "https://base44-phoneme-backend-production.up.railway.app";
      const response = await fetch(`${backendUrl}/health`, { method: 'GET' });
      if (response.ok) {
        setBackendReady(true);
        console.log('[UnifiedRecorder] Backend is ready');
      }
    } catch (err) {
      console.warn('[UnifiedRecorder] Backend wake-up failed, will retry on record:', err);
    }
  };

  const cleanup = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    stopCamera();
  };

  const loadFaceLandmarker = async () => {
    try {
      setLoadingStage(t('loadingFaceTracking'));
      
      // Use script tag to load MediaPipe (works better with Vite build)
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

      if (!window.MediaPipeVision) {
        throw new Error('MediaPipe failed to load');
      }

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
      setLoadingStage('');
    } catch (err) {
      console.error('Error loading FaceLandmarker:', err);
      setLoadingStage('');
      // Continue without face tracking - audio still works
    }
  };

  const startCamera = async () => {
    setIsCameraLoading(true);
    setCameraError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: { channelCount: 1, sampleRate: 16000, echoCancellation: true, noiseSuppression: true }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsCameraActive(true);
        setIsCameraLoading(false);
        detectFrame();
      }
    } catch (err) {
      console.error('Camera error:', err);
      setCameraError(t('cameraError'));
      setIsCameraLoading(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setIsCameraActive(false);
    setIsRecording(false);
  };

  const detectFrame = useCallback(async () => {
    if (!faceLandmarkerRef.current || !videoRef.current || !canvasRef.current) {
      animationFrameRef.current = requestAnimationFrame(detectFrame);
      return;
    }

    const video = videoRef.current;
    if (video.readyState < 2 || video.currentTime === lastVideoTimeRef.current) {
      animationFrameRef.current = requestAnimationFrame(detectFrame);
      return;
    }
    lastVideoTimeRef.current = video.currentTime;

    try {
      const results = faceLandmarkerRef.current.detectForVideo(video, performance.now());
      
      if (results?.faceLandmarks?.length > 0) {
        processResults(results);
      } else {
        // Just draw video if no face detected
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.save();
        ctx.scale(-1, 1);
        ctx.translate(-canvas.width, 0);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        ctx.restore();
      }
    } catch (err) {
      console.error('Detection error:', err);
    }

    animationFrameRef.current = requestAnimationFrame(detectFrame);
  }, []);

  const processResults = (results) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const video = videoRef.current;

    // Draw mirrored video
    ctx.save();
    ctx.scale(-1, 1);
    ctx.translate(-canvas.width, 0);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    const landmarks = results.faceLandmarks[0];
    const faceBlendshapes = results.faceBlendshapes?.[0]?.categories || [];

    // Convert to object
    const blendshapeObj = {};
    faceBlendshapes.forEach(shape => {
      blendshapeObj[shape.categoryName] = shape.score;
    });
    setBlendshapes(blendshapeObj);

    // Store history during recording
    if (isRecording) {
      blendshapeHistoryRef.current.push({
        time: performance.now(),
        blendshapes: { ...blendshapeObj }
      });
    }

    // Draw lip overlay
    drawLipOverlay(ctx, landmarks, blendshapeObj);
  };

  const drawLipOverlay = (ctx, landmarks, blendshapes) => {
    const w = canvasRef.current.width;
    const h = canvasRef.current.height;
    
    const jawOpen = blendshapes.jawOpen || 0;
    let strokeColor = jawOpen > 0.3 ? '#22c55e' : '#3b82f6';

    ctx.strokeStyle = strokeColor;
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
  };

  const startRecording = async () => {
    if (!videoRef.current?.srcObject) return;

    audioChunksRef.current = [];
    blendshapeHistoryRef.current = [];

    const stream = videoRef.current.srcObject;
    const audioTracks = stream.getAudioTracks();
    
    if (audioTracks.length === 0) {
      alert(t('noAudioTrack'));
      return;
    }

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
      // Only process if we have audio data
      if (audioChunksRef.current.length === 0) return;
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });
      const wavBlob = await convertToWav(audioBlob);
      
      if (!wavBlob) {
        console.warn("convertToWav returned null, skipping recording completion");
        return;
      }
      
      // Pass both audio and blendshape data
      onRecordingComplete(wavBlob, blendshapeHistoryRef.current);
    };

    mediaRecorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const convertToWav = async (audioBlob) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    const offlineContext = new OfflineAudioContext(1, audioBuffer.duration * 16000, 16000);
    const source = offlineContext?.createBufferSource();
    
    if (!offlineContext || !source) {
      console.warn("convertToWav: offlineContext or source is missing");
      return null;
    }
    
    source.buffer = audioBuffer;
    source.connect(offlineContext.destination);
    source.start();
    
    const renderedBuffer = await offlineContext.startRendering();
    const wavBuffer = audioBufferToWav(renderedBuffer);
    return new Blob([wavBuffer], { type: 'audio/wav' });
  };

  const audioBufferToWav = (buffer) => {
    const length = buffer.length * buffer.numberOfChannels * 2 + 44;
    const arrayBuffer = new ArrayBuffer(length);
    const view = new DataView(arrayBuffer);
    const channels = [];
    let pos = 0;

    const setUint16 = (data) => { view.setUint16(pos, data, true); pos += 2; };
    const setUint32 = (data) => { view.setUint32(pos, data, true); pos += 4; };

    setUint32(0x46464952);
    setUint32(length - 8);
    setUint32(0x45564157);
    setUint32(0x20746d66);
    setUint32(16);
    setUint16(1);
    setUint16(buffer.numberOfChannels);
    setUint32(buffer.sampleRate);
    setUint32(buffer.sampleRate * 2 * buffer.numberOfChannels);
    setUint16(buffer.numberOfChannels * 2);
    setUint16(16);
    setUint32(0x61746164);
    setUint32(length - pos - 4);

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

  // Start camera and recording
  const startCameraAndRecord = async () => {
    console.log('[UnifiedRecorder] Start button clicked');
    setIsCameraLoading(true);
    setCameraError(null);

    try {
      console.log('[UnifiedRecorder] Requesting media permissions...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: { channelCount: 1, sampleRate: 16000, echoCancellation: true, noiseSuppression: true }
      });

      console.log('[UnifiedRecorder] Media stream obtained');

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsCameraActive(true);
        setIsCameraLoading(false);
        console.log('[UnifiedRecorder] Camera started');
        
        // Give camera a moment to stabilize
        await new Promise(resolve => setTimeout(resolve, 300));
        detectFrame();
        
        // Start recording
        audioChunksRef.current = [];
        blendshapeHistoryRef.current = [];

        const audioTracks = stream.getAudioTracks();
        console.log('[UnifiedRecorder] Audio tracks:', audioTracks.length);
        
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
            console.log('[UnifiedRecorder] Recording stopped, processing...');
            if (audioChunksRef.current.length === 0) {
              console.warn('[UnifiedRecorder] No audio chunks recorded');
              return;
            }
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });
            const wavBlob = await convertToWav(audioBlob);
            if (!wavBlob) {
              console.warn("convertToWav returned null");
              return;
            }
            console.log('[UnifiedRecorder] Calling onRecordingComplete');
            onRecordingComplete(wavBlob, blendshapeHistoryRef.current);
          };

          mediaRecorder.start();
          setIsRecording(true);
          console.log('[UnifiedRecorder] Recording started');
        }
      }
    } catch (err) {
      console.error('[UnifiedRecorder] Error:', err);
      setCameraError(err.message || t('cameraError'));
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

  return (
    <div className="space-y-6">
      {/* Camera/Video Display */}
      <Card className="overflow-hidden border-2 border-slate-600 max-w-xl mx-auto">
        <div className="relative" style={{ height: 320 }}>
          <video ref={videoRef} className="hidden" playsInline muted />
          <img
            src="/assets/heads/head_neutral.png"
            alt="Head"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              pointerEvents: 'none',
              userSelect: 'none',
              zIndex: 0
            }}
            draggable={false}
          />
          <canvas
            ref={canvasRef}
            width={640}
            height={480}
            className="w-full h-auto rounded-t-lg"
            style={{ position: 'absolute', inset: 0, maxHeight: '320px', objectFit: 'cover', zIndex: 1 }}
          />
          
          {/* Large record button overlay when not active */}
          {!isCameraActive && !isCameraLoading && !cameraError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 gap-2 z-10" style={{ pointerEvents: 'auto' }}>
              <p className="text-white text-xs">{t('say')}: <span className="font-bold text-blue-400">{targetWord}</span></p>
              {isProcessing ? (
                <div className="flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                  </div>
                  <p className="text-slate-300 text-xs">{t('analyzing')}</p>
                </div>
              ) : (
                <Button
                  onClick={() => {
                    console.log('[UnifiedRecorder] Button clicked!');
                    startCameraAndRecord();
                  }}
                  className="w-24 h-24 rounded-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl transition-all"
                >
                  <Mic className="h-11 w-11" />
                </Button>
              )}
              {loadingStage && <p className="text-slate-400 text-[10px]">{loadingStage}</p>}
            </div>
          )}

          {isCameraLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80">
              <div className="text-center space-y-2">
                <Loader2 className="h-10 w-10 text-blue-500 animate-spin mx-auto" />
                <p className="text-white text-sm">{t('startRecording')}...</p>
              </div>
            </div>
          )}

          {cameraError && (
            <div className="absolute inset-0 flex items-center justify-center bg-red-900/80">
              <div className="text-center space-y-2 p-4">
                <AlertCircle className="h-8 w-8 text-white mx-auto" />
                <p className="text-white text-sm">{cameraError}</p>
                <Button onClick={startCameraAndRecord} variant="outline" size="sm">{t('tryAgain')}</Button>
              </div>
            </div>
          )}

          {/* When recording - stop button on left side */}
          {isCameraActive && isRecording && (
            <div className="absolute inset-y-0 left-4 flex items-center z-20">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <Button
                  onClick={stopCameraAndRecording}
                  className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 animate-pulse shadow-lg"
                >
                  <Square className="h-8 w-8" />
                </Button>
              </motion.div>
            </div>
          )}

          {isCameraActive && !isRecording && (
            <div className="absolute top-2 right-2">
              <Button onClick={stopCamera} size="sm" variant="destructive" className="gap-1 text-xs">
                <CameraOff className="h-3 w-3" />
                {t('stopRecording')}
              </Button>
            </div>
          )}
        </div>

        {/* Compact target word display */}
        <div className="p-3 bg-gradient-to-r from-slate-700 to-indigo-900 border-t-2 border-slate-600">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-400">{targetWord}</p>
            {targetPhonemes && (
              <p className="text-sm text-slate-300">
                {targetPhonemes.phonetic || targetPhonemes.phonemes?.[0]?.phonetic}
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Mouth shape comparison - always visible */}
      {targetPhonemes?.phonemes?.[0] && (
        <VisemeComparisonDisplay
          currentBlendshapes={blendshapes}
          targetPhoneme={targetPhonemes.phonemes[0]}
          phonemeSequence={targetPhonemes.phonemes}
          currentIndex={0}
        />
      )}
    </div>
  );
}