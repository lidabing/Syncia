import { BsRobot } from 'react-icons/bs'
import { HiOutlineCog, HiX } from 'react-icons/hi'
import { RiAddCircleLine } from 'react-icons/ri'
import PageSuggestions from '../chat/PageSuggestions'
import PageVisionSuggestions from '../chat/PageVisionSuggestions'
import { useLanguage } from '../../../hooks/useLanguage'

interface HeaderProps {
  clearMessages?: () => void
  onSelectSuggestion?: (suggestion: string) => void
}

const Header = ({ clearMessages, onSelectSuggestion }: HeaderProps) => {
  const { t } = useLanguage()
  
  const onToggle = () => {
    chrome.runtime.sendMessage({ action: 'close-sidebar' })
  }

  const settingsPage = chrome.runtime.getURL('/src/pages/settings/index.html')

  return (
    <>
      <header className="cdx-flex cdx-justify-between cdx-items-center cdx-px-4 cdx-py-3 cdx-border-b dark:cdx-border-neutral-800 cdx-border-neutral-200 cdx-bg-white dark:cdx-bg-[#1a1a1a] cdx-flex-shrink-0">
        {/* Logo and Title */}
        <div className="cdx-flex cdx-items-center cdx-gap-2.5">
          <div className="cdx-w-7 cdx-h-7 cdx-flex cdx-items-center cdx-justify-center cdx-rounded-lg cdx-bg-gradient-to-br cdx-from-blue-500 cdx-to-indigo-600 cdx-shadow-sm">
            <BsRobot className="cdx-text-white" size={14} />
          </div>
          <h1 className="cdx-text-[15px] cdx-font-semibold cdx-m-0 cdx-text-neutral-900 dark:cdx-text-white cdx-tracking-tight">
            {t.header.title}
          </h1>
        </div>

        {/* Action Buttons */}
        <div className="cdx-flex cdx-gap-0.5 cdx-items-center">
          {clearMessages && (
            <button
              type="button"
              onClick={clearMessages}
              title={t.header.newChat}
              className="cdx-p-2 cdx-rounded-lg cdx-text-neutral-500 dark:cdx-text-neutral-400 hover:cdx-text-blue-600 dark:hover:cdx-text-blue-400 hover:cdx-bg-neutral-100 dark:hover:cdx-bg-neutral-800 cdx-transition-colors"
            >
              <RiAddCircleLine size={18} />
            </button>
          )}
          <a
            target="_blank"
            rel="noreferrer"
            title={t.header.settings}
            className="cdx-p-2 cdx-rounded-lg cdx-text-neutral-500 dark:cdx-text-neutral-400 hover:cdx-text-neutral-700 dark:hover:cdx-text-neutral-200 hover:cdx-bg-neutral-100 dark:hover:cdx-bg-neutral-800 cdx-transition-colors"
            href={settingsPage}
          >
            <HiOutlineCog size={18} />
          </a>
          <button
            type="button"
            title={t.header.close}
            className="cdx-p-2 cdx-rounded-lg cdx-text-neutral-500 dark:cdx-text-neutral-400 hover:cdx-text-red-500 dark:hover:cdx-text-red-400 hover:cdx-bg-neutral-100 dark:hover:cdx-bg-neutral-800 cdx-transition-colors"
            onClick={onToggle}
          >
            <HiX size={18} />
          </button>
        </div>
      </header>
      {/* Page Vision - AI 页面智能识别 */}
      {onSelectSuggestion && <PageVisionSuggestions onSelectAction={onSelectSuggestion} />}
      {/* 原有的文本建议 */}
      {onSelectSuggestion && <PageSuggestions onSelectSuggestion={onSelectSuggestion} />}
    </>
  )
}

export default Header
