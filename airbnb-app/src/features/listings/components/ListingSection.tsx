import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Listing } from '../../../shared/types';
import ListingCard from './ListingCard';

interface ListingSectionProps {
  title: React.ReactNode;
  listings: Listing[];
  loading?: boolean;
  variant?: 'horizontal' | 'grid';
  onSeeAll?: () => void;
}

const ListingSection: React.FC<ListingSectionProps> = ({
  title,
  listings,
  loading,
  variant = 'horizontal',
  onSeeAll
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Filter listings for sections (User requested only if similr of three at leas)
  // But we allow grid variant to show everything
  const displayListings = variant === 'horizontal' ? listings.slice(0, 10) : listings;

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth * 0.8 : scrollLeft + clientWidth * 0.8;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  // Only show horizontal sections if there are at least 3 listings (as requested)
  if (variant === 'horizontal' && listings.length < 3 && !loading) return null;

  if (variant === 'grid') {
    return (
      <div className="py-4">
        <div className="flex items-center gap-3 mb-8">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">{title}</h2>
          {onSeeAll && (
            <button 
              onClick={onSeeAll}
              className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-x-6 gap-y-10">
          {loading ? (
            Array(12).fill(0).map((_, i) => <SkeletonCard key={i} />)
          ) : (
            listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="py-4 relative group/section">
      <div className="flex items-center justify-between mb-8 px-1">
        <div className="flex items-center gap-4">
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">{title}</h2>
          <div className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center bg-gray-50/50">
            <ChevronRight size={20} className="text-gray-400" />
          </div>
        </div>
        
        {/* Grouped Navigation Chevrons on the Right */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => scroll('left')}
            className="w-10 h-10 rounded-full border border-gray-200 bg-white shadow-sm hover:shadow-md hover:bg-gray-50 transition-all flex items-center justify-center"
          >
            <ChevronLeft size={18} strokeWidth={2.5} />
          </button>
          <button 
            onClick={() => scroll('right')}
            className="w-10 h-10 rounded-full border border-gray-200 bg-white shadow-sm hover:shadow-md hover:bg-gray-50 transition-all flex items-center justify-center"
          >
            <ChevronRight size={18} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <div className="relative">
        <div 
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {loading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="min-w-[280px] max-w-[280px] snap-start">
                <SkeletonCard />
              </div>
            ))
          ) : (
            <>
              {displayListings.map((listing) => (
                <div key={listing.id} className="min-w-[240px] sm:min-w-[280px] max-w-[300px] snap-start">
                  <ListingCard listing={listing} />
                </div>
              ))}
              {listings.length >= 8 && (
                <div className="min-w-[280px] max-w-[280px] snap-start">
                  <div 
                    onClick={onSeeAll}
                    className="aspect-square bg-gray-50 rounded-[2.5rem] border border-gray-100 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-all group/seeall"
                  >
                    <div className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center mb-4 group-hover/seeall:scale-110 transition-transform">
                      <ChevronRight size={24} className="text-airbnb" />
                    </div>
                    <span className="font-black text-base text-gray-900">Show all</span>
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Stays</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const SkeletonCard = () => (
  <div className="animate-pulse w-full">
    <div className="aspect-square bg-gray-100 rounded-xl mb-3"></div>
    <div className="h-4 bg-gray-100 rounded w-3/4 mb-2"></div>
    <div className="h-3 bg-gray-100 rounded w-1/2"></div>
  </div>
);

export default ListingSection;
