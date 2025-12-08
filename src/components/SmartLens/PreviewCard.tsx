/**
 * Smart Lens Preview Card
 * 根据链接类型智能展示不同的预览内容
 */

import React, { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
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
  isPinned,
  onMouseEnter,
  onMouseLeave,
}) => {
  const [cardPosition, setCardPosition] = useState(position)

  // 根据内容类型确定卡片尺寸
  const getCardSize = () => {
    if (!data) return { width: 380, height: 'auto' }
    
    // 如果有正文内容，使用更大的卡片
    const hasTextContent = data.textContent && data.textContent.length > 100
    
    switch (data.type) {
      case 'video':
        return { width: 480, height: 'auto' }
      case 'code':
        return { width: 420, height: 'auto' }
      case 'article':
        return { width: hasTextContent ? 450 : 420, height: 'auto' }
      default:
        return { width: 380, height: 'auto' }
    }
  }

  const cardSize = getCardSize()

  useEffect(() => {
    const calculatePosition = () => {
      const cardWidth = typeof cardSize.width === 'number' ? cardSize.width : 380
      const cardHeight = 450
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

  // 渲染视频类型预览 - 直接嵌入播放器
  const renderVideoPreview = () => {
    if (!data) return null

    const renderPlayer = () => {
      // YouTube 在扩展 iframe 环境中无法嵌入播放（errorCode: embedder.identity.denied）
      // 因此使用缩略图 + 点击跳转的方式
      if (data.videoPlatform === 'youtube' && data.videoId) {
        const thumbnailUrl = `https://img.youtube.com/vi/${data.videoId}/maxresdefault.jpg`
        const fallbackThumbnail = `https://img.youtube.com/vi/${data.videoId}/hqdefault.jpg`
        
        return (
          <a
            href={data.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ 
              position: 'relative', 
              width: '100%', 
              height: '100%', 
              display: 'block',
              cursor: 'pointer',
            }}
          >
            <img
              src={thumbnailUrl}
              alt={data.title || 'YouTube video'}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => {
                // 尝试使用较低质量的缩略图
                if (!e.currentTarget.src.includes('hqdefault')) {
                  e.currentTarget.src = fallbackThumbnail
                }
              }}
            />
            {/* 播放按钮 */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '68px',
              height: '48px',
              backgroundColor: 'rgba(255, 0, 0, 0.9)',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.2s, background-color 0.2s',
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
            {/* YouTube 标识 */}
            <div style={{
              position: 'absolute',
              bottom: '8px',
              right: '8px',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              color: '#fff',
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 500,
            }}>
              ▶ YouTube
            </div>
          </a>
        )
      }
      
      if (data.videoPlatform === 'bilibili' && data.videoId) {
        const bvid = data.videoId.startsWith('BV') ? data.videoId : ''
        const aid = data.videoId.startsWith('av') ? data.videoId.replace('av', '') : ''
        const params = new URLSearchParams({
          high_quality: '1',
          danmaku: '0',
          autoplay: '1',
        })
        if (bvid) params.set('bvid', bvid)
        if (aid) params.set('aid', aid)
        
        return (
          <iframe
            src={`https://player.bilibili.com/player.html?${params.toString()}`}
            style={{ width: '100%', height: '100%', border: 'none' }}
            allowFullScreen
            title="Bilibili video"
            scrolling="no"
            sandbox="allow-scripts allow-same-origin allow-popups"
          />
        )
      }
      
      if (data.videoPlatform === 'vimeo' && data.videoId) {
        return (
          <iframe
            src={`https://player.vimeo.com/video/${data.videoId}?autoplay=1`}
            style={{ width: '100%', height: '100%', border: 'none' }}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title="Vimeo video"
          />
        )
      }

      // 无法嵌入时显示缩略图
      if (data.thumbnailUrl || data.image) {
        return (
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <img
              src={data.thumbnailUrl || data.image}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: 'rgba(0,0,0,0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '24px',
            }}>
              ▶
            </div>
          </div>
        )
      }

      return (
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#1a1a1a',
          color: '#666',
        }}>
          无法加载视频
        </div>
      )
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {/* 视频播放器 */}
        <div style={{
          width: '100%',
          aspectRatio: '16/9',
          backgroundColor: '#000',
          overflow: 'hidden',
        }}>
          {renderPlayer()}
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
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#6b7280', fontSize: '12px' }}>
            {data.duration && <span>⏱️ {data.duration}</span>}
            {data.author && <span>👤 {data.author}</span>}
          </div>
        </div>
      </div>
    )
  }

  // 渲染文章类型 - 阅读模式
  const renderArticlePreview = () => {
    if (!data) return null

    // 计算是否有足够内容显示
    const hasTextContent = data.textContent && data.textContent.length > 100
    const hasAISummary = data.aiSummary && data.aiSummary.length > 0

    return (
      <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '500px' }}>
        {/* 头图 - 只在没有正文内容时显示，节省空间 */}
        {data.image && !hasTextContent && (
          <div style={{ width: '100%', height: '100px', overflow: 'hidden', flexShrink: 0 }}>
            <img
              src={data.image}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => (e.currentTarget.parentElement!.style.display = 'none')}
            />
          </div>
        )}

        {/* 内容区 */}
        <div style={{ padding: '14px 16px', flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {/* 标题 */}
          <h3 style={{
            margin: '0 0 10px 0',
            fontSize: '15px',
            fontWeight: 600,
            color: '#111827',
            lineHeight: 1.4,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            flexShrink: 0,
          }}>
            {data.title || '无标题'}
          </h3>

          {/* AI 摘要 - 精简显示 */}
          {hasAISummary && (
            <div style={{
              padding: '8px 10px',
              backgroundColor: '#f0f9ff',
              borderRadius: '6px',
              borderLeft: '3px solid #3b82f6',
              marginBottom: '10px',
              flexShrink: 0,
              fontSize: '12px',
              color: '#1e40af',
              lineHeight: 1.5,
              maxHeight: hasTextContent ? '80px' : '150px',
              overflow: 'auto',
            }}>
              <div style={{ fontSize: '10px', color: '#3b82f6', fontWeight: 500, marginBottom: '3px' }}>
                ✨ AI 摘要
              </div>
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({node, ...props}) => <p style={{margin: '0 0 6px 0'}} {...props} />,
                  ul: ({node, ...props}) => <ul style={{margin: '0 0 6px 0', paddingLeft: '16px'}} {...props} />,
                  li: ({node, ...props}) => <li style={{marginBottom: '2px'}} {...props} />,
                }}
              >
                {data.aiSummary || ''}
              </ReactMarkdown>
            </div>
          )}

          {/* 主要文本内容 - 始终显示（如果有的话） */}
          {hasTextContent && (
            <div style={{
              flex: 1,
              overflow: 'auto',
              minHeight: '120px',
              marginBottom: '10px',
            }}>
              <div style={{ 
                fontSize: '11px', 
                color: '#6b7280', 
                fontWeight: 500, 
                marginBottom: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}>
                📄 正文预览
              </div>
              <div style={{
                fontSize: '13px',
                color: '#374151',
                lineHeight: 1.7,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}>
                {formatTextContent(data.textContent || '', 1200)}
              </div>
            </div>
          )}

          {/* 如果没有正文也没有 AI 摘要，显示描述 */}
          {!hasTextContent && !hasAISummary && data.description && (
            <p style={{
              margin: 0,
              fontSize: '13px',
              color: '#6b7280',
              lineHeight: 1.6,
              display: '-webkit-box',
              WebkitLineClamp: 6,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}>
              {data.description}
            </p>
          )}

          {/* 元信息 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginTop: 'auto',
            paddingTop: '10px',
            borderTop: '1px solid #f3f4f6',
            fontSize: '11px',
            color: '#9ca3af',
            flexShrink: 0,
          }}>
            {data.siteName && <span>🌐 {data.siteName}</span>}
            {data.readTime && <span>📖 {data.readTime}</span>}
            {data.author && <span>✍️ {data.author}</span>}
            {data.publishDate && <span>{formatDate(data.publishDate)}</span>}
          </div>
        </div>
      </div>
    )
  }

  // 渲染代码/GitHub 类型
  const renderCodePreview = () => {
    if (!data) return null

    return (
      <div style={{ padding: '16px' }}>
        {/* 仓库信息 */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '14px' }}>
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
            overflow: 'hidden',
          }}>
            {data.image ? (
              <img src={data.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : '📦'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{
              margin: 0,
              fontSize: '16px',
              fontWeight: 600,
              color: '#111827',
              wordBreak: 'break-word',
            }}>
              {data.title || data.url}
            </h3>
            {data.author && (
              <span style={{ fontSize: '13px', color: '#6b7280' }}>{data.author}</span>
            )}
          </div>
        </div>

        {/* 描述 */}
        {data.description && !data.aiSummary && (
          <p style={{
            margin: '0 0 14px 0',
            fontSize: '14px',
            color: '#4b5563',
            lineHeight: 1.6,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {data.description}
          </p>
        )}

        {/* AI 分析 */}
        {data.aiSummary && (
          <div style={{
            padding: '10px 12px',
            backgroundColor: '#f0fdf4',
            borderRadius: '8px',
            borderLeft: '3px solid #22c55e',
            marginBottom: '14px',
            fontSize: '13px',
            color: '#15803d',
            lineHeight: 1.5,
          }}>
            <div style={{ fontSize: '11px', color: '#22c55e', fontWeight: 500, marginBottom: '4px' }}>
              🤖 代码分析
            </div>
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({node, ...props}) => <p style={{margin: '0 0 8px 0'}} {...props} />,
                ul: ({node, ...props}) => <ul style={{margin: '0 0 8px 0', paddingLeft: '20px'}} {...props} />,
                li: ({node, ...props}) => <li style={{marginBottom: '4px'}} {...props} />,
              }}
            >
              {data.aiSummary}
            </ReactMarkdown>
          </div>
        )}

        {/* 统计信息 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          padding: '12px 14px',
          backgroundColor: '#f9fafb',
          borderRadius: '8px',
        }}>
          {data.stars !== undefined && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '16px' }}>⭐</span>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>
                {formatNumber(data.stars)}
              </span>
            </div>
          )}
          {data.forks !== undefined && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '14px' }}>🍴</span>
              <span style={{ fontSize: '14px', color: '#374151' }}>
                {formatNumber(data.forks)}
              </span>
            </div>
          )}
          {data.language && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: getLanguageColor(data.language),
              }} />
              <span style={{ fontSize: '13px', color: '#374151' }}>{data.language}</span>
            </div>
          )}
        </div>
      </div>
    )
  }

  // 渲染商品类型
  const renderProductPreview = () => {
    if (!data) return null

    return (
      <>
        {data.image && (
          <div style={{
            width: '100%',
            height: '200px',
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
            margin: '0 0 10px 0',
            fontSize: '14px',
            fontWeight: 500,
            color: '#111827',
            lineHeight: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {data.title}
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {data.price && (
              <span style={{ fontSize: '20px', fontWeight: 600, color: '#dc2626' }}>
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

          {/* AI 商品分析 */}
          {data.aiSummary && (
            <div style={{
              marginTop: '12px',
              padding: '10px 12px',
              backgroundColor: '#fffbeb',
              borderRadius: '8px',
              borderLeft: '3px solid #f59e0b',
              fontSize: '13px',
              color: '#b45309',
              lineHeight: 1.5,
            }}>
              <div style={{ fontSize: '11px', color: '#f59e0b', fontWeight: 500, marginBottom: '4px' }}>
                🛍️ 商品分析
              </div>
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({node, ...props}) => <p style={{margin: '0 0 8px 0'}} {...props} />,
                  ul: ({node, ...props}) => <ul style={{margin: '0 0 8px 0', paddingLeft: '20px'}} {...props} />,
                  li: ({node, ...props}) => <li style={{marginBottom: '4px'}} {...props} />,
                }}
              >
                {data.aiSummary}
              </ReactMarkdown>
            </div>
          )}
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
        maxHeight: '500px',
        borderRadius: '12px',
        overflow: 'hidden',
        backgroundColor: '#fff',
        boxShadow: '0 8px 32px rgba(0,0,0,0.16), 0 2px 8px rgba(0,0,0,0.08)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Loading State */}
      {loading && (
        <div style={{
          padding: '50px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '14px',
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            border: '3px solid #e5e7eb',
            borderTopColor: '#6366f1',
            borderRadius: '50%',
            animation: 'smart-lens-spin 0.8s linear infinite',
          }} />
          <span style={{ fontSize: '13px', color: '#6b7280' }}>正在加载预览...</span>
        </div>
      )}

      {/* Content */}
      {!loading && data && (
        <>
          {/* Header */}
          <div style={{
            padding: '10px 14px',
            borderBottom: '1px solid #f3f4f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            flexShrink: 0,
          }}>
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
              <span style={{
                fontSize: '10px',
                padding: '2px 6px',
                borderRadius: '4px',
                backgroundColor: getTypeColor(data.type).bg,
                color: getTypeColor(data.type).text,
                fontWeight: 500,
                flexShrink: 0,
              }}>
                {getTypeLabel(data.type)}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {onPin && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onPin()
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    lineHeight: 1,
                    padding: '4px',
                    color: isPinned ? '#6366f1' : '#9ca3af',
                    borderRadius: '4px',
                    transition: 'all 0.2s',
                    backgroundColor: isPinned ? '#e0e7ff' : 'transparent',
                  }}
                  title={isPinned ? '取消固定' : '固定预览'}
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
                  fontSize: '16px',
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
          </div>

          {/* Main Content */}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            {renderContent()}
          </div>

          {/* Footer */}
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
              flexShrink: 0,
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

// Helper functions
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

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' })
  } catch {
    return dateStr
  }
}

function formatNumber(num: number): string {
  if (num >= 10000) {
    return `${(num / 1000).toFixed(1)}k`
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`
  }
  return num.toString()
}

/**
 * 检测文本是否是乱码/加密内容
 */
function isGarbageText(text: string): boolean {
  if (!text || text.length < 20) return false
  
  // 检测 WAF/加密标记
  if (/_waf_|waf_bd|"_waf|_waf"/i.test(text)) return true
  
  // 检测 JSON 格式的加密内容
  if (/^\s*\{.*"_?\w+_?\w*":\s*"[A-Za-z0-9+/=]{20,}"/.test(text)) return true
  
  // 检测大量 Base64 风格字符
  const matches = text.match(/[A-Za-z0-9+/=]{30,}/g) || []
  const totalMatchLength = matches.reduce((sum, m) => sum + m.length, 0)
  if (totalMatchLength > text.length * 0.4) return true
  
  return false
}

/**
 * 格式化文本内容，清理多余空白并截断
 */
function formatTextContent(text: string, maxLength: number): React.ReactNode {
  // 先检查是否是乱码
  if (isGarbageText(text)) {
    return null
  }
  
  // 清理多余的空白行
  let cleaned = text
    .replace(/\n{3,}/g, '\n\n')  // 合并多个空行
    .replace(/[ \t]+/g, ' ')     // 合并空格
    .trim()
  
  // 截断
  if (cleaned.length > maxLength) {
    // 尝试在句子结束处截断
    const truncated = cleaned.slice(0, maxLength)
    const lastPeriod = Math.max(
      truncated.lastIndexOf('。'),
      truncated.lastIndexOf('.'),
      truncated.lastIndexOf('！'),
      truncated.lastIndexOf('？')
    )
    
    if (lastPeriod > maxLength * 0.6) {
      cleaned = truncated.slice(0, lastPeriod + 1)
    } else {
      cleaned = truncated
    }
    
    return (
      <>
        {cleaned}
        <span style={{ color: '#9ca3af', marginLeft: '4px' }}>... [点击查看全文]</span>
      </>
    )
  }
  
  return cleaned
}

// Global styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = `
    .smart-lens-preview-card * {
      box-sizing: border-box;
    }
    .smart-lens-preview-card ::-webkit-scrollbar {
      width: 4px;
    }
    .smart-lens-preview-card ::-webkit-scrollbar-track {
      background: transparent;
    }
    .smart-lens-preview-card ::-webkit-scrollbar-thumb {
      background: #d1d5db;
      border-radius: 2px;
    }
    @keyframes smart-lens-spin {
      to { transform: rotate(360deg); }
    }
  `
  document.head.appendChild(style)
}
