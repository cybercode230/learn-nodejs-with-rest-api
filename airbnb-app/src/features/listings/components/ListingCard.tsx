import React, { useState } from 'react';
import { Star, Archive, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Listing } from '../../../shared/types';
import { Link, useNavigate } from 'react-router-dom';
import { useListings } from '../../../contexts/ListingContext';
import { useAuth } from '../../../contexts/AuthContext';

interface ListingCardProps {
  listing: Listing;
}

const ListingCard: React.FC<ListingCardProps> = ({ listing }) => {
  const { savedListings, toggleSaved } = useListings();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const isSaved = savedListings.includes(listing.id);

  const getFallbackImage = () => {
    const typeImages: Record<string, string> = {
      HOUSE: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1000&auto=format&fit=crop',
      APARTMENT: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=1000&auto=format&fit=crop',
      VILLA: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1000&auto=format&fit=crop',
      CABIN: 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?q=80&w=1000&auto=format&fit=crop',
    };
    return typeImages[listing.type] || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1000&auto=format&fit=crop';
  };

  const images = listing.photos && listing.photos.length > 0 
    ? listing.photos.map(p => p.url) 
    : [getFallbackImage()];

  const [imgSrc, setImgSrc] = useState(images[currentImageIndex]);

  const handleImageError = () => {
    setImgSrc(getFallbackImage());
  };

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    const nextIndex = (currentImageIndex + 1) % images.length;
    setCurrentImageIndex(nextIndex);
    setImgSrc(images[nextIndex]);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    const prevIndex = (currentImageIndex - 1 + images.length) % images.length;
    setCurrentImageIndex(prevIndex);
    setImgSrc(images[prevIndex]);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      navigate(`/login?redirect=/listings/${listing.id}&action=favorite`);
      return;
    }
    
    toggleSaved(listing.id);
  };

  const propertyTypeLabel = listing.type.charAt(0) + listing.type.slice(1).toLowerCase();

  return (
    <div className="group w-full animate-fade-in max-w-[280px]">
      <Link to={`/listings/${listing.id}`} className="block">
        <div className="relative aspect-square w-full rounded-2xl overflow-hidden mb-3 shadow-sm border border-gray-100 bg-gray-50">
          <img
            src={imgSrc}
            alt={listing.title}
            onError={handleImageError}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          
          {/* Property Type Tag */}
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-md text-[9px] font-black shadow-sm text-gray-900 uppercase tracking-widest border border-gray-100">
            {propertyTypeLabel}
          </div>

          {listing._count && listing._count.bookings > 10 && (
            <div className="absolute top-10 left-3 bg-airbnb px-2 py-0.5 rounded-md text-[9px] font-black shadow-sm text-white uppercase tracking-widest">
              Guest Favorite
            </div>
          )}

          {images.length > 1 && (
            <div className="absolute inset-0 flex items-center justify-between p-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={prevImage} className="p-1.5 rounded-full bg-white/90 shadow-md hover:bg-white active:scale-90 transition-transform"><ChevronLeft size={14} strokeWidth={3} /></button>
              <button onClick={nextImage} className="p-1.5 rounded-full bg-white/90 shadow-md hover:bg-white active:scale-90 transition-transform"><ChevronRight size={14} strokeWidth={3} /></button>
            </div>
          )}
          
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 items-center">
            {images.length > 1 && images.slice(0, 5).map((_, i) => (
              <div 
                key={i} 
                className={`transition-all duration-300 rounded-full ${
                  i === currentImageIndex 
                    ? 'w-1.5 h-1.5 bg-white scale-110' 
                    : 'w-1 h-1 bg-white/40'
                }`} 
              />
            ))}
          </div>

          <button 
            className="absolute top-3 right-3 p-2 rounded-full transition-all z-10 active:scale-90" 
            onClick={handleFavoriteClick}
          >
            <Archive 
              size={20} 
              className={isSaved ? 'fill-airbnb text-airbnb' : 'text-white/90 stroke-[2px] drop-shadow-md'} 
            />
          </button>
        </div>

        <div className="space-y-0.5 px-0.5">
          <div className="flex justify-between items-start">
            <h3 className="font-black text-[14px] text-gray-900 truncate">
              {listing.location.split(',').shift()}
            </h3>
            <div className="flex items-center gap-1 text-[13px]">
              <Star size={12} className="fill-current" />
              <span className="font-semibold">{listing.rating || 'New'}</span>
            </div>
          </div>
          <p className="text-[14px] text-gray-500 font-medium truncate opacity-70 italic">{listing.title}</p>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="font-black text-[15px] text-gray-900">${listing.pricePerNight}</span>
            <span className="text-[13px] text-gray-500 font-medium tracking-tight">night</span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ListingCard;