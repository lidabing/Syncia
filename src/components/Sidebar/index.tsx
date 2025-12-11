import { useState } from 'react'
import Auth from './auth'
import Chat from './chat'
import PageVisionView from './pageVision'
import Header from './layout/header'
import { useSettings } from '../../hooks/useSettings'
import useThemeSync from '../../hooks/useThemeSync'
import { useChatCompletion } from '../../hooks/useChatCompletion'
import { SYSTEM_PROMPT } from '../../config/prompts'
import type { Settings } from '../../config/settings'

// Tab 类型
type SidebarTab = 'chat' | 'pageVision'

// This component contains the hooks and state for the chat view.
// It's only rendered when the user has provided an API key and model.
const ChatView = ({ settings }: { settings: Settings }) => {
  const [activeTab, setActiveTab] = useState<SidebarTab>('chat')
  
  const chatCompletion = useChatCompletion({
    model: settings.chat.model!,
    apiKey: settings.chat.openAIKey!,
    mode: settings.chat.mode,
    systemPrompt: SYSTEM_PROMPT,
    baseURL: settings.chat.openAiBaseUrl || '',
  })

  const handleSelectSuggestion = async (suggestion: string) => {
    // 切换到聊天 Tab
    setActiveTab('chat')
    
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
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      {activeTab === 'chat' ? (
        <Chat settings={settings} chatCompletion={chatCompletion} />
      ) : (
        <PageVisionView onSelectAction={handleSelectSuggestion} />
      )}
    </>
  )
}

function Sidebar() {
  const [settings] = useSettings()
  useThemeSync()

  return (
    <div className="cdx-flex cdx-flex-col cdx-h-screen cdx-w-full cdx-border-l dark:!cdx-text-white dark:cdx-border-neutral-800 cdx-border-neutral-200 cdx-top-0 cdx-right-0 dark:cdx-bg-[#1a1a1a] cdx-bg-[#fafafa]">
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
