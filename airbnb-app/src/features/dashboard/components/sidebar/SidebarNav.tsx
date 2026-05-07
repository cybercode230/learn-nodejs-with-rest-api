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
  HelpCircle
} from 'lucide-react';
import SidebarNavItem from './SidebarNavItem';

interface SidebarNavProps {
  isCollapsed: boolean;
  messageBadge?: number;
}

// Main navigation items
const NAV_ITEMS = [
  { to: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'Overview' },
];

// Core features group
const CORE_FEATURES = [
  { to: '/dashboard/bookings', icon: <Calendar size={18} />, label: 'Bookings' },
  { to: '/dashboard/listings', icon: <Home size={18} />, label: 'Listings' },
  { to: '/dashboard/messages', icon: <MessageSquare size={18} />, label: 'Messages' },
];

// Financial group
const FINANCIAL_ITEMS = [
  { to: '/dashboard/wallet', icon: <Wallet size={18} />, label: 'Wallet' },
  { to: '/dashboard/analytics', icon: <TrendingUp size={18} />, label: 'Analytics' },
];

// Property group
const PROPERTY_ITEMS = [
  { to: '/dashboard/map', icon: <MapIcon size={18} />, label: 'Property Map' },  
   { to: '/dashboard/help', icon: <HelpCircle size={18} />, label: 'Help Center' },
];

interface NavGroupProps {
  title: string;
  items: typeof CORE_FEATURES;
  isCollapsed: boolean;
  messageBadge?: number;
}

const NavGroup: React.FC<NavGroupProps> = ({ title, items, isCollapsed, messageBadge }) => {
  const [isExpanded, setIsExpanded] = useState(true);

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
  return (
    <nav className="flex-1 px-2 py-4 space-y-4 overflow-y-auto no-scrollbar">
      {/* Main items */}
      <div className="space-y-1">
        {NAV_ITEMS.map((item) => (
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
        items={CORE_FEATURES} 
        isCollapsed={isCollapsed}
        messageBadge={messageBadge}
      />

      {/* Financial Group */}
      <NavGroup 
        title="FINANCIAL" 
        items={FINANCIAL_ITEMS} 
        isCollapsed={isCollapsed}
      />

      {/* Property Group */}
      <NavGroup 
        title="PROPERTY" 
        items={PROPERTY_ITEMS} 
        isCollapsed={isCollapsed}
      />
    </nav>
  );
};

export default SidebarNav;