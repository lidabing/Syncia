const en = {
  // Settings Page
  settings: {
    title: 'Settings',
    subtitle: 'Customize your Syncia experience.',
    footer: 'Made with ❤️ by Syncia Team',
  },

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
    language: 'Language',
    languageDesc: 'Choose your preferred language',
    theme: 'Theme Mode',
    themeDesc: 'Choose your preferred theme',
    themeLight: 'Light',
    themeDark: 'Dark',
    themeSystem: 'System',
    webpageContext: 'Webpage Context',
    webpageContextDesc: 'Let AI answer questions based on the content of the current webpage',
  },

  // Chat Settings
  chat: {
    title: 'Chat Settings',
    description: 'Configure AI models and API',
    apiKey: 'OpenAI API Key',
    apiKeyDesc: 'Get it from platform.openai.com',
    apiKeyPlaceholder: 'sk-xxxxxxxxxxxxxxxx',
    customEndpoint: 'Custom API Endpoint',
    customEndpointDesc: 'For Ollama or other OpenAI compatible services',
    customEndpointPlaceholder: 'https://api.openai.com/v1',
    model: 'Model',
    modelDesc: 'Choose the AI model',
    creativity: 'Creativity',
    creativityDesc: 'Creative mode generates more diverse responses',
    save: 'Save',
  },

  // Smart Lens Settings
  smartLens: {
    title: 'Smart Lens',
    description: 'Instant content previews on link hover',
    enable: 'Enable Smart Lens',
    enableDesc: 'Show preview card on link hover',
    triggerMode: 'Trigger Mode',
    triggerModeDesc: 'Choose how to trigger the preview',
    triggerSpace: 'Hover + Space',
    triggerSpaceDesc: 'Like macOS Quick Look',
    triggerHover: 'Automatic Hover',
    triggerHoverDesc: 'Show automatically with a delay',
    triggerShift: 'Hover + Shift',
    triggerShiftDesc: 'Trigger by holding Shift',
    recommended: 'Recommended',
    hoverDelay: 'Hover Delay',
    hoverDelayDesc: 'Wait time before showing the preview',
    previewMode: 'Default Preview Mode',
    previewModeDesc: 'Choose the default display style',
    previewIframe: '🖥️ Full Preview',
    previewMetadata: '📄 Info Summary',
    visualCue: 'Show Visual Cue',
    visualCueDesc: 'Display preview icon next to links',
    aiSummary: 'AI Summary',
    aiSummaryDesc: 'Generate content summaries using AI',
    pinFeature: 'Pin Feature',
    pinFeatureDesc: 'Pin previews to the screen',
    excludedDomains: 'Excluded Domains',
    excludedDomainsDesc: "Don't show previews on these sites",
    tips: 'Tips',
    tip1: '• Recommended to use Space key mode to avoid accidental triggers',
    tip2: '• Supports articles, videos, GitHub repositories, etc.',
    tip3: '• AI summaries will consume additional API calls',
  },

  // Quick Menu Settings
  quickMenu: {
    title: 'Quick Menu',
    description: 'Quickly call AI after selecting text',
    enable: 'Enable Quick Menu',
    enableDesc: 'Show floating menu when text is selected',
    excludedSites: 'Excluded Sites',
    excludedSitesDesc: "Don't show the quick menu on these sites (comma-separated, wildcards supported)",
    excludedSitesPlaceholder: 'e.g., google.com, youtube.com, *.example.com',
  },

  // Prompt Settings
  prompts: {
    title: 'Prompt Management',
    description: 'Drag to sort, edit or add custom prompts',
    customize: 'Customize Prompts',
    customizeDesc: 'Drag to reorder, click to edit, or add new prompts',
    restore: 'Restore Default Prompts',
    restoreWarning: 'Warning: This action is irreversible',
    restoreBtn: 'Restore',
    cancel: 'Cancel',
    confirmRestore: 'Confirm Restore',
  },

  // Common
  common: {
    save: 'Save',
    cancel: 'Cancel',
    confirm: 'Confirm',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
  },
}

export default en
