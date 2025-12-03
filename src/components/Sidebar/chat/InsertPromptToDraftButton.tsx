import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import React from 'react'
import { RiFileCopy2Line } from 'react-icons/ri'
import { usePrompts } from '../../../hooks/usePrompts'
import { RecursiveItem } from '../../QuickMenu/RecursiveItem'

interface InsertPromptToDraftButtonProps {
  setMessageDraftText: (text: string) => void
}

const InsertPromptToDraftButton = ({
  setMessageDraftText,
}: InsertPromptToDraftButtonProps) => {
  const [prompts] = usePrompts()
  
  // 确保 prompts 是数组，防止存储数据损坏导致崩溃
  const promptsArray = Array.isArray(prompts) ? prompts : []
  const noCategoryPrompts = promptsArray.filter((i) => !!i.prompt)

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          title="插入快捷提示词"
          className="cdx-flex cdx-items-center cdx-justify-center cdx-bg-neutral-200 hover:cdx-bg-neutral-300 cdx-text-neutral-600 dark:cdx-text-neutral-300 dark:cdx-bg-neutral-800 dark:hover:cdx-bg-neutral-700 cdx-w-8 cdx-h-8 cdx-rounded-lg cdx-transition-all cdx-duration-200 hover:cdx-scale-105"
        >
          <RiFileCopy2Line size={18} />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          style={{ zIndex: 2147483647 }}
          className="cdx-flex cdx-flex-col cdx-min-w-[150px] cdx-gap-2 cdx-backdrop-blur-sm !cdx-font-sans cdx-m-2 cdx-bg-neutral-50 cdx-shadow-md cdx-p-2 cdx-rounded dark:cdx-bg-neutral-800 cdx-text-neutral-800 dark:cdx-text-neutral-100"
        >
          <DropdownMenu.Group>
            {promptsArray
              .filter((i) => !i.prompt)
              .map((item) => (
                <React.Fragment key={item.id}>
                  <DropdownMenu.Label className="cdx-text-[10px] cdx-m-1 cdx-text-neutral-500 cdx-uppercase">
                    {item.name}
                  </DropdownMenu.Label>
                  {item.children?.map((item) => (
                    <RecursiveItem
                      key={item.id}
                      item={item}
                      handleGenerate={setMessageDraftText}
                    />
                  ))}
                </React.Fragment>
              ))}

            {noCategoryPrompts.length > 0 && (
              <DropdownMenu.Label className="cdx-text-[10px] cdx-m-1 cdx-text-neutral-500 cdx-uppercase">
                未分类
              </DropdownMenu.Label>
            )}
            {noCategoryPrompts.map((item) => (
              <RecursiveItem
                item={item}
                key={item.id}
                handleGenerate={setMessageDraftText}
              />
            ))}
          </DropdownMenu.Group>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

export default InsertPromptToDraftButton
