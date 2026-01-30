import React, { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Video, Mic, Square, Play, RotateCcw, Camera, CameraOff } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const RecordingPanel = ({ 
  onRecordingComplete, 
  onGradingComplete,
  target = '',
}) => {
  const { t } = useLanguage();
  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioRecorderRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState(null);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [videoChunks, setVideoChunks] = useState([]);
  const [audioChunks, setAudioChunks] = useState([]);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [grading, setGrading] = useState(null);
  const [isGrading, setIsGrading] = useState(false);

  // Enable camera
  const enableCamera = useCallback(() => {
    setCameraEnabled(true);
    setCameraError(null);
  }, []);

  // Handle camera error
  const handleCameraError = useCallback((error) => {
    console.error('Camera error:', error);
    setCameraError('Unable to access camera. Please check permissions.');
    setCameraEnabled(false);
  }, []);

  // Start recording
  const startRecording = useCallback(async () => {
    if (!webcamRef.current?.video) {
      console.error('Webcam not ready');
      return;
    }

    setRecordedVideo(null);
    setRecordedAudio(null);
    setGrading(null);
    setVideoChunks([]);
    setAudioChunks([]);

    try {
      // Video recording from webcam
      const videoStream = webcamRef.current.video.srcObject;
      if (videoStream) {
        mediaRecorderRef.current = new MediaRecorder(videoStream, {
          mimeType: 'video/webm;codecs=vp9',
        });
        
        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            setVideoChunks((prev) => [...prev, event.data]);
          }
        };
        
        mediaRecorderRef.current.start(100);
      }

      // Audio recording (separate for better quality)
      const audioStream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        } 
      });
      
      audioRecorderRef.current = new MediaRecorder(audioStream, {
        mimeType: 'audio/webm;codecs=opus',
      });
      
      audioRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setAudioChunks((prev) => [...prev, event.data]);
        }
      };
      
      audioRecorderRef.current.start(100);
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  }, []);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (audioRecorderRef.current && audioRecorderRef.current.state !== 'inactive') {
      audioRecorderRef.current.stop();
      // Stop audio tracks
      audioRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    setIsRecording(false);
  }, []);

  // Process recordings when chunks are ready
  useEffect(() => {
    if (!isRecording && videoChunks.length > 0) {
      const videoBlob = new Blob(videoChunks, { type: 'video/webm' });
      const videoUrl = URL.createObjectURL(videoBlob);
      setRecordedVideo(videoUrl);
    }
  }, [isRecording, videoChunks]);

  useEffect(() => {
    if (!isRecording && audioChunks.length > 0) {
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      const audioUrl = URL.createObjectURL(audioBlob);
      setRecordedAudio(audioUrl);
      
      // Trigger grading
      performGrading();
    }
  }, [isRecording, audioChunks]);

  // Mock grading function (would call API in production)
  const performGrading = useCallback(async () => {
    setIsGrading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock grading results
    const mockGrading = {
      visualScore: Math.round(60 + Math.random() * 35),
      audioScore: Math.round(55 + Math.random() * 40),
      phonemeDetected: target.toLowerCase() + (Math.random() > 0.7 ? 'h' : ''),
      lipFeedback: Math.random() > 0.5 ? 'Good lip rounding observed' : 'Try to round your lips more',
      jawFeedback: Math.random() > 0.5 ? 'Jaw opening is appropriate' : 'Open your jaw slightly more',
      tongueFeedback: Math.random() > 0.5 ? 'Tongue position looks correct' : 'Try positioning tongue higher',
      timingFeedback: Math.random() > 0.5 ? 'Good timing with the target' : 'Try to extend the sound longer',
      suggestions: [
        `Practice the '${target}' sound in front of a mirror`,
        'Focus on the starting mouth position',
      ],
    };
    
    setGrading(mockGrading);
    setIsGrading(false);
    
    if (onGradingComplete) {
      onGradingComplete(mockGrading);
    }
    if (onRecordingComplete) {
      onRecordingComplete({
        videoUrl: recordedVideo,
        audioUrl: recordedAudio,
        grading: mockGrading,
      });
    }
  }, [target, recordedVideo, recordedAudio, onGradingComplete, onRecordingComplete]);

  // Reset recording
  const resetRecording = useCallback(() => {
    setRecordedVideo(null);
    setRecordedAudio(null);
    setGrading(null);
    setVideoChunks([]);
    setAudioChunks([]);
  }, []);

  return (
    <div data-testid="recording-panel" className="space-y-6">
      {/* Camera View / Recording */}
      <div className="relative">
        {!cameraEnabled ? (
          <div 
            className="aspect-video bg-slate-900 rounded-2xl flex flex-col items-center justify-center gap-4 border border-slate-700"
            data-testid="camera-placeholder"
          >
            <CameraOff className="w-12 h-12 text-slate-500" />
            <Button
              onClick={enableCamera}
              className="rounded-full px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white"
              data-testid="enable-camera-btn"
            >
              <Camera className="w-5 h-5 mr-2" />
              Enable Camera
            </Button>
            {cameraError && (
              <p className="text-red-400 text-sm">{cameraError}</p>
            )}
          </div>
        ) : (
          <div className="relative aspect-video bg-slate-900 rounded-2xl overflow-hidden border border-slate-700">
            <Webcam
              ref={webcamRef}
              audio={false}
              mirrored={true}
              className="w-full h-full object-cover"
              onUserMediaError={handleCameraError}
              data-testid="webcam-feed"
            />
            
            {/* Recording indicator */}
            {isRecording && (
              <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-red-500 rounded-full recording-pulse">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                <span className="text-white text-sm font-medium">Recording</span>
              </div>
            )}
            
            {/* Controls overlay */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4">
              {!isRecording && !recordedVideo && (
                <Button
                  onClick={startRecording}
                  className="rounded-full w-16 h-16 bg-red-500 hover:bg-red-600 text-white shadow-lg"
                  data-testid="start-recording-btn"
                >
                  <Video className="w-7 h-7" />
                </Button>
              )}
              
              {isRecording && (
                <Button
                  onClick={stopRecording}
                  className="rounded-full w-16 h-16 bg-slate-800 hover:bg-slate-700 text-white shadow-lg"
                  data-testid="stop-recording-btn"
                >
                  <Square className="w-6 h-6 fill-white" />
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Recorded Video Playback */}
      {recordedVideo && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-slate-700">{t('replay_attempt')}</h4>
            <Button
              variant="outline"
              size="sm"
              onClick={resetRecording}
              className="rounded-full"
              data-testid="reset-recording-btn"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              {t('retry')}
            </Button>
          </div>
          <video
            src={recordedVideo}
            controls
            className="w-full rounded-xl border border-slate-200"
            data-testid="recorded-video-playback"
          />
        </div>
      )}

      {/* Grading Results */}
      {isGrading && (
        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-sky-600 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-slate-600">Analyzing your attempt...</p>
        </div>
      )}

      {grading && !isGrading && (
        <div data-testid="grading-results" className="space-y-6">
          {/* Visual Grade */}
          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Video className="w-5 h-5 text-sky-600" />
              {t('visual_grade')}
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Score</span>
                <span className="text-2xl font-bold text-sky-600">{grading.visualScore}%</span>
              </div>
              <Progress value={grading.visualScore} className="h-3" data-testid="visual-score-progress" />
              <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-slate-500 mb-1">Lip Position</p>
                  <p className="text-slate-700">{grading.lipFeedback}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-slate-500 mb-1">Jaw Opening</p>
                  <p className="text-slate-700">{grading.jawFeedback}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-slate-500 mb-1">Tongue Position</p>
                  <p className="text-slate-700">{grading.tongueFeedback}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-slate-500 mb-1">Timing</p>
                  <p className="text-slate-700">{grading.timingFeedback}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Audio Grade */}
          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Mic className="w-5 h-5 text-sky-600" />
              {t('audio_grade')}
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Score</span>
                <span className="text-2xl font-bold text-sky-600">{grading.audioScore}%</span>
              </div>
              <Progress value={grading.audioScore} className="h-3" data-testid="audio-score-progress" />
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="p-4 bg-sky-50 rounded-xl border border-sky-100">
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">{t('target')}</p>
                  <p className="text-xl font-bold text-sky-700">{target}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">{t('detected')}</p>
                  <p className="text-xl font-bold text-slate-700">{grading.phonemeDetected}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Suggestions */}
          <div className="p-5 bg-gradient-to-br from-sky-50 to-white rounded-2xl border border-sky-100">
            <h4 className="font-semibold text-slate-800 mb-3">{t('suggestions')}</h4>
            <ul className="space-y-2">
              {grading.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-2 text-slate-600">
                  <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecordingPanel;
