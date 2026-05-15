import { useState, useMemo, useCallback } from 'react';
import listingsData from '../constants/listings.json';

export interface Amenity {
  id: string;
  name: string;
  icon: string;
}

export interface Review {
  id: string;
  user: string;
  userImage?: string;
  rating: number;
  date: string;
  comment: string;
  scores?: {
    cleanliness: number;
    accuracy: number;
    communication: number;
    location: number;
    checkin: number;
    value: number;
  };
}

export interface Listing {
  id: string;
  name: string;
  location: string;
  type: string;
  category: string;
  price: number;
  rating: number;
  reviewsCount: number;
  images: string[];
  coordinates: {
    latitude: number;
    longitude: number;
  };
  description: string;
  distance: string;
  dates: string;
  host: {
    name: string;
    image: string;
    yearsHosting: number;
    isSuperhost: boolean;
  };
  details: {
    guests: number;
    bedrooms: number;
    beds: number;
    baths: number;
  };
  amenities: Amenity[];
  aiSummary: string;
  reviews: Review[];
  relatedIds: string[];
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { useSearch } from './use-search';

/**
 * Custom hook to manage and fetch listing data with filtering.
 */
export function useListings() {
  const { searchQuery } = useSearch();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: fetchResult, isLoading: loading } = useQuery({
    queryKey: ['listings'],
    queryFn: async () => {
      const response = await apiClient.get('/listings');
      return response.data.data; // Assuming API returns { data: [...] }
    },
    staleTime: 1000 * 60 * 5,
  });

  const listings = useMemo(() => {
    if (!Array.isArray(fetchResult)) return [];
    
    return fetchResult.map((apiItem: any) => ({
      id: apiItem.id,
      name: apiItem.title || 'Untitled',
      location: apiItem.location || 'Unknown',
      type: apiItem.type || 'Property',
      category: apiItem.type || 'All',
      price: apiItem.pricePerNight || 0,
      rating: apiItem.rating || 0,
      reviewsCount: apiItem._count?.bookings || 0,
      images: apiItem.images || [
        'https://res.cloudinary.com/dc3xf2utp/image/upload/v1778772612/airbnb/avatars/nq9v9hopevficwybhwjp.jpg'
      ], // Fallback if no images
      coordinates: apiItem.coordinates || { latitude: -1.9403, longitude: 29.8739 }, // Kigali center
      description: apiItem.description || '',
      distance: '2 kilometers away', // Placeholder
      dates: 'Oct 15 - 20', // Placeholder
      host: apiItem.host || { name: 'Host', image: '' },
      details: {
        guests: apiItem.guests || 1,
        bedrooms: 1,
        beds: 1,
        baths: 1,
      },
      amenities: apiItem.amenities?.map((a: string) => ({ id: a, name: a, icon: 'Wifi' })) || [],
      aiSummary: 'A nice place to stay.',
      reviews: [],
      relatedIds: [],
    }));
  }, [fetchResult]);

  const filteredListings = useMemo(() => {
    let result = listings;
    
    if (selectedCategory && selectedCategory !== 'All') {
      result = result.filter((l) => {
        const type = l.type?.toUpperCase() || '';
        const cat = selectedCategory.toUpperCase();
        // Handle pluralization (e.g., VILLA vs VILLAS)
        return type === cat || type + 'S' === cat || type === cat + 'S' || cat.startsWith(type);
      });
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((l) => 
        l.name.toLowerCase().includes(query) || 
        l.location.toLowerCase().includes(query) ||
        l.type.toLowerCase().includes(query)
      );
    }
    
    return result;
  }, [listings, selectedCategory, searchQuery]);

  return {
    listings: filteredListings,
    allListings: listings,
    selectedCategory,
    setSelectedCategory,
    loading,
  };
}

/**
 * Helper hook to get a single listing and its related items.
 */
export function useListingDetail(id: string | string[] | undefined) {
  const { data: listing, isLoading: loading } = useQuery({
    queryKey: ['listing', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await apiClient.get(`/listings/${id}`);
      const data = response.data;
      
      // Map API response to UI Listing format
      return {
        id: data.id,
        name: data.title,
        location: data.location,
        type: data.type,
        category: data.type || 'All',
        price: data.pricePerNight,
        rating: data.rating || 0,
        reviewsCount: data._count?.bookings || 0,
        images: data.photos?.map((p: any) => p.url) || [
          'https://res.cloudinary.com/dc3xf2utp/image/upload/v1778772409/airbnb/listings/sbv9akpcivszrr3rvsy9.jpg'
        ],
        description: data.description,
        coordinates: data.coordinates || { latitude: -1.9403, longitude: 29.8739 },
        distance: '2 kilometers away',
        host: {
          name: data.host?.name || 'Host',
          image: data.host?.avatar || 'https://res.cloudinary.com/dc3xf2utp/image/upload/v1778772612/airbnb/avatars/nq9v9hopevficwybhwjp.jpg',
          yearsHosting: 2,
          isSuperhost: true,
        },
        details: {
          guests: data.guests || 1,
          bedrooms: 1,
          beds: 1,
          baths: 1,
        },
        amenities: data.amenities?.map((a: string) => ({ id: a, name: a, icon: 'Wifi' })) || [],
        aiSummary: 'A stunning location with top-tier amenities.',
        reviews: [], // Will be fetched separately or populated via another query
        relatedIds: [],
        dates: 'Available now',
      };
    },
    enabled: !!id,
  });

  /**
   * Fetch Reviews for Listing
   */
  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ['listing-reviews', id],
    queryFn: async () => {
      if (!id) return [];
      const response = await apiClient.get(`/listings/${id}/reviews`);
      return response.data.map((r: any) => ({
        id: r.id,
        user: r.user?.name || 'Guest',
        userImage: r.user?.avatar,
        rating: r.rating,
        date: new Date(r.createdAt).toLocaleDateString(),
        comment: r.comment,
        scores: r.scores || {
          cleanliness: 5,
          accuracy: 5,
          communication: 5,
          location: 5,
          checkin: 5,
          value: 5,
        },
      }));
    },
    enabled: !!id,
  });

  return {
    listing: listing ? { ...listing, reviews } : null,
    loading: loading || reviewsLoading,
  };
}

/**
 * Hook for Host to manage their own listings
 */
export function useHostListings() {
  const queryClient = useQueryClient();

  const { data: listings = [], isLoading: loading } = useQuery({
    queryKey: ['host-listings'],
    queryFn: async () => {
      const response = await apiClient.get('/listings/host'); // Assuming this endpoint exists for host listings
      return response.data.map((apiItem: any) => ({
        id: apiItem.id,
        name: apiItem.title,
        location: apiItem.location,
        type: apiItem.type,
        price: apiItem.pricePerNight,
        images: apiItem.photos?.map((p: any) => p.url) || [],
        status: apiItem.status || 'ACTIVE',
      }));
    },
  });

  const createListingMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post('/listings', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['host-listings'] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
  });

  const uploadPhotosMutation = useMutation({
    mutationFn: async ({ listingId, photos }: { listingId: string; photos: any[] }) => {
      const formData = new FormData();
      photos.forEach((photo, index) => {
        // @ts-ignore
        formData.append('photos', {
          uri: photo.uri,
          name: photo.name || `photo_${index}.jpg`,
          type: photo.type || 'image/jpeg',
        });
      });

      const response = await apiClient.post(`/listings/${listingId}/photos`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['listing', variables.listingId] });
      queryClient.invalidateQueries({ queryKey: ['host-listings'] });
    },
  });

  const deleteListingMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/listings/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['host-listings'] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
  });

  return {
    listings,
    loading,
    createListing: createListingMutation.mutateAsync,
    uploadPhotos: uploadPhotosMutation.mutateAsync,
    deleteListing: deleteListingMutation.mutateAsync,
    isCreating: createListingMutation.isPending,
    isUploading: uploadPhotosMutation.isPending,
  };
}
