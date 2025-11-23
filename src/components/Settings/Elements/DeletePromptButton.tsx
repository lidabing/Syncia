import { useState } from 'react'
import { type Prompt, usePrompts } from '../../../hooks/usePrompts'
import * as Dialog from '@radix-ui/react-dialog'
import { HiTrash } from 'react-icons/hi'
import DialogPortal from '../../Layout/DialogPortal'

export const DeletePromptButton = ({ id }: { id: string }) => {
  const [open, setOpen] = useState(false)
  const [prompts, setPrompts] = usePrompts()

  const handleDelete = () => {
    const removeItem = (items: Prompt[], id: string): Prompt[] => {
      const newItems = items.filter((item) => item.id !== id)
      for (const item of newItems) {
        if (item.children) {
          item.children = removeItem(item.children, id)
        }
      }
      return newItems
    }
    setPrompts([])
    setPrompts(removeItem(prompts, id))
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          className="cdx-rounded-sm cdx-p-1 dark:cdx-bg-red-500/50 cdx-bg-red-300/50"
          type="button"
        >
          <HiTrash />
        </button>
      </Dialog.Trigger>
      <DialogPortal
        title="删除提示词？"
        primaryAction={() => {
          handleDelete()
          setOpen(false)
        }}
        secondaryAction={() => setOpen(false)}
        primaryText="删除"
      >
        你即将删除此提示词。此操作无法撤销。
      </DialogPortal>
    </Dialog.Root>
  )
}
