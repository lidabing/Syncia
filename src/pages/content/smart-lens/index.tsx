/**
 * Smart Lens - Main Content Script
 * Implements the complete smart lens functionality
 */

import React, { useEffect, useState, useCallback } from 'react'
import ReactDOM from 'react-dom/client'
import { VisualCue, useSmartLensDetection, isPreviewableLink } from '../../../components/SmartLens/VisualCue'
import { PreviewCard } from '../../../components/SmartLens/PreviewCard'
import type { LinkPreviewData, SmartLensSettings } from '../../../config/settings/smartLens'
import { fetchLinkPreview, extractYouTubeData } from '../../../lib/smartLens/contentFetcher'

const SmartLens: React.FC = () => {
  const [settings, setSettings] = useState<SmartLensSettings | null>(null)
  const [previewData, setPreviewData] = useState<LinkPreviewData | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [previewPosition, setPreviewPosition] = useState({ x: 0, y: 0 })
  const [isPinned, setIsPinned] = useState(false)
  const [spaceKeyPressed, setSpaceKeyPressed] = useState(false)
  const [hoverTimer, setHoverTimer] = useState<NodeJS.Timeout | null>(null)
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
          setSettings(result.SETTINGS.smartLens)
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
        setSettings(changes.SETTINGS.newValue.smartLens)
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

  const { hoveredLink, cursorPosition, showCue } = useSmartLensDetection(
    settings || ({} as SmartLensSettings)
  )

  // Handle Space key
  useEffect(() => {
    if (!settings?.enabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        setSpaceKeyPressed(true)
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setSpaceKeyPressed(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keyup', handleKeyUp)
    }
  }, [settings?.enabled])

  // Trigger preview based on mode
  useEffect(() => {
    if (!settings?.enabled || !hoveredLink || isPinned) return

    // Clear existing timer
    if (hoverTimer) {
      clearTimeout(hoverTimer)
      setHoverTimer(null)
    }

    const triggerPreview = () => {
      const url = hoveredLink.href
      if (!isPreviewableLink(url)) return

      // 如果已经在预览同一个 URL，不重新加载
      if (showPreview && currentPreviewUrl === url) return

      setPreviewPosition({ x: cursorPosition.x, y: cursorPosition.y })
      setShowPreview(true)
      setCurrentPreviewUrl(url)
      loadPreviewData(url)
    }

    if (settings.triggerMode === 'space' && spaceKeyPressed) {
      // Space key mode: instant trigger
      triggerPreview()
    } else if (settings.triggerMode === 'shift-hover' && spaceKeyPressed) {
      // Shift hover mode
      triggerPreview()
    } else if (settings.triggerMode === 'hover') {
      // Hover with delay mode
      const timer = setTimeout(() => {
        triggerPreview()
      }, settings.hoverDelay)
      setHoverTimer(timer)
    }

    return () => {
      if (hoverTimer) {
        clearTimeout(hoverTimer)
      }
    }
  }, [hoveredLink, spaceKeyPressed, settings, cursorPosition, isPinned])

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

  if (!settings?.enabled) return null
  
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
      <VisualCue
        x={cursorPosition.x}
        y={cursorPosition.y}
        visible={showCue && !showPreview}
      />
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
