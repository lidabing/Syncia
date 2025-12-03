import * as Switch from '@radix-ui/react-switch'
import { useSettings } from '../../../hooks/useSettings'

const WebPageContentToggle = () => {
  const [settings, setSettings] = useSettings()
  return (
    <div className="cdx-flex cdx-items-center cdx-gap-2 cdx-px-2 cdx-py-1">
      <label 
        htmlFor="webpage-context" 
        className="cdx-text-xs cdx-text-neutral-600 dark:cdx-text-neutral-400 cdx-whitespace-nowrap cdx-cursor-pointer"
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
        className="cdx-w-[32px] cdx-h-[18px] cdx-bg-neutral-400 dark:cdx-bg-neutral-600 cdx-rounded-full cdx-relative data-[state=checked]:cdx-bg-blue-500 dark:data-[state=checked]:cdx-bg-blue-600 cdx-outline-none cdx-cursor-pointer cdx-transition-colors cdx-duration-200"
      >
        <Switch.Thumb className="cdx-block cdx-w-[14px] cdx-h-[14px] cdx-bg-white cdx-rounded-full cdx-shadow-sm cdx-transition-transform cdx-duration-200 cdx-translate-x-0.5 cdx-will-change-transform data-[state=checked]:cdx-translate-x-[16px]" />
      </Switch.Root>
    </div>
  )
}

export default WebPageContentToggle
