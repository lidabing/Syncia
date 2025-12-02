import React, { useEffect, useState, useCallback } from 'react'
import ChatList from './ChatList'
import { SidebarInput } from './ChatInput'
import PageSuggestions from './PageSuggestions'
import { useMessageDraft } from '../../../hooks/useMessageDraft'
import type { Settings } from '../../../config/settings'
import type { UseChatCompletion } from '../../../hooks/useChatCompletion'
import { RiAddLine } from 'react-icons/ri'

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

  const [isInputVisible, setInputVisible] = useState(false)

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
      openInput = true,
    ) => {
      if (!isInputVisible && openInput) {
        setInputVisible(true)
      }
      submitQuery(query)
    },
    [isInputVisible, submitQuery],
  )

  useEffect(() => {
    // If chat is cleared, hide the input again
    if (messages.length <= 1 && isInputVisible) {
      setInputVisible(false)
    }
  }, [messages, isInputVisible])

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
    handleSubmitQuery({ text: suggestion, files: [] }, false)
  }

  const ShowInputButton = () => (
    <div className="cdx-p-4">
      <button
        type="button"
        onClick={() => setInputVisible(true)}
        className="cdx-w-full cdx-flex cdx-items-center cdx-justify-center cdx-gap-2 cdx-p-3 cdx-rounded-md cdx-border-2 cdx-border-dashed dark:cdx-border-neutral-700 dark:hover:cdx-border-neutral-600 dark:hover:cdx-bg-neutral-800/50 cdx-border-neutral-300 hover:cdx-border-neutral-400 hover:cdx-bg-neutral-200/50 cdx-transition-colors"
      >
        <RiAddLine />
        发送新消息
      </button>
    </div>
  )

  return (
    <>
      <PageSuggestions onSelectSuggestion={handleSelectSuggestion} />
      <ChatList
        messages={messages}
        removeMessagePair={removeMessagePair}
        onRegenerate={handleRegenerate}
        generating={generating}
        error={error}
      />

      {isInputVisible ? (
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
      ) : (
        <ShowInputButton />
      )}
    </>
  )
}

export default Chat
