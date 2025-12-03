import type { CodeProps } from 'react-markdown/lib/ast-to-react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import {
  atomDark,
  tomorrow,
} from 'react-syntax-highlighter/dist/esm/styles/prism'

const isDarkMode = () => {
  if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
    return true
  }
  return false
}

const CodeBlock = (props: CodeProps) => {
  const { children, className, inline } = props
  const match = /language-(\w+)/.exec(className || '')
  const language = match ? match[1] : 'javascript'
  const modClass = `${className} cdx-text-sm`
  return !inline ? (
    <SyntaxHighlighter
      className={modClass}
      language={language}
      PreTag="div"
      style={isDarkMode() ? atomDark : tomorrow}
    >
      {String(children)}
    </SyntaxHighlighter>
  ) : (
    <code
      className={`${modClass} cdx-bg-neutral-100 dark:cdx-bg-neutral-800 cdx-px-1.5 cdx-py-0.5 cdx-rounded-md cdx-text-[0.9em] cdx-break-words`}
    >
      {children}
    </code>
  )
}

export default CodeBlock
