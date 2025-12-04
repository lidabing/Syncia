/**
 * Content Cleaner - 内容清洗模块
 * 将杂乱的 HTML 转换为纯净的文本，使用类 Readability 算法
 */

/**
 * 清洗 HTML 并提取主要内容
 */
export function cleanHtmlContent(html: string): CleanedContent {
  // 1. 移除脚本、样式、注释等
  let cleaned = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
  
  // 2. 移除导航、页眉、页脚、侧边栏等非正文区域
  cleaned = cleaned
    .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, '')
    .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, '')
    .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, '')
    .replace(/<aside\b[^<]*(?:(?!<\/aside>)<[^<]*)*<\/aside>/gi, '')
    .replace(/<div[^>]*class=["'][^"']*(?:sidebar|advertisement|ad-|ads-|banner|popup|modal|cookie|newsletter)[^"']*["'][^>]*>[\s\S]*?<\/div>/gi, '')

  // 3. 提取标题
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  const h1Match = cleaned.match(/<h1[^>]*>([^<]+)<\/h1>/i)
  const title = h1Match?.[1]?.trim() || titleMatch?.[1]?.trim() || ''

  // 4. 尝试提取 article 或 main 标签内容
  const articleMatch = cleaned.match(/<article[^>]*>([\s\S]*?)<\/article>/i)
  const mainMatch = cleaned.match(/<main[^>]*>([\s\S]*?)<\/main>/i)
  const contentDivMatch = cleaned.match(/<div[^>]*class=["'][^"']*(?:content|article|post|entry|text|body)[^"']*["'][^>]*>([\s\S]*?)<\/div>/i)
  
  let mainContent = articleMatch?.[1] || mainMatch?.[1] || contentDivMatch?.[1] || cleaned

  // 5. 提取段落文本
  const paragraphs: string[] = []
  const pMatches = mainContent.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)
  for (const match of pMatches) {
    const text = stripHtmlTags(match[1])
    if (text.length > 30) {
      paragraphs.push(text)
    }
  }

  // 6. 提取列表项
  const listItems: string[] = []
  const liMatches = mainContent.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)
  for (const match of liMatches) {
    const text = stripHtmlTags(match[1])
    if (text.length > 10 && text.length < 500) {
      listItems.push(`• ${text}`)
    }
  }

  // 7. 提取标题结构
  const headings: { level: number; text: string }[] = []
  const hMatches = mainContent.matchAll(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi)
  for (const match of hMatches) {
    const text = stripHtmlTags(match[2])
    if (text.length > 0) {
      headings.push({ level: parseInt(match[1]), text })
    }
  }

  // 8. 组装清洗后的内容
  let textContent = ''
  
  if (headings.length > 0) {
    textContent += '## 文章结构\n'
    headings.slice(0, 10).forEach(h => {
      textContent += `${'#'.repeat(h.level)} ${h.text}\n`
    })
    textContent += '\n'
  }

  if (paragraphs.length > 0) {
    textContent += '## 正文内容\n'
    textContent += paragraphs.slice(0, 15).join('\n\n')
    textContent += '\n\n'
  }

  if (listItems.length > 0 && listItems.length < 50) {
    textContent += '## 要点列表\n'
    textContent += listItems.slice(0, 20).join('\n')
  }

  // 如果没有提取到结构化内容，降级为纯文本
  if (textContent.trim().length < 100) {
    textContent = stripHtmlTags(mainContent)
  }

  return {
    title,
    content: textContent.trim().slice(0, 4000),
    paragraphCount: paragraphs.length,
    hasStructure: headings.length > 0,
  }
}

/**
 * 去除 HTML 标签并解码实体
 */
function stripHtmlTags(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&hellip;/g, '...')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&#\d+;/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * 检测内容类型
 */
export function detectContentType(url: string, html: string): ContentType {
  const hostname = new URL(url).hostname.toLowerCase()
  const pathname = new URL(url).pathname.toLowerCase()

  // 视频平台
  if (
    hostname.includes('youtube.com') || 
    hostname.includes('youtu.be') ||
    hostname.includes('bilibili.com') ||
    hostname.includes('b23.tv') ||
    hostname.includes('vimeo.com') ||
    hostname.includes('tiktok.com') ||
    hostname.includes('douyin.com')
  ) {
    return 'video'
  }

  // 代码仓库
  if (
    hostname.includes('github.com') ||
    hostname.includes('gitlab.com') ||
    hostname.includes('bitbucket.org') ||
    hostname.includes('gitee.com')
  ) {
    return 'repository'
  }

  // 电商平台
  if (
    hostname.includes('amazon.') ||
    hostname.includes('ebay.') ||
    hostname.includes('taobao.') ||
    hostname.includes('tmall.') ||
    hostname.includes('jd.com') ||
    hostname.includes('pinduoduo.') ||
    hostname.includes('shopee.') ||
    hostname.includes('aliexpress.')
  ) {
    return 'product'
  }

  // 论坛/问答
  if (
    hostname.includes('stackoverflow.com') ||
    hostname.includes('reddit.com') ||
    hostname.includes('quora.com') ||
    hostname.includes('zhihu.com') ||
    hostname.includes('v2ex.com') ||
    hostname.includes('segmentfault.com') ||
    hostname.includes('juejin.cn')
  ) {
    return 'forum'
  }

  // 社交媒体
  if (
    hostname.includes('twitter.com') ||
    hostname.includes('x.com') ||
    hostname.includes('weibo.com') ||
    hostname.includes('facebook.com') ||
    hostname.includes('instagram.com') ||
    hostname.includes('linkedin.com')
  ) {
    return 'social'
  }

  // 新闻媒体
  if (
    hostname.includes('news.') ||
    hostname.includes('bbc.') ||
    hostname.includes('cnn.') ||
    hostname.includes('nytimes.') ||
    hostname.includes('theguardian.') ||
    hostname.includes('163.com') ||
    hostname.includes('sina.com') ||
    hostname.includes('sohu.com') ||
    pathname.includes('/news/') ||
    pathname.includes('/article/')
  ) {
    return 'news'
  }

  // 文档/Wiki
  if (
    hostname.includes('wikipedia.org') ||
    hostname.includes('docs.') ||
    hostname.includes('documentation') ||
    pathname.includes('/docs/') ||
    pathname.includes('/wiki/')
  ) {
    return 'documentation'
  }

  // 检测页面内容特征
  const hasProductPrice = /<[^>]*class=["'][^"']*price[^"']*["'][^>]*>/i.test(html)
  const hasShoppingCart = /add.?to.?cart|buy.?now|加入购物车|立即购买/i.test(html)
  if (hasProductPrice && hasShoppingCart) {
    return 'product'
  }

  // 默认为文章
  return 'article'
}

export type ContentType = 
  | 'article' 
  | 'video' 
  | 'repository' 
  | 'product' 
  | 'forum' 
  | 'social'
  | 'news'
  | 'documentation'

export interface CleanedContent {
  title: string
  content: string
  paragraphCount: number
  hasStructure: boolean
}
