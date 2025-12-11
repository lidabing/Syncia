/**
 * usePageVision Hook
 * 
 * 提供页面视觉识别功能的 React Hook
 * 支持截图分析、意图推测和操作建议
 */

import { useState, useCallback, useEffect, useRef } from 'react'
import type { 
  PageVisionResult, 
  PageVisionSettings, 
  SuggestedAction 
} from '../config/settings/pageVision'
import { DEFAULT_PAGE_VISION_SETTINGS } from '../config/settings/pageVision'
import { useSettings } from './useSettings'

interface UsePageVisionOptions {
  autoAnalyze?: boolean  // 是否自动分析
}

interface UsePageVisionReturn {
  // 状态
  result: PageVisionResult | null
  isAnalyzing: boolean
  error: Error | null
  hasAnalyzed: boolean
  
  // 操作
  analyzeCurrentPage: (forceRefresh?: boolean) => Promise<void>
  executeAction: (action: SuggestedAction) => void
  clearResult: () => void
  
  // 设置
  settings: PageVisionSettings
}

// 缓存分析结果
const resultCache = new Map<string, PageVisionResult>()

export function usePageVision(options: UsePageVisionOptions = {}): UsePageVisionReturn {
  const { autoAnalyze = false } = options
  const [settings] = useSettings()
  
  const [result, setResult] = useState<PageVisionResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [hasAnalyzed, setHasAnalyzed] = useState(false)
  const [currentUrl, setCurrentUrl] = useState('')
  
  const analysisRef = useRef(false)
  
  const pageVisionSettings: PageVisionSettings = {
    ...DEFAULT_PAGE_VISION_SETTINGS,
    ...settings.pageVision,
  }

  // 获取页面信息
  const getPageInfo = useCallback((): Promise<{ title: string; url: string; content: string }> => {
    return new Promise((resolve) => {
      const handleResponse = (event: MessageEvent) => {
        if (event.data.action === 'page-info-response') {
          window.removeEventListener('message', handleResponse)
          resolve({
            title: event.data.payload?.title || document.title,
            url: event.data.payload?.url || window.location.href,
            content: event.data.payload?.content || '',
          })
        }
      }

      window.addEventListener('message', handleResponse)
      window.parent.postMessage({ action: 'get-page-info' }, '*')

      // 超时处理
      setTimeout(() => {
        window.removeEventListener('message', handleResponse)
        resolve({
          title: document.title,
          url: window.location.href,
          content: '',
        })
      }, 3000)
    })
  }, [])

  // 请求截图
  const requestScreenshot = useCallback(async (): Promise<string | null> => {
    return new Promise((resolve) => {
      const handleResponse = (event: MessageEvent) => {
        if (event.data.action === 'screenshot-response') {
          window.removeEventListener('message', handleResponse)
          resolve(event.data.payload?.screenshot || null)
        }
      }

      window.addEventListener('message', handleResponse)
      window.parent.postMessage({ action: 'request-screenshot' }, '*')

      // 超时处理
      setTimeout(() => {
        window.removeEventListener('message', handleResponse)
        resolve(null)
      }, 5000)
    })
  }, [])

  // 分析当前页面
  const analyzeCurrentPage = useCallback(async (forceRefresh = false) => {
    if (analysisRef.current) {
      console.log('[usePageVision] Analysis already in progress')
      return
    }
    
    if (!pageVisionSettings.enabled) {
      console.log('[usePageVision] Page vision is disabled')
      return
    }

    analysisRef.current = true
    setIsAnalyzing(true)
    setError(null)
    
    try {
      // 获取页面信息
      const pageInfo = await getPageInfo()
      console.log('[usePageVision] Page info:', pageInfo)
      
      setCurrentUrl(pageInfo.url)
      
      // 检查缓存
      if (!forceRefresh && resultCache.has(pageInfo.url)) {
        const cached = resultCache.get(pageInfo.url)!
        const cacheAge = Date.now() - cached.timestamp
        const maxAge = pageVisionSettings.cacheDuration * 60 * 1000
        
        if (cacheAge < maxAge) {
          console.log('[usePageVision] Using cached result')
          setResult(cached)
          setHasAnalyzed(true)
          return
        }
      }
      
      // 请求截图
      let screenshot: string | null = null
      if (pageVisionSettings.useScreenshot) {
        console.log('[usePageVision] Requesting screenshot...')
        screenshot = await requestScreenshot()
        console.log('[usePageVision] Screenshot received:', !!screenshot)
      }
      
      // 发送分析请求到 background
      const response = await new Promise<PageVisionResult | { error: string }>((resolve) => {
        chrome.runtime.sendMessage(
          {
            action: 'page-vision-analyze',
            pageTitle: pageInfo.title,
            pageUrl: pageInfo.url,
            pageContent: pageInfo.content,
            screenshot,
            forceRefresh,
          },
          (response) => {
            if (chrome.runtime.lastError) {
              resolve({ error: chrome.runtime.lastError.message || 'Unknown error' })
            } else {
              resolve(response)
            }
          }
        )
      })
      
      if ('error' in response) {
        throw new Error(response.error)
      }
      
      console.log('[usePageVision] Analysis result:', response)
      
      // 缓存结果
      resultCache.set(pageInfo.url, response)
      
      setResult(response)
      setHasAnalyzed(true)
      
    } catch (err) {
      console.error('[usePageVision] Analysis failed:', err)
      setError(err as Error)
    } finally {
      setIsAnalyzing(false)
      analysisRef.current = false
    }
  }, [pageVisionSettings, getPageInfo, requestScreenshot])

  // 执行操作
  const executeAction = useCallback((action: SuggestedAction) => {
    console.log('[usePageVision] Executing action:', action)
    
    // 通过 postMessage 发送到父窗口，让 sidebar 处理
    window.parent.postMessage({
      action: 'execute-page-vision-action',
      payload: {
        query: action.query,
        label: action.label,
      },
    }, '*')
  }, [])

  // 清除结果
  const clearResult = useCallback(() => {
    setResult(null)
    setHasAnalyzed(false)
    setError(null)
    
    if (currentUrl) {
      resultCache.delete(currentUrl)
    }
  }, [currentUrl])

  // 监听 URL 变化
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.action === 'url-changed') {
        console.log('[usePageVision] URL changed, clearing result')
        setResult(null)
        setHasAnalyzed(false)
      }
    }
    
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  // 自动分析
  useEffect(() => {
    if (autoAnalyze && pageVisionSettings.autoAnalyze && !hasAnalyzed && !isAnalyzing) {
      // 延迟一下避免页面还没完全加载
      const timer = setTimeout(() => {
        analyzeCurrentPage()
      }, 1000)
      
      return () => clearTimeout(timer)
    }
  }, [autoAnalyze, pageVisionSettings.autoAnalyze, hasAnalyzed, isAnalyzing, analyzeCurrentPage])

  return {
    result,
    isAnalyzing,
    error,
    hasAnalyzed,
    analyzeCurrentPage,
    executeAction,
    clearResult,
    settings: pageVisionSettings,
  }
}
