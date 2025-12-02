import { BsRobot } from 'react-icons/bs'
import { HiOutlineCog, HiX } from 'react-icons/hi'
import { RiAddCircleLine } from 'react-icons/ri'

interface HeaderProps {
  clearMessages?: () => void
}

const Header = ({ clearMessages }: HeaderProps) => {
  const onToggle = () => {
    chrome.runtime.sendMessage({ action: 'close-sidebar' })
  }

  const settingsPage = chrome.runtime.getURL('/src/pages/settings/index.html')

  return (
    <div className="cdx-flex cdx-justify-between cdx-items-center cdx-px-4 cdx-py-3 cdx-border-b dark:cdx-border-neutral-700/50 cdx-border-neutral-200 dark:cdx-bg-gradient-to-r dark:from-neutral-800/80 dark:to-neutral-800/40 cdx-bg-gradient-to-r cdx-from-neutral-50 cdx-to-neutral-100/50 cdx-backdrop-blur-sm">
      <div className="cdx-flex cdx-items-center cdx-gap-2.5">
        <div className="cdx-p-1.5 cdx-rounded-lg cdx-bg-gradient-to-br cdx-from-blue-500 cdx-to-blue-600 cdx-shadow-sm">
          <BsRobot className="cdx-text-white cdx-text-lg" />
        </div>
        <h1 className="cdx-text-base cdx-font-semibold cdx-m-0 cdx-p-0 cdx-bg-gradient-to-r cdx-from-blue-600 cdx-to-blue-500 dark:cdx-from-blue-400 dark:cdx-to-blue-300 cdx-bg-clip-text cdx-text-transparent">千羽助手</h1>
      </div>

      <div className="cdx-flex cdx-gap-1.5 cdx-items-center">
        {clearMessages && (
          <button
            type="button"
            onClick={clearMessages}
            title="新建对话"
            className="cdx-p-2 cdx-rounded-lg cdx-text-neutral-600 dark:cdx-text-neutral-400 hover:cdx-bg-neutral-200 dark:hover:cdx-bg-neutral-700 hover:cdx-text-neutral-900 dark:hover:cdx-text-white cdx-transition-all cdx-duration-200"
          >
            <RiAddCircleLine className="cdx-text-lg" />
          </button>
        )}
        <a
          target="_blank"
          rel="noreferrer"
          tabIndex={0}
          title="设置"
          className="cdx-p-2 cdx-rounded-lg cdx-text-neutral-600 dark:cdx-text-neutral-400 hover:cdx-bg-neutral-200 dark:hover:cdx-bg-neutral-700 hover:cdx-text-neutral-900 dark:hover:cdx-text-white cdx-transition-all cdx-duration-200"
          href={settingsPage}
        >
          <HiOutlineCog className="cdx-text-lg" />
        </a>
        <button
          type="button"
          title="关闭侧边栏"
          className="cdx-p-2 cdx-rounded-lg cdx-text-neutral-600 dark:cdx-text-neutral-400 hover:cdx-bg-red-50 dark:hover:cdx-bg-red-900/20 hover:cdx-text-red-600 dark:hover:cdx-text-red-400 cdx-transition-all cdx-duration-200"
          onClick={onToggle}
        >
          <HiX className="cdx-text-lg" />
        </button>
      </div>
    </div>
  )
}

export default Header
