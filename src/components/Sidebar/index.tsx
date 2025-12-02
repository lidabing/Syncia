import Auth from './auth'
import Chat from './chat'
import Header from './layout/header'
import { useSettings } from '../../hooks/useSettings'
import useThemeSync from '../../hooks/useThemeSync'
import { useChatCompletion } from '../../hooks/useChatCompletion'
import { SYSTEM_PROMPT } from '../../config/prompts'
import type { Settings } from '../../config/settings'

// This component contains the hooks and state for the chat view.
// It's only rendered when the user has provided an API key and model.
const ChatView = ({ settings }: { settings: Settings }) => {
  const chatCompletion = useChatCompletion({
    model: settings.chat.model!,
    apiKey: settings.chat.openAIKey!,
    mode: settings.chat.mode,
    systemPrompt: SYSTEM_PROMPT,
    baseURL: settings.chat.openAiBaseUrl || '',
  })

  const handleSelectSuggestion = async (suggestion: string) => {
    // 获取当前页面内容作为上下文
    let context: string | undefined
    if (settings.general.webpageContext) {
      try {
        context = await new Promise<string>((resolve) => {
          const handleResponse = (event: MessageEvent) => {
            if (event.data.action === 'get-page-content' && event.data.payload) {
              window.removeEventListener('message', handleResponse)
              resolve(event.data.payload)
            }
          }

          window.addEventListener('message', handleResponse)
          window.parent.postMessage({ action: 'get-page-content' }, '*')

          // 超时处理
          setTimeout(() => {
            window.removeEventListener('message', handleResponse)
            resolve('')
          }, 3000)
        })
      } catch (err) {
        console.error('[handleSelectSuggestion] Failed to get page content:', err)
        context = undefined
      }
    }

    chatCompletion.submitQuery({ text: suggestion, files: [] }, context)
  }

  return (
    <>
      <Header 
        clearMessages={chatCompletion.clearMessages} 
        onSelectSuggestion={handleSelectSuggestion}
      />
      <Chat settings={settings} chatCompletion={chatCompletion} />
    </>
  )
}

function Sidebar() {
  const [settings] = useSettings()
  useThemeSync()

  return (
    <div className="cdx-flex cdx-backdrop-blur-md cdx-flex-col cdx-h-screen cdx-w-full cdx-shadow-2xl cdx-border-l dark:!cdx-text-white dark:cdx-border-neutral-700/50 cdx-border-neutral-200/80 cdx-top-0 cdx-right-0 dark:cdx-bg-neutral-900/95 cdx-bg-white/95">
      {settings.chat.openAIKey && settings.chat.model ? (
        <ChatView settings={settings} />
      ) : (
        <>
          {/* Render a header without the "New Chat" button */}
          <Header />
          <Auth />
        </>
      )}
    </div>
  )
}

export default Sidebar
