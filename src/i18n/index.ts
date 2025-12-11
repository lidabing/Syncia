import { en, type Translations } from './locales/en'
import { zh } from './locales/zh'

export type Language = 'en' | 'zh'

export const languages: Record<Language, { name: string; nativeName: string }> = {
  en: { name: 'English', nativeName: 'English' },
  zh: { name: 'Chinese', nativeName: '中文' },
}

const translations: Record<Language, Translations> = {
  en,
  zh,
}

export const getTranslations = (lang: Language): Translations => {
  return translations[lang] || translations.en
}

export const detectBrowserLanguage = (): Language => {
  const browserLang = navigator.language.toLowerCase()
  if (browserLang.startsWith('zh')) {
    return 'zh'
  }
  return 'en'
}

export type { Translations }
export { en, zh }
