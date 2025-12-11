import { BsRobot } from 'react-icons/bs'
import { HiOutlineCog, HiOutlineSparkles } from 'react-icons/hi'
import { useLanguage } from '../../hooks/useLanguage'

const Header = () => {
  const { t } = useLanguage()
  
  return (
    <div className="cdx-flex cdx-items-center cdx-justify-between">
      <div className="cdx-flex cdx-items-center cdx-gap-4">
        <div className="cdx-w-14 cdx-h-14 cdx-rounded-2xl cdx-bg-gradient-to-br cdx-from-blue-500 cdx-to-purple-600 cdx-flex cdx-items-center cdx-justify-center cdx-shadow-lg cdx-shadow-blue-500/25">
          <BsRobot className="cdx-text-white cdx-text-2xl" />
        </div>
        <div>
          <h1 className="cdx-text-3xl cdx-font-bold cdx-bg-gradient-to-r cdx-from-neutral-800 cdx-to-neutral-600 dark:cdx-from-white dark:cdx-to-neutral-300 cdx-bg-clip-text cdx-text-transparent">
            {t.header.title}
          </h1>
          <p className="cdx-text-sm cdx-text-neutral-500 dark:cdx-text-neutral-400 cdx-flex cdx-items-center cdx-gap-1.5 cdx-mt-0.5">
            <HiOutlineCog className="cdx-text-blue-500" />
            {t.header.settings}
          </p>
        </div>
      </div>
      <div className="cdx-hidden sm:cdx-flex cdx-items-center cdx-gap-2 cdx-px-4 cdx-py-2 cdx-rounded-full cdx-bg-gradient-to-r cdx-from-amber-100 cdx-to-orange-100 dark:cdx-from-amber-900/30 dark:cdx-to-orange-900/30 cdx-border cdx-border-amber-200 dark:cdx-border-amber-800/50">
        <HiOutlineSparkles className="cdx-text-amber-500" />
        <span className="cdx-text-sm cdx-font-medium cdx-text-amber-700 dark:cdx-text-amber-300">{t.header.aiPowered}</span>
      </div>
    </div>
  )
}

export default Header
