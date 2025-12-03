/**
 * Smart Lens Preview Card
 * 根据链接类型智能展示不同的预览内容
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

// 从 URL 提取 YouTube 视频 ID
function getYouTubeVideoId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
  return match?.[1] || null
}

// 从 URL 提取 Bilibili 视频 ID
function getBilibiliVideoId(url: string): { bvid?: string; aid?: string } | null {
  const bvMatch = url.match(/bilibili\.com\/video\/(BV[a-zA-Z0-9]+)/)
  if (bvMatch) return { bvid: bvMatch[1] }
  const aidMatch = url.match(/bilibili\.com\/video\/av(\d+)/)
  if (aidMatch) return { aid: aidMatch[1] }
  return null
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

  // 根据内容类型确定卡片尺寸
  const getCardSize = () => {
    if (!data) return { width: 360, height: 'auto' }
    
    switch (data.type) {
      case 'video':
        return { width: 420, height: 'auto' }
      case 'code':
        return { width: 380, height: 'auto' }
      default:
        return { width: 360, height: 'auto' }
    }
  }

  const cardSize = getCardSize()

  useEffect(() => {
    const calculatePosition = () => {
      const cardWidth = typeof cardSize.width === 'number' ? cardSize.width : 360
      const cardHeight = 400
      const padding = 20

      let x = position.x + padding
      let y = position.y + padding

      if (x + cardWidth > window.innerWidth) {
        x = position.x - cardWidth - padding
      }
      if (y + cardHeight > window.innerHeight) {
        y = position.y - cardHeight - padding
      }

      x = Math.max(padding, Math.min(x, window.innerWidth - cardWidth - padding))
      y = Math.max(padding, Math.min(y, window.innerHeight - cardHeight - padding))

      return { x, y }
    }

    setCardPosition(calculatePosition())
  }, [position, cardSize.width])

  if (!loading && !data) return null

  // 渲染视频类型预览
  const renderVideoPreview = () => {
    if (!data) return null
    
    const youtubeId = getYouTubeVideoId(data.url)
    const bilibiliId = getBilibiliVideoId(data.url)

    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {/* 视频播放器区域 */}
        <div style={{ 
          width: '100%', 
          aspectRatio: '16/9', 
          backgroundColor: '#000',
          borderRadius: '8px 8px 0 0',
          overflow: 'hidden',
        }}>
          {youtubeId ? (
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}?rel=0`}
              style={{ width: '100%', height: '100%', border: 'none' }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="YouTube video"
            />
          ) : bilibiliId ? (
            <iframe
              src={`//player.bilibili.com/player.html?bvid=${bilibiliId.bvid || ''}&aid=${bilibiliId.aid || ''}&high_quality=1`}
              style={{ width: '100%', height: '100%', border: 'none' }}
              allowFullScreen
              title="Bilibili video"
            />
          ) : data.thumbnailUrl || data.image ? (
            <img
              src={data.thumbnailUrl || data.image}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ 
              width: '100%', 
              height: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: '#fff',
              fontSize: '48px',
            }}>
              ▶
            </div>
          )}
        </div>

        {/* 视频信息 */}
        <div style={{ padding: '12px 16px' }}>
          <h3 style={{
            margin: '0 0 8px 0',
            fontSize: '14px',
            fontWeight: 600,
            color: '#111827',
            lineHeight: 1.4,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {data.title || '视频'}
          </h3>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {data.duration && (
              <span style={{ fontSize: '12px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                ⏱️ {data.duration}
              </span>
            )}
            {data.author && (
              <span style={{ fontSize: '12px', color: '#6b7280' }}>
                👤 {data.author}
              </span>
            )}
          </div>
        </div>
      </div>
    )
  }

  // 渲染代码/GitHub 类型预览
  const renderCodePreview = () => {
    if (!data) return null

    return (
      <div style={{ padding: '16px' }}>
        {/* 仓库图标和名称 */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '8px',
            backgroundColor: '#f3f4f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            flexShrink: 0,
          }}>
            {data.image ? (
              <img src={data.image} alt="" style={{ width: '100%', height: '100%', borderRadius: '8px', objectFit: 'cover' }} />
            ) : '📦'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{
              margin: 0,
              fontSize: '15px',
              fontWeight: 600,
              color: '#111827',
              wordBreak: 'break-word',
            }}>
              {data.title || data.url}
            </h3>
            {data.author && (
              <span style={{ fontSize: '12px', color: '#6b7280' }}>{data.author}</span>
            )}
          </div>
        </div>

        {/* 描述 */}
        {data.description && (
          <p style={{
            margin: '0 0 12px 0',
            fontSize: '13px',
            color: '#4b5563',
            lineHeight: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {data.description}
          </p>
        )}

        {/* 统计信息 */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '16px',
          padding: '10px 12px',
          backgroundColor: '#f9fafb',
          borderRadius: '8px',
        }}>
          {data.stars !== undefined && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '14px' }}>⭐</span>
              <span style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>
                {data.stars.toLocaleString()}
              </span>
            </div>
          )}
          {data.language && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ 
                width: '10px', 
                height: '10px', 
                borderRadius: '50%',
                backgroundColor: getLanguageColor(data.language),
              }} />
              <span style={{ fontSize: '13px', color: '#374151' }}>{data.language}</span>
            </div>
          )}
          {data.lastUpdate && (
            <span style={{ fontSize: '12px', color: '#6b7280' }}>
              更新于 {data.lastUpdate}
            </span>
          )}
        </div>
      </div>
    )
  }

  // 渲染文章类型预览（带AI摘要）
  const renderArticlePreview = () => {
    if (!data) return null

    return (
      <>
        {/* 图片 */}
        {data.image && (
          <div style={{ width: '100%', height: '140px', overflow: 'hidden', backgroundColor: '#f9fafb' }}>
            <img
              src={data.image}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => (e.currentTarget.parentElement!.style.display = 'none')}
            />
          </div>
        )}

        <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* 标题 */}
          <h3 style={{
            margin: 0,
            fontSize: '15px',
            fontWeight: 600,
            color: '#111827',
            lineHeight: 1.4,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {data.title || '无标题'}
          </h3>

          {/* AI 摘要（如果有） */}
          {data.aiSummary ? (
            <div style={{
              padding: '10px 12px',
              backgroundColor: '#f0f9ff',
              borderRadius: '8px',
              borderLeft: '3px solid #3b82f6',
            }}>
              <div style={{ 
                fontSize: '11px', 
                color: '#3b82f6', 
                fontWeight: 500, 
                marginBottom: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}>
                ✨ AI 摘要
              </div>
              <p style={{
                margin: 0,
                fontSize: '13px',
                color: '#1e40af',
                lineHeight: 1.5,
              }}>
                {data.aiSummary}
              </p>
            </div>
          ) : data.description ? (
            <p style={{
              margin: 0,
              fontSize: '13px',
              color: '#6b7280',
              lineHeight: 1.5,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}>
              {data.description}
            </p>
          ) : null}

          {/* 元信息 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {data.readTime && (
              <span style={{ fontSize: '12px', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '3px' }}>
                📖 {data.readTime}
              </span>
            )}
            {data.author && (
              <span style={{ fontSize: '12px', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '3px' }}>
                ✍️ {data.author}
              </span>
            )}
            {data.publishDate && (
              <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                {formatDate(data.publishDate)}
              </span>
            )}
          </div>
        </div>
      </>
    )
  }

  // 渲染商品类型预览
  const renderProductPreview = () => {
    if (!data) return null

    return (
      <>
        {/* 商品图片 */}
        {data.image && (
          <div style={{ 
            width: '100%', 
            height: '180px', 
            overflow: 'hidden', 
            backgroundColor: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}>
            <img
              src={data.image}
              alt=""
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
              onError={(e) => (e.currentTarget.parentElement!.style.display = 'none')}
            />
          </div>
        )}

        <div style={{ padding: '14px 16px' }}>
          <h3 style={{
            margin: '0 0 8px 0',
            fontSize: '14px',
            fontWeight: 500,
            color: '#111827',
            lineHeight: 1.4,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {data.title}
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {data.price && (
              <span style={{ fontSize: '18px', fontWeight: 600, color: '#dc2626' }}>
                {data.price}
              </span>
            )}
            {data.rating !== undefined && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} style={{ color: star <= data.rating! ? '#fbbf24' : '#e5e7eb', fontSize: '14px' }}>
                    ★
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </>
    )
  }

  // 根据类型选择渲染方式
  const renderContent = () => {
    if (!data) return null

    switch (data.type) {
      case 'video':
        return renderVideoPreview()
      case 'code':
        return renderCodePreview()
      case 'product':
        return renderProductPreview()
      case 'article':
      default:
        return renderArticlePreview()
    }
  }

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
        width: cardSize.width,
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
          {/* Header - 网站信息和关闭按钮 */}
          <div
            style={{
              padding: '10px 14px',
              borderBottom: '1px solid #f3f4f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
              {data.favicon && (
                <img
                  src={data.favicon}
                  alt=""
                  style={{ width: '16px', height: '16px', flexShrink: 0, borderRadius: '3px' }}
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                />
              )}
              <span style={{
                fontSize: '12px',
                color: '#9ca3af',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {data.siteName || new URL(data.url).hostname}
              </span>
              {/* 类型标签 */}
              <span style={{
                fontSize: '10px',
                padding: '2px 6px',
                borderRadius: '4px',
                backgroundColor: getTypeColor(data.type).bg,
                color: getTypeColor(data.type).text,
                fontWeight: 500,
              }}>
                {getTypeLabel(data.type)}
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                lineHeight: 1,
                padding: '4px',
                color: '#9ca3af',
                borderRadius: '4px',
              }}
              title="关闭"
            >
              ✕
            </button>
          </div>

          {/* Main Content */}
          {renderContent()}

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

// 辅助函数：获取编程语言对应的颜色
function getLanguageColor(lang: string): string {
  const colors: Record<string, string> = {
    JavaScript: '#f1e05a',
    TypeScript: '#3178c6',
    Python: '#3572A5',
    Java: '#b07219',
    Go: '#00ADD8',
    Rust: '#dea584',
    C: '#555555',
    'C++': '#f34b7d',
    'C#': '#178600',
    Ruby: '#701516',
    PHP: '#4F5D95',
    Swift: '#F05138',
    Kotlin: '#A97BFF',
    Vue: '#41b883',
    HTML: '#e34c26',
    CSS: '#563d7c',
  }
  return colors[lang] || '#6b7280'
}

// 辅助函数：获取类型对应的颜色
function getTypeColor(type: string): { bg: string; text: string } {
  const colors: Record<string, { bg: string; text: string }> = {
    video: { bg: '#fee2e2', text: '#dc2626' },
    code: { bg: '#dbeafe', text: '#2563eb' },
    product: { bg: '#fef3c7', text: '#d97706' },
    article: { bg: '#dcfce7', text: '#16a34a' },
    generic: { bg: '#f3f4f6', text: '#6b7280' },
  }
  return colors[type] || colors.generic
}

// 辅助函数：获取类型标签文本
function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    video: '视频',
    code: '代码',
    product: '商品',
    article: '文章',
    generic: '链接',
  }
  return labels[type] || '链接'
}

// 辅助函数：格式化日期
function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' })
  } catch {
    return dateStr
  }
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
