import { BilibiliProvider } from './providers/bilibili';
import { YouTubeProvider } from './providers/youtube';
import { VideoProvider } from './types';

const providers: VideoProvider[] = [
  new YouTubeProvider(),
  new BilibiliProvider(),
];

export function getVideoProvider(url: string): VideoProvider | null {
  return providers.find(p => p.matches(url)) || null;
}

export * from './types';
