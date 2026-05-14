import React, { createContext, useContext, useState, useEffect } from 'react';
import { Listing } from './use-listings';

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
  const [reservations, setReservations] = useState<Reservation[]>(INITIAL_MOCK);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReservations();
  }, []);

  /** Load persisted reservations, fall back to mock data if storage unavailable. */
  const loadReservations = async () => {
    try {
      const stored = await storage.getItem(STORAGE_KEY);
      if (stored) {
        setReservations(JSON.parse(stored));
      } else {
        // Persist the initial mock so future opens restore it
        await storage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MOCK));
      }
    } catch (error) {
      // Keep in-memory defaults — no crash
    } finally {
      setLoading(false);
    }
  };

  /** Add a new reservation and persist it. */
  const addReservation = async (
    listing: Listing,
    checkIn: string,
    checkOut: string,
    guests: number,
  ): Promise<boolean> => {
    try {
      const newReservation: Reservation = {
        id: `res_${Date.now()}`,
        listingId: listing.id,
        name: listing.name,
        location: listing.location,
        image: listing.image,
        checkIn,
        checkOut,
        guests,
        totalPrice: listing.price * 5,
        status: 'upcoming',
        createdAt: new Date().toISOString(),
      };

      // Update in-memory state immediately — UI is always responsive
      setReservations(prev => {
        const updated = [newReservation, ...prev];
        // Persist async, but don't block the UI on it
        storage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });

      return true;
    } catch (error) {
      console.error('Failed to add reservation:', error);
      return false;
    }
  };

  /** Cancel (remove) a reservation by ID. */
  const cancelReservation = async (id: string): Promise<void> => {
    setReservations(prev => {
      const updated = prev.filter(r => r.id !== id);
      storage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <ReservationsContext.Provider value={{ reservations, addReservation, cancelReservation, loading }}>
      {children}
    </ReservationsContext.Provider>
  );
}

export function useReservations() {
  const context = useContext(ReservationsContext);
  if (context === undefined) {
    throw new Error('useReservations must be used within a ReservationsProvider');
  }
  return context;
}
