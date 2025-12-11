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
 * @param windowId - 窗口 ID（不是 tab ID！）
 * @param settings - Page Vision 设置
 */
async function captureTabScreenshot(windowId: number, settings: PageVisionSettings): Promise<string | null> {
  try {
    if (!windowId) {
      console.error('[PageVision] No window ID provided')
      return null
    }
    
    console.log('[PageVision] Starting screenshot capture for window:', windowId)
    
    // 使用 chrome.tabs.captureVisibleTab 获取截图
    const screenshotDataUrl = await chrome.tabs.captureVisibleTab(windowId, {
      format: 'jpeg',
      quality: 50,
    })
    
    if (!screenshotDataUrl) {
      console.error('[PageVision] Screenshot capture returned null')
      return null
    }
    
    console.log('[PageVision] Screenshot captured successfully, size:', screenshotDataUrl.length, 'chars')
    
    return screenshotDataUrl
  } catch (error) {
    console.error('[PageVision] Screenshot capture exception:', error)
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
      console.log('[PageVision] Received screenshot capture request from tab:', sender.tab?.id)
      
      // 优先使用 sender.tab.windowId，如果不存在则查询当前活动标签页
      let windowId = sender.tab?.windowId
      
      if (!windowId) {
        console.log('[PageVision] No windowId from sender, querying active tab...')
        // 异步处理，查询当前活动标签页
        chrome.tabs.query({ active: true, currentWindow: true })
          .then(async (tabs) => {
            if (!tabs[0]?.windowId) {
              console.error('[PageVision] No active tab found')
              sendResponse({ error: 'No active window' })
              return
            }
            
            console.log('[PageVision] Using active tab windowId:', tabs[0].windowId)
            const screenshot = await captureTabScreenshot(tabs[0].windowId, message.settings || DEFAULT_PAGE_VISION_SETTINGS)
            
            if (screenshot) {
              try {
                console.log('[PageVision] Storing screenshot in chrome.storage.local...')
                await chrome.storage.local.set({ 'temp_page_vision_screenshot': screenshot })
                console.log('[PageVision] Screenshot stored successfully')
                sendResponse({ success: true, stored: true })
              } catch (e) {
                console.error('[PageVision] Storage error:', e)
                sendResponse({ error: 'Storage failed: ' + String(e) })
              }
            } else {
              console.error('[PageVision] Screenshot is null, capture failed')
              sendResponse({ error: 'Capture failed' })
            }
          })
          .catch((error) => {
            console.error('[PageVision] Query tabs error:', error)
            sendResponse({ error: error?.message || 'Failed to query tabs' })
          })
        
        return true
      }
      
      console.log('[PageVision] Calling captureTabScreenshot with windowId:', windowId)
      
      captureTabScreenshot(windowId, message.settings || DEFAULT_PAGE_VISION_SETTINGS)
        .then(async (screenshot) => {
          console.log('[PageVision] Screenshot capture result:', screenshot ? `${screenshot.length} chars` : 'null')
          
          if (screenshot) {
            // 使用 storage 传输以避免消息端口关闭错误
            try {
              console.log('[PageVision] Storing screenshot in chrome.storage.local...')
              await chrome.storage.local.set({ 'temp_page_vision_screenshot': screenshot })
              console.log('[PageVision] Screenshot stored successfully')
              sendResponse({ success: true, stored: true })
            } catch (e) {
              console.error('[PageVision] Storage error:', e)
              // 如果 storage 也失败，返回错误
              sendResponse({ error: 'Storage failed: ' + String(e) })
            }
          } else {
            console.error('[PageVision] Screenshot is null, capture failed')
            sendResponse({ error: 'Capture failed' })
          }
        })
        .catch((error) => {
          console.error('[PageVision] Capture promise rejected:', error)
          sendResponse({ error: error?.message || 'Unknown capture error' })
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
  if (!screenshotToUse && settings.useScreenshot) {
    // 优先使用 sender.tab.windowId，如果不存在则查询当前活动标签页
    let windowId = sender.tab?.windowId
    
    if (!windowId) {
      console.log('[PageVision] No windowId in sender, querying active tab for screenshot...')
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
      windowId = tabs[0]?.windowId
    }
    
    if (windowId) {
      console.log('[PageVision] Attempting to capture screenshot with windowId:', windowId)
      screenshotToUse = await captureTabScreenshot(windowId, settings)
    } else {
      console.warn('[PageVision] No windowId available, skipping screenshot capture')
    }
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
