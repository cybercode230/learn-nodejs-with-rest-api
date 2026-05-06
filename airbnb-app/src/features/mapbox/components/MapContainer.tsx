// // MapContainer.tsx
// import React, { useState } from 'react';
// // ✅ CORRECT IMPORTS for react-map-gl v8+
// import Map from 'react-map-gl/mapbox';
// import { Marker, Popup, NavigationControl } from 'react-map-gl';
// import 'mapbox-gl/dist/mapbox-gl.css';
// import type { Listing } from '../../types';

// interface MapContainerProps {
//   listings: Listing[];
// }

// const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

// const MapContainer: React.FC<MapContainerProps> = ({ listings }) => {
//   const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

//   // If your listings don't have coordinates yet, you'll need to add them
//   // or use a default center point
//   const defaultCenter = { longitude: 30.0619, latitude: -1.9441 };

//   return (
//     <div className="w-full h-full relative">
//       <Map
//         initialViewState={{
//           longitude: defaultCenter.longitude,
//           latitude: defaultCenter.latitude,
//           zoom: 12
//         }}
//         style={{ width: '100%', height: '100%' }}
//         mapStyle="mapbox://styles/mapbox/streets-v12" // Updated to v12
//         mapboxAccessToken={MAPBOX_TOKEN}
//       >
//         <NavigationControl position="bottom-right" />

//         {listings.map((listing) => (
//           <Marker
//             key={listing.id}
//             // ⚠️ You need to add coordinates to your Listing type!
//             // For now, using default center as placeholder
//             longitude={listing.longitude || defaultCenter.longitude}
//             latitude={listing.latitude || defaultCenter.latitude}
//             anchor="bottom"
//             onClick={(e) => {
//               // In v8+, the event handling is different
//               e.originalEvent.stopPropagation();
//               setSelectedListing(listing);
//             }}
//           >
//             <div className="bg-white border border-light-gray rounded-full px-2 py-1 shadow-md hover:scale-110 transition-transform cursor-pointer font-bold text-sm">
//               ${listing.pricePerNight}
//             </div>
//           </Marker>
//         ))}

//         {selectedListing && (
//           <Popup
//             anchor="top"
//             longitude={selectedListing.longitude || defaultCenter.longitude}
//             latitude={selectedListing.latitude || defaultCenter.latitude}
//             onClose={() => setSelectedListing(null)}
//             closeButton={false}
//             className="rounded-xl overflow-hidden"
//           >
//             <div className="w-64">
//               {selectedListing.photos?.[0]?.url && (
//                 <img 
//                   src={selectedListing.photos[0].url} 
//                   alt={selectedListing.title} 
//                   className="w-full h-32 object-cover rounded-t-xl"
//                 />
//               )}
//               <div className="p-3">
//                 <h3 className="font-semibold text-sm truncate">{selectedListing.title}</h3>
//                 <p className="text-gray-text text-xs">{selectedListing.location}</p>
//                 <p className="mt-1 font-bold">${selectedListing.pricePerNight} / night</p>
//               </div>
//             </div>
//           </Popup>
//         )}
//       </Map>
//     </div>
//   );
// };

// export default MapContainer;