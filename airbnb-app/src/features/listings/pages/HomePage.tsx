import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import { SearchContainer } from '../../search';
import { useListings } from '../../../contexts/ListingContext';
import ListingSection from '../components/ListingSection';
import ListingCard from '../components/ListingCard';
import ContinueSearching from '../components/ContinueSearching';
import { Button } from '../../../shared/components';
import { ChevronDown, Sparkles, Star } from 'lucide-react';

const HomePage: React.FC = () => {
  const { listings, loading, searchListings } = useListings();
  const [visibleCount, setVisibleCount] = useState(8);
  const [loadingMore, setLoadingMore] = useState(false);

  // 1. New Arrivals Logic
  const newArrivals = useMemo(() => {
    const sevenDaysAgo = dayjs().subtract(7, 'days');
    return listings
      .filter(l => dayjs(l.createdAt).isAfter(sevenDaysAgo))
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

  // 3. Main Grid Logic - Always show full listings on home page
  const exploreStays = useMemo(() => {
    return listings.slice(0, visibleCount);
  }, [listings, visibleCount]);

  const hasMore = visibleCount < listings.length;

  const handleLoadMore = () => {
    setLoadingMore(true);
    setTimeout(() => {
      setVisibleCount(prev => prev + 12);
      setLoadingMore(false);
    }, 800);
  };

  const handleCategoryClick = (category: string, value: string) => {
    if (category === 'location') {
      searchListings({ location: value });
    } else if (category === 'type') {
      searchListings({ type: value as any });
    }
    window.scrollTo({ top: 700, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top Hero Section */}
      <div className="relative w-full pt-8 pb-12">
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
          
          <ContinueSearching />

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

          {/* Aggregator Cards */}
          <ListingSection 
            title="Start your journey here"
            listings={listings}
            loading={loading}
            variant="discovery"
            onCategoryClick={handleCategoryClick}
            onSeeAll={() => handleCategoryClick('location', '')}
          />

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
          <div className="pt-12">
            <div className="flex flex-col mb-8">
              <h2 className="text-[26px] font-black text-gray-900 tracking-tighter">Explore everything</h2>
              <p className="text-gray-500 font-bold text-[11px] tracking-tight mt-1 italic">Handpicked unique stays for you</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-x-5 gap-y-10">
              {exploreStays.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
            
            {hasMore ? (
              <div className="mt-20 flex flex-col items-center gap-6 py-16 bg-gray-50/30 rounded-[3rem] border border-gray-100/50">
                <div className="flex flex-col items-center gap-3">
                  <p className="text-gray-500 text-[11px] font-bold tracking-tight">
                    Showing {exploreStays.length} of {listings.length} properties
                  </p>
                  <div className="w-48 h-1 bg-gray-100 rounded-full overflow-hidden">
                     <motion.div 
                       initial={{ width: 0 }}
                       animate={{ width: `${(exploreStays.length / listings.length) * 100}%` }}
                       className="h-full bg-airbnb"
                     />
                  </div>
                </div>
                <Button 
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="px-12 py-5 rounded-full bg-gray-900 text-white font-black hover:bg-black transition-all shadow-xl active:scale-95 disabled:opacity-70 group"
                  rightIcon={loadingMore ? null : <ChevronDown size={20} className="group-hover:translate-y-1 transition-transform" />}
                >
                  {loadingMore ? (
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Discovering more...</span>
                    </div>
                  ) : "Load more unique stays"}
                </Button>
              </div>
            ) : (
              <div className="mt-20 flex flex-col items-center gap-8 py-20 border-t border-gray-100">
                <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-300">
                  <Sparkles size={32} />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-black text-gray-900">You've seen everything!</h3>
                  <p className="text-gray-500 text-sm font-medium">Check back later for fresh new arrivals or try a different search.</p>
                </div>
                <div className="flex gap-4">
                  <Button 
                    variant="outline" 
                    className="rounded-full px-8 py-4 border-2"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  >
                    Back to Top
                  </Button>
                  <Button 
                    className="rounded-full px-8 py-4 bg-airbnb text-white"
                    onClick={() => searchListings({})}
                  >
                    Refresh Stays
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;