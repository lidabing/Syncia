/**
 * Page Vision Analyzer - 多模态页面分析模块
 * 
 * 使用视觉模型分析页面截图，推测用户意图
 */

import type { 
  PageVisionResult, 
  PageCategory, 
  UserIntent, 
  SuggestedAction,
  PageVisionSettings 
} from '../../config/settings/pageVision'
import { 
  ACTION_TEMPLATES, 
  SENSITIVE_KEYWORDS 
} from '../../config/settings/pageVision'

/**
 * 生成唯一 ID
 */
function generateActionId(): string {
  return Math.random().toString(36).substring(2, 10)
}

/**
 * 检测页面是否包含敏感内容
 */
export function detectSensitiveContent(
  title: string,
  url: string,
  textContent?: string
): boolean {
  const combinedText = `${title} ${url} ${textContent || ''}`.toLowerCase()
  
  return SENSITIVE_KEYWORDS.some(keyword => 
    combinedText.includes(keyword.toLowerCase())
  )
}

/**
 * 压缩图片到指定尺寸和质量
 */
export async function compressImage(
  base64Image: string,
  maxWidth: number,
  quality: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      let { width, height } = img
      
      // 计算缩放比例
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width)
        width = maxWidth
      }
      
      canvas.width = width
      canvas.height = height
      
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Failed to get canvas context'))
        return
      }
      
      ctx.drawImage(img, 0, 0, width, height)
      
      // 转换为 JPEG 格式并压缩
      const compressedBase64 = canvas.toDataURL('image/jpeg', quality)
      resolve(compressedBase64)
    }
    
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = base64Image
  })
}

/**
 * 构建多模态分析的系统提示词
 */
function buildVisionSystemPrompt(): string {
  return `你是一个智能浏览器助手，具备视觉分析能力。你的任务是：
1. 分析用户当前浏览的页面截图
2. 识别页面类型和内容
3. 推测用户可能的需求和意图
4. 提供精准、实用的操作建议

页面类别 (pageCategory):
- ecommerce: 电商/购物页面（商品详情、价格、评论等）
- coding: 代码/技术页面（GitHub、StackOverflow、IDE、终端等）
- article: 新闻/博客/文章（长文本内容）
- documentation: 技术文档（API文档、使用指南等）
- social: 社交媒体（微博、Twitter、论坛等）
- video: 视频平台（YouTube、B站等）
- dashboard: 数据面板/后台（图表、统计数据等）
- form: 表单/预订页面（需要填写信息）
- search: 搜索结果页
- general: 其他通用页面

用户意图 (userIntent):
- browsing: 随意浏览
- learning: 学习/研究
- debugging: 调试/解决问题
- shopping: 购物决策
- comparing: 比较分析
- reading: 深度阅读
- filling_form: 填写表单
- watching: 观看视频
- unknown: 无法确定

请严格按照 JSON 格式返回分析结果，不要包含任何其他文本。`
}

/**
 * 构建用户提示词
 */
function buildVisionUserPrompt(
  pageTitle: string,
  pageUrl: string,
  hasScreenshot: boolean,
  additionalContext?: string
): string {
  let prompt = `请分析这个网页${hasScreenshot ? '截图' : ''}并推测用户意图。

页面信息：
- 标题: ${pageTitle}
- URL: ${pageUrl}
${additionalContext ? `- 额外上下文: ${additionalContext}` : ''}

请返回以下 JSON 格式：
{
  "pageCategory": "string (从给定类别中选择)",
  "userIntent": "string (从给定意图中选择)",
  "reasoning": "string (用一句话解释你的推理过程)",
  "confidence": number (0-1 的置信度),
  "pageSummary": "string (页面一句话摘要，不超过50字)",
  "keyElements": ["string (识别到的关键元素，最多5个)"],
  "actions": [
    {
      "label": "string (按钮文字，4-8字)",
      "query": "string (发送给 AI 的详细提问)",
      "priority": number (1-5，越小越重要),
      "category": "primary | secondary | utility"
    }
  ],
  "metadata": {
    "detectedLanguage": "zh | en | other",
    "hasCode": boolean,
    "hasPricing": boolean,
    "hasForm": boolean,
    "hasVideo": boolean
  }
}

要求：
1. actions 必须提供 3-5 个实用操作建议
2. 每个 action 的 query 应该是完整的、可直接发送给 AI 的问题
3. 优先考虑用户最可能需要的操作
4. 基于具体页面内容定制建议，而非通用建议`

  return prompt
}

/**
 * 解析 AI 返回的 JSON 结果
 */
function parseVisionResponse(
  response: string,
  fallbackCategory: PageCategory = 'general'
): Partial<PageVisionResult> {
  try {
    // 尝试提取 JSON
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.warn('[PageVision] No JSON found in response')
      return { pageCategory: fallbackCategory }
    }

    const parsed = JSON.parse(jsonMatch[0])
    
    // 验证必要字段
    return {
      pageCategory: parsed.pageCategory || fallbackCategory,
      userIntent: parsed.userIntent || 'unknown',
      reasoning: parsed.reasoning || '',
      confidence: Math.min(1, Math.max(0, parsed.confidence || 0.5)),
      pageSummary: parsed.pageSummary || '',
      keyElements: Array.isArray(parsed.keyElements) ? parsed.keyElements.slice(0, 5) : [],
      actions: (parsed.actions || []).map((action: any) => ({
        id: generateActionId(),
        label: action.label || '操作',
        query: action.query || action.label,
        priority: action.priority || 3,
        category: action.category || 'secondary',
      })),
      metadata: parsed.metadata || {},
    }
  } catch (error) {
    console.error('[PageVision] Failed to parse response:', error)
    return { pageCategory: fallbackCategory }
  }
}

/**
 * 获取默认操作列表
 */
function getDefaultActions(category: PageCategory): SuggestedAction[] {
  const templates = ACTION_TEMPLATES[category] || ACTION_TEMPLATES.general
  
  return templates.map((template, index) => ({
    id: generateActionId(),
    label: template.label || '操作',
    query: template.query || template.label || '',
    priority: template.priority || index + 1,
    category: template.category || 'secondary',
  }))
}

/**
 * 检测模型是否支持视觉/多模态
 */
function isVisionCapableModel(model: string): boolean {
  const visionModels = [
    'gpt-4o', 'gpt-4o-mini', 'gpt-4-vision', 'gpt-4-turbo',
    'claude-3', 'claude-3.5', 'claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku',
    'gemini-1.5', 'gemini-pro-vision', 'gemini-2',
    'qwen-vl', 'qwen2-vl',
    'glm-4v',
    'deepseek-vl',
  ]
  
  const modelLower = model.toLowerCase()
  return visionModels.some(vm => modelLower.includes(vm.toLowerCase()))
}

/**
 * 使用多模态 AI 分析页面
 */
export async function analyzePageWithVision(
  screenshot: string | null,
  pageTitle: string,
  pageUrl: string,
  apiKey: string,
  baseUrl: string | null,
  model: string,
  additionalContext?: string
): Promise<PageVisionResult> {
  // 检查模型是否支持视觉
  const supportsVision = isVisionCapableModel(model)
  const useScreenshot = screenshot && supportsVision
  
  console.log('[PageVision] Starting analysis...', {
    hasScreenshot: !!screenshot,
    supportsVision,
    useScreenshot,
    model,
    pageTitle,
    url: pageUrl,
  })

  if (screenshot && !supportsVision) {
    console.warn(`[PageVision] Model "${model}" does not support vision. Falling back to text-only analysis.`)
    console.warn('[PageVision] Consider using a vision-capable model like gpt-4o, claude-3.5-sonnet, etc.')
  }

  const startTime = Date.now()

  try {
    const systemPrompt = buildVisionSystemPrompt()
    const userPrompt = buildVisionUserPrompt(pageTitle, pageUrl, !!useScreenshot, additionalContext)

    // 构建消息内容
    let userContent: any
    
    if (useScreenshot) {
      // 多模态格式：数组包含文本和图片
      const imageUrl = screenshot.startsWith('data:') 
        ? screenshot 
        : `data:image/jpeg;base64,${screenshot}`
      
      userContent = [
        { type: 'text', text: userPrompt },
        {
          type: 'image_url',
          image_url: { 
            url: imageUrl,
            detail: 'low'  // 使用低细节模式以节省 token
          },
        }
      ]
    } else {
      // 纯文本格式：直接使用字符串
      userContent = userPrompt
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 60000) // 60s timeout

    const response = await fetch(`${baseUrl || 'https://api.openai.com'}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model || 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent },
        ],
        max_tokens: 1000,
        temperature: 0.3,
      }),
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    const aiContent = data.choices[0]?.message?.content || ''
    
    console.log('[PageVision] AI response:', aiContent)

    const parsed = parseVisionResponse(aiContent)
    
    // 确保有操作建议
    let actions = parsed.actions || []
    if (actions.length === 0) {
      actions = getDefaultActions(parsed.pageCategory || 'general')
    }

    const result: PageVisionResult = {
      pageCategory: parsed.pageCategory || 'general',
      userIntent: parsed.userIntent || 'unknown',
      reasoning: parsed.reasoning || '页面分析完成',
      confidence: parsed.confidence || 0.7,
      pageSummary: parsed.pageSummary || `正在查看: ${pageTitle}`,
      keyElements: parsed.keyElements || [],
      actions,
      metadata: {
        ...parsed.metadata,
        sensitiveContent: detectSensitiveContent(pageTitle, pageUrl),
        visionModelUsed: supportsVision,
        modelName: model,
      },
      timestamp: Date.now(),
      screenshotUsed: !!useScreenshot,  // 仅当模型支持且有截图时为 true
      screenshotUrl: screenshot || undefined,
    }

    console.log('[PageVision] Analysis complete in', Date.now() - startTime, 'ms')
    return result

  } catch (error) {
    console.error('[PageVision] Analysis failed:', error)
    
    // 返回基于 URL 猜测的默认结果
    const guessedCategory = guessPageCategoryFromUrl(pageUrl)
    
    return {
      pageCategory: guessedCategory,
      userIntent: 'browsing',
      reasoning: '分析出错，使用默认建议',
      confidence: 0.3,
      pageSummary: pageTitle,
      keyElements: [],
      actions: getDefaultActions(guessedCategory),
      metadata: {
        sensitiveContent: detectSensitiveContent(pageTitle, pageUrl),
      },
      timestamp: Date.now(),
      screenshotUsed: !!screenshot,
    }
  }
}

/**
 * 根据 URL 猜测页面类别
 */
function guessPageCategoryFromUrl(url: string): PageCategory {
  const hostname = new URL(url).hostname.toLowerCase()
  const pathname = new URL(url).pathname.toLowerCase()
  
  // 电商
  if (/amazon|taobao|jd\.com|tmall|ebay|shopee|aliexpress/.test(hostname)) {
    return 'ecommerce'
  }
  
  // 代码/技术
  if (/github|gitlab|stackoverflow|codepen|codesandbox|replit/.test(hostname)) {
    return 'coding'
  }
  
  // 视频
  if (/youtube|bilibili|vimeo|youku|iqiyi/.test(hostname)) {
    return 'video'
  }
  
  // 社交
  if (/twitter|weibo|facebook|instagram|reddit|zhihu|douban/.test(hostname)) {
    return 'social'
  }
  
  // 文档
  if (/docs\.|documentation|wiki|readme|api\./.test(hostname) || 
      /\/docs\/|\/api\/|\/wiki\//.test(pathname)) {
    return 'documentation'
  }
  
  // 搜索
  if (/google\.com\/search|bing\.com\/search|baidu\.com\/s/.test(url)) {
    return 'search'
  }
  
  // 新闻/文章
  if (/medium|substack|ghost|wordpress|news|blog/.test(hostname)) {
    return 'article'
  }
  
  return 'general'
}

/**
 * 快速分析（不使用截图，基于页面文本）
 */
export async function quickPageAnalysis(
  pageTitle: string,
  pageUrl: string,
  pageContent: string,
  apiKey: string,
  baseUrl: string | null,
  model: string
): Promise<PageVisionResult> {
  console.log('[PageVision] Quick analysis (text only)...')
  
  // 截取前 3000 字符
  const truncatedContent = pageContent.slice(0, 3000)
  
  return analyzePageWithVision(
    null,
    pageTitle,
    pageUrl,
    apiKey,
    baseUrl,
    model,
    truncatedContent
  )
}
