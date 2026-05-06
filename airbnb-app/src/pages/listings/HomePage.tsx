// HomePage.tsx - with Mapbox logic commented out
import React, { useState, useEffect } from 'react';
import ListingCard from '../../components/listing/ListingCard';
// import MapContainer from '../../components/map/MapContainer';  // ✅ Commented out
import type { Listing } from '../../types';
import api from '../../api/axios';
import { Map as MapIcon, List, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const HomePage: React.FC = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await api.get('/listings');
        setListings(response.data.data || []);
      } catch (error) {
        console.error('Failed to fetch listings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  // Mock categories for the tab bar
  const categories = [
    { name: 'Amazing pools', icon: '🏊' },
    { name: 'Cabins', icon: '🏠' },
    { name: 'Beachfront', icon: '🏖️' },
    { name: 'Icons', icon: '🏛️' },
    { name: 'Countryside', icon: '🏡' },
    { name: 'Trending', icon: '🔥' },
    { name: 'Luxe', icon: '💎' },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-80px)]">
      {/* Category Tab Bar */}
      <div className="sticky top-[81px] z-40 bg-white border-b border-light-gray shadow-sm">
        <div className="container mx-auto px-4 md:px-8 lg:px-12 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-8 overflow-x-auto no-scrollbar flex-grow">
            {categories.map((cat) => (
              <button
                key={cat.name}
                className="flex flex-col items-center gap-2 min-w-max pb-2 border-b-2 border-transparent hover:border-light-gray hover:text-black text-gray-text transition-all group"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                <span className="text-xs font-medium">{cat.name}</span>
              </button>
            ))}
          </div>
          
          <button className="flex items-center gap-2 border border-light-gray rounded-xl px-4 py-3 text-xs font-semibold hover:bg-gray-50 transition-colors">
            <Filter size={16} />
            Filters
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow overflow-hidden relative">
        <AnimatePresence mode="wait">
          {viewMode === 'list' ? (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="container mx-auto px-4 md:px-8 lg:px-12 py-8 overflow-y-auto h-full"
            >
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-10">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="aspect-square bg-gray-200 rounded-xl mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-10">
                  {listings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                  {listings.length === 0 && !loading && (
                    <div className="col-span-full text-center py-20">
                      <h2 className="text-2xl font-bold">No listings found</h2>
                      <p className="text-gray-text mt-2">Try adjusting your filters or search area.</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ) : (
            // ✅ Map view commented out - showing placeholder instead
            <motion.div
              key="map"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full"
            >
              {/* <MapContainer listings={listings} /> */}
              {/* Temporary placeholder for map view */}
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">🗺️</div>
                  <h3 className="text-xl font-semibold text-gray-700">Map View</h3>
                  <p className="text-gray-500 mt-2">Coming soon...</p>
                  <button 
                    onClick={() => setViewMode('list')}
                    className="mt-4 px-4 py-2 bg-black text-white rounded-full text-sm"
                  >
                    Back to List View
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating View Toggle Button */}
        <button
          onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-black text-white px-6 py-3.5 rounded-full flex items-center gap-2 font-semibold text-sm hover:scale-105 transition-transform shadow-xl active:scale-95"
        >
          {viewMode === 'list' ? (
            <>
              <span>Show map</span>
              <MapIcon size={18} />
            </>
          ) : (
            <>
              <span>Show list</span>
              <List size={18} />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default HomePage;