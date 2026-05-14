import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, Calendar, DollarSign,
  Star,
  Download, RefreshCw,
  Building2,
  Users,
  ShieldCheck,
  UserX,
  LogOut
} from 'lucide-react';
import { AreaChart, Area, PieChart, Pie,
  Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useAuth } from '../../../contexts/AuthContext';
import { useListings } from '../../../contexts/ListingContext';
import { useBookings } from '../hooks/useBookings';
import api from '../../../api/axios';
import { ENDPOINTS } from '../../../api/endpoints';

// Custom Tooltip
const CustomTooltip = ({ active, payload, label, valuePrefix = '$' }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-3 text-sm">
        <p className="font-semibold text-gray-900 mb-1">{label}</p>
        {payload.map((p: any, idx: number) => (
          <p key={idx} className="text-gray-600 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            {p.name}: {valuePrefix}{p.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const DashboardAnalytics: React.FC = () => {
  const { user } = useAuth();
  const { listings, loading: listingsLoading } = useListings();
  const { bookings, isLoading: bookingsLoading } = useBookings();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [selectedMetric, setSelectedMetric] = useState<'revenue' | 'bookings'>('revenue');
  const [isExporting, setIsExporting] = useState(false);
  const [adminStats, setAdminStats] = useState<any>(null);
  const [loadingAdminStats, setLoadingAdminStats] = useState(false);

  const isAdmin = user?.role === 'ADMIN';
  
  // Filter relevant data once
  const relevantListings = useMemo(() => {
    return isAdmin ? listings : listings.filter(l => l.hostId === user?.id);
  }, [listings, isAdmin, user?.id]);

  const relevantBookings = useMemo(() => {
    if (isAdmin) return bookings;
    const myListingIds = new Set(relevantListings.map(l => l.id));
    return bookings.filter(b => myListingIds.has(b.listingId));
  }, [bookings, relevantListings, isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      const fetchAdminStats = async () => {
        setLoadingAdminStats(true);
        try {
          const res = await api.get(ENDPOINTS.USERS.STATS);
          setAdminStats(res.data);
        } catch (err) {
          console.error("Failed to fetch admin stats:", err);
        } finally {
          setLoadingAdminStats(false);
        }
      };
      fetchAdminStats();
    }
  }, [isAdmin]);

  // Main analytics calculation engine
  const analyticsData = useMemo(() => {
    const now = new Date();
    const filterDate = new Date();
    if (timeRange === 'week') filterDate.setDate(now.getDate() - 7);
    else if (timeRange === 'month') filterDate.setMonth(now.getMonth() - 1);
    else filterDate.setFullYear(now.getFullYear() - 1);

    const filteredBookings = relevantBookings.filter(b => new Date(b.createdAt) >= filterDate);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // 1. Trend Data (Adapts to timeRange)
    const trendMap = new Map<string, { label: string; revenue: number; bookings: number }>();
    
    if (timeRange === 'week') {
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const label = d.toLocaleDateString('en-US', { weekday: 'short' });
        trendMap.set(label, { label, revenue: 0, bookings: 0 });
      }
      filteredBookings.forEach(b => {
        const label = new Date(b.createdAt).toLocaleDateString('en-US', { weekday: 'short' });
        if (trendMap.has(label)) {
          const curr = trendMap.get(label)!;
          curr.revenue += b.totalPrice || 0;
          curr.bookings += 1;
        }
      });
    } else {
      months.forEach(m => trendMap.set(m, { label: m, revenue: 0, bookings: 0 }));
      filteredBookings.forEach(b => {
        const label = months[new Date(b.createdAt).getMonth()];
        if (label && trendMap.has(label)) {
          const curr = trendMap.get(label)!;
          curr.revenue += b.totalPrice || 0;
          curr.bookings += 1;
        }
      });
    }

    const trends = Array.from(trendMap.values());

    // 2. Listing Performance (Top 5)
    const listingPerformanceMap = new Map<string, { id: string; title: string; revenue: number; bookings: number; rating: number }>();
    
    filteredBookings.forEach(booking => {
      const listing = relevantListings.find(l => l.id === booking.listingId);
      if (listing) {
        const current = listingPerformanceMap.get(listing.id) || { 
          id: listing.id, 
          title: listing.title, 
          revenue: 0, 
          bookings: 0, 
          rating: listing.rating || 0 
        };
        current.revenue += booking.totalPrice || 0;
        current.bookings += 1;
        listingPerformanceMap.set(listing.id, current);
      }
    });

    const topListings = Array.from(listingPerformanceMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
      .map(l => ({
        name: l.title.length > 15 ? l.title.substring(0, 15) + '...' : l.title,
        revenue: l.revenue,
        bookings: l.bookings,
        rating: l.rating
      }));

    // 3. Status Distribution
    const statusCounts = {
      CONFIRMED: filteredBookings.filter(b => b.status === 'CONFIRMED' || b.status === 'COMPLETED').length,
      PENDING: filteredBookings.filter(b => b.status === 'PENDING').length,
      CANCELLED: filteredBookings.filter(b => b.status === 'CANCELLED' || b.status === 'REJECTED').length,
    };

    const bookingStatus = [
      { name: 'Confirmed', value: statusCounts.CONFIRMED, color: '#10B981' },
      { name: 'Pending', value: statusCounts.PENDING, color: '#F59E0B' },
      { name: 'Cancelled', value: statusCounts.CANCELLED, color: '#EF4444' },
    ].filter(s => s.value > 0);

    // 4. Admin-Specific: Host Performance
    let hostPerformance = undefined;
    if (isAdmin) {
      const hostMap = new Map<string, { name: string; revenue: number; listings: number }>();
      relevantListings.forEach(l => {
        const hostId = l.hostId;
        const current = hostMap.get(hostId) || { name: l.host?.name || 'Unknown Host', revenue: 0, listings: 0 };
        current.listings += 1;
        hostMap.set(hostId, current);
      });

      filteredBookings.forEach(b => {
        const listing = listings.find(l => l.id === b.listingId);
        if (listing) {
          const current = hostMap.get(listing.hostId);
          if (current) current.revenue += b.totalPrice || 0;
        }
      });

      hostPerformance = Array.from(hostMap.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);
    }

    return {
      trends,
      topListings,
      bookingStatus,
      hostPerformance,
      totalRevenue: filteredBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0),
      totalBookings: filteredBookings.length,
      avgRating: relevantListings.length > 0 
        ? (relevantListings.reduce((sum, l) => sum + (l.rating || 0), 0) / relevantListings.length).toFixed(1)
        : '0.0',
    };
  }, [relevantBookings, relevantListings, isAdmin, listings, timeRange]);

  const handleExport = () => {
    setIsExporting(true);
    const data = {
      reportDate: new Date().toISOString(),
      timeRange,
      user: user?.email,
      stats: {
        totalRevenue: analyticsData.totalRevenue,
        totalBookings: analyticsData.totalBookings,
        avgRating: analyticsData.avgRating
      },
      topListings: analyticsData.topListings
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hostify-analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    setIsExporting(false);
  };

  const isLoading = listingsLoading || bookingsLoading || loadingAdminStats;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <RefreshCw size={32} className="animate-spin text-airbnb" />
        <p className="text-gray-500 font-medium">Crunching your real-time data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Analytics Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">
            {isAdmin ? 'Real-time platform performance metrics' : 'Insights based on your actual property performance'}
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-gray-100 rounded-xl p-0.5">
            {['week', 'month', 'year'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range as any)}
                className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                  timeRange === range ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all shadow-sm active:scale-95"
          >
            {isExporting ? <RefreshCw size={14} className="animate-spin" /> : <Download size={14} />}
            Export
          </button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center"><DollarSign size={16} /></div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Revenue</span>
          </div>
          <p className="text-2xl font-black text-gray-900">${analyticsData.totalRevenue.toLocaleString()}</p>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center"><Calendar size={16} /></div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Bookings</span>
          </div>
          <p className="text-2xl font-black text-gray-900">{analyticsData.totalBookings}</p>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center"><Building2 size={16} /></div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Listings</span>
          </div>
          <p className="text-2xl font-black text-gray-900">{relevantListings.length}</p>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center"><Star size={16} /></div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Avg Rating</span>
          </div>
          <p className="text-2xl font-black text-gray-900">{analyticsData.avgRating}</p>
        </motion.div>
      </div>

      {isAdmin && adminStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
           <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center"><Users size={24} /></div>
              <div>
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Total Users</p>
                <p className="text-xl font-black text-gray-900">{adminStats.totalUsers}</p>
              </div>
           </div>
           <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><ShieldCheck size={24} /></div>
              <div>
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Active Now</p>
                <p className="text-xl font-black text-gray-900">{adminStats.byStatus?.find((s: any) => s.status === 'ACTIVE')?._count?.status || 0}</p>
              </div>
           </div>
           <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center"><LogOut size={24} /></div>
              <div>
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Deactivated</p>
                <p className="text-xl font-black text-gray-900">{adminStats.byStatus?.find((s: any) => s.status === 'DEACTIVATED')?._count?.status || 0}</p>
              </div>
           </div>
           <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center"><UserX size={24} /></div>
              <div>
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Suspended</p>
                <p className="text-xl font-black text-gray-900">{adminStats.byStatus?.find((s: any) => s.status === 'SUSPENDED')?._count?.status || 0}</p>
              </div>
           </div>
        </div>
      )}

      {analyticsData.totalBookings > 0 ? (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Revenue & Bookings Trend */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Performance Trend</h3>
                <p className="text-xs text-gray-500 font-medium">Monthly revenue and booking volume</p>
              </div>
              <div className="flex bg-gray-50 p-1 rounded-xl">
                <button
                  onClick={() => setSelectedMetric('revenue')}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${selectedMetric === 'revenue' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}
                >
                  Revenue
                </button>
                <button
                  onClick={() => setSelectedMetric('bookings')}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${selectedMetric === 'bookings' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}
                >
                  Bookings
                </button>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analyticsData.trends}>
                <defs>
                  <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={selectedMetric === 'revenue' ? '#FF385C' : '#3B82F6'} stopOpacity={0.2}/>
                    <stop offset="95%" stopColor={selectedMetric === 'revenue' ? '#FF385C' : '#3B82F6'} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#9CA3AF' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#9CA3AF' }} tickFormatter={(v) => selectedMetric === 'revenue' ? `$${v}` : v} />
                <Tooltip content={<CustomTooltip valuePrefix={selectedMetric === 'revenue' ? '$' : ''} />} />
                <Area 
                  type="monotone" 
                  dataKey={selectedMetric} 
                  stroke={selectedMetric === 'revenue' ? '#FF385C' : '#3B82F6'} 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorMetric)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Top Listings */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Top Performing Listings</h3>
            <div className="space-y-4">
              {analyticsData.topListings.map((listing, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-bold text-gray-700">{listing.name}</span>
                    <span className="font-black text-gray-900">${listing.revenue.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-gray-50 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(listing.revenue / analyticsData.totalRevenue) * 100}%` }}
                      className="h-full bg-airbnb rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Booking Status */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Booking Status</h3>
            <div className="flex items-center justify-around h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analyticsData.bookingStatus}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {analyticsData.bookingStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {analyticsData.bookingStatus.map((status, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: status.color }} />
                    <span className="text-xs font-bold text-gray-600">{status.name}</span>
                    <span className="text-xs font-black text-gray-900">{status.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Admin: Host Performance */}
          {isAdmin && analyticsData.hostPerformance && (
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm lg:col-span-2">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Top Performing Hosts</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
                {analyticsData.hostPerformance.map((host, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                    <div className="w-10 h-10 rounded-full bg-airbnb text-white flex items-center justify-center font-black text-sm mb-3">
                      {host.name[0]}
                    </div>
                    <p className="text-sm font-black text-gray-900 truncate">{host.name}</p>
                    <p className="text-xs text-gray-500 font-bold">{host.listings} Properties</p>
                    <p className="text-md font-black text-airbnb mt-2">${host.revenue.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-gray-100 border-dashed">
          <TrendingUp size={48} className="text-gray-200 mb-4" />
          <h3 className="text-xl font-black text-gray-900">No Booking Data Yet</h3>
          <p className="text-gray-500 text-sm mt-2 max-w-xs text-center font-medium">
            Real-time charts will appear here as soon as the first reservation is made on the platform.
          </p>
        </div>
      )}
    </div>
  );
};

export default DashboardAnalytics;