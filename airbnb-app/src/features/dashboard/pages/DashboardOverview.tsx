import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Home, DollarSign, Star, CalendarCheck,
  ArrowUpRight, ChevronRight, Clock, CheckCircle, XCircle, AlertCircle,
  Users as UsersIcon, MapPin, Heart, MessageSquare
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import FeatureCard from '../components/FeatureCard/FeatureCard';
import { useDashboardStats, useDashboardBookings } from '../hooks/useDashboardData';

// --- Subcomponents ---

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  color: string;
  link?: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, trend, trendUp, color, link }) => {
  const content = (
    <>
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
    </>
  );

  const wrapperClass = "bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all block text-left w-full";

  if (link) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Link to={link} className={`${wrapperClass} hover:border-airbnb/30 hover:scale-[1.02] active:scale-[0.98]`}>
          {content}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={wrapperClass}
    >
      {content}
    </motion.div>
  );
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const map: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
    CONFIRMED: { label: 'Confirmed', cls: 'bg-emerald-50 text-emerald-700', icon: <CheckCircle size={12} /> },
    PENDING: { label: 'Pending', cls: 'bg-amber-50 text-amber-700', icon: <AlertCircle size={12} /> },
    CANCELLED: { label: 'Cancelled', cls: 'bg-rose-50 text-rose-600', icon: <XCircle size={12} /> },
    REJECTED: { label: 'Rejected', cls: 'bg-gray-100 text-gray-600', icon: <XCircle size={12} /> },
    COMPLETED: { label: 'Completed', cls: 'bg-blue-50 text-blue-700', icon: <CheckCircle size={12} /> },
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

// --- Main Page ---

const DashboardOverview: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role || 'GUEST';

  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: bookings, isLoading: bookingsLoading } = useDashboardBookings();

  const featureConfig = useMemo(() => {
    const base = [
      {
        id: 'bookings',
        title: role === 'GUEST' ? 'Your upcoming bookings' : role === 'ADMIN' ? 'Platform Bookings' : 'Manage your bookings',
        description: role === 'GUEST'
          ? 'Check your itineraries, message hosts, and manage your booking plans easily.'
          : role === 'ADMIN'
            ? 'Monitor all platform reservations, track occupancy rates and handle escalations.'
            : 'View upcoming stays, handle check-ins, and respond to reservation requests in real-time.',
        image: '/glass.png',
        ctaText: role === 'GUEST' ? 'View My Bookings' : 'Check Bookings',
        ctaLink: '/dashboard/bookings'
      },
      {
        id: 'messages',
        title: 'Unified Inbox',
        description: 'Stay connected with everyone. Fast replies build trust and ensure a smooth experience for all.',
        image: '/glass.png',
        ctaText: 'Open Messages',
        ctaLink: '/dashboard/messages'
      }
    ];

    if (role === 'ADMIN' || role === 'HOST') {
      base.push({
        id: 'listings',
        title: role === 'ADMIN' ? 'Platform Inventory' : 'Your properties',
        description: role === 'ADMIN'
          ? 'Review all listings on the platform, moderate content, and manage categories.'
          : 'Add new listings, update availability, and optimise pricing to attract more guests.',
        image: '/glass.png',
        ctaText: 'Manage Listings',
        ctaLink: '/dashboard/listings'
      });
    }

    if (role === 'GUEST') {
      base.push({
        id: 'map',
        title: 'Explore Destinations',
        description: 'Find your next adventure on our interactive map. Discover unique stays around the world.',
        image: '/glass.png',
        ctaText: 'Explore Map',
        ctaLink: '/dashboard/map'
      });
    }

    if (role === 'ADMIN') {
      base.push({
        id: 'users',
        title: 'User Management',
        description: 'Oversee all platform users, manage roles, and ensure community guidelines are followed.',
        image: '/glass.png',
        ctaText: 'Manage Users',
        ctaLink: '/dashboard/users'
      });
    }

    return base;
  }, [role]);

  const renderStats = () => {
    if (role === 'ADMIN') {
      return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Total Users" value={stats?.totalUsers ?? '0'} icon={<UsersIcon size={18} className="text-blue-600" />} color="bg-blue-50" link="/dashboard/users" />
          <StatCard label="Total Bookings" value={stats?.totalBookings ?? '0'} icon={<CalendarCheck size={18} className="text-purple-600" />} color="bg-purple-50" link="/dashboard/bookings" />
          <StatCard label="Total Listings" value={stats?.totalListings ?? '0'} icon={<Home size={18} className="text-emerald-600" />} color="bg-emerald-50" link="/dashboard/listings" />
          <StatCard label="Platform Revenue" value={`$${stats?.revenue ?? '0'}`} icon={<DollarSign size={18} className="text-amber-500" />} color="bg-amber-50" />
        </div>
      );
    }

    if (role === 'HOST') {
      return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Active Listings" value={stats?.activeListings ?? '0'} icon={<Home size={18} className="text-blue-600" />} color="bg-blue-50" link="/dashboard/listings" />
          <StatCard label="Recent Bookings" value={bookings?.length ?? '0'} icon={<CalendarCheck size={18} className="text-purple-600" />} color="bg-purple-50" link="/dashboard/bookings" />
          <StatCard label="Total Earnings" value={`$${stats?.earnings ?? '0'}`} icon={<DollarSign size={18} className="text-emerald-600" />} color="bg-emerald-50" />
          <StatCard label="Avg. Rating" value={stats?.avgRating ?? '4.9'} icon={<Star size={18} className="text-amber-500" />} color="bg-amber-50" />
        </div>
      );
    }

    // GUEST Stats
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Upcoming Bookings" value={stats?.upcomingTrips ?? '0'} icon={<MapPin size={18} className="text-blue-600" />} color="bg-blue-50" link="/dashboard/bookings" />
        <StatCard label="Past Bookings" value={stats?.pastBookings ?? '0'} icon={<CalendarCheck size={18} className="text-purple-600" />} color="bg-purple-50" link="/dashboard/bookings" />
        <StatCard label="Saved Places" value={stats?.savedPlaces ?? '0'} icon={<Heart size={18} className="text-rose-500" />} color="bg-rose-50" link="/dashboard/map" />
        <StatCard label="Unread Messages" value={stats?.unreadMessages ?? '0'} icon={<MessageSquare size={18} className="text-emerald-600" />} color="bg-emerald-50" link="/dashboard/messages" />
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      <FeatureCard features={featureConfig} autoRotate={true} rotateInterval={5000} />

      <section>
        <h2 className="text-sm font-semibold text-gray-500 mb-3">
          {role === 'ADMIN' ? 'Platform Overview' : role === 'HOST' ? 'Host Performance' : 'Travel Overview'}
        </h2>
        {statsLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-gray-50 rounded-xl animate-pulse" />)}
          </div>
        ) : renderStats()}
      </section>


      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-500">
            {role === 'GUEST' ? 'Your Recent Bookings' : 'Recent Reservations'}
          </h2>
          <Link to="/dashboard/bookings" className="text-xs font-medium text-airbnb hover:underline flex items-center gap-1">
            View all <ArrowUpRight size={12} />
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 px-4 py-3 border-b border-gray-100 bg-gray-50/50">
            {['Listing', role === 'GUEST' ? 'Host' : 'Guest', 'Dates', 'Payment', 'Status'].map(h => (
              <span key={h} className="text-xs font-semibold text-gray-500">{h}</span>
            ))}
          </div>

          {bookingsLoading ? (
            Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)
          ) : bookings && bookings.length > 0 ? (
            bookings.slice(0, 5).map((b, i) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="block md:grid md:grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 px-4 py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors"
              >
                <div className="flex items-center gap-3 mb-3 md:mb-0">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                    <img src={b.listing?.photos?.[0]?.url || '/placeholder.png'} alt="Listing" className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{b.listing?.title ?? 'Listing'}</p>
                    <p className="text-xs text-gray-500 truncate">{b.listing?.location}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-2 md:mb-0">
                  <span className="text-xs text-gray-500 md:hidden">{role === 'GUEST' ? 'Host:' : 'Guest:'}</span>
                  <p className="text-sm font-medium text-gray-700">{role === 'GUEST' ? b.listing?.host?.name : b.guest?.name}</p>
                </div>

                <div className="flex items-center justify-between mb-2 md:mb-0">
                  <span className="text-xs text-gray-500 md:hidden">Dates:</span>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Clock size={12} />
                    <span>{new Date(b.checkIn).toLocaleDateString()} → {new Date(b.checkOut).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-2 md:mb-0">
                  <span className="text-xs text-gray-500 md:hidden">Payment:</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">${b.totalPrice}</p>
                  </div>
                </div>

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
              <p className="font-semibold text-gray-900">No bookings yet</p>
              <Link to="/" className="mt-4 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium">
                {role === 'GUEST' ? 'Explore Stays' : 'Manage Listings'}
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default DashboardOverview;