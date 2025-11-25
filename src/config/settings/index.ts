import { defaultPrompts } from '../prompts/default'

export enum ThemeOptions {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system',
}

export enum Mode {
  HIGHLY_PRECISE = 0,
  PRECISE = 0.5,
  BALANCED = 1,
  CREATIVE = 1.5,
}

export type Settings = {
  quickMenu: {
    enabled: boolean
    items: typeof defaultPrompts
    excludedSites: string[]
  }
  chat: {
    openAIKey: string | null
    model: string | null
    mode: Mode
    openAiBaseUrl: string | null
  }
  general: {
    theme: ThemeOptions
    webpageContext: boolean
  }
}

export const defaultSettings: Settings = {
  quickMenu: {
    enabled: true,
    items: defaultPrompts,
    excludedSites: [],
  },
  chat: {
    openAIKey: 'sk-F6h6hZge2SKNGGev3dKICElK3pLqXK09aOOkgxI5aWsx6j5n',
    model: 'gpt-3.5-turbo',
    mode: Mode.BALANCED,
    openAiBaseUrl: 'https://api.openai-proxy.org/v1',
  },
  general: {
    theme: ThemeOptions.SYSTEM,
    webpageContext: false,
  },
}
