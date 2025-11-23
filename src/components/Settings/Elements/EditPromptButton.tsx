import * as Dialog from '@radix-ui/react-dialog'
import { useRef, useState } from 'react'
import { HiPencilAlt } from 'react-icons/hi'
import TextareaAutosize from 'react-textarea-autosize'
import { type Prompt, usePrompts } from '../../../hooks/usePrompts'
import DialogPortal from '../../Layout/DialogPortal'

export const EditPromptButton = ({
  item,
  isLeafNode,
}: { item: Prompt; isLeafNode: boolean }) => {
  const [open, setOpen] = useState(false)
  const [, setPrompts] = usePrompts()
  const formRef = useRef<HTMLFormElement>(null)

  const handleEdit = () => {
    if (!formRef.current || !formRef.current.reportValidity()) return

    const formData = new FormData(formRef.current)

    const newName = formData.get('promptName') as string
    const newPrompt = formData.get('prompt') as string

    const editItem = (items: Prompt[], id: string): Prompt[] => {
      const newItems = items.map((item) => {
        if (item.id === id) {
          item.name = newName
          if (isLeafNode) item.prompt = newPrompt
        }
        if (item.children) {
          item.children = editItem(item.children, id)
        }
        return item
      })
      return newItems
    }

    setPrompts([])
    setPrompts((p) => editItem(p, item.id))
    setOpen(false)
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          className="cdx-flex cdx-items-center cdx-gap-2 cdx-rounded-sm cdx-px-1 cdx-bg-blue-300/50 dark:cdx-bg-blue-500/50"
          type="button"
        >
          <HiPencilAlt /> 编辑
        </button>
      </Dialog.Trigger>
      <DialogPortal
        title={isLeafNode ? '编辑提示词' : '编辑分类'}
        primaryAction={handleEdit}
        secondaryAction={() => setOpen(false)}
        primaryText="保存"
        secondaryText="取消"
      >
        <form className="cdx-flex cdx-flex-col cdx-gap-2" ref={formRef}>
          <label htmlFor="promptName">名称</label>
          <input
            name="promptName"
            className="input"
            type="text"
            required
            defaultValue={item.name}
            placeholder="输入名称"
          />
          {isLeafNode && (
            <>
              <label htmlFor="prompt">提示词</label>
              <TextareaAutosize
                name="prompt"
                className="input"
                required
                placeholder="输入提示词"
                minRows={2}
                maxRows={15}
                defaultValue={item.prompt}
              />
            </>
          )}
        </form>
      </DialogPortal>
    </Dialog.Root>
  )
}
