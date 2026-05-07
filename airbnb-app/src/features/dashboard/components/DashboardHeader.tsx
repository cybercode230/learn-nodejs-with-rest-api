import React from 'react';
import { Menu } from 'lucide-react';
import HeaderSearch from './header/HeaderSearch';
import HeaderChat from './header/HeaderChat';
import HeaderNotifications from './header/HeaderNotifications';
import HeaderUserMenu from './header/HeaderUserMenu';

interface DashboardHeaderProps {
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onToggleSidebar }) => {
  return (
    <header
      className="h-16 flex items-center gap-4 px-5 md:px-7 shrink-0 sticky top-0 z-40 bg-transparent backdrop-blur-md border-b border-gray-100"
    >
      {/* Sidebar Toggle Button */}
      <button
        onClick={onToggleSidebar}
        className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
        aria-label="Toggle sidebar"
      >
        <Menu size={20} />
      </button>

      {/* Search — grows to fill available space */}
      <div className="flex-1 min-w-0">
        <HeaderSearch />
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1 shrink-0">
        <HeaderChat />
        <HeaderNotifications />
        <div className="w-px h-5 bg-gray-200 mx-2" />
        <HeaderUserMenu />
      </div>
    </header>
  );
};

export default DashboardHeader;