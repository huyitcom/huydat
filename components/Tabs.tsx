
import React from 'react';

interface TabsProps {
  activeTab: 'id' | 'profile' | 'history';
  setActiveTab: (tab: 'id' | 'profile' | 'history') => void;
}

export const Tabs: React.FC<TabsProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'id', name: 'ID Photo' },
    { id: 'profile', name: 'Profile Photo' },
    { id: 'history', name: 'History' },
  ];

  return (
    <div>
        <div className="border-b border-slate-700">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.id as 'id' | 'profile' | 'history')}
                className={`
                  ${tab.id === activeTab
                    ? 'border-cyan-500 text-cyan-400'
                    : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-500'}
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors focus:outline-none
                `}
                aria-current={tab.id === activeTab ? 'page' : undefined}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
    </div>
  );
};
