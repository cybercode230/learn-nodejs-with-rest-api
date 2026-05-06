import React from 'react';
import { Search, Map as MapIcon, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AISearch from './AISearch';
import NormalSearch from './NormalSearch';
import MapSearch from './MapSearch';
import { useSearch, type SearchMode } from '../hooks/useSearch';

const MODE_TEXTS: Record<SearchMode, string> = {
  AI: "Search with AI made simple",
  NORMAL: "Find your perfect stay in seconds",
  MAP: "Explore unique homes worldwide on the map"
};

const SearchContainer: React.FC = () => {
  const { mode, switchMode, isAiMode, isNormalMode, isMapMode } = useSearch();

  return (
    <div className="w-full flex flex-col items-center relative py-6">
      {/* Search Mode Switcher - Alibaba/Professional Style */}
      <div className="flex items-center gap-6 md:gap-12 mb-8 relative border-b border-gray-100 w-full max-w-2xl justify-center">
        <button 
          onClick={() => switchMode('AI')}
          className={`flex items-center gap-2 pb-3 text-sm font-bold tracking-tight transition-all relative ${isAiMode ? 'text-airbnb' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <Sparkles size={16} />
          AI Search
          {isAiMode && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-airbnb" />}
        </button>
        <button 
          onClick={() => switchMode('NORMAL')}
          className={`flex items-center gap-2 pb-3 text-sm font-bold tracking-tight transition-all relative ${isNormalMode ? 'text-airbnb' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <Search size={16} />
          Find Stays
          {isNormalMode && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-airbnb" />}
        </button>
        <button 
          onClick={() => switchMode('MAP')}
          className={`flex items-center gap-2 pb-3 text-sm font-bold tracking-tight transition-all relative ${isMapMode ? 'text-airbnb' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <MapIcon size={16} />
          Map Explorer
          {isMapMode && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-airbnb" />}
        </button>
      </div>

      {/* Mode-Specific Hero Text */}
      <div className="text-center mb-8 h-8">
        <AnimatePresence mode="wait">
          <motion.h2
            key={mode}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-lg md:text-xl text-gray-500 font-medium"
          >
            {MODE_TEXTS[mode]}
          </motion.h2>
        </AnimatePresence>
      </div>

      {/* Content Area */}
      <div className="w-full max-w-6xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {isAiMode && <AISearch onClose={() => {}} />}
            {isNormalMode && <NormalSearch onClose={() => {}} />}
            {isMapMode && (
              <div className="w-full mx-auto px-2">
                <MapSearch 
                  onClose={() => switchMode('NORMAL')} 
                  height="h-[550px]" 
                  rounded="rounded-3xl"
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SearchContainer;
