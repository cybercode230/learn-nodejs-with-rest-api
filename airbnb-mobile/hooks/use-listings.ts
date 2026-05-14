import { useState, useMemo } from 'react';
import listingsData from '../constants/listings.json';

export interface Amenity {
  id: string;
  name: string;
  icon: string;
}

export interface Review {
  id: string;
  user: string;
  rating: number;
  date: string;
  comment: string;
}

export interface Listing {
  id: string;
  name: string;
  location: string;
  type: string;
  category: string;
  price: number;
  rating: number;
  reviewsCount: number;
  image: string;
  description: string;
  distance: string;
  dates: string;
  host: {
    name: string;
    image: string;
    yearsHosting: number;
    isSuperhost: boolean;
  };
  details: {
    guests: number;
    bedrooms: number;
    beds: number;
    baths: number;
  };
  amenities: Amenity[];
  aiSummary: string;
  reviews: Review[];
  relatedIds: string[];
}

import { useSearch } from './use-search';

/**
 * Custom hook to manage and fetch listing data with filtering.
 */
export function useListings() {
  const { searchQuery } = useSearch();
  const [listings] = useState<Listing[]>(listingsData as Listing[]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading] = useState(false); // Static loading state for now

  const filteredListings = useMemo(() => {
    let result = listings;
    
    if (selectedCategory) {
      result = result.filter((l) => l.category === selectedCategory);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((l) => 
        l.name.toLowerCase().includes(query) || 
        l.location.toLowerCase().includes(query) ||
        l.type.toLowerCase().includes(query)
      );
    }
    
    return result;
  }, [listings, selectedCategory, searchQuery]);

  const getListingById = (id: string | string[] | undefined) => {
    return listings.find((item) => item.id === id);
  };

  const getRelatedListings = (relatedIds: string[]) => {
    return listings.filter((item) => relatedIds.includes(item.id));
  };

  return {
    listings: filteredListings,
    allListings: listings,
    selectedCategory,
    setSelectedCategory,
    loading,
    getListingById,
    getRelatedListings,
  };
}

/**
 * Helper hook to get a single listing and its related items.
 */
export function useListingDetail(id: string | string[] | undefined) {
  const { allListings, getRelatedListings } = useListings();
  
  const listing = useMemo(() => allListings.find(l => l.id === id), [id, allListings]);
  const relatedListings = useMemo(() => 
    listing ? getRelatedListings(listing.relatedIds) : [], 
    [listing, getRelatedListings]
  );

  return {
    listing,
    relatedListings,
    loading: !listing,
  };
}
