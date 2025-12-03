import { BsRobot } from 'react-icons/bs'
import { useChatModels } from '../../../hooks/useChatModels'

const ChangeChatModel = () => {
  const { models, activeChatModel, setActiveChatModel } = useChatModels()
  return (
    <div className="cdx-flex cdx-items-center cdx-gap-2 cdx-text-neutral-600 dark:cdx-text-neutral-400">
      <div className="cdx-w-5 cdx-h-5 cdx-flex cdx-items-center cdx-justify-center cdx-rounded-md cdx-bg-gradient-to-br cdx-from-blue-500 cdx-to-indigo-600">
        <BsRobot size={11} className="cdx-text-white" />
      </div>
      <select
        value={activeChatModel || ''}
        className="cdx-bg-transparent cdx-text-[13px] cdx-font-medium !cdx-m-0 !cdx-p-0 cdx-box-border cdx-w-min focus:cdx-outline-none cdx-max-w-[140px] cdx-cursor-pointer cdx-text-neutral-700 dark:cdx-text-neutral-300"
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
