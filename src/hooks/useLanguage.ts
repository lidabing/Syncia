import { useCallback, useEffect, useState } from 'react'
import { type Language, getTranslations, detectBrowserLanguage, type Translations } from '../i18n'

const STORAGE_KEY = 'SYNCIA_LANGUAGE'

export const useLanguage = () => {
  const [language, setLanguageState] = useState<Language>('zh')
  const [translations, setTranslations] = useState<Translations>(getTranslations('zh'))

  useEffect(() => {
    // Load language from storage
    try {
      chrome.storage.sync.get(STORAGE_KEY, (result) => {
        if (chrome.runtime.lastError) {
          console.warn('Failed to load language setting:', chrome.runtime.lastError)
          const detected = detectBrowserLanguage()
          setLanguageState(detected)
          setTranslations(getTranslations(detected))
          return
        }
        
        const storedLang = result[STORAGE_KEY] as Language | undefined
        if (storedLang) {
          setLanguageState(storedLang)
          setTranslations(getTranslations(storedLang))
        } else {
          // Default to browser language
          const detected = detectBrowserLanguage()
          setLanguageState(detected)
          setTranslations(getTranslations(detected))
        }
      })
    } catch {
      // Fallback for when chrome.storage is not available
      const detected = detectBrowserLanguage()
      setLanguageState(detected)
      setTranslations(getTranslations(detected))
    }

    // Listen for language changes from other contexts
    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes[STORAGE_KEY]?.newValue) {
        const newLang = changes[STORAGE_KEY].newValue as Language
        setLanguageState(newLang)
        setTranslations(getTranslations(newLang))
      }
    }

    try {
      chrome.storage.onChanged.addListener(handleStorageChange)
      return () => {
        chrome.storage.onChanged.removeListener(handleStorageChange)
      }
    } catch {
      // Ignore if chrome.storage is not available
    }
  }, [])

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang)
    setTranslations(getTranslations(lang))
    
    try {
      chrome.storage.sync.set({ [STORAGE_KEY]: lang }, () => {
        if (chrome.runtime.lastError) {
          console.warn('Failed to save language setting:', chrome.runtime.lastError)
        }
      })
    } catch {
      // Ignore if chrome.storage is not available
    }
  }, [])

  return {
    language,
    setLanguage,
    t: translations,
  }
}

export type { Language, Translations }
