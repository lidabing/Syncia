/**
 * Content Fetcher - Extract Open Graph and metadata from links
 */

import type { LinkPreviewData } from '../../config/settings/smartLens'

/**
 * Fetch link preview data from a URL
 */
export async function fetchLinkPreview(
  url: string
): Promise<LinkPreviewData | null> {
  try {
    // Check extension context
    if (!chrome.runtime?.id) {
      console.warn('Extension context invalidated')
      return null
    }

    // 发送到 background script 处理(避免 CORS 问题)
    const response = await chrome.runtime.sendMessage({
      action: 'smart-lens-fetch-preview',
      url,
    })
    
    // Check for runtime errors
    if (chrome.runtime.lastError) {
      console.warn('Runtime error:', chrome.runtime.lastError)
      return null
    }
    
    return response
  } catch (error) {
    console.error('Failed to fetch link preview:', error)
    return null
  }
}

/**
 * Parse HTML and extract Open Graph metadata
 * Uses regex instead of DOMParser for Service Worker compatibility
 */
export function parseOpenGraph(html: string, url: string): LinkPreviewData {
  // Helper to extract meta content using regex
  const getMeta = (property: string): string | undefined => {
    const patterns = [
      new RegExp(`<meta[^>]*property=["']${property}["'][^>]*content=["']([^"']+)["']`, 'i'),
      new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*property=["']${property}["']`, 'i'),
      new RegExp(`<meta[^>]*name=["']${property}["'][^>]*content=["']([^"']+)["']`, 'i'),
      new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*name=["']${property}["']`, 'i'),
      new RegExp(`<meta[^>]*property=["']og:${property}["'][^>]*content=["']([^"']+)["']`, 'i'),
      new RegExp(`<meta[^>]*property=["']twitter:${property}["'][^>]*content=["']([^"']+)["']`, 'i'),
    ]

    for (const pattern of patterns) {
      const match = html.match(pattern)
      if (match?.[1]) return match[1]
    }
    return undefined
  }

  // Extract title
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  const title = getMeta('title') || getMeta('og:title') || titleMatch?.[1] || undefined

  // Detect content type
  const detectType = (url: string): LinkPreviewData['type'] => {
    const hostname = new URL(url).hostname

    if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
      return 'video'
    }
    if (hostname.includes('github.com')) {
      return 'code'
    }
    if (
      hostname.includes('amazon.') ||
      hostname.includes('ebay.') ||
      hostname.includes('taobao.')
    ) {
      return 'product'
    }

    // Check for video tags in HTML
    if (getMeta('video') || html.includes('<video')) {
      return 'video'
    }

    return 'article'
  }

  const type = detectType(url)

  // Extract description
  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)
  
  // Extract common metadata
  const data: LinkPreviewData = {
    type,
    url,
    title,
    description:
      getMeta('description') ||
      getMeta('og:description') ||
      descMatch?.[1] ||
      undefined,
    image: getMeta('image') || getMeta('og:image') || undefined,
    siteName: getMeta('site_name') || getMeta('og:site_name') || new URL(url).hostname,
    author: getMeta('author') || getMeta('article:author') || undefined,
    publishDate:
      getMeta('published_time') || getMeta('article:published_time') || undefined,
  }

  // Extract favicon
  const faviconMatch = html.match(/<link[^>]*rel=["'](shortcut )?icon["'][^>]*href=["']([^"']+)["']/i)
  data.favicon =
    faviconMatch?.[2] ||
    `${new URL(url).origin}/favicon.ico`

  // Estimate read time for articles
  if (type === 'article') {
    // Remove HTML tags and count words
    const textContent = html.replace(/<[^>]+>/g, ' ')
    const wordCount = textContent.split(/\s+/).length
    const readTime = Math.ceil(wordCount / 200) // Average reading speed
    data.readTime = `${readTime} min read`
  }

  // Type-specific extraction
  if (type === 'video') {
    data.thumbnailUrl = getMeta('image') || getMeta('thumbnail')
    data.duration = getMeta('duration') || getMeta('video:duration')
  }

  if (type === 'code' && url.includes('github.com')) {
    extractGitHubData(html, data)
  }

  return data
}

/**
 * Extract GitHub-specific data from HTML
 */
function extractGitHubData(html: string, data: LinkPreviewData) {
  // Extract stars
  const starsMatch = html.match(/id=["']repo-stars-counter-star["'][^>]*>([^<]+)</i)
  if (starsMatch?.[1]) {
    data.stars = parseNumberWithSuffix(starsMatch[1].trim())
  }

  // Extract language
  const langMatch = html.match(/itemprop=["']programmingLanguage["'][^>]*>([^<]+)</i)
  if (langMatch?.[1]) {
    data.language = langMatch[1].trim()
  }

  // Extract README first paragraph if no description
  if (!data.description) {
    const readmeMatch = html.match(/<div[^>]*id=["']readme["'][^>]*>[\s\S]*?<p[^>]*>([^<]+)</i)
    if (readmeMatch?.[1]) {
      data.description = readmeMatch[1].trim().substring(0, 200)
    }
  }
}

/**
 * Parse numbers like "1.2k", "3.5M" to actual numbers
 */
function parseNumberWithSuffix(text: string): number {
  const num = Number.parseFloat(text)
  if (text.toLowerCase().includes('k')) return Math.round(num * 1000)
  if (text.toLowerCase().includes('m')) return Math.round(num * 1000000)
  return Math.round(num)
}

/**
 * Generate AI summary for the content
 */
export async function generateAISummary(
  content: string,
  apiKey: string,
  baseUrl: string | null
): Promise<string> {
  try {
    const response = await fetch(`${baseUrl || 'https://api.openai.com'}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'You are a helpful assistant that creates concise 3-line summaries of web content. Be brief and informative.',
          },
          {
            role: 'user',
            content: `Summarize this content in 3 lines or less:\n\n${content.substring(0, 3000)}`,
          },
        ],
        max_tokens: 150,
        temperature: 0.3,
      }),
    })

    const data = await response.json()
    return data.choices[0]?.message?.content || ''
  } catch (error) {
    console.error('Failed to generate AI summary:', error)
    return ''
  }
}

/**
 * Extract YouTube video data
 */
export function extractYouTubeData(url: string): Partial<LinkPreviewData> {
  const videoIdMatch = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/
  )
  if (!videoIdMatch) return {}

  const videoId = videoIdMatch[1]

  return {
    type: 'video',
    thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    siteName: 'YouTube',
    favicon: 'https://www.youtube.com/favicon.ico',
  }
}
