import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, User, LogOut, Settings, HelpCircle } from 'lucide-react';
import { useAuth } from '../../../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const HeaderUserMenu: React.FC = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navigate = useNavigate();
  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-[10px] bg-transparent  hover:border-gray-300 transition-all group"
      >        
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-airbnb to-pink-500 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform overflow-hidden">
          {user?.avatar ? (
            <img src={user.avatar} alt={user?.name} className="w-full h-full object-cover" />
          ) : (
            <User size={14} />
          )}
        </div>
        <div className="text-left hidden md:block">
          <p className="text-sm font-semibold text-gray-900 leading-tight">
            {user?.name?.split(' ')[0] || 'Guest'}
          </p>
          <p className="text-[10px] font-medium text-gray-400 capitalize">{user?.role || 'Host'}</p>
        </div>
        <ChevronDown size={14} className={`text-gray-400 transition-transform mr-1 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden"
          >
            <div className="p-1">
              {/* User info */}
              <div className="px-3 py-3 border-b border-gray-100 mb-1">
                <p className="text-sm font-semibold text-gray-900">{user?.name || 'Guest User'}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left text-sm text-gray-700">
                <User size={16} /> Profile
              </button>
              <Link to="/dashboard/settings">
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left text-sm text-gray-700">
                  <Settings size={16} /> Settings
                </button>
              </Link>
              <button 
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left text-sm text-gray-700"
              onClick={()=> navigate("/dashboard/help")}
              >
                <HelpCircle size={16} /> Help Center
              </button>
              
              <div className="border-t border-gray-100 my-1" />
              
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors text-left text-sm text-red-600"
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HeaderUserMenu;