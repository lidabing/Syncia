import { SubtitleSegment, VideoMetadata, VideoProvider } from '../types';

export class BilibiliProvider implements VideoProvider {
  name = 'Bilibili';

  matches(url: string): boolean {
    return url.includes('bilibili.com/video/');
  }

  private getBvId(url: string): string | null {
    const match = url.match(/\/video\/(BV\w+)/);
    return match ? match[1] : null;
  }

  async getMetadata(url: string): Promise<VideoMetadata> {
    const bvId = this.getBvId(url);
    if (!bvId) throw new Error('Invalid Bilibili URL');

    return {
      title: 'Bilibili Video',
      videoId: bvId,
      provider: 'bilibili',
    };
  }

  async getSubtitles(url: string, language: string = 'zh'): Promise<SubtitleSegment[]> {
    const bvId = this.getBvId(url);
    if (!bvId) throw new Error('Invalid Bilibili URL');

    // Fetch page to get CID and AID
    const pageResponse = await fetch(url);
    const pageText = await pageResponse.text();

    // Extract AID and CID
    // Try to find in __INITIAL_STATE__ or simple regex
    // Matches "aid":123 or aid:123
    const aidMatch = pageText.match(/["']?aid["']?:\s*(\d+)/);
    const cidMatch = pageText.match(/["']?cid["']?:\s*(\d+)/);

    if (!aidMatch || !cidMatch) {
      throw new Error('Could not find video ID (aid/cid)');
    }

    const aid = aidMatch[1];
    const cid = cidMatch[1];

    // Fetch player info to get subtitle list
    const playerUrl = `https://api.bilibili.com/x/player/v2?cid=${cid}&aid=${aid}`;
    const playerResponse = await fetch(playerUrl);
    const playerData = await playerResponse.json();

    const subtitles = playerData?.data?.subtitle?.subtitles;

    if (!subtitles || subtitles.length === 0) {
      // Fallback: Try to fetch CC from another API or check if it's empty
      throw new Error('No subtitles found for this video');
    }

    // Find appropriate language
    // Bilibili uses 'lan' (e.g. 'zh-CN')
    let track = subtitles.find((s: any) => s.lan === language);
    if (!track) {
      track = subtitles[0];
    }

    // Fetch the actual subtitle content
    // The URL usually starts with //, need to add https:
    let subtitleUrl = track.subtitle_url;
    if (subtitleUrl.startsWith('//')) {
      subtitleUrl = 'https:' + subtitleUrl;
    }

    const subResponse = await fetch(subtitleUrl);
    const subData = await subResponse.json();

    return this.parseBilibiliJson(subData);
  }

  private parseBilibiliJson(data: any): SubtitleSegment[] {
    // Bilibili JSON format:
    // { body: [ { from: 0.5, to: 1.5, content: "text" }, ... ] }
    if (!data.body) return [];

    return data.body.map((item: any) => ({
      start: item.from,
      duration: item.to - item.from,
      text: item.content,
    }));
  }
}
