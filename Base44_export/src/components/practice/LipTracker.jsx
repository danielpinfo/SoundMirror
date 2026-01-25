import React, { useRef, useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Camera, CameraOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// MediaPipe Face Mesh landmarks for lips
const UPPER_LIP_INDICES = [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291];
const LOWER_LIP_INDICES = [146, 91, 181, 84, 17, 314, 405, 321, 375, 291];
const MOUTH_OUTER = [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 409, 270, 269, 267, 0, 37, 39, 40, 185];

export default function LipTracker({ targetPhoneme, onMetricsUpdate, onLandmarksUpdate }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [faceMesh, setFaceMesh] = useState(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    loadMediaPipe();
    return () => {
      stopCamera();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isActive && faceMesh) {
      detectFace();
    }
  }, [isActive, faceMesh]);

  const loadMediaPipe = async () => {
    try {
      // Load MediaPipe scripts from CDN
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

      // Load camera utils and face mesh
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

      mesh.onResults(onFaceMeshResults);
      setFaceMesh(mesh);
    } catch (err) {
      console.error('Error loading MediaPipe:', err);
      setError('Failed to load face tracking. Please refresh the page.');
    }
  };

  const startCamera = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setIsActive(true);
          setIsLoading(false);
        };
      }
    } catch (err) {
      console.error('Camera error:', err);
      setError('Could not access camera. Please check permissions.');
      setIsLoading(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
  };

  const detectFace = async () => {
    if (!faceMesh || !videoRef.current || !isActive) return;

    try {
      if (videoRef.current.readyState === 4) {
        await faceMesh.send({ image: videoRef.current });
      }
    } catch (error) {
      console.error('Face detection error:', error);
    }

    if (isActive) {
      animationFrameRef.current = requestAnimationFrame(detectFace);
    }
  };

  const onFaceMeshResults = (results) => {
    if (!canvasRef.current || !results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const landmarks = results.multiFaceLandmarks[0];

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw video frame
    ctx.save();
    ctx.scale(-1, 1);
    ctx.translate(-canvas.width, 0);
    ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    // Calculate mouth metrics
    const metrics = calculateMouthMetrics(landmarks);
    
    // Draw mouth overlay
    drawMouthOverlay(ctx, landmarks, metrics);

    // Send metrics to parent
    if (onMetricsUpdate) {
      onMetricsUpdate(metrics);
    }
    
    // Send landmarks to parent for tongue tracking
    if (onLandmarksUpdate) {
      onLandmarksUpdate(landmarks);
    }
  };

  const calculateMouthMetrics = (landmarks) => {
    const width = canvasRef.current.width;
    const height = canvasRef.current.height;

    // Get key mouth points
    const upperLip = landmarks[13]; // Top of upper lip
    const lowerLip = landmarks[14]; // Bottom of lower lip
    const leftCorner = landmarks[61];
    const rightCorner = landmarks[291];

    // Calculate mouth openness (vertical distance)
    const openness = Math.abs(upperLip.y - lowerLip.y) * height;

    // Calculate mouth width (horizontal distance)
    const mouthWidth = Math.abs(leftCorner.x - rightCorner.x) * width;

    // Calculate lip rounding (aspect ratio)
    const aspectRatio = openness / mouthWidth;

    // Lip protrusion (estimate based on z-depth)
    const protrusion = (upperLip.z + lowerLip.z) / 2;

    return {
      openness: Math.round(openness),
      width: Math.round(mouthWidth),
      aspectRatio: aspectRatio.toFixed(2),
      protrusion: protrusion.toFixed(3),
      isRounded: aspectRatio > 0.3,
      isWide: mouthWidth > 80,
      isOpen: openness > 15
    };
  };

  const drawMouthOverlay = (ctx, landmarks, metrics) => {
    const width = canvasRef.current.width;
    const height = canvasRef.current.height;

    // Draw mouth outline
    ctx.strokeStyle = metrics.isOpen ? '#22c55e' : '#3b82f6';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    MOUTH_OUTER.forEach((index, i) => {
      const point = landmarks[index];
      const x = (1 - point.x) * width; // Mirror for selfie view
      const y = point.y * height;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.closePath();
    ctx.stroke();

    // Draw key points
    [13, 14, 61, 291].forEach(index => {
      const point = landmarks[index];
      const x = (1 - point.x) * width;
      const y = point.y * height;
      
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();
    });
  };

  return (
    <Card className="overflow-hidden border-2 border-blue-200">
      <div className="relative">
        <video
          ref={videoRef}
          className="hidden"
          playsInline
        />
        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          className="w-full h-auto bg-slate-900"
          style={{ transform: 'scaleX(1)' }}
        />
        
        {!isActive && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80">
            <Button
              onClick={startCamera}
              size="lg"
              className="gap-2 bg-blue-600 hover:bg-blue-700"
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
              <p className="text-white">Loading face tracking...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-900/80">
            <div className="text-center space-y-3 p-6">
              <p className="text-white text-lg">{error}</p>
              <Button onClick={startCamera} variant="outline">
                Try Again
              </Button>
            </div>
          </div>
        )}

        {isActive && (
          <div className="absolute top-4 right-4 flex gap-2">
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