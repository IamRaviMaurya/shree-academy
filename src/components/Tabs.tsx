import React from 'react';
import { TabType } from '../types';
import { cn } from '../utils/cn';

interface TabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const Tabs: React.FC<TabsProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'add' as TabType, label: '📘 Add Record', icon: '📘' },
    { id: 'records' as TabType, label: '📋 Records', icon: '📋' },
    { id: 'inventory' as TabType, label: '📚 Manage Books', icon: '📚' },
    { id: 'excel' as TabType, label: '📊 Excel', icon: '📊' },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 flex px-2 sm:px-5 gap-1 sticky top-14 z-30 overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            'px-2 sm:px-4 py-3 text-xs sm:text-sm font-medium cursor-pointer border-b-2 border-transparent transition-colors duration-150 whitespace-nowrap flex-shrink-0',
            'text-gray-600 hover:text-gray-800',
            activeTab === tab.id && 'text-primary-600 border-primary-600'
          )}
        >
          <span className="sm:hidden">{tab.icon}</span>
          <span className="hidden sm:inline">{tab.label}</span>
          <span className="sm:hidden ml-1">{tab.label.split(' ')[1]}</span>
        </button>
      ))}
    </nav>
  );
};