import React, { useEffect } from 'react'
import ChatList from './ChatList'
import { SidebarInput } from './ChatInput'
import PageSuggestions from './PageSuggestions'
import { useChatCompletion } from '../../../hooks/useChatCompletion'
import { SYSTEM_PROMPT } from '../../../config/prompts'
import type { Settings } from '../../../config/settings'
import { useMessageDraft } from '../../../hooks/useMessageDraft'

interface ChatProps {
  settings: Settings
}

const Chat = ({ settings }: ChatProps) => {
  const {
    messages,
    submitQuery,
    clearMessages,
    generating,
    cancelRequest,
    removeMessagePair,
    error,
  } = useChatCompletion({
    model: settings.chat.model!,
    apiKey: settings.chat.openAIKey!,
    mode: settings.chat.mode,
    systemPrompt: SYSTEM_PROMPT,
    baseURL: settings.chat.openAiBaseUrl || '',
  })
  
  const {
    messageDraft,
    setMessageDraftText,
    addMessageDraftFile,
    removeMessageDraftFile,
    resetMessageDraft,
  } = useMessageDraft()

  useEffect(() => {
    const handleWindowMessage = (event: MessageEvent) => {
      const { action, prompt } = event.data as {
        action: string
        prompt: string
      }
      if (action === 'generate') {
        submitQuery({ text: prompt, files: [] })
      }
    }
    window.addEventListener('message', handleWindowMessage)

    return () => {
      window.removeEventListener('message', handleWindowMessage)
    }
  }, [submitQuery])

  const handleSelectSuggestion = (suggestion: string) => {
    setMessageDraftText(suggestion)
  }

  return (
    <>
      <PageSuggestions onSelectSuggestion={handleSelectSuggestion} />
      <ChatList
        messages={messages}
        removeMessagePair={removeMessagePair}
        generating={generating}
        error={error}
      />
      <SidebarInput
        loading={generating}
        submitMessage={submitQuery}
        chatIsEmpty={messages.length <= 1}
        clearMessages={clearMessages}
        cancelRequest={cancelRequest}
        isWebpageContextOn={settings.general.webpageContext}
        isVisionModel={false}
        // Pass down the message draft state and methods
        messageDraft={messageDraft}
        setMessageDraftText={setMessageDraftText}
        addMessageDraftFile={addMessageDraftFile}
        removeMessageDraftFile={removeMessageDraftFile}
        resetMessageDraft={resetMessageDraft}
      />
    </>
  )
}

export default Chat
