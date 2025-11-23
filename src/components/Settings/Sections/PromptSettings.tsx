import { HiRefresh } from 'react-icons/hi'
import { usePrompts } from '../../../hooks/usePrompts'
import { defaultPrompts } from '../../../config/prompts/default'
import FieldWrapper from '../Elements/FieldWrapper'
import QuickMenuCustomize from '../Elements/QuickMenuCustomize'
import SectionHeading from '../Elements/SectionHeading'

const PromptSettings = () => {
  const [, setPrompts] = usePrompts()

  return (
    <div className="cdx-w-full cdx-flex-shrink-0 cdx-flex-1 cdx-rounded-md">
      <SectionHeading title="提示词" />

      {/* =========================
            Customize Prompts
      ===========================*/}
      <FieldWrapper
        title="自定义提示词"
        description="你可以通过拖动这些项目来组织快捷菜单中的提示词。你还可以通过点击编辑按钮来编辑提示词，并通过点击添加按钮来添加新的提示词。"
      >
        <QuickMenuCustomize />
      </FieldWrapper>

      {/* =========================
          Restore Default Prompts
      ===========================*/}
      <FieldWrapper
        title="恢复默认提示词"
        description="这将恢复默认提示词。请注意，此操作无法撤销。你添加的任何自定义提示词都将丢失。"
        row
      >
        <button
          type="button"
          className="btn cdx-bg-red-500 hover:cdx-bg-red-600"
          onClick={() => {
            setPrompts(defaultPrompts)
          }}
        >
          <HiRefresh /> 恢复
        </button>
      </FieldWrapper>
    </div>
  )
}

export default PromptSettings
