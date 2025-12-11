/**
 * Page Vision (页面智能识别) Configuration
 * 
 * AI-powered page recognition to infer user intent and provide suggestions
 */

// 页面类别
export type PageCategory = 
  | 'ecommerce'      // 电商详情页
  | 'coding'         // 代码/技术页面
  | 'article'        // 新闻/文章
  | 'documentation'  // 技术文档
  | 'social'         // 社交媒体
  | 'video'          // 视频平台
  | 'dashboard'      // 控制面板/后台
  | 'form'           // 表单/预订页面
  | 'search'         // 搜索结果页
  | 'general'        // 通用页面

// 用户意图
export type UserIntent = 
  | 'browsing'       // 浏览中
  | 'learning'       // 学习/研究
  | 'debugging'      // 调试/解决问题
  | 'shopping'       // 购物决策
  | 'comparing'      // 比较分析
  | 'reading'        // 阅读理解
  | 'filling_form'   // 填写表单
  | 'watching'       // 观看视频
  | 'unknown'        // 未知

// 推荐操作
export interface SuggestedAction {
  id: string
  label: string           // 按钮文字，如 "总结全文"
  query: string           // 发送给 AI 的实际提问
  icon?: string           // 可选图标标识
  priority: number        // 优先级，越小越靠前
  category: 'primary' | 'secondary' | 'utility'  // 操作分类
}

// AI 分析结果
export interface PageVisionResult {
  pageCategory: PageCategory
  userIntent: UserIntent
  reasoning: string                // AI 的推理解释
  confidence: number              // 置信度 0-1
  pageSummary: string             // 页面一句话摘要
  keyElements: string[]           // 识别到的关键元素
  actions: SuggestedAction[]      // 推荐操作列表
  metadata?: {
    detectedLanguage?: string     // 页面语言
    hasCode?: boolean             // 是否包含代码
    hasPricing?: boolean          // 是否有价格信息
    hasForm?: boolean             // 是否有表单
    hasVideo?: boolean            // 是否有视频
    sensitiveContent?: boolean    // 是否检测到敏感内容
  }
  timestamp: number               // 分析时间戳
  screenshotUsed: boolean         // 是否使用了截图
}

// 页面视觉设置
export interface PageVisionSettings {
  enabled: boolean
  autoAnalyze: boolean           // 是否自动分析（侧边栏打开时）
  useScreenshot: boolean         // 是否使用截图（多模态）
  compressImage: boolean         // 是否压缩图片
  imageQuality: number           // 压缩质量 0-1
  maxImageWidth: number          // 最大图片宽度
  includePageMeta: boolean       // 是否包含页面元信息
  showConfidence: boolean        // 是否显示置信度
  cacheResults: boolean          // 是否缓存结果
  cacheDuration: number          // 缓存时长（分钟）
  sensitiveContentWarning: boolean  // 敏感内容警告
  excludedDomains: string[]      // 排除的域名
}

export const DEFAULT_PAGE_VISION_SETTINGS: PageVisionSettings = {
  enabled: true,
  autoAnalyze: false,            // 默认不自动分析，用户手动触发
  useScreenshot: true,           // 默认使用截图
  compressImage: true,           // 默认压缩
  imageQuality: 0.8,             // 80% 质量
  maxImageWidth: 1280,           // 最大 1280px 宽
  includePageMeta: true,         // 包含元信息
  showConfidence: false,         // 不显示置信度
  cacheResults: true,            // 缓存结果
  cacheDuration: 5,              // 5 分钟缓存
  sensitiveContentWarning: true, // 敏感内容警告
  excludedDomains: [
    '*.bank.com',
    '*banking*',
    'mail.google.com',
    'outlook.live.com',
  ],
}

// 预定义的操作模板（按页面类别）
export const ACTION_TEMPLATES: Record<PageCategory, Partial<SuggestedAction>[]> = {
  ecommerce: [
    { label: '分析优缺点', query: '基于页面内容，分析这个产品的优点和缺点，帮我做购买决策', priority: 1, category: 'primary' },
    { label: '全网比价', query: '帮我搜索这个产品在其他平台的价格，找到最优惠的购买渠道', priority: 2, category: 'primary' },
    { label: '历史价格', query: '这个产品的价格趋势如何？现在是好的购买时机吗？', priority: 3, category: 'secondary' },
    { label: '评论总结', query: '总结用户评论中的主要反馈，有哪些常见的问题或赞美？', priority: 4, category: 'secondary' },
  ],
  coding: [
    { label: '解释代码', query: '解释这段代码的作用和实现逻辑', priority: 1, category: 'primary' },
    { label: '修复Bug', query: '分析页面中的错误信息，提供修复方案', priority: 2, category: 'primary' },
    { label: '生成测试', query: '为页面中的代码生成单元测试', priority: 3, category: 'secondary' },
    { label: '优化建议', query: '分析代码的性能和可读性，提供优化建议', priority: 4, category: 'secondary' },
  ],
  article: [
    { label: '一句话总结', query: '用一句话总结这篇文章的核心观点', priority: 1, category: 'primary' },
    { label: '关键要点', query: '提取这篇文章的3-5个关键要点', priority: 2, category: 'primary' },
    { label: '深入分析', query: '分析文章的论点逻辑，评估其可信度和论证质量', priority: 3, category: 'secondary' },
    { label: '延伸阅读', query: '基于这篇文章的主题，推荐相关的延伸阅读方向', priority: 4, category: 'utility' },
  ],
  documentation: [
    { label: '快速入门', query: '帮我快速理解这个文档的核心概念和使用方法', priority: 1, category: 'primary' },
    { label: '示例代码', query: '生成使用这个功能的示例代码', priority: 2, category: 'primary' },
    { label: '常见问题', query: '这个技术/工具有哪些常见的坑或注意事项？', priority: 3, category: 'secondary' },
    { label: '对比分析', query: '这个解决方案与其他类似方案相比有什么优劣？', priority: 4, category: 'utility' },
  ],
  social: [
    { label: '内容摘要', query: '总结这个帖子/讨论的主要内容', priority: 1, category: 'primary' },
    { label: '观点分析', query: '分析评论区的主要观点和情绪倾向', priority: 2, category: 'secondary' },
    { label: '热度分析', query: '这个话题为什么会引起关注？有什么背景？', priority: 3, category: 'utility' },
  ],
  video: [
    { label: '视频总结', query: '根据视频标题和描述，总结这个视频的主要内容', priority: 1, category: 'primary' },
    { label: '时间戳导航', query: '列出视频的关键时间点和对应内容', priority: 2, category: 'secondary' },
    { label: '相关推荐', query: '推荐类似主题的其他视频或内容', priority: 3, category: 'utility' },
  ],
  dashboard: [
    { label: '数据分析', query: '分析页面上显示的关键数据和趋势', priority: 1, category: 'primary' },
    { label: '异常检测', query: '识别数据中的异常值或需要关注的指标', priority: 2, category: 'primary' },
    { label: '报告生成', query: '基于这些数据生成一份简要报告', priority: 3, category: 'secondary' },
  ],
  form: [
    { label: '翻译表单', query: '翻译页面上的表单字段和说明', priority: 1, category: 'primary' },
    { label: '填写建议', query: '这个表单应该如何填写？有什么注意事项？', priority: 2, category: 'primary' },
    { label: '货币换算', query: '将页面上的价格转换为人民币', priority: 3, category: 'utility' },
  ],
  search: [
    { label: '结果总结', query: '总结搜索结果的主要发现', priority: 1, category: 'primary' },
    { label: '筛选建议', query: '根据我的搜索意图，哪些结果最相关？', priority: 2, category: 'secondary' },
    { label: '优化搜索', query: '如何优化搜索关键词获得更好的结果？', priority: 3, category: 'utility' },
  ],
  general: [
    { label: '总结页面', query: '总结这个页面的主要内容', priority: 1, category: 'primary' },
    { label: '翻译页面', query: '翻译页面的主要内容', priority: 2, category: 'secondary' },
    { label: '提取信息', query: '提取页面中的关键信息和数据', priority: 3, category: 'utility' },
  ],
}

// 敏感关键词列表
export const SENSITIVE_KEYWORDS = [
  'password', 'pwd', '密码',
  'credit card', '信用卡', 'visa', 'mastercard',
  'bank', '银行', 'banking',
  'social security', 'ssn', '身份证',
  'login', 'signin', '登录',
  'private', 'secret', '私密',
]
