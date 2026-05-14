import React, { useRef, useMemo,useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Listing } from '../../../shared/types';
import ListingCard from './ListingCard';

interface ListingSectionProps {
  title: React.ReactNode;
  listings: Listing[];
  loading?: boolean;
  variant?: 'horizontal' | 'grid' | 'discovery';
  onSeeAll?: () => void;
  onCategoryClick?: (category: string, value: string) => void;
}

const CategoryItem: React.FC<{ 
  label: string; 
  image: string; 
  onClick?: () => void;
}> = ({ label, image, onClick }) => {
  const [imgSrc, setImgSrc] = useState(image || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688');
  
  return (
    <div 
      onClick={onClick}
      className="flex flex-col gap-2 cursor-pointer group"
    >
      <div className="aspect-square overflow-hidden rounded-xl bg-gray-50 relative border border-gray-100">
        <img 
          src={imgSrc} 
          onError={() => setImgSrc('https://images.unsplash.com/photo-1502672260266-1c1ef2d93688')}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          alt={label} 
        />
        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
      </div>
      <span className="text-[11px] font-bold text-gray-800 truncate px-1">{label}</span>
    </div>
  );
};

const GroupedAggregatorCard: React.FC<{ 
  title: string; 
  items: { label: string; image: string; value: string }[];
  onItemClick: (value: string) => void;
  onSeeAll?: () => void;
}> = ({ title, items, onItemClick, onSeeAll }) => (
  <div className="flex-1 min-w-[320px] max-w-[400px] bg-white p-6 rounded-[2.5rem] border border-gray-100 flex flex-col snap-start transition-all duration-500">
    <h3 className="text-xl font-black text-gray-900 mb-6 leading-tight tracking-tight">{title}</h3>
    <div className="grid grid-cols-2 gap-x-5 gap-y-6 mb-8">
      {items.slice(0, 4).map((item, idx) => (
        <CategoryItem 
          key={idx} 
          label={item.label} 
          image={item.image} 
          onClick={() => onItemClick(item.value)}
        />
      ))}
    </div>
    <button 
      onClick={onSeeAll}
      className="text-[12px] font-bold text-airbnb hover:underline text-left mt-auto flex items-center gap-2 tracking-tight"
    >
      Explore all collections <ChevronRight size={14} />
    </button>
  </div>
);

const ListingSection: React.FC<ListingSectionProps> = ({
  title,
  listings,
  loading,
  variant = 'horizontal',
  onSeeAll,
  onCategoryClick
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const discoveryData = useMemo(() => {
    if (variant !== 'discovery') return [];

    // 1. Aggregated Regional Data
    const countryStats: Record<string, { count: number; image: string }> = {};
    listings.forEach(l => {
      const country = l.location.split(',').pop()?.trim() || l.location;
      if (!countryStats[country]) {
        countryStats[country] = { count: 0, image: l.photos?.[0]?.url || '' };
      }
      countryStats[country].count += 1;
    });
    
    const topRegions = Object.entries(countryStats)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 4)
      .map(([country, stats]) => ({
        label: country,
        image: stats.image,
        value: country
      }));

    // 2. Aggregated Type Data
    const typeStats: Record<string, { count: number; image: string }> = {};
    listings.forEach(l => {
      const type = l.type;
      if (!typeStats[type]) {
        typeStats[type] = { count: 0, image: l.photos?.[0]?.url || '' };
      }
      typeStats[type].count += 1;
    });

    const topTypes = Object.entries(typeStats)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 4)
      .map(([type, stats]) => ({
        label: type.charAt(0) + type.slice(1).toLowerCase() + 's',
        image: stats.image,
        value: type
      }));

    return [
      { title: "Trending Regional Collections", items: topRegions, type: 'location' },
      { title: "Browse by Property Type", items: topTypes, type: 'type' },
      { 
        title: "Value Discovery", 
        items: listings.slice(0, 4).map(l => ({ 
          label: `$${l.pricePerNight}/night`, 
          image: l.photos?.[0]?.url || '', 
          value: l.id 
        })),
        type: 'listing'
      }
    ];
  }, [listings, variant]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth * 0.8 : scrollLeft + clientWidth * 0.8;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  if (variant === 'horizontal' && listings.length < 3 && !loading) return null;

  const displayListings = variant === 'horizontal' ? listings.slice(0, 10) : listings;

  if (variant === 'grid') {
    return (
      <div className="py-6 md:py-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-[28px] font-black text-gray-900 tracking-tighter">{title}</h2>
            <div className="h-1 w-12 bg-airbnb rounded-full mt-2" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-x-5 gap-y-10">
          {displayListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'discovery') {
    return (
      <div className="py-8 bg-gray-50/50 -mx-4 px-4 sm:-mx-8 sm:px-8 md:-mx-10 md:px-10 lg:-mx-20 lg:px-20 overflow-hidden">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-[26px] font-black text-gray-900">Curated Collections</h2>
            <p className="text-gray-400 font-bold text-[10px]  mt-1">Handpicked for your next adventure</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => scroll('left')} className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 transition-all shadow-sm active:scale-90"><ChevronLeft size={18}/></button>
            <button onClick={() => scroll('right')} className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 transition-all shadow-sm active:scale-90"><ChevronRight size={18}/></button>
          </div>
        </div>

        <div 
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide pb-6 snap-x snap-mandatory no-scrollbar"
        >
          {discoveryData.map((group, idx) => (
            <GroupedAggregatorCard 
              key={idx} 
              title={group.title} 
              items={group.items} 
              onItemClick={(val) => onCategoryClick?.(group.type, val)}
              onSeeAll={onSeeAll}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 relative group/section">
      <div className="flex items-center justify-between mb-8 px-1">
        <div className="flex items-center gap-4">
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">{title}</h2>
          <div className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center bg-gray-50/50">
            <ChevronRight size={20} className="text-gray-400" />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button onClick={() => scroll('left')} className="w-10 h-10 rounded-full border border-gray-200 bg-white shadow-sm hover:shadow-md hover:bg-gray-50 transition-all flex items-center justify-center"><ChevronLeft size={18} strokeWidth={2.5} /></button>
          <button onClick={() => scroll('right')} className="w-10 h-10 rounded-full border border-gray-200 bg-white shadow-sm hover:shadow-md hover:bg-gray-50 transition-all flex items-center justify-center"><ChevronRight size={18} strokeWidth={2.5} /></button>
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
                <div key={listing.id} className="min-w-[200px] sm:min-w-[240px] max-w-[260px] snap-start">
                  <ListingCard listing={listing} />
                </div>
              ))}
              {listings.length >= 8 && (
                <div className="min-w-[280px] max-w-[280px] snap-start">
                  <div onClick={onSeeAll} className="aspect-square bg-gray-50 rounded-[2.5rem] border border-gray-100 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-all group/seeall">
                    <div className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center mb-4 group-hover/seeall:scale-110 transition-transform">
                      <ChevronRight size={24} className="text-airbnb" />
                    </div>
                    <span className="font-black text-base text-gray-900">Show all</span>
                    <span className="text-xs text-gray-400 font-bold tracking-widest mt-1">Stays</span>
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
