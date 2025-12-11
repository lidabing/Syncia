import { SubtitleSegment, VideoMetadata, VideoProvider } from '../types';

export class YouTubeProvider implements VideoProvider {
  name = 'YouTube';

  matches(url: string): boolean {
    return url.includes('youtube.com/watch') || url.includes('youtu.be/');
  }

  private getVideoId(url: string): string | null {
    const urlObj = new URL(url);
    if (url.includes('youtube.com/watch')) {
      return urlObj.searchParams.get('v');
    } else if (url.includes('youtu.be/')) {
      return urlObj.pathname.slice(1);
    }
    return null;
  }

  async getMetadata(url: string): Promise<VideoMetadata> {
    const videoId = this.getVideoId(url);
    if (!videoId) throw new Error('Invalid YouTube URL');

    // We might need to fetch the page to get the title if we want it perfect,
    // but for now let's just return the ID.
    // To get the title, we'd need to fetch the page content.
    return {
      title: 'YouTube Video', // Placeholder, will be updated if we fetch page
      videoId,
      provider: 'youtube',
    };
  }

  async getSubtitles(url: string, language: string = 'en'): Promise<SubtitleSegment[]> {
    const videoId = this.getVideoId(url);
    if (!videoId) throw new Error('Invalid YouTube URL');

    const pageResponse = await fetch(`https://www.youtube.com/watch?v=${videoId}`);
    const pageText = await pageResponse.text();

    // Extract ytInitialPlayerResponse
    const playerResponseMatch = pageText.match(/ytInitialPlayerResponse\s*=\s*({.+?});/);
    if (!playerResponseMatch) {
      throw new Error('Could not find player response');
    }

    const playerResponse = JSON.parse(playerResponseMatch[1]);
    const captions = playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks;

    if (!captions || captions.length === 0) {
      throw new Error('No captions found for this video');
    }

    // Sort captions: prioritize requested language, then auto-generated
    // Captions have 'languageCode' (e.g. 'en', 'zh-CN')
    // and 'kind' (e.g. 'asr' for auto-generated)
    
    // Simple matching strategy
    let track = captions.find((c: any) => c.languageCode === language);
    if (!track) {
      // Try to find any track with the same language prefix (e.g. 'zh' for 'zh-CN')
      track = captions.find((c: any) => c.languageCode.startsWith(language.split('-')[0]));
    }
    if (!track) {
      // Fallback to first available
      track = captions[0];
    }

    const subtitleUrl = track.baseUrl;
    const subtitleResponse = await fetch(subtitleUrl);
    const subtitleXml = await subtitleResponse.text();

    return this.parseXml(subtitleXml);
  }

  private parseXml(xml: string): SubtitleSegment[] {
    const segments: SubtitleSegment[] = [];
    // Simple regex parser for YouTube XML format
    // <text start="0.5" dur="3.2">Hello world</text>
    const regex = /<text start="([\d.]+)" dur="([\d.]+)"[^>]*>(.*?)<\/text>/g;
    let match;

    while ((match = regex.exec(xml)) !== null) {
      segments.push({
        start: parseFloat(match[1]),
        duration: parseFloat(match[2]),
        text: this.decodeHtml(match[3]),
      });
    }

    return segments;
  }

  private decodeHtml(html: string): string {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  }
}
