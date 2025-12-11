import React, { useEffect, useCallback } from 'react'
import ChatList from './ChatList'
import { SidebarInput } from './ChatInput'
import VideoContextBar from './VideoContextBar'
import { useMessageDraft } from '../../../hooks/useMessageDraft'
import { ChatRole } from '../../../hooks/useCurrentChat'
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
      context?: string,
    ) => {
      submitQuery(query, context)
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

  const handleSubtitlesFetched = (text: string) => {
    const prefix = "Here are the subtitles for the video:\n\n";
    setMessageDraftText(messageDraft.text + (messageDraft.text ? "\n\n" : "") + prefix + text);
  }

  const handleSummarizeVideo = (text: string) => {
    const prompt = "Please summarize the following video subtitles:\n\n" + text;
    handleSubmitQuery({ text: prompt, files: [] });
  }

  const handleRegenerate = (timestamp: number) => {
    // timestamp is from the AI message
    const aiMessageIndex = messages.findIndex((m) => m.timestamp === timestamp)

    if (aiMessageIndex > 0) {
      const userMessage = messages[aiMessageIndex - 1]

      // Ensure the previous message is from the user
      if (userMessage && userMessage.role === ChatRole.USER) {
        // We use the user's message timestamp to remove the correct pair
        removeMessagePair(userMessage.timestamp)
        handleSubmitQuery({
          text: userMessage.content,
          files: userMessage.files || [],
        })
      }
    }
  }

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

    handleSubmitQuery({ text: suggestion, files: [] }, context)
  }

  return (
    <>
      <VideoContextBar 
        onSubtitlesFetched={handleSubtitlesFetched}
        onSummarize={handleSummarizeVideo}
      />
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
