import { HiOutlineRefresh, HiOutlineExclamation } from 'react-icons/hi'
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
        title="提示词管理" 
        icon="prompts"
        description="拖拽排序、编辑或添加自定义提示词"
      />

      <FieldWrapper
        title="自定义提示词"
        description="拖拽调整顺序，点击编辑或添加新提示词"
      >
        <QuickMenuCustomize />
      </FieldWrapper>

      <div className="cdx-mt-6 cdx-pt-6 cdx-border-t cdx-border-neutral-100 dark:cdx-border-neutral-700">
        <div className="cdx-flex cdx-items-start cdx-justify-between cdx-gap-4">
          <div>
            <h4 className="cdx-text-sm cdx-font-medium cdx-text-neutral-700 dark:cdx-text-neutral-200">
              恢复默认提示词
            </h4>
            <p className="cdx-text-xs cdx-text-neutral-500 dark:cdx-text-neutral-400 cdx-mt-1">
              警告：此操作不可撤销
            </p>
          </div>
          {!showConfirm ? (
            <button
              type="button"
              className="btn-secondary cdx-text-red-600 dark:cdx-text-red-400"
              onClick={() => setShowConfirm(true)}
            >
              <HiOutlineRefresh />
              恢复
            </button>
          ) : (
            <div className="cdx-flex cdx-items-center cdx-gap-2">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowConfirm(false)}
              >
                取消
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={handleRestore}
              >
                <HiOutlineExclamation />
                确认恢复
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PromptSettings
