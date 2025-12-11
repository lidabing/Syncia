/**
 * Page Vision Background Handler
 * 
 * Handles page vision analysis requests from content script
 * Manages screenshot capture and AI analysis
 */

import { analyzePageWithVision, compressImage, detectSensitiveContent } from '../../../lib/pageVision/visionAnalyzer'
import type { PageVisionResult, PageVisionSettings } from '../../../config/settings/pageVision'
import { DEFAULT_PAGE_VISION_SETTINGS } from '../../../config/settings/pageVision'

// 分析结果缓存
const analysisCache = new Map<string, { result: PageVisionResult; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 分钟

/**
 * 获取缓存的分析结果
 */
function getCachedAnalysis(url: string, cacheDuration: number): PageVisionResult | null {
  const cached = analysisCache.get(url)
  const ttl = cacheDuration * 60 * 1000
  
  if (cached && Date.now() - cached.timestamp < ttl) {
    console.log('[PageVision] Cache hit for:', url)
    return cached.result
  }
  
  if (cached) {
    analysisCache.delete(url)
  }
  
  return null
}

/**
 * 缓存分析结果
 */
function cacheAnalysis(url: string, result: PageVisionResult): void {
  // 清理过期缓存
  if (analysisCache.size > 50) {
    const now = Date.now()
    for (const [key, value] of analysisCache) {
      if (now - value.timestamp > CACHE_TTL) {
        analysisCache.delete(key)
      }
    }
  }
  
  analysisCache.set(url, { result, timestamp: Date.now() })
}

/**
 * 捕获当前标签页截图
 */
async function captureTabScreenshot(tabId: number, settings: PageVisionSettings): Promise<string | null> {
  try {
    // 获取当前活动窗口
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    const windowId = tab?.windowId
    
    if (!windowId) {
      console.warn('[PageVision] No active window found')
      return null
    }
    
    // 使用 chrome.tabs.captureVisibleTab 获取截图
    const screenshotDataUrl = await chrome.tabs.captureVisibleTab(windowId, {
      format: 'jpeg',
      quality: 80,
    })
    
    console.log('[PageVision] Screenshot captured, size:', screenshotDataUrl.length)
    
    // 如果启用压缩，压缩图片
    if (settings.compressImage) {
      // 在 service worker 中不能使用 Image 和 Canvas
      // 直接返回原始截图，压缩在 content script 中处理
      return screenshotDataUrl
    }
    
    return screenshotDataUrl
  } catch (error) {
    console.error('[PageVision] Screenshot capture failed:', error)
    return null
  }
}

/**
 * 设置页面视觉分析监听器
 */
export function setupPageVisionListener() {
  console.log('[PageVision] Setting up background listener')
  
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // 捕获截图请求
    if (message.action === 'page-vision-capture-screenshot') {
      const tabId = sender.tab?.id
      
      if (!tabId) {
        console.error('[PageVision] No tab ID available')
        sendResponse({ error: 'No tab ID' })
        return true
      }
      
      captureTabScreenshot(tabId, message.settings || DEFAULT_PAGE_VISION_SETTINGS)
        .then((screenshot) => {
          sendResponse({ screenshot })
        })
        .catch((error) => {
          console.error('[PageVision] Capture error:', error)
          sendResponse({ error: error.message })
        })
      
      return true
    }
    
    // 完整分析请求
    if (message.action === 'page-vision-analyze') {
      handleAnalyzeRequest(message, sender)
        .then((result) => sendResponse(result))
        .catch((error) => {
          console.error('[PageVision] Analysis error:', error)
          sendResponse({ error: error.message })
        })
      
      return true
    }
    
    // 清除缓存请求
    if (message.action === 'page-vision-clear-cache') {
      if (message.url) {
        analysisCache.delete(message.url)
      } else {
        analysisCache.clear()
      }
      sendResponse({ success: true })
      return true
    }
  })
}

/**
 * 处理分析请求
 */
async function handleAnalyzeRequest(
  message: any,
  sender: chrome.runtime.MessageSender
): Promise<PageVisionResult | { error: string }> {
  const { 
    pageTitle, 
    pageUrl, 
    pageContent,
    screenshot,
    forceRefresh = false 
  } = message
  
  console.log('[PageVision] Analyze request:', { pageTitle, pageUrl, hasScreenshot: !!screenshot })
  
  // 获取设置
  const settingsData = await chrome.storage.sync.get('SETTINGS')
  const settings: PageVisionSettings = settingsData.SETTINGS?.pageVision || DEFAULT_PAGE_VISION_SETTINGS
  const chatSettings = settingsData.SETTINGS?.chat
  
  // 验证 API 配置
  if (!chatSettings?.openAIKey) {
    return { error: 'API Key not configured' }
  }
  
  // 检查敏感内容
  if (settings.sensitiveContentWarning) {
    const isSensitive = detectSensitiveContent(pageTitle, pageUrl, pageContent)
    if (isSensitive) {
      console.log('[PageVision] Sensitive content detected')
      // 不阻止分析，但在结果中标记
    }
  }
  
  // 检查缓存
  if (settings.cacheResults && !forceRefresh) {
    const cached = getCachedAnalysis(pageUrl, settings.cacheDuration)
    if (cached) {
      return cached
    }
  }
  
  // 执行分析
  let screenshotToUse = screenshot
  
  // 如果没有提供截图但设置要求使用截图，尝试捕获
  if (!screenshotToUse && settings.useScreenshot && sender.tab?.id) {
    screenshotToUse = await captureTabScreenshot(sender.tab.id, settings)
  }
  
  const result = await analyzePageWithVision(
    screenshotToUse,
    pageTitle,
    pageUrl,
    chatSettings.openAIKey,
    chatSettings.openAiBaseUrl || null,
    chatSettings.model || 'gpt-4o',
    pageContent?.slice(0, 2000) // 额外文本上下文
  )
  
  // 缓存结果
  if (settings.cacheResults) {
    cacheAnalysis(pageUrl, result)
  }
  
  return result
}
