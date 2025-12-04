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
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'smart-lens-fetch-preview') {
      handleFetchPreview(message.url, message.pageContext)
        .then(sendResponse)
        .catch((error) => {
          console.error('Smart Lens fetch error:', error)
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

    // Step 2: 抓取 HTML
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    html = await response.text()
    
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

    // Step 6: AI 分析（如果启用）
    const settings = await chrome.storage.sync.get('SETTINGS')
    if (settings.SETTINGS?.smartLens?.enableAISummary && settings.SETTINGS?.chat?.openAIKey) {
      try {
        // 使用清洗后的内容
        const cleanedContent = cleanHtmlContent(html)
        console.log('[Smart Lens] Cleaned content length:', cleanedContent.content.length)

        if (cleanedContent.content.length > 200) {
          // 构建 AI 分析的输入
          const analysisInput = `
标题: ${cleanedContent.title || previewData.title || ''}
URL: ${url}

${cleanedContent.content}
          `.trim()

          // 尝试结构化分析
          const aiResult = await generateStructuredAnalysis(
            analysisInput,
            contentType,
            settings.SETTINGS.chat.openAIKey,
            settings.SETTINGS.chat.openAiBaseUrl,
            pageContext
          )

          if (aiResult) {
            previewData.aiSummary = formatAnalysisAsMarkdown(aiResult)
            previewData.aiAnalysis = aiResult
            console.log('[Smart Lens] AI analysis complete:', aiResult.type, aiResult.confidence)
          } else {
            // 降级到简单摘要
            const summary = await generateAISummary(
              cleanedContent.content,
              settings.SETTINGS.chat.openAIKey,
              settings.SETTINGS.chat.openAiBaseUrl,
              previewData.type
            )
            previewData.aiSummary = summary
          }
        }
      } catch (error) {
        console.error('Failed to generate AI analysis:', error)
        // Continue without AI
      }
    }

    return previewData
  } catch (error) {
    console.error('Failed to fetch preview:', error)
    return null
  }
}
