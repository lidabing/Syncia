/**
 * Platform Adapters - 平台专用 API 适配器
 * 针对特定平台使用 API 获取更准确的数据
 */

import type { LinkPreviewData } from '../../config/settings/smartLens'

/**
 * GitHub API 适配器
 * 通过 GitHub API 获取仓库信息，比抓取 HTML 准确得多
 */
export async function fetchGitHubData(url: string): Promise<Partial<LinkPreviewData> | null> {
  try {
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split('/').filter(Boolean)
    
    if (pathParts.length < 2) return null
    
    const owner = pathParts[0]
    const repo = pathParts[1]
    
    // 检查是否是仓库页面（排除 blob, issues 等子页面的深度处理）
    const isRepoRoot = pathParts.length === 2
    const isRepoSubpage = pathParts.length > 2 && ['blob', 'tree', 'issues', 'pull', 'actions', 'wiki'].includes(pathParts[2])
    
    if (!isRepoRoot && !isRepoSubpage) return null

    // 获取仓库基本信息
    const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Syncia-Browser-Extension',
      },
    })

    if (!repoResponse.ok) {
      console.warn('GitHub API error:', repoResponse.status)
      return null
    }

    const repoData = await repoResponse.json()

    // 尝试获取 README（用于 AI 分析）
    let readmeContent = ''
    try {
      const readmeResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Syncia-Browser-Extension',
        },
      })
      
      if (readmeResponse.ok) {
        const readmeData = await readmeResponse.json()
        // README 是 base64 编码的
        readmeContent = atob(readmeData.content)
        // 限制长度
        readmeContent = readmeContent.slice(0, 3000)
      }
    } catch (e) {
      console.warn('Failed to fetch README:', e)
    }

    // 获取主要编程语言
    let languages: Record<string, number> = {}
    try {
      const langResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/languages`, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Syncia-Browser-Extension',
        },
      })
      
      if (langResponse.ok) {
        languages = await langResponse.json()
      }
    } catch (e) {
      console.warn('Failed to fetch languages:', e)
    }

    const topLanguages = Object.entries(languages)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([lang]) => lang)

    return {
      type: 'code',
      title: repoData.full_name,
      description: repoData.description || '',
      image: repoData.owner?.avatar_url,
      siteName: 'GitHub',
      favicon: 'https://github.com/favicon.ico',
      author: repoData.owner?.login,
      stars: repoData.stargazers_count,
      forks: repoData.forks_count,
      language: repoData.language || topLanguages[0],
      // 额外数据供 AI 使用
      textContent: `
# ${repoData.full_name}

${repoData.description || ''}

- Stars: ${repoData.stargazers_count}
- Forks: ${repoData.forks_count}
- Language: ${repoData.language || 'Unknown'}
- Topics: ${(repoData.topics || []).join(', ')}
- License: ${repoData.license?.name || 'Not specified'}
- Last updated: ${repoData.updated_at}
- Open issues: ${repoData.open_issues_count}

${readmeContent ? '## README\n\n' + readmeContent : ''}
      `.trim(),
    }
  } catch (error) {
    console.error('GitHub API fetch error:', error)
    return null
  }
}

/**
 * YouTube oEmbed 适配器
 * 获取视频的标题、作者、缩略图等信息
 */
export async function fetchYouTubeData(url: string): Promise<Partial<LinkPreviewData> | null> {
  try {
    // 提取视频 ID
    const urlObj = new URL(url)
    let videoId: string | null = null

    if (urlObj.hostname.includes('youtu.be')) {
      videoId = urlObj.pathname.slice(1).split('/')[0]
    } else if (urlObj.hostname.includes('youtube.com')) {
      videoId = urlObj.searchParams.get('v')
      if (!videoId) {
        const embedMatch = urlObj.pathname.match(/\/(embed|shorts|v)\/([^/?]+)/)
        if (embedMatch) {
          videoId = embedMatch[2]
        }
      }
    }

    if (!videoId) return null

    // 使用 oEmbed API（不需要 API Key）
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
    const response = await fetch(oembedUrl)
    
    if (!response.ok) {
      console.warn('YouTube oEmbed error:', response.status)
      return null
    }

    const data = await response.json()

    return {
      type: 'video',
      title: data.title,
      author: data.author_name,
      siteName: 'YouTube',
      favicon: 'https://www.youtube.com/favicon.ico',
      videoPlatform: 'youtube',
      videoId: videoId,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      textContent: `
YouTube 视频: ${data.title}
作者: ${data.author_name}
      `.trim(),
    }
  } catch (error) {
    console.error('YouTube oEmbed fetch error:', error)
    return null
  }
}

/**
 * Stack Overflow 问答适配器
 * 提取问题和最佳答案
 */
export async function fetchStackOverflowData(url: string, html: string): Promise<Partial<LinkPreviewData> | null> {
  try {
    // 提取问题 ID
    const urlObj = new URL(url)
    const questionMatch = urlObj.pathname.match(/\/questions\/(\d+)/)
    
    if (!questionMatch) return null

    // 提取问题标题
    const titleMatch = html.match(/<h1[^>]*class=["'][^"']*question-hyperlink[^"']*["'][^>]*>([^<]+)<\/h1>/i)
      || html.match(/<a[^>]*class=["'][^"']*question-hyperlink[^"']*["'][^>]*>([^<]+)<\/a>/i)
    
    // 提取问题内容
    const questionMatch2 = html.match(/<div[^>]*class=["'][^"']*s-prose[^"']*["'][^>]*>([\s\S]*?)<\/div>/i)
    
    // 提取最佳答案
    const acceptedAnswerMatch = html.match(/<div[^>]*class=["'][^"']*accepted-answer[^"']*["'][^>]*>[\s\S]*?<div[^>]*class=["'][^"']*s-prose[^"']*["'][^>]*>([\s\S]*?)<\/div>/i)

    // 提取标签
    const tagMatches = html.matchAll(/<a[^>]*class=["'][^"']*post-tag[^"']*["'][^>]*>([^<]+)<\/a>/gi)
    const tags: string[] = []
    for (const match of tagMatches) {
      if (tags.length < 5) tags.push(match[1])
    }

    // 提取投票数
    const voteMatch = html.match(/data-value=["'](\d+)["'][^>]*class=["'][^"']*js-vote-count/i)
      || html.match(/class=["'][^"']*js-vote-count[^"']*["'][^>]*data-value=["'](\d+)["']/i)

    const questionText = questionMatch2?.[1]?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 500) || ''
    const answerText = acceptedAnswerMatch?.[1]?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 800) || ''

    return {
      type: 'article', // 或可扩展为 'forum'
      title: titleMatch?.[1]?.trim() || '',
      siteName: 'Stack Overflow',
      favicon: 'https://cdn.sstatic.net/Sites/stackoverflow/Img/favicon.ico',
      textContent: `
## 问题
${questionText}

## 标签
${tags.join(', ')}

${answerText ? `## 最佳答案\n${answerText}` : ''}

投票数: ${voteMatch?.[1] || '0'}
      `.trim(),
    }
  } catch (error) {
    console.error('Stack Overflow parse error:', error)
    return null
  }
}

/**
 * 知乎适配器
 */
export async function fetchZhihuData(url: string, html: string): Promise<Partial<LinkPreviewData> | null> {
  try {
    const urlObj = new URL(url)
    
    // 判断是问题还是文章
    const isQuestion = urlObj.pathname.includes('/question/')
    const isArticle = urlObj.pathname.includes('/p/')
    
    if (!isQuestion && !isArticle) return null

    // 提取标题
    const titleMatch = html.match(/<h1[^>]*class=["'][^"']*QuestionHeader-title[^"']*["'][^>]*>([^<]+)<\/h1>/i)
      || html.match(/<h1[^>]*class=["'][^"']*Post-Title[^"']*["'][^>]*>([^<]+)<\/h1>/i)
      || html.match(/<title>([^<]+)<\/title>/i)

    // 提取内容
    const contentMatch = html.match(/<div[^>]*class=["'][^"']*RichContent-inner[^"']*["'][^>]*>([\s\S]*?)<\/div>/i)
      || html.match(/<div[^>]*class=["'][^"']*Post-RichTextContainer[^"']*["'][^>]*>([\s\S]*?)<\/div>/i)

    const content = contentMatch?.[1]?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 1500) || ''

    return {
      type: isArticle ? 'article' : 'article',
      title: titleMatch?.[1]?.replace(/ - 知乎$/, '').trim() || '',
      siteName: '知乎',
      favicon: 'https://static.zhihu.com/heifetz/favicon.ico',
      textContent: content,
    }
  } catch (error) {
    console.error('Zhihu parse error:', error)
    return null
  }
}

/**
 * 根据 URL 选择合适的适配器
 */
export async function fetchWithPlatformAdapter(
  url: string, 
  html: string
): Promise<Partial<LinkPreviewData> | null> {
  const hostname = new URL(url).hostname.toLowerCase()

  // GitHub
  if (hostname.includes('github.com')) {
    const data = await fetchGitHubData(url)
    if (data) return data
  }

  // YouTube
  if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
    const data = await fetchYouTubeData(url)
    if (data) return data
  }

  // Stack Overflow
  if (hostname.includes('stackoverflow.com')) {
    const data = await fetchStackOverflowData(url, html)
    if (data) return data
  }

  // 知乎
  if (hostname.includes('zhihu.com')) {
    const data = await fetchZhihuData(url, html)
    if (data) return data
  }

  return null
}
