import { SubtitleSegment } from '../../lib/video/types';

export async function getYouTubeSubtitles(): Promise<SubtitleSegment[]> {
  // 1. Try to find ytInitialPlayerResponse in the page
  // This is usually in a script tag
  let playerResponse = null;
  
  // Method A: Check window object (needs injection, skip for now)
  
  // Method B: Parse script tags
  const scripts = document.querySelectorAll('script');
  for (const script of scripts) {
    if (script.textContent && script.textContent.includes('ytInitialPlayerResponse')) {
      const match = script.textContent.match(/ytInitialPlayerResponse\s*=\s*({.+?});/);
      if (match) {
        try {
          playerResponse = JSON.parse(match[1]);
          break;
        } catch (e) {
          console.error('Failed to parse ytInitialPlayerResponse', e);
        }
      }
    }
  }

  if (!playerResponse) {
    throw new Error('Could not find player response on page');
  }

  const captions = playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
  if (!captions || captions.length === 0) {
    throw new Error('No captions found for this video');
  }

  // Prefer English or Chinese, or just the first one
  // Logic: User's browser language? Or just default to first one?
  // Let's try to find 'en' or 'zh'
  let track = captions.find((c: any) => c.languageCode.startsWith('en'));
  if (!track) track = captions.find((c: any) => c.languageCode.startsWith('zh'));
  if (!track) track = captions[0];

  const subtitleUrl = track.baseUrl;
  // Fetch with credentials (cookies) since we are in content script context
  const response = await fetch(subtitleUrl);
  const xml = await response.text();

  return parseXml(xml);
}

function parseXml(xml: string): SubtitleSegment[] {
  const segments: SubtitleSegment[] = [];
  const regex = /<text start="([\d.]+)" dur="([\d.]+)"[^>]*>(.*?)<\/text>/g;
  let match;
  while ((match = regex.exec(xml)) !== null) {
    segments.push({
      start: parseFloat(match[1]),
      duration: parseFloat(match[2]),
      text: decodeHtml(match[3]),
    });
  }
  return segments;
}

function decodeHtml(html: string): string {
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
}

export async function getBilibiliSubtitles(): Promise<SubtitleSegment[]> {
  let aid, cid;
  let subtitleList: any[] = [];

  // Strategy 1: Try to get BVID from URL and call API (Most reliable)
  const bvidMatch = window.location.href.match(/\/video\/(BV\w+)/);
  if (bvidMatch) {
    const bvid = bvidMatch[1];
    try {
      const apiUrl = `https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`;
      const response = await fetch(apiUrl);
      const data = await response.json();
      if (data.code === 0 && data.data) {
        aid = data.data.aid;
        cid = data.data.cid;
        
        // Try to get subtitles from view API directly
        if (data.data.subtitle && data.data.subtitle.list) {
          subtitleList = data.data.subtitle.list;
        }

        // Handle multi-page videos (p=2, etc.)
        const pageMatch = window.location.href.match(/[?&]p=(\d+)/);
        if (pageMatch && data.data.pages) {
          const pageIndex = parseInt(pageMatch[1]) - 1;
          if (data.data.pages[pageIndex]) {
            cid = data.data.pages[pageIndex].cid;
            // For multi-page, the view API subtitles might be for P1 only.
            // Clear it to force fetching from player API with correct CID
            if (pageIndex > 0) {
              subtitleList = [];
            }
          }
        }
      }
    } catch (e) {
      console.error('Failed to fetch video info from API', e);
    }
  }

  // Strategy 2: Parse __INITIAL_STATE__ from script tags
  if (!aid || !cid) {
    const scripts = document.querySelectorAll('script');
    for (const script of scripts) {
      if (script.textContent && script.textContent.includes('__INITIAL_STATE__')) {
        try {
          // Use a more robust regex that handles newlines
          const match = script.textContent.match(/__INITIAL_STATE__\s*=\s*({[\s\S]+?});/);
          if (match) {
            const state = JSON.parse(match[1]);
            aid = state.aid || state.videoData?.aid;
            cid = state.cid || state.videoData?.cid;
            // Also check epInfo for Bangumi
            if (!aid && state.epInfo) {
              aid = state.epInfo.aid;
              cid = state.epInfo.cid;
            }
            if (aid && cid) break;
          }
        } catch (e) {
          console.error('Failed to parse __INITIAL_STATE__', e);
        }
      }
    }
  }

  // Strategy 3: Regex search in full HTML
  if (!aid || !cid) {
     const html = document.documentElement.innerHTML;
     const aidMatch = html.match(/["']aid["']\s*:\s*(\d+)/);
     const cidMatch = html.match(/["']cid["']\s*:\s*(\d+)/);
     if (aidMatch) aid = aidMatch[1];
     if (cidMatch) cid = cidMatch[1];
  }

  if (!aid || !cid) {
    throw new Error('Could not find video ID (aid/cid)');
  }

  // 2. Fetch player info if we don't have subtitles yet
  if (subtitleList.length === 0) {
    try {
      const playerUrl = `https://api.bilibili.com/x/player/v2?cid=${cid}&aid=${aid}`;
      const playerResponse = await fetch(playerUrl); // Cookies included automatically
      const playerData = await playerResponse.json();
      if (playerData?.data?.subtitle?.subtitles) {
        subtitleList = playerData.data.subtitle.subtitles;
      }
    } catch (e) {
      console.error('Failed to fetch player info', e);
    }
  }

  if (!subtitleList || subtitleList.length === 0) {
    throw new Error('No subtitles found. This video may not have CC subtitles.');
  }

  // Prefer zh
  let track = subtitleList.find((s: any) => s.lan === 'zh-CN');
  if (!track) track = subtitleList[0];

  let subtitleUrl = track.subtitle_url;
  if (subtitleUrl.startsWith('//')) {
    subtitleUrl = 'https:' + subtitleUrl;
  }

  const subResponse = await fetch(subtitleUrl);
  const subData = await subResponse.json();

  return subData.body.map((item: any) => ({
    start: item.from,
    duration: item.to - item.from,
    text: item.content,
  }));
}
