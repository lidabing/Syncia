import React, { useEffect, useCallback } from 'react'
import ChatList from './ChatList'
import { SidebarInput } from './ChatInput'
import { useMessageDraft } from '../../../hooks/useMessageDraft'
import type { Settings } from '../../../config/settings'
import type { UseChatCompletion } from '../../../hooks/useChatCompletion'

interface ChatProps {
  settings: Settings
  chatCompletion: UseChatCompletion
}

const Chat = ({ settings, chatCompletion }: ChatProps) => {
  const {
    messages,
    submitQuery,
    clearMessages,
    generating,
    cancelRequest,
    removeMessagePair,
    error,
  } = chatCompletion

  const {
    messageDraft,
    setMessageDraftText,
    addMessageDraftFile,
    removeMessageDraftFile,
    resetMessageDraft,
  } = useMessageDraft()

  const handleSubmitQuery = useCallback(
    (
      query: Parameters<UseChatCompletion['submitQuery']>[0],
    ) => {
      submitQuery(query)
    },
    [submitQuery],
  )

  useEffect(() => {
    const handleWindowMessage = (event: MessageEvent) => {
      const { action, prompt } = event.data as {
        action: string
        prompt: string
      }
      if (action === 'generate') {
        handleSubmitQuery({ text: prompt, files: [] })
      }
    }
    window.addEventListener('message', handleWindowMessage)

    return () => {
      window.removeEventListener('message', handleWindowMessage)
    }
  }, [handleSubmitQuery])

  const handleRegenerate = (timestamp: number) => {
    // timestamp is from the AI message
    const aiMessageIndex = messages.findIndex((m) => m.timestamp === timestamp)

    if (aiMessageIndex > 0) {
      const userMessage = messages[aiMessageIndex - 1]

      // Ensure the previous message is from the user
      if (userMessage && userMessage.role === 'user') {
        // We use the user's message timestamp to remove the correct pair
        removeMessagePair(userMessage.timestamp)
        handleSubmitQuery({
          text: userMessage.content,
          files: userMessage.files || [],
        })
      }
    }
  }

  const handleSelectSuggestion = (suggestion: string) => {
    handleSubmitQuery({ text: suggestion, files: [] })
  }

  return (
    <>
      <ChatList
        messages={messages}
        removeMessagePair={removeMessagePair}
        onRegenerate={handleRegenerate}
        generating={generating}
        error={error}
      />

      <SidebarInput
        loading={generating}
        submitMessage={handleSubmitQuery}
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
