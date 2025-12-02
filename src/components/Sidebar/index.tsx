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

  const handleSelectSuggestion = (suggestion: string) => {
    chatCompletion.submitQuery({ text: suggestion, files: [] })
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
