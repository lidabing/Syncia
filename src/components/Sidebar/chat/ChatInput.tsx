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
      title="发送"
      className="cdx-flex cdx-items-center cdx-justify-center disabled:cdx-opacity-30 disabled:cdx-cursor-not-allowed cdx-bg-gradient-to-r cdx-from-blue-500 cdx-to-indigo-600 hover:cdx-from-blue-600 hover:cdx-to-indigo-700 cdx-text-white cdx-w-8 cdx-h-8 cdx-rounded-lg cdx-transition-all cdx-shadow-sm"
    >
      <IoSend size={16} />
    </button>
  )

  const stopButton = (
    <button
      type="button"
      onClick={cancelRequest}
      title="停止"
      className="cdx-flex cdx-items-center cdx-justify-center cdx-bg-red-500 hover:cdx-bg-red-600 cdx-text-white cdx-w-8 cdx-h-8 cdx-rounded-lg cdx-transition-colors cdx-shadow-sm"
    >
      <HiHand size={16} />
    </button>
  )

  if (!isExpanded) {
    return (
      <div className="cdx-fixed cdx-bottom-4 cdx-right-3 cdx-z-50">
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          title="输入问题"
          className="cdx-flex cdx-items-center cdx-justify-center cdx-w-10 cdx-h-10 cdx-bg-blue-500 hover:cdx-bg-blue-600 cdx-text-white cdx-rounded-full cdx-shadow-lg cdx-transition-all hover:cdx-scale-105 cdx-opacity-80 hover:cdx-opacity-100"
        >
          <FiChevronUp size={20} />
        </button>
      </div>
    )
  }

  return (
    <div className="cdx-fixed cdx-bottom-0 cdx-left-0 cdx-right-0 cdx-flex cdx-flex-col cdx-bg-white dark:cdx-bg-[#1a1a1a] cdx-border-t cdx-border-neutral-200 dark:cdx-border-neutral-800">
      {/* 顶部工具栏 */}
      <div className="cdx-flex cdx-justify-between cdx-items-center cdx-px-4 cdx-py-2 cdx-border-b cdx-border-neutral-100 dark:cdx-border-neutral-800">
        <div className="cdx-flex cdx-items-center cdx-gap-2">
          <ChangeChatModel />
        </div>
        <div className="cdx-flex cdx-items-center cdx-gap-2">
          <WebPageContentToggle />
        </div>
      </div>

      {/* 文件预览 */}
      {messageDraft.files.length > 0 && (
        <div className="cdx-px-4 cdx-py-2 cdx-border-b cdx-border-neutral-100 dark:cdx-border-neutral-800">
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
          placeholder="输入你的问题..."
          value={messageDraft.text}
          disabled={loading}
          className="cdx-w-full cdx-px-4 cdx-py-3 cdx-pr-14 focus:!cdx-outline-none placeholder:cdx-text-neutral-400 dark:placeholder:cdx-text-neutral-500 cdx-text-[14px] cdx-resize-none cdx-bg-transparent !cdx-border-none dark:cdx-text-neutral-100 cdx-text-neutral-900 cdx-leading-relaxed"
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
        <div className="cdx-absolute cdx-bottom-3 cdx-right-4">
          {!delayedLoading ? sendButton : stopButton}
        </div>
      </div>

      {/* 底部工具栏 */}
      <div className="cdx-flex cdx-justify-between cdx-items-center cdx-px-4 cdx-py-2 cdx-border-t cdx-border-neutral-100 dark:cdx-border-neutral-800 cdx-bg-neutral-50 dark:cdx-bg-neutral-900">
        <div className="cdx-flex cdx-items-center cdx-gap-1">
          {isVisionModel && (
            <ImageCaptureButton addMessageDraftFile={addMessageDraftFile} />
          )}
          <InsertPromptToDraftButton
            setMessageDraftText={setMessageDraftText}
          />
        </div>
        
        <div className="cdx-flex cdx-items-center cdx-gap-3">
          <span className="cdx-text-[11px] cdx-text-neutral-400 dark:cdx-text-neutral-500 cdx-tabular-nums">
            {messageDraft.text.length}/{MAX_MESSAGE_LENGTH}
          </span>
          <button
            type="button"
            onClick={() => setIsExpanded(false)}
            title="收起"
            className="cdx-flex cdx-items-center cdx-justify-center cdx-w-7 cdx-h-7 hover:cdx-bg-neutral-200 dark:hover:cdx-bg-neutral-700 cdx-rounded-lg cdx-transition-colors cdx-text-neutral-400 dark:cdx-text-neutral-500"
          >
            <FiChevronDown size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
