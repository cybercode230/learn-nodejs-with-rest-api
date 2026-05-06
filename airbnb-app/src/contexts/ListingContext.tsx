import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Listing, ListingType } from '../shared/types';
import api from '../api/axios';
import { ENDPOINTS } from '../api/endpoints';

interface Filters {
  location: string;
  type: ListingType | '';
  minPrice: string;
  maxPrice: string;
  guests: string;
}

interface ListingContextType {
  listings: Listing[];
  filteredListings: Listing[];
  savedListings: string[];
  loading: boolean;
  filters: Filters;
  setFilters: (filters: Filters) => void;
  toggleSaved: (id: string) => void;
  refreshListings: () => Promise<void>;
  searchListings: (queryFilters: Partial<Filters>) => Promise<void>;
  aiSearchListings: (query: string) => Promise<void>;
}

const ListingContext = createContext<ListingContextType | undefined>(undefined);

export const ListingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [savedListings, setSavedListings] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    location: '',
    type: '',
    minPrice: '',
    maxPrice: '',
    guests: '1',
  });

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(ENDPOINTS.LISTINGS.BASE);
      const data = response.data.data || [];
      setListings(data);
      setFilteredListings(data);
    } catch (error) {
      console.error('Failed to fetch listings:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchListings();
    const saved = localStorage.getItem('savedListings');
    if (saved) {
      setSavedListings(JSON.parse(saved));
    }
  }, [fetchListings]);

  const toggleSaved = (id: string) => {
    setSavedListings(prev => {
      const isSaved = prev.includes(id);
      const updated = isSaved ? prev.filter(item => item !== id) : [...prev, id];
      localStorage.setItem('savedListings', JSON.stringify(updated));
      return updated;
    });
  };

  const searchListings = useCallback(async (queryFilters: Partial<Filters>) => {
    const newFilters = { ...filters, ...queryFilters };
    setFilters(newFilters);
    setLoading(true);

    try {
      const params = new URLSearchParams();
      if (newFilters.location) params.append('location', newFilters.location);
      if (newFilters.type) params.append('type', newFilters.type);
      if (newFilters.minPrice) params.append('minPrice', newFilters.minPrice);
      if (newFilters.maxPrice) params.append('maxPrice', newFilters.maxPrice);
      if (newFilters.guests) params.append('guests', newFilters.guests);
      params.append('page', '1');
      params.append('limit', '20');

      const response = await api.get(`${ENDPOINTS.LISTINGS.SEARCH}?${params.toString()}`);
      // The backend returns { data: [...], meta: {...} }
      setFilteredListings(response.data.data || []);
    } catch (error) {
      console.error('Search failed:', error);
      // Local fallback
      const filtered = listings.filter(listing => {
        const matchesLocation = !newFilters.location || 
          listing.location.toLowerCase().includes(newFilters.location.toLowerCase()) ||
          listing.title.toLowerCase().includes(newFilters.location.toLowerCase());
        const matchesType = !newFilters.type || listing.type === newFilters.type;
        const matchesGuests = !newFilters.guests || listing.guests >= Number(newFilters.guests);
        return matchesLocation && matchesType && matchesGuests;
      });
      setFilteredListings(filtered);
    } finally {
      setLoading(false);
    }
  }, [listings, filters]);

  const aiSearchListings = useCallback(async (query: string) => {
    setLoading(true);
    try {
      const response = await api.post(ENDPOINTS.AI.SEARCH, { query });
      const { data, filters: aiFilters } = response.data;
      
      // Update listings with AI results
      setFilteredListings(data || []);
      
      // Sync filters if AI returned them
      if (aiFilters) {
        setFilters({
          location: aiFilters.location || '',
          type: aiFilters.type || '',
          minPrice: aiFilters.minPrice?.toString() || '',
          maxPrice: aiFilters.maxPrice?.toString() || '',
          guests: aiFilters.guests?.toString() || '1',
        });
      }
    } catch (error) {
      console.error('AI Search failed:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <ListingContext.Provider value={{
      listings,
      filteredListings,
      savedListings,
      loading,
      filters,
      setFilters,
      toggleSaved,
      refreshListings: fetchListings,
      searchListings,
      aiSearchListings
    }}>
      {children}
    </ListingContext.Provider>
  );
};

export const useListings = () => {
  const context = useContext(ListingContext);
  if (context === undefined) {
    throw new Error('useListings must be used within a ListingProvider');
  }
  return context;
};
