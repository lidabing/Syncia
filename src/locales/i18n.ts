import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './en'
import zh from './zh'

// 获取保存的语言设置
const getSavedLanguage = (): string => {
  try {
    const saved = localStorage.getItem('syncia-language')
    if (saved && (saved === 'en' || saved === 'zh')) {
      return saved
    }
  } catch (e) {
    console.warn('Failed to get saved language:', e)
  }
  // 默认根据浏览器语言判断
  const browserLang = navigator.language.toLowerCase()
  return browserLang.startsWith('zh') ? 'zh' : 'en'
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    zh: { translation: zh },
  },
  lng: getSavedLanguage(),
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
})

// 保存语言设置
export const changeLanguage = (lang: string) => {
  localStorage.setItem('syncia-language', lang)
  i18n.changeLanguage(lang)
}

export default i18n
