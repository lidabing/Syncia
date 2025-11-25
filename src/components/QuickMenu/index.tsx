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
      className="cdx-flex cdx-items-center cdx-gap-0 cdx-bg-white dark:cdx-bg-neutral-800 cdx-shadow-lg cdx-rounded-lg cdx-p-1 cdx-border cdx-border-neutral-200 dark:cdx-border-neutral-700"
      onMouseDown={(e) => e.preventDefault()}
    >
      {/* AI 图标 */}
      <button
        type="button"
        className="cdx-flex cdx-items-center cdx-justify-center cdx-w-7 cdx-h-7 cdx-rounded-md cdx-flex-shrink-0 cdx-transition-all cdx-duration-200 hover:cdx-opacity-90 cdx-cursor-default"
        style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <AIIcon size={14} style={{ color: '#ffffff', fill: '#ffffff' }} />
      </button>

      {/* 常用功能按钮 */}
      {QUICK_ACTIONS.map((action) => {
        const Icon = action.icon
        return (
          <button
            key={action.id}
            type="button"
            onClick={() => handleQuickAction(action.prompt)}
            className="cdx-flex cdx-items-center cdx-gap-1 cdx-px-2 cdx-py-1 cdx-rounded-md cdx-text-xs !cdx-font-sans cdx-cursor-pointer cdx-transition-colors cdx-duration-200 cdx-border-none cdx-bg-transparent hover:cdx-bg-neutral-100 dark:hover:cdx-bg-neutral-700 cdx-text-neutral-700 dark:cdx-text-neutral-300"
            title={action.name}
          >
            <Icon size={14} className="cdx-flex-shrink-0" />
            <span className="cdx-whitespace-nowrap cdx-font-normal">{action.name}</span>
          </button>
        )
      })}

      {/* 分隔线 */}
      <div className="cdx-w-px cdx-h-4 cdx-bg-neutral-300 dark:cdx-bg-neutral-600 cdx-mx-1" />

      {/* 更多功能下拉菜单 */}
      <DropdownMenu.Root open={dropdownOpen} onOpenChange={setDropdownOpen} modal={false}>
        <DropdownMenu.Trigger asChild>
          <button
            type="button"
            className="cdx-flex cdx-items-center cdx-gap-1 cdx-px-2 cdx-py-1 cdx-rounded-md cdx-text-xs !cdx-font-sans cdx-cursor-pointer cdx-transition-colors cdx-duration-200 cdx-border-none cdx-bg-transparent hover:cdx-bg-neutral-100 dark:hover:cdx-bg-neutral-700 cdx-text-neutral-700 dark:cdx-text-neutral-300"
            title="更多功能"
            onMouseDown={(e) => e.preventDefault()}
          >
            <MoreIcon size={14} className="cdx-flex-shrink-0" />
            <span className="cdx-whitespace-nowrap cdx-font-normal">更多</span>
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            style={{ zIndex: 2147483647, position: 'fixed' }}
            className="cdx-flex cdx-flex-col cdx-min-w-[180px] cdx-max-w-[240px] cdx-gap-0 !cdx-font-sans cdx-bg-white dark:cdx-bg-neutral-800 cdx-shadow-lg cdx-p-1 cdx-rounded-lg cdx-border cdx-border-neutral-200 dark:cdx-border-neutral-700 cdx-text-neutral-800 dark:cdx-text-neutral-100"
            sideOffset={6}
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
                    <DropdownMenu.Label className="cdx-text-[11px] cdx-px-2.5 cdx-py-1.5 cdx-text-neutral-500 dark:cdx-text-neutral-400 cdx-font-medium">
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
                  <DropdownMenu.Label className="cdx-text-[11px] cdx-px-2.5 cdx-py-1.5 cdx-text-neutral-500 dark:cdx-text-neutral-400 cdx-font-medium">
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
