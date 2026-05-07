import React from 'react';
import { useListings } from '../../../contexts/ListingContext';
import { Clock, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const ContinueSearching: React.FC = () => {
  const { searchHistory, searchListings } = useListings();

  if (searchHistory.length === 0) return null;

  const lastSearch = searchHistory[0];

  const handleReSearch = (search: typeof lastSearch) => {
    searchListings(search);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="py-12">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Continue searching</h2>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {searchHistory.map((search, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleReSearch(search)}
              className="min-w-[280px] p-4 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-xl transition-all cursor-pointer group flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-airbnb/10 group-hover:text-airbnb transition-colors">
                <Clock size={20} />
              </div>
              <div className="flex-grow overflow-hidden">
                <h3 className="font-black text-gray-900 truncate">
                  {search.location || 'Anywhere'}
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] font-bold text-airbnb bg-airbnb/5 px-2 py-0.5 rounded-md uppercase tracking-tight">
                    {search.type || 'Any stay'}
                  </span>
                  <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md uppercase tracking-tight">
                    {search.guests} guests
                  </span>
                  {(search.minPrice || search.maxPrice) && (
                    <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md uppercase tracking-tight">
                      ${search.minPrice || 0}-${search.maxPrice || '∞'}
                    </span>
                  )}
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-300 group-hover:text-airbnb transition-colors" />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContinueSearching;
