// features/dashboard/hooks/useBookings.ts
import { useState, useCallback, useEffect } from 'react';
import api from '../../../api/axios';
import { ENDPOINTS } from '../../../api/endpoints';
import { useAuth } from '../../../contexts/AuthContext';
import type { Booking, BookingStatus } from '../../../shared/types';

export const useBookings = () => {
  const { user, token } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user has permission (HOST or ADMIN)
  const hasPermission = user?.role === 'HOST' || user?.role === 'ADMIN';

  // Fetch all bookings
  const fetchBookings = useCallback(async () => {
    if (!hasPermission) {
      setError('You do not have permission to view bookings');
      return { success: false, error: 'Permission denied' };
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.get(ENDPOINTS.BOOKINGS.BASE, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const fetchedBookings = response.data.data || [];
      setBookings(fetchedBookings);
      return { success: true, data: fetchedBookings };
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch bookings';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [hasPermission, token]);

  // Fetch bookings for a specific listing
  const fetchBookingsByListing = useCallback(async (listingId: string) => {
    if (!hasPermission) {
      setError('You do not have permission to view bookings');
      return { success: false, error: 'Permission denied' };
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.get(`${ENDPOINTS.BOOKINGS.BASE}/listing/${listingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return { success: true, data: response.data.data || [] };
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch bookings for listing';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [hasPermission, token]);

  // Update booking status
  const updateBookingStatus = useCallback(async (bookingId: string, status: BookingStatus) => {
    if (!hasPermission) {
      setError('You do not have permission to update bookings');
      return { success: false, error: 'Permission denied' };
    }

    setIsUpdating(true);
    setError(null);
    
    try {
      const response = await api.patch(
        ENDPOINTS.BOOKINGS.STATUS(bookingId),
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local state
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status }
          : booking
      ));
      
      return { success: true, data: response.data };
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update booking status';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsUpdating(false);
    }
  }, [hasPermission, token]);

  // Bulk update booking status
  const bulkUpdateStatus = useCallback(async (bookingIds: string[], status: BookingStatus) => {
    if (!hasPermission) {
      setError('You do not have permission to update bookings');
      return { success: false, error: 'Permission denied' };
    }

    setIsUpdating(true);
    setError(null);
    
    const results = await Promise.allSettled(
      bookingIds.map(id => updateBookingStatus(id, status))
    );
    
    const succeeded = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failed = results.length - succeeded;
    
    setIsUpdating(false);
    
    return { 
      success: failed === 0, 
      succeeded, 
      failed,
      message: `Updated ${succeeded} booking${succeeded !== 1 ? 's' : ''}${failed > 0 ? `, ${failed} failed` : ''}`
    };
  }, [hasPermission, updateBookingStatus]);

  // Delete a booking
  const deleteBooking = useCallback(async (bookingId: string) => {
    if (!hasPermission) {
      setError('You do not have permission to delete bookings');
      return { success: false, error: 'Permission denied' };
    }

    setIsUpdating(true);
    setError(null);
    
    try {
      const response = await api.delete(ENDPOINTS.BOOKINGS.BY_ID(bookingId), {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state
      setBookings(prev => prev.filter(booking => booking.id !== bookingId));
      
      return { success: true, data: response.data };
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to delete booking';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsUpdating(false);
    }
  }, [hasPermission, token]);

  // Get booking statistics
  const getBookingStats = useCallback(() => {
    const total = bookings.length;
    const confirmed = bookings.filter(b => b.status === 'CONFIRMED').length;
    const pending = bookings.filter(b => b.status === 'PENDING').length;
    const cancelled = bookings.filter(b => b.status === 'CANCELLED').length;
    const totalRevenue = bookings.reduce((sum, b) => sum + b.totalPrice, 0);
    
    return {
      total,
      confirmed,
      pending,
      cancelled,
      totalRevenue,
      conversionRate: total > 0 ? (confirmed / total) * 100 : 0,
    };
  }, [bookings]);

  // Get bookings for current user (host) or all if admin
  const getUserBookings = useCallback(() => {
    if (!user) return [];
    
    if (user.role === 'ADMIN') {
      return bookings;
    }
    
    // For HOST, return bookings for their listings
    return bookings;
  }, [bookings, user]);

  // Auto-fetch bookings on mount if user has permission
  useEffect(() => {
    if (hasPermission && token) {
      fetchBookings();
    }
  }, [hasPermission, token, fetchBookings]);

  return {
    // State
    bookings,
    isLoading,
    isUpdating,
    error,
    hasPermission,
    
    // Methods
    fetchBookings,
    fetchBookingsByListing,
    updateBookingStatus,
    bulkUpdateStatus,
    deleteBooking,
    getBookingStats,
    getUserBookings,
  };
};