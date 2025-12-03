import React from 'react'
import Header from '../Layout/Header'
import GeneralSettings from './Sections/GeneralSettings'
import QuickMenuSettings from './Sections/QuickMenuSettings'
import ChatSettings from './Sections/ChatSettings'
import { SmartLensSettings } from './Sections/SmartLensSettings'
import useThemeSync from '../../hooks/useThemeSync'
import PromptSettings from './Sections/PromptSettings'

const Settings = () => {
  useThemeSync()
  return (
    <div className="cdx-min-h-screen cdx-bg-gradient-to-br cdx-from-neutral-50 cdx-via-neutral-100 cdx-to-blue-50 dark:cdx-from-neutral-950 dark:cdx-via-neutral-900 dark:cdx-to-neutral-950">
      <div className="cdx-container cdx-mx-auto cdx-px-6 cdx-py-12 cdx-max-w-6xl">
        <Header />
        
        <div className="cdx-grid cdx-grid-cols-1 lg:cdx-grid-cols-12 cdx-gap-8 cdx-mt-12">
          {/* 左侧设置区域 */}
          <div className="lg:cdx-col-span-5 cdx-space-y-6">
            <GeneralSettings />
            <ChatSettings />
            <SmartLensSettings />
            <QuickMenuSettings />
          </div>
          
          {/* 右侧提示词区域 */}
          <div className="lg:cdx-col-span-7">
            <div className="lg:cdx-sticky lg:cdx-top-8">
              <PromptSettings />
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <footer className="cdx-mt-16 cdx-text-center cdx-text-sm cdx-text-neutral-400">
          <p>Made with ❤️ by Syncia Team</p>
        </footer>
      </div>
    </div>
  )
}

export default Settings
