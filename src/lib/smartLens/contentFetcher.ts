/**
 * Content Fetcher - 智能内容提取器
 * 根据链接类型提取不同的内容
 */

import type { LinkPreviewData } from '../../config/settings/smartLens'

/**
 * Fetch link preview data from a URL
 */
export async function fetchLinkPreview(
  url: string
): Promise<LinkPreviewData | null> {
  try {
    if (!chrome.runtime?.id) {
      console.warn('[Smart Lens] Extension context invalidated')
      return null
    }

    console.log('[Smart Lens] Sending message to background for:', url)

    // 使用 Promise 包装并添加超时
    const response = await Promise.race([
      new Promise<LinkPreviewData | null>((resolve) => {
        chrome.runtime.sendMessage(
          { action: 'smart-lens-fetch-preview', url },
          (result) => {
            if (chrome.runtime.lastError) {
              console.warn('[Smart Lens] Runtime error:', chrome.runtime.lastError.message)
              resolve(null)
            } else {
              console.log('[Smart Lens] Got response:', result ? 'data received' : 'null')
              resolve(result)
            }
          }
        )
      }),
      new Promise<null>((resolve) => {
        setTimeout(() => {
          console.warn('[Smart Lens] Message timeout after 15s')
          resolve(null)
        }, 15000) // 15秒超时
      })
    ])
    
    return response
  } catch (error) {
    console.error('[Smart Lens] Failed to fetch link preview:', error)
    return null
  }
}

/**
 * 检测视频平台和提取视频ID
 */
function detectVideoPlatform(url: string): { platform: LinkPreviewData['videoPlatform']; videoId?: string } | null {
  try {
    const urlObj = new URL(url)
    const hostname = urlObj.hostname
    const pathname = urlObj.pathname
    
    // YouTube
    // 格式: youtube.com/watch?v=xxx, youtu.be/xxx, youtube.com/embed/xxx, youtube.com/shorts/xxx
    if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
      let videoId: string | undefined
      
      if (hostname.includes('youtu.be')) {
        videoId = pathname.slice(1).split('/')[0]
      } else {
        const vParam = urlObj.searchParams.get('v')
        if (vParam) {
          videoId = vParam
        } else {
          const embedMatch = pathname.match(/\/(embed|shorts|v)\/([^/?]+)/)
          if (embedMatch) {
            videoId = embedMatch[2]
          }
        }
      }
      
      if (videoId) {
        return { platform: 'youtube', videoId }
      }
      return { platform: 'youtube' }
    }
    
    // Bilibili
    // 格式: bilibili.com/video/BVxxx, bilibili.com/video/avxxx, b23.tv/xxx
    if (hostname.includes('bilibili.com') || hostname.includes('b23.tv')) {
      // BV号
      const bvMatch = pathname.match(/\/video\/(BV[a-zA-Z0-9]+)/)
      if (bvMatch) {
        return { platform: 'bilibili', videoId: bvMatch[1] }
      }
      
      // AV号
      const avMatch = pathname.match(/\/video\/av(\d+)/)
      if (avMatch) {
        return { platform: 'bilibili', videoId: `av${avMatch[1]}` }
      }
      
      // 短链接 b23.tv
      if (hostname.includes('b23.tv')) {
        const shortId = pathname.slice(1).split('/')[0]
        if (shortId && shortId.startsWith('BV')) {
          return { platform: 'bilibili', videoId: shortId }
        }
        // b23.tv 短链需要跳转，暂时只标记为 bilibili
        return { platform: 'bilibili' }
      }
      
      return { platform: 'bilibili' }
    }
    
    // Vimeo
    if (hostname.includes('vimeo.com')) {
      const vimeoMatch = pathname.match(/\/(\d+)/)
      if (vimeoMatch) {
        return { platform: 'vimeo', videoId: vimeoMatch[1] }
      }
      return { platform: 'vimeo' }
    }
    
    return null
  } catch {
    return null
  }
}

/**
 * 提取正文内容（阅读模式）
 */
function extractArticleContent(html: string): string {
  // 移除脚本和样式
  let text = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, '')
    .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, '')
    .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, '')
    .replace(/<aside\b[^<]*(?:(?!<\/aside>)<[^<]*)*<\/aside>/gi, '')
  
  // 尝试提取 article 或 main 内容
  const articleMatch = text.match(/<article[^>]*>([\s\S]*?)<\/article>/i)
  const mainMatch = text.match(/<main[^>]*>([\s\S]*?)<\/main>/i)
  const contentMatch = text.match(/<div[^>]*class=["'][^"']*(?:content|article|post|entry)[^"']*["'][^>]*>([\s\S]*?)<\/div>/i)
  
  const mainContent = articleMatch?.[1] || mainMatch?.[1] || contentMatch?.[1] || text
  
  // 提取段落文本
  const paragraphs: string[] = []
  const pMatches = mainContent.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)
  for (const match of pMatches) {
    const pText = match[1]
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim()
    
    if (pText.length > 20) {
      paragraphs.push(pText)
    }
  }
  
  // 如果没有提取到段落，fallback 到纯文本
  if (paragraphs.length === 0) {
    const plainText = mainContent
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/\s+/g, ' ')
      .trim()
    return plainText.slice(0, 2000)
  }
  
  return paragraphs.slice(0, 10).join('\n\n').slice(0, 2000)
}

/**
 * Parse HTML and extract content based on type
 */
export function parseOpenGraph(html: string, url: string): LinkPreviewData {
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

  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  const title = getMeta('title') || getMeta('og:title') || titleMatch?.[1] || undefined

  // 检测内容类型
  const videoInfo = detectVideoPlatform(url)
  const hostname = new URL(url).hostname
  
  let type: LinkPreviewData['type'] = 'article'
  
  if (videoInfo) {
    type = 'video'
  } else if (hostname.includes('github.com')) {
    type = 'code'
  } else if (
    hostname.includes('amazon.') ||
    hostname.includes('ebay.') ||
    hostname.includes('taobao.') ||
    hostname.includes('jd.com') ||
    hostname.includes('tmall.')
  ) {
    type = 'product'
  } else if (getMeta('og:type') === 'video' || html.includes('<video')) {
    type = 'video'
  }

  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)
  
  const data: LinkPreviewData = {
    type,
    url,
    title,
    description: getMeta('description') || getMeta('og:description') || descMatch?.[1] || undefined,
    image: getMeta('image') || getMeta('og:image') || undefined,
    siteName: getMeta('site_name') || getMeta('og:site_name') || hostname,
    author: getMeta('author') || getMeta('article:author') || undefined,
    publishDate: getMeta('published_time') || getMeta('article:published_time') || undefined,
  }

  // Favicon
  const faviconMatch = html.match(/<link[^>]*rel=["'](shortcut )?icon["'][^>]*href=["']([^"']+)["']/i)
  if (faviconMatch?.[2]) {
    const faviconUrl = faviconMatch[2]
    data.favicon = faviconUrl.startsWith('http') ? faviconUrl : `${new URL(url).origin}${faviconUrl.startsWith('/') ? '' : '/'}${faviconUrl}`
  } else {
    data.favicon = `${new URL(url).origin}/favicon.ico`
  }

  // 根据类型提取特定内容
  if (type === 'video' && videoInfo) {
    data.videoPlatform = videoInfo.platform
    data.videoId = videoInfo.videoId
    data.thumbnailUrl = getMeta('image') || getMeta('og:image')
    data.duration = getMeta('duration') || getMeta('video:duration')
    
    // YouTube 高清缩略图
    if (videoInfo.platform === 'youtube' && videoInfo.videoId) {
      data.thumbnailUrl = `https://img.youtube.com/vi/${videoInfo.videoId}/maxresdefault.jpg`
    }
  }
  
  if (type === 'article') {
    // 提取正文内容
    data.textContent = extractArticleContent(html)
    
    // 计算阅读时间
    const wordCount = (data.textContent || '').length
    const readTime = Math.max(1, Math.ceil(wordCount / 500)) // 中文约 500 字/分钟
    data.readTime = `${readTime} 分钟阅读`
  }
  
  if (type === 'code' && hostname.includes('github.com')) {
    extractGitHubData(html, data)
  }

  return data
}

/**
 * Extract GitHub-specific data
 */
function extractGitHubData(html: string, data: LinkPreviewData) {
  // Stars
  const starsMatch = html.match(/id=["']repo-stars-counter-star["'][^>]*>([^<]+)</i)
    || html.match(/aria-label=["'](\d[\d,.kKmM]*)\s*stars?["']/i)
    || html.match(/<span[^>]*class=["'][^"']*Counter[^"']*["'][^>]*>(\d[\d,.kKmM]*)<\/span>/i)
  if (starsMatch?.[1]) {
    data.stars = parseNumberWithSuffix(starsMatch[1].trim())
  }

  // Forks
  const forksMatch = html.match(/aria-label=["'](\d[\d,.kKmM]*)\s*forks?["']/i)
  if (forksMatch?.[1]) {
    data.forks = parseNumberWithSuffix(forksMatch[1].trim())
  }

  // Language
  const langMatch = html.match(/itemprop=["']programmingLanguage["'][^>]*>([^<]+)</i)
    || html.match(/<span[^>]*class=["'][^"']*repo-language-color[^"']*["'][^>]*>[\s\S]*?<span[^>]*>([^<]+)<\/span>/i)
  if (langMatch?.[1]) {
    data.language = langMatch[1].trim()
  }

  // README 描述
  if (!data.description) {
    const aboutMatch = html.match(/<p[^>]*class=["'][^"']*f4[^"']*["'][^>]*>([^<]+)</i)
    if (aboutMatch?.[1]) {
      data.description = aboutMatch[1].trim().slice(0, 200)
    }
  }
}

function parseNumberWithSuffix(text: string): number {
  const num = Number.parseFloat(text.replace(/,/g, ''))
  if (text.toLowerCase().includes('k')) return Math.round(num * 1000)
  if (text.toLowerCase().includes('m')) return Math.round(num * 1000000)
  return Math.round(num)
}

/**
 * Generate AI summary based on content type
 */
export async function generateAISummary(
  content: string,
  apiKey: string,
  baseUrl: string | null,
  type: LinkPreviewData['type'] = 'generic'
): Promise<string> {
  try {
    let systemPrompt = '你是一个专业的内容摘要助手。请用简洁的中文总结要点。'
    let userPrompt = `请总结以下内容的核心要点：\n\n${content.substring(0, 3000)}`

    switch (type) {
      case 'code':
        systemPrompt = '你是一个资深的开发者助手。请分析这个代码仓库或技术文档。'
        userPrompt = `请分析以下GitHub仓库/代码页面的内容：
1. 这个项目是做什么的？
2. 主要技术栈是什么？
3. 核心功能有哪些？
请用Markdown列表格式简洁回答。

内容：
${content.substring(0, 3000)}`
        break
      
      case 'product':
        systemPrompt = '你是一个专业的购物助手。请分析这个商品页面。'
        userPrompt = `请分析以下商品页面的内容：
1. 商品的主要卖点是什么？
2. 价格信息（如果有）
3. 用户评价总结（如果有）
请用Markdown列表格式简洁回答。

内容：
${content.substring(0, 3000)}`
        break

      case 'article':
        systemPrompt = '你是一个高效的阅读助手。请总结这篇文章。'
        userPrompt = `请为这篇文章生成一份简报：
1. 一句话总结核心观点
2. 列出3-5个关键要点
3. 适合什么人群阅读？

内容：
${content.substring(0, 3000)}`
        break

      case 'video':
        systemPrompt = '你是一个视频内容分析助手。'
        userPrompt = `请根据视频的标题和描述，总结视频的主要内容和看点。

内容：
${content.substring(0, 1000)}`
        break
    }

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
            content: systemPrompt,
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        max_tokens: 300,
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
 * Extract YouTube video data (legacy support)
 */
export function extractYouTubeData(url: string): Partial<LinkPreviewData> {
  const videoInfo = detectVideoPlatform(url)
  if (videoInfo?.platform === 'youtube' && videoInfo.videoId) {
    return {
      type: 'video',
      videoPlatform: 'youtube',
      videoId: videoInfo.videoId,
      thumbnailUrl: `https://img.youtube.com/vi/${videoInfo.videoId}/maxresdefault.jpg`,
      siteName: 'YouTube',
      favicon: 'https://www.youtube.com/favicon.ico',
    }
  }
  return {}
}
