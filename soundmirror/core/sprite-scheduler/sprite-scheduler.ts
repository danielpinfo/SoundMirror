/**
 * SoundMirror Sprite Scheduler
 * Synchronizes sprite frame rendering with TTS playback
 * Handles both front (lip/mouth) and side (tongue/jaw) views
 */

import { PhonemeTimeline, getFrameAtTime } from '../phoneme-engine/timeline-builder';

export interface SpriteManifest {
  [phoneme: string]: {
    path: string;
    frames: number;
    fps: number;
  };
}

export interface SpriteState {
  frontFrameIndex: number;
  sideFrameIndex: number;
  frontSpritePath: string;
  sideSpritePath: string;
  phoneme: string;
  progress: number;
  isPlaying: boolean;
}

export interface SpriteSchedulerConfig {
  frontManifest: SpriteManifest;
  sideManifest: SpriteManifest;
  basePath: string;
  fps: number;  // Target frames per second
}

export type SpriteUpdateCallback = (state: SpriteState) => void;

/**
 * SpriteScheduler - Core animation timing engine
 * Uses requestAnimationFrame for smooth rendering
 */
export class SpriteScheduler {
  private config: SpriteSchedulerConfig;
  private timeline: PhonemeTimeline | null = null;
  private startTime: number = 0;
  private isPlaying: boolean = false;
  private animationFrameId: number | null = null;
  private onUpdate: SpriteUpdateCallback | null = null;
  private onComplete: (() => void) | null = null;
  
  // High-precision timing (will be handled by Rust in production)
  private lastFrameTime: number = 0;
  private frameInterval: number;
  
  constructor(config: SpriteSchedulerConfig) {
    this.config = config;
    this.frameInterval = 1000 / config.fps;
  }
  
  /**
   * Load a timeline for playback
   */
  setTimeline(timeline: PhonemeTimeline): void {
    this.timeline = timeline;
    this.reset();
  }
  
  /**
   * Start playback
   */
  play(onUpdate: SpriteUpdateCallback, onComplete?: () => void): void {
    if (!this.timeline) {
      console.error('No timeline loaded');
      return;
    }
    
    this.onUpdate = onUpdate;
    this.onComplete = onComplete || null;
    this.isPlaying = true;
    this.startTime = performance.now();
    this.lastFrameTime = this.startTime;
    
    this.tick();
  }
  
  /**
   * Pause playback
   */
  pause(): void {
    this.isPlaying = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
  
  /**
   * Stop and reset
   */
  stop(): void {
    this.pause();
    this.reset();
  }
  
  /**
   * Reset to beginning
   */
  reset(): void {
    this.startTime = 0;
    this.lastFrameTime = 0;
    
    // Emit neutral state
    if (this.onUpdate) {
      this.onUpdate(this.getNeutralState());
    }
  }
  
  /**
   * Seek to specific time
   */
  seekTo(timeMs: number): void {
    if (!this.timeline) return;
    
    const currentTime = performance.now();
    this.startTime = currentTime - timeMs;
    
    if (this.onUpdate) {
      this.onUpdate(this.getStateAtTime(timeMs));
    }
  }
  
  /**
   * Main animation loop
   */
  private tick = (): void => {
    if (!this.isPlaying || !this.timeline) return;
    
    const currentTime = performance.now();
    const elapsed = currentTime - this.startTime;
    
    // Check if playback complete
    if (elapsed >= this.timeline.totalDuration) {
      this.isPlaying = false;
      if (this.onUpdate) {
        this.onUpdate(this.getNeutralState());
      }
      if (this.onComplete) {
        this.onComplete();
      }
      return;
    }
    
    // Frame rate limiting
    const timeSinceLastFrame = currentTime - this.lastFrameTime;
    if (timeSinceLastFrame >= this.frameInterval) {
      this.lastFrameTime = currentTime;
      
      if (this.onUpdate) {
        this.onUpdate(this.getStateAtTime(elapsed));
      }
    }
    
    this.animationFrameId = requestAnimationFrame(this.tick);
  };
  
  /**
   * Get sprite state at a specific time
   */
  private getStateAtTime(timeMs: number): SpriteState {
    if (!this.timeline) return this.getNeutralState();
    
    const { frameIndex, phoneme, progress } = getFrameAtTime(this.timeline, timeMs);
    
    return {
      frontFrameIndex: frameIndex,
      sideFrameIndex: frameIndex,  // Side is slave to front
      frontSpritePath: this.buildSpritePath('front', phoneme, frameIndex),
      sideSpritePath: this.buildSpritePath('side', phoneme, frameIndex),
      phoneme,
      progress,
      isPlaying: this.isPlaying,
    };
  }
  
  /**
   * Get neutral/closed mouth state
   */
  private getNeutralState(): SpriteState {
    return {
      frontFrameIndex: 0,
      sideFrameIndex: 0,
      frontSpritePath: this.buildSpritePath('front', '_', 0),
      sideSpritePath: this.buildSpritePath('side', '_', 0),
      phoneme: '_',
      progress: 0,
      isPlaying: false,
    };
  }
  
  /**
   * Build sprite file path
   * Format: {basePath}/sprites/{view}/{language}/{phoneme}_{frameNumber}.png
   */
  private buildSpritePath(view: 'front' | 'side', phoneme: string, frameIndex: number): string {
    const paddedFrame = String(frameIndex).padStart(4, '0');
    const safePhoneme = this.sanitizePhoneme(phoneme);
    return `${this.config.basePath}/sprites/${view}/en/${safePhoneme}_${paddedFrame}.png`;
  }
  
  /**
   * Sanitize phoneme for filesystem
   * IPA characters need mapping to safe filenames
   */
  private sanitizePhoneme(phoneme: string): string {
    const mapping: Record<string, string> = {
      'ɛ': 'eh',
      'ʃ': 'sh',
      'θ': 'th',
      'ŋ': 'ng',
      'tʃ': 'ch',
      'ʔ': 'glottal',
      'ɬ': 'welsh_ll',
      'ǃ': 'click',
      '_': 'neutral',
    };
    return mapping[phoneme] || phoneme;
  }
  
  /**
   * Get current playback time
   */
  getCurrentTime(): number {
    if (!this.isPlaying) return 0;
    return performance.now() - this.startTime;
  }
  
  /**
   * Get total duration
   */
  getTotalDuration(): number {
    return this.timeline?.totalDuration || 0;
  }
  
  /**
   * Check if playing
   */
  getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

/**
 * Create a sprite scheduler with default configuration
 */
export function createSpriteScheduler(basePath: string = '/assets'): SpriteScheduler {
  return new SpriteScheduler({
    frontManifest: {},
    sideManifest: {},
    basePath,
    fps: 30,
  });
}
