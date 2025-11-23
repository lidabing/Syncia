import * as Dialog from '@radix-ui/react-dialog'
import { useRef, useState } from 'react'
import { HiDocumentText, HiFolder } from 'react-icons/hi'
import TextareaAutosize from 'react-textarea-autosize'
import { type Prompt, usePrompts } from '../../../hooks/usePrompts'
import DialogPortal from '../../Layout/DialogPortal'
import { getUUID } from '../../../lib/getUUID'

export const AddItemButton = ({ isCategory }: { isCategory: boolean }) => {
  const [open, setOpen] = useState(false)
  const [prompts, setPrompts] = usePrompts()
  const formRef = useRef<HTMLFormElement>(null)

  const handleAdd = () => {
    if (!formRef.current || !formRef.current.reportValidity()) return

    const formData = new FormData(formRef.current)

    const newName = formData.get('promptName') as string
    const newPrompt = formData.get('prompt') as string

    const item = {
      id: getUUID(),
      name: newName,
      prompt: isCategory ? undefined : newPrompt,
      children: isCategory ? [] : undefined,
    } as Prompt

    const newPrompts = [...prompts, item]
    setPrompts([])
    setPrompts(newPrompts)

    setOpen(false)
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        {isCategory ? (
          <button
            className="btn !cdx-py-1 cdx-text-sm dark:cdx-bg-neutral-600 cdx-bg-neutral-400 hover:cdx-bg-neutral-500 hover:dark:cdx-bg-neutral-700"
            type="button"
          >
            <HiFolder />
            <span>添加分类</span>
          </button>
        ) : (
          <button className="btn !cdx-py-1 cdx-text-sm" type="button">
            <HiDocumentText />
            <span>添加提示词</span>
          </button>
        )}
      </Dialog.Trigger>
      <DialogPortal
        title={isCategory ? '添加新分类' : '添加新提示词'}
        primaryAction={handleAdd}
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
            placeholder="输入名称"
          />
          {!isCategory && (
            <>
              <label htmlFor="prompt">提示词</label>
              <TextareaAutosize
                name="prompt"
                className="input"
                required
                placeholder="输入提示词"
                minRows={2}
                maxRows={15}
              />
            </>
          )}
        </form>
      </DialogPortal>
    </Dialog.Root>
  )
}
