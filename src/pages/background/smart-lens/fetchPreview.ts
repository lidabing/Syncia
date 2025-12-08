/**
 * Smart Lens Background Script Handler
 * Handles link preview fetching to avoid CORS issues
 * 
 * 架构：Fetch -> Clean -> Analyze 流水线
 * 优化：缓存 + 快速返回 + 并行处理
 */

import { parseOpenGraph, generateAISummary } from '../../../lib/smartLens/contentFetcher'
import { cleanHtmlContent, detectContentType } from '../../../lib/smartLens/contentCleaner'
import { fetchWithPlatformAdapter } from '../../../lib/smartLens/platformAdapters'
import { generateStructuredAnalysis, formatAnalysisAsMarkdown, cleanContentWithAI, isGarbageContent } from '../../../lib/smartLens/aiAnalyzer'
import type { LinkPreviewData } from '../../../config/settings/smartLens'

// 简单的内存缓存（最多100个条目，5分钟过期）
const previewCache = new Map<string, { data: LinkPreviewData; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5分钟
const MAX_CACHE_SIZE = 100

function getCachedPreview(url: string): LinkPreviewData | null {
  const cached = previewCache.get(url)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log('[Smart Lens] Cache hit for:', url)
    return cached.data
  }
  if (cached) {
    previewCache.delete(url) // 过期删除
  }
  return null
}

function setCachedPreview(url: string, data: LinkPreviewData): void {
  // 清理过期缓存
  if (previewCache.size >= MAX_CACHE_SIZE) {
    const now = Date.now()
    for (const [key, value] of previewCache) {
      if (now - value.timestamp >= CACHE_TTL) {
        previewCache.delete(key)
      }
    }
    // 如果还是太多，删除最老的
    if (previewCache.size >= MAX_CACHE_SIZE) {
      const firstKey = previewCache.keys().next().value
      if (firstKey) previewCache.delete(firstKey)
    }
  }
  previewCache.set(url, { data, timestamp: Date.now() })
}

export function setupSmartLensListener() {
  console.log('[Smart Lens] Setting up background listener')
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'smart-lens-fetch-preview') {
      console.log('[Smart Lens] Background received message for:', message.url)
      handleFetchPreview(message.url, message.pageContext)
        .then((result) => {
          console.log('[Smart Lens] Sending response back, success:', !!result)
          sendResponse(result)
        })
        .catch((error) => {
          console.error('[Smart Lens] Background fetch error:', error)
          sendResponse(null)
        })
      return true // Keep the message channel open for async response
    }
  })
}

async function handleFetchPreview(url: string, pageContext?: string): Promise<LinkPreviewData | null> {
  try {
    console.log('[Smart Lens] Fetching preview for:', url)
    
    // 检查缓存
    const cached = getCachedPreview(url)
    if (cached) {
      return cached
    }
    
    // Step 1: 尝试使用平台专用 API
    const hostname = new URL(url).hostname.toLowerCase()
    let html = ''
    
    // 对于某些平台，先尝试 API
    if (hostname.includes('github.com')) {
      const platformData = await fetchWithPlatformAdapter(url, '')
      if (platformData) {
        console.log('[Smart Lens] Using GitHub API data')
        const previewData = platformData as LinkPreviewData
        
        // 如果启用了 AI 分析，使用结构化分析
        const settings = await chrome.storage.sync.get('SETTINGS')
        if (settings.SETTINGS?.smartLens?.enableAISummary && settings.SETTINGS?.chat?.openAIKey) {
          const aiResult = await generateStructuredAnalysis(
            platformData.textContent || '',
            'repository',
            settings.SETTINGS.chat.openAIKey,
            settings.SETTINGS.chat.openAiBaseUrl,
            pageContext
          )
          if (aiResult) {
            previewData.aiSummary = formatAnalysisAsMarkdown(aiResult)
            previewData.aiAnalysis = aiResult
          }
        }
        
        setCachedPreview(url, previewData)
        return previewData
      }
    }

    // Step 2: 抓取 HTML（带超时，缩短到 5 秒）
    console.log('[Smart Lens] Fetching HTML...')
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5秒超时
    
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        },
        signal: controller.signal,
      })
      
      clearTimeout(timeoutId)

      if (!response.ok) {
        console.error('[Smart Lens] HTTP error:', response.status)
        throw new Error(`HTTP ${response.status}`)
      }

      // 只读取前 100KB，避免处理过大的页面
      const reader = response.body?.getReader()
      if (reader) {
        const chunks: Uint8Array[] = []
        let totalSize = 0
        const maxSize = 100 * 1024 // 100KB
        
        while (totalSize < maxSize) {
          const { done, value } = await reader.read()
          if (done) break
          chunks.push(value)
          totalSize += value.length
        }
        reader.cancel() // 取消剩余读取
        
        const decoder = new TextDecoder('utf-8')
        html = chunks.map(chunk => decoder.decode(chunk, { stream: true })).join('')
        console.log('[Smart Lens] HTML fetched (limited), length:', html.length)
      } else {
        html = await response.text()
        // 截断过长的 HTML
        if (html.length > 150000) {
          html = html.slice(0, 150000)
        }
        console.log('[Smart Lens] HTML fetched, length:', html.length)
      }
    } catch (fetchError) {
      clearTimeout(timeoutId)
      if ((fetchError as Error).name === 'AbortError') {
        console.error('[Smart Lens] Fetch timeout')
        // 返回基本信息
        return {
          type: 'generic',
          url,
          title: new URL(url).hostname,
          description: '加载超时，请点击链接直接访问',
        }
      }
      throw fetchError
    }
    
    // Step 3: 检测内容类型
    const contentType = detectContentType(url, html)
    console.log('[Smart Lens] Detected content type:', contentType)

    // Step 4: 尝试平台专用适配器（需要 HTML）
    const platformData = await fetchWithPlatformAdapter(url, html)
    
    // Step 5: 解析 Open Graph 作为基础数据
    const previewData = parseOpenGraph(html, url)
    
    // 合并平台数据
    if (platformData) {
      Object.assign(previewData, platformData)
    }
    
    // 更新内容类型（使用更准确的检测结果）
    if (contentType !== 'article') {
      previewData.type = contentType as LinkPreviewData['type']
    }

    // Step 6: 内容清洗和文本提取（传递 URL 用于论坛特殊处理）
    console.log('[Smart Lens] ====== Step 6: Content Cleaning ======')
    console.log('[Smart Lens] Input HTML length:', html.length)
    console.log('[Smart Lens] Input HTML preview:', html.slice(0, 300))
    
    const cleanedContent = cleanHtmlContent(html, url)
    
    console.log('[Smart Lens] Cleaned result:')
    console.log('[Smart Lens]   - title:', cleanedContent.title)
    console.log('[Smart Lens]   - content length:', cleanedContent.content.length)
    console.log('[Smart Lens]   - content preview:', cleanedContent.content.slice(0, 500))
    console.log('[Smart Lens]   - hasStructure:', cleanedContent.hasStructure)
    console.log('[Smart Lens]   - replies:', cleanedContent.replies || 0)
    
    // 检测是否是加密/乱码内容
    const isGarbage = isGarbageContent(cleanedContent.content)
    if (isGarbage) {
      console.log('[Smart Lens] Detected garbage/encrypted content, skipping text preview')
    }
    
    console.log('[Smart Lens] Basic preview data ready, title:', previewData.title)

    // Step 7: AI 处理（如果启用）
    const settings = await chrome.storage.sync.get('SETTINGS')
    if (settings.SETTINGS?.smartLens?.enableAISummary && settings.SETTINGS?.chat?.openAIKey) {
      try {
        // 只有非乱码内容才进行 AI 清理和显示
        if (cleanedContent.content.length > 100 && !isGarbage) {
          console.log('[Smart Lens] ====== Step 7a: AI Cleaning ======')
          console.log('[Smart Lens] Input to AI cleaning:', cleanedContent.content.slice(0, 300))
          const cleanedText = await Promise.race([
            cleanContentWithAI(
              cleanedContent.content.slice(0, 3000),
              settings.SETTINGS.chat.openAIKey,
              settings.SETTINGS.chat.openAiBaseUrl
            ),
            new Promise<string>((resolve) => setTimeout(() => resolve(cleanedContent.content), 4000))
          ])
          
          console.log('[Smart Lens] AI cleaned text length:', cleanedText.length)
          console.log('[Smart Lens] AI cleaned text preview:', cleanedText.slice(0, 500))
          
          // 再次检查清理后的内容是否是乱码
          const isCleanedGarbage = isGarbageContent(cleanedText)
          console.log('[Smart Lens] Is cleaned text garbage?', isCleanedGarbage)
          
          if (!isCleanedGarbage) {
            previewData.textContent = cleanedText.slice(0, 5000)
            console.log('[Smart Lens] Set textContent, length:', previewData.textContent.length)
          } else {
            console.log('[Smart Lens] Cleaned text is garbage, not setting textContent')
          }
        }
        
        // AI 结构化分析（即使内容是乱码，也尝试从标题分析）
        if (cleanedContent.content.length > 200 || previewData.title) {
          console.log('[Smart Lens] Starting AI analysis...')
          
          // 构建 AI 分析的输入
          const analysisInput = isGarbage 
            ? `标题: ${cleanedContent.title || previewData.title || ''}\nURL: ${url}\n\n（页面内容加密，仅根据标题和URL分析）`
            : `标题: ${cleanedContent.title || previewData.title || ''}\nURL: ${url}\n\n${previewData.textContent || cleanedContent.content.slice(0, 2000)}`

          // 尝试结构化分析（带超时）
          const aiPromise = generateStructuredAnalysis(
            analysisInput.trim(),
            contentType,
            settings.SETTINGS.chat.openAIKey,
            settings.SETTINGS.chat.openAiBaseUrl,
            pageContext
          )
          
          // AI 分析超时 5 秒（缩短以加快响应）
          const aiResult = await Promise.race([
            aiPromise,
            new Promise<null>((resolve) => setTimeout(() => {
              console.log('[Smart Lens] AI analysis timeout')
              resolve(null)
            }, 5000))
          ])

          if (aiResult) {
            previewData.aiSummary = formatAnalysisAsMarkdown(aiResult)
            previewData.aiAnalysis = aiResult
            console.log('[Smart Lens] AI analysis complete:', aiResult.type, aiResult.confidence)
          }
        }
      } catch (error) {
        console.error('[Smart Lens] Failed to generate AI analysis:', error)
        // Continue without AI
      }
    } else {
      // AI 未启用时，使用本地清理的内容（但跳过乱码）
      console.log('[Smart Lens] ====== AI Disabled, using local clean ======')
      console.log('[Smart Lens] Content length:', cleanedContent.content.length, 'isGarbage:', isGarbage)
      
      if (cleanedContent.content.length > 100 && !isGarbage) {
        const localCleaned = localCleanText(cleanedContent.content)
        console.log('[Smart Lens] Local cleaned length:', localCleaned.length)
        console.log('[Smart Lens] Local cleaned preview:', localCleaned.slice(0, 500))
        
        // 再次检查清理后的内容
        const isLocalGarbage = isGarbageContent(localCleaned)
        console.log('[Smart Lens] Is local cleaned garbage?', isLocalGarbage)
        
        if (!isLocalGarbage) {
          previewData.textContent = localCleaned
          console.log('[Smart Lens] Set textContent from local clean')
        } else {
          console.log('[Smart Lens] Local cleaned content is still garbage, skipping textContent')
        }
      }
    }
    
    // 最终保险检查：如果 textContent 仍然包含乱码，清除它
    console.log('[Smart Lens] ====== Final Check ======')
    console.log('[Smart Lens] Final textContent exists?', !!previewData.textContent)
    if (previewData.textContent) {
      console.log('[Smart Lens] Final textContent length:', previewData.textContent.length)
      console.log('[Smart Lens] Final textContent preview:', previewData.textContent.slice(0, 500))
      
      const isFinalGarbage = isGarbageContent(previewData.textContent)
      console.log('[Smart Lens] Is final textContent garbage?', isFinalGarbage)
      
      if (isFinalGarbage) {
        console.log('[Smart Lens] Final check: textContent is garbage, clearing it')
        previewData.textContent = undefined
      }
    }

    // 缓存结果
    setCachedPreview(url, previewData)
    
    console.log('[Smart Lens] Returning preview data')
    return previewData
  } catch (error) {
    console.error('[Smart Lens] Failed to fetch preview:', error)
    return null
  }
}

/**
 * 本地文本清理（不使用 AI）
 */
function localCleanText(text: string): string {
  return text
    // 移除 HTML 标签残留
    .replace(/<[^>]+>/g, ' ')
    // 移除 HTML 实体
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/&#\d+;/g, ' ')
    // 移除 CSS/JS 代码片段
    .replace(/\{[^}]*\}/g, ' ')
    .replace(/\[[^\]]*\]/g, ' ')
    // 移除连续特殊字符
    .replace(/[^\w\s\u4e00-\u9fff，。！？、；：""''（）【】《》—…·]+/g, ' ')
    // 压缩空白
    .replace(/\s+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, 5000)
}
