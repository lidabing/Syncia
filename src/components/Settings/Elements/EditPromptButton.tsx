import * as Dialog from '@radix-ui/react-dialog'
import { useRef, useState } from 'react'
import { HiPencilAlt } from 'react-icons/hi'
import TextareaAutosize from 'react-textarea-autosize'
import { type Prompt, usePrompts } from '../../../hooks/usePrompts'
import { useLanguage } from '../../../hooks/useLanguage'
import DialogPortal from '../../Layout/DialogPortal'

export const EditPromptButton = ({
  item,
  isLeafNode,
}: { item: Prompt; isLeafNode: boolean }) => {
  const [open, setOpen] = useState(false)
  const [, setPrompts] = usePrompts()
  const formRef = useRef<HTMLFormElement>(null)
  const { t } = useLanguage()

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
          <HiPencilAlt /> {t.settings.prompts.edit}
        </button>
      </Dialog.Trigger>
      <DialogPortal
        title={isLeafNode ? t.settings.prompts.editPrompt : t.settings.prompts.editCategory}
        primaryAction={handleEdit}
        secondaryAction={() => setOpen(false)}
        primaryText={t.settings.prompts.save}
        secondaryText={t.settings.prompts.cancel}
      >
        <form className="cdx-flex cdx-flex-col cdx-gap-2" ref={formRef}>
          <label htmlFor="promptName">{t.settings.prompts.promptName}</label>
          <input
            name="promptName"
            className="input"
            type="text"
            required
            defaultValue={item.name}
          />
          {isLeafNode && (
            <>
              <label htmlFor="prompt">{t.settings.prompts.promptContent}</label>
              <TextareaAutosize
                name="prompt"
                className="input"
                required
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
