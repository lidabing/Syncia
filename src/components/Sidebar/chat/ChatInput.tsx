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
  const [isExpanded, setIsExpanded] = useState(true)
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
      disabled={loading}
      onClick={handleSubmit}
      title="发送 (Enter)"
      className="cdx-flex cdx-items-center cdx-justify-center disabled:cdx-opacity-40 disabled:cdx-cursor-not-allowed cdx-bg-blue-500 hover:cdx-bg-blue-600 active:cdx-bg-blue-700 cdx-text-white cdx-w-8 cdx-h-8 cdx-rounded-lg cdx-transition-all cdx-duration-200"
    >
      <IoSend size={16} />
    </button>
  )

  const stopButton = (
    <button
      type="button"
      onClick={cancelRequest}
      title="停止生成"
      className="cdx-flex cdx-items-center cdx-justify-center cdx-bg-red-500 hover:cdx-bg-red-600 active:cdx-bg-red-700 cdx-text-white cdx-w-8 cdx-h-8 cdx-rounded-lg cdx-transition-all cdx-duration-200"
    >
      <HiHand size={16} />
    </button>
  )

  if (!isExpanded) {
    return (
      <div className="cdx-fixed cdx-bottom-4 cdx-right-4 cdx-z-50">
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          title="展开输入框"
          className="cdx-flex cdx-items-center cdx-justify-center cdx-gap-1.5 cdx-bg-blue-500 hover:cdx-bg-blue-600 active:cdx-bg-blue-700 cdx-text-white cdx-py-2 cdx-px-3 cdx-rounded-full cdx-shadow-lg hover:cdx-shadow-xl cdx-transition-all cdx-duration-200"
        >
          <FiChevronUp size={16} />
          <span className="cdx-text-sm cdx-font-medium">提问</span>
        </button>
      </div>
    )
  }

  return (
    <div className="cdx-fixed cdx-bottom-0 cdx-left-0 cdx-right-0 cdx-flex cdx-flex-col ">
      <div className="cdx-m-2 cdx-rounded-md cdx-border dark:cdx-border-neutral-800 cdx-border-neutral-300 dark:cdx-bg-neutral-900/90 cdx-bg-neutral-200/90 focus:cdx-outline-none focus:cdx-ring-2 focus:cdx-ring-blue-900 focus:cdx-ring-opacity-50">
        <div className="cdx-flex cdx-justify-end cdx-items-center cdx-p-1 cdx-pt-2 cdx-pr-3">
          <div className="cdx-flex cdx-items-center cdx-gap-4">
            <ChangeChatModel />
            <WebPageContentToggle />
          </div>
        </div>
        {messageDraft.files.length > 0 && (
          <FilePreviewBar
            files={messageDraft.files}
            removeFile={removeMessageDraftFile}
          />
        )}
        <TextareaAutosize
          minRows={2}
          maxLength={MAX_MESSAGE_LENGTH}
          placeholder="在此输入你的消息..."
          value={messageDraft.text}
          disabled={loading}
          className="cdx-p-3 cdx-w-full focus:!cdx-outline-none placeholder:cdx-text-neutral-500 cdx-text-sm cdx-resize-none cdx-max-h-96 cdx-pb-0 cdx-bg-transparent !cdx-border-none"
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
        <div className="cdx-flex cdx-justify-between cdx-items-center cdx-p-3">
          <div className="cdx-flex cdx-gap-2">
            {isVisionModel && (
              <ImageCaptureButton addMessageDraftFile={addMessageDraftFile} />
            )}
            <InsertPromptToDraftButton
              setMessageDraftText={setMessageDraftText}
            />
          </div>
          <div className="cdx-flex cdx-items-center cdx-justify-center cdx-gap-2">
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              title="收起输入框"
              className="cdx-flex cdx-items-center cdx-justify-center cdx-w-8 cdx-h-8 hover:cdx-bg-neutral-300 dark:hover:cdx-bg-neutral-700 cdx-rounded-lg cdx-transition-colors cdx-duration-200"
            >
              <FiChevronDown size={16} />
            </button>
            {!delayedLoading ? sendButton : stopButton}
          </div>
        </div>
      </div>
    </div>
  )
}
