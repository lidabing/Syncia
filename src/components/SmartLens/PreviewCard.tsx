/**
 * Smart Lens Preview Card
 * The intelligent card container with glassmorphism design
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
  onPin,
  isPinned = false,
  onMouseEnter,
  onMouseLeave,
}) => {
  const [cardPosition, setCardPosition] = useState(position)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    if (isPinned) return

    // Smart positioning - avoid covering content
    const calculatePosition = () => {
      const cardWidth = 375 // Mobile width
      const cardHeight = 600 // Mobile height approximation
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
  }, [position, isPinned])

  if (!loading && !data) return null

  return (
    <div
      className="smart-lens-preview-card"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        position: 'fixed',
        left: isExpanded ? '5vw' : (isPinned ? 20 : cardPosition.x),
        top: isExpanded ? '5vh' : (isPinned ? 20 : cardPosition.y),
        zIndex: 999998,
        width: isExpanded ? '90vw' : '375px', // Mobile width
        height: isExpanded ? '90vh' : 'auto',
        maxWidth: '90vw',
        maxHeight: isExpanded ? '90vh' : '80vh',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(20px)',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        border: '1px solid rgba(255, 255, 255, 0.18)',
        animation: 'smart-lens-fade-in 0.2s ease-out',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', // Add smooth transition
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'rgba(249, 250, 251, 0.8)',
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
            {data?.siteName || 'Loading...'}
          </span>
          {data?.readTime && (
            <span
              style={{
                fontSize: '12px',
                color: '#6b7280',
                marginLeft: 'auto',
                flexShrink: 0,
              }}
            >
              {data.readTime}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
          {/* Expand / Collapse preview height */}
          <button
            type="button"
            onClick={() => setIsExpanded((v) => !v)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              opacity: 0.8,
            }}
            title={isExpanded ? 'Collapse preview' : 'Expand preview'}
          >
            {isExpanded ? '🗕' : '🗖'}
          </button>

          {onPin && (
            <button
              type="button"
              onClick={onPin}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                opacity: isPinned ? 1 : 0.6,
              }}
              title="Pin preview"
            >
              📌
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '18px',
              lineHeight: 1,
              padding: '4px',
              opacity: 0.6,
            }}
            title="Close"
          >
            ×
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {loading ? (
          <SkeletonLoader />
        ) : data ? (
          <PreviewContent data={data} expanded={isExpanded} />
        ) : null}
      </div>

      {/* Footer - Action Bar */}
      {!loading && data && (
        <div
          style={{
            padding: '12px 16px',
            borderTop: '1px solid rgba(0, 0, 0, 0.1)',
            display: 'flex',
            gap: '8px',
            backgroundColor: 'rgba(249, 250, 251, 0.8)',
          }}
        >
          <ActionButton
            onClick={() => window.open(data.url, '_blank')}
            icon="🔗"
            label="Open"
          />
          <ActionButton
            onClick={() => navigator.clipboard.writeText(data.url)}
            icon="📋"
            label="Copy"
          />
          {data.aiSummary && (
            <ActionButton onClick={() => {}} icon="✨" label="Summary" />
          )}
        </div>
      )}
    </div>
  )
}

// Skeleton Loader
const SkeletonLoader = () => (
  <div style={{ padding: '16px' }}>
    <div
      style={{
        width: '100%',
        height: '200px',
        backgroundColor: '#e5e7eb',
        borderRadius: '8px',
        marginBottom: '12px',
        animation: 'smart-lens-pulse 1.5s ease-in-out infinite',
      }}
    />
    <div
      style={{
        width: '80%',
        height: '20px',
        backgroundColor: '#e5e7eb',
        borderRadius: '4px',
        marginBottom: '8px',
        animation: 'smart-lens-pulse 1.5s ease-in-out infinite',
      }}
    />
    <div
      style={{
        width: '100%',
        height: '16px',
        backgroundColor: '#e5e7eb',
        borderRadius: '4px',
        marginBottom: '4px',
        animation: 'smart-lens-pulse 1.5s ease-in-out infinite',
      }}
    />
    <div
      style={{
        width: '90%',
        height: '16px',
        backgroundColor: '#e5e7eb',
        borderRadius: '4px',
        animation: 'smart-lens-pulse 1.5s ease-in-out infinite',
      }}
    />
  </div>
)

// Preview Content based on type
const PreviewContent: React.FC<{ data: LinkPreviewData; expanded?: boolean }> = ({ data, expanded = false }) => {
  // 默认使用 iframe 模式
  const [showIframe, setShowIframe] = React.useState(true)
  const [iframeError, setIframeError] = React.useState(false)

  // 检查是否可以使用 iframe
  const canUseIframe = !iframeError && data.url

  return (
    <div>
      {/* 切换按钮 */}
      <div style={{ 
        padding: '8px 16px', 
        borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
        display: 'flex',
        gap: '8px',
        backgroundColor: 'rgba(249, 250, 251, 0.5)',
      }}>
        <button
          type="button"
          onClick={() => setShowIframe(true)}
          style={{
            padding: '4px 12px',
            fontSize: '12px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            backgroundColor: showIframe ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
            color: showIframe ? '#4f46e5' : '#6b7280',
            fontWeight: showIframe ? 600 : 400,
          }}
        >
          🖥️ 完整预览
        </button>
        <button
          type="button"
          onClick={() => setShowIframe(false)}
          style={{
            padding: '4px 12px',
            fontSize: '12px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            backgroundColor: !showIframe ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
            color: !showIframe ? '#4f46e5' : '#6b7280',
            fontWeight: !showIframe ? 600 : 400,
          }}
        >
          📄 信息摘要
        </button>
      </div>

      {showIframe && canUseIframe ? (
        <IframePreview 
          url={data.url} 
          onError={() => {
            setIframeError(true)
            setShowIframe(false)
          }}
          height={expanded ? '100%' : '400px'}
        />
      ) : (
        <MetadataPreview data={data} />
      )}
    </div>
  )
}

// Iframe 预览模式 - 模拟设备模式
// 原理：将 iframe 设置为较大尺寸（模拟桌面），然后通过 CSS transform 缩放
// 这样网页会以真实的窄视口宽度渲染，触发其响应式布局
const IframePreview: React.FC<{ url: string; onError: () => void; height?: string }> = ({ url, onError, height = '400px' }) => {
  const [loading, setLoading] = React.useState(true)
  
  // 模拟设备参数
  const deviceWidth = 375 // iPhone SE/X 宽度
  const containerWidth = 375 // 容器宽度（与预览卡片宽度一致）
  const scale = containerWidth / deviceWidth // = 1，不需要缩放

  return (
    <div style={{ 
      position: 'relative', 
      width: '100%', 
      height, 
      overflow: 'hidden',
      backgroundColor: '#f5f5f5',
    }}>
      {loading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#6b7280',
          fontSize: '14px',
          zIndex: 1,
        }}>
          加载中...
        </div>
      )}
      {/* 模拟设备外框 */}
      <div style={{
        width: `${deviceWidth}px`,
        height: '100%',
        overflow: 'auto',
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        backgroundColor: '#fff',
      }}>
        <iframe
          src={url}
          style={{
            width: `${deviceWidth}px`,
            minHeight: '100%',
            height: '800px', // 给一个足够的高度让页面渲染
            border: 'none',
            display: loading ? 'none' : 'block',
          }}
          onLoad={() => setLoading(false)}
          onError={onError}
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          title="Page Preview"
        />
      </div>
      {!loading && (
        <div style={{
          position: 'absolute',
          bottom: '8px',
          right: '8px',
          padding: '4px 8px',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          fontSize: '11px',
          borderRadius: '4px',
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}>
          📱 {deviceWidth}px
        </div>
      )}
    </div>
  )
}

// 元数据预览模式（原来的内容）
const MetadataPreview: React.FC<{ data: LinkPreviewData }> = ({ data }) => {
  return (
    <div style={{ padding: '16px' }}>
      {/* Image/Thumbnail */}
      {(data.image || data.thumbnailUrl) && (
        <img
          src={data.image || data.thumbnailUrl}
          alt={data.title}
          style={{
            width: '100%',
            height: 'auto',
            maxHeight: '200px',
            objectFit: 'cover',
            borderRadius: '8px',
            marginBottom: '12px',
          }}
        />
      )}

      {/* Title */}
      {data.title && (
        <h3
          style={{
            fontSize: '16px',
            fontWeight: 600,
            color: '#111827',
            marginBottom: '8px',
            lineHeight: '1.4',
          }}
        >
          {data.title}
        </h3>
      )}

      {/* Metadata */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '8px', fontSize: '12px', color: '#6b7280' }}>
        {data.author && <span>✍️ {data.author}</span>}
        {data.publishDate && <span>📅 {data.publishDate}</span>}
        {data.duration && <span>⏱️ {data.duration}</span>}
        {data.stars !== undefined && <span>⭐ {data.stars}</span>}
      </div>

      {/* Description */}
      {data.description && (
        <p
          style={{
            fontSize: '14px',
            color: '#4b5563',
            lineHeight: '1.6',
            marginBottom: '12px',
          }}
        >
          {data.description}
        </p>
      )}

      {/* AI Summary */}
      {data.aiSummary && (
        <div
          style={{
            padding: '12px',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            borderRadius: '8px',
            borderLeft: '3px solid rgba(99, 102, 241, 0.8)',
          }}
        >
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#4f46e5', marginBottom: '6px' }}>
            ✨ AI Summary
          </div>
          <p style={{ fontSize: '13px', color: '#374151', lineHeight: '1.5', margin: 0 }}>
            {data.aiSummary}
          </p>
        </div>
      )}
    </div>
  )
}

// Action Button Component
const ActionButton: React.FC<{
  onClick: () => void
  icon: string
  label: string
}> = ({ onClick, icon, label }) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      padding: '6px 12px',
      fontSize: '13px',
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '6px',
      cursor: 'pointer',
      transition: 'all 0.2s',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.backgroundColor = '#f9fafb'
      e.currentTarget.style.borderColor = '#d1d5db'
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.backgroundColor = 'white'
      e.currentTarget.style.borderColor = '#e5e7eb'
    }}
  >
    <span>{icon}</span>
    <span>{label}</span>
  </button>
)

// Add global styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = `
    @keyframes smart-lens-fade-in {
      from {
        opacity: 0;
        transform: translateY(-10px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    @keyframes smart-lens-pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }

    .smart-lens-preview-card * {
      box-sizing: border-box;
    }

    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      .smart-lens-preview-card {
        background-color: rgba(31, 41, 55, 0.95) !important;
        border-color: rgba(75, 85, 99, 0.3) !important;
      }
    }
  `
  document.head.appendChild(style)
}
