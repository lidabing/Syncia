import type React from 'react'
import SectionHeading from '../Elements/SectionHeading'
import FieldWrapper from '../Elements/FieldWrapper'
import { useSettings } from '../../../hooks/useSettings'
import { ThemeOptions } from '../../../config/settings'
import * as Switch from '@radix-ui/react-switch'
import { HiOutlineMoon, HiOutlineSun, HiOutlineDesktopComputer, HiOutlineCog, HiOutlineGlobe } from 'react-icons/hi'
import { useLanguage, type Language } from '../../../hooks/useLanguage'
import { languages } from '../../../i18n'

const themeIcons = {
  [ThemeOptions.LIGHT]: HiOutlineSun,
  [ThemeOptions.DARK]: HiOutlineMoon,
  [ThemeOptions.SYSTEM]: HiOutlineDesktopComputer,
}

const GeneralSettings = () => {
  const [settings, setSettings] = useSettings()
  const { language, setLanguage, t } = useLanguage()
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

  const themeLabels: Record<ThemeOptions, string> = {
    [ThemeOptions.LIGHT]: t.settings.general.theme.light,
    [ThemeOptions.DARK]: t.settings.general.theme.dark,
    [ThemeOptions.SYSTEM]: t.settings.general.theme.system,
  }

  return (
    <div className="settings-card">
      <SectionHeading title={t.settings.general.title} icon={<HiOutlineCog />} />

      <FieldWrapper
        title={t.settings.general.language.title}
        description={t.settings.general.language.description}
      >
        <div className="cdx-flex cdx-gap-2">
          {(Object.keys(languages) as Language[]).map((lang) => {
            const isActive = language === lang
            return (
              <button
                key={lang}
                type="button"
                onClick={() => setLanguage(lang)}
                className={`cdx-flex cdx-items-center cdx-gap-2 cdx-px-4 cdx-py-2.5 cdx-rounded-xl cdx-text-sm cdx-font-medium cdx-transition-all cdx-duration-200 ${
                  isActive
                    ? 'cdx-bg-blue-500 cdx-text-white cdx-shadow-md cdx-shadow-blue-500/25'
                    : 'cdx-bg-neutral-100 dark:cdx-bg-neutral-700 cdx-text-neutral-600 dark:cdx-text-neutral-300 hover:cdx-bg-neutral-200 dark:hover:cdx-bg-neutral-600'
                }`}
              >
                <HiOutlineGlobe className="cdx-text-lg" />
                {languages[lang].nativeName}
              </button>
            )
          })}
        </div>
      </FieldWrapper>

      <FieldWrapper
        title={t.settings.general.theme.title}
        description={t.settings.general.theme.description}
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
                {themeLabels[theme]}
              </button>
            )
          })}
        </div>
      </FieldWrapper>
      
      <FieldWrapper
        title={t.settings.general.webpageContext.title}
        description={t.settings.general.webpageContext.description}
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
