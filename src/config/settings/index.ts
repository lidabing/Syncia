import { defaultPrompts } from '../prompts/default'
import type { SmartLensSettings } from './smartLens'
import { DEFAULT_SMART_LENS_SETTINGS } from './smartLens'

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
  smartLens: SmartLensSettings
}

export const defaultSettings: Settings = {
  quickMenu: {
    enabled: true,
    items: defaultPrompts,
    excludedSites: [],
  },
  chat: {
    openAIKey: 'sk-FL5ZZ3228RtJDLwcc8JDDQjuUon48Rbh6greMezkJopR9vNE',
    model: 'deepseek-v3.1',
    mode: Mode.BALANCED,
    openAiBaseUrl: 'https://api.lkeap.cloud.tencent.com/v1',
  },
  general: {
    theme: ThemeOptions.SYSTEM,
    webpageContext: false,
  },
  smartLens: DEFAULT_SMART_LENS_SETTINGS,
}
