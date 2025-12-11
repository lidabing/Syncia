import type { Translations } from './en'

export const zh: Translations = {
  // 通用
  common: {
    save: '保存',
    cancel: '取消',
    delete: '删除',
    edit: '编辑',
    add: '添加',
    confirm: '确认',
    close: '关闭',
    send: '发送',
    stop: '停止',
    clear: '清空',
    copy: '复制',
    copied: '已复制！',
    loading: '加载中...',
    enabled: '已启用',
    disabled: '已禁用',
    recommended: '推荐',
  },

  // 头部
  header: {
    title: '千羽助手',
    newChat: '新建对话',
    settings: '设置',
    close: '关闭',
    aiPowered: 'AI 驱动',
  },

  // 设置页面
  settings: {
    title: '设置',
    subtitle: '自定义你的千羽助手体验。',
    footer: '由千羽助手团队用 ❤️ 制作',

    // 标签页
    tabs: {
      general: '通用',
      chat: '聊天',
      smartLens: '智能预览',
      quickMenu: '快捷菜单',
      prompts: '提示词',
    },

    // 通用设置
    general: {
      title: '通用设置',
      theme: {
        title: '主题模式',
        description: '选择你喜欢的主题',
        light: '浅色',
        dark: '深色',
        system: '跟随系统',
      },
      language: {
        title: '语言',
        description: '选择你偏好的语言',
      },
      webpageContext: {
        title: '网页上下文',
        description: '让 AI 根据当前网页内容回答问题',
      },
    },

    // 聊天设置
    chat: {
      title: '聊天设置',
      description: '配置 AI 模型和 API',
      apiKey: {
        title: 'OpenAI API 密钥',
        description: '从 platform.openai.com 获取',
        placeholder: 'sk-xxxxxxxxxxxxxxxx',
      },
      baseUrl: {
        title: '自定义 API 端点',
        description: '用于 Ollama 或其他兼容 OpenAI 的服务',
        placeholder: 'https://api.openai.com/v1',
      },
      model: {
        title: '模型',
        description: '选择 AI 模型',
      },
      creativity: {
        title: '创造力',
        description: '创意模式会生成更多样化的回复',
        modes: {
          highlyPrecise: '高度精确',
          precise: '精确',
          balanced: '平衡',
          creative: '创意',
        },
      },
    },

    // 快捷菜单设置
    quickMenu: {
      title: '快捷菜单',
      description: '选中文本后快速调用 AI',
      enable: {
        title: '启用快捷菜单',
        description: '选中文本时显示浮动菜单',
      },
      excludedSites: {
        title: '排除的网站',
        description: '在这些网站上不显示快捷菜单（逗号分隔，支持通配符）',
        placeholder: '例如：google.com, youtube.com, *.example.com',
      },
    },

    // 智能预览设置
    smartLens: {
      title: '智能预览',
      description: '鼠标悬停在链接上时即时预览内容',
      enable: {
        title: '启用智能预览',
        description: '鼠标悬停在链接上时显示预览卡片',
      },
      triggerMode: {
        title: '触发方式',
        description: '选择如何触发预览',
        modes: {
          space: {
            label: '悬停 + 空格',
            desc: '类似 macOS 快速查看',
          },
          hover: {
            label: '自动悬停',
            desc: '延迟后自动显示',
          },
          shiftHover: {
            label: '悬停 + Shift',
            desc: '按住 Shift 键触发',
          },
        },
      },
      hoverDelay: {
        title: '悬停延迟',
        description: '显示预览前的等待时间（毫秒）',
      },
      previewSize: {
        title: '预览大小',
        description: '选择预览卡片的尺寸',
        sizes: {
          compact: '紧凑',
          standard: '标准',
          large: '大',
        },
      },
      defaultPreviewMode: {
        title: '默认预览模式',
        description: '选择默认的显示样式',
        modes: {
          iframe: '🖥️ 完整预览',
          metadata: '📄 信息摘要',
        },
      },
      showVisualCue: {
        title: '显示视觉提示',
        description: '在链接旁边显示预览图标',
      },
      enableAI: {
        title: 'AI 摘要',
        description: '使用 AI 生成内容摘要',
      },
      enablePinMode: {
        title: '固定功能',
        description: '将预览固定在屏幕上',
      },
      excludedDomains: {
        title: '排除的域名',
        description: '不为这些域名显示预览',
        placeholder: 'example.com\nlocalhost',
      },
      tips: {
        title: '提示',
        tip1: '推荐使用空格键模式，避免误触发',
        tip2: '支持文章、视频、GitHub 仓库等',
        tip3: 'AI 摘要会消耗额外的 API 调用',
      },
    },

    // 提示词设置
    prompts: {
      title: '提示词管理',
      description: '拖拽排序、编辑或添加自定义提示词',
      customPrompts: {
        title: '自定义提示词',
        description: '拖拽重新排序，点击编辑，或添加新提示词',
      },
      addCategory: '添加分类',
      addPrompt: '添加提示词',
      addNewCategory: '添加新分类',
      addNewPrompt: '添加新提示词',
      editPrompt: '编辑提示词',
      editCategory: '编辑分类',
      deletePrompt: '删除提示词？',
      deleteConfirm: '你即将删除此提示词。此操作无法撤销。',
      promptName: '名称',
      promptContent: '提示词内容',
      categoryHint: '分类用于组织你的提示词。创建新分类或提示词后，它们将出现在列表末尾。你可以拖放它们以按你的意愿重新排序。',
      restore: {
        title: '恢复默认提示词',
        description: '警告：此操作不可撤销',
        button: '恢复',
        confirm: '确认恢复',
      },
      edit: '编辑',
      save: '保存',
      cancel: '取消',
      delete: '删除',
    },
  },

  // 聊天界面
  chat: {
    placeholder: '输入消息...',
    sendMessage: '发送消息',
    stopGenerating: '停止生成',
    clearChat: '清空对话',
    regenerate: '重新生成',
    webpageContextOn: '已启用网页上下文',
    webpageContextOff: '已禁用网页上下文',
    noMessages: '在下方输入消息开始对话。',
    thinking: '思考中...',
    errorOccurred: '发生错误，请重试。',
    copyCode: '复制代码',
    codeCopied: '代码已复制！',
  },

  // 快捷菜单
  quickMenu: {
    askAI: '询问 AI',
    generating: '生成中...',
  },

  // 智能预览
  smartLens: {
    loading: '加载预览中...',
    noPreview: '无法预览',
    pin: '固定',
    unpin: '取消固定',
    close: '关闭',
    aiSummary: 'AI 摘要',
    readMore: '阅读更多',
  },

  // 错误消息
  errors: {
    apiKeyInvalid: 'API 密钥无效',
    apiKeyRequired: '需要 API 密钥',
    networkError: '网络错误，请检查你的连接。',
    unknownError: '发生未知错误',
    extensionReloaded: '扩展已重新加载，请刷新页面。',
  },
}
