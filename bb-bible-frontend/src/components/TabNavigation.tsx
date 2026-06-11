'use client';

interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface TabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export default function TabNavigation({ tabs, activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-colors ${
            activeTab === tab.id
              ? 'bg-white text-amber-800 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          {tab.label}
          {tab.count && (
            <span className="ml-1 text-xs opacity-60">
              ({tab.count})
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
