import React, { useState, useEffect, useRef } from 'react';
import { Globe, Menu, User, Home, Settings, HelpCircle, LogOut, Heart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { Button } from '../index';
import { useGeolocation } from '../../hooks/useGeolocation';

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
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const { location } = useGeolocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${scrolled ? 'bg-white shadow-md py-2' : 'bg-white border-b border-gray-100 py-4'}`}>
      <div className="container mx-auto px-4 md:px-8 lg:px-12 flex items-center justify-between gap-4">
        {/* Logo and Location */}
        <div className="flex flex-col items-start">
          <Link to="/" className="flex items-center gap-2 text-airbnb hover:opacity-90 transition-all group">
            <div className="bg-airbnb p-1.5 rounded-lg text-white group-hover:scale-110 transition-transform">
              <Home size={24} strokeWidth={2.5} />
            </div>
            <span className="text-2xl font-black tracking-tighter">airbnb</span>
          </Link>
          <div className="ml-0.5 mt-0.5">
            {location ? (
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                {location.city}, {location.country}
              </p>
            ) : (
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">
                Belong anywhere
              </p>
            )}
          </div>
        </div>

        {/* Removed Center Search Bar as requested - Search will now be handled via AI/Map triggers below */}
        <div className="hidden md:flex flex-grow max-w-sm"></div>

        {/* Right Menu */}
        <div className="flex items-center gap-2">
          <Link to={user ? '/dashboard' : '/register'}>
            <Button variant="ghost" size="sm" className="hidden md:flex rounded-full">
              {user ? 'Dashboard' : 'Become a Host'}
            </Button>
          </Link>
          
          <Button variant="ghost" size="icon" className="rounded-full hidden sm:flex">
            <Globe size={18} />
          </Button>

          {/* User Menu Dropdown */}
          <Dropdown
            trigger={
              <div className="flex items-center gap-3 border border-gray-200 rounded-full p-1.5 pl-3 hover:shadow-lg transition-all cursor-pointer bg-white ml-2">
                <Menu size={18} className="text-gray-600" />
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden border border-gray-100">
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
                      className="w-full flex items-center gap-3 px-5 py-3 text-sm hover:bg-red-50 text-red-600 transition-colors font-medium"
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
                    <DropdownLink to="/host" icon={<Home size={16} />} label="Become a Host" />
                    <DropdownLink to="/help" icon={<HelpCircle size={16} />} label="Help Center" />
                  </div>
                </>
              )}
            </div>
          </Dropdown>
        </div>
      </div>
    </header>
  );
};

const DropdownLink: React.FC<{ to: string; icon: React.ReactNode; label: string }> = ({ to, icon, label }) => (
  <Link to={to} className="flex items-center gap-3 px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
    <span className="text-gray-400">{icon}</span>
    <span className="font-medium">{label}</span>
  </Link>
);

export default Navbar;