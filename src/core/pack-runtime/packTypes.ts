// Core pack runtime type contracts
export type PlaybackContract = {
  ttsText: string;
  timeline: Array<{ startMs: number; endMs: number; frame: number; phoneme?: string }>;
  helperChunks?: Array<{ startMs: number; endMs: number; text: string }>;
  providerOptions?: Record<string, any>;
};

export interface LanguagePackModule {
  manifest: Record<string, any>;
  getPlaybackRate: () => number | null | undefined;
  getDefaultVoice?: () => string | null | undefined;
  getLocale?: () => string | null | undefined;
  buildAnimationTimeline: (resolveResult: any) => PlaybackContract["timeline"];
  buildHelperData?: (resolveResult: any) => { helperText?: string } | undefined;
  resolveUnits: (text: string) => any;
  synthesize: (text: string) => Promise<{ source: string; audio: string | null }>;
  preparePlayback?: (text: string) => Promise<PlaybackContract> | PlaybackContract;
}

export type PackId = string;