import { useQuery } from '@tanstack/react-query';
import api from '../../../api/axios';
import { ENDPOINTS } from '../../../api/endpoints';
import { useAuth } from '../../../contexts/AuthContext';
import type { Booking, Listing } from '../../../shared/types';

/**
 * File: useDashboardData.ts
 * What it is doing: Provides hooks for dashboard-specific data like stats and recent activity.
 * Responsibility: Fetching aggregated data for the overview page.
 * Outcomes: Real-time dashboard summaries for Guests, Hosts, and Admins.
 */

export const useDashboardStats = () => {
  const { user } = useAuth();
  const role = user?.role || 'GUEST';

  return useQuery({
    queryKey: ['dashboard-stats', role, user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // Admin can access platform-wide stats
      if (role === 'ADMIN') {
        const response = await api.get(`${ENDPOINTS.USERS.BASE}/stats`);
        return response.data;
      }

      // For Hosts and Guests, we calculate or fetch specific stats
      // In a real app, you'd have a backend endpoint like /profile/stats
      // For now, we'll return a placeholder or partial data
      return {
        activeListings: 0,
        earnings: 0,
        avgRating: 4.8,
        upcomingTrips: 0,
        pastBookings: 0,
        savedPlaces: 0,
        unreadMessages: 0
      };
    },
    enabled: !!user,
  });
};

export const useDashboardBookings = () => {
  const { user } = useAuth();
  const role = user?.role || 'GUEST';

  return useQuery<Booking[]>({
    queryKey: ['dashboard-bookings', role, user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      let url = ENDPOINTS.USERS.BOOKINGS(user.id);
      
      if (role === 'HOST') {
        url = ENDPOINTS.USERS.HOST_BOOKINGS(user.id);
      } else if (role === 'ADMIN') {
        url = ENDPOINTS.BOOKINGS.BASE;
      }

      const response = await api.get(url);
      return response.data.data || response.data || [];
    },
    enabled: !!user,
  });
};

export const useDashboardListings = () => {
  const { user } = useAuth();
  const role = user?.role || 'GUEST';

  return useQuery<Listing[]>({
    queryKey: ['dashboard-listings', role, user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      let url = ENDPOINTS.LISTINGS.BASE;
      if (role === 'HOST') {
        url = ENDPOINTS.USERS.LISTINGS(user.id);
      }
      
      const response = await api.get(url);
      return response.data.data || response.data || [];
    },
    enabled: !!user && (role === 'HOST' || role === 'ADMIN'),
  });
};
