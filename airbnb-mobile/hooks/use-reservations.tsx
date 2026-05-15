import React, { createContext, useContext, useState, useEffect } from 'react';
import { Listing } from './use-listings';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { useAuth } from './use-auth';

export interface Reservation {
  id: string;
  listingId: string;
  name: string;
  location: string;
  image: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: 'upcoming' | 'finished' | 'cancelled';
  createdAt: string;
}

interface ReservationsContextType {
  reservations: Reservation[];
  addReservation: (listing: Listing, checkIn: string, checkOut: string, guests: number) => Promise<boolean>;
  cancelReservation: (id: string) => Promise<void>;
  loading: boolean;
}

const ReservationsContext = createContext<ReservationsContextType | undefined>(undefined);

const STORAGE_KEY = 'airbnb_reservations';

/**
 * Safe AsyncStorage wrapper — falls back silently to in-memory only
 * when the native module is unavailable (e.g. Expo Go without native build).
 */
const storage = {
  async getItem(key: string): Promise<string | null> {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      return await AsyncStorage.getItem(key);
    } catch {
      return null;
    }
  },
  async setItem(key: string, value: string): Promise<void> {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.setItem(key, value);
    } catch {
      // Silently ignore — in-memory state is the source of truth
    }
  },
};

/** Initial mock data shown before user makes real bookings */
const INITIAL_MOCK: Reservation[] = [
  {
    id: 'res_1',
    listingId: '1',
    name: 'Luxury Villa with Volcano View',
    location: 'Musanze, Rwanda',
    image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914',
    checkIn: 'Aug 15, 2026',
    checkOut: 'Aug 20, 2026',
    guests: 2,
    totalPrice: 1250,
    status: 'upcoming',
    createdAt: new Date().toISOString(),
  },
];

export function ReservationsProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  /**
   * Fetch Real Bookings (Reservations)
   */
  const { data: reservations = [], isLoading: loading } = useQuery({
    queryKey: ['reservations'],
    queryFn: async () => {
      const response = await apiClient.get('/bookings');
      // Map API response to UI format
      return response.data.map((b: any) => ({
        id: b.id,
        listingId: b.listingId,
        name: b.listing?.title || 'Trip',
        location: b.listing?.location || 'Unknown',
        image: b.listing?.photos?.[0]?.url || 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914',
        checkIn: new Date(b.checkIn).toLocaleDateString(),
        checkOut: new Date(b.checkOut).toLocaleDateString(),
        guests: 1,
        totalPrice: b.totalPrice,
        status: b.status.toLowerCase(),
        createdAt: b.createdAt,
      }));
    },
    enabled: !!user,
  });

  /**
   * Add Reservation (POST /api/v1/bookings)
   */
  const bookingMutation = useMutation({
    mutationFn: async ({ listingId, checkIn, checkOut }: any) => {
      const response = await apiClient.post('/bookings', {
        listingId,
        checkIn,
        checkOut,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
    },
  });

  const addReservation = async (
    listing: Listing,
    checkIn: string,
    checkOut: string,
    guests: number,
  ): Promise<boolean> => {
    try {
      await bookingMutation.mutateAsync({
        listingId: listing.id,
        checkIn,
        checkOut,
      });
      return true;
    } catch (error) {
      console.error('Failed to add reservation:', error);
      return false;
    }
  };

  /** Cancel (not implemented in API yet, but kept as stub) */
  const cancelReservation = async (id: string): Promise<void> => {
    console.warn('Cancel reservation not implemented in API');
  };

  return (
    <ReservationsContext.Provider value={{ reservations, addReservation, cancelReservation, loading }}>
      {children}
    </ReservationsContext.Provider>
  );
}

/**
 * Hook for Host to manage received reservations
 */
export function useReceivedReservations() {
  const queryClient = useQueryClient();

  const { data: reservations = [], isLoading: loading } = useQuery({
    queryKey: ['received-reservations'],
    queryFn: async () => {
      const response = await apiClient.get('/bookings/host'); // Assuming this endpoint for host bookings
      return response.data.map((b: any) => ({
        id: b.id,
        listingId: b.listingId,
        listingName: b.listing?.title || 'Trip',
        guestName: b.user?.name || 'Guest',
        guestAvatar: b.user?.avatar,
        checkIn: new Date(b.checkIn).toLocaleDateString(),
        checkOut: new Date(b.checkOut).toLocaleDateString(),
        totalPrice: b.totalPrice,
        status: b.status.toLowerCase(), // confirmed, pending, cancelled
        createdAt: b.createdAt,
      }));
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await apiClient.patch(`/bookings/${id}/status`, { status });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['received-reservations'] });
    },
  });

  return {
    reservations,
    loading,
    confirmReservation: (id: string) => updateStatusMutation.mutateAsync({ id, status: 'CONFIRMED' }),
    cancelReservation: (id: string) => updateStatusMutation.mutateAsync({ id, status: 'CANCELLED' }),
    isUpdating: updateStatusMutation.isPending,
  };
}

export function useReservations() {
  const context = useContext(ReservationsContext);
  if (context === undefined) {
    throw new Error('useReservations must be used within a ReservationsProvider');
  }
  return context;
}
