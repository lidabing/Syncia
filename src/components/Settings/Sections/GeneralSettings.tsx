import type React from 'react'
import SectionHeading from '../Elements/SectionHeading'
import FieldWrapper from '../Elements/FieldWrapper'
import { useSettings } from '../../../hooks/useSettings'
import { ThemeOptions } from '../../../config/settings'
import * as Switch from '@radix-ui/react-switch'
import { capitalizeText } from '../../../lib/capitalizeText'
import { HiOutlineMoon, HiOutlineSun, HiOutlineDesktopComputer } from 'react-icons/hi'

const themeIcons = {
  [ThemeOptions.LIGHT]: HiOutlineSun,
  [ThemeOptions.DARK]: HiOutlineMoon,
  [ThemeOptions.SYSTEM]: HiOutlineDesktopComputer,
}

const GeneralSettings = () => {
  const [settings, setSettings] = useSettings()
  const generalSettings = settings.general

  const handleThemeChange = (theme: ThemeOptions) => {
    setSettings({
      ...settings,
      general: {
        ...generalSettings,
        theme: theme,
      },
    })
  }

  return (
    <div className="settings-card">
      <SectionHeading title="通用设置" icon="settings" />

      <FieldWrapper
        title="主题模式"
        description="选择你喜欢的外观主题"
      >
        <div className="cdx-flex cdx-gap-2">
          {Object.values(ThemeOptions).map((theme) => {
            const Icon = themeIcons[theme]
            const isActive = generalSettings?.theme === theme
            return (
              <button
                key={theme}
                type="button"
                onClick={() => handleThemeChange(theme)}
                className={`cdx-flex cdx-items-center cdx-gap-2 cdx-px-4 cdx-py-2.5 cdx-rounded-xl cdx-text-sm cdx-font-medium cdx-transition-all cdx-duration-200 ${
                  isActive
                    ? 'cdx-bg-blue-500 cdx-text-white cdx-shadow-md cdx-shadow-blue-500/25'
                    : 'cdx-bg-neutral-100 dark:cdx-bg-neutral-700 cdx-text-neutral-600 dark:cdx-text-neutral-300 hover:cdx-bg-neutral-200 dark:hover:cdx-bg-neutral-600'
                }`}
              >
                <Icon className="cdx-text-lg" />
                {capitalizeText(theme)}
              </button>
            )
          })}
        </div>
      </FieldWrapper>
      
      <FieldWrapper
        title="网页上下文"
        description="让 AI 根据当前网页内容回答问题"
        row
      >
        <Switch.Root
          checked={generalSettings.webpageContext}
          onCheckedChange={(value) =>
            setSettings({
              ...settings,
              general: {
                ...generalSettings,
                webpageContext: value,
              },
            })
          }
          className="cdx-w-11 cdx-h-6 cdx-bg-neutral-200 dark:cdx-bg-neutral-700 cdx-rounded-full cdx-relative data-[state=checked]:cdx-bg-blue-500 cdx-outline-none cdx-cursor-pointer cdx-transition-colors cdx-duration-200"
        >
          <Switch.Thumb className="cdx-block cdx-w-5 cdx-h-5 cdx-bg-white cdx-rounded-full cdx-shadow-sm cdx-transition-transform cdx-duration-200 cdx-translate-x-0.5 cdx-will-change-transform data-[state=checked]:cdx-translate-x-[22px]" />
        </Switch.Root>
      </FieldWrapper>
    </div>
  )
}

export default GeneralSettings
