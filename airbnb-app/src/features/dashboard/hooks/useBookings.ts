// features/dashboard/hooks/useBookings.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../api/axios';
import { ENDPOINTS } from '../../../api/endpoints';
import { useAuth } from '../../../contexts/AuthContext';
import type { Booking, BookingStatus } from '../../../shared/types';

/**
 * File: useBookings.ts
 * What it is doing: Manages booking data fetching and status updates.
 * Responsibility: Connecting the dashboard to user-specific booking endpoints.
 * Outcomes: Real-time booking lists for both guests and hosts (with backend support).
 */
export const useBookings = (scope: 'me' | 'all' = 'all') => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const role = user?.role || 'GUEST';

  // Fetch bookings based on role and scope
  const { 
    data, 
    isLoading, 
    error 
  } = useQuery<{ data: Booking[]; meta: any }>({
    queryKey: ['bookings', role, user?.id, scope],
    queryFn: async () => {
      if (!user?.id) return { data: [], meta: { total: 0 } };
      
      let url = ENDPOINTS.USERS.BOOKINGS(user.id);
      
      if (role === 'HOST') {
        // For hosts, 'me' means my trips, 'all' means guests booking my places
        url = scope === 'all' ? ENDPOINTS.USERS.HOST_BOOKINGS(user.id) : ENDPOINTS.USERS.BOOKINGS(user.id);
      } else if (role === 'ADMIN') {
        url = scope === 'all' ? ENDPOINTS.BOOKINGS.BASE : ENDPOINTS.USERS.HOST_BOOKINGS(user.id);
      }
      
      const response = await api.get(url);
      const bookingData = response.data.data || response.data || [];
      const meta = response.data.meta || { total: Array.isArray(bookingData) ? bookingData.length : 0 };
      
      return { 
        data: Array.isArray(bookingData) ? bookingData : [], 
        meta 
      };
    },
    enabled: !!user,
  });

  const bookings = data?.data || [];
  const meta = data?.meta || { total: 0 };

  // Update booking status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: BookingStatus }) => {
      const response = await api.patch(ENDPOINTS.BOOKINGS.STATUS(id), { status });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });

  // Delete booking mutation (Soft cancel)
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(ENDPOINTS.BOOKINGS.BY_ID(id));
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });

  const getBookingStats = () => {
    const total = meta.total || bookings.length;
    const confirmed = bookings.filter(b => b.status === 'CONFIRMED').length;
    const pending = bookings.filter(b => b.status === 'PENDING').length;
    const cancelled = bookings.filter(b => b.status === 'CANCELLED').length;
    const completed = bookings.filter(b => b.status === 'COMPLETED').length;
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    
    return {
      total,
      confirmed,
      pending,
      cancelled,
      completed,
      totalRevenue,
    };
  };

  return {
    bookings,
    isLoading,
    isUpdating: updateStatusMutation.isPending || deleteMutation.isPending,
    error: error ? (error as any).message : null,
    hasPermission: role === 'HOST' || role === 'ADMIN',
    
    // Methods
    updateBookingStatus: (id: string, status: BookingStatus) => 
      updateStatusMutation.mutateAsync({ id, status }),
    deleteBooking: (id: string) => deleteMutation.mutateAsync(id),
    getBookingStats,
  };
};