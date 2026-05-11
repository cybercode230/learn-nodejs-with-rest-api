import React, { useState, useEffect, useRef } from 'react';
import { Globe, Menu, User, Home, Settings, HelpCircle, LogOut, Heart } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useSearchState } from '../../../contexts/SearchContext';
import { Button } from '../index';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { SearchContainer } from '../../../features/search';

const Dropdown: React.FC<{ trigger: React.ReactNode; children: React.ReactNode; align?: 'left' | 'right' }> = ({ 
  trigger, 
  children, 
  align = 'left' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>
      {isOpen && (
        <div className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-fade-in`}>
          {children}
        </div>
      )}
    </div>
  );
};

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { mode, setMode, isExpanded: isSearchExpanded, setIsExpanded: setIsSearchExpanded } = useSearchState();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Transition point for the compact search bar
      setScrolled(window.scrollY > 80);
      if (window.scrollY > 80) setIsSearchExpanded(false);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isHomePage = location.pathname === '/';
  const logoOnClick = isHomePage ? undefined : () => navigate('/');

  return (
    <>
      <header className={`sticky top-0 z-50 w-full transition-all duration-500 ${scrolled ? 'bg-white shadow-sm py-3' : 'bg-white border-b border-gray-100 py-5'} ${isSearchExpanded ? 'bg-white' : ''}`}>
        <div className="container mx-auto px-4 md:px-8 lg:px-12 flex items-center justify-between gap-4">
          {/* Logo Section */}
          <div className="flex flex-col items-start min-w-[140px]">
            <Link to="/" onClick={() => setIsSearchExpanded(false)} className="flex items-center gap-2 text-airbnb hover:opacity-90 transition-all group">
              <div className="bg-airbnb p-1.5 rounded-lg text-white group-hover:scale-110 transition-transform" onClick={logoOnClick}>
                <Home size={22} strokeWidth={2.5} />
              </div>
              <span className={`text-2xl font-black tracking-tighter transition-all ${scrolled ? 'scale-90 origin-left' : ''}`}>airbnb</span>
            </Link>
          </div>

            {/* Center Section: Dynamic Search Switcher (Moves here on scroll) */}
          <div className="flex-grow flex justify-center px-4">
            <AnimatePresence mode="wait">
              {scrolled && !isSearchExpanded && (
                <motion.div
                  key="scrolled-switcher"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="hidden md:flex gap-8 text-sm font-bold text-gray-500"
                >
                  <button 
                    onClick={() => { setMode('AI'); setIsSearchExpanded(true); }}
                    className={`hover:text-black transition-colors relative pb-2 group ${mode === 'AI' ? 'text-black' : ''}`}
                  >
                    AI Search
                    <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-black transition-transform origin-center ${mode === 'AI' ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
                  </button>
                  <button 
                    onClick={() => { setMode('NORMAL'); setIsSearchExpanded(true); }}
                    className={`hover:text-black transition-colors relative pb-2 group ${mode === 'NORMAL' ? 'text-black' : ''}`}
                  >
                    Find Stays
                    <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-black transition-transform origin-center ${mode === 'NORMAL' ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
                  </button>
                  <button 
                    onClick={() => { setMode('MAP'); setIsSearchExpanded(true); }}
                    className={`hover:text-black transition-colors relative pb-2 group ${mode === 'MAP' ? 'text-black' : ''}`}
                  >
                    Map Explorer
                    <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-black transition-transform origin-center ${mode === 'MAP' ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Menu Section */}
          <div className="flex items-center gap-2 min-w-[140px] justify-end">
            <Link to={user ? '/dashboard' : '/register'} className="hidden md:block">
              <Button variant="ghost" size="sm" className="rounded-full font-bold">
                {user ? 'Dashboard' : 'Airbnb your home'}
              </Button>
            </Link>
            
            <Button variant="ghost" size="icon" className="rounded-full hidden sm:flex">
              <Globe size={18} />
            </Button>

            {/* User Menu Dropdown */}
            <Dropdown
              trigger={
                <div className="flex items-center gap-3 border border-gray-200 rounded-full p-1.5 pl-3 hover:shadow-lg transition-all cursor-pointer bg-white">
                  <Menu size={18} className="text-gray-600" />
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden border border-gray-100 shadow-inner">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <User size={18} className="text-gray-400" />
                    )}
                  </div>
                </div>
              }
              align="right"
            >
              <div className="py-2">
                {user ? (
                  <>
                    <div className="px-5 py-4 border-b border-gray-50 bg-gray-50/50">
                      <p className="text-sm font-bold text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
                    </div>
                    <div className="py-2">
                      <DropdownLink to="/dashboard" icon={<Home size={16} />} label="Dashboard" />
                      <DropdownLink to="/trips" icon={<Settings size={16} />} label="Trips" />
                      <DropdownLink to="/wishlists" icon={<Heart size={16} />} label="Wishlists" />
                    </div>
                    <div className="border-t border-gray-100 py-2">
                      <DropdownLink to="/profile" icon={<Settings size={16} />} label="Account Settings" />
                      <DropdownLink to="/help" icon={<HelpCircle size={16} />} label="Help Center" />
                    </div>
                    <div className="border-t border-gray-100 pt-2">
                      <button 
                        onClick={handleLogout} 
                        className="w-full flex items-center gap-3 px-5 py-3 text-sm hover:bg-red-50 text-red-600 transition-colors font-bold"
                      >
                        <LogOut size={16} />
                        <span>Log out</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="py-2">
                      <Link to="/login" className="block px-5 py-3 text-sm font-bold hover:bg-gray-50">Log in</Link>
                      <Link to="/register" className="block px-5 py-3 text-sm hover:bg-gray-50">Sign up</Link>
                    </div>
                    <div className="border-t border-gray-100 py-2">
                      <DropdownLink to="/host" icon={<Home size={16} />} label="Airbnb your home" />
                      <DropdownLink to="/help" icon={<HelpCircle size={16} />} label="Help Center" />
                    </div>
                  </>
                )}
              </div>
            </Dropdown>
          </div>
        </div>

        {/* Expanded Search Dropdown */}
        <AnimatePresence>
          {isSearchExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
              className="absolute top-0 left-0 right-0 bg-white shadow-xl z-[-1] overflow-hidden border-b border-gray-100"
            >
              <div className="pt-24 pb-12 px-4 md:px-8 lg:px-12">
                <div className="max-w-4xl mx-auto relative">
                  <button 
                    onClick={() => setIsSearchExpanded(false)}
                    className="absolute -top-12 right-0 p-2 text-gray-400 hover:text-black transition-colors"
                  >
                    <X size={24} />
                  </button>
                  <SearchContainer onClose={() => setIsSearchExpanded(false)} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Dark Overlay when search is expanded */}
      <AnimatePresence>
        {isSearchExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSearchExpanded(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>
    </>
  );
};

const DropdownLink: React.FC<{ to: string; icon: React.ReactNode; label: string }> = ({ to, icon, label }) => (
  <Link to={to} className="flex items-center gap-3 px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
    <span className="text-gray-400">{icon}</span>
    <span className="font-medium">{label}</span>
  </Link>
);

export default Navbar;