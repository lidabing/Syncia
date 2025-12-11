import { useState, useEffect } from 'react';
import { MdClosedCaption, MdSummarize } from 'react-icons/md';
import { getVideoProvider, VideoMetadata } from '../../../lib/video';
import { useLanguage } from '../../../hooks/useLanguage';

interface VideoContextBarProps {
  onSubtitlesFetched: (text: string) => void;
  onSummarize: (text: string) => void;
}

export default function VideoContextBar({ onSubtitlesFetched, onSummarize }: VideoContextBarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const checkUrl = async () => {
      chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        const url = tabs[0]?.url;
        const provider = url ? getVideoProvider(url) : null;
        
        if (url && provider) {
          setIsVisible(true);
          setCurrentUrl(url);
          try {
            const meta = await provider.getMetadata(url);
            setMetadata(meta);
          } catch (e) {
            console.error('Failed to get video metadata', e);
          }
        } else {
          setIsVisible(false);
          setMetadata(null);
        }
      });
    };

    checkUrl();

    const handleUpdate = (tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) => {
      if (tab.active && (changeInfo.url || changeInfo.status === 'complete')) {
        checkUrl();
      }
    };

    const handleActivated = () => checkUrl();

    chrome.tabs.onUpdated.addListener(handleUpdate);
    chrome.tabs.onActivated.addListener(handleActivated);

    return () => {
      chrome.tabs.onUpdated.removeListener(handleUpdate);
      chrome.tabs.onActivated.removeListener(handleActivated);
    };
  }, []);

  const fetchSubtitles = async () => {
    if (!currentUrl || !metadata) return null;
    setLoading(true);
    try {
      // Use postMessage to request subtitles from content script
      // This avoids CORS issues and allows access to page context
      const text = await new Promise<string>((resolve, reject) => {
        const handleResponse = (event: MessageEvent) => {
          const { action, payload } = event.data;
          if (action === 'get-video-subtitles-response') {
            window.removeEventListener('message', handleResponse);
            if (payload.error) {
              reject(new Error(payload.error));
            } else {
              const segments = payload.subtitles;
              const fullText = segments.map((s: any) => s.text).join(' ');
              resolve(fullText);
            }
          }
        };

        window.addEventListener('message', handleResponse);
        window.parent.postMessage({ 
          action: 'get-video-subtitles', 
          payload: { provider: metadata.provider } 
        }, '*');

        // Timeout after 10 seconds
        setTimeout(() => {
          window.removeEventListener('message', handleResponse);
          reject(new Error('Timeout waiting for subtitles'));
        }, 10000);
      });

      return text;
    } catch (error) {
      console.error('Failed to fetch subtitles:', error);
      alert('Failed to fetch subtitles. Please check if the video has subtitles available.');
    } finally {
      setLoading(false);
    }
    return null;
  };

  const handleGetSubtitles = async () => {
    const text = await fetchSubtitles();
    if (text) {
      onSubtitlesFetched(text);
    }
  };

  const handleSummarize = async () => {
    const text = await fetchSubtitles();
    if (text) {
      onSummarize(text);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="cdx-mx-4 cdx-mt-2 cdx-mb-1 cdx-p-3 cdx-bg-blue-50 dark:cdx-bg-blue-900/20 cdx-rounded-lg cdx-border cdx-border-blue-100 dark:cdx-border-blue-800 cdx-flex cdx-flex-col cdx-gap-2">
      <div className="cdx-flex cdx-items-center cdx-gap-2 cdx-text-sm cdx-font-medium cdx-text-blue-800 dark:cdx-text-blue-200">
        <span className="cdx-truncate cdx-flex-1">
          {metadata?.title || 'Video Detected'}
        </span>
        <span className="cdx-text-xs cdx-px-1.5 cdx-py-0.5 cdx-bg-blue-200 dark:cdx-bg-blue-800 cdx-rounded cdx-uppercase">
          {metadata?.provider}
        </span>
      </div>
      
      <div className="cdx-flex cdx-gap-2">
        <button
          onClick={handleGetSubtitles}
          disabled={loading}
          className="cdx-flex-1 cdx-flex cdx-items-center cdx-justify-center cdx-gap-1.5 cdx-py-1.5 cdx-px-3 cdx-bg-white dark:cdx-bg-gray-800 cdx-border cdx-border-blue-200 dark:cdx-border-blue-700 cdx-rounded-md cdx-text-xs cdx-font-medium cdx-text-gray-700 dark:cdx-text-gray-200 hover:cdx-bg-blue-50 dark:hover:cdx-bg-gray-700 cdx-transition-colors"
        >
          <MdClosedCaption size={14} />
          获取字幕
        </button>
        <button
          onClick={handleSummarize}
          disabled={loading}
          className="cdx-flex-1 cdx-flex cdx-items-center cdx-justify-center cdx-gap-1.5 cdx-py-1.5 cdx-px-3 cdx-bg-blue-600 cdx-text-white cdx-rounded-md cdx-text-xs cdx-font-medium hover:cdx-bg-blue-700 cdx-transition-colors cdx-shadow-sm"
        >
          <MdSummarize size={14} />
          总结视频
        </button>
      </div>
    </div>
  );
}
