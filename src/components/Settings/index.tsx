import React from 'react';
import Header from '../Layout/Header';
import GeneralSettings from './Sections/GeneralSettings';
import QuickMenuSettings from './Sections/QuickMenuSettings';
import ChatSettings from './Sections/ChatSettings';
import { SmartLensSettings } from './Sections/SmartLensSettings';
import useThemeSync from '../../hooks/useThemeSync';
import PromptSettings from './Sections/PromptSettings';
import Tabs from './Tabs';

const Settings = () => {
  useThemeSync();

  const tabs = [
    { id: 'general', label: 'General', component: <GeneralSettings /> },
    { id: 'chat', label: 'Chat', component: <ChatSettings /> },
    { id: 'smart-lens', label: 'Smart Lens', component: <SmartLensSettings /> },
    { id: 'quick-menu', label: 'Quick Menu', component: <QuickMenuSettings /> },
    { id: 'prompts', label: 'Prompts', component: <PromptSettings /> },
  ];

  return (
    <div className="cdx-min-h-screen cdx-bg-gradient-to-br cdx-from-neutral-50 cdx-via-neutral-100 cdx-to-blue-50 dark:cdx-from-neutral-950 dark:cdx-via-neutral-900 dark:cdx-to-neutral-950">
      <div className="cdx-container cdx-mx-auto cdx-px-6 cdx-py-12 cdx-max-w-4xl">
        <Header />
        <div className="cdx-mt-12">
          <h1 className="cdx-text-3xl cdx-font-bold cdx-text-neutral-800 dark:cdx-text-neutral-200">Settings</h1>
          <p className="cdx-mt-2 cdx-text-neutral-500 dark:cdx-text-neutral-400">
            Customize your Syncia experience.
          </p>
        </div>
        
        <div className="cdx-mt-8">
          <Tabs tabs={tabs} />
        </div>
        
        {/* Footer */}
        <footer className="cdx-mt-16 cdx-text-center cdx-text-sm cdx-text-neutral-400">
          <p>Made with ❤️ by Syncia Team</p>
        </footer>
      </div>
    </div>
  );
};

export default Settings;
