import React, { useMemo } from 'react';
import { List } from 'react-window';
import { useListings } from '../../../contexts/ListingContext';
import ListingCard from '../components/ListingCard';
import MapSearch from '../../search/components/MapSearch';
import { Info, Loader2, Search } from 'lucide-react';

const SearchResultsPage: React.FC = () => {
  const { filteredListings, loading, filters, searchListings } = useListings();

  // Create pairs for virtualization (2 columns)
  const rows = useMemo(() => {
    const res = [];
    for (let i = 0; i < filteredListings.length; i += 2) {
      res.push(filteredListings.slice(i, i + 2));
    }
    return res;
  }, [filteredListings]);

  // Dynamic Title Generator
  const searchTitle = useMemo(() => {
    const count = filteredListings.length;
    const location = filters.location || "selected area";
    const priceText = filters.maxPrice ? ` under $${filters.maxPrice}` : "";
    return `${count} homes in ${location}${priceText}`;
  }, [filteredListings.length, filters.location, filters.maxPrice]);

  // Row component for react-window
  const RowComponent = ({ index, style }: any) => {
    const pair = rows[index];
    if (!pair) return null;
    
    return (
      <div style={style} className="flex gap-12 px-8 py-10"> {/* Increased vertical padding and gap */}
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
    <div className="flex h-[calc(100vh-80px)] overflow-hidden bg-white">
      {/* Left Side: Results List */}
      <div className="w-full lg:w-[58%] flex flex-col bg-white z-10">
        {/* Results Header */}
        <div className="p-8 pb-4 bg-white sticky top-0 z-30">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight lowercase first-letter:uppercase">
              {searchTitle}
            </h1>
            
            {/* Quick Search Trigger */}
            <button 
              onClick={() => searchListings({})}
              className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
            </button>
          </div>
          <div className="h-px bg-gray-100 w-full mt-6" />
        </div>

        {/* Results Body */}
        <div className="flex-1 relative overflow-hidden">
          {loading ? (
            <div className="p-8 grid grid-cols-1 gap-12">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-10 animate-pulse">
                  <div className="w-72 h-48 bg-gray-100 rounded-[2rem] flex-shrink-0" />
                  <div className="flex-1 space-y-5 py-2">
                    <div className="h-4 bg-gray-100 rounded-full w-1/4" />
                    <div className="h-8 bg-gray-100 rounded-2xl w-3/4" />
                    <div className="h-4 bg-gray-100 rounded-full w-full" />
                    <div className="h-10 bg-gray-100 rounded-2xl w-1/2 mt-auto" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredListings.length > 0 ? (
            <div className="h-full w-full">
              <List
                rowCount={rows.length}
                rowHeight={460} // Increased significantly to ensure gap at bottom
                rowProps={rows}
                rowComponent={RowComponent}
                className="scrollbar-hide"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-12 text-center">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <Info size={40} className="text-gray-200" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No results found</h2>
              <p className="text-gray-400 max-w-sm text-sm">
                Try widening your search area or removing filters.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Right Side: Map with Outer Padding and Rounded Corners */}
      <div className="hidden lg:block lg:w-[42%] h-full p-6 pl-0">
        <div className="w-full h-full rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-2xl relative">
          <MapSearch height="h-full" rounded="rounded-none" />
          
          {/* Floating Search in this area button */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20">
            <button className="bg-white px-5 py-2.5 rounded-full shadow-2xl border border-gray-100 text-[13px] font-bold text-gray-900 hover:scale-105 active:scale-95 transition-all">
              Search in this area
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResultsPage;
