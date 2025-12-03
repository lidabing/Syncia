/**
 * Smart Lens - Main Content Script
 * Implements the complete smart lens functionality
 */

import React, { useEffect, useState, useCallback } from 'react'
import ReactDOM from 'react-dom/client'
import { VisualCue, useSmartLensDetection, isPreviewableLink } from '../../../components/SmartLens/VisualCue'
import { PreviewCard } from '../../../components/SmartLens/PreviewCard'
import type { LinkPreviewData, SmartLensSettings } from '../../../config/settings/smartLens'
import { DEFAULT_SMART_LENS_SETTINGS } from '../../../config/settings/smartLens'
import { fetchLinkPreview, extractYouTubeData } from '../../../lib/smartLens/contentFetcher'

const SmartLens: React.FC = () => {
  // 默认启用，使用默认设置
  const [settings, setSettings] = useState<SmartLensSettings>({
    ...DEFAULT_SMART_LENS_SETTINGS,
    enabled: true, // 默认启用
  })
  const [previewData, setPreviewData] = useState<LinkPreviewData | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [previewPosition, setPreviewPosition] = useState({ x: 0, y: 0 })
  const [isPinned, setIsPinned] = useState(false)
  const [isHoveringCard, setIsHoveringCard] = useState(false)
  const [extensionInvalid, setExtensionInvalid] = useState(false)
  const [currentPreviewUrl, setCurrentPreviewUrl] = useState<string | null>(null)

  // Check if extension context is valid
  const checkExtensionContext = () => {
    try {
      return chrome.runtime?.id !== undefined
    } catch {
      return false
    }
  }

  // Load settings
  useEffect(() => {
    if (!checkExtensionContext()) {
      setExtensionInvalid(true)
      return
    }

    try {
      chrome.storage.sync.get('SETTINGS', (result) => {
        if (chrome.runtime.lastError) {
          console.warn('Extension context invalidated')
          setExtensionInvalid(true)
          return
        }
        if (result.SETTINGS?.smartLens) {
          // 合并设置，但确保 enabled 默认为 true（除非用户明确设置为 false）
          const storedSettings = result.SETTINGS.smartLens
          setSettings({
            ...DEFAULT_SMART_LENS_SETTINGS,
            ...storedSettings,
            // 如果用户没有明确禁用，默认启用
            enabled: storedSettings.enabled !== false,
          })
          console.log('[Smart Lens] Settings loaded:', storedSettings.enabled !== false ? 'enabled' : 'disabled')
        } else {
          console.log('[Smart Lens] No stored settings, using defaults with enabled=true')
        }
      })
    } catch (error) {
      console.warn('Failed to load settings:', error)
      setExtensionInvalid(true)
      return
    }

    // Listen for settings changes
    const listener = (changes: any) => {
      if (!checkExtensionContext()) {
        setExtensionInvalid(true)
        return
      }
      if (changes.SETTINGS?.newValue?.smartLens) {
        setSettings({
          ...DEFAULT_SMART_LENS_SETTINGS,
          ...changes.SETTINGS.newValue.smartLens,
        })
      }
    }
    
    try {
      chrome.storage.onChanged.addListener(listener)
    } catch (error) {
      console.warn('Failed to add storage listener:', error)
    }

    return () => {
      try {
        chrome.storage.onChanged.removeListener(listener)
      } catch {
        // Extension context already invalidated
      }
    }
  }, [])

  const { hoveredLink, cursorPosition, showCue } = useSmartLensDetection(settings)

  const loadPreviewData = useCallback(
    async (url: string) => {
      setLoading(true)
      setPreviewData(null)

      try {
        // Special handling for YouTube
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
          const ytData = extractYouTubeData(url)
          setPreviewData({
            url,
            ...ytData,
          } as LinkPreviewData)
        }

        // Fetch full preview data
        const data = await fetchLinkPreview(url)
        if (data) {
          setPreviewData(data)
        }
      } catch (error) {
        console.error('Failed to load preview:', error)
      } finally {
        setLoading(false)
      }
    },
    [settings]
  )

  // 使用 ref 来存储最新的 hoveredLink，避免闭包问题
  const hoveredLinkRef = React.useRef(hoveredLink)
  const cursorPositionRef = React.useRef(cursorPosition)
  const showPreviewRef = React.useRef(showPreview)
  const currentPreviewUrlRef = React.useRef(currentPreviewUrl)
  
  React.useEffect(() => {
    hoveredLinkRef.current = hoveredLink
    cursorPositionRef.current = cursorPosition
    showPreviewRef.current = showPreview
    currentPreviewUrlRef.current = currentPreviewUrl
  }, [hoveredLink, cursorPosition, showPreview, currentPreviewUrl])

  // 触发预览的函数
  const triggerPreview = useCallback(() => {
    const link = hoveredLinkRef.current
    if (!link || isPinned) return

    const url = link.href
    console.log('[Smart Lens] Triggering preview for:', url)
    if (!isPreviewableLink(url)) {
      console.log('[Smart Lens] URL not previewable')
      return
    }

    // 如果已经在预览同一个 URL，不重新加载
    if (showPreviewRef.current && currentPreviewUrlRef.current === url) return

    setPreviewPosition({ x: cursorPositionRef.current.x, y: cursorPositionRef.current.y })
    setShowPreview(true)
    setCurrentPreviewUrl(url)
    loadPreviewData(url)
  }, [isPinned, loadPreviewData])

  // Handle Space key and Shift key - 直接在按键事件中触发预览
  useEffect(() => {
    if (!settings.enabled) {
      console.log('[Smart Lens] Disabled, skipping key listener setup')
      return
    }

    console.log('[Smart Lens] Setting up key listeners, enabled:', settings.enabled)

    const handleKeyDown = (e: KeyboardEvent) => {
      // 忽略键盘重复事件，防止连续触发
      if (e.repeat) return
      
      const link = hoveredLinkRef.current
      console.log('[Smart Lens] Key down:', e.code, 'key:', e.key, 'hoveredLink:', link?.href || 'none', 'showPreview:', showPreviewRef.current)
      
      if (e.code === 'Space') {
        // 如果在输入框中，不触发
        const activeElement = document.activeElement
        const tagName = activeElement?.tagName
        const isEditable = (activeElement as HTMLElement)?.isContentEditable
        console.log('[Smart Lens] Active element:', tagName, 'contentEditable:', isEditable)
        
        if (tagName === 'INPUT' || tagName === 'TEXTAREA' || isEditable) {
          console.log('[Smart Lens] In input field, ignoring Space')
          return
        }
        
        if (!link) {
          console.log('[Smart Lens] No link hovered, ignoring Space')
          return
        }
        
        console.log('[Smart Lens] Space pressed on link, preventing default and triggering preview')
        e.preventDefault() // 阻止页面滚动
        e.stopPropagation() // 阻止事件冒泡
        e.stopImmediatePropagation() // 阻止同一元素上的其他监听器
        triggerPreview()
      }
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        if (!link) {
          console.log('[Smart Lens] No link hovered, ignoring Shift')
          return
        }
        triggerPreview()
      }
    }

    // 使用捕获阶段，在其他监听器之前处理事件
    document.addEventListener('keydown', handleKeyDown, true)

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true)
    }
  }, [settings.enabled, triggerPreview])

  // Close preview when mouse leaves link AND card (with delay)
  useEffect(() => {
    if (!hoveredLink && !isPinned && !isHoveringCard && showPreview) {
      // 添加延迟，给用户时间将鼠标移到卡片上
      const timer = setTimeout(() => {
        setShowPreview(false)
        setPreviewData(null)
        setLoading(false)
        setCurrentPreviewUrl(null)
      }, 300) // 300ms 延迟
      
      return () => {
        clearTimeout(timer)
      }
    }
  }, [hoveredLink, isPinned, isHoveringCard, showPreview])

  const handleClose = () => {
    setShowPreview(false)
    setPreviewData(null)
    setLoading(false)
    setIsPinned(false)
    setCurrentPreviewUrl(null)
  }

  const handlePin = () => {
    setIsPinned(!isPinned)
  }

  if (!settings.enabled) return null
  
  // Show reload prompt if extension context is invalid
  if (extensionInvalid) {
    return (
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        padding: '12px 16px',
        background: 'rgba(255, 59, 48, 0.9)',
        color: 'white',
        borderRadius: '8px',
        fontSize: '14px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        zIndex: 2147483647,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
      }}>
        Extension reloaded. Please refresh the page.
      </div>
    )
  }

  return (
    <>
      {/* 移除视觉提示图标 */}
      {showPreview && (
        <PreviewCard
          data={previewData}
          loading={loading}
          position={previewPosition}
          onClose={handleClose}
          onPin={settings.enablePinMode ? handlePin : undefined}
          isPinned={isPinned}
          onMouseEnter={() => setIsHoveringCard(true)}
          onMouseLeave={() => setIsHoveringCard(false)}
        />
      )}
    </>
  )
}

// Initialize Smart Lens
function initSmartLens() {
  // Don't initialize if we're inside an iframe (e.g., Smart Lens preview iframe)
  // This prevents nested preview triggering
  if (window !== window.top) {
    console.log('[Smart Lens] Skipping initialization inside iframe')
    return
  }

  // Create container for React app
  const container = document.createElement('div')
  container.id = 'syncia-smart-lens-root'
  container.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    z-index: 999999;
    pointer-events: none;
  `
  document.body.appendChild(container)

  // 添加样式让卡片可交互
  const style = document.createElement('style')
  style.textContent = `
    #syncia-smart-lens-root * {
      pointer-events: auto;
    }
    #syncia-smart-lens-root .smart-lens-visual-cue {
      pointer-events: none;
    }
  `
  document.head.appendChild(style)

  // Make preview cards interactive
  container.addEventListener('mousedown', (e) => {
    if ((e.target as HTMLElement).closest('.smart-lens-preview-card')) {
      e.stopPropagation()
    }
  })

  const root = ReactDOM.createRoot(container)
  root.render(<SmartLens />)
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSmartLens)
} else {
  initSmartLens()
}

export { }
