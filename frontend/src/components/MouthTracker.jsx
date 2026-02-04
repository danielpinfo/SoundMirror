import React, { useRef, useEffect, useState, useCallback } from 'react';
import { FaceMesh } from '@mediapipe/face_mesh';
import { Camera } from '@mediapipe/camera_utils';

// Lip landmark indices for MediaPipe Face Mesh
const LIP_LANDMARKS = {
  upperLipTop: [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291],
  upperLipBottom: [78, 191, 80, 81, 82, 13, 312, 311, 310, 415, 308],
  lowerLipTop: [78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308],
  lowerLipBottom: [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291],
  leftCorner: 61,
  rightCorner: 291,
};

// Jaw landmarks
const JAW_LANDMARKS = {
  chin: 152,
  jawLine: [234, 93, 132, 58, 172, 136, 150, 149, 176, 148, 152, 377, 400, 378, 379, 365, 397, 288, 361, 323, 454],
};

export const MouthTracker = ({ 
  onMouthData, 
  showOverlay = true,
  targetPhoneme = '',
}) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isTracking, setIsTracking] = useState(false);
  const [mouthMetrics, setMouthMetrics] = useState(null);
  const [feedback, setFeedback] = useState('');
  const faceMeshRef = useRef(null);
  const cameraRef = useRef(null);

  // Calculate mouth metrics from landmarks
  const calculateMouthMetrics = useCallback((landmarks) => {
    if (!landmarks || landmarks.length === 0) return null;

    // Get key points
    const upperLipTop = landmarks[13]; // Center upper lip top
    const lowerLipBottom = landmarks[14]; // Center lower lip bottom
    const leftCorner = landmarks[LIP_LANDMARKS.leftCorner];
    const rightCorner = landmarks[LIP_LANDMARKS.rightCorner];
    const chin = landmarks[JAW_LANDMARKS.chin];
    const nose = landmarks[1]; // Nose tip

    // Calculate mouth opening (vertical distance between lips)
    const mouthOpeningVertical = Math.abs(lowerLipBottom.y - upperLipTop.y);
    
    // Calculate mouth width
    const mouthWidth = Math.abs(rightCorner.x - leftCorner.x);
    
    // Calculate lip protrusion (how forward the lips are)
    const lipProtrusion = (upperLipTop.z + lowerLipBottom.z) / 2;
    
    // Calculate jaw drop (distance from nose to chin relative to face height)
    const jawDrop = Math.abs(chin.y - nose.y);
    
    // Normalize values (0-100 scale)
    const openingPercent = Math.min(100, mouthOpeningVertical * 500);
    const widthPercent = Math.min(100, mouthWidth * 300);
    const protrusionPercent = Math.min(100, Math.max(0, (0.1 - lipProtrusion) * 500));
    const jawPercent = Math.min(100, jawDrop * 300);

    // Determine mouth shape
    let shape = 'neutral';
    if (openingPercent > 40 && widthPercent < 60) shape = 'open-round'; // O, OO sounds
    else if (openingPercent > 30 && widthPercent > 70) shape = 'open-wide'; // A, AH sounds
    else if (openingPercent < 20 && widthPercent > 60) shape = 'spread'; // EE, I sounds
    else if (protrusionPercent > 50) shape = 'rounded'; // W, OO sounds
    else if (openingPercent < 15 && widthPercent < 50) shape = 'closed'; // M, B, P sounds

    return {
      opening: Math.round(openingPercent),
      width: Math.round(widthPercent),
      protrusion: Math.round(protrusionPercent),
      jawDrop: Math.round(jawPercent),
      shape,
      landmarks: {
        upperLip: upperLipTop,
        lowerLip: lowerLipBottom,
        leftCorner,
        rightCorner,
        chin,
      },
    };
  }, []);

  // Generate feedback based on target phoneme and current mouth position
  const generateFeedback = useCallback((metrics, target) => {
    if (!metrics || !target) return '';

    const phonemeTargets = {
      'a': { opening: 50, width: 70, shape: 'open-wide', tip: 'Open wide, relax jaw' },
      'e': { opening: 30, width: 75, shape: 'spread', tip: 'Spread lips slightly' },
      'i': { opening: 20, width: 80, shape: 'spread', tip: 'Spread lips, tongue high' },
      'o': { opening: 45, width: 50, shape: 'open-round', tip: 'Round lips, jaw dropped' },
      'u': { opening: 25, width: 40, shape: 'rounded', tip: 'Round lips forward' },
      'b': { opening: 5, width: 50, shape: 'closed', tip: 'Close lips firmly' },
      'p': { opening: 5, width: 50, shape: 'closed', tip: 'Close lips, build pressure' },
      'm': { opening: 5, width: 55, shape: 'closed', tip: 'Close lips gently' },
      'f': { opening: 15, width: 60, shape: 'neutral', tip: 'Lower lip under teeth' },
      'v': { opening: 15, width: 60, shape: 'neutral', tip: 'Lower lip under teeth, add voice' },
      'th': { opening: 20, width: 65, shape: 'neutral', tip: 'Tongue between teeth' },
      's': { opening: 10, width: 55, shape: 'spread', tip: 'Teeth close, tongue near roof' },
      'sh': { opening: 15, width: 45, shape: 'rounded', tip: 'Round lips slightly' },
      'r': { opening: 25, width: 55, shape: 'neutral', tip: 'Curl tongue back' },
      'l': { opening: 25, width: 60, shape: 'neutral', tip: 'Tongue tip to roof' },
      'w': { opening: 20, width: 40, shape: 'rounded', tip: 'Round lips forward' },
      'y': { opening: 15, width: 75, shape: 'spread', tip: 'Spread lips, tongue high' },
    };

    const targetKey = target.toLowerCase().charAt(0);
    const targetData = phonemeTargets[targetKey];
    
    if (!targetData) return 'Practice this sound carefully';

    const feedback = [];
    
    // Check opening
    if (Math.abs(metrics.opening - targetData.opening) > 20) {
      if (metrics.opening < targetData.opening) {
        feedback.push('Open your mouth more');
      } else {
        feedback.push('Close your mouth slightly');
      }
    }
    
    // Check width
    if (Math.abs(metrics.width - targetData.width) > 20) {
      if (metrics.width < targetData.width) {
        feedback.push('Spread your lips wider');
      } else {
        feedback.push('Bring lips closer together');
      }
    }

    // Check shape match
    if (metrics.shape !== targetData.shape) {
      feedback.push(targetData.tip);
    }

    if (feedback.length === 0) {
      return '✓ Good mouth position!';
    }

    return feedback.join(' • ');
  }, []);

  // Process face mesh results
  const onResults = useCallback((results) => {
    if (!canvasRef.current || !videoRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Clear and draw video frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
      const landmarks = results.multiFaceLandmarks[0];
      
      // Calculate metrics
      const metrics = calculateMouthMetrics(landmarks);
      setMouthMetrics(metrics);
      
      // Generate feedback
      if (targetPhoneme) {
        const feedbackText = generateFeedback(metrics, targetPhoneme);
        setFeedback(feedbackText);
      }

      // Send data to parent
      if (onMouthData && metrics) {
        onMouthData(metrics);
      }

      // Draw overlay if enabled
      if (showOverlay) {
        // Draw lip outline
        ctx.strokeStyle = '#00ff88';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        // Upper lip
        LIP_LANDMARKS.upperLipTop.forEach((idx, i) => {
          const point = landmarks[idx];
          const x = point.x * canvas.width;
          const y = point.y * canvas.height;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();

        // Lower lip
        ctx.beginPath();
        LIP_LANDMARKS.lowerLipBottom.forEach((idx, i) => {
          const point = landmarks[idx];
          const x = point.x * canvas.width;
          const y = point.y * canvas.height;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();

        // Draw key points
        ctx.fillStyle = '#ff4488';
        [13, 14, 61, 291].forEach(idx => {
          const point = landmarks[idx];
          ctx.beginPath();
          ctx.arc(point.x * canvas.width, point.y * canvas.height, 3, 0, 2 * Math.PI);
          ctx.fill();
        });
      }
    }
  }, [calculateMouthMetrics, generateFeedback, onMouthData, showOverlay, targetPhoneme]);

  // Initialize face mesh
  useEffect(() => {
    if (!videoRef.current) return;

    faceMeshRef.current = new FaceMesh({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
      },
    });

    faceMeshRef.current.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    faceMeshRef.current.onResults(onResults);

    return () => {
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
    };
  }, [onResults]);

  // Start tracking
  const startTracking = useCallback(async () => {
    if (!videoRef.current || !faceMeshRef.current) return;

    try {
      cameraRef.current = new Camera(videoRef.current, {
        onFrame: async () => {
          if (faceMeshRef.current && videoRef.current) {
            await faceMeshRef.current.send({ image: videoRef.current });
          }
        },
        width: 640,
        height: 480,
      });

      await cameraRef.current.start();
      setIsTracking(true);
    } catch (error) {
      console.error('Error starting camera:', error);
    }
  }, []);

  // Stop tracking
  const stopTracking = useCallback(() => {
    if (cameraRef.current) {
      cameraRef.current.stop();
    }
    setIsTracking(false);
    setMouthMetrics(null);
    setFeedback('');
  }, []);

  // Auto-start tracking when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isTracking) {
        startTracking();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [isTracking, startTracking]);

  // Get score color
  const getScoreColor = (score, target) => {
    const diff = Math.abs(score - target);
    if (diff < 15) return 'text-green-400';
    if (diff < 30) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-4">
      {/* Video/Canvas Container */}
      <div className="relative aspect-video bg-[#0a1628] rounded-2xl overflow-hidden border border-blue-500/20">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ display: isTracking ? 'none' : 'block' }}
          playsInline
          muted
        />
        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ display: isTracking ? 'block' : 'none' }}
        />

        {/* Tracking indicator */}
        {isTracking && (
          <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 bg-green-500 rounded-full">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span className="text-white text-xs font-medium">Tracking</span>
          </div>
        )}

        {/* Target phoneme */}
        {targetPhoneme && isTracking && (
          <div className="absolute top-3 right-3 px-4 py-2 bg-blue-600/80 backdrop-blur rounded-full">
            <span className="text-white font-medium">Target: {targetPhoneme}</span>
          </div>
        )}

        {/* Start/Stop button */}
        {!isTracking && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={startTracking}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-medium transition-colors"
              data-testid="start-tracking-btn"
            >
              Start Mouth Tracking
            </button>
          </div>
        )}
      </div>

      {/* Metrics Display */}
      {isTracking && mouthMetrics && (
        <div className="p-4 bg-[#0f2847] rounded-xl border border-blue-500/20 space-y-4">
          {/* Feedback */}
          {feedback && (
            <div className={`p-3 rounded-lg ${
              feedback.includes('✓') ? 'bg-green-500/20 border border-green-500/30' : 'bg-orange-500/20 border border-orange-500/30'
            }`}>
              <p className={feedback.includes('✓') ? 'text-green-300' : 'text-orange-300'}>
                {feedback}
              </p>
            </div>
          )}

          {/* Metrics Grid */}
          <div className="grid grid-cols-4 gap-3">
            <div className="text-center p-3 bg-blue-900/30 rounded-lg">
              <p className="text-2xl font-bold text-white">{mouthMetrics.opening}%</p>
              <p className="text-xs text-blue-300">Opening</p>
            </div>
            <div className="text-center p-3 bg-blue-900/30 rounded-lg">
              <p className="text-2xl font-bold text-white">{mouthMetrics.width}%</p>
              <p className="text-xs text-blue-300">Width</p>
            </div>
            <div className="text-center p-3 bg-blue-900/30 rounded-lg">
              <p className="text-2xl font-bold text-white">{mouthMetrics.protrusion}%</p>
              <p className="text-xs text-blue-300">Protrusion</p>
            </div>
            <div className="text-center p-3 bg-blue-900/30 rounded-lg">
              <p className="text-2xl font-bold text-white">{mouthMetrics.jawDrop}%</p>
              <p className="text-xs text-blue-300">Jaw</p>
            </div>
          </div>

          {/* Shape indicator */}
          <div className="flex items-center justify-between">
            <span className="text-blue-300">Detected Shape:</span>
            <span className="px-3 py-1 bg-blue-600/30 text-blue-200 rounded-full font-medium">
              {mouthMetrics.shape}
            </span>
          </div>

          {/* Stop button */}
          <button
            onClick={stopTracking}
            className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            data-testid="stop-tracking-btn"
          >
            Stop Tracking
          </button>
        </div>
      )}
    </div>
  );
};

export default MouthTracker;
