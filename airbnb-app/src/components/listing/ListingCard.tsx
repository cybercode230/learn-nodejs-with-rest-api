// src/components/listing/ListingCard.tsx
import React, { useState } from 'react';
import { Star, Heart, Image as ImageIcon } from 'lucide-react';
import type { Listing } from '../../types';
import { Link } from 'react-router-dom';
import ImageGalleryModal from '../models/ImageGalleryModal';

interface ListingCardProps {
  listing: Listing;
}

const ListingCard: React.FC<ListingCardProps> = ({ listing }) => {
  const [showGallery, setShowGallery] = useState(false);
  const [galleryStartIndex, setGalleryStartIndex] = useState(0);

  // Get all images for gallery
  const getAllImages = () => {
    const fallbackImages = [
      getFallbackImage(),
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1080&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1080&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?q=80&w=1080&auto=format&fit=crop',
    ];
    
    if (listing.photos && listing.photos.length > 0) {
      return listing.photos.map(p => p.url);
    }
    return fallbackImages;
  };

  const getFallbackImage = () => {
    const typeImages: Record<string, string> = {
      HOUSE: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1080&auto=format&fit=crop',
      APARTMENT: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1080&auto=format&fit=crop',
      VILLA: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?q=80&w=1080&auto=format&fit=crop',
      CABIN: 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?q=80&w=1080&auto=format&fit=crop',
    };
    return typeImages[listing.type] || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1080&auto=format&fit=crop';
  };

  const imageUrl = listing.photos && listing.photos.length > 0 
    ? listing.photos[0]?.url 
    : getFallbackImage();

  const handleImageClick = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    setGalleryStartIndex(index);
    setShowGallery(true);
  };

  return (
    <>
      <Link to={`/listings/${listing.id}`} className="group flex flex-col gap-2 cursor-pointer">
        <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-gray-100">
          <img
            src={imageUrl}
            alt={listing.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105 duration-300"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = getFallbackImage();
            }}
          />
          
          {/* Image Gallery Button */}
          <button 
            className="absolute top-3 right-3 bg-black/50 text-white p-1.5 rounded-full hover:bg-black/70 transition-colors backdrop-blur-sm"
            onClick={(e) => handleImageClick(e, 0)}
          >
            <ImageIcon size={16} />
          </button>

          <button 
            className="absolute top-3 left-3 text-white/70 hover:text-red-500 transition-colors"
            onClick={(e) => {
              e.preventDefault();
            }}
          >
            <Heart size={24} fill="rgba(0,0,0,0.5)" />
          </button>
        </div>

        <div className="flex flex-col">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-[15px] truncate pr-2">{listing.location}</h3>
            <div className="flex items-center gap-1 text-[14px]">
              <Star size={12} fill="currentColor" />
              <span>{listing.rating || 'New'}</span>
            </div>
          </div>
          <p className="text-gray-text text-[14px] truncate">{listing.title}</p>
          <p className="text-gray-text text-[14px] capitalize">{listing.type?.toLowerCase() || 'Home'}</p>
          <div className="mt-1">
            <span className="font-semibold">${listing.pricePerNight}</span>
            <span className="text-gray-text font-normal ml-1">night</span>
          </div>
        </div>
      </Link>

      <ImageGalleryModal
        images={getAllImages()}
        initialIndex={galleryStartIndex}
        isOpen={showGallery}
        onClose={() => setShowGallery(false)}
      />
    </>
  );
};

export default ListingCard;