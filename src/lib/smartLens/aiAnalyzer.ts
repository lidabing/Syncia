/**
 * AI Analyzer - 结构化 AI 分析模块
 * 返回 JSON 格式的智能分析结果
 */

import type { ContentType } from './contentCleaner'
import type { AIAnalysisResult } from '../../config/settings/smartLens'

export type { AIAnalysisResult }

// 内部类型映射
type InternalType = AIAnalysisResult['type']

const CONTENT_TYPE_MAP: Record<ContentType, InternalType> = {
  article: 'general',
  video: 'video',
  repository: 'repository',
  product: 'product',
  forum: 'discussion',
  social: 'social',
  news: 'news',
  documentation: 'documentation',
}

/**
 * 使用 AI 清理和格式化文本内容
 * 移除 HTML 残留、乱码，返回干净的可读文本
 */
export async function cleanContentWithAI(
  rawContent: string,
  apiKey: string,
  baseUrl: string | null
): Promise<string> {
  try {
    // 如果内容已经很干净，直接返回
    if (!needsAICleaning(rawContent)) {
      return rawContent
    }

    const response = await fetch(`${baseUrl || 'https://api.openai.com'}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-v3.1',
        messages: [
          { 
            role: 'system', 
            content: `你是一个文本清理助手。用户会给你一段可能包含HTML残留、乱码或格式混乱的文本。
请执行以下清理：
1. 移除所有HTML标签、CSS代码、JavaScript代码
2. 移除乱码和无意义的符号序列
3. 保留有意义的中英文内容
4. 适当分段，使文本易于阅读
5. 只返回清理后的纯文本，不要添加任何解释

如果内容是论坛帖子，保持回复的结构。
如果内容是文章，保持标题和段落结构。` 
          },
          { role: 'user', content: `请清理以下文本：\n\n${rawContent.slice(0, 3000)}` },
        ],
        max_tokens: 1000,
        temperature: 0.1,
      }),
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    const cleanedContent = data.choices[0]?.message?.content?.trim()
    
    return cleanedContent || rawContent
  } catch (error) {
    console.error('[AI Cleaner] Failed:', error)
    return rawContent
  }
}

/**
 * 检测内容是否是加密/乱码内容（不应该显示）
 */
export function isGarbageContent(content: string): boolean {
  if (!content || content.length < 50) return true
  
  // 检测 WAF/加密标记 - 更宽松的匹配
  if (/_waf_|waf_bd|"_waf|_waf"/i.test(content)) {
    console.log('[Smart Lens] Detected WAF encrypted content')
    return true
  }
  
  // 检测 JSON 格式的加密内容
  if (/^\s*\{.*"_?\w+_?\w*":\s*"[A-Za-z0-9+/=]{20,}"/.test(content)) {
    console.log('[Smart Lens] Detected JSON encrypted content')
    return true
  }
  
  // 检测 Base64 风格的乱码（大量随机字符+数字+特殊符号）
  const base64Pattern = /[A-Za-z0-9+/=]{50,}/
  if (base64Pattern.test(content)) {
    // 如果大部分内容都是 base64 风格
    const matches = content.match(/[A-Za-z0-9+/=]{20,}/g) || []
    const totalMatchLength = matches.reduce((sum, m) => sum + m.length, 0)
    if (totalMatchLength > content.length * 0.3) {
      console.log('[Smart Lens] Detected Base64 garbage content')
      return true
    }
  }
  
  // 检测中文占比过低（对于中文网站）
  const chineseChars = (content.match(/[\u4e00-\u9fff]/g) || []).length
  const alphanumeric = (content.match(/[a-zA-Z0-9]/g) || []).length
  // 如果字母数字远多于中文，且没有意义的英文单词，可能是乱码
  if (alphanumeric > 100 && chineseChars < 10) {
    // 检查是否包含常见英文单词
    const hasEnglishWords = /\b(the|is|are|was|were|have|has|will|would|can|could|this|that|with|from|for|and|but|not)\b/i.test(content)
    if (!hasEnglishWords) {
      console.log('[Smart Lens] Detected low Chinese ratio garbage')
      return true
    }
  }
  
  // 检测大量连续非可读字符
  if (/[^\w\s\u4e00-\u9fff，。！？、；：""''（）【】《》—…·\n]{30,}/.test(content)) {
    console.log('[Smart Lens] Detected long non-readable sequence')
    return true
  }
  
  return false
}

/**
 * 检测内容是否需要 AI 清理
 */
function needsAICleaning(content: string): boolean {
  // 检测 HTML 标签残留
  if (/<[a-z][\s\S]*>/i.test(content)) return true
  // 检测 CSS/JS 代码
  if (/\{[\s\S]*:\s*[\s\S]*\}/.test(content)) return true
  // 检测大量连续特殊字符
  if (/[^\w\s\u4e00-\u9fff]{10,}/.test(content)) return true
  // 检测 HTML 实体
  if (/&[a-z]+;|&#\d+;/i.test(content)) return true
  
  return false
}

/**
 * 生成结构化 AI 分析
 */
export async function generateStructuredAnalysis(
  content: string,
  contentType: ContentType,
  apiKey: string,
  baseUrl: string | null,
  pageContext?: string // 当前页面上下文（可选）
): Promise<AIAnalysisResult | null> {
  try {
    const systemPrompt = buildSystemPrompt(contentType)
    const userPrompt = buildUserPrompt(content, contentType, pageContext)

    const response = await fetch(`${baseUrl || 'https://api.openai.com'}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-v3.1',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 600,
        temperature: 0.3,
      }),
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    return parseAIResponse(data.choices[0]?.message?.content, contentType)
  } catch (error) {
    console.error('AI analysis failed:', error)
    return null
  }
}

/**
 * 构建系统提示词
 */
function buildSystemPrompt(contentType: ContentType): string {
  return `你是一个浏览器智能链接预览助手。你的任务是分析网页内容并生成结构化的预览数据。

请严格按照以下规则：
1. 分析内容类型并提取关键信息
2. 输出格式必须是纯 JSON，不要包含 Markdown 代码块标记
3. 保持简洁，每个字段不超过100字
4. 使用中文回答

内容类型特定规则：
- Article/News: 提取核心要点(keyPoints)、阅读时间(readingTime)、时效性(freshness)
- Product: 提取主题(topic)、关键要点(keyPoints)
- Repository: 提取技术栈(techStack)、关键功能(keyPoints)
- Forum/Discussion: 提取问题和答案摘要，使用 keyPoints
- Video: 提取看点(keyPoints)、难度(difficulty)
- Documentation: 提取主题(topic)、难度(difficulty)、适用场景

JSON 输出结构：
{
  "type": "news|tutorial|documentation|repository|product|discussion|video|social|general",
  "summary": "一句话总结（不超过50字）",
  "confidence": 0.9,
  "meta": {
    "keyPoints": ["要点1", "要点2", "要点3"],
    "topic": "主题分类",
    "sentiment": "positive|negative|neutral",
    "techStack": ["tech1", "tech2"],
    "actionItems": ["建议操作1"],
    "readingTime": "5分钟",
    "difficulty": "beginner|intermediate|advanced",
    "freshness": "breaking|recent|dated|evergreen"
  }
}`
}

/**
 * 构建用户提示词
 */
function buildUserPrompt(content: string, contentType: ContentType, pageContext?: string): string {
  let prompt = ''

  if (pageContext) {
    prompt += `用户当前正在阅读的页面上下文：
${pageContext.slice(0, 500)}

请结合上下文，分析以下目标链接内容，重点关注与用户当前阅读内容相关的部分。

---

`
  }

  prompt += `请分析以下 ${getContentTypeLabel(contentType)} 内容并返回 JSON：

${content.slice(0, 3000)}`

  return prompt
}

/**
 * 获取内容类型的中文标签
 */
function getContentTypeLabel(type: ContentType): string {
  const labels: Record<ContentType, string> = {
    article: '文章',
    video: '视频',
    repository: '代码仓库',
    product: '商品',
    forum: '论坛讨论',
    social: '社交媒体',
    news: '新闻',
    documentation: '文档',
  }
  return labels[type] || '网页'
}

/**
 * 解析 AI 返回的 JSON
 */
function parseAIResponse(rawOutput: string | undefined, contentType: ContentType): AIAnalysisResult | null {
  if (!rawOutput) return null

  try {
    // 尝试清理可能的 Markdown 代码块
    let jsonStr = rawOutput.trim()
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.slice(7)
    }
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.slice(3)
    }
    if (jsonStr.endsWith('```')) {
      jsonStr = jsonStr.slice(0, -3)
    }
    jsonStr = jsonStr.trim()

    const parsed = JSON.parse(jsonStr)

    // 映射类型
    const mappedType = CONTENT_TYPE_MAP[contentType] || 'general'

    // 验证和规范化输出
    return {
      type: parsed.type || mappedType,
      summary: parsed.summary || '',
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.8,
      meta: {
        keyPoints: parsed.meta?.keyPoints || [],
        topic: parsed.meta?.topic,
        sentiment: parsed.meta?.sentiment,
        techStack: parsed.meta?.techStack,
        actionItems: parsed.meta?.actionItems,
        relevance: parsed.meta?.relevance,
        readingTime: parsed.meta?.readingTime,
        difficulty: parsed.meta?.difficulty,
        freshness: parsed.meta?.freshness,
      },
      raw: rawOutput,
    }
  } catch (error) {
    console.error('Failed to parse AI response:', error)
    
    // 降级：将原始输出作为摘要
    const mappedType = CONTENT_TYPE_MAP[contentType] || 'general'
    return {
      type: mappedType,
      summary: rawOutput.slice(0, 200),
      confidence: 0.5,
      meta: {},
      raw: rawOutput,
    }
  }
}

/**
 * 将 AI 分析结果转换为 Markdown 格式（用于显示）
 */
export function formatAnalysisAsMarkdown(result: AIAnalysisResult): string {
  let md = ''

  // 摘要
  if (result.summary) {
    md += `${result.summary}\n\n`
  }

  // 关键要点
  if (result.meta.keyPoints && result.meta.keyPoints.length > 0) {
    md += `**要点:**\n`
    result.meta.keyPoints.forEach((point: string) => {
      md += `• ${point}\n`
    })
    md += '\n'
  }

  // 技术栈（适用于技术内容）
  if (result.meta.techStack && result.meta.techStack.length > 0) {
    md += `**技术栈:** ${result.meta.techStack.join(', ')}\n\n`
  }

  // 建议操作
  if (result.meta.actionItems && result.meta.actionItems.length > 0) {
    md += `**建议:**\n`
    result.meta.actionItems.forEach((item: string) => {
      md += `→ ${item}\n`
    })
    md += '\n'
  }

  // 底部信息
  const footerParts: string[] = []
  
  if (result.meta.readingTime) {
    footerParts.push(`⏱️ ${result.meta.readingTime}`)
  }
  
  if (result.meta.difficulty) {
    const difficultyLabels = {
      beginner: '入门',
      intermediate: '中级',
      advanced: '高级'
    }
    footerParts.push(`📊 ${difficultyLabels[result.meta.difficulty]}`)
  }
  
  if (result.meta.sentiment) {
    const sentimentEmoji = {
      positive: '👍',
      negative: '👎',
      neutral: '😐'
    }
    footerParts.push(sentimentEmoji[result.meta.sentiment])
  }
  
  if (result.meta.freshness) {
    const freshnessLabels = {
      breaking: '🔴 最新',
      recent: '🟡 近期',
      dated: '⚪ 旧文',
      evergreen: '🟢 经典'
    }
    footerParts.push(freshnessLabels[result.meta.freshness])
  }
  
  if (footerParts.length > 0) {
    md += footerParts.join(' · ')
  }

  // 关联分析
  if (result.meta.relevance) {
    md += `\n\n---\n💡 **关联:** ${result.meta.relevance}`
  }

  return md.trim()
}
