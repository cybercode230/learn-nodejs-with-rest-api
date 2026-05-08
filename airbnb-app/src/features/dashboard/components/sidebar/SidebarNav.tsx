import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Calendar,
  Home,
  MessageSquare,
  Wallet,
  Map as MapIcon,
  ChevronDown,
  TrendingUp,
  HelpCircle,
  Users,
} from 'lucide-react';
import SidebarNavItem from './SidebarNavItem';
import { useAuth } from '../../../../contexts/AuthContext';
import type { Role } from '../../../../shared/types';

interface SidebarNavProps {
  isCollapsed: boolean;
  messageBadge?: number;
}

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
  roles: Role[];
}

// Main navigation items
const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'Overview', roles: ['ADMIN', 'HOST', 'GUEST'] },
  { to: '/dashboard/users', icon: <Users size={18} />, label: 'User Management', roles: ['ADMIN'] },
];

// Core features group
const CORE_FEATURES: NavItem[] = [
  { to: '/dashboard/bookings', icon: <Calendar size={18} />, label: 'Bookings', roles: ['ADMIN', 'HOST', 'GUEST'] },
  { to: '/dashboard/listings', icon: <Home size={18} />, label: 'Listings', roles: ['ADMIN', 'HOST'] },
  { to: '/dashboard/messages', icon: <MessageSquare size={18} />, label: 'Messages', roles: ['ADMIN', 'HOST', 'GUEST'] },
];

// Financial group
const FINANCIAL_ITEMS: NavItem[] = [
  { to: '/dashboard/wallet', icon: <Wallet size={18} />, label: 'Wallet', roles: ['ADMIN', 'HOST'] },
  { to: '/dashboard/analytics', icon: <TrendingUp size={18} />, label: 'Analytics', roles: ['ADMIN', 'HOST'] },
];

// Property group
const PROPERTY_ITEMS: NavItem[] = [
  { to: '/dashboard/map', icon: <MapIcon size={18} />, label: 'Property Map', roles: ['ADMIN', 'HOST', 'GUEST'] },  
  { to: '/dashboard/help', icon: <HelpCircle size={18} />, label: 'Help Center', roles: ['ADMIN', 'HOST', 'GUEST'] },
];

interface NavGroupProps {
  title: string;
  items: NavItem[];
  isCollapsed: boolean;
  messageBadge?: number;
}

const NavGroup: React.FC<NavGroupProps> = ({ title, items, isCollapsed, messageBadge }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (items.length === 0) return null;

  if (isCollapsed) {
    return (
      <div className="space-y-1">
        {items.map((item) => (
          <SidebarNavItem
            key={item.to}
            {...item}
            isCollapsed={isCollapsed}
            badge={item.label === 'Messages' ? messageBadge : undefined}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors group"
      >
        <span className="uppercase tracking-wider">{title}</span>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChevronDown size={12} />
        </motion.div>
      </button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-1 overflow-hidden"
          >
            {items.map((item) => (
              <SidebarNavItem
                key={item.to}
                {...item}
                isCollapsed={isCollapsed}
                badge={item.label === 'Messages' ? messageBadge : undefined}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SidebarNav: React.FC<SidebarNavProps> = ({ isCollapsed, messageBadge }) => {
  const { user } = useAuth();
  const userRole = user?.role || 'GUEST';

  const filterByRole = (items: NavItem[]) => 
    items.filter(item => item.roles.includes(userRole));

  const filteredNavItems = filterByRole(NAV_ITEMS);
  const filteredCoreFeatures = filterByRole(CORE_FEATURES);
  const filteredFinancialItems = filterByRole(FINANCIAL_ITEMS);
  const filteredPropertyItems = filterByRole(PROPERTY_ITEMS);

  return (
    <nav className="flex-1 px-2 py-4 space-y-4 overflow-y-auto no-scrollbar">
      {/* Main items */}
      <div className="space-y-1">
        {filteredNavItems.map((item) => (
          <SidebarNavItem
            key={item.to}
            {...item}
            isCollapsed={isCollapsed}
          />
        ))}
      </div>

      {/* Core Features Group */}
      <NavGroup 
        title="CORE" 
        items={filteredCoreFeatures} 
        isCollapsed={isCollapsed}
        messageBadge={messageBadge}
      />

      {/* Financial Group */}
      <NavGroup 
        title="FINANCIAL" 
        items={filteredFinancialItems} 
        isCollapsed={isCollapsed}
      />

      {/* Property Group */}
      <NavGroup 
        title="PROPERTY" 
        items={filteredPropertyItems} 
        isCollapsed={isCollapsed}
      />
    </nav>
  );
};

export default SidebarNav;