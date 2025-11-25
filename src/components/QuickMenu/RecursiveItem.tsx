import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import type { Prompt } from '../../hooks/usePrompts'
import { HiOutlineChevronRight } from 'react-icons/hi'

type RecursiveItemProps = {
  item: Prompt
  handleGenerate: (prompt: string) => void
}

export const RecursiveItem = ({ item, handleGenerate }: RecursiveItemProps) => {
  if (item.prompt && !(item.children as [Prompt] | undefined)?.length) {
    return (
      <DropdownMenu.Item
        className="cdx-px-2.5 cdx-py-1.5 cdx-rounded cdx-border-0 cdx-select-none cdx-outline-0 cdx-text-sm cdx-flex cdx-items-center cdx-justify-between cdx-cursor-pointer data-[highlighted]:cdx-bg-neutral-200 data-[highlighted]:dark:cdx-bg-neutral-700"
        onSelect={() => handleGenerate(item.prompt)}
      >
        <span>{item.name}</span>
      </DropdownMenu.Item>
    )
  }

  if (!item.children || item.children?.length === 0) return null

  return (
    <DropdownMenu.Sub>
      <DropdownMenu.SubTrigger className="cdx-px-2.5 cdx-py-1.5 cdx-rounded cdx-border-0 cdx-select-none cdx-outline-0 cdx-text-sm cdx-flex cdx-items-center cdx-justify-between cdx-cursor-pointer data-[highlighted]:cdx-bg-neutral-200 data-[highlighted]:dark:cdx-bg-neutral-700">
        <span>{item.name}</span>
        <HiOutlineChevronRight size={12} />
      </DropdownMenu.SubTrigger>
      <DropdownMenu.SubContent
        className="cdx-flex cdx-flex-col cdx-min-w-[180px] cdx-gap-1 !cdx-font-sans cdx-ml-1 cdx-bg-white dark:cdx-bg-neutral-800 cdx-shadow-xl cdx-p-1.5 cdx-rounded-lg cdx-border cdx-border-neutral-200 dark:cdx-border-neutral-700 cdx-text-neutral-800 dark:cdx-text-neutral-100"
        style={{ zIndex: 2147483647 }}
        sideOffset={2}
      >
        {item.children.map((item) => (
          <RecursiveItem
            key={item.id}
            item={item}
            handleGenerate={handleGenerate}
          />
        ))}
      </DropdownMenu.SubContent>
    </DropdownMenu.Sub>
  )
}
