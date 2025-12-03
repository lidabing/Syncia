import { BsRobot } from 'react-icons/bs'
import { useChatModels } from '../../../hooks/useChatModels'

const ChangeChatModel = () => {
  const { models, activeChatModel, setActiveChatModel } = useChatModels()
  return (
    <div className="cdx-flex cdx-items-center cdx-gap-2 cdx-text-neutral-600 dark:cdx-text-neutral-400 cdx-bg-neutral-100 dark:cdx-bg-neutral-800 cdx-border cdx-rounded-lg cdx-border-neutral-300 dark:cdx-border-neutral-700 cdx-py-1.5 cdx-px-3 cdx-transition-colors cdx-duration-200">
      <BsRobot size={16} className="cdx-flex-shrink-0" />
      <select
        value={activeChatModel || ''}
        className="cdx-bg-transparent cdx-text-sm !m-0 !p-0 cdx-box-border cdx-w-min focus:cdx-outline-none cdx-max-w-[120px] cdx-cursor-pointer"
        onChange={(e) => {
          setActiveChatModel(e.target.value)
        }}
      >
        {models.map((model) => (
          <option key={model.id} value={model.id}>
            {model.id}
          </option>
        ))}
      </select>
    </div>
  )
}

export default ChangeChatModel
