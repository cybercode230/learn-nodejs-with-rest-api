import React from 'react';
import { Home } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface SidebarLogoProps {
  isCollapsed: boolean;
}

const SidebarLogo: React.FC<SidebarLogoProps> = ({ isCollapsed }) => {
  return (
    <div className="p-5 mb-2 flex items-center border-b border-gray-100">
      {isCollapsed ? (
        <Link to="/dashboard" className="w-10 h-10 bg-airbnb rounded-xl flex items-center justify-center text-white mx-auto shadow-lg hover:scale-105 transition-transform">
          <Home size={20} strokeWidth={2.5} />
        </Link>
      ) : (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Link to="/dashboard" className="flex items-center gap-2 text-airbnb hover:opacity-90 transition-all group">
            <div className="bg-airbnb p-1.5 rounded-lg text-white group-hover:scale-110 transition-transform">
              <Home size={22} strokeWidth={2.5} />
            </div>
            <span className="text-2xl font-black tracking-tighter text-gray-900">airbnb</span>
          </Link>
          <span className="text-[10px] font-medium text-gray-400 ml-1">Dashboard</span>
        </motion.div>
      )}
    </div>
  );
};

export default SidebarLogo;