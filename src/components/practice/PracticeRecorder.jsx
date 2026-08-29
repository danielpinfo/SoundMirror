import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Video,
  Square,
  Loader2,
} from 'lucide-react';

import FaceMeshOverlay from './FaceMeshOverlay';
import { useLanguage } from '../i18n/LanguageContext';

const CYAN = '#00bcd4';
const COBALT = '#0a3d6b';

const BTN = {
  background: CYAN,
  color: COBALT,
  border: '1.5px solid #f5c518',
};

const READINESS_TIMEOUT_MS = 20000;

const PREFERRED_CAMERA_CONSTRAINTS = {
  video: {
    facingMode: 'user',
    width: { ideal: 1280 },
    height: { ideal: 720 },
    frameRate: { ideal: 30, max: 30 },
  },
  audio: {
    echoCancellation: false,
    noiseSuppression: false,
    autoGainControl: false,
    channelCount: 1,
  },
};

const FALLBACK_CAMERA_CONSTRAINTS = {
  video: {
    facingMode: 'user',
  },
  audio: {
    echoCancellation: false,
    noiseSuppression: false,
    autoGainControl: false,
    channelCount: 1,
  },
};

/**
 * PracticeRecorder
 *
 * Readiness-gated recording flow:
 *
 * 1. User presses Start Recording.
 * 2. Camera and microphone stream opens.
 * 3. Face Landmarker initializes.
 * 4. The first valid live mouth crop is drawn.
 * 5. Video, audio, timer, and facial timeline begin together.
 *
 * onRecordingComplete({
 *   blob,
 *   url,
 *   duration,
 *   durationMs,
 *   facialTimeline,
 *   audioBlob,
 *   cameraSettings
 * })
 */
export default function PracticeRecorder({
  targetWord,
  onRecordingComplete,
  isProcessing = false,
}) {
  const { t } = useLanguage();

  const [isPreparing, setIsPreparing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [stream, setStream] = useState(null);
  const [playbackUrl, setPlaybackUrl] = useState(null);
  const [cameraError, setCameraError] = useState(null);

  /*
   * Exact shared performance.now() zero point passed to the
   * Face Landmarker overlay.
   */
  const [
    recordingStartTimeMs,
    setRecordingStartTimeMs,
  ] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioRecorderRef = useRef(null);

  const chunksRef = useRef([]);
  const audioChunksRef = useRef([]);

  const audioStopPromiseRef = useRef(null);
  const timerRef = useRef(null);

  const facialTimelineRef = useRef([]);
  const recordingStartedAtRef = useRef(null);

  const activeStreamRef = useRef(null);
  const playbackUrlRef = useRef(null);

  const readinessResolveRef = useRef(null);
  const readinessRejectRef = useRef(null);
  const readinessTimeoutRef = useRef(null);

  const preparationCancelledRef = useRef(false);
  const componentMountedRef = useRef(true);

  const handleFeaturesFrame = useCallback(
    (time, features) => {
      facialTimelineRef.current.push({
        time,
        features,
      });
    },
    []
  );

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const clearReadinessWait = useCallback(() => {
    if (readinessTimeoutRef.current) {
      clearTimeout(readinessTimeoutRef.current);
      readinessTimeoutRef.current = null;
    }

    readinessResolveRef.current = null;
    readinessRejectRef.current = null;
  }, []);

  const stopStreamTracks = useCallback(
    (mediaStream) => {
      mediaStream?.getTracks?.().forEach((track) => {
        try {
          track.stop();
        } catch {
          // Cleanup must not break recording completion.
        }
      });
    },
    []
  );

  const revokePlaybackUrl = useCallback(() => {
    if (playbackUrlRef.current) {
      URL.revokeObjectURL(playbackUrlRef.current);
      playbackUrlRef.current = null;
    }
  }, []);

  const requestCameraStream = useCallback(async () => {
    try {
      return await navigator.mediaDevices.getUserMedia(
        PREFERRED_CAMERA_CONSTRAINTS
      );
    } catch (preferredError) {
      console.warn(
        '[PracticeRecorder] Preferred camera constraints failed; using fallback.',
        preferredError
      );

      return navigator.mediaDevices.getUserMedia(
        FALLBACK_CAMERA_CONSTRAINTS
      );
    }
  }, []);

  const waitForMouthAnalysisReady = useCallback(() => {
    return new Promise((resolve, reject) => {
      clearReadinessWait();

      readinessResolveRef.current = resolve;
      readinessRejectRef.current = reject;

      readinessTimeoutRef.current = window.setTimeout(() => {
        readinessTimeoutRef.current = null;
        readinessResolveRef.current = null;
        readinessRejectRef.current = null;

        reject(
          new Error(
            'Mouth analysis did not become ready. Center your face and try again.'
          )
        );
      }, READINESS_TIMEOUT_MS);
    });
  }, [clearReadinessWait]);

  const handleAnalysisReady = useCallback(
    (details) => {
      const resolve = readinessResolveRef.current;

      if (!resolve) return;

      clearReadinessWait();
      resolve(details);
    },
    [clearReadinessWait]
  );

  const beginMediaRecording = useCallback(
    async (nextStream) => {
      facialTimelineRef.current = [];
      chunksRef.current = [];
      audioChunksRef.current = [];

      setRecordingTime(0);

      const videoMimeType =
        MediaRecorder.isTypeSupported(
          'video/webm;codecs=vp9,opus'
        )
          ? 'video/webm;codecs=vp9,opus'
          : MediaRecorder.isTypeSupported(
              'video/webm;codecs=vp8,opus'
            )
            ? 'video/webm;codecs=vp8,opus'
            : 'video/webm';

      const mediaRecorder = new MediaRecorder(
        nextStream,
        {
          mimeType: videoMimeType,
        }
      );

      mediaRecorderRef.current = mediaRecorder;

      const audioTracks = nextStream.getAudioTracks();
      const audioStream = new MediaStream(audioTracks);

      const audioMimeType =
        MediaRecorder.isTypeSupported(
          'audio/webm;codecs=opus'
        )
          ? 'audio/webm;codecs=opus'
          : 'audio/webm';

      const audioRecorder = new MediaRecorder(
        audioStream,
        {
          mimeType: audioMimeType,
        }
      );

      audioRecorderRef.current = audioRecorder;

      audioStopPromiseRef.current = new Promise(
        (resolve) => {
          audioRecorder.onstop = resolve;
        }
      );

      mediaRecorder.ondataavailable = (event) => {
        if (event.data?.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      audioRecorder.ondataavailable = (event) => {
        if (event.data?.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error(
          '[PracticeRecorder] Video recorder error:',
          event?.error || event
        );
      };

      audioRecorder.onerror = (event) => {
        console.error(
          '[PracticeRecorder] Audio recorder error:',
          event?.error || event
        );
      };

      mediaRecorder.onstop = async () => {
        try {
          await audioStopPromiseRef.current;

          const stoppedAt = performance.now();

          const startedAt =
            recordingStartedAtRef.current ??
            stoppedAt;

          const durationMs = Math.max(
            0,
            stoppedAt - startedAt
          );

          const videoBlob = new Blob(
            chunksRef.current,
            {
              type: videoMimeType,
            }
          );

          const audioBlob = new Blob(
            audioChunksRef.current,
            {
              type: audioMimeType,
            }
          );

          const nextPlaybackUrl =
            URL.createObjectURL(videoBlob);

          playbackUrlRef.current =
            nextPlaybackUrl;

          if (componentMountedRef.current) {
            setPlaybackUrl(nextPlaybackUrl);
          }

          const videoTrack =
            nextStream.getVideoTracks?.()[0];

          const cameraSettings =
            videoTrack?.getSettings?.() || {};

          onRecordingComplete?.({
            blob: videoBlob,
            url: nextPlaybackUrl,
            duration: durationMs / 1000,
            durationMs,
            facialTimeline:
              facialTimelineRef.current.slice(),
            audioBlob,
            cameraSettings,
          });
        } finally {
          clearTimer();
          stopStreamTracks(nextStream);

          activeStreamRef.current = null;
          recordingStartedAtRef.current = null;

          mediaRecorderRef.current = null;
          audioRecorderRef.current = null;
          audioStopPromiseRef.current = null;

          if (componentMountedRef.current) {
            setRecordingStartTimeMs(null);
            setStream(null);
            setIsRecording(false);
            setIsPreparing(false);
          }
        }
      };

      /*
       * This is the single synchronized starting point.
       *
       * The same numeric performance.now() value is:
       * - stored in recordingStartedAtRef
       * - passed to the Face Landmarker overlay
       * - used by the recording timer
       */
      const startedAt = performance.now();

      recordingStartedAtRef.current = startedAt;
      setRecordingStartTimeMs(startedAt);

      mediaRecorder.start(250);
      audioRecorder.start(250);

      setIsPreparing(false);
      setIsRecording(true);

      timerRef.current = window.setInterval(() => {
        const currentStartedAt =
          recordingStartedAtRef.current;

        if (currentStartedAt == null) return;

        const elapsedSeconds = Math.floor(
          (
            performance.now() -
            currentStartedAt
          ) / 1000
        );

        setRecordingTime(elapsedSeconds);
      }, 250);
    },
    [
      clearTimer,
      onRecordingComplete,
      stopStreamTracks,
    ]
  );

  const startRecording = async () => {
    if (isProcessing || isPreparing || isRecording) return;

    setCameraError(null);

    clearTimer();
    clearReadinessWait();
    revokePlaybackUrl();

    facialTimelineRef.current = [];
    chunksRef.current = [];
    audioChunksRef.current = [];

    recordingStartedAtRef.current = null;

    setRecordingStartTimeMs(null);
    setRecordingTime(0);
    setPlaybackUrl(null);
    setIsPreparing(true);

    preparationCancelledRef.current = false;

    try {
      const nextStream =
        await requestCameraStream();

      if (preparationCancelledRef.current) {
        stopStreamTracks(nextStream);
        return;
      }

      activeStreamRef.current = nextStream;
      setStream(nextStream);

      /*
       * The overlay now initializes and waits for a valid face
       * and a successfully drawn live mouth crop.
       */
      await waitForMouthAnalysisReady();

      if (preparationCancelledRef.current) {
        stopStreamTracks(nextStream);

        activeStreamRef.current = null;

        if (componentMountedRef.current) {
          setStream(null);
          setIsPreparing(false);
        }

        return;
      }

      await beginMediaRecording(nextStream);
    } catch (error) {
      const wasCancelled =
        preparationCancelledRef.current ||
        error?.name === 'AbortError';

      if (!wasCancelled) {
        console.error(
          '[PracticeRecorder] Unable to prepare recording:',
          error
        );
      }

      clearReadinessWait();

      stopStreamTracks(
        activeStreamRef.current
      );

      activeStreamRef.current = null;
      recordingStartedAtRef.current = null;

      if (componentMountedRef.current) {
        setRecordingStartTimeMs(null);
        setStream(null);
        setIsRecording(false);
        setIsPreparing(false);

        if (!wasCancelled) {
          setCameraError(
            error?.message ||
              'Camera, microphone, or mouth analysis is unavailable.'
          );
        }
      }
    }
  };

  const cancelPreparation = () => {
    preparationCancelledRef.current = true;

    const reject =
      readinessRejectRef.current;

    clearReadinessWait();

    if (reject) {
      reject(
        new DOMException(
          'Recording preparation cancelled.',
          'AbortError'
        )
      );
    }

    stopStreamTracks(
      activeStreamRef.current
    );

    activeStreamRef.current = null;
    recordingStartedAtRef.current = null;

    setRecordingStartTimeMs(null);
    setStream(null);
    setIsPreparing(false);
    setIsRecording(false);
  };

  const stopRecording = () => {
    clearTimer();

    const audioRecorder =
      audioRecorderRef.current;

    const mediaRecorder =
      mediaRecorderRef.current;

    if (
      audioRecorder &&
      audioRecorder.state !== 'inactive'
    ) {
      audioRecorder.stop();
    }

    if (
      mediaRecorder &&
      mediaRecorder.state !== 'inactive'
    ) {
      mediaRecorder.stop();
    }

    setIsRecording(false);
  };

  useEffect(() => {
    componentMountedRef.current = true;

    return () => {
      componentMountedRef.current = false;
      preparationCancelledRef.current = true;

      const readinessReject =
        readinessRejectRef.current;

      clearReadinessWait();
      clearTimer();

      if (readinessReject) {
        readinessReject(
          new DOMException(
            'Recorder closed.',
            'AbortError'
          )
        );
      }

      const audioRecorder =
        audioRecorderRef.current;

      const mediaRecorder =
        mediaRecorderRef.current;

      try {
        if (
          audioRecorder &&
          audioRecorder.state !== 'inactive'
        ) {
          audioRecorder.stop();
        }
      } catch {
        // Component teardown only.
      }

      try {
        if (
          mediaRecorder &&
          mediaRecorder.state !== 'inactive'
        ) {
          mediaRecorder.stop();
        }
      } catch {
        // Component teardown only.
      }

      stopStreamTracks(
        activeStreamRef.current
      );

      activeStreamRef.current = null;
      recordingStartedAtRef.current = null;

      revokePlaybackUrl();
    };
  }, [
    clearReadinessWait,
    clearTimer,
    revokePlaybackUrl,
    stopStreamTracks,
  ]);

  const formatTime = (seconds) =>
    `${String(
      Math.floor(seconds / 60)
    ).padStart(2, '0')}:${String(
      seconds % 60
    ).padStart(2, '0')}`;

  const noTarget = !targetWord?.trim();

  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-3"
      style={{
        background: 'rgba(0,0,0,0.3)',
        border:
          '1px solid rgba(0,188,212,0.3)',
      }}
    >
      <p
        className="text-xs font-bold tracking-widest text-center"
        style={{ color: CYAN }}
      >
        {t('practice.videoPractice')}
      </p>

      {noTarget && (
        <div
          className="rounded-xl p-4 flex flex-col items-center gap-2 text-center"
          style={{
            background:
              'rgba(245,197,24,0.07)',
            border:
              '1px dashed rgba(245,197,24,0.4)',
          }}
        >
          <p
            className="text-xl font-bold"
            style={{ color: '#f5c518' }}
          >
            {t('practice.enterFirst')}
          </p>

          <p
            className="text-sm font-semibold"
            style={{
              color:
                'rgba(245,197,24,0.7)',
            }}
          >
            {t('practice.enterFirstDesc')}
          </p>
        </div>
      )}

      {cameraError && (
        <div
          className="rounded-xl px-4 py-3 text-sm"
          style={{
            background:
              'rgba(248,113,113,0.12)',
            border:
              '1px solid rgba(248,113,113,0.45)',
            color: '#fecaca',
          }}
        >
          {cameraError}
        </div>
      )}

      {stream || isPreparing || isRecording ? (
        <div className="relative">
          <FaceMeshOverlay
            stream={stream}
            isRecording={isRecording}
            recordingStartTimeMs={
              recordingStartTimeMs
            }
            onFeaturesFrame={
              handleFeaturesFrame
            }
            onReady={
              handleAnalysisReady
            }
          />

          {isPreparing && (
            <div
              className="absolute top-2 left-2 z-10 flex items-center gap-2 rounded-lg px-2 py-1"
              style={{
                background:
                  'rgba(0,0,0,0.78)',
                color: '#f5c518',
              }}
            >
              <Loader2 className="w-4 h-4 animate-spin" />

              <span className="text-xs font-semibold">
                Preparing mouth analysis…
              </span>
            </div>
          )}

          {isRecording && (
            <div className="absolute top-2 left-2 flex items-center gap-1.5 z-10">
              <span className="text-white text-xs font-mono">
                {formatTime(recordingTime)}
              </span>
            </div>
          )}
        </div>
      ) : playbackUrl ? (
        <video
          src={playbackUrl}
          controls
          playsInline
          className="w-full rounded-xl bg-black object-contain"
          style={{ aspectRatio: '16/9' }}
        />
      ) : (
        <div
          className="w-full rounded-xl bg-black flex items-center justify-center"
          style={{ aspectRatio: '16/9' }}
        >
          <Video
            className="w-10 h-10 opacity-30"
            style={{ color: CYAN }}
          />
        </div>
      )}

      <div className="flex gap-2">
        {isPreparing ? (
          <button
            type="button"
            onClick={cancelPreparation}
            className="flex-1 h-10 rounded-lg font-semibold flex items-center justify-center gap-2 bg-amber-500 text-slate-900 hover:bg-amber-400"
          >
            <Loader2 className="w-4 h-4 animate-spin" />

            Preparing… Cancel
          </button>
        ) : !isRecording ? (
          <button
            type="button"
            onClick={startRecording}
            disabled={noTarget || isProcessing}
            className="flex-1 h-10 rounded-lg font-semibold flex items-center justify-center gap-2 hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
            style={
              noTarget || isProcessing
                ? {
                    background: '#555',
                    color: '#999',
                    border:
                      '1.5px solid #555',
                  }
                : BTN
            }
          >
            <Video className="w-4 h-4" />

            {isProcessing
              ? 'Analyzing speech…'
              : playbackUrl
              ? t('practice.reRecord')
              : t(
                  'practice.startRecording'
                )}
          </button>
        ) : (
          <button
            type="button"
            onClick={stopRecording}
            className="flex-1 h-10 rounded-lg font-semibold flex items-center justify-center gap-2 bg-red-600 text-white hover:bg-red-700"
          >
            <Square className="w-4 h-4" />

            {t('practice.stop')}
          </button>
        )}
      </div>

      {targetWord && (
        <p
          className="text-center text-xs"
          style={{
            color:
              'rgba(0,188,212,0.7)',
          }}
        >
          {t('practice.practicing')}:{' '}

          <span
            style={{ color: '#f5c518' }}
          >
            {targetWord}
          </span>
        </p>
      )}
    </div>
  );
}
