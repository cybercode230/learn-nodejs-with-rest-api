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
  searchHistory: Filters[];
  clearSearchHistory: () => void;
  aiMessage: string | null;
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
  const [searchHistory, setSearchHistory] = useState<Filters[]>([]);
  const [aiMessage, setAiMessage] = useState<string | null>(null);

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
    
    // Load history from localStorage initially
    const history = localStorage.getItem('searchHistory');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }

    // If authenticated, sync history from server
    const syncHistory = async () => {
      try {
        const response = await api.get(ENDPOINTS.LISTINGS.SEARCH + '/history');
        if (response.data && response.data.length > 0) {
          // Merge or replace with server history
          setSearchHistory(response.data);
          localStorage.setItem('searchHistory', JSON.stringify(response.data));
        }
      } catch (error) {
        console.error('Failed to sync search history:', error);
      }
    };

    // We check for token in localStorage or context (assuming useAuth is available or we check api defaults)
    if (localStorage.getItem('token')) {
      syncHistory();
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
      
      // Save to discovery history
      saveSearchToHistory(newFilters);
    } catch (error) {
      console.error('Search failed:', error);
      setFilteredListings([]);
    } finally {
      setLoading(false);
    }
  }, [listings, filters]);

  const aiSearchListings = useCallback(async (query: string) => {
    setLoading(true);
    setAiMessage(null);
    try {
      const response = await api.post(ENDPOINTS.AI.SEARCH, { query });
      const { data, filters: aiFilters, message } = response.data;
      
      // Update listings with AI results
      setFilteredListings(data || []);
      
      if (message) {
        setAiMessage(message);
      }
      
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
    } catch (error: any) {
      console.error('AI Search failed:', error);
      setFilteredListings([]);
      setAiMessage(error.response?.data?.message || "Sorry, I'm not being able to process the request due to I don't have that data");
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Orchestrates the persistence of search filters to local storage
   * and prepares for server-side synchronization.
   */
  const saveSearchToHistory = useCallback(async (newFilters: Filters) => {
    // 1. Update local state immediately
    setSearchHistory(prev => {
      const exists = prev.find(h => 
        h.location === newFilters.location && 
        h.guests === newFilters.guests &&
        h.type === newFilters.type
      );
      if (exists) return prev;
      
      const updated = [newFilters, ...prev].slice(0, 5);
      localStorage.setItem('searchHistory', JSON.stringify(updated));
      return updated;
    });
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
      aiSearchListings,
      searchHistory,
      aiMessage,
      clearSearchHistory: () => {
        setSearchHistory([]);
        localStorage.removeItem('searchHistory');
      }
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
