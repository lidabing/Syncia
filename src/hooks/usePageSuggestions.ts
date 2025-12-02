import { useEffect, useState } from 'react'
import { useChatCompletion } from './useChatCompletion'
import { useSettings } from './useSettings'
import { useCurrentChat } from './useCurrentChat'
import { readStorage, setStorage } from './useStorage'
import { createSHA256Hash } from '../lib/createSHA256Hash'

interface CachedSuggestions {
  suggestions: string[]
  timestamp: number
  contentHash: string
}

export const usePageSuggestions = () => {
  const [settings] = useSettings()
  const { messages, currentChatId } = useCurrentChat()
  
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [pageUrl, setPageUrl] = useState('')
  const [error, setError] = useState<Error | null>(null)
  const [hasGenerated, setHasGenerated] = useState(false)
  const [urlChangeCount, setUrlChangeCount] = useState(0)

  // Only initialize chat completion if we have valid credentials
  const hasValidSettings = !!(settings.chat.openAIKey && settings.chat.model)
  
  console.log('[usePageSuggestions] Init:', {
    hasValidSettings,
    messagesLength: messages.length,
    currentChatId,
  })
  
  const { analyzePage, generating } = useChatCompletion({
    model: settings.chat.model || 'gpt-3.5-turbo',
    apiKey: settings.chat.openAIKey || '',
    mode: settings.chat.mode,
    systemPrompt: '',
    baseURL: settings.chat.openAiBaseUrl || '',
  })

  // Listen for URL changes and sidebar open events from content script
  useEffect(() => {
    const handleMessages = (event: MessageEvent) => {
      // Handle URL change
      if (event.data.action === 'url-changed') {
        const newUrl = event.data.payload?.url
        console.log('[usePageSuggestions] URL changed to:', newUrl)
        // Reset generation state to trigger new suggestions
        setHasGenerated(false)
        setSuggestions([])
        setPageUrl(newUrl)
        setUrlChangeCount(prev => prev + 1)
      }
      
      // Handle sidebar opened - refresh suggestions
      if (event.data.action === 'sidebar-opened') {
        console.log('[usePageSuggestions] Sidebar opened, refreshing suggestions')
        // Reset generation state to trigger new suggestions
        setHasGenerated(false)
        setSuggestions([])
        setUrlChangeCount(prev => prev + 1)
      }
    }

    window.addEventListener('message', handleMessages)
    return () => window.removeEventListener('message', handleMessages)
  }, [])

  const getPageContent = (): Promise<string> => {
    return new Promise((resolve) => {
      // Listen for response from content script
      const handleResponse = (event: MessageEvent) => {
        if (event.data.action === 'get-page-content' && event.data.payload) {
          window.removeEventListener('message', handleResponse)
          
          // Extract and clean page content
          const rawContent = event.data.payload
          
          // Remove excessive whitespace and empty lines
          const cleanedContent = rawContent
            .split('\n')
            .map((line: string) => line.trim())
            .filter((line: string) => line.length > 0)
            .join('\n')
          
          console.log('[usePageSuggestions] Raw content length:', rawContent.length)
          console.log('[usePageSuggestions] Cleaned content length:', cleanedContent.length)
          
          resolve(cleanedContent)
        }
      }

      window.addEventListener('message', handleResponse)

      // Request page content from parent (content script)
      window.parent.postMessage({ action: 'get-page-content' }, '*')

      // Timeout after 5 seconds
      setTimeout(() => {
        window.removeEventListener('message', handleResponse)
        resolve('')
      }, 5000)
    })
  }

  useEffect(() => {
    const generateSuggestions = async () => {
      console.log('[usePageSuggestions] Effect triggered:', {
        hasValidSettings,
        messagesLength: messages.length,
        hasGenerated,
        currentChatId,
        apiKey: settings.chat.openAIKey ? 'exists' : 'missing',
        model: settings.chat.model,
        baseURL: settings.chat.openAiBaseUrl,
      })

      // Reset when chat changes
      if (currentChatId && messages.length === 0) {
        setHasGenerated(false)
      }

      // Only generate suggestions when conditions are met
      if (!hasValidSettings) {
        console.log('[usePageSuggestions] No valid settings - missing:', {
          apiKey: !settings.chat.openAIKey,
          model: !settings.chat.model,
        })
        setSuggestions([])
        return
      }

      // Only generate for new chats (no messages yet, or only system message)
      // Keep showing suggestions even after messages are sent
      if (messages.length > 1 && hasGenerated) {
        console.log('[usePageSuggestions] Chat has messages, keeping existing suggestions')
        return
      }

      // Don't regenerate if already generated for this chat
      if (hasGenerated && suggestions.length > 0) {
        console.log('[usePageSuggestions] Already generated for this chat')
        return
      }

      setIsLoading(true)
      setError(null)
      
      try {
        const pageContent = await getPageContent()
        console.log('[usePageSuggestions] Page content length:', pageContent.length)
        
        if (pageContent && pageContent.trim().length > 100) {
          console.log('[usePageSuggestions] Analyzing page content...')
          const result = await analyzePage(pageContent)
          console.log('[usePageSuggestions] Generated suggestions:', result)
          setSuggestions(result)
          setHasGenerated(true)

          // 缓存生成的建议
          try {
            const currentUrl = window.location.href
            const contentHash = await createSHA256Hash(pageContent)
            const cacheKey = `SYNCIA_PAGE_SUGGESTIONS_${currentUrl}`
            const cached: CachedSuggestions = {
              suggestions: result,
              timestamp: Date.now(),
              contentHash: contentHash,
            }
            await setStorage(cacheKey, cached, 'local')
            console.log('[usePageSuggestions] Cached suggestions for:', currentUrl)
          } catch (err) {
            console.error('[usePageSuggestions] Failed to cache suggestions:', err)
          }
        } else {
          console.log('[usePageSuggestions] Page content too short, skipping')
          setSuggestions([])
        }
      } catch (err) {
        console.error('[usePageSuggestions] Failed to generate suggestions:', err)
        setError(err as Error)
        setSuggestions([])
      } finally {
        setIsLoading(false)
      }
    }

    generateSuggestions()
  }, [currentChatId, messages.length, hasValidSettings, urlChangeCount])

  return { 
    suggestions, 
    isLoading: isLoading || generating, 
    error,
    hasSuggestions: suggestions.length > 0
  }
}
