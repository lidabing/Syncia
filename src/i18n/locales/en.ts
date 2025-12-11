export const en = {
  // Common
  common: {
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    confirm: 'Confirm',
    close: 'Close',
    send: 'Send',
    stop: 'Stop',
    clear: 'Clear',
    copy: 'Copy',
    copied: 'Copied!',
    loading: 'Loading...',
    enabled: 'Enabled',
    disabled: 'Disabled',
    recommended: 'Recommended',
  },

  // Header
  header: {
    title: 'Syncia',
    newChat: 'New Chat',
    settings: 'Settings',
    close: 'Close',
    aiPowered: 'AI Powered',
  },

  // Settings Page
  settings: {
    title: 'Settings',
    subtitle: 'Customize your Syncia experience.',
    footer: 'Made with ❤️ by Syncia Team',

    // Tabs
    tabs: {
      general: 'General',
      chat: 'Chat',
      smartLens: 'Smart Lens',
      quickMenu: 'Quick Menu',
      prompts: 'Prompts',
    },

    // General Settings
    general: {
      title: 'General Settings',
      theme: {
        title: 'Theme Mode',
        description: 'Choose your preferred theme',
        light: 'Light',
        dark: 'Dark',
        system: 'System',
      },
      language: {
        title: 'Language',
        description: 'Choose your preferred language',
      },
      webpageContext: {
        title: 'Webpage Context',
        description: 'Let AI answer questions based on the content of the current webpage',
      },
    },

    // Chat Settings
    chat: {
      title: 'Chat Settings',
      description: 'Configure AI models and API',
      apiKey: {
        title: 'OpenAI API Key',
        description: 'Get it from platform.openai.com',
        placeholder: 'sk-xxxxxxxxxxxxxxxx',
      },
      baseUrl: {
        title: 'Custom API Endpoint',
        description: 'For Ollama or other OpenAI compatible services',
        placeholder: 'https://api.openai.com/v1',
      },
      model: {
        title: 'Model',
        description: 'Choose the AI model',
      },
      creativity: {
        title: 'Creativity',
        description: 'Creative mode generates more diverse responses',
        modes: {
          highlyPrecise: 'Highly Precise',
          precise: 'Precise',
          balanced: 'Balanced',
          creative: 'Creative',
        },
      },
    },

    // Quick Menu Settings
    quickMenu: {
      title: 'Quick Menu',
      description: 'Quickly call AI after selecting text',
      enable: {
        title: 'Enable Quick Menu',
        description: 'Show floating menu when text is selected',
      },
      excludedSites: {
        title: 'Excluded Sites',
        description: "Don't show the quick menu on these sites (comma-separated, wildcards supported)",
        placeholder: 'e.g., google.com, youtube.com, *.example.com',
      },
    },

    // Smart Lens Settings
    smartLens: {
      title: 'Smart Lens',
      description: 'Instant content previews on link hover',
      enable: {
        title: 'Enable Smart Lens',
        description: 'Show preview card on link hover',
      },
      triggerMode: {
        title: 'Trigger Mode',
        description: 'Choose how to trigger the preview',
        modes: {
          space: {
            label: 'Hover + Space',
            desc: 'Like macOS Quick Look',
          },
          hover: {
            label: 'Automatic Hover',
            desc: 'Show automatically with a delay',
          },
          shiftHover: {
            label: 'Hover + Shift',
            desc: 'Trigger by holding Shift',
          },
        },
      },
      hoverDelay: {
        title: 'Hover Delay',
        description: 'Time to wait before showing preview (ms)',
      },
      previewSize: {
        title: 'Preview Size',
        description: 'Choose the preview card size',
        sizes: {
          compact: 'Compact',
          standard: 'Standard',
          large: 'Large',
        },
      },
      defaultPreviewMode: {
        title: 'Default Preview Mode',
        description: 'Choose the default display style',
        modes: {
          iframe: '🖥️ Full Preview',
          metadata: '📄 Info Summary',
        },
      },
      showVisualCue: {
        title: 'Show Visual Cue',
        description: 'Display preview icon next to links',
      },
      enableAI: {
        title: 'AI Summary',
        description: 'Generate content summaries using AI',
      },
      enablePinMode: {
        title: 'Pin Feature',
        description: 'Pin previews to the screen',
      },
      excludedDomains: {
        title: 'Excluded Domains',
        description: "Don't show preview for these domains",
        placeholder: 'example.com\nlocalhost',
      },
      tips: {
        title: 'Tips',
        tip1: 'Recommended to use Space key mode to avoid accidental triggers',
        tip2: 'Supports articles, videos, GitHub repositories, etc.',
        tip3: 'AI summaries will consume additional API calls',
      },
    },

    // Prompt Settings
    prompts: {
      title: 'Prompt Management',
      description: 'Drag to sort, edit or add custom prompts',
      customPrompts: {
        title: 'Customize Prompts',
        description: 'Drag to reorder, click to edit, or add new prompts',
      },
      addCategory: 'Add Category',
      addPrompt: 'Add Prompt',
      addNewCategory: 'Add New Category',
      addNewPrompt: 'Add New Prompt',
      editPrompt: 'Edit Prompt',
      editCategory: 'Edit Category',
      deletePrompt: 'Delete Prompt',
      deleteConfirm: 'You are about to delete this prompt. This action cannot be undone.',
      promptName: 'Name',
      promptContent: 'Prompt Content',
      categoryHint: 'Categories are used to organize your prompts. After creating a new category or prompt, they will appear at the end of the list. You can drag and drop them to reorder as you wish.',
      restore: {
        title: 'Restore Default Prompts',
        description: 'Warning: This action is irreversible',
        button: 'Restore',
        confirm: 'Confirm Restore',
      },
      edit: 'Edit',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
    },
  },

  // Chat Interface
  chat: {
    placeholder: 'Type a message...',
    sendMessage: 'Send message',
    stopGenerating: 'Stop generating',
    clearChat: 'Clear chat',
    regenerate: 'Regenerate',
    webpageContextOn: 'Webpage context enabled',
    webpageContextOff: 'Webpage context disabled',
    noMessages: 'Start a conversation by typing a message below.',
    thinking: 'Thinking...',
    errorOccurred: 'An error occurred. Please try again.',
    copyCode: 'Copy code',
    codeCopied: 'Code copied!',
  },

  // Quick Menu
  quickMenu: {
    askAI: 'Ask AI',
    generating: 'Generating...',
  },

  // Smart Lens
  smartLens: {
    loading: 'Loading preview...',
    noPreview: 'Preview not available',
    pin: 'Pin',
    unpin: 'Unpin',
    close: 'Close',
    aiSummary: 'AI Summary',
    readMore: 'Read more',
  },

  // Error Messages
  errors: {
    apiKeyInvalid: 'Invalid API key',
    apiKeyRequired: 'API key is required',
    networkError: 'Network error. Please check your connection.',
    unknownError: 'An unknown error occurred',
    extensionReloaded: 'Extension reloaded. Please refresh the page.',
  },
}

export type Translations = typeof en
