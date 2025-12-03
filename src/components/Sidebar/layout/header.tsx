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
      <header className="cdx-flex cdx-justify-between cdx-items-center cdx-px-3 cdx-py-2 cdx-border-b dark:cdx-border-neutral-800/50 cdx-border-neutral-200/50 cdx-bg-white dark:cdx-bg-neutral-900 cdx-flex-shrink-0">
        {/* Logo and Title */}
        <div className="cdx-flex cdx-items-center cdx-gap-2">
          <div className="cdx-p-1 cdx-rounded-md cdx-bg-gradient-to-br cdx-from-blue-500 cdx-to-purple-600 dark:cdx-from-blue-400 dark:cdx-to-purple-500">
            <BsRobot className="cdx-text-white" size={14} />
          </div>
          <h1 className="cdx-text-sm cdx-font-semibold cdx-m-0 cdx-text-neutral-800 dark:cdx-text-neutral-100">
            千羽助手
          </h1>
        </div>

        {/* Action Buttons */}
        <div className="cdx-flex cdx-gap-1 cdx-items-center">
          {clearMessages && (
            <button
              type="button"
              onClick={clearMessages}
              title="新建对话"
              className="cdx-p-1.5 cdx-rounded-md cdx-text-blue-600 dark:cdx-text-blue-400 hover:cdx-bg-blue-50 dark:hover:cdx-bg-blue-900/30 cdx-transition-all cdx-duration-200 hover:cdx-scale-110"
            >
              <RiAddCircleLine size={16} />
            </button>
          )}
          <a
            target="_blank"
            rel="noreferrer"
            title="设置"
            className="cdx-p-1.5 cdx-rounded-md cdx-text-neutral-600 dark:cdx-text-neutral-400 hover:cdx-bg-neutral-100 dark:hover:cdx-bg-neutral-800 cdx-transition-all cdx-duration-200 hover:cdx-scale-110"
            href={settingsPage}
          >
            <HiOutlineCog size={16} />
          </a>
          <button
            type="button"
            title="关闭"
            className="cdx-p-1.5 cdx-rounded-md cdx-text-neutral-600 dark:cdx-text-neutral-400 hover:cdx-bg-red-50 dark:hover:cdx-bg-red-900/30 hover:cdx-text-red-600 dark:hover:cdx-text-red-400 cdx-transition-all cdx-duration-200 hover:cdx-scale-110"
            onClick={onToggle}
          >
            <HiX size={16} />
          </button>
        </div>
      </header>
      {onSelectSuggestion && <PageSuggestions onSelectSuggestion={onSelectSuggestion} />}
    </>
  )
}

export default Header
