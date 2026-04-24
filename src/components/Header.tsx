import React from 'react';
import { Button } from './Button';

interface HeaderProps {
  onClearAll: () => void;
  onLogout: () => void;
  teacherName?: string;
}

export const Header: React.FC<HeaderProps> = ({ onClearAll, onLogout, teacherName }) => {
  const handleClearAll = () => {
    if (window.confirm('Poora data delete karna chahte hain? Yeh undo nahi hoga!')) {
      onClearAll();
    }
  };

  const handleLogout = () => {
    if (window.confirm('Logout karna chahte hain?')) {
      onLogout();
    }
  };

  return (
    <header className="bg-primary-600 text-white px-4 sm:px-6 flex items-center gap-2 sm:gap-4 h-14 sticky top-0 z-40 shadow-lg">
      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs sm:text-sm flex-shrink-0">
        SA
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm sm:text-base font-semibold tracking-tight truncate">Shree Academy</div>
        <div className="text-xs opacity-75 -mt-0.5 hidden sm:block">Book Issue Management System</div>
        {teacherName && (
          <div className="text-xs opacity-90 mt-0.5 truncate">Welcome, {teacherName}</div>
        )}
      </div>
      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        <Button
          variant="danger"
          size="sm"
          onClick={handleClearAll}
          className="text-xs px-2 sm:px-3"
        >
          <span className="hidden sm:inline">🗑 Clear All</span>
          <span className="sm:hidden">🗑</span>
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={handleLogout}
          className="text-xs px-2 sm:px-3"
        >
          <span className="hidden sm:inline">🚪 Logout</span>
          <span className="sm:hidden">🚪</span>
        </Button>
      </div>
    </header>
  );
};