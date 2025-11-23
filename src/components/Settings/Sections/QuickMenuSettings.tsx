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
    <div className="cdx-w-full cdx-flex-shrink-0 cdx-rounded-md">
      <SectionHeading title="快捷菜单" />

      {/* =========================
        Enable Visible Quick Menu
      ===========================*/}
      <FieldWrapper
        title="启用快捷菜单"
        description="这将启用在任何网页上选中文本后出现的快捷菜单。如果你觉得它有干扰，我建议禁用它，你仍然可以通过右键点击并从上下文菜单中选择提示词来在选中的文本上使用你的提示词。"
        row={true}
      >
        <Switch.Root
          checked={quickMenuSettings.enabled}
          onCheckedChange={handleEnableQuickMenuChange}
          className="cdx-w-[42px] cdx-h-[25px] cdx-bg-neutral-500 cdx-rounded-full cdx-relative data-[state=checked]:cdx-bg-blue-500 cdx-outline-none cdx-cursor-default"
        >
          <Switch.Thumb className="cdx-block cdx-w-[21px] cdx-h-[21px] cdx-bg-white cdx-rounded-full cdx-transition-transform cdx-duration-100 cdx-translate-x-0.5 cdx-will-change-transform data-[state=checked]:cdx-translate-x-[19px]" />
        </Switch.Root>
      </FieldWrapper>

      {/* =========================
              Exclude Sites
      ===========================*/}
      <FieldWrapper
        title="排除网站"
        description="你可以在此添加要从快捷菜单中排除的网站。（用逗号分隔）支持通配符。"
      >
        <TextareaAutosize
          className="input"
          placeholder="例如：google.com, youtube.com, twitter.com"
          minRows={2}
          value={quickMenuSettings.excludedSites.join(', ')}
          onChange={handleExcludeSitesChange}
        />
      </FieldWrapper>
    </div>
  )
}

export default QuickMenuSettings
