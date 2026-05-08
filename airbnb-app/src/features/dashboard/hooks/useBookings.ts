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
export const useBookings = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const role = user?.role || 'GUEST';

  // Fetch bookings based on role
  const { 
    data: bookings = [], 
    isLoading, 
    error 
  } = useQuery<Booking[]>({
    queryKey: ['bookings', role, user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      let url = ENDPOINTS.USERS.BOOKINGS(user.id);
      
      if (role === 'HOST') {
        url = ENDPOINTS.USERS.HOST_BOOKINGS(user.id);
      } else if (role === 'ADMIN') {
        url = ENDPOINTS.BOOKINGS.BASE;
      }
      
      const response = await api.get(url);
      // Backend returns { data: [...], meta: {...} } for paginated results
      return response.data.data || response.data || [];
    },
    enabled: !!user,
  });

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
    const total = bookings.length;
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