/**
 * Smart Lens (智能预览透镜) Configuration
 * 
 * Non-destructive interaction for link previews
 */

export interface SmartLensSettings {
  enabled: boolean
  triggerMode: 'space' | 'hover' | 'shift-hover'
  hoverDelay: number // milliseconds
  enabledDomains: string[] // 启用的域名，空数组表示全部启用
  excludedDomains: string[] // 排除的域名
  showVisualCue: boolean // 显示视觉暗示图标
  enableAISummary: boolean // 启用 AI 摘要
  cardPosition: 'auto' | 'right' | 'bottom' | 'left' | 'top'
  maxWidth: number // 卡片最大宽度 (px)
  enablePinMode: boolean // 启用钉住模式
  defaultPreviewMode: 'iframe' | 'metadata' // 默认预览模式
}

export const DEFAULT_SMART_LENS_SETTINGS: SmartLensSettings = {
  enabled: false, // 默认关闭，用户手动启用
  triggerMode: 'space', // 推荐方案：悬停 + Space
  hoverDelay: 1500, // 1.5 秒
  enabledDomains: [],
  excludedDomains: [],
  showVisualCue: true,
  enableAISummary: true,
  cardPosition: 'auto',
  maxWidth: 400,
  enablePinMode: true,
  defaultPreviewMode: 'iframe', // 默认使用 iframe 完整预览
}

export interface LinkPreviewData {
  type: 'article' | 'video' | 'code' | 'product' | 'generic'
  url: string
  title?: string
  description?: string
  image?: string
  favicon?: string
  siteName?: string
  author?: string
  publishDate?: string
  readTime?: string
  aiSummary?: string
  // Article specific - 正文内容
  textContent?: string
  // Video specific
  thumbnailUrl?: string
  duration?: string
  videoId?: string
  videoPlatform?: 'youtube' | 'bilibili' | 'vimeo' | 'other'
  chapters?: { time: string; title: string }[]
  // Code specific
  stars?: number
  language?: string
  lastUpdate?: string
  forks?: number
  // Product specific
  price?: string
  rating?: number
  // Metadata
  metadata?: Record<string, string>
}
