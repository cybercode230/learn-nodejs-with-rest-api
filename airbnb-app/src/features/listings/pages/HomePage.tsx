import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import { SearchContainer } from '../../search';
import { useListings } from '../../../contexts/ListingContext';
import ListingSection from '../components/ListingSection';
import ListingCard from '../components/ListingCard';
import ContinueSearching from '../components/ContinueSearching';

import { Sparkles, Star, ChevronDown } from 'lucide-react';

const HomePage: React.FC = () => {
  const { listings, loading } = useListings();
  const [visibleCount, setVisibleCount] = useState(12);
  const [loadingMore, setLoadingMore] = useState(false);

  // 1. New Arrivals Logic
  const newArrivals = useMemo(() => {
    const threeDaysAgo = dayjs().subtract(3, 'days');
    return listings
      .filter(l => dayjs(l.createdAt).isAfter(threeDaysAgo))
      .sort((a, b) => dayjs(b.createdAt).diff(dayjs(a.createdAt)))
      .slice(0, 8);
  }, [listings]);

  // 2. Guest Favorites
  const guestFavorites = useMemo(() => {
    return listings
      .filter(l => (l.rating || 0) >= 4.8)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 8);
  }, [listings]);

  // 3. Trending Logic
  const trending = useMemo(() => {
    return [...listings]
      .sort((a, b) => (b._count?.bookings || 0) - (a._count?.bookings || 0))
      .slice(0, 8);
  }, [listings]);

  // 4. Main Grid Logic - Always show full listings on home page
  const exploreStays = useMemo(() => {
    return listings.slice(0, visibleCount);
  }, [listings, visibleCount]);

  const hasMore = visibleCount < listings.length;

  const handleLoadMore = () => {
    setLoadingMore(true);
    setTimeout(() => {
      setVisibleCount(prev => prev + 12);
      setLoadingMore(false);
    }, 600);
  };

  // const handleCategoryClick = (category: string, value: string) => {
  //   if (category === 'location') {
  //     searchListings({ location: value });
  //   } else if (category === 'type') {
  //     searchListings({ type: value as any });
  //   }
  //   window.scrollTo({ top: 700, behavior: 'smooth' });
  // };

  return (
    <div className="min-h-screen bg-white">
      {/* Top Hero Section */}
      <div className="relative w-full pt-8 pb-6">
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[120%] bg-airbnb/5 blur-[120px] rounded-full" />
          <div className="absolute inset-0 opacity-[0.02]" 
            style={{ backgroundImage: 'radial-gradient(#ff385c 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }} 
          />
        </div>

        <div className="container mx-auto px-4 md:px-8 lg:px-12 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <SearchContainer />
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 lg:px-12 pb-32">
        <div className="max-w-[1600px] mx-auto space-y-2">
          
          {/* New Arrivals */}
          {newArrivals.length > 0 && (
            <ListingSection 
              title={
                <div className="flex items-center gap-3">
                  <Sparkles className="text-airbnb" size={22} />
                  <span>Fresh arrivals</span>
                  <span className="text-[10px] bg-airbnb/10 text-airbnb px-2 py-0.5 rounded-md font-bold italic tracking-tight">Weekly picks</span>
                </div>
              }
              listings={newArrivals}
              loading={loading}
              variant="horizontal"
            />
          )}

          <ContinueSearching />

          {/* Aggregator Cards - Hidden as requested
          <ListingSection 
            title="Start your journey here"
            listings={listings}
            loading={loading}
            variant="discovery"
            onCategoryClick={handleCategoryClick}
            onSeeAll={() => handleCategoryClick('location', '')}
          />
          */}

          {/* Trending */}
          {trending.length > 0 && (
            <ListingSection 
              title={
                <div className="flex items-center gap-3">
                  <span>Trending now</span>
                </div>
              }
              listings={trending}
              loading={loading}
              variant="horizontal"
            />
          )}

          {/* Guest Favorites */}
          {guestFavorites.length > 0 && (
            <ListingSection 
              title={
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-yellow-400 flex items-center justify-center shadow-sm">
                    <Star size={18} className="text-white fill-white" />
                  </div>
                  <span>Guest favorites</span>
                </div>
              }
              listings={guestFavorites}
              loading={loading}
              variant="horizontal"
            />
          )}

          {/* Main Grid */}
          <div className="pt-4">
            <div className="flex flex-col mb-8">
              <h2 className="text-[26px] font-black text-gray-900 tracking-tighter">Explore everything</h2>
              <p className="text-gray-500 font-bold text-[11px] tracking-tight mt-1 italic">Handpicked unique stays for you</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-x-5 gap-y-10">
              {exploreStays.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
            
            {hasMore && (
              <div className="mt-16 flex flex-col items-center">
                <button 
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="group flex flex-col items-center gap-3 transition-all active:scale-95 disabled:opacity-50"
                >
                  <span className="text-sm font-black text-gray-900 tracking-tight uppercase group-hover:text-airbnb transition-colors">
                    {loadingMore ? 'Discovering...' : 'Show more'}
                  </span>
                  <div className={`w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center bg-white shadow-sm group-hover:shadow-md group-hover:border-airbnb/20 transition-all ${loadingMore ? 'animate-pulse' : ''}`}>
                    {loadingMore ? (
                      <div className="w-4 h-4 border-2 border-airbnb/30 border-t-airbnb rounded-full animate-spin" />
                    ) : (
                      <ChevronDown size={18} className="text-gray-400 group-hover:text-airbnb transition-colors" />
                    )}
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;