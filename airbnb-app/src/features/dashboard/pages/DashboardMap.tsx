import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Home, Filter, Maximize2, Navigation, Star, DollarSign } from 'lucide-react';
import { useListings } from '../../../contexts/ListingContext';
import { useAuth } from '../../../contexts/AuthContext';

// Mock map component - replace with actual map library like Mapbox or Google Maps
const MapPlaceholder: React.FC<{ listings: any[]; selectedId?: string }> = ({ listings, selectedId }) => {
  return (
    <div className="relative w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl overflow-hidden">
      {/* Mock map background */}
      <div className="absolute inset-0" style={{
        backgroundImage: `radial-gradient(circle at 20% 40%, rgba(0,0,0,0.05) 1px, transparent 1px)`,
        backgroundSize: '30px 30px'
      }} />
      
      {/* Mock map pins */}
      {listings.map((listing, idx) => (
        <motion.div
          key={listing.id}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: idx * 0.05 }}
          className={`absolute cursor-pointer transition-all ${
            selectedId === listing.id ? 'z-20 scale-125' : 'z-10'
          }`}
          style={{
            left: `${20 + (idx * 15) % 70}%`,
            top: `${20 + (idx * 25) % 60}%`,
          }}
        >
          <div className="relative group">
            <MapPin 
              size={32} 
              className={`${selectedId === listing.id ? 'text-airbnb fill-airbnb' : 'text-gray-600 fill-white'} drop-shadow-lg`}
            />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-white rounded-xl px-3 py-1.5 shadow-lg text-sm font-bold">
              ${listing.price}/night
            </div>
          </div>
        </motion.div>
      ))}
      
      {/* Controls overlay */}
      <div className="absolute top-4 right-4 flex gap-2">
        <button className="p-2 bg-white rounded-xl shadow-lg hover:scale-105 transition-all">
          <Maximize2 size={18} />
        </button>
        <button className="p-2 bg-white rounded-xl shadow-lg hover:scale-105 transition-all">
          <Navigation size={18} />
        </button>
      </div>
    </div>
  );
};

const DashboardMap: React.FC = () => {
  const { user } = useAuth();
  const { listings } = useListings();
  const [selectedListing, setSelectedListing] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'active' | 'inactive'>('all');
  
  const hostListings = listings.filter(l => l.hostId === user?.id);
  
  const filteredListings = hostListings.filter(listing => {
    if (filterType === 'all') return true;
    if (filterType === 'active') return listing.isActive;
    return !listing.isActive;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-gray-900">Property Map</h1>
        <p className="text-gray-500 mt-1">Visualize your properties and their locations</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {['all', 'active', 'inactive'].map((filter) => (
          <button
            key={filter}
            onClick={() => setFilterType(filter as any)}
            className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition-all ${
              filterType === filter
                ? 'bg-gray-900 text-white'
                : 'glass-card text-gray-600 hover:bg-white/50'
            }`}
          >
            {filter === 'all' ? 'All Properties' : filter === 'active' ? 'Active' : 'Inactive'}
          </button>
        ))}
      </div>

      {/* Map and Listings Grid */}
      <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-280px)] min-h-[500px]">
        {/* Map */}
        <div className="lg:col-span-2 h-full">
          <MapPlaceholder listings={filteredListings} selectedId={selectedListing || undefined} />
        </div>

        {/* Listings Sidebar */}
        <div className="glass-card rounded-3xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-white/20">
            <h3 className="font-black">Your Properties</h3>
            <p className="text-xs text-gray-500 mt-1">{filteredListings.length} properties shown</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredListings.map((listing) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => setSelectedListing(listing.id)}
                className={`p-3 rounded-2xl cursor-pointer transition-all ${
                  selectedListing === listing.id
                    ? 'bg-airbnb/10 border-2 border-airbnb'
                    : 'glass hover:bg-white/30'
                }`}
              >
                <div className="flex gap-3">
                  <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                    {listing.photos?.[0]?.url ? (
                      <img src={listing.photos[0].url} alt={listing.title} className="w-full h-full object-cover" />
                    ) : (
                      <Home size={24} className="text-gray-300 m-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-sm text-gray-900 truncate">{listing.title}</p>
                      {listing.isActive ? (
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-gray-400" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <MapPin size={12} /> {listing.location}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <DollarSign size={14} className="text-gray-500" />
                        <span className="text-sm font-bold">{listing.price}/night</span>
                      </div>
                      {listing.rating && (
                        <div className="flex items-center gap-1">
                          <Star size={12} className="fill-amber-400 text-amber-400" />
                          <span className="text-xs font-bold">{listing.rating}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardMap;