/**
 * useSearch Hook
 * 
 * This hook serves as the orchestrator for all search-related activities across the platform.
 * It abstracts the complexity of switching between AI-driven natural language search,
 * traditional structured search (NormalSearch), and geographic exploration (MapSearch).
 * 
 * It coordinates with ListingContext to ensure the global state remains synchronized 
 * regardless of the entry point for the search.
 */

import { useState, useCallback } from 'react';
import { useListings } from '../../../contexts/ListingContext';
import { useNavigate } from 'react-router-dom';

export type SearchMode = 'AI' | 'NORMAL' | 'MAP';

export const useSearch = () => {
  const { searchListings, aiSearchListings, loading, filters } = useListings();
  const [mode, setMode] = useState<SearchMode>('NORMAL');
  const navigate = useNavigate();

  /**
   * Executes a search based on the current mode and input data.
   * Handles navigation to the results page upon completion.
   */
  const executeSearch = useCallback(async (input: string | Record<string, any>) => {
    // 1. Handle AI Mode (Natural Language String)
    if (mode === 'AI' && typeof input === 'string') {
      await aiSearchListings(input);
      navigate('/search-results');
      return;
    }

    // 2. Handle Normal/Map Mode (Structured Object)
    const searchParams = typeof input === 'string' ? { location: input } : input;
    await searchListings(searchParams);
    
    // Only navigate if we're not already on the map explorer or if explicitly requested
    if (window.location.pathname !== '/search-results') {
      navigate('/search-results');
    }
  }, [mode, aiSearchListings, searchListings, navigate]);

  /**
   * Specifically handles geographic-focused searches triggered by map interactions.
   * Maintains the user's presence on the map while updating listing markers.
   */
  const executeMapSearch = useCallback(async (location: string) => {
    await searchListings({ location });
    // No navigation here as we want the user to stay on the map view
  }, [searchListings]);

  /**
   * Toggles between search modes and resets relevant UI states
   */
  const switchMode = useCallback((newMode: SearchMode) => {
    setMode(newMode);
  }, []);

  return {
    // State
    loading,
    filters,
    mode,
    
    // Actions
    executeSearch,
    executeMapSearch,
    switchMode,
    
    // Helpers
    isAiMode: mode === 'AI',
    isMapMode: mode === 'MAP',
    isNormalMode: mode === 'NORMAL'
  };
};
