import { BsRobot } from 'react-icons/bs'
import { HiOutlineCog, HiX } from 'react-icons/hi'
import { RiAddCircleLine } from 'react-icons/ri'
import PageSuggestions from '../chat/PageSuggestions'

interface HeaderProps {
  clearMessages?: () => void
  onSelectSuggestion?: (suggestion: string) => void
}

const Header = ({ clearMessages, onSelectSuggestion }: HeaderProps) => {
  const onToggle = () => {
    chrome.runtime.sendMessage({ action: 'close-sidebar' })
  }

  const settingsPage = chrome.runtime.getURL('/src/pages/settings/index.html')

  return (
    <>
      <header className="cdx-flex cdx-justify-between cdx-items-center cdx-px-4 cdx-py-3 cdx-border-b dark:cdx-border-neutral-700/40 cdx-border-neutral-200/70 cdx-bg-white/80 dark:cdx-bg-neutral-900/80 cdx-backdrop-blur-md cdx-shadow-sm dark:cdx-shadow-neutral-900/50">
        {/* Logo and Title */}
        <div className="cdx-flex cdx-items-center cdx-gap-2.5 cdx-group">
          <div className="cdx-p-1.5 cdx-rounded-lg cdx-bg-gradient-to-br cdx-from-blue-500 cdx-to-purple-600 dark:cdx-from-blue-400 dark:cdx-to-purple-500 cdx-shadow-sm group-hover:cdx-shadow-md cdx-transition-all cdx-duration-300">
            <BsRobot className="cdx-text-white cdx-text-sm" />
          </div>
          <h1 className="cdx-text-sm cdx-font-semibold cdx-m-0 cdx-p-0 cdx-text-neutral-700 dark:cdx-text-neutral-200 cdx-tracking-tight">
            千羽助手
          </h1>
        </div>

        {/* Action Buttons */}
        <div className="cdx-flex cdx-gap-1.5 cdx-items-center">
          {clearMessages && (
            <button
              type="button"
              onClick={clearMessages}
              title="新建对话"
              aria-label="新建对话"
              className="cdx-group cdx-relative cdx-p-2 cdx-rounded-lg cdx-text-blue-600 dark:cdx-text-blue-400 hover:cdx-bg-blue-50 dark:hover:cdx-bg-blue-900/30 hover:cdx-text-blue-700 dark:hover:cdx-text-blue-300 cdx-transition-all cdx-duration-200 hover:cdx-scale-105 active:cdx-scale-95 focus:cdx-outline-none focus:cdx-ring-2 focus:cdx-ring-blue-500/50 dark:focus:cdx-ring-blue-400/50"
            >
              <RiAddCircleLine className="cdx-text-lg" />
              <span className="cdx-absolute cdx-inset-0 cdx-rounded-lg cdx-ring-2 cdx-ring-blue-500/0 group-hover:cdx-ring-blue-500/20 dark:group-hover:cdx-ring-blue-400/20 cdx-transition-all cdx-duration-200" />
            </button>
          )}
          <a
            target="_blank"
            rel="noreferrer"
            tabIndex={0}
            title="设置"
            aria-label="打开设置"
            className="cdx-group cdx-relative cdx-p-2 cdx-rounded-lg cdx-text-neutral-600 dark:cdx-text-neutral-400 hover:cdx-bg-neutral-100 dark:hover:cdx-bg-neutral-700/50 hover:cdx-text-neutral-700 dark:hover:cdx-text-neutral-300 cdx-transition-all cdx-duration-200 hover:cdx-scale-105 active:cdx-scale-95 focus:cdx-outline-none focus:cdx-ring-2 focus:cdx-ring-neutral-500/50 dark:focus:cdx-ring-neutral-400/50"
            href={settingsPage}
          >
            <HiOutlineCog className="cdx-text-base group-hover:cdx-rotate-90 cdx-transition-transform cdx-duration-300" />
            <span className="cdx-absolute cdx-inset-0 cdx-rounded-lg cdx-ring-2 cdx-ring-neutral-500/0 group-hover:cdx-ring-neutral-500/20 dark:group-hover:cdx-ring-neutral-400/20 cdx-transition-all cdx-duration-200" />
          </a>
          <button
            type="button"
            title="关闭侧边栏"
            aria-label="关闭侧边栏"
            className="cdx-group cdx-relative cdx-p-2 cdx-rounded-lg cdx-text-neutral-600 dark:cdx-text-neutral-400 hover:cdx-bg-red-50 dark:hover:cdx-bg-red-900/30 hover:cdx-text-red-600 dark:hover:cdx-text-red-400 cdx-transition-all cdx-duration-200 hover:cdx-scale-105 active:cdx-scale-95 focus:cdx-outline-none focus:cdx-ring-2 focus:cdx-ring-red-500/50 dark:focus:cdx-ring-red-400/50"
            onClick={onToggle}
          >
            <HiX className="cdx-text-base group-hover:cdx-rotate-90 cdx-transition-transform cdx-duration-200" />
            <span className="cdx-absolute cdx-inset-0 cdx-rounded-lg cdx-ring-2 cdx-ring-red-500/0 group-hover:cdx-ring-red-500/20 dark:group-hover:cdx-ring-red-400/20 cdx-transition-all cdx-duration-200" />
          </button>
        </div>
      </header>
      {onSelectSuggestion && <PageSuggestions onSelectSuggestion={onSelectSuggestion} />}
    </>
  )
}

export default Header
