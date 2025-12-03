import * as Switch from '@radix-ui/react-switch'
import type React from 'react'
import TextareaAutosize from 'react-textarea-autosize'
import { useSettings } from '../../../hooks/useSettings'
import FieldWrapper from '../Elements/FieldWrapper'
import SectionHeading from '../Elements/SectionHeading'

const QuickMenuSettings = () => {
  const [settings, setSettings] = useSettings()

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
        title="快捷菜单" 
        icon="menu"
        description="选中文本后快速调用 AI"
      />

      <FieldWrapper
        title="启用快捷菜单"
        description="选中文本时显示悬浮菜单"
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
        title="排除网站"
        description="这些网站不显示快捷菜单（用逗号分隔，支持通配符）"
      >
        <TextareaAutosize
          className="input cdx-font-mono cdx-text-sm"
          placeholder="例如：google.com, youtube.com, *.example.com"
          minRows={2}
          value={quickMenuSettings.excludedSites.join(', ')}
          onChange={handleExcludeSitesChange}
        />
      </FieldWrapper>
    </div>
  )
}

export default QuickMenuSettings
