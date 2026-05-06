// src/pages/listings/ListingDetailsPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Listing } from '../../types';
import api from '../../api/axios';
import { Star, Share, Heart, MapPin, Shield, Wifi, Car, Home, Bath, Wind, Coffee, Check, ChevronLeft } from 'lucide-react';
import ImageGalleryModal from '../../components/models/ImageGalleryModal';


const ListingDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showGallery, setShowGallery] = useState(false);
  const [galleryStartIndex, setGalleryStartIndex] = useState(0);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/listings/${id}`);
        setListing(response.data);
        setError(null);
      } catch (error: any) {
        console.error('Failed to fetch listing:', error);
        if (error.response?.status === 404) {
          setError('Listing not found');
        } else {
          setError('Failed to load listing details');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchListing();
    }
  }, [id]);

  // Get icon for amenity
  const getAmenityIcon = (amenity: string) => {
    const amenityMap: Record<string, any> = {
      'WiFi': Wifi,
      'Parking': Car,
      'Kitchen': Home,
      'Pool': Coffee,
      'Air Conditioning': Wind,
      'Washing Machine': Bath,
    };
    const IconComponent = amenityMap[amenity];
    return IconComponent ? <IconComponent size={20} /> : <Check size={20} />;
  };
  const getAllImages = () => {
    const fallbackImages = [
      getImageUrl(0),
      getImageUrl(1),
      getImageUrl(2),
      getImageUrl(3),
      getImageUrl(4),
    ].filter(img => img);

    if (listing.photos && listing.photos.length > 0) {
      return listing.photos.map(p => p.url);
    }
    return fallbackImages;
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="container mx-auto px-4 md:px-8 lg:px-24 py-8 max-w-7xl">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[450px] rounded-xl overflow-hidden mb-12">
            <div className="col-span-2 row-span-2 bg-gray-200"></div>
            <div className="col-span-1 row-span-1 bg-gray-200"></div>
            <div className="col-span-1 row-span-1 bg-gray-200"></div>
            <div className="col-span-1 row-span-1 bg-gray-200"></div>
            <div className="col-span-1 row-span-1 bg-gray-200"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="h-32 bg-gray-200 rounded mb-8"></div>
              <div className="h-24 bg-gray-200 rounded mb-8"></div>
            </div>
            <div className="lg:col-span-1">
              <div className="h-96 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !listing) {
    return (
      <div className="container mx-auto px-4 md:px-8 lg:px-24 py-20 max-w-7xl text-center">
        <div className="text-6xl mb-4">🏠</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Listing Not Found</h2>
        <p className="text-gray-600 mb-6">{error || "The listing you're looking for doesn't exist or has been removed."}</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-airbnb text-white rounded-xl font-semibold hover:bg-airbnb-dark transition-colors"
        >
          Back to Home
        </button>
      </div>
    );
  }

  // Get fallback images if photos array is empty
  const getImageUrl = (index: number) => {
    if (listing.photos && listing.photos.length > index && listing.photos[index]?.url) {
      return listing.photos[index].url;
    }
    // Fallback images based on listing type
    const fallbackImages = {
      HOUSE: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1080&auto=format&fit=crop',
      APARTMENT: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1080&auto=format&fit=crop',
      VILLA: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?q=80&w=1080&auto=format&fit=crop',
      CABIN: 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?q=80&w=1080&auto=format&fit=crop',
    };
    return fallbackImages[listing.type as keyof typeof fallbackImages] || fallbackImages.HOUSE;
  };

  return (
    <div className="container mx-auto px-4 md:px-8 lg:px-24 py-8 max-w-7xl">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 mb-6 text-gray-700 hover:text-black transition-colors group"
      >
        <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
        <span className="font-medium">Back</span>
      </button>

      {/* Title and Share/Save */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4">
        <div>
          <h1 className="text-[26px] font-semibold">{listing.title}</h1>
          <div className="flex items-center gap-4 text-sm font-semibold mt-1 flex-wrap">
            <div className="flex items-center gap-1">
              <Star size={14} fill="currentColor" />
              <span>{listing.rating || 'New'}</span>
            </div>
            <span className="underline cursor-pointer">{listing.location}</span>
            {listing.guests && (
              <div className="flex items-center gap-1">
                <span>•</span>
                <span>{listing.guests} guests</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors underline font-semibold text-sm">
            <Share size={16} /> Share
          </button>
          <button className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors underline font-semibold text-sm">
            <Heart size={16} /> Save
          </button>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="grid grid-cols-2 md:grid-cols-4 grid-rows-2 gap-2 h-[300px] md:h-[450px] rounded-xl overflow-hidden mb-12">
        <div
          className="col-span-2 row-span-2 relative"
          onClick={() => {
            setGalleryStartIndex(0);
            setShowGallery(true);
          }}
        >
          <img
            src={getImageUrl(0)}
            alt={listing.title}
            className="w-full h-full object-cover hover:brightness-90 transition-all cursor-pointer"
          />
        </div>
        <div className="col-span-1 row-span-1 hidden md:block">
          <img
            src={getImageUrl(1)}
            alt="Second"
            className="w-full h-full object-cover hover:brightness-90 transition-all cursor-pointer"
          />
        </div>
        <div className="col-span-1 row-span-1 hidden md:block">
          <img
            src={getImageUrl(2)}
            alt="Third"
            className="w-full h-full object-cover hover:brightness-90 transition-all cursor-pointer"
          />
        </div>
        <div className="col-span-1 row-span-1 hidden md:block">
          <img
            src={getImageUrl(3)}
            alt="Fourth"
            className="w-full h-full object-cover hover:brightness-90 transition-all cursor-pointer"
          />
        </div>
        <div className="col-span-1 row-span-1 hidden md:block">
          <img
            src={getImageUrl(4)}
            alt="Fifth"
            className="w-full h-full object-cover hover:brightness-90 transition-all cursor-pointer"
          />
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Details */}
        <div className="lg:col-span-2">
          <div className="flex flex-col sm:flex-row justify-between items-start pb-8 border-b border-gray-200 gap-4">
            <div>
              <h2 className="text-2xl font-semibold">
                Entire {listing.type?.toLowerCase() || 'home'} hosted by {listing.host?.name || 'Host'}
              </h2>
              <p className="text-gray-600 mt-1">
                {listing.guests} guests · {listing.amenities?.length || 0} amenities
              </p>
            </div>
            <div className="w-14 h-14 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
              {listing.host?.avatar ? (
                <img src={listing.host.avatar} alt={listing.host.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl bg-airbnb text-white">
                  {listing.host?.name?.[0] || 'H'}
                </div>
              )}
            </div>
          </div>

          <div className="py-8 border-b border-gray-200 space-y-6">
            <div className="flex gap-4">
              <MapPin size={24} className="flex-shrink-0 text-gray-700" />
              <div>
                <h3 className="font-semibold">Great location</h3>
                <p className="text-gray-600 text-sm">Located in {listing.location}</p>
              </div>
            </div>
            <div className="flex gap-4">
              <Shield size={24} className="flex-shrink-0 text-gray-700" />
              <div>
                <h3 className="font-semibold">Designed for living</h3>
                <p className="text-gray-600 text-sm">This home is perfect for long stays, with everything you need to feel at home.</p>
              </div>
            </div>
          </div>

          <div className="py-8 border-b border-gray-200">
            <h2 className="text-2xl font-semibold mb-4">About this place</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">
              {listing.description}
            </p>
          </div>

          <div className="py-8">
            <h2 className="text-2xl font-semibold mb-6">What this place offers</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {listing.amenities?.map((amenity) => (
                <div key={amenity} className="flex items-center gap-3 text-gray-700">
                  {getAmenityIcon(amenity)}
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Booking Widget */}
        <div className="lg:col-span-1">
          <div className="sticky top-28 p-6 border border-gray-200 rounded-2xl shadow-xl space-y-4 bg-white">
            <div className="flex justify-between items-end">
              <div>
                <span className="text-2xl font-bold">${listing.pricePerNight}</span>
                <span className="text-gray-600 ml-1">night</span>
              </div>
              <div className="flex items-center gap-1 text-sm font-semibold">
                <Star size={14} fill="currentColor" />
                <span>{listing.rating || 'New'}</span>
              </div>
            </div>

            <div className="border border-gray-300 rounded-xl overflow-hidden">
              <div className="grid grid-cols-2 border-b border-gray-300">
                <div className="p-3 border-r border-gray-300">
                  <label className="text-[10px] font-bold uppercase text-gray-600">Check-in</label>
                  <p className="text-sm text-gray-400">Add date</p>
                </div>
                <div className="p-3">
                  <label className="text-[10px] font-bold uppercase text-gray-600">Checkout</label>
                  <p className="text-sm text-gray-400">Add date</p>
                </div>
              </div>
              <div className="p-3">
                <label className="text-[10px] font-bold uppercase text-gray-600">Guests</label>
                <p className="text-sm text-gray-400">1 guest</p>
              </div>
            </div>

            <button className="w-full bg-airbnb hover:bg-airbnb-dark text-white font-bold py-3.5 rounded-xl transition-colors">
              Reserve
            </button>

            <p className="text-center text-sm text-gray-500 mt-4">You won't be charged yet</p>
          </div>
        </div>
      </div>
      <ImageGalleryModal
        images={getAllImages()}
        initialIndex={galleryStartIndex}
        isOpen={showGallery}
        onClose={() => setShowGallery(false)}
      />
    </div>
  );
};

export default ListingDetailsPage;