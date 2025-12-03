import * as Switch from '@radix-ui/react-switch'
import { useSettings } from '../../../hooks/useSettings'

const WebPageContentToggle = () => {
  const [settings, setSettings] = useSettings()
  return (
    <div className="cdx-flex cdx-items-center cdx-gap-2">
      <label 
        htmlFor="webpage-context" 
        className="cdx-text-[13px] cdx-text-neutral-500 dark:cdx-text-neutral-400 cdx-whitespace-nowrap cdx-cursor-pointer"
      >
        页面上下文
      </label>
      <Switch.Root
        id="webpage-context"
        checked={settings.general.webpageContext}
        onCheckedChange={(value) =>
          setSettings({
            ...settings,
            general: {
              ...settings.general,
              webpageContext: value,
            },
          })
        }
        className="cdx-w-9 cdx-h-5 cdx-bg-neutral-300 dark:cdx-bg-neutral-600 cdx-rounded-full cdx-relative data-[state=checked]:cdx-bg-blue-500 dark:data-[state=checked]:cdx-bg-blue-500 cdx-outline-none cdx-cursor-pointer cdx-transition-colors"
      >
        <Switch.Thumb className="cdx-block cdx-w-4 cdx-h-4 cdx-bg-white cdx-rounded-full cdx-shadow-sm cdx-transition-transform cdx-translate-x-0.5 cdx-will-change-transform data-[state=checked]:cdx-translate-x-[18px]" />
      </Switch.Root>
    </div>
  )
}

export default WebPageContentToggle
