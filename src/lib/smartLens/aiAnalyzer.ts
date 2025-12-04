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
