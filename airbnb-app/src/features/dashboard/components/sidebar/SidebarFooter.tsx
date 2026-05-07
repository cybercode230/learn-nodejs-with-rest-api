import React from 'react';
import { LogOut, Settings } from 'lucide-react';
import { useAuth } from '../../../../contexts/AuthContext';
import SidebarNavItem from './SidebarNavItem';

interface SidebarFooterProps {
  isCollapsed: boolean;
}

const SidebarFooter: React.FC<SidebarFooterProps> = ({ isCollapsed }) => {
  const { logout } = useAuth();

  return (
    <div className="p-4 mt-auto border-t border-gray-100 space-y-1">
      {/* Settings Item */}
      <SidebarNavItem
        to="/dashboard/settings"
        icon={<Settings size={20} />}
        label="Settings"
        isCollapsed={isCollapsed}
      />

      {/* Logout Button */}
      <button
        onClick={logout}
        className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all group relative"
      >
        <LogOut size={20} className="shrink-0" />
        {!isCollapsed && (
          <span className="text-sm font-medium tracking-tight whitespace-nowrap">
            Logout
          </span>
        )}
        {isCollapsed && (
          <div className="absolute left-full ml-4 px-3 py-2 bg-gray-900 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap shadow-lg">
            Logout
            <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
          </div>
        )}
      </button>
    </div>
  );
};

export default SidebarFooter;