// src/components/layout/Navbar.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Search, Globe, Menu, User, Home, LogIn, UserPlus, Settings, HelpCircle, LogOut, Heart, ChevronDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// Dropdown component integrated directly
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
        <div className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50 animate-fadeIn`}>
          {children}
        </div>
      )}
    </div>
  );
};

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const countries = [
    { code: 'US', name: 'United States', currency: 'USD', symbol: '$', language: 'English' },
    { code: 'RW', name: 'Rwanda', currency: 'RWF', symbol: 'FRw', language: 'Kinyarwanda' },
    { code: 'KE', name: 'Kenya', currency: 'KES', symbol: 'KSh', language: 'Swahili' },
    { code: 'UG', name: 'Uganda', currency: 'UGX', symbol: 'USh', language: 'English' },
    { code: 'TZ', name: 'Tanzania', currency: 'TZS', symbol: 'TSh', language: 'Swahili' },
    { code: 'GB', name: 'United Kingdom', currency: 'GBP', symbol: '£', language: 'English' },
    { code: 'FR', name: 'France', currency: 'EUR', symbol: '€', language: 'French' },
  ];

  const languages = [
    { code: 'EN', name: 'English' },
    { code: 'FR', name: 'Français' },
    { code: 'SW', name: 'Kiswahili' },
    { code: 'RW', name: 'Kinyarwanda' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 py-4">
      <div className="container mx-auto px-4 md:px-8 lg:px-12 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-airbnb hover:opacity-90 transition-opacity flex-shrink-0">
          <Home size={32} strokeWidth={2.5} />
          <span className="text-xl font-bold tracking-tight hidden sm:block">airbnb</span>
        </Link>

        {/* Search Bar - Centered */}
        <div className="hidden md:flex items-center border border-gray-200 rounded-full py-2 px-4 shadow-sm hover:shadow-md transition-all cursor-pointer bg-white flex-grow max-w-md">
          <button className="px-4 font-semibold text-sm border-r border-gray-200 hover:text-gray-700">Anywhere</button>
          <button className="px-4 font-semibold text-sm border-r border-gray-200 hover:text-gray-700">Any week</button>
          <button className="px-4 text-gray-500 text-sm flex-grow text-left">Add guests</button>
          <div className="bg-airbnb p-2 rounded-full text-white ml-2 hover:bg-airbnb-dark transition-colors">
            <Search size={16} strokeWidth={3} />
          </div>
        </div>

        {/* Right Menu */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Become a Host Link */}
          <Link 
            to={user ? '/host' : '/register'}
            className="hidden md:block text-sm font-semibold px-4 py-3 hover:bg-gray-100 rounded-full transition-colors whitespace-nowrap"
          >
            {user ? 'Host Dashboard' : 'Become a Host'}
          </Link>
          
          {/* Globe Dropdown - Language & Currency */}
          <Dropdown
            trigger={
              <button className="p-3 hover:bg-gray-100 rounded-full transition-colors">
                <Globe size={18} />
              </button>
            }
            align="right"
          >
            <div className="py-2 max-h-96 overflow-y-auto">
              <div className="px-4 py-3 text-sm font-semibold border-b bg-gray-50">
                <span>Language & Region</span>
              </div>
              {languages.map(lang => (
                <button
                  key={lang.code}
                  className="w-full px-4 py-2.5 text-sm text-left hover:bg-gray-50 flex items-center justify-between"
                  onClick={() => console.log(`Selected language: ${lang.name}`)}
                >
                  <span>{lang.name}</span>
                  <span className="text-gray-400 text-xs">{lang.code}</span>
                </button>
              ))}
              
              <div className="border-t my-2"></div>
              
              <div className="px-4 py-3 text-sm font-semibold border-b bg-gray-50">
                <span>Currency</span>
              </div>
              {countries.map(country => (
                <button
                  key={country.code}
                  className="w-full px-4 py-2.5 text-sm text-left hover:bg-gray-50 flex justify-between items-center"
                  onClick={() => console.log(`Selected currency: ${country.currency}`)}
                >
                  <div className="flex flex-col">
                    <span>{country.name}</span>
                    <span className="text-xs text-gray-500">{country.currency}</span>
                  </div>
                  <span className="text-gray-600 font-semibold">{country.symbol}</span>
                </button>
              ))}
            </div>
          </Dropdown>

          {/* User Menu Dropdown */}
          <Dropdown
            trigger={
              <div className="flex items-center gap-2 border border-gray-200 rounded-full p-2 pl-3 hover:shadow-md transition-shadow cursor-pointer bg-white">
                <Menu size={18} />
                <div className="bg-gradient-to-r from-airbnb to-airbnb-dark text-white rounded-full p-1">
                  <User size={18} fill="currentColor" />
                </div>
              </div>
            }
            align="right"
          >
            <div className="py-2">
              {user ? (
                // Logged In Menu
                <>
                  <div className="px-4 py-3 border-b bg-gray-50">
                    <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
                  </div>
                  
                  <Link to="/trips" className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors">
                    <div className="w-5">
                      <Settings size={16} />
                    </div>
                    <span>Trips</span>
                  </Link>
                  
                  <Link to="/wishlists" className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors">
                    <div className="w-5">
                      <Heart size={16} />
                    </div>
                    <span>Wishlists</span>
                  </Link>
                  
                  <Link to="/host" className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors">
                    <div className="w-5">
                      <Home size={16} />
                    </div>
                    <span>Host Dashboard</span>
                  </Link>
                  
                  <div className="border-t my-1"></div>
                  
                  <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors">
                    <div className="w-5">
                      <Settings size={16} />
                    </div>
                    <span>Account Settings</span>
                  </Link>
                  
                  <Link to="/help" className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors">
                    <div className="w-5">
                      <HelpCircle size={16} />
                    </div>
                    <span>Help Center</span>
                  </Link>
                  
                  <div className="border-t my-1"></div>
                  
                  <button 
                    onClick={handleLogout} 
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 text-red-600 transition-colors"
                  >
                    <div className="w-5">
                      <LogOut size={16} />
                    </div>
                    <span>Log out</span>
                  </button>
                </>
              ) : (
                // Logged Out Menu
                <>
                  <Link to="/login" className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors">
                    <div className="w-5">
                      <LogIn size={16} />
                    </div>
                    <span>Log in</span>
                  </Link>
                  
                  <Link to="/register" className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors">
                    <div className="w-5">
                      <UserPlus size={16} />
                    </div>
                    <span>Sign up</span>
                  </Link>
                  
                  <div className="border-t my-1"></div>
                  
                  <Link to="/host" className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors">
                    <div className="w-5">
                      <Home size={16} />
                    </div>
                    <span>Become a Host</span>
                  </Link>
                  
                  <Link to="/help" className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors">
                    <div className="w-5">
                      <HelpCircle size={16} />
                    </div>
                    <span>Help Center</span>
                  </Link>
                </>
              )}
            </div>
          </Dropdown>
        </div>
      </div>

      {/* Mobile Search Bar - Visible only on mobile */}
      <div className="md:hidden mt-3 px-4">
        <div className="flex items-center border border-gray-200 rounded-full py-2 px-4 shadow-sm bg-white">
          <Search size={18} className="text-gray-400" />
          <input 
            type="text" 
            placeholder="Search destinations..." 
            className="flex-grow ml-2 outline-none text-sm"
          />
        </div>
      </div>
    </header>
  );
};

// Add this CSS to your global styles or tailwind.config.js
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .animate-fadeIn {
    animation: fadeIn 0.2s ease-out;
  }
`;
document.head.appendChild(style);

export default Navbar;