/**
 * File: useDashboardData.ts
 * What it is doing: Provides hooks for dashboard-specific data like stats and recent activity.
 * Responsibility: Fetching aggregated data for the overview page.
 * Outcomes: Real-time dashboard summaries for Guests, Hosts, and Admins.
 */

import { useQuery } from '@tanstack/react-query';
import api from '../../../api/axios';
import { ENDPOINTS } from '../../../api/endpoints';
import { useAuth } from '../../../contexts/AuthContext';
import type { Booking, Listing } from '../../../shared/types';

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

      // Fetch bookings to calculate stats
      let url = ENDPOINTS.USERS.BOOKINGS(user.id);
      if (role === 'HOST') url = ENDPOINTS.USERS.HOST_BOOKINGS(user.id);
      const bookingRes = await api.get(url);
      const bookings: Booking[] = bookingRes.data.data || bookingRes.data || [];

      if (role === 'GUEST') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return {
          upcomingTrips: bookings.filter(b => {
            const checkOutDate = new Date(b.checkOut);
            checkOutDate.setHours(0, 0, 0, 0);
            return checkOutDate >= today && b.status !== 'CANCELLED' && b.status !== 'REJECTED';
          }).length,
          pastBookings: bookings.filter(b => {
            const checkOutDate = new Date(b.checkOut);
            checkOutDate.setHours(0, 0, 0, 0);
            return checkOutDate < today && b.status !== 'CANCELLED' && b.status !== 'REJECTED';
          }).length,
          savedPlaces: 0, // Mock for now
          unreadMessages: 0 // Mock for now
        };
      }

      if (role === 'HOST') {
        const listingsRes = await api.get(ENDPOINTS.USERS.LISTINGS(user.id), { params: { limit: 1 } });
        const totalListings = listingsRes.data.meta?.total || (Array.isArray(listingsRes.data) ? listingsRes.data.length : listingsRes.data.data?.length || 0);
        
        return {
          activeListings: totalListings,
          earnings: bookings.filter(b => b.status === 'CONFIRMED' || b.status === 'COMPLETED').reduce((sum, b) => sum + (b.totalPrice || 0), 0),
          avgRating: 4.9, // Mock for now
          pendingApprovals: bookings.filter(b => b.status === 'PENDING').length
        };
      }

      return null;
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
        url = ENDPOINTS.USERS.HOST_BOOKINGS(user.id);
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
