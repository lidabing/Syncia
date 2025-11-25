import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import React, { useEffect, useState } from 'react'
import { HiOutlineChevronRight } from 'react-icons/hi'
import { usePrompts } from '../../hooks/usePrompts'
import useThemeSync from '../../hooks/useThemeSync'
import { generatePromptInSidebar } from '../../lib/generatePromptInSidebar'
import { RecursiveItem } from './RecursiveItem'
import { 
  AIIcon, 
  SummarizeIcon, 
  ExplainIcon, 
  TranslateIcon, 
  MoreIcon 
} from './icons'
import './index.css'

interface QuickMenuProps {
  selectedText: string
  setMenuOpen: (open: boolean) => void
}

// 定义常用功能按钮
const QUICK_ACTIONS = [
  { 
    id: 'summarize', 
    name: '总结', 
    icon: SummarizeIcon,
    prompt: '请总结以下内容：' 
  },
  { 
    id: 'explain', 
    name: '解释', 
    icon: ExplainIcon,
    prompt: '请解释以下内容：' 
  },
  { 
    id: 'translate', 
    name: '翻译', 
    icon: TranslateIcon,
    prompt: '请将以下内容翻译成简体中文：' 
  },
]

export const QuickMenu = ({ selectedText, setMenuOpen }: QuickMenuProps) => {
  useThemeSync()
  const [prompts] = usePrompts()
  const [dropdownOpen, setDropdownOpen] = useState(false)

  useEffect(() => {
    const highlightMenu = document.getElementById(
      'react-highlight-menu-container',
    ) as HTMLDivElement | null
    if (highlightMenu) highlightMenu.style.zIndex = '2147483647'
  }, [])

  // 阻止下拉菜单打开时的页面滚动
  useEffect(() => {
    if (dropdownOpen) {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = originalOverflow
      }
    }
  }, [dropdownOpen])

  const handleGenerate = (prompt: string) => {
    generatePromptInSidebar(prompt, selectedText)
    setMenuOpen(false)
  }

  const handleQuickAction = (prompt: string) => {
    handleGenerate(prompt)
  }

  const noCategoryPrompts = prompts.filter((i) => !!i.prompt)

  return (
    <div 
      style={{ zIndex: 2147483647 }}
      className="cdx-flex cdx-items-center cdx-gap-1 cdx-bg-white dark:cdx-bg-neutral-800 cdx-shadow-xl cdx-rounded-lg cdx-p-1.5 cdx-border cdx-border-neutral-200 dark:cdx-border-neutral-700"
      onMouseDown={(e) => e.preventDefault()}
    >
      {/* AI 图标 */}
      <div 
        className="cdx-flex cdx-items-center cdx-justify-center cdx-w-8 cdx-h-8 cdx-rounded cdx-flex-shrink-0"
        style={{ 
          background: 'linear-gradient(135deg, #a855f7 0%, #3b82f6 100%)',
          minWidth: '32px',
          minHeight: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <AIIcon size={20} style={{ color: '#ffffff', fill: '#ffffff' }} />
      </div>

      {/* 常用功能按钮 */}
      {QUICK_ACTIONS.map((action) => {
        const Icon = action.icon
        return (
          <button
            key={action.id}
            type="button"
            onClick={() => handleQuickAction(action.prompt)}
            className="cdx-flex cdx-items-center cdx-gap-1.5 cdx-px-3 cdx-py-1.5 cdx-rounded-md cdx-text-sm !cdx-font-sans cdx-cursor-pointer cdx-transition-all cdx-border-none cdx-bg-transparent hover:cdx-bg-neutral-100 dark:hover:cdx-bg-neutral-700 cdx-text-neutral-700 dark:cdx-text-neutral-200"
            title={action.name}
          >
            <Icon size={16} className="cdx-flex-shrink-0" />
            <span className="cdx-whitespace-nowrap">{action.name}</span>
          </button>
        )
      })}

      {/* 分隔线 */}
      <div className="cdx-w-px cdx-h-6 cdx-bg-neutral-300 dark:cdx-bg-neutral-600 cdx-mx-0.5" />

      {/* 更多功能下拉菜单 */}
      <DropdownMenu.Root open={dropdownOpen} onOpenChange={setDropdownOpen} modal={false}>
        <DropdownMenu.Trigger asChild>
          <button
            type="button"
            className="cdx-flex cdx-items-center cdx-gap-1.5 cdx-px-3 cdx-py-1.5 cdx-rounded-md cdx-text-sm !cdx-font-sans cdx-cursor-pointer cdx-transition-all cdx-border-none cdx-bg-transparent hover:cdx-bg-neutral-100 dark:hover:cdx-bg-neutral-700 cdx-text-neutral-700 dark:cdx-text-neutral-200"
            title="更多功能"
            onMouseDown={(e) => e.preventDefault()}
          >
            <MoreIcon size={16} className="cdx-flex-shrink-0" />
            <span className="cdx-whitespace-nowrap">更多</span>
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            style={{ zIndex: 2147483647, position: 'fixed' }}
            className="cdx-flex cdx-flex-col cdx-min-w-[180px] cdx-max-w-[240px] cdx-gap-1 !cdx-font-sans cdx-bg-white dark:cdx-bg-neutral-800 cdx-shadow-xl cdx-p-1.5 cdx-rounded-lg cdx-border cdx-border-neutral-200 dark:cdx-border-neutral-700 cdx-text-neutral-800 dark:cdx-text-neutral-100"
            sideOffset={4}
            align="end"
            alignOffset={0}
            avoidCollisions={false}
            collisionPadding={0}
            onCloseAutoFocus={(e) => e.preventDefault()}
          >
            <DropdownMenu.Group>
              {prompts
                .filter((i) => !i.prompt)
                .map((item) => (
                  <React.Fragment key={item.id}>
                    <DropdownMenu.Label className="cdx-text-[11px] cdx-px-2 cdx-py-1 cdx-text-neutral-500 dark:cdx-text-neutral-400 cdx-font-semibold">
                      {item.name}
                    </DropdownMenu.Label>
                    {item.children?.map((item) => (
                      <RecursiveItem
                        key={item.id}
                        item={item}
                        handleGenerate={handleGenerate}
                      />
                    ))}
                  </React.Fragment>
                ))}

              {noCategoryPrompts.length > 0 && (
                <>
                  <DropdownMenu.Label className="cdx-text-[11px] cdx-px-2 cdx-py-1 cdx-text-neutral-500 dark:cdx-text-neutral-400 cdx-font-semibold">
                    其他
                  </DropdownMenu.Label>
                  {noCategoryPrompts.map((item) => (
                    <RecursiveItem
                      item={item}
                      key={item.id}
                      handleGenerate={handleGenerate}
                    />
                  ))}
                </>
              )}
            </DropdownMenu.Group>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  )
}
