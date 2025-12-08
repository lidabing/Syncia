/**
 * Content Cleaner - 内容清洗模块
 * 使用 @mozilla/readability 提取文章主体内容，生成阅读模式格式
 */

import { Readability } from '@mozilla/readability'

/**
 * 将 HTML 转换为阅读模式格式的纯文本
 * 保留段落结构、标题层级、列表等
 */
function htmlToReadableText(html: string): string {
  console.log('[ContentCleaner] htmlToReadableText input length:', html.length)
  console.log('[ContentCleaner] htmlToReadableText input preview:', html.slice(0, 500))
  
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const result: string[] = []
  
  function processNode(node: Node, depth: number = 0): void {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim()
      if (text) {
        result.push(text)
      }
      return
    }
    
    if (node.nodeType !== Node.ELEMENT_NODE) return
    
    const el = node as Element
    const tagName = el.tagName.toLowerCase()
    
    // 跳过不需要的元素
    if (['script', 'style', 'nav', 'footer', 'header', 'aside', 'noscript'].includes(tagName)) {
      return
    }
    
    // 处理不同标签
    switch (tagName) {
      case 'h1':
        result.push('\n\n# ' + el.textContent?.trim())
        break
      case 'h2':
        result.push('\n\n## ' + el.textContent?.trim())
        break
      case 'h3':
        result.push('\n\n### ' + el.textContent?.trim())
        break
      case 'h4':
      case 'h5':
      case 'h6':
        result.push('\n\n**' + el.textContent?.trim() + '**')
        break
      case 'p':
        const pText = el.textContent?.trim()
        if (pText && pText.length > 0) {
          result.push('\n\n' + pText)
        }
        break
      case 'br':
        result.push('\n')
        break
      case 'li':
        const liText = el.textContent?.trim()
        if (liText) {
          const prefix = el.parentElement?.tagName.toLowerCase() === 'ol' ? '1. ' : '• '
          result.push('\n' + prefix + liText)
        }
        break
      case 'blockquote':
        const quoteText = el.textContent?.trim()
        if (quoteText) {
          result.push('\n\n> ' + quoteText.replace(/\n/g, '\n> '))
        }
        break
      case 'pre':
      case 'code':
        const codeText = el.textContent?.trim()
        if (codeText) {
          result.push('\n\n```\n' + codeText + '\n```')
        }
        break
      case 'strong':
      case 'b':
        result.push('**' + el.textContent?.trim() + '**')
        break
      case 'em':
      case 'i':
        result.push('*' + el.textContent?.trim() + '*')
        break
      case 'a':
        const linkText = el.textContent?.trim()
        if (linkText) {
          result.push(linkText)
        }
        break
      case 'img':
        const alt = el.getAttribute('alt')
        if (alt) {
          result.push('[图片: ' + alt + ']')
        }
        break
      case 'div':
      case 'section':
      case 'article':
      case 'main':
        // 递归处理容器元素的子节点
        for (const child of Array.from(el.childNodes)) {
          processNode(child, depth + 1)
        }
        break
      case 'ul':
      case 'ol':
        result.push('\n')
        for (const child of Array.from(el.childNodes)) {
          processNode(child, depth + 1)
        }
        result.push('\n')
        break
      case 'table':
        // 简化表格处理
        const rows = el.querySelectorAll('tr')
        result.push('\n')
        rows.forEach(row => {
          const cells = row.querySelectorAll('td, th')
          const rowText = Array.from(cells).map(c => c.textContent?.trim()).join(' | ')
          if (rowText) {
            result.push('\n| ' + rowText + ' |')
          }
        })
        result.push('\n')
        break
      default:
        // 其他元素递归处理
        for (const child of Array.from(el.childNodes)) {
          processNode(child, depth + 1)
        }
    }
  }
  
  processNode(doc.body)
  
  // 清理结果
  const finalResult = result.join('')
    .replace(/\n{3,}/g, '\n\n')  // 最多两个换行
    .replace(/^\n+/, '')         // 移除开头换行
    .replace(/\n+$/, '')         // 移除结尾换行
    .replace(/ {2,}/g, ' ')      // 压缩空格
    .trim()
  
  console.log('[ContentCleaner] htmlToReadableText output length:', finalResult.length)
  console.log('[ContentCleaner] htmlToReadableText output preview:', finalResult.slice(0, 500))
  
  return finalResult
}

/**
 * 清理文本内容，移除 HTML 残留、属性片段等
 */
function cleanTextContent(text: string): string {
  return text
    // 移除 HTML 属性残留 (如 id="xxx" class="yyy" data-xxx="zzz")
    .replace(/\b[a-z_-]+="[^"]*"/gi, ' ')
    .replace(/\b[a-z_-]+='[^']*'/gi, ' ')
    // 移除不完整的 HTML 标签片段 (如 <i style="background...)
    .replace(/<\s*[a-z]+\s+[^>]*$/gim, ' ')
    .replace(/<[^>]*$/g, ' ')
    // 移除完整的 HTML 标签
    .replace(/<[^>]+>/g, ' ')
    // 移除 HTML 实体
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/&#\d+;/g, ' ')
    // 压缩空白
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\t+/g, ' ')
    .replace(/ {2,}/g, ' ')
    .replace(/\n /g, '\n')
    .trim()
}

/**
 * 清洗 HTML 并提取主要内容
 */
export function cleanHtmlContent(html: string, url?: string): CleanedContent {
  // 限制 HTML 长度，避免处理超大页面
  const limitedHtml = html.length > 200000 ? html.slice(0, 200000) : html

  // 检测是否是论坛网站
  const hostname = url ? new URL(url).hostname.toLowerCase() : ''
  const isForum = isForumSite(hostname)

  // 论坛页面使用特殊处理
  if (isForum) {
    const forumResult = extractForumContent(limitedHtml, hostname)
    if (forumResult.content.length > 100) {
      return forumResult
    }
  }

  // 使用 Readability 提取主体内容
  try {
    const doc = new DOMParser().parseFromString(limitedHtml, 'text/html')
    
    // 设置 document URL 以便 Readability 正确解析相对链接
    if (url) {
      const base = doc.createElement('base')
      base.href = url
      doc.head.appendChild(base)
    }

    const reader = new Readability(doc, {
      charThreshold: 50,  // 最小字符阈值
    })
    
    const article = reader.parse()

    if (article && article.content && article.textContent && article.textContent.length > 100) {
      console.log('[ContentCleaner] Readability success!')
      console.log('[ContentCleaner] article.title:', article.title)
      console.log('[ContentCleaner] article.content length:', article.content.length)
      console.log('[ContentCleaner] article.textContent length:', article.textContent.length)
      console.log('[ContentCleaner] article.content preview:', article.content.slice(0, 500))
      
      // 使用 HTML 内容转换成阅读模式格式
      const readableText = htmlToReadableText(article.content)
      console.log('[ContentCleaner] readableText length:', readableText.length)
      
      // 如果阅读模式转换失败，回退到纯文本清理
      const finalText = readableText.length > 50 ? readableText : cleanTextContent(article.textContent)
      console.log('[ContentCleaner] finalText (used):', finalText.slice(0, 500))

      return {
        title: article.title || extractTitle(limitedHtml),
        content: finalText.slice(0, 8000),
        paragraphCount: (finalText.match(/\n\n/g) || []).length + 1,
        hasStructure: true,
        excerpt: article.excerpt || undefined,
        byline: article.byline || undefined,
        siteName: article.siteName || undefined,
      }
    }
  } catch (error) {
    console.warn('[ContentCleaner] Readability failed:', error)
  }

  // Readability 失败时，使用简单回退方案
  return fallbackExtract(limitedHtml, url)
}

/**
 * 提取页面标题
 */
function extractTitle(html: string): string {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i)
  return stripHtmlTags(h1Match?.[1] || titleMatch?.[1] || '')
}

/**
 * 简单回退提取方案
 */
function fallbackExtract(html: string, url?: string): CleanedContent {
  // 移除脚本、样式等
  let cleaned = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')

  const title = extractTitle(html)

  // 提取段落
  const paragraphs: string[] = []
  const pMatches = cleaned.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)
  for (const match of pMatches) {
    const text = stripHtmlTags(match[1])
    if (text.length > 30) {
      paragraphs.push(text)
    }
    if (paragraphs.length >= 20) break
  }

  const content = paragraphs.length > 0 
    ? paragraphs.join('\n\n')
    : stripHtmlTags(cleaned).slice(0, 5000)

  return {
    title,
    content: content.slice(0, 5000),
    paragraphCount: paragraphs.length,
    hasStructure: false,
  }
}

/**
 * 检测是否是论坛网站
 */
function isForumSite(hostname: string): boolean {
  const forumSites = [
    'jisilu.cn',
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
function extractForumContent(html: string, hostname: string): CleanedContent {
  const replies: { author?: string; content: string }[] = []
  let questionContent = ''
  const title = extractTitle(html)

  // 先尝试用 Readability 提取
  try {
    const doc = new DOMParser().parseFromString(html, 'text/html')
    const reader = new Readability(doc.cloneNode(true) as Document)
    const article = reader.parse()
    if (article?.textContent && article.textContent.length > 200) {
      questionContent = article.textContent.slice(0, 2000)
    }
  } catch (e) {
    // 忽略错误
  }

  // 集思录特殊处理
  if (hostname.includes('jisilu.cn')) {
    const blocks = html.split(/class="[^"]*aw-item[^"]*"/)
    for (let i = 1; i < Math.min(blocks.length, 15); i++) {
      const content = stripHtmlTags(blocks[i].slice(0, 1500))
      if (content.length > 20 && content.length < 600) {
        replies.push({ content: content.slice(0, 400) })
      }
    }
  }
  // 知乎
  else if (hostname.includes('zhihu.com')) {
    const blocks = html.split(/class="[^"]*RichContent[^"]*"/)
    for (let i = 1; i < Math.min(blocks.length, 10); i++) {
      const content = stripHtmlTags(blocks[i].slice(0, 2000))
      if (content.length > 50) {
        replies.push({ content: content.slice(0, 500) })
      }
    }
  }
  // V2EX
  else if (hostname.includes('v2ex.com')) {
    const blocks = html.split(/class="[^"]*reply_content[^"]*"/)
    for (let i = 1; i < Math.min(blocks.length, 20); i++) {
      const endIdx = blocks[i].indexOf('</div>')
      const content = stripHtmlTags(blocks[i].slice(0, endIdx > 0 ? endIdx : 400))
      if (content.length > 5) {
        replies.push({ content })
      }
    }
  }
  // 通用论坛
  else {
    const patterns = ['comment', 'reply', 'answer', 'post-content']
    for (const pattern of patterns) {
      const blocks = html.split(new RegExp(`class="[^"]*${pattern}[^"]*"`, 'i'))
      if (blocks.length > 1) {
        for (let i = 1; i < Math.min(blocks.length, 12); i++) {
          const content = stripHtmlTags(blocks[i].slice(0, 1000))
          if (content.length > 30 && content.length < 600) {
            replies.push({ content: content.slice(0, 400) })
          }
        }
        if (replies.length > 0) break
      }
    }
  }

  // 组装内容
  let textContent = ''

  if (questionContent && replies.length === 0) {
    textContent = questionContent
  } else {
    if (questionContent) {
      textContent += `📌 问题/主题：\n${questionContent.slice(0, 1000)}\n\n`
    }

    if (replies.length > 0) {
      textContent += `💬 回复 (${replies.length}条)：\n\n`
      replies.slice(0, 8).forEach((reply, index) => {
        textContent += `#${index + 1} ${reply.content}\n\n`
      })
      if (replies.length > 8) {
        textContent += `... 还有 ${replies.length - 8} 条回复\n`
      }
    }
  }

  return {
    title,
    content: textContent.trim().slice(0, 6000),
    paragraphCount: replies.length || 1,
    hasStructure: replies.length > 0,
    replies: replies.length || undefined,
  }
}

/**
 * 去除 HTML 标签、属性残留并解码实体
 */
function stripHtmlTags(html: string): string {
  return html
    // 移除完整的 HTML 标签
    .replace(/<[^>]+>/g, ' ')
    // 移除 HTML 属性残留 (通用模式: word="value" 或 word='value')
    .replace(/\b[a-z_-]+="[^"]*"/gi, ' ')
    .replace(/\b[a-z_-]+='[^']*'/gi, ' ')
    // 移除不完整的标签片段
    .replace(/<\s*[a-z]+\s+[^>]*$/gim, ' ')
    // 解码 HTML 实体
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
    // 压缩空白
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
  if (isForumSite(hostname)) {
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
  replies?: number
  excerpt?: string
  byline?: string
  siteName?: string
}
