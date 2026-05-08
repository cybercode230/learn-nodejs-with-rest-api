import { useState, useCallback, useEffect } from 'react';
import api from '../../../api/axios';
import { ENDPOINTS } from '../../../api/endpoints';
import { useAuth } from '../../../contexts/AuthContext';
import type { User } from '../../../shared/types';

interface ProfileData {
  name?: string;
  email?: string;
  phone?: string;
  bio?: string;
  location?: string;
  language?: string;
  currency?: string;
  timezone?: string;
}

/**
 * File: useProfile.ts
 * What it is doing: Manages user profile data fetching, updating, and avatar management.
 * Responsibility: Connecting the frontend settings to the /api/v1/profile and /api/v1/users endpoints.
 * Outcomes: Real-time profile updates, secure avatar uploads, and consistent user data across the app.
 */
export const useProfile = () => {
  const { user, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(ENDPOINTS.PROFILE.BASE);
      setProfile(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch profile');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (data: ProfileData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.put(ENDPOINTS.PROFILE.BASE, data);
      setProfile(response.data);
      await refreshUser(); // Refresh global user state
      return { success: true, data: response.data };
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to update profile';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  }, [refreshUser]);

  const uploadAvatar = useCallback(async (file: File) => {
    if (!user?.id) return { success: false, error: 'User not found' };
    
    setIsLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await api.post(ENDPOINTS.USERS.AVATAR(user.id), formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      await refreshUser();
      return { success: true, user: response.data.user };
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to upload avatar';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, refreshUser]);

  const deleteAvatar = useCallback(async () => {
    if (!user?.id) return { success: false, error: 'User not found' };

    setIsLoading(true);
    setError(null);
    try {
      await api.delete(ENDPOINTS.USERS.AVATAR(user.id));
      await refreshUser();
      return { success: true };
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to delete avatar';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, refreshUser]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    isLoading,
    error,
    updateProfile,
    uploadAvatar,
    deleteAvatar,
    refreshProfile: fetchProfile
  };
};
