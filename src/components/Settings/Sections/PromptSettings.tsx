import { HiOutlineRefresh, HiOutlineExclamation, HiOutlineTemplate } from 'react-icons/hi'
import { usePrompts } from '../../../hooks/usePrompts'
import { defaultPrompts } from '../../../config/prompts/default'
import FieldWrapper from '../Elements/FieldWrapper'
import QuickMenuCustomize from '../Elements/QuickMenuCustomize'
import SectionHeading from '../Elements/SectionHeading'
import { useState } from 'react'

const PromptSettings = () => {
  const [, setPrompts] = usePrompts()
  const [showConfirm, setShowConfirm] = useState(false)

  const handleRestore = () => {
    setPrompts(defaultPrompts)
    setShowConfirm(false)
  }

  return (
    <div className="settings-card">
      <SectionHeading 
        title="Prompt Management" 
        icon={<HiOutlineTemplate />}
        description="Drag to sort, edit or add custom prompts"
      />

      <FieldWrapper
        title="Customize Prompts"
        description="Drag to reorder, click to edit, or add new prompts"
      >
        <QuickMenuCustomize />
      </FieldWrapper>

      <div className="cdx-mt-6 cdx-pt-6 cdx-border-t cdx-border-neutral-100 dark:cdx-border-neutral-700">
        <div className="cdx-flex cdx-items-start cdx-justify-between cdx-gap-4">
          <div>
            <h4 className="cdx-text-sm cdx-font-medium cdx-text-neutral-700 dark:cdx-text-neutral-200">
              Restore Default Prompts
            </h4>
            <p className="cdx-text-xs cdx-text-neutral-500 dark:cdx-text-neutral-400 cdx-mt-1">
              Warning: This action is irreversible
            </p>
          </div>
          {!showConfirm ? (
            <button
              type="button"
              className="btn-secondary cdx-text-red-600 dark:cdx-text-red-400"
              onClick={() => setShowConfirm(true)}
            >
              <HiOutlineRefresh />
              Restore
            </button>
          ) : (
            <div className="cdx-flex cdx-items-center cdx-gap-2">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={handleRestore}
              >
                <HiOutlineExclamation />
                Confirm Restore
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PromptSettings
