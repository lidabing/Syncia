import { useEffect, useRef, useState } from 'react'
import {
  RiCloseLine,
  RiErrorWarningLine,
  RiLoader4Line,
  RiFileCopyLine,
  RiRefreshLine,
  RiUserFill,
  RiArrowDownSLine,
  RiArrowUpSLine,
} from 'react-icons/ri'
import { BsRobot } from 'react-icons/bs'
import { ReactMarkdown } from 'react-markdown/lib/react-markdown'
import rehypeRaw from 'rehype-raw'
import remarkBreaks from 'remark-breaks'
import remarkGfm from 'remark-gfm'
import { type ChatMessage, ChatRole } from '../../../hooks/useCurrentChat'
import FilePreviewBar from './FilePreviewBar'
import CodeBlock from './markdown-components/CodeBlock'
import { Table } from './markdown-components/Table'

interface ChatListProps {
  messages: ChatMessage[]
  removeMessagePair: (timestamp: number) => void
  onRegenerate: (timestamp: number) => void
  generating: boolean
  error: Error | null
}

const ChatList = ({
  messages,
  removeMessagePair,
  onRegenerate,
  generating,
  error,
}: ChatListProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isHistoryCollapsed, setIsHistoryCollapsed] = useState(true)
  const lastMessageCountRef = useRef(0)

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [messages])

  // 当消息数量变化时，重置折叠状态为true（添加新消息时自动折叠历史）
  useEffect(() => {
    const currentCount = messages.length
    if (currentCount > lastMessageCountRef.current) {
      setIsHistoryCollapsed(true)
    }
    lastMessageCountRef.current = currentCount
  }, [messages.length])

  const filteredMsgs = messages.filter((msg) => msg.role !== ChatRole.SYSTEM)

  // 人性化规则：
  // 1. 如果消息少于4条（2轮对话），全部显示，不折叠
  // 2. 如果有4条或以上，保留最近2轮对话（4条消息），其余折叠
  const shouldShowHistory = filteredMsgs.length <= 4
  
  const recentConversationCount = 4 // 保留最近2轮对话
  const historyMessages = shouldShowHistory 
    ? [] 
    : filteredMsgs.slice(0, -recentConversationCount)
  const currentMessages = shouldShowHistory 
    ? filteredMsgs 
    : filteredMsgs.slice(-recentConversationCount)

  const formatContent = (content: string) => {
    return content.replace(/(?<=\n\n)(?![*-])\n/gi, '&nbsp;\n ')
  }

  const renderMessage = (msg: ChatMessage, i: number) => {
    const isUser = msg.role === ChatRole.USER

    if (isUser) {
      // User question - clean card style
      return (
        <div key={`${msg.timestamp}-${i}`} className="cdx-group cdx-px-4 cdx-py-3">
          <div className="cdx-bg-white dark:cdx-bg-neutral-800 cdx-rounded-xl cdx-px-4 cdx-py-3 cdx-shadow-sm cdx-border cdx-border-neutral-100 dark:cdx-border-neutral-700">
            <div className="cdx-flex cdx-items-start cdx-justify-between cdx-gap-3">
              <div className="cdx-flex-1 cdx-text-[13px] cdx-text-neutral-800 dark:cdx-text-neutral-100 cdx-leading-relaxed">
                {msg.content}
              </div>
              <button
                type="button"
                onClick={() => removeMessagePair(msg.timestamp)}
                className="cdx-p-1.5 cdx-rounded-lg cdx-text-neutral-300 dark:cdx-text-neutral-600 hover:cdx-text-red-500 dark:hover:cdx-text-red-400 hover:cdx-bg-red-50 dark:hover:cdx-bg-red-900/20 cdx-opacity-0 group-hover:cdx-opacity-100 cdx-transition-all cdx-flex-shrink-0"
                title="删除"
              >
                <RiCloseLine size={14} />
              </button>
            </div>
            {msg.files && <div className="cdx-mt-2"><FilePreviewBar files={msg.files} /></div>}
          </div>
        </div>
      )
    } else {
      // AI answer - clean minimal style
      return (
        <div key={`${msg.timestamp}-${i}`} className="cdx-group cdx-px-4 cdx-py-3">
          <div className="cdx-flex cdx-items-center cdx-justify-between cdx-mb-2">
            <div className="cdx-flex cdx-items-center cdx-gap-2">
              <div className="cdx-w-5 cdx-h-5 cdx-flex cdx-items-center cdx-justify-center cdx-rounded-md cdx-bg-gradient-to-br cdx-from-blue-500 cdx-to-indigo-600">
                <BsRobot className="cdx-text-white" size={10} />
              </div>
              <span className="cdx-text-xs cdx-font-medium cdx-text-neutral-500 dark:cdx-text-neutral-400">千羽</span>
            </div>
            <div className="cdx-flex cdx-gap-1 cdx-opacity-0 group-hover:cdx-opacity-100 cdx-transition-opacity">
              <button
                type="button"
                onClick={() => onRegenerate(msg.timestamp)}
                className="cdx-p-1.5 cdx-rounded-lg cdx-text-neutral-400 hover:cdx-text-blue-600 dark:hover:cdx-text-blue-400 hover:cdx-bg-neutral-100 dark:hover:cdx-bg-neutral-800 cdx-transition-colors"
                title="重新生成"
              >
                <RiRefreshLine size={14} />
              </button>
              <button
                type="button"
                onClick={() =>
                  window.parent.postMessage({
                    action: 'copy-to-clipboard',
                    _payload: { content: msg.content },
                  })
                }
                className="cdx-p-1.5 cdx-rounded-lg cdx-text-neutral-400 hover:cdx-text-blue-600 dark:hover:cdx-text-blue-400 hover:cdx-bg-neutral-100 dark:hover:cdx-bg-neutral-800 cdx-transition-colors"
                title="复制"
              >
                <RiFileCopyLine size={14} />
              </button>
            </div>
          </div>
          <div className="markdown cdx-text-[13px] cdx-text-neutral-700 dark:cdx-text-neutral-300 cdx-leading-[1.7]">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkBreaks]}
              rehypePlugins={[rehypeRaw]}
              components={{
                code: CodeBlock,
                table: Table,
              }}
            >
              {formatContent(msg.content)}
            </ReactMarkdown>
          </div>
        </div>
      )
    }
  }

  return (
    <div
      ref={containerRef}
      className="cdx-flex-grow cdx-overflow-y-auto cdx-pb-2 cdx-break-words scrollbar-hide"
    >
      {filteredMsgs.length < 1 ? (
        <div className="cdx-flex cdx-flex-col cdx-items-center cdx-justify-center cdx-h-full cdx-px-6">
          <div className="cdx-w-16 cdx-h-16 cdx-flex cdx-items-center cdx-justify-center cdx-rounded-2xl cdx-bg-gradient-to-br cdx-from-blue-500/10 cdx-to-indigo-500/10 cdx-mb-4">
            <BsRobot className="cdx-text-blue-500 dark:cdx-text-blue-400" size={28} />
          </div>
          <h1 className="cdx-text-base cdx-font-semibold cdx-text-neutral-800 dark:cdx-text-neutral-200 cdx-mb-1">
            你好，有什么可以帮你？
          </h1>
          <p className="cdx-text-sm cdx-text-neutral-500 dark:cdx-text-neutral-500 cdx-text-center">
            选择上方建议快速开始，或输入你的问题
          </p>
        </div>
      ) : (
        <div className="cdx-py-1">
          {/* 历史消息折叠区域 */}
          {historyMessages.length > 0 && (
            <div className="cdx-mb-2 cdx-mx-4">
              <button
                type="button"
                onClick={() => setIsHistoryCollapsed(!isHistoryCollapsed)}
                className="cdx-w-full cdx-flex cdx-items-center cdx-justify-center cdx-gap-2 cdx-py-2 cdx-text-neutral-400 dark:cdx-text-neutral-500 hover:cdx-text-neutral-600 dark:hover:cdx-text-neutral-300 cdx-transition-colors cdx-text-xs"
              >
                {isHistoryCollapsed ? (
                  <>
                    <RiArrowDownSLine size={14} />
                    <span>查看历史对话 ({historyMessages.filter(m => m.role === ChatRole.USER).length} 轮)</span>
                  </>
                ) : (
                  <>
                    <RiArrowUpSLine size={14} />
                    <span>收起历史对话</span>
                  </>
                )}
              </button>
              
              {!isHistoryCollapsed && (
                <div className="cdx-mt-2 cdx-pt-2 cdx-border-t cdx-border-neutral-100 dark:cdx-border-neutral-800">
                  {historyMessages.map((msg, i) => renderMessage(msg, i))}
                </div>
              )}
            </div>
          )}

          {/* 当前对话 */}
          <div>
            {currentMessages.map((msg, i) => renderMessage(msg, i + historyMessages.length))}
          </div>
        </div>
      )}
      {messages[messages.length - 1]?.role === ChatRole.USER && (
        <div className="cdx-px-4 cdx-py-3">
          {generating && !error && (
            <div className="cdx-flex cdx-items-center cdx-gap-2">
              <div className="cdx-w-5 cdx-h-5 cdx-flex cdx-items-center cdx-justify-center cdx-rounded-md cdx-bg-gradient-to-br cdx-from-blue-500 cdx-to-indigo-600">
                <BsRobot className="cdx-text-white" size={10} />
              </div>
              <div className="cdx-flex cdx-items-center cdx-gap-1.5">
                <span className="cdx-text-xs cdx-text-neutral-500 dark:cdx-text-neutral-400">正在思考</span>
                <span className="cdx-flex cdx-gap-0.5">
                  <span className="cdx-w-1 cdx-h-1 cdx-rounded-full cdx-bg-blue-500 cdx-animate-pulse" style={{animationDelay: '0ms'}}></span>
                  <span className="cdx-w-1 cdx-h-1 cdx-rounded-full cdx-bg-blue-500 cdx-animate-pulse" style={{animationDelay: '150ms'}}></span>
                  <span className="cdx-w-1 cdx-h-1 cdx-rounded-full cdx-bg-blue-500 cdx-animate-pulse" style={{animationDelay: '300ms'}}></span>
                </span>
              </div>
            </div>
          )}
          {error && (
            <div className="cdx-flex cdx-items-start cdx-gap-3 cdx-px-4 cdx-py-3 cdx-rounded-xl cdx-bg-red-50 dark:cdx-bg-red-900/20 cdx-border cdx-border-red-100 dark:cdx-border-red-900/30">
              <RiErrorWarningLine
                className="cdx-text-red-500 dark:cdx-text-red-400 cdx-flex-shrink-0 cdx-mt-0.5"
                size={16}
              />
              <span className="cdx-text-sm cdx-text-red-600 dark:cdx-text-red-400">{error.message}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ChatList
