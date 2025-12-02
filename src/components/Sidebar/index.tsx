import Auth from './auth'
import Chat from './chat'
import Header from './layout/header'
import { useSettings } from '../../hooks/useSettings'
import useThemeSync from '../../hooks/useThemeSync'
import { useChatCompletion } from '../../hooks/useChatCompletion'
import { SYSTEM_PROMPT } from '../../config/prompts'

function Sidebar() {
  const [settings] = useSettings()
  useThemeSync()

  const chatCompletion = useChatCompletion({
    model: settings.chat.model!,
    apiKey: settings.chat.openAIKey!,
    mode: settings.chat.mode,
    systemPrompt: SYSTEM_PROMPT,
    baseURL: settings.chat.openAiBaseUrl || '',
  })

  return (
    <div className="cdx-flex cdx-backdrop-blur-sm cdx-flex-col cdx-min-h-screen cdx-shadow-md cdx-border-l dark:!cdx-text-white dark:cdx-border-neutral-800 cdx-border-neutral-200 cdx-top-0 cdx-right-0 cdx-w-[400px] cdx-h-full dark:cdx-bg-neutral-800/90 cdx-bg-neutral-100/90">
      <Header clearMessages={chatCompletion.clearMessages} />
      {settings.chat.openAIKey && settings.chat.model ? (
        <Chat settings={settings} chatCompletion={chatCompletion} />
      ) : (
        <Auth />
      )}
    </div>
  )
}

export default Sidebar
