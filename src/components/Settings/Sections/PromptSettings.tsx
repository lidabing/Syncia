import { HiOutlineRefresh, HiOutlineExclamation, HiOutlineTemplate } from 'react-icons/hi'
import { usePrompts } from '../../../hooks/usePrompts'
import { useLanguage } from '../../../hooks/useLanguage'
import { defaultPrompts } from '../../../config/prompts/default'
import FieldWrapper from '../Elements/FieldWrapper'
import QuickMenuCustomize from '../Elements/QuickMenuCustomize'
import SectionHeading from '../Elements/SectionHeading'
import { useState } from 'react'

const PromptSettings = () => {
  const [, setPrompts] = usePrompts()
  const [showConfirm, setShowConfirm] = useState(false)
  const { t } = useLanguage()

  const handleRestore = () => {
    setPrompts(defaultPrompts)
    setShowConfirm(false)
  }

  return (
    <div className="settings-card">
      <SectionHeading 
        title={t.settings.prompts.title}
        icon={<HiOutlineTemplate />}
        description={t.settings.prompts.description}
      />

      <FieldWrapper
        title={t.settings.prompts.customPrompts.title}
        description={t.settings.prompts.customPrompts.description}
      >
        <QuickMenuCustomize />
      </FieldWrapper>

      <div className="cdx-mt-6 cdx-pt-6 cdx-border-t cdx-border-neutral-100 dark:cdx-border-neutral-700">
        <div className="cdx-flex cdx-items-start cdx-justify-between cdx-gap-4">
          <div>
            <h4 className="cdx-text-sm cdx-font-medium cdx-text-neutral-700 dark:cdx-text-neutral-200">
              {t.settings.prompts.restore.title}
            </h4>
            <p className="cdx-text-xs cdx-text-neutral-500 dark:cdx-text-neutral-400 cdx-mt-1">
              {t.settings.prompts.restore.description}
            </p>
          </div>
          {!showConfirm ? (
            <button
              type="button"
              className="btn-secondary cdx-text-red-600 dark:cdx-text-red-400"
              onClick={() => setShowConfirm(true)}
            >
              <HiOutlineRefresh />
              {t.settings.prompts.restore.button}
            </button>
          ) : (
            <div className="cdx-flex cdx-items-center cdx-gap-2">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowConfirm(false)}
              >
                {t.settings.prompts.cancel}
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={handleRestore}
              >
                <HiOutlineExclamation />
                {t.settings.prompts.restore.confirm}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PromptSettings
