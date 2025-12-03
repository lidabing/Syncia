/**
 * Settings Migration Script
 * Ensures existing users get new default settings fields
 */

import { defaultSettings } from '../config/settings'
import { defaultPrompts } from '../config/prompts/default'

export async function migrateSettings() {
  try {
    // Migrate sync storage (SETTINGS)
    const syncResult = await chrome.storage.sync.get('SETTINGS')
    const currentSettings = syncResult.SETTINGS

    if (currentSettings) {
      // 深度合并：保留现有设置，添加新字段
      const migratedSettings = {
        ...defaultSettings,
        ...currentSettings,
        // 确保嵌套对象也被合并
        quickMenu: {
          ...defaultSettings.quickMenu,
          ...currentSettings.quickMenu,
        },
        chat: {
          ...defaultSettings.chat,
          ...currentSettings.chat,
        },
        general: {
          ...defaultSettings.general,
          ...currentSettings.general,
        },
        smartLens: {
          ...defaultSettings.smartLens,
          ...(currentSettings.smartLens || {}),
        },
      }

      // 保存迁移后的设置
      await chrome.storage.sync.set({ SETTINGS: migratedSettings })
      console.log('✅ Settings migrated successfully')
    } else {
      // 首次安装，使用默认设置
      await chrome.storage.sync.set({ SETTINGS: defaultSettings })
      console.log('✅ Default settings initialized')
    }

    // Migrate local storage (PROMPTS)
    const localResult = await chrome.storage.local.get('PROMPTS')
    const currentPrompts = localResult.PROMPTS

    if (!currentPrompts || !Array.isArray(currentPrompts)) {
      // 如果 PROMPTS 不存在或不是数组，使用默认值
      await chrome.storage.local.set({ PROMPTS: defaultPrompts })
      console.log('✅ Default prompts initialized')
    }
  } catch (error) {
    console.error('❌ Settings migration failed:', error)
  }
}
