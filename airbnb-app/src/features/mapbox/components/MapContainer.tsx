import React, { useState, useEffect } from 'react';
import MapView from 'react-map-gl/mapbox';
import { Marker, Popup, NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { Listing } from '../../../shared/types';
import { MapPin, Star, Home, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MapContainerProps {
  listings: Listing[];
  selectedListingId?: string | null;
  onSelectListing?: (id: string | null) => void;
}

/**
 * File: MapContainer.tsx
 * What it is doing: Renders an interactive Mapbox map with listing markers and premium popups.
 * Responsibility: Visualizing property locations, handling selection state, and providing a high-end mapping UX.
 * Outcomes: A responsive, animated map that synchronizes with the dashboard listing selection.
 */
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoiY3liZXJjb2RlMjMwIiwiYSI6ImNsd3B6ZW9hajBmajkyanBkd3B6ZW9hajBmajkyYW4ifQ.placeholder';

const MapContainer: React.FC<MapContainerProps> = ({
  listings,
  selectedListingId,
  onSelectListing
}) => {
  const [popupInfo, setPopupInfo] = useState<Listing | null>(null);

  // Kigali, Rwanda coordinates as default center
  const defaultCenter = { longitude: 30.0619, latitude: -1.9441 };

  // Sync selected listing from props to popup
  useEffect(() => {
    if (selectedListingId) {
      const listing = listings.find(l => l.id === selectedListingId);
      if (listing) setPopupInfo(listing);
    } else {
      setPopupInfo(null);
    }
  }, [selectedListingId, listings]);

  return (
    <div className="w-full h-full relative rounded-3xl overflow-hidden shadow-2xl border border-white/20">
      <MapView
        initialViewState={{
          longitude: defaultCenter.longitude,
          latitude: defaultCenter.latitude,
          zoom: 12          
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={MAPBOX_TOKEN}
      >
        <NavigationControl position="bottom-right" />

        {/* Fullscreen and Scale controls - checking if they work in this env, otherwise will remove */}
        {/* Note: If these cause build errors, they should be removed or conditionally rendered */}

        {listings.map((listing) => (
          <Marker
            key={listing.id}
            longitude={listing.longitude || defaultCenter.longitude + (Math.random() - 0.5) * 0.05}
            latitude={listing.latitude || defaultCenter.latitude + (Math.random() - 0.5) * 0.05}
            anchor="bottom"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              setPopupInfo(listing);
              onSelectListing?.(listing.id);
            }}
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={`px-3 py-1.5 rounded-full shadow-lg border-2 transition-all cursor-pointer font-bold text-sm flex items-center gap-1.5 ${selectedListingId === listing.id
                  ? 'bg-airbnb text-white border-white scale-110 z-50'
                  : 'bg-white text-gray-900 border-gray-100 hover:border-airbnb'
                }`}
            >
              <DollarSign size={12} />
              <span>{listing.pricePerNight}</span>
            </motion.div>
          </Marker>
        ))}

        <AnimatePresence>
          {popupInfo && (
            <Popup
              anchor="top"
              longitude={popupInfo.longitude || defaultCenter.longitude}
              latitude={popupInfo.latitude || defaultCenter.latitude}
              onClose={() => {
                setPopupInfo(null);
                onSelectListing?.(null);
              }}
              closeButton={false}
              className="rounded-2xl overflow-hidden z-50"
              maxWidth="280px"
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="overflow-hidden bg-white rounded-xl shadow-xl"
              >
                {popupInfo.photos?.[0]?.url ? (
                  <div className="relative h-32 w-full overflow-hidden">
                    <img
                      src={popupInfo.photos[0].url}
                      alt={popupInfo.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 px-2 py-1 bg-white/90 backdrop-blur-md rounded-lg text-[10px] font-black flex items-center gap-1">
                      <Star size={10} className="fill-amber-400 text-amber-400" />
                      {popupInfo.rating || 'New'}
                    </div>
                  </div>
                ) : (
                  <div className="h-32 w-full bg-gray-100 flex items-center justify-center text-gray-300">
                    <Home size={32} />
                  </div>
                )}

                <div className="p-3">
                  <h3 className="font-black text-sm truncate text-gray-900">{popupInfo.title}</h3>
                  <p className="text-gray-500 text-[10px] flex items-center gap-1 mt-0.5">
                    <MapPin size={10} /> {popupInfo.location}
                  </p>

                  <div className="mt-2 flex items-center justify-between border-t border-gray-100 pt-2">
                    <div className="flex items-center gap-1 text-airbnb">
                      <span className="text-sm font-black">${popupInfo.pricePerNight}</span>
                      <span className="text-[10px] font-medium text-gray-400">/ night</span>
                    </div>
                    <button
                      onClick={() => window.open(`/listings/${popupInfo.id}`, '_blank')}
                      className="text-[10px] font-black text-gray-900 hover:text-airbnb transition-colors underline decoration-2 underline-offset-2"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </motion.div>
            </Popup>
          )}
        </AnimatePresence>
      </MapView>

      {/* Floating Legend/Controls */}
      <div className="absolute top-4 left-4 z-10 hidden md:block">
        <div className="glass-card px-4 py-3 rounded-2xl border border-white/40 shadow-xl bg-white/70 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-airbnb animate-pulse" />
            <span className="text-xs font-black text-gray-900 tracking-tight">Live Availability</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapContainer;