import React from 'react';
import { useListings } from '../../../contexts/ListingContext';
import { Clock, ChevronRight, Trash2 } from 'lucide-react';
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

  return (
    <div className="py-12 border-t border-gray-50">
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tighter">Continue searching</h2>
            <p className="text-gray-500 text-sm font-medium mt-1">Pick up where you left off</p>
          </div>
          <button 
            onClick={clearSearchHistory}
            className="flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-airbnb transition-colors hover:bg-airbnb/5 rounded-full"
          >
            <Trash2 size={14} />
            Clear all
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {searchHistory.map((search, index) => (
              <motion.div
                key={index}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                className="group relative bg-white border border-gray-100 rounded-[2rem] p-5 shadow-sm hover:shadow-xl hover:border-airbnb/20 transition-all cursor-pointer flex items-center gap-5 overflow-hidden"
                onClick={() => handleReSearch(search)}
              >
                {/* Decorative Background element */}
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-airbnb/5 rounded-full blur-2xl group-hover:bg-airbnb/10 transition-colors" />
                
                <div className="relative w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-airbnb group-hover:text-white transition-all duration-300 shadow-inner">
                  <Clock size={24} strokeWidth={2.5} />
                </div>

                <div className="relative flex-grow overflow-hidden pr-6">
                  <h3 className="font-black text-lg text-gray-900 truncate tracking-tight">
                    {search.location || 'Anywhere'}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <span className="text-[10px] font-black text-airbnb bg-airbnb/5 px-2.5 py-1 rounded-full uppercase tracking-tighter border border-airbnb/10">
                      {search.type || 'Any stay'}
                    </span>
                    <span className="text-[10px] font-black text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full uppercase tracking-tighter border border-gray-100">
                      {search.guests} guests
                    </span>
                    {(search.minPrice || search.maxPrice) && (
                      <span className="text-[10px] font-black text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full uppercase tracking-tighter border border-gray-100">
                        ${search.minPrice || 0}-${search.maxPrice || '∞'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="relative w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-airbnb/10 group-hover:text-airbnb transition-all transform group-hover:translate-x-1">
                  <ChevronRight size={18} strokeWidth={3} />
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
