import { useEffect, useState } from 'react'
import TextareaAutosize from 'react-textarea-autosize'
import { GiMagicBroom } from 'react-icons/gi'
import { IoSend } from 'react-icons/io5'
import { HiHand } from 'react-icons/hi'
import { FiChevronDown, FiChevronUp } from 'react-icons/fi'
import ChatHistory from './ChatHistory'
import { useChatHistory } from '../../../hooks/useChatHistory'
import WebPageContentToggle from './WebPageContentToggle'
import ImageCaptureButton from './ImageCaptureButton'
import {
  type MessageDraft,
  type MessageFile,
} from '../../../hooks/useMessageDraft'
import FilePreviewBar from './FilePreviewBar'
import ChangeChatModel from './ChangeChatModel'
import InsertPromptToDraftButton from './InsertPromptToDraftButton'

interface SidebarInputProps {
  loading: boolean
  submitMessage: (message: MessageDraft, context?: string) => void
  clearMessages: () => void
  chatIsEmpty: boolean
  cancelRequest: () => void
  isWebpageContextOn: boolean
  isVisionModel: boolean
  // Props for controlled message draft state
  messageDraft: MessageDraft
  setMessageDraftText: (text: string) => void
  addMessageDraftFile: (blob: Blob) => Promise<void>
  removeMessageDraftFile: (id: string) => void
  resetMessageDraft: () => void
}

const MAX_MESSAGE_LENGTH = 10000

export function SidebarInput({
  loading,
  submitMessage,
  clearMessages,
  chatIsEmpty,
  cancelRequest,
  isWebpageContextOn,
  isVisionModel,
  // Destructure the new props
  messageDraft,
  setMessageDraftText,
  addMessageDraftFile,
  removeMessageDraftFile,
  resetMessageDraft,
}: SidebarInputProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [delayedLoading, setDelayedLoading] = useState(false)
  const { history } = useChatHistory()

  useEffect(() => {
    const handleLoadingTimeout = setTimeout(() => {
      setDelayedLoading(loading)
    }, 1000)
    return () => {
      clearTimeout(handleLoadingTimeout)
    }
  }, [loading])

  const handleSubmit = async () => {
    let context: string | undefined
    if (isWebpageContextOn) {
      const pageContent = new Promise((resolve) => {
        window.addEventListener('message', (event) => {
          const { action, payload } = event.data
          if (action === 'get-page-content') {
            resolve(payload)
          }
        })

        window.parent.postMessage({ action: 'get-page-content' }, '*')
      })
      context = (await pageContent) as string
    }
    submitMessage(messageDraft, isWebpageContextOn ? context : undefined)
    resetMessageDraft()
  }

  const sendButton = (
    <button
      type="button"
      disabled={loading || !messageDraft.text.trim()}
      onClick={handleSubmit}
      title="发送 (Enter)"
      className="cdx-flex cdx-items-center cdx-justify-center disabled:cdx-opacity-40 disabled:cdx-cursor-not-allowed cdx-bg-gradient-to-r cdx-from-blue-500 cdx-to-blue-600 hover:cdx-from-blue-600 hover:cdx-to-blue-700 active:cdx-scale-95 cdx-text-white cdx-w-9 cdx-h-9 cdx-rounded-lg cdx-transition-all cdx-duration-200 cdx-shadow-md hover:cdx-shadow-lg"
    >
      <IoSend size={18} />
    </button>
  )

  const stopButton = (
    <button
      type="button"
      onClick={cancelRequest}
      title="停止生成"
      className="cdx-flex cdx-items-center cdx-justify-center cdx-bg-gradient-to-r cdx-from-red-500 cdx-to-red-600 hover:cdx-from-red-600 hover:cdx-to-red-700 active:cdx-scale-95 cdx-text-white cdx-w-9 cdx-h-9 cdx-rounded-lg cdx-transition-all cdx-duration-200 cdx-shadow-md hover:cdx-shadow-lg cdx-animate-pulse"
    >
      <HiHand size={18} />
    </button>
  )

  if (!isExpanded) {
    return (
      <div className="cdx-fixed cdx-bottom-4 cdx-right-4 cdx-z-50">
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          title="展开输入框"
          className="cdx-flex cdx-items-center cdx-justify-center cdx-gap-2 cdx-bg-gradient-to-r cdx-from-blue-500 cdx-to-blue-600 hover:cdx-from-blue-600 hover:cdx-to-blue-700 dark:cdx-from-blue-600 dark:cdx-to-blue-700 dark:hover:cdx-from-blue-700 dark:hover:cdx-to-blue-800 cdx-text-white cdx-py-2.5 cdx-px-4 cdx-rounded-full cdx-shadow-lg hover:cdx-shadow-xl cdx-transition-all cdx-duration-200 cdx-text-sm cdx-font-medium hover:cdx-scale-105"
        >
          <FiChevronUp size={16} />
          <span>自定义提问</span>
        </button>
      </div>
    )
  }

  return (
    <div className="cdx-fixed cdx-bottom-0 cdx-left-0 cdx-right-0 cdx-flex cdx-flex-col cdx-border-t dark:cdx-border-neutral-800/50 cdx-border-neutral-200/50 cdx-bg-white dark:cdx-bg-neutral-900 cdx-shadow-2xl">
      {/* 顶部工具栏 */}
      <div className="cdx-flex cdx-justify-between cdx-items-center cdx-px-2.5 cdx-py-1.5 cdx-border-b dark:cdx-border-neutral-800/30 cdx-border-neutral-200/30">
        <div className="cdx-flex cdx-items-center cdx-gap-2">
          <ChangeChatModel />
        </div>
        <div className="cdx-flex cdx-items-center cdx-gap-2">
          <WebPageContentToggle />
        </div>
      </div>

      {/* 文件预览 */}
      {messageDraft.files.length > 0 && (
        <div className="cdx-px-2.5 cdx-py-1.5 cdx-border-b dark:cdx-border-neutral-800/30 cdx-border-neutral-200/30">
          <FilePreviewBar
            files={messageDraft.files}
            removeFile={removeMessageDraftFile}
          />
        </div>
      )}

      {/* 输入区域 */}
      <div className="cdx-relative">
        <TextareaAutosize
          minRows={2}
          maxRows={6}
          maxLength={MAX_MESSAGE_LENGTH}
          placeholder="输入消息，Shift+Enter 换行..."
          value={messageDraft.text}
          disabled={loading}
          className="cdx-w-full cdx-px-2.5 cdx-py-2 cdx-pr-20 focus:!cdx-outline-none placeholder:cdx-text-neutral-400 dark:placeholder:cdx-text-neutral-500 cdx-text-[13px] cdx-resize-none cdx-bg-transparent !cdx-border-none dark:cdx-text-neutral-100 cdx-text-neutral-900"
          onChange={(e) => {
            e.preventDefault()
            setMessageDraftText(e.target.value)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSubmit()
            }
          }}
        />
        
        {/* 右下角发送按钮 */}
        <div className="cdx-absolute cdx-bottom-2 cdx-right-2.5">
          {!delayedLoading ? sendButton : stopButton}
        </div>
      </div>

      {/* 底部工具栏 */}
      <div className="cdx-flex cdx-justify-between cdx-items-center cdx-px-2.5 cdx-py-1.5 cdx-border-t dark:cdx-border-neutral-800/30 cdx-border-neutral-200/30 cdx-bg-neutral-50/50 dark:cdx-bg-neutral-800/20">
        <div className="cdx-flex cdx-items-center cdx-gap-1.5">
          {isVisionModel && (
            <ImageCaptureButton addMessageDraftFile={addMessageDraftFile} />
          )}
          <InsertPromptToDraftButton
            setMessageDraftText={setMessageDraftText}
          />
        </div>
        
        <div className="cdx-flex cdx-items-center cdx-gap-2">
          <span className="cdx-text-[10px] cdx-text-neutral-400 dark:cdx-text-neutral-500">
            {messageDraft.text.length}/{MAX_MESSAGE_LENGTH}
          </span>
          <button
            type="button"
            onClick={() => setIsExpanded(false)}
            title="收起输入框"
            className="cdx-flex cdx-items-center cdx-justify-center cdx-w-6 cdx-h-6 hover:cdx-bg-neutral-200 dark:hover:cdx-bg-neutral-700 cdx-rounded-md cdx-transition-colors cdx-duration-200 cdx-text-neutral-500 dark:cdx-text-neutral-400"
          >
            <FiChevronDown size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
