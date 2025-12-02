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
      <div className="cdx-flex cdx-justify-between cdx-items-center cdx-px-3 cdx-py-2 cdx-border-b dark:cdx-border-neutral-700/30 cdx-border-neutral-200/50 cdx-backdrop-blur-sm">
        <div className="cdx-flex cdx-items-center cdx-gap-2">
          <BsRobot className="cdx-text-neutral-400 dark:cdx-text-neutral-500 cdx-text-base" />
          <h1 className="cdx-text-xs cdx-font-medium cdx-m-0 cdx-p-0 cdx-text-neutral-500 dark:cdx-text-neutral-400">千羽助手</h1>
        </div>

        <div className="cdx-flex cdx-gap-1 cdx-items-center">
          {clearMessages && (
            <button
              type="button"
              onClick={clearMessages}
              title="新建对话"
              className="cdx-p-1.5 cdx-rounded-md cdx-text-neutral-500 dark:cdx-text-neutral-500 hover:cdx-bg-neutral-200 dark:hover:cdx-bg-neutral-700 hover:cdx-text-neutral-700 dark:hover:cdx-text-neutral-300 cdx-transition-all cdx-duration-200"
            >
              <RiAddCircleLine className="cdx-text-sm" />
            </button>
          )}
          <a
            target="_blank"
            rel="noreferrer"
            tabIndex={0}
            title="设置"
            className="cdx-p-1.5 cdx-rounded-md cdx-text-neutral-500 dark:cdx-text-neutral-500 hover:cdx-bg-neutral-200 dark:hover:cdx-bg-neutral-700 hover:cdx-text-neutral-700 dark:hover:cdx-text-neutral-300 cdx-transition-all cdx-duration-200"
            href={settingsPage}
          >
            <HiOutlineCog className="cdx-text-sm" />
          </a>
          <button
            type="button"
            title="关闭侧边栏"
            className="cdx-p-1.5 cdx-rounded-md cdx-text-neutral-500 dark:cdx-text-neutral-500 hover:cdx-bg-red-50 dark:hover:cdx-bg-red-900/20 hover:cdx-text-red-600 dark:hover:cdx-text-red-400 cdx-transition-all cdx-duration-200"
            onClick={onToggle}
          >
            <HiX className="cdx-text-sm" />
          </button>
        </div>
      </div>
      {onSelectSuggestion && <PageSuggestions onSelectSuggestion={onSelectSuggestion} />}
    </>
  )
}

export default Header
