import React, { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Map as MapIcon, Satellite, X, Star, Search as SearchIcon, List, Loader2 } from 'lucide-react';
import { ENV } from '../../../config/env';
import { useListings } from '../../../contexts/ListingContext';
import { useNavigate } from 'react-router-dom';

mapboxgl.accessToken = ENV.MAPBOX_TOKEN;

interface MapSearchProps {
  onClose?: () => void;
  height?: string;
  rounded?: string;
}

const MapSearch: React.FC<MapSearchProps> = ({ 
  onClose, 
  height = "h-[400px]", 
  rounded = "rounded-[2.5rem]" 
}) => {
  const { filteredListings, searchListings, filters, loading } = useListings();
  const navigate = useNavigate();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapStyle, setMapStyle] = useState('mapbox://styles/mapbox/streets-v11');
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(filters.location || '');
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: mapStyle,
      center: [30.0619, -1.9441], // Default to Kigali
      zoom: 12,
      attributionControl: false
    });

    map.current.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-right');

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    const bounds = new mapboxgl.LngLatBounds();
    let hasCoords = false;

    filteredListings.forEach(listing => {
      // Priority: 1. listing coords, 2. random offset if we know we're in Kigali, 3. default
      const lng = listing.longitude || (filters.location?.toLowerCase().includes('nairobi') ? 36.8219 + (Math.random() - 0.5) * 0.05 : 30.0619 + (Math.random() - 0.5) * 0.1);
      const lat = listing.latitude || (filters.location?.toLowerCase().includes('nairobi') ? -1.2921 + (Math.random() - 0.5) * 0.05 : -1.9441 + (Math.random() - 0.5) * 0.1);

      hasCoords = true;
      bounds.extend([lng, lat]);

      const el = document.createElement('div');
      el.className = 'map-marker';
      el.innerHTML = `
        <div class="flex items-center gap-1 px-3 py-1 bg-white rounded-full shadow-lg border border-gray-100 hover:border-airbnb transition-all transform hover:scale-110 cursor-pointer">
          <span class="font-black text-[13px] text-gray-900">$${listing.pricePerNight}</span>
        </div>
      `;

      el.onclick = (e) => {
        e.stopPropagation();
        setSelectedListing(listing);
        map.current?.flyTo({ center: [lng, lat], zoom: 14, duration: 1000 });
      };

      const marker = new mapboxgl.Marker(el)
        .setLngLat([lng, lat])
        .addTo(map.current!);
      
      markersRef.current.push(marker);
    });

    if (hasCoords && map.current) {
      map.current.fitBounds(bounds, { padding: 80, maxZoom: 15, duration: 2000 });
    } else if (filters.location?.toLowerCase().includes('nairobi') && map.current) {
      // Fallback for Nairobi if no listings found yet
      map.current.flyTo({ center: [36.8219, -1.2921], zoom: 12 });
    }
  }, [filteredListings, filters.location]);

  useEffect(() => {
    if (map.current) map.current.setStyle(mapStyle);
  }, [mapStyle]);

  const handleMapSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchListings({ location: searchInput });
  };

  return (
    <div className={`w-full ${height} relative overflow-hidden bg-gray-100 animate-fade-in group ${rounded} border-4 border-white shadow-2xl`}>
      <div ref={mapContainer} className="absolute inset-0 w-full h-full" />

      {/* Controls */}
      <div className="absolute top-4 left-4 right-4 flex items-start justify-between pointer-events-none">
        <div className="flex flex-col gap-2 pointer-events-auto">
          <form 
            onSubmit={handleMapSearchSubmit}
            className="bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl border border-white/50 flex items-center gap-3"
          >
            {loading ? <Loader2 size={14} className="text-airbnb animate-spin" /> : <SearchIcon size={14} className="text-airbnb" />}
            <input 
              type="text" 
              placeholder="Search area..." 
              className="bg-transparent border-none outline-none text-xs font-bold text-gray-900 w-32"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button type="submit" className="hidden">Search</button>
          </form>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="bg-white/95 backdrop-blur-md p-2.5 w-fit rounded-xl shadow-xl border border-white/50 text-gray-700 hover:text-airbnb transition-all"
          >
            {isSidebarOpen ? <X size={16} /> : <List size={16} />}
          </button>
        </div>

        <div className="flex flex-col gap-2 pointer-events-auto">
          {onClose && (
            <button onClick={onClose} className="bg-white/95 backdrop-blur-md p-2.5 rounded-xl shadow-xl border border-white/50 text-gray-700 hover:text-airbnb transition-all mb-4">
              <X size={16} />
            </button>
          )}
          <button onClick={() => setMapStyle('mapbox://styles/mapbox/streets-v11')} className={`p-2.5 rounded-xl shadow-xl transition-all border ${mapStyle.includes('streets') ? 'bg-airbnb text-white border-airbnb' : 'bg-white/95 text-gray-600 border-white/50'}`}><MapIcon size={16} /></button>
          <button onClick={() => setMapStyle('mapbox://styles/mapbox/satellite-v9')} className={`p-2.5 rounded-xl shadow-xl transition-all border ${mapStyle.includes('satellite') ? 'bg-airbnb text-white border-airbnb' : 'bg-white/95 text-gray-600 border-white/50'}`}><Satellite size={16} /></button>
        </div>
      </div>

      {/* Mini Sidebar */}
      {isSidebarOpen && (
        <div className="absolute top-16 left-4 bottom-4 w-64 bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50 flex flex-col overflow-hidden animate-slide-in z-20">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <span className="text-[10px] font-black text-gray-400 tracking-widest uppercase">Visible Stays</span>
            <span className="text-airbnb font-bold text-xs">{filteredListings.length} results</span>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-hide">
            {filteredListings.map(listing => (
              <div 
                key={listing.id}
                onClick={() => {
                  setSelectedListing(listing);
                  const lng = listing.longitude || (filters.location?.toLowerCase().includes('nairobi') ? 36.8219 : 30.0619);
                  const lat = listing.latitude || (filters.location?.toLowerCase().includes('nairobi') ? -1.2921 : -1.9441);
                  map.current?.flyTo({ center: [lng, lat], zoom: 15 });
                }}
                className={`p-3 rounded-2xl border transition-all cursor-pointer ${selectedListing?.id === listing.id ? 'border-airbnb bg-airbnb/5 ring-1 ring-airbnb shadow-inner' : 'border-gray-50 bg-gray-50/50 hover:bg-white hover:border-gray-200'}`}
              >
                <h4 className="font-bold text-[13px] leading-tight truncate">{listing.title}</h4>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm font-black text-gray-900">${listing.pricePerNight}</span>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-gray-500">
                    <Star size={10} className="text-airbnb fill-airbnb" /> {listing.rating || 'New'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Overlay Card */}
      {selectedListing && !isSidebarOpen && (
        <div className="absolute bottom-4 left-4 right-4 bg-white rounded-2xl shadow-2xl border border-airbnb/20 p-3 flex items-center gap-3 animate-fade-in z-30 max-w-sm mx-auto">
           <div className="w-12 h-12 bg-gray-100 rounded-xl flex-shrink-0 overflow-hidden">
             <img src={selectedListing.photos?.[0]?.url || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688'} className="w-full h-full object-cover" alt="" />
           </div>
           <div className="flex-1 overflow-hidden">
             <h4 className="font-bold text-xs truncate">{selectedListing.title}</h4>
             <p className="text-[10px] text-gray-500 font-medium">${selectedListing.pricePerNight}/night • {selectedListing.guests} guests</p>
           </div>
           <div className="flex flex-col gap-1.5">
             <button 
               onClick={(e) => {
                 e.stopPropagation();
                 navigate(`/listings/${selectedListing.id}`);
               }}
               className="bg-airbnb text-white px-3 py-1.5 rounded-lg text-[10px] font-black hover:bg-airbnb/90 transition-all shadow-sm tracking-tighter"
             >
               BOOK
             </button>
             <button onClick={() => setSelectedListing(null)} className="p-1 text-gray-400 hover:text-gray-600 self-center">
               <X size={14} />
             </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default MapSearch;
