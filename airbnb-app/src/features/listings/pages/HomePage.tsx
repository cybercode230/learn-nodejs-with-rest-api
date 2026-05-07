import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import { SearchContainer } from '../../search';
import { useListings } from '../../../contexts/ListingContext';
import ListingSection from '../components/ListingSection';
import ContinueSearching from '../components/ContinueSearching';
import { Button } from '../../../shared/components';
import { ChevronDown, Sparkles } from 'lucide-react';

const HomePage: React.FC = () => {
  const { listings, loading } = useListings();
  const [visibleCount, setVisibleCount] = useState(10);

  // 1. New Arrivals Logic (Created within last 3 days)
  // We use dayjs to compare the listing's createdAt with current time
  const newArrivals = useMemo(() => {
    const threeDaysAgo = dayjs().subtract(3, 'days');
    return listings
      .filter(l => dayjs(l.createdAt).isAfter(threeDaysAgo))
      .sort((a, b) => dayjs(b.createdAt).diff(dayjs(a.createdAt))) // Most recent first
      .slice(0, 10);
  }, [listings]);

  // 2. Regional Grouping (Africa vs Global)
  // Dynamically segment listings based on location keywords to provide curated discovery rows
  const groupedSections = useMemo(() => {
    const africanCountries = ['Rwanda', 'Kenya', 'Tanzania', 'Uganda', 'Ethiopia', 'Nigeria', 'South Africa', 'Ghana'];
    
    const africa = listings.filter(l => 
      africanCountries.some(country => l.location.toLowerCase().includes(country.toLowerCase()))
    );
    
    const global = listings.filter(l => 
      !africanCountries.some(country => l.location.toLowerCase().includes(country.toLowerCase()))
    );

    return { africa, global };
  }, [listings]);

  // 3. Load More / Pagination Logic
  // Initially show 10, then allow user to load 10 more at a time
  const exploreStays = useMemo(() => {
    return listings.slice(0, visibleCount);
  }, [listings, visibleCount]);

  const hasMore = visibleCount < listings.length;

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 10);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top Hero Section */}
      <div className="relative w-full pt-12 pb-20">
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[120%] bg-airbnb/5 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[100%] bg-blue-400/5 blur-[100px] rounded-full animate-pulse delay-700" />
          <div className="absolute inset-0 opacity-[0.03]" 
            style={{ backgroundImage: 'radial-gradient(#ff385c 0.5px, transparent 0.5px)', backgroundSize: '32px 32px' }} 
          />
        </div>

        <div className="container mx-auto px-4 md:px-8 lg:px-12 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <SearchContainer />
          </motion.div>
        </div>
      </div>

      {/* Discovery Rows Section */}
      <div className="container mx-auto px-4 md:px-8 lg:px-12 pb-32">
        <div className="max-w-[1600px] mx-auto space-y-4">
          
          {/* SECTION: Continue Searching */}
          <ContinueSearching />

          {/* SECTION: New Arrivals */}
          {newArrivals.length > 0 && (
            <div className="relative">
              <ListingSection 
                title={
                  <div className="flex items-center gap-3">
                    <Sparkles className="text-airbnb" size={24} />
                    <span>New arrivals</span>
                    <span className="text-xs bg-airbnb/10 text-airbnb px-3 py-1 rounded-full font-bold">Last 72 hours</span>
                  </div>
                }
                listings={newArrivals}
                loading={loading}
                variant="horizontal"
              />
            </div>
          )}

          {/* SECTION: African Escapes */}
          <ListingSection 
            title="Explore Africa"
            listings={groupedSections.africa.slice(0, 10)}
            loading={loading}
            variant="horizontal"
          />

          {/* SECTION: Global Stays */}
          <ListingSection 
            title="Global getaways"
            listings={groupedSections.global.slice(0, 10)}
            loading={loading}
            variant="horizontal"
          />

          {/* SECTION: Explore all stays with LOAD MORE */}
          <div className="pt-12 border-t border-gray-100">
            <ListingSection 
              title="Explore all stays"
              listings={exploreStays}
              loading={loading}
              variant="grid"
            />
            
            {hasMore && !loading && (
              <div className="mt-16 flex flex-col items-center gap-6">
                <p className="text-gray-400 text-sm font-medium">
                  Showing {exploreStays.length} of {listings.length} stays
                </p>
                <Button 
                  onClick={handleLoadMore}
                  variant="outline"
                  className="px-12 py-6 rounded-full border-2 border-gray-900 text-gray-900 font-black hover:bg-gray-900 hover:text-white transition-all group shadow-xl"
                  rightIcon={<ChevronDown className="group-hover:translate-y-1 transition-transform" />}
                >
                  Load more stays
                </Button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default HomePage;