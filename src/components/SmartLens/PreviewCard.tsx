/**
 * Smart Lens Preview Card
 * 简洁的链接预览窗口
 */

import React, { useEffect, useState } from 'react'
import type { LinkPreviewData } from '../../config/settings/smartLens'

interface PreviewCardProps {
  data: LinkPreviewData | null
  loading: boolean
  position: { x: number; y: number }
  onClose: () => void
  onPin?: () => void
  isPinned?: boolean
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}

export const PreviewCard: React.FC<PreviewCardProps> = ({
  data,
  loading,
  position,
  onClose,
  onMouseEnter,
  onMouseLeave,
}) => {
  const [cardPosition, setCardPosition] = useState(position)
  const [iframeLoading, setIframeLoading] = useState(true)

  useEffect(() => {
    // Smart positioning - avoid covering content
    const calculatePosition = () => {
      const cardWidth = 400
      const cardHeight = 500
      const padding = 20

      let x = position.x + padding
      let y = position.y + padding

      // 如果右侧空间不足，显示在左侧
      if (x + cardWidth > window.innerWidth) {
        x = position.x - cardWidth - padding
      }

      // 如果下方空间不足，显示在上方
      if (y + cardHeight > window.innerHeight) {
        y = position.y - cardHeight - padding
      }

      // 确保不超出视口
      x = Math.max(padding, Math.min(x, window.innerWidth - cardWidth - padding))
      y = Math.max(padding, Math.min(y, window.innerHeight - cardHeight - padding))

      return { x, y }
    }

    setCardPosition(calculatePosition())
  }, [position])

  // 重置加载状态
  useEffect(() => {
    if (data?.url) {
      setIframeLoading(true)
    }
  }, [data?.url])

  if (!loading && !data) return null

  return (
    <div
      className="smart-lens-preview-card"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        position: 'fixed',
        left: cardPosition.x,
        top: cardPosition.y,
        zIndex: 999998,
        width: '400px',
        height: '500px',
        borderRadius: '8px',
        overflow: 'hidden',
        backgroundColor: '#fff',
        border: '1px solid #d1d5db',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header - 简化版 */}
      <div
        style={{
          padding: '8px 12px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#f9fafb',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
          {data?.favicon && (
            <img
              src={data.favicon}
              alt=""
              style={{ width: '16px', height: '16px', flexShrink: 0 }}
            />
          )}
          <span
            style={{
              fontSize: '13px',
              fontWeight: 500,
              color: '#374151',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {loading ? '加载中...' : (data?.title || data?.siteName || data?.url)}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '18px',
            lineHeight: 1,
            padding: '4px 8px',
            color: '#6b7280',
          }}
          title="关闭"
        >
          ×
        </button>
      </div>

      {/* Body - 只有 iframe */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {(loading || iframeLoading) && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f9fafb',
              color: '#6b7280',
              fontSize: '14px',
            }}
          >
            加载中...
          </div>
        )}
        {data?.url && (
          <iframe
            src={data.url}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              display: iframeLoading ? 'none' : 'block',
            }}
            onLoad={() => setIframeLoading(false)}
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            title="预览"
          />
        )}
      </div>
    </div>
  )
}

// Add global styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = `
    .smart-lens-preview-card * {
      box-sizing: border-box;
    }
  `
  document.head.appendChild(style)
}
