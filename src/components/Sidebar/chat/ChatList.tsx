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
      className="cdx-flex-grow cdx-overflow-y-auto cdx-pb-12 cdx-break-words"
    >
      {filteredMsgs.length < 1 ? (
        <div className="cdx-mt-10 cdx-text-center">
          <img
            alt="robot"
            src="/images/robot.png"
            className="cdx-mx-auto"
            height={300}
            width={300}
          />
          <h1 className="cdx-text-xl cdx-text-gray-500 dark:cdx-text-gray-400">
            开始新对话 🎉
          </h1>
        </div>
      ) : (
        <div className="cdx-px-4 cdx-space-y-4">
          {filteredMsgs.map((msg, i) => {
            const isUser = msg.role === ChatRole.USER
            const alignment = isUser ? 'cdx-justify-end' : 'cdx-justify-start'
            const bubbleColor = isUser
              ? 'cdx-bg-blue-500 cdx-text-white'
              : 'cdx-bg-neutral-200 dark:cdx-bg-neutral-700'

            const Avatar = isUser ? RiUserFill : BsRobot
            const avatarColor = isUser
              ? 'cdx-bg-blue-500 cdx-text-white'
              : 'cdx-bg-neutral-200 dark:cdx-bg-neutral-700'

            const messageBubble = (
              <div className="cdx-group cdx-max-w-[85%]">
                <div
                  className={`markdown cdx-relative cdx-p-3 cdx-rounded-lg ${bubbleColor}`}
                >
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
                  {msg.files && <FilePreviewBar files={msg.files} />}

                  {/* Action Toolbar Inside Bubble */}
                  <div className="cdx-absolute cdx-bottom-1 cdx-right-2 cdx-flex cdx-items-center cdx-gap-1 cdx-opacity-0 group-hover:cdx-opacity-100 cdx-transition-opacity cdx-duration-150 cdx-bg-black/10 cdx-rounded-md cdx-p-0.5">
                    {isUser ? (
                      <button
                        type="button"
                        onClick={() => removeMessagePair(msg.timestamp)}
                        className="hover:cdx-text-red-500 cdx-text-xs"
                        title="Delete"
                      >
                        <RiCloseLine />
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => onRegenerate(msg.timestamp)}
                          className="hover:cdx-text-blue-500 cdx-text-xs"
                          title="Regenerate"
                        >
                          <RiRefreshLine />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            window.parent.postMessage({
                              action: 'copy-to-clipboard',
                              _payload: { content: msg.content },
                            })
                          }
                          className="hover:cdx-text-blue-500 cdx-text-xs"
                          title="Copy"
                        >
                          <RiFileCopyLine />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )

            return (
              <div
                key={`${msg.timestamp}-${i}`}
                className={`cdx-flex cdx-items-start cdx-gap-2 ${alignment}`}
              >
                {!isUser && (
                  <div
                    className={`cdx-flex-shrink-0 cdx-rounded-full cdx-h-8 cdx-w-8 cdx-grid cdx-place-items-center ${avatarColor}`}
                  >
                    <Avatar className="cdx-text-xl" />
                  </div>
                )}
                {messageBubble}
                {isUser && (
                  <div
                    className={`cdx-flex-shrink-0 cdx-rounded-full cdx-h-8 cdx-w-8 cdx-grid cdx-place-items-center ${avatarColor}`}
                  >
                    <Avatar className="cdx-text-xl" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
      {messages[messages.length - 1]?.role === ChatRole.USER && (
        <div className="cdx-text-neutral-500">
          {generating && !error && (
            <div className="cdx-animate-pulse cdx-mt-4 cdx-flex cdx-justify-center cdx-items-center cdx-gap-2">
              <RiLoader4Line className="cdx-animate-spin" />
              <span>生成中</span>
            </div>
          )}
          {error && (
            <div className="cdx-p-4 cdx-flex cdx-items-center cdx-gap-4 cdx-bg-red-500/10">
              <RiErrorWarningLine
                className="cdx-text-red-500 cdx-flex-shrink-0"
                size={20}
              />
              <span>{error.message}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ChatList
