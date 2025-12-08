/**
 * Smart Lens - Intelligent Link Preview
 * L1: Visual Cue Layer - 视觉暗示
 */

import { useEffect, useState } from 'react'
import type { SmartLensSettings } from '../../config/settings/smartLens'

interface VisualCueProps {
  x: number
  y: number
  visible: boolean
}

export const VisualCue = ({ x, y, visible }: VisualCueProps) => {
  if (!visible) return null

  return (
    <div
      className="smart-lens-visual-cue"
      style={{
        position: 'fixed',
        left: x + 10,
        top: y - 5,
        zIndex: 999999,
        pointerEvents: 'none',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.2s ease-in-out',
      }}
    >
      <div className="smart-lens-cue-icon">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.3))',
          }}
        >
          <circle cx="12" cy="12" r="10" fill="rgba(99, 102, 241, 0.9)" />
          <path
            d="M12 8V12L15 15"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  )
}

/**
 * Hook to detect link hover and show visual cue
 */
export const useSmartLensDetection = (settings: SmartLensSettings) => {
  const [hoveredLink, setHoveredLink] = useState<HTMLAnchorElement | null>(
    null
  )
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 })
  const [showCue, setShowCue] = useState(false)

  useEffect(() => {
    if (!settings.enabled) return

    const handleMouseMove = (e: MouseEvent) => {
      setCursorPosition({ x: e.clientX, y: e.clientY })

      const target = e.target as HTMLElement
      
      // 忽略 Syncia sidebar 相关元素上的事件
      if (target.closest('#syncia_sidebar_wrapper') || 
          target.closest('#syncia_floating_button') ||
          target.id === 'syncia_sidebar' ||
          target.tagName === 'IFRAME') {
        // 不重置状态，保持之前的 hoveredLink
        return
      }
      
      const link = target.closest('a[href]') as HTMLAnchorElement | null

      if (link && link.href && !link.href.startsWith('javascript:')) {
        // 检查是否在排除域名列表中
        try {
          const hostname = new URL(link.href).hostname
          const excludedDomains = settings.excludedDomains || []
          const isExcluded = excludedDomains.some((domain: string) =>
            hostname.includes(domain)
          )

          if (!isExcluded) {
            setHoveredLink(link)
            setShowCue(false)
          } else {
            setHoveredLink(null)
            setShowCue(false)
          }
        } catch {
          // URL 解析失败，忽略
          setHoveredLink(null)
          setShowCue(false)
        }
      } else {
        setHoveredLink(null)
        setShowCue(false)
      }
    }

    document.addEventListener('mousemove', handleMouseMove)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
    }
  }, [settings.enabled, settings.showVisualCue, settings.excludedDomains, hoveredLink])

  return {
    hoveredLink,
    cursorPosition,
    showCue,
  }
}

/**
 * 检查链接是否可预览
 */
export const isPreviewableLink = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url)
    
    // 排除文件下载链接
    const fileExtensions = ['.pdf', '.zip', '.exe', '.dmg', '.pkg', '.deb']
    if (fileExtensions.some((ext) => parsedUrl.pathname.endsWith(ext))) {
      return false
    }

    // 仅支持 http(s) 协议
    if (!parsedUrl.protocol.startsWith('http')) {
      return false
    }

    return true
  } catch {
    return false
  }
}
