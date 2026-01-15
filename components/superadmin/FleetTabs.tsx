
import React from 'react';
import { LucideIcon } from 'lucide-react';

export type AdminTab = 'INSTANCES' | 'INFRASTRUCTURE' | 'SETTINGS' | 'LOGS';

interface TabConfig {
  id: AdminTab;
  label: string;
  icon: LucideIcon;
}

interface FleetTabsProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  tabs: TabConfig[];
}

export const FleetTabs: React.FC<FleetTabsProps> = ({ activeTab, setActiveTab, tabs }) => {
  return (
    <div className="bg-white dark:bg-slate-900 p-1 rounded-2xl border dark:border-white/5 shadow-sm flex flex-wrap gap-1 sticky top-0 z-30 backdrop-blur-md bg-white/80 dark:bg-slate-900/80">
      {tabs.map(tab => (
        <button 
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${
            activeTab === tab.id 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
              : 'text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'
          }`}
        >
          <tab.icon size={14} className={activeTab === tab.id ? 'animate-pulse' : ''} />
          {tab.label}
        </button>
      ))}
    </div>
  );
};
