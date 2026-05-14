import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useListings } from '../../../contexts/ListingContext';
import ListingCard from '../components/ListingCard';
import MapSearch from '../../search/components/MapSearch';
import { Search, ChevronDown, X, Sparkles } from 'lucide-react';

// interface FilterState {
//   priceMin: number | null;
//   priceMax: number | null;
//   type: ListingType | null;
//   location: string;
// }

type ListingType = 'APARTMENT' | 'HOUSE' | 'VILLA' | 'CABIN' | '';

const FilterPill: React.FC<{ 
  label: string; 
  active?: boolean; 
  onClick?: () => void;
  dropdown?: React.ReactNode;
  isOpen?: boolean;
  onClear?: () => void;
}> = ({ label, active, onClick, dropdown, isOpen, onClear }) => (
  <div className="relative">
    <button 
      onClick={onClick}
      className={`px-4 py-2 rounded-full border text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
        active ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-300 hover:border-gray-900 text-gray-700'
      }`}
    >
      {label}
      {active && onClear && (
        <span onClick={(e) => { e.stopPropagation(); onClear(); }} className="ml-1 hover:opacity-70">
          <X size={12} />
        </span>
      )}
      {!active && <ChevronDown size={12} className={active ? 'text-white' : 'text-gray-400'} />}
    </button>
    {isOpen && dropdown && (
      <div className="absolute top-full left-0 mt-2 z-50 bg-white rounded-xl shadow-xl border border-gray-100 min-w-[240px] animate-in fade-in zoom-in duration-150">
        {dropdown}
      </div>
    )}
  </div>
);

const SearchResultsPage: React.FC = () => {
  const { filteredListings, loading, filters, searchListings, aiSearchListings, aiMessage } = useListings();
  const [searchParams] = useSearchParams();
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<{ min: number | null; max: number | null }>({ min: null, max: null });
  const [selectedType, setSelectedType] = useState<ListingType | null>(null);
  const [locationInput, setLocationInput] = useState(filters.location || '');

  // Sync URL query with AI search
  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      aiSearchListings(query);
    }
  }, [searchParams, aiSearchListings]);

  // Apply all filters
  const applyFilters = () => {
    searchListings({
      minPrice: priceRange.min?.toString() || '',
      maxPrice: priceRange.max?.toString() || '',
      type: selectedType || '',
      location: locationInput,
    });
    setActiveFilter(null);
  };

  const clearPriceFilter = () => {
    setPriceRange({ min: null, max: null });
    searchListings({ minPrice: '', maxPrice: '', type: selectedType || '', location: locationInput });
  };

  const clearTypeFilter = () => {
    setSelectedType(null);
    searchListings({ type: '', minPrice: priceRange.min?.toString() || '', maxPrice: priceRange.max?.toString() || '', location: locationInput });
  };

  const clearLocationFilter = () => {
    setLocationInput('');
    searchListings({ location: '', minPrice: priceRange.min?.toString() || '', maxPrice: priceRange.max?.toString() || '', type: selectedType || '' });
  };

  const hasActiveFilters = !!(priceRange.min || priceRange.max || selectedType || locationInput);

  const getFilterLabel = () => {
    if (priceRange.min && priceRange.max) return `$${priceRange.min} - $${priceRange.max}`;
    if (priceRange.min) return `From $${priceRange.min}`;
    if (priceRange.max) return `Up to $${priceRange.max}`;
    return 'Price';
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Top Filter Bar - Airbnb Style */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100 px-6 py-3 shrink-0">
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
          {/* Location Filter */}
          <div className="relative">
            <button
              onClick={() => setActiveFilter(activeFilter === 'location' ? null : 'location')}
              className={`px-4 py-2 rounded-full border text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
                locationInput ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-300 hover:border-gray-900 text-gray-700'
              }`}
            >
              {locationInput ? locationInput.substring(0, 20) : 'Location'}
              {locationInput && (
                <span onClick={(e) => { e.stopPropagation(); clearLocationFilter(); }} className="ml-1 hover:opacity-70">
                  <X size={12} />
                </span>
              )}
              {!locationInput && <ChevronDown size={12} />}
            </button>
            {activeFilter === 'location' && (
              <div className="absolute top-full left-0 mt-2 z-50 bg-white rounded-xl shadow-xl border border-gray-100 w-72 p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Search by location</h3>
                <input
                  type="text"
                  placeholder="City, region, or landmark"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-900"
                />
                <button onClick={applyFilters} className="w-full mt-3 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium">
                  Apply
                </button>
              </div>
            )}
          </div>

          {/* Price Filter */}
          <FilterPill 
            label={getFilterLabel()}
            active={!!(priceRange.min || priceRange.max)}
            isOpen={activeFilter === 'price'}
            onClick={() => setActiveFilter(activeFilter === 'price' ? null : 'price')}
            onClear={clearPriceFilter}
            dropdown={
              <div className="p-5 w-80 space-y-5">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 text-sm">Price per night</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Under $50', min: 0, max: 50 },
                      { label: '$50 - $100', min: 50, max: 100 },
                      { label: '$100 - $200', min: 100, max: 200 },
                      { label: '$200+', min: 200, max: null }
                    ].map((range) => (
                      <button
                        key={range.label}
                        onClick={() => {
                          setPriceRange({ min: range.min, max: range.max });
                          searchListings({ minPrice: range.min?.toString() || '', maxPrice: range.max?.toString() || '', type: selectedType || '', location: locationInput });
                          setActiveFilter(null);
                        }}
                        className={`p-2.5 rounded-lg border text-xs font-medium transition-all ${
                          priceRange.min === range.min && priceRange.max === range.max
                            ? 'border-gray-900 bg-gray-900 text-white'
                            : 'border-gray-200 hover:border-gray-900 text-gray-700'
                        }`}
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="border-t border-gray-100 pt-4">
                  <h3 className="font-semibold text-gray-900 mb-3 text-sm">Custom range</h3>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <input 
                        type="number" 
                        placeholder="Min" 
                        className="w-full p-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-gray-900"
                        value={priceRange.min || ''}
                        onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value ? parseInt(e.target.value) : null })}
                      />
                    </div>
                    <span className="text-gray-400">—</span>
                    <div className="flex-1">
                      <input 
                        type="number" 
                        placeholder="Max" 
                        className="w-full p-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-gray-900"
                        value={priceRange.max || ''}
                        onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value ? parseInt(e.target.value) : null })}
                      />
                    </div>
                  </div>
                  <button onClick={applyFilters} className="w-full mt-3 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium">
                    Apply
                  </button>
                </div>
              </div>
            }
          />

          {/* Type Filter */}
          <FilterPill 
            label={selectedType ? selectedType.toLowerCase() : 'Property type'}
            active={!!selectedType}
            isOpen={activeFilter === 'type'}
            onClick={() => setActiveFilter(activeFilter === 'type' ? null : 'type')}
            onClear={clearTypeFilter}
            dropdown={
              <div className="p-2 w-52">
                {(['APARTMENT', 'HOUSE', 'VILLA', 'CABIN'] as ListingType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      setSelectedType(type);
                      searchListings({ type: type, minPrice: priceRange.min?.toString() || '', maxPrice: priceRange.max?.toString() || '', location: locationInput });
                      setActiveFilter(null);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedType === type ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {type.charAt(0) + type.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            }
          />

          {/* Clear all filters button */}
          {hasActiveFilters && (
            <button
              onClick={() => {
                setPriceRange({ min: null, max: null });
                setSelectedType(null);
                setLocationInput('');
                searchListings({ minPrice: '', maxPrice: '', type: '', location: '' });
              }}
              className="px-3 py-2 text-xs font-medium text-gray-500 hover:text-gray-900 underline-offset-4 hover:underline"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Side: Results List - 3 columns on large screens */}
        <div className="w-full lg:w-[55%] xl:w-[60%] flex flex-col bg-white overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <p className="text-sm text-gray-500">
              <span className="font-semibold text-gray-900">{filteredListings.length}</span> stays found
            </p>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            {aiMessage && (
              <div className="mb-6 p-4 bg-purple-50 border border-purple-100 rounded-xl flex gap-3">
                <div className="text-purple-600 shrink-0">
                  <Sparkles size={18} />
                </div>
                <p className="text-sm text-gray-700 leading-relaxed italic">
                  {aiMessage}
                </p>
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-square bg-gray-100 rounded-xl mb-3" />
                    <div className="h-3 bg-gray-100 rounded w-3/4 mb-2" />
                    <div className="h-2 bg-gray-100 rounded w-1/2 mb-2" />
                    <div className="h-2 bg-gray-100 rounded w-1/4" />
                  </div>
                ))}
              </div>
            ) : filteredListings.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {filteredListings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>
                <div className="py-12 text-center">
                  <p className="text-xs text-gray-400">End of results</p>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-20 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Search size={24} className="text-gray-400" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">No properties found</h3>
                <p className="text-sm text-gray-500 max-w-xs">
                  Try adjusting your search or removing some filters
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={() => {
                      setPriceRange({ min: null, max: null });
                      setSelectedType(null);
                      setLocationInput('');
                      searchListings({ minPrice: '', maxPrice: '', type: '', location: '' });
                    }}
                    className="mt-4 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:border-gray-900"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Map */}
        <div className="hidden lg:block lg:w-[45%] xl:w-[40%] h-full sticky top-0">
          <MapSearch height="h-full" rounded="rounded-none" />
        </div>
      </div>
    </div>
  );
};

export default SearchResultsPage;