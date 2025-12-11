export interface SubtitleSegment {
  start: number; // Start time in seconds
  duration: number; // Duration in seconds
  text: string; // The subtitle text
}

export interface VideoMetadata {
  title: string;
  videoId: string;
  provider: 'youtube' | 'bilibili' | 'unknown';
  language?: string;
}

export interface VideoProvider {
  name: string;
  matches(url: string): boolean;
  getMetadata(url: string): Promise<VideoMetadata>;
  getSubtitles(url: string, language?: string): Promise<SubtitleSegment[]>;
}
