// features/dashboard/hooks/useListingsManagement.ts
import { useState, useCallback } from 'react';
import api from '../../../api/axios';
import { ENDPOINTS } from '../../../api/endpoints';
import { useAuth } from '../../../contexts/AuthContext';
// import type { ListingPhoto } from '../../../shared/types';

interface UpdateListingData {
  title?: string;
  description?: string;
  pricePerNight?: number;
  guests?: number;
  amenities?: string[];
  location?: string;
  type?: string;
}

// interface UploadPhotoResponse {
//   success: boolean;
//   photo: ListingPhoto;
// }

export const useListingsManagement = () => {
  const { user, token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user has permission (HOST or ADMIN)
  const hasPermission = user?.role === 'HOST' || user?.role === 'ADMIN';

  // Create new listing
  const createListing = useCallback(async (data: UpdateListingData) => {
    if (!hasPermission) {
      setError('You do not have permission to create listings');
      return { success: false, error: 'Permission denied' };
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post(ENDPOINTS.LISTINGS.BASE, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return { success: true, data: response.data };
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create listing';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [hasPermission, token]);

  // Update listing
  const updateListing = useCallback(async (listingId: string, data: UpdateListingData) => {
    if (!hasPermission) {
      setError('You do not have permission to update listings');
      return { success: false, error: 'Permission denied' };
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.put(ENDPOINTS.LISTINGS.DETAILS(listingId), data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return { success: true, data: response.data };
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update listing';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [hasPermission, token]);

  // Delete listing
  const deleteListing = useCallback(async (listingId: string) => {
    if (!hasPermission) {
      setError('You do not have permission to delete listings');
      return { success: false, error: 'Permission denied' };
    }

    setIsLoading(true);
    setError(null);

    try {
      await api.delete(ENDPOINTS.LISTINGS.DETAILS(listingId), {
        headers: { Authorization: `Bearer ${token}` }
      });
      return { success: true };
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to delete listing';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [hasPermission, token]);

  // Upload photos to listing
  const uploadPhotos = useCallback(async (listingId: string, files: File[]): Promise<{ success: boolean; error?: string }> => {
    if (!hasPermission) {
      setError('You do not have permission to upload photos');
      return { success: false, error: 'Permission denied' };
    }

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    files.forEach(file => formData.append('photos', file));

    try {
      await api.post(ENDPOINTS.LISTINGS.PHOTOS(listingId), formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      return { success: true };
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to upload photos';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [hasPermission, token]);

  // Generate AI description
  const generateDescription = useCallback(async (listingId: string, tone: 'professional' | 'casual' | 'enthusiastic' = 'professional') => {
    if (!hasPermission) return { success: false, error: 'Permission denied' };
    
    setIsLoading(true);
    try {
      const response = await api.post(`/ai/listings/${listingId}/generate-description`, { tone }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return { success: true, description: response.data.description };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || 'AI generation failed' };
    } finally {
      setIsLoading(false);
    }
  }, [hasPermission, token]);

  // Delete photo from listing
  const deletePhoto = useCallback(async (listingId: string, photoId: string) => {
    if (!hasPermission) {
      setError('You do not have permission to delete photos');
      return { success: false, error: 'Permission denied' };
    }

    setIsLoading(true);
    setError(null);

    try {
      await api.delete(ENDPOINTS.LISTINGS.PHOTO(listingId, photoId), {
        headers: { Authorization: `Bearer ${token}` }
      });
      return { success: true };
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to delete photo';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [hasPermission, token]);

  // Get listing reviews
  const getReviews = useCallback(async (listingId: string, page: number = 1, limit: number = 10) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get(ENDPOINTS.LISTINGS.REVIEWS(listingId), {
        params: { page, limit }
      });
      return { success: true, data: response.data };
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch reviews';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    createListing,
    updateListing,
    deleteListing,
    uploadPhotos,
    generateDescription,
    deletePhoto,
    getReviews,
    isLoading,
    error,
    hasPermission,
  };
};