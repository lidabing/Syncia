/**
 * Smart Lens Background Script Handler
 * Handles link preview fetching to avoid CORS issues
 * 
 * 架构：Fetch -> Clean -> Analyze 流水线
 */

import { parseOpenGraph, generateAISummary } from '../../../lib/smartLens/contentFetcher'
import { cleanHtmlContent, detectContentType } from '../../../lib/smartLens/contentCleaner'
import { fetchWithPlatformAdapter } from '../../../lib/smartLens/platformAdapters'
import { generateStructuredAnalysis, formatAnalysisAsMarkdown } from '../../../lib/smartLens/aiAnalyzer'
import type { LinkPreviewData } from '../../../config/settings/smartLens'

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
        
        return previewData
      }
    }

    // Step 2: 抓取 HTML（带超时）
    console.log('[Smart Lens] Fetching HTML...')
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10秒超时
    
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

      html = await response.text()
      console.log('[Smart Lens] HTML fetched, length:', html.length)
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
    console.log('[Smart Lens] Cleaning content...')
    const cleanedContent = cleanHtmlContent(html, url)
    console.log('[Smart Lens] Cleaned content length:', cleanedContent.content.length, 'replies:', cleanedContent.replies || 0)
    
    // 将清洗后的文本内容添加到预览数据
    if (cleanedContent.content.length > 100) {
      previewData.textContent = cleanedContent.content
    }

    console.log('[Smart Lens] Basic preview data ready, title:', previewData.title)

    // Step 7: AI 分析（如果启用）- 限制超时时间
    const settings = await chrome.storage.sync.get('SETTINGS')
    if (settings.SETTINGS?.smartLens?.enableAISummary && settings.SETTINGS?.chat?.openAIKey) {
      try {
        if (cleanedContent.content.length > 200) {
          console.log('[Smart Lens] Starting AI analysis...')
          
          // 构建 AI 分析的输入
          const analysisInput = `
标题: ${cleanedContent.title || previewData.title || ''}
URL: ${url}

${cleanedContent.content.slice(0, 3000)}
          `.trim()

          // 尝试结构化分析（带超时）
          const aiPromise = generateStructuredAnalysis(
            analysisInput,
            contentType,
            settings.SETTINGS.chat.openAIKey,
            settings.SETTINGS.chat.openAiBaseUrl,
            pageContext
          )
          
          // AI 分析超时 8 秒
          const aiResult = await Promise.race([
            aiPromise,
            new Promise<null>((resolve) => setTimeout(() => {
              console.log('[Smart Lens] AI analysis timeout')
              resolve(null)
            }, 8000))
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
    }

    console.log('[Smart Lens] Returning preview data')
    return previewData
  } catch (error) {
    console.error('[Smart Lens] Failed to fetch preview:', error)
    return null
  }
}
