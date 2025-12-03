import React from 'react'
import { HiOutlineCog, HiOutlineChat, HiOutlineEye, HiOutlineMenu, HiOutlineTemplate } from 'react-icons/hi'

interface SectionHeadingProps {
  title: string
  icon?: 'settings' | 'chat' | 'lens' | 'menu' | 'prompts'
  description?: string
}

const iconMap = {
  settings: { icon: HiOutlineCog, color: 'cdx-from-blue-500 cdx-to-cyan-500', bg: 'cdx-bg-blue-100 dark:cdx-bg-blue-900/30' },
  chat: { icon: HiOutlineChat, color: 'cdx-from-green-500 cdx-to-emerald-500', bg: 'cdx-bg-green-100 dark:cdx-bg-green-900/30' },
  lens: { icon: HiOutlineEye, color: 'cdx-from-purple-500 cdx-to-pink-500', bg: 'cdx-bg-purple-100 dark:cdx-bg-purple-900/30' },
  menu: { icon: HiOutlineMenu, color: 'cdx-from-orange-500 cdx-to-amber-500', bg: 'cdx-bg-orange-100 dark:cdx-bg-orange-900/30' },
  prompts: { icon: HiOutlineTemplate, color: 'cdx-from-indigo-500 cdx-to-violet-500', bg: 'cdx-bg-indigo-100 dark:cdx-bg-indigo-900/30' },
}

const SectionHeading = ({ title, icon, description }: SectionHeadingProps) => {
  const iconConfig = icon ? iconMap[icon] : null
  const IconComponent = iconConfig?.icon

  return (
    <div className="cdx-flex cdx-items-start cdx-gap-3 cdx-mb-6">
      {IconComponent && (
        <div className={`settings-section-icon ${iconConfig.bg}`}>
          <IconComponent className={`cdx-bg-gradient-to-r ${iconConfig.color} cdx-bg-clip-text cdx-text-transparent`} />
        </div>
      )}
      <div>
        <h2 className="cdx-text-xl cdx-font-semibold cdx-text-neutral-800 dark:cdx-text-neutral-100">
          {title}
        </h2>
        {description && (
          <p className="cdx-text-sm cdx-text-neutral-500 dark:cdx-text-neutral-400 cdx-mt-1">
            {description}
          </p>
        )}
      </div>
    </div>
  )
}

export default SectionHeading
