import { useState, useEffect } from 'react';
import type { Listing } from '../../../shared/types';
import api from '../../../api/axios';

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  guest: {
    name: string;
    avatar: string | null;
    location?: string;
    yearsOnAirbnb?: string;
  };
}

export const useListingDetails = (id: string | undefined) => {
  const [listing, setListing] = useState<Listing | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [nearbyListings, setNearbyListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        // 1. Fetch Main Listing
        const listingRes = await api.get(`/listings/${id}`);
        const listingData = listingRes.data;
        setListing(listingData);

        // 2. Fetch Reviews
        const reviewsRes = await api.get(`/listings/${id}/reviews`);
        setReviews(reviewsRes.data.data || []);

        // 3. Fetch Nearby Listings (same location, similar price)
        const nearbyRes = await api.get(`/listings/search?location=${listingData.location.split(',')[0]}&limit=4`);
        setNearbyListings(nearbyRes.data.data?.filter((l: Listing) => l.id !== id) || []);

        setError(null);
      } catch (err: any) {
        console.error('Failed to fetch details:', err);
        setError(err.response?.status === 404 ? 'Listing not found' : 'Failed to load details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  return { listing, reviews, nearbyListings, loading, error, setReviews };
};
