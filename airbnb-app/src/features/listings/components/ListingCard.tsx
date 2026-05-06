import React, { useState } from 'react';
import { Star, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Listing } from '../../../shared/types';
import { Link, useNavigate } from 'react-router-dom';
import { useListings } from '../../../contexts/ListingContext';
import { useAuth } from '../../../contexts/AuthContext';

interface ListingCardProps {
  listing: Listing;
  variant?: 'compact' | 'search';
}

const ListingCard: React.FC<ListingCardProps> = ({ listing, variant = 'compact' }) => {
  const { savedListings, toggleSaved } = useListings();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const isSaved = savedListings.includes(listing.id);

  const getFallbackImage = () => {
    const typeImages: Record<string, string> = {
      HOUSE: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1080&auto=format&fit=crop',
      APARTMENT: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1080&auto=format&fit=crop',
      VILLA: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?q=80&w=1080&auto=format&fit=crop',
      CABIN: 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?q=80&w=1080&auto=format&fit=crop',
    };
    return typeImages[listing.type] || typeImages.HOUSE;
  };

  const images = listing.photos && listing.photos.length > 0 
    ? listing.photos.map(p => p.url) 
    : [getFallbackImage()];

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      // Redirect to login with the current listing ID to redirect back later
      navigate(`/login?redirect=/listings/${listing.id}&action=favorite`);
      return;
    }
    
    toggleSaved(listing.id);
  };

  if (variant === 'search') {
    return (
      <Link to={`/listings/${listing.id}`} className="flex flex-col gap-3 group animate-fade-in">
        <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden shadow-sm">
          <img src={images[currentImageIndex]} alt={listing.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          
          <div className="absolute inset-0 flex items-center justify-between p-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={prevImage} className="p-1.5 rounded-full bg-white/90 shadow-md hover:bg-white"><ChevronLeft size={16} strokeWidth={3} /></button>
            <button onClick={nextImage} className="p-1.5 rounded-full bg-white/90 shadow-md hover:bg-white"><ChevronRight size={16} strokeWidth={3} /></button>
          </div>

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentImageIndex ? 'bg-white scale-110' : 'bg-white/60'}`} />
            ))}
          </div>

          <button 
            className="absolute top-3 right-3 p-2 rounded-full transition-all z-10"
            onClick={handleFavoriteClick}
          >
            <Heart size={20} className={isSaved ? 'fill-airbnb text-airbnb' : 'text-white/90 stroke-[2px] drop-shadow-md'} />
          </button>
        </div>

        <div className="px-1 space-y-1">
          <div className="flex justify-between items-start">
            <h3 className="font-black text-[16px] text-gray-900 truncate flex-1 pr-4">{listing.title}</h3>
            <div className="flex items-center gap-1 text-[15px]">
              <Star size={14} className="fill-current" />
              <span className="font-medium">{listing.rating || 'New'}</span>
            </div>
          </div>
          <p className="text-[14px] text-gray-500 font-medium truncate italic">
            {listing.type} in {listing.location}
          </p>
          <p className="text-[14px] text-gray-500 line-clamp-1 leading-snug">
            {listing.description}
          </p>
          <div className="pt-2 flex justify-between items-baseline border-t border-gray-50">
            <div>
              <span className="font-black text-[16px] text-gray-900">${listing.pricePerNight}</span>
              <span className="text-[15px] text-gray-600 font-medium"> night</span>
            </div>
            <span className="text-[12px] font-black uppercase tracking-widest text-gray-400">
              {listing.guests} guests
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div className="group w-full animate-fade-in">
      <Link to={`/listings/${listing.id}`} className="block">
        <div className="relative aspect-square w-full rounded-2xl overflow-hidden mb-3 shadow-sm">
          <img
            src={images[currentImageIndex]}
            alt={listing.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {listing._count && listing._count.bookings > 0 && (
            <div className="absolute top-3 left-3 bg-white/95 px-3 py-1 rounded-full text-[10px] font-black shadow-sm text-gray-900 uppercase tracking-tighter">
              Guest Favorite
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-between p-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={prevImage} className="p-1.5 rounded-full bg-white/90 shadow-md hover:bg-white"><ChevronLeft size={14} strokeWidth={3} /></button>
            <button onClick={nextImage} className="p-1.5 rounded-full bg-white/90 shadow-md hover:bg-white"><ChevronRight size={14} strokeWidth={3} /></button>
          </div>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentImageIndex ? 'bg-white scale-110' : 'bg-white/60'}`} />
            ))}
          </div>
          <button className="absolute top-3 right-3 p-2 rounded-full transition-all z-10" onClick={handleFavoriteClick}>
            <Heart size={20} className={isSaved ? 'fill-airbnb text-airbnb' : 'text-white/90 stroke-[2px] drop-shadow-md'} />
          </button>
        </div>
        <div className="space-y-0.5 px-0.5">
          <div className="flex justify-between items-start">
            <h3 className="font-black text-[15px] text-gray-900 truncate">
              {listing.type.toLowerCase()} in {listing.location.split(',').shift()}
            </h3>
            <div className="flex items-center gap-1 text-[14px]">
              <Star size={14} className="fill-current" />
              <span className="font-medium">{listing.rating || 'New'}</span>
            </div>
          </div>
          <p className="text-[14px] text-gray-500 font-medium truncate">{listing.title}</p>
          <div className="mt-1">
            <span className="font-black text-[15px] text-gray-900">${listing.pricePerNight}</span>
            <span className="text-[15px] text-gray-600 font-medium"> night</span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ListingCard;