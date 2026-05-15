import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface WishlistItem {
  id: string;
  listingId: string;
  name: string;
  location: string;
  image: string;
  images?: string[];
  price: number;
  rating: number;
  savedAt: string; // ISO Date
  dates: string;
  coordinates?: { latitude: number, longitude: number };
}

export interface WishlistCategory {
  id: string;
  name: string;
  items: WishlistItem[];
}

interface WishlistContextType {
  wishlists: WishlistCategory[];
  addToWishlist: (listing: any, categoryName: string) => void;
  removeFromWishlist: (listingId: string) => void;
  createCategory: (name: string) => void;
  isSaved: (listingId: string) => boolean;
  getCategoryForItem: (listingId: string) => string | null;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const WISHLIST_STORAGE_KEY = 'airbnb_wishlists';

// Default categories
const DEFAULT_CATEGORIES: WishlistCategory[] = [
  { id: '1', name: 'Nice', items: [] },
  { id: '2', name: 'Chill', items: [] },
];

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlists, setWishlists] = useState<WishlistCategory[]>(DEFAULT_CATEGORIES);

  // Load from AsyncStorage on mount
  useEffect(() => {
    const loadWishlists = async () => {
      try {
        const saved = await AsyncStorage.getItem(WISHLIST_STORAGE_KEY);
        if (saved) {
          setWishlists(JSON.parse(saved));
        }
      } catch (error) {
        // Fallback for environment where AsyncStorage might fail (like during native module linking issues)
        console.warn('AsyncStorage not available, using in-memory storage');
      }
    };
    loadWishlists();
  }, []);

  // Save to AsyncStorage whenever wishlists change
  useEffect(() => {
    const saveWishlists = async () => {
      try {
        await AsyncStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlists));
      } catch (error) {
        // Fail silently or handle error
      }
    };
    saveWishlists();
  }, [wishlists]);

  const addToWishlist = useCallback((listing: any, categoryName: string) => {
    setWishlists(prev => {
      const categoryExists = prev.find(c => c.name === categoryName);
      
      const newItem: WishlistItem = {
        id: Math.random().toString(36).substr(2, 9),
        listingId: listing.id,
        name: listing.name,
        location: listing.location,
        image: listing.images?.[0] || listing.image,
        images: listing.images,
        price: listing.price,
        rating: listing.rating,
        savedAt: new Date().toISOString(),
        dates: listing.dates || 'Any dates',
        coordinates: listing.coordinates,
      };

      if (categoryExists) {
        return prev.map(c => 
          c.name === categoryName 
            ? { ...c, items: [...c.items, newItem] }
            : c
        );
      } else {
        const newCategory: WishlistCategory = {
          id: Math.random().toString(36).substr(2, 9),
          name: categoryName,
          items: [newItem],
        };
        return [...prev, newCategory];
      }
    });
  }, []);

  const removeFromWishlist = useCallback((listingId: string) => {
    setWishlists(prev => prev.map(c => ({
      ...c,
      items: c.items.filter(item => item.listingId !== listingId)
    })));
  }, []);

  const createCategory = useCallback((name: string) => {
    setWishlists(prev => {
      if (prev.find(c => c.name === name)) return prev;
      return [...prev, { id: Math.random().toString(36).substr(2, 9), name, items: [] }];
    });
  }, []);

  const isSaved = useCallback((listingId: string) => {
    return wishlists.some(c => c.items.some(item => item.listingId === listingId));
  }, [wishlists]);

  const getCategoryForItem = useCallback((listingId: string) => {
    const cat = wishlists.find(c => c.items.some(item => item.listingId === listingId));
    return cat ? cat.name : null;
  }, [wishlists]);

  return (
    <WishlistContext.Provider value={{ 
      wishlists, 
      addToWishlist, 
      removeFromWishlist, 
      createCategory, 
      isSaved,
      getCategoryForItem 
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
