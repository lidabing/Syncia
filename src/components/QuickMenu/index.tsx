import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import React, { useEffect, useState, useRef } from 'react'
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
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const menuRef = useRef<HTMLDivElement>(null)

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

  // 拖拽功能实现
  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      const container = document.getElementById('react-highlight-menu-container')
      if (container) {
        container.style.left = `${e.clientX - dragOffset.x}px`
        container.style.top = `${e.clientY - dragOffset.y}px`
      }
    }

    const handleMouseUp = (e: MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)
    }

    document.body.style.cursor = 'grabbing'
    document.body.style.userSelect = 'none'
    
    document.addEventListener('mousemove', handleMouseMove, { capture: true })
    document.addEventListener('mouseup', handleMouseUp, { capture: true })

    return () => {
      document.removeEventListener('mousemove', handleMouseMove, { capture: true })
      document.removeEventListener('mouseup', handleMouseUp, { capture: true })
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isDragging, dragOffset])

  const handleDragStart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const container = document.getElementById('react-highlight-menu-container')
    if (container) {
      const rect = container.getBoundingClientRect()
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
      setIsDragging(true)
    }
  }

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
      ref={menuRef}
      style={{ zIndex: 2147483647 }}
      className="cdx-flex cdx-items-center cdx-gap-0.5 cdx-bg-white dark:cdx-bg-neutral-800 cdx-shadow-lg cdx-rounded-lg cdx-p-1.5 cdx-border cdx-border-neutral-200 dark:cdx-border-neutral-700"
      onMouseDown={(e) => e.preventDefault()}
    >
      {/* 拖动手柄 - 竖线 */}
      <div 
        className="cdx-flex cdx-items-center cdx-justify-center cdx-gap-0.5 cdx-px-2 cdx-py-1.5 cdx-transition-opacity hover:cdx-opacity-60 cdx-cursor-grab active:cdx-cursor-grabbing"
        onMouseDown={handleDragStart}
      >
        <div className="cdx-w-0.5 cdx-h-4 cdx-bg-neutral-400 dark:cdx-bg-neutral-500 cdx-rounded-full" />
        <div className="cdx-w-0.5 cdx-h-4 cdx-bg-neutral-400 dark:cdx-bg-neutral-500 cdx-rounded-full" />
      </div>

      {/* AI 图标 - 清新的星星设计 */}
      <div
        className="cdx-flex cdx-items-center cdx-justify-center cdx-w-7 cdx-h-7 cdx-rounded-md cdx-flex-shrink-0 cdx-mr-1"
        style={{ 
          background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)',
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z"
            fill="white"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* 常用功能按钮 */}
      {QUICK_ACTIONS.map((action) => {
        const Icon = action.icon
        return (
          <button
            key={action.id}
            type="button"
            onClick={() => handleQuickAction(action.prompt)}
            className="cdx-flex cdx-items-center cdx-gap-1.5 cdx-px-2.5 cdx-py-1.5 cdx-rounded-md cdx-text-sm !cdx-font-sans cdx-cursor-pointer cdx-transition-colors cdx-duration-200 cdx-border-none cdx-bg-transparent hover:cdx-bg-neutral-100 dark:hover:cdx-bg-neutral-700 cdx-text-neutral-700 dark:cdx-text-neutral-300"
            title={action.name}
          >
            <Icon size={14} className="cdx-flex-shrink-0" />
            <span className="cdx-whitespace-nowrap cdx-font-normal">{action.name}</span>
          </button>
        )
      })}

      {/* 分隔线 */}
      <div className="cdx-w-px cdx-h-5 cdx-bg-neutral-300 dark:cdx-bg-neutral-600 cdx-mx-1" />

      {/* 更多功能下拉菜单 */}
      <DropdownMenu.Root open={dropdownOpen} onOpenChange={setDropdownOpen} modal={false}>
        <DropdownMenu.Trigger asChild>
          <button
            type="button"
            className="cdx-flex cdx-items-center cdx-gap-1.5 cdx-px-2.5 cdx-py-1.5 cdx-rounded-md cdx-text-sm !cdx-font-sans cdx-cursor-pointer cdx-transition-colors cdx-duration-200 cdx-border-none cdx-bg-transparent hover:cdx-bg-neutral-100 dark:hover:cdx-bg-neutral-700 cdx-text-neutral-700 dark:cdx-text-neutral-300"
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
