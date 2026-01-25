import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Card } from "@/components/ui/card";
import { Camera, CameraOff, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

// MediaPipe Face Landmarker blendshape indices for mouth/lips
// These correspond to ARKit-compatible blendshapes
const MOUTH_BLENDSHAPES = {
  jawOpen: 'jawOpen',
  mouthClose: 'mouthClose',
  mouthFunnel: 'mouthFunnel',
  mouthPucker: 'mouthPucker',
  mouthLeft: 'mouthLeft',
  mouthRight: 'mouthRight',
  mouthSmileLeft: 'mouthSmileLeft',
  mouthSmileRight: 'mouthSmileRight',
  mouthFrownLeft: 'mouthFrownLeft',
  mouthFrownRight: 'mouthFrownRight',
  mouthDimpleLeft: 'mouthDimpleLeft',
  mouthDimpleRight: 'mouthDimpleRight',
  mouthStretchLeft: 'mouthStretchLeft',
  mouthStretchRight: 'mouthStretchRight',
  mouthRollLower: 'mouthRollLower',
  mouthRollUpper: 'mouthRollUpper',
  mouthShrugLower: 'mouthShrugLower',
  mouthShrugUpper: 'mouthShrugUpper',
  mouthPressLeft: 'mouthPressLeft',
  mouthPressRight: 'mouthPressRight',
  mouthLowerDownLeft: 'mouthLowerDownLeft',
  mouthLowerDownRight: 'mouthLowerDownRight',
  mouthUpperUpLeft: 'mouthUpperUpLeft',
  mouthUpperUpRight: 'mouthUpperUpRight',
  tongueOut: 'tongueOut'
};

// Lip landmark indices in the 478-point mesh
const LIP_OUTER = [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 409, 270, 269, 267, 0, 37, 39, 40, 185];
const LIP_INNER = [78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308, 415, 310, 311, 312, 13, 82, 81, 80, 191];

// Viseme mapping based on blendshapes
const VISEME_FROM_BLENDSHAPES = {
  0: { name: 'sil', description: 'Silence' },
  1: { name: 'aa', description: 'Open vowel (ah)' },
  2: { name: 'E', description: 'Mid vowel (eh)' },
  3: { name: 'I', description: 'Close vowel (ee)' },
  4: { name: 'O', description: 'Rounded vowel (oh)' },
  5: { name: 'U', description: 'Close rounded (oo)' },
  6: { name: 'PP', description: 'Bilabial (p/b/m)' },
  7: { name: 'FF', description: 'Labiodental (f/v)' },
  8: { name: 'TH', description: 'Dental (th)' },
  9: { name: 'DD', description: 'Alveolar (d/t/n)' },
  10: { name: 'kk', description: 'Velar (k/g)' },
  11: { name: 'CH', description: 'Postalveolar (sh/ch)' },
  12: { name: 'SS', description: 'Sibilant (s/z)' },
  13: { name: 'RR', description: 'Approximant (r)' },
  14: { name: 'nn', description: 'Nasal (n)' }
};

export default function FaceLandmarkerTracker({ 
  targetPhoneme, 
  onMetricsUpdate, 
  onBlendshapesUpdate,
  onVisemeUpdate,
  onLandmarksUpdate 
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const faceLandmarkerRef = useRef(null);
  const animationFrameRef = useRef(null);
  const lastVideoTimeRef = useRef(-1);
  
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState('');
  const [error, setError] = useState(null);
  const [currentViseme, setCurrentViseme] = useState(0);
  const [blendshapes, setBlendshapes] = useState({});

  // Load MediaPipe Tasks Vision
  useEffect(() => {
    loadFaceLandmarker();
    return () => {
      cleanup();
    };
  }, []);

  const cleanup = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    stopCamera();
  };

  const loadFaceLandmarker = async () => {
    try {
      setIsLoading(true);
      setLoadingStage('Loading MediaPipe Vision...');

      // Load the vision bundle from CDN
      const loadScript = (src) => {
        return new Promise((resolve, reject) => {
          if (document.querySelector(`script[src="${src}"]`)) {
            resolve();
            return;
          }
          const script = document.createElement('script');
          script.src = src;
          script.crossOrigin = 'anonymous';
          script.onload = resolve;
          script.onerror = () => reject(new Error(`Failed to load ${src}`));
          document.head.appendChild(script);
        });
      };

      // Load MediaPipe Tasks Vision bundle
      await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs');
      
      // Wait for module to be available
      setLoadingStage('Initializing Face Landmarker...');
      
      // Import the module
      const vision = await import('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs');
      const { FaceLandmarker, FilesetResolver } = vision;

      // Initialize the fileset resolver
      const filesetResolver = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
      );

      setLoadingStage('Loading face model...');

      // Create face landmarker with blendshapes enabled
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
      setIsLoading(false);
      setLoadingStage('');
      
    } catch (err) {
      console.error('Error loading FaceLandmarker:', err);
      
      // Fallback to legacy MediaPipe Face Mesh
      setLoadingStage('Falling back to legacy mode...');
      await loadLegacyFaceMesh();
    }
  };

  const loadLegacyFaceMesh = async () => {
    try {
      const loadScript = (src) => {
        return new Promise((resolve, reject) => {
          if (document.querySelector(`script[src="${src}"]`)) {
            resolve();
            return;
          }
          const script = document.createElement('script');
          script.src = src;
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      };

      await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js');
      await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js');

      const mesh = new window.FaceMesh({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
      });

      mesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      faceLandmarkerRef.current = { legacy: true, mesh };
      setIsLoading(false);
      setLoadingStage('');
    } catch (err) {
      setError('Failed to load face tracking. Please refresh and try again.');
      setIsLoading(false);
    }
  };

  const startCamera = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 640 }, 
          height: { ideal: 480 }, 
          facingMode: 'user',
          frameRate: { ideal: 30 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsActive(true);
        setIsLoading(false);
        
        // Start detection loop
        detectFrame();
      }
    } catch (err) {
      console.error('Camera error:', err);
      setError('Could not access camera. Please check permissions.');
      setIsLoading(false);
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
    setIsActive(false);
  };

  const detectFrame = useCallback(async () => {
    if (!faceLandmarkerRef.current || !videoRef.current || !canvasRef.current) {
      animationFrameRef.current = requestAnimationFrame(detectFrame);
      return;
    }

    const video = videoRef.current;
    
    if (video.readyState < 2) {
      animationFrameRef.current = requestAnimationFrame(detectFrame);
      return;
    }

    // Avoid processing the same frame twice
    if (video.currentTime === lastVideoTimeRef.current) {
      animationFrameRef.current = requestAnimationFrame(detectFrame);
      return;
    }
    lastVideoTimeRef.current = video.currentTime;

    try {
      const landmarker = faceLandmarkerRef.current;
      
      if (landmarker.legacy) {
        // Legacy mode - use old FaceMesh API
        await landmarker.mesh.send({ image: video });
      } else {
        // New Tasks Vision API
        const startTimeMs = performance.now();
        const results = landmarker.detectForVideo(video, startTimeMs);
        
        if (results?.faceLandmarks?.length > 0) {
          processResults(results);
        }
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

    // Clear and draw video frame (mirrored)
    ctx.save();
    ctx.scale(-1, 1);
    ctx.translate(-canvas.width, 0);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    const landmarks = results.faceLandmarks[0];
    const faceBlendshapes = results.faceBlendshapes?.[0]?.categories || [];

    // Convert blendshapes array to object
    const blendshapeObj = {};
    faceBlendshapes.forEach(shape => {
      blendshapeObj[shape.categoryName] = shape.score;
    });
    setBlendshapes(blendshapeObj);

    // Calculate metrics from landmarks and blendshapes
    const metrics = calculateMetrics(landmarks, blendshapeObj);
    
    // Detect viseme from blendshapes
    const viseme = detectViseme(blendshapeObj);
    setCurrentViseme(viseme);

    // Draw overlays
    drawLipOverlay(ctx, landmarks, metrics, viseme);

    // Callbacks
    if (onMetricsUpdate) onMetricsUpdate(metrics);
    if (onBlendshapesUpdate) onBlendshapesUpdate(blendshapeObj);
    if (onVisemeUpdate) onVisemeUpdate(viseme);
    if (onLandmarksUpdate) onLandmarksUpdate(landmarks);
  };

  const calculateMetrics = (landmarks, blendshapes) => {
    const canvas = canvasRef.current;
    const w = canvas.width;
    const h = canvas.height;

    // Key landmark points
    const upperLip = landmarks[13];
    const lowerLip = landmarks[14];
    const leftCorner = landmarks[61];
    const rightCorner = landmarks[291];

    const openness = Math.abs(upperLip.y - lowerLip.y) * h;
    const mouthWidth = Math.abs(leftCorner.x - rightCorner.x) * w;
    const aspectRatio = openness / Math.max(mouthWidth, 1);

    // Extract key blendshapes
    const jawOpen = blendshapes.jawOpen || 0;
    const mouthPucker = blendshapes.mouthPucker || 0;
    const mouthFunnel = blendshapes.mouthFunnel || 0;
    const mouthSmile = ((blendshapes.mouthSmileLeft || 0) + (blendshapes.mouthSmileRight || 0)) / 2;
    const tongueOut = blendshapes.tongueOut || 0;

    return {
      openness: Math.round(openness),
      width: Math.round(mouthWidth),
      aspectRatio: aspectRatio.toFixed(2),
      
      // Blendshape-based metrics (0-1 scale)
      jawOpen,
      pucker: mouthPucker,
      funnel: mouthFunnel,
      smile: mouthSmile,
      tongueOut,
      
      // Derived states
      isOpen: jawOpen > 0.15,
      isRounded: mouthPucker > 0.2 || mouthFunnel > 0.2,
      isWide: mouthSmile > 0.3,
      isClosed: jawOpen < 0.05
    };
  };

  const detectViseme = (blendshapes) => {
    const jawOpen = blendshapes.jawOpen || 0;
    const mouthPucker = blendshapes.mouthPucker || 0;
    const mouthFunnel = blendshapes.mouthFunnel || 0;
    const mouthClose = blendshapes.mouthClose || 0;
    const mouthSmileL = blendshapes.mouthSmileLeft || 0;
    const mouthSmileR = blendshapes.mouthSmileRight || 0;
    const mouthStretchL = blendshapes.mouthStretchLeft || 0;
    const mouthStretchR = blendshapes.mouthStretchRight || 0;
    const tongueOut = blendshapes.tongueOut || 0;

    // Silence detection
    if (jawOpen < 0.05 && mouthPucker < 0.1 && mouthClose > 0.3) {
      return 0; // sil
    }

    // Bilabial (p/b/m) - lips pressed
    if (mouthClose > 0.4 && jawOpen < 0.1) {
      return 6; // PP
    }

    // TH - tongue out
    if (tongueOut > 0.3) {
      return 8; // TH
    }

    // Open vowel (ah) - wide open jaw
    if (jawOpen > 0.5) {
      return 1; // aa
    }

    // Rounded vowels (oh/oo)
    if (mouthPucker > 0.3 || mouthFunnel > 0.3) {
      if (jawOpen > 0.2) {
        return 4; // O
      }
      return 5; // U
    }

    // Wide smile (ee)
    if ((mouthSmileL + mouthSmileR) / 2 > 0.3 || (mouthStretchL + mouthStretchR) / 2 > 0.3) {
      return 3; // I
    }

    // Mid vowel (eh)
    if (jawOpen > 0.15 && jawOpen < 0.4) {
      return 2; // E
    }

    // Sibilant (s/z) - teeth close, slight stretch
    if (jawOpen < 0.1 && (mouthStretchL + mouthStretchR) / 2 > 0.1) {
      return 12; // SS
    }

    return 0; // Default to silence
  };

  const drawLipOverlay = (ctx, landmarks, metrics, viseme) => {
    const w = canvasRef.current.width;
    const h = canvasRef.current.height;

    // Determine color based on viseme match with target
    let strokeColor = '#3b82f6'; // Default blue
    if (metrics.isOpen && metrics.jawOpen > 0.3) {
      strokeColor = '#22c55e'; // Green for good opening
    } else if (metrics.isRounded) {
      strokeColor = '#a855f7'; // Purple for rounded
    }

    // Draw outer lip contour
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

    // Draw inner lip contour
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    
    LIP_INNER.forEach((index, i) => {
      const point = landmarks[index];
      const x = (1 - point.x) * w;
      const y = point.y * h;
      
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Draw viseme indicator
    const visemeInfo = VISEME_FROM_BLENDSHAPES[viseme];
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(10, 10, 150, 50);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(`Viseme: ${visemeInfo.name}`, 20, 32);
    ctx.font = '12px sans-serif';
    ctx.fillText(visemeInfo.description, 20, 50);

    // Draw key blendshape values
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(10, h - 90, 180, 80);
    ctx.fillStyle = '#fff';
    ctx.font = '11px sans-serif';
    ctx.fillText(`Jaw Open: ${(metrics.jawOpen * 100).toFixed(0)}%`, 20, h - 72);
    ctx.fillText(`Pucker: ${(metrics.pucker * 100).toFixed(0)}%`, 20, h - 57);
    ctx.fillText(`Funnel: ${(metrics.funnel * 100).toFixed(0)}%`, 20, h - 42);
    ctx.fillText(`Smile: ${(metrics.smile * 100).toFixed(0)}%`, 20, h - 27);
    ctx.fillText(`Tongue: ${(metrics.tongueOut * 100).toFixed(0)}%`, 110, h - 72);
  };

  return (
    <Card className="overflow-hidden border-2 border-blue-200">
      <div className="relative">
        <video
          ref={videoRef}
          className="hidden"
          playsInline
          muted
        />
        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          className="w-full h-auto bg-slate-900"
        />
        
        {!isActive && !isLoading && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80">
            <Button
              onClick={startCamera}
              size="lg"
              className="gap-2 bg-blue-600 hover:bg-blue-700"
              disabled={!faceLandmarkerRef.current}
            >
              <Camera className="h-5 w-5" />
              Start Camera
            </Button>
          </div>
        )}

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80">
            <div className="text-center space-y-3">
              <Loader2 className="h-12 w-12 text-blue-500 animate-spin mx-auto" />
              <p className="text-white">{loadingStage || 'Loading...'}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-900/80">
            <div className="text-center space-y-3 p-6">
              <AlertCircle className="h-12 w-12 text-white mx-auto" />
              <p className="text-white text-lg">{error}</p>
              <Button onClick={() => window.location.reload()} variant="outline">
                Refresh Page
              </Button>
            </div>
          </div>
        )}

        {isActive && (
          <div className="absolute top-4 right-4">
            <Button
              onClick={stopCamera}
              size="sm"
              variant="destructive"
              className="gap-2"
            >
              <CameraOff className="h-4 w-4" />
              Stop
            </Button>
          </div>
        )}
      </div>

      {targetPhoneme && (
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-t-2 border-blue-200">
          <div className="text-center">
            <p className="text-sm text-slate-600 mb-1">Target sound:</p>
            <p className="text-3xl font-bold text-blue-600">{targetPhoneme.letter}</p>
            <p className="text-lg text-slate-700 mt-1">{targetPhoneme.phonetic}</p>
          </div>
        </div>
      )}
    </Card>
  );
}