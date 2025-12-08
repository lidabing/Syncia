const zh = {
  // Settings Page
  settings: {
    title: '设置',
    subtitle: '自定义您的 Syncia 体验。',
    footer: '由 Syncia 团队用 ❤️ 制作',
  },

  // Tabs
  tabs: {
    general: '通用',
    chat: '聊天',
    smartLens: '智能预览',
    quickMenu: '快捷菜单',
    prompts: '提示词',
  },

  // General Settings
  general: {
    title: '通用设置',
    language: '语言',
    languageDesc: '选择您偏好的语言',
    theme: '主题模式',
    themeDesc: '选择您偏好的主题',
    themeLight: '浅色',
    themeDark: '深色',
    themeSystem: '跟随系统',
    webpageContext: '网页上下文',
    webpageContextDesc: '让 AI 根据当前网页内容回答问题',
  },

  // Chat Settings
  chat: {
    title: '聊天设置',
    description: '配置 AI 模型和 API',
    apiKey: 'OpenAI API 密钥',
    apiKeyDesc: '从 platform.openai.com 获取',
    apiKeyPlaceholder: 'sk-xxxxxxxxxxxxxxxx',
    customEndpoint: '自定义 API 端点',
    customEndpointDesc: '用于 Ollama 或其他 OpenAI 兼容服务',
    customEndpointPlaceholder: 'https://api.openai.com/v1',
    model: '模型',
    modelDesc: '选择 AI 模型',
    creativity: '创造力',
    creativityDesc: '创意模式会生成更多样化的回复',
    save: '保存',
  },

  // Smart Lens Settings
  smartLens: {
    title: '智能预览',
    description: '悬停链接时即时预览内容',
    enable: '启用智能预览',
    enableDesc: '悬停链接时显示预览卡片',
    triggerMode: '触发模式',
    triggerModeDesc: '选择如何触发预览',
    triggerSpace: '悬停 + 空格键',
    triggerSpaceDesc: '类似 macOS 快速预览',
    triggerHover: '自动悬停',
    triggerHoverDesc: '延迟后自动显示',
    triggerShift: '悬停 + Shift键',
    triggerShiftDesc: '按住 Shift 键触发',
    recommended: '推荐',
    hoverDelay: '悬停延迟',
    hoverDelayDesc: '显示预览前的等待时间',
    previewMode: '默认预览模式',
    previewModeDesc: '选择默认的显示样式',
    previewIframe: '🖥️ 完整预览',
    previewMetadata: '📄 信息摘要',
    visualCue: '显示视觉提示',
    visualCueDesc: '在链接旁边显示预览图标',
    aiSummary: 'AI 摘要',
    aiSummaryDesc: '使用 AI 生成内容摘要',
    pinFeature: '固定功能',
    pinFeatureDesc: '将预览固定在屏幕上',
    excludedDomains: '排除的域名',
    excludedDomainsDesc: '不在这些网站上显示预览',
    tips: '提示',
    tip1: '• 建议使用空格键模式以避免意外触发',
    tip2: '• 支持文章、视频、GitHub 仓库等',
    tip3: '• AI 摘要会消耗额外的 API 调用',
  },

  // Quick Menu Settings
  quickMenu: {
    title: '快捷菜单',
    description: '选中文本后快速调用 AI',
    enable: '启用快捷菜单',
    enableDesc: '选中文本时显示悬浮菜单',
    excludedSites: '排除的网站',
    excludedSitesDesc: '不在这些网站上显示快捷菜单（逗号分隔，支持通配符）',
    excludedSitesPlaceholder: '例如：google.com, youtube.com, *.example.com',
  },

  // Prompt Settings
  prompts: {
    title: '提示词管理',
    description: '拖拽排序、编辑或添加自定义提示词',
    customize: '自定义提示词',
    customizeDesc: '拖拽重新排序、点击编辑或添加新提示词',
    restore: '恢复默认提示词',
    restoreWarning: '警告：此操作不可撤销',
    restoreBtn: '恢复',
    cancel: '取消',
    confirmRestore: '确认恢复',
  },

  // Common
  common: {
    save: '保存',
    cancel: '取消',
    confirm: '确认',
    delete: '删除',
    edit: '编辑',
    add: '添加',
  },
}

export default zh
