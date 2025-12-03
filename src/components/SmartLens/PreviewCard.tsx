/**
 * Smart Lens Preview Card
 * 简洁的链接预览窗口 - 使用元数据卡片方式展示
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

  useEffect(() => {
    // Smart positioning - avoid covering content
    const calculatePosition = () => {
      const cardWidth = 360
      const cardHeight = 280
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
        width: '360px',
        borderRadius: '12px',
        overflow: 'hidden',
        backgroundColor: '#fff',
        boxShadow: '0 4px 24px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.08)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Loading State */}
      {loading && (
        <div
          style={{
            padding: '40px 24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              border: '3px solid #e5e7eb',
              borderTopColor: '#6366f1',
              borderRadius: '50%',
              animation: 'smart-lens-spin 0.8s linear infinite',
            }}
          />
          <span style={{ fontSize: '13px', color: '#6b7280' }}>加载预览...</span>
        </div>
      )}

      {/* Content */}
      {!loading && data && (
        <>
          {/* Header */}
          <div
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid #f3f4f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
              {data.favicon && (
                <img
                  src={data.favicon}
                  alt=""
                  style={{ width: '18px', height: '18px', flexShrink: 0, borderRadius: '4px' }}
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                />
              )}
              <span
                style={{
                  fontSize: '12px',
                  color: '#9ca3af',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {data.siteName || new URL(data.url).hostname}
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '16px',
                lineHeight: 1,
                padding: '4px',
                color: '#9ca3af',
                borderRadius: '4px',
                transition: 'all 0.15s',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6'
                e.currentTarget.style.color = '#374151'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = '#9ca3af'
              }}
              title="关闭"
            >
              ✕
            </button>
          </div>

          {/* Image */}
          {data.image && (
            <div style={{ width: '100%', height: '160px', overflow: 'hidden', backgroundColor: '#f9fafb' }}>
              <img
                src={data.image}
                alt=""
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
                onError={(e) => (e.currentTarget.parentElement!.style.display = 'none')}
              />
            </div>
          )}

          {/* Content */}
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* Title */}
            <h3
              style={{
                margin: 0,
                fontSize: '15px',
                fontWeight: 600,
                color: '#111827',
                lineHeight: 1.4,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {data.title || '无标题'}
            </h3>

            {/* Description */}
            {data.description && (
              <p
                style={{
                  margin: 0,
                  fontSize: '13px',
                  color: '#6b7280',
                  lineHeight: 1.5,
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {data.description}
              </p>
            )}

            {/* Meta info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
              {data.readTime && (
                <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                  📖 {data.readTime}
                </span>
              )}
              {data.author && (
                <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                  ✍️ {data.author}
                </span>
              )}
              {data.stars !== undefined && (
                <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                  ⭐ {data.stars.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          {/* Footer - Open Link */}
          <a
            href={data.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '10px 16px',
              borderTop: '1px solid #f3f4f6',
              fontSize: '13px',
              color: '#6366f1',
              textDecoration: 'none',
              transition: 'background-color 0.15s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f9fafb')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            打开链接
            <span style={{ fontSize: '11px' }}>↗</span>
          </a>
        </>
      )}
    </div>
  )
}

// Add global styles for animation
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = `
    .smart-lens-preview-card * {
      box-sizing: border-box;
    }
    @keyframes smart-lens-spin {
      to { transform: rotate(360deg); }
    }
  `
  document.head.appendChild(style)
}