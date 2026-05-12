import { useState, useEffect } from 'react';
import type { Listing } from '../../../shared/types';
import api from '../../../api/axios';
import { ENDPOINTS } from '../../../api/endpoints';

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
        const listingRes = await api.get(ENDPOINTS.LISTINGS.DETAILS(id));
        const listingData = listingRes.data;
        setListing(listingData);

        // 2. Fetch Reviews
        const reviewsRes = await api.get(ENDPOINTS.LISTINGS.REVIEWS(id));
        setReviews(reviewsRes.data.data || []);

        // 3. Fetch Nearby Listings (Related by location, price, and type)
        const locationQuery = listingData.location.split(',')[0];
        const minP = Math.max(0, listingData.pricePerNight - 200);
        const maxP = listingData.pricePerNight + 200;
        
        let nearbyRes = await api.get(`${ENDPOINTS.LISTINGS.SEARCH}?location=${locationQuery}&minPrice=${minP}&maxPrice=${maxP}&limit=8`);
        
        // Fallback: If no nearby stays in that location/price, get anything in that location
        if (!nearbyRes.data.data || nearbyRes.data.data.length <= 1) {
          nearbyRes = await api.get(`${ENDPOINTS.LISTINGS.SEARCH}?location=${locationQuery}&limit=8`);
        }
        
        // Final Fallback: Just get some interesting listings
        if (!nearbyRes.data.data || nearbyRes.data.data.length <= 1) {
          nearbyRes = await api.get(`${ENDPOINTS.LISTINGS.SEARCH}?limit=8`);
        }

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

  const submitReview = async (rating: number, comment: string) => {
    if (!id) return { success: false, error: 'Listing ID not found' };
    try {
      const response = await api.post(ENDPOINTS.LISTINGS.REVIEWS(id), { rating, comment });
      setReviews(prev => [response.data, ...prev]);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || 'Failed to submit review' };
    }
  };

  const fetchReviewSummary = async () => {
    if (!id) return null;
    try {
      const response = await api.get(ENDPOINTS.AI.REVIEW_SUMMARY(id));
      return response.data.summary;
    } catch (err) {
      console.error('Failed to fetch AI summary:', err);
      return null;
    }
  };

  return { 
    listing, 
    reviews, 
    nearbyListings, 
    loading, 
    error, 
    setReviews, 
    submitReview, 
    fetchReviewSummary 
  };
};
