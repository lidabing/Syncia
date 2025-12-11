import * as Switch from '@radix-ui/react-switch'
import type React from 'react'
import TextareaAutosize from 'react-textarea-autosize'
import { useSettings } from '../../../hooks/useSettings'
import { useLanguage } from '../../../hooks/useLanguage'
import FieldWrapper from '../Elements/FieldWrapper'
import SectionHeading from '../Elements/SectionHeading'
import { HiOutlineMenu } from 'react-icons/hi'

const QuickMenuSettings = () => {
  const [settings, setSettings] = useSettings()
  const { t } = useLanguage()

  const quickMenuSettings = settings.quickMenu

  const handleEnableQuickMenuChange = (enabled: boolean) => {
    setSettings({
      ...settings,
      quickMenu: {
        ...quickMenuSettings,
        enabled: enabled,
      },
    })
  }

  const handleExcludeSitesChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    const sites = event.target.value
      .split(',')
      .map((site) => site.trim())
      .filter(Boolean)
    setSettings({
      ...settings,
      quickMenu: {
        ...quickMenuSettings,
        excludedSites: sites,
      },
    })
  }

  return (
    <div className="settings-card">
      <SectionHeading 
        title={t.settings.quickMenu.title}
        icon={<HiOutlineMenu />}
        description={t.settings.quickMenu.description}
      />

      <FieldWrapper
        title={t.settings.quickMenu.enable.title}
        description={t.settings.quickMenu.enable.description}
        row={true}
      >
        <Switch.Root
          checked={quickMenuSettings.enabled}
          onCheckedChange={handleEnableQuickMenuChange}
          className="cdx-w-11 cdx-h-6 cdx-bg-neutral-200 dark:cdx-bg-neutral-700 cdx-rounded-full cdx-relative data-[state=checked]:cdx-bg-blue-500 cdx-outline-none cdx-cursor-pointer cdx-transition-colors cdx-duration-200"
        >
          <Switch.Thumb className="cdx-block cdx-w-5 cdx-h-5 cdx-bg-white cdx-rounded-full cdx-shadow-sm cdx-transition-transform cdx-duration-200 cdx-translate-x-0.5 cdx-will-change-transform data-[state=checked]:cdx-translate-x-[22px]" />
        </Switch.Root>
      </FieldWrapper>

      <FieldWrapper
        title={t.settings.quickMenu.excludedSites.title}
        description={t.settings.quickMenu.excludedSites.description}
      >
        <TextareaAutosize
          className="input cdx-font-mono cdx-text-sm"
          placeholder={t.settings.quickMenu.excludedSites.placeholder}
          minRows={2}
          value={quickMenuSettings.excludedSites.join(', ')}
          onChange={handleExcludeSitesChange}
        />
      </FieldWrapper>
    </div>
  )
}

export default QuickMenuSettings
