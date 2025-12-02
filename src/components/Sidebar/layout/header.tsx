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
    <div className="cdx-flex cdx-justify-between cdx-items-center cdx-p-3.5 cdx-border-b dark:cdx-border-neutral-700/50 cdx-border-neutral-300">
      <div className="cdx-flex cdx-items-center cdx-gap-2">
        <BsRobot className="cdx-text-blue-400 cdx-text-2xl" />
        <h1 className="cdx-text-lg cdx-m-0 cdx-p-0">千羽助手</h1>
      </div>

      <div className="cdx-flex cdx-text-neutral-500 cdx-gap-4 cdx-items-center">
        {clearMessages && (
          <button
            type="button"
            onClick={clearMessages}
            title="New Chat"
            className="cdx-text-xl hover:cdx-text-neutral-800 dark:hover:cdx-text-white"
          >
            <RiAddCircleLine />
          </button>
        )}
        <a
          target="_blank"
          rel="noreferrer"
          tabIndex={0}
          title="Settings"
          className="cdx-text-xl hover:cdx-text-neutral-800 dark:hover:cdx-text-white"
          href={settingsPage}
        >
          <HiOutlineCog />
        </a>
        <button
          type="button"
          title="Close Sidebar"
          className="cdx-text-xl hover:cdx-text-neutral-800 dark:hover:cdx-text-white"
          onClick={onToggle}
        >
          <HiX />
        </button>
      </div>
    </div>
  )
}

export default Header
