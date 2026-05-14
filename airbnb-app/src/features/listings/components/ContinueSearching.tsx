import React from 'react';
import { useListings } from '../../../contexts/ListingContext';
import { Clock, ChevronRight, Trash2, Users, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const ContinueSearching: React.FC = () => {
  const { searchHistory, searchListings, clearSearchHistory } = useListings();
  const navigate = useNavigate();

  if (searchHistory.length === 0) return null;

  const handleReSearch = async (search: any) => {
    await searchListings(search);
    navigate('/search-results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getLocationDisplay = (search: any) => {
    if (search.location) return search.location;
    return 'Anywhere';
  };

  const getGuestDisplay = (search: any) => {
    const guests = search.guests || 1;
    return `${guests} guest${guests > 1 ? 's' : ''}`;
  };

  const getPriceDisplay = (search: any) => {
    const min = search.minPrice;
    const max = search.maxPrice;
    if (min && max) return `$${min} - $${max}`;
    if (min) return `From $${min}`;
    if (max) return `Up to $${max}`;
    return null;
  };

  return (
    <div className="py-8 border-t border-gray-100">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Continue searching</h2>
            <p className="text-xs text-gray-500 mt-0.5">Pick up where you left off</p>
          </div>
          <button 
            onClick={clearSearchHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-airbnb transition-colors rounded-lg hover:bg-gray-50"
          >
            <Trash2 size={12} />
            Clear all
          </button>
        </div>

        {/* Search History Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <AnimatePresence mode="popLayout">
            {searchHistory.map((search, index) => (
              <motion.div
                key={index}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05, duration: 0.2 }}
                className="group relative bg-white border border-gray-100 rounded-xl p-3 hover:shadow-md hover:border-gray-200 transition-all cursor-pointer"
                onClick={() => handleReSearch(search)}
              >
                <div className="flex items-center gap-3">
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-airbnb group-hover:text-white transition-all duration-200">
                    <Clock size={16} strokeWidth={2} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm text-gray-900 truncate">
                      {getLocationDisplay(search)}
                    </h3>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      <span className="text-[10px] font-medium text-gray-500 flex items-center gap-0.5">
                        <Users size={9} /> {getGuestDisplay(search)}
                      </span>
                      {search.type && (
                        <>
                          <span className="text-[9px] text-gray-300">•</span>
                          <span className="text-[10px] font-medium text-gray-500">
                            {search.type}
                          </span>
                        </>
                      )}
                      {getPriceDisplay(search) && (
                        <>
                          <span className="text-[9px] text-gray-300">•</span>
                          <span className="text-[10px] font-medium text-gray-500 flex items-center gap-0.5">
                            <DollarSign size={9} /> {getPriceDisplay(search)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-airbnb/10 group-hover:text-airbnb transition-all">
                    <ChevronRight size={14} strokeWidth={2.5} />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ContinueSearching;