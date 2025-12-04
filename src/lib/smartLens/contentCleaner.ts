/**
 * Content Cleaner - 内容清洗模块
 * 将杂乱的 HTML 转换为纯净的文本，使用类 Readability 算法
 */

/**
 * 清洗 HTML 并提取主要内容
 */
export function cleanHtmlContent(html: string, url?: string): CleanedContent {
  // 限制 HTML 长度，避免处理超大页面时卡死
  const limitedHtml = html.length > 300000 ? html.slice(0, 300000) : html

  // 1. 移除脚本、样式、注释等（使用更高效的正则）
  let cleaned = limitedHtml
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '')
  
  // 2. 移除导航、页眉、页脚、侧边栏等非正文区域
  cleaned = cleaned
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
    .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, '')

  // 3. 提取标题
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  const h1Match = cleaned.match(/<h1[^>]*>([^<]+)<\/h1>/i)
  const title = h1Match?.[1]?.trim() || titleMatch?.[1]?.trim() || ''

  // 检测是否是论坛/问答页面
  const hostname = url ? new URL(url).hostname.toLowerCase() : ''
  const isForum = isForumSite(hostname)

  // 4. 论坛页面特殊处理 - 提取问题和回复
  if (isForum) {
    return extractForumContent(cleaned, title, hostname)
  }

  // 5. 普通页面：尝试提取 article 或 main 标签内容
  const articleMatch = cleaned.match(/<article[^>]*>([\s\S]*?)<\/article>/i)
  const mainMatch = cleaned.match(/<main[^>]*>([\s\S]*?)<\/main>/i)
  const contentDivMatch = cleaned.match(/<div[^>]*class=["'][^"']*(?:content|article|post|entry|text|body)[^"']*["'][^>]*>([\s\S]*?)<\/div>/i)
  
  let mainContent = articleMatch?.[1] || mainMatch?.[1] || contentDivMatch?.[1] || cleaned

  // 6. 提取段落文本
  const paragraphs: string[] = []
  const pMatches = mainContent.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)
  for (const match of pMatches) {
    const text = stripHtmlTags(match[1])
    if (text.length > 30) {
      paragraphs.push(text)
    }
  }

  // 7. 提取列表项
  const listItems: string[] = []
  const liMatches = mainContent.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)
  for (const match of liMatches) {
    const text = stripHtmlTags(match[1])
    if (text.length > 10 && text.length < 500) {
      listItems.push(`• ${text}`)
    }
  }

  // 8. 提取标题结构
  const headings: { level: number; text: string }[] = []
  const hMatches = mainContent.matchAll(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi)
  for (const match of hMatches) {
    const text = stripHtmlTags(match[2])
    if (text.length > 0) {
      headings.push({ level: parseInt(match[1]), text })
    }
  }

  // 9. 组装清洗后的内容
  let textContent = ''
  
  if (paragraphs.length > 0) {
    textContent += paragraphs.slice(0, 20).join('\n\n')
  }

  if (textContent.length < 500 && listItems.length > 0 && listItems.length < 50) {
    if (textContent.length > 0) {
      textContent += '\n\n'
    }
    textContent += listItems.slice(0, 15).join('\n')
  }

  if (textContent.trim().length < 100) {
    textContent = stripHtmlTags(mainContent)
  }

  textContent = textContent
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  return {
    title,
    content: textContent.slice(0, 5000),
    paragraphCount: paragraphs.length,
    hasStructure: headings.length > 0,
  }
}

/**
 * 检测是否是论坛网站
 */
function isForumSite(hostname: string): boolean {
  const forumSites = [
    'jisilu.cn',        // 集思录
    'stackoverflow.com',
    'reddit.com',
    'quora.com',
    'zhihu.com',
    'v2ex.com',
    'segmentfault.com',
    'juejin.cn',
    'tieba.baidu.com',
    'nga.cn',
    'ngabbs.com',
    'discuz',
    'bbs.',
    'forum.',
    'discuss.',
  ]
  return forumSites.some(site => hostname.includes(site))
}

/**
 * 提取论坛/问答页面内容
 */
function extractForumContent(html: string, title: string, hostname: string): CleanedContent {
  const replies: { author?: string; content: string; time?: string }[] = []
  let questionContent = ''

  // 限制处理的 HTML 长度，避免性能问题
  const limitedHtml = html.slice(0, 500000)

  // 集思录特殊处理
  if (hostname.includes('jisilu.cn')) {
    // 提取问题内容
    const questionMatch = limitedHtml.match(/<div[^>]*class="[^"]*aw-question-detail-txt[^"]*"[^>]*>([^]*?)<\/div>/i)
    if (questionMatch) {
      questionContent = stripHtmlTags(questionMatch[1])
    }

    // 提取回复 - 使用更简单的模式
    const replyBlocks = limitedHtml.split(/class="[^"]*aw-item[^"]*"/)
    for (let i = 1; i < Math.min(replyBlocks.length, 20); i++) {
      const block = replyBlocks[i].slice(0, 2000) // 限制每个块的大小
      const content = stripHtmlTags(block)
      if (content.length > 20 && content.length < 800) {
        replies.push({ content: content.slice(0, 400) })
      }
    }
  }

  // 知乎特殊处理
  else if (hostname.includes('zhihu.com')) {
    const blocks = limitedHtml.split(/class="[^"]*RichContent[^"]*"/)
    for (let i = 1; i < Math.min(blocks.length, 10); i++) {
      const content = stripHtmlTags(blocks[i].slice(0, 3000))
      if (content.length > 50) {
        replies.push({ content: content.slice(0, 600) })
      }
    }
  }

  // V2EX 特殊处理
  else if (hostname.includes('v2ex.com')) {
    const blocks = limitedHtml.split(/class="[^"]*reply_content[^"]*"/)
    for (let i = 1; i < Math.min(blocks.length, 30); i++) {
      const endIdx = blocks[i].indexOf('</div>')
      const content = stripHtmlTags(blocks[i].slice(0, endIdx > 0 ? endIdx : 500))
      if (content.length > 5) {
        replies.push({ content })
      }
    }
  }
  // 通用论坛处理
  else {
    // 使用 split 代替复杂正则
    const patterns = ['comment', 'reply', 'answer', 'post-content']
    for (const pattern of patterns) {
      const blocks = limitedHtml.split(new RegExp(`class="[^"]*${pattern}[^"]*"`, 'i'))
      if (blocks.length > 1) {
        for (let i = 1; i < Math.min(blocks.length, 15); i++) {
          const content = stripHtmlTags(blocks[i].slice(0, 1500))
          if (content.length > 30 && content.length < 800) {
            replies.push({ content: content.slice(0, 400) })
          }
        }
        if (replies.length > 0) break
      }
    }
  }

  // 如果没找到结构化回复，尝试提取所有段落
  if (replies.length === 0) {
    const pMatches = limitedHtml.matchAll(/<p[^>]*>([^<]{30,})<\/p>/gi)
    for (const match of pMatches) {
      const text = stripHtmlTags(match[1])
      if (text.length > 30) {
        replies.push({ content: text.slice(0, 500) })
      }
      if (replies.length >= 15) break
    }
  }

  // 组装内容
  let textContent = ''

  if (questionContent) {
    textContent += `📌 问题：\n${questionContent}\n\n`
  }

  if (replies.length > 0) {
    textContent += `💬 回复 (${replies.length}条)：\n\n`
    replies.slice(0, 10).forEach((reply: { author?: string; content: string }, index: number) => {
      if (reply.author) {
        textContent += `【${reply.author}】\n`
      } else {
        textContent += `#${index + 1}\n`
      }
      textContent += `${reply.content}\n\n`
    })

    if (replies.length > 10) {
      textContent += `... 还有 ${replies.length - 10} 条回复\n`
    }
  }

  return {
    title,
    content: textContent.trim().slice(0, 6000),
    paragraphCount: replies.length,
    hasStructure: true,
    replies: replies.length,
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
    hostname.includes('jisilu.cn') ||
    hostname.includes('stackoverflow.com') ||
    hostname.includes('reddit.com') ||
    hostname.includes('quora.com') ||
    hostname.includes('zhihu.com') ||
    hostname.includes('v2ex.com') ||
    hostname.includes('segmentfault.com') ||
    hostname.includes('juejin.cn') ||
    hostname.includes('tieba.baidu.com') ||
    hostname.includes('nga.cn') ||
    hostname.includes('ngabbs.com') ||
    hostname.includes('discuz') ||
    hostname.includes('bbs.') ||
    hostname.includes('forum.')
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
  replies?: number // 论坛回复数量
}
