import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Home, DollarSign, Star, CalendarCheck, 
  ArrowUpRight, ChevronRight, Clock, CheckCircle, XCircle, AlertCircle
} from 'lucide-react';
import { useListings } from '../../../contexts/ListingContext';
import { useAuth } from '../../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import FeatureCard from '../components/FeatureCard/FeatureCard';

// --- Subcomponents ---

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, trend, trendUp, color }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
  >
    <div className="flex items-start justify-between">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
        {icon}
      </div>
      {trend && (
        <span className={`text-xs font-semibold flex items-center gap-1 ${trendUp ? 'text-emerald-600' : 'text-rose-500'}`}>
          <ArrowUpRight size={12} className={trendUp ? '' : 'rotate-180'} />
          {trend}
        </span>
      )}
    </div>
    <div className="mt-3">
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs font-medium text-gray-500 mt-1">{label}</p>
    </div>
  </motion.div>
);

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const map: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
    CONFIRMED: { label: 'Confirmed', cls: 'bg-emerald-50 text-emerald-700', icon: <CheckCircle size={12} /> },
    PENDING:   { label: 'Pending',   cls: 'bg-amber-50 text-amber-700',    icon: <AlertCircle size={12} /> },
    CANCELLED: { label: 'Cancelled', cls: 'bg-rose-50 text-rose-600',     icon: <XCircle size={12} /> },
  };
  const { label, cls, icon } = map[status] ?? map.PENDING;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium ${cls}`}>
      {icon} {label}
    </span>
  );
};

const SkeletonRow: React.FC = () => (
  <div className="flex items-center gap-4 p-4 animate-pulse">
    <div className="w-12 h-12 rounded-xl bg-gray-100 shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-3 bg-gray-100 rounded w-1/3" />
      <div className="h-3 bg-gray-100 rounded w-1/2" />
    </div>
    <div className="h-6 w-20 bg-gray-100 rounded-lg" />
  </div>
);

// Feature configuration for the card
const featureConfig = [
  {
    id: 'bookings',
    title: 'Manage all your bookings',
    description: 'View upcoming stays, handle check-ins, and respond to reservation requests — all from one clean dashboard.',
    image: '/glass.png',
    buttons: [
      { text: 'Check Bookings', link: '/dashboard/bookings', variant: 'primary' as const }
    ]
  },
  {
    id: 'listings',
    title: 'Your properties, beautifully organised',
    description: 'Add new listings, update availability, and optimise pricing to attract more guests and grow your income.',
    image: '/glass.png',
    buttons: [
      { text: 'Improve Listings', link: '/dashboard/listings', variant: 'primary' as const },
      { text: 'Learn More', link: '/help', variant: 'outline' as const }
    ]
  },
  {
    id: 'messages',
    title: 'Stay connected with your guests',
    description: 'Fast replies build trust. Keep every guest conversation in one place and never miss an important message.',
    image: '/glass.png',
    buttons: [
      { text: 'Go to Messages', link: '/dashboard/messages', variant: 'primary' as const }
    ]
  },
  {
    id: 'wallet',
    ttitle: 'Track your earnings instantly',
    description: 'See payouts, pending balances, and transaction history. Your money, clearly laid out whenever you need it.',
    image: '/glass.png',
    buttons: [
      { text: 'View Wallet', link: '/dashboard/wallet', variant: 'primary' as const },
      { text: 'Withdraw Now', link: '/dashboard/wallet', variant: 'outline' as const }
    ]
  },
  {
    id: 'map',
    title: 'See all your properties on a map',
    description: 'Visualise your entire portfolio geographically. Spot clusters, coverage gaps, and expansion opportunities at a glance.',
    image: '/glass.png',
    buttons: [
      { text: 'Open Map', link: '/dashboard/map', variant: 'primary' as const }
    ]
  }
];

// --- Main Page ---

const DashboardOverview: React.FC = () => {
  const { user } = useAuth();
  const { listings, loading } = useListings();

  // Derive host-specific listings
  const hostListings = useMemo(
    () => listings.filter(l => l.hostId === user?.id),
    [listings, user?.id]
  );

  // Active listings count based on status
  const activeListings = hostListings.filter(l => l.status === 'ACTIVE' || l.status === 'PUBLISHED').length;

  // Mock booking data until booking context is wired
  const mockBookings = useMemo(() => [
    { id: '1', listing: hostListings[0], guestName: 'Alice Martin',  checkIn: '2026-05-10', checkOut: '2026-05-14', amount: 480, status: 'CONFIRMED', method: 'Card' },
    { id: '2', listing: hostListings[1], guestName: 'James Okonkwo', checkIn: '2026-05-15', checkOut: '2026-05-18', amount: 210, status: 'PENDING',   method: 'Wallet' },
    { id: '3', listing: hostListings[0], guestName: 'Sofia Leclerc', checkIn: '2026-05-20', checkOut: '2026-05-25', amount: 600, status: 'CONFIRMED', method: 'Card' },
  ].filter(b => b.listing), [hostListings]);

  const totalIncome = mockBookings.filter(b => b.status === 'CONFIRMED').reduce((s, b) => s + b.amount, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Feature Card Component */}
      <FeatureCard features={featureConfig} autoRotate={true} rotateInterval={5000} />

      {/* Stats Grid */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 mb-3">Overview</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard 
            label="Active Listings" 
            value={activeListings} 
            icon={<Home size={18} className="text-blue-600" />} 
            color="bg-blue-50" 
            trend={activeListings > 0 ? `+${activeListings} total` : undefined} 
            trendUp={activeListings > 0} 
          />
          <StatCard 
            label="Total Bookings" 
            value={mockBookings.length} 
            icon={<CalendarCheck size={18} className="text-purple-600" />} 
            color="bg-purple-50" 
            trend={mockBookings.length > 0 ? `${mockBookings.length} this month` : undefined} 
            trendUp={mockBookings.length > 0} 
          />
          <StatCard 
            label="Total Income" 
            value={`$${totalIncome}`} 
            icon={<DollarSign size={18} className="text-emerald-600" />} 
            color="bg-emerald-50" 
            trend={totalIncome > 0 ? "+12%" : undefined} 
            trendUp={totalIncome > 0} 
          />
          <StatCard 
            label="Avg. Rating" 
            value="4.9" 
            icon={<Star size={18} className="text-amber-500" />} 
            color="bg-amber-50" 
          />
        </div>
      </section>   

      {/* Reservations Table */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-500">Recent Reservations</h2>
          <Link to="/dashboard/bookings" className="text-xs font-medium text-airbnb hover:underline flex items-center gap-1">
            View all <ArrowUpRight size={12} />
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {/* Table Header - Hidden on mobile */}
          <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 px-4 py-3 border-b border-gray-100 bg-gray-50/50">
            {['Listing', 'Guest', 'Dates', 'Payment', 'Status'].map(h => (
              <span key={h} className="text-xs font-semibold text-gray-500">{h}</span>
            ))}
          </div>

          {/* Rows */}
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)
          ) : mockBookings.length > 0 ? (
            mockBookings.map((b, i) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="block md:grid md:grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 px-4 py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors"
              >
                {/* Listing - Mobile optimized */}
                <div className="flex items-center gap-3 mb-3 md:mb-0">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                    {b.listing?.photos?.[0]?.url || b.listing?.photos?.[0]?.url ? (
                      <img src={b.listing?.photos?.[0]?.url || b.listing?.photos?.[0]?.url} alt={b.listing.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <Home size={18} className="text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{b.listing?.title ?? 'Listing'}</p>
                    <p className="text-xs text-gray-500 truncate">{b.listing?.location || b.listing?.location}</p>
                  </div>
                </div>

                {/* Guest */}
                <div className="flex items-center justify-between mb-2 md:mb-0">
                  <span className="text-xs text-gray-500 md:hidden">Guest:</span>
                  <p className="text-sm font-medium text-gray-700">{b.guestName}</p>
                </div>

                {/* Dates */}
                <div className="flex items-center justify-between mb-2 md:mb-0">
                  <span className="text-xs text-gray-500 md:hidden">Dates:</span>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Clock size={12} />
                    <span>{b.checkIn} → {b.checkOut}</span>
                  </div>
                </div>

                {/* Payment */}
                <div className="flex items-center justify-between mb-2 md:mb-0">
                  <span className="text-xs text-gray-500 md:hidden">Payment:</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">${b.amount}</p>
                    <p className="text-[10px] font-medium text-gray-400">{b.method}</p>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 md:hidden">Status:</span>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={b.status} />
                    <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                <CalendarCheck size={24} className="text-gray-300" />
              </div>
              <p className="font-semibold text-gray-900">No reservations yet</p>
              <p className="text-xs text-gray-500 mt-1 max-w-xs">Complete and publish a listing to start receiving bookings.</p>
              <Link to="/dashboard/listings" className="mt-4 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:scale-105 transition-all">
                Go to Listings
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default DashboardOverview;