import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Search, LayoutDashboard, Calendar, Home, MessageSquare, Wallet, MapIcon, TrendingUp, Settings, HelpCircle, ArrowRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {  useNavigate } from 'react-router-dom';

interface SearchResult {
  id: string;
  type: 'page' | 'listing' | 'booking' | 'guest';
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  link: string;
  category: string;
}

const HeaderSearch: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Static navigation items for quick search
  const navItems: SearchResult[] = [
    { id: 'overview', type: 'page', title: 'Dashboard Overview', icon: <LayoutDashboard size={16} />, link: '/dashboard', category: 'Pages' },
    { id: 'bookings', type: 'page', title: 'Bookings', subtitle: 'Manage reservations', icon: <Calendar size={16} />, link: '/dashboard/bookings', category: 'Pages' },
    { id: 'listings', type: 'page', title: 'Listings', subtitle: 'Your properties', icon: <Home size={16} />, link: '/dashboard/listings', category: 'Pages' },
    { id: 'messages', type: 'page', title: 'Messages', subtitle: 'Guest conversations', icon: <MessageSquare size={16} />, link: '/dashboard/messages', category: 'Pages' },
    { id: 'wallet', type: 'page', title: 'Wallet', subtitle: 'Earnings & payouts', icon: <Wallet size={16} />, link: '/dashboard/wallet', category: 'Pages' },
    { id: 'map', type: 'page', title: 'Property Map', subtitle: 'Visualize properties', icon: <MapIcon size={16} />, link: '/dashboard/map', category: 'Pages' },
    { id: 'analytics', type: 'page', title: 'Analytics', subtitle: 'Performance insights', icon: <TrendingUp size={16} />, link: '/dashboard/analytics', category: 'Pages' },
    { id: 'settings', type: 'page', title: 'Settings', subtitle: 'Account preferences', icon: <Settings size={16} />, link: '/dashboard/settings', category: 'System' },
    { id: 'help', type: 'page', title: 'Help Center', subtitle: 'Guides & support', icon: <HelpCircle size={16} />, link: '/dashboard/help', category: 'System' },
  ];

  // Mock async search function
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults(navItems);
      return;
    }

    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Filter results based on query
    const filtered = navItems.filter(item => 
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(query.toLowerCase()))
    );
    
    // Mock listings search (in real app, this would be an API call)
    const mockListings = [
      { id: 'l1', title: 'Downtown Luxury Loft', location: 'New York, NY', price: 280 },
      { id: 'l2', title: 'Cozy Beach Cottage', location: 'Malibu, CA', price: 210 },
      { id: 'l3', title: 'Modern City Apartment', location: 'Chicago, IL', price: 180 },
    ].filter(l => l.title.toLowerCase().includes(query.toLowerCase()));
    
    const listingResults: SearchResult[] = mockListings.map(listing => ({
      id: listing.id,
      type: 'listing',
      title: listing.title,
      subtitle: `${listing.location} • $${listing.price}/night`,
      icon: <Home size={16} />,
      link: `/listings/${listing.id}`,
      category: 'Listings',
    }));
    
    setResults([...filtered, ...listingResults]);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (searchQuery) {
        performSearch(searchQuery);
      } else {
        setResults(navItems);
      }
    }, 200);
    
    return () => clearTimeout(debounce);
  }, [searchQuery, performSearch]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
          inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, -1));
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && results[selectedIndex]) {
            navigate(results[selectedIndex].link);
            setIsOpen(false);
            setSearchQuery('');
          }
          break;
        case 'Escape':
          setIsOpen(false);
          break;
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, navigate]);

  // Group results by category
  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.category]) acc[result.category] = [];
    acc[result.category].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  const handleSelect = (result: SearchResult) => {
    navigate(result.link);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="relative flex-1 max-w-xl">
      <div className="relative">
        <Search
          className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${isOpen ? 'text-airbnb' : 'text-gray-400'}`}
          size={16}
        />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search pages, listings, bookings..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 pl-9 pr-4 text-sm outline-none focus:border-airbnb focus:ring-1 focus:ring-airbnb transition-all placeholder:text-gray-400"
        />
        {isLoading && (
          <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />
        )}
      </div>

      <AnimatePresence>
        {isOpen && (searchQuery || results.length > 0) && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 z-50 max-h-96 overflow-y-auto"
          >
            {results.length > 0 ? (
              <div className="py-2">
                {Object.entries(groupedResults).map(([category, items]) => (
                  <div key={category}>
                    <div className="px-3 py-2">
                      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{category}</span>
                    </div>
                    {items.map((result, idx) => {
                      const globalIndex = results.findIndex(r => r.id === result.id);
                      return (
                        <button
                          key={`${result.id}-${idx}`}
                          onClick={() => handleSelect(result)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                            selectedIndex === globalIndex ? 'bg-gray-50' : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                            {result.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">{result.title}</p>
                            {result.subtitle && (
                              <p className="text-xs text-gray-500 truncate">{result.subtitle}</p>
                            )}
                          </div>
                          <ArrowRight size={14} className="text-gray-400" />
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <Search size={32} className="mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">No results found for "{searchQuery}"</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HeaderSearch;