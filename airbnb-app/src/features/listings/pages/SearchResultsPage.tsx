import React, { useMemo, useState } from 'react';
import { List } from 'react-window';
import { useListings } from '../../../contexts/ListingContext';
import ListingCard from '../components/ListingCard';
import MapSearch from '../../search/components/MapSearch';
import { Search, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { Button } from '../../../shared/components';
import { motion, AnimatePresence } from 'framer-motion';

const FilterPill: React.FC<{ 
  label: string; 
  active?: boolean; 
  onClick?: () => void;
  dropdown?: React.ReactNode;
  isOpen?: boolean;
}> = ({ label, active, onClick, dropdown, isOpen }) => (
  <div className="relative">
    <button 
      onClick={onClick}
      className={`px-4 py-2 rounded-full border text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${active ? 'border-black bg-gray-900 text-white' : 'border-gray-200 hover:border-black text-gray-600'} ${isOpen ? 'ring-2 ring-black border-black' : ''}`}
    >
      {label}
      <ChevronDown size={14} className={active ? 'text-white' : 'text-gray-400'} />
    </button>
    {isOpen && dropdown && (
      <div className="absolute top-full left-0 mt-2 z-50 animate-in fade-in zoom-in duration-200">
        {dropdown}
      </div>
    )}
  </div>
);

const SearchResultsPage: React.FC = () => {
  const { filteredListings, loading, filters, searchListings } = useListings();
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  // Create pairs for virtualization (2 columns)
  const rows = useMemo(() => {
    const res = [];
    for (let i = 0; i < filteredListings.length; i += 2) {
      res.push(filteredListings.slice(i, i + 2));
    }
    return res;
  }, [filteredListings]);


  const RowComponent = ({ index, style }: any) => {
    const pair = rows[index];
    if (!pair) return null;
    
    return (
      <div style={style} className="flex gap-8 px-8 py-6">
        {pair.map((listing: any) => (
          <div key={listing.id} className="flex-1 min-w-0">
            <ListingCard listing={listing} variant="search" />
          </div>
        ))}
        {pair.length === 1 && <div className="flex-1" />}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Top Filter Bar - Airbnb Style */}
      <div className="z-40 bg-white border-b border-gray-100 px-8 py-3 shrink-0">
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
          <button className="p-3 border border-gray-200 rounded-xl hover:border-black transition-all flex items-center gap-2 text-xs font-black">
            <SlidersHorizontal size={16} />
            Filters
          </button>
          <div className="w-px h-6 bg-gray-100 mx-2" />
          
          <FilterPill 
            label={
              filters.minPrice && filters.maxPrice ? `$${filters.minPrice} - $${filters.maxPrice}` :
              filters.minPrice ? `$${filters.minPrice}+` :
              filters.maxPrice ? `Up to $${filters.maxPrice}` :
              'Price range'
            } 
            active={!!(filters.minPrice || filters.maxPrice)} 
            isOpen={activeFilter === 'price'}
            onClick={() => setActiveFilter(activeFilter === 'price' ? null : 'price')}
            dropdown={
              <div className="bg-white border border-gray-100 shadow-2xl rounded-3xl p-6 w-80 space-y-6">
                <div>
                  <h3 className="font-bold text-gray-900 mb-4">Quick Select</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Under $50', min: '0', max: '50' },
                      { label: '$50 - $100', min: '50', max: '100' },
                      { label: '$100 - $200', min: '100', max: '200' },
                      { label: '$200+', min: '200', max: '' }
                    ].map((range) => (
                      <button
                        key={range.label}
                        onClick={() => {
                          searchListings({ minPrice: range.min, maxPrice: range.max });
                          setActiveFilter(null);
                        }}
                        className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                          filters.minPrice === range.min && filters.maxPrice === range.max
                            ? 'border-black bg-gray-900 text-white'
                            : 'border-gray-100 hover:border-black text-gray-600'
                        }`}
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="w-full h-px bg-gray-50" />

                <div>
                  <h3 className="font-bold text-gray-900 mb-4">Custom Range</h3>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 p-3 border border-gray-200 rounded-xl">
                      <span className="text-[10px] text-gray-400 font-bold block uppercase">Min</span>
                      <input 
                        type="number" placeholder="$0" 
                        className="w-full text-sm font-bold outline-none bg-transparent"
                        value={filters.minPrice}
                        onChange={(e) => searchListings({ minPrice: e.target.value })}
                      />
                    </div>
                    <div className="flex-1 p-3 border border-gray-200 rounded-xl">
                      <span className="text-[10px] text-gray-400 font-bold block uppercase">Max</span>
                      <input 
                        type="number" placeholder="$500+" 
                        className="w-full text-sm font-bold outline-none bg-transparent"
                        value={filters.maxPrice}
                        onChange={(e) => searchListings({ maxPrice: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                
                <button onClick={() => setActiveFilter(null)} className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all">
                  Apply Filters
                </button>
              </div>
            }
          />

          <FilterPill 
            label={filters.type || 'Type of place'} 
            active={!!filters.type} 
            isOpen={activeFilter === 'type'}
            onClick={() => setActiveFilter(activeFilter === 'type' ? null : 'type')}
            dropdown={
              <div className="bg-white border border-gray-100 shadow-2xl rounded-2xl p-4 w-60 space-y-1">
                {['APARTMENT', 'HOUSE', 'VILLA', 'CABIN'].map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      searchListings({ type: t as any });
                      setActiveFilter(null);
                    }}
                    className={`w-full text-left p-3 rounded-xl text-sm font-bold transition-colors ${filters.type === t ? 'bg-gray-900 text-white' : 'hover:bg-gray-50 text-gray-700'}`}
                  >
                    {t.charAt(0) + t.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            }
          />

          <FilterPill label="Rooms & beds" />
          <FilterPill label="Amenities" />
          <FilterPill label="Guest favorites" />
          <FilterPill label="Instant Book" />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Side: Results List */}
        <div className="w-full lg:w-[60%] flex flex-col bg-white">
          <div className="p-8 pb-4">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-sm font-medium text-gray-500">
                Over {filteredListings.length} stays found
              </h1>
            </div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
              Stays in {filters.location || 'selected area'}
            </h2>
          </div>

          <div className="flex-1 relative overflow-hidden">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-8 grid grid-cols-1 gap-12"
                >
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex gap-8 animate-pulse">
                      <div className="w-64 h-44 bg-gray-100 rounded-3xl" />
                      <div className="flex-1 space-y-4">
                        <div className="h-3 bg-gray-100 rounded-full w-1/4" />
                        <div className="h-6 bg-gray-100 rounded-xl w-3/4" />
                        <div className="h-3 bg-gray-100 rounded-full w-full" />
                        <div className="h-8 bg-gray-100 rounded-xl w-1/2 mt-auto" />
                      </div>
                    </div>
                  ))}
                </motion.div>
              ) : filteredListings.length > 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full w-full"
                >
                  <List
                    rowCount={rows.length}
                    rowHeight={420} // Increased to fit search variant card details
                    rowProps={rows}
                    rowComponent={RowComponent}
                    className="scrollbar-hide"
                  />
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center h-full p-12 text-center"
                >
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                    <Search size={32} className="text-gray-200" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">No exact matches</h3>
                  <p className="text-gray-500 max-w-sm mt-2">
                    Try changing or removing some of your filters or adjusting your search area.
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-8 rounded-xl px-8"
                    onClick={() => searchListings({ location: '' })}
                  >
                    Clear all filters
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Side: Map */}
        <div className="hidden lg:block lg:w-[40%] h-full relative">
          <MapSearch height="h-full" rounded="rounded-none" />
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20">
            <button 
              onClick={() => searchListings({})} // Triggers a refresh of the current area
              className="bg-white px-6 py-3 rounded-full shadow-2xl border border-gray-100 text-sm font-black text-gray-900 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              Search this area
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResultsPage;
