import React, { useState } from 'react';

interface Tab {
  id: string;
  label: string;
  component: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
}

const Tabs: React.FC<TabsProps> = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState(tabs[0].id);

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
  };

  const activeComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div>
      <div className="cdx-border-b cdx-border-neutral-200 dark:cdx-border-neutral-700">
        <nav className="cdx--mb-px cdx-flex cdx-space-x-8" aria-label="Tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`${
                activeTab === tab.id
                  ? 'cdx-border-blue-500 cdx-text-blue-600'
                  : 'cdx-border-transparent cdx-text-neutral-500 hover:cdx-text-neutral-700 hover:cdx-border-neutral-300 dark:cdx-text-neutral-400 dark:hover:cdx-text-neutral-300'
              } cdx-whitespace-nowrap cdx-py-4 cdx-px-1 cdx-border-b-2 cdx-font-medium cdx-text-sm`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="cdx-py-8">
        {activeComponent}
      </div>
    </div>
  );
};

export default Tabs;
