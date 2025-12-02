import { useEffect, useRef } from 'react'
import {
  RiCloseLine,
  RiErrorWarningLine,
  RiLoader4Line,
  RiFileCopyLine,
  RiRefreshLine,
  RiUserFill,
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

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [messages])

  const filteredMsgs = messages.filter((msg) => msg.role !== ChatRole.SYSTEM)

  const formatContent = (content: string) => {
    return content.replace(/(?<=\n\n)(?![*-])\n/gi, '&nbsp;\n ')
  }

  return (
    <div
      ref={containerRef}
      className="cdx-flex-grow cdx-overflow-y-auto cdx-pb-12 cdx-break-words scrollbar-hide"
    >
      {filteredMsgs.length < 1 ? (
        <div className="cdx-flex cdx-flex-col cdx-items-center cdx-justify-center cdx-h-full cdx-px-6">
          <img
            alt="robot"
            src="/images/robot.png"
            className="cdx-opacity-80"
            height={240}
            width={240}
          />
          <h1 className="cdx-text-base cdx-font-semibold cdx-text-neutral-600 dark:cdx-text-neutral-400 cdx-mt-2">
            选择上方建议开始对话
          </h1>
          <p className="cdx-text-xs cdx-text-neutral-500 dark:cdx-text-neutral-500 cdx-mt-1">
            或点击右下角按钮自定义提问
          </p>
        </div>
      ) : (
        <div className="cdx-py-2">
          {filteredMsgs.map((msg, i) => {
            const isUser = msg.role === ChatRole.USER

            if (isUser) {
              // User question - simple text with label
              return (
                <div key={`${msg.timestamp}-${i}`} className="cdx-group cdx-px-3 cdx-py-3 cdx-bg-blue-50/30 dark:cdx-bg-blue-900/10">
                  <div className="cdx-flex cdx-items-center cdx-justify-between cdx-mb-1.5">
                    <div className="cdx-inline-flex cdx-items-center cdx-gap-1.5">
                      <div className="cdx-w-1 cdx-h-3.5 cdx-bg-blue-500 cdx-rounded-full"></div>
                      <span className="cdx-text-[11px] cdx-font-bold cdx-text-blue-600 dark:cdx-text-blue-400 cdx-uppercase cdx-tracking-wide">问</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeMessagePair(msg.timestamp)}
                      className="cdx-p-1 cdx-rounded-md cdx-text-neutral-400 hover:cdx-text-red-500 hover:cdx-bg-red-50 dark:hover:cdx-bg-red-900/20 cdx-opacity-0 group-hover:cdx-opacity-100 cdx-transition-all"
                      title="删除"
                    >
                      <RiCloseLine className="cdx-text-sm" />
                    </button>
                  </div>
                  <div className="cdx-text-sm cdx-text-neutral-800 dark:cdx-text-neutral-100 cdx-leading-relaxed cdx-font-medium">
                    {msg.content}
                  </div>
                  {msg.files && <FilePreviewBar files={msg.files} />}
                </div>
              )
            } else {
              // AI answer - with markdown support
              return (
                <div key={`${msg.timestamp}-${i}`} className="cdx-group cdx-px-3 cdx-py-3.5 cdx-border-b dark:cdx-border-neutral-800/50 cdx-border-neutral-200/50 last:cdx-border-0">
                  <div className="cdx-flex cdx-items-center cdx-justify-between cdx-mb-2">
                    <div className="cdx-inline-flex cdx-items-center cdx-gap-1.5">
                      <div className="cdx-w-1 cdx-h-3.5 cdx-bg-neutral-400 dark:cdx-bg-neutral-500 cdx-rounded-full"></div>
                      <span className="cdx-text-[11px] cdx-font-bold cdx-text-neutral-500 dark:cdx-text-neutral-400 cdx-uppercase cdx-tracking-wide">答</span>
                    </div>
                    <div className="cdx-flex cdx-gap-0.5 cdx-opacity-0 group-hover:cdx-opacity-100 cdx-transition-opacity">
                      <button
                        type="button"
                        onClick={() => onRegenerate(msg.timestamp)}
                        className="cdx-p-1.5 cdx-rounded-md cdx-text-neutral-400 hover:cdx-text-blue-600 dark:hover:cdx-text-blue-400 hover:cdx-bg-blue-50 dark:hover:cdx-bg-blue-900/20 cdx-transition-colors"
                        title="重新生成"
                      >
                        <RiRefreshLine className="cdx-text-sm" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          window.parent.postMessage({
                            action: 'copy-to-clipboard',
                            _payload: { content: msg.content },
                          })
                        }
                        className="cdx-p-1.5 cdx-rounded-md cdx-text-neutral-400 hover:cdx-text-blue-600 dark:hover:cdx-text-blue-400 hover:cdx-bg-blue-50 dark:hover:cdx-bg-blue-900/20 cdx-transition-colors"
                        title="复制"
                      >
                        <RiFileCopyLine className="cdx-text-sm" />
                      </button>
                    </div>
                  </div>
                  <div className="markdown cdx-text-[13px] cdx-text-neutral-700 dark:cdx-text-neutral-300 cdx-leading-relaxed">
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
          })}
        </div>
      )}
      {messages[messages.length - 1]?.role === ChatRole.USER && (
        <div className="cdx-px-3 cdx-py-3">
          {generating && !error && (
            <div className="cdx-flex cdx-items-center cdx-gap-2 cdx-px-3 cdx-py-2.5 cdx-rounded-lg cdx-bg-blue-50/50 dark:cdx-bg-blue-900/10 cdx-border cdx-border-blue-200/50 dark:cdx-border-blue-800/30">
              <RiLoader4Line className="cdx-animate-spin cdx-text-blue-500" size={16} />
              <span className="cdx-text-xs cdx-text-blue-600 dark:cdx-text-blue-400 cdx-font-medium">正在生成回答...</span>
            </div>
          )}
          {error && (
            <div className="cdx-flex cdx-items-start cdx-gap-2 cdx-px-3 cdx-py-2.5 cdx-rounded-lg cdx-bg-red-50 dark:cdx-bg-red-900/20 cdx-border cdx-border-red-200 dark:cdx-border-red-800/50">
              <RiErrorWarningLine
                className="cdx-text-red-500 dark:cdx-text-red-400 cdx-flex-shrink-0 cdx-mt-0.5"
                size={16}
              />
              <span className="cdx-text-xs cdx-text-red-600 dark:cdx-text-red-400">{error.message}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ChatList
